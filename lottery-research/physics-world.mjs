// Independent teaching experiment. No access to lottery sampling, numbered balls or archives.
export const DT=1/60;
export const MAX_STEPS=480;
export const RADIUS=.22;
export const HALF_X=1.65;
export const HALF_Z=.9;
export const HEIGHT=2.8;
export const INITIAL=Object.freeze([
  [-.95,1.30,-.42],[-.05,1.85,-.42],[.92,2.35,-.42],
  [-.92,2.35,.42],[.05,1.25,.42],[.95,1.65,.42]
].map(Object.freeze));

export function createExperiment(R,bounce=.55) {
  if(!Number.isFinite(bounce)||bounce<0||bounce>1)throw new RangeError("Invalid restitution");
  const world=new R.World({x:0,y:-9.81,z:0});
  const bodies=[];
  let steps=0,closed=false;
  try{
    world.timestep=DT;
    function wall(x,y,z,hx,hy,hz){
      world.createCollider(R.ColliderDesc.cuboid(hx,hy,hz)
        .setTranslation(x,y,z).setFriction(.45).setRestitution(bounce));
    }
    const t=.09;
    wall(0,-t,0,HALF_X+t,t,HALF_Z+t);
    wall(0,HEIGHT+t,0,HALF_X+t,t,HALF_Z+t);
    for(const sign of [-1,1]){
      wall(sign*(HALF_X+t),HEIGHT/2,0,t,HEIGHT/2+t,HALF_Z+t);
      wall(0,HEIGHT/2,sign*(HALF_Z+t),HALF_X+t,HEIGHT/2+t,t);
    }
    INITIAL.forEach(([x,y,z],i)=>{
      const body=world.createRigidBody(R.RigidBodyDesc.dynamic()
        .setTranslation(x,y,z).setLinvel((i%3-1)*1.2,.3,-z)
        .setAngvel({x:.9,y:i%2?1.4:-1.4,z:.5})
        .setLinearDamping(.05).setAngularDamping(.08).setCcdEnabled(true));
      world.createCollider(R.ColliderDesc.ball(RADIUS)
        .setMass(.2).setFriction(.35).setRestitution(bounce),body);
      bodies.push(body);
    });
  }catch(error){world.free();throw error;}

  function snapshot(){
    if(closed)throw new Error("Experiment disposed");
    return bodies.map(body=>{
      const p=body.translation(),q=body.rotation(),v=body.linvel();
      return {p:[p.x,p.y,p.z],q:[q.x,q.y,q.z,q.w],speed:Math.hypot(v.x,v.y,v.z)};
    });
  }
  return {
    step(){
      if(closed||steps>=MAX_STEPS)return false;
      world.step();
      steps++;
      return steps<MAX_STEPS;
    },
    snapshot,
    get steps(){return steps;},
    dispose(){if(!closed){closed=true;world.free();}}
  };
}
