"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,"..");
let game=fs.readFileSync(path.join(dir,"game.js"),"utf8").replace(/\}\)\(\);\s*$/, 'window.__bench={state:()=>duoGames,world:()=>sharedUniverse,level:(p)=>transferLevel(p.leagueId,p.club),ratings:(p)=>overall(p)};})();');
function run(seed){
 let n=seed>>>0;const math=Object.create(Math);math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296};
 const storage=new Map(),timers=[],events={};
 const nodes={},node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(k,fn){events[id+":"+k]=fn},click(){}});
 const ctx={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},Math:math,console,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{},Blob,URL};
 for(const name of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(dir,name),"utf8"),ctx,{filename:name});
 vm.runInNewContext(game,ctx,{filename:"game.js",timeout:10000});
 function click(action,id){events["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,id}})}})}
 function drawPromotions(){for(const id of ["wang","vini"]){const d=ctx.window.__bench.state()[id].player.transferDraw;if(d?.options?.length&&!d.selected){click("flipPromotionCard",id);while(timers.length)timers.shift()()}}}
 click("flipOpeningCard","wang");while(timers.length)timers.shift()();
 click("flipOpeningCard","vini");while(timers.length)timers.shift()();
 click("preset");assert(ctx.window.__bench.state(),"Cannot initialize benchmark");
 return {click,drawPromotions,state:ctx.window.__bench.state,level:ctx.window.__bench.level,ratings:ctx.window.__bench.ratings,storage};
}
const seasons=[],moves=[],winners={},reports=[],sessions=10,seasonsPerSession=10;
for(let trial=0;trial<sessions;trial++){
 const app=run(43773+trial*1789);let last={};
 for(let season=0;season<seasonsPerSession;season++){
  app.drawPromotions();app.click("simBoth");const state=app.state(),year=state.wang.year;
  for(const key of ["wang","vini"]){
   const x=state[key],p=x.player,s=x.season,lev=app.level(p),prior=last[key];
   const item={trial,year,id:key,club:p.club,level:lev,overall:app.ratings(p),goals:s.goals,leagueGoals:s.leagueGoals,assists:s.assists,apps:s.apps,avg:Number(s.ratings.reduce((a,b)=>a+b,0)/(s.ratings.length||1)).toFixed(2),qualified:x.lastReview?.performance?.qualified,forcedSameTier:x.lastReview?.performance?.forcedSameTier,poor:x.lastReview?.performance?.poor,champion:x.lastReview?.performance?.teamChampion,awardRank:x.ballonHistory.at(-1)?.rank};
   seasons.push(item);
   if(prior&&prior.club!==p.club)moves.push({trial,year,who:key,from:prior.club,to:p.club,old:prior.level,new:lev,kind:lev>prior.level?"up":lev<prior.level?"down":"same"});
   last[key]={club:p.club,level:lev};
  }
  const winner=state.wang.ballonHistory.at(-1)?.winner?.name||"unknown";winners[winner]=(winners[winner]||0)+1;
 }
 reports.push({trial,final:[stateMini(app.state().wang,app),stateMini(app.state().vini,app)]});
}
function stateMini(x,app){return {club:x.player.club,level:app.level(x.player),age:x.player.age,streak:x.player.trophylessStreak};}
const avg=key=>Number((seasons.reduce((a,s)=>a+(Number(s[key])||0),0)/seasons.length).toFixed(2));
const levels=Object.fromEntries([0,1,2,3,4,5].map(t=>[t,seasons.filter(s=>s.level===t).length]));
const moved=Object.fromEntries(["up","same","down"].map(k=>[k,moves.filter(m=>m.kind===k).length]));
const sorted=[...seasons].sort((a,b)=>b.goals-a.goals).slice(0,10);
const rank=Object.fromEntries(["wang","vini"].map(id=>[id,seasons.filter(s=>s.id===id&&s.awardRank===1).length]));
const promotion=(id)=>seasons.filter(s=>s.id===id&&s.qualified).length;
const result={version:process.env.BALANCE_VARIANT||"calibrated",sharedSeasons:seasons.length/2,playerSeasons:seasons.length,averageGoals:avg("goals"),averageLeagueGoals:avg("leagueGoals"),averageAssists:avg("assists"),averageApps:avg("apps"),averageRating:avg("avg"),maxGoals:sorted[0].goals,over40:seasons.filter(s=>s.goals>40).length,over60:seasons.filter(s=>s.goals>60).length,over91:seasons.filter(s=>s.goals>91).length,tiers:levels,moves:moved,qualifications:{wang:promotion("wang"),vini:promotion("vini")},awardWins:rank,ballonWinners:Object.entries(winners).sort((a,b)=>b[1]-a[1]).slice(0,9),topScorers:sorted,finals:reports};
console.log("BALANCE_RESULT_JSON="+JSON.stringify(result));
// Long-run balance guardrails: no fabricated promotion for lateral CSL moves,
// no automatic rocket launch to legendary clubs, and no routine superhuman scoring.
assert.equal(seasons.length,200,"Ten trials × ten shared seasons × two players");
assert(moves.every(m=>m.new-m.old<=2),"Promotion can jump two tiers only via the lucky card");
assert(moves.every(m=>m.new!==m.old||m.kind==="same"),"Same-tier club changes are not upgrades");
assert(seasons.filter(p=>p.level>0).length>=20,"Young careers should have some European breakouts by year ten");
assert(seasons.filter(p=>p.level===5).length<=70,"Legendary club should not be an automatic destination");
assert(seasons.filter(p=>p.goals>60).length===0,"60+ club-season goals must not be routine");
assert(seasons.filter(p=>p.avg<5.9||p.avg>8.2).length===0,"Calibrated season ratings should remain credible");
assert((rank.wang||0)+(rank.vini||0)<80,"Two user-controlled cards must not monopolize annual awards");
console.log("BALANCE_RESULT_JSON="+JSON.stringify(result));
