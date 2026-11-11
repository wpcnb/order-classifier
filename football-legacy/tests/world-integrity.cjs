"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const SAVE="football-dynasty-duo-v2-20261110",OLD="football-dynasty-v4-independent-20261101";
let core=fs.readFileSync(path.join(root,"game.js"),"utf8");
core=core.replace(/\}\)\(\);\s*$/,'window.__test={get:()=>g,setG:(id)=>{activeDuo=id;g=duoGames[id]},setSync:(x)=>syncSeasonChange=x,nextSeason,offseason:simulateNPCOffseason,ensureRealAwardPlayers,createCups,db:DB,duo:()=>duoGames,makeSchedule,setupSharedUefaSeason,linkSharedWorld,playEvent,offseasonRecovery,disciplinaryRecord,save,seasonPerformance,generateOffers,shared:()=>sharedUniverse,playerMatchContribution,overall,compact:duoPayload,transferLevel,transferQualified,poissonGoals,simulateScore,awardCandidateScore,awardTeamHonours,cslPool:CSL_DRAW_TEAMS,levels:TRANSFER_LEVELS,gates:TRANSFER_GATES};})();');
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
function start(){const h=harness();h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();h.click("preset");return h}
{
 const h=start(),g=h.api.get(),original=g.npcs.find(x=>x.realPerson&&x.name==="哈兰德");
 assert(g.npcs.some(x=>x.realPerson&&x.name==="梅西"),"initial age-39 player must not retire before their first season");
 assert(original,"real footballer is present in initial roster");original.age=38;h.api.offseason();
 assert(!g.npcs.some(x=>x.realPerson&&x.name==="哈兰德"));
 assert(h.api.shared().retiredRealPeople.includes("哈兰德"));
 // Retired real identities are not truncated with the display-only NPC history.
 h.api.shared().npcRetirements=Array.from({length:150},(_,i)=>({name:"新人"+i}));h.api.save();
 const reloaded=harness(h.stored);reloaded.api.ensureRealAwardPlayers();
 assert(!reloaded.api.get().npcs.some(x=>x.realPerson&&x.name==="哈兰德"),"retired player cannot return on load");
 assert(reloaded.api.shared().retiredRealPeople.includes("哈兰德"),"retirement persists after history truncation");
}
{
 // Legacy saves may already contain a resurrected 26-year-old in 2048.
 const h=start();for(const id of ["wang","vini"]){h.api.setG(id);h.api.get().year=2048}
 h.api.setG("wang");h.api.shared().npcRetirements=[{name:"哈兰德",year:2039}];h.api.save();
 const reloaded=harness(h.stored);reloaded.api.ensureRealAwardPlayers();
 assert(!reloaded.api.get().npcs.some(x=>x.realPerson&&x.name==="哈兰德"),"known retired real person removed from legacy save");
 assert(reloaded.api.shared().retiredRealPeople.includes("哈兰德"));
}
console.log("✓ real players stay retired across reload, legacy data and compacted history");
function movedClub(previousRank,destinationRank){
 const h=start();h.api.setG("wang");const g=h.api.get(),p=g.player;p.youth=false;p.club=p.academyParentClub;p.age=20;g.year=2027;g.season.stage="review";g.lastReview={rank:previousRank};p.forcedMove=false;
 p.transferAssessment={maxTier:5};p.transferDraw={accepted:true,selected:{id:"ENG",club:"阿森纳",wage:1000,years:2}};
 const others=h.api.db.ENG.teams.map(t=>t.name).filter(n=>n!=="阿森纳");const ordered=others.slice();ordered.splice(destinationRank-1,0,"阿森纳");
 const table=Object.fromEntries(ordered.map((name,i)=>[name,{name,p:38,w:0,d:0,l:0,gf:0,ga:0,points:100-i}]));
 h.api.shared().rounds["2027:ENG"]={table};h.api.setSync(true);h.api.nextSeason();
 assert.equal(p.club,"阿森纳");return g.season.uefa?.type||null;
}
assert.equal(movedClub(1,12),null,"old team's first place cannot qualify a 12th-place destination");
assert.equal(movedClub(10,1),"欧冠","destination's first place qualifies regardless of old team's position");
assert.equal(movedClub(1,6),"欧联","destination's sixth place qualifies for Europa League");
console.log("✓ European qualification uses the destination club's own previous league table");
for(const [id,name] of Object.entries({ENG:"足总杯",ESP:"国王杯",GER:"德国杯",ITA:"意大利杯",FRA:"法国杯",CHN:"足协杯",BRA:"巴西杯",NED:"荷兰杯",POR:"葡萄牙杯",TUR:"土耳其杯",BEL:"比利时杯",SCO:"苏格兰杯",AUT:"奥地利杯",SUI:"瑞士杯",DEN:"丹麦杯"}))assert.equal(start().api.createCups(id,2028).name,name);
console.log("✓ each league uses its own domestic cup name");
