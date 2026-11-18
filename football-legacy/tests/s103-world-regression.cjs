#!/usr/bin/env node
/*
 * 在已构建的 S1.03 游戏目录运行：node s103-world-regression.cjs
 * 本脚本使用实际 game.js 并注入可检查的测试接口，不修改游戏源文件。
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,"..");
function harness(loaded=null){
 const handlers={},nodes={},timers=[],storage=new Map(loaded||[]);
 const node=id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(event,fn){handlers[id+':'+event]=fn},click(){}});
 const document={getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
 const window={};const math=Object.create(Math);math.random=Math.random;
 const context={window,document,Math:math,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},console,confirm:()=>true,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},URL,Blob};
 const scripts=['real-footballers.js','uefa2026.js','shared-uefa.js','advice.js','body-path.js','market-v3.js','career-depth.js','role-v3.js','transfer-v3.js','free-star.js','v10-core.js','v10-ui.js','legend-v1.js','legend-v3.js','legacy-awards.js','shared-domestic-cups.js'];
 for(const file of scripts){const content=fs.readFileSync(path.join(root,file),'utf8');vm.runInNewContext(content,context,{filename:file,timeout:10000})}
 let source=fs.readFileSync(path.join(root,'game.js'),'utf8');
 assert.match(source,/function domesticCupPlan\(/,'游戏内未集成共享国内杯赛');
 source=source.replace(/\}\)\(\);\s*$/,'window.__S103_TEST={get:()=>g,duo:()=>duoGames,setG:(id)=>{activeDuo=id;g=duoGames[id]},setSync:(v)=>syncSeasonChange=v,makeSchedule,linkSharedWorld,playEvent,save,shared:()=>sharedUniverse,db:DB,nextSeason,overall,automaticPrep};})();');
 vm.runInNewContext(source,context,{filename:'game.js',timeout:15000});
 return {api:window.__S103_TEST,math,storage,click(action,extra={}){const fn=handlers['app:click'];assert(fn,'游戏未注册界面事件');fn({target:{closest:()=>({disabled:false,dataset:{action,...extra}})}})},flush(){let n=0;while(timers.length&&n++<200)timers.shift()()},html(){return node('app').innerHTML}};
}
function start(){const h=harness();h.click('flipOpeningCard',{id:'wang',i:0});h.flush();h.click('flipOpeningCard',{id:'vini',i:0});h.flush();h.click('preset');assert(h.api.duo(),'开档失败');return h}
function setupCup(h){
 const d=h.api.duo(),clubs=['利物浦','阿森纳'];
 for(const [i,id]of ['wang','vini'].entries()){
  const x=d[id],p=x.player;p.age=25;p.youth=false;p.club=clubs[i];p.leagueId='ENG';p.academyParentClub=clubs[i];x.year=2030;
  x.season=h.api.makeSchedule(p,2030,10);
  const ev=x.season.events.find(e=>e.kind==='cup'&&e.stage==='第三轮');assert(ev);
  x.season.events=[ev];x.season.index=0;x.season.completed=0;x.season.stage='playing';
 }
 h.api.linkSharedWorld();return d;
}
function testCupDirectOpponents(){
 const h=start(),d=setupCup(h);const DC=require(path.join(root,'shared-domestic-cups.js'));
 const clubs=h.api.db.ENG.teams.map(t=>t.name);
 const cup=DC.create(2030,'ENG','足总杯',clubs,()=>.5);
 // 改成两个受控球队直接交手，确保本轮只生成一场比赛和一个胜者。
 const all=cup.rounds[0].flatMap(f=>[f.home,f.away]),a=all.indexOf('利物浦'),b=all.indexOf('阿森纳');
 [all[0],all[a]]=[all[a],all[0]];
 // 原 b 索引可能在第一次交换后变动，按名称重新定位。
 const c=all.indexOf('阿森纳');[all[1],all[c]]=[all[c],all[1]];
 for(let i=0;i<cup.rounds[0].length;i++){cup.rounds[0][i].home=all[i*2];cup.rounds[0][i].away=all[i*2+1]}
 DC.audit(cup);h.api.shared().domesticCups={'2030:ENG':cup};
 h.math.random=()=>.00001; // 两名主角均被直接红牌罚下，检验赛前共享决策路径。
 for(const id of ['wang','vini']){h.api.setG(id);h.api.playEvent(d[id].season.events[0],'balanced',true)}
 const first=d.wang.season.results[0],second=d.vini.season.results[0],ledger=h.api.shared().domesticCups['2030:ENG'];
 assert.equal(first.home,second.home);assert.equal(first.away,second.away);assert.equal(first.hs,second.hs);assert.equal(first.as,second.as);
 assert.equal(first.redCard,'direct');assert.equal(second.redCard,'direct');
 assert.equal(first.redScoreEffect,true);assert.equal(second.redScoreEffect,true);
 assert.equal([first.cupWin,second.cupWin].filter(Boolean).length,1,'一场淘汰赛只能有一队晋级');
 DC.finish(ledger,()=>[1,0]);assert.equal(DC.audit(ledger),true);
 assert(ledger.champion);assert.equal(ledger.rounds[5].length,1);
 console.log('PASS 双主角足总杯同场：统一比分、双方红牌赛前计入、只有一个胜者、最终冠军唯一');
}
function testSeparateLeagueRed(){
 const h=start(),d=h.api.duo(),clubs=['利物浦','阿森纳'];
 for(const [i,id]of ['wang','vini'].entries()){
  const x=d[id],p=x.player;
  p.age=25;p.youth=false;p.club=clubs[i];p.leagueId='ENG';p.academyParentClub=clubs[i];x.year=2030;
  x.season=h.api.makeSchedule(p,2030,10);x.season.stage='playing';
 }
 const w=d.wang,v=d.vini;
 const a=w.season.events.filter(x=>x.kind==='league');
 const b=v.season.events.filter(x=>x.kind==='league');
 const candidates=a.filter(ev=>{const other=b.find(x=>x.round===ev.round);return other&&!(ev.home===other.home&&ev.away===other.away)});
 assert(candidates.length,'没有可用的同轮不同场联赛赛程');
 const first=candidates[0],second=b.find(x=>x.round===first.round);
 for(const [id,ev]of [['wang',first],['vini',second]]){
  const s=d[id].season;s.events=[ev];s.index=0;s.completed=0;s.stage='playing';
 }
 h.api.linkSharedWorld();h.math.random=()=>.00001;
 h.api.setG('wang');h.api.playEvent(first,'balanced',true);
 assert.equal(d.wang.season.results[0].redCard,'direct');
 const ledger=h.api.shared().rounds['2030:ENG'];assert(ledger);
 const own=ledger.rounds[first.round].find(x=>x.home===first.home&&x.away===first.away);
 const peer=ledger.rounds[first.round].find(x=>x.home===second.home&&x.away===second.away);
 assert(own?.redScoreEffect,'第一名球员红牌应影响共享比分');
 assert(peer?.redScoreEffect,'第二名球员的红牌必须在同轮其他比赛比分锁定前计入');
 // Save and load between player matches: the second player must not receive a new card.
 assert(h.api.save(),'保存共享比赛中途状态失败');
 const saved=JSON.parse(h.storage.get('football-dynasty-duo-v2-20261110'));
 const reload=harness([['football-dynasty-duo-v2-20261110',JSON.stringify(saved)]]);
 reload.math.random=()=>.999999;
 const restored=reload.api.duo().vini;
 reload.api.setG('vini');reload.api.playEvent(restored.season.events[restored.season.index],'balanced',true);
 const result=restored.season.results.at(-1);
 assert.equal(result.redCard,'direct','读档后不允许重新抽成其他牌');
 assert(result.redScoreEffect,'读档后仍必须保持红牌的共享比分效应');
 assert.equal(result.hs,peer.hs);assert.equal(result.as,peer.as);
 console.log('PASS 同轮不同场红牌：整轮预生成、两场统一锁比分、跨存档复用红牌');
}
function testRetirement(){
 const h=start(),duo=h.api.duo();
 for(const id of ['wang','vini']){const x=duo[id];x.player.age=39;x.player.youth=false;x.player.club=x.player.club.replace(/青训$/,'');x.season.stage='review'}
 h.api.setSync(true);for(const id of ['wang','vini']){h.api.setG(id);h.api.nextSeason()}
 assert(duo.wang.player.retired&&duo.vini.player.retired,'40岁应自动退役');
 console.log('PASS 两人40岁退役（不重新计算过往荣誉）');
}
try{testCupDirectOpponents();testSeparateLeagueRed();testRetirement()}catch(e){console.error('FAIL S1.03 完整引擎回归：',e?.stack||e);process.exitCode=1}