"""Browser regression for isolated, optional collision experiment."""
from argparse import ArgumentParser
from pathlib import Path
from urllib.parse import urlparse
from shutil import which
from playwright.sync_api import sync_playwright

THREE = "https://cdn.jsdelivr.net/npm/three@0.186.1/build/"
RAPIER = "https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/"

def check(base,root):
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=which("chromium") or which("google-chrome"),
            args=["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        page=browser.new_page(viewport={"width":390,"height":844},reduced_motion="reduce")
        page.route(RAPIER+"**",lambda route: route.abort())
        page.goto(base.rstrip("/")+"/")
        page.locator("#physics-open").click()
        page.wait_for_function("document.querySelector('#physics-status').textContent.includes('不可用')")
        assert page.locator("#physics-panel").is_hidden()
        page.locator("#draw").click()
        page.wait_for_function("document.querySelectorAll('#history li').length===1")
        saved=page.locator("#history li").all_text_contents()
        page.unroute(RAPIER+"**")
        def local(route,folder):
            name=Path(urlparse(route.request.url).path).name
            path=folder/name
            if not path.is_file(): return route.abort()
            return route.fulfill(path=str(path),content_type="text/javascript",headers={"Access-Control-Allow-Origin":"*"})
        page.route(THREE+"**",lambda route:local(route,root/"three"/"build"))
        page.route(RAPIER+"**",lambda route:local(route,root/"@dimforge"/"rapier3d-compat"))
        page.reload()
        page.locator("#physics-open").click()
        page.wait_for_function("document.querySelector('#physics-open').getAttribute('aria-expanded')==='true'",timeout=30000)
        assert page.locator("#physics-canvas canvas").count()==1
        page.locator("#physics-start").click()
        assert "0.02" in page.locator("#physics-readout").inner_text()
        page.select_option("#physics-bounce","0.8")
        assert "0.00" in page.locator("#physics-readout").inner_text()
        page.locator("#physics-start").click()
        page.locator("#physics-reset").click()
        assert "0.00" in page.locator("#physics-readout").inner_text()
        assert page.locator("#history li").all_text_contents()==saved
        page.locator("#physics-open").click()
        assert page.locator("#physics-canvas canvas").count()==0
        assert page.locator("#physics-panel").is_hidden()
        page.reload()
        page.wait_for_function("document.querySelectorAll('#history li').length===1")
        assert page.locator("#history li").all_text_contents()==saved
        print("PASS: physics dependency failure, WASM/WebGL, single-step, reset, unchanged archive")
        browser.close()

if __name__=="__main__":
    parser=ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("root",type=Path)
    args=parser.parse_args()
    check(args.url,args.root)
