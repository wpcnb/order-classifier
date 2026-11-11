"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110";
const source=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__test={get:()=>g,playEvent,recordRecentMatchMinutes,injuryRiskFor,injuryDuration,offseasonRecovery,save};})();');
function harness(saved){
 const storage=new Map(saved||[]),nodes={},handlers={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn}});
 const deterministicMath=Object.create(Math);deterministicMath.random=()=>0;
 const context={window:{},Math:deterministicMath,document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
 vm.runInNewContext(source,context,{filename:"game.js"});
 return {api:context.window.__test,storage,flush(){while(timers.length)timers.shift()()},click(action,extras={}){handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})}};
}
const h=harness(),{recordRecentMatchMinutes:r,injuryRiskFor:risk,injuryDuration:duration,offseasonRecovery:recover}=h.api;
{
 const oldSave={age:25,stamina:90};assert.equal(risk(oldSave),.008,"legacy player without load uses baseline risk");
 assert(risk({...oldSave,age:36})>risk(oldSave),"older age raises risk");
 assert(risk({...oldSave,stamina:25})>risk(oldSave),"fatigue raises risk");
 assert(risk({...oldSave,recentMatchMinutes:[90,90,90,90,90]})>risk({...oldSave,recentMatchMinutes:[0,0,0,0,0]}),"recent appearances raise risk");
 assert.equal(risk(oldSave,0),0,"a player who did not play cannot suffer a match injury");
 assert(risk(oldSave,15)<risk(oldSave,90),"an early dismissal limits exposure");
 const p={};for(const m of [90,90,45,0,30,0])r(p,m);assert.deepEqual(Array.from(p.recentMatchMinutes),[90,45,0,30,0],"keep the last five actual matches including rest");
}
{
 const rolls=(a,b)=>{let n=0;return()=>n++?b:a};
 assert.equal(duration(rolls(.2,.999)),2);assert.equal(duration(rolls(.7,.999)),7);
 assert.equal(duration(rolls(.9,.999)),15);assert.equal(duration(rolls(.999,.999)),30,"rare long injury is possible");
 const p={injuryMatches:20,stamina:30,recentMatchMinutes:[90,90],discipline:{league:{yellow:2,ban:2}}};recover(p);
 assert(p.injuryMatches>=18&&p.injuryMatches<=19,"long injury remains across offseason");assert.deepEqual(Array.from(p.recentMatchMinutes),[],"offseason resets match load");assert.equal(p.discipline.league.ban,2,"offseason cannot erase a ban");
}
{
 h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();h.click("preset");
 const g=h.api.get(),p=g.player;p.stamina=90;p.injuryMatches=0;
 h.api.playEvent(g.season.events[g.season.index],"balanced",true);
 const event=g.season.results.at(-1);assert.equal(event.played,true);assert.equal(event.newInjury,1);assert.equal(p.injuryMatches,1);assert.deepEqual(Array.from(p.recentMatchMinutes),[event.minutesPlayed]);
 h.api.playEvent(g.season.events[g.season.index],"balanced",true);
 const missed=g.season.results.at(-1);assert.equal(missed.played,false);assert.equal(missed.missedReason,"injury");assert.equal(missed.newInjury,0);assert.equal(p.injuryMatches,0);assert.equal(p.recentMatchMinutes.at(-1),0);
 h.api.save();const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.deepEqual(Array.from(reload.api.get().player.recentMatchMinutes),Array.from(p.recentMatchMinutes),"recent workload survives saving and loading");
}
console.log("✓ Injury risk uses age, fatigue and recent minutes; rare long injuries, recovery and saves work");
