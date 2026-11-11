"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.resolve(__dirname,"../game.js"),"utf8");
const start=source.indexOf("function disciplinaryScope(ev){");
const end=source.indexOf("function refreshSuspensionSummary(p){",start);
assert(start>=0&&end>start,"match discipline engine must exist");
const code=source.slice(start,end);
const events=[],context={Math,log:m=>events.push(m),C:(x,a,b)=>Math.max(a,Math.min(b,x))};
vm.createContext(context);vm.runInContext(code+";this.api={rollMatchCards,applyMatchDiscipline,disciplinaryRecord}",context);
const {rollMatchCards,applyMatchDiscipline,disciplinaryRecord}=context.api;
function randomSequence(...values){let i=0;return ()=>values[i++]??.99;}
function player(position="LW"){return {name:"测试球员",position,redCards:0,yellowCards:0,suspension:0}}
let p=player();
let c=applyMatchDiscipline(p,{kind:"league"},"balanced",randomSequence(.04,.99));
assert.equal(c.yellowCards,1);assert.equal(c.redCard,null);assert.equal(p.discipline.league.yellow,1);
assert.equal(p.redCards,0);assert.equal(p.discipline.league.ban,0);
c=applyMatchDiscipline(p,{kind:"league"},"balanced",randomSequence(.05,.0));
assert.equal(c.yellowCards,2);assert.equal(c.redCard,"second-yellow");assert.equal(p.redCards,1);
assert.equal(p.discipline.league.ban,1);assert.equal(p.discipline.league.yellow,1,"two cautions in one match must not count toward seasonal five yellows");
assert(events.some(x=>x.includes("两黄变一红")));
p=player();c=applyMatchDiscipline(p,{kind:"league"},"balanced",randomSequence(0));
assert.equal(c.redCard,"direct");assert.equal(c.yellowCards,0);
assert.equal(p.redCards,1);assert.equal(p.discipline.league.ban,2);assert.equal(p.discipline.league.yellow,0);
p=player();
for(let i=0;i<5;i++)applyMatchDiscipline(p,{kind:"league"},"balanced",randomSequence(.05,.99));
assert.equal(p.discipline.league.yellow,0);assert.equal(p.discipline.league.ban,1);
applyMatchDiscipline(p,{kind:"cup"},"balanced",randomSequence(.04,.99));
assert.equal(p.discipline.cup.yellow,1);assert.equal(p.discipline.league.ban,1);
assert.equal(p.discipline.europe.yellow,0);assert.equal(p.discipline.national.yellow,0);
for(const position of ["GK","CB","CDM","CM","LW","ST"]){
 let seed=20261111;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
 let yellow=0,red=0,second=0;
 for(let i=0;i<100000;i++){const c=rollMatchCards({position},"balanced",rand);yellow+=c.yellowCards;if(c.redCard)red++;if(c.redCard==="second-yellow")second++;}
 assert(yellow>red*20,"yellow cards should greatly outnumber reds at "+position);
 assert(red<500,"red incidence should remain rare at "+position);
 assert(second>0,"second yellow dismissals must be possible at "+position);
 console.log(position,{yellow,red,second});
}
assert(source.includes("matchCards=applyMatchDiscipline(p,ev,choice)"),"playing a game must apply cards");
assert(source.includes("yellowCards:matchCards.yellowCards,redCard:matchCards.redCard"),"match reports must persist card types");
console.log("✓ Standard yellow, two yellows = red, direct red, bans, competition scope, and card frequency");
