"""Exercise optional WebGL rendering and failure fallback with a pinned local dependency."""
from argparse import ArgumentParser
from pathlib import Path
from shutil import which
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

PREFIX = "https://cdn.jsdelivr.net/npm/three@0.186.1/build/"

def check(base, library):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            executable_path=which("chromium") or which("google-chrome"),
            args=["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        page = browser.new_page(viewport={"width":390,"height":844}, reduced_motion="reduce")
        page.route(PREFIX+"**", lambda route: route.abort())
        page.goto(base.rstrip("/")+"/")
        page.locator("#view3d-toggle").click()
        page.wait_for_function("document.querySelector('#view3d-status').textContent.includes('不可用')")
        assert page.locator("#view3d-stage").is_hidden()
        page.locator("#draw").click()
        page.wait_for_function("document.querySelectorAll('#history li').length === 1")
        saved=page.locator("#history li").all_text_contents()
        page.unroute(PREFIX+"**")

        def local_module(route):
            name=Path(urlparse(route.request.url).path).name
            file=library/name
            if not file.is_file():
                return route.abort()
            return route.fulfill(path=str(file),content_type="text/javascript",headers={"Access-Control-Allow-Origin":"*"})

        page.route(PREFIX+"**",local_module)
        # Reload to discard the browser's rejected dynamic import cache.
        page.reload()
        page.locator("#view3d-toggle").click()
        page.wait_for_function("document.querySelector('#view3d-toggle').getAttribute('aria-pressed') === 'true'",timeout=25000)
        assert page.locator("#view3d-canvas canvas").count()==1
        assert page.locator(".machine .studio").is_hidden()
        page.locator('[data-camera="left"]').click()
        assert page.locator('[data-camera="left"]').get_attribute("aria-pressed")=="true"
        assert page.locator("#history li").all_text_contents()==saved
        assert page.locator("#view3d-canvas").get_attribute("data-environment")=="generated"
        assert page.locator("#view3d-canvas").get_attribute("data-material-quality")=="balanced"
        page.select_option("#view3d-quality","high")
        assert page.locator("#view3d-canvas").get_attribute("data-material-quality")=="high"
        page.select_option("#view3d-lighting","evening")
        assert page.locator("#view3d-canvas").get_attribute("data-studio-lighting")=="evening"
        page.locator('[data-camera="right"]').click()
        page.wait_for_timeout(250)
        assert page.locator("#view3d-canvas canvas").count()==1
        page.select_option("#view3d-quality","balanced")
        page.select_option("#view3d-lighting","neutral")
        assert page.locator("#view3d-canvas").get_attribute("data-studio-lighting")=="neutral"
        assert page.locator("#history li").all_text_contents()==saved
        page.locator("#draw").click()
        page.wait_for_function("document.querySelectorAll('#history li').length === 2")
        assert page.locator("#view3d-canvas canvas").count()==1
        page.locator("#view3d-toggle").click()
        assert page.locator("#view3d-stage").is_hidden()
        assert page.locator(".machine .studio").is_visible()
        assert page.locator("#view3d-canvas canvas").count()==0
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.reload()
        page.wait_for_function("document.querySelectorAll('#history li').length === 2")
        print("PASS: 3D dependency failure, real WebGL scene, camera, draw, disposal, reload archive")
        browser.close()

if __name__=="__main__":
    parser=ArgumentParser(description=__doc__)
    parser.add_argument("url")
    parser.add_argument("library",type=Path)
    args=parser.parse_args()
    check(args.url,args.library)
