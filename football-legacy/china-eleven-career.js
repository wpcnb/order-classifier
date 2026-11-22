/* 绿茵传奇11人：国足最近一次首发的平行世界生涯引擎。
 * 身份、出生日期及成年身高由 china-rosters.js 提供；
 * 16岁能力、青训归属、潜力、未来事件全部是游戏设定，不是现实测量或预测。
 * 此模块不读写历史三人生涯存档。 */
(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.ElevenCareerCore=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  const BASE=[
    ["李昊","GK",16,"马德里竞技青训",57,78],
    ["杨希","RB",23,"西班牙人青训",58,81],
    ["刘浩帆","CB",5,"浙江青训",54,75],
    ["韩鹏飞","CB",18,"大连实德青训",51,73],
    ["刘洋","LB",19,"山东鲁能青训",55,75],
    ["徐彬","CDM",13,"恒大足球学校",57,79],
    ["王上源","CM",6,"北京三高青训",55,74],
    ["杨明洋","CM",25,"瑞士青训体系",56,75],
    ["王钰栋","LW",7,"浙江绿城青训",63,86],
    ["林良铭","RW",11,"广州富力青训",60,80],
    ["拜合拉木·阿卜杜外力","ST",17,"内蒙古青训体系",55,77]
  ];
  const ROW_BY_NAME=new Map(BASE.map((r,i)=>[r[0],i]));
  const LEAGUES={
    youth:["青训联赛", "青训队"],
    c2:["中乙", "中国职业俱乐部"],
    c1:["中甲", "中国职业俱乐部"],
    csl:["中超", "中国职业俱乐部"],
    asia:["亚洲顶级联赛", "东亚职业俱乐部"],
    belgium:["比甲", "比利时职业俱乐部"],
    portugal:["葡超", "葡萄牙职业俱乐部"],
    holland:["荷甲", "荷兰职业俱乐部"],
    top:["欧洲五大联赛", "欧洲职业俱乐部"]
  };
  function hashText(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0;}
  function rng(seed){let x=seed>>>0;return function(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
  function bounded(x,lo,hi){return Math.max(lo,Math.min(hi,x));}
  function round(x){return Math.round(x*10)/10;}
  function metrics(position,overall){
    const templates={
      GK:[43,55,53,48,59], RB:[71,65,48,61,58], LB:[68,64,53,58,56],
      CB:[56,59,64,53,66], CDM:[62,70,55,62,65], CM:[63,66,53,64,59],
      LW:[78,63,52,70,46], RW:[73,62,51,68,47], ST:[69,65,65,57,44]
    };
    const t=templates[position]||templates.CM,extra=(overall-57)*0.65;
    return t.map(n=>bounded(Math.round(n+extra),35,92));
  }
  function fromRoster(rows,name){
    const item=Array.isArray(rows)?rows.find(p=>p&&p.group==="senior"&&p.name===name):null;
    return item||{};
  }
  function create(seed,rosterRows){
    const n=Number(seed);
    const key=Number.isSafeInteger(n)&&n>=0&&n<=4294967295?n:20261122;
    const players=BASE.map((entry,i)=>{
      const [name,position,number,academy,initial,potential]=entry;
      const record=fromRoster(rosterRows,name);
      return {id:i+1,name,position,number,academy,academyVerified:false,
        born:record.born||null,adultClub:record.club||null,
        adultHeight:record.height??null,adultWeight:record.weight??null,
        measurementSource:record.height?"中国队公开球员档案（成年参考）":null,
        age:16,rating:initial,potential,attributes:metrics(position,initial),
        league:"青训联赛",tier:"youth",club:academy,apps:0,goals:0,assists:0,
        cleanSheets:0,caps:0,careerCaps:0,injuries:0,lastEvent:"16岁进入青训体系",
        seasons:[]};
    });
    return {schema:1,seed:key,startYear:2026,year:2026,age:16,
      fixture:"2026-11-17 中国 2:2 巴林（本场11名首发）",
      players,yearsSimulated:0};
  }
  function tierFor(player,age,random){
    if(age<18)return "youth";
    const r=player.rating,prev=player.tier;
    if(age===18)return r>=69?"csl":r>=62?"c1":"c2";
    if(r<58)return "c2";
    if(r<65)return random<.65?"c1":"csl";
    if(r<70)return random<.73?"csl":"asia";
    if(r<74)return random<.60?"csl":random<.80?"asia":"belgium";
    if(r<78)return random<.33?"csl":random<.55?"asia":random<.75?"belgium":"portugal";
    if(r<82)return random<.24?"csl":random<.40?"belgium":random<.64?"portugal":"holland";
    if(prev==="top"&&r>=78&&random>.20)return "top";
    return random<.32?"holland":"top";
  }
  function clubFor(player,tier,age,random){
    if(tier==="youth")return player.academy;
    if(player.tier===tier&&age>18&&random>.26)return player.club;
    const clubs={
      c2:["华东青年队","北方职业队","江南竞技"],
      c1:["华中竞技","长江联队","江海足球俱乐部"],
      csl:["浙江职业","山东泰山","成都蓉城","北京国安","上海海港","青岛西海岸"],
      asia:["日本J1职业队","韩国K1职业队"],
      belgium:["比甲中游队","比甲青年强队"],
      portugal:["葡超中游队","葡超青年强队"],
      holland:["荷甲中游队","荷甲青年强队"],
      top:["德甲中游队","法甲中游队","西甲中游队","意甲中游队"]
    };
    const choices=clubs[tier]||clubs.csl;
    return choices[Math.floor(random*choices.length)%choices.length];
  }
  function seasonPlayer(player,world){
    const next={...player,seasons:[...player.seasons],attributes:[...player.attributes]};
    const age=world.age+1;
    const random=rng((world.seed^hashText(player.name+"-"+world.year))>>>0);
    const injury=age>=18&&random()<(age>=31?.11:.075);
    const miss=injury?1+Math.floor(random()*9):0;
    const potentialGap=next.potential-next.rating;
    const youth=age<=20?2.3:age<=23?1.2:age<=27?.55:age<=30?.0:-.85;
    const seasonForm=(random()-.50)*2.0;
    const growth=youth+seasonForm*(age<24?1.1:.7)+Math.max(0,potentialGap)*.035-(injury?1.7:0);
    const ceiling=next.potential+(random()>.96?1:0);
    next.rating=round(bounded(next.rating+growth,40,Math.max(ceiling,next.rating)));
    next.attributes=metrics(next.position,next.rating);
    const rTier=random(),tier=tierFor(next,age,rTier),league=LEAGUES[tier][0];
    const newClub=clubFor(next,tier,age,random());
    const moved=next.club!==newClub&&age>=18;
    next.club=newClub;next.league=league;next.tier=tier;next.age=age;
    const possible=age<18?20:36;
    const minutesFactor=bounded(.66+(next.rating-65)*.015+(random()-.5)*.35,.28,1);
    const apps=Math.max(0,Math.round((possible-miss)*minutesFactor));
    const attack=next.position==="ST"||next.position==="LW"||next.position==="RW";
    const keeper=next.position==="GK";
    const goals=keeper?0:Math.max(0,Math.round(apps*(attack?.22:.045)*(.70+random()*.65)));
    const assists=keeper?0:Math.max(0,Math.round(apps*(attack?.12:.08)*(.70+random()*.9)));
    const cleanSheets=keeper?Math.max(0,Math.round(apps*(.20+random()*.25))):0;
    const national=age>=18&&next.rating>=(age<21?69:age<25?73:71)&&random()>.30;
    const caps=national?Math.min(12,Math.round(3+random()*10)):0;
    next.apps=apps;next.goals=goals;next.assists=assists;next.cleanSheets=cleanSheets;
    next.caps=caps;next.careerCaps+=caps;next.injuries+=injury?1:0;
    next.lastEvent=injury?"模拟伤病：本季缺席"+miss+"场":moved?"转会至"+newClub:caps?"获得"+caps+"次成年国家队出场":"完成常规赛季";
    const performanceIndex=round(next.rating*.67+(apps/36)*18+goals*.5+assists*.35+(caps?2:0));
    const trophyRoll=random();
    const trophy=age>=18&&tier!=="c2"&&tier!=="c1"&&trophyRoll>.91?"模拟国内杯赛冠军":null;
    const season={year:world.year+1,age,rating:next.rating,tier,league,club:newClub,
      apps,goals,assists,cleanSheets,caps,injuryGames:miss,performanceIndex,trophy};
    next.seasons.push(season);
    return next;
  }
  function step(state){
    if(!isValid(state))throw Error("无效的11人职业生涯存档");
    if(state.age>=35)return state;
    const out={...state,age:state.age+1,year:state.year+1,yearsSimulated:state.yearsSimulated+1};
    out.players=state.players.map(p=>seasonPlayer(p,state));
    return out;
  }
  function simulate(state,years){
    const n=bounded(Math.floor(Number(years)||0),0,20);
    let current=state;
    for(let i=0;i<n;i++)current=step(current);
    return current;
  }
  function isValid(state){
    return !!state&&state.schema===1&&Number.isInteger(state.seed)
      &&Number.isInteger(state.age)&&state.age>=16&&state.age<=35
      &&Number.isInteger(state.year)&&state.year-state.startYear===state.age-16
      &&Array.isArray(state.players)&&state.players.length===11
      &&state.players.every((p,i)=>p&&p.name===BASE[i][0]&&p.age===state.age
        &&Number.isFinite(p.rating)&&p.rating>=35&&p.rating<=105
        &&Array.isArray(p.seasons)&&p.seasons.length===state.age-16);
  }
  return Object.freeze({BASE,create,step,simulate,isValid,LEAGUES});
});