"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const engine=require("../china-eleven-career.js");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const expected=[
"李昊","杨希","刘浩帆","韩鹏飞","刘洋","徐彬",
"王上源","杨明洋","王钰栋","林良铭","拜合拉木·阿卜杜外力"
];
const initial=engine.create(20261122,[
 {group:"senior",name:"李昊",born:"2004-03-06",height:187,weight:77}
]);
assert(engine.isValid(initial));
assert.equal(initial.players.length,11);
assert.deepEqual(initial.players.map(p=>p.name),expected);
assert(initial.players.every(p=>p.age===16&&p.seasons.length===0));
assert.equal(initial.players[0].adultHeight,187);
assert.equal(initial.players[0].born,"2004-03-06");
assert(initial.players.every(p=>!p.academyVerified),"Unverified origin must never be presented as documented historical fact");
assert(initial.players.every(p=>p.attributes.length===5));
console.log("PASS real starting eleven identities and 16-year starting positions");
const year=engine.step(initial);
assert(engine.isValid(year));
assert.equal(initial.age,16,"simulation must not mutate old state");
assert.equal(year.age,17);
assert(year.players.every(p=>p.seasons.length===1&&p.age===17));
const final=engine.simulate(initial,100);
assert(engine.isValid(final));
assert.equal(final.age,35);
assert.equal(final.players.length,11);
assert(final.players.every(p=>p.seasons.length===19&&p.seasons[0].age===17));
assert(final.players.every(p=>p.rating>=40&&p.rating<=105));
assert(final.players.every(p=>p.seasons.every(y=>y.apps>=0&&y.goals>=0&&y.assists>=0)));
assert.equal(engine.step(final),final,"no accidental extra season after max age");
console.log("PASS all 11 advance together from 16 to 35 without losing careers");
for(let i=0;i<40;i++){
 const seed=20261122+i;
 const a=engine.simulate(engine.create(seed),19);
 const b=engine.simulate(engine.create(seed),19);
 assert.deepEqual(a,b,"same seed must be reproducible: "+seed);
 assert(engine.isValid(a));
 assert.equal(a.players.length,11);
}
assert.notDeepEqual(engine.simulate(engine.create(1),10),engine.simulate(engine.create(2),10));
console.log("PASS 40 different seeds, deterministic histories and valid save layout");
const invalid={...initial,players:initial.players.slice(1)};
assert(!engine.isValid(invalid));
assert.equal(initial.players[0].rating,57);
const home=read("index.html"),play=read("play.html"),script=read("china-eleven-ui.js");
for(const html of [home,play]){
 assert(html.includes('id="eleven-app"'));
 assert(html.includes('class="eleven-active"'));
 assert(html.includes('china-eleven-career.js'));
 assert(html.includes('china-eleven-ui.js'));
 assert(!html.includes('href="./academy.html">中国青训队</a>'));
 assert(html.indexOf("china-rosters.js?v=")<html.indexOf("china-eleven-career.js?v="));
 assert(html.indexOf("china-eleven-career.js?v=")<html.indexOf("china-eleven-ui.js?v="));
 assert(html.includes('id="app"'),"legacy game must still be available via compatibility link");
}
assert(script.includes('?classic=1'));
assert(script.includes("football-legacy-china-eleven-career-v1"));
assert(!script.includes('localStorage.removeItem("football-dynasty-duo-v2-20261110")'));
console.log("PASS homepage eleven starter, legacy-save compatibility and script order");
console.log("PASS green legend eleven starting lineup and parallel career simulation");