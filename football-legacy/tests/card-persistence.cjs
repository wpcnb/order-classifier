"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110",OPEN="football-dynasty-opening-v3";
const source=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__test={opening:()=>({drawnClubs,openingDecks,openingSelectedIndex}),openingCards,persistOpening,duo:()=>duoGames,setActive:id=>{activeDuo=id;g=duoGames[id]},acceptLateralOffer,requestLateralOffers,ensurePromotionDraw,flipPromotionCard,decidePromotion,missingPromotionDraws,save};})();');
function harness(data,initiallyFail=false){
 let failWrites=initiallyFail;const storage=new Map(data||[]),nodes={},handlers={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||=[]).push(fn)}});
 const context={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{get length(){return storage.size},key:i=>[...storage.keys()][i]||null,getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(failWrites)throw Error("QuotaExceededError");storage.set(k,String(v))},removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
 vm.runInNewContext(source,context,{filename:"game.js"});
 return {api:context.window.__test,storage,fail(value=true){failWrites=value},get toast(){return node("toast").textContent},get html(){return node("app").innerHTML},click(action,extras={}){for(const fn of handlers["app:click"]||[])fn({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},flush(){while(timers.length)timers.shift()()}};
}
function newGame(){const h=harness();h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();h.click("preset");return h;}
function review(h){const d=h.api.duo();for(const id of ["wang","vini"]){const x=d[id],p=x.player;p.age=25;p.youth=false;p.club=p.club.replace(/青训$/,"");p.academyParentClub=p.club;p.leagueId="CHN";p.forcedMove=false;p.transferAssessment={maxTier:0,poor:false};delete p.transferDraw;x.season.stage="review";}return d;}
function offerFor(x){return {id:"CHN",club:x.player.club==="上海申花"?"上海海港":"上海申花",wage:20000,years:3,move:"同级转会"};}
{
 const h=harness(),o=h.api.opening();h.api.openingCards("vini");o.openingDecks.vini[0]=o.openingDecks.wang[0];h.api.persistOpening();
 const before=h.storage.get(OPEN),other=JSON.stringify(o.openingDecks.vini);h.fail();h.click("flipOpeningCard",{id:"wang",i:0});
 assert.equal(o.drawnClubs.wang,null);assert.equal(o.openingSelectedIndex.wang,null);assert.equal(JSON.stringify(o.openingDecks.vini),other);assert.equal(h.storage.get(OPEN),before);assert.match(h.toast,/无法保存抽卡结果/);
 const reload=harness(h.storage);assert.equal(reload.api.opening().drawnClubs.wang,null);
 h.fail(false);h.click("flipOpeningCard",{id:"wang",i:0});assert.equal(JSON.parse(h.storage.get(OPEN)).drawn.wang,o.openingDecks.wang[0]);
}
{
 const h=harness(null,true);h.click("flipOpeningCard",{id:"wang",i:0});assert.equal(h.api.opening().drawnClubs.wang,null);assert.equal(h.storage.has(OPEN),false);assert.match(h.toast,/无法保存/);
}
{
 const h=harness();h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();
 const opening=h.storage.get(OPEN);h.fail();h.click("preset");assert.equal(h.api.duo(),null);assert.equal(h.storage.get(OPEN),opening);assert.equal(h.storage.has(SAVE),false);assert.match(h.toast,/无法保存新生涯/);
 h.fail(false);h.click("preset");assert(h.storage.has(SAVE));assert.equal(h.storage.has(OPEN),false);
}
console.log("✓ 开局翻牌和开始生涯必须成功保存，写入失败时保留已有牌阵并可重试");
{
 const h=newGame(),x=review(h).wang;x.player.transferAssessment={maxTier:1,poor:false};const d=h.api.ensurePromotionDraw(x);h.api.save();
 const saved=h.storage.get(SAVE),deck=JSON.stringify(d.options);h.fail();h.api.flipPromotionCard("wang",0);
 assert.equal(d.selected,null);assert.equal(d.selectedIndex,null);assert.equal(h.storage.get(SAVE),saved);assert.match(h.toast,/无法保存抽卡结果/);
 const reload=harness([[SAVE,saved]]),rd=reload.api.duo().wang.player.transferDraw;assert.equal(rd.selected,null);assert.equal(JSON.stringify(rd.options),deck);
 h.fail(false);h.api.flipPromotionCard("wang",0);assert.equal(JSON.parse(h.storage.get(SAVE)).duoGames.wang.player.transferDraw.selected.club,d.options[0].club);
 h.fail();const before=h.storage.get(SAVE);h.api.decidePromotion("wang",true);assert(!d.accepted);assert.equal(h.storage.get(SAVE),before);assert.match(h.toast,/无法保存转会决定/);assert.equal(h.api.missingPromotionDraws().length,1);
 h.fail(false);h.api.decidePromotion("wang",true);assert.equal(d.accepted,true);assert.equal(JSON.parse(h.storage.get(SAVE)).duoGames.wang.player.transferDraw.accepted,true);
}
{
 const h=newGame(),x=review(h).wang;x.player.transferAssessment={maxTier:1,poor:false};const d=h.api.ensurePromotionDraw(x);h.api.save();h.fail();h.api.decidePromotion("wang",false);assert(!d.declined);assert.equal(h.api.missingPromotionDraws().length,1);assert.match(h.toast,/无法保存转会决定/);
}
console.log("✓ 升降档翻牌及接受/留队必须成功保存，失败不揭晓、不解锁下一赛季");
{
 const h=newGame(),x=review(h).wang;x.offers=[];h.api.save();const before=h.storage.get(SAVE);h.fail();h.api.requestLateralOffers("wang");assert.equal(x.offers.length,0);assert.equal(x.lateralOffersYear,undefined);assert.equal(h.storage.get(SAVE),before);assert.match(h.toast,/无法保存同档报价/);
 h.fail(false);h.api.requestLateralOffers("wang");assert(x.offers.length);const offers=JSON.stringify(x.offers),oldClub=x.player.club,oldLogs=JSON.stringify(x.logs),saved=h.storage.get(SAVE);h.fail();h.api.acceptLateralOffer("wang",0);
 assert.equal(x.player.club,oldClub);assert.equal(x.player.sameTierMoveYear,undefined);assert.equal(JSON.stringify(x.offers),offers);assert.equal(JSON.stringify(x.logs),oldLogs);assert.equal(h.storage.get(SAVE),saved);assert.match(h.toast,/无法保存同档转会/);
 h.fail(false);h.api.acceptLateralOffer("wang",0);assert.notEqual(x.player.club,oldClub);assert.equal(JSON.parse(h.storage.get(SAVE)).duoGames.wang.player.club,x.player.club);
}
console.log("✓ 同档报价和确认转会写入失败会回滚，保留原俱乐部、报价和档案");
