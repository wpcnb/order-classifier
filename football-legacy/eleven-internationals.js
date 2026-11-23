/* Five fictional international windows, each immediately after the indicated league round. */
(function(root, factory){
  const api=factory(typeof module==="object"&&module.exports?require("./eleven-fixtures.js"):root.ElevenFixtures);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.ElevenInternationals=api;
})(typeof window!=="undefined"?window:globalThis,function(fixtures){
  "use strict";
  const windows=[4,8,12,16,20];
  const baseAssociations=["中国","英格兰","西班牙","法国","葡萄牙","日本"];
  const extraAssociations=["德国","巴西","比利时","乌克兰","荷兰","乌拉圭","土耳其",
    "摩洛哥","科特迪瓦","波兰","克罗地亚","丹麦","瑞典","埃及","韩国","加拿大",
    "奥地利","塞内加尔","哥伦比亚","格鲁吉亚","俄罗斯","厄瓜多尔","意大利","阿根廷"];
  const associations=[...baseAssociations,...extraAssociations];
  const levels=["U17","U19","U21","U23","成年队"];
  const cutoff={U17:54,U19:58,U21:62,U23:65,成年队:72};
  function youthLevel(age){
    return levels.slice(0,4).find(level=>age<=Number(level.slice(1)));
  }
  // Only evaluate matches played by this window. Keepers and defenders earn
  // form credit for preventing goals; all positions earn credit for minutes.
  function recentForm(player,clubMatches,round){
    let form=0,apps=0;
    for(const m of clubMatches){
      if(m.round>round||m.round<=round-4||m.league!==player.league)continue;
      const side=m.lineups.findIndex(line=>line.includes(player.id));
      if(side<0)continue;
      apps++;
      if(["GK","CB","RB","LB","CDM"].includes(player.position)&&m.score[1-side]===0)form+=1;
      for(const [,scorer,helper] of m.goals){
        if(scorer===player.id||helper===player.id)form++;
      }
    }
    return apps+(Math.min(form,4)) - 3;
  }
  function select(players,matches,round,randomFor){
    const teams=new Map();
    for(const p of players){
      const s=p.seasons.at(-1);
      if(round>=s.injuryStart&&round<s.injuryStart+s.injuryGames)continue;
      const country=p.country||"中国", youth=youthLevel(p.age);
      const random=randomFor("selection:"+round+":"+p.id);
      const score=p.rating+recentForm(p,matches,round)+(random()-.5)*9;
      const depth=country==="中国"?0:4;
      const level=p.age>=18&&score>=cutoff.成年队+depth?"成年队":youth;
      if(!level||score<cutoff[level]+depth)continue;
      if(!teams.has(level))teams.set(level,new Map());
      const group=teams.get(level);
      if(!group.has(country))group.set(country,[]);
      group.get(country).push(p);
    }
    return teams;
  }
  function lineup(members,level,country){
    const pool=[...(members||[])];
    return fixtures.roles.map(position=>{
      const index=pool.findIndex(p=>p.position===position);
      return index<0?{id:null,position,rating:cutoff[level]+(country==="中国"?0:4)}:pool.splice(index,1)[0];
    });
  }
  function season(players,clubMatches,randomFor,year){
    // Keep old five-country careers' match calendar and fixed seeds unchanged.
    // Expanded matchdays only apply when a newly added club player represents
    // an association outside the original international simulation pool.
    const extra=players.some(p=>!baseAssociations.includes(p.country||"中国"));
    const matches=[],rotation=(extra?associations:baseAssociations).slice();
    for(const round of windows){
      const selections=select(players,clubMatches,round,randomFor);
      for(const [level,teams] of selections){
        for(let i=0;i<rotation.length/2;i++){
          const pair=[rotation[i],rotation[rotation.length-1-i]];
          if(!pair.some(country=>teams.has(country)))continue;
          if((year+i+round/4)%2===0)pair.reverse();
          const [home,away]=pair;
          const lines=pair.map(country=>lineup(teams.get(country),level,country));
          const random=randomFor(JSON.stringify([level,round,home,away]));
          const result=fixtures.scoreLineups(lines,random);
          matches.push({round,level,home,away,...result});
          for(const line of lines)for(const p of line){
            if(!p.id)continue;
            if(level==="成年队"){
              p.caps++;
              p.careerCaps++;
              p.seasons.at(-1).caps++;
            }
            if(!p.caps||level==="成年队")p.nationalStage=(p.country||"中国")+level;
          }
        }
      }
      rotation.splice(1,0,rotation.pop());
    }
    return matches;
  }
  return {season,windows,levels,associations,youthLevel};
});
