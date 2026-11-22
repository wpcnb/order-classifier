"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110";
const source=fs.readFileSync(path.join(root,"tests/_fixtures/legacy-engine.txt"),"utf8").replace(/\}\)\(\);\s*$/,'window.__test={duo:()=>duoGames,setActive:id=>{activeDuo=id;g=duoGames[id]},active:()=>activeDuo,acceptLateralOffer,requestLateralOffers,lateralTransferReason,ensurePromotionDraw,flipPromotionCard,decidePromotion,missingPromotionDraws,automaticPrep,autoPoints,nextSeason,save,transferLevel};})();');
function harness(data){
 const storage=new Map(data||[]),nodes={},handlers={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||=[]).push(fn)}});
 const context={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{get length(){return storage.size},key:i=>[...storage.keys()][i]||null,getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
 vm.runInNewContext(source,context,{filename:"tests/_fixtures/legacy-engine.txt"});
 return {api:context.window.__test,storage,get html(){return node("app").innerHTML},click(action,extras={}){for(const fn of handlers["app:click"]||[])fn({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},change(dataset,value){for(const fn of handlers["app:change"]||[])fn({target:{dataset,value}})},flush(){while(timers.length)timers.shift()()}};
}
function newGame(){const h=harness();h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();h.click("preset");return h;}
function review(h){const d=h.api.duo();for(const id of ["wang","vini"]){const x=d[id],p=x.player;p.age=25;p.youth=false;p.club=p.club.replace(/青训$/,"");p.academyParentClub=p.club;p.leagueId="CHN";p.forcedMove=false;p.transferAssessment={maxTier:0,poor:false};delete p.transferDraw;x.season.stage="review";}return d;}
function offerFor(x){return {id:"CHN",club:x.player.club==="上海申花"?"上海海港":"上海申花",wage:20000,years:3,move:"同级转会"};}
{
 const h=newGame(),d=review(h),old=d.wang.player.club,peer=d.vini.player.club,offer=offerFor(d.wang);d.wang.offers=[offer];
 h.api.setActive("vini");h.api.acceptLateralOffer("wang",0);
 assert.equal(d.wang.player.club,offer.club);assert.equal(d.vini.player.club,peer);assert.equal(h.api.active(),"vini");
 assert.equal(d.wang.player.transferHistory.at(-1).from,old);assert.equal(d.wang.player.transferHistory.at(-1).to,offer.club);
 assert.equal(d.wang.player.sameTierMoveYear,d.wang.year);assert.equal(d.wang.player.transferHistory.at(-1).reason,"同级转会");
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.equal(reload.api.duo().wang.player.club,offer.club);assert.equal(reload.api.duo().vini.player.club,peer);
 const before=JSON.stringify(d.wang.player.transferHistory);h.api.acceptLateralOffer("wang",0);assert.equal(JSON.stringify(d.wang.player.transferHistory),before);
 h.api.nextSeason();assert.equal(d.wang.player.club,offer.club);assert.equal(d.wang.season.stage,"playing");
 console.log("✓ 同档转会由指定球员独立决定、立即保存并在新赛季延续，同季不可重复转会");
}
{
 const h=newGame(),d=review(h),x=d.wang,old=x.player.club,offer=offerFor(x);x.offers=[offer];x.player.transferAssessment={maxTier:1,poor:false};
 const draw=h.api.ensurePromotionDraw(x);assert.equal(draw.options.length,10);assert.equal(draw.options.filter(o=>o.tier===1).length,9);assert.equal(draw.options.filter(o=>o.tier===2).length,1);
 h.api.acceptLateralOffer("wang",0);assert.equal(x.player.club,old,"unresolved blind card must block lateral move");
 h.api.flipPromotionCard("wang",0);h.api.decidePromotion("wang",false);h.api.acceptLateralOffer("wang",0);
 assert.equal(x.player.club,offer.club);assert.equal(h.api.missingPromotionDraws().length,0,"declined promotion must not regenerate a new deck after lateral move");
 h.api.nextSeason();assert.equal(x.player.club,offer.club);assert.equal(x.season.stage,"playing");
 console.log("✓ 9＋1升级盲卡需玩家亲自处理，拒绝后可同档转会且不会反复抽卡");
}
{
 const h=newGame(),d=review(h),x=d.wang;x.offers=[];h.api.requestLateralOffers("wang");
 assert(x.offers.length>0&&x.offers.length<=6);assert(x.offers.every(o=>h.api.transferLevel(o.id,o.club)===0));
 const firstOffers=JSON.stringify(x.offers);h.api.requestLateralOffers("wang");assert.equal(JSON.stringify(x.offers),firstOffers,"same season offers cannot be repeatedly rerolled");
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.deepEqual(JSON.parse(JSON.stringify(reload.api.duo().wang.offers)),JSON.parse(JSON.stringify(x.offers)));
 reload.api.requestLateralOffers("wang");assert.equal(JSON.stringify(reload.api.duo().wang.offers),firstOffers,"reload cannot reroll the same season offers");
 x.player.forcedMove=true;const before=x.player.club;h.api.acceptLateralOffer("wang",0);assert.equal(x.player.club,before);
 x.player.forcedMove=false;x.player.age=39;h.api.acceptLateralOffer("wang",0);assert.equal(x.player.club,before,"final pre-retirement season cannot sign a new transfer");
 console.log("✓ 旧存档可获取并保存同档报价，强制降档不能绕过目标盲卡");
}
{
 const h=newGame(),d=h.api.duo(),w=d.wang.player,v=d.vini.player;
 assert.equal(w.trainingFocus,undefined);w.autoPoints=false;w.autoTraining=false;h.change({trainingFocus:"wang"},"shoot");
 assert.equal(w.trainingFocus,"shoot");assert.equal(v.trainingFocus,undefined);assert(!w.autoPoints&&!w.autoTraining,"selecting a focus must preserve the manual flags already stored in legacy saves");
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.equal(reload.api.duo().wang.player.trainingFocus,"shoot");assert.equal(reload.api.duo().vini.player.trainingFocus,undefined);
 h.api.setActive("wang");w.potential=99;w.stamina=95;w.injuryMatches=0;w.autoPoints=false;w.autoTraining=true;w.trainingUsed=false;w.trainingProgress={};
 h.api.automaticPrep();assert.equal(w.trainingProgress.shoot,1);assert.equal(w.trainingUsed,true);
 w.trainingUsed=false;w.stamina=95;w.stats.shoot=w.potential;w.trainingProgress={};h.api.automaticPrep();assert.equal(w.trainingProgress.shoot,undefined,"at cap training must select another eligible ability");
 w.trainingUsed=false;w.injuryMatches=1;w.stamina=50;w.trainingProgress={};h.api.automaticPrep();assert.equal(w.trainingProgress.shoot,undefined,"injured players recover instead of training");
 h.change({trainingFocus:"wang"},"auto");assert.equal(w.trainingFocus,null);
 console.log("✓ 两人训练偏向独立保存，选定能力优先，达到上限或受伤时自动调整");
}
{
 const h=newGame(),x=h.api.duo().wang,p=x.player;
 h.api.setActive("wang");
 Object.assign(p,{trainingFocus:"shoot",potential:99,stamina:95,autoTraining:true,autoPoints:false,trainingProgress:{},trainingUsed:false,injuryMatches:0});
 h.change({prepPlan:"wang"},"develop");
 assert.equal(h.api.duo().vini.season.prepPlan,undefined);
 assert.equal(harness([[SAVE,h.storage.get(SAVE)]]).api.duo().wang.season.prepPlan,"develop");
 h.api.automaticPrep();
 assert.equal(p.stamina,85);assert.equal(p.trainingProgress.shoot,2);
 h.api.automaticPrep();assert.equal(p.stamina,85,"repeated preparation must not spend stamina twice");
 h.change({prepPlan:"wang"},"protect");
 Object.assign(p,{stamina:70,trainingUsed:false});
 h.api.automaticPrep();assert.equal(p.stamina,90);assert.equal(p.trainingProgress.shoot,2);
 p.trainingUsed=false;p.careerOperationMode="deep";
 h.click("duoTrain",{id:"wang",key:"shoot"});
 assert.equal(p.stamina,84);assert.equal(p.trainingProgress.shoot,3);
 h.change({prepPlan:"wang"},"develop");
 h.click("duoTrain",{id:"wang",key:"shoot"});
 assert.equal(p.stamina,84,"switching the plan must not unlock another training session");
 console.log("✓ 备战方案按球员保存；自动与手动训练兑现收益及消耗，换方案不能重复训练");
}
{
 const h=newGame(),{wang,vini}=h.api.duo(),p=wang.player;
 const peerProgress=JSON.stringify(vini.player.trainingProgress);
 Object.assign(p,{age:18,autoTraining:false,autoPoints:false,potential:98,stamina:100,trainingUsed:false,careerOperationMode:"deep",injuryMatches:0,trainingProgress:{shoot:6}});
 p.stats.shoot=60;
 h.change({prepPlan:"wang"},"develop");
 h.click("duoTrain",{id:"wang",key:"shoot"});
 assert.equal(p.stats.shoot,61);
 assert.equal(p.trainingProgress.shoot,2,"6 + 3 at a threshold of 7 leaves 2 progress");
 assert.equal(p.stamina,81);
 const loaded=harness([[SAVE,h.storage.get(SAVE)]]);
 assert.equal(loaded.api.duo().wang.player.trainingProgress.shoot,2);
 assert.equal(JSON.stringify(loaded.api.duo().vini.player.trainingProgress),peerProgress);
 for(let session=1;session<7;session++){
  p.trainingUsed=false;p.stamina=100;
  h.click("duoTrain",{id:"wang",key:"shoot"});
 }
 assert.equal(p.stats.shoot,63,"seven intensive sessions grant three levels");
 assert.equal(p.trainingProgress.shoot,6);
 h.api.setActive("wang");
 Object.assign(p,{careerOperationMode:"guided",trainingFocus:"shoot",trainingUsed:false,stamina:100,autoTraining:true,autoPoints:false,parentCoach:{skills:{training:55,motivation:0},points:0}});
 p.trainingProgress.shoot=5;
 h.api.automaticPrep();
 assert.equal(p.trainingProgress.shoot,1,"automatic prep keeps overflow after the coach discount");
 assert.equal(p.stats.shoot,64);
 p.potential=65;p.trainingUsed=false;p.stamina=100;p.trainingProgress.shoot=5;
 h.api.automaticPrep();
 assert.equal(p.stats.shoot,65);
 assert.equal(p.trainingProgress.shoot,0,"no progress is banked past the growth cap");
 console.log("✓ 强化训练结转、教练折扣、成长上限和双人读档通过");
}
