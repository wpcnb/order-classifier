/* Each club follows its own league results, in settlement order. */
(function (root) {
  "use strict";
  const winsRequired = 3;
  const recoveryWindow = 3;

  function progress(results, club) {
    let phase = "climb";
    let wins = 0;
    let remaining = 0;
    let completedOn = "";
    for (const match of results || []) {
      if (match.kind !== "league" || (match.home !== club && match.away !== club)) continue;
      if (!Number.isInteger(match.hs) || !Number.isInteger(match.as)) continue;
      const margin = (match.hs - match.as) * (match.home === club ? 1 : -1);
      if (phase === "climb") {
        wins = margin > 0 ? wins + 1 : 0;
        if (wins === winsRequired) phase = "peak";
      } else if (phase === "peak") {
        if (margin < 0) {
          phase = "recover";
          remaining = recoveryWindow;
        }
      } else if (margin > 0) {
        phase = "complete";
        completedOn = match.date || "";
        break;
      } else if (--remaining === 0) {
        phase = "climb";
        wins = 0;
      }
    }
    return {phase, wins, remaining, completedOn};
  }

  root.DragonChallenge = {progress, winsRequired, recoveryWindow};
})(typeof window === "undefined" ? module.exports : window);
