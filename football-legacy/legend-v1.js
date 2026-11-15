(function(root){
"use strict";
// 绿茵传奇 v1.0.0: additive game mechanics. Optional in older smoke-test harnesses.
// Player properties are persisted in the existing dual-career save; no new storage key.
const cap=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(v)?v:0));
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ageByRole={GK:37,CB:36,CDM:36,CM:36,CAM:35,ST:34,LW:33,RW:33};
const growthByRole={GK:28,CB:27,CDM:26,CM:26,CAM:25,ST:24,LW:23,RW:23};
function ensure(p){
 if(!p)return {discipline:50,ambition:50,composure:50,loyalty:50,peakShift:0};
 if(!p.legendProfile || p.legendProfile.version!==1){
  const pick=()=>Math.round(35+Math.random()*45);
  p.legendProfile={version:1,discipline:pick(),ambition:pick(),composure:pick(),loyalty:pick(),
    peakShift:Math.floor(Math.random()*3)-1,goodStreak:0,badStreak:0};
 }
 return p.legendProfile;
}
function declineAge(p){
 const v=ensure(p);
 return cap((ageByRole[p?.position]??35)+v.peakShift,31,38);
}
function growthAge(p){
 const v=ensure(p);
 return cap((growthByRole[p?.position]??24)+v.peakShift,21,29);
}
function tacticalShift(p,choice){
 const t=ensure(p),formation=p?.parentCoach?.formation||"4-3-3";
 const style=choice==="attack"?1.1:choice==="creative"?.8:choice==="defend"?-.35:0;
 const roleMatch=(formation==="4-2-3-1"&&["CAM","CDM"].includes(p?.position))||
  (formation==="3-5-2"&&["ST","CM","CB"].includes(p?.position))||
  (formation==="4-3-3"&&["LW","RW"].includes(p?.position));
 return cap(style+(roleMatch?.8:0)+(t.composure-55)/110,-1,2.4);
}
function volatility(difference,random=Math.random){
 const gap=Math.abs(Number(difference)||0);
 if(gap<9||random()>=cap(.055+gap/500,.07,.135))return {home:1,away:1,shock:false};
 // Rare underdog surge changes goal rates, never rewrites a scheduled or shared score.
 return difference>0?{home:.92,away:1.36,shock:true}:{home:1.36,away:.92,shock:true};
}
function afterMatch(p,played,rating,forGoals,againstGoals,random=Math.random){
 const t=ensure(p);
 if(!played){p.seasonForm=cap((p.seasonForm||0)*.92-.025,-.9,.9);return}
 const current=Number(p.seasonForm)||0;
 const result=(forGoals>againstGoals?.04:forGoals<againstGoals?-.05:0);
 const performance=cap((rating-6.7)/8,-.22,.24);
 const resilience=(t.composure-55)/850;
 p.seasonForm=cap(current*.83+performance+result+resilience+(random()-.5)*.035,-.9,.9);
 t.goodStreak=rating>=7.6?(t.goodStreak||0)+1:0;
 t.badStreak=rating<=6.0?(t.badStreak||0)+1:0;
}
function salaryMultiplier(p){
 const t=ensure(p),contract=Number(p?.contract)||0;
 return cap(.92+(t.ambition-50)/900+(p?.fame||0)/850+(contract<=1?.07:0),.86,1.19);
}
function highlight(p,match,teamPower,opponentPower){
 if(!match||!match.played)return "";
 const isWin=match.hs!==match.as && ((match.home===p.club&&match.hs>match.as)||(match.away===p.club&&match.as>match.hs));
 const upset=isWin&&teamPower+9<opponentPower;
 if(upset)return "赛后聚焦："+p.club+"顶住实力差距，拿下关键冷门。";
 if((match.goals||0)>=3)return "赛后聚焦："+p.name+"上演帽子戏法，成为本场焦点。";
 if((match.assists||0)>=3)return "赛后聚焦："+p.name+"送出至少三次助攻，组织表现突出。";
 if(match.rating>=8.6)return "赛后聚焦："+p.name+"表现抢眼，赛后评分"+match.rating+"。";
 if(match.redCard)return "赛后聚焦：红牌改变了双方的比赛节奏。";
 return "";
}
function dynasty(x){
 const rows=(x?.history||[]).slice().reverse();const club=x?.player?.club;
 let count=0;
 for(const row of rows){if(row.club===club&&row.rank===1)count++;else break}
 return count>=3?"联赛王朝 · "+count+"连冠":count===2?"两连冠 · 冲击王朝":count===1?"上赛季联赛冠军":"尚未形成连续联赛冠军";
}
function historicalStatus(x){
 const p=x.player;const goal=p.career?.goals||0;
 const titles=(x.honors||[]).filter(h=>h.type==="team"&&h.name?.includes("冠军")).length;
 if(goal>=300&&titles>=6)return "世界级传奇";
 if(goal>=180&&titles>=3)return "足坛传奇";
 if(goal>=70||titles>=2)return "联赛名将";
 return "职业生涯积累中";
}
function overview(games,shared){
 if(!games?.wang?.player||!games?.vini?.player)return "";
 const html=["wang","vini"].map(id=>{
  const x=games[id],p=x.player,t=ensure(p);
  const state=(p.seasonForm||0)>.25?"状态火热":(p.seasonForm||0)<-.25?"状态低迷":"状态正常";
  const contract=Math.max(0,Number(p.contract)||0);
  const appraisal=Number.isFinite(p.marketValue)?p.marketValue:null;
  return '<div class="item"><b>'+escape(p.name)+'</b> · '+escape(historicalStatus(x))+
   '<p class="muted small">动态衰退起点：'+declineAge(p)+'岁 · '+escape(state)+
   ' · 连续高分 '+(t.goodStreak||0)+'场 · 连续低分 '+(t.badStreak||0)+'场</p>'+
   '<p class="muted small">性格：野心 '+t.ambition+' / 抗压 '+t.composure+' / 忠诚 '+t.loyalty+
   ' · 合同剩余 '+contract+'年'+(appraisal===null?'':' · 原有系统估值 '+escape(appraisal))+'</p>'+
   '<p class="muted small">'+escape(dynasty(x))+'</p></div>';
 }).join("");
 const a=games.wang.player,b=games.vini.player;
 const aInfluence=(a.career?.goals||0)+(a.career?.assists||0),bInfluence=(b.career?.goals||0)+(b.career?.assists||0);
 const rivalry=aInfluence===bInfluence?"职业生涯直接贡献持平":aInfluence>bInfluence?escape(a.name)+"暂时领先":" "+escape(b.name)+"暂时领先";
 const current=Math.max(Number(games.wang.year)||0,Number(games.vini.year)||0);
 const ceremony=shared?.awards?.[current-1];
 return '<section class="card gap"><h2>绿茵传奇 v1.0.0 · 生涯动态</h2><div class="grid2">'+html+
 '</div><p class="muted small gap">双星竞争：'+rivalry+'（只比较一线队进球与助攻，不影响更衣室和谐）。</p>'+
 (ceremony?.winner?'<p class="gold">上届年度盛典 · '+escape(ceremony.year)+'年金球奖：'+escape(ceremony.winner.name)+'（'+escape(ceremony.winner.points)+'分）</p>':'')+
 '<p class="muted small">本模块为新增生涯机制；旧存档使用原有存储键，比赛仍遵循双星共享比分。</p></section>';
}
const api=Object.freeze({ensure,declineAge,growthAge,tacticalShift,volatility,afterMatch,salaryMultiplier,highlight,dynasty,historicalStatus,overview});
root.GreenLegend=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
