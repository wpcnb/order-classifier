import {CHAMBER_CENTERS, CHAMBER_Y, CHAMBER_RADIUS, BALL_RADIUS, mapBall, outletDigit} from "./view3d-state.mjs";
import {createChamberPhysics} from "./chamber-physics.mjs";

// Everything in this file is a read-only representation of the existing UI.
export function createMachineScene(T, mount, source, onFailure) {
  const scene = new T.Scene();
  scene.background = new T.Color(0x14253e);
  const camera = new T.PerspectiveCamera(35,1,0.1,70);
  const renderer = new T.WebGLRenderer({antialias:true, alpha:false, powerPreference:"low-power"});
  const canvas = renderer.domElement;
  const resources = new Set();
  let closed = false;
  let pending = 0;
  let observer, resizeObserver;
  let physicsEngine=null, physical=null, physicalRun=null, physicsFailure=null;
  const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)");
  const track = value => (resources.add(value),value);
  const material = options => track(new T.MeshStandardMaterial(options));
  const mesh = (geometry, mat, parent, x=0,y=0,z=0) => {
    const object = new T.Mesh(geometry,mat);
    object.position.set(x,y,z);
    parent.add(object);
    return object;
  };
  const box = (w,h,d,mat,parent,x,y,z) =>
    mesh(track(new T.BoxGeometry(w,h,d)),mat,parent,x,y,z);
  const cylinder = (r1,r2,h,mat,parent,x,y,z) =>
    mesh(track(new T.CylinderGeometry(r1,r2,h,32)),mat,parent,x,y,z);
  const ring = (radius,tube,mat,parent,x,y,z) =>
    mesh(track(new T.TorusGeometry(radius,tube,10,48)),mat,parent,x,y,z);
  const views = {
    front:[0,3.3,13.5],
    left:[-8,4,11.5],
    right:[8,4,11.5],
    top:[5.5,8.5,12]
  };
  const colors = [0xef464b,0xf3bf34,0x399de7];
  const balls = [];
  const outlets = [];
  const model = new T.Group();
  scene.add(model);

  function labelTexture(text, fg, bg=null) {
    const sheet = document.createElement("canvas");
    sheet.width=256;
    sheet.height=128;
    const ctx=sheet.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,256,128);}
    ctx.font="bold 78px sans-serif";
    ctx.fillStyle=fg;
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(text,128,64);
    const texture=track(new T.CanvasTexture(sheet));
    texture.colorSpace=T.SRGBColorSpace;
    return texture;
  }
  function plate(text,fg,bg,w,h,x,y,z,parent=model) {
    const mat=track(new T.MeshBasicMaterial({map:labelTexture(text,fg,bg),transparent:!bg,depthWrite:false}));
    const obj=mesh(track(new T.PlaneGeometry(w,h)),mat,parent,x,y,z);
    return obj;
  }
  function digitSprite(digit) {
    const mat=track(new T.SpriteMaterial({
      map:labelTexture(String(digit),"#102133","#f8faf5"),
      depthTest:true
    }));
    const sprite=new T.Sprite(mat);
    sprite.scale.set(.17,.085,1);
    return sprite;
  }
  function makeBall(colorMaterial,digit) {
    const group=new T.Group();
    const sphere=mesh(ballGeometry,colorMaterial,group);
    sphere.castShadow=false;
    const label=digitSprite(digit);
    group.add(label);
    label.position.z=BALL_RADIUS+.012;
    model.add(group);
    return group;
  }
  function updateLabels(group) {
    // Keep the numbered tag on the camera-facing side of the sphere.
    const direction=new T.Vector3().subVectors(camera.position,group.position).normalize();
    group.children[1].position.copy(direction.multiplyScalar(BALL_RADIUS+.012));
  }

  const steel=material({color:0xa9bccb,metalness:.58,roughness:.34});
  const dark=material({color:0x243849,metalness:.30,roughness:.42});
  const trim=material({color:0xc7d9e3,metalness:.35,roughness:.26});
  const rubber=material({color:0x101b25,roughness:.83});
  const glass=material({color:0x9bd6f2,transparent:true,opacity:.13,
    roughness:.18,metalness:.08,depthWrite:false,side:T.FrontSide});
  const ballGeometry=track(new T.SphereGeometry(BALL_RADIUS,24,16));

  function setupStage() {
    const floor=box(19,.15,15,material({color:0x1d3550,roughness:.65}),scene,0,-.32,0);
    floor.receiveShadow=false;
    box(8.15,.30,3.6,dark,model,0,-.05,0);
    box(7.9,.14,3.3,trim,model,0,.13,0);
    box(7.5,.94,2.25,steel,model,0,.67,0);
    box(7.25,.12,2.42,trim,model,0,1.18,0);
    box(7.4,.15,1.9,steel,model,0,3.75,0);
    for(const x of [-3.58,3.58]) {
      box(.13,2.62,.18,steel,model,x,2.46,-.8);
      box(.13,2.62,.18,steel,model,x,2.46,.8);
    }
    for(const x of [-3.45,3.45]) {
      cylinder(.16,.20,.15,rubber,model,x,-.24,.85);
      cylinder(.16,.20,.15,rubber,model,x,-.24,-.85);
    }
    for(const x of [-2.45,2.45]) {
      box(1.60,.54,.09,dark,model,x,.68,1.16);
      for(let i=0;i<7;i++)box(1.4,.022,.03,trim,model,x,.48+i*.06,1.22);
    }
    box(1.45,.57,.09,rubber,model,0,.68,1.16);
    plate("3D","#a5f0de","#102e38",.88,.44,0,.72,1.22);
    for(let i=0;i<3;i++){
      cylinder(.045,.045,.035,material({color:colors[i],emissive:colors[i],emissiveIntensity:.18}),model,-.18+i*.18,.40,1.24).rotation.x=Math.PI/2;
    }
    plate("TOPAZE","#e8f6fc","#263d50",1.95,.32,0,3.76,1.02);
  }

  function setupChamber(index) {
    const x=CHAMBER_CENTERS[index];
    cylinder(.77,.88,.18,steel,model,x,1.31,0);
    cylinder(.43,.54,.22,dark,model,x,1.17,0);
    const shell=mesh(track(new T.SphereGeometry(CHAMBER_RADIUS,40,24)),glass,model,x,CHAMBER_Y,0);
    shell.renderOrder=5;
    ring(.97,.035,trim,model,x,CHAMBER_Y,0);
    const sideRing=ring(.97,.025,steel,model,x,CHAMBER_Y,0);
    sideRing.rotation.y=Math.PI/2;
    cylinder(.23,.23,.62,glass,model,x,3.34,0).renderOrder=5;
    cylinder(.28,.28,.08,steel,model,x,3.04,0);
    cylinder(.28,.28,.08,trim,model,x,3.66,0);
    const ballMat=material({color:colors[index],roughness:.34,metalness:.02});
    const chamber=[];
    for(let digit=0;digit<10;digit++)chamber.push(makeBall(ballMat,digit));
    balls.push(chamber);
    const outlet=makeBall(ballMat,0);
    outlet.position.set(x,3.38,0);
    outlet.visible=false;
    outlets.push(outlet);
    plate(String(index+1),"#eaf4fa","#254155",.48,.24,x,1.38,.81);
  }

  function setupLights() {
    scene.add(new T.HemisphereLight(0xe2f4ff,0x3e395b,2.2));
    const light=(color,intensity,x,y,z)=>{
      const lamp=new T.DirectionalLight(color,intensity);
      lamp.position.set(x,y,z);
      scene.add(lamp);
    };
    light(0xffffff,3.0,-4,7,6);
    light(0x6bdcf8,2.0,-6,3,-4);
    light(0xc09aff,1.9,6,4,-3);
    light(0xffdb9a,.8,2,5,8);
  }

  function releasePhysics(){
    physical?.dispose();physical=null;physicalRun=null;
    mount.dataset.physicsSteps="0";
  }
  function setPhysics(engine,onError){
    releasePhysics();
    physicsEngine=engine;
    physicsFailure=onError;
    mount.dataset.physicsEnabled=String(!!engine);
    schedule();
  }
  function physicalState(){
    const phase=source.dataset.visualPhase;
    if(!physicsEngine||reduceMotion.matches||!["mixing","paused"].includes(phase)){
      if(physical)releasePhysics();
      return null;
    }
    try{
      const run=source.dataset.visualRun;
      if(!physical||physicalRun!==run){
        releasePhysics();
        physical=createChamberPhysics(physicsEngine);
        physicalRun=run;
      }
      if(phase==="mixing")physical.advance(Number(source.dataset.visualElapsed));
      mount.dataset.physicsSteps=String(physical.steps);
      return physical.snapshot();
    }catch(error){
      const callback=physicsFailure;
      setPhysics(null,null);
      callback?.(error);
      return null;
    }
  }
  function sync() {
    const poses=physicalState();
    const chambers=source.querySelectorAll(".glass");
    const necks=source.querySelectorAll(".neck");
    for(let index=0;index<3;index++){
      const nodes=chambers[index].querySelectorAll(".ball");
      const revealed=outletDigit(necks[index].textContent);
      for(let digit=0;digit<10;digit++){
        const node=nodes[digit];
        const ball=balls[index][digit];
        ball.visible=node.style.visibility!=="hidden";
        const pose=revealed===null?poses?.[index]?.[digit]:null;
        ball.position.set(...(pose?pose.p:mapBall(index,digit,node.style.left,node.style.top)));
        if(pose)ball.children[0].quaternion.set(...pose.q);
        else ball.children[0].quaternion.identity();
        if(ball.visible)updateLabels(ball);
      }
      const digit=outletDigit(necks[index].textContent);
      const outlet=outlets[index];
      outlet.visible=digit!==null;
      if(digit!==null){
        // Reuse the numbered texture of the selected chamber ball.
        outlet.children[1].material.map=balls[index][digit].children[1].material.map;
        updateLabels(outlet);
      }
    }
  }

  function schedule() {
    if(closed||pending)return;
    pending=requestAnimationFrame(()=>{
      pending=0;
      if(closed)return;
      try{
        sync();
        renderer.render(scene,camera);
      }catch(error){onFailure(error);}
    });
  }
  function resize() {
    if(closed)return;
    const w=mount.clientWidth,h=mount.clientHeight;
    if(!w||!h)return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    // Preserve all three chambers in a portrait/narrow viewport.
    camera.fov=camera.aspect<1.4?46:35;
    camera.updateProjectionMatrix();
    schedule();
  }
  function setView(name) {
    if(!Object.hasOwn(views,name))return;
    camera.position.set(...views[name]);
    camera.lookAt(0,1.85,0);
    schedule();
  }
  function lost(event) {
    event.preventDefault();
    onFailure(new Error("WebGL context lost"));
  }
  function dispose() {
    if(closed)return;
    closed=true;
    if(pending)cancelAnimationFrame(pending);
    observer?.disconnect();
    releasePhysics();
    physicsEngine=null;
    mount.dataset.physicsEnabled="false";
    resizeObserver?.disconnect();
    window.removeEventListener("resize",resize);
    canvas.removeEventListener("webglcontextlost",lost);
    for(const item of resources)item.dispose();
    renderer.dispose();
    canvas.remove();
  }

  try{
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;
    setupStage();
    for(let index=0;index<3;index++)setupChamber(index);
    setupLights();
    mount.replaceChildren(canvas);
    setView("front");
    resize();
    // Render once synchronously before declaring the mode available.
    sync();
    renderer.render(scene,camera);
    observer=new MutationObserver(schedule);
    observer.observe(source,{subtree:true,attributes:true,attributeFilter:["style","data-visual-phase","data-visual-run","data-visual-elapsed"],childList:true,characterData:true});
    if(typeof ResizeObserver==="function"){
      resizeObserver=new ResizeObserver(resize);
      resizeObserver.observe(mount);
    }else window.addEventListener("resize",resize);
    canvas.addEventListener("webglcontextlost",lost);
    return {setView,setPhysics,dispose};
  }catch(error){
    dispose();
    throw error;
  }
}
