import {RADIUS,HALF_X,HALF_Z,HEIGHT} from "./physics-world.mjs";
export function createExperimentRenderer(T,mount,onFailure){
  const scene=new T.Scene();
  scene.background=new T.Color(0x172b43);
  const camera=new T.PerspectiveCamera(37,1,.1,40);
  camera.position.set(5.8,4.5,7.6);
  camera.lookAt(0,1.3,0);
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"low-power"});
  const canvas=renderer.domElement;
  const resources=new Set();
  const own=x=>(resources.add(x),x);
  const material=o=>own(new T.MeshStandardMaterial(o));
  let observer,closed=false,last=[];
  function add(geometry,mat,x,y,z){
    const item=new T.Mesh(own(geometry),mat);
    item.position.set(x,y,z);
    scene.add(item);
    return item;
  }
  function box(w,h,d,mat,x,y,z){return add(new T.BoxGeometry(w,h,d),mat,x,y,z);}
  function frame(){
    const steel=material({color:0xa8bed1,metalness:.35,roughness:.4});
    const transparent=material({color:0x8fddf0,transparent:true,opacity:.12,depthWrite:false});
    box(HALF_X*2+.2,.18,HALF_Z*2+.2,steel,0,-.09,0);
    for(const x of [-HALF_X,HALF_X])for(const z of [-HALF_Z,HALF_Z]){
      box(.06,HEIGHT,.06,steel,x,HEIGHT/2,z);
    }
    for(const y of [0,HEIGHT]){
      for(const z of [-HALF_Z,HALF_Z])box(2*HALF_X,.06,.06,steel,0,y,z);
      for(const x of [-HALF_X,HALF_X])box(.06,.06,2*HALF_Z,steel,x,y,0);
    }
    for(const z of [-HALF_Z,HALF_Z])box(HALF_X*2,HEIGHT,.012,transparent,0,HEIGHT/2,z);
    for(const x of [-HALF_X,HALF_X])box(.012,HEIGHT,HALF_Z*2,transparent,x,HEIGHT/2,0);
    box(HALF_X*2,.012,HALF_Z*2,transparent,0,HEIGHT,0);
    scene.add(new T.HemisphereLight(0xd9f4ff,0x364461,2.3));
    const key=new T.DirectionalLight(0xffffff,3);
    key.position.set(-3,6,5);scene.add(key);
    const fill=new T.DirectionalLight(0x80ccff,1.7);
    fill.position.set(4,3,-4);scene.add(fill);
  }
  const balls=[];
  function buildBalls(){
    const geometry=own(new T.SphereGeometry(RADIUS,24,16));
    const mark=own(new T.TorusGeometry(RADIUS*.94,.012,8,24));
    const stripe=material({color:0xf4f5ef,roughness:.5});
    for(const color of [0xe55359,0xeac542,0x4ab9e9,0xa684e2,0x65c6a1,0xf0a05f]){
      const group=new T.Group();
      const sphere=new T.Mesh(geometry,material({color,roughness:.42}));
      const band=new T.Mesh(mark,stripe);
      group.add(sphere,band);
      scene.add(group);
      balls.push(group);
    }
  }
  function render(state=last){
    if(closed)return;
    last=state;
    state.forEach((row,i)=>{
      balls[i].position.set(...row.p);
      balls[i].quaternion.set(...row.q);
    });
    renderer.render(scene,camera);
  }
  function resize(){
    if(closed||!mount.clientWidth||!mount.clientHeight)return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.setSize(mount.clientWidth,mount.clientHeight,false);
    camera.aspect=mount.clientWidth/mount.clientHeight;
    camera.fov=camera.aspect<1.5?47:37;
    camera.updateProjectionMatrix();
    render();
  }
  function lost(event){event.preventDefault();onFailure(new Error("WebGL context lost"));}
  function dispose(){
    if(closed)return;
    closed=true;
    observer?.disconnect();
    window.removeEventListener("resize",resize);
    canvas.removeEventListener("webglcontextlost",lost);
    for(const item of resources)item.dispose();
    renderer.dispose();
    canvas.remove();
  }
  try{
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;
    frame();buildBalls();
    mount.replaceChildren(canvas);
    resize();
    if(typeof ResizeObserver==="function"){
      observer=new ResizeObserver(resize);
      observer.observe(mount);
    }else window.addEventListener("resize",resize);
    canvas.addEventListener("webglcontextlost",lost);
    return {render,dispose};
  }catch(error){dispose();throw error;}
}
