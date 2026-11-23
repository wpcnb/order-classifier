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
// A corrupted season must not pass validation and crash the career history table.
for(const corrupt of [null,{}, { ...year.players[0].seasons[0],apps:-1 },
  { ...year.players[0].seasons[0],year:9999 }]){
 const bad=structuredClone(year);
 bad.players[0].seasons[0]=corrupt;
 assert.equal(engine.isValid(bad),false,"reject malformed season: "+JSON.stringify(corrupt));
 assert.throws(()=>engine.step(bad),/无效的11人职业生涯存档/);
}
console.log("PASS malformed season records rejected before UI rendering");
// Player-facing lifetime rankings must be derived entirely from the existing save.
const ranking=require("../eleven-rankings.js");
const early=ranking.rank(initial);
assert.equal(early.length,11);
assert.deepEqual(early.map(row=>row.rank),Array.from({length:11},(_,i)=>i+1));
assert(early.every(row=>row.topFiveYears===0&&row.ballonYears.length===0));
const lifetime=ranking.rank(final);
assert.equal(lifetime.length,11);
assert(lifetime.every(row=>Number.isFinite(row.points)&&row.peak>0));
assert.deepEqual(lifetime,ranking.rank(JSON.parse(JSON.stringify(final))));
assert.deepEqual(lifetime,ranking.rank(final),"read-only rankings must be deterministic");
assert(lifetime.some(row=>row.topFiveYears>0),"elite leagues reflected in lifetime rank");
const promoted=structuredClone(final);
promoted.awardHistory={...promoted.awardHistory,2035:{
  "金球奖":{id:11,name:promoted.players[10].name,points:100},
  "世界足球先生":{id:11,name:promoted.players[10].name,points:100}
}};
const playerInFinal=ranking.rank(final).find(row=>row.id===11);
const playerPromoted=ranking.rank(promoted).find(row=>row.id===11);
assert(playerPromoted.ballonYears.includes(2035));
assert(playerPromoted.worldYears.includes(2035));
assert.equal(playerPromoted.points-playerInFinal.points,
  (final.awardHistory?.[2035]?.["金球奖"]?.id===11?0:2000)+
  (final.awardHistory?.[2035]?.["世界足球先生"]?.id===11?0:1100));
assert.equal(ranking.eliteSeason({tier:"domestic",league:"英超"}),true);
assert.equal(ranking.eliteSeason({tier:"top",league:"德甲"}),true);
assert.equal(ranking.eliteSeason({tier:"youth",league:"青训联赛"}),false);
assert.equal(final.players.length,11);
assert(read("china-eleven-ui.js").includes("leaderboard()+teamMatches(p)"));
console.log("PASS eleven-player league and Ballon career rankings, stable seed and read-only save integrity");

const invalid={...initial,players:initial.players.slice(1)};
assert(!engine.isValid(invalid));
assert.equal(initial.players[0].rating,57);
for(const file of ["index.html","play.html"]){
 const html=read(file);
 const assets=Array.from(html.matchAll(/<script src="\.\/([^?"]+)/g),m=>m[1]);
 assert.deepEqual(assets,["china-rosters.js","world-cup-squads.js","club-squads.js","academy-squad.js","eleven-fixtures.js","eleven-internationals.js","china-eleven-career.js","eleven-rankings.js","china-eleven-ui.js"]);
 assert(html.includes('id="eleven-app"')&&!html.includes('id="app"'));
}
assert(!read("china-eleven-ui.js").includes("?classic"));
assert(read("academy.html").includes("url=./play.html"));
const vm=require("node:vm"),ctx={window:{}};
for(const file of ["china-rosters.js","world-cup-squads.js","club-squads.js","academy-squad.js"])
 vm.runInNewContext(read(file),ctx,{filename:file});
const {ChinaAcademyData,WorldCupSquads,ClubSquadData,AcademySquad}=ctx.window;
const profiles=AcademySquad.catalog(ChinaAcademyData,WorldCupSquads,engine.BASE);
assert.equal(profiles.length,151);
assert.equal(new Set(profiles.map(p=>p.name)).size,151);

const fourClubs=["皇家马德里","巴塞罗那","拜仁慕尼黑","巴黎圣日耳曼"];
assert.equal(ClubSquadData.players.length,101,"official squads represented with 11 starters and benches");
assert(ClubSquadData.players.every(p=>/^\d{4}-\d{2}-\d{2}$/.test(p.born)),
  "all 101 club candidates must have sourced birth dates");
assert(ClubSquadData.players.every(p=>Number.isInteger(p.number)&&p.number>0),
  "all club members have sourced shirt numbers");
const fullCatalog=AcademySquad.catalog(ChinaAcademyData,WorldCupSquads,engine.BASE,ClubSquadData.players);
assert.equal(fullCatalog.length,new Set([...profiles,...ClubSquadData.players].map(p=>p.name)).size);
assert.equal(new Set(fullCatalog.map(p=>p.name)).size,fullCatalog.length);
const countriesForClub={"皇家马德里":"西班牙","巴塞罗那":"西班牙","拜仁慕尼黑":"德国","巴黎圣日耳曼":"法国"};
for(const team of fourClubs){
 const card=ClubSquadData.clubs[team];
 assert(card&&card.starterNames.length===11&&card.benchNames.length>=10,team+" starters and bench");
 const picks=card.starterNames.slice();
 const picked=AcademySquad.select(fullCatalog,countriesForClub[team],picks,4321);
 assert(picked.every((p,i)=>p.name===picks[i]&&AcademySquad.eligible(p,i)));
 assert(picked.every(p=>p.team===team),"featured XI must all come from the chosen club");
 const initialClub=engine.create(4321,[],{country:countriesForClub[team],team,together:false,players:picked});
 assert(engine.isValid(initialClub));
 assert(initialClub.players.every((p,i)=>p.number===picked[i].number),"club kit numbers must not leak from China squad slots");
 assert(initialClub.players.every(p=>Number.isInteger(p.youthHeightEstimate)&&Number.isInteger(p.youthWeightEstimate)
   &&p.initialRating>=35&&p.potential>=p.initialRating),
   "all four club squads have clearly simulated age-16 physical and skill attributes");
 const ending=engine.simulate(initialClub,19);
 assert(engine.isValid(ending)&&ending.age===35,"club presets complete reproducible 19-year careers");
 assert.deepEqual(ending,engine.simulate(initialClub,19),"fixed seed and club roster must reproduce");
 const keeper=ClubSquadData.players.find(p=>p.team===team&&p.squadStatus==="bench"&&p.position==="GK");
 assert(keeper,team+" keeper substitute must exist");
 const withBench=picks.slice();withBench[0]=keeper.name;
 assert.equal(AcademySquad.select(fullCatalog,countriesForClub[team],withBench,4321)[0].name,keeper.name);
}
assert(AcademySquad.systems.德国.includes("拜仁慕尼黑"));
assert(AcademySquad.systems.法国.includes("巴黎圣日耳曼"));
assert(read("china-eleven-ui.js").includes("Object.keys(clubSquads.clubs).map(team=>"),
  "all club players must be visible in every academy's positional picker");
console.log("PASS 101 official club squad members, four starting XIs, bench swaps, simulated 16-year profiles and long-career saves");

for(const country of Object.keys(AcademySquad.systems)){
 const picks=Array(11).fill("");
 picks[0]="李昊";picks[10]="姆巴佩";
 const players=AcademySquad.select(profiles,country,picks,111);
 assert.equal(players[0].name,"李昊");assert.equal(players[10].country,"法国");
 assert.equal(new Set(players.map(p=>p.name)).size,11);
 assert(players.every((p,i)=>AcademySquad.eligible(p,i)));
 const options={country,team:AcademySquad.systems[country][0],players};
 const world=engine.simulate(engine.create(111,[],options),19);
 assert.equal(world.age,35);assert(engine.isValid(world));
 for(const [year,matches] of Object.entries(world.fixtures)){
  assert.equal(matches.length,22);
  for(const p of world.players){
   const s=p.seasons.find(row=>row.year===Number(year));
   const apps=matches.filter(m=>m.lineups.flat().includes(p.id)).length;
   assert.equal(s.apps,apps);
   assert.equal(s.goals,matches.flatMap(m=>m.goals).filter(event=>event[1]===p.id).length);
   assert.equal(s.assists,matches.flatMap(m=>m.goals).filter(event=>event[2]===p.id).length);
   assert.equal(s.club,world.players[0].seasons[s.age-17].club);
  }
  assert.equal(world.players.filter(p=>p.seasons[Number(year)-2027].squadAward).length,1);
  assert(matches.every(m=>m.goals.every(([side,a,b])=>a===null||b===null||a!==b)));
 }
 assert.equal(Object.keys(world.awardHistory).length,18);
 for(const [year,votes] of Object.entries(world.awardHistory)){
  for(const name of ["金球奖","世界足球先生"]){
   const w=votes[name];assert(Number.isFinite(w.points));
   if(w.id!==null)assert(world.players[w.id-1].seasons[Number(year)-2027].apps>=10);
  }
 }
 assert.deepEqual(engine.step(JSON.parse(JSON.stringify(world))),world);
 const separate=engine.simulate(engine.create(111,[],{...options,together:false}),10);
 assert(new Set(separate.players.map(p=>p.club)).size>1);
 assert(engine.isValid(separate));
}
// Manchester City intake should not silently lock a career to one club.
const manCitySetup={country:"英格兰",team:"曼城",together:true};
const manCityStay=engine.simulate(engine.create(4321,[],manCitySetup),8);
assert(manCityStay.players.every(p=>p.club==="曼城"));
const previousSeasons=manCityStay.players.map(p=>structuredClone(p.seasons));
const manCityReleased={...manCityStay,squad:{...manCityStay.squad,together:false}};
assert(engine.isValid(manCityReleased),"switching career policy preserves save format");
const manCityCareer=engine.simulate(manCityReleased,3);
assert(manCityCareer.players.some(p=>p.club!=="曼城"),"released academy players can transfer");
manCityCareer.players.forEach((p,i)=>assert.deepEqual(p.seasons.slice(0,previousSeasons[i].length),previousSeasons[i],
  "switching transfer policy must never rewrite past seasons"));
const transferUi=read("china-eleven-ui.js");
assert(transferUi.includes('picks:Array(11).fill(""),together:false'),"new academy drafts default to transfers");
assert(transferUi.includes('data-eleven-action="allow-transfers"'),"existing stay-at-club saves can unlock transfers");
console.log("PASS Manchester City free transfers and safe release of existing locked careers");

const legacy=structuredClone(initial);
delete legacy.squad;
legacy.players.forEach(p=>{delete p.country;delete p.initialRating;});
assert(engine.isValid(legacy));assert(engine.isValid(engine.step(legacy)));
console.log("PASS five-country formation, shared score sheets, appearances, awards, transfers and old saves");

// National appearances are sourced from shared fixtures. Club totals remain separate.
const windowRounds=[4,8,12,16,20];
const stages=new Set(),byId=Array(11).fill(0);
for(const [year,international] of Object.entries(final.nationalFixtures)){
 const age=Number(year)-final.startYear+16,seen=new Set();
 for(const match of international){
  assert(windowRounds.includes(match.round));
  stages.add(match.level);
  assert(match.level==="成年队"?age>=18:age<=Number(match.level.slice(1)));
  for(const [side,line] of match.lineups.entries())for(const id of line){
   const key=match.round+":"+id,player=final.players[id-1],s=player.seasons[age-17];
   assert(!seen.has(key));seen.add(key);
   assert.equal(side===0?match.home:match.away,player.country);
   assert(!(match.round>=s.injuryStart&&match.round<s.injuryStart+s.injuryGames));
   if(match.level==="成年队")byId[id-1]++;
  }
 }
}
assert.equal(stages.size,5);
assert.deepEqual(byId,final.players.map(p=>p.careerCaps));
for(const p of final.players)assert.equal(p.careerCaps,p.seasons.reduce((n,s)=>n+s.caps,0));
assert.deepEqual(engine.simulate(JSON.parse(JSON.stringify(engine.simulate(initial,8))),11),final);

// Reuse the original eleven-player format, including seasons with the old caps model.
const old=structuredClone(year);
delete old.nationalFixtures;
old.players[0].caps=old.players[0].careerCaps=old.players[0].seasons[0].caps=9;
const resumed=engine.step(old);
assert(engine.isValid(resumed));
assert.deepEqual(resumed.players[0].seasons[0],old.players[0].seasons[0]);
assert.equal(resumed.players[0].careerCaps,9+resumed.players[0].caps);
assert.deepEqual(Object.keys(resumed.nationalFixtures),[String(resumed.year)]);

const mixedPlayers=initial.players.map((p,i)=>({...p,country:i%2?"英格兰":"中国",height:180}));
const mixed=engine.simulate(engine.create(77,[],{players:mixedPlayers}),19);
assert(engine.isValid(mixed));
assert(Object.values(mixed.nationalFixtures).flat().some(m=>m.lineups.every(side=>side.length)));
const corrupt=structuredClone(year);
corrupt.nationalFixtures[year.year][0].level="成年队";
assert(!engine.isValid(corrupt),"underage appearance rejected before rendering/import");
console.log("PASS five international levels, cross-association fixtures, injury windows, cap totals and reload");
