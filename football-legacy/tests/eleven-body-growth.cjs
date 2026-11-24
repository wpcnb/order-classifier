"use strict";
const assert=require("node:assert/strict");
const core=require("../china-eleven-career");
const fixtures=require("../eleven-fixtures");
const seed=20261124;
const start=core.create(seed,[{group:"senior",name:"李昊",height:187,weight:77}]);
const world=core.simulate(start,19);
assert(core.isValid(world));
assert.deepEqual(world,core.simulate(JSON.parse(JSON.stringify(core.simulate(start,7))),12));
assert.equal(world.players[0].adultHeight,187);
assert.equal(world.players[0].adultWeight,77);
assert.equal(world.players[1].adultWeight,null);
const maturity=new Set();
for(const p of world.players){
  const heights=[p.youthHeightEstimate,...p.seasons.map(s=>s.body.heightCm)];
  assert(heights.every((v,i)=>!i||v>=heights[i-1]));
  assert(heights.at(-1)>heights[0]);
  assert(heights.slice(6).every(h=>h===heights.at(-1)));
  maturity.add(16+heights.indexOf(heights.at(-1)));
  assert(p.seasons.every(s=>s.body.weightKg>0&&s.body.weightKg<=155));
}
assert(maturity.size>1);
const other=core.simulate(core.create(seed+1),19);
assert.notDeepEqual(world.players[0].seasons.map(s=>s.body),other.players[0].seasons.map(s=>s.body));
const old=core.simulate(start,11);
old.players.forEach(p=>p.seasons.forEach(s=>delete s.body));
delete old.players[1].youthHeightEstimate;
delete old.players[1].youthWeightEstimate;
const previous=structuredClone(old);
const resumed=core.simulate(old,8);
assert.deepEqual(old,previous);
assert(core.isValid(resumed));
for(const p of resumed.players){
  assert.deepEqual(p.seasons.slice(0,11),old.players[p.id-1].seasons);
  assert(p.seasons.slice(11).every(s=>s.body));
}
for(const value of [null,{heightCm:NaN,weightKg:72},{heightCm:176,weightKg:800}]){
  const bad=structuredClone(world);
  bad.players[0].seasons[0].body=value;
  assert.equal(core.isValid(bad),false);
}
const missing=structuredClone(world);
delete missing.players[0].seasons[6].body;
assert.equal(core.isValid(missing),false);
const shortens=structuredClone(world);
shortens.players[0].seasons[2].body.heightCm=shortens.players[0].youthHeightEstimate;
assert.equal(core.isValid(shortens),false);

// Basic pre-ledger saves provide last season's appearances and injury absences.
function nextBody(apps,injuryGames){
  const sparse=core.step(start);
  delete sparse.fixtures;delete sparse.leagueSchedules;delete sparse.nationalFixtures;
  for(const p of sparse.players)delete p.seasons[0].statVersion;
  Object.assign(sparse.players[0].seasons[0],{apps,injuryGames});
  return core.step(sparse).players[0].seasons.at(-1).body;
}
const full=nextBody(22,0),injured=nextBody(5,8);
assert.equal(full.heightCm,injured.heightCm);
assert(full.weightKg>injured.weightKg);

function thresholdGoal(position,heightCm,weightKg){
  const lines=[0,1].map(()=>fixtures.roles.map(pos=>({position:pos,id:null,rating:70})));
  const player=lines[0].find(p=>p.position===position);
  player.seasons=[{body:{heightCm,weightKg}}];
  let first=true;
  return fixtures.scoreLineups(lines,()=>{if(first){first=false;return .285}return .999}).score[0];
}
assert.equal(thresholdGoal("GK",200,96),1);
assert.equal(thresholdGoal("GK",165,60),0);
assert.equal(thresholdGoal("LW",200,96),0);
assert.equal(thresholdGoal("LW",165,60),1);
console.log("PASS physical development to age 35, previous workload, position effects, migration and seeded reload",{seed,maturity:[...maturity].sort()});
