"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const script=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__china={DB,chinaLeagueRounds,chineseMembers,chinaSecondStageGroups,chineseClubDivision,duo:()=>duoGames,shared:()=>sharedUniverse};})();');
const store=new Map(),nodes={},handlers={},timers=[];
const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(name,fn){handlers[id+":"+name]=fn},click(){}});
const ctx={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},Math,console,confirm:()=>true,setTimeout:f=>(timers.push(f),timers.length),clearTimeout:()=>{},Blob,URL};
for(const f of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f,timeout:4000});
vm.runInNewContext(script,ctx,{filename:"game.js",timeout:4000});
const a=ctx.window.__china,runTimer=()=>{let n=0;while(timers.length&&n++<100)timers.shift()()};
function click(action,id,i=0){handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,id,i}})}})}
assert.deepEqual(["CHN","CHN1","CHN2"].map(id=>a.DB[id].teams.length),[16,16,24]);
const names=a.chineseMembers("CHN2",2026),rounds=a.chinaLeagueRounds("CHN2",names);
assert.equal(rounds.length,30);
const counts=Object.fromEntries(names.map(x=>[x,0]));
for(let day=0;day<30;day++){assert.equal(rounds[day].length,12);
 const perDay=rounds[day].flatMap(f=>[f.home,f.away]);assert.equal(new Set(perDay).size,24);
 for(const club of perDay)counts[club]++;
}
assert(Object.values(counts).every(n=>n===30),"Each Chinese League Two team must play exactly 30 matches");
const groups=a.chinaSecondStageGroups(names);
for(const r of rounds.slice(22))for(const m of r){
 const pair=groups.find(g=>g.flat().includes(m.home));
 assert(pair,"All final-stage matches belong to a valid seeded group");
 assert(pair[0].includes(m.home)&&pair[1].includes(m.away)||pair[1].includes(m.home)&&pair[0].includes(m.away),"Final-stage opponents must come from the other region");
}
click("flipOpeningCard","wang",0);runTimer();click("flipOpeningCard","vini",0);runTimer();click("preset");
assert(a.duo(),"Starting dual game must work");
for(let y=2026;y<=2028;y++){
 click("simBoth");
 assert.equal(a.duo().wang.year,y);
 assert.equal(a.duo().vini.year,y);
 // Next iteration advances the shared calendar by one year.
}
assert.equal(a.chineseMembers("CHN1",2028).length,18,"2028 League One expansion");
assert.equal(a.chineseMembers("CHN2",2028).length,24,"League Two remains 24 clubs");
for(const id of ["wang","vini"]){const d=a.duo()[id].player.transferDraw;if(d?.options?.length&&!d.selected){click("flipPromotionCard",id,0);runTimer()}}
click("simBoth");assert.equal(a.duo().wang.year,2029);
const members=["CHN","CHN1","CHN2"].map(id=>a.chineseMembers(id,2029));
assert.deepEqual(members.map(x=>x.length),[16,18,24],"Chinese divisions must keep valid sizes after relegation");
assert.equal(new Set(members.flat()).size,58,"All 58 Chinese clubs have unique division assignments");
for(const id of ["wang","vini"]){
 const p=a.duo()[id].player;
 if(["CHN","CHN1","CHN2"].includes(p.leagueId))assert(a.chineseMembers(p.leagueId,2029).includes(p.club),"User club division must follow Chinese membership");
}
const save=JSON.parse(store.get("football-dynasty-duo-v2-20261110"));
assert.equal(save.sharedUniverse.chineseMembership[2029].CHN1.length,18,"Expanded membership survives compact storage");
assert(a.DB.TUR.teams.length===18&&a.DB.BEL.teams.length===18&&a.DB.SCO.teams.length===12&&a.DB.AUT.teams.length===12);
console.log("✓ China three divisions, 2028 expansion, 30-match regional staging, 2029 transition, unique clubs and saved membership");
