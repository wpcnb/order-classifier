/* 绿茵传奇 3.0：参考公开足球估值研究的原创模拟，不复制德转数据库。
   全部金额为欧元；这是游戏估值而非德转实时报价。 */
(function(root,factory){
  const api=factory();
  root.FootballMarketV3=api;
  if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis==="object"?globalThis:this,function(){
  "use strict";
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(n)?n:lo));
  const number=x=>Number.isFinite(Number(x))?Number(x):0;
  const POSITIONS=Object.freeze({
    GK:{label:"门将",weight:.52,cap:115000000},
    CB:{label:"中后卫",weight:.91,cap:180000000},
    LB:{label:"边后卫",weight:.94,cap:180000000},
    RB:{label:"边后卫",weight:.94,cap:180000000},
    CDM:{label:"后腰",weight:1.03,cap:210000000},
    CM:{label:"中场",weight:1.16,cap:240000000},
    CAM:{label:"前腰",weight:1.38,cap:260000000},
    LW:{label:"边锋",weight:1.65,cap:300000000},
    RW:{label:"边锋",weight:1.65,cap:300000000},
    ST:{label:"中锋",weight:1.78,cap:300000000}
  });
  const TIERS=[.24,.40,.59,.80,1,1.14];
  function ageFactor(age){
    if(age<18)return .42;
    if(age<20)return .68;
    if(age<23)return 1.10;
    if(age<27)return 1.24;
    if(age<30)return 1.13;
    if(age<32)return .94;
    if(age<35)return .68;
    if(age<38)return .37;
    return .18;
  }
  function details(player,overall,tier,season={}){
    const p=player||{},position=POSITIONS[p.position]||POSITIONS.CM;
    if(!player||p.retired)return {value:0,position:position.label,retired:true,source:"原创游戏模型",model:"v3.2"};
    const ability=clamp(number(overall)||65,40,99);
    const base=5000000*Math.pow(ability/70,9.2);
    const tierFactor=TIERS[clamp(Math.round(number(tier)),0,5)];
    const age=clamp(number(p.age)||18,16,50);
    const ageWeight=ageFactor(age);
    const appearances=clamp(number(season.apps),0,65);
    const grades=Array.isArray(season.ratings)?season.ratings.filter(x=>Number.isFinite(x)&&x>=1&&x<=10):[];
    const avg=grades.length?grades.reduce((a,b)=>a+b,0)/grades.length:6.8;
    const form=clamp(1+(avg-6.8)*.09,.83,1.14);
    // 出场少只是抑制高价，不直接归咎于伤病或扣生涯成就分。
    const reliability=.84+Math.min(30,appearances)/30*.16;
    const contractYears=p.contract===undefined||p.contract===null?3:clamp(number(p.contract),0,5);
    const contractWeight=.82+contractYears*.045;
    const injuries=clamp(number(p.injuryHistory),0,8);
    const fitness=clamp(1-injuries*.018,.83,1);
    // 潜力只影响青年球员；隐藏潜力不会直接暴露给玩家。
    const potential=clamp(number(p.potential)||ability,ability,99);
    const prospect=age<23?clamp(1+(potential-ability)*.012,1,1.19):1;
    // 进球和助攻只给进攻角色小幅浮动，不作为其他位置的定价要求。
    const frontline=["ST","LW","RW","CAM"].includes(p.position);
    const contribution=frontline?clamp(1+(number(season.goals)+number(season.assists))*.0025,1,1.09):1;
    const academy=p.youth?.16:1;
    const raw=base*position.weight*tierFactor*ageWeight*form*reliability*contractWeight*fitness*prospect*contribution*academy;
    const max=position.cap;
    const value=Math.round(clamp(raw,75000,max)/10000)*10000;
    return {value,position:position.label,overall:ability,age,tier:clamp(Math.round(number(tier)),0,5),
      components:{ability:Math.round(base),position:position.weight,league:tierFactor,age:ageWeight,
        performance:Number(form.toFixed(3)),appearances:Number(reliability.toFixed(3)),
        contract:Number(contractWeight.toFixed(3)),injury:Number(fitness.toFixed(3)),
        potential:Number(prospect.toFixed(3)),attack:Number(contribution.toFixed(3))},
      source:"公开估值研究启发的原创游戏模型；不是德转实时身价",
      model:"v3.2",cap:max};
  }
  const marketValue=(p,overall,tier,season)=>details(p,overall,tier,season).value;
  return Object.freeze({POSITIONS,details,marketValue});
});