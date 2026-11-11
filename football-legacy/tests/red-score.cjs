"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const core=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__test={duo:()=>duoGames,setG:id=>{activeDuo=id;g=duoGames[id]},makeSchedule,linkSharedWorld,playEvent,shared:()=>sharedUniverse,dismissalScoreModifiers,setScore:f=>{simulateScore=f}};})();');
function harness(){
 const storage=new Map(),nodes={},handlers={},timers=[],math=Object.create(Math);math.random=()=>.0001;
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn},click(){}});
 const context={Math:math,window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const f of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,f),"utf8"),context,{filename:f});
 vm.runInNewContext(core,context,{filename:"game.js"});
 return {api:context.window.__test,click(action,extras={}){handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},flush(){while(timers.length)timers.shift()()}};
}
function setup(sameLeague=false){
 const h=harness();for(const id of ["wang","vini"]){h.click("flipOpeningCard",{id,i:0});h.flush()}h.click("preset");
 const d=h.api.duo(),w=d.wang,v=d.vini;
 w.player.club=w.player.academyParentClub;w.player.youth=false;w.player.age=23;w.player.stamina=100;w.player.injuryMatches=0;w.player.discipline={league:{yellow:0,ban:0}};
 v.player.leagueId=sameLeague?"CHN":"ENG";v.player.club=sameLeague?(w.player.club==="上海申花"?"北京国安":"上海申花"):"布莱顿";v.player.youth=false;v.player.age=23;v.player.stamina=100;v.player.injuryMatches=0;v.player.discipline={league:{yellow:0,ban:0}};
 w.season=h.api.makeSchedule(w.player,w.year,10);v.season=h.api.makeSchedule(v.player,v.year,10);h.api.linkSharedWorld();h.api.setG("wang");return {h,w,v};
}
{
 const {h,w}=setup(),ev=w.season.events.find(e=>e.kind==="league"),ownHome=ev.home===w.player.club,calls=[];
 h.api.setScore((home,away,boost=0,reduceHome=0,reduceAway=0)=>{
  if(home===ev.home&&away===ev.away){calls.push({reduceHome,reduceAway});return ownHome?(reduceHome>0?[0,2]:[2,0]):(reduceAway>0?[2,0]:[0,2])}
  return [0,0];
 });
 h.api.playEvent(ev,"balanced",true);
 const result=w.season.results.at(-1),fixture=h.api.shared().rounds[w.year+":CHN"].rounds[ev.round].find(f=>f.home===ev.home&&f.away===ev.away);
 assert.equal(result.redCard,"direct");assert.equal(result.redScoreEffect,true);assert.equal(fixture.redScoreEffect,true);
 assert(calls.some(x=>ownHome?x.reduceHome>0&&x.reduceAway<0:x.reduceAway>0&&x.reduceHome<0));
 assert.deepEqual([result.hs,result.as],ownHome?[0,2]:[2,0]);assert.deepEqual([fixture.hs,fixture.as],[result.hs,result.as]);
 const home=w.season.leagueTable[ev.home],away=w.season.leagueTable[ev.away];
 assert.equal(home.points,result.hs>result.as?3:result.hs===result.as?1:0);assert.equal(away.points,result.as>result.hs?3:result.hs===result.as?1:0);
 console.log("✓ single controlled league red affects score before the shared fixture and standings are recorded");
}
{
 const {h,w}=setup(true),ev=w.season.events.find(e=>e.kind==="league"),calls=[];
 h.api.setScore((home,away,boost=0,reduceHome=0,reduceAway=0)=>{if(home===ev.home&&away===ev.away)calls.push({reduceHome,reduceAway});return [1,0]});
 h.api.playEvent(ev,"balanced",true);const result=w.season.results.at(-1);
 assert.equal(result.redCard,"direct");assert.equal(result.redScoreEffect,false);assert(calls.every(x=>x.reduceHome===0&&x.reduceAway===0));
 console.log("✓ a two-player shared league preserves its existing shared result");
}
{
 const {h,w}=setup(),ev=w.season.events.find(e=>e.kind==="league"),key=w.year+":"+w.player.leagueId;
 h.api.shared().rounds[key]={table:w.season.leagueTable,rounds:{[ev.round]:[{home:ev.home,away:ev.away,hs:3,as:1,npcAllocated:false}]}};
 h.api.setScore(()=>[0,0]);h.api.playEvent(ev,"balanced",true);
 const result=w.season.results.at(-1);assert.equal(result.redCard,"direct");assert.equal(result.redScoreEffect,false);assert.deepEqual([result.hs,result.as],[3,1]);
 console.log("✓ saved shared scores are never changed after dismissal");
}
{
 const {h,w,v}=setup(),cards={redCard:"direct",redMinute:30},p=w.player;
 const cup={kind:"cup",date:"2030-03-01",stage:"决赛"};
 assert(h.api.dismissalScoreModifiers(p,cup,p.club,"对手",cards));
 v.player.club=p.club;v.player.leagueId=p.leagueId;v.player.youth=p.youth;
 assert.equal(h.api.dismissalScoreModifiers(p,cup,p.club,"对手",cards),null,"shared teammate cups are not retroactively changed");
 const national={kind:"national",date:"2030-03-01",stage:"决赛"};v.player.country="巴西";
 assert(h.api.dismissalScoreModifiers(p,national,p.country,"对手",cards));
 assert.equal(h.api.dismissalScoreModifiers(p,national,p.country,"巴西",cards),null,"a controlled national-team opponent is also shared");
 v.player.country=p.country;assert.equal(h.api.dismissalScoreModifiers(p,national,p.country,"对手",cards),null,"same national team is kept consistent");
 assert.equal(h.api.dismissalScoreModifiers(p,{...cup,verified:{}},p.club,"对手",cards),null,"historically verified results are immutable");
 assert.equal(h.api.dismissalScoreModifiers(p,{kind:"europe"},p.club,"对手",cards),null,"precomputed UEFA scores are immutable");
 console.log("✓ independent cup and national matches receive red-card modifiers; shared and locked matches do not");
}
for(const kind of ["cup","national"]){
 const {h,w,v}=setup(),p=w.player;v.player.country="巴西";
 const home=kind==="national"?p.country:p.club,away="模拟对手";
 const ev={kind,date:"2026-11-15",stage:kind==="cup"?"第三轮":"友谊赛",home,away,competition:kind==="cup"?"足协杯":"友谊赛",nationalIndex:0};
 if(kind==="national")w.season.national=null;
 h.api.setScore((a,b,boost=0,rh=0,ra=0)=>a===home&&b===away?(rh>0?[0,2]:[2,0]):[0,0]);
 h.api.playEvent(ev,"balanced",true);
 const result=w.season.results.at(-1);assert.equal(result.redCard,"direct");assert.equal(result.redScoreEffect,true);assert.deepEqual([result.hs,result.as],[0,2]);
 if(kind==="cup")assert.deepEqual([w.season.cup.results.at(-1).hs,w.season.cup.results.at(-1).as,w.season.cup.results.at(-1).win],[0,2,false]);
 else {const key=w.year+":"+ev.date+":"+ev.stage+":"+home+":"+away,shared=h.api.shared().national[key];assert.deepEqual([shared.hs,shared.as],[0,2])}
 console.log("✓ "+kind+" red-adjusted score is the same in its persisted competition result");
}
