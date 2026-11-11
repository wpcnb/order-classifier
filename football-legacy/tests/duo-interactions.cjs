"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"game.js"),"utf8").replace(/\}\)\(\);\s*$/,'window.__story={duoSharedStory,duoSeasonComparison,duoLatestMatch};})();');
const nodes={};
const node=id=>nodes[id]||(nodes[id]={innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(){}});
const context={window:{},document:{getElementById:node,querySelector:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},confirm:()=>true,setTimeout:()=>0,clearTimeout(){},Blob,URL,console};
for(const file of ["real-footballers.js","uefa2026.js","shared-uefa.js","advice.js"])vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
vm.runInNewContext(source,context,{filename:"game.js"});
const {duoSharedStory,duoSeasonComparison,duoLatestMatch}=context.window.__story;
const fixture={kind:"league",competition:"英超",date:"2031-10-09",home:"阿森纳",away:"切尔西",hs:2,as:1,played:true,goals:1,assists:0};
const player=(name,club,match,stage="playing")=>({year:2031,generation:1,player:{name,club,retired:false},season:{stage,results:[{...match}],goals:12,assists:5},history:stage==="review"?[{year:2031,generation:1,club}]:[]});
{
 const a=player("王楚淇","阿森纳",fixture),b=player("维尼修斯","阿森纳",{...fixture,goals:0,assists:1});
 const text=duoSharedStory(a,b);
 assert.match(text,/双人同队/);assert.match(text,/阿森纳 2 : 1 切尔西/);
 assert.match(text,/王楚淇 1球 0助/);assert.match(text,/维尼修斯 0球 1助/);
 assert.doesNotMatch(text,/助攻了|互相助攻/,"simulated assists do not identify the scorer");
}
{
 const a=player("<王>","阿森纳",fixture),b=player("维尼修斯","切尔西",{...fixture,goals:1,assists:0});
 const text=duoSharedStory(a,b);assert.match(text,/双人交锋/);assert.match(text,/&lt;王&gt;/);assert.doesNotMatch(text,/<王>/);
}
{
 const a=player("甲","阿森纳",fixture),b=player("乙","切尔西",fixture);
 for(const replacement of [{date:"2031-10-10"},{hs:3},{kind:"national"},{played:false},{competition:"欧冠"},{stage:"决赛"}]){
  b.season.results=[{...fixture,...replacement}];assert.equal(duoSharedStory(a,b),"","different or unplayed fixtures cannot be claimed as shared");
 }
 b.season.results=[{...fixture,goals:undefined,assists:undefined}];assert.match(duoSharedStory(a,b),/乙 —球 —助/,"missing legacy data is not invented");
 b.year=2032;assert.equal(duoSharedStory(a,b),"");
}
{
 const a=player("甲","阿森纳",fixture,"review"),b=player("乙","切尔西",fixture,"review");
 a.player.club="切尔西";
 assert.match(duoSharedStory(a,b),/双人交锋/,"after transfer use the club recorded for the season");
 a.history=[];assert.equal(duoSharedStory(a,b),"","do not infer a historical team from the current team");
}
{
 const a=player("甲","阿森纳",fixture,"review"),b=player("乙","切尔西",fixture,"review");
 b.season.goals=17;b.season.assists=11;
 assert.match(duoSeasonComparison(a,b),/进球 甲 12 : 17 乙 · 助攻 5 : 11/);
 b.season.stage="playing";assert.equal(duoSeasonComparison(a,b),"");
 b.season.stage="review";b.player.retired=true;assert.equal(duoSeasonComparison(a,b),"");
}
{
 const international={...fixture,kind:"national",competition:"世界杯",home:"中国",away:"巴西"};
 const a=player("甲","阿森纳",international),b=player("乙","切尔西",international);
 a.player.country="中国";b.player.country="中国";
 assert.match(duoSharedStory(a,b),/国家队携手/);
 b.player.country="巴西";assert.match(duoSharedStory(a,b),/国家队交锋/);
 b.player.country="法国";assert.equal(duoSharedStory(a,b),"");
}
{
 const a=player("甲","阿森纳",{...fixture,yellowCards:1,redCard:"direct",redMinute:55,newInjury:4});
 a.season.events=[];a.season.index=0;
 assert.match(duoLatestMatch(a),/黄牌 1 张/);
 assert.match(duoLatestMatch(a),/红牌 · 第 55 分钟/);
 assert.match(duoLatestMatch(a),/受伤 · 预计缺阵 4 场/);
}
console.log("✓ 双人互动只使用真实共享比赛记录，旧档和转会不推造数据");
