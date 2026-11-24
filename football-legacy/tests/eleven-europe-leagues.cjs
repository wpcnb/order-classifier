"use strict";
const assert=require("node:assert/strict"),core=require("../china-eleven-career"),clubs=require("../eleven-clubs"),fixtures=require("../eleven-fixtures"),cups=require("../eleven-domestic-cup");
const expected={"英超":20,"西甲":20,"德甲":18,"意甲":20,"法甲":18,"葡超":18,"荷甲":18,"比甲":16,"土超":18,"苏超":12,"瑞士超":12,"奥甲":12,"丹超":12,"希腊超":14,"波兰超":18,"捷甲":16,"罗甲":16,"塞尔超":16};
const extras={"土耳其":"土超","苏格兰":"苏超","瑞士":"瑞士超","奥地利":"奥甲","丹麦":"丹超","希腊":"希腊超","波兰":"波兰超","捷克":"捷甲","罗马尼亚":"罗甲","塞尔维亚":"塞尔超"};
for(const [league,size] of Object.entries(expected)){
  const pool=clubs.leagueTeams(league);
  assert.equal(pool.length,size,league);
  assert.equal(new Set(pool).size,size,league+" duplicate");
  const country=clubs.domesticAssociation(league);
  assert(country&&pool.every(team=>clubs.cupTeams(country).includes(team)));
  assert(clubs.cupTeams(country).length>=16);
}
assert.deepEqual(clubs.europeLeagues,Object.values(extras));
function randomFor(label){let x=Array.from(label).reduce((sum,c)=>Math.imul(sum,31)+c.charCodeAt(0)|0,7);return ()=>((x=(Math.imul(1664525,x)+1013904223)>>>0)/4294967296);}
for(const [country,league] of Object.entries(extras)){
 const start=core.simulate(core.create(17,[],{together:false}),2),players=structuredClone(start.players);
 const pool=clubs.leagueTeams(league);
 players.forEach((p,i)=>{p.club=pool[i];p.league=league;Object.assign(p.seasons.at(-1),{club:p.club,league,injuryGames:0,trophy:null});});
 const {matches,records}=fixtures.simulateSeason(players,randomFor);
 assert.equal(records[league].teams.length,12);
 assert.equal(records[league].scores.length,22);
 assert(records[league].teams.every(team=>pool.includes(team)));
 assert(matches.every(m=>pool.includes(m.home)&&pool.includes(m.away)));
 const draws=cups.season(players,matches,core.domesticAssociation,randomFor);
 assert.equal(draws.length,1);
 assert.equal(draws[0].country,country);
 assert.equal(draws[0].matches.length,15);
 assert(draws[0].matches.every(m=>clubs.cupTeams(country).includes(m.home)&&clubs.cupTeams(country).includes(m.away)));
}
const reached=new Set();
for(let seed=1;seed<=48;seed++){
 const start=core.create(seed,[],{together:false}),previous=core.simulate(start,5);
 const archive=structuredClone(previous);
 const final=core.simulate(previous,14);
 assert(core.isValid(final));
 assert.deepEqual(previous,archive);
 for(const p of final.players)for(const s of p.seasons){
   assert(clubs.leagueTeams(s.league).includes(s.club));
   if(clubs.europeLeagues.includes(s.league))reached.add(s.league);
 }
 for(const [year,records] of Object.entries(archive.leagueSchedules))assert.deepEqual(final.leagueSchedules[year],records);
}
assert.equal(reached.size,clubs.europeLeagues.length,"every added league reachable via actual seeded transfers");
console.log("PASS European club pools, all ten transfer paths, 16-team domestic cups, 12-team schedule and archived season continuity", {reached:[...reached]});
