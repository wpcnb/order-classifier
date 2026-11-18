/* 绿茵信仰：以现实市场的年龄溢价、赛季表现和大奖声誉为灵感的原创模拟。
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
  // The valuation is in EUR. One elite season can establish a €100m+
  // market even before a Ballon d'Or; award prestige is independent of club league.
  function seasonLine(row={},club=""){
    const matches=Array.isArray(row.results)?row.results.filter(x=>x?.played&&x.kind!=="national"):[];
    const apps=clamp(number(row.apps)||matches.length,0,65);
    const ratings=Array.isArray(row.ratings)?row.ratings.filter(x=>Number.isFinite(x)&&x>=1&&x<=10):[];
    const average=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:
      Number.isFinite(Number(row.average))?clamp(Number(row.average),4.5,10):6.8;
    const clean=Number.isFinite(Number(row.clean))?Math.max(0,number(row.clean)):
      matches.filter(x=>(x.home===club||x.away===club)&&Number.isFinite(x.hs)&&Number.isFinite(x.as)&&
      (x.home===club?x.as:x.hs)===0).length;
    return {apps,average,goals:Math.max(0,number(row.goals)),assists:Math.max(0,number(row.assists)),clean};
  }
  function currentSeasonLine(player,season,career){
    const active=seasonLine(season,player.club);
    const year=number(career?.year);
    const generation=career?.generation;
    const previous=(career?.history||[]).filter(h=>
      Number.isFinite(Number(h?.year))&&Number(h.year)===year-1&&
      (generation===undefined||h.generation===undefined||h.generation===generation))
      .at(-1);
    // The previous breakout persists into the next season, then is replaced by
    // the new season's evidence after ~18 matches. Do not permanently bank it.
    if(!previous||active.apps>=18)return active;
    const last=seasonLine(previous,player.club);
    const carry=clamp((18-active.apps)/18,0,1)*.90;
    const weight=carry*last.apps,denom=active.apps+weight;
    return {apps:Math.max(active.apps,Math.round(weight)),
      average:denom?(active.average*active.apps+last.average*weight)/denom:6.8,
      goals:active.goals+last.goals*carry,assists:active.assists+last.assists*carry,
      clean:active.clean+last.clean*carry};
  }
  function earnedPrestige(career){
    const year=number(career?.year),generation=career?.generation;
    const valid=h=>h&&Number.isFinite(Number(h.year))&&
      (generation===undefined||h.generation===undefined||h.generation===generation);
    const goldYears=new Set(),bestYears=new Set();
    for(const entry of career?.ballonHistory||[])if(valid(entry)&&entry.rank===1)goldYears.add(Number(entry.year));
    for(const entry of career?.honors||[]){
      if(!valid(entry))continue;
      if(/金球奖/.test(entry.name||""))goldYears.add(Number(entry.year));
      if(/世界足球先生/.test(entry.name||""))bestYears.add(Number(entry.year));
    }
    // Historical awards remain visible but fade as the player approaches retirement.
    const weight=yr=>clamp(1-Math.max(0,year-yr)*.055,.32,1);
    return {gold:goldYears.size,best:bestYears.size,
      goldUnits:[...goldYears].reduce((n,y)=>n+weight(y),0),
      bestUnits:[...bestYears].reduce((n,y)=>n+weight(y),0)};
  }
  function breakout(position,stats,age,tierFactor){
    const apps=stats.apps,avg=stats.average,goals=stats.goals,assists=stats.assists,clean=stats.clean;
    const grade=clamp((avg-7.08)/.80,0,1);
    let performance;
    if(["ST","LW","RW","CAM"].includes(position))performance=clamp((goals+assists*.82)/Math.max(apps,1)/.60,0,1);
    else if(["CM","CDM"].includes(position))performance=clamp((goals*.60+assists+clean*.14)/Math.max(apps,1)/.43,0,1);
    else performance=clamp((clean/Math.max(apps,1))/.48,0,1);
    // Age 20-26 is the highest market-response phase to breakout seasons.
    const young=age<=26?1.12:age<=29?1:age<=32?.72:age<=35?.40:.16;
    const maximum=["ST","LW","RW","CAM"].includes(position)?75000000:
      ["CM","CDM"].includes(position)?82000000:
      position==="GK"?52000000:65000000;
    const merit=(grade*.52+performance*.48)*clamp(apps/26,0,1);
    return Math.round(maximum*merit*young*(.78+.22*Math.min(1,tierFactor)));
  }
  function details(player,overall,tier,season={},career={}){
    const p=player||{},position=POSITIONS[p.position]||POSITIONS.CM;
    if(!player||p.retired)return {value:0,position:position.label,retired:true,source:"原创游戏模型；不是德转实时身价",model:"v4.0"};
    const ability=clamp(number(overall)||65,40,99);
    const base=5000000*Math.pow(ability/70,9.2);
    const level=clamp(Math.round(number(tier)),0,5),normalTier=TIERS[level];
    const age=clamp(number(p.age)||18,16,50),ageWeight=ageFactor(age);
    const stats=currentSeasonLine(p,season,career);
    const awards=earnedPrestige(career);
    // Ballon d'Or proves international demand even if the player currently
    // plays in a lower-tier league; passport never factors into valuation.
    const tierWeight=Math.max(normalTier,Math.min(1.14,.62+awards.goldUnits*.22+awards.bestUnits*.07)*(awards.gold||awards.best?1:0));
    const form=clamp(1+(stats.average-6.8)*.09,.83,1.14);
    const reliability=.84+Math.min(30,stats.apps)/30*.16;
    const contractYears=p.contract===undefined||p.contract===null?3:clamp(number(p.contract),0,5);
    const contractWeight=.82+contractYears*.045;
    const injuries=clamp(number(p.injuryHistory),0,8),fitness=clamp(1-injuries*.018,.83,1);
    const potential=clamp(number(p.potential)||ability,ability,99);
    const prospect=age<23?clamp(1+(potential-ability)*.012,1,1.19):1;
    const frontline=["ST","LW","RW","CAM"].includes(p.position);
    const contribution=frontline?clamp(1+(stats.goals+stats.assists)*.0012,1,1.05):1;
    const academy=p.youth?.16:1;
    const ordinary=base*position.weight*tierWeight*ageWeight*form*reliability*contractWeight*fitness*prospect*contribution*academy;
    const seasonalBreakout=p.youth?0:breakout(p.position,stats,age,normalTier);
    const prestigeAge=age<=29?1:age<=32?.82:age<=35?.46:.12;
    const earned=prestigeAge*(Math.min(3.8,awards.goldUnits)*22000000+Math.min(3,awards.bestUnits)*7500000);
    const prestigeMultiplier=1+Math.min(.40,awards.goldUnits*.16)+Math.min(.12,awards.bestUnits*.05);
    const raw=ordinary*prestigeMultiplier+seasonalBreakout*fitness+earned*position.weight/1.20;
    const max=position.cap;
    const value=Math.round(clamp(raw,75000,max)/10000)*10000;
    return {value,position:position.label,overall:ability,age,tier:level,
      awards:{ballonDor:awards.gold,worldPlayer:awards.best},
      components:{ability:Math.round(base),position:position.weight,league:Number(tierWeight.toFixed(3)),age:ageWeight,
        performance:Number(form.toFixed(3)),appearances:Number(reliability.toFixed(3)),
        contract:Number(contractWeight.toFixed(3)),injury:Number(fitness.toFixed(3)),
        potential:Number(prospect.toFixed(3)),attack:Number(contribution.toFixed(3)),
        breakoutBonus:seasonalBreakout,prestigeBonus:Math.round(earned*position.weight/1.20),
        recentAverage:Number(stats.average.toFixed(2)),recentApps:stats.apps},
      source:"赛季表现、年龄、球场位置、合同和历史大奖的原创游戏估值；不是德转实时身价",
      model:"v4.0",cap:max};
  }
  const marketValue=(p,overall,tier,season,career)=>details(p,overall,tier,season,career).value;
  return Object.freeze({POSITIONS,details,marketValue});
});