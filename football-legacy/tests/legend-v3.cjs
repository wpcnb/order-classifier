const test = require("node:test");
const assert = require("node:assert/strict");
const V3 = require("../legend-v3.js");
const mk=(club,country)=>({year:2030,player:{club,country,career:{apps:100,goals:12,assists:4},retired:false},honors:[],ballonHistory:[],history:[],season:{stage:"playing",index:0,events:[],results:[],uefa:{type:"欧冠"}}});
const world=()=>({wang:mk("皇家马德里","中国"),vini:mk("巴塞罗那","巴西")});
test("欧冠决赛赛前暂停，半决赛不暂停",()=>{
 const x=world();x.wang.season.events=[{kind:"europeKO",stage:"决赛",date:"2030-05-30"}];
 assert(V3.criticalDay(x,"2030-05-30"));x.wang.season.events[0].stage="半决赛";
 assert.equal(V3.criticalDay(x,"2030-05-30"),null);
});
test("双人正面交锋只识别同一场比赛",()=>{
 const x=world(),match={kind:"league",stage:"常规赛",date:"2030-08-01",home:"皇家马德里",away:"巴塞罗那"};
 x.wang.season.events=[{...match}];x.vini.season.events=[{...match}];
 assert(V3.criticalDay(x,match.date).reasons.includes("双人正面交锋"));
 x.vini.season.events[0].away="塞维利亚";
 assert.equal(V3.criticalDay(x,match.date),null);
});
test("欧冠决赛失利属于遗憾，绝不扣分，不重复加分",()=>{
 const x=world();
 x.wang.season.results=[{kind:"europeKO",stage:"决赛",date:"2030-05-30",home:"皇家马德里",away:"巴塞罗那",hs:0,as:2}];
 V3.sync(x,{},[]);const score=V3.score(x.wang);
 assert.equal(score.penalty,0);assert(x.wang.player.legendV3.achievements.some(v=>v.id==="uclFinal"&&v.points===25));
 assert.equal(x.wang.player.legendV3.regrets.length,1);
 V3.sync(x,{},[]);assert.deepEqual(V3.score(x.wang),score);
});
test("世界杯决赛奖励与输球遗憾独立",()=>{
 const x=world();
 x.wang.season.results=[{kind:"national",stage:"决赛",date:"2030-07-15",competition:"世界杯",home:"中国",away:"巴西",hs:1,as:2}];
 V3.sync(x,{},[]);assert.equal(V3.score(x.wang).penalty,0);
 assert(x.wang.player.legendV3.achievements.some(v=>v.id==="worldFinal"&&v.points===50));
 assert.equal(x.wang.player.legendV3.regrets.length,1);
});
test("伤停不会触发低谷扣分，符合健康低谷才扣分",()=>{
 const x=world();x.wang.season.stage="review";x.wang.season.apps=25;x.wang.lastReview={avg:"6.2",performance:{poor:true,poorStreak:2}};
 x.wang.player.injuryMatches=2;V3.sync(x,{},[]);assert.equal(V3.score(x.wang).penalty,0);
 x.wang.player.injuryMatches=0;V3.sync(x,{},[]);assert.equal(V3.score(x.wang).penalty,-10);
});
test("成就不影响金球奖模型的数据结构",()=>{
 const x=world();x.wang.ballonHistory=[{year:2029,rank:4,playerPoints:71}];
 const before=structuredClone(x.wang.ballonHistory);
 x.wang.honors.push({year:2030,name:"欧冠冠军",type:"team"});
 V3.sync(x,{},[]);assert.deepEqual(x.wang.ballonHistory,before);
});
test("两人同队共同欧冠冠军双方得分且旧档自动初始化",()=>{
 const x=world();x.vini.player.club=x.wang.player.club;
 for(const v of Object.values(x))v.honors.push({year:2030,name:"欧冠冠军",type:"team"});
 V3.sync(x,{},[]);
 for(const v of Object.values(x)) assert(v.player.legendV3.achievements.some(a=>a.id==="duoUcl"));
});
test("共享比分只做一次战报",()=>{
 const x=world(),result={kind:"league",date:"2030-08-20",home:"皇家马德里",away:"巴塞罗那",hs:2,as:1};
 x.wang.season.results=[result];x.vini.season.results=[{...result}];
 assert.equal(V3.replay(x,result.date).length,1);
});