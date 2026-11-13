"use strict";
/* Reproducible paired counterfactual: 100 actual career seasons, identical
   nominated player stats and 100 simulated jurors for both historic formulas.
   The v6 score is reproduced from commit a9d9d1d240 (2026-11-11);
   yearly candidate pools come from the v8 game engine. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(dir,f),"utf8");
let src=read("game.js");
const anchor=" nominees.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));";
assert(src.includes(anchor),"nominee insertion point absent");
src=src.replace(anchor,`
 window.__abSamples.push({year,candidates:nominees.map(n=>({
  id:n.id,name:n.name,club:n.club,goals:n.goals,assists:n.assists,apps:n.apps,ov:n.ov,
  rating:n.rating,quality:awardLeagueTier(n.club),v7TitleBonus:n.teamBonus,
  v6Titles:n.id.startsWith("DUO_")?duoGames[n.id.slice(4)].honors.filter(h=>h.year===year&&h.type==="team").length:
   Object.entries(sharedUniverse?.rounds||{}).filter(([k])=>k.startsWith(year+":")).some(([,v])=>v.table&&sortedTable(v.table)[0]?.name===n.club)?1:0
 }))});
`+anchor);
src=src.replace(/\}\)\(\);\s*$/,'window.__ab={duo:()=>duoGames,awards:()=>sharedUniverse.awards};})();');
function rng(seed){let n=seed>>>0;return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296}}
function run(seed){
 const random=rng(seed),math=Object.create(Math);math.random=random;
 const storage=new Map(),events={},timers=[],nodes={},node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(k,fn){(events[id+":"+k]||(events[id+":"+k]=[])).push(fn)},click(){}});
 const w={__abSamples:[]},ctx={window:w,document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},Math:math,console,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL};
 for(const f of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","career-depth.js","free-star.js"])vm.runInNewContext(read(f),ctx,{filename:f,timeout:12000});
 vm.runInNewContext(src,ctx,{filename:"game.js",timeout:12000});
 const click=(action,id,i=0)=>events["app:click"][0]({target:{closest:()=>({disabled:false,dataset:{action,id,i}})}});
 const flush=()=>{let i=0;while(timers.length&&i++<300)timers.shift()()};
 click("flipOpeningCard","wang");flush();click("flipOpeningCard","vini");flush();click("preset");
 assert(w.__ab.duo(),"failed to start career");
 for(let k=0;k<10;k++){
  for(const id of ["wang","vini"]){
   const x=w.__ab.duo()[id],d=x.player.transferDraw;
   if(d?.options?.length&&!d.accepted&&!d.declined){if(!d.selected){click("flipPromotionCard",id);flush()}click("acceptDraw",id)}
  }
  click("simBoth");
  const pair=w.__ab.duo();assert.equal(pair.wang.season.stage,"review","did not finish season "+k);
  const award=w.__ab.awards()[pair.wang.year];assert(award&&award.winner);
  // A single young player award is recorded per actual league and year.
  const keys=new Map();
  for(const x of [pair.wang,pair.vini])for(const a of x.honors.filter(h=>h.year===x.year&&h.name.endsWith("最佳年轻球员"))){
   const key=x.year+":"+a.name;keys.set(key,(keys.get(key)||0)+1)
  }
  assert([...keys.values()].every(n=>n<=1),"Duplicate league young-player award");
 }
 assert.equal(w.__abSamples.length,10,"need 10 paired award years");
 return w.__abSamples;
}
function score(c,model,jitter){
 const q=c.quality,g=c.goals||0,a=c.assists||0,apps=Math.max(0,c.apps||0),ov=c.ov||76;
 if(model===6){const output=(Math.min(g,24)*.88+Math.max(0,g-24)*.38+Math.min(a,15)*.63+Math.max(0,a-15)*.25)*q;
  return ov*.68+output+(c.rating||6.7)*5+Math.min(apps,58)*.12+(c.v6Titles||0)*20+q*16+jitter*15;}
 const attack=(Math.min(g,35)*1.34+Math.max(0,g-35)*.78+Math.min(a,25)*.95+Math.max(0,a-25)*.56)*q;
 return ov*.58+attack+(Math.max(5,Math.min(10,c.rating??6.5))-6.5)*15+Math.min(apps,60)*.12+Math.max(0,Math.min(32,c.v7TitleBonus||0))+q*14+jitter*8;
}
function ballot(sample,model,seed){
 const prng=rng(seed),candidates=sample.candidates.map(c=>({...c,score:score(c,model,prng()*2-1)}));
 candidates.sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name)));
 const chosen=candidates.slice(0,30);assert(chosen.length===30,"30 nominees required");
 const totals=new Map(chosen.map(x=>[x.id,0]));const PTS=[15,12,10,8,7,5,4,3,2,1];
 for(let juror=0;juror<100;juror++){
  const vote=chosen.map(x=>({id:x.id,v:x.score+(Math.floor(prng()*39)-19)+.16*x.goals*Math.sin(juror*1.41)})).sort((a,b)=>b.v-a.v).slice(0,10);
  vote.forEach((x,i)=>totals.set(x.id,totals.get(x.id)+PTS[i]));
 }
 assert.equal([...totals.values()].reduce((a,b)=>a+b,0),6700);
 const rank=chosen.slice().sort((a,b)=>totals.get(b.id)-totals.get(a.id)||a.id.localeCompare(b.id));
 return {winner:rank[0].id,top3:rank.slice(0,3).map(x=>x.id),nominated:chosen.filter(x=>x.id.startsWith("DUO_")).map(x=>x.id)};
}
const samples=[];for(let i=0;i<10;i++)samples.push(...run(43773+i*1789));
const stats={6:{wins:0,top3:0,nominations:0,eligible:0},7:{wins:0,top3:0,nominations:0,eligible:0}};
let unchanged=0;
for(let i=0;i<samples.length;i++){
 const sample=samples[i],old=ballot(sample,6,20261113+i*131),now=ballot(sample,7,20261113+i*131);
 if(old.winner===now.winner)unchanged++;
 for(const [model,row] of [[6,old],[7,now]]){
  const item=stats[model],players=sample.candidates.filter(x=>x.id.startsWith("DUO_"));
  item.eligible+=players.length;
  item.wins+=Number(row.winner.startsWith("DUO_"));
  item.top3+=row.top3.filter(x=>x.startsWith("DUO_")).length;
  item.nominations+=row.nominated.length;
 }
}
assert.equal(samples.length,100);
const result={method:"paired candidates, identical simulated seasons and jury seeds; historical v6 and existing v7 formulas",sampleSeasons:samples.length,unchangedWinners:unchanged,old:{...stats[6],titleRatePercent:Number((stats[6].wins).toFixed(2))},current:{...stats[7],titleRatePercent:Number(stats[7].wins.toFixed(2))},deltaPercentagePoints:stats[7].wins-stats[6].wins};
console.log("AWARD_AB_RESULT_JSON="+JSON.stringify(result));
console.log("Paired Ballon d'Or 100-season formula comparison passed.");
