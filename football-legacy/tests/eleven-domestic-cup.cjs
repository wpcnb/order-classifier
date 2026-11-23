"use strict";
const assert=require("node:assert/strict");
const engine=require("../china-eleven-career");
const cup=require("../eleven-domestic-cup");
const fixtures=require("../eleven-fixtures");
const free=engine.simulate(engine.create(1,[],{together:false}),19);
assert(engine.isValid(free));
assert.equal(free.cupHistory[2027],undefined);
assert.equal(Object.keys(free.cupHistory).length,18);
let shootouts=0,injuries=0,medals=0;
for(const [year,draws] of Object.entries(free.cupHistory)){
 const offset=Number(year)-2027;
 assert.equal(new Set(draws.map(c=>c.country)).size,draws.length);
 for(const draw of draws){
  let winners=null;
  for(const day of [...new Set(draw.matches.map(m=>m.round))]){
   const games=draw.matches.filter(m=>m.round===day);
   const teams=games.flatMap(m=>[m.home,m.away]);
   assert.equal(new Set(teams).size,teams.length);
   if(winners)assert.deepEqual(teams,winners);
   winners=games.map(cup.winner);
   for(const m of games){
    assert.equal(Boolean(m.penalties),m.score[0]===m.score[1]);
    if(m.penalties){shootouts++;assert.notEqual(...m.penalties)}
    for(const [side,club] of [m.home,m.away].entries()){
     for(const player of free.players){
      const s=player.seasons[offset];
      if(engine.domesticAssociation(s.league)!==draw.country||s.club!==club)continue;
      if(day>=s.injuryStart&&day<s.injuryStart+s.injuryGames){
       injuries++;assert(!m.lineups[side].includes(player.id));
      }
     }
    }
   }
  }
  assert.equal(winners.length,1);
  for(const p of free.players){
   const s=p.seasons[offset];
   if(engine.domesticAssociation(s.league)!==draw.country)continue;
   assert.equal(Boolean(s.trophy),s.club===winners[0]);
   if(s.trophy)medals++;
  }
 }
}
assert(shootouts&&injuries&&medals);
const withCup=engine.simulate(engine.create(1),2);
const bad=structuredClone(withCup);
bad.cupHistory[2028][0].matches.at(-1).home="已被淘汰的队";
assert(!engine.isValid(bad));
const wrongTrophy=structuredClone(withCup);
const s=wrongTrophy.players[0].seasons.at(-1);s.trophy=s.trophy?null:"中国国内杯冠军";
assert(!engine.isValid(wrongTrophy));
const old=structuredClone(withCup);delete old.cupHistory;
old.players[0].seasons[1].trophy="模拟国内杯赛冠军";
const next=engine.step(old);
assert.deepEqual(Object.keys(next.cupHistory),["2029"]);
for(const [i,p] of old.players.entries())assert.deepEqual(next.players[i].seasons.slice(0,2),p.seasons);
assert(engine.isValid(next));

// Eleven controlled clubs in a single division need a sixteen-team draw.
const players=structuredClone(withCup.players);
const domesticClubs=require("../eleven-clubs").leagueTeams("中超");
players.forEach(p=>{p.club=domesticClubs[p.id-1];p.league="中超";Object.assign(p.seasons.at(-1),{club:p.club,league:p.league,trophy:null})});
function randomFor(label){
 let n=Array.from(label).reduce((sum,c)=>Math.imul(sum,31)+c.charCodeAt(0)|0,7);
 return ()=>((n=(Math.imul(1664525,n)+1013904223)>>>0)/4294967296);
}
const {matches:league,records}=fixtures.simulateSeason(players,randomFor);
const clubStats=players.map(p=>p.seasons.at(-1).apps);
const draws=cup.season(players,league,engine.domesticAssociation,randomFor);
assert.equal(draws.length,1);
assert.equal(draws[0].matches.length,15);
assert.equal(new Set(draws[0].matches.slice(0,8).flatMap(m=>[m.home,m.away])).size,16);
assert.deepEqual(clubStats,players.map(p=>p.seasons.at(-1).apps));
assert(engine.isValid({...withCup,players,leagueSchedules:{...withCup.leagueSchedules,2028:records},fixtures:{...withCup.fixtures,2028:league},cupHistory:{2028:draws}}));
console.log("PASS shared domestic cups, knockout progression, shootouts, injury windows, honours, and old-save continuity");
