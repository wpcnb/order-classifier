"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const STORE="football-dynasty-duo-v2-20261110",OPENING="football-dynasty-opening-v3";
const scripts=["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","body-path.js",
 "career-depth.js","free-star.js","v10-core.js","v10-ui.js","legend-v1.js","tests/_fixtures/legacy-engine.txt"];
function harness(existing=[]){
 const storage=new Map(existing),nodes={},handlers={},timers=[];let seed=0x20261121;
 const random=Math.create?Math:Math;const seededMath=Object.create(Math);
 seededMath.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",value:"",style:{},classList:{add(){},remove(){}},
  addEventListener(type,fn){(handlers[id+":"+type]||=[]).push(fn)},click(){}});
 const document={getElementById:node,querySelector:()=>null,
  createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={get length(){return storage.size},key:i=>[...storage.keys()][i]||null,
  getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const context={window:{FootballMarketV3:require(path.join(root,"market-v3.js")),
  FootballRolesV3:require(path.join(root,"role-v3.js"))},
  document,localStorage,console,Math:seededMath,confirm:()=>true,
  setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL};
 for(const file of scripts){
  let source=read(file);
  if(file==="tests/_fixtures/legacy-engine.txt")source=source.replace(/\}\)\(\);\s*$/,'window.__chinaProbe={games:()=>duoGames,year:()=>duoGames?.wang?.year};})();');
  vm.runInNewContext(source,context,{filename:file,timeout:16000});
 }
 const fire=(type,target)=>{for(const fn of handlers["app:"+type]||[])fn({target})};
 return {storage,api:context.window.__chinaProbe,core:context.window.DualV10,
  get saved(){return JSON.parse(storage.get(STORE)||"null")},
  get opening(){return JSON.parse(storage.get(OPENING)||"null")},
  get html(){return node("app").innerHTML},
  change(data,value){fire("change",{dataset:data,value})},
  click(action,data={}){fire("click",{closest:()=>({disabled:false,dataset:{action,...data}})})},
  flush(){let n=0;while(timers.length&&n++<50)timers.shift()()}};
}
const profiles=[
 {slot:"wang",name:"武磊",rating:72,academy:"崇明根宝足球基地",parent:"上海海港",
  stats:{pace:82,shoot:74,pass:64,dribble:74,defense:39,physical:72,mental:71}},
 {slot:"vini",name:"韦世豪",rating:69,academy:"山东鲁能泰山足球学校",parent:"山东泰山",
  stats:{pace:87,shoot:63,pass:61,dribble:71,defense:38,physical:68,mental:68}}
];
const h=harness();
for(const p of profiles){
 assert(h.core.findPerson(p.name,{roster:[]}),"verified roster must not depend on award candidates");
}
h.change({v10Person:"third"},"自定义队友");
h.change({v10Star:"wang"},"武磊");
h.change({v10Star:"vini"},"韦世豪");
assert.equal(h.opening.v10Countries.wang,"中国");
assert.equal(h.opening.v10Countries.vini,"中国");
assert.equal(h.opening.leagues.wang,"CHN");
assert.equal(h.opening.leagues.vini,"CHN");
h.click("v10Next");h.click("v10Next");
assert.match(h.html,/崇明根宝足球基地/);
h.click("flipOpeningCard",{id:"wang",i:"0"});h.flush();
assert.equal(h.opening.drawn.wang,"上海海港");
assert.match(h.html,/山东鲁能泰山足球学校/);
h.click("flipOpeningCard",{id:"vini",i:"0"});h.flush();
assert.equal(h.opening.drawn.vini,"山东泰山");
h.click("trioOpening");h.flush();
assert(h.saved,"the three-player career must be created");
for(const p of profiles){
 const saved=h.saved.duoGames[p.slot].player;
 assert.equal(saved.name,p.name);assert.equal(saved.actualCountry,"中国");
 assert.equal(saved.country,"中国");assert.equal(saved.sourceRating,p.rating);
 assert.equal(saved.academyInstitution,p.academy);
 assert.equal(saved.academyParentClub,p.parent);
 assert.equal(saved.club,p.parent+"青训");
 assert.equal(saved.age,16);
 assert.equal(saved.youth,true);
 assert.match(saved.sourceReference,/FC 25/);
 for(const [key,value]of Object.entries(p.stats)){
  assert.equal(saved.academyReferenceStats[key],value,"adult historic "+p.name+" "+key);
  assert(saved.stats[key]<value,"youth game rebase "+p.name+" "+key);
 }
}
const out=[];
for(let i=0;i<3;i++){
 h.click("trioSeason");h.flush();
 const saved=h.saved;
 assert(saved&&saved.duoGames&&saved.duoGames.third,"all three career slots are present");
 const season={year:saved.duoGames.wang.year,players:[]};
 for(const p of profiles){
  const game=saved.duoGames[p.slot],actor=game.player;
  assert.equal(actor.age,16+i);
  assert.equal(actor.academyInstitution,p.academy);
  assert.equal(game.season.stage,"review");
  if(i<2){assert(actor.youth);assert.equal(actor.club,p.parent+"青训")}
  else {assert.equal(actor.youth,false);assert.equal(actor.club,p.parent);
   for(const [key,value]of Object.entries(p.stats))assert(actor.stats[key]>=value,"graduation "+p.name+" "+key);}
  season.players.push({name:actor.name,age:actor.age,club:actor.club,kind:actor.youth?"青训":"一线队",
   apps:game.season.apps,goals:game.season.goals,assists:game.season.assists,overallReference:actor.sourceRating});
 }
 out.push(season);
}
const reload=harness([...h.storage]);
for(const p of profiles)assert.equal(reload.saved.duoGames[p.slot].player.academyInstitution,p.academy);
console.log("✓ 实名国足球员：源数据、16岁青训、18岁毕业、三人共用赛季及刷新读档通过");
console.log("CHINA_VERIFIED_SIMULATION="+JSON.stringify(out));
