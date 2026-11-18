const assert = require("node:assert/strict");
const {progress} = require("../dragon-challenge.js").DragonChallenge;
function season(form) {
  return Array.from(form, (result, index) => {
    const home = index % 2 === 0;
    const margin = {W: 1, L: -1, D: 0}[result];
    return {kind: "league", date: String(index + 1), home: home ? "A" : "B",
      away: home ? "B" : "A", hs: 1 + (home ? margin : -margin), as: 1};
  });
}
const state = form => progress(season(form), "A");
assert.equal(state("WWDWW").wins, 2);
assert.equal(state("WWWD").phase, "peak");
assert.equal(state("WWWL").remaining, 3);
assert.equal(state("WWWLDL").remaining, 1);
assert.equal(state("WWWLDLWD").completedOn, "7");
assert.equal(state("WWWLDDLW").wins, 1);
assert.equal(state("WWWLDDLWWWLW").phase, "complete");
const matches = season("WWWLW");
assert.equal(progress(matches, "B").phase, "climb");
assert.equal(progress(matches, "C").wins, 0);
matches.splice(1, 0, {...matches[3], kind: "cup"}, {...matches[3], hs: null});
assert.deepEqual(progress(JSON.parse(JSON.stringify(matches)), "A"), state("WWWLW"));
assert.equal(state("").phase, "climb");
console.log("Dragon challenge progression, expiry, club perspective and save replay passed.");
