"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const SAVE="football-dynasty-duo-v2-20261110",OLD="football-dynasty-v4-independent-20261101";
let core=fs.readFileSync(path.join(root,"game.js"),"utf8");
core=core.replace(/\}\)\(\);\s*$/,'window.__test={get:()=>g,duo:()=>duoGames,makeSchedule,setupSharedUefaSeason,linkSharedWorld,playEvent,offseasonRecovery,disciplinaryRecord,save,seasonPerformance,generateOffers,shared:()=>sharedUniverse,playerMatchContribution,overall,compact:duoPayload,transferLevel,transferQualified,poissonGoals,simulateScore,awardCandidateScore,cslPool:CSL_DRAW_TEAMS,levels:TRANSFER_LEVELS,gates:TRANSFER_GATES};})();');
function harness(loaded=null){
 const storage=new Map(),cache={},handlers={},timers=[]; if(loaded)for(const [k,v]of loaded)storage.set(k,v);
 const node=id=>cache[id]||(cache[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const window={};const context={document,localStorage,window,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file,timeout:4000});
 vm.runInNewContext(core,context,{filename:"game.js",timeout:4000});
 return {get html(){return node("app").innerHTML},get state(){const data=storage.get(SAVE);return data?JSON.parse(data):null},get stored(){return storage},get api(){return window.__test},flush(){let n=0;while(timers.length&&n++<200)timers.shift()()},click(action,extras={}){const fn=handlers["app:click"];fn({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},page(p){const fn=handlers["app:click"];fn({target:{closest:()=>({disabled:false,dataset:{page:p}})}})}};
}
function log(s){console.log("✓ "+s)}
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");assert(html.includes('src="./game.js'));
const oldData=JSON.stringify({version:4,player:{name:"陆白"}});
const oldDuo="football-dynasty-duo-v1-20261110",oldKeys=[OLD,OLD+"-safety",oldDuo,oldDuo+"-safety"];
const x=harness(oldKeys.map(k=>[k,oldData]));
for(const key of oldKeys)assert.equal(x.stored.get(key),oldData,"opening must preserve old data: "+key);
assert(x.html.includes("导出旧版单人生涯")&&x.html.includes("导出旧版双人生涯"),"old save export available on opening");
assert(x.html.includes("双星同场")&&x.html.includes("王楚淇")&&x.html.includes("维尼修斯"));
assert(x.html.includes("draw-card-grid")&&x.html.includes("中超"));
assert.equal(x.api.cslPool().length,16);assert(x.api.cslPool().includes("辽宁铁人")&&x.api.cslPool().includes("重庆铜梁龙"));assert(!x.api.cslPool().includes("长春亚泰")&&!x.api.cslPool().includes("梅州客家"));
log("Old data preserved; ten opening club cards visible");

const overseas=harness();
overseas.click("chooseAcademy",{id:"wang",league:"ENG"});
overseas.click("chooseAcademy",{id:"vini",league:"ESP"});
const openSave=overseas.stored.get("football-dynasty-opening-v3");
assert(openSave&&JSON.parse(openSave).decks.wang.length===10);
const overseasReload=harness([["football-dynasty-opening-v3",openSave]]);
assert(overseasReload.html.includes("英超")&&overseasReload.html.includes("西甲"),"Opening youth leagues must survive page reload");
overseasReload.click("flipOpeningCard",{id:"wang",i:0});overseasReload.flush();
overseasReload.click("flipOpeningCard",{id:"vini",i:0});overseasReload.flush();
const revealSave=overseasReload.stored.get("football-dynasty-opening-v3");
const overseasLocked=harness([["football-dynasty-opening-v3",revealSave]]);
assert(overseasLocked.html.includes("已抽中"),"Opening card selection must remain locked after refresh");
overseasLocked.click("preset");
assert.equal(overseasLocked.state.duoGames.wang.player.leagueId,"ENG");
assert.equal(overseasLocked.state.duoGames.vini.player.leagueId,"ESP");
assert(overseasLocked.state.duoGames.wang.player.club.endsWith("青训"));
assert(overseasLocked.state.duoGames.vini.player.club.endsWith("青训"));
log("Separate English and Spanish academy drafts survive reload and open valid youth careers");

x.click("preset");assert(!x.state,"Must draw before starting");
x.click("flipOpeningCard",{id:"wang",i:0});x.flush();
x.click("flipOpeningCard",{id:"vini",i:0});x.flush();
assert(x.html.includes("已抽中"));
x.click("preset");let state=x.state;
assert.equal(state.version,2);assert.equal(state.activeDuo,"wang");
assert.deepEqual(Object.keys(state.duoGames).sort(),["vini","wang"]);
const w=state.duoGames.wang.player,v=state.duoGames.vini.player;
assert.equal(w.name,"王楚淇");assert.equal(v.name,"维尼修斯");
for(const p of [w,v]){
 assert.equal(p.country,"中国");assert.equal(p.age,16);assert.equal(p.youth,true);
 assert(p.potential>p.sourceRating);assert.equal(p.leagueId,"CHN");
 assert(p.club.endsWith("青训"));assert.equal(p.academyGraduationAge,18);
 assert.equal(p.career.apps,0);assert.equal(p.academyCareer.apps,0);
}
assert.notEqual(w.club,v.club,"Distinct CSL club assignments");
assert(!["皇家马德里"].includes(v.club));
assert.equal(w.sourceRating,83);assert.equal(v.sourceRating,77);
assert.equal(w.heightCm,177);assert.equal(v.heightCm,176);
assert.equal(w.born,"1999-02-06");assert.equal(v.born,"2000-07-12");
assert(x.html.includes("模拟当前赛季")&&x.html.includes("自主退役"));
log("Both named stars begin aged 16 at separate real CSL academies with scaled-down historical templates");
assert(!x.html.includes("切换并操作"),"No per-player switch buttons");
x.page("world");assert(x.html.includes("双主角进球对比")&&x.html.includes("仅显示两名主角")&&x.html.includes("王楚淇")&&x.html.includes("维尼修斯"));
x.page("transfer");assert(x.html.includes("双人转会")&&x.html.includes("升降档球队"));
x.page("honors");assert(x.html.includes("双星荣誉陈列室")&&x.html.includes("金球奖逐年排名"));
x.page("dashboard");
log("One-click dual dashboard and academy-first mode");
for(let youthYear=0;youthYear<2;youthYear++){
 x.click("simBoth");
 const academy=x.state;
 assert.equal(academy.duoGames.wang.year,2026+youthYear);
 assert.deepEqual(academy.duoGames.wang.season.leagueTable,academy.duoGames.vini.season.leagueTable);
 assert(academy.sharedUniverse.rounds[(2026+youthYear)+":CHN:ACADEMY"]);
 for(const id of ["wang","vini"]){
  const p=academy.duoGames[id].player;
  assert(p.youth);assert.equal(p.age,16+youthYear);
  assert(p.academyCareer.apps>0,"Player must feature in youth competitions");
  assert.equal(p.career.apps,0,"Youth games do not count as adult league games");
  assert.equal(p.trophylessStreak||0,0,"Youth years cannot trigger senior trophyless departures");
  assert.equal(academy.duoGames[id].offers.length,0,"Academy player cannot receive professional transfer offers");
  assert.equal(p.forcedSameTier,false);
  assert.equal(p.forcedMove,false);
  assert(!academy.duoGames[id].honors.some(h=>h.name==="中超冠军"),"Youth champions cannot be mistaken for senior CSL champions");
  const yr=academy.duoGames[id].worldHistory.find(h=>h.year===2026+youthYear);assert(yr,"world season history exists");assert(!String(yr.champions.CHN||"").endsWith("青训"),"Academy champion must not be recorded as senior CSL champion");
 }
}
assert.equal(x.state.duoGames.wang.year,2027);
assert.equal(x.state.duoGames.vini.year,2027);
log("16-17 youth seasons finish with separate academy history and no senior transfers");
x.click("simBoth");state=x.state;
for(const id of ["wang","vini"]){
 const p=state.duoGames[id].player;
 assert.equal(p.age,18);assert.equal(p.youth,false);assert(p.academyCareer.apps>0);
 assert.equal(p.club,p.academyParentClub);
 assert(p.stats.pace>=(id==="wang"?90:93),"Age-18 pace must match the original player's template");
 assert(p.stats.shoot>=(id==="wang"?80:72),"Age-18 shooting must match the original player's template");
 assert(p.career.apps>0,"Senior stats begin only from adult 2028 season");
}
log("Both enter their parent CSL clubs' first teams at age 18, preserving youth records");
for(const id of ["wang","vini"]){
 const s=state.duoGames[id];assert.equal(s.season.stage,"review",id+" season incomplete");
 assert.equal(s.history.length,3);assert(s.season.apps>=0);assert.equal(s.ballonHistory.length,3);
 assert.equal(s.ballonHistory[0].model,6);assert.equal(state.sharedUniverse.awards[2028].ballots.length,100);assert.equal(state.sharedUniverse.awards[2028].totalPoints,6700);
 assert(s.lastReview.performance);
}
assert.equal(state.duoGames.wang.ballonHistory[0].winner.name,state.duoGames.vini.ballonHistory[0].winner.name,"One unified Ballon d'Or winner");
assert.equal(Object.keys(state.sharedUniverse.awards).length,3);
assert.equal(state.compact,1,"Compact storage enabled");
assert(!("npcs" in state.duoGames.wang)&&!("npcs" in state.duoGames.vini),"NPC roster not duplicated");
assert(!("world" in state.duoGames.wang.season)&&!("world" in state.duoGames.vini.season),"World state not duplicated");
assert(!("leagueRounds" in state.duoGames.wang.season),"Regenerable fixture schedule not saved");
assert(x.stored.get(SAVE).length<1000000,"Save should fit comfortably inside mobile localStorage");
x.page("awards");assert(x.html.includes("同一届金球奖")&&x.html.includes("王楚淇")&&x.html.includes("维尼修斯"));
x.page("world");assert(x.html.includes("统一射手榜")&&x.html.includes("王楚淇")&&x.html.includes("维尼修斯"));
const l1=state.duoGames.wang.season.leagueTable,l2=state.duoGames.vini.season.leagueTable;
assert.deepEqual(l1,l2,"Both players must see same CSL league table");
assert.equal(Object.values(l1).reduce((acc,t)=>acc+t.p,0),16*30,"Every CSL round counted once");
const firstYearLedger=state.sharedUniverse.rounds["2028:CHN"];
assert.equal(Object.keys(firstYearLedger.rounds).length,30,"Shared score ledger covers exactly one full season");
for(const fixture of Object.values(firstYearLedger.rounds).flat()){
 if(![w.club,v.club].includes(fixture.home)||![w.club,v.club].includes(fixture.away))continue;
 const a=state.duoGames.wang.season.results.find(m=>m.kind==="league"&&m.home===fixture.home&&m.away===fixture.away);
 const b=state.duoGames.vini.season.results.find(m=>m.kind==="league"&&m.home===fixture.home&&m.away===fixture.away);
 assert(a&&b,"Head-to-head fixture missing in either career");
 assert.equal(a.hs,b.hs);assert.equal(a.as,b.as);
}
for(const f of Object.values(firstYearLedger.rounds).flat())assert.equal(f.npcAllocated,true,"AI goals must be assigned only once");
for(const id of ["wang","vini"]){const x=state.duoGames[id],matches=x.season.results.filter(z=>z.kind==="league");
 assert(matches.every(z=>(z.goals||0)+(z.assists||0)<=(z.home===x.player.club?z.hs:z.as)),"Personal goal and assist figures cannot exceed team goals");
}
log("Both careers share one league and attribute player/NPC goals exactly once");
// Deterministic interactive draw test: even if a random baseline season had no offer.
const forcedFixture=JSON.parse(x.stored.get(SAVE));
const fixturePlayer=forcedFixture.duoGames.wang;
fixturePlayer.player.leagueId="CHN";fixturePlayer.player.forcedMove=false;fixturePlayer.player.forcedSameTier=false;
fixturePlayer.player.transferAssessment={...fixturePlayer.player.transferAssessment,maxTier:1,qualified:true};
delete fixturePlayer.player.transferDraw;
fixturePlayer.offers=[{club:"乌德勒支",id:"NED",tier:1,wage:42000,years:3,move:"升级"},
 {club:"格罗宁根",id:"NED",tier:1,wage:40000,years:4,move:"升级"},
 {club:"阿尔梅勒城",id:"NED",tier:1,wage:37000,years:3,move:"升级"}];
forcedFixture.duoGames.vini.offers=[];forcedFixture.duoGames.vini.player.forcedMove=false;
forcedFixture.duoGames.vini.player.forcedSameTier=false;
forcedFixture.duoGames.vini.player.transferAssessment={...forcedFixture.duoGames.vini.player.transferAssessment,maxTier:0,qualified:false};
delete forcedFixture.duoGames.vini.player.transferDraw;
const forced=harness([[SAVE,JSON.stringify(forcedFixture)]]);
forced.page("transfer");
assert(forced.html.includes("十张球队盲抽卡")&&forced.html.includes("幸运跳级"),"Promotion cards must show the 9+1 blind draw");
forced.click("simBoth");
assert.equal(forced.state.duoGames.wang.year,2028,"Cannot skip mandatory upgrade draw");
const cards=forced.api.duo().wang.player.transferDraw.options;
assert.equal(cards.length,10);
assert.equal(cards.filter(o=>o.tier===1).length,9);
assert.equal(cards.filter(o=>o.tier===2).length,1);
forced.click("flipPromotionCard",{id:"wang",i:0});forced.flush();
const selected=forced.state.duoGames.wang.player.transferDraw.selected;
assert(selected&&cards.some(o=>o.club===selected.club),"Draw must select one of the ten visible hidden cards");
const replay=harness([[SAVE,forced.stored.get(SAVE)]]);
assert.equal(replay.state.duoGames.wang.player.transferDraw.selected.club,selected.club,"Lottery choice is restored from storage");
replay.page("honors");
assert(replay.html.includes("荣誉陈列室")&&replay.html.includes("金球奖逐年排名"),"Trophy cabinet includes Golden Ball records");
replay.click("acceptDraw",{id:"wang"});replay.click("simBoth");
assert.equal(replay.state.duoGames.wang.year,2029,"Ready pair should advance together");
assert.equal(replay.state.duoGames.wang.player.club,selected.club,"Actual new club must exactly match manually drawn club");
assert.equal(replay.state.duoGames.wang.player.leagueId,selected.id,"League must follow drawn destination");
assert.equal(replay.state.duoGames.wang.player.transferHistory.at(-1).reason,"抽签达标升级","Promotion history should distinguish lottery upgrades");
log("Promotion cards block auto-advance and preserve the manually flipped result");
const declined=harness([[SAVE,JSON.stringify(forcedFixture)]]);
declined.page("transfer");
const beforeStay=declined.state.duoGames.wang.player.club;
declined.click("declineDraw",{id:"wang"});
declined.click("simBoth");
assert.equal(declined.state.duoGames.wang.player.club,beforeStay,"Declining a club draw must preserve the original club");
log("A player may decline the unlocked draw and continue at the current club");

const relegationSave=JSON.parse(x.stored.get(SAVE));
const down=relegationSave.duoGames.wang;
down.player.leagueId="ENG";down.player.club="切尔西";down.player.forcedMove=true;down.player.forcedSameTier=false;
delete down.player.transferDraw;
down.offers=[{club:"布莱顿",id:"ENG",tier:3,wage:43000,years:3,move:"降档"},
{club:"富勒姆",id:"ENG",tier:3,wage:41000,years:3,move:"降档"}];
relegationSave.duoGames.vini.offers=[];delete relegationSave.duoGames.vini.player.transferDraw;
relegationSave.duoGames.vini.player.forcedMove=false;
relegationSave.duoGames.vini.player.forcedSameTier=false;
relegationSave.duoGames.vini.player.transferAssessment={...relegationSave.duoGames.vini.player.transferAssessment,maxTier:0,qualified:false};
const downGame=harness([[SAVE,JSON.stringify(relegationSave)]]);
downGame.page("transfer");assert(downGame.html.includes("十张球队盲抽卡"),"Relegation offers must open manual cards");
assert.equal(downGame.api.duo().wang.player.transferDraw.options.length,10);
assert(downGame.api.duo().wang.player.transferDraw.options.every(o=>o.tier===3));
downGame.click("simBoth");assert.equal(downGame.state.duoGames.wang.year,2028,"Relegation draw must block advancing");
downGame.click("flipPromotionCard",{id:"wang",i:0});downGame.flush();
const downChoice=downGame.state.duoGames.wang.player.transferDraw.selected;
assert(downGame.api.duo().wang.player.transferDraw.options.some(o=>o.club===downChoice.club),"Relegation chooses a valid lower-tier card");
downGame.click("acceptDraw",{id:"wang"});downGame.click("simBoth");
assert.equal(downGame.state.duoGames.wang.player.club,downChoice.club,"Relegation must use player-drawn club");
assert.equal(downGame.state.duoGames.wang.player.transferHistory.at(-1).reason,"强制降档");
log("Relegation also requires player lottery and explicit acceptance");
const saved=x.stored.get(SAVE),reload=harness([[SAVE,saved],...oldKeys.map(k=>[k,oldData])]);assert.equal(reload.state.duoGames.wang.history.length,3);
assert(!reload.html.includes("切换并操作"));
assert(reload.api.get().npcs.length>100,"NPC roster restored after compact reload");
assert.equal(reload.api.get().season.leagueRounds.length,30,"Fixture calendar restored after compact reload");
const skill=reload.api.get().player,high={...skill,leagueId:"CHN",position:"LW",stats:{...skill.stats,pace:95,shoot:95,pass:94,dribble:95,mental:95}},low={...skill,leagueId:"CHN",position:"LW",stats:{...skill.stats,pace:55,shoot:55,pass:55,dribble:55,mental:55}};
let highG=0,lowG=0,highA=0,lowA=0;
for(let i=0;i<8000;i++){const h=reload.api.playerMatchContribution(high,{kind:"league"},65,3),l=reload.api.playerMatchContribution(low,{kind:"league"},65,3);highG+=h.goals;lowG+=l.goals;highA+=h.assists;lowA+=l.assists}
assert(highG>lowG*2,"High-ability attacker should convert materially more CSL goals");
assert(highA>lowA*1.08,"High-ability attacker should create more CSL assists across a large sample");
log("High-skill CSL conversion scales up goals and assists without exceeding team scoring");
const drawsBeforeReload=["wang","vini"].filter(id=>reload.state.duoGames[id].player.transferDraw?.options?.length);
if(drawsBeforeReload.length){
 const target=drawsBeforeReload[0];reload.page("transfer");
 assert(reload.html.includes("十张球队盲抽卡"));
 // A pending draw MUST prevent a next-season transition.
 reload.click("simBoth");
 assert.equal(reload.state.duoGames.wang.year,2028);
 reload.click("flipPromotionCard",{id:target,i:0});reload.flush();
 assert(reload.state.duoGames[target].player.transferDraw.selected,"Winning team immediately persisted");
 const previous=reload.state.duoGames[target].player.transferDraw.selected.club;
 const restored=harness([[SAVE,reload.stored.get(SAVE)]]);
 assert.equal(restored.state.duoGames[target].player.transferDraw.selected.club,previous,"Lottery result survives page reload");
}
for(const id of ["wang","vini"])if(reload.state.duoGames[id].player.transferDraw?.options?.length){if(!reload.state.duoGames[id].player.transferDraw.selected){reload.click("flipPromotionCard",{id,i:0});reload.flush()}reload.click("acceptDraw",{id})}
reload.click("simBoth");state=reload.state;for(const id of ["wang","vini"]){assert.equal(state.duoGames[id].year,2029);assert.equal(state.duoGames[id].history.length,4)}
if(state.duoGames.wang.player.leagueId===state.duoGames.vini.player.leagueId)assert.deepEqual(state.duoGames.wang.season.leagueTable,state.duoGames.vini.season.leagueTable,"Players in same league must share table");log("Both careers advance synchronously into next season and survive reload");

const retirementFixture=harness([[SAVE,x.stored.get(SAVE)]]);
retirementFixture.click("retirePlayer",{id:"wang"});
assert.equal(retirementFixture.state.duoGames.wang.player.retired,true);
assert.equal(retirementFixture.state.duoGames.vini.player.retired||false,false);
retirementFixture.click("simBoth");
assert.equal(retirementFixture.state.duoGames.vini.season.stage,"review","The surviving player must finish the season");
const afterOne=retirementFixture.state.duoGames.vini.year;
const survivorDraw=retirementFixture.state.duoGames.vini.player.transferDraw;
if(survivorDraw?.options?.length&&!survivorDraw.accepted&&!survivorDraw.declined){
 retirementFixture.click("simBoth");
 assert.equal(retirementFixture.state.duoGames.vini.year,afterOne,"Unresolved transfer decision must stop year advance");
 retirementFixture.click("declineDraw",{id:"vini"});
}
retirementFixture.click("simBoth");
assert.equal(retirementFixture.state.duoGames.vini.year,afterOne+1,"The surviving player must reach the following year");
assert.equal(retirementFixture.state.duoGames.wang.year,afterOne+1,"Retired player's world year must stay synchronized");
assert.equal(retirementFixture.state.duoGames.wang.player.retired,true);
assert(retirementFixture.state.sharedUniverse.npcOffseasonYears.includes(afterOne+1),"AI season turnover must occur even after Wang retires");
const retirementReload=harness([[SAVE,retirementFixture.stored.get(SAVE)]]);
assert.equal(retirementReload.state.duoGames.wang.player.retired,true,"Retirement must persist after reload");
log("Independent retirement works without a next generation and the surviving player continues");

const api=reload.api;
assert.deepEqual(Array.from(api.levels),["中超","欧洲非五大联赛普通球队","欧洲非五大联赛豪门","五大联赛普通球队","五大联赛豪门","世界传奇豪门"]);
assert.equal(api.transferLevel("CHN","成都蓉城"),0);
assert.equal(api.transferLevel("NED","海伦芬"),1);
assert.equal(api.transferLevel("POR","波尔图"),2);
assert.equal(api.transferLevel("ENG","布莱顿"),3);
assert.equal(api.transferLevel("ENG","切尔西"),4);
for(const [league,club] of [["ESP","皇家马德里"],["ESP","巴塞罗那"],["FRA","巴黎圣日耳曼"],["ENG","曼城"],["ENG","曼联"]])assert.equal(api.transferLevel(league,club),5,club+" is legendary");
const active=api.get();const p=active.player,s=active.season;
p.leagueId="ESP";p.club="皇家马德里";p.position="LW";p.poorStreak=0;p.forcedMove=false;
s.apps=26;s.goals=0;s.assists=0;s.ratings=Array(26).fill(6.3);s.results=Array.from({length:26},(_,i)=>({kind:"league",played:true,goals:0,assists:0,rating:6.3,home:"皇家马德里",away:"对手",hs:0,as:0,date:"2027-01-"+String(i+1).padStart(2,"0")}));
const first=api.seasonPerformance();assert(first.poor&&!first.forcedMove&&first.poorStreak===1);
const second=api.seasonPerformance();assert(second.poor&&second.forcedMove&&second.poorStreak===2);
const offers=api.generateOffers();assert(offers.length>0);
assert(offers.every(o=>o.tier===4&&o.move==="降档"),"Legendary clubs must demote one level to ordinary five-league elite clubs");
log("World legendary clubs demote only to five-league elite tier");
// Switch to CSL: consecutive poor seasons cannot trigger a fictitious demotion within CSL.
p.leagueId="CHN";p.club="上海海港";p.poorStreak=0;p.forcedMove=false;
const csla=api.seasonPerformance();const cslb=api.seasonPerformance();
assert(csla.poor&&cslb.poor&&cslb.poorStreak===2&&!cslb.forcedMove,"CSL has no lower tier");
const cslOffers=api.generateOffers();
assert(cslOffers.every(o=>o.tier===0&&o.move==="同级转会"),"CSL moves must never be marked as relegation");
log("Poor CSL seasons retain player or offer same-tier moves, never false relegation");
// Promotions are limited to one step, even for an exceptionally productive attacker.
p.poorStreak=0;p.forcedMove=false;p.trophylessStreak=0;p.forcedSameTier=false;p.scoutingRoll=0;
s.results=Array.from({length:28},(_,i)=>({kind:"league",played:true,goals:2,assists:1,rating:9.1,home:"上海海港",away:"对手",hs:4,as:0,date:"2027-04-"+String(i+1).padStart(2,"0")}));
const good=api.seasonPerformance();assert.equal(good.maxTier,1);
const stepOffers=api.generateOffers();assert(stepOffers.some(o=>o.tier===1));
assert(stepOffers.every(o=>o.tier<=1));
log("Outstanding CSL performance unlocks exactly one European tier, not instant transfer to a giant");

let totalGoals=0,extreme=0;
for(let i=0;i<20000;i++){const [home,away]=api.simulateScore("曼联","曼城");totalGoals+=home+away;if(home+away>=8)extreme++}
const averageGoals=totalGoals/20000;
assert(averageGoals>2&&averageGoals<3.5,"Total match goals should resemble football, not arcade scores");
assert(extreme/20000<.035,"Eight-goal games must be exceptional");
log("Poisson model averages realistic match totals and rarely produces 8+ goal games");
const topStar={club:"皇家马德里",ov:94,goals:27,assists:15,apps:49,rating:7.7};
const playerStar={club:"上海海港",ov:91,goals:38,assists:17,apps:48,rating:8.0};
let starWins=0;for(let i=0;i<1500;i++)if(api.awardCandidateScore(topStar,2027,2)>api.awardCandidateScore(playerStar,2027,0))starWins++;
assert(starWins>300,"Strong European stars with trophies should remain serious Ballon d'Or contenders");
log("Golden Ball awards compare league strength and team trophies, not goals alone");
// Two trophyless seasons force a lateral transfer, not a demotion or upgrade.
p.leagueId="ENG";p.club="布莱顿";p.trophylessStreak=0;p.poorStreak=0;p.forcedMove=false;p.forcedSameTier=false;
active.honors=active.honors.filter(h=>h.year!==active.year||h.type!=="team");
s.results=Array.from({length:30},(_,i)=>({kind:"league",played:true,goals:1,assists:0,rating:8.0,home:p.club,away:"对手",hs:2,as:0}));
const noCup1=api.seasonPerformance(),noCup2=api.seasonPerformance();
assert.equal(noCup1.trophylessStreak,1);assert.equal(noCup1.forcedSameTier,false);
assert.equal(noCup2.trophylessStreak,2);assert.equal(noCup2.forcedSameTier,false);assert.equal(p.sameTierReminder,true);
assert.equal(noCup2.forcedMove,false);
const sameOffers=api.generateOffers();assert(sameOffers.length>0);
assert(!p.forcedSameTier,"Trophyless streak must not force a club switch");
log("Two trophyless seasons only notify players without enforcing a transfer");

// One real simulated 2048/49 Champions League, never two independent worlds.
const fixture=harness([[SAVE,x.stored.get(SAVE)]]);
const participants=fixture.api.duo();
for(const [id,club,leagueId] of [["wang","巴黎圣日耳曼","FRA"],["vini","巴塞罗那","ESP"]]){
 const game=participants[id];game.year=2048;game.player.age=38;game.player.club=club;game.player.leagueId=leagueId;game.player.youth=false;
 game.season=fixture.api.makeSchedule(game.player,2048,1);
 game.honors=[];game.history=[];game.offers=[];
}
fixture.api.linkSharedWorld();
fixture.api.setupSharedUefaSeason();
fixture.api.save();
const world=fixture.api.duo();
const cup=fixture.state.sharedUniverse.europeCompetitions["2048:欧冠"];
assert(cup,"2048 season must have one shared European cup");
assert.equal(cup.clubs.length,36);
assert.equal(cup.rounds.length,8);
assert(cup.rounds.every(x=>x.length===18),"36 teams must play eight matchdays in one timetable");
assert.equal(cup.ko.filter(x=>x.stage==="决赛").length,1);
assert.equal(world.wang.season.uefa.table,world.vini.season.uefa.table,
 "Both club seasons must reference the same standing table object");
for(const id of ["wang","vini"]){
 const club=world[id].player.club,evs=world[id].season.events.filter(e=>e.kind==="europe");
 assert.equal(evs.length,8);
 for(const e of evs){
  const original=cup.rounds[e.round].find(x=>x.id===e.fixtureId);
  assert(original&&[original.home,original.away].includes(club),"User European fixtures must belong to the shared competition");
 }
}
fixture.click("simBoth");
const result=fixture.state,comp=result.sharedUniverse.europeCompetitions["2048:欧冠"],champ=result.sharedUniverse.europeFinals["2048:欧冠"];
assert(champ,"Global UEFA winner must be declared even if only NPC clubs reach the final");
assert.equal(champ.winner,comp.champion);
const finals=comp.ko.filter(m=>m.stage==="决赛");
assert.equal(finals.length,1);
assert.deepEqual([champ.home,champ.away].sort(),[finals[0].home,finals[0].away].sort());
const claims=["wang","vini"].flatMap(id=>result.duoGames[id].honors.filter(h=>h.year===2048&&h.name==="欧冠冠军").map(h=>id));
assert(claims.length<=1,"Paris and Barça cannot both be champions in 2048");
assert.equal(claims.length,["巴黎圣日耳曼","巴塞罗那"].includes(champ.winner)?1:0);
const fixtureReload=harness([[SAVE,fixture.stored.get(SAVE)]]);
assert.equal(fixtureReload.state.sharedUniverse.europeFinals["2048:欧冠"].winner,champ.winner);
assert.equal(fixtureReload.state.sharedUniverse.europeCompetitions["2048:欧冠"].ko.filter(x=>x.stage==="决赛").length,1);
log("2048 Paris/Barcelona: one shared 36-team calendar, standings, knockout and champion");
const oldTwoWinner=JSON.parse(fixture.stored.get(SAVE));
oldTwoWinner.sharedUniverse.europeFinals["2048:欧冠"].winner="曼城";
for(const [id,club] of [["wang","巴黎圣日耳曼"],["vini","巴塞罗那"]]){
 const x=oldTwoWinner.duoGames[id];
 x.honors=x.honors.filter(h=>h.name!=="欧冠冠军"||h.year!==2048);
 x.honors.push({name:"欧冠冠军",year:2048,generation:x.generation,type:"team"});
 x.history.push({year:2048,generation:x.generation,club,average:"7.8",goals:11});
}
const corrected=harness([[SAVE,JSON.stringify(oldTwoWinner)]]);
assert.equal(corrected.state.sharedUniverse.europeFinals["2048:欧冠"].winner,"曼城",
 "Historic double claims must not overwrite a real recorded UEFA winner");
assert.equal(["wang","vini"].reduce((n,id)=>n+corrected.state.duoGames[id].honors.filter(h=>h.name==="欧冠冠军"&&h.year===2048).length,0),0,
 "Both contradictory titles must be removed when true champion is third club");
assert.equal(corrected.state.sharedUniverse.europeTitleCorrections.length,1);
log("Historic double champions corrected without replacing a shared final winner");
const separateCups=harness([[SAVE,x.stored.get(SAVE)]]);
for(const [id,club,leagueId,rank] of [["wang","巴黎圣日耳曼","FRA",1],["vini","巴塞罗那","ESP",6]]){
 const xx=separateCups.api.duo()[id];xx.year=2048;
 xx.player.age=38;xx.player.youth=false;xx.player.club=club;xx.player.leagueId=leagueId;
 xx.season=separateCups.api.makeSchedule(xx.player,2048,rank);
}
separateCups.api.linkSharedWorld();separateCups.api.setupSharedUefaSeason();separateCups.api.save();
const leagueCups=separateCups.state.sharedUniverse.europeCompetitions;
assert(leagueCups["2048:欧冠"]&&leagueCups["2048:欧联"],"Both European competitions must be created");
const aTeams=new Set(leagueCups["2048:欧冠"].clubs),bTeams=new Set(leagueCups["2048:欧联"].clubs);
assert.equal(aTeams.size,36);assert.equal(bTeams.size,36);
assert.equal([...aTeams].filter(name=>bTeams.has(name)).length,0,
 "No club may enter both UEFA competitions in the same simulated season");
log("UEFA Champions League and Europa League contain separate, non-overlapping 36-club fields");
// Competition-specific bans and year-spanning injuries. Never consume a league ban in a cup match.
const medical=harness([[SAVE,x.stored.get(SAVE)]]);
const m=medical.api.get(),athlete=m.player;
athlete.injuryMatches=0;athlete.stamina=95;athlete.discipline={
 league:{yellow:4,ban:2},cup:{yellow:0,ban:0},europe:{yellow:1,ban:1},national:{yellow:0,ban:0}
};
m.season.stage="playing";m.season.index=0;m.season.world={}; // isolated unit fixture: skip unrelated world catch-up
const firstLeague=m.season.events.find(e=>e.kind==="league");
assert(firstLeague);
medical.api.playEvent(firstLeague,"balanced",true);
assert.equal(m.season.results.at(-1).missedReason,"suspension");
assert.equal(athlete.discipline.league.ban,1);
assert.equal(athlete.discipline.europe.ban,1);
assert.equal(m.season.results.at(-1).played,false);
const cupEvent=m.season.events.find(e=>e.kind==="cup");
assert(cupEvent,"Cup fixture required for separate competition ban regression");
m.season.cup.active=true; // a previous completed season may have eliminated this cup team
medical.api.playEvent(cupEvent,"balanced",true);
assert.notEqual(m.season.results.at(-1).missedReason,"suspension","Domestic cup should not consume league suspension");
assert.equal(athlete.discipline.league.ban,1);
assert.equal(athlete.discipline.europe.ban,1);
athlete.injuryMatches=4;athlete.stamina=42;
const recovered=medical.api.offseasonRecovery(athlete);
assert(recovered.injuryAfter>0&&recovered.injuryAfter<4,"Serious injury should partially heal but persist across summer");
assert(athlete.stamina>42&&athlete.stamina<=95);
assert.equal(athlete.discipline.league.yellow,0,"Accrued yellow cards reset at new season");
assert.equal(athlete.discipline.league.ban,1,"Ban still applies next league season");
assert.equal(athlete.discipline.europe.ban,1,"European ban still applies next UEFA season");
log("Injuries, off-season recovery, UEFA and domestic suspensions remain independent");

reload.click("newGame");assert(!reload.stored.has(SAVE));assert(reload.html.includes("双星同场"));
for(const key of oldKeys)assert.equal(reload.stored.get(key),oldData,"new game must not delete legacy save: "+key);
log("New game removes the old pair and starts another dual-card scenario");
console.log("All dual-player Football Dynasty tests passed.");
