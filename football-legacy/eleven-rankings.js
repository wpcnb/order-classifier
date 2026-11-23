/* Eleven-player career leaderboard: read-only derived view of existing saved seasons.
 * These scores are GAME assessments; never suggest an award or transfer is real.
 * No writes to the established career save format or its localStorage key.
 */
(function(root){
  "use strict";
  const BIG_FIVE=Object.freeze(["英超","西甲","德甲","意甲","法甲"]);
  const eliteSeason=s=>s.tier==="top"||BIG_FIVE.includes(s.league)||s.league==="欧洲五大联赛";
  const safeInt=x=>Number.isFinite(x)&&x>0?x:0;
  function rank(state){
    if(!state||!Array.isArray(state.players))return [];
    const awards=state.awardHistory||{};
    const rows=state.players.map(p=>{
      const seasons=Array.isArray(p.seasons)?p.seasons:[];
      const premier=seasons.filter(eliteSeason);
      const leagueNames=[...new Set(premier.map(s=>BIG_FIVE.includes(s.league)?s.league:
        BIG_FIVE.find(league=>String(s.club||"").startsWith(league))||"欧洲五大联赛"))];
      const ballonYears=[],worldYears=[];
      for(const [year,won] of Object.entries(awards)){
        if(won?.["金球奖"]?.id===p.id)ballonYears.push(Number(year));
        if(won?.["世界足球先生"]?.id===p.id)worldYears.push(Number(year));
      }
      const apps=seasons.reduce((n,s)=>n+safeInt(s.apps),0);
      const goals=seasons.reduce((n,s)=>n+safeInt(s.goals),0);
      const assists=seasons.reduce((n,s)=>n+safeInt(s.assists),0);
      const cleanSheets=seasons.reduce((n,s)=>n+safeInt(s.cleanSheets),0);
      const caps=seasons.reduce((n,s)=>n+safeInt(s.caps),0);
      const cups=seasons.filter(s=>!!s.trophy).length;
      const squadBest=seasons.filter(s=>!!s.squadAward).length;
      const peak=Math.max(safeInt(p.initialRating),safeInt(p.rating),
        ...seasons.map(s=>safeInt(s.rating)));
      const contribution=p.position==="GK"?cleanSheets*2.5
        :["CB","LB","RB","CDM"].includes(p.position)?cleanSheets*1.4+assists*1.5+goals*2
        :goals*2+assists*1.6;
      const points=Math.round((ballonYears.length*2000+worldYears.length*1100+
        premier.length*95+peak*5+apps*.2+caps*1.5+
        cups*20+squadBest*8+contribution)*10)/10;
      return {id:p.id,name:p.name,position:p.position,points,peak,
        topFiveYears:premier.length,topFiveLeagues:leagueNames,
        ballonYears:ballonYears.sort((a,b)=>a-b),
        worldYears:worldYears.sort((a,b)=>a-b),
        apps,goals,assists,cleanSheets,caps,cups,squadBest};
    });
    return rows.sort((a,b)=>b.points-a.points||b.ballonYears.length-a.ballonYears.length||
      b.topFiveYears-a.topFiveYears||b.peak-a.peak||a.id-b.id)
      .map((p,i)=>({...p,rank:i+1}));
  }
  const api=Object.freeze({rank,BIG_FIVE,eliteSeason});
  root.ElevenCareerRankings=api;
  if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
