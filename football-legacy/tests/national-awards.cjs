"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const src=fs.readFileSync(path.resolve(__dirname,"../game.js"),"utf8");
const begin=src.indexOf("function sharedNationalKnockoutWin("),end=src.indexOf("function playEvent(",begin);
assert(begin>=0&&end>begin);
const ctx={g:{year:2031},sharedUniverse:{national:{}},Math};
vm.createContext(ctx);vm.runInContext(src.slice(begin,end)+";this.decide=sharedNationalKnockoutWin",ctx);
const ev={date:"2032-02-05",stage:"决赛"};
const key="2031:2032-02-05:决赛:中国:日本";
const seq=()=>.9;
assert.equal(ctx.decide(ev,"中国","日本",1,1,seq),false);
assert.equal(ctx.sharedUniverse.national[key],undefined,"only a match outcome ledger can hold the decision");
ctx.sharedUniverse.national[key]={hs:1,as:1};
assert.equal(ctx.decide(ev,"中国","日本",1,1,()=>.1),true);
assert.equal(ctx.sharedUniverse.national[key].penaltyWin,true);
assert.equal(ctx.decide(ev,"中国","日本",1,1,()=>.9),true,"second protagonist must inherit same decision");
assert.equal(ctx.decide(ev,"中国","日本",2,1,()=>false),true,"90-minute win always wins");
assert.equal(ctx.decide(ev,"中国","日本",1,2,()=>.1),false,"90-minute defeat always loses");
const saved=JSON.parse(JSON.stringify(ctx.sharedUniverse));
const restored={g:{year:2031},sharedUniverse:saved,Math};vm.createContext(restored);vm.runInContext(src.slice(begin,end)+";this.decide=sharedNationalKnockoutWin",restored);
assert.equal(restored.decide(ev,"中国","日本",1,1,()=>false),true,"persisted shootout decision survives reload");
{
 const world={national:{[key]:{hs:1,as:1}}};
 const a={year:2031,player:{country:"中国"},season:{results:[]}},b={year:2031,player:{country:"日本"},season:{results:[]}};
 const both={g:a,duoGames:{wang:a,vini:b},DUO_IDS:["wang","vini"],sharedUniverse:world,Math};
 vm.createContext(both);vm.runInContext(src.slice(begin,end)+";this.decide=sharedNationalKnockoutWin",both);
 assert.equal(both.decide(ev,"中国","日本",1,1,()=>.1),true);
 assert.equal(world.national[key].penaltyWinner,"中国");
 both.g=b;assert.equal(both.decide(ev,"中国","日本",1,1,()=>.9),false,"opposing teams must have exactly one winner");
 b.player.country="中国";assert.equal(both.decide(ev,"中国","日本",1,1,()=>.9),true,"teammates share the same outcome");
 const after=JSON.parse(JSON.stringify(world));const reload={g:{year:2031,player:{country:"日本"}},sharedUniverse:after,Math};
 vm.createContext(reload);vm.runInContext(src.slice(begin,end)+";this.decide=sharedNationalKnockoutWin",reload);
 assert.equal(reload.decide(ev,"中国","日本",1,1,()=>.1),false,"winner identity survives reload");
}
{
 const world={national:{[key]:{hs:1,as:1}}};
 const scenario={g:{year:2031,player:{country:"日本"}},sharedUniverse:world,Math};
 vm.createContext(scenario);vm.runInContext(src.slice(begin,end)+";this.decide=sharedNationalKnockoutWin",scenario);
 assert.equal(scenario.decide(ev,"中国","日本",1,1,()=>.1),true,"away team can win when it is processed first");
 assert.equal(world.national[key].penaltyWinner,"日本");scenario.g.player.country="中国";
 assert.equal(scenario.decide(ev,"中国","日本",1,1,()=>.1),false);
}
{
 // A legacy in-progress save has the previous player's result but only the
 // old player-relative boolean; infer its owner from that existing record.
 const a={year:2031,player:{country:"中国"},season:{results:[{kind:"national",date:ev.date,stage:ev.stage,home:"中国",away:"日本"}]}},b={year:2031,player:{country:"日本"},season:{results:[]}};
 const world={national:{[key]:{hs:1,as:1,penaltyWin:true}}};
 const old={g:b,duoGames:{wang:a,vini:b},DUO_IDS:["wang","vini"],sharedUniverse:world,Math};
 vm.createContext(old);vm.runInContext(src.slice(begin,end)+";this.decide=sharedNationalKnockoutWin",old);
 assert.equal(old.decide(ev,"中国","日本",1,1,()=>.9),false);
 assert.equal(world.national[key].penaltyWinner,"中国");
 assert.equal(a.season.results.length,1,"legacy historical results are preserved");
 world.national[key]={hs:1,as:1,penaltyWin:false};
 assert.equal(old.decide(ev,"中国","日本",1,1,()=>.1),true,"the opposite team wins if the legacy result was a loss");
 assert.equal(world.national[key].penaltyWinner,"日本");
}
assert(src.includes("const roster=duoGames.wang.npcs.filter(n=>Number.isFinite(n.ov)"),"new-generation footballers must remain eligible for Gold Ball");
console.log("✓ shared national shootout result cannot disagree or reroll; new-generation Gold Ball candidates included");
