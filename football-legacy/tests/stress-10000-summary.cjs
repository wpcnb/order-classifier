"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const folder=process.argv[2]||".";
const files=fs.readdirSync(folder).filter(x=>/^audit-shard-\\d+\\.log$/.test(x));
const summaries=[];
for(const f of files){
 const match=fs.readFileSync(path.join(folder,f),"utf8").match(/^STRESS_10000_JSON=(.+)$/m);
 if(!match){console.error("Missing summary from",f);continue}
 summaries.push(JSON.parse(match[1]));
}
const sum=(items,key)=>items.reduce((a,v)=>a+(key.split(".").reduce((o,k)=>o?.[k],v)||0),0);
const group=(path)=>{const template={};for(const s of summaries){let o=path.split(".").reduce((o,k)=>o?.[k],s)||{};for(const [k,v]of Object.entries(o))if(typeof v==="number")template[k]=(template[k]||0)+v;}return template};
const exceptions=summaries.flatMap(x=>x.exceptions||[]);
const totals={
 expectedGames:10000,expectedSeasons:100000,expectedPlayerSeasons:200000,
 receivedShards:summaries.length,shards:[...summaries.map(x=>x.shard)].sort((a,b)=>a-b),
 games:sum(summaries,"completedRuns"),seasons:sum(summaries,"completedSeasons"),playerSeasons:sum(summaries,"playerSeasons"),
 exceptions:exceptions.slice(0,20),goals:group("goals"),assists:group("assists"),ratings:group("ratings"),apps:group("apps"),moves:group("moves"),draws:group("draws"),trophy:group("trophy"),trophyless:group("trophyless"),awards:group("awards"),integrity:group("integrity"),storage:group("storage"),discipline:group("discipline"),injuries:group("injuries"),
 byTier:Array.from({length:6},(_,i)=>summaries.reduce((a,s)=>a+(s.byTier[i]||0),0)),
 finalTiers:Array.from({length:6},(_,i)=>summaries.reduce((a,s)=>a+(s.milestones.finalTiers[i]||0),0)),
 maxGoals:Math.max(0,...summaries.map(x=>x.goals.max)),maxStorageBytes:Math.max(0,...summaries.map(x=>x.storage.max)),maxOverall:Math.max(0,...summaries.map(x=>x.ov.max))
};
totals.averageGoals=totals.playerSeasons?totals.goals.sum/totals.playerSeasons:null;
totals.averageAssists=totals.playerSeasons?totals.assists.sum/totals.playerSeasons:null;
totals.averageApps=totals.playerSeasons?totals.apps.sum/totals.playerSeasons:null;
totals.averageRatings=totals.playerSeasons?totals.ratings.sum/totals.playerSeasons:null;
totals.yellowPer100Appearances=totals.discipline.playedMatches?100*totals.discipline.yellow/totals.discipline.playedMatches:null;
totals.redPer100Appearances=totals.discipline.playedMatches?100*totals.discipline.totalRed/totals.discipline.playedMatches:null;
console.log("STRESS_10000_AGGREGATE_JSON="+JSON.stringify(totals));
const failures=Object.entries(totals.integrity).filter(([k,v])=>v>0);
if(summaries.length!==100||new Set(summaries.map(x=>x.shard)).size!==100||totals.games!==10000||totals.seasons!==100000||totals.playerSeasons!==200000||exceptions.length||failures.length||totals.discipline.invalidCards)process.exitCode=1;
