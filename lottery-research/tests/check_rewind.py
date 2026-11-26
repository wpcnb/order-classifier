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
        assert result() == "007" and history.all_text_contents() == ["007"]

        page.select_option("#playback-speed", "0.5")
        restart.press("Enter")
        page.clock.run_for(1200)
        assert result() == "–––"
        page.clock.run_for(3500)
        assert result() == "007" and page.locator("#result-title").inner_text() == "重播本次模拟"
        assert history.all_text_contents() == ["007"] and page.evaluate("window.drawCalls") == 1

        # A genuine second draw can coincidentally have the same number.
        page.select_option("#playback-speed", "1")
        page.locator("#draw").press("Enter")
        page.clock.run_for(2350)
        assert history.all_text_contents() == ["007", "007"] and page.evaluate("window.drawCalls") == 2

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
        print(f"PASS mobile rewind, pause, half speed, two separate 007 draws and archive {issue} {expected}")
        browser.close()


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("url")
    check(parser.parse_args().url)
