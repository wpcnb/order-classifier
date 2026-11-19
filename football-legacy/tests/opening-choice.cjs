"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const files=["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","body-path.js","career-depth.js","free-star.js","v10-core.js","v10-ui.js","legend-v1.js","game.js"];
const openingKey="football-dynasty-opening-v3",saveKey="football-dynasty-duo-v2-20261110";
function harness(existing=[]){
 const storage=new Map(existing),nodes={},handlers={},timers=[];let rejectWrites=false;
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||=[]).push(fn)},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={get length(){return storage.size},key:i=>[...storage.keys()][i]||null,getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(rejectWrites)throw new Error("QuotaExceededError");storage.set(k,String(v))},removeItem:k=>storage.delete(k)};
 const context={window:{},document,localStorage,console,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL};
 for(const file of files){let code=read(file);if(file==="game.js")code=code.replace(/\}\)\(\);\s*$/,'window.__opening={db:DB,names:()=>v10Persons,leagues:()=>openingLeagues,drawn:()=>drawnClubs,duo:()=>duoGames,step:()=>v10Step};})();');vm.runInNewContext(code,context,{filename:file,timeout:14000})}
 const trigger=(type,target)=>{for(const fn of handlers["app:"+type]||[])fn({target})};
 return {storage,api:context.window.__opening,get html(){return node("app").innerHTML},get toast(){return node("toast").textContent},get opening(){return JSON.parse(storage.get(openingKey)||"null")},get saved(){return JSON.parse(storage.get(saveKey)||"null")},
  fail(on){rejectWrites=on},change(dataset,value){trigger("change",{dataset,value})},click(action,data={}){trigger("click",{closest:()=>({disabled:false,dataset:{action,...data}})})},flush(){let n=0;while(timers.length&&n++<30)timers.shift()()}};
}
{
 const h=harness();assert.match(h.html,/data-v10-person="wang"/);assert.match(h.html,/data-opening-league="wang"/);
 h.change({v10Person:"wang"},"库里");h.change({v10Person:"vini"},"詹姆斯");
 h.change({openingLeague:"wang"},"CHN");h.change({openingLeague:"vini"},"ENG");
 assert.equal(h.opening.v10Persons.wang,"库里");assert.equal(h.opening.v10Persons.vini,"詹姆斯");
 assert.equal(h.opening.leagues.wang,"CHN");assert.equal(h.opening.leagues.vini,"ENG");
 h.click("v10Next");assert.equal(h.api.step(),2);h.click("v10Next");assert.equal(h.api.step(),3);
 assert.equal(h.opening.decks.wang.length,10);assert.equal(new Set(h.opening.decks.wang).size,10);
 assert(h.opening.decks.wang.every(club=>h.api.db.CHN.teams.some(t=>t.name===club)));
 h.click("flipOpeningCard",{id:"wang",i:"0"});h.flush();const first=h.opening.drawn.wang;assert(first);
 const reloaded=harness([...h.storage]);assert.equal(reloaded.api.drawn().wang,first);assert.equal(reloaded.api.names().wang,"库里");assert.equal(reloaded.api.leagues().vini,"ENG");
 reloaded.change({openingLeague:"wang"},"ESP");reloaded.change({v10Person:"wang"},"别人");
 assert.equal(reloaded.api.leagues().wang,"CHN","a drawn club keeps its original league");assert.equal(reloaded.api.names().wang,"库里","a drawn profile stays locked");
 assert.equal(reloaded.opening.decks.vini.length,10);assert(reloaded.opening.decks.vini.every(club=>reloaded.api.db.ENG.teams.some(t=>t.name===club)));
 reloaded.click("flipOpeningCard",{id:"vini",i:"0"});reloaded.flush();const second=reloaded.opening.drawn.vini;assert(second&&second!==first);
 reloaded.click("preset");const save=reloaded.saved;assert(save,"new career is saved");
 assert.equal(save.duoGames.wang.player.name,"库里");assert.equal(save.duoGames.vini.player.name,"詹姆斯");
 assert.equal(save.duoGames.wang.player.leagueId,"CHN");assert.equal(save.duoGames.vini.player.leagueId,"ENG");
 assert.equal(save.duoGames.wang.player.club,first+"青训");assert.equal(save.duoGames.vini.player.club,second+"青训");
 assert.equal(save.duoGames.wang.player.actualCountry,null);assert.match(save.duoGames.wang.player.sourceReference,/游戏估算/);
 console.log("✓ 自定义姓名与所选联赛独立保存，两人亲翻十张随机球队卡后进入青训");
}
{
 const h=harness();const prior=h.api.leagues().wang;h.fail(true);h.change({openingLeague:"wang"},"ESP");assert.equal(h.api.leagues().wang,prior);assert.match(h.toast,/无法保存/);
 h.change({v10Person:"wang"},"库里");assert.notEqual(h.api.names().wang,"库里");assert.match(h.toast,/保存失败/);
 h.fail(false);h.change({openingLeague:"wang"},"ESP");assert.equal(h.api.leagues().wang,"ESP");
 console.log("✓ 浏览器无法保存时恢复原姓名和联赛，恢复空间后可重试");
}
{
 const h=harness();h.change({openingLeague:"wang"},"CHN");h.change({openingLeague:"vini"},"CHN");h.click("v10Next");h.click("v10Next");
 h.click("flipOpeningCard",{id:"wang",i:"0"});h.flush();const first=h.opening.drawn.wang;
 assert.equal(h.opening.decks.vini.length,10);assert(!h.opening.decks.vini.includes(first),"the other player's deck excludes the chosen club");
 h.click("flipOpeningCard",{id:"vini",i:"0"});h.flush();assert.notEqual(h.opening.drawn.wang,h.opening.drawn.vini);
 console.log("✓ 同联赛两人独立抽卡，不会抽中同一球队");
}
{
 const h=harness();h.change({v10Person:"wang"},"同名");h.change({v10Person:"vini"},"同名");h.click("v10Next");assert.equal(h.api.step(),1);assert.match(h.toast,/不能是同一个人物/);
 console.log("✓ 两名人物不能使用同一姓名");
}
{
 const h=harness();
 h.click("trioOpening");
 const bio=h.saved.sharedUniverse.trio;
 assert(bio.country && bio.position && bio.family && bio.academy);
 assert(bio.height>=150 && bio.weight>=45 && bio.potential>=65);
 const actor=save=>save.sharedUniverse.npcs.find(n=>n.id==="trio-academy-player");
 assert.equal(actor(h.saved).club,bio.academy+"青训");
 const loaded=harness([...h.storage]);
 for(let i=0;i<3;i++){
  loaded.click("trioSeason");
  const save=loaded.saved,ai=actor(save);
  assert.equal(ai.age,16+i);
  assert.equal(save.sharedUniverse.trio.name,bio.name);
  assert.equal(ai.club,i<2?bio.academy+"青训":bio.academy);
  assert.equal(save.sharedUniverse.trio.history.length,i);
  assert(ai.apps>0);
  for(const career of Object.values(save.duoGames)){
   assert.equal(career.season.stage,"review");
   if(i===2)assert.equal(career.season.midseasonDecision.done,true);
  }
 }
 console.log("✓ 三剑客随机建档、读档、青训毕业、真实比赛出场与三季自动决策");
}
