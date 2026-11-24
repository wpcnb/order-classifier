/* Fictional annual award ballots for eleven-player careers.
 * Only recorded league/cup/international fixtures and recorded cup honours count
 * for tracked players. European/world tournament titles are NOT invented.
 * Model 3 saves a full ranking; earlier save formats remain readable.
 */
(function(root,factory){
  "use strict";
  const api=factory(typeof module==="object"&&module.exports
    ?require("./eleven-ledger.js"):root.ElevenCompetitionLedger);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.ElevenAnnualAwards=api;
})(typeof window!=="undefined"?window:globalThis,function(ledger){
  "use strict";
  const ORDER=["金球奖","世界足球先生"];
  const GROUPS=["国家队主教练","国家队队长","足球记者","球迷"];
  const BALLOT=[15,12,10,8,7,5,4,3,2,1];
  const BIG_FIVE=["英超","西甲","德甲","意甲","法甲"];
  const hash=value=>{let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const rng=seed=>{let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}};
  const round=x=>Math.round(x*100)/100;
  const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
  const role=p=>p==="GK"?"门将":(["CB","LB","RB","CDM"].includes(p)?"防守":(["CM","CAM"].includes(p)?"中场":"进攻"));
  const total=o=>Number(o.goals)||0;
  function contestant(state,year,p){
    const s=p.seasons[Number(year)-state.startYear-1];
    if(!s||s.apps<10)return null;
    const stats=ledger.season(state,year,p.id);
    const all=stats.total,played=Math.max(1,all.apps);
    const c=role(p.position),sheets=all.cleanSheets;
    const impact=c==="门将"?sheets*2.9+all.assists*2:
      c==="防守"?sheets*1.6+all.goals*3.1+all.assists*2.2:
      c==="中场"?all.goals*2.5+all.assists*2.6+sheets*.55:
      all.goals*2.5+all.assists*2.0;
    const individual=clamp(impact/Math.max(12,played)*38,0,70);
    const personalForm=(Number(s.performanceIndex)||s.rating)*.52;
    const level=BIG_FIVE.includes(s.league)?12:
      ["葡超","荷甲","比甲"].includes(s.league)?8:s.tier==="europe"?7:
      s.tier==="top"?10:s.tier==="youth"?0:5;
    const club=stats.cupChampion?13:0;
    const matchHonors=(all.wins*.43+stats.cup.wins*.65+stats.national.wins*.85+
      stats.national.goals*.75+stats.national.assists*.6);
    const score=round(personalForm+individual+level+club+matchHonors);
    const reason=[all.apps+"场"+all.goals+"球"+all.assists+"助攻",
      sheets+"场零封",stats.cup.apps+"场国内杯",stats.national.apps+"场国家队比赛",
      stats.cupChampion?"国内杯冠军":"未取得已记录的杯赛冠军"].join(" · ");
    return {id:p.id,name:p.name,club:s.club,position:p.position,origin:"tracked",
      score,reason,goals:all.goals,assists:all.assists,cleanSheets:sheets,
      apps:all.apps,cupChampion:stats.cupChampion};
  }
  function opponents(state,year){
    // Synthetic competitors are explicitly fictional estimates, never real-life results.
    const random=rng(state.seed^hash("opponents:"+year));
    const positions=["ST","LW","RW","CM","CAM","CB","GK","CDM"];
    return Array.from({length:30},(_,i)=>{
      const position=positions[i%positions.length],group=role(position);
      const apps=31+Math.floor(random()*22),goals=group==="进攻"?12+Math.floor(random()*26):
        group==="中场"?4+Math.floor(random()*13):Math.floor(random()*4);
      const assists=group==="中场"?5+Math.floor(random()*16):Math.floor(random()*12);
      const cleanSheets=group==="防守"||group==="门将"?8+Math.floor(random()*14):Math.floor(random()*8);
      const cupChampion=random()>.69;
      const ability=73+Math.floor(random()*19);
      const impact=group==="门将"?cleanSheets*2.9+assists*2:
        group==="防守"?cleanSheets*1.6+goals*3.1+assists*2.2:
        group==="中场"?goals*2.5+assists*2.6+cleanSheets*.55:
        goals*2.5+assists*2;
      const score=round(ability*.52+clamp(impact/apps*38,0,70)+12+
        (cupChampion?13:0)+(10+Math.floor(random()*20))*.43);
      return {id:"sim:"+year+":"+(i+1),name:"模拟候选"+String(i+1).padStart(2,"0"),
        club:null,position,origin:"fictional",score,
        reason:"虚构竞争者（模型估算）："+apps+"场"+goals+"球"+assists+"助攻 · "+
          cleanSheets+"场零封"+(cupChampion?" · 模拟杯赛冠军":""),
        goals,assists,cleanSheets,apps,cupChampion};
    });
  }
  function shortlist(state,year){
    return state.players.map(p=>contestant(state,year,p)).filter(Boolean)
      .concat(opponents(state,year))
      .sort((a,b)=>b.score-a.score||String(a.id).localeCompare(String(b.id)))
      .slice(0,30);
  }
  function ballotScore(candidate,award,group){
    if(award==="金球奖")return candidate.score;
    const weight=group==="国家队主教练"?{g:1.0,a:.7,s:.5}:
      group==="国家队队长"?{g:.7,a:1.2,s:.6}:
      group==="足球记者"?{g:1.0,a:.9,s:.9}:{g:1.2,a:.7,s:.3};
    return candidate.score*.80+candidate.goals*weight.g*.36+
      candidate.assists*weight.a*.35+candidate.cleanSheets*weight.s*.38+
      (candidate.cupChampion?2:0);
  }
  function rankByVotes(short,year,seed,award){
    const result=new Map(short.map(p=>[p.id,{...p,points:0,votes:{}}]));
    if(award==="金球奖"){
      for(let voter=0;voter<100;voter++){
        const random=rng(seed^hash(year+":ballon:journalist:"+voter));
        const vote=short.map(p=>({id:p.id,score:ballotScore(p,award,"足球记者")+(random()-.5)*18}))
          .sort((a,b)=>b.score-a.score||String(a.id).localeCompare(String(b.id)));
        BALLOT.forEach((points,i)=>result.get(vote[i].id).points+=points);
      }
    }else{
      for(const group of GROUPS){
        for(let voter=0;voter<100;voter++){
          const random=rng(seed^hash(year+":fifa:"+group+":"+voter));
          const vote=short.map(p=>({id:p.id,score:ballotScore(p,award,group)+(random()-.5)*18}))
            .sort((a,b)=>b.score-a.score||String(a.id).localeCompare(String(b.id)));
          [5,3,1].forEach((points,i)=>{
            result.get(vote[i].id).votes[group]=(result.get(vote[i].id).votes[group]||0)+points;
          });
        }
      }
      for(const row of result.values()){
        row.points=round(GROUPS.reduce((n,g)=>n+(row.votes[g]||0)/900*25,0));
      }
    }
    return [...result.values()].sort((a,b)=>b.points-a.points||b.score-a.score||
      String(a.id).localeCompare(String(b.id)))
      .map((p,i)=>({...p,rank:i+1}));
  }
  // Non-cryptographic checksum to detect accidental or casual manual edits.
  // This is NOT a secure signature and cannot defeat a determined save editor.
  function proofFor(seed,year,award,record){
    const rows=record.rankings.map(p=>[p.id,p.name,p.rank,p.points,p.score,p.origin,
      p.reason,p.goals,p.assists,p.cleanSheets,p.apps,p.cupChampion,p.votes]);
    return hash(JSON.stringify([seed,year,award,record.id,record.name,record.points,
      record.voters,record.criteria,rows])).toString(16).padStart(8,"0");
  }
  function settle(state,year){
    const nominees=shortlist(state,year),awards={};
    for(const award of ORDER){
      const rankings=rankByVotes(nominees,year,state.seed,award);
      const first=rankings[0];
      awards[award]={id:typeof first.id==="number"?first.id:null,name:first.name,
        points:first.points,model:3,year:Number(year),
        voters:award==="金球奖"?"100名模拟记者":"模拟教练、队长、媒体、球迷各100票",
        criteria:award==="金球奖"?"个人表现、所有已记录赛事、球队奖杯及位置贡献":
          "四组独立投票，按个人、团队、位置与选民偏好加权",
        rankings};
      awards[award].proof=proofFor(state.seed,year,award,awards[award]);
    }
    return awards;
  }
  function validHistory(state){
    if(state.awardHistory===undefined)return true;
    if(!state.awardHistory||typeof state.awardHistory!=="object"||Array.isArray(state.awardHistory))return false;
    const isValidWinner=(v,year)=>v&&typeof v.name==="string"&&v.name.length>0&&v.name.length<=80&&
      Number.isFinite(v.points)&&v.points>=0&&v.points<=8000&&
      (v.id===null&&v.name==="其他职业球员"||Number.isInteger(v.id)&&v.id>=1&&v.id<=11&&
      state.players[v.id-1].name===v.name&&state.players[v.id-1].seasons[year-state.startYear-1]?.apps>=10||
      v.model===3&&v.id===null&&v.name.startsWith("模拟候选"));
    for(const [yearText,values] of Object.entries(state.awardHistory)){
      const year=Number(yearText);
      if(!Number.isInteger(year)||String(year)!==yearText||year<state.startYear+2||year>state.year||
        !values||typeof values!=="object"||Array.isArray(values))return false;
      for(const award of ORDER){
        const v=values[award];
        if(!isValidWinner(v,year))return false;
        if(v.model!==3)continue; // preserve previously released legacy awards
        if(v.year!==year||!Array.isArray(v.rankings)||v.rankings.length!==30||
          typeof v.proof!=="string"||v.proof!==proofFor(state.seed,year,award,v)||
          v.voters!==(award==="金球奖"?"100名模拟记者":"模拟教练、队长、媒体、球迷各100票"))return false;
        const seen=new Set();
        let sum=0;
        for(let i=0;i<v.rankings.length;i++){
          const p=v.rankings[i];
          if(!p||p.rank!==i+1||!Number.isFinite(p.points)||p.points<0||p.points>6700||
            !Number.isFinite(p.score)||typeof p.reason!=="string"||p.reason.length>350||
            !["tracked","fictional"].includes(p.origin)||seen.has(p.id)||
            i&&p.points>v.rankings[i-1].points)return false;
          seen.add(p.id);sum+=p.points;
          if(p.origin==="tracked"){
            if(!Number.isInteger(p.id)||p.id<1||p.id>11||p.name!==state.players[p.id-1].name||
              state.players[p.id-1].seasons[year-state.startYear-1]?.apps<10)return false;
          }else if(p.id!=="sim:"+year+":"+Number(String(p.id).split(":")[2])||
            !p.name?.startsWith("模拟候选"))return false;
        }
        const first=v.rankings[0];
        if(first.name!==v.name||first.points!==v.points||
          (typeof first.id==="number"?first.id:null)!==v.id||
          Math.abs(sum-(award==="金球奖"?6700:100))>.3)return false;
      }
    }
    return true;
  }
  return Object.freeze({settle,shortlist,contestant,validHistory,ORDER,GROUPS});
});
