"use strict";
const assert=require("node:assert/strict");
const engine=require("../china-eleven-career.js");
const runs=Number(process.env.STRESS_RUNS||50),shard=Number(process.env.STRESS_SHARD||0);
const years=Number(process.env.STRESS_YEARS||19);
let playerSeasons=0;
for(let i=0;i<runs;i++){
 const seed=20261122+shard*runs+i;
 const world=engine.simulate(engine.create(seed,[],{together:i%2===0}),years);
 assert(engine.isValid(world));
 for(const p of world.players){
  assert.equal(p.seasons.length,Math.min(years,19));
  for(const s of p.seasons){
   assert(s.apps<=22-s.injuryGames);
   assert(s.cleanSheets<=s.apps);
   const matches=world.fixtures[s.year].filter(m=>m.league===s.league&&(m.home===s.club||m.away===s.club));
   assert.equal(matches.length,22);
   assert.equal(new Set(matches.map(m=>m.round)).size,22);
   assert.equal(s.apps,matches.filter(m=>m.lineups.some(team=>team.includes(p.id))).length);
  }
  playerSeasons+=p.seasons.length;
 }
}
console.log(JSON.stringify({seedStart:20261122+shard*runs,runs,years,playerSeasons}));
