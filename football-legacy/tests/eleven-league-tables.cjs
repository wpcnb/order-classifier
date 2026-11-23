"use strict";
const assert=require("node:assert/strict");
const core=require("../china-eleven-career");
const clubs=require("../eleven-clubs");
const leagues=require("../eleven-leagues");

const seed=20261123;
const start=core.create(seed,[],{together:false});
const world=core.simulate(start,19);
assert(core.isValid(world));
let draws=0,matches=0;
for(const groups of Object.values(world.leagueSchedules)){
  for(const [name,record] of Object.entries(groups)){
    const played=new Set(), table=new Map(record.teams.map(c=>[c,{points:0,for:0,against:0}]));
    assert.equal(record.teams.length,12);
    assert(record.teams.every(c=>clubs.leagueTeams(name).includes(c)));
    for(const [day,pairs] of leagues.rounds.entries()){
      assert.equal(new Set(pairs.flat()).size,12);
      for(const [i,[h,a]] of pairs.entries()){
        const home=record.teams[h],away=record.teams[a],score=record.scores[day][i];
        assert.notEqual(home,away);
        played.add([home,away].join("|"));
        const [x,y]=score;
        table.get(home).points+=x===y?1:x>y?3:0;
        table.get(away).points+=x===y?1:y>x?3:0;
        table.get(home).for+=x;table.get(home).against+=y;
        table.get(away).for+=y;table.get(away).against+=x;
        matches++;
      }
      const rows=leagues.standings(record,day+1);
      assert.equal(rows.length,12);
      for(const row of rows){
        assert.equal(row.wins+row.draws+row.losses,day+1);
        const expected=table.get(row.club);
        assert.equal(row.points,expected.points);
        assert.equal(row.for,expected.for);
        assert.equal(row.against,expected.against);
      }
    }
    assert.equal(played.size,132);
    draws++;
  }
}
const year=core.step(start);
const group=Object.keys(year.leagueSchedules[2027])[0];
function rejects(change){
  const corrupt=structuredClone(year);
  change(corrupt.leagueSchedules[2027][group],corrupt);
  assert.equal(core.isValid(corrupt),false);
}
rejects(r=>r.teams[1]=r.teams[0]);
rejects(r=>r.teams[1]="错级俱乐部");
rejects(r=>r.scores.pop());
rejects(r=>r.scores[0].pop());
rejects(r=>r.scores[0][0]=[7,0]);
rejects(r=>r.scores[0][0]=[(r.scores[0][0][0]+1)%7,r.scores[0][0][1]]);
rejects((r,g)=>delete g.leagueSchedules[2027][group]);
const ties={teams:year.leagueSchedules[2027][group].teams,scores:leagues.rounds.map(pairs=>pairs.map(()=>[0,0]))};
assert.deepEqual(leagues.standings(ties).map(r=>r.club),ties.teams);
// With equal points and goal difference, winning 2–1 beats winning 1–0.
const [scoreA,scoreB,scoreC]=[[1,0],[2,1],[3,0]];
ties.scores[0].splice(0,3,scoreA,scoreB,scoreC);
const firstDay=leagues.standings(ties,1).slice(0,3);
assert.deepEqual(firstDay.map(r=>r.for),[3,2,1]);
const old=core.simulate(start,11);
delete old.leagueSchedules;
const original=JSON.parse(JSON.stringify(old));
const continued=core.simulate(original,8);
assert.equal(continued.age,35);
assert(core.isValid(continued));
assert.equal(Object.keys(continued.leagueSchedules).length,8);
assert.deepEqual(continued.leagueSchedules[2045],world.leagueSchedules[2045]);
assert.deepEqual(continued.players,world.players);
assert.deepEqual(continued.fixtures,world.fixtures);
assert.deepEqual(continued.awardHistory,world.awardHistory);
console.log("PASS seeded full league draws, table by matchday, corrupt results and legacy reload",{seed,draws,matches});
