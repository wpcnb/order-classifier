/* 绿茵信仰 S1.01：关键比赛与独立生涯成就。兼容原双人存档，不接入金球奖公式。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.LegendV3 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const idsFor = world => world?.third ? ['wang', 'vini', 'third'] : ['wang', 'vini'];
  const ACHIEVEMENTS = Object.freeze({
    debut: ['职业首秀', 5], firstGoal: ['职业生涯首球', 5], apps100: ['百场里程碑', 10],
    apps500: ['五百场传奇', 30], goals100: ['百球射手', 30], goals300: ['三百球射手', 60],
    assists100: ['助攻大师', 30], leagueTitle: ['顶级联赛冠军', 25],
    uclFinal: ['首次闯入欧冠决赛', 25], uclTitle: ['欧洲之王', 60],
    worldFinal: ['首次闯入世界杯决赛', 50], worldTitle: ['世界冠军', 100],
    ballon: ['金球奖得主', 80], loyal: ['十年忠诚', 50],
    duoRival: ['命运交锋', 10], duoTeammate: ['并肩作战', 15],
    duoTitle: ['共同冠军', 40], duoUcl: ['双人成王', 70], retire40: ['传奇谢幕', 70]
  });
  const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const finals = stage => typeof stage === 'string' && (stage === '决赛' || /(?:世界杯|欧冠|欧洲冠军联赛)决赛$/.test(stage));
  const nextEvent = x => x && x.season && x.season.stage === 'playing' && x.season.events && x.season.events[x.season.index];
  const participants = (world, date) => idsFor(world).map(id => ({ id, game: world[id], event: nextEvent(world[id]) }))
    .filter(item => item.event && item.event.date === date);
  function criticalDay(world, date) {
    if (!world || !date || !world.wang || !world.vini) return null;
    const entries = participants(world, date);
    const reasons = [];
    if (entries.some(({ event }) => finals(event.stage) && event.kind === 'europeKO')) reasons.push('欧洲赛事决赛');
    if (entries.some(({ event }) => finals(event.stage) && event.kind === 'national')) reasons.push('国家队赛事决赛');
    if (entries.some(({ event }) => finals(event.stage) && event.kind === 'cup')) reasons.push('国内杯赛决赛');
    for (const [i, a] of entries.entries()) for (const b of entries.slice(i+1)) {
      const pa = a.game.player, pb = b.game.player;
      const same = a.event.kind === b.event.kind && a.event.home === b.event.home &&
        a.event.away === b.event.away && !!a.event.home && !!a.event.away;
      if (same && pa.club !== pb.club &&
          [a.event.home, a.event.away].includes(pa.club) &&
          [a.event.home, a.event.away].includes(pb.club)) reasons.push('双人正面交锋');
      if (same && a.event.kind === 'national' && pa.country !== pb.country &&
          [a.event.home, a.event.away].includes(pa.country) &&
          [a.event.home, a.event.away].includes(pb.country)) reasons.push('双人国家队交锋');
    }
    if (entries.some(({ event, game }) => {
      if (event.kind !== 'league' || !game.season.leagueRounds || !game.season.leagueTable) return false;
      const rounds = game.season.leagueRounds.length;
      if (num(event.round) < rounds - 1) return false;
      const table = Object.values(game.season.leagueTable).sort((a, b) => num(b.points) - num(a.points));
      const me = table.findIndex(t => t.name === game.player.club);
      return me >= 0 && me < 2 && num(table[0].points) - num(table[me].points) <= 6;
    })) reasons.push('联赛争冠关键战');
    return reasons.length ? { date, reasons: Array.from(new Set(reasons)) } : null;
  }
  function state(player) {
    if (!player.legendV3 || typeof player.legendV3 !== 'object')
      player.legendV3 = { achievements: [], regrets: [], penalties: [] };
    const value = player.legendV3;
    for (const key of ['achievements', 'regrets', 'penalties'])
      if (!Array.isArray(value[key])) value[key] = [];
    return value;
  }
  function award(player, id, year) {
    const value = state(player), def = ACHIEVEMENTS[id];
    if (!def || value.achievements.some(v => v.id === id)) return false;
    value.achievements.push({ id, name: def[0], points: def[1], year });
    return true;
  }
  function regret(player, id, title, year) {
    const value = state(player);
    if (value.regrets.some(v => v.id === id)) return;
    value.regrets.push({ id, title, year, points: 0 });
    value.regrets = value.regrets.slice(-36);
  }
  function penalty(player, id, title, year, points) {
    const value = state(player);
    if (value.penalties.some(v => v.id === id) || points >= 0) return;
    value.penalties.push({ id, title, year, points });
    value.penalties = value.penalties.slice(-40);
  }
  function matchWinner(match, game, shared) {
    if (match.kind === 'cup' && typeof match.cupWin === 'boolean')
      return match.cupWin ? game.player.club : (match.home === game.player.club ? match.away : match.home);
    if (match.kind === 'europeKO') {
      const record = shared && shared.europeFinals && shared.europeFinals[String(game.year) + ':' + (game.season.uefa && game.season.uefa.type)];
      if (record && record.winner) return record.winner;
    }
    if (num(match.hs) > num(match.as)) return match.home;
    if (num(match.as) > num(match.hs)) return match.away;
    return null; // 点球决胜未知时不臆造胜者。
  }
  function isWorldCup(match) {
    return match.kind === 'national' && /世界杯/.test(String(match.competition || ''));
  }
  function sync(world, shared, fixtures) {
    if (!world || !world.wang || !world.vini) return;
    for (const id of idsFor(world)) {
      const game = world[id], p = game.player, career = p.career || {}, year = game.year;
      state(p);
      if (num(career.apps) > 0) award(p, 'debut', year);
      if (num(career.goals) > 0) award(p, 'firstGoal', year);
      if (num(career.apps) >= 100) award(p, 'apps100', year);
      if (num(career.apps) >= 500) award(p, 'apps500', year);
      if (num(career.goals) >= 100) award(p, 'goals100', year);
      if (num(career.goals) >= 300) award(p, 'goals300', year);
      if (num(career.assists) >= 100) award(p, 'assists100', year);
      const honors = (game.honors || []).filter(h => !h.legacyDisputed);
      if (honors.some(h => h.type === 'team' && /冠军$/.test(h.name) && !/欧冠|欧联|杯赛|足协杯/.test(h.name))) award(p, 'leagueTitle', year);
      if (honors.some(h => h.type === 'team' && h.name === '欧冠冠军')) award(p, 'uclTitle', year);
      if (honors.some(h => h.type === 'national' && /世界杯.*冠军/.test(h.name))) award(p, 'worldTitle', year);
      if ((game.ballonHistory || []).some(h => h.rank === 1)) award(p, 'ballon', year);
      const byClub = {};
      for (const h of game.history || []) if (h.club && !h.manager && h.age >= 18) byClub[h.club] = (byClub[h.club] || 0) + 1;
      if (Object.values(byClub).some(count => count >= 10)) award(p, 'loyal', year);
      if (p.retired && num(p.retiredAt && p.retiredAt.age) >= 40 && num(career.apps) >= 700) award(p, 'retire40', year);
      for (const m of (game.season && game.season.results) || []) {
        if (!finals(m.stage) || !Number.isFinite(m.hs) || !Number.isFinite(m.as)) continue;
        if (m.kind === 'europeKO' && (game.season.uefa && game.season.uefa.type) === '欧冠') {
          award(p, 'uclFinal', year);
          const winner = matchWinner(m, game, shared);
          if (winner && winner !== p.club) regret(p, 'ucl:' + year + ':' + m.date, '欧冠决赛惜败：' + m.home + ' ' + m.hs + ':' + m.as + ' ' + m.away, year);
        }
        if (isWorldCup(m)) {
          award(p, 'worldFinal', year);
          const winner = matchWinner(m, game, shared);
          if (winner && winner !== p.country) regret(p, 'world:' + year + ':' + m.date, '世界杯决赛遗憾：' + m.home + ' ' + m.hs + ':' + m.as + ' ' + m.away, year);
        }
      }
      // 只依据完整赛季明确的竞技低谷扣分；伤停、少出场、衰老或输决赛均不能触发。
      const perf = game.lastReview && game.lastReview.performance;
      const season = game.season || {};
      if (season.stage === 'review' && perf && perf.poor && num(perf.poorStreak) >= 2 &&
          num(season.apps) >= 20 && num(game.lastReview.avg) < 6.5 && num(p.injuryMatches) === 0 && !p.retired) {
        penalty(p, 'poor:' + year, '连续两个健康赛季明显低于预期', year, -10);
      }
    }
    const ids = idsFor(world);
    for (const [index, id] of ids.entries()) for (const peer of ids.slice(index+1)) {
      const first = world[id], second = world[peer];
      const a = first.player, b = second.player;
      if (!a.retired && !b.retired && a.club && a.club === b.club && !a.youth && !b.youth) {
        award(a, 'duoTeammate', first.year); award(b, 'duoTeammate', second.year);
      }
      if ((fixtures || []).some(f => f.sideA !== f.sideB && (!f.players || (f.players.includes(id) && f.players.includes(peer))))) {
        award(a, 'duoRival', first.year); award(b, 'duoRival', second.year);
      }
      const ah = (first.honors || []).filter(h => !h.legacyDisputed);
      const bh = (second.honors || []).filter(h => !h.legacyDisputed);
      const joint = ah.filter(h => h.type === 'team' && /冠军$/.test(h.name) &&
        bh.some(k => k.type === 'team' && k.year === h.year && k.name === h.name && !k.legacyDisputed));
      if (joint.length) { award(a, 'duoTitle', first.year); award(b, 'duoTitle', second.year); }
      if (joint.some(h => h.name === '欧冠冠军')) { award(a, 'duoUcl', first.year); award(b, 'duoUcl', second.year); }
    }
  }
  // Milestone achievements are awarded once; subsequent titles must still
  // contribute to historical standing. All totals are derived from the save,
  // so older careers get credit without rewriting their match/trophy records.
  function recurringHonorPoints(game) {
    const honors = (game.honors || []).filter(h => !h.legacyDisputed);
    const unique = new Set();
    const counts = {world:0,ucl:0,league:0,cup:0,otherNational:0,best:0};
    for (const h of honors) {
      const key = String(h.year)+"|"+String(h.type)+"|"+String(h.name);
      if (unique.has(key)) continue;
      unique.add(key);
      const name=String(h.name||"");
      if(h.type==="national"&&/世界杯.*冠军/.test(name))counts.world++;
      else if(h.type==="national"&&/亚洲杯|欧洲杯|美洲杯/.test(name)&&/冠军/.test(name))counts.otherNational++;
      else if(h.type==="team"&&name==="欧冠冠军")counts.ucl++;
      else if(h.type==="team"&&/联赛.*冠军|英超冠军|西甲冠军|德甲冠军|意甲冠军|法甲冠军|中超冠军|荷甲冠军|葡超冠军|巴甲冠军/.test(name))counts.league++;
      else if(h.type==="team"&&/杯.*冠军|杯赛冠军/.test(name)&&!name.includes("欧冠"))counts.cup++;
      else if(h.type==="individual"&&/世界足球先生/.test(name))counts.best++;
    }
    const balls=new Set((game.ballonHistory||[]).filter(v=>v.rank===1).map(v=>String(v.year))).size;
    const milestoneIds=new Set(state(game.player).achievements.map(v=>v.id));
    // First World Cup/UCL/league/Ballon already has a milestone award.
    // Preserve that first-time value, score only repeat wins here.
    const points=
      Math.max(0,counts.world-(milestoneIds.has("worldTitle")?1:0))*85+
      Math.max(0,counts.ucl-(milestoneIds.has("uclTitle")?1:0))*55+
      Math.max(0,counts.league-(milestoneIds.has("leagueTitle")?1:0))*12+
      Math.max(0,balls-(milestoneIds.has("ballon")?1:0))*55+
      counts.best*35+counts.otherNational*30+counts.cup*8;
    return {points,counts,ballon:balls};
  }
  function score(game) {
    if (!game || !game.player) return { base: 0, bonus: 0, milestone: 0, repeat: 0, penalty: 0, total: 0 };
    const p = game.player, c = p.career || {}, values = state(p);
    const base = Math.round(num(c.apps) * .15 + num(c.goals) * 1.2 + num(c.assists) * .8);
    const milestone = values.achievements.reduce((s, a) => s + num(a.points), 0);
    const repeat = recurringHonorPoints(game).points;
    const bonus = milestone + repeat;
    const minus = values.penalties.reduce((s, a) => s + num(a.points), 0);
    return { base, bonus, milestone, repeat, penalty: minus, total: base + bonus + minus };
  }
  function replay(world, date) {
    const result = [];
    const seen = new Set();
    for (const id of idsFor(world)) {
      const game = world && world[id];
      for (const m of (game && game.season && game.season.results) || []) {
        if (m.date !== date || !Number.isFinite(m.hs) || !Number.isFinite(m.as)) continue;
        const key = [m.kind, m.date, m.home, m.away, m.hs, m.as].join(':');
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ competition: m.competition || m.kind, home: m.home, away: m.away, hs: m.hs, as: m.as });
      }
    }
    return result;
  }
  return Object.freeze({ ACHIEVEMENTS, criticalDay, sync, score, replay });
});