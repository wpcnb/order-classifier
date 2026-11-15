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
function marketValue(p,overall,tier,season){
 if(!p||p.retired)return 0;
 const age=p.age||18;
 const ageFactor=age<19?.55:age<23?1.04:age<29?1.36:age<32?1.03:age<35?.66:age<38?.36:.20;
 const levelFactor=[.50,.72,1.02,1.38,1.80,2.22][clamp(Math.round(tier||0),0,5)];
 const apps=Math.max(0,season?.apps||0),goalContributions=Math.max(0,(season?.goals||0)+(season?.assists||0));
 const performance=clamp(.86+Math.min(1,apps/25)*.13+Math.min(35,goalContributions)*.012,.8,1.43);
 const health=clamp(1-Math.min(5,p.injuryHistory||0)*.035,.75,1);
 const peak=clamp(Math.pow(Math.max(40,overall||65)/72,6),.14,5.6);
 return Math.round(clamp(2500000*peak*ageFactor*levelFactor*performance*health*(p.youth?.17:1),75000,180000000)/10000)*10000;
}
function money(value){
 if(!value)return "€0";
 if(value>=100000000)return "€"+(value/100000000).toFixed(2)+"亿";
 if(value>=10000)return "€"+(value/10000).toFixed(value<1000000?1:0)+"万";
 return "€"+value;
}
function objectiveTargets(p,year,tier,season){
 if(!p)return [];
 const youth=!!p.youth,attack=["ST","LW","RW","CAM"].includes(p.position);
 const keeperBack=["CB","CDM","GK"].includes(p.position);
 const appearances=youth?13:clamp(19+Math.floor((tier||0)/2)+(p.age>34?-5:0),10,27);
 const output=attack?clamp((youth?5:8)+Math.floor((tier||0)*1.5),4,16):keeperBack?5:7;
 const assist=attack?clamp((youth?3:5)+Math.floor((tier||0)/2),3,10):5;
 const S=season||{},avg=(S.ratings||[]).length?(S.ratings.reduce((a,b)=>a+b,0)/S.ratings.length):0;
 return [
 {key:"apps",label:"赛季出场",value:S.apps||0,target:appearances},
 attack?{key:"output",label:"进球＋助攻",value:(S.goals||0)+(S.assists||0),target:output}:
 keeperBack?{key:"clean",label:"球队零封（本人出场）",value:S.clean||0,target:output}:
 {key:"assists",label:"赛季助攻",value:S.assists||0,target:assist},
 {key:"rating",label:"平均评分",value:Math.round(avg*100)/100,target:youth?6.5:6.7}
 ].map(g=>({...g,done:g.value>=g.target}));
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
