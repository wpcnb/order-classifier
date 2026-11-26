import {CHAMBER_CENTERS,CHAMBER_Y,CHAMBER_RADIUS,BALL_RADIUS} from "./view3d-state.mjs";
import {radians,stirringField} from "./circular-motion.mjs";

// The engine is only a visual teaching aid. It never reads or chooses a draw
// number. Units, gravity and impulses are illustrative, not calibrated.
const STEP=1/60;
const LIMIT=CHAMBER_RADIUS-BALL_RADIUS;
const MAX_STEPS=140;
const MAX_CATCHUP=8;
const BOUNCE=.66;

export function createChamberPhysics(R){
  const world=new R.World({x:0,y:-5,z:0});
  let closed=false,steps=0;
  const bodies=[];
  try{
    world.timestep=STEP;
    // Two staggered pentagonal rings, with no initially overlapping balls.
    for(let chamber=0;chamber<3;chamber++){
      const center=CHAMBER_CENTERS[chamber];
      const group=[];
      for(let i=0;i<10;i++){
        const upper=i>=5;
        const a=radians((i%5)/5+(upper?.1:0));
        const x=.46*Math.cos(a),z=.46*Math.sin(a);
        const body=world.createRigidBody(R.RigidBodyDesc.dynamic()
          .setTranslation(center+x,CHAMBER_Y+(upper?.24:-.29),z)
          .setLinvel(-1.1*Math.sin(a),1.0+(.22*(i%3)),1.1*Math.cos(a))
          .setAngvel({x:.9,y:i%2?1.4:-1.4,z:.5})
          .setLinearDamping(.08).setAngularDamping(.12).setCcdEnabled(true));
        world.createCollider(R.ColliderDesc.ball(BALL_RADIUS)
          .setMass(.2).setFriction(.24).setRestitution(.67),body);
        group.push(body);
      }
      bodies.push(group);
    }
  }catch(error){world.free();throw error;}

  function confine(body,center){
    const p=body.translation();
    const x=p.x-center,y=p.y-CHAMBER_Y,z=p.z;
    const length=Math.hypot(x,y,z);
    if(!Number.isFinite(length))throw Error("Non-finite chamber position");
    if(length>LIMIT){
      const nx=x/length,ny=y/length,nz=z/length;
      body.setTranslation({x:center+nx*LIMIT,y:CHAMBER_Y+ny*LIMIT,z:nz*LIMIT},true);
      const v=body.linvel(),dot=v.x*nx+v.y*ny+v.z*nz;
      if(dot>0)body.setLinvel({
        x:v.x-(1+BOUNCE)*dot*nx,y:v.y-(1+BOUNCE)*dot*ny,z:v.z-(1+BOUNCE)*dot*nz
      },true);
    }
  }

  function step(){
    // Prescribed illustrative agitation, not a CFD calculation or ball selector.
    bodies.forEach((group,ci)=>group.forEach((body,i)=>{
      const v=body.linvel();
      const p=body.translation();
      const [ax,ay,az]=stirringField(p.x-CHAMBER_CENTERS[ci],p.y-CHAMBER_Y,p.z,steps*STEP,ci,i);
      const vx=v.x+STEP*ax;
      const vy=v.y+STEP*ay;
      const vz=v.z+STEP*az;
      const scale=Math.min(1,3.8/Math.max(.001,Math.hypot(vx,vy,vz)));
      body.setLinvel({x:vx*scale,y:vy*scale,z:vz*scale},true);
    }));
    world.step();
    bodies.forEach((group,ci)=>group.forEach(body=>confine(body,CHAMBER_CENTERS[ci])));
    steps++;
  }

  return {
    advance(elapsed){
      if(closed)throw Error("Physics disposed");
      const target=Math.min(MAX_STEPS,Math.max(0,Math.floor(Number(elapsed)/1000/STEP)));
      if(!Number.isFinite(target))throw Error("Invalid elapsed");
      let count=0;
      while(steps<target&&count<MAX_CATCHUP){step();count++;}
    },
    snapshot(){
      if(closed)throw Error("Physics disposed");
      return bodies.map(group=>group.map(body=>{
        const p=body.translation(),q=body.rotation();
        const pose={p:[p.x,p.y,p.z],q:[q.x,q.y,q.z,q.w]};
        if(![...pose.p,...pose.q].every(Number.isFinite))throw Error("Invalid pose");
        return pose;
      }));
    },
    get steps(){return steps;},
    dispose(){if(!closed){closed=true;world.free();}}
  };
}
