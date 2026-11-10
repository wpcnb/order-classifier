"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const core=fs.readFileSync(path.join(root,"game.js"),"utf8");
const official=fs.readFileSync(path.join(root,"uefa2026.js"),"utf8");
const advice=fs.readFileSync(path.join(root,"advice.js"),"utf8");
const roster=fs.readFileSync(path.join(root,"real-footballers.js"),"utf8");
const SAVE_KEY="football-dynasty-v4-independent-20261101",BACKUP_KEY=SAVE_KEY+"-safety";
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function game(custom=null,prior=null){
 const cache={},handlers={},storage=new Map();let confirmed=true;if(prior!==null)storage.set(SAVE_KEY,prior);
 const node=id=>cache[id]||(cache[id]={innerHTML:"",classList:{add(){},remove(){}},addEventListener(k,fn){handlers[id+":"+k]=fn},click(){}});
 const document={getElementById:node,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const window={};const localStorage={getItem(key){return storage.get(key)??null},setItem(key,v){storage.set(key,String(v))},removeItem(key){storage.delete(key)}};
 const context={window,document,localStorage,confirm:()=>confirmed,FormData:class{constructor(){return custom||new Map()}},setTimeout,clearTimeout,Blob,URL,console};
 vm.runInNewContext(roster,context,{timeout:2000,filename:"real-footballers.js"});
 vm.runInNewContext(official,context,{timeout:2000,filename:"uefa2026.js"});
 vm.runInNewContext(advice,context,{timeout:2000,filename:"advice.js"});
 vm.runInNewContext(core,context,{timeout:2000,filename:"game.js"});
 return {click(action,extras={}){const cb=handlers["app:click"];assert(cb);cb({target:{closest:()=>({disabled:false,dataset:{action,...extras}})}})},submit(){handlers["app:submit"]({target:{id:"customForm"},preventDefault(){}})},page(p){handlers["app:click"]({target:{closest:()=>({disabled:false,dataset:{page:p}})}})},setConfirm(value){confirmed=value},storage,get state(){return JSON.parse(storage.get(SAVE_KEY))},get save(){return storage.get(SAVE_KEY)},get toast(){return node("toast").textContent},get html(){return node("app").innerHTML},selfTest:window.__footballDynastySelfTest}
}
function message(m){console.log("✓ "+m)}
const scripts=["real-footballers.js","uefa2026.js","advice.js","game.js"];
for(const name of scripts)assert(new RegExp('src="\\./'+name.replace(".","\\.")+'(?:\\?[^\\"]+)?" defer').test(html),name+" must load deferred");
for(let i=1;i<scripts.length;i++)assert(html.indexOf('src="./'+scripts[i-1])<html.indexOf('src="./'+scripts[i]),"dependency order");
assert(html.includes("./assets/stadium.svg"));assert(fs.existsSync(path.join(root,"assets","stadium.svg")));
message("HTML resources and self-hosted stadium art");
const x=game(),built=x.selfTest();assert(built.every(([name,v])=>v),JSON.stringify(built));
message("Full double-round-robin structure and unit tests");
x.click("preset");
let s=x.state;
assert.equal(s.player.age,22);assert.equal(s.player.country,"中国");assert.equal(s.player.position,"LW");assert.equal(s.player.club,"曼联");assert.equal(s.player.number,9);
assert.equal(s.season.leaguePlayed,9);assert.equal(s.season.leagueTable["曼联"].points,7);assert.equal(s.season.uefa.played,3);assert.equal(s.season.uefa.verifiedHistory,true);
assert.equal(s.season.uefa.drawRounds.flat().filter(m=>m.real).length,54);
assert(Object.values(s.season.uefa.table).every(t=>t.p===3));
const counters={};for(const round of s.season.uefa.drawRounds){assert.equal(round.length,18);for(const m of round){for(const [who,enemy,kind]of [[m.home,m.away,"home"],[m.away,m.home,"away"]]){counters[who]??={home:0,away:0,opponents:new Set()};counters[who][kind]++;assert(!counters[who].opponents.has(enemy),"Repeated UEFA opponent "+who+" vs "+enemy);counters[who].opponents.add(enemy)}}}assert.equal(Object.keys(counters).length,36);for(const c of Object.values(counters)){assert.equal(c.home,4);assert.equal(c.away,4);assert.equal(c.opponents.size,8)}
message("Official 144 UEFA matches and 54 locked results, eight unique rivals, four home/four away");
x.click("nextMatch");assert(x.html.includes("增加失球风险")&&x.html.includes("己方进球也更难"),"explain tactical tradeoffs");x.click("play",{choice:"attack"});assert(x.state.lastMatch);x.page("report");const display=x.html;assert(display.includes("赛后状态")&&!display.includes("控球率")&&!display.includes("预期进球")&&!display.includes("比赛事件"),"only recorded match data should be shown");x.page("dashboard");x.page("report");assert.equal(x.html,display,"Report display must be deterministic");
message("Manual match choices and persistent post-match report");
// Backup occupies a separate key and is not overwritten as the career advances.
const b=game();b.click("preset");b.page("save");assert(b.html.includes("创建保险备份"));
b.click("restoreBackup");assert.match(b.toast,/还没有保险备份/);
const snapshot=b.save;b.click("backup");assert.equal(b.storage.get(BACKUP_KEY),snapshot);assert.equal(b.save,snapshot);
b.click("simThree");const advanced=b.save;assert.notEqual(advanced,snapshot);assert.equal(b.storage.get(BACKUP_KEY),snapshot);
b.setConfirm(false);b.click("restoreBackup");assert.equal(b.save,advanced,"cancelled restore keeps progress");
b.setConfirm(true);b.click("restoreBackup");assert.equal(b.save,snapshot,"restore replaces active career");
const backupReload=game(null,b.save);assert.equal(backupReload.state.season.completed,JSON.parse(snapshot).season.completed);
b.storage.set(BACKUP_KEY,"not-json");b.click("restoreBackup");assert.equal(b.save,snapshot);assert.match(b.toast,/备份无法读取/);
message("Separate backup creation, advancing, cancellation, restore, reload and corrupt-backup handling");
x.click("simSeason");s=x.state;assert.equal(s.season.stage,"review");
assert.equal(s.season.leaguePlayed,38);assert(Object.values(s.season.leagueTable).every(t=>t.p===38));
assert(Object.values(s.season.uefa.table).every(t=>t.p===8));
assert(Object.values(s.season.world).every(l=>l.played===l.total&&Object.values(l.table).every(t=>t.p===l.total)));
assert.equal(s.ballonHistory.length,1);assert.equal(s.ballonHistory[0].ballots.length,100);assert.equal(s.ballonHistory[0].totalPoints,6700);
assert.equal(s.ballonHistory[0].rankings.length,30);
assert(s.ballonHistory[0].rankings.every(n=>n.id==="USER"||n.realPerson));
assert(s.ballonHistory[0].rankings.every(n=>n.points<=1500));
assert(s.ballonHistory[0].winner?.name);
x.page("awards");assert(!x.html.includes("\u6a21\u62df"));
assert(x.html.includes("凯恩1055分"));
message("France Football format: real-person 30, 100 ballots, 1500 cap, honest nomination and 2026 factual history");

assert.equal(s.worldHistory.length,1);assert(s.npcs.length>1000);
message("Whole-season simulation, nine league worlds, complete UEFA, 100 ballots and 6,700 points");
let count=0;for(let i=0;i<11;i++){x.click("nextSeason");x.click("simSeason");s=x.state;assert.equal(s.season.stage,"review");assert.equal(s.ballonHistory.at(-1).rankings.length,30);assert(s.ballonHistory.at(-1).rankings.every(n=>n.id==="USER"||n.realPerson));count++}
assert(s.player.age>=32);assert.equal(s.history.length,12);
message("Twelve sequential career seasons and save stability");
x.click("startCoach");s=x.state;assert.equal(s.mode,"coach");assert(s.coach);
x.click("coachScout");s=x.state;assert.equal(s.coach.prospects.length,6);
x.click("coachSign",{i:"0"});s=x.state;assert.equal(s.coach.signings.length,1);
x.click("simSeason");s=x.state;assert.equal(s.season.stage,"review");assert.equal(s.coach.seasons,1);
x.click("coachChild");s=x.state;assert.equal(s.generation,2);assert.equal(s.mode,"player");assert(s.player.youth);assert(s.player.parentCoach&&s.player.parentCoach.name);
x.click("simSeason");s=x.state;assert.equal(s.season.stage,"review");x.click("nextSeason");s=x.state;assert.equal(s.player.youth,false);assert(!s.player.club.endsWith("青训"));
message("Coach tactics, scouting and transfers; father-coached second generation promoted from youth");
const reload=game(null,x.save);assert.equal(reload.state.generation,2);assert.equal(reload.state.player.club,s.player.club);assert.equal(reload.state.player.parentCoach.name,s.player.parentCoach.name);
message("Saved v4 dynastic game survives browser reload");
for(let j=0;j<17;j++){x.click("simSeason");x.click("nextSeason")}
let thirdStart=x.state;assert(thirdStart.player.age>=32);
x.click("retireCoach");thirdStart=x.state;assert.equal(thirdStart.generation,3);assert.equal(thirdStart.player.name,"陆白·3世");assert.equal(thirdStart.player.parentCoach.name,"陆白·2世");
for(let j=0;j<17;j++){x.click("simSeason");x.click("nextSeason")}
x.click("retireCoach");let fourth=x.state;assert.equal(fourth.generation,4);assert.equal(fourth.player.name,"陆白·4世");assert.equal(fourth.ancestors.length,3);
assert(x.save.length<4_500_000,"Four-generation save exceeded browser storage budget");
message("Four consecutive generations across more than 40 years with stable family names and save size");
const map=new Map([["name","林澈"],["country","英格兰"],["position","RW"],["leagueId","GER"],["club","多特蒙德青训"]]);
const y=game(map);y.submit();let c=y.state;assert.equal(c.player.country,"英格兰");assert.equal(c.player.leagueId,"GER");assert.equal(c.player.club,"多特蒙德青训");
y.click("simSeason");c=y.state;assert.equal(c.season.leaguePlayed,34);assert(Object.values(c.season.leagueTable).every(t=>t.p===34));y.click("nextSeason");c=y.state;assert.equal(c.player.club,"多特蒙德");assert.equal(c.player.youth,false);
message("Nationality and academy selection, German 34-match youth league, no backward youth transfers");
console.log("\nAll Football Dynasty v4 tests passed.");
