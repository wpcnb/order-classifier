"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
// This validates true double-career runs, not isolated lottery samples.
const years=Number(process.env.STRESS_YEARS||20),runs=Number(process.env.STRESS_RUNS||3);
assert([10,15,20,30].includes(years));assert(Number.isInteger(runs)&&runs>0);
const result=spawnSync(process.execPath,[path.join(__dirname,"stress-1000.cjs")],{
 env:{...process.env,STRESS_YEARS:String(years),STRESS_RUNS:String(runs),STRESS_SHARD:String(years)},
 encoding:"utf8",maxBuffer:40*1024*1024,timeout:25*60*1000});
if(result.stderr)process.stderr.write(result.stderr.slice(-2500));
const line=(result.stdout||"").split(/\r?\n/).find(x=>x.startsWith("STRESS_1000_JSON="));
if(result.status!==0||!line)throw Error("Horizon worker failed: "+String(result.error||result.stdout).slice(-1800));
const data=JSON.parse(line.slice("STRESS_1000_JSON=".length));
const faults=Object.entries(data.integrity||{}).filter(([,count])=>count!==0);
const compact={years,runs,completedRuns:data.completedRuns,completedSeasons:data.completedSeasons,
 playerSeasons:data.playerSeasons,retiredRuns:data.retiredRuns,automaticRetirements:data.automaticRetirements,exceptions:data.exceptions,integrityFailures:faults,
 unexpectedDraws:data.draws.unexpected,missingDraws:data.draws.missingOptions,
 luckyJumps:data.moves.skips,maxSaveBytes:data.storage.max,
 lastSeasonTiers:data.milestones.finalTiers,elapsedMillis:data.perf.millis};
console.log("LONG_HORIZON_AUDIT_JSON="+JSON.stringify(compact));
assert.equal(compact.completedRuns,runs);
// Both default players start aged 16 and finish their age-39 season. A
// 30-year request therefore ends after 24 played seasons, at age 40.
const playableYears=Math.min(years,24),expectRetirement=years>24;
assert.equal(compact.completedSeasons,runs*playableYears);
assert.equal(compact.playerSeasons,runs*playableYears*2);
assert.equal(compact.retiredRuns,expectRetirement?runs:0);
assert.equal(compact.automaticRetirements,expectRetirement?runs*2:0);
assert.equal(compact.exceptions.length,0);
assert.equal(faults.length,0);
assert.equal(compact.unexpectedDraws,0);
assert.equal(compact.missingDraws,0);
assert(compact.maxSaveBytes<5000000,"Browser save exceeds 5MB at "+years+" years");
console.log("PASS: "+runs+" shared dual-career saves across up to "+years+" years ("+playableYears+" played seasons each)");
