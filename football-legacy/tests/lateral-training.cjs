"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110";
const source=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__test={duo:()=>duoGames,setActive:id=>{activeDuo=id;g=duoGames[id]},active:()=>activeDuo,acceptLateralOffer,requestLateralOffers,lateralTransferReason,ensurePromotionDraw,flipPromotionCard,decidePromotion,missingPromotionDraws,automaticPrep,autoPoints,nextSeason,save,transferLevel};})();');
function harness(data){
 const storage=new Map(data||[]),nodes={},handlers={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||=[]).push(fn)}});
 const context={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{get length(){return storage.size},key:i=>[...storage.keys()][i]||null,getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
 vm.runInNewContext(source,context,{filename:"game.js"});
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
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.deepEqual(JSON.parse(JSON.stringify(reload.api.duo().wang.offers)),JSON.parse(JSON.stringify(x.offers)));
 x.player.forcedMove=true;const before=x.player.club;h.api.acceptLateralOffer("wang",0);assert.equal(x.player.club,before);
 x.player.forcedMove=false;x.player.age=39;h.api.acceptLateralOffer("wang",0);assert.equal(x.player.club,before,"final pre-retirement season cannot sign a new transfer");
 console.log("✓ 旧存档可获取并保存同档报价，强制降档不能绕过目标盲卡");
}
{
 const h=newGame(),d=h.api.duo(),w=d.wang.player,v=d.vini.player;
 assert.equal(w.trainingFocus,undefined);w.autoPoints=false;w.autoTraining=false;h.change({trainingFocus:"wang"},"shoot");
 assert.equal(w.trainingFocus,"shoot");assert.equal(v.trainingFocus,undefined);assert(w.autoPoints&&w.autoTraining,"selecting a focus enables automatic training and points even in legacy saves");
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.equal(reload.api.duo().wang.player.trainingFocus,"shoot");assert.equal(reload.api.duo().vini.player.trainingFocus,undefined);
 h.api.setActive("wang");w.potential=99;w.stamina=95;w.injuryMatches=0;w.autoPoints=false;w.autoTraining=true;w.trainingUsed=false;w.trainingProgress={};
 h.api.automaticPrep();assert.equal(w.trainingProgress.shoot,1);assert.equal(w.trainingUsed,true);
 w.trainingUsed=false;w.stamina=95;w.stats.shoot=w.potential;w.trainingProgress={};h.api.automaticPrep();assert.equal(w.trainingProgress.shoot,undefined,"at cap training must select another eligible ability");
 w.trainingUsed=false;w.injuryMatches=1;w.stamina=50;w.trainingProgress={};h.api.automaticPrep();assert.equal(w.trainingProgress.shoot,undefined,"injured players recover instead of training");
 h.change({trainingFocus:"wang"},"auto");assert.equal(w.trainingFocus,null);
 console.log("✓ 两人训练偏向独立保存，选定能力优先，达到上限或受伤时自动调整");
}
