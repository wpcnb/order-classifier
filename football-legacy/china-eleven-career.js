/* 绿茵传奇11人：国足最近一次首发的平行世界生涯引擎。
 * 身份、出生日期及成年身高由 china-rosters.js 提供；
 * 16岁能力、青训归属、潜力、未来事件全部是游戏设定，不是现实测量或预测。
 * 此模块不读写历史三人生涯存档。 */
(function(root,factory){
  "use strict";
  const node=typeof module==="object"&&module.exports;
  const api=factory(node?require("./eleven-fixtures.js"):root.ElevenFixtures,
    node?require("./eleven-internationals.js"):root.ElevenInternationals,
    node?require("./eleven-domestic-cup.js"):root.ElevenDomesticCup,
    node?require("./eleven-awards.js"):root.ElevenAnnualAwards,
    node?require("./eleven-ledger.js"):root.ElevenCompetitionLedger,
    node?require("./eleven-clubs.js"):root.ElevenClubs,
    node?require("./eleven-leagues.js"):root.ElevenLeagues);
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.ElevenCareerCore=api;
})(typeof window!=="undefined"?window:globalThis,function(fixtures,internationals,cups,awards,ledger,clubs,leagues){
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
    europe:["其他欧洲顶级联赛", "欧洲职业俱乐部"],
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
  const countries=["中国","英格兰","西班牙","法国","葡萄牙","德国"];
  const playerCountries=new Set(internationals.associations);
  const {divisions,domesticAssociation:countryFor}=clubs;
  function homeTeam(country,requested){
    const senior=clubs.leagueTeams(divisions[country][2]),youth=clubs.leagueTeams(country+"青训联赛");
    const available=team=>senior.includes(team)&&youth.includes(clubs.academy(country,team));
    return available(requested)?requested:senior.find(available);
  }
  function create(seed,rosterRows,setup={}){
    const country=setup.country||"中国";
    if(!countries.includes(country))throw Error("无效的青训体系");
    const team=homeTeam(country,setup.team);
    if(setup.team!==undefined&&team!==setup.team)throw Error("球队未在青训名单内");
    const picks=setup.players;
    if(picks&&(!Array.isArray(picks)||picks.length!==11||new Set(picks.map(p=>p?.name)).size!==11))throw Error("无效的球队阵容");

    const n=Number(seed);
    const key=Number.isSafeInteger(n)&&n>=0&&n<=4294967295?n:20261122;
    const players=BASE.map((entry,i)=>{
      const record=picks?picks[i]:fromRoster(rosterRows,entry[0]);
      const name=picks?record.name:entry[0], position=entry[1], number=Number.isInteger(record.number)?record.number:entry[2];
      if(record.country&&!playerCountries.has(record.country))throw Error("球员代表协会不在名单内");
      const reference=BASE[ROW_BY_NAME.get(name)];
      const talent=rng(key^hashText(name));
      const initial=Number.isInteger(record.initialRating)?bounded(record.initialRating,35,90)
        :reference?reference[4]:52+Math.floor(talent()*12);
      const potential=Number.isInteger(record.potential)?bounded(record.potential,initial,100)
        :reference?reference[5]:69+Math.floor(talent()*19);
      // These are fictional age-16 body estimates, NEVER public measurements.
      const hRef=Number.isFinite(record.height)?record.height
        :({GK:191,RB:178,CB:187,LB:179,CDM:182,CM:178,LW:179,RW:177,ST:183})[position];
      const wRef=Number.isFinite(record.weight)?record.weight
        :({GK:79,RB:73,CB:82,LB:72,CDM:77,CM:74,LW:73,RW:72,ST:78})[position];
      const youthHeightEstimate=Math.round(hRef-3-Math.floor(talent()*6));
      const youthWeightEstimate=Math.round(wRef-6-Math.floor(talent()*6));
      const academy=clubs.academy(country,team);
      return {id:i+1,name,position,number,academy,academyVerified:false,initialRating:initial,youthHeightEstimate,youthWeightEstimate,
        country:record.country||"中国",born:record.born||null,adultClub:record.club||null,
        adultHeight:record.height??null,adultWeight:record.weight??null,
        measurementSource:record.selection||"中国队公开球员档案",profileUrl:record.dataSource||record.url||null,
        age:16,rating:initial,potential,attributes:metrics(position,initial),
        league:country+"青训联赛",tier:"youth",club:academy,apps:0,goals:0,assists:0,
        cleanSheets:0,caps:0,careerCaps:0,injuries:0,lastEvent:"16岁进入青训体系",
        seasons:[]};
    });
    return {schema:1,seed:key,startYear:2026,year:2026,age:16,realTeamsFromYear:2027,
      squad:{country,team,together:setup.together!==false},
      fixture:picks?"自选首发阵容":"2026-11-17 中国 2:2 巴林（本场11名首发）",
      players,yearsSimulated:0};
  }
  function tierFor(player,age,random){
    if(age<18)return "youth";
    const r=player.rating,prev=player.tier;
    if(age===18)return r>=69?"csl":r>=62?"c1":"c2";
    if(r<58)return "c2";
    if(r<65)return random<.65?"c1":"csl";
    // A moderate additional route to European leagues for emerging professionals.
    if(r>=68&&r<82&&random>=.45&&random<.59)return "europe";
    if(r<70)return random<.73?"csl":"asia";
    if(r<74)return random<.60?"csl":random<.80?"asia":"belgium";
    if(r<78)return random<.33?"csl":random<.55?"asia":random<.75?"belgium":"portugal";
    if(r<82)return random<.24?"csl":random<.40?"belgium":random<.64?"portugal":"holland";
    if(prev==="top"&&r>=78&&random>.20)return "top";
    return random<.32?"holland":"top";
  }
  const domesticLevel={c2:0,c1:1,csl:2};
  const internationalLeagues={asia:["日本J1","韩国K1"],belgium:["比甲"],portugal:["葡超"],holland:["荷甲"],europe:clubs.europeLeagues,top:["德甲","法甲","西甲","意甲","英超"]};
  function assignClub(player,tier,age,squad,random){
    const {country,team:parent}=squad;
    if(age<18){
      const academy=clubs.academy(country,parent);
      return {tier:"youth",league:country+"青训联赛",club:academy,academy};
    }
    if(squad.together)return {tier:"domestic",league:divisions[country][2],club:parent};
    const options=internationalLeagues[tier]||[divisions[country][domesticLevel[tier]]];
    if(player.tier===tier&&options.includes(player.league)&&clubs.leagueTeams(player.league).includes(player.club)
        &&random()>.26)return {tier,league:player.league,club:player.club};
    const league=options[Math.floor(random()*options.length)],members=clubs.leagueTeams(league);
    const club=age===18&&members.includes(parent)?parent:members[Math.floor(random()*members.length)];
    return {tier,league,club};
  }
  function seasonPlayer(player,world,squad){
    const next={...player,seasons:[...player.seasons],attributes:[...player.attributes]};
    const age=world.age+1;
    const random=rng((world.seed^hashText(player.name+"-"+world.year))>>>0);
    const injury=random()<(age<18?.045:age>=31?.11:.075);
    const miss=injury?1+Math.floor(random()*9):0;
    const potentialGap=next.potential-next.rating;
    const youth=age<=20?2.3:age<=23?1.2:age<=27?.55:age<=30?.0:-.85;
    const seasonForm=(random()-.50)*2.0;
    const experience=player.seasons.length?bounded((player.apps-13)*.04,-.4,.4):0;
    const growth=youth+experience+seasonForm*(age<24?1.1:.7)+Math.max(0,potentialGap)*.035-(injury?1.7:0);
    const ceiling=next.potential+(random()>.96?1:0);
    next.rating=round(bounded(next.rating+growth,40,Math.max(ceiling,next.rating)));
    next.attributes=metrics(next.position,next.rating);
    const rTier=random(),tier=tierFor(next,age,rTier);
    Object.assign(next,assignClub(next,tier,age,squad,random));
    next.age=age;next.caps=0;next.injuries+=injury?1:0;
    next.nationalStage="本季未入选";
    next.lastEvent=injury?"伤停 "+miss+" 场":next.club!==player.club?"加入"+next.club:"完成赛季";
    next.seasons.push({year:world.year+1,age,rating:next.rating,tier:next.tier,league:next.league,club:next.club,
      apps:0,goals:0,assists:0,cleanSheets:0,caps:0,injuryGames:miss,trophy:null,statVersion:2});
    return next;
  }
  function advanceYear(state){
    if(state.age>=35)return state;
    const out={...state,age:state.age+1,year:state.year+1,yearsSimulated:state.yearsSimulated+1};
    out.realTeamsFromYear=state.realTeamsFromYear??out.year;
    if(state.squad)out.squad={...state.squad,team:homeTeam(state.squad.country,state.squad.team)};
    const squad=out.squad||{country:"中国",team:"上海海港",together:false};
    out.players=state.players.map(p=>seasonPlayer(p,state,squad));
    const {matches,records}=fixtures.simulateSeason(out.players,label=>rng(out.seed^hashText(out.year+":"+label)));
    out.leagueSchedules={...state.leagueSchedules,[out.year]:records};
    out.fixtures={...(state.fixtures||{}),[out.year]:matches};
    if(out.age>=18){
      const brackets=cups.season(out.players,matches,countryFor,label=>rng(out.seed^hashText(out.year+":cup:"+label)));
      out.cupHistory={...state.cupHistory,[out.year]:brackets};
    }
    const nationalMatches=internationals.season(out.players,matches,label=>rng(out.seed^hashText(out.year+":national:"+label)),out.year);
    out.nationalFixtures={...state.nationalFixtures,[out.year]:nationalMatches};
    for(const p of out.players){
      const s=p.seasons.at(-1);
      for(const field of ["apps","goals","assists","cleanSheets"])p[field]=s[field];
      const contribution=p.position==="GK"?s.cleanSheets*1.5:["CB","LB","RB"].includes(p.position)?s.cleanSheets*.9+s.apps*.16+s.assists*.7+s.goals*.9:p.position==="CDM"?s.apps*.25+s.assists*.8+s.goals*.7:s.goals*.8+s.assists*.6;
      s.performanceIndex=round(p.rating*.68+s.apps*.7+contribution+s.caps*.22);
      s.marketValue=Math.round((p.rating/65)**6*(p.age<30?1.2:Math.max(.3,1-(p.age-30)*.11))*(1+s.apps/22)*650000/10000)*10000;
    }
    const best=out.players.filter(p=>p.apps>0).sort((a,b)=>b.seasons.at(-1).performanceIndex-a.seasons.at(-1).performanceIndex||a.id-b.id)[0];
    if(best)best.seasons.at(-1).squadAward="阵容赛季最佳球员";
    if(out.age>=18)settleGlobalAwards(out);
    return out;
  }
  function settleGlobalAwards(world){
    world.awardHistory={...world.awardHistory,[world.year]:awards.settle(world,world.year)};
  }
  function step(state){
    if(!isValid(state))throw Error("无效的11人职业生涯存档");
    return advanceYear(state);
  }
  function simulate(state,years){
    const n=bounded(Math.floor(Number(years)||0),0,20);
    if(!isValid(state))throw Error("无效的11人职业生涯存档");
    let current=state;
    for(let i=0;i<n&&current.age<35;i++)current=advanceYear(current);
    return current;
  }
  function validScoreSheet(m){
    const slot=id=>Number.isInteger(id)&&id>=1&&id<=11;
    return m&&typeof m.home==="string"&&typeof m.away==="string"&&m.home!==m.away
      &&Array.isArray(m.score)&&m.score.length===2&&m.score.every(n=>Number.isInteger(n)&&n>=0&&n<=6)
      &&Array.isArray(m.lineups)&&m.lineups.length===2&&m.lineups.every(line=>Array.isArray(line)&&line.every(slot))
      &&new Set(m.lineups.flat()).size===m.lineups[0].length+m.lineups[1].length
      &&Array.isArray(m.goals)&&m.goals.length===m.score[0]+m.score[1]&&m.goals.every(goal=>Array.isArray(goal)
        &&goal.length===3&&(goal[0]===0||goal[0]===1)&&(goal[1]===null||goal[1]!==goal[2])
        &&goal.slice(1).every(id=>id===null||m.lineups[goal[0]].includes(id)))
      &&m.goals.filter(goal=>goal[0]===0).length===m.score[0];
  }
  // These labels are accepted only while reading seasons already played by the previous engine.
  const historicalOpponents=new Set("北城竞技 南岸联队 东港竞技 西城联队 河谷联队 山麓竞技 新城联 滨海竞技 中央联队 河畔竞技 青年联合 星港联队".split(" "));
  function validFixtures(state){
    const archive=state.fixtures;
    if(archive===undefined)return true; // pre-fixture archive compatibility
    if(!Array.isArray(state.players)||state.players.length!==11)return false;
    if(!archive||typeof archive!=="object"||Array.isArray(archive))return false;
    for(const [year,matches] of Object.entries(archive)){
      const offset=Number(year)-state.startYear-1;
      if(!Number.isInteger(offset)||String(Number(year))!==year||offset<0||
         Number(year)>state.year||!Array.isArray(matches)||matches.length>242)return false;
      const seen=new Set(),occupied=new Set();
      const tracked=new Map();
      for(const player of state.players){
        const ss=player?.seasons?.[offset];
        if(!ss||typeof ss.league!=="string"||typeof ss.club!=="string")return false;
        if(!tracked.has(ss.league))tracked.set(ss.league,new Set());
        tracked.get(ss.league).add(ss.club);
      }
      for(const m of matches){
        if(!validScoreSheet(m)||typeof m.league!=="string"||
          !Number.isInteger(m.round)||m.round<1||m.round>22)return false;
        if(!tracked.has(m.league))return false;
        const realSeason=Number(year)>=state.realTeamsFromYear;
        const eligible=club=>realSeason?clubs.leagueTeams(m.league).includes(club):
          tracked.get(m.league).has(club)||historicalOpponents.has(club);
        if(!eligible(m.home)||!eligible(m.away))return false;
        for(const club of [m.home,m.away]){
          const k=[m.league,m.round,club].join("|");
          if(occupied.has(k))return false;
          occupied.add(k);
        }
        const key=[m.league,m.round,m.home,m.away].join("|");
        if(seen.has(key))return false;
        seen.add(key);
        for(const [side,line] of m.lineups.entries()){
          const club=side===0?m.home:m.away;
          for(const id of line){
            const player=state.players[id-1],ss=player?.seasons[offset];
            if(!ss||ss.club!==club||ss.league!==m.league||
              m.round>=ss.injuryStart&&m.round<ss.injuryStart+ss.injuryGames)return false;
          }
        }
      }
    }
    return true;
  }
  function validSeasonLedger(state){
    for(const p of state.players){
      for(const s of p.seasons){
        if(s.statVersion===undefined)continue; // do not rewrite old save statistics
        if(s.statVersion!==2||!state.fixtures?.[s.year])return false;
        const expected=ledger.season(state,s.year,p.id)?.league;
        if(!expected||["apps","goals","assists","cleanSheets"].some(k=>expected[k]!==s[k]))
          return false;
      }
    }
    return true;
  }
  function validNationalHistory(state){
    const archive=state.nationalFixtures;
    if(archive===undefined)return true;
    if(!archive||typeof archive!=="object"||Array.isArray(archive))return false;
    for(const [year,matches] of Object.entries(archive)){
      const offset=Number(year)-state.startYear-1,age=17+offset;
      if(!Number.isInteger(offset)||String(Number(year))!==year||offset<0||age>state.age
          ||!Array.isArray(matches)||matches.length>55)return false;
      const played=new Set(),teams=new Set(),caps=Array(11).fill(0);
      const historical=state.realTeamsFromYear===undefined||Number(year)<state.realTeamsFromYear;
      for(const m of matches){
        if(!validScoreSheet(m)||!internationals.windows.includes(m.round)
            ||![m.home,m.away].every(team=>playerCountries.has(team)||historical&&team==="其他国家队")
            ||!internationals.levels.includes(m.level)
            ||(m.level==="成年队"?age<18:m.level!==internationals.youthLevel(age)))return false;
        for(const [side,line] of m.lineups.entries()){
          const country=side===0?m.home:m.away,teamKey=[m.round,m.level,country].join(":");
          if(teams.has(teamKey))return false;
          teams.add(teamKey);
          for(const id of line){
            const player=state.players[id-1],s=player.seasons[offset],key=m.round+":"+id;
            if(played.has(key)||(player.country||"中国")!==country
               ||m.round>=s.injuryStart&&m.round<s.injuryStart+s.injuryGames)return false;
            played.add(key);
            if(m.level==="成年队")caps[id-1]++;
          }
        }
      }
      if(state.players.some((p,i)=>p.seasons[offset].caps!==caps[i]))return false;
    }
    return true;
  }
  function isValid(state){
    return !!state&&state.schema===1&&Number.isInteger(state.seed)
      &&state.startYear===2026&&state.yearsSimulated===state.age-16
      &&(state.realTeamsFromYear===undefined||Number.isInteger(state.realTeamsFromYear)
        &&state.realTeamsFromYear>state.startYear&&state.realTeamsFromYear<=Math.max(state.year,state.startYear+1))
      &&validFixtures(state)
      &&Number.isInteger(state.age)&&state.age>=16&&state.age<=35
      &&Number.isInteger(state.year)&&state.year-state.startYear===state.age-16
      &&(!state.squad||countries.includes(state.squad.country)&&typeof state.squad.team==="string"&&typeof state.squad.together==="boolean")
      &&Array.isArray(state.players)&&state.players.length===11&&new Set(state.players.map(p=>p?.name)).size===11
      &&state.players.every((p,i)=>p&&p.id===i+1&&p.position===BASE[i][1]&&typeof p.name==="string"&&p.name.length>0
        &&(state.squad?playerCountries.has(p.country)||p.country==="其他国家队":p.name===BASE[i][0])&&p.age===state.age
        &&Array.isArray(p.attributes)&&p.attributes.length===5&&p.attributes.every(v=>Number.isFinite(v)&&v>=0&&v<=100)
        &&Number.isInteger(p.number)&&Number.isFinite(p.potential)&&Number.isInteger(p.careerCaps)
        &&(p.initialRating===undefined||Number.isFinite(p.initialRating))
        &&(p.youthHeightEstimate===undefined||Number.isInteger(p.youthHeightEstimate)&&p.youthHeightEstimate>=120&&p.youthHeightEstimate<=220)
        &&(p.youthWeightEstimate===undefined||Number.isInteger(p.youthWeightEstimate)&&p.youthWeightEstimate>=35&&p.youthWeightEstimate<=140)
        &&Number.isFinite(p.rating)&&p.rating>=35&&p.rating<=105
        &&Array.isArray(p.seasons)&&p.seasons.length===state.age-16
        &&p.seasons.every((season,j)=>season&&typeof season==="object"&&!Array.isArray(season)
          &&season.year===state.startYear+j+1&&season.age===17+j
          &&Number.isFinite(season.rating)&&season.rating>=35&&season.rating<=105
          &&typeof season.league==="string"&&typeof season.club==="string"
          &&["apps","goals","assists","cleanSheets","caps","injuryGames"].every(key=>
            Number.isInteger(season[key])&&season[key]>=0)))
      &&validNationalHistory(state)&&cups.validHistory(state,countryFor,validScoreSheet)
       &&leagues.validHistory(state)&&validSeasonLedger(state)&&awards.validHistory(state);
  }
  return Object.freeze({BASE,create,step,simulate,isValid,LEAGUES,domesticAssociation:countryFor});
});
