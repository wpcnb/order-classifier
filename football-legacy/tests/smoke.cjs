"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const SAVE="football-dynasty-duo-v1-20261110",OLD="football-dynasty-v4-independent-20261101";
let core=fs.readFileSync(path.join(root,"game.js"),"utf8");
core=core.replace(/\}\)\(\);\s*$/,'window.__test={get:()=>g,seasonPerformance,generateOffers};})();');
function harness(loaded=null){
 const storage=new Map(),cache={},handlers={}; if(loaded)for(const [k,v]of loaded)storage.set(k,v);
 const node=id=>cache[id]||(cache[id]={innerHTML:"",textContent:"",classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+":"+type]=fn},click(){}});
 const document={getElementById:node,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const window={};const context={document,localStorage,window,confirm:()=>true,setTimeout,clearTimeout,Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file,timeout:4000});
 vm.runInNewContext(core,context,{filename:"game.js",timeout:4000});
 return {get html(){return node("app").innerHTML},get state(){const data=storage.get(SAVE);return data?JSON.parse(data):null},get stored(){return storage},get api(){return window.__test},click(action,extras={}){const fn=handlers["app:click"];fn({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},page(p){const fn=handlers["app:click"];fn({target:{closest:()=>({disabled:false,dataset:{page:p}})}})}};
}
function log(s){console.log("✓ "+s)}
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");assert(html.includes('src="./game.js'));
const oldData=JSON.stringify({version:4,player:{name:"陆白"}});
const x=harness([[OLD,oldData],[OLD+"-safety",oldData]]);
assert(!x.stored.has(OLD)&&!x.stored.has(OLD+"-safety"),"old saves cleared");
assert(x.html.includes("双星职业生涯")&&x.html.includes("王楚淇")&&x.html.includes("维尼修斯"));
log("Old data cleared; two-card start visible");
x.click("preset");let state=x.state;
assert.equal(state.version,1);assert.equal(state.activeDuo,"wang");
assert.deepEqual(Object.keys(state.duoGames).sort(),["vini","wang"]);
const w=state.duoGames.wang.player,v=state.duoGames.vini.player;
assert.equal(w.name,"王楚淇");assert.equal(v.name,"维尼修斯");
for(const p of [w,v]){assert.equal(p.country,"中国");assert.equal(p.age,18);assert.equal(p.youth,false);assert(p.potential>p.sourceRating)}
assert.equal(w.sourceRating,83);assert.equal(v.sourceRating,77);
assert.equal(w.heightCm,177);assert.equal(v.heightCm,176);
assert.equal(w.born,"1999-02-06");assert.equal(v.born,"2000-07-12");
assert(x.html.includes("两人各推进一个完整赛季"));
log("Two playable 18-year-old China-nationality cards with distinct historical FIFA templates");
x.click("switchDuo",{id:"vini"});state=x.state;assert.equal(state.activeDuo,"vini");
assert.equal(state.duoGames.wang.player.name,"王楚淇");
x.page("training");assert(x.html.includes("维尼修斯"));
x.click("switchDuo",{id:"wang"});state=x.state;assert.equal(state.activeDuo,"wang");
log("Switching preserves both careers");
x.click("simBoth");state=x.state;
for(const id of ["wang","vini"]){
 const s=state.duoGames[id];assert.equal(s.season.stage,"review",id+" season incomplete");
 assert.equal(s.history.length,1);assert(s.season.apps>=0);assert.equal(s.ballonHistory.length,1);
 assert.equal(s.ballonHistory[0].ballots.length,100);assert.equal(s.ballonHistory[0].totalPoints,6700);
 assert(s.lastReview.performance);
}
log("Both career engines complete 1 season independently and preserve awards, player data, and performance reviews");
const saved=x.stored.get(SAVE),reload=harness([[SAVE,saved]]);assert.equal(reload.state.duoGames.wang.history.length,1);
reload.click("switchDuo",{id:"vini"});assert.equal(reload.state.activeDuo,"vini");
reload.click("simBoth");state=reload.state;for(const id of ["wang","vini"]){assert.equal(state.duoGames[id].year,2027);assert.equal(state.duoGames[id].history.length,2)}
log("Both careers advance independently into following seasons and survive reload");
const api=reload.api;
const active=api.get();const p=active.player,s=active.season;
p.leagueId="ESP";p.club="皇家马德里";p.position="LW";p.poorStreak=0;p.forcedMove=false;
s.apps=26;s.goals=0;s.assists=0;s.ratings=Array(26).fill(6.3);
const first=api.seasonPerformance();assert(first.poor&&!first.forcedMove&&first.poorStreak===1);
const second=api.seasonPerformance();assert(second.poor&&second.forcedMove&&second.poorStreak===2);
const offers=api.generateOffers();assert(offers.length>0);
assert(offers.every(o=>!["ENG","ESP","ITA","GER","FRA"].includes(o.id)||o.power<=96-9));
log("Two consecutive poor seasons trigger lower-tier transfer options");
reload.click("newGame");assert(!reload.stored.has(SAVE));assert(reload.html.includes("双星职业生涯"));
log("New game removes the old pair and starts another dual-card scenario");
console.log("All dual-player Football Dynasty tests passed.");
