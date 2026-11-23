/* Score sheets store 22 rounds of six score pairs. Club indices follow this fixed draw order. */
(function(root){
  "use strict";
  const clubs=typeof module==="object"&&module.exports?require("./eleven-clubs"):root.ElevenClubs;
  const firstLeg=[],secondLeg=[];
  const rotation=Array.from({length:12},(_,i)=>i);
  for(let day=1;day<=11;day++){
    const pairs=[];
    for(let i=0;i<6;i++){
      const a=rotation[i],b=rotation[11-i];
      pairs.push((i+day)%2===0?[a,b]:[b,a]);
    }
    firstLeg.push(pairs);
    secondLeg.push(pairs.map(([home,away])=>[away,home]));
    rotation.splice(1,0,rotation.pop());
  }
  const rounds=firstLeg.concat(secondLeg);
  function standings(record,throughRound=22){
    const rows=record.teams.map(club=>({club,wins:0,draws:0,losses:0,for:0,against:0,points:0}));
    for(let day=0;day<throughRound;day++){
      rounds[day].forEach(([h,a],i)=>{
        const home=rows[h],away=rows[a],[x,y]=record.scores[day][i];
        home.for+=x;home.against+=y;away.for+=y;away.against+=x;
        if(x===y){home.draws++;away.draws++;home.points++;away.points++;}
        else{
          const winner=x>y?home:away,loser=x>y?away:home;
          winner.wins++;winner.points+=3;loser.losses++;
        }
      });
    }
    // Stable sort preserves the original draw order in an exact tie.
    return rows.sort((a,b)=>b.points-a.points||(b.for-b.against)-(a.for-a.against)||b.for-a.for);
  }
  function validHistory(state){
    const history=state.leagueSchedules;
    if(history===undefined)return true;
    if(!history||typeof history!=="object"||Array.isArray(history))return false;
    const years=Object.keys(history).map(Number).sort((a,b)=>a-b);
    if(!years.length||years.at(-1)!==state.year||years[0]<=state.startYear||years.length!==state.year-years[0]+1)return false;
    for(const year of years){
      const leagues=history[year],offset=year-state.startYear-1,fixtures=state.fixtures?.[year];
      if(!Number.isInteger(year)||!leagues||typeof leagues!=="object"||Array.isArray(leagues)||!Array.isArray(fixtures))return false;
      const tracked=new Map();
      for(const p of state.players){
        const season=p.seasons[offset];
        if(!season)return false;
        if(!tracked.has(season.league))tracked.set(season.league,new Set());
        tracked.get(season.league).add(season.club);
      }
      if(Object.keys(leagues).length!==tracked.size)return false;
      const entries=new Map(fixtures.map(m=>[JSON.stringify([m.league,m.round,m.home,m.away]),m.score]));
      for(const [league,members] of tracked){
        const record=leagues[league],pool=clubs.leagueTeams(league);
        if(!record||!Array.isArray(record.teams)||record.teams.length!==12||new Set(record.teams).size!==12||
          !record.teams.every(team=>pool.includes(team))||![...members].every(team=>record.teams.includes(team))||
          !Array.isArray(record.scores)||record.scores.length!==22)return false;
        for(const [day,pairs] of rounds.entries()){
          const scores=record.scores[day];
          if(!Array.isArray(scores)||scores.length!==6)return false;
          for(const [i,[h,a]] of pairs.entries()){
            const home=record.teams[h],away=record.teams[a],score=scores[i];
            if(!Array.isArray(score)||score.length!==2||!score.every(n=>Number.isInteger(n)&&n>=0&&n<=6))return false;
            if(!members.has(home)&&!members.has(away))continue;
            const key=JSON.stringify([league,day+1,home,away]),logged=entries.get(key);
            if(!logged||logged[0]!==score[0]||logged[1]!==score[1])return false;
            entries.delete(key);
          }
        }
      }
      if(entries.size)return false;
    }
    return true;
  }
  const api={rounds,standings,validHistory};
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.ElevenLeagues=api;
})(typeof window!=="undefined"?window:globalThis);
