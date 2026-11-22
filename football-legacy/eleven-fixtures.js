/* Double round robin. One score and one event ledger per fixture for all tracked teammates. */
(function(root) {
  "use strict";
  const roles = ["GK","RB","CB","CB","LB","CDM","CM","CM","LW","RW","ST"];
  const shooting = {GK:0,RB:1,CB:1,LB:1,CDM:2,CM:4,LW:8,RW:8,ST:12};
  const passing = {GK:0,RB:4,CB:1,LB:4,CDM:4,CM:9,LW:8,RW:8,ST:4};
  const filler = ["北城竞技","南岸联队","东港竞技","西城联队","河谷联队","山麓竞技","新城联","滨海竞技","中央联队","河畔竞技","青年联合","星港联队"];
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
          season.apps++;
          return p;
        }
      }
      return {id:null, position, rating:60};
    });
  }
  function playMatch(home, away, round, members, random) {
    const lines = [lineup(members.get(home) || [],round,random),lineup(members.get(away) || [],round,random)];
    const strength = lines.map(line => line.reduce((sum,p) => sum+p.rating,0)/11);
    const score = [0,0], goals = [];
    for (let side = 0; side < 2; side++) {
      const chance = Math.max(.12,Math.min(.48,.25 + (side === 0 ? .035 : 0) + (strength[side]-strength[1-side])*.005));
      for(let attempt=0;attempt<6;attempt++) {
        if(random() >= chance)continue;
        score[side]++;
        const scorer = weighted(lines[side],shooting,random);
        const helper = random()<.74 ? weighted(lines[side],passing,random,scorer) : null;
        if (scorer.id) scorer.seasons.at(-1).goals++;
        if (helper?.id) helper.seasons.at(-1).assists++;
        goals.push([side,scorer.id,helper?.id||null]);
      }
    }
    lines.forEach((line,side) => {
      if (line[0].id && score[1-side]===0) line[0].seasons.at(-1).cleanSheets++;
    });
    return {round,home,away,score,goals,lineups:lines.map(line=>line.map(p=>p.id).filter(Boolean))};
  }
  function season(players, randomFor) {
    const leagues = new Map(), fixtures = [];
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
      for(const name of filler)if(teams.length<12&&!teams.includes(name))teams.push(name);
      const rounds=teams.length-1;
      for(let day=1;day<=rounds;day++) {
        for(let i=0;i<teams.length/2;i++) {
          const a=teams[i],b=teams[teams.length-1-i];
          if(!clubs.has(a)&&!clubs.has(b))continue;
          for(let leg=0;leg<2;leg++) {
            const round=day+leg*rounds,swap=(i+day+leg)%2===0;
            const home=swap?a:b,away=swap?b:a;
            fixtures.push({...playMatch(home,away,round,clubs,randomFor(JSON.stringify([league,round,home,away]))),league});
          }
        }
        teams.splice(1,0,teams.pop());
      }
    }
    return fixtures.sort((a,b)=>a.round-b.round);
  }
  root.ElevenFixtures={season};
  if(typeof module==="object"&&module.exports)module.exports=root.ElevenFixtures;
})(typeof window!=="undefined"?window:globalThis);
