"""Run with Playwright and Chromium against a served simulator URL."""
from argparse import ArgumentParser
from shutil import which

from playwright.sync_api import sync_playwright


def check(base):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=which("chromium") or which("google-chrome"))
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.add_init_script("""window.drawCalls = 0;
          Object.defineProperty(crypto, 'getRandomValues', {value(bytes) {
            ++window.drawCalls;
            bytes.set([0, 0, 7]);
            return bytes;
          }});""")
        page.goto(base.rstrip("/") + "/")
        page.wait_for_selector("#replay-issue option", state="attached")
        page.clock.install()
        page.clock.pause_at(page.evaluate("new Date(Date.now() + 200).toISOString()"))
        restart = page.locator("#restart")
        pause = page.locator("#pause")
        history = page.locator("#history li")

        def result():
            return "".join(page.locator(".output b").all_text_contents())

        def check_reset():
            assert result() == "–––"
            assert page.locator(".neck").all_text_contents() == ["", "", ""]
            assert page.locator('.glass .ball').evaluate_all(
                "balls => balls.length === 30 && balls.every(b => b.style.visibility !== 'hidden')"
            )

        assert restart.is_disabled()
        page.locator("#draw").press("Enter")
        page.clock.run_for(1150)
        assert result() == "0––"
        restart.press("Enter")
        check_reset()
        page.clock.run_for(1750)
        assert result() == "00–" and history.count() == 0
        pause.press("Enter")
        page.clock.run_for(1000)
        restart.press("Enter")
        check_reset()
        page.clock.run_for(2350)
        assert result() == "007" and history.count() == 1 and history.first.inner_text().startswith("007 · 和值 7 ·")

        page.select_option("#playback-speed", "0.5")
        restart.press("Enter")
        page.clock.run_for(1200)
        assert result() == "–––"
        page.clock.run_for(3500)
        assert result() == "007" and page.locator("#result-title").inner_text() == "重播本次模拟"
        assert history.count() == 1 and history.first.inner_text().startswith("007 · 和值 7 ·") and page.evaluate("window.drawCalls") == 1

        # A genuine second draw can coincidentally have the same number.
        page.select_option("#playback-speed", "1")
        page.locator("#draw").press("Enter")
        page.clock.run_for(2350)
        assert history.count() == 2 and all(x.startswith("007 · 和值 7 ·") for x in history.all_text_contents()) and page.evaluate("window.drawCalls") == 2

        # Changing the selection after playback must not retarget a rewind.
        options = page.locator("#replay-issue option")
        issue = options.first.get_attribute("value")
        expected = options.first.inner_text().split(" · ")[-1]
        page.locator("#replay").press("Enter")
        page.clock.run_for(2350)
        page.select_option("#replay-issue", options.nth(1).get_attribute("value"))
        restart.press("Enter")
        page.clock.run_for(2350)
        assert result() == expected and issue in page.locator("#result-title").inner_text()
        assert history.count() == 2 and page.evaluate("window.drawCalls") == 2
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        # Reload and reopen within the same browser context: archive and last result must restore.
        saved = history.all_text_contents()
        assert len(saved) == 2
        assert page.locator("#recent-position-mode").inner_text() == "007"
        assert page.locator("#recent-sum-mode").inner_text() == "7"
        assert page.locator("#recent-digit-mode").inner_text() == "0"
        assert "2/10" in page.locator("#recent-frequency-sample").inner_text()
        assert page.evaluate("JSON.parse(localStorage.getItem('fc3d-simulation-archive-v1')).records.length") == 2
        page.reload()
        page.wait_for_function("document.querySelectorAll('#history li').length === 2")
        assert history.all_text_contents() == saved
        assert result() == "007" and page.locator("#draw-sum").inner_text() == "本次和值：7"
        assert page.locator("#archive-list").count() == 0
        assert page.evaluate("JSON.parse(localStorage.getItem('fc3d-simulation-archive-v1')).records.length") == 2
        assert page.locator("#recent-position-mode").inner_text() == "007"
        assert page.locator("#recent-sum-mode").inner_text() == "7"
        assert page.locator("#recent-digit-mode").inner_text() == "0"
        assert page.evaluate("window.drawCalls") == 0
        context = page.context
        reopened = context.new_page()
        reopened.goto(base.rstrip("/") + "/")
        reopened.wait_for_function("document.querySelectorAll('#history li').length === 2")
        assert reopened.locator("#history li").all_text_contents() == saved
        assert reopened.locator("#recent-position-mode").inner_text() == "007"
        # Controlled storage fixture: 10 current records and one older excluded.
        reopened.evaluate("""() => {
          const numbers=['007','007','007','007','007','007','123','123','456','789','999'];
          localStorage.setItem('fc3d-simulation-archive-v1',JSON.stringify({version:1,records:numbers.map((number,i)=>({
            id:i.toString(16).padStart(32,'0'),number,at:new Date(1800000000000-i*1000).toISOString()
          }))}));
        }""")
        reopened.reload()
        reopened.wait_for_function("document.querySelector('#recent-frequency-sample').textContent.includes('10/10')")
        assert reopened.locator("#recent-position-mode").inner_text()=="007"
        assert reopened.locator("#recent-sum-mode").inner_text()=="7"
        assert reopened.locator("#recent-digit-mode").inner_text()=="0"
        assert "12 / 30" in reopened.locator("#recent-digit-detail").inner_text()
        assert reopened.locator("#recent-digit-table tr").count()==10
        assert reopened.locator("#history li").count()==10
        assert reopened.locator("#archive-list").count()==0
        assert not any(x.startswith("999 ·") for x in reopened.locator("#history li").all_text_contents())
        assert reopened.evaluate("JSON.parse(localStorage.getItem('fc3d-simulation-archive-v1')).records.length")==11
        reopened.get_by_text("本机存档备份",exact=True).click()
        assert reopened.locator("#history li").count()==10
        assert reopened.locator("#archive-list").count()==0
        # Responsive placement: analysis stays inside the right control pane.
        assert reopened.locator(".control .recent-frequency").count()==1
        assert reopened.locator(".desk-history #history").count()==1
        for width in (390, 1024, 1440):
            reopened.set_viewport_size({"width":width,"height":900})
            reopened.wait_for_function("document.documentElement.scrollWidth <= innerWidth")
            machine=reopened.locator(".desk > .machine").bounding_box()
            control=reopened.locator(".desk > .control").bounding_box()
            frequency=reopened.locator(".recent-frequency").bounding_box()
            result_title=reopened.locator("#result-title").bounding_box()
            log=reopened.locator(".desk-history").bounding_box()
            assert frequency["y"] < result_title["y"]
            if width > 700:
                assert control["x"] >= machine["x"]+machine["width"]-1
                assert log["x"] < control["x"]
                assert log["y"] >= machine["y"]+machine["height"]-1
            else:
                assert control["y"] >= machine["y"]+machine["height"]-1
                assert log["y"] >= control["y"]+control["height"]-1
        reopened.close()
        print(f"PASS mobile rewind, pause, half speed, two separate 007 draws and archive {issue} {expected}")
        browser.close()


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("url")
    check(parser.parse_args().url)
