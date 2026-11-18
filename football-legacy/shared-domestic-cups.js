/* 绿茵信仰 S1.03 — shared domestic-cup engine.
 * A season/league cup has ONE 64-slot bracket (real league teams plus clearly
 * labelled fictional qualifiers), six rounds and at most one champion.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FootballDomesticCups = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const STAGES = ['第三轮', '第四轮', '第五轮', '八强', '半决赛', '决赛'];
  const assert = (yes, message) => { if (!yes) throw new Error(message); };
  const asScore = (value) => {
    const obj = Array.isArray(value) ? {hs: value[0], as: value[1]} : value;
    assert(obj && Number.isInteger(obj.hs) && obj.hs >= 0 && Number.isInteger(obj.as) && obj.as >= 0,
      '杯赛比分必须为非负整数');
    return obj;
  };
  function create(year, leagueId, cupName, teamNames, random = Math.random) {
    assert(Number.isInteger(year) && typeof leagueId === 'string' && leagueId, '无效杯赛年份或联赛');
    assert(Array.isArray(teamNames), '杯赛参赛队必须是数组');
    const teams = [...new Set(teamNames.map(String).filter(Boolean))];
    assert(teams.length >= 2 && teams.length <= 64, '杯赛必须有2至64支不重复球队');
    for (let n = 1; teams.length < 64; n++) {
      const extra = `${leagueId}·虚构地区资格队${String(n).padStart(2, '0')}`;
      if (!teams.includes(extra)) teams.push(extra);
    }
    // Fisher-Yates: random order is frozen in the save and never redrawn on load.
    for (let i = teams.length - 1; i > 0; i--) {
      const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
      [teams[i], teams[j]] = [teams[j], teams[i]];
    }
    const first = [];
    for (let i = 0; i < teams.length; i += 2) {
      first.push({id: `${year}:${leagueId}:0:${i / 2}`, home: teams[i], away: teams[i + 1], played: false});
    }
    return {model: 1, year, leagueId, name: cupName, stages: STAGES.slice(),
      rounds: [first], champion: null, finished: false};
  }
  function checkRound(cup, index) {
    assert(cup && Array.isArray(cup.rounds) && Number.isInteger(index) && index >= 0 && index < 6,
      '无效的共享杯赛轮次');
  }
  function record(cup, index, fixtureId, score, random = Math.random) {
    checkRound(cup, index);
    const fixture = cup.rounds[index]?.find(f => f.id === fixtureId);
    assert(fixture, '比赛不在共享杯赛赛程中');
    if (fixture.played) return {fixture, newlyRecorded: false};
    const {hs, as, penaltyWinner} = asScore(score);
    if (hs !== as && penaltyWinner != null) assert(penaltyWinner === (hs > as ? fixture.home : fixture.away), '胜者与比分不符');
    let winner = hs > as ? fixture.home : as > hs ? fixture.away : penaltyWinner;
    if (hs === as && winner == null) winner = random() < .5 ? fixture.home : fixture.away;
    assert(winner === fixture.home || winner === fixture.away, '冠军归属不能是未参赛的球队');
    if (hs !== as) assert(winner === (hs > as ? fixture.home : fixture.away), '胜者与比分不符');
    Object.assign(fixture, {hs, as, winner, played: true,
      penalties: hs === as, redScoreEffect: !!score?.redScoreEffect});
    if (index === 5) {
      assert(cup.champion == null || cup.champion === winner, '同届杯赛出现第二名冠军');
      cup.champion = winner; cup.finished = true;
    }
    return {fixture, newlyRecorded: true};
  }
  function completeRound(cup, index, simulation, random = Math.random) {
    checkRound(cup, index);
    const fixtures = cup.rounds[index];
    assert(Array.isArray(fixtures), '杯赛轮次尚未生成');
    for (const f of fixtures) if (!f.played) record(cup, index, f.id, simulation(f, index), random);
  }
  function prepareRound(cup, index, simulation, random = Math.random) {
    checkRound(cup, index);
    for (let round = 1; round <= index; round++) {
      if (cup.rounds[round]) continue;
      // Previous-round results must exist before pairings for the next round.
      completeRound(cup, round - 1, simulation, random);
      const previous = cup.rounds[round - 1];
      assert(previous.length % 2 === 0, '淘汰赛晋级球队数量无效');
      const next = [];
      for (let i = 0; i < previous.length; i += 2) {
        next.push({id: `${cup.year}:${cup.leagueId}:${round}:${i / 2}`,
          home: previous[i].winner, away: previous[i + 1].winner, played: false});
      }
      cup.rounds.push(next);
    }
    return cup.rounds[index];
  }
  function fixtureFor(cup, index, team, simulation, random = Math.random) {
    const fixtures = prepareRound(cup, index, simulation, random);
    return fixtures.find(f => f.home === team || f.away === team) || null;
  }
  function finish(cup, simulation, random = Math.random) {
    for (let round = 0; round < 6; round++) {
      prepareRound(cup, round, simulation, random);
      completeRound(cup, round, simulation, random);
    }
    assert(cup.finished && typeof cup.champion === 'string', '无法确定唯一国内杯赛冠军');
    return cup.champion;
  }
  function audit(cup) {
    assert(cup.rounds[0].length === 32, '首轮必须有32场比赛');
    for (let r = 0; r < cup.rounds.length; r++) {
      const matches = cup.rounds[r];
      assert(matches.length === 32 / (2 ** r), '淘汰赛场次错误');
      const present = matches.flatMap(m => [m.home, m.away]);
      assert(new Set(present).size === present.length, '同一轮出现重复参赛球队');
      for (const m of matches) if (m.played) {
        assert(m.winner === m.home || m.winner === m.away, '有非参赛队晋级');
      }
      if (r && cup.rounds[r - 1].every(m => m.played)) {
        const winners = cup.rounds[r - 1].map(m => m.winner);
        assert(present.every(t => winners.includes(t)), '后续对阵包含未晋级球队');
      }
    }
    if (cup.finished) {
      assert(cup.rounds[5]?.length === 1 && cup.rounds[5][0].winner === cup.champion,
        '冠军未来自唯一决赛结果');
    }
    return true;
  }
  return Object.freeze({STAGES, create, record, prepareRound, fixtureFor, completeRound, finish, audit});
});