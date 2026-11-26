import {createExperiment,DT,MAX_STEPS} from "./physics-world.mjs";
import {createExperimentRenderer} from "./physics-render.mjs";
const THREE="https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";
const RAPIER="https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/dist/rapier.mjs";
const $=id=>document.getElementById(id);
const open=$("physics-open"),panel=$("physics-panel"),mount=$("physics-canvas");
const status=$("physics-status"),readout=$("physics-readout"),start=$("physics-start");
const pause=$("physics-pause"),reset=$("physics-reset"),bounce=$("physics-bounce");
let engine,view,experiment,frame=0,running=false,loading=false,previous=0,accumulator=0;
const reduced=matchMedia("(prefers-reduced-motion: reduce)");

function stop(){
  running=false;
  if(frame)cancelAnimationFrame(frame);
  frame=0;
  previous=0;
  accumulator=0;
  pause.disabled=true;
  start.disabled=!experiment||experiment.steps>=MAX_STEPS;
}
function close(message){
  stop();
  experiment?.dispose();experiment=null;
  view?.dispose();view=null;
  panel.hidden=true;
  open.textContent="打开物理实验";
  open.setAttribute("aria-expanded","false");
  status.textContent=message;
}
function fail(){close("物理实验不可用，原摇奖机不受影响。");}
function show(){
  const state=experiment.snapshot();
  view.render(state);
  readout.textContent="仿真时间 "+(experiment.steps*DT).toFixed(2)+" 秒 · 最高球速 "+
    Math.max(...state.map(x=>x.speed)).toFixed(2)+" 模拟单位/秒";
}
function fresh(){
  stop();
  experiment?.dispose();experiment=null;
  experiment=createExperiment(engine,Number(bounce.value));
  show();
  start.disabled=false;
  start.textContent="开始实验";
  status.textContent="实验已就绪 · 不产生号码";
}
function tick(now){
  if(!running)return;
  try{
    const delta=previous?Math.min((now-previous)/1000,.1):0;
    previous=now;accumulator+=delta;
    let count=0;
    while(accumulator>=DT&&count<6&&running){
      const more=experiment.step();
      accumulator-=DT;count++;
      if(!more){stop();status.textContent="实验结束 · 8秒上限";}
    }
    show();
    if(running)frame=requestAnimationFrame(tick);
  }catch{fail();}
}
open.addEventListener("click",async()=>{
  if(loading)return;
  if(view){close("已关闭物理实验 · 原模拟记录不变");return;}
  loading=true;open.disabled=true;status.textContent="正在加载独立物理引擎…";
  let timer;
  try{
    const deps=Promise.all([import(THREE),import(RAPIER)]).then(async([T,R])=>{
      const library=R.default??R;
      await library.init();
      return [T,library];
    });
    const [T,R]=await Promise.race([deps,new Promise((_,reject)=>{
      timer=setTimeout(()=>reject(new Error("Dependency timeout")),15000);
    })]);
    engine=R;panel.hidden=false;
    view=createExperimentRenderer(T,mount,fail);
    fresh();
    open.textContent="关闭物理实验";
    open.setAttribute("aria-expanded","true");
  }catch{fail();}
  finally{clearTimeout(timer);loading=false;open.disabled=false;}
});
start.addEventListener("click",()=>{
  if(!experiment||running||experiment.steps>=MAX_STEPS)return;
  try{
    if(reduced.matches){
      // No continuous animation with reduced-motion preference; a single explicit step.
      experiment.step();show();
      start.textContent="前进一帧";
      start.disabled=experiment.steps>=MAX_STEPS;
      return;
    }
    running=true;start.disabled=true;pause.disabled=false;
    status.textContent="正在演示碰撞";
    frame=requestAnimationFrame(tick);
  }catch{fail();}
});
pause.addEventListener("click",()=>{stop();start.textContent="继续实验";status.textContent="已暂停";});
reset.addEventListener("click",()=>{try{if(view)fresh();}catch{fail();}});
bounce.addEventListener("change",()=>{try{if(view)fresh();}catch{fail();}});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&running){stop();start.textContent="继续实验";status.textContent="页面隐藏，实验已暂停";}});
reduced.addEventListener("change",()=>{if(reduced.matches&&running){stop();start.textContent="前进一帧";status.textContent="已暂停连续动画";}});
