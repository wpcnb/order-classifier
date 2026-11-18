const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Roles=require("../role-v3.js");
const Transfers=require("../transfer-v3.js");
const BASE=path.join(__dirname,"..");
const gate={apps:19,avg:6.94,ov:74,g:6,a:5,sum:11};
const p=(position,extra={})=>({name:"虚拟球员",club:"成都蓉城",position,age:24,stamina:50,
  injuryMatches:0,stats:{defense:81,physical:80,mental:82,pass:82,dribble:77},...extra});
function season(position,goalAgainst=1){
 const player=p(position);
 return Array.from({length:29},()=>({played:true,kind:"league",rating:6.75,
  roleActions:Roles.simulateMatch(player,{minutesPlayed:90,goalsAgainst:goalAgainst,opponentPower:77,teamPower:72},()=>.40)}));
}
test("门将与后场模拟数据具有有效范围且扑救与射正守恒",()=>{
 const m=Roles.simulateMatch(p("GK"),{minutesPlayed:90,goalsAgainst:2,opponentPower:80,teamPower:72},()=>.40);
 assert(m.shotsOnTarget>=2);
 assert.equal(m.saves+2,m.shotsOnTarget);
 assert(m.duelsWon<=m.duels);
 assert(m.tacklesWon<=m.tackles);
 assert(m.passesCompleted<=m.passesAttempted);
 assert.equal(m.source,"game-simulation");
});
test("中后场和门将零进球零助攻可凭本职行为升档",()=>{
 for(const position of ["GK","CB","LB","RB","CDM","CM"]){
  const data=Roles.summarize(season(position));
  const result=Roles.evaluate(p(position),{apps:29,avg:6.75,goals:0,assists:0,
   cleanSheets:8,matchesWithScore:29,goalsAgainst:29,role:data},gate,83,1);
  assert(result.qualified,position+" must qualify without goals");
 }
});
test("前腰凭创造机会升档，不需要进球",()=>{
 const role=Roles.summarize(season("CAM"));
 assert(Roles.evaluate(p("CAM"),{apps:29,avg:6.75,goals:0,assists:0,role},gate,83,1).qualified);
});
test("旧档不伪造扑救和抢断，仍可利用已存储评分和零封评估",()=>{
 const n={apps:29,avg:7.12,goals:0,assists:0,cleanSheets:10,matchesWithScore:29,goalsAgainst:29};
 assert(Roles.evaluate(p("GK"),n,gate,83,1).qualified);
 assert.equal(Roles.summarize([{played:true,kind:"league"}]).recorded,0);
});
test("轻松模式七年以上留队会获得同级流动机会",()=>{
 const player=p("GK");
 const game={year:2037,history:[{year:2028,age:18}],season:{stage:"review"},player};
 const plan=Transfers.decision(game,{rolePerformance:.7},{mode:"guided",candidateCount:12});
 assert.equal(plan.type,"lateral");
 assert(Transfers.choose(game,[{club:"俱乐部A",power:75},{club:"俱乐部B",power:80}]));
});
test("连续模拟二十个赛季，不会永远停留在一支球队",()=>{
 let player=p("CB"),moves=0;const clubs=Array.from({length:6},(_,i)=>({club:"球队"+i,power:72+i}));
 for(let year=2029;year<2049;year++){
  const history=[{year:2028,age:18}];
  const game={year,history,season:{stage:"review"},player};
  player.age=19+(year-2029);if(player.age>=39)break;
  const plan=Transfers.decision(game,{rolePerformance:1},{mode:"guided",candidateCount:5});
  if(plan.type==="lateral"){
   const selected=Transfers.choose(game,clubs.filter(c=>c.club!==player.club));
   player.transferHistory=player.transferHistory||[];
   player.transferHistory.push({year,from:player.club,to:selected.club});
   player.club=selected.club;moves++;
  }
 }
 assert(moves>=2,"the auto career should have more than one transfer over 20 seasons");
});
test("手动模式、拒绝或已翻卡不会被自动改写",()=>{
 const game={year:2035,history:[{year:2028,age:18}],season:{stage:"review"},player:p("GK")};
 assert.equal(Transfers.decision(game,{}, {mode:"deep",candidateCount:8}).type,"stay");
 game.player.transferDraw={declined:true};
 assert.equal(Transfers.decision(game,{}, {mode:"guided",candidateCount:8}).type,"stay");
 game.player.transferDraw={accepted:true,selected:{club:"A"}};
 assert.equal(Transfers.decision(game,{}, {mode:"guided",candidateCount:8}).type,"draw");
});
test("主游戏赛季边界已接入自动流转，手动存档版本仍兼容",()=>{
 const source=fs.readFileSync(path.join(BASE,"game.js"),"utf8");
 const html=fs.readFileSync(path.join(BASE,"index.html"),"utf8");
 assert(source.includes("guidedTransferDecisions();if(missingPromotionDraws().length)"));
 assert(source.includes("const roleActions=played&&RV3?RV3.simulateMatch"));
 assert(source.includes("bodyContests,roleActions};s.results.push(eventResult)"));
 assert(html.indexOf("transfer-v3.js")>=0&&html.indexOf("transfer-v3.js")<html.indexOf("game.js?v=3.3.0"));
 assert(source.includes("return {version:2,compact:1"));
});
