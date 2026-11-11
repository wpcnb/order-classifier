"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
let core=fs.readFileSync(path.join(root,"game.js"),"utf8");
core=core.replace(/\}\)\(\);\s*$/,'window.__test={duo:()=>duoGames,setG:(id)=>{activeDuo=id;g=duoGames[id]},makeSchedule,linkSharedWorld,playEvent,shared:()=>sharedUniverse,capSharedContributions,playerMatchContribution};})();');
function harness(){
 const storage=new Map(),nodes={},handlers={},timers=[],random=Math.random,math=Object.create(Math);
 math.random=random;
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn},click(){}});
 const context={Math:math,window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const f of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,f),"utf8"),context,{filename:f});
 vm.runInNewContext(core,context,{filename:"game.js"});
 return {api:context.window.__test,random:f=>math.random=f,click(action,extras={}){handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},flush(){while(timers.length)timers.shift()()}};
}
function setup(){
 const h=harness();for(const id of ["wang","vini"]){h.click("flipOpeningCard",{id,i:0});h.flush()}h.click("preset");
 const d=h.api.duo(),w=d.wang,v=d.vini;
 for(const x of [w,v]){x.player.club=w.player.academyParentClub;x.player.leagueId="CHN";x.player.youth=false;x.player.age=23;x.player.stamina=100;x.player.injuryMatches=0;x.player.discipline={league:{yellow:0,ban:0}};x.season=h.api.makeSchedule(x.player,x.year,10)}
 h.api.linkSharedWorld();
 return {h,w,v};
}
{
 const {h,w,v}=setup(),ev=w.season.events.find(e=>e.kind==="league"),home=ev.home===w.player.club,hs=home?1:0,as=home?0:1;
 const key=w.year+":"+w.player.leagueId;h.api.shared().rounds[key]={table:w.season.leagueTable,rounds:{[ev.round]:[{home:ev.home,away:ev.away,hs,as,npcAllocated:false}]}};
 h.random(()=>.01);h.api.setG("wang");h.api.playEvent(ev,"balanced",true);h.api.setG("vini");h.api.playEvent(ev,"balanced",true);
 const a=w.season.results.at(-1),b=v.season.results.at(-1);
 assert(a.played&&b.played);assert.equal(a.hs,b.hs);assert.equal(a.as,b.as);
 assert(a.goals+b.goals<=1,"two teammates cannot score more goals than their team");
 assert(a.assists+b.assists<=1,"one goal cannot have two assists");
 assert.equal(a.goals,1);assert.equal(b.goals,0);
 // Different players may score and assist the very same goal.
 const allowed=h.api.capSharedContributions(v.player,ev,ev.home,ev.away,1,{goals:0,assists:1});
 assert.equal(allowed.assists,1);
 console.log("✓ Shared fixture: goals and assists independently respect the team score");
}
{
 const {h,w,v}=setup(),ev=v.season.events.find(e=>e.kind==="cup"),home="对手",away=v.player.club;
 // First player already finished this cup game; the second must inherit the
 // same score and shootout outcome even when their random roll differs.
 w.season.results.push({...ev,home,away,hs:1,as:1,played:true,goals:1,assists:0,cupWin:false});
 h.random(()=>.01);h.api.setG("vini");h.api.playEvent(ev,"balanced",true);
 const r=v.season.results.at(-1),cup=v.season.cup.results.at(-1);
 assert.equal(r.hs,1);assert.equal(r.as,1);assert.equal(r.cupWin,false);
 assert.equal(cup.win,false);assert.equal(v.season.cup.active,false);assert.equal(r.goals,0);
 console.log("✓ Teammates share a domestic cup score and shootout result");
}
{
 const {h,w}=setup(),ev=w.season.events.find(e=>e.kind==="league"),home=ev.home===w.player.club;
 const key=w.year+":"+w.player.leagueId;h.api.shared().rounds[key]={table:w.season.leagueTable,rounds:{[ev.round]:[{home:ev.home,away:ev.away,hs:home?1:0,as:home?0:1,npcAllocated:false}]}};
 h.random(()=>.0001);h.api.setG("wang");h.api.playEvent(ev,"balanced",true);
 const result=w.season.results.at(-1);
 assert.equal(result.redCard,"direct");assert(result.redMinute>=15&&result.redMinute<=89);
 assert.equal(result.minutesPlayed,result.redMinute);assert.equal(w.player.discipline.league.ban,2);
 console.log("✓ A red card records dismissal time and competition suspension");
}
{
 const {h,w}=setup();h.api.setG("wang");const p=w.player,ev={kind:"league"};
 // An opportunity at 50% of the match cannot belong to a player dismissed at 15'.
 const values=[.5,.001];let i=0;h.random(()=>values[i++]??.001);
 const early=h.api.playerMatchContribution(p,ev,60,1,"balanced",15);
 assert.equal(early.goals+early.assists,0);
 i=0;h.random(()=>.001);const normal=h.api.playerMatchContribution(p,ev,60,1,"balanced",90);
 assert.equal(normal.goals,1);
 console.log("✓ A dismissed player's contribution is limited by approximate minutes played");
}
