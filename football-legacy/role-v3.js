/* 绿茵传奇 v3.3 位置赛季系统。
   比赛中的防守、对抗和传球事件属于游戏模拟，不冒充真实比赛数据。
   旧存档缺少此数据时，只使用原有比分、零封和评分作为兼容依据。 */
(function(root,factory){
 const api=factory();root.FootballRolesV3=api;
 if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis==="object"?globalThis:this,function(){
 "use strict";
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
 const num=x=>Number.isFinite(Number(x))?Number(x):0;
 const group=pos=>pos==="GK"?"keeper":["CB","LB","RB"].includes(pos)?"defender":pos==="CDM"?"holding":pos==="CM"?"midfield":pos==="CAM"?"creator":"forward";
 const LABELS={keeper:"门将",defender:"后卫",holding:"后腰",midfield:"中场",creator:"前腰",forward:"前锋/边锋"};
 function trials(n,prob,random){
  let count=0;
  for(let i=0;i<Math.floor(clamp(n,0,100));i++)if(random()<clamp(prob,.04,.96))count++;
  return count;
 }
 function simulateMatch(p,match,random=Math.random){
  if(!p||!match||!num(match.minutesPlayed))return null;
  const pos=group(p.position),min=clamp(num(match.minutesPlayed),1,120),scale=min/90;
  const stats=p.stats||{},def=num(stats.defense)||65,phy=num(stats.physical)||65,
   mental=num(stats.mental)||65,passing=num(stats.pass)||65,dribble=num(stats.dribble)||65;
  const opp=clamp(num(match.opponentPower)||75,35,99),team=clamp(num(match.teamPower)||75,35,99);
  const pressure=clamp(1+(opp-team)/85,.72,1.30),against=clamp(num(match.goalsAgainst),0,12);
  const intensity={keeper:.65,defender:1.15,holding:1.22,midfield:1.10,creator:.78,forward:.63}[pos];
  const duelAttempts=Math.max(1,Math.round((6+random()*5)*scale*intensity*pressure));
  const duelWins=trials(duelAttempts,.33+phy*.0045+mental*.0015-(opp-70)*.0015,random);
  const tackles=Math.max(0,Math.round((pos==="defender"?5:pos==="holding"?5.5:pos==="midfield"?3.4:pos==="creator"?1.3:1.4)*scale*pressure+(random()-.5)*2));
  const tacklesWon=trials(tackles,.33+def*.005+phy*.001,random);
  const interceptions=trials(Math.max(1,Math.round((pos==="defender"||pos==="holding"?7:pos==="midfield"?5:2)*scale*pressure)),.21+def*.005,random);
  const recoveries=Math.max(0,Math.round((tacklesWon+interceptions)*(.8+random()*.35)));
  const passBase={keeper:27,defender:47,holding:57,midfield:63,creator:48,forward:27}[pos];
  const passesAttempted=Math.max(2,Math.round((passBase+random()*9)*scale));
  const passQuality=clamp(.54+passing*.0037+(pos==="keeper"?-.07:0)-(opp-75)*.001,.50,.94);
  const passesCompleted=trials(passesAttempted,passQuality,random);
  const progressivePasses=trials(passesCompleted,
   pos==="keeper"?.045:pos==="defender"?.13:pos==="holding"?.15:pos==="midfield"?.20:pos==="creator"?.19:.105,random);
  const chanceSamples=Math.round((pos==="creator"?5.5:pos==="midfield"?3.8:pos==="holding"?1.8:pos==="defender"?.8:pos==="forward"?2.1:.25)*scale);
  const chancesCreated=trials(chanceSamples,.23+passing*.004+(pos==="creator"?dribble*.001:0),random);
  // Goalkeeper saves cannot be fewer than 0; shots on target always include actual goals conceded.
  const shotsOnTarget=pos==="keeper"?against+Math.max(0,Math.round((3.2+random()*4.3)*scale*pressure)):0;
  const saves=pos==="keeper"?Math.max(0,shotsOnTarget-against):0;
  const claims=pos==="keeper"?trials(Math.max(1,Math.round(4.5*scale)),.27+mental*.005,random):0;
  const duelRate=duelAttempts?duelWins/duelAttempts:0;
  const passRate=passesAttempted?passesCompleted/passesAttempted:0;
  const saveRate=shotsOnTarget?saves/shotsOnTarget:0;
  let ratingBonus=0;
  if(pos==="keeper")ratingBonus=clamp((saveRate-.56)*.28+(saves-2)*.035,-.15,.20);
  else if(pos==="defender"||pos==="holding")ratingBonus=clamp((duelRate-.49)*.32+(tacklesWon+interceptions-4)*.014,-.13,.20);
  else if(pos==="midfield"||pos==="creator")ratingBonus=clamp((passRate-.72)*.22+(progressivePasses+chancesCreated-5)*.015,-.12,.20);
  return {version:1,source:"game-simulation",minutes:Math.round(min),
   duels:duelAttempts,duelsWon:duelWins,tackles,tacklesWon,interceptions,recoveries,
   passesAttempted,passesCompleted,progressivePasses,chancesCreated,
   shotsOnTarget,saves,claims,ratingBonus:Number(ratingBonus.toFixed(2))};
 }
 function summarize(matches,club){
  const list=(matches||[]).filter(m=>m&&m.played&&m.kind!=="national");
  const fields=["minutes","duels","duelsWon","tackles","tacklesWon","interceptions","recoveries",
   "passesAttempted","passesCompleted","progressivePasses","chancesCreated","shotsOnTarget","saves","claims"];
  const totals=Object.fromEntries(fields.map(key=>[key,0]));
  let recorded=0;
  for(const m of list){
   const r=m.roleActions;
   if(!r||r.source!=="game-simulation")continue;
   recorded++;
   for(const key of fields)totals[key]+=num(r[key]);
  }
  const mins=Math.max(1,totals.minutes);
  const per90=key=>Number((totals[key]*90/mins).toFixed(2));
  return {...totals,recorded,coverage:list.length?recorded/list.length:0,
   duelRate:totals.duels?totals.duelsWon/totals.duels:0,
   tackleRate:totals.tackles?totals.tacklesWon/totals.tackles:0,
   passRate:totals.passesAttempted?totals.passesCompleted/totals.passesAttempted:0,
   saveRate:totals.shotsOnTarget?totals.saves/totals.shotsOnTarget:0,
   tacklesPer90:per90("tacklesWon"),interceptionsPer90:per90("interceptions"),
   duelsPer90:per90("duelsWon"),recoveriesPer90:per90("recoveries"),
   progressivePer90:per90("progressivePasses"),chancesPer90:per90("chancesCreated"),
   savesPer90:per90("saves")};
 }
 function evaluate(p,n,gate,overall,tier){
  const pos=group(p.position),apps=num(n.apps),avg=num(n.avg),known=num(n.matchesWithScore),
   clean=num(n.cleanSheets),conceded=known?num(n.goalsAgainst)/known:null;
  const roles=n.role||{},hasActions=num(roles.recorded)>=Math.min(10,Math.ceil(apps*.50));
  const output=num(n.goals)+num(n.assists);
  // Actual match ratings are centered near 6.6 for defensive players; high 7.x
  // thresholds made promotion impossible for them, especially in weak clubs.
  const ratingBase=[6.38,6.45,6.52,6.59,6.66,6.73][tier]??6.73;
  const adjustment={forward:.08,creator:.06,midfield:.03,holding:0,defender:0,keeper:0}[pos];
  const rating=ratingBase+adjustment;
  const minApps=Math.max(13,Math.min(num(gate?.apps)||16,22)-2);
  const strong=avg>=rating+.24;
  const extra={
   keeper:hasActions?(roles.savesPer90>=1.25&&roles.saveRate>=.54||clean>=3||strong):
     (known>=Math.ceil(apps*.65)&&(clean>=3||conceded!==null&&conceded<=1.85||strong)),
   defender:hasActions?(roles.tacklesPer90+roles.interceptionsPer90>=1.5&&roles.duelRate>=.40||clean>=3||strong):
     (known>=Math.ceil(apps*.65)&&(clean>=3||conceded!==null&&conceded<=1.85||strong)),
   holding:hasActions?(roles.tacklesPer90+roles.interceptionsPer90>=1.4||roles.recoveriesPer90>=2.0||strong):
     (known>=Math.ceil(apps*.65)&&(clean>=3||conceded!==null&&conceded<=2||strong)),
   midfield:hasActions?(roles.passRate>=.63&&roles.progressivePer90>=2.0||roles.chancesPer90>=.45||strong):
     (strong||avg>=rating+.08&&apps>=18),
   creator:hasActions?(roles.chancesPer90>=.65&&roles.progressivePer90>=2||strong&&roles.passRate>=.64):
     (output>=Math.ceil([4,5,6,7,8,8][tier]||8)||strong&&num(n.assists)>=2),
   forward:output>=Math.ceil([6,8,10,12,14,16][tier]||16)||num(n.goals)>=Math.max(2,num(gate?.g)-2)&&avg>=rating+.08
  }[pos];
  const ovGate=num(gate?.ov);
  const qualified=apps>=minApps&&avg>=rating&&num(overall)>=ovGate&&!!extra;
  // Relegation is assessed on one's own role, not solely on a team's clean sheets.
  const healthy=apps>=22&&!p.retired&&!p.youth&&num(p.injuryMatches)===0&&(p.age===undefined||num(p.age)<35);
  const bad=pos==="keeper"?hasActions?roles.saveRate<.42&&clean<2:conceded!==null&&conceded>=2.7:
   pos==="defender"?hasActions?roles.duelRate<.34&&roles.tacklesPer90<.6:conceded!==null&&conceded>=2.7:
   pos==="holding"?hasActions?roles.recoveriesPer90<1.0&&roles.duelRate<.34:conceded!==null&&conceded>=2.8:
   pos==="midfield"?hasActions?roles.passRate<.55&&roles.progressivePer90<1:avg<6.0:
   pos==="creator"?hasActions?roles.chancesPer90<.25&&roles.passRate<.55:avg<6.0:
   output<Math.max(2,Math.ceil([6,8,10,12,14,16][tier]/4));
  const poor=healthy&&(avg<6.03||avg<6.32&&bad);
  const descriptions={
   keeper:"门将：扑救成功率、场均扑救、出场、评分和实际失球；不要求进球助攻。",
   defender:"后卫：抢断、拦截、对抗成功率、出场和评分；球队零封是参考，不是唯一门槛。",
   holding:"后腰：抢断、拦截、球权回收、对抗和评分；进球助攻不参与升降档。",
   midfield:"中场：传球成功率、推进传球、创造机会、出场和评分；不需要进球助攻。",
   creator:"前腰：关键组织、机会创造、向前传球和评分；不以个人进球为门槛。",
   forward:"前锋/边锋：进球、助攻、出场与评分。"
  };
  let roleScore;
  if(pos==="keeper")roleScore=hasActions?(roles.saveRate*.5+Math.min(1,roles.savesPer90/3)*.5):clamp((clean+2)/Math.max(3,apps),0,1);
  else if(pos==="defender"||pos==="holding")roleScore=hasActions?(roles.duelRate*.55+Math.min(1,(roles.tacklesPer90+roles.interceptionsPer90)/4)*.45):clamp(clean/Math.max(4,apps*.25),0,1);
  else if(pos==="midfield"||pos==="creator")roleScore=hasActions?(roles.passRate*.5+Math.min(1,(roles.progressivePer90+roles.chancesPer90)/6)*.5):clamp(avg/9,0,1);
  else roleScore=clamp(output/Math.max(1,[6,8,10,12,14,16][tier]),0,1);
  const performanceIndex=clamp((avg-rating)*.6+roleScore,0,2);
  return {group:pos,apps,average:avg,known,clean,conceded,output,rating,minApps,
   roleScore:Number(roleScore.toFixed(2)),performanceIndex:Number(performanceIndex.toFixed(2)),
   hasActions,actions:roles,qualified:!!qualified,poor:!!poor,
   description:descriptions[pos],requiredOutput:pos==="forward"?[6,8,10,12,14,16][tier]:null};
 }
 return Object.freeze({group,simulateMatch,summarize,evaluate,LABELS});
});