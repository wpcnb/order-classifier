/* Shared academy intake. Roster facts are distinct from the formation assigned by the coach. */
(function (root) {
  "use strict";
  const systems = {
    中国: ["上海海港", "山东泰山", "浙江职业"], 英格兰: ["曼城", "阿森纳", "利物浦"],
    西班牙: ["巴塞罗那", "皇家马德里", "皇家社会"], 法国: ["里昂", "雷恩", "摩纳哥", "巴黎圣日耳曼"],
    葡萄牙: ["本菲卡", "葡萄牙体育", "波尔图"], 德国: ["拜仁慕尼黑"]
  };
  const formation = ["GK", "RB", "CB", "CB", "LB", "CDM", "CM", "CM", "LW", "RW", "ST"];
  const labels = {GK:"门将", RB:"右后卫", CB:"中卫", LB:"左后卫", CDM:"后腰", CM:"中场", LW:"左翼", RW:"右翼", ST:"中锋"};
  const groups = ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"];
  function catalog(china, european, starters, clubPlayers=[]) {
    const chinaRoles = {门将:"GK", 后卫:"DF", 中场:"MF", 前锋:"FW"};
    const national=[...china.players.map(p => {
      const slot = starters.findIndex(row => row[0] === p.name);
      return {...p, country:"中国", role:chinaRoles[p.role], matchRole:slot < 0 ? null : groups[slot],
        url:china.sources[p.group === "u17" ? "fifa" : "cfa"][1],
        selection:p.group === "u17" ? "U17 世界杯" : "国家队集训"};
    }), ...european];
    const profiles=new Map(national.map(p=>[p.name,p]));
    for(const clubPlayer of clubPlayers){
      const old=profiles.get(clubPlayer.name);
      // Keep registered public facts from the FIFA roster, while supplying
      // current 2026/27 club, game youth ratings and club-team selection.
      profiles.set(clubPlayer.name,old?{
        ...old,team:clubPlayer.team,club:clubPlayer.club,
        role:clubPlayer.role,matchRole:clubPlayer.role,number:clubPlayer.number,
        position:clubPlayer.position,squadStatus:clubPlayer.squadStatus,
        initialRating:clubPlayer.initialRating,potential:clubPlayer.potential,
        clubSource:clubPlayer.url,sourceNote:clubPlayer.sourceNote
      }:clubPlayer);
    }
    return [...profiles.values()];
  }
  function eligible(person, slot) {
    return person.role === groups[slot] || person.matchRole === groups[slot];
  }
  function select(people, country, picks, seed) {
    const reserved = new Set(picks.filter(Boolean));
    if (picks.length !== 11 || reserved.size !== picks.filter(Boolean).length) throw Error("请为每个位置指定不同的球员");
    let state = seed >>> 0;
    return formation.map((position, slot) => {
      let person;
      if (picks[slot]) person = people.find(p => p.name === picks[slot] && eligible(p, slot));
      else {
        const pool = people.filter(p => eligible(p, slot) && !reserved.has(p.name));
        const local = pool.filter(p => p.country === country);
        const choices = local.length ? local : pool;
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        person = choices[Math.floor(state / 4294967296 * choices.length)];
      }
      if (!person) throw Error("该位置缺少可用球员，请调整阵容");
      reserved.add(person.name);
      return person;
    });
  }
  root.AcademySquad = {systems, formation, labels, catalog, eligible, select};
})(typeof window !== "undefined" ? window : globalThis);
