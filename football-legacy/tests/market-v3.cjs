const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../market-v3.js");
const season={apps:30,ratings:Array(30).fill(7.4),goals:0,assists:0};
const p=(position,age=25,extra={})=>({position,age,contract:3,injuryHistory:0,...extra});
test("position market hierarchy: elite GK < elite CB < elite CM < elite ST",()=>{
 const positions=["GK","CB","CM","ST"];
 const values=positions.map(pos=>M.marketValue(p(pos),95,5,season));
 assert(values.every((v,i)=>!i||v>values[i-1]));
 assert(values[0]>40000000&&values[0]<120000000);
 assert(values[3]>170000000);
});
test("non-award elite players can exceed €100m and €200m",()=>{
 assert(M.marketValue(p("CM"),95,5,season)>100000000);
 assert(M.marketValue(p("ST"),95,5,season)>200000000);
});
test("defender/goalkeeper value never requires goals or assists",()=>{
 for(const pos of ["GK","CB","CDM","CM"]){
  const zero=M.marketValue(p(pos),90,4,season);
  const goals=M.marketValue(p(pos),90,4,{...season,goals:25,assists:12});
  assert.equal(zero,goals,pos);
 }
});
test("verified annual award history raises value, but is never required for €100m",()=>{
 const star=p("ST");
 const baseline=M.marketValue(star,94,5,season);
 const career={year:2033,generation:1,ballonHistory:[
  {year:2032,generation:1,rank:1},{year:2033,generation:1,rank:1}],
  honors:[{year:2033,generation:1,name:"世界足球先生（FIFA The Best）"}]};
 const prestige=M.marketValue(star,94,5,season,career);
 assert(prestige>baseline,"golden ball and FIFA history should raise real player valuation");
 assert.equal(baseline,M.marketValue({...star,ballonHistory:[{rank:1}]},94,5,season),
  "unverified player-provided fake award fields are not accepted");
 assert(M.marketValue(p("CAM",23),85,4,
  {apps:34,ratings:Array(34).fill(7.65),goals:19,assists:15})>=100000000,
  "a breakout can cross €100m without winning any award");
});
test("contract, age, position, youth and performance affect value",()=>{
 const b=M.marketValue(p("CM"),90,4,season);
 assert(M.marketValue(p("CM",25,{contract:5}),90,4,season)>b);
 assert(M.marketValue(p("CM",36),90,4,season)<b);
 assert(M.marketValue(p("CM"),90,4,{...season,ratings:Array(30).fill(6.1)})<b);
 assert(M.marketValue(p("CM",25,{youth:true}),90,4,season)<b);
});
test("young prospect potential adds premium, older player's potential does not",()=>{
 const young=p("LW",20,{potential:96}),older=p("LW",28,{potential:96});
 assert(M.marketValue(young,84,4,season)>M.marketValue({...young,potential:84},84,4,season));
 assert.equal(M.marketValue(older,84,4,season),M.marketValue({...older,potential:84},84,4,season));
});
test("estimates are bounded and transparent",()=>{
 const v=M.details(p("ST"),99,5,season);
 assert(v.value<=300000000);
 assert(v.components.contract>0);
 assert(v.source.includes("不是德转实时"));
 assert.equal(M.marketValue(p("GK",25,{retired:true}),95,5,season),0);
});

test("a single elite season makes realistic €100m+ prospects in their early twenties",()=>{
 const rising=[
  ["CAM",23,85,{apps:34,ratings:Array(34).fill(7.65),goals:19,assists:15}],
  ["LW",22,83,{apps:34,ratings:Array(34).fill(7.65),goals:19,assists:15}],
  ["CM",23,85,{apps:34,ratings:Array(34).fill(7.8),goals:7,assists:17}]
 ];
 for(const [pos,age,ov,s] of rising){
  const v=M.details(p(pos,age),ov,4,s);
  assert(v.value>=100000000,pos+" broke out but remains below 100m");
  assert(v.components.breakoutBonus>25000000,"single-season breakout premium must be material");
 }
 const ordinary=M.marketValue(p("CAM",23),85,4,{apps:34,ratings:Array(34).fill(6.75),goals:3,assists:2});
 assert(ordinary<100000000,"ability alone should not make every 23-year-old worth 100m");
});
test("three Ballon d'Or awards lift a same-club player even outside top-five leagues",()=>{
 const star=p("ST",25),ordinary={apps:38,ratings:Array(38).fill(7.3),goals:21,assists:8};
 const years=[2032,2033,2034];
 const base=M.marketValue(star,90,0,ordinary);
 const career={year:2034,generation:1,ballonHistory:years.map(year=>({year,generation:1,rank:1}))};
 const valued=M.details(star,90,0,ordinary,career);
 assert(valued.value>=100000000);
 assert(valued.value>base);
 assert.equal(valued.awards.ballonDor,3);
 assert(valued.components.prestigeBonus>=30000000);
});
test("historical trophies are counted once per year and never from another generation",()=>{
 const star=p("CM",26),year=2032;
 const history={year,generation:2,
  ballonHistory:[{year:2031,generation:2,rank:1}],
  honors:[{year:2031,generation:2,name:"金球奖（法国足球规则）"},
          {year:2031,generation:2,name:"金球奖（法国足球规则）"},
          {year:2029,generation:1,name:"金球奖（法国足球规则）"}]};
 const valued=M.details(star,90,4,season,history);
 assert.equal(valued.awards.ballonDor,1);
 assert.equal(valued.awards.worldPlayer,0);
 assert(M.marketValue(star,90,4,season,history)>
  M.marketValue(star,90,4,season,{year,generation:2}));
});
test("prior season breakout carries into early next season, but fades with new results",()=>{
 const player=p("CAM",24),last={year:2034,generation:1,apps:34,goals:19,assists:15,average:"7.65"};
 const career={year:2035,generation:1,history:[last]};
 const day1=M.marketValue(player,85,4,{apps:0},career);
 const poor=M.marketValue(player,85,4,{apps:20,goals:0,assists:1,ratings:Array(20).fill(6.5)},career);
 assert(day1>poor,"old breakout must not disappear instantly, nor last all season");
 assert(day1>=100000000,"recent top season retains an early next-season premium");
});
test("value is zero after retirement and substantial award history ages down",()=>{
 const career={year:2038,generation:1,ballonHistory:[
  {year:2032,generation:1,rank:1},{year:2033,generation:1,rank:1}]};
 const prime=M.marketValue(p("CM",26),86,4,season,career);
 const veteran=M.marketValue(p("CM",35),86,4,season,career);
 assert(prime>veteran);
 assert.equal(M.marketValue(p("CM",36,{retired:true}),90,4,season,career),0);
});
