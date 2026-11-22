"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.resolve(__dirname,"_fixtures/legacy-engine.txt"),"utf8");
function extract(start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,"missing role engine section "+start);return source.slice(a,b)}
const code=extract("function roleAdjustedRating(","// Allocate actual team goals")+
 extract("function clubSeasonNumbers(","function generateOffers(");
const gate={g:4,a:4,sum:7,apps:14,avg:6.70,ov:0};
const context={Math,RV3:require(path.resolve(__dirname,"../role-v3.js")),C:(x,a,b)=>Math.max(a,Math.min(b,x)),overall:()=>85,transferLevel:()=>0,
 TRANSFER_GATES:[gate],TRANSFER_LEVELS:["中超","非五大普通","非五大豪门","五大普通","五大豪门","传奇"],g:null};
vm.createContext(context);vm.runInContext(code+";this.api={roleAdjustedRating,clubSeasonNumbers,transferQualified,seasonPerformance}",context);
const {api}=context;
function fixture(position,{clean=12,rating=7.4,goals=0,assists=0,apps=30,youth=false,scout=0,missing=0}={}){
 const club="甲队",p={name:"测试球员",position,club,leagueId:"CHN",youth,scoutingRoll:scout,points:0};
 const results=Array.from({length:apps},(_,i)=>({played:true,kind:"league",home:club,away:"乙队",hs:2,as:i<clean?0:1,
  goals:i<goals?1:0,assists:i<assists?1:0,rating}));
 for(let i=0;i<missing;i++)delete results[i].as;
 context.g={player:p,season:{results},honors:[],year:2030,generation:1};
 return api.seasonPerformance();
}
for(const role of ["CM","CDM","CB","LB","RB","GK"]){
 const good=fixture(role);assert.equal(good.cleanSheets,12);assert.equal(good.maxTier,1,role+" should qualify without goals when ratings and clean sheets are strong");
 assert.equal(fixture(role,{clean:1}).maxTier,1,role+" elite individual performance can qualify even without team clean sheets");
 assert.equal(fixture(role,{rating:6.0}).maxTier,0,role+" should not qualify with a poor rating");
 assert.equal(fixture(role,{apps:12}).maxTier,0,role+" should not qualify without adequate appearances");
 assert.equal(fixture(role,{scout:.99}).maxTier,0,role+" must still pass the original scouting chance");
 assert.equal(fixture(role,{youth:true}).maxTier,0,role+" must not skip youth");
 assert.equal(fixture(role,{missing:12}).maxTier,role==="CM"?1:0,role+" missing team score data must not create invented clean sheets; midfield is rated independently");
}
// For the existing two default left wingers, the old output and qualification
// rules remain identical at the boundary; the rating helper is a no-op.
assert.equal(fixture("LW",{goals:10,assists:6}).maxTier,1);
assert.equal(fixture("LW",{goals:9,assists:6}).maxTier,1);assert.equal(fixture("LW",{goals:1,assists:1}).maxTier,0);
assert.equal(fixture("LW",{goals:10,assists:6,scout:.99}).maxTier,0);
for(const against of [0,1,2,5])assert.equal(api.roleAdjustedRating(7.1,"LW",against),7.1);
assert(api.roleAdjustedRating(7.1,"GK",0)>7.1);assert(api.roleAdjustedRating(7.1,"CB",4)<7.1);
assert.equal(api.roleAdjustedRating(7.1,"GK",undefined),7.1);
vm.runInContext(extract("function transferCriteria(","function duoTransferPage(")+";this.criteria=transferCriteria",Object.assign(context,{E:String}));
const striker=context.criteria({position:"LW",youth:false},{},0);
assert(striker.includes("出场至少 13 场")&&striker.includes("前锋/边锋：进球、助攻、出场与评分"));
const keeper=context.criteria({position:"GK",youth:false},{matchesWithScore:30},0);
assert(keeper.includes("门将：扑救成功率")&&keeper.includes("球探评估"));
console.log("✓ Role promotion uses simulated results and ratings, retains scouting and existing LW rules, and handles missing historical scores");
