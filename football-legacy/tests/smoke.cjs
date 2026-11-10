"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const SAVE="football-dynasty-duo-v2-20261110",OLD="football-dynasty-v4-independent-20261101";
let core=fs.readFileSync(path.join(root,"game.js"),"utf8");
core=core.replace(/\}\)\(\);\s*$/,'window.__test={get:()=>g,seasonPerformance,generateOffers,shared:()=>sharedUniverse,playerMatchContribution,overall,compact:duoPayload,transferLevel,transferQualified,poissonGoals,simulateScore,awardCandidateScore,levels:TRANSFER_LEVELS,gates:TRANSFER_GATES};})();');
function harness(loaded=null){
 const storage=new Map(),cache={},handlers={},timers=[]; if(loaded)for(const [k,v]of loaded)storage.set(k,v);
 const node=id=>cache[id]||(cache[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const window={};const context={document,localStorage,window,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file,timeout:4000});
 vm.runInNewContext(core,context,{filename:"game.js",timeout:4000});
 return {get html(){return node("app").innerHTML},get state(){const data=storage.get(SAVE);return data?JSON.parse(data):null},get stored(){return storage},get api(){return window.__test},flush(){let n=0;while(timers.length&&n++<200)timers.shift()()},click(action,extras={}){const fn=handlers["app:click"];fn({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},page(p){const fn=handlers["app:click"];fn({target:{closest:()=>({disabled:false,dataset:{page:p}})}})}};
}
function log(s){console.log("✓ "+s)}
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");assert(html.includes('src="./game.js'));
const oldData=JSON.stringify({version:4,player:{name:"陆白"}});
const x=harness([[OLD,oldData],[OLD+"-safety",oldData]]);
assert(!x.stored.has(OLD)&&!x.stored.has(OLD+"-safety"),"old saves cleared");
assert(x.html.includes("双星同场")&&x.html.includes("王楚淇")&&x.html.includes("维尼修斯"));
assert(x.html.includes("club-wheel")&&x.html.includes("中超"));
log("Old data cleared; opening lottery wheels visible");
x.click("preset");assert(!x.state,"Must draw before starting");
x.click("spinClub",{id:"wang"});x.flush();
x.click("spinClub",{id:"vini"});x.flush();
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
assert(x.html.includes("一键同步模拟两人"));
log("Both named stars begin aged 16 at separate real CSL academies with scaled-down historical templates");
assert(!x.html.includes("切换并操作"),"No per-player switch buttons");
x.page("world");assert(x.html.includes("统一射手榜")&&x.html.includes("王楚淇")&&x.html.includes("维尼修斯"));
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
delete forcedFixture.duoGames.vini.player.transferDraw;
const forced=harness([[SAVE,JSON.stringify(forcedFixture)]]);
forced.page("transfer");
assert(forced.html.includes("promotion-wheel-wang")&&forced.html.includes("候选球队"),"Visible upgrade roulette should include valid next-tier candidates");
forced.click("simBoth");
assert.equal(forced.state.duoGames.wang.year,2028,"Cannot skip mandatory upgrade draw");
forced.click("spinPromotion",{id:"wang"});forced.flush();
const selected=forced.state.duoGames.wang.player.transferDraw.selected;
assert(selected&&["乌德勒支","格罗宁根","阿尔梅勒城"].includes(selected.club),"Draw must select only offered next-tier teams");
const replay=harness([[SAVE,forced.stored.get(SAVE)]]);
assert.equal(replay.state.duoGames.wang.player.transferDraw.selected.club,selected.club,"Lottery choice is restored from storage");
replay.page("honors");
assert(replay.html.includes("荣誉陈列室")&&replay.html.includes("金球奖逐年排名"),"Trophy cabinet includes Golden Ball records");
replay.click("simBoth");
assert.equal(replay.state.duoGames.wang.year,2029,"Ready pair should advance together");
assert.equal(replay.state.duoGames.wang.player.club,selected.club,"Actual new club must exactly match manually drawn club");
assert.equal(replay.state.duoGames.wang.player.leagueId,selected.id,"League must follow drawn destination");
assert.equal(replay.state.duoGames.wang.player.transferHistory.at(-1).reason,"抽签达标升级","Promotion history should distinguish lottery upgrades");
log("Promotion roulette blocks auto-advance; selected destination survives reload and is applied exactly");
const relegationSave=JSON.parse(x.stored.get(SAVE));
const down=relegationSave.duoGames.wang;
down.player.leagueId="ENG";down.player.club="阿森纳";down.player.forcedMove=true;down.player.forcedSameTier=false;
delete down.player.transferDraw;
down.offers=[{club:"布莱顿",id:"ENG",tier:3,wage:43000,years:3,move:"降档"},
{club:"富勒姆",id:"ENG",tier:3,wage:41000,years:3,move:"降档"}];
relegationSave.duoGames.vini.offers=[];delete relegationSave.duoGames.vini.player.transferDraw;
const downGame=harness([[SAVE,JSON.stringify(relegationSave)]]);
downGame.page("transfer");assert(downGame.html.includes("降档球队抽签"),"Relegation offers must open manual wheel");
downGame.click("simBoth");assert.equal(downGame.state.duoGames.wang.year,2028,"Relegation draw must block advancing");
downGame.click("spinPromotion",{id:"wang"});downGame.flush();
const downChoice=downGame.state.duoGames.wang.player.transferDraw.selected;
assert(["布莱顿","富勒姆"].includes(downChoice.club),"Relegation lottery only selects lower-tier eligible teams");
downGame.click("simBoth");
assert.equal(downGame.state.duoGames.wang.player.club,downChoice.club,"Relegation must use player-drawn club");
assert.equal(downGame.state.duoGames.wang.player.transferHistory.at(-1).reason,"强制降档");
log("Relegation also requires player lottery; trophyless same-tier moves are automatic");
const saved=x.stored.get(SAVE),reload=harness([[SAVE,saved]]);assert.equal(reload.state.duoGames.wang.history.length,3);
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
 assert(reload.html.includes('promotion-wheel-'+target));
 // A pending draw MUST prevent a next-season transition.
 reload.click("simBoth");
 assert.equal(reload.state.duoGames.wang.year,2028);
 reload.click("spinPromotion",{id:target});reload.flush();
 assert(reload.state.duoGames[target].player.transferDraw.selected,"Winning team immediately persisted");
 const previous=reload.state.duoGames[target].player.transferDraw.selected.club;
 const restored=harness([[SAVE,reload.stored.get(SAVE)]]);
 assert.equal(restored.state.duoGames[target].player.transferDraw.selected.club,previous,"Lottery result survives page reload");
}
for(const id of ["wang","vini"])if(reload.state.duoGames[id].player.transferDraw?.options?.length&&!reload.state.duoGames[id].player.transferDraw.selected){reload.click("spinPromotion",{id});reload.flush()}
reload.click("simBoth");state=reload.state;for(const id of ["wang","vini"]){assert.equal(state.duoGames[id].year,2029);assert.equal(state.duoGames[id].history.length,4)}
if(state.duoGames.wang.player.leagueId===state.duoGames.vini.player.leagueId)assert.deepEqual(state.duoGames.wang.season.leagueTable,state.duoGames.vini.season.leagueTable,"Players in same league must share table");log("Both careers advance synchronously into next season and survive reload");
const api=reload.api;
assert.deepEqual(Array.from(api.levels),["中超","欧洲非五大联赛普通球队","欧洲非五大联赛豪门","五大联赛普通球队","五大联赛豪门","世界传奇豪门"]);
assert.equal(api.transferLevel("CHN","成都蓉城"),0);
assert.equal(api.transferLevel("NED","乌德勒支"),1);
assert.equal(api.transferLevel("POR","波尔图"),2);
assert.equal(api.transferLevel("ENG","布莱顿"),3);
assert.equal(api.transferLevel("ENG","阿森纳"),4);
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
assert.equal(noCup2.trophylessStreak,2);assert.equal(noCup2.forcedSameTier,true);
assert.equal(noCup2.forcedMove,false);
const sameOffers=api.generateOffers();assert(sameOffers.length>0);
assert(sameOffers.every(o=>o.tier===3&&o.move==="同级转会"),"No-title transfer must stay within club tier");
log("Two trophyless seasons trigger same-tier transfers, independent of goal totals");

reload.click("newGame");assert(!reload.stored.has(SAVE));assert(reload.html.includes("双星同场"));
log("New game removes the old pair and starts another dual-card scenario");
console.log("All dual-player Football Dynasty tests passed.");
