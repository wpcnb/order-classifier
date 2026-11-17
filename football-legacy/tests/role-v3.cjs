const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const roles = require("../role-v3.js");
const base = path.join(__dirname, "..");
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(base,"career-depth.js"),"utf8"),context);
const career=context.window.CareerDepth;
const gate={apps:19,avg:6.94,ov:78,g:6,a:5,sum:11};
const sample={apps:27,avg:7.35,goals:0,assists:0,cleanSheets:9,matchesWithScore:27,goalsAgainst:21};
test("门将、后卫、后腰、中场零进球也可满足升档条件",()=>{
 for(const position of ["GK","CB","CDM","CM"])
  assert.equal(roles.evaluate({position},sample,gate,85,2).qualified,true,position);
});
test("前腰根据组织输出或优异评分及合理参与度判断",()=>{
 assert.equal(roles.evaluate({position:"CAM"},sample,gate,85,2).qualified,false);
 assert.equal(roles.evaluate({position:"CAM"},{...sample,assists:8},gate,85,2).qualified,true);
});
test("中锋在同样零贡献时不能直接升级",()=>{
 assert.equal(roles.evaluate({position:"ST"},sample,gate,85,2).qualified,false);
});
test("缺勤和正常老化不会被标记为职业低谷",()=>{
 assert.equal(roles.evaluate({position:"GK",age:25},{...sample,apps:12,avg:5.8},gate,85,2).poor,false);
 assert.equal(roles.evaluate({position:"GK",age:36},{...sample,avg:5.8},gate,85,2).poor,false);
});
test("健康赛季长期评分不足可触发低谷",()=>{
 assert.equal(roles.evaluate({position:"GK",age:25},{...sample,avg:5.8},gate,85,2).poor,true);
});
test("未获奖的优秀球员也能达到一两亿欧元身价",()=>{
 const p={age:25,club:"皇家马德里",position:"GK",injuryHistory:0};
 const s={apps:30,ratings:Array(30).fill(7.4),goals:0,assists:0};
 const value=career.marketValue(p,95,5,s);
 assert(value>100000000);
 assert(career.marketValue({...p,position:"CM"},97,5,s)>200000000);
 assert(career.marketValue({...p,age:36},95,5,s)<value);
});
test("门将目标不使用进球与助攻",()=>{
 const goals=career.objectiveTargets({age:25,club:"皇马",position:"GK"},2030,4,{apps:30,ratings:Array(30).fill(7.4)});
 assert(goals.every(goal=>!goal.label.includes("进球")&&!goal.label.includes("助攻")));
});
test("一键推进不因决赛或交锋强制暂停",()=>{
 const source=fs.readFileSync(path.join(base,"game.js"),"utf8");
 assert(!source.includes("if(critical&&v3Allowed!==date){v3Paused=critical;break}"));
 assert(source.includes("runSharedDay(date,focusDate===date?activeDuo:null,focusChoice)"));
 assert(source.includes("RV3.evaluate(p,n,gate,ov,tier)"));
});
