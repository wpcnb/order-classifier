"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const FA=require(path.join(root,"legacy-awards.js"));
const src=fs.readFileSync(path.join(root,"tests/_fixtures/legacy-engine.txt"),"utf8");
const begin=src.indexOf("function awardLeagueTier(");
const end=src.indexOf("// A retired player",begin);
assert(begin>=0&&end>begin,"annual award source boundaries missing");
const Y=2040,club="皇家马德里",other="曼城";
const table={
 [club]:{name:club,points:91},
 [other]:{name:other,points:80}
};
function competition(type,stage,winner){
 return {year:Y,type,clubs:[club,other],champion:winner,knockout:stage?[{stage,a:club,b:other,winner}]:[]};
}
const fixture={europeCompetitions:{[Y+":欧冠"]:competition("欧冠","决赛",club)},rounds:{},europeFinals:{}};
const ctx={
 FA,sharedUniverse:fixture,g:{season:{world:{},leagueTable:table}},
 duoGames:null,DUO_IDS:["wang","vini"],Math,
 DB:{ESP:{teams:[{name:club}]},ENG:{teams:[{name:other}]}},
 C:(n,a,b)=>Math.max(a,Math.min(b,n)),R:()=>0,
 sortedTable:t=>Object.values(t).sort((a,b)=>b.points-a.points)
};
vm.createContext(ctx);
vm.runInContext(src.slice(begin,end)+
 ";this.check={europe:awardEuropeanHonourPoints,team:awardTeamHonours,rating:awardComparableRating,score:awardCandidateScore}",ctx);
const c=ctx.check;
assert.equal(FA.europeanPrestige(club,Y,fixture),30,"UCL title worth 30 base points");
assert.equal(c.europe(club,Y,3),30,"3 UEFA appearances grant full title credit");
assert.equal(c.europe(club,Y,1),17,"single appearance receives a reduced award");
assert.equal(c.europe(club,Y,0),0,"no UEFA appearances cannot claim European bonus");
assert.equal(c.europe(other,Y,3),16,"the runner-up has lower merit");
assert.equal(c.team(club,Y,3),40,"top-five league plus UCL, with no 32-point cap");
assert.equal(c.team(club,Y,0),10,"league win stands even without UEFA participation");
assert.equal(c.team(club,Y,3),c.team(club,Y,3),"no history-dependent cumulative bonus");
fixture.europeCompetitions[Y+":欧冠"]=competition("欧冠","半决赛",other);
assert.equal(c.europe(club,Y,3),9,"UCL semifinal without title");
fixture.europeCompetitions={[Y+":欧联"]:competition("欧联","决赛",club)};
assert.equal(c.europe(club,Y,3),16,"UEL winner is acknowledged");
fixture.europeCompetitions={};
assert.equal(c.europe(club,Y,3),0,"zero European merit without verified record");
fixture.europeFinals[Y+":欧冠"]={winner:club};
assert.equal(c.europe(club,Y,3),30,"confirmed old final winner remains eligible");
fixture.europeFinals={};
const player={club,goals:28,assists:11,apps:46,ov:91,rating:7.7,position:"LW"};
assert.equal(c.score(player,Y,30,()=>0)-c.score(player,Y,0,()=>0),30,
 "UEFA honour affects score without being a hard prerequisite");
assert(Number.isFinite(c.rating(player)));
const npc={...player,rating:6.5};
assert(Math.abs(c.rating(player)-c.rating(npc))<.4,"NPC/player raw rating asymmetry is moderated");
const nominees=[
 {id:"one",name:"甲",club,position:"LW",goals:28,assists:11,apps:46,ov:91,rating:7.7,awardRating:c.rating(player),teamBonus:40},
 {id:"two",name:"乙",club:other,position:"ST",goals:35,assists:7,apps:45,ov:91,rating:7.3,awardRating:7.2,teamBonus:10},
 {id:"three",name:"丙",club:other,position:"GK",goals:0,assists:0,apps:43,ov:91,rating:7.4,awardRating:7.1,cleanSheets:20,teamBonus:15}
];
const best=FA.electTheBest(nominees,Y);
assert(best&&best.model===2&&best.rankings.length===3,"FIFA award election version");
const pct=best.rankings.reduce((a,b)=>a+b.score,0);
assert(Math.abs(pct-100)<.01,"four independently normalized voter categories");
assert(src.includes("const awardData={year,model:9"),"old awards must not be silently rewritten");
console.log("PASS: European prestige, player participation, no cumulative honours, Ballon dOr and FIFA award model");