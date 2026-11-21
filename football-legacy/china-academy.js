(()=>{"use strict";
 const {players,sources}=window.ChinaAcademyData;
 const key="football-legacy-china-academy-v1";
 const $=id=>document.getElementById(id);
 const squads={u17:players.filter(p=>p.group==="u17"),senior:players.filter(p=>p.group==="senior")};
 const plans={passing:"传接配合",finishing:"射门终结",defending:"防守站位"};
 const fresh=()=>({week:0,plan:"passing",shape:"4-4-2",wins:0,draws:0,losses:0,stats:{},history:[]});
 const empty=()=>({apps:0,goals:0,assists:0,passing:0,finishing:0,defending:0});
 const byId=new Map(players.map(p=>[p.id,p]));
 let state=fresh(),view="u17",readable=true;
 try{
  const data=JSON.parse(localStorage.getItem(key));
  if(data){
   if(!validSave(data))throw Error("save");
   state=data;
  }
 }catch{readable=false;$("notice").textContent="青训进度暂时无法读取，请检查浏览器存储后刷新。"}
 function validSave(data){
  const count=n=>Number.isSafeInteger(n)&&n>=0;
  if(![data.week,data.wins,data.draws,data.losses].every(count)||data.wins+data.draws+data.losses!==data.week||
   !Object.hasOwn(plans,data.plan)||!["4-4-2","4-3-3"].includes(data.shape)||!data.stats||!Array.isArray(data.history))return false;
  if(!Object.entries(data.stats).every(([id,record])=>byId.has(id)&&record&&Object.keys(empty()).every(k=>count(record[k]))))return false;
  return data.history.length===Math.min(12,data.week)&&data.history.every((m,i)=>m&&m.week===data.week-i&&
   count(m.home)&&count(m.away)&&Array.isArray(m.goals)&&m.goals.length===m.home+m.away&&
   m.goals.every(g=>g&&byId.has(g.scorer)&&(!g.helper||byId.has(g.helper)))&&Array.isArray(m.lineups)&&
   m.lineups.length===2&&m.lineups.every(xi=>Array.isArray(xi)&&xi.length===11&&xi.every(id=>byId.has(id))));
 }
 function lineup(group,shape,week){
  const [backs,mids,forwards]=shape.split("-").map(Number);
  return [["门将",1],["后卫",backs],["中场",mids],["前锋",forwards]].flatMap(([role,count])=>{
   const pool=squads[group].filter(p=>p.role===role);
   return Array.from({length:count},(_,i)=>pool[(week+i)%pool.length]);
  });
 }
 function drawPlayer(pool,weights){
  let ticket=Math.random()*pool.reduce((n,p)=>n+weights[p.role],0);
  for(const p of pool){ticket-=weights[p.role];if(ticket<0)return p}
  return pool[pool.length-1];
 }
 function playWeek(next){
  const youth=lineup("u17",next.shape,next.week),senior=lineup("senior","4-4-2",next.week);
  for(const p of players)next.stats[p.id]??=empty();
  for(const p of squads.u17)next.stats[p.id][next.plan]++;
  for(const p of [...youth,...senior])next.stats[p.id].apps++;
  const progress=field=>Math.min(1,youth.reduce((sum,p)=>sum+next.stats[p.id][field],0)/(12*youth.length));
  const attack=.16+.08*progress("finishing")+.035*progress("passing")+(next.shape==="4-3-3"?.025:0);
  const opposing=.30-.085*progress("defending")+(next.shape==="4-3-3"?.025:0);
  const goals=[];
  function chances(side,xi,chance){
   const outfield=xi.filter(p=>p.role!=="门将");
   for(let attempt=0;attempt<7;attempt++){
    if(Math.random()>=chance)continue;
    const scorer=drawPlayer(outfield,{"后卫":1,"中场":3,"前锋":7});
    const helper=Math.random()<.68+(side==="u17"?.15*progress("passing"):0)
     ?drawPlayer(outfield.filter(p=>p!==scorer),{"后卫":2,"中场":6,"前锋":3}):null;
    next.stats[scorer.id].goals++;if(helper)next.stats[helper.id].assists++;
    goals.push({side,scorer:scorer.id,helper:helper?.id||null});
   }
  }
  chances("u17",youth,attack);chances("senior",senior,opposing);
  const home=goals.filter(g=>g.side==="u17").length,away=goals.length-home;
  next[home===away?"draws":home>away?"wins":"losses"]++;
  next.week++;
  next.history.unshift({week:next.week,home,away,goals,lineups:[youth,senior].map(xi=>xi.map(p=>p.id))});
  next.history=next.history.slice(0,12);
 }
 function commit(change){
  if(!readable)return;
  const next=structuredClone(state);
  change(next);
  try{localStorage.setItem(key,JSON.stringify(next));state=next;$("notice").textContent=""}
  catch{$("notice").textContent="本次进度未能保存，请先检查浏览器存储空间。"}
  render();
 }
 const sourceLink=id=>'<a href="'+sources[id][1]+'" target="_blank" rel="noopener noreferrer">'+sources[id][0]+'</a>';
 function renderRoster(){
  $("u17").setAttribute("aria-pressed",String(view==="u17"));$("senior").setAttribute("aria-pressed",String(view==="senior"));
  $("roster").innerHTML=squads[view].map(p=>{
   const s=state.stats[p.id]||empty(),y=p.group==="u17";
   const links=y?[sourceLink("fifa")]:[sourceLink("cfa"),sourceLink(p.weightSource==="xie"?"xie":"sina")];
   if(p.weightSource&&(y||p.weightSource==="huang"))links.push(sourceLink(p.weightSource));
   return '<details class="player"><summary><strong>'+p.name+'</strong> · '+p.role+(y?' · '+p.number+' 号':'')+'</summary>'+
    '<dl><dt>所属球队</dt><dd>'+p.club+'</dd><dt>出生日期</dt><dd>'+p.born+'</dd><dt>登记身高</dt><dd>'+p.height+' cm</dd><dt>登记体重</dt><dd>'+(p.weight?p.weight+' kg':'暂无可核实资料')+'</dd></dl>'+
    '<p>教学赛 '+s.apps+' 场 · '+s.goals+' 球 · '+s.assists+' 助攻</p>'+
    (y?'<small>传接 '+s.passing+' 周 · 射门 '+s.finishing+' 周 · 防守 '+s.defending+' 周</small>':'')+
    '<p><small>'+links.join('<br>')+'</small></p></details>';
  }).join("");
 }
 function render(){
  $("plan").value=state.plan;$("shape").value=state.shape;
  const latest=state.history[0],name=id=>byId.get(id)?.name||"";
  $("report").innerHTML=latest?'<h3>第 '+state.week+' 周 · 教学赛结果</h3><p class="score">中国 U17 '+latest.home+' ∶ '+latest.away+' 成年国足</p>'+
   '<p>青训队累计 '+state.wins+' 胜 '+state.draws+' 平 '+state.losses+' 负</p><details><summary>本场首发与进球</summary>'+
   latest.lineups.map((xi,i)=>'<p><b>'+(i?'国足':'U17')+'首发</b> '+xi.map(name).join('、')+'</p>').join("")+
   (latest.goals.length?latest.goals.map(g=>'<p>'+name(g.scorer)+' 进球'+(g.helper?' · '+name(g.helper)+' 助攻':'')+'</p>').join(""):'<p>本场没有进球。</p>')+'</details>'+
   '<details><summary>最近 '+state.history.length+' 场教学赛</summary>'+state.history.map(m=>'<p>第 '+m.week+' 周 · U17 '+m.home+' ∶ '+m.away+' 国足</p>').join("")+'</details>':'<p class="muted">尚未开赛。选择训练重点后开始第一周。</p>';
  renderRoster();
 }
 for(const group of ["u17","senior"])$(group).onclick=()=>{view=group;renderRoster()};
 for(const id of ["plan","shape"])$(id).onchange=()=>commit(next=>{next[id]=$(id).value});
 $("week").onclick=()=>commit(playWeek);
 $("camp").onclick=()=>commit(next=>{for(let i=0;i<12;i++)playWeek(next)});
 render();
})();
