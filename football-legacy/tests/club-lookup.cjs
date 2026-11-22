"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"_fixtures/legacy-engine.txt"),"utf8");
function section(start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a);
 assert(a>=0&&b>a,"missing code section: "+start);return source.slice(a,b);
}
const db=section("const RAW={","const MANU_26=");
const lookup=section("const CLUB_INDEX=new Map();","const MANU_26=");
const power=section("function power(team){","function overall(");
const league=section("function leagueFromClub(name){","function poissonGoals(");
const setup='const C=(n,a,b)=>Math.max(a,Math.min(b,n));let g=null;';
const exportsCode='return {DB,power,leagueFromClub,setGame:value=>g=value};';
const real=Function(setup+db+power+league+exportsCode)();
function oldPower(name,game,db){
 if(name.endsWith("青训"))return Math.max(42,oldPower(name.slice(0,-2),game,db)-30);
 if(game?.clubRatings&&Number.isFinite(game.clubRatings[name]))return game.clubRatings[name];
 for(const x of Object.values(db)){const t=x.teams.find(z=>z.name===name);if(t)return t.power}
 return 80;
}
function oldLeague(name,db){
 for(const [id,x] of Object.entries(db))if(x.teams.some(t=>t.name===name))return id;
 return null;
}
const clubs=Object.values(real.DB).flatMap(x=>x.teams.map(t=>t.name));
const cases=[...clubs,...clubs.map(name=>name+"青训"),"不存在的球队","不存在的球队青训","",123,null,undefined];
for(const ratings of [null,{[clubs[0]]:99,[clubs[1]]:0,[clubs[2]]:NaN,[clubs[3]]:Infinity,[clubs[4]+"青训"]:93,"不存在的球队":65}]){
 const g=ratings?{clubRatings:ratings}:null;real.setGame(g);
 for(const name of cases){
  assert.equal(real.leagueFromClub(name),oldLeague(name,real.DB),"league: "+name);
  if(typeof name==="string")assert.equal(real.power(name),oldPower(name,g,real.DB),"power: "+name);
  else assert.throws(()=>real.power(name),TypeError);
 }
}
// Duplicate names must resolve to the first league in insertion order.
const fake="const DB={AAA:{teams:[{name:'同名',power:71}]},BBB:{teams:[{name:'同名',power:96}]}};";
const duplicate=Function(setup+fake+lookup+power+league+exportsCode)();
assert.equal(duplicate.power("同名"),71);assert.equal(duplicate.leagueFromClub("同名"),"AAA");
duplicate.DB.AAA.teams[0].power=73;
assert.equal(duplicate.power("同名"),73,"reference lookup must observe team power adjustments");
duplicate.setGame({clubRatings:{"同名":88}});assert.equal(duplicate.power("同名"),88);
assert.equal(duplicate.power("同名青训"),58,"youth uses parent's dynamic rating minus 30");
console.log("✓ 索引查找与原顺序扫描一致，覆盖所有球队、青训、未知、动态实力和重名优先级");
