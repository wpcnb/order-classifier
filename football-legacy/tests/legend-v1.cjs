"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const G=require("../legend-v1.js");
function player(position="ST",name="前锋"){
 return {name,position,club:"北方城",age:25,contract:3,career:{goals:0,assists:0},stats:{pace:80},
  legendProfile:{version:1,discipline:65,ambition:75,composure:60,loyalty:70,peakShift:0,goodStreak:0,badStreak:0}};
}
{
 const p=player();const prev={...p};const s=G.ensure(p);
 assert.equal(s,G.ensure(p));assert.equal(p.name,prev.name);assert.equal(p.age,prev.age);
 const legacy={position:"LW",age:27,career:{goals:12}};G.ensure(legacy);
 assert.equal(legacy.age,27);assert.equal(legacy.career.goals,12);
 assert.equal(legacy.legendProfile.version,1);
 console.log("PASS existing player data and legacy saves preserved");
}
{
 assert.equal(G.declineAge(player("GK")),37);
 assert.equal(G.declineAge(player("ST")),35);
 assert.equal(G.declineAge(player("LW")),35);
 for(const role of ["GK","CB","CDM","CM","CAM","ST","LW","RW"]){
  for(const shift of [-1,0,1]){const p=player(role);p.legendProfile.peakShift=shift;
   assert(G.declineAge(p)>=35,`${role} with shift ${shift} must not decline before 35`);
  }
 }
 assert.equal(G.growthAge(player("GK")),28);
 assert.equal(G.growthAge(player("LW")),23);
 console.log("PASS position-sensitive peak and decline");
}
{
 const p=player("CAM");p.parentCoach={formation:"4-2-3-1"};
 assert(G.tacticalShift(p,"attack")>G.tacticalShift(p,"defend"));
 assert(G.tacticalShift(p,"balanced")>0);
 console.log("PASS tactical fit and match choices");
}
{
 const underdog=G.volatility(30,()=>0);
 assert(underdog.shock&&underdog.away>1);
 const surprise=G.volatility(-30,()=>0);
 assert(surprise.shock&&surprise.home>1);
 assert.equal(G.volatility(30,()=>1).shock,false);
 assert.equal(G.volatility(2,()=>0).shock,false);
 console.log("PASS controlled underdog surprises");
}
{
 const p=player();
 G.afterMatch(p,true,8.3,2,0,()=>.5);
 assert(p.seasonForm>0&&p.legendProfile.goodStreak===1);
 p.seasonForm=0;
 G.afterMatch(p,true,5,0,2,()=>.5);
 assert(p.seasonForm<0&&p.legendProfile.badStreak===1);
 const v=p.seasonForm;G.afterMatch(p,false,0,0,0,()=>.5);
 assert(p.seasonForm<v);
 assert(p.seasonForm>=-.9&&p.seasonForm<=.9);
 console.log("PASS game-to-game form and streaks");
}
{
 const p=player();assert(G.salaryMultiplier(p)>.85&&G.salaryMultiplier(p)<1.2);
 assert(G.highlight(p,{played:true,hs:3,as:0,home:p.club,away:"南方城",goals:3,assists:0,rating:9},95,88).includes("帽子戏法"));
 const red=G.highlight(p,{played:true,hs:0,as:0,home:p.club,away:"南方城",goals:0,assists:0,rating:6,redCard:"direct"},80,80);
 assert(red.includes("因红牌被罚下")&&!red.includes("改变"),"red-card news should only state the recorded dismissal");
 const g={player:p,history:[{club:p.club,rank:1},{club:p.club,rank:1},{club:p.club,rank:1}]};
 assert(G.dynasty(g).includes("王朝"));
 p.career.goals=330;g.honors=Array.from({length:6},()=>({type:"team",name:"联赛冠军"}));
 assert.equal(G.historicalStatus(g),"世界级传奇");
 console.log("PASS wages, highlights, dynasties and career status");
}
{
 const a=player("ST","<script>");const b=player("GK","守门员");
 const html=G.overview({wang:{player:a,year:2030,history:[],honors:[]},vini:{player:b,year:2030,history:[],honors:[]}},null);
 assert(html.includes("绿茵传奇"));
 assert(!html.includes("<script>"));
 assert(html.includes("&lt;script&gt;"));
 console.log("PASS dashboard presentation and escaped names");
}
{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const game=fs.readFileSync(path.join(root,"game.js"),"utf8");
 assert(html.includes("绿茵传奇 v2.0.0"));
 assert(html.indexOf("./legend-v1.js?v=2.0.0")>=0);
 assert(html.indexOf("./legend-v1.js?v=2.0.0")<html.indexOf("./game.js?v=2.0.0"));
 for(const f of ["GL.volatility(","GL.tacticalShift(","GL.afterMatch(","GL.overview(","GL.declineAge("])
  assert(game.includes(f),"Missing wired mechanic: "+f);
 console.log("PASS live game script ordering and engine integration");
}
console.log("PASS Green Legend v1.0.0 module");
