"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const context={window:{},console};vm.runInNewContext(read("body-path.js"),context);vm.runInNewContext(read("career-depth.js"),context);
const BP=context.window.BodyPath,CD=context.window.CareerDepth;
const p=(h,w,pos="LW",careerPath="balanced")=>({heightCm:h,weightKg:w,position,careerPath,coachTrust:60,form:65,stats:{pace:80,shoot:80,pass:80,dribble:80,defense:80,physical:80,mental:80}});
let checked=0;function test(name,fn){fn();checked++;console.log("✓ "+checked+"/10 "+name)}
test("v9 release, script order and reproducibility document",()=>{
 const html=read("index.html");
 assert(html.includes("版本 v9.0.0 · 更新时间 2026-11-13"));
 assert(html.indexOf("body-path.js?v=9.0.0")<html.indexOf("career-depth.js?v=9.0.0"));
 assert(html.indexOf("career-depth.js?v=9.0.0")<html.indexOf("game.js?v=9.0.0"));
 assert(read("V9_BALANCE_AUDIT.md").includes("200,000,000"));
});
test("old saves missing mass stay neutral without auto-writing derived weight",()=>{
 const v=BP.profile({heightCm:194,position:"CB"});
 assert(v.flags.includes("legacy-neutral"));
 for(const key of ["aerial","duel","agility","endurance","goalkeeperReach"])assert.equal(v[key],1,key);
 assert.equal(BP.matchup({heightCm:194,position:"CB"}),1);
});
test("shorter/lighter is more flexible while tall/heavy better in air and contact",()=>{
 const short=BP.profile(p(164,57)),giant=BP.profile(p(205,110));
 assert(giant.aerial>short.aerial);assert(giant.duel>short.duel);
 assert(short.agility>giant.agility);assert(short.endurance>giant.endurance);
});
test("extreme physique no longer dominates CB and LW at the same time",()=>{
 const giantCB=BP.matchup(p(205,110,"CB")),smallCB=BP.matchup(p(164,57,"CB"));
 const giantLW=BP.matchup(p(205,110,"LW")),smallLW=BP.matchup(p(164,57,"LW"));
 assert(giantCB>smallCB);assert(smallLW>giantLW);
 assert(giantCB<1.05);assert(giantCB-smallCB<.08);
});
test("mass also increases fatigue and all positional bonuses are limited",()=>{
 assert(BP.profile(p(205,110)).endurance<.94);
 for(const pos of BP.POSITIONS){
  for(const [h,w] of [[150,45],[205,110],[185,68],[177,91]]){
   const x=p(h,w,pos);
   assert(BP.matchup(x)>=.94&&BP.matchup(x)<=1.06);
   assert(Math.abs(BP.matchScoreBonus(x))<=.071);
   assert(Math.abs(BP.starterBonus(x))<=.021);
  }
 }
});
test("career path gap is reduced without removing the two identities",()=>{
 const x=p(177,72),growth=CD.lineup({...x,careerPath:"growth"},80,80,()=>0).starterChance;
 const minutes=CD.lineup({...x,careerPath:"minutes"},80,80,()=>0).starterChance;
 assert(minutes>growth);
 assert(minutes-growth<=.055,"must not restore old 9.5pp gap");
 assert.equal(BP.trainingThreshold(12,"growth"),11);
 assert.equal(BP.trainingThreshold(12,"balanced"),12);
 assert.equal(BP.trainingThreshold(12,"minutes"),13);
});
test("ancestry, sex, skin, nationality and name never affect physique odds",()=>{
 const x=p(174,73,"ST"),a={...x,gender:"male",country:"中国",skinTone:"fair",heritage:"eastAsian",name:"甲"},
 b={...x,gender:"female",country:"巴西",skinTone:"deep",heritage:"african",name:"乙"};
 for(const category of ["aerial","duel","agility"])assert.equal(BP.encounterChance(a,category),BP.encounterChance(b,category));
 assert.equal(BP.matchup(a),BP.matchup(b));
});
test("three real simulated encounters use position and minutes without inventing goals",()=>{
 const cb=BP.simulateContests(p(190,90,"CB"),()=>.01,90);
 const gk=BP.simulateContests(p(190,80,"GK"),()=>.9,30);
 assert.equal(cb.attempts,3);assert.equal(cb.wins,3);
 assert.equal(gk.attempts,1);assert.equal(gk.wins,0);
 assert(cb.byType.duel&&cb.byType.aerial);assert(gk.byType.goalkeeperReach);
 assert(Math.abs(cb.ratingDelta)<=.08);assert.equal(cb.source,"游戏简化对抗模拟");
});
function harness(initial=[]){
 const storage=new Map(initial),handlers={},nodes={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||(handlers[id+":"+type]=[])).push(fn)},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const window={},context={window,document,localStorage,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","body-path.js","career-depth.js","free-star.js"])
  vm.runInNewContext(read(file),context,{filename:file,timeout:8000});
 vm.runInNewContext(read("game.js"),context,{filename:"game.js",timeout:10000});
 const act=(action,more={})=>(handlers["app:click"]||[])[0]({target:{closest:()=>({disabled:false,dataset:{action,...more}})}});
 return {act,flush(){let i=0;while(timers.length&&i++<30)timers.shift()},get saved(){return JSON.parse(storage.get("football-dynasty-duo-v2-20261110")||"null")},get html(){return node("app").innerHTML},storage};
}
let playedSave;
test("match integration persists simulated body challenges alongside real game scoreboard",()=>{
 const h=harness();
 h.act("flipOpeningCard",{id:"wang",i:0});h.flush();
 h.act("flipOpeningCard",{id:"vini",i:0});h.flush();h.act("preset");
 h.act("simBoth");playedSave=h.saved;
 const played=[...playedSave.duoGames.wang.season.results,...playedSave.duoGames.vini.season.results];
 const appearances=played.filter(m=>m.played);
 assert(appearances.length>10);
 assert(appearances.every(m=>m.bodyContests&&m.bodyContests.attempts>=1&&m.bodyContests.attempts<=3));
 assert(played.filter(m=>!m.played).every(m=>!m.bodyContests));
 for(const m of played)if(m.bodyContests)assert(m.goals<=(m.hs>m.as?m.hs:m.hs+m.as));
});
test("loading v9 career keeps old awards and match history untouched",()=>{
 const before=JSON.parse(JSON.stringify(playedSave));
 for(const id of ["wang","vini"]){delete before.duoGames[id].player.weightKg;delete before.duoGames[id].player.careerPath}
 const copy=harness([["football-dynasty-duo-v2-20261110",JSON.stringify(before)]]);
 for(const id of ["wang","vini"]){
  const original=before.duoGames[id],restored=copy.saved.duoGames[id];
  assert.equal(restored.player.weightKg,undefined);
  assert.equal(restored.player.careerPath,undefined);
  assert.equal(restored.player.age,original.player.age);
  assert.equal(restored.honors.length,original.honors.length);
  assert.equal(restored.season.results.length,original.season.results.length);
 }
});
assert.equal(checked,10);
console.log("v9.0 - 10/10 focused validation checks passed");
