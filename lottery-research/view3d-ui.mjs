import {createMachineScene} from "./view3d-scene.mjs?v=pi-motion";
import {loadRapier} from "./rapier-loader.mjs";

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
const physicsButton=document.querySelector("#view3d-physics");
const physicsStatus=document.querySelector("#view3d-physics-status");
const qualitySelect=document.querySelector("#view3d-quality");
const lightingSelect=document.querySelector("#view3d-lighting");
const materialStatus=document.querySelector("#view3d-material-status");
let physicsLoading=false,physicsEnabled=false;
function resetPhysicsButton(message){
  physicsEnabled=false;
  physicsButton.setAttribute("aria-pressed","false");
  physicsButton.textContent="启用三仓碰撞演示";
  physicsStatus.textContent=message;
}

function fallback(message) {
  controller?.dispose();
  controller=null;
  resetPhysicsButton("默认几何动画；可启用独立刚体演示。");
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
    qualitySelect.value="balanced";
    lightingSelect.value="studio";
    materialStatus.textContent=mount.dataset.environment==="generated"?"程序生成环境反射 · 无外部纹理下载":"环境反射不可用 · 保留直接照明";
    status.textContent="三维观察已启用 · 不影响抽样与存档";
  }catch{
    fallback("三维引擎或 WebGL 不可用，平面摇奖仍可正常使用。");
  }finally{
    clearTimeout(timer);
    loading=false;
    toggle.disabled=false;
  }
});

physicsButton.addEventListener("click",async()=>{
  if(!controller||physicsLoading)return;
  if(physicsEnabled){
    controller.setPhysics(null,null);
    resetPhysicsButton("碰撞演示已关闭；仍使用几何动画。");
    return;
  }
  const target=controller;
  physicsLoading=true;
  physicsButton.disabled=true;
  physicsStatus.textContent="正在加载碰撞演示…";
  let timer;
  try{
    const R=await Promise.race([loadRapier(),new Promise((_,reject)=>{
      timer=setTimeout(()=>reject(Error("Physics load timeout")),15000);
    })]);
    if(controller!==target)return;
    target.setPhysics(R,()=>{
      if(controller===target)resetPhysicsButton("刚体演示中断，已恢复几何动画。");
    });
    physicsEnabled=true;
    physicsButton.setAttribute("aria-pressed","true");
    physicsButton.textContent="关闭三仓碰撞演示";
    physicsStatus.textContent="已启用 · 碰撞与约束仅用于混球展示，不决定号码。";
  }catch{
    if(controller===target)resetPhysicsButton("碰撞引擎不可用，原三维动画不受影响。");
  }finally{
    clearTimeout(timer);
    physicsLoading=false;
    physicsButton.disabled=false;
  }
});

qualitySelect.addEventListener("change",()=>{
  if(!controller)return;
  try{
    controller.setQuality(qualitySelect.value);
    materialStatus.textContent=qualitySelect.value==="high"?"光学透射模式 · 更高渲染负载":"均衡模式 · 优先保证数字可读";
  }catch{
    qualitySelect.value="balanced";
    controller.setQuality("balanced");
    materialStatus.textContent="精细材质不可用，已回退均衡模式";
  }
});
lightingSelect.addEventListener("change",()=>{
  if(controller)controller.setLighting(lightingSelect.value);
});
