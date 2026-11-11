"use strict";
// Reproducible, seeded 100,000 *scenario* audits against the production game
// functions. This is not 100,000 full ten-year careers; see stress-1000.cjs
// for real end-to-end dual-player career runs.
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const game=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__audit={DB,CSL_DRAW_TEAMS,TRANSFER_LEVELS,TRANSFER_GATES,transferLevel,tenCardOptions,shuffleDraw,rollMatchCards,simulateScore,transferQualified};})();');
let state=20261111;
const math=Object.create(Math);
math.random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296};
const storage=new Map(),nodes={},handlers={};
const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(name,fn){handlers[id+":"+name]=fn},click(){}});
const ctx={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},Math:math,console,confirm:()=>true,setTimeout:()=>0,clearTimeout:()=>{},Blob,URL};
for(const f of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f,timeout:5000});
vm.runInNewContext(game,ctx,{filename:"game.js",timeout:10000});
const api=ctx.window.__audit,rand=()=>math.random(),choose=a=>a[Math.floor(rand()*a.length)];
const teams=Object.entries(api.DB).filter(([id])=>id!=="BRA").flatMap(([id,l])=>l.teams.map(t=>({id,club:t.name,tier:api.transferLevel(id,t.name)})));
const tierCounts=Array.from({length:6},(_,level)=>teams.filter(t=>t.tier===level).length);
const summary={seed:20261111,mode:"100k varied scenario cases, not complete careers",gameSource:"football-legacy/game.js",
 cases:0,groups:{},failures:[],tierCounts,
 opening:{picks:{},sameClub:0,invalid:0},
 promotion:{offers:0,lucky:0,normal:0,wrongComposition:0,luckyRate:null,byTarget:{}},
 relegation:{offers:0,invalid:0,byTarget:{}},
 discipline:{yellow:0,directRed:0,secondYellow:0,illegal:0,byPosition:{}},
 score:{games:0,homeGoals:0,awayGoals:0,negative:0,excessive:0},
 qualification:{cases:0,monotonicityFailures:0,byPosition:{}},
 elapsedMillis:0};
const start=Date.now(),record=(name,fn)=>{
 summary.groups[name]=(summary.groups[name]||0)+1;summary.cases++;
 try{fn()}catch(e){if(summary.failures.length<25)summary.failures.push({case:summary.cases,group:name,error:String(e.message||e)})}
};
const unique=a=>new Set(a).size===a.length;
const clubs=api.CSL_DRAW_TEAMS();
assert.equal(clubs.length,14,"Opening CSL pool must have 14 clubs");
for(let n=0;n<10000;n++)record("opening-first-player",()=>{
 const deck=api.shuffleDraw(clubs).slice(0,10);
 assert.equal(deck.length,10);assert(unique(deck));assert(deck.every(x=>clubs.includes(x)));
 const picked=choose(deck);summary.opening.picks[picked]=(summary.opening.picks[picked]||0)+1;
});
for(let n=0;n<10000;n++)record("opening-second-player",()=>{
 const first=choose(clubs),pool=clubs.filter(t=>t!==first);
 const deck=api.shuffleDraw(pool).slice(0,10);
 assert.equal(deck.length,10);assert(unique(deck));assert(!deck.includes(first));
 if(deck.includes(first))summary.opening.sameClub++;
 assert(deck.every(x=>clubs.includes(x)));
});
for(let target=1;target<=5;target++){
 for(let n=0;n<10000;n++)record("promotion-to-tier-"+target,()=>{
  const pool=teams.filter(t=>t.tier===target||(target<5&&t.tier===target+1));
  const deck=api.tenCardOptions(pool,target,false);
  const normal=deck.filter(t=>t.tier===target).length,lucky=deck.filter(t=>t.tier===target+1).length;
  const expected=target===5?10:9;
  assert.equal(deck.length,10);assert(unique(deck.map(t=>t.club)));
  assert.equal(normal,expected);assert.equal(lucky,target===5?0:1);
  const picked=choose(deck);
  assert(picked.tier===target||(target<5&&picked.tier===target+1));
  summary.promotion.offers++;
  if(picked.tier===target+1){summary.promotion.lucky++;}else summary.promotion.normal++;
  summary.promotion.byTarget[target]=(summary.promotion.byTarget[target]||0)+1;
 });
}
for(let n=0;n<10000;n++)record("relegation-levels-0-to-4",()=>{
 const target=n%5,pool=teams.filter(t=>t.tier===target),deck=api.tenCardOptions(pool,target,true);
 assert.equal(deck.length,10);assert(unique(deck.map(t=>t.club)));assert(deck.every(t=>t.tier===target));
 summary.relegation.offers++;summary.relegation.byTarget[target]=(summary.relegation.byTarget[target]||0)+1;
});
const positions=["GK","CB","CDM","CM","CAM","ST","LW","RW"],tactics=["balanced","attack","defend","creative"];
for(let n=0;n<10000;n++)record("cards-by-position-and-tactic",()=>{
 const position=positions[n%positions.length],choice=tactics[Math.floor(n/positions.length)%tactics.length];
 const r=api.rollMatchCards({position},choice,rand);
 assert([0,1,2].includes(r.yellowCards));
 assert([null,"direct","second-yellow"].includes(r.redCard));
 assert(r.redCard!=="direct"||r.yellowCards===0);
 assert(r.redCard!=="second-yellow"||r.yellowCards===2);
 assert(!(!r.redCard&&r.yellowCards===2));
 summary.discipline.yellow+=r.yellowCards;
 if(r.redCard==="direct")summary.discipline.directRed++;
 if(r.redCard==="second-yellow")summary.discipline.secondYellow++;
 const row=summary.discipline.byPosition[position]||(summary.discipline.byPosition[position]={cases:0,yellow:0,red:0});
 row.cases++;row.yellow+=r.yellowCards;if(r.redCard)row.red++;
});
for(let n=0;n<5000;n++)record("match-score-variance-and-home-advantage",()=>{
 const home=choose(teams),away=choose(teams);
 const [h,a]=api.simulateScore(home.club,away.club,0);
 assert(Number.isInteger(h)&&Number.isInteger(a)&&h>=0&&a>=0);
 summary.score.games++;summary.score.homeGoals+=h;summary.score.awayGoals+=a;
 if(h>20||a>20)summary.score.excessive++;
});
for(let n=0;n<5000;n++)record("promotion-qualification-monotonicity",()=>{
 const position=positions[n%positions.length],tier=n%5,gate=api.TRANSFER_GATES[tier];
 const apps=8+Math.floor(rand()*38),avg=5+rand()*3.8,ov=50+Math.floor(rand()*53);
 const goals=Math.floor(rand()*31),assists=Math.floor(rand()*31);
 const base={apps,avg,goals,assists};
 const stronger={apps:apps+5,avg:avg+.20,goals:goals+3,assists:assists+3};
 const a=!!api.transferQualified(gate,base,ov,position),b=!!api.transferQualified(gate,stronger,ov+5,position);
 assert(!(a&&!b),"Better stats must not reverse a transfer qualification");
 summary.qualification.cases++;
 const row=summary.qualification.byPosition[position]||(summary.qualification.byPosition[position]={cases:0,qualified:0});
 row.cases++;if(a)row.qualified++;
});
assert.equal(summary.cases,100000,"Must execute exactly 100,000 independent scenario cases");
const measured=summary.promotion.lucky/40000;
summary.promotion.luckyRate=Number(measured.toFixed(6));
if(Math.abs(measured-.10)>.012)summary.failures.push({group:"promotion-rate",error:"The lucky card hit rate deviates > 1.2pp from 10%: "+measured});
if(summary.discipline.yellow<=500||summary.discipline.directRed+summary.discipline.secondYellow>=100)summary.failures.push({group:"discipline-balance",error:"Yellow/red occurrence outside expected range"});
if(summary.score.games!==5000)summary.failures.push({group:"score",error:"Not all score matches completed"});
summary.elapsedMillis=Date.now()-start;
console.log("AUDIT_100K_JSON="+JSON.stringify(summary));
assert.equal(summary.failures.length,0,"100,000 scenario audit failed: "+JSON.stringify(summary.failures.slice(0,5)));
console.log("PASS: 100,000 deterministic and randomly varied football game scenario tests");
