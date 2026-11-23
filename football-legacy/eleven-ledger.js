/* Eleven-player competition ledger. Derived exclusively from match score sheets.
 * Does not mutate saved seasons, localStorage or the historical three-player game.
 */
(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.ElevenCompetitionLedger=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  const zero=()=>({apps:0,goals:0,assists:0,cleanSheets:0,wins:0,draws:0,losses:0});
  const add=(a,b)=>Object.fromEntries(Object.keys(a).map(k=>[k,a[k]+b[k]]));
  function tally(matches,id,position){
    const total=zero();
    for(const match of matches||[]){
      const side=match.lineups?.findIndex(line=>line.includes(id))??-1;
      if(side<0)continue;
      total.apps++;
      if(match.score[1-side]===0&&["GK","RB","CB","LB"].includes(position))total.cleanSheets++;
      if(match.score[side]>match.score[1-side])total.wins++;
      else if(match.score[side]<match.score[1-side])total.losses++;
      else total.draws++;
      for(const [goalSide,scorer,helper] of match.goals){
        if(goalSide!==side)continue;
        if(scorer===id)total.goals++;
        if(helper===id)total.assists++;
      }
    }
    return total;
  }
  function season(state,year,id){
    const p=state.players.find(row=>row.id===id);
    if(!p)return null;
    const idx=Number(year)-state.startYear-1,s=p.seasons[idx];
    if(!s)return null;
    const league=(state.fixtures?.[year]||[]).filter(m=>m.league===s.league&&
      (m.home===s.club||m.away===s.club));
    const cups=(state.cupHistory?.[year]||[]).flatMap(c=>c.matches).filter(m=>m.home===s.club||m.away===s.club);
    const national=(state.nationalFixtures?.[year]||[]).filter(m=>m.lineups.some(line=>line.includes(id)));
    const stats={league:tally(league,id,p.position),cup:tally(cups,id,p.position),national:tally(national,id,p.position)};
    const total=add(add(stats.league,stats.cup),stats.national);
    const caps=national.filter(m=>m.level==="成年队").length;
    const cupChampion=!!s.trophy;
    const complete={league:!!state.fixtures?.[year],cup:Array.isArray(state.cupHistory?.[year]),national:!!state.nationalFixtures?.[year]};
    return {year:Number(year),id,club:s.club,leagueName:s.league,position:p.position,
      ...stats,total,caps,cupChampion,complete};
  }
  function career(state,id){
    const p=state.players.find(row=>row.id===id);
    if(!p)return null;
    const seasons=p.seasons.map(s=>season(state,s.year,id)).filter(Boolean);
    const total=seasons.reduce((a,s)=>add(a,s.total),zero());
    return {id,seasons,total,adultCaps:seasons.reduce((n,s)=>n+s.caps,0),
      cupTitles:seasons.filter(s=>s.cupChampion).length};
  }
  return Object.freeze({zero,tally,season,career});
});
