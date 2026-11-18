"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110";
const core=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__s103={duo:()=>duoGames,setG:id=>{activeDuo=id;g=duoGames[id]},makeSchedule,linkSharedWorld,playEvent,save,shared:()=>sharedUniverse,nextSeason,setSync:v=>syncSeasonChange=v,db:DB};})();');
function harness(load){
 const handlers={},nodes={},timers=[],store=new Map(load||[]),math=Object.create(Math);
 math.random=()=>.00001;
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener:(e,f)=>{handlers[id+":"+e]=f},click(){}});
 const context={Math:math,window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  confirm:()=>true,setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","body-path.js","market-v3.js","career-depth.js","role-v3.js","transfer-v3.js","free-star.js","v10-core.js","v10-ui.js","legend-v1.js","legend-v3.js","legacy-awards.js","shared-domestic-cups.js"])
  vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file,timeout:10000});
 vm.runInNewContext(core,context,{filename:"game.js",timeout:15000});
 return {api:context.window.__s103,store,math,click:(a,x={})=>handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{action:a,...x}})}}),flush(){for(let n=0;timers.length&&n<200;n++)timers.shift()()}};
}
function start(){const h=harness();for(const id of ["wang","vini"]){h.click("flipOpeningCard",{id,i:0});h.flush()}h.click("preset");assert(h.api.duo());return h}
const h=start(),players=h.api.duo(),clubs=["利物浦","阿森纳"];
for(const [i,id] of ["wang","vini"].entries()){
 const x=players[id],p=x.player;p.age=25;p.youth=false;p.club=clubs[i];p.leagueId="ENG";p.stamina=100;p.discipline={league:{yellow:0,ban:0},cup:{yellow:0,ban:0}};
 x.year=2030;x.season=h.api.makeSchedule(p,2030,10);
 const ev=x.season.events.find(e=>e.kind==="cup"&&e.stage==="第三轮");assert(ev);x.season.events=[ev];x.season.index=0;x.season.stage="playing";
}
h.api.linkSharedWorld();const DC=require("../shared-domestic-cups.js");
const cup=DC.create(2030,"ENG","足总杯",h.api.db.ENG.teams.map(t=>t.name),()=>.5);
const all=cup.rounds[0].flatMap(f=>[f.home,f.away]);for(const [slot,club]of [[0,"利物浦"],[1,"阿森纳"]]){
 const old=all.indexOf(club);assert(old>=0);[all[slot],all[old]]=[all[old],all[slot]];
}
for(let i=0;i<32;i++){cup.rounds[0][i].home=all[i*2];cup.rounds[0][i].away=all[i*2+1]}
assert(DC.audit(cup));h.api.shared().domesticCups={"2030:ENG":cup};
for(const id of ["wang","vini"]){h.api.setG(id);h.api.playEvent(players[id].season.events[0],"balanced",true)}
const a=players.wang.season.results.at(-1),b=players.vini.season.results.at(-1);
assert.equal(a.hs,b.hs);assert.equal(a.as,b.as);assert.equal(a.redCard,"direct");assert.equal(b.redCard,"direct");
assert.equal([a.cupWin,b.cupWin].filter(Boolean).length,1,"单场比赛不能同时晋级");
assert.equal(cup.rounds[0][0].played,true);DC.finish(cup,()=>[1,0]);assert(DC.audit(cup));
assert.equal(cup.rounds[5][0].winner,cup.champion);
assert(h.api.save(),"完整存档保存失败");
const reloaded=harness([[SAVE,h.store.get(SAVE)]]);
assert.equal(reloaded.api.shared().domesticCups["2030:ENG"].champion,cup.champion);
console.log("PASS S1.03 shared cup: one result, one winner, red cards and persistence");
{
 const older=start(),d=older.api.duo();d.wang.year=d.vini.year=2045;
 d.wang.player.club="利物浦";d.vini.player.club="阿森纳";
 d.wang.honors.push({year:2045,name:"足总杯冠军",type:"team",generation:d.wang.generation});
 d.vini.honors.push({year:2045,name:"足总杯冠军",type:"team",generation:d.vini.generation});
 assert(older.api.save());const reload=harness([[SAVE,older.store.get(SAVE)]]);
 assert.equal(reload.api.shared().domesticCupConflicts.length,1);
 assert(reload.api.duo().wang.honors.some(x=>x.legacyDisputed));
 assert(reload.api.duo().vini.honors.some(x=>x.legacyDisputed));
 console.log("PASS S1.03 old-save dual champion is flagged without deleting honours");
}
{
 const older=start(),d=older.api.duo();
 for(const id of ["wang","vini"]){d[id].player.age=39;d[id].player.youth=false;d[id].season.stage="review"}
 older.api.setSync(true);for(const id of ["wang","vini"]){older.api.setG(id);older.api.nextSeason()}
 assert(d.wang.player.retired&&d.vini.player.retired);
 console.log("PASS S1.03 retirement at age 40");
}
