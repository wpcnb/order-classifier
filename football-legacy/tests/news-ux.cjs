"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"tests/_fixtures/legacy-engine.txt"),"utf8").replace(/\}\)\(\);\s*$/,'window.__news={duoNewsFeed,duoDashboard,newsDateLabel,seed:(a,b,world)=>{duoGames={wang:a,vini:b};g=a;sharedUniverse=world||{awards:{}};}};})();');
const nodes={};
const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(){}});
let overviewCalls=0;
const context={window:{GreenLegend:{overview(){overviewCalls++;return '<section id="existing-growth">球员成长内容</section>'}}},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},confirm:()=>true,setTimeout:()=>0,clearTimeout(){},Blob,URL,console};
for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
vm.runInNewContext(source,context,{filename:"tests/_fixtures/legacy-engine.txt"});
const {duoNewsFeed,duoDashboard,newsDateLabel,seed}=context.window.__news;
const fixture={kind:"league",competition:"英超",date:"2031-10-09",home:"阿森纳",away:"切尔西",hs:2,as:1,played:true,goals:1,assists:0};
function player(name,club,match){return {year:2031,generation:1,player:{name,club,age:24,retired:false,youth:false,transferHistory:[]},season:{stage:"playing",results:[match],events:[],index:0,apps:1,goals:1,assists:0},history:[],honors:[],logs:[]}}
{
 const a=player("甲","阿森纳",{...fixture,redCard:"direct",newInjury:4});
 const b=player("乙","切尔西",{...fixture,goals:0,redCard:"direct"});
 a.player.transferHistory.push({year:2031,from:"布莱顿",to:"阿森纳"});
 seed(a,b,{awards:{2031:{winner:{name:"甲",points:300}}}});
 const html=duoNewsFeed();
 assert.match(html,/2031-10-09/);assert.match(html,/2031赛季/);
 assert.doesNotMatch(html,/2031-(13|14)/,"internal sort values must never appear as dates");
 assert.equal((html.match(/medical-scene/g)||[]).length,1,"only the real injury item uses the medical scene");
 assert.match(html,/预计缺阵 4 场/);assert.match(html,/年度金球奖/);
}
assert.equal(newsDateLabel("2031-02-31",2031),"2031赛季");
assert.equal(newsDateLabel("2032-02-29",2031),"2032-02-29");
{
 const a=player("甲","阿森纳",fixture),b=player("乙","切尔西",{...fixture});
 seed(a,b,{awards:{}});const html=duoDashboard();
 assert(html.indexOf("最近比赛")<html.indexOf("球员成长内容"),"recent matches should precede the optional details");
 assert.match(html,/<details class="card gap career-overview-details"><summary>查看球员成长与生涯详情<\/summary>/);
 assert.match(html,/id="existing-growth"/);assert.equal(overviewCalls,1,"original overview still runs exactly once");
}
console.log("✓ News dates use real dates or a season label; injury and growth views remain accurate and accessible");
