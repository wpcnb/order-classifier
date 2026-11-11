"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110";
const source=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__test={duo:()=>duoGames,nextSeason,save};})();');
function harness(data,failBackup=false){
 const storage=new Map(data||[]),nodes={},handlers={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn}});
 const context={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{get length(){return storage.size},key:i=>[...storage.keys()][i]||null,getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(failBackup&&k.includes("-before-auto-retirement"))throw Error("quota");storage.set(k,String(v))},removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
 vm.runInNewContext(source,context,{filename:"game.js"});
 return {api:context.window.__test,storage,get html(){return node("app").innerHTML},click(action,extras={}){handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},flush(){while(timers.length)timers.shift()()}};
}
function newGame(){const h=harness();h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();h.click("preset");return h;}
function toReview(h,ages){const d=h.api.duo();for(const [id,age] of Object.entries(ages)){const x=d[id],p=x.player;p.age=age;p.youth=false;p.club=p.club.replace(/青训$/,"");p.academyParentClub=p.club;p.forcedMove=false;p.transferAssessment={maxTier:0};delete p.transferDraw;x.season.stage="review";}return d;}
{
 const h=newGame(),d=toReview(h,{wang:33,vini:38}),before={...d.wang.player.stats};h.api.nextSeason();
 assert.equal(d.wang.player.age,34);assert.equal(d.wang.player.stats.pace,before.pace);assert.equal(d.wang.player.stats.physical,before.physical);
 assert.equal(d.vini.player.age,39);assert.equal(d.vini.player.retired||false,false);
 console.log("✓ 35岁前不触发年龄扣减；39岁仍可参赛");
}
{
 const h=newGame(),d=toReview(h,{wang:34,vini:36});
 const before=Object.fromEntries(Object.entries(d).map(([id,x])=>[id,{...x.player.stats}]));
 h.api.nextSeason();
 assert.equal(d.wang.player.age,35);assert.equal(d.vini.player.age,37);
 for(const [id,n] of [["wang",2],["vini",3]]){assert.equal(d[id].player.stats.pace,before[id].pace-n);assert.equal(d[id].player.stats.physical,before[id].physical-n)}
 assert.equal(d.vini.player.stats.dribble,before.vini.dribble-1);assert(h.html.includes("本赛季年龄影响"));
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.equal(reload.api.duo().wang.player.agingImpact.pace,2);
 console.log("✓ 35/37 岁进入新赛季时明确衰退并保存");
}
{
 const h=newGame(),d=toReview(h,{wang:39,vini:32}),year=d.wang.year,club=d.wang.player.club;
 d.wang.history.push({year:year-1,club,goals:8});d.wang.honors.push({year:year-1,name:"测试冠军",type:"team"});
 d.wang.player.transferDraw={year,from:club,accepted:true,selected:{club:"不应转会",id:"ENG"}};
 h.api.nextSeason();
 assert.equal(d.wang.player.retired,true);assert.equal(d.wang.player.age,40);assert.equal(d.wang.player.club,club);
 assert.equal(d.wang.player.retiredAt.automatic,true);assert.equal(d.wang.retirementSummary.history.length,1);assert.equal(d.wang.retirementSummary.honors.length,1);
 assert.equal(d.wang.year,year+1);assert.equal(d.vini.year,year+1);assert.equal(d.vini.player.retired||false,false);assert.equal(d.vini.season.stage,"playing");
 assert(h.html.includes("年满40岁自动"));
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.equal(reload.api.duo().wang.player.retired,true);assert.equal(reload.api.duo().vini.season.stage,"playing");
 reload.click("simBoth");assert.equal(reload.api.duo().vini.season.stage,"review");
 console.log("✓ 单人40岁自动退役，跳过转会并保留履历；另一人读档后继续完整赛季");
}
{
 const h=newGame(),d=toReview(h,{wang:39,vini:39}),year=d.wang.year;
 h.api.nextSeason();
 assert(d.wang.player.retired&&d.vini.player.retired);assert.equal(d.wang.player.age,40);assert.equal(d.vini.player.age,40);
 assert.equal(d.wang.year,year+1);assert.equal(d.vini.year,year+1);
 const before=h.storage.get(SAVE);h.click("simBoth");assert.equal(h.storage.get(SAVE),before,"retired careers do not invent a new season or award");
 console.log("✓ 两人同时40岁退役后生涯结束，不产生虚构新赛季");
}
{
 const h=newGame(),d=toReview(h,{wang:43,vini:31});h.api.nextSeason();
 assert.equal(d.wang.player.retired,true);assert.equal(d.wang.player.age,43);assert.equal(d.wang.retirementSummary.at.age,43);
 console.log("✓ 旧档中超过40岁的球员在赛季边界安全退役，不倒改年龄");
}
{
 const original=newGame(),data=JSON.parse(original.storage.get(SAVE)),player=data.duoGames.wang;
 player.player.age=42;player.player.youth=false;player.season.stage="playing";player.season.apps=2;player.season.goals=1;
 player.player.career.apps=2;player.player.career.goals=1;
 player.season.results=[{date:"2035-01-01",home:"上海申花",away:"北京国安",hs:1,as:0}];
 const raw=JSON.stringify(data),h=harness([[SAVE,raw]]),d=h.api.duo();
 assert.equal(d.wang.player.retired,true);assert.equal(d.wang.player.age,42);assert.equal(d.wang.retirementSummary.partialSeason.apps,2);
 assert.equal(d.wang.retirementSummary.partialSeason.results.length,1);assert.equal(d.wang.season.stage,"retired");
 assert.equal(d.vini.season.stage,"playing");assert.equal(h.storage.get(SAVE+"-before-auto-retirement"),raw);
 assert.equal(JSON.parse(h.storage.get(SAVE)).duoGames.wang.player.retired,true);
 h.click(null,{page:"career"});assert(h.html.includes("2场 1球 0助 · 未完赛季（退役）"));
 assert.equal(d.wang.player.career.apps,2);assert.equal(d.wang.player.career.goals,1);
 const reloaded=harness([[SAVE,h.storage.get(SAVE)]]);reloaded.click(null,{page:"career"});
 assert(reloaded.html.includes("2场 1球 0助 · 未完赛季（退役）"));
 assert.equal(reloaded.api.duo().wang.player.career.apps,2);assert.equal(reloaded.api.duo().wang.player.career.goals,1);
 h.click("simBoth");assert.equal(d.vini.season.stage,"review");
 console.log("✓ 导入满40岁的旧档立即退役，保留已踢比赛、可导出备份，另一人继续比赛");
 const blocked=harness([[SAVE,raw]],true);
 assert.equal(blocked.api.duo().wang.player.retired,true);assert.equal(blocked.storage.get(SAVE),raw);
 blocked.click("simBoth");assert.equal(blocked.storage.get(SAVE),raw,"backup failure must never overwrite the source save");
 console.log("✓ 浏览器空间不足时保留原始存档，不覆盖");
}
{
 const h=newGame(),d=h.api.duo(),x=d.wang;
 x.season.apps=3;x.season.goals=2;x.season.assists=1;
 x.season.results=[{kind:"league",played:true,goals:2,assists:1}];
 x.player.academyCareer={apps:3,goals:2,assists:1};
 h.click("retirePlayer",{id:"wang"});
 h.click(null,{page:"career"});
 assert(h.html.includes("青训 · "+x.player.club+" · 3场 2球 1助 · 未完赛季（退役）"));
 assert.equal(x.player.academyCareer.apps,3);assert.equal(x.player.academyCareer.goals,2);
 assert.equal(x.player.career.apps,0);assert.equal(x.player.career.goals,0);
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);reload.click(null,{page:"career"});
 assert(reload.html.includes("3场 2球 1助 · 未完赛季（退役）"));
 assert.equal(reload.api.duo().wang.player.academyCareer.goals,2);
 console.log("✓ 中途自主退役的青训履历可见且不重复计入成年生涯");
}
