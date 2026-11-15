"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),SAVE="football-dynasty-duo-v2-20261110",OPENING="football-dynasty-opening-v3";
let source=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__profiles={games:()=>duoGames,styles:()=>openingStyles,templates:DUO_TEMPLATES,academyStats,nextSeason,save};})();');
function harness(initial=[]){
 const storage=new Map(initial),elements={},handlers={},timers=[];
 const node=id=>elements[id]||(elements[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||=[]).push(fn)},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const window={},context={document,localStorage,window,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file,timeout:4000});
 vm.runInNewContext(source,context,{filename:"game.js",timeout:4000});
 return {storage,api:window.__profiles,get html(){return node("app").innerHTML},change(dataset,value){for(const fn of handlers["app:change"])fn({target:{dataset,value}})},click(action,extras={}){for(const fn of handlers["app:click"])fn({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},flush(){let n=0;while(timers.length&&n++<100)timers.shift()()}};
}
function flip(h,id){h.click("flipOpeningCard",{id,i:0});h.flush()}
function advanceSeason(h){for(const id of ["wang","vini"])h.api.games()[id].season.stage="review";h.api.nextSeason()}

// Styles are independent and opening selections survive reload before and after the card is flipped.
let h=harness();
assert(h.html.includes("风格是游戏估算"));
h.change({duoName:"wang"},"库里");h.change({duoStyle:"wang"},"power");h.change({duoStyle:"vini"},"technique");
assert.equal(JSON.parse(h.storage.get(OPENING)).styles.wang,"power");
assert.equal(JSON.parse(h.storage.get(OPENING)).styles.vini,"technique");
h=harness([...h.storage]);
assert.equal(h.api.styles().wang,"power");assert.equal(h.api.styles().vini,"technique");
flip(h,"wang");h.change({duoStyle:"wang"},"pace");assert.equal(h.api.styles().wang,"power","a revealed player's style cannot change");
flip(h,"vini");h.click("preset");
let duo=h.api.games(),w=duo.wang.player,v=duo.vini.player;
assert.equal(w.name,"库里");assert.equal(w.profileStyle,"power");assert.equal(v.profileStyle,"technique");
assert.equal(w.actualCountry,null);assert.equal(w.born,null);assert.equal(w.heightCm,null);assert.equal(w.sourceRating,null);
assert(w.sourceReference.includes("游戏估算"));
assert.equal(w.academyReferenceStats.physical,h.api.templates.wang.stats.physical+5);
assert.equal(v.academyReferenceStats.pass,h.api.templates.vini.stats.pass+4);
assert.equal(w.stats.physical,h.api.academyStats({stats:w.academyReferenceStats}).physical);
assert.equal(v.stats.pass,h.api.academyStats({stats:v.academyReferenceStats}).pass);
const expected=JSON.parse(JSON.stringify({wang:w.academyReferenceStats,vini:v.academyReferenceStats}));
advanceSeason(h);assert.equal(h.api.games().wang.player.age,17);
h=harness([...h.storage]);advanceSeason(h);
duo=h.api.games();for(const id of ["wang","vini"]){
 const player=duo[id].player;assert.equal(player.age,18);assert.equal(player.youth,false);
 for(const [key,value] of Object.entries(expected[id]))assert(player.stats[key]>=value,"graduation uses that player's selected reference: "+id+" "+key);
}
console.log("✓ estimated styles persist independently through card reveal, reload and academy graduation");

// Existing opening saves without style fields and old youth saves use the original templates.
const old=harness();flip(old,"wang");flip(old,"vini");old.click("preset");
let oldDuo=old.api.games();
for(const id of ["wang","vini"]){
 assert.equal(oldDuo[id].player.profileStyle,"default");
 assert.deepEqual(JSON.parse(JSON.stringify(oldDuo[id].player.stats)),JSON.parse(JSON.stringify(old.api.academyStats(old.api.templates[id]))));
 delete oldDuo[id].player.academyReferenceStats;delete oldDuo[id].player.profileStyle;
}
advanceSeason(old);advanceSeason(old);
oldDuo=old.api.games();for(const id of ["wang","vini"])for(const [key,value] of Object.entries(old.api.templates[id].stats))assert(oldDuo[id].player.stats[key]>=value,"legacy graduation retains reference: "+id+" "+key);
const previous=harness([[OPENING,JSON.stringify({names:{wang:"王楚淇",vini:"维尼修斯"},leagues:{wang:"CHN",vini:"CHN"}})]]);
assert.equal(previous.api.styles().wang,"default");assert.equal(previous.api.styles().vini,"default");
console.log("✓ default and old saves retain the original templates and academy progression");
