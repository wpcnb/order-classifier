"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html"),depth=read("career-depth.js");
const depContext={window:{}};
vm.runInNewContext(depth,depContext,{filename:"career-depth.js"});
const D=depContext.window.CareerDepth;
let passed=0;
function test(title,fn){fn();passed++;console.log("✓ "+passed+"/10 "+title)}
const player=(extra={})=>({
 name:"测试球员",stats:{pace:88,shoot:82,pass:70,dribble:80,defense:44,physical:70,mental:70},
 position:"LW",age:24,potential:94,coachTrust:65,form:70,injuryHistory:0,retired:false,youth:false,...extra
});
test("首页版本号与更新日期可见，模块在游戏之前加载",()=>{
 assert.match(html,/版本 v10\.0\.1 · 更新时间 2026-11-13/);
 assert(html.indexOf('career-depth.js?v=9.0.0')<html.indexOf('game.js?v=10.0.0'));
});
test("新旧存档的技术特质自动推断且稳定",()=>{
 const p=player();assert.equal(D.traitFor(p),"speed");
 assert.equal(D.traitInfo(p).label,"速度爆点");p.careerTrait="create";assert.equal(D.traitFor(p),"create");
});
test("技术特质真实改变比赛进攻与伤病参数",()=>{
 const p=player({careerTrait:"finish"});
 assert(D.contributionModifiers(p,{kind:"league"}).shoot>1);
 p.careerTrait="create";assert(D.contributionModifiers(p,{kind:"league"}).assist>1);
 p.careerTrait="robust";assert(D.injuryFactor(p)<1);
});
test("豪门主力竞争根据实力、状态与信任调整",()=>{
 const strong=player({coachTrust:98,form:95}),weak=player({coachTrust:10,form:25});
 const a=D.lineup(strong,90,85,()=>.5),b=D.lineup(weak,65,96,()=>.5);
 assert(a.starterChance>b.starterChance&&a.started&&!b.started&&b.entryMinute>=55&&b.entryMinute<=75);
});
test("位置改造只有合法目标，九次实际出场才成功",()=>{
 const p=player();assert(!D.setPositionTarget(p,"GK"));
 assert(D.setPositionTarget(p,"ST"));for(let i=0;i<8;i++)assert.equal(D.progressPosition(p).completed,false);
 assert.equal(p.position,"LW");const last=D.progressPosition(p);assert.equal(last.completed,true);
 assert.equal(p.position,"ST");assert.equal(p.positionTarget,null);assert.equal(p.positionHistory.length,1);
});
test("同档次球员身价随年龄衰退，俱乐部层级改变估值",()=>{
 const young=player(),old=player({age:37});
 assert(D.marketValue(young,88,4,{apps:28,goals:15,assists:7})>D.marketValue(old,88,4,{apps:28,goals:15,assists:7}));
 assert(D.marketValue(young,88,5)>D.marketValue(young,88,0));
 assert.match(D.money(24000000),/€2400万/);
});
test("赛季目标与进球、出场、实际评分挂钩",()=>{
 const p=player(),s={apps:24,goals:8,assists:5,ratings:[7.2,7.3]};
 const goals=D.objectiveTargets(p,2031,1,s);assert.equal(goals.length,3);assert(goals.every(x=>x.done));
 const empty=D.objectiveTargets(p,2031,1,{apps:0,goals:0,assists:0,ratings:[]});
 assert(empty.every(x=>!x.done));
});
test("赛季结算奖励只发一次，历年身价不重复记录",()=>{
 const p=player(),s={apps:30,goals:12,assists:10,ratings:[7.4,7.1]};
 const a=D.settleObjectives(p,2031,1,s),after=p.coachTrust;
 assert.equal(a.completed,3);assert.equal(D.settleObjectives(p,2031,1,s).completed,3);assert.equal(after,p.coachTrust);
 D.recordMarketValue(p,2031,89,1,s);D.recordMarketValue(p,2031,95,1,s);
 assert.equal(p.marketValueHistory.length,1);assert.equal(p.goalHistory.length,1);
});
function harness(){
 const storage=new Map(),cache={},handlers={},timers=[];
 const node=id=>cache[id]||(cache[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||(handlers[id+":"+type]=[])).push(fn)},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const window={},context={window,document,localStorage,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","career-depth.js"])vm.runInNewContext(read(file),context,{filename:file,timeout:4000});
 vm.runInNewContext(read("game.js"),context,{filename:"game.js",timeout:4000});
 const act=(action,more={})=>handlers["app:click"][0]({target:{closest:()=>({disabled:false,dataset:{action,...more}})}});
 return {act,change:(id,value)=>handlers["app:change"].forEach(fn=>fn({target:{dataset:{positionTarget:id},value}})),flush(){while(timers.length)timers.shift()()},get html(){return node("app").innerHTML},get state(){return JSON.parse(storage.get("football-dynasty-duo-v2-20261110")||"null")},get stored(){return storage}};
}
const h=harness();h.act("flipOpeningCard",{id:"wang",i:0});h.flush();h.act("flipOpeningCard",{id:"vini",i:0});h.flush();h.act("preset");
test("实际双人开局加载职业深度模块，仍能保存原存档结构",()=>{
 assert.equal(h.state.version,2);assert.equal(h.state.duoGames.wang.player.age,16);
 assert(h.state.duoGames.wang.player.careerTrait);assert.match(h.html,/本季目标/);
 assert.match(h.html,/游戏估算身价/);
});
test("位置选择一键保存且不会影响另一个球员",()=>{
 h.act("nextMatch"); // shared competition remains fully playable
 h.act("nextMatch"); // retain the same two-player save structure
 h.change("wang","ST");assert.equal(h.state.duoGames.wang.player.positionTarget,"ST");
 assert(!h.state.duoGames.vini.player.positionTarget);
});
assert.equal(passed,10);
console.log("✓ 10/10 career-depth v6.2 integration checks complete");
