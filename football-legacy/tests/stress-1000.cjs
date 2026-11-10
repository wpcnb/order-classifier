"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,"..");
let game=fs.readFileSync(path.join(dir,"game.js"),"utf8").replace(/\}\)\(\);\s*$/, 'window.__bench={state:()=>duoGames,world:()=>sharedUniverse,level:(p)=>transferLevel(p.leagueId,p.club),ratings:(p)=>overall(p)};})();');
function run(seed){
 let n=seed>>>0;const math=Object.create(Math);math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296};
 const storage=new Map(),timers=[],events={};
 const nodes={},node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(k,fn){events[id+":"+k]=fn},click(){}});
 const ctx={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},Math:math,console,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{},Blob,URL};
 for(const name of ["real-footballers.js","uefa2026.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(dir,name),"utf8"),ctx,{filename:name});
 vm.runInNewContext(game,ctx,{filename:"game.js",timeout:10000});
 function click(action,id){events["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,id}})}})}
 function drawPromotions(){for(const id of ["wang","vini"]){const d=ctx.window.__bench.state()[id].player.transferDraw;if(d?.options?.length&&!d.selected){click("spinPromotion",id);while(timers.length)timers.shift()()}}}
 click("spinClub","wang");while(timers.length)timers.shift()();
 click("spinClub","vini");while(timers.length)timers.shift()();
 click("preset");assert(ctx.window.__bench.state(),"Cannot initialize benchmark");
 return {click,drawPromotions,state:ctx.window.__bench.state,level:ctx.window.__bench.level,ratings:ctx.window.__bench.ratings,storage};
}

const shard=Number(process.env.STRESS_SHARD||0),runs=Number(process.env.STRESS_RUNS||50),years=Number(process.env.STRESS_YEARS||10);
assert(Number.isInteger(shard)&&shard>=0&&Number.isInteger(runs)&&runs>0&&Number.isInteger(years)&&years>=2);
const keys=["wang","vini"];
const initial=()=>Array(years).fill(0);
const buckets=()=>Array(6).fill(0);
const summary={
 shard,runs,years,completedRuns:0,completedSeasons:0,playerSeasons:0,exceptions:[],
 byTier:buckets(),byYearTier:Array.from({length:years},buckets),
 goals:{sum:0,max:0,over30:0,over40:0,over50:0,over60:0,over91:0,buckets:[0,0,0,0,0,0,0,0]},
 assists:{sum:0,max:0,over30:0,over40:0},ratings:{sum:0,below6:0,above8:0},
 apps:{sum:0,zero:0},ov:{sum:0,max:0},moves:{up:0,down:0,same:0,skips:0,sameCSL:0,fromTo:{},reasons:{},yearCount:initial()}, 
 draws:{up:0,down:0,missingOptions:0,unexpected:0},
 trophy:{team:0,league:0,cup:0,europe:0,national:0,ballon:0,noneBoth:0,all:0,byYear:initial()},
 trophyless:{forcedSameTier:0,unresolved:0,streak2:0}, 
 awards:{wang:0,vini:0,other:0,winners:{},byYear:Array.from({length:years},()=>({wang:0,vini:0,other:0}))},
 milestones:{firstEurope:initial(),firstLegendary:initial(),neverEurope:0,neverLegendary:0,finalTiers:buckets()},
 integrity:{yearDesync:0,stageIncomplete:0,leagueTableMismatch:0,duplicateBallon:0,invalidGoalShare:0,missingAwards:0,wrongDrawDestination:0,failedSeasonAdvance:0,duplicateClub:0},
 storage:{sum:0,max:0,over1MB:0,over3MB:0,over5MB:0,byYearMax:initial()},
 perf:{millis:0}
};
function inc(obj,key){obj[key]=(obj[key]||0)+1}
function recordException(trial,season,e){if(summary.exceptions.length<12)summary.exceptions.push({trial,season,message:String(e.stack||e).slice(0,300)})}
const clock=Date.now();
for(let trial=0;trial<runs;trial++){
 let app,firstEurope={},firstLegendary={},lastTitles={wang:0,vini:0},before;
 try{app=run(100927+((shard*runs+trial)*1789));}
 catch(e){recordException(trial,-1,e);continue}
 let ok=true;
 for(let season=0;season<years;season++){
  try{
   const oldState=app.state(),oldYear=oldState.wang.year;
   const beforeClubs=Object.fromEntries(keys.map(id=>[id,{club:oldState[id].player.club,level:app.level(oldState[id].player),transferCount:oldState[id].player.transferHistory?.length||0,draw:oldState[id].player.transferDraw}]));
   for(const id of keys){
    const d=oldState[id].player.transferDraw;
    if(d?.options?.length&&!d.selected){inc(summary.draws,d.direction==="down"?"down":"up");if(d.options.some(o=>app.level({leagueId:o.id,club:o.club})!==d.level))summary.draws.unexpected++}
    if((oldState[id].player.forcedMove||oldState[id].player.transferAssessment?.maxTier>beforeClubs[id].level)&&!d?.options?.length&&oldState[id].season.stage==="review")summary.draws.missingOptions++;
   }
   app.drawPromotions();
   const chosen=Object.fromEntries(keys.map(id=>[id,app.state()[id].player.transferDraw?.selected?.club||null]));
   app.click("simBoth");
   const state=app.state(),y=state.wang.year;
   if(state.wang.year!==state.vini.year)summary.integrity.yearDesync++;
   if(y!==2026+season){summary.integrity.failedSeasonAdvance++;throw Error("Expected "+(2026+season)+" got "+y)}
   if(state.wang.season.stage!=="review"||state.vini.season.stage!=="review")summary.integrity.stageIncomplete++;
   summary.completedSeasons++;
   let anyTeamTitle=false;
   for(const id of keys){
    const x=state[id],p=x.player,s=x.season,lv=app.level(p),prior=beforeClubs[id];
    if(season===0&&id==="vini"&&p.club===state.wang.player.club)summary.integrity.duplicateClub++;
    if(!Number.isInteger(lv)||lv<0||lv>=6)throw Error("Invalid tier "+lv);
    summary.byTier[lv]++;summary.byYearTier[season][lv]++;
    summary.milestones.finalTiers[lv]+=(season===years-1?1:0);
    if(lv>0&&firstEurope[id]===undefined){firstEurope[id]=season;summary.milestones.firstEurope[season]++}
    if(lv===5&&firstLegendary[id]===undefined){firstLegendary[id]=season;summary.milestones.firstLegendary[season]++}
    const g=s.goals||0,a=s.assists||0,apps=s.apps||0,ov=app.ratings(p);
    const rating=s.ratings?.length?s.ratings.reduce((u,v)=>u+v,0)/s.ratings.length:0;
    summary.playerSeasons++;summary.goals.sum+=g;summary.assists.sum+=a;summary.apps.sum+=apps;summary.ov.sum+=ov;summary.ratings.sum+=rating;
    summary.goals.max=Math.max(summary.goals.max,g);summary.assists.max=Math.max(summary.assists.max,a);summary.ov.max=Math.max(summary.ov.max,ov);
    for(const [label,t] of [["over30",30],["over40",40],["over50",50],["over60",60],["over91",91]])if(g>t)summary.goals[label]++;
    if(a>30)summary.assists.over30++;if(a>40)summary.assists.over40++;
    if(apps===0)summary.apps.zero++;
    if(rating<6)summary.ratings.below6++;if(rating>8)summary.ratings.above8++;
    const n=g<5?0:g<10?1:g<15?2:g<20?3:g<25?4:g<30?5:g<40?6:7;summary.goals.buckets[n]++;
    const honors=x.honors.filter(h=>h.year===y&&h.generation===x.generation),team=honors.filter(h=>h.type==="team"&&h.name.includes("冠军"));
    if(team.length)anyTeamTitle=true;
    for(const h of honors){summary.trophy.all++;if(h.type==="team"){summary.trophy.team++;if(h.name.includes("欧冠")||h.name.includes("欧联"))summary.trophy.europe++;else if(/杯赛|足协杯|国王杯|足总杯|德国杯|意大利杯|法国杯|杯冠军/.test(h.name))summary.trophy.cup++;else summary.trophy.league++}else if(h.type==="national"&&h.name.includes("冠军"))summary.trophy.national++}
    summary.trophy.byYear[season]+=team.length;
    if(x.lastReview?.performance?.forcedSameTier)summary.trophyless.forcedSameTier++;
    if((p.trophylessStreak||0)>=2)summary.trophyless.streak2++;
    if(x.season.results?.filter(m=>m.kind==="league"&&m.played).some(m=>(m.goals||0)+(m.assists||0)>(m.home===p.club?m.hs:m.as)))summary.integrity.invalidGoalShare++;
    if(season>0&&prior.club!==p.club){
      const diff=lv-prior.level,kind=diff>0?"up":diff<0?"down":"same";
      summary.moves[kind]++;summary.moves.yearCount[season]++;
      if(diff>1)summary.moves.skips++;
      if(diff===0&&lv===0)summary.moves.sameCSL++;
      inc(summary.moves.fromTo,prior.level+"->"+lv);
      const reason=p.transferHistory?.at(-1)?.reason||"unknown";inc(summary.moves.reasons,reason);
      if(chosen[id]&&p.club!==chosen[id])summary.integrity.wrongDrawDestination++;
    }
    if(season>0&&prior.club===p.club&&oldState[id].player.forcedSameTier)summary.trophyless.unresolved++;
   }
   if(!anyTeamTitle)summary.trophy.noneBoth++;
   if(state.wang.player.leagueId===state.vini.player.leagueId){
    if(JSON.stringify(state.wang.season.leagueTable)!==JSON.stringify(state.vini.season.leagueTable))summary.integrity.leagueTableMismatch++;
   }
   const winner=state.wang.ballonHistory?.at(-1)?.winner?.name;const winnerB=state.vini.ballonHistory?.at(-1)?.winner?.name;
   if(!winner)summary.integrity.missingAwards++;
   if(winner!==winnerB)summary.integrity.duplicateBallon++;
   const type=winner===state.wang.player.name?"wang":winner===state.vini.player.name?"vini":"other";
   summary.awards[type]++;summary.awards.byYear[season][type]++;
   inc(summary.awards.winners,winner||"unknown");
   const payload=[...app.storage.entries()].find(([k])=>k.startsWith("football-dynasty-duo-v2-"))?.[1]||"";
   const bytes=Buffer.byteLength(payload,"utf8");
   summary.storage.sum+=bytes;summary.storage.max=Math.max(bytes,summary.storage.max);summary.storage.byYearMax[season]=Math.max(summary.storage.byYearMax[season],bytes);
   if(bytes>1e6)summary.storage.over1MB++;if(bytes>3e6)summary.storage.over3MB++;if(bytes>5e6)summary.storage.over5MB++;
  }catch(e){recordException(trial,season,e);ok=false;break}
 }
 if(ok){summary.completedRuns++;for(const id of keys){if(firstEurope[id]===undefined)summary.milestones.neverEurope++;if(firstLegendary[id]===undefined)summary.milestones.neverLegendary++}}
 if((trial+1)%10===0)console.error("Shard "+shard+" completed "+(trial+1)+"/"+runs+" games");
}
summary.perf.millis=Date.now()-clock;
console.log("STRESS_1000_JSON="+JSON.stringify(summary));
