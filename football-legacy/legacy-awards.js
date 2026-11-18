/* 绿茵信仰 S1.01 — FIFA The Best（游戏模拟）+ 退役球星相似度。
 * No official FIFA voting data or verified player statistics are claimed here.
 * Ballon d'Or voting is handled separately in game.js.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.FootballLegacyAwards=api;
})(typeof globalThis==="object"?globalThis:this,function(){
 "use strict";
 const GROUPS=["coach","captain","media","fans"];
 const GROUP_LABELS={coach:"国家队主教练",captain:"国家队队长",media:"足球记者",fans:"球迷"};
 const WEIGHTS={
  coach:{form:.37,impact:.17,team:.23,ability:.10,available:.13},
  captain:{form:.32,impact:.18,team:.24,ability:.14,available:.12},
  media:{form:.31,impact:.23,team:.29,ability:.08,available:.09},
  fans:{form:.28,impact:.20,team:.22,ability:.18,available:.12}
 };
 const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
 const num=x=>Number.isFinite(Number(x))?Number(x):0;
 const hash=x=>{let n=2166136261;for(const ch of String(x)){n^=ch.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0};
 const rand=x=>hash(x)/4294967295;
 const dim=(n,max)=>clamp(num(n)/max);
 function positionGroup(pos){
  if(pos==="GK")return "GK";
  if(["CB","LB","RB"].includes(pos))return "DEF";
  if(["CDM","CM","CAM"].includes(pos))return "MID";
  return "ATT";
 }
 function candidateFeatures(p){
  const type=positionGroup(p.position||p.pos);
  const goalsMax={ATT:40,MID:19,DEF:6,GK:1}[type];
  const assistsMax={ATT:21,MID:22,DEF:9,GK:1}[type];
  const apps=clamp(num(p.apps),0,65);
  const involvement=clamp((dim(p.goals,goalsMax)*.56+dim(p.assists,assistsMax)*.44));
  const sheets=apps?clamp(num(p.cleanSheets)/apps/.48):0;
  const form=clamp((num(p.awardRating??p.rating)-5.9)/2.9);
  const ability=clamp((num(p.ov)-58)/41);
  const team=dim(p.teamBonus,48);
  // Defensive players are evaluated on their role. Unknown historical clean
  // sheets are NOT interpreted as a season of zero clean sheets for defenders.
  const defense=type==="GK"?clamp(sheets*.65+form*.20+ability*.15):
   type==="DEF"?clamp(form*.50+ability*.30+team*.20):involvement;
  return {
   form,
   impact:type==="GK"?clamp(defense*.93+involvement*.07):
      type==="DEF"?clamp(defense*.87+involvement*.13):involvement,
   team,
   ability,
   available:dim(apps,55)
  };
 }
 function ballotScore(p,group){
  const f=candidateFeatures(p),w=WEIGHTS[group];
  return Object.keys(w).reduce((sum,k)=>sum+w[k]*f[k],0)*100;
 }
 // All four groups use independently simulated top-three ballots (5/3/1).
 // Each group's sum is normalised to 25%; no votes from real FIFA users.
 function electTheBest(nominees,year){
  if(!Array.isArray(nominees)||nominees.length<3)return null;
  const candidates=nominees.filter(p=>p&&p.id&&p.name&&num(p.apps)>0);
  if(candidates.length<3)return null;
  const board=candidates.map(p=>({...p,
   groupBase:Object.fromEntries(GROUPS.map(g=>[g,ballotScore(p,g)]))
  })).sort((a,b)=>GROUPS.reduce((s,g)=>s+b.groupBase[g]-a.groupBase[g],0)||
    String(a.id).localeCompare(String(b.id))).slice(0,11);
  const totals=Object.fromEntries(board.map(p=>[p.id,Object.fromEntries(GROUPS.map(g=>[g,0]))]));
  for(const group of GROUPS)for(let voter=0;voter<100;voter++){
   const sorted=board.map(p=>({
    id:p.id,
    score:p.groupBase[group]+(rand(year+"|"+group+"|"+voter+"|"+p.id)-.5)*18
   })).sort((a,b)=>b.score-a.score||String(a.id).localeCompare(String(b.id)));
   [5,3,1].forEach((pts,i)=>totals[sorted[i].id][group]+=pts);
  }
  const rankings=board.map(p=>{
   const groups=Object.fromEntries(GROUPS.map(g=>[g,
    Number((totals[p.id][g]/900*25).toFixed(4))
   ]));
   const score=Number(GROUPS.reduce((s,g)=>s+groups[g],0).toFixed(4));
   return {id:p.id,name:p.name,club:p.club,position:p.position||p.pos,
    goals:num(p.goals),assists:num(p.assists),apps:num(p.apps),
    groups,score};
  }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  return {year,model:2,official:false,groups:GROUP_LABELS,
   ballotsPerGroup:100,rankings,winner:{...rankings[0]},criteria:"FIFA四类选民等权的游戏模拟，非真实FIFA投票"};
 }
 // European club honours are nationality-neutral. A champion receives
 // the championship score once, never a sum of earlier knockout rounds.
 function europeanPrestige(club,year,shared){
  if(!club||!Number.isFinite(Number(year)))return 0;
  const stageRank={"附加赛":1,"十六强":2,"八强":3,"半决赛":4,"决赛":5};
  const byType={"欧冠":[0,1,3,5,9,16,30],"欧联":[0,1,2,3,5,9,16]};
  let best=0;
  for(const comp of Object.values(shared?.europeCompetitions||{})){
   if(Number(comp?.year)!==Number(year)||!byType[comp?.type]||!Array.isArray(comp.clubs)||!comp.clubs.includes(club))continue;
   const points=byType[comp.type];
   if(comp.champion===club){best=Math.max(best,points[6]);continue}
   const highest=(comp.knockout||[]).filter(t=>(t.a===club||t.b===club)&&stageRank[t.stage])
    .reduce((n,t)=>Math.max(n,stageRank[t.stage]),0);
   best=Math.max(best,points[highest]);
  }
  // Historical saves may only preserve an adjudicated final. No other
  // qualification, playoff or runner-up finish is inferred from that.
  for(const [type,points] of Object.entries(byType)){
   if(shared?.europeFinals?.[year+":"+type]?.winner===club)best=Math.max(best,points[6]);
  }
  return best;
 }
 // Reference vectors are explicitly *designer-curated comparative archetypes*,
 // NOT verified match statistics, career totals or official player ratings.
 // The two award counts are historical public trophy counts, based on distinct
 // award eras (pre-2016 FIFA World Player vs post-2016 The Best).
 const LEGENDS=[
  ["克里斯蒂亚诺·罗纳尔多","ST",[1,.96,.42,.94,.91,.64,5,2],"The Best 2016-2017"],
  ["梅西","RW",[1,.87,1,.91,.88,1,8,3],"The Best 2019、2022、2023"],
  ["罗纳尔多（巴西）","ST",[.76,.94,.33,.65,.35,.98,2,3],"FIFA世界足球先生（旧制）"],
  ["齐达内","CAM",[.82,.42,.87,.85,.56,1,1,3],"FIFA世界足球先生（旧制）"],
  ["罗纳尔迪尼奥","CAM",[.64,.70,.91,.77,.65,.87,1,2],"FIFA世界足球先生（旧制）"],
  ["卡卡","CAM",[.67,.71,.71,.67,.48,.60,1,1],"FIFA世界足球先生（旧制）"],
  ["莫德里奇","CM",[.97,.28,.74,.88,1,.65,1,1],"The Best 2018"],
  ["本泽马","ST",[.96,.81,.65,.91,.84,.36,1,0],"The Best（2016年后）"],
  ["哈维","CM",[.94,.27,.99,1,.75,.91,0,0],"The Best（2016年后）"],
  ["伊涅斯塔","CAM",[.91,.35,.95,1,.74,.93,0,0],"The Best（2016年后）"],
  ["莱万多夫斯基","ST",[.96,.97,.39,.91,.67,.28,0,2],"The Best 2020-2021"],
  ["内马尔","LW",[.85,.76,.93,.85,.63,.84,0,0],"The Best（2016年后）"],
  ["萨拉赫","RW",[.86,.87,.67,.76,.45,.28,0,0],"The Best（2016年后）"],
  ["卡纳瓦罗","CB",[.83,.10,.20,.80,.40,1,1,1],"FIFA世界足球先生（旧制）"],
  ["塞尔吉奥·拉莫斯","CB",[.96,.32,.25,.95,.74,.93,0,0],"The Best（2016年后）"],
  ["马尔蒂尼","CB",[1,.12,.31,.93,.83,.21,0,0],"FIFA世界足球先生（旧制）"],
  ["诺伊尔","GK",[.94,.04,.20,.96,.73,.91,0,0],"The Best（2016年后）"],
  ["布冯","GK",[.99,.04,.18,.89,.45,.94,0,0],"FIFA世界足球先生（旧制）"],
  // Additional designer-curated archetypes: these are not official statistics.
  ["卡西利亚斯","GK",[.94,.03,.15,.96,.88,1,0,0],"FIFA个人大奖"],
  ["切赫","GK",[.97,.02,.14,.91,.68,.37,0,0],"FIFA个人大奖"],
  ["范德萨","GK",[.96,.02,.18,.91,.79,.31,0,0],"FIFA个人大奖"],
  ["雅辛","GK",[.83,.04,.14,.93,.83,.66,1,0],"FIFA世界足球先生（旧制）"],
  ["拉姆","RB",[.97,.13,.59,.96,.94,1,0,0],"The Best（2016年后）"],
  ["普约尔","CB",[.91,.09,.22,.94,.72,.97,0,0],"FIFA世界足球先生（旧制）"],
  ["蒂亚戈·席尔瓦","CB",[.99,.15,.26,.87,.57,.48,0,0],"The Best（2016年后）"],
  ["内斯塔","CB",[.93,.07,.15,.94,.77,.68,0,0],"FIFA世界足球先生（旧制）"],
  ["卡福","RB",[.95,.16,.48,.92,.69,1,0,0],"FIFA世界足球先生（旧制）"]
 ];
 const VECTOR_KEYS=["长寿程度","进球效率","创造机会","国内荣誉","欧战荣誉","国家队成就","金球奖","国际足联个人大奖"];
 const SIM_WEIGHT=[.12,.16,.13,.11,.13,.11,.13,.11];
 const COMPARE=LEGENDS.map(([name,position,raw,era])=>Object.freeze({
  name,position,era,ballon:raw[6],worldBest:raw[7],
  vector:Object.freeze(raw.map((x,i)=>i===6?clamp(x/8):i===7?clamp(x/4):x))
 }));
 function awardYears(game,fifaAwards={}){
  const gold=new Set((game?.ballonHistory||[]).filter(x=>x?.rank===1).map(x=>String(x.year)));
  const world=new Set(Object.entries(fifaAwards||{}).filter(([_,v])=>
   v?.winner?.id==="DUO_"+game?.duoId).map(([y])=>String(y)));
  for(const h of game?.honors||[]){
   if(h.legacyDisputed)continue;
   if(/世界足球先生（FIFA The Best）/.test(String(h.name)))world.add(String(h.year));
  }
  return {ballon:gold.size,worldBest:world.size};
 }
 function careerVector(game,fifaAwards){
  const p=game.player,c=p.career||{},apps=num(c.apps),honors=(game.honors||[]).filter(h=>!h.legacyDisputed);
  const n=awardYears(game,fifaAwards);
  const leagues=honors.filter(h=>h.type==="team"&&/联赛.*冠军|英超冠军|西甲冠军|德甲冠军|意甲冠军|法甲冠军|中超冠军|荷甲冠军|葡超冠军/.test(h.name)).length;
  const euros=honors.filter(h=>/欧冠冠军|欧联冠军/.test(h.name)).length;
  const worlds=honors.filter(h=>h.type==="national"&&/世界杯.*冠军/.test(h.name)).length;
  const otherNational=honors.filter(h=>h.type==="national"&&/亚洲杯|欧洲杯|美洲杯/.test(h.name)&&/冠军/.test(h.name)).length;
  return [
   dim(apps,1000),apps?clamp(num(c.goals)/apps/.85):0,
   apps?clamp(num(c.assists)/apps/.45):0,
   dim(leagues,11),dim(euros,6),clamp(worlds*.75+otherNational*.3),
   dim(n.ballon,8),dim(n.worldBest,4)
  ];
 }
 function similarity(game,fifaAwards={},limit=5){
  if(!game?.player||num(game.player.career?.apps)<1)return [];
  const vector=careerVector(game,fifaAwards),pos=game.player.position||"LW",role=positionGroup(pos);
  // Compare *only* like-for-like broad roles. An attacker can resemble a
  // winger or striker, but never a centre-back or goalkeeper on style metrics.
  return COMPARE.filter(ref=>positionGroup(ref.position)===role).map(ref=>{
   const penalty=pos===ref.position?0:3;
   const variance=vector.reduce((s,n,i)=>s+SIM_WEIGHT[i]*(n-ref.vector[i])**2,0);
   const similarity=clamp(100-88*Math.sqrt(variance)-penalty,0,100);
   const close=VECTOR_KEYS.map((label,i)=>({label,diff:Math.abs(vector[i]-ref.vector[i])}))
    .sort((a,b)=>a.diff-b.diff).slice(0,2).map(x=>x.label);
   return {name:ref.name,position:ref.position,similarity:Math.round(similarity),
    highlights:close,referenceType:"游戏设计参考画像",awardEra:ref.era,
    ballon:ref.ballon,worldBest:ref.worldBest};
  }).sort((a,b)=>b.similarity-a.similarity||a.name.localeCompare(b.name)).slice(0,clamp(limit,1,COMPARE.length));
 }
 return Object.freeze({GROUPS,GROUP_LABELS,electTheBest,europeanPrestige,awardYears,careerVector,similarity,legends:COMPARE});
});
