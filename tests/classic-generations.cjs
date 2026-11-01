"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const gameCode=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(gameCode,"Game inline script is required");
const prospectData=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","verified-youth-2026.json"),"utf8"));
function boot(initial=null,seed=20261101){
 let stored=initial,handlers={},nodes={};
 const el=id=>nodes[id]||(nodes[id]={innerHTML:"",classList:{add(){},remove(){}},addEventListener(t,fn){handlers[id+"-"+t]=fn},click(){},value:""});
 const doc={getElementById:el,createElement:()=>({click(){},remove(){}}),body:{append(){}}};
 const storage={getItem(){return stored},setItem(k,v){stored=v},removeItem(){stored=null}};
 const math=Object.create(Math);math.random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
 vm.runInNewContext(gameCode,{document:doc,localStorage:storage,Math:math,window:{},confirm:()=>true,
   setTimeout:()=>1,clearTimeout(){},console},{timeout:30000});
 const event=(name,type)=>handlers["app-click"]({target:{closest:()=>({disabled:false,dataset:{[type]:name}})}});
 return{action:x=>event(x,"action"),tab:x=>event(x,"tab"),get s(){return JSON.parse(stored)},get raw(){return stored},get ui(){return el("app").innerHTML}};
}
function test(name,result){assert(result,name);console.log("OK",name)}
const a=boot(),init=a.s;
const roster=init.npcs.filter(n=>n.isYouth&&!n.rebirth);
test("Source-backed youth data has 37 unique real identities",prospectData.youth.length===37&&new Set(roster.map(n=>n.name)).size===37);
test("All 2026 real teenagers aged 16–18",roster.every(n=>n.age>=16&&n.age<=18));
test("Max Dowman born 2009-12-31 and starts at age 16",roster.find(n=>n.englishName==="Max Dowman")?.age===16);
test("Jesse Bisiwu born 2008-01-22 and starts at age 18",roster.find(n=>n.englishName==="Jesse Bisiwu")?.age===18);
test("Born 1998 Mbappe starts aged 27, not 46",init.npcs.find(n=>n.name==="姆巴佩")?.age===27);
a.tab("talent");test("Academy and reincarnation page displays real youth profiles",a.ui.includes("青训球探")&&a.ui.includes("马克斯·道曼")&&a.ui.includes("成长潜力"));
const errors=[],snapshots=[],allGoldWinners=[];
for(let i=0;i<68;i++){
 let pre=a.s;
 if(pre.retired){
   const archiveBefore=pre.family.length,calendarYear=pre.year;
   a.action("heir-start");
   const next=a.s;
   test("Next generation playable at 16",next.age===16&&next.generation===archiveBefore+2&&!next.retired);
   test("Next generation preserves world year and ancestors",next.year===calendarYear+1&&next.family.length===archiveBefore+1);
   test("Next generation resets own awards and goals",next.awards.length===0&&next.totals.goals===0);
   test("World reincarnations survive across player succession",next.worldRebirthCount>=pre.worldRebirthCount);
 }else if(pre.phase==="season_end")a.action("next-season");
 const start=a.s;
 const newborn=start.npcs.filter(n=>n.rebirth&&n.rebirthYear===start.year);
 if(start.year>2026)test("Reborn freshmen have zero inherited statistics",newborn.every(n=>n.apps===0&&n.goals===0&&n.assists===0));
 a.action("auto-season");
 const s=a.s,v=s.ballots.at(-1);
 if(v.suspended||v.results?.length!==30||v.totalPoints!==6700)errors.push({year:s.year,type:"invalid ballot"});
 if(v.year!==s.year+1)errors.push({year:s.year,type:"stale ballot"});
 const unique=new Set(s.npcs.map(n=>n.id));
 if(unique.size!==s.npcs.length)errors.push({year:s.year,type:"duplicate NPC ID"});
 for(const n of v.results||[]){
  if(n.id==="YOU")continue;
  if(!s.npcs.some(x=>x.id===n.id&&!x.retired&&x.realPerson))errors.push({year:s.year,type:"retired or missing nominee",name:n.name})
 }
 if(s.npcs.find(n=>n.name==="姆巴佩")?.retired&&v.winner?.id==="real-15")errors.push({year:s.year,type:"retired original Mbappe won"});
 allGoldWinners.push(v.winner?.name);
 if(i%12===0||i===67)snapshots.push({year:s.year,generation:s.generation,realActive:s.npcs.filter(n=>n.realPerson&&!n.retired).length,rebirths:s.worldRebirthCount,candidates:v.results?.length});
}
const end=a.s;
test("68 continuous seasons pass all eligibility, identity and voting constraints",errors.length===0);
test("At least three generations of human-controlled careers progress",end.generation>=3&&end.family.length>=2);
test("At least a third generation of footballer rebirths emerges",end.npcs.some(n=>n.rebirth&&n.lineageGeneration>=3));
test("No 46-year-old original footballer can win a future Golden Ball",!allGoldWinners.some((x,i)=>i>=25&&x==="姆巴佩"));
a.tab("family");test("Previous family career records preserved",a.ui.includes("前代球员档案"));
a.tab("talent");test("Reincarnation archive and counts visible",a.ui.includes("历届转世事件"));
for(const tab of ["overview","family","talent","career","sponsor"]){
 a.tab(tab);test("Forbidden word absent from "+tab,!a.ui.includes("\u6a21\u62df"))
}
const reload=boot(a.raw,2026);
test("Saved 68-season world restores to the correct year and generation",reload.s.year===end.year&&reload.s.generation===end.generation);
test("Reload never duplicates 37 verified youth or reincarnated identities",new Set(reload.s.npcs.map(n=>n.id)).size===reload.s.npcs.length&&reload.s.npcs.filter(n=>n.isYouth&&!n.rebirth).length===37);
console.log("PASS: 68 SEASONS, "+end.worldRebirthCount+" REBIRTHS, "+end.generation+" PLAYER GENERATIONS. CHECKPOINTS="+JSON.stringify(snapshots));
