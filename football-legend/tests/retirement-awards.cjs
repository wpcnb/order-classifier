"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110";
const source=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__test={duo:()=>duoGames,shared:()=>sharedUniverse,finalizeRetiredSeasonIfReady,nextSeason,save};})();');
function harness(data,failBackup=false){
 const storage=new Map(data||[]),nodes={},handlers={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn}});
 const context={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{get length(){return storage.size},key:i=>[...storage.keys()][i]||null,getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(failBackup&&k.includes("-before-auto-retirement"))throw Error("quota");storage.set(k,String(v))},removeItem:k=>storage.delete(k)},confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
 vm.runInNewContext(source,context,{filename:"game.js"});
 return {api:context.window.__test,storage,get html(){return node("app").innerHTML},click(action,extras={}){handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},flush(){while(timers.length)timers.shift()()}};
}
function newGame(){const h=harness();h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();h.click("preset");return h;}
function toReview(h,ages){const d=h.api.duo();for(const [id,age] of Object.entries(ages)){const x=d[id],p=x.player;p.age=age;p.youth=false;p.club=p.club.replace(/青训$/,"");p.academyParentClub=p.club;p.forcedMove=false;p.transferAssessment={maxTier:0};delete p.transferDraw;x.season.stage="review";}return d;}
function prepare(){
 const h=newGame(),d=h.api.duo(),year=d.wang.year;
 for(const x of Object.values(d)){
  x.player.age=24;x.player.youth=false;x.player.club=x.player.club.replace(/青训$/,"");
  x.player.transferAssessment={maxTier:0};x.player.forcedMove=false;x.npcs.forEach(n=>n.apps=10);
  x.season.apps=20;x.season.leagueApps=20;x.season.goals=30;x.season.leagueGoals=30;x.season.assists=10;x.season.leagueAssists=10;x.season.ratings=[8.8];
  x.season.results=[{kind:"league",played:true,date:"2026-10-01",home:x.player.club,away:"对手",hs:2,as:0,goals:1,assists:0,rating:8}];
 }
 return {h,d,year};
}
function markComplete(x){x.season.stage="review";x.history.push({year:x.year,generation:x.generation,club:x.player.club,goals:x.season.goals,assists:x.season.assists});}
{
 const {h,d,year}=prepare();markComplete(d.wang);d.vini.season.stage="playing";d.vini.season.goals=31;d.vini.season.leagueGoals=31;
 h.click("retirePlayer",{id:"vini"});
 const award=h.api.shared().awards[year];assert(award,"the completed shared season must settle when the other player retires");
 assert(award.rankings.some(x=>x.id==="DUO_vini"),"a player who actually played remains eligible in their retirement year");
 assert(d.vini.honors.some(x=>x.name==="中超金靴奖"),"a retired player remains eligible for the season's league scoring honor");
 assert(d.vini.retirementSummary.honors.some(x=>x.name==="中超金靴奖"),"retirement archive includes the post-retirement award");
 const before=JSON.stringify(award),honors=d.vini.honors.length;assert(h.api.finalizeRetiredSeasonIfReady());
 assert.equal(JSON.stringify(h.api.shared().awards[year]),before);assert.equal(d.vini.honors.length,honors,"repeated settlement must not duplicate awards");
 const reload=harness([[SAVE,h.storage.get(SAVE)]]);assert.equal(JSON.stringify(reload.api.shared().awards[year]),before);
 h.api.nextSeason();assert.equal(d.wang.year,year+1);assert(h.api.shared().awards[year]);
 console.log("✓ manual midseason retirement settles shared awards once and survives reload");
}
{
 const {h,d,year}=prepare();markComplete(d.wang);d.vini.season.stage="playing";
 d.vini.player.age=42;h.api.save();const old=h.storage.get(SAVE),reload=harness([[SAVE,old]]);
 assert(reload.api.duo().vini.player.retired);assert(reload.api.shared().awards[year],"legacy 40+ retirement must settle an already complete shared season");
 assert.equal(reload.storage.get(SAVE+"-before-auto-retirement"),old,"migration must preserve original save");
 console.log("✓ legacy automatic retirement settles pending awards and preserves old save");
}
{
 const {h,d,year}=prepare();markComplete(d.wang);d.vini.season.stage="playing";
 h.click("retirePlayer",{id:"wang"});assert(!h.api.shared().awards[year]);
 h.click("retirePlayer",{id:"vini"});assert(d.wang.player.retired&&d.vini.player.retired);
 assert(h.api.shared().awards[year],"a season completed by one protagonist settles even if both then retire");
 console.log("✓ both retiring still settles an already completed season");
}
{
 const {h,d,year}=prepare();d.wang.season.stage=d.vini.season.stage="playing";
 h.click("retirePlayer",{id:"wang"});h.click("retirePlayer",{id:"vini"});
 assert(!h.api.shared().awards[year],"no award is invented when both careers stop before anyone completes the season");
 console.log("✓ both retiring early never invents a completed season");
}
{
 const {h,d,year}=prepare();markComplete(d.wang);d.vini.season.stage="playing";d.wang.npcs.forEach(n=>{n.apps=0;n.europeApps=0});
 h.click("retirePlayer",{id:"vini"});h.api.nextSeason();
 assert.equal(d.wang.year,year,"cannot silently advance past an award settlement with insufficient valid players");
 assert(h.storage.get(SAVE),"the current save is retained when settlement is blocked");
 console.log("✓ insufficient award data does not silently advance or discard the save");
}
{
 const {h,d,year}=prepare();markComplete(d.wang);markComplete(d.vini);
 d.wang.player.age=39;d.vini.player.age=30;
 h.api.nextSeason();assert.equal(d.wang.player.retired,true);assert.equal(d.vini.year,year+1);
 assert.equal(d.wang.retirementSummary.completedSeasonYear,year);
 h.click("retirePlayer",{id:"vini"});
 assert(!h.api.shared().awards[year+1],"the prior completed season cannot make a newly started season look complete");
 console.log("✓ automatic 40-year retirement does not mark the following season complete");
}
