(function (root) {
  "use strict";

  const labels = { pace: "速度", shoot: "射门", pass: "传球", dribble: "盘带", defense: "防守", physical: "身体", mental: "意识" };
  const weights = {
    LW: [.25, .22, .13, .23, .02, .05, .10], RW: [.25, .22, .13, .23, .02, .05, .10],
    ST: [.12, .40, .08, .18, .02, .10, .10], CAM: [.12, .16, .28, .20, .04, .04, .16],
    CM: [.11, .11, .30, .14, .10, .10, .14], CDM: [.09, .05, .24, .07, .29, .12, .14],
    CB: [.10, .01, .11, .03, .43, .20, .12], GK: [.06, .02, .10, .04, .48, .20, .10]
  };
  const escape = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const number = value => typeof value === "number" && Number.isFinite(value) ? value : null;

  // Returns an HTML fragment. Inputs are read only and all dynamic text is escaped.
  function renderAdvice(player, nextEvent, season) {
    if (!player) return "";
    const p = player;
    const stamina = number(p.stamina), injury = number(p.injuryMatches), suspension = number(p.suspension);
    const potential = number(p.potential);
    const details = [];
    let recommendation;

    if (injury > 0) details.push("伤停剩余 " + injury + " 场");
    if (suspension > 0) details.push("停赛剩余 " + suspension + " 场");
    if (stamina !== null) details.push("当前体能 " + stamina);

    if (season && season.stage && season.stage !== "playing") {
      recommendation = "本赛季已结束，进入下一赛季后再安排训练。";
    } else if (p.trainingUsed) {
      recommendation = "本场赛前训练或恢复已安排，可先处理下一项赛程。";
    } else if (injury > 0) {
      recommendation = "当前有伤停，建议优先恢复体能，待伤停结束后再进行专项训练。";
    } else if (stamina !== null && stamina < 64) {
      recommendation = "体能偏低，建议先休息恢复；低体能会影响出场机会并增加受伤风险。";
    } else {
      const keys = Object.keys(labels), w = weights[p.position] || weights.CM;
      const candidates = keys.map((key, index) => ({ key, value: number(p.stats && p.stats[key]), weight: w[index] }))
        .filter(item => item.value !== null && potential !== null && item.value < potential)
        .sort((a, b) => b.weight * (potential - b.value) - a.weight * (potential - a.value));
      recommendation = candidates.length
        ? "建议优先训练「" + labels[candidates[0].key] + "」（当前 " + candidates[0].value + "）。该项根据位置权重和距潜力上限的空间选择。"
        : "暂无可推荐的专项训练；可查看能力和潜力后安排恢复。";
    }

    let fixture = "当前没有待进行的赛程。";
    if (nextEvent) {
      const home = nextEvent.home || "待定", away = nextEvent.away || "待定";
      const parts = [nextEvent.date, nextEvent.competition, nextEvent.stage].filter(Boolean);
      fixture = (parts.length ? parts.join(" · ") + "：" : "下一场：") + home + " 对阵 " + away;
    }
    const availability = injury > 0 || suspension > 0
      ? "当前球员无法出场，请留意伤停或停赛剩余场次。"
      : "比赛选择请结合位置与体能；建议仅供参考，不保证比赛结果。";

    return '<section class="card gap" aria-label="赛前与训练建议"><div class="cap">MATCH PREPARATION</div><h2>赛前与训练建议</h2>' +
      '<p>' + escape(fixture) + '</p>' +
      (details.length ? '<p class="muted small">' + escape(details.join(" · ")) + '</p>' : '') +
      '<div class="item"><strong>训练建议</strong><p>' + escape(recommendation) + '</p></div>' +
      '<p class="muted small">' + escape(availability) + '</p>' +
      '<button class="button" type="button" data-page="training">查看训练中心</button></section>';
  }

  root.FootballAdvice = Object.freeze({ render: renderAdvice });
})(typeof globalThis !== "undefined" ? globalThis : window);
