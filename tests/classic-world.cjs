"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const content=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const m=content.match(/<script>([\s\S]*?)<\/script>/);assert(m,"Expected inline game");
function game(initial=null,seed=104333){
 let save=initial,buttons={},nodes={},messages=[];
 const el=id=>nodes[id]||(nodes[id]={innerHTML:"",classList:{add(){},remove(){}},addEventListener(t,fn){buttons[id+"-"+t]=fn},click(){},value:""});
 const document={getElementById:el,createElement:()=>({click(){},remove(){}}),body:{append(){}}};
 const localStorage={getItem(){return save},setItem(k,v){save=v},removeItem(){save=null}};
 const math=Object.create(Math);
 math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 vm.runInNewContext(m[1],{document,localStorage,Math:math,confirm:x=>(messages.push(x),true),setTimeout:()=>0,clearTimeout(){},console,window:{}},{timeout:18000});
 return {get state(){return JSON.parse(save)},get saved(){return save},get html(){return el("app").innerHTML},tab:x=>buttons["app-click"]({target:{closest:()=>({dataset:{tab:x},disabled:false})}}),
 action:(x,i=0)=>buttons["app-click"]({target:{closest:()=>({dataset:{action:x,index:String(i)},disabled:false})}}),messages}
}
const check=(description,predicate)=>{assert(predicate,description);console.log("PASS",description)};
const x=game(),person=x.state.npcs.find(n=>n.name==="姆巴佩");
check("Mbappe DOB implies 27 years old in autumn 2026",person.age===27&&person.birthYear===1998);
check("Original Manchester United player career loads",x.state.year===2026&&x.state.club==="曼联");
x.tab("sponsor");
check("Sponsorship office renders and lists contracts",x.html.includes("品牌代言中心")&&x.state.sponsorOffers.length>0);
let equip=x.state.sponsorOffers.findIndex(v=>v.category==="equipment");
x.action("sign-sponsor",equip);
let contracted=x.state;
check("Signing bonus paid to cash and sponsor ledger",contracted.sponsorships.length===1&&contracted.sponsorLedger.length===1&&contracted.sponsorIncomeTotal>0);
check("Only one exclusive kit slot allowed",!contracted.sponsorOffers.some(o=>o.category==="equipment"));
let commercial=contracted.sponsorOffers.findIndex(v=>v.category==="commercial");
x.action("sign-sponsor",commercial);
check("One equipment and one commercial brand coexist",x.state.sponsorships.length===2);
const signing=x.state.sponsorIncomeTotal;
x.action("auto-season");
check("Season-end commercial payout occurs once",x.state.sponsorIncomeTotal>signing&&x.state.sponsorLedger.length===4);
check("Golden Boot finish is saved to season history",Number.isInteger(x.state.history.at(-1).goldenBootRank));
check("Ballon d'Or candidate list uses 30 real players",x.state.ballots.at(-1).results.length===30&&x.state.ballots.at(-1).results.every(n=>n.id==="YOU"||n.realPerson));
const before=x.state.sponsorIncomeTotal;
const loaded=game(x.saved);
check("Importing existing save does not pay sponsors again",loaded.state.sponsorIncomeTotal===before);
loaded.tab("career");
check("Career shows best Ballon / Golden Boot rank",loaded.html.includes("金球奖最好名次")&&loaded.html.includes("联赛金靴最好名次"));
loaded.tab("sponsor");
check("Sponsorship records survive refresh",loaded.html.includes("合作收支账本")&&loaded.html.includes("新百伦"));
let rows=[];
for(let k=0;k<17;k++){
 const s=loaded.state;
 if(s.phase==="season_end"){if(s.retired)break;loaded.action("next-season");}
 if(loaded.state.retired)break;
 loaded.action("auto-season");
 const d=loaded.state,b=d.ballots.at(-1),mb=d.npcs.find(n=>n.name==="姆巴佩");
 check("All eligible Golden Ball recipients age under their position retirement limits",!b.results||b.results.every(n=>n.id==="YOU"||n.age<=43));
 check("No fake or retired footballer can appear in ballots",!b.results||b.results.every(n=>{
   if(n.id==="YOU")return true;
   const match=d.npcs.find(x=>x.id===n.id);return match&&match.realPerson&&!match.retired;
 }));
 if(b.results)check("Every completed Golden Ball ballot contains exactly 30 names and 6700 points",b.results.length===30&&b.totalPoints===6700);
 if(b.suspended)check("Not enough real candidates means no fake award winner",!b.winner);
 rows.push({year:d.year,mbAge:mb.age,mbRetired:mb.retired,ballotWinner:b.winner?.name||null});
}
const mb=loaded.state.npcs.find(n=>n.name==="姆巴佩");
check("Mbappe eventually retires and cannot win at 46",mb.retired===true&&rows.every(y=>!(y.mbAge>=40&&y.ballotWinner==="姆巴佩")));
loaded.tab("career");
check("Retired real people are recorded in archive",loaded.html.includes("世界球星退役名录"));
for(const tab of ["overview","career","sponsor","market","save","europe"]){
 loaded.tab(tab);check("Prohibited wording absent from "+tab,!loaded.html.includes("\u6a21\u62df"));
}
console.log("CLASSIC CAREER SPONSOR + AGE SYSTEM PASSED",rows.length,"seasons.");
