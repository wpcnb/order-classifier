/* A single season draw for clubs in each association represented in the career. */
(function(root,factory){
  const node=typeof module==="object"&&module.exports;
  const api=factory(node?require("./eleven-fixtures.js"):root.ElevenFixtures,
    node?require("./eleven-clubs.js"):root.ElevenClubs);
  if(node)module.exports=api;
  else root.ElevenDomesticCup=api;
})(typeof window!=="undefined"?window:globalThis,function(fixtures,registry){
  "use strict";
  const matchdays=[3,7,13,21];
  const stageNames={3:"十六强",7:"八强",13:"半决赛",21:"决赛"};

  function shuffled(items,random){
    const out=[...items];
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  }
  function shootout(random){
    const score=[0,0];
    for(let kick=0;kick<5;kick++){
      if(random()<.76)score[0]++;
      if(score[0]>score[1]+5-kick||score[1]>score[0]+4-kick)return score;
      if(random()<.76)score[1]++;
      if(Math.abs(score[0]-score[1])>4-kick)return score;
    }
    while(score[0]===score[1]){
      if(random()<.76)score[0]++;
      if(random()<.76)score[1]++;
    }
    return score;
  }
  function winner(m){
    const [a,b]=m.penalties||m.score;
    return a>b?m.home:m.away;
  }
  function playCup(country,clubs,opponents,randomFor){
    const size=clubs.size<=8?8:16;
    const draw=randomFor("draw:"+country);
    const members=registry.cupTeams(country);
    if([...clubs.keys()].some(team=>!members.includes(team)))throw Error("球队未在杯赛名单内："+country);
    const leaguePeers=[...opponents].filter(name=>members.includes(name)&&!clubs.has(name));
    const pool=shuffled(leaguePeers,draw);
    if(clubs.size+pool.length<size){
      const reserves=members.filter(name=>!clubs.has(name)&&!opponents.has(name));
      pool.push(...shuffled(reserves,draw));
    }
    if(clubs.size+pool.length<size)throw Error("杯赛球队数量不足："+country);
    let teams=shuffled([...clubs.keys()].sort().concat(pool.slice(0,size-clubs.size)),draw);
    const matches=[];
    for(const round of matchdays.slice(-Math.log2(size))){
      const advancing=[];
      for(let i=0;i<teams.length;i+=2){
        const home=teams[i],away=teams[i+1];
        const random=randomFor(JSON.stringify([country,round,home,away]));
        const lines=[home,away].map(team=>fixtures.clubLineup(clubs.get(team)||[],round,random));
        const m={round,home,away,...fixtures.scoreLineups(lines,random)};
        if(m.score[0]===m.score[1])m.penalties=shootout(random);
        matches.push(m);
        advancing.push(winner(m));
      }
      teams=advancing;
    }
    return {country,matches};
  }
  function season(players,leagueMatches,countryFor,randomFor){
    const groups=new Map();
    for(const p of players){
      const country=countryFor(p.league);
      if(!country)continue;
      if(!groups.has(country))groups.set(country,{clubs:new Map(),opponents:new Set()});
      const {clubs}=groups.get(country);
      if(!clubs.has(p.club))clubs.set(p.club,[]);
      clubs.get(p.club).push(p);
    }
    for(const m of leagueMatches){
      const group=groups.get(countryFor(m.league));
      if(group){group.opponents.add(m.home);group.opponents.add(m.away)}
    }
    const cups=[];
    for(const [country,{clubs,opponents}] of groups){
      const cup=playCup(country,clubs,opponents,randomFor);
      const champion=winner(cup.matches.at(-1));
      for(const p of clubs.get(champion)||[])p.seasons.at(-1).trophy=country+"国内杯冠军";
      cups.push(cup);
    }
    return cups;
  }

  function validDraw(cup,players,offset,countryFor,validScoreSheet){
    if(!cup||!Array.isArray(cup.matches)||![7,15].includes(cup.matches.length))return false;
    const size=cup.matches.length+1;
    let remaining=size,previous=[],start=0;
    for(const round of matchdays.slice(-Math.log2(size))){
      const entrants=[],winners=[];
      for(const m of cup.matches.slice(start,start+remaining/2)){
        if(!validScoreSheet(m)||m.round!==round)return false;
        if(m.score[0]===m.score[1]){
          if(!Array.isArray(m.penalties)||m.penalties.length!==2||m.penalties[0]===m.penalties[1]
            ||!m.penalties.every(n=>Number.isSafeInteger(n)&&n>=0))return false;
        }else if(m.penalties!==undefined)return false;
        entrants.push(m.home,m.away);
        for(const [side,line] of m.lineups.entries())for(const id of line){
          const s=players[id-1].seasons[offset];
          if(s.club!==(side===0?m.home:m.away)||countryFor(s.league)!==cup.country
            ||(round>=s.injuryStart&&round<s.injuryStart+s.injuryGames))return false;
        }
        winners.push(winner(m));
      }
      if(start===0){
        if(new Set(entrants).size!==size||players.some(p=>{
          const s=p.seasons[offset];
          return countryFor(s.league)===cup.country&&!entrants.includes(s.club);
        }))return false;
      }else if(!entrants.every((team,i)=>team===previous[i]))return false;
      previous=winners;start+=remaining/2;remaining/=2;
    }
    return players.every(p=>{
      const s=p.seasons[offset];
      return countryFor(s.league)!==cup.country||s.trophy===(s.club===previous[0]?cup.country+"国内杯冠军":null);
    });
  }
  function validHistory(state,countryFor,validScoreSheet){
    if(state.cupHistory===undefined)return true;
    if(!state.cupHistory||typeof state.cupHistory!=="object"||Array.isArray(state.cupHistory))return false;
    for(const [year,cups] of Object.entries(state.cupHistory)){
      const offset=Number(year)-state.startYear-1;
      if(!Number.isInteger(offset)||String(Number(year))!==year||offset<1||offset>=state.yearsSimulated||!Array.isArray(cups))return false;
      const countries=new Set(state.players.map(p=>countryFor(p.seasons[offset].league)).filter(Boolean));
      if(countries.size!==cups.length)return false;
      for(const cup of cups){
        if(Number(year)>=state.realTeamsFromYear && Array.isArray(cup?.matches)){
          const members=registry.cupTeams(cup.country);
          if(cup.matches.some(m=>!m||!members.includes(m.home)||!members.includes(m.away)))return false;
        }
        if(!countries.delete(cup?.country)||!validDraw(cup,state.players,offset,countryFor,validScoreSheet))return false;
      }
    }
    return true;
  }
  return {season,winner,stageNames,validHistory};
});
