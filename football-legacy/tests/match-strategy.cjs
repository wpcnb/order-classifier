const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');let source=fs.readFileSync(root+'/game.js','utf8');
source=source.replace(/\}\)\(\);\s*$/,`window.__test={allocateAvailable,playEvent,coachMatch,get:()=>g,set:x=>g=x,prepare:()=>{drawnClubs.wang="北京国安";drawnClubs.vini="山东泰山";buildDuoGame()}};})();`);
const nodes={};const node=id=>nodes[id]||(nodes[id]={innerHTML:'',classList:{add(){},remove(){}},addEventListener(){},click(){}});
const math=Object.create(Math);math.random=()=>.5;
const context={window:{},document:{getElementById:node},localStorage:{getItem(){return null},setItem(){}},confirm:()=>true,Math:math,console,setTimeout,clearTimeout};
vm.runInNewContext(fs.readFileSync(root+'/uefa2026.js','utf8'),context);vm.runInNewContext(fs.readFileSync(root+'/advice.js','utf8'),context);vm.runInNewContext(source,context);
const t=context.window.__test;
let vals={a:100,b:99,c:95};assert.equal(t.allocateAvailable(8,vals,['a','b','c'],100),2);assert.deepStrictEqual(vals,{a:100,b:100,c:100});
vals={a:100,b:100};assert.equal(t.allocateAvailable(3,vals,['a','b'],100),3);assert.deepStrictEqual(vals,{a:100,b:100});
// Use the public click handlers to obtain a fully initialized career state.
let handlers={};const nodes2={};const n2=id=>nodes2[id]||(nodes2[id]={innerHTML:'',classList:{add(){},remove(){}},addEventListener(k,fn){handlers[id+':'+k]=fn},click(){}});
context.document.getElementById=n2;vm.runInNewContext(source,context);const api=context.window.__test;api.prepare();const base=JSON.parse(JSON.stringify(api.get()));
function run(kind,home,choice,random,injured=false){let g=JSON.parse(JSON.stringify(base));g.player.injuryMatches=injured?2:0;g.player.suspension=0;g.player.stamina=100;g.player.coachTrust=100;g.player.club='曼联';g.mode=kind;g.coach={club:'曼联',formation:'4-3-3',skills:{tactics:45,motivation:45},signings:[],record:{w:0,d:0,l:0},board:70,budget:0,reputation:50,points:0,name:'测试'};api.set(g);math.random=()=>random;const e={kind:'friendly',home:home?'曼联':'阿森纳',away:home?'阿森纳':'曼联',date:'2026-11-20'};if(kind==='player')api.playEvent(e,choice,true);else api.coachMatch(e,choice,true);const m=g.lastMatch;return home?[m.hs,m.as]:[m.as,m.hs]}
for(const mode of ['player','coach'])for(const home of [true,false]){let extraOwn=0,extraOpp=0;for(let i=1;i<100;i++){const p=i/100,a=run(mode,home,'attack',p),b=run(mode,home,'balanced',p);assert(a[0]>=b[0]&&a[1]>=b[1],`${mode} ${home?'home':'away'} attack should raise both teams' scoring`);extraOwn+=a[0]-b[0];extraOpp+=a[1]-b[1]}assert(extraOwn>0&&extraOpp>0,`${mode} attack must create opportunity and risk`)}
for(const mode of ['player','coach'])for(const home of [true,false]){let reduction=0;for(let i=1;i<100;i++){const p=i/100,d=run(mode,home,'defend',p),b=run(mode,home,'balanced',p);assert(d[0]<=b[0]&&d[1]<=b[1],`${mode} ${home?'home':'away'} defence should reduce both goal totals`);reduction+=b[1]-d[1]}assert(reduction>0,`${mode} defence must reduce opponent scoring`)}
for(const home of [true,false])for(let i=1;i<100;i++){let p=i/100;assert.deepStrictEqual(run('player',home,'attack',p,true),run('player',home,'balanced',p,true),'injured player must not influence game via strategy')}
console.log('✓ Capped points retained and applied to available skills');console.log('✓ Attack raises both opportunity and opponent scoring risk for player and coach');console.log('✓ Defence reduces scoring pace and opponent goals at home and away');console.log('✓ An injured player’s chosen strategy does not change the score');
