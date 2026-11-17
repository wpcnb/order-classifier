/* 绿茵传奇 3.0：按位置的赛季评估；只使用已模拟记录，不编造扑救、抢断或传球次数。 */
(function(root, factory){
  const api=factory();
  root.FootballRolesV3=api;
  if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis==="object"?globalThis:this,function(){
  "use strict";
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a));
  const num=x=>Number.isFinite(Number(x))?Number(x):0;
  function group(position){
    if(position==="GK")return "keeper";
    if(["CB","LB","RB"].includes(position))return "defender";
    if(position==="CDM")return "holding";
    if(position==="CM")return "midfield";
    if(position==="CAM")return "creator";
    return "forward";
  }
  function evaluate(p,n,gate,overall,tier){
    const pos=group(p.position),apps=num(n.apps),average=num(n.avg);
    const known=num(n.matchesWithScore),clean=num(n.cleanSheets);
    const conceded=known?num(n.goalsAgainst)/known:null;
    const output=num(n.goals)+num(n.assists);
    const thresholds={forward:0,creator:.03,midfield:.06,holding:.08,defender:.10,keeper:.08};
    const rating=Math.max([6.90,6.95,7.00,7.05,7.10,7.15][tier]??7.15,
      num(gate?.avg)+thresholds[pos]);
    const minApps=Math.max(15,num(gate?.apps));
    const tierOutputs=[13,15,17,19,21,23];
    const requiredOutput=tierOutputs[tier]??23;
    const strong=average>=rating+.18;
    const valid=known>=Math.ceil(apps*.7);
    const extra={
      forward:output>=Math.ceil(requiredOutput*.80) && (num(n.goals)>=num(gate?.g) || num(n.assists)>=num(gate?.a) || output>=num(gate?.sum)),
      creator:output>=Math.ceil(requiredOutput*.48) && (num(n.assists)>=Math.max(2,Math.ceil(num(gate?.a)/2)) || strong),
      midfield:num(n.assists)>=Math.max(2,Math.ceil(num(gate?.a)/2)) || strong,
      holding:valid && (clean>=Math.max(3,Math.ceil(known*.16)) || strong),
      defender:valid && (clean>=Math.max(3,Math.ceil(known*.19)) || (conceded!==null&&conceded<=1.55) || strong),
      keeper:valid && (clean>=Math.max(3,Math.ceil(known*.18)) || (conceded!==null&&conceded<=1.45) || average>=rating+.26)
    }[pos];
    const eligible=apps>=minApps&&average>=rating&&num(overall)>=num(gate?.ov)&&extra;
    // “低谷”不能由未夺冠、输决赛、缺席比赛、年龄自然增长或进球少单独触发。
    const healthy=apps>=23&&!p.retired&&!p.youth&&num(p.injuryMatches)===0&&num(p.age)<35;
    const veryLow=average<6.38;
    const poor=healthy&&(veryLow||
      pos==="forward"&&output<Math.ceil(requiredOutput*.34)&&average<6.85||
      pos==="creator"&&output<Math.ceil(requiredOutput*.22)&&average<6.65||
      pos==="midfield"&&average<6.40||
      pos==="holding"&&average<6.35||
      pos==="defender"&&average<6.35||
      pos==="keeper"&&average<6.35);
    let description;
    if(pos==="keeper")description="门将：出场、场均评分、球队零封、每场实际失球；不要求进球助攻，也不虚构扑救次数。";
    else if(pos==="defender")description="后卫：出场、场均评分、真实比赛零封、每场失球；不要求进球助攻。";
    else if(pos==="holding")description="后腰：场均评分与防守稳定性，真实零封或高评分；不要求进球助攻。";
    else if(pos==="midfield")description="中场：场均评分与组织表现，助攻或持续高评分均可达标；不要求进球。";
    else if(pos==="creator")description="前腰：助攻与创造贡献为主，结合场均评分；门槛低于边锋和中锋。";
    else description="前锋与边锋：按进球、助攻、出场和场均评分考核。";
    return {group:pos,apps,average,known,clean,conceded,output,rating,minApps,requiredOutput,qualified:!!eligible,poor:!!poor,description};
  }
  return Object.freeze({group,evaluate});
});