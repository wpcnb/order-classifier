"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=name=>fs.readFileSync(path.join(root,name),"utf8");
const html=read("index.html"),source=read("game.js");
function standaloneFS(){const c={window:{}};vm.runInNewContext(read("free-star.js"),c);return c.window.FreeStar}
const F=standaloneFS();
let passed=0;
function check(label,fn){fn();passed++;console.log("✓ "+passed+"/10 "+label)}
function harness(loaded=[]){
 const storage=new Map(loaded),handlers={},nodes={},timers=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(type,fn){(handlers[id+":"+type]||(handlers[id+":"+type]=[])).push(fn)}}); 
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key),key:i=>Array.from(storage.keys())[i],get length(){return storage.size}};
 const window={},context={window,document,localStorage,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},Blob,URL,console};
 for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","career-depth.js","free-star.js"]){vm.runInNewContext(read(file),context,{filename:file,timeout:8000})}
 vm.runInNewContext(source,context,{filename:"game.js",timeout:8000});
 const dispatch=(type,e)=>{for(const fn of handlers["app:"+type]||[])fn(e)};
 return {storage,window,click:(action,rest={})=>dispatch("click",{target:{closest:()=>({disabled:false,dataset:{action,...rest}})}}),
 change:(id,field,value)=>dispatch("change",{target:{dataset:{creatorId:id,creatorField:field},value}}),
 flush:()=>{let n=0;while(timers.length&&n++<30)timers.shift()()},
 get html(){return node("app").innerHTML},get saved(){return JSON.parse(storage.get("football-dynasty-duo-v2-20261110")||"null")},
 get draft(){return JSON.parse(storage.get("football-dynasty-opening-v3")||"null")}};
}
check("版本号和加载顺序",()=>{
 assert.match(html,/版本 v10\.0\.0 · 更新时间 2026-11-13/);
 assert(html.indexOf("free-star.js?v=9.0.0")<html.indexOf("game.js?v=10.0.0"));
});
check("隐藏潜能四档概率区间",()=>{
 assert.equal(F.rollPotential(()=>0),65);assert.equal(F.rollPotential(()=>.45),84);
 assert.equal(F.rollPotential(()=>.80),94);assert.equal(F.rollPotential(()=>.95),99);
});
check("国籍、肤色、性别、族裔均不影响随机能力",()=>{
 const first=F.generatedProfile({country:"中国",skin:"fair",gender:"male",heritage:"eastAsian",position:"ST"},()=>.37);
 const second=F.generatedProfile({country:"巴西",skin:"deep",gender:"female",heritage:"african",position:"ST"},()=>.37);
 assert.equal(first.potential,second.potential);
 assert.equal(JSON.stringify(first.stats),JSON.stringify(second.stats));
 assert.equal(first.gender,"male");assert.equal(second.gender,"male");
});
check("年龄身高限制及自由人物档案校验",()=>{
 const p=F.validate({country:"日本",age:99,height:999,gender:"female",skin:"deep",position:"GK"});
 assert.equal(p.age,39);assert.equal(p.height,210);assert.equal(p.country,"日本");assert.equal(p.position,"GK");assert.equal(p.gender,"male");
});
check("本地头像相同设定稳定，肤色独立改变",()=>{
 const p=F.generatedProfile(F.draftDefaults(),()=>.25);
 const avatar=F.avatar(p);assert.equal(avatar,F.avatar(p));assert.match(avatar,/<svg/);
 assert.notEqual(avatar,F.avatar({...p,skin:"deep"}));
});
check("快速造星不要求多余按钮且年龄有效",()=>{
 const h=harness();h.click("creatorMode",{mode:"quick"});
 assert.match(h.html,/随机球员档案/);assert.equal(h.draft.mode,"quick");
 assert(h.draft.creatorDrafts.wang.age>=16&&h.draft.creatorDrafts.wang.age<=24);
 assert.equal(h.draft.creatorDrafts.wang.gender,"male");
 assert(h.draft.creatorDrafts.wang.height>=165);
});
check("经典双星预设仍是16岁青训与固定模板",()=>{
 const h=harness();h.click("flipOpeningCard",{id:"wang",i:0});h.flush();
 h.click("flipOpeningCard",{id:"vini",i:0});h.flush();h.click("preset");
 const a=h.saved.duoGames.wang.player;
 assert.equal(a.age,16);assert.equal(a.youth,true);assert.equal(a.potential,94);assert.equal(a.freeStarHidden,undefined);
});
let custom;
check("自定义两人的年龄、国籍与外貌按角色分别保存",()=>{
 custom=harness();custom.click("creatorMode",{mode:"custom"});
 custom.change("wang","country","日本");custom.change("wang","age","24");
 custom.change("wang","height","186");custom.change("wang","gender","female");
 custom.change("wang","heritage","eastAsian");custom.change("wang","skin","deep");
 custom.change("wang","hair","curly");custom.change("wang","position","ST");
 custom.change("vini","country","法国");custom.change("vini","age","17");
 custom.change("vini","height","171");custom.change("vini","gender","nonbinary");
 assert.match(custom.html,/自定义球员档案/);
 const draft=custom.draft;
 assert.equal(draft.creatorDrafts.wang.age,24);assert.equal(draft.creatorDrafts.wang.skin,"deep");
 assert.equal(draft.creatorDrafts.vini.age,17);
 assert.equal(draft.creatorDrafts.wang.gender,"male");assert.equal(draft.creatorDrafts.vini.gender,"male");
});
check("翻球队卡时只生成一次隐藏潜能并且刷新不可重抽",()=>{
 custom.click("flipOpeningCard",{id:"wang",i:3});custom.flush();
 const first=custom.draft,locked=first.creatorLocked.wang;
 assert(locked.potential>=65&&locked.potential<=99);assert.equal(first.drawn.wang,first.decks.wang[3]);
 const reloaded=harness([["football-dynasty-opening-v3",JSON.stringify(first)]]);
 reloaded.click("flipOpeningCard",{id:"wang",i:1});reloaded.flush();
 assert.equal(reloaded.draft.creatorLocked.wang.potential,locked.potential);
 assert.equal(reloaded.draft.indices.wang,3);
 custom.click("flipOpeningCard",{id:"vini",i:1});custom.flush();custom.click("preset");
 const a=custom.saved.duoGames.wang.player,b=custom.saved.duoGames.vini.player;
 assert.equal(a.age,24);assert.equal(a.youth,false);assert.equal(a.heightCm,186);
 assert.equal(a.country,"日本");assert.equal(a.gender,"male");assert.equal(a.position,"ST");
 assert.equal(b.age,17);assert.equal(b.youth,true);assert.equal(b.country,"法国");
 assert.equal(a.freeStarHidden,true);assert.notEqual(a.potential,undefined);
 assert.match(custom.html,/潜能未知/);assert.doesNotMatch(custom.html,new RegExp("成长潜力 "+a.potential+" \/ 100"));
});
check("自定义人物与旧存档均可重载，保持潜能与头像",()=>{
 const saved=custom.saved,a=saved.duoGames.wang.player;
 const loaded=harness([["football-dynasty-duo-v2-20261110",JSON.stringify(saved)]]);
 assert.equal(loaded.saved.duoGames.wang.player.potential,a.potential);
 assert.equal(loaded.saved.duoGames.wang.player.freeStar.avatarSeed,a.freeStar.avatarSeed);
 assert.match(loaded.html,/游戏估算身价/);assert.match(loaded.html,/潜能未知/);
});
assert.equal(passed,10);console.log("✓ v6.3.0 free-star 10 focused checks passed");
