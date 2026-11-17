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
function marketValue(p,overall,tier,season){
 if(!p||p.retired)return 0;
 const age=Number(p.age)||18,ov=clamp(Number(overall)||65,40,99);
 const ageFactor=age<18?.36:age<20?.72:age<23?1.10:age<27?1.27:age<30?1.18:age<32?.97:age<35?.67:age<38?.37:.18;
 const tierFactor=[.30,.49,.66,.82,1,1.13][clamp(Math.round(tier||0),0,5)];
 // 评价不以金球奖或冠军次数为前提。高能力年轻球星可达1–2亿欧元。
 const ability=4200000*Math.pow(ov/70,8);
 const played=Math.max(0,Number(season?.apps)||0);
 const ratings=Array.isArray(season?.ratings)?season.ratings.filter(Number.isFinite):[];
 const avg=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:6.8;
 const reliability=clamp(.84+Math.min(30,played)/30*.17,.84,1.01);
 const performance=clamp(.86+(avg-6.5)*.16,.75,1.19);
 // 非前场不按进球助攻砍价。前场贡献仅提供少量上浮。
 const attack=["ST","LW","RW","CAM"].includes(p.position);
 const contributions=Math.max(0,(Number(season?.goals)||0)+(Number(season?.assists)||0));
 const roleBonus=attack?1+Math.min(.13,contributions*.004):1;
 const fitness=clamp(1-Math.min(6,p.injuryHistory||0)*.025,.82,1);
 const raw=ability*ageFactor*tierFactor*reliability*performance*roleBonus*fitness*(p.youth?.16:1);
 return Math.round(clamp(raw,75000,280000000)/10000)*10000;
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
 const avg=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:(S.ratings||[]).length?(S.ratings.reduce((a,b)=>a+b,0)/S.ratings.length):0;
 const eligibleScores=results.filter(m=>Number.isFinite(m.hs)&&Number.isFinite(m.as)&&(m.home===p.club||m.away===p.club));
 const clean=eligibleScores.filter(m=>(m.home===p.club?m.as:m.hs)===0).length;
 const group=p.position==="GK"?"keeper":["CB","LB","RB"].includes(p.position)?"defender":p.position==="CDM"?"holding":p.position==="CM"?"midfield":p.position==="CAM"?"creator":"forward";
 const appearances=p.youth?13:clamp(18+Math.floor((tier||0)/2)+(p.age>34?-4:0),10,27);
 const output=(Number(S.goals)||0)+(Number(S.assists)||0);
 const goal=group==="forward"?{key:"output",label:"进球与助攻",value:output,target:p.youth?5:clamp(8+Math.floor((tier||0)*1.4),6,16)}:
 group==="creator"?{key:"creation",label:"助攻或稳定高评分",value:Math.max((Number(S.assists)||0),avg>=7.25?5:0),target:5}:
 group==="midfield"?{key:"midfield",label:"组织表现（助攻或高评分）",value:Math.max((Number(S.assists)||0),avg>=7.15?4:0),target:4}:
 {key:"defence",label:"防守稳定（真实零封或高评分）",value:Math.max(clean,avg>=7.2?5:0),target:Math.min(5,Math.max(3,Math.floor(eligibleScores.length*.17)))};
 return [
  {key:"apps",label:"赛季出场",value:apps,target:appearances},
  goal,
  {key:"rating",label:"平均评分",value:Math.round(avg*100)/100,target:p.youth?6.5:6.75}
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
function recordMarketValue(p,year,overall,tier,season){
 if(!p||p.retired)return null;
 p.marketValueHistory=p.marketValueHistory||[];
 let entry=p.marketValueHistory.find(x=>x.year===year);
 if(entry)return entry;
 entry={year,value:marketValue(p,overall,tier,season)};
 p.marketValueHistory.push(entry);p.marketValueHistory=p.marketValueHistory.slice(-42);
 return entry;
}
window.CareerDepth=Object.freeze({ROLE_NAMES,traitFor,traitInfo,positionOptions,setPositionTarget,progressPosition,lineup,contributionModifiers,injuryFactor,marketValue,money,objectiveTargets,settleObjectives,recordMarketValue});
})();
