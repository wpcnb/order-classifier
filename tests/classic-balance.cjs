"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const html=fs.readFileSync(require("node:path").join(__dirname,"..","index.html"),"utf8");
const m=html.match(/<script>([\s\S]*?)<\/script>/);assert(m,"Root game script missing");
const code=m[1].replace(/\}\)\(\);\s*$/,'window.__test={get:()=>s,ballonVote,metrics:()=>honorSummary()};})();');
function boot(initial=null,seed=123456){
 let saved=initial,handlers={},nodes={},prompts=[];
 const node=id=>nodes[id]||(nodes[id]={innerHTML:"",classList:{add(){},remove(){}},addEventListener(t,fn){handlers[id+t]=fn},click(){},value:""});
 const document={getElementById:node,createElement:()=>({click(){},remove(){}}),body:{append(){}}};
 const localStorage={getItem(){return saved},setItem(k,v){saved=v},removeItem(){saved=null}};
 const math=Object.create(Math);math.random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
 const window={};
 vm.runInNewContext(code,{window,document,localStorage,Math:math,setTimeout:()=>0,clearTimeout(){},confirm:x=>(prompts.push(x),true),console},{filename:"classic-game.js",timeout:14000});
 const e=(name,field)=>handlers["appclick"]({target:{closest:()=>({disabled:false,dataset:{[field]:name}})}});
 return {act:name=>e(name,"action"),tab:name=>e(name,"tab"),get data(){return JSON.parse(saved)},get html(){return node("app").innerHTML},get raw(){return saved},debug:window.__test,prompts}
}
function ok(label,yes){assert(yes,label);console.log("OK",label)}
const t=boot();ok("Default career loads",t.data.club==="曼联"&&t.data.fixtures===38);
const years=[];
for(let i=0;i<12;i++){
 t.act("auto-season");const d=t.data;
 ok("Season 100 votes / 6700 points",d.ballots.at(-1).allVotes.length===100&&d.ballots.at(-1).totalPoints===6700);
 ok("EPL matches complete",Object.values(d.leagueTable).every(x=>x.pl===38));
 years.push({apps:d.seasonTotals.apps,goals:d.seasonTotals.goals});
 if(i<11)t.act("next-season");
}
const s=t.data,ratio=s.totals.goals/s.totals.apps;
ok("Long-run goals less than one per appearance",ratio>.05&&ratio<.88);
ok("No 75-goal normal season",years.every(y=>y.goals<75));
t.tab("career");ok("Career has numeric medals and goals trend",t.html.includes("累计获奖次数")&&t.html.includes("历年进球和助攻折线图"));
const clubs=Object.values(s.leagueTable),teamGoals=clubs.reduce((a,b)=>a+b.gf,0)/clubs.reduce((a,b)=>a+b.pl,0);
ok("League team score model calibrated",teamGoals>.3&&teamGoals<3);
const h=boot().data;
h.history=Array.from({length:20},(_,i)=>({year:2026+i,club:"曼联",league:"英超",apps:40,goals:95,assists:20,points:45,won:false,rank:5}));
h.year=2046;h.age=38;h.totals.apps=800;h.totals.goals=1900;h.totals.assists=400;
h.seasonTotals.apps=0;h.seasonTotals.goals=0;h.seasonTotals.assists=0;
h.awards=Array.from({length:4},(_,i)=>({year:2030+i,title:"金球奖（模拟记者投票）",type:"personal"}));
const old=boot(JSON.stringify(h));
ok("Pre-existing save remains untouched",old.data.totals.goals===1900&&old.data.awards.length===4);
old.tab("career");ok("Anomaly is offered, not forced",old.html.includes("recalibrate-history"));
old.act("recalibrate-history");const a=old.data;
ok("Opt-in 800/1900 recalibrates to 800/560",a.totals.apps===800&&a.totals.goals===560);
ok("Backups and awards preserved",a.oldStatsBackup.totals.goals===1900&&a.awards.length===4);
old.tab("career");ok("Recovery control present",old.html.includes("restore-history"));
old.act("restore-history");ok("Restoring original stats works",old.data.totals.goals===1900&&old.data.awards.length===4&&!old.data.oldStatsBackup);
const strong=boot().data;strong.stats={pace:95,shoot:99,pass:94,defense:70,physical:90,mental:95};
strong.seasonTotals.apps=38;strong.seasonTotals.goals=52;strong.seasonTotals.assists=15;strong.seasonTotals.ratings=Array(38).fill(9.1);
strong.awards=[{year:strong.year,type:"title",title:"英超冠军"}];
const champion=boot(JSON.stringify(strong),42);champion.debug.ballonVote();
const vote=champion.debug.get().ballots.at(-1);
ok("Exceptional season wins Golden Ball on sporting merit",vote.playerRank===1&&vote.playerPoints>1000);
ok("Exactly one Golden Ball awarded",champion.debug.metrics().find(x=>x.name==="金球奖").count===1);
console.log("CLASSIC GAME BALANCE SUITE PASSED");
