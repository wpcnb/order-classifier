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
 const context={window:{FootballMarketV3:require(path.join(root,"market-v3.js")),FootballRolesV3:require(path.join(root,"role-v3.js"))},document,localStorage,console,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL};
 for(const file of files){let code=read(file);if(file==="game.js")code=code.replace(/\}\)\(\);\s*$/,'window.__opening={db:DB,names:()=>v10Persons,leagues:()=>openingLeagues,drawn:()=>drawnClubs,duo:()=>duoGames,step:()=>v10Step,prepareTrioTransfer,save};})();');vm.runInNewContext(code,context,{filename:file,timeout:14000})}
 const trigger=(type,target)=>{for(const fn of handlers["app:"+type]||[])fn({target})};
 return {storage,api:context.window.__opening,get html(){return node("app").innerHTML},get toast(){return node("toast").textContent},get opening(){return JSON.parse(storage.get(openingKey)||"null")},get saved(){return JSON.parse(storage.get(saveKey)||"null")},
  input(id,value){node(id).value=value},fail(on){rejectWrites=on},change(dataset,value){trigger("change",{dataset,value})},click(action,data={}){trigger("click",{closest:()=>({disabled:false,dataset:{action,...data}})})},flush(){let n=0;while(timers.length&&n++<30)timers.shift()()}};
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

for(const scenario of ["promotion","relegation","veteran","shortSeason","injured","bottomTier","scoutMiss"]){
 const h=harness();h.click("trioOpening");
 const games=h.api.duo(),year=games.wang.year;
 const n=games.wang.npcs.find(n=>n.id==="trio-academy-player");
 const strong=["promotion","scoutMiss"].includes(scenario);
 Object.assign(n,{club:strong||scenario==="bottomTier"?"上海申花":"曼城",pos:strong?"GK":"ST",
  apps:scenario==="shortSeason"?21:28,age:scenario==="veteran"?35:25,ov:96,goals:0,assists:0,
  poorStreak:1,rating:strong?8:5.5,scoutingRoll:scenario==="scoutMiss"?1:0,injuryMatches:scenario==="injured"?1:0});
 n.transferMatches=Array.from({length:n.apps},()=>({kind:"league",played:true,home:n.club,away:"对手",
  hs:1,as:strong?0:3,rating:n.rating,goals:0,assists:0}));
 const original=n.club;
 for(const career of Object.values(games))career.season.stage="review";
 h.api.prepareTrioTransfer(year);h.api.save();
 const review=h.saved.sharedUniverse.trio.review;
 if(scenario==="promotion")assert([1,2].includes(review.toTier)&&review.tier===0);
 else if(scenario==="relegation")assert.equal(review.toTier,review.tier-1);
 else assert.equal(review.toTier,review.tier,scenario+" must not move across tiers");
 assert.equal(n.club,original,"new club only takes effect at the season boundary");
 if(strong||scenario==="relegation"){
  const reload=harness([...h.storage]);
  reload.api.prepareTrioTransfer(year);reload.api.save();
  assert.deepEqual(reload.saved.sharedUniverse.trio.review,review,"reload cannot reroll");
  reload.click("trioSeason");
  const after=reload.saved.sharedUniverse;
  assert.equal(after.npcs.find(n=>n.id==="trio-academy-player").club,review.to);
  assert.deepEqual(after.trio.history.at(-1).transfer,review);
 }
}
console.log("✓ 人机门将零进球升档、连续低迷降档、豁免、球探、跨季生效与读档不重抽");

{
 const h=harness();
 h.input("trioName",h.api.names().wang);h.click("trioOpening");assert.equal(h.saved,null);
 h.input("trioName","  阿远  ");h.click("trioOpening");
 const old=h.saved,bio=old.sharedUniverse.trio;
 const actor=save=>save.sharedUniverse.npcs.find(n=>n.id==="trio-academy-player");
 assert.equal(bio.name,"阿远");assert.equal(actor(old).name,bio.name);
 actor(old).age=23;
 const game=harness([[saveKey,JSON.stringify(old)]]);
 assert.equal(actor(game.saved).club,bio.academy);
 assert.match(game.html,/当前球队（一线队）/);
 game.input("trioName","新名字");game.fail(true);game.click("trioRename");
 assert.equal(game.api.duo().wang.npcs.find(n=>n.id==="trio-academy-player").name,"阿远");
 game.fail(false);game.input("trioName",old.duoGames.wang.player.name);game.click("trioRename");
 assert.equal(game.saved.sharedUniverse.trio.name,"阿远");
 game.input("trioName","小鹰");game.click("trioRename");
 const reload=harness([...game.storage]);
 assert.equal(actor(reload.saved).name,"小鹰");assert.match(reload.html,/小鹰 · 人机球员/);
 console.log("✓ 开局命名、重名校验、旧档成年毕业、改名保存失败回滚和读档");
}

{
 const h=harness();h.click("trioOpening");
 const baseline=h.saved,year=baseline.duoGames.wang.year;
 for(const [streak,age,title,partial,expected] of [
  [0,22,false,false,1],[1,23,false,false,2],[2,24,false,false,3],
  [2,24,true,false,0],[2,17,false,false,0],[0,24,false,true,0],[2,39,false,false,3]
 ]){
  const fixture=JSON.parse(JSON.stringify(baseline)),u=fixture.sharedUniverse;
  const ai=u.npcs.find(n=>n.id==="trio-academy-player");
  Object.assign(ai,{age,club:age<18?"曼城青训":"曼城",trophylessStreak:streak,apps:0});
  for(const x of Object.values(fixture.duoGames))x.season.stage="review";
  if(title){
   u.rounds[year+":ENG"]={table:{[ai.club]:{name:ai.club,p:38,points:90,gf:87,ga:28}}};
   u.domesticCups[year+":ENG"]={year,champion:ai.club,name:"足总杯"};
   u.europeFinals.test={year,winner:ai.club,type:"欧冠"};
   u.europeFinals.earlier={year:year-1,winner:ai.club,type:"欧联"};
  }
  if(partial)u.trio.partialSeasonYear=year;
  const sim=harness([[saveKey,JSON.stringify(fixture)]]);
  sim.api.prepareTrioTransfer(year);sim.api.save();
  const review=sim.saved.sharedUniverse.trio.review;
  assert.deepEqual(review.titles,title?[h.api.db.ENG.name,"足总杯","欧冠"]:[]);
  if(title||partial||age<18){
   const reload=harness([...sim.storage]);
   assert.match(reload.html,title?/足总杯冠军、欧冠冠军 · 无冠计数清零/:partial?/中途加入，本季不计入无冠季数/:/青训赛季/);
  }
  assert.equal(review.trophylessStreak,expected);
  assert.equal(review.trophylessMove,expected===3&&age<39);
  if(review.trophylessMove){
   assert.notEqual(review.from,review.to);assert.equal(review.tier,review.toTier);
   const reload=harness([...sim.storage]);reload.api.prepareTrioTransfer(year);reload.api.save();
   assert.deepEqual(reload.saved.sharedUniverse.trio.review,review);
   reload.click("trioSeason");
   const after=reload.saved.sharedUniverse;
   assert.equal(after.npcs.find(n=>n.id==="trio-academy-player").club,review.to);
   assert.deepEqual(after.trio.history.at(-1).transfer,review);
   assert.match(reload.html,/连续无冠 3 季 · 同档转会/);
   assert(after.trio.review.trophylessStreak<=1,"new cycle after the move");
  }else assert.equal(review.to,review.from);
 }
 console.log("✓ 无冠一、二、三季边界、冠军清零、青训与半季豁免、同档转会落地并重新计数");
}

{
 const h=harness();h.click("trioOpening");
 const fixture=h.saved,year=fixture.duoGames.wang.year,bio=fixture.sharedUniverse.trio;
 const keeper=fixture.sharedUniverse.npcs.find(n=>n.id==="trio-academy-player");
 bio.position="GK";
 Object.assign(keeper,{pos:"GK",age:24,club:"曼城",apps:24,clean:8,europeApps:5,europeClean:3});
 bio.history.push({year:year-1,club:"曼城",age:23,apps:27,goals:0,assists:0});
 for(const x of Object.values(fixture.duoGames))x.season.stage="review";
 const sim=harness([[saveKey,JSON.stringify(fixture)]]);
 const split="联赛 24 场、8 次零封 · 欧战 5 场、3 次零封";
 assert(sim.html.includes(split),"keeper's current record separates league and European clean sheets");
 sim.click("trioSeason");
 const saved=sim.saved,history=saved.sharedUniverse.trio.history;
 assert.deepEqual(history.at(-1).goalkeeping,{leagueApps:24,leagueClean:8,europeApps:5,europeClean:3});
 assert.equal(history.at(-2).goalkeeping,undefined);
 const reload=harness([[saveKey,JSON.stringify(saved)]]);
 assert(reload.html.includes(split),"saved history keeps the split after reloading");
 assert(!reload.html.includes("27 场 · 0 球 · 0 助攻 · 联赛"),"legacy history must not invent zero clean sheets");
 Object.assign(keeper,{pos:"GK",age:17,club:"曼城青训",apps:4,clean:0,europeApps:0,europeClean:0});
 const youth=harness([[saveKey,JSON.stringify(fixture)]]);
 assert(youth.html.includes("青训联赛 4 场、0 次零封"));assert(!youth.html.includes("欧战 0 场、"));
 keeper.pos=bio.position="ST";
 assert(!harness([[saveKey,JSON.stringify(fixture)]]).html.includes("次零封"));
 console.log("✓ 人机门将零封按赛事归档，青训、零零封、旧档及外场球员显示正确");
}

{
 const h=harness();h.input("trioName","小林");h.click("trioOpening");
 const initial=h.saved,u=initial.sharedUniverse,year=initial.duoGames.wang.year;
 const panel=html=>html.split("<h2>三人身价与个人荣誉</h2>")[1].split("</section>")[0];
 const cards=html=>panel(html).match(/<article[\s\S]*?<\/article>/g);
 assert.equal(cards(h.html).length,3);
 for(const card of cards(h.html)){assert.match(card,/当前身价 <strong class="gold">€[1-9]/);assert.match(card,/金球奖 尚未获得/)}
 const ai=u.npcs.find(n=>n.id==="trio-academy-player");
 Object.assign(ai,{age:24,club:"曼城",pos:"GK",ov:84,apps:28,clean:12,rating:7.4});
 const previous=harness([[saveKey,JSON.stringify(initial)]]);
 const price=html=>cards(html)[2].match(/当前身价 <strong class="gold">(.*?)</)[1];
 const oldPrice=price(previous.html),id=ai.id;
 u.awards[year-1]={year:year-1,winner:{id,name:"改名前"},rankings:[{id,name:"改名前"}]};
 u.theBest[year-1]={year:year-1,winner:{id:"other"},rankings:[{id:"other"},{id}]};
 u.trio.personalAwards={[year-1]:["英超金手套奖"]};
 u.trio.history.push({year:year-1,apps:0,goals:0,assists:0,transfer:{year:year-1,titles:["足总杯"]}});
 const reload=harness([[saveKey,JSON.stringify(initial)]]),third=cards(reload.html)[2];
 assert.match(third,/金球奖 1 次/);assert.match(third,/世界足球先生 尚未获得/);
 assert.match(third,/英超金手套奖/);assert.match(third,/足总杯冠军/);
 assert.notEqual(price(reload.html),oldPrice,"the AI's verified Ballon d'Or influences valuation");
 assert.equal(price(harness([[saveKey,JSON.stringify(initial)]]).html),price(reload.html));
 for(const human of cards(reload.html).slice(0,2))assert.match(human,/金球奖 尚未获得/);
 console.log("✓ 三人自动估值，按稳定身份核对得奖、区分入围，旧档改名和刷新保留荣誉");
}

{
 const h=harness();h.click("trioOpening");
 assert(!h.html.includes("历年季末身价"));
 h.click("trioSeason");h.click("trioSeason");
 const fixture=h.saved,u=fixture.sharedUniverse,year=fixture.duoGames.wang.year;
 const cards=html=>html.split("<h2>三人身价与个人荣誉</h2>")[1].split("</section>")[0].match(/<article[\s\S]*?<\/article>/g);
 const entries=card=>card.split("<summary>历年季末身价</summary>")[1].split("</details>")[0].match(/<li>.*?<\/li>/g);
 for(const card of cards(h.html))assert.equal(entries(card).length,2,"each completed season has one snapshot per player");
 u.trio.history.push({year,transfer:{...u.trio.review,marketValue:1000000}});
 u.trio.history.unshift({year:year-5,transfer:null});
 u.trio.history[1].transfer.marketValue=2000000;
 u.trio.review.marketValue=2000000;
 fixture.duoGames.wang.player.marketValueHistory=[{year:year-1,value:1000000},{year,value:3000000}];
 const [first,,ai]=cards(harness([[saveKey,JSON.stringify(fixture)]]).html);
 assert.deepEqual(entries(first),['<li>'+year+' 赛季 · €300万 · 已记录最高</li>','<li>'+(year-1)+' 赛季 · €100万</li>']);
 assert.deepEqual(entries(ai),['<li>'+year+' 赛季 · €200万 · 已记录最高</li>','<li>'+(year-1)+' 赛季 · €200万 · 已记录最高</li>']);
 console.log("✓ 三人身价按已结算赛季倒序展示，读档兼容缺失估值、重复年份和并列最高");
}
