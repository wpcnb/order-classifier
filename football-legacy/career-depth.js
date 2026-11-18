(()=>{
"use strict";
/* v6.2: deterministic career decisions and bounded season-based growth.
   This module never loads remote data and never modifies an old save on import. */
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
const ROLE_NAMES={LW:"左边锋",RW:"右边锋",ST:"中锋",CAM:"前腰",CM:"中场",CDM:"后腰",CB:"中后卫",GK:"门将"};
const TRANSITIONS={
 LW:["LW","RW","ST","CAM"],RW:["RW","LW","ST","CAM"],
 ST:["ST","LW","RW","CAM"],CAM:["CAM","CM","LW","RW","ST"],
 CM:["CM","CAM","CDM"],CDM:["CDM","CM","CB"],CB:["CB","CDM"],GK:["GK"]
};
const TRAITS={
 speed:{label:"速度爆点",detail:"突破表现略有提升，适合边路。"},
 finish:{label:"禁区杀手",detail:"提高本人分配到实际球队进球的机会。"},
 create:{label:"传球大师",detail:"提高本人分配到实际球队助攻的机会。"},
 defense:{label:"防守铁闸",detail:"有助于获得稳定的防守位置首发机会。"},
 big:{label:"大赛先生",detail:"在重大赛事略微提高参与进攻的机会。"},
 robust:{label:"体能强悍",detail:"比赛受伤风险略低。"},
 technique:{label:"技术突破",detail:"侧重盘带、传球与进攻连接。"}
};
function traitFor(p){
 if(TRAITS[p?.careerTrait])return p.careerTrait;
 const s=p?.stats||{},pos=p?.position;
 if(pos==="CB"||pos==="CDM"||pos==="GK")return "defense";
 if((s.shoot||0)>=(s.pace||0)+6&&["ST","LW","RW"].includes(pos))return "finish";
 if((s.pass||0)>=(s.pace||0)+1)return "create";
 if((s.pace||0)>=80)return "speed";
 if((s.physical||0)>=(s.dribble||0)+8)return "robust";
 if((s.mental||0)>=(s.shoot||0)+9)return "big";
 return "technique";
}
function traitInfo(p){const id=traitFor(p);return {id,...TRAITS[id]};}
function positionOptions(position){return (TRANSITIONS[position]||[position]).slice();}
function setPositionTarget(p,target){
 if(!p||p.retired||!positionOptions(p.position).includes(target))return false;
 if(target===p.position){p.positionTarget=null;p.positionProgress=0;return true}
 if(p.positionTarget!==target){p.positionTarget=target;p.positionProgress=0}
 return true;
}
function progressPosition(p){
 if(!p||p.retired||!p.positionTarget)return null;
 if(!positionOptions(p.position).includes(p.positionTarget)){p.positionTarget=null;p.positionProgress=0;return null}
 p.positionProgress=(p.positionProgress||0)+1;
 if(p.positionProgress<9)return {completed:false,progress:p.positionProgress};
 const from=p.position,to=p.positionTarget;
 p.position=to;p.positionTarget=null;p.positionProgress=0;
 p.positionHistory=p.positionHistory||[];
 p.positionHistory.push({from,to,age:p.age});
 p.positionHistory=p.positionHistory.slice(-20);
 return {completed:true,from,to};
}
function lineup(p,overall,teamPower,random=Math.random){
 const challenge=clamp((overall-teamPower)*.016,-.22,.20);
 const trust=clamp(((p.coachTrust||60)-60)*.004,-.16,.16);
 const form=clamp(((p.form||65)-65)*.003,-.12,.12);
 const transition=p.positionTarget?-.06:0;
 const specialty=traitFor(p)==="defense"&&["CB","CDM","GK"].includes(p.position)?.04:0;
 const body=window.BodyPath||null;
 const styleBonus=body?(body.starterBonus(p)+body.lineupBonus(p.careerPath)):0;
 const starterChance=clamp(.58+challenge+trust+form+transition+specialty+styleBonus,.22,.89);
 const started=random()<starterChance;
 const entryMinute=started?0:Math.floor(55+random()*20);
 return {started,entryMinute,starterChance};
}
function contributionModifiers(p,ev){
 const id=traitFor(p),big=["europe","europeKO","national"].includes(ev?.kind);
 return {shoot:id==="finish"?1.09:id==="speed"?1.045:id==="big"&&big?1.045:1,
         assist:id==="create"?1.10:id==="technique"?1.045:id==="big"&&big?1.04:1};
}
function injuryFactor(p){return traitFor(p)==="robust"?.83:1;}
// 游戏内估值（欧元），不是现实身价。获奖不是高身价的必要条件。
// 估值由独立模块实现；旧存档格式、其他比赛计算与奖项均不受影响。
function marketValueDetails(p,overall,tier,season,career){
 const market=window.FootballMarketV3;
 if(market)return market.details(p,overall,tier,season,career);
 return {value:0,source:"估值模块未加载",model:"unavailable"};
}
function marketValue(p,overall,tier,season,career){
 const market=window.FootballMarketV3;
 if(market)return market.marketValue(p,overall,tier,season,career);
 // Fail closed instead of showing fabricated valuations if the JS file fails to load.
 return 0;
}
function money(value){
 if(!value)return "€0";
 if(value>=100000000)return "€"+(value/100000000).toFixed(2)+"亿";
 if(value>=10000)return "€"+(value/10000).toFixed(value<1000000?1:0)+"万";
 return "€"+value;
}
function objectiveTargets(p,year,tier,season){
 if(!p)return [];
 const S=season||{},results=(S.results||[]).filter(m=>m.played&&m.kind!=="national");
 const apps=results.length||Number(S.apps)||0;
 const ratings=results.map(m=>m.rating).filter(Number.isFinite);
 const avg=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:
  (S.ratings||[]).length?S.ratings.reduce((a,b)=>a+b,0)/S.ratings.length:0;
 const known=results.filter(m=>Number.isFinite(m.hs)&&Number.isFinite(m.as)&&(m.home===p.club||m.away===p.club));
 const clean=known.filter(m=>(m.home===p.club?m.as:m.hs)===0).length;
 const role=window.FootballRolesV3||null,actions=role?role.summarize(results,p.club):null;
 const pos=role?role.group(p.position):(p.position==="GK"?"keeper":["CB","LB","RB"].includes(p.position)?"defender":p.position==="CDM"?"holding":p.position==="CM"?"midfield":p.position==="CAM"?"creator":"forward");
 const targetApps=p.youth?13:clamp(18+Math.floor((tier||0)/2)+(p.age>34?-4:0),10,27);
 const output=(Number(S.goals)||0)+(Number(S.assists)||0);
 let goal;
 if(actions&&actions.recorded>=Math.min(10,Math.ceil(apps*.5))){
  if(pos==="keeper")goal={key:"keeperActions",label:"模拟扑救 / 90分钟",value:actions.savesPer90,target:1.5};
  else if(pos==="defender")goal={key:"defenceActions",label:"每90分钟成功抢断＋拦截",value:Number((actions.tacklesPer90+actions.interceptionsPer90).toFixed(2)),target:1.6};
  else if(pos==="holding")goal={key:"holdingActions",label:"每90分钟球权回收",value:actions.recoveriesPer90,target:2.0};
  else if(pos==="midfield")goal={key:"midfieldActions",label:"每90分钟向前传球",value:actions.progressivePer90,target:2.3};
  else if(pos==="creator")goal={key:"creatorActions",label:"每90分钟创造机会",value:actions.chancesPer90,target:.8};
 }
 if(!goal){
  if(pos==="forward")goal={key:"output",label:"进球与助攻",value:output,target:p.youth?5:clamp(8+Math.floor((tier||0)*1.4),6,16)};
  else if(pos==="creator")goal={key:"creation",label:"助攻或优秀比赛评分",value:Math.max(Number(S.assists)||0,avg>=7.25?5:0),target:5};
  else if(pos==="midfield")goal={key:"midfield",label:"组织评分",value:avg,target:6.9};
  else goal={key:"defence",label:"真实比赛零封或优秀评分",value:Math.max(clean,avg>=7.2?5:0),target:Math.min(5,Math.max(3,Math.floor(known.length*.17)))};
 }
 return [
  {key:"apps",label:"赛季出场",value:apps,target:targetApps},
  goal,
  {key:"rating",label:"平均评分",value:Math.round(avg*100)/100,target:p.youth?6.4:6.62}
 ].map(item=>({...item,done:item.value>=item.target}));
}
function settleObjectives(p,year,tier,season){
 if(!p||p.retired)return null;
 p.goalHistory=p.goalHistory||[];
 const prev=p.goalHistory.find(x=>x.year===year);if(prev)return prev;
 const list=objectiveTargets(p,year,tier,season);
 const count=list.filter(x=>x.done).length;
 // Very modest capped bonuses: do not bypass promotion qualification.
 if(count>=2){p.coachTrust=clamp((p.coachTrust||60)+(count===3?4:2),0,100);p.fame=clamp((p.fame||0)+(count===3?2:1),0,100)}
 const record={year,completed:count,total:list.length,items:list.map(x=>({key:x.key,done:x.done,value:x.value,target:x.target}))};
 p.goalHistory.push(record);p.goalHistory=p.goalHistory.slice(-42);
 return record;
}
function recordMarketValue(p,year,overall,tier,season,career){
 if(!p||p.retired)return null;
 p.marketValueHistory=p.marketValueHistory||[];
 let entry=p.marketValueHistory.find(x=>x.year===year);
 // Recalculate the same year only after the annual Ballon d'Or/FIFA awards
 // have been finalized. Never rewrite completed older-year snapshots.
 if(entry){
  if(career?.refreshAnnualValue)entry.value=marketValue(p,overall,tier,season,career);
  return entry;
 }
 entry={year,value:marketValue(p,overall,tier,season,career)};
 p.marketValueHistory.push(entry);p.marketValueHistory=p.marketValueHistory.slice(-42);
 return entry;
}
window.CareerDepth=Object.freeze({ROLE_NAMES,traitFor,traitInfo,positionOptions,setPositionTarget,progressPosition,lineup,contributionModifiers,injuryFactor,marketValue,marketValueDetails,money,objectiveTargets,settleObjectives,recordMarketValue});
})();
