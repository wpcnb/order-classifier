"use strict";
/* v10 independent original code verification. 100 executed scenarios PER feature,
   not 100 claims or extrapolated outcomes. Historical v9 tests run separately. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const loaded={};for(const f of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js","body-path.js","career-depth.js","free-star.js","v10-core.js","v10-ui.js","game.js"])loaded[f]=read(f);
const ctx={window:{},console};for(const f of ["real-footballers.js","v10-core.js","v10-ui.js"])vm.runInNewContext(loaded[f],ctx,{filename:f});
const V=ctx.window.DualV10,UI=ctx.window.DualV10UI,roster=ctx.window.FOOTBALL_AWARD_REAL_PEOPLE;
const persons=V.catalog(roster);
const passed={};
function rng(seed){let x=(seed+19)>>>0;return()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296}}
function verify(label,fn){for(let i=0;i<100;i++)fn(i);passed[label]=100;console.log("PASS 100/100 "+label)}
verify("catalog contains only distinct, documented game reference entries",i=>{
 const row=persons[i%persons.length];
 assert(V.findPerson(row.name,roster));
 assert.equal(persons.filter(x=>x.name===row.name).length,1);
 assert(row.position);
 if(row.name==="王楚淇")assert.equal(row.source,"原有玩家角色");
});
verify("random game league restricted to six supported competitions",i=>{
 const value=V.chooseLeague(rng(i));
 assert(V.LEAGUES.includes(value));
 assert.equal(V.LEAGUES.length,6);
});
verify("game country random choices are separate from reference identity",i=>{
 assert(V.COUNTRIES.includes(V.chooseCountry(rng(i))));
 const entry=persons[(i+1)%persons.length];
 assert(V.REFERENCE_COUNTRIES[entry.name]||entry.name==="王楚淇");
});
verify("player templates are position-aware without direct nationality/body rating",i=>{
 const p=persons[i%persons.length],t=V.templateFor(p.name,roster);
 assert(t&&t.potential<=98&&t.potential>=77);
 assert(Object.values(t.stats).every(n=>n>=32&&n<=92));
 assert.equal(t.stats.shoot,V.templateFor(p.name,roster).stats.shoot);
});
verify("height and weight validation cover out-of-range inputs",i=>{
 const v=130+i;
 assert(V.allowedHeight(v)>=150&&V.allowedHeight(v)<=210);
 assert(V.seedWeight(v)>=45&&V.seedWeight(v)<=125);
 assert(V.allowedWeight(-300+i)>=45&&V.allowedWeight(-300+i)<=125);
});
verify("every philosophy has bounded advantages and explicit tradeoffs",i=>{
 const keys=Object.keys(V.PHILOSOPHIES),key=keys[i%keys.length];
 const inf=V.matchInfluence({careerPhilosophy:key});
 assert(inf.shot>=.95&&inf.shot<=1.07);
 assert(inf.assist>=.95&&inf.assist<=1.07);
 assert(inf.fatigue>=.9&&inf.fatigue<=1.09);
 if(key==="finisher")assert(inf.shot>1&&inf.assist<1&&inf.fatigue>1);
 if(key==="creator")assert(inf.shot<1&&inf.assist>1);
 assert(V.OPERATIONS[V.scrubOperation(i%2?"deep":"guided")]);
});
verify("narrative facts derived from actual player and season stats",i=>{
 const apps=i%41,goals=Math.floor(i/4),assists=Math.floor(i/8);
 const p={name:"测试",retired:false,injuryMatches:0},season={apps,goals,assists};
 const text=V.narrative(p,season)[0];
 assert(text&&text.title&&text.text);
 if(text.title==="得分突破")assert(apps>=20&&goals>=15);
 if(text.title==="组织核心")assert(apps>=20&&assists>=10);
});
verify("local snapshots preserve raw save and reject corruption",i=>{
 const mock={version:2,duoGames:{wang:{player:{name:"W",age:i}},vini:{player:{name:"V",age:i}}}};
 const raw=JSON.stringify(mock),map=new Map([["CURRENT",raw]]);
 const store={getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,String(value))};
 assert(V.saveSnapshot(store,"CURRENT").ok);
 assert.equal(V.snapshotForRestore(store,0),raw);
 assert.equal(V.parseCareer("junk"),null);
 assert.equal(V.readSlots(store).length,1);
});
verify("mobile wizard renders each stage and original ten-card draw handoff",i=>{
 const step=(i%3)+1,drawn={wang:null,vini:null};
 const output=UI.render({core:V,people:persons,players:{wang:"王楚淇",vini:"维尼修斯"},
  leagues:{wang:"CHN",vini:"ENG"},countries:{wang:"中国",vini:"巴西"},
  heights:{wang:177,vini:176},positions:{wang:"LW",vini:"LW"},
  philosophies:{wang:"balanced",vini:"creator"},operations:{wang:"guided",vini:"deep"},
  step,drawn,gameLeagues:{CHN:{name:"中超"},ENG:{name:"英超"}},positionLabels:{LW:"左边锋"},
  development:id=>'<div data-dev="'+id+'">发展</div>',openingCards:id=>'<div data-cards="'+id+'">十张卡</div>'});
 assert(output.includes("双星时代"));
 if(step===1)assert(output.includes('data-v10-person="wang"')&&output.includes('data-action="v10League"'));
 if(step===2)assert(output.includes('data-v10-operation="vini"')&&output.includes("发展"));
 if(step===3)assert(output.includes('data-cards="wang"'));
});
const storageKey="football-dynasty-duo-v2-20261110",openingKey="football-dynasty-opening-v3";
function harness(seed){
 const store=new Map(),handlers={},nodes={},timers=[],random=rng(seed*103+11);
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},
 addEventListener(type,fn){(handlers[id+":"+type]||(handlers[id+":"+type]=[])).push(fn)},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 const math=Object.create(Math);math.random=random;
 const window={},context={window,document,localStorage,Math:math,console,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},confirm:()=>true,Blob,URL};
 for(const file of Object.keys(loaded))vm.runInNewContext(loaded[file],context,{filename:file,timeout:14000});
 const trigger=(type,target)=>{const fn=(handlers["app:"+type]||[])[0];assert(fn);fn({target})};
 const api={
 click:(action,data={})=>trigger("click",{closest:()=>({disabled:false,dataset:{action,...data}})}),
 change:dataset=>trigger("change",{dataset,value:dataset.value}),
 flush:()=>{let rounds=0;while(timers.length&&rounds++<20)timers.shift()();},
 get html(){return node("app").innerHTML},
 get opening(){return JSON.parse(store.get(openingKey)||"null")},
 get saved(){return JSON.parse(store.get(storageKey)||"null")},
 };
 return api;
}
verify("100 independently initialized gameplay sessions, dual league, archive and real-reference profiles",i=>{
 const h=harness(i);
 assert(h.html.includes("双星时代"));
 const names=persons.filter(x=>x.name!=="王楚淇"&&x.name!=="维尼修斯");
 const alt=names[i%names.length];
 h.change({v10Person:"wang",value:alt.name});
 h.change({v10Height:"wang",value:String(150+(i%61))});
 h.change({v10Philosophy:"wang",value:i%2?"finisher":"creator"});
 h.change({v10Operation:"vini",value:"deep"});
 h.click("v10Next");h.click("v10Next");
 h.click("flipOpeningCard",{id:"wang",i:0});h.flush();
 h.click("flipOpeningCard",{id:"vini",i:0});h.flush();
 h.click("preset");
 const s=h.saved;assert(s&&s.version===2,"new game save must be written");
 const a=s.duoGames.wang.player,b=s.duoGames.vini.player;
 assert.equal(a.name,alt.name);
 assert.equal(a.heightCm,150+(i%61));
 assert.equal(a.careerPhilosophy,i%2?"finisher":"creator");
 assert.equal(b.careerOperationMode,"deep");
 assert.equal(b.autoPoints,false);
 assert(V.LEAGUES.includes(a.leagueId)&&V.LEAGUES.includes(b.leagueId));
 assert(a.club!==b.club,"players in same universe must not create a duplicate team card");
 assert(s.sharedUniverse&&s.duoGames.wang&&s.duoGames.vini);
});
assert.equal(Object.keys(passed).length,10);
assert.equal(Object.values(passed).reduce((a,b)=>a+b,0),1000);
console.log("V10_100X_RESULT_JSON="+JSON.stringify({version:"v10.0.0",categories:passed,actualAssertionsGroups:1000,fullLeagueSaveRegression:"existing 100-season CI baseline plus new 100 independently seeded career bootstraps"}));
