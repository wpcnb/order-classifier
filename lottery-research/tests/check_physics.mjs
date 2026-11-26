import assert from "node:assert/strict";
import {createExperiment,MAX_STEPS,HALF_X,HALF_Z,HEIGHT,RADIUS} from "../physics-world.mjs";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
const root=process.argv[2];
if(!root)throw Error("Pass installed Rapier module path");
const R=(await import(pathToFileURL(resolve(root)))).default;
await R.init();
for(const bounce of [.2,.55,.8]){
  const sim=createExperiment(R,bounce);
  const initial=sim.snapshot();
  assert.equal(initial.length,6);
  for(let i=0;i<MAX_STEPS;i++){
    assert.equal(sim.step(),i<MAX_STEPS-1);
    const state=sim.snapshot();
    for(const row of state){
      assert.ok([...row.p,...row.q,row.speed].every(Number.isFinite));
      assert.ok(Math.abs(row.p[0])<=HALF_X-RADIUS+.12);
      assert.ok(Math.abs(row.p[2])<=HALF_Z-RADIUS+.12);
      assert.ok(row.p[1]>=RADIUS-.12&&row.p[1]<=HEIGHT-RADIUS+.12);
    }
    if(i===30)assert.notDeepEqual(state,initial);
  }
  assert.equal(sim.steps,MAX_STEPS);
  assert.equal(sim.step(),false);
  sim.dispose();sim.dispose();
  assert.throws(()=>sim.snapshot());
}
assert.throws(()=>createExperiment(R,1.1),RangeError);
console.log("PASS: three restitution settings, 1440 real WASM steps, bounds, finite poses, lifecycle");
