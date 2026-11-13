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
 const height=Number(p?.heightCm??p?.height??175);
 const weight=Number(p?.weightKg??p?.weight??defaultWeight(height,p?.position));
 const h=clamp(height,150,210),w=clamp(weight,45,125),reference=referenceWeight(h);
 // ±35cm can change reach by up to 11%; large mass differences create
 // an opposite tradeoff in duels / agility / stamina, never a global rating buff.
 const tall=clamp((h-175)/35,-1,1),heavy=clamp((w-reference)/26,-1,1);
 const aerial=clamp(1+tall*.105+heavy*.025,.84,1.16);
 const agility=clamp(1-tall*.055-heavy*.115,.82,1.18);
 const duel=clamp(1+heavy*.13+tall*.035,.82,1.18);
 const endurance=clamp(1-Math.max(0,heavy)*.08+Math.min(0,heavy)*.04,.88,1.10);
 const goalkeeperReach=clamp(1+tall*.10,.9,1.10);
 return {height:h,weight:w,reference,flags:[],aerial,agility,duel,endurance,goalkeeperReach};
}
function matchup(p){
 const b=profile(p),pos=p?.position||"LW";
 const precision=pos==="GK"?b.goalkeeperReach*.65+b.agility*.35:
 ["CB","CDM"].includes(pos)?b.duel*.55+b.aerial*.35+b.agility*.10:
 pos==="ST"?b.aerial*.35+b.duel*.25+b.agility*.40:
 b.agility*.70+b.duel*.15+b.aerial*.15;
 return clamp(precision,.89,1.11);
}
function matchScoreBonus(p){return clamp((matchup(p)-1)*1.3,-.10,.10)}
function starterBonus(p){return clamp((matchup(p)-1)*.24,-.035,.035)}
function contributionBonus(p,kind){
 const b=profile(p),pos=p?.position||"LW";
 const influence=["CB","CDM","GK"].includes(pos)?1:
 kind==="assist"?clamp(b.agility*.65+b.duel*.15+b.aerial*.20,.90,1.10):
 pos==="ST"?clamp(b.aerial*.40+b.agility*.40+b.duel*.20,.9,1.1):
 clamp(b.agility*.70+b.duel*.15+b.aerial*.15,.9,1.1);
 return clamp(influence,.90,1.10);
}
function trainingThreshold(base,path){
 const factor=sanitizedPath(path)==="growth"?.80:sanitizedPath(path)==="minutes"?1.10:1;
 return Math.max(4,Math.ceil(base*factor));
}
function appearancesBonus(path){return sanitizedPath(path)==="minutes"?.085:sanitizedPath(path)==="growth"?-.025:0}
function lineupBonus(path){return sanitizedPath(path)==="minutes"?.075:sanitizedPath(path)==="growth"?-.02:0}
function label(p){
 const v=profile(p),str=(x)=>Math.round((x-1)*100);
 const signed=x=>x>0?"+"+x+"%":x+"%";
 return {aerial:signed(str(v.aerial)),agility:signed(str(v.agility)),duel:signed(str(v.duel)),endurance:signed(str(v.endurance))};
}
window.BodyPath=Object.freeze({POSITIONS,PATHS,referenceWeight,defaultWeight,quickWeight,sanitizedPath,profile,matchup,matchScoreBonus,starterBonus,contributionBonus,trainingThreshold,appearancesBonus,lineupBonus,label});
})();