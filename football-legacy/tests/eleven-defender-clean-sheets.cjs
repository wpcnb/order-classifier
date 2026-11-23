"use strict";
const assert=require("node:assert/strict");
const fixtures=require("../eleven-fixtures.js");
const positions=["GK","RB","CB","CB","LB","CDM","CM","CM","LW","RW","ST"];
function player(id,position){
  return {id,position,rating:75,seasons:[{apps:0,goals:0,assists:0,cleanSheets:0,injuryStart:0,injuryGames:0}]};
}
const roster=positions.map((position,i)=>player(i+1,position));
const opponent=positions.map((position,i)=>({id:null,position,rating:60}));
const members=new Map([["Tracked",roster],["Opponent",opponent]]);
const original=fixtures.scoreLineups;
const tests=[
  {score:[1,0],expect:1},
  {score:[1,1],expect:0}
];
// Use the real league engine and a deterministic random stream to test the
// defender credit path without modifying exported production functions.
for(const [index,caseData] of tests.entries()){
  const team=positions.map((position,i)=>player(i+1,position));
  const matches=fixtures.season(team,()=>()=>index===0?0.999:0.1);
  const credited=team.filter(p=>p.seasons[0].cleanSheets>0);
  assert(credited.every(p=>["GK","RB","CB","LB"].includes(p.position)));
  assert(team.filter(p=>["RB","CB","LB"].includes(p.position)).every(p=>p.seasons[0].cleanSheets<=p.seasons[0].apps));
  assert(team.filter(p=>["CDM","CM","LW","RW","ST"].includes(p.position)).every(p=>p.seasons[0].cleanSheets===0));
  if(index===0){
    assert(team.filter(p=>["RB","CB","LB"].includes(p.position)).some(p=>p.seasons[0].cleanSheets>0),
      "defenders must be credited in goalless conceded matches");
  }
  assert(matches.length>0);
}
console.log("PASS defender clean-sheet accounting, positional exclusion and bounded credits");
