(()=>{"use strict";
/* Transparent, deliberately bounded game modifiers, NOT biological claims.
   Race, gender, country, complexion and names are never inputs. */
const POSITIONS=["LW","RW","ST","CAM","CM","CDM","CB","GK"];
const PATHS={balanced:{name:"均衡发展",detail:"按原有节奏训练和争取出场。"},growth:{name:"成长优先",detail:"训练适应更快，但需要耐心积累首发机会。"},minutes:{name:"出场优先",detail:"更积极争取上场与首发，训练积累略慢。"}};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
function referenceWeight(height){
 const h=clamp(Number(height)||175,150,210)/100;
 return Math.round(clamp(22.5*h*h,48,110));
}
function defaultWeight(height,position="LW"){
 const shift=position==="GK"||position==="CB"?4:position==="ST"?3:position==="CDM"?2:0;
 return Math.round(clamp(referenceWeight(height)+shift,45,125));
}
function quickWeight(height,position,random=Math.random){
 const offset=Math.round((Math.max(0,Math.min(.9999999,random()))*18)-9);
 return Math.round(clamp(defaultWeight(height,position)+offset,45,125));
}
function sanitizedPath(path){return Object.hasOwn(PATHS,path)?path:"balanced"}
function profile(p){
 const rawHeight=p?.heightCm??p?.height,rawWeight=p?.weightKg??p?.weight;
 const hasHeight=rawHeight!==null&&rawHeight!==undefined&&Number.isFinite(Number(rawHeight));
 const hasWeight=rawWeight!==null&&rawWeight!==undefined&&Number.isFinite(Number(rawWeight));
 const h=clamp(hasHeight?Number(rawHeight):175,150,210);
 const w=clamp(hasWeight?Number(rawWeight):referenceWeight(h),45,125);
 const reference=referenceWeight(h);
 if(!hasHeight||!hasWeight){
  // Old career saves never stored weight: preserve their prior neutral
  // play characteristics instead of silently inventing a body advantage.
  return {height:h,weight:w,reference,flags:["legacy-neutral"],
   aerial:1,agility:1,duel:1,endurance:1,goalkeeperReach:1};
 }
 const tall=clamp((h-175)/35,-1,1),heavy=clamp((w-reference)/26,-1,1);
 // v9 calibration: retain different advantages with less heavy+tall stacking.
 // Larger absolute mass also costs stamina, even at tall reference weight.
 const aerial=clamp(1+tall*.093+heavy*.02,.90,1.09);
 const agility=clamp(1-tall*.06-heavy*.10,.86,1.15);
 const duel=clamp(1+heavy*.108+tall*.023,.88,1.09);
 const endurance=clamp(1-Math.max(0,heavy)*.075+Math.min(0,heavy)*.035-Math.max(0,w-90)*.0025,.84,1.10);
 const goalkeeperReach=clamp(1+tall*.086,.91,1.09);
 return {height:h,weight:w,reference,flags:[],aerial,agility,duel,endurance,goalkeeperReach};
}
function matchup(p){
 const b=profile(p),pos=p?.position||"LW";
 const precision=pos==="GK"?b.goalkeeperReach*.60+b.agility*.40:
 ["CB","CDM"].includes(pos)?b.duel*.45+b.aerial*.30+b.agility*.25:
 pos==="ST"?b.aerial*.30+b.duel*.20+b.agility*.50:
 b.agility*.72+b.duel*.14+b.aerial*.14;
 return clamp(precision,.94,1.06);
}
function matchScoreBonus(p){return clamp((matchup(p)-1)*1.1,-.07,.07)}
function starterBonus(p){return clamp((matchup(p)-1)*.20,-.02,.02)}
function contributionBonus(p,kind){
 const b=profile(p),pos=p?.position||"LW";
 const influence=["CB","CDM","GK"].includes(pos)?1:
 kind==="assist"?b.agility*.73+b.duel*.12+b.aerial*.15:
 pos==="ST"?b.aerial*.30+b.agility*.50+b.duel*.20:
 b.agility*.72+b.duel*.14+b.aerial*.14;
 return clamp(influence,.94,1.06);
}
function trainingThreshold(base,path){
 const factor=sanitizedPath(path)==="growth"?.84:sanitizedPath(path)==="minutes"?1.06:1;
 return Math.max(4,Math.ceil(base*factor));
}
function appearancesBonus(path){return sanitizedPath(path)==="minutes"?.045:sanitizedPath(path)==="growth"?-.01:0}
function lineupBonus(path){return sanitizedPath(path)==="minutes"?.04:sanitizedPath(path)==="growth"?-.01:0}
const ENCOUNTER_LABELS={aerial:"空中球",duel:"身体对抗",agility:"变向摆脱",goalkeeperReach:"高球处理"};
function encounterChance(p,kind){
 const b=profile(p),factor=kind==="goalkeeperReach"?b.goalkeeperReach:Number(b[kind]);
 return clamp(.5+(factor-1)*.8,.35,.65);
}
function simulateContests(p,random=Math.random){
 const pos=p?.position||"LW";
 const queue=pos==="GK"?["goalkeeperReach","agility","goalkeeperReach"]:
 ["CB","CDM"].includes(pos)?["duel","aerial","duel"]:
 pos==="ST"?["aerial","agility","duel"]:
 pos==="CM"?["agility","duel","aerial"]:
 ["agility","agility","duel"];
 const byType={},events=[];
 let wins=0,expected=0;
 for(const kind of queue){
  const chance=encounterChance(p,kind),won=random()<chance;
  if(!byType[kind])byType[kind]={label:ENCOUNTER_LABELS[kind],wins:0,attempts:0};
  byType[kind].attempts++;
  byType[kind].wins+=won?1:0;
  expected+=chance;wins+=won?1:0;
  events.push({kind,won});
 }
 const ratingDelta=clamp((wins-expected)*.05,-.08,.08);
 return {attempts:queue.length,wins,byType,events,ratingDelta:Number(ratingDelta.toFixed(3)),source:"游戏简化对抗模拟"};
}

function label(p){
 const v=profile(p),str=(x)=>Math.round((x-1)*100);
 const signed=x=>x>0?"+"+x+"%":x+"%";
 return {aerial:signed(str(v.aerial)),agility:signed(str(v.agility)),duel:signed(str(v.duel)),endurance:signed(str(v.endurance))};
}
window.BodyPath=Object.freeze({POSITIONS,PATHS,referenceWeight,defaultWeight,quickWeight,sanitizedPath,profile,matchup,matchScoreBonus,starterBonus,contributionBonus,trainingThreshold,appearancesBonus,lineupBonus,encounterChance,simulateContests,label});
})();