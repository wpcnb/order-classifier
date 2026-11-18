/* 绿茵传奇 v3.3: 轻松模式的转会决策策略。
   只计算推荐，实际转会依旧通过原游戏 applyPlayerTransfer 写入。
   深度模式永远不自动转会，玩家已做的决定永远优先。 */
(function(root,factory){
 const api=factory();root.FootballTransferV3=api;
 if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis==="object"?globalThis:this,function(){
 "use strict";
 const num=x=>Number.isFinite(Number(x))?Number(x):0;
 function hash(input){
  let h=2166136261;for(const c of String(input)){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0;
 }
 function tenure(game){
  const p=game?.player||{},history=p.transferHistory||[];
  const last=history.length?num(history.at(-1).year):NaN;
  const start=(game?.history||[]).filter(h=>h.age>=18&&!h.manager).map(h=>num(h.year)).sort((a,b)=>a-b)[0];
  const foundation=Number.isFinite(last)?last:Number.isFinite(start)?start:num(game?.year);
  return Math.max(0,num(game?.year)-foundation);
 }
 function decision(game,assessment,options={}){
  const p=game?.player;
  if(!p||p.youth||p.retired||p.age>=39||game?.season?.stage!=="review")return {type:"stay",reason:"not-eligible"};
  if(options.manual||options.mode==="deep")return {type:"stay",reason:"manual-mode"};
  if(p.sameTierMoveYear===game.year||p.autoMoveYear===game.year)return {type:"stay",reason:"already-moved"};
  if(p.transferDraw?.accepted&&p.transferDraw?.selected)return {type:"draw",reason:"already-accepted"};
  if(p.transferDraw?.declined)return {type:"stay",reason:"declined-by-user"};
  if(options.drawAvailable)return {type:"draw",reason:p.forcedMove?"relegation":"promotion"};
  if(p.forcedMove)return {type:"stay",reason:"no-downward-draw"};
  if(options.drawOpen)return {type:"stay",reason:"waiting-for-manual-draw"};
  const years=tenure(game),roleIndex=Math.max(0,num(assessment?.rolePerformance));
  // Focus on sustained performance rather than Ballon d'Or or goals for defenders.
  const stamina=num(p.stamina),eligible=options.candidateCount>0&&years>=3&&!p.injuryMatches&&stamina>=25;
  if(!eligible)return {type:"stay",reason:"candidate-or-tenure"};
  // Deterministic for the same saved season; no rerolling by refreshing the page.
  const roll=hash(game.year+"|"+p.name+"|"+p.club+"|"+p.position)%1000/1000;
  const probability=Math.min(.80,.24+Math.max(0,years-3)*.11+Math.min(.22,roleIndex*.11));
  const move=years>=7||roll<probability;
  return move?{type:"lateral",reason:years>=7?"career-development":"market-interest",
    years,roll,probability}:{type:"stay",reason:"no-offer-this-year",years,roll,probability};
 }
 function choose(game,options){
  if(!Array.isArray(options)||!options.length)return null;
  const seed=hash((game?.year||0)+"|"+(game?.player?.name||"")+"|"+(game?.player?.club||"")+"|next");
  // Keep genuinely same-tier clubs with different financial/competitive appeal.
  const sorted=options.slice().sort((a,b)=>num(b.power)-num(a.power)||String(a.club).localeCompare(String(b.club)));
  return sorted[seed%Math.min(sorted.length,Math.max(1,Math.ceil(sorted.length*.6)))];
 }
 return Object.freeze({hash,tenure,decision,choose});
});