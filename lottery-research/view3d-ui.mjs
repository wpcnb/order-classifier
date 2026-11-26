import {createMachineScene} from "./view3d-scene.mjs";

// Fixed release, loaded only when a person chooses the optional view.
const ENGINE_URL="https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";
const toggle=document.querySelector("#view3d-toggle");
const stage=document.querySelector("#view3d-stage");
const mount=document.querySelector("#view3d-canvas");
const source=document.querySelector(".machine .studio");
const status=document.querySelector("#view3d-status");
const cameras=[...document.querySelectorAll("[data-camera]")];
let controller=null;
let loading=false;

function fallback(message) {
  controller?.dispose();
  controller=null;
  stage.hidden=true;
  source.hidden=false;
  toggle.setAttribute("aria-pressed","false");
  toggle.textContent="切换三维观察";
  status.textContent=message;
}
function selectView(button) {
  if(!controller)return;
  for(const item of cameras)item.setAttribute("aria-pressed",String(item===button));
  controller.setView(button.dataset.camera);
}
for(const button of cameras)button.addEventListener("click",()=>selectView(button));

toggle.addEventListener("click",async()=>{
  if(loading)return;
  if(controller){
    fallback("平面演示 · 可选三维观察");
    return;
  }
  loading=true;
  toggle.disabled=true;
  status.textContent="正在加载三维展示…";
  let timer;
  try{
    const engine=await Promise.race([
      import(ENGINE_URL),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("Engine timeout")),12000);})
    ]);
    if(source.querySelectorAll(".glass .ball").length!==30)throw new Error("Draw UI not ready");
    stage.hidden=false;
    controller=createMachineScene(engine,mount,source,()=>{
      fallback("三维渲染中断，已回到平面模式。");
    });
    source.hidden=true;
    toggle.setAttribute("aria-pressed","true");
    toggle.textContent="返回平面演示";
    selectView(cameras[0]);
    status.textContent="三维观察已启用 · 不影响抽样与存档";
  }catch{
    fallback("三维引擎或 WebGL 不可用，平面摇奖仍可正常使用。");
  }finally{
    clearTimeout(timer);
    loading=false;
    toggle.disabled=false;
  }
});
