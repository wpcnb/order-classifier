"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const dir=process.argv[2]||".";
const files=fs.readdirSync(dir);
function load(file,marker){
 const source=fs.readFileSync(path.join(dir,file),"utf8");
 const line=source.split(/\r?\n/).find(s=>s.includes(marker));
 if(!line)throw Error("Missing "+marker+" in "+file);
 return JSON.parse(line.slice(line.indexOf(marker)+marker.length).trim());
}
const auditFile=files.find(f=>f==="audit-100000.log");
assert(auditFile,"Missing main 100000-scenario test report");
const audit=load(auditFile,"AUDIT_100K_JSON=");
const careerFiles=files.filter(f=>/^diversified-career-\d+\.log$/.test(f));
assert.equal(careerFiles.length,12,"Expected 12 distinct career scenario logs");
const careers=careerFiles.map(f=>load(f,"STRESS_DIVERSIFIED_JSON="));
const counts=Object.fromEntries(careers.map(x=>[x.shard,x]));
assert.equal(Object.keys(counts).length,12);
const sum=path=>careers.reduce((a,x)=>a+(path.split(".").reduce((o,k)=>o?.[k],x)||0),0);
const count=(field)=>careers.reduce((a,x)=>a+Object.values(x[field]||{}).filter(n=>typeof n==="number").reduce((z,n)=>z+n,0),0);
const total={auditedScenarios:audit.cases,scenarioGroups:audit.groups,
 completeDualCareers:sum("completedRuns"),sharedSeasons:sum("completedSeasons"),playerSeasons:sum("playerSeasons"),
 gameExceptions:careers.flatMap(c=>c.exceptions||[]),integrity:{},drawErrors:sum("draws.unexpected"),
 missingDraws:sum("draws.missingOptions"),skips:sum("moves.skips"),promotions:sum("moves.up"),
 relegations:sum("moves.down"),sameTierMoves:sum("moves.same"),
 ratingsAverage:sum("ratings.sum")/sum("playerSeasons"),goalsAverage:sum("goals.sum")/sum("playerSeasons"),
 awards:{wang:sum("awards.wang"),vini:sum("awards.vini"),other:sum("awards.other")},
 maxStorageBytes:Math.max(...careers.map(c=>c.storage.max)),
 casesByHorizon: Object.fromEntries([5,10,15].map(y=>[y,careers.filter(x=>x.years===y).reduce((a,x)=>a+x.completedRuns,0)])),
 cards:{yellow:audit.discipline.yellow,directRed:audit.discipline.directRed,secondYellow:audit.discipline.secondYellow},
 luckyRate:audit.promotion.luckyRate,failures:audit.failures
};
for(const x of careers)for(const [key,val]of Object.entries(x.integrity))total.integrity[key]=(total.integrity[key]||0)+val;
console.log("DIVERSIFIED_AGGREGATE_JSON="+JSON.stringify(total));
assert.equal(audit.cases,100000,"100000 scenario cases not all completed");
assert.equal(audit.failures.length,0,"Scenario failures present");
assert.equal(total.completeDualCareers,300,"300 real careers not all completed");
assert.equal(total.sharedSeasons,3000,"Unexpected total careers and seasons");
assert.equal(total.playerSeasons,6000);
assert.equal(total.drawErrors,0,"Ten-card structure broken");
assert.equal(total.missingDraws,0,"Eligible draw missing");
assert.equal(total.gameExceptions.length,0,"Career exceptions");
assert(Object.values(total.integrity).every(x=>x===0),"Career integrity violation: "+JSON.stringify(total.integrity));
console.log("PASS: 100000 varied scenarios + 300 complete dual careers (3000 seasons, 6000 player-seasons)");
