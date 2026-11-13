"use strict";
/* 100 million seeded MICRO-events, not full matches.
   BodyPath + CareerDepth probabilities are imported directly from game assets.
   Physical challenges are controlled 50/50 calibration proxies; starter
   chances are directly produced by the game lineup function. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const ctx={window:{},console};
vm.runInNewContext(read("body-path.js"),ctx);vm.runInNewContext(read("career-depth.js"),ctx);
const BP=ctx.window.BodyPath,CD=ctx.window.CareerDepth;
const builds=[
 ["short-light","矮轻",164,57],["medium-light","中等偏轻",177,65],
 ["medium-standard","中等均衡",177,72],["medium-heavy","中等偏重",177,90],
 ["tall-light","高挑偏轻",193,76],["tall-heavy","高挑偏重",193,96],
 ["extra-tall-heavy","超高偏重",205,110]
];
const positions=["LW","RW","ST","CAM","CM","CDM","CB","GK"],paths=["balanced","growth","minutes"];
const kinds=["aerial","duel","agility","starter"],SAMPLES=100_000_000;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),percent=(wins,attempts)=>Math.round(wins/attempts*10000)/100;
const groups=[],totals={},routes={},roleFit={};
for(const b of builds){totals[b[0]]={events:[0,0,0,0],wins:[0,0,0,0]};roleFit[b[0]]={};}
for(const id of paths)routes[id]={events:[0,0,0,0],wins:[0,0,0,0]};
for(const b of builds)for(const position of positions)for(const route of paths){
 const p={heightCm:b[2],weightKg:b[3],position,careerPath:route,
  coachTrust:60,form:65,stats:{pace:80,shoot:80,pass:80,dribble:80,defense:80,physical:80,mental:80}};
 const body=BP.profile(p),starter=CD.lineup(p,80,80,()=>0).starterChance;
 const chances=[
  clamp(.5+(body.aerial-1)*.8,.35,.65),
  clamp(.5+(body.duel-1)*.8,.35,.65),
  clamp(.5+(body.agility-1)*.8,.35,.65),starter
 ];
 if(!Object.hasOwn(roleFit[b[0]],position))roleFit[b[0]][position]=BP.matchup(p);
 groups.push({build:b[0],route,position,chances});
}
const cells=groups.length*4,base=Math.floor(SAMPLES/cells),extras=SAMPLES%cells;
let state=0x2a6b3f91,totalEvents=0;
for(let g=0;g<groups.length;g++)for(let type=0;type<4;type++){
 const x=groups[g],cell=g*4+type,n=base+(cell<extras?1:0);
 const boundary=Math.floor(x.chances[type]*4294967296);
 let won=0;
 for(let j=0;j<n;j++){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  if((state>>>0)<boundary)won++;
 }
 totals[x.build].events[type]+=n;totals[x.build].wins[type]+=won;
 routes[x.route].events[type]+=n;routes[x.route].wins[type]+=won;
 totalEvents+=n;
}
assert.equal(totalEvents,SAMPLES);
const result={version:"v8.1 baseline / v9.x calibration",sampleType:"100m seeded MICRO-event outcomes, NOT full games/seasons",seed:"0x2a6b3f91",actualTrials:totalEvents,groups:groups.length,cells,builds:{},paths:{},leaders:{}};
for(const b of builds){
 const key=b[0],r=totals[key],rates={},trials={},fit={};
 for(let k=0;k<4;k++){rates[kinds[k]]=percent(r.wins[k],r.events[k]);trials[kinds[k]]=r.events[k];}
 for(const p of positions)fit[p]=Math.round(roleFit[key][p]*10000)/10000;
 result.builds[key]={name:b[1],height:b[2],weight:b[3],rates,trials,roleFit:fit};
}
for(const id of paths){
 const r=routes[id],rates={};
 for(let k=0;k<4;k++)rates[kinds[k]]=percent(r.wins[k],r.events[k]);
 result.paths[id]=rates;
}
for(let k=0;k<3;k++){
 let top=null;
 for(const b of builds){const key=b[0],r=totals[key],rate=r.wins[k]/r.events[k];if(!top||rate>top.rate)top={id:key,rate};}
 result.leaders[kinds[k]]=top.id;
}
assert.notEqual(result.leaders.aerial,result.leaders.agility);
assert.notEqual(result.leaders.duel,result.leaders.agility);
assert(result.paths.minutes.starter>result.paths.growth.starter);
console.log("FOOTBALL_V9_CALIBRATION_JSON="+JSON.stringify(result));
console.log("PASS: exactly "+totalEvents.toLocaleString("en-US")+" seeded micro-events across "+cells+" calibrated test cells");
