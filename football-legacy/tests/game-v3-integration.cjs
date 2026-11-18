const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const dir=path.join(__dirname,"..");
const sources=["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js",
 "body-path.js","market-v3.js","career-depth.js","role-v3.js","transfer-v3.js",
 "free-star.js","v10-core.js","v10-ui.js","legend-v1.js","legend-v3.js","game.js"];
function harness(){
 const storage=new Map(),nodes={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(){},click(){}});
 const context={document:{getElementById:node,querySelector:()=>null,
   createElement:()=>({click(){},remove(){},style:{}}),body:{appendChild(){}}},
   localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
   confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},
   Blob,URL,console};
 context.window=context;
 context.addEventListener=()=>{};
 for(const file of sources){
  let src=fs.readFileSync(path.join(dir,file),"utf8");
  if(file==="game.js")src=src.replace(/\}\)\(\);\s*$/,
   'window.__test3={set(world){duoGames=world;sharedUniverse={rounds:{},europeCompetitions:{},awards:{},offseasonYears:[],npcOffseasonYears:[]};g=world.wang;activeDuo="wang"},guidedTransferDecisions,ensurePromotionDraw,seasonPerformance,clubSeasonNumbers};})();');
  vm.runInNewContext(src,context,{filename:file,timeout:7000});
 }
 return context.__test3;
}
function player(name,position,mode="guided"){
 return {name,position,club:"成都蓉城",leagueId:"CHN",age:27,stamina:60,
  careerOperationMode:mode,transferHistory:[],
  stats:{pace:75,shoot:40,pass:81,dribble:70,defense:84,physical:81,mental:83},
  coachTrust:70,contract:2,potential:90,career:{apps:400,goals:0,assists:0},fame:50};
}
function makeWorld(mode="guided",year=2037){
 return Object.fromEntries([["wang","测试门将","GK"],["vini","测试后卫","CB"]].map(([id,name,pos])=>
  [id,{year,player:player(name,pos,mode),
    season:{stage:"review",apps:30,results:[],leagueTable:{},events:[],index:0,ratings:[]},
    history:[{year:2028,age:18,club:"成都蓉城"}],
    logs:[],honors:[],npcs:[],offers:[]}]));
}
test("真实游戏核心：轻松模式留队多年后自动同级流动并写入转会历史",()=>{
 const app=harness(),world=makeWorld();app.set(world);
 const results=app.guidedTransferDecisions();
 assert.equal(results.length,2);
 for(const id of ["wang","vini"]){
  assert.notEqual(world[id].player.club,"成都蓉城");
  assert.equal(world[id].player.transferHistory.length,1);
  assert.equal(world[id].player.transferHistory[0].from,"成都蓉城");
 }
 assert.equal(app.guidedTransferDecisions().length,0,"同一年度不可重复转会");
});
test("真实游戏核心：深度模式不自动改变球员俱乐部",()=>{
 const app=harness(),world=makeWorld("deep");app.set(world);
 assert.equal(app.guidedTransferDecisions().length,0);
 for(const id of ["wang","vini"])assert.equal(world[id].player.club,"成都蓉城");
});
test("真实游戏核心：引导生涯自动抽10张升档卡，保留9＋1",()=>{
 const app=harness(),world=makeWorld();app.set(world);
 world.wang.player.transferAssessment={maxTier:1};
 world.vini.player.transferAssessment={maxTier:1};
 const changes=app.guidedTransferDecisions();
 assert.equal(changes.length,2);
 for(const id of ["wang","vini"]){
  const draw=world[id].player.transferDraw;
  assert.equal(draw.options.length,10);
  assert.equal(draw.options.filter(o=>o.tier===1).length,9);
  assert.equal(draw.options.filter(o=>o.tier===2).length,1);
  assert(draw.accepted&&draw.selected);
 }
});
test("真实游戏核心：二十年模拟结算流程至少实际转会两次",()=>{
 const app=harness(),world=makeWorld("guided",2029);app.set(world);
 let moves=0;
 for(let year=2029;year<2049;year++){
  for(const id of ["wang","vini"]){world[id].year=year;world[id].player.age=19+year-2029}
  moves+=app.guidedTransferDecisions().filter(x=>x.type==="lateral").length;
 }
 assert(moves>=2,"20 seasons must offer multiple successful career moves");
});
