"""Run with Playwright and Chromium against a served simulator URL."""
from argparse import ArgumentParser
from shutil import which

from playwright.sync_api import sync_playwright


def check(base):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=which("chromium") or which("google-chrome"))
        page = browser.new_page(viewport={"width": 390, "height": 844})
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
        assert page.evaluate("JSON.parse(localStorage.getItem('fc3d-simulation-archive-v1')).records.length") == 2
        page.reload()
        page.wait_for_function("document.querySelectorAll('#history li').length === 2")
        assert history.all_text_contents() == saved
        assert result() == "007" and page.locator("#draw-sum").inner_text() == "本次和值：7"
        assert page.locator("#archive-list li").count() == 2
        assert page.evaluate("window.drawCalls") == 0
        context = page.context
        reopened = context.new_page()
        reopened.goto(base.rstrip("/") + "/")
        reopened.wait_for_function("document.querySelectorAll('#history li').length === 2")
        assert reopened.locator("#history li").all_text_contents() == saved
        reopened.close()
        print(f"PASS mobile rewind, pause, half speed, two separate 007 draws and archive {issue} {expected}")
        browser.close()


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("url")
    check(parser.parse_args().url)
