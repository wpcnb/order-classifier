"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const core=require("../china-eleven-career.js");
const ledger=require("../eleven-ledger.js");
const awards=require("../eleven-awards.js");
const root=path.resolve(__dirname,"..");
const initial=core.create(20261123,[],{country:"英格兰",team:"曼城",together:true});
const world=core.simulate(initial,12);
assert(core.isValid(world));
assert.equal(world.players.length,11);
assert.deepEqual(core.simulate(initial,12),world,"fixed seed must replay award ballots");
const y=2028,ann=world.awardHistory[y];
assert(ann&&ann["金球奖"]&&ann["世界足球先生"],"both annual awards must settle");
for(const [name,expected] of [["金球奖","100名模拟记者"],
 ["世界足球先生","模拟教练、队长、媒体、球迷各100票"]]){
 const a=ann[name];
 assert.equal(a.model,3);
 assert.equal(a.rankings.length,30);
 assert.equal(new Set(a.rankings.map(r=>r.id)).size,30);
 assert.equal(a.rankings[0].name,a.name);
 assert.equal(a.rankings[0].points,a.points);
 assert(a.rankings.every((r,i)=>r.rank===i+1&&typeof r.reason==="string"&&r.reason.length>0));
 assert.equal(a.voters,expected);
 const voteSum=a.rankings.reduce((sum,r)=>sum+r.points,0);
 assert(Math.abs(voteSum-(name==="金球奖"?6700:100))<.3,"all votes accounted for");
}
assert.notEqual(ann["金球奖"].voters,ann["世界足球先生"].voters);
console.log("PASS annual awards: full rankings, two distinct voting colleges, reproducible ballots");

for(const p of world.players){
 const history=ledger.career(world,p.id);
 assert.equal(history.seasons.length,world.yearsSimulated);
 assert.equal(history.total.apps,history.seasons.reduce((n,s)=>n+s.total.apps,0));
 assert.equal(history.total.goals,history.seasons.reduce((n,s)=>n+s.total.goals,0));
 assert.equal(history.total.assists,history.seasons.reduce((n,s)=>n+s.total.assists,0));
 for(const s of history.seasons){
  const stored=p.seasons[s.year-world.startYear-1];
  for(const field of ["apps","goals","assists","cleanSheets"])
   assert.equal(s.league[field],stored[field],"match ledger must balance league "+field);
  if(stored.statVersion===2)assert.equal(stored.apps,s.league.apps);
  assert.equal(s.total.apps,s.league.apps+s.cup.apps+s.national.apps);
  assert.equal(s.total.goals,s.league.goals+s.cup.goals+s.national.goals);
  assert.equal(s.total.assists,s.league.assists+s.cup.assists+s.national.assists);
 }
}
assert.equal(ledger.career(world,1).adultCaps,world.players[0].careerCaps);
assert(world.players.some(p=>["GK","RB","CB","LB"].includes(p.position)&&
 p.seasons.some(s=>s.cleanSheets>0)),"tracked defenders must receive clean sheets");
console.log("PASS league/cup/international ledgers; defender clean sheets and career caps");

const mutate=fn=>{const bad=structuredClone(world);fn(bad);assert.equal(core.isValid(bad),false);assert.throws(()=>core.step(bad),/无效/);};
mutate(b=>{b.awardHistory[2028]["金球奖"].rankings[0].points=9999});
mutate(b=>{b.awardHistory[2028]["金球奖"].rankings[1].id=b.awardHistory[2028]["金球奖"].rankings[0].id});
mutate(b=>{b.awardHistory[2028]["金球奖"].id=999});
mutate(b=>{b.awardHistory[2028]["世界足球先生"].voters="记者"});
mutate(b=>{b.awardHistory[2028]["金球奖"].rankings[0].rank=8});
mutate(b=>{b.players[0].seasons.at(-1).apps+=1});
mutate(b=>{b.awardHistory[2080]=b.awardHistory[2028]});
const year=world.year,fixture=world.fixtures[year].find(m=>m.lineups.some(l=>l.length));
assert(fixture);
mutate(b=>{const m=b.fixtures[year].find(m=>m.round===fixture.round&&m.home===fixture.home&&m.away===fixture.away);m.goals.push([0,null,null])});
mutate(b=>{const m=b.fixtures[year].find(m=>m.round===fixture.round&&m.home===fixture.home&&m.away===fixture.away);m.lineups[0].push(99)});
mutate(b=>{const m=b.fixtures[year].find(m=>m.round===fixture.round&&m.home===fixture.home&&m.away===fixture.away);m.home="伪造球队"});
console.log("PASS illegal scores, lineups, affiliations, award ranks, and corrupted totals rejected");

const legacy=structuredClone(world);
for(const [yr,entry] of Object.entries(legacy.awardHistory)){
 for(const award of awards.ORDER){
  const w=entry[award];
  entry[award]={id:w.id,name:w.id===null?"其他职业球员":w.name,points:w.points};
 }
}
for(const p of legacy.players)for(const s of p.seasons)delete s.statVersion;
assert(core.isValid(legacy),"existing award history without ballots must remain importable");
assert(core.isValid(core.step(legacy)));
assert.equal(core.step(legacy).awardHistory[2028]["金球奖"].model,undefined,
 "historical old ballots must not be fabricated");
console.log("PASS old awards and XI save schema remain loadable without fabricated ballots");

for(const page of ["index.html","play.html"]){
 const html=fs.readFileSync(path.join(root,page),"utf8");
 assert(html.indexOf("eleven-ledger.js")<html.indexOf("eleven-awards.js"));
 assert(html.indexOf("eleven-awards.js")<html.indexOf("china-eleven-career.js"));
}
const ceremony=fs.readFileSync(path.join(root,"awards.html"),"utf8");
assert(ceremony.includes("eleven-awards-page.js")&&ceremony.includes("viewport"));
const ui=fs.readFileSync(path.join(root,"china-eleven-ui.js"),"utf8");
assert(ui.includes('href="./awards.html"')&&ui.includes("competitionRows(p)"));
console.log("PASS ceremony entrypoint, read-only history presentation and script dependency order");
