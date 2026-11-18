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
test("awards are not read or required by market value",()=>{
 const star=p("ST");
 const baseline=M.marketValue(star,94,5,season);
 assert.equal(baseline,M.marketValue({...star,ballonHistory:[{rank:1}],honors:[{name:"金球奖"}]},94,5,season));
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
