"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),key="football-legacy-china-academy-v1";
const storage=new Map();
function open(){
 const nodes=new Map(),node=id=>{
  if(!nodes.has(id))nodes.set(id,{setAttribute(){},innerHTML:"",value:""});
  return nodes.get(id);
 };
 const ctx={window:{},document:{getElementById:node},structuredClone,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
 for(const file of ["china-rosters.js","china-academy.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),ctx,{filename:file});
 return {node,players:ctx.window.ChinaAcademyData.players};
}
const {node,players}=open();
assert.equal(players.filter(p=>p.group==="u17").length,21);
assert.equal(players.filter(p=>p.group==="senior").length,26);
assert.equal(new Set(players.map(p=>p.name)).size,47);
assert(players.every(p=>p.height>0&&p.born&&p.club&&p.role&&(!p.weight||p.weightSource)));
node("camp").onclick();
const saved=JSON.parse(storage.get(key));
assert.equal(saved.week,12);assert.equal(saved.history.length,12);
for(const p of players){
 assert(saved.stats[p.id].apps>0);
 if(p.group==="u17")assert.equal(saved.stats[p.id].passing,12);
}
for(const m of saved.history){
 assert.equal(m.home+m.away,m.goals.length);
 assert(m.lineups.every(xi=>new Set(xi).size===11));
 for(const g of m.goals){
  const xi=m.lineups[g.side==="u17"?0:1];
  assert(xi.includes(g.scorer)&&(!g.helper||xi.includes(g.helper)&&g.helper!==g.scorer));
 }
}
assert.equal(saved.wins+saved.draws+saved.losses,12);
const resumed=open();resumed.node("week").onclick();
assert.equal(JSON.parse(storage.get(key)).week,13);
console.log("✓ 47 名球员按位置轮换，教学赛出场与比分守恒，青训独立读档");
