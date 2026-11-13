"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const base=path.resolve(__dirname,".."),read=x=>fs.readFileSync(path.join(base,x),"utf8");
const html=read("index.html"),game=read("game.js");
const mods={window:{}};vm.runInNewContext(read("body-path.js"),mods);vm.runInNewContext(read("free-star.js"),mods);
vm.runInNewContext(read("career-depth.js"),mods);
const BP=mods.window.BodyPath,FS=mods.window.FreeStar,CD=mods.window.CareerDepth;
let count=0;function check(name,fn){fn();count++;console.log("✓ "+count+"/10 "+name)}
const male=(h,w,pos="ST",careerPath="balanced")=>({heightCm:h,weightKg:w,position:pos,careerPath,stats:{pace:80,shoot:80,pass:80,dribble:80,defense:80,physical:80,mental:80},coachTrust:60,form:65});
function harness(initial=[]){
 const store=new Map(initial),handlers={},nodes={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(event,fn){(handlers[id+":"+event]||(handlers[id+":"+event]=[])).push(fn)},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:key=>store.get(key)||null,setItem:(key,v)=>store.set(key,String(v)),removeItem:key=>store.delete(key)};
 const window={},context={window,document,localStorage,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},console,Blob,URL,confirm:()=>true};
 for(const f of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","body-path.js","career-depth.js","free-star.js"])vm.runInNewContext(read(f),context,{filename:f,timeout:9000});
 vm.runInNewContext(game,context,{filename:"game.js",timeout:9000});
 function dispatch(type,e){for(const fn of handlers["app:"+type]||[])fn(e)}
 return {click:(action,data={})=>dispatch("click",{target:{closest:()=>({disabled:false,dataset:{action,...data}})}}),
  change:dataset=>dispatch("change",{target:{dataset,value:dataset.value}}),
  flush:()=>{let i=0;while(timers.length&&i++<30)timers.shift() },
  get html(){return node("app").innerHTML},get opening(){return JSON.parse(store.get("football-dynasty-opening-v3")||"null")},
  get saved(){return JSON.parse(store.get("football-dynasty-duo-v2-20261110")||"null")},store};
}
check("v8.1.0 release and body module precedes game",()=>{
 assert(html.includes("版本 v8.1.0 · 更新时间 2026-11-13"));
 assert(html.indexOf("body-path.js?v=8.1.0")<html.indexOf("career-depth.js?v=8.1.0"));
 assert(html.indexOf("body-path.js?v=8.1.0")<html.indexOf("game.js?v=8.1.0"));
});
check("taller footballer gets aerial gain but loses agility at same mass ratio",()=>{
 const short=BP.profile(male(163,BP.referenceWeight(163)));
 const tall=BP.profile(male(193,BP.referenceWeight(193)));
 assert(tall.aerial>short.aerial);assert(tall.agility<short.agility);
});
check("higher weight improves duels while lower weight increases agility and stamina",()=>{
 const heavy=BP.profile(male(178,91)),light=BP.profile(male(178,59));
 assert(heavy.duel>light.duel);assert(heavy.agility<light.agility);
 assert(heavy.endurance<light.endurance);
});
check("body effects bounded and position impacts tradeoff",()=>{
 const extremes=[male(150,45),male(210,125),male(190,66),male(163,100)];
 for(const p of extremes){const v=BP.profile(p);for(const key of ["aerial","duel","agility","endurance"])
   assert(v[key]>=.8&&v[key]<=1.2,key+" unbounded");
   assert(BP.matchup(p)>=.89&&BP.matchup(p)<=1.11);
 }
 assert.notEqual(BP.matchup(male(194,90,"GK")),BP.matchup(male(194,90,"LW")));
});
check("body and career path do not depend on name, origin, sex, ethnicity or color",()=>{
 const p=male(175,72),a=BP.profile({...p,country:"中国",gender:"male",heritage:"eastAsian",skin:"fair",name:"甲"});
 const b=BP.profile({...p,country:"巴西",gender:"female",heritage:"african",skin:"deep",name:"乙"});
 assert.deepEqual(a,b);
});
check("random creator gives weights, and locked profile retains weight",()=>{
 for(let i=0;i<40;i++){
  const d=FS.quickDraft(()=>((i*113+29)%991)/991);
  assert(d.weight>=45&&d.weight<=125);
  const p=FS.generatedProfile(d,()=>.42);assert.equal(p.weight,d.weight);
 }
});
check("development path trains faster, minutes priority increases real lineup chance",()=>{
 assert(BP.trainingThreshold(12,"growth")<BP.trainingThreshold(12,"balanced"));
 assert(BP.trainingThreshold(12,"minutes")>BP.trainingThreshold(12,"balanced"));
 assert(BP.appearancesBonus("minutes")>BP.appearancesBonus("growth"));
 const p=male(177,73,"LW"),growth=CD.lineup({...p,careerPath:"growth"},80,85,()=>.50);
 const minutes=CD.lineup({...p,careerPath:"minutes"},80,85,()=>.50);
 assert(minutes.starterChance>growth.starterChance);
});
let h;
check("both classic players choose their own position weight and path before flipping",()=>{
 h=harness();
 assert(h.html.includes("开局发展方向"));
 h.change({creatorId:"wang",creatorField:"_position",value:"ST"});
 h.change({openingWeight:"wang",value:"86"});
 h.change({openingPath:"wang",value:"growth"});
 h.change({creatorId:"vini",creatorField:"_position",value:"RW"});
 h.change({openingWeight:"vini",value:"62"});
 h.change({openingPath:"vini",value:"minutes"});
 assert.equal(h.opening.positions.wang,"ST");assert.equal(h.opening.weights.wang,86);
 assert.equal(h.opening.paths.vini,"minutes");
 h.click("flipOpeningCard",{id:"wang",i:0});h.flush();h.click("flipOpeningCard",{id:"vini",i:0});h.flush();
 h.click("preset");const w=h.saved.duoGames.wang.player,v=h.saved.duoGames.vini.player;
 assert.equal(w.position,"ST");assert.equal(w.weightKg,86);assert.equal(w.careerPath,"growth");
 assert.equal(v.position,"RW");assert.equal(v.weightKg,62);assert.equal(v.careerPath,"minutes");
});
check("custom player preserves selected position, height, weight and priority",()=>{
 const custom=harness();custom.click("creatorMode",{mode:"custom"});
 custom.change({creatorId:"wang",creatorField:"position",value:"CB"});
 custom.change({creatorId:"wang",creatorField:"height",value:"193"});
 custom.change({openingWeight:"wang",value:"87"});
 custom.change({openingPath:"wang",value:"minutes"});
 custom.click("flipOpeningCard",{id:"wang",i:1});custom.flush();custom.click("flipOpeningCard",{id:"vini",i:1});custom.flush();
 custom.click("preset");const p=custom.saved.duoGames.wang.player;
 assert.equal(p.position,"CB");assert.equal(p.heightCm,193);assert.equal(p.weightKg,87);
 assert.equal(p.freeStar.weight,87);assert.equal(p.careerPath,"minutes");
 assert(p.potential>=65&&p.potential<=99);
});
check("old saved careers remain unchanged when loaded after new release",()=>{
 const s=h.saved,backup=JSON.parse(JSON.stringify(s));const player=backup.duoGames.wang.player;
 delete player.weightKg;delete player.careerPath;
 const restored=harness([["football-dynasty-duo-v2-20261110",JSON.stringify(backup)]]);
 const p=restored.saved.duoGames.wang.player;
 assert.equal(p.weightKg,undefined);assert.equal(p.careerPath,undefined);
 assert.equal(p.position,backup.duoGames.wang.player.position);
 assert.equal(p.age,backup.duoGames.wang.player.age);
 assert(restored.html.includes("旧档体格数据未完整记录"));
});
assert.equal(count,10);console.log("v8.1.0 body and career-path: 10/10 focused checks passed");
