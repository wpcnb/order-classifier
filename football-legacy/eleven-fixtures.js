/* Double round robin. One score and one event ledger per fixture for all tracked teammates. */
(function(root) {
  "use strict";
  const roles = Object.freeze(["GK","RB","CB","CB","LB","CDM","CM","CM","LW","RW","ST"]);
  const shooting = {GK:0,RB:1,CB:1,LB:1,CDM:2,CM:4,LW:8,RW:8,ST:12};
  const passing = {GK:0,RB:4,CB:1,LB:4,CDM:4,CM:9,LW:8,RW:8,ST:4};
  const teamsRegistry=typeof module==="object"&&module.exports?require("./eleven-clubs.js"):root.ElevenClubs;
  const schedule=typeof module==="object"&&module.exports?require("./eleven-leagues.js"):root.ElevenLeagues;
  function weighted(lineup, weights, random, exclude) {
    const candidates = lineup.filter(p => p !== exclude && weights[p.position] > 0);
    const weight = p => weights[p.position] * (p.rating / 65);
    let draw = random() * candidates.reduce((sum,p) => sum + weight(p), 0);
    return candidates.find(p => (draw -= weight(p)) < 0) || candidates.at(-1);
  }
  function lineup(members, round, random) {
    const available = [...members];
    return roles.map(position => {
      const index = available.findIndex(p => p.position === position);
      if (index >= 0) {
        const p = available.splice(index, 1)[0], season = p.seasons.at(-1);
        if (!(round >= season.injuryStart && round < season.injuryStart + season.injuryGames)
            && random() < Math.max(.58, Math.min(.97, .78 + (p.rating - 60) / 100))) {
          return p;
        }
      }
      return {id:null, position, rating:60};
    });
  }
  function scoreLineups(lines, random) {
    const strength = lines.map(line => line.reduce((sum,p) => sum+p.rating,0)/11);
    const score = [0,0], goals = [];
    for (let side = 0; side < 2; side++) {
      const chance = Math.max(.12,Math.min(.48,.25 + (side === 0 ? .035 : 0) + (strength[side]-strength[1-side])*.005));
      for(let attempt=0;attempt<6;attempt++) {
        if(random() >= chance)continue;
        score[side]++;
        const scorer = weighted(lines[side],shooting,random);
        const helper = random()<.74 ? weighted(lines[side],passing,random,scorer) : null;
        goals.push([side,scorer.id,helper?.id||null]);
      }
    }
    return {score,goals,lineups:lines.map(line=>line.map(p=>p.id).filter(Boolean))};
  }
  function playMatch(home, away, round, members, random) {
    const lines = [lineup(members.get(home) || [],round,random),lineup(members.get(away) || [],round,random)];
    const result = scoreLineups(lines,random);
    for(const line of lines)for(const p of line)if(p.id)p.seasons.at(-1).apps++;
    for(const [side,scorer,helper] of result.goals){
      if(scorer)lines[side].find(p=>p.id===scorer).seasons.at(-1).goals++;
      if(helper)lines[side].find(p=>p.id===helper).seasons.at(-1).assists++;
    }
    // Every tracked defender who actually played earns a clean sheet, not only the goalkeeper.
    // Midfielders and forwards do not receive this defensive statistic.
    lines.forEach((line,side) => {
      if(result.score[1-side]!==0)return;
      for(const p of line){
        if(p.id && ["GK","RB","CB","LB"].includes(p.position))p.seasons.at(-1).cleanSheets++;
      }
    });
    return {round,home,away,...result};
  }
  function simulateSeason(players, randomFor) {
    const leagues = new Map(), fixtures = [], records = {};
    for(const p of players) {
      const s=p.seasons.at(-1);
      Object.assign(s,{apps:0,goals:0,assists:0,cleanSheets:0});
      if(s.injuryGames)s.injuryStart=1+Math.floor(randomFor("injury:"+p.id)()*(23-s.injuryGames));
      if(!leagues.has(p.league))leagues.set(p.league,new Map());
      const clubs=leagues.get(p.league);
      if(!clubs.has(p.club))clubs.set(p.club,[]);
      clubs.get(p.club).push(p);
    }
    for(const [league,clubs] of leagues) {
      const teams=[...clubs.keys()].sort();
      const members=teamsRegistry.leagueTeams(league);
      if(teams.some(team=>!members.includes(team)))throw Error("球队未在联赛名单内："+league);
      const opponents=members.filter(name=>!clubs.has(name));
      const draw=randomFor("league draw:"+league);
      while(teams.length<12){
        if(!opponents.length)throw Error("联赛球队数量不足："+league);
        teams.push(opponents.splice(Math.floor(draw()*opponents.length),1)[0]);
      }
      const scores=schedule.rounds.map((pairs,day)=>pairs.map(([h,a])=>{
        const home=teams[h],away=teams[a],round=day+1;
        const match=playMatch(home,away,round,clubs,randomFor(JSON.stringify([league,round,home,away])));
        if(clubs.has(home)||clubs.has(away))fixtures.push({...match,league});
        return match.score;
      }));
      records[league]={teams,scores};
    }
    return {matches:fixtures.sort((a,b)=>a.round-b.round),records};
  }
  function season(players,randomFor){return simulateSeason(players,randomFor).matches;}
  root.ElevenFixtures={season,simulateSeason,roles,scoreLineups,clubLineup:lineup};
  if(typeof module==="object"&&module.exports)module.exports=root.ElevenFixtures;
})(typeof window!=="undefined"?window:globalThis);
