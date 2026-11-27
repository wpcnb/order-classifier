"""Browser regression for batch draws, ordering, persistence and failure handling."""
from argparse import ArgumentParser
from csv import reader
from json import loads
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright


def check(base):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=which("chromium") or which("google-chrome"), args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        page = context.new_page()
        page.add_init_script("""window.sampleCalls=0;
          const original=crypto.getRandomValues.bind(crypto);
          Object.defineProperty(crypto,'getRandomValues',{value(bytes){
            if(bytes.length!==3)return original(bytes);
            const n=window.sampleCalls++ % 1000;
            bytes.set([Math.floor(n/100),Math.floor(n/10)%10,n%10]); return bytes;
          }});""")
        page.goto(base.rstrip("/")+"/")
        page.wait_for_function("!document.querySelector('[data-batch=\"10\"]').disabled")
        instant = page.get_by_label("连抽直接显示结果")
        assert not instant.is_checked()

        def result():
            return "".join(page.locator(".output b").all_text_contents())

        def archived():
            return page.evaluate("JSON.parse(localStorage.getItem('fc3d-simulation-archive-v1')).records")

        def batch(n, skip_animation=False):
            control = page.locator(f'[data-batch="{n}"]')
            if skip_animation:
                control.press("Enter")
                assert page.locator("#draw").is_disabled()
                page.locator("#skip-animation").press("Enter")
                assert page.locator("#draw").is_enabled()
                assert page.locator("#skip-animation").is_disabled()
            else:
                control.click()
            page.wait_for_function("!document.querySelector('#draw').disabled")
            assert page.locator("#batch-count").inner_text() == f"{n} 次"
            assert len(archived()) == min(page.evaluate("window.sampleCalls"), 1000)

        batch(10)
        assert page.evaluate("window.sampleCalls") == 10
        assert result() == "009"
        assert [row["number"] for row in archived()] == [f"{i:03d}" for i in range(9, -1, -1)]
        assert page.locator("#batch-unique").inner_text() == "10"
        assert page.locator("#batch-repeats").inner_text() == "0"
        page.get_by_text("查看和值分布", exact=True).click()
        sum_rows = page.locator("#batch-sums tr")
        assert sum_rows.count() == 28
        assert sum_rows.first.locator("th, td").all_text_contents() == ["0", "1", "10.0%", "0.1%"]
        assert sum_rows.nth(13).locator("th, td").all_text_contents() == ["13", "0", "0.0%", "7.5%"]
        assert sum_rows.last.locator("th, td").all_text_contents() == ["27", "0", "0.0%", "0.1%"]
        # The animation controls are intentionally hidden with reduced motion enabled.
        page.emulate_media(reduced_motion="no-preference")
        page.select_option("#playback-speed", "4")
        page.locator("#restart").click()
        page.wait_for_function("!document.querySelector('#draw').disabled")
        assert page.locator("#result-title").inner_text() == "重播本次模拟"
        assert result() == "009"
        assert len(archived()) == 10 and page.evaluate("window.sampleCalls") == 10
        page.emulate_media(reduced_motion="reduce")

        page.emulate_media(reduced_motion="no-preference")
        page.select_option("#playback-speed", "0.5")
        page.clock.install()
        page.clock.pause_at(page.evaluate("new Date(Date.now() + 200).toISOString()"))
        batch(100, skip_animation=True)
        assert result() == "109" and len(archived()) == 110
        assert page.locator("#batch-unique").inner_text() == "100"
        page.clock.run_for(5000)
        assert len(archived()) == page.evaluate("window.sampleCalls") == 110
        instant.press("Space")
        assert instant.is_checked()
        page.locator('[data-batch="1000"]').press("Enter")
        # With the clock frozen the normal animation could not have revealed anything.
        assert page.locator("#draw").is_enabled() and page.locator("#skip-animation").is_disabled()
        assert page.evaluate("window.sampleCalls") == 1110
        assert result() == "109" and len(archived()) == 1000
        assert page.locator("#batch-count").inner_text() == "1000 次"
        # This deterministic batch contains every ordered triplet exactly once.
        assert sum_rows.nth(13).locator("th, td").all_text_contents() == ["13", "75", "7.5%", "7.5%"]
        sum_rows_before_reload = sum_rows.all_text_contents()
        assert page.locator("#batch-unique").inner_text() == "1000"
        assert page.locator("#batch-repeats").inner_text() == "0"
        assert page.locator("#simulation-count").inner_text() == "本机留存 1000 次"
        assert [row["number"] for row in archived()] == [f"{i % 1000:03d}" for i in range(1109, 109, -1)]
        assert page.locator("#history li").count() == 10
        assert page.locator("#batch-frequency tr").count() == 10
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.locator("#restart").press("Enter")
        assert page.locator("#draw").is_disabled() and result() == "–––"
        page.locator("#skip-animation").press("Enter")
        assert result() == "109" and page.evaluate("window.sampleCalls") == 1110
        page.clock.resume()
        before = page.locator("#history li").all_text_contents()
        page.reload()
        page.wait_for_function("document.querySelectorAll('#history li').length===10")
        assert page.locator("#history li").all_text_contents() == before
        assert result() == "109" and page.locator("#draw-sum").inner_text() == "本次和值：10"
        assert page.locator("#batch-count").inner_text() == "1000 次"
        assert page.locator("#batch-unique").inner_text() == "1000"
        assert instant.is_checked()
        assert page.evaluate("window.sampleCalls") == 0
        assert len(archived()) == 1000
        page.get_by_text("查看和值分布", exact=True).click()
        assert sum_rows.all_text_contents() == sum_rows_before_reload
        with page.expect_download() as pending:
            page.get_by_role("button", name="下载和值分布（CSV）").click()
        export = pending.value
        assert export.suggested_filename.startswith("fc3d-batch-sums-")
        assert export.suggested_filename.endswith(".csv")
        raw_csv = Path(export.path()).read_bytes()
        assert raw_csv.startswith(bytes.fromhex("efbbbf"))
        header, *rows = reader(raw_csv.decode("utf-8-sig").splitlines())
        assert header == ["批次时间(UTC)", "批次抽取次数", "和值", "出现次数", "样本占比(%)", "理论占比(%)"]
        assert len(rows) == 28 and [int(row[2]) for row in rows] == list(range(28))
        assert sum(int(row[3]) for row in rows) == 1000
        assert all(row[1] == "1000" for row in rows)
        assert rows[13][2:] == ["13", "75", "7.5", "7.5"]
        assert page.evaluate("window.sampleCalls") == 0 and len(archived()) == 1000
        for width in (320, 390, 1024, 1440):
            page.set_viewport_size({"width": width, "height": 900})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.get_by_text("本机存档备份", exact=True).click()
        with page.expect_download() as backup_pending:
            page.locator("#archive-export").click()
        backup = backup_pending.value
        assert backup.suggested_filename == "fc3d-simulation-archive.json"
        assert loads(Path(backup.path()).read_text(encoding="utf-8")) == {"version": 1, "records": archived()}
        context.close()

        # A failed random service cannot leave a half-completed batch in the archive.
        failed = browser.new_context(reduced_motion="reduce").new_page()
        failed.add_init_script("""let calls=0;Object.defineProperty(crypto,'getRandomValues',{value(bytes){
          if(++calls===5)throw Error('random unavailable');bytes.fill(0);return bytes;
        }});""")
        failed.goto(base.rstrip("/")+"/")
        failed.locator('[data-batch="10"]').click()
        assert "未完成" in failed.locator(".status").inner_text()
        assert failed.locator("#history li").count() == 0
        assert failed.evaluate("localStorage.getItem('fc3d-simulation-archive-v1')") is None

        # Corrupt data is protected; new samples remain exportable in this tab.
        broken = browser.new_context(reduced_motion="reduce").new_page()
        broken.goto(base.rstrip("/")+"/")
        broken.evaluate("localStorage.setItem('fc3d-simulation-archive-v1','{broken')")
        broken.reload()
        broken.locator('[data-batch="10"]').click()
        broken.wait_for_function("!document.querySelector('#draw').disabled")
        assert broken.evaluate("localStorage.getItem('fc3d-simulation-archive-v1')") == "{broken"
        assert broken.locator("#history li").count() == 10
        assert broken.locator("#archive-export").is_enabled()
        assert "仅在本页" in broken.locator("#batch-save-status").inner_text()
        browser.close()
        print("PASS: 10/100/1000 draws, statistics, order, replay, refresh, responsive layout and random failure")


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("url")
    check(parser.parse_args().url)
