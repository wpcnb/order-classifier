"use strict";
const assert=require("node:assert/strict");
const fixtures=require("../eleven-fixtures.js");
const positions=["GK","RB","CB","CB","LB","CDM","CM","CM","LW","RW","ST"];
function player(id,position){
  return {id,position,rating:75,seasons:[{apps:0,goals:0,assists:0,cleanSheets:0,injuryStart:0,injuryGames:0}]};
}
const team=positions.map((position,i)=>player(i+1,position));
const matches=fixtures.season(team,label=>{
  if(label.startsWith("injury:"))return ()=>0.5;
  let draws=0;
  return ()=>++draws<=22?0.1:0.99;
});
assert(matches.length>0);
assert(team.every(p=>p.seasons[0].apps>0),"tracked players must play");
for(const p of team){
  if(["GK","RB","CB","LB"].includes(p.position)){
    assert(p.seasons[0].cleanSheets>0,p.position+" should receive clean sheets");
    assert(p.seasons[0].cleanSheets<=p.seasons[0].apps);
  }else assert.equal(p.seasons[0].cleanSheets,0,p.position+" must not receive defensive clean sheets");
}
console.log("PASS defender clean sheets, position exclusions and appearance bounds");
