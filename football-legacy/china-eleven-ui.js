/* 绿茵传奇11人 · 国足11人共享生涯页面（独立于旧三人生涯存档） */
(function(){
  "use strict";
  const root=document.getElementById("eleven-app");
  if(!root||!window.ElevenCareerCore)return;
  const core=window.ElevenCareerCore;
  const STORE="football-legacy-china-eleven-career-v1";
  const roster=window.ChinaAcademyData&&window.ChinaAcademyData.players||[];
  const squad=window.AcademySquad;
  const clubSquads=window.ClubSquadData||{clubs:{},players:[]};
  const people=squad.catalog(window.ChinaAcademyData,window.WorldCupSquads,core.BASE,clubSquads.players);
  function preset(team){return clubSquads.clubs[team]?.starterNames.slice()||Array(11).fill("");}
  const draft={country:"中国",team:squad.systems.中国[0],seed:20261122,picks:Array(11).fill(""),together:false};
  let picking=false, unavailableSave=null;
  const PLACEHOLDER="尚未核实";
  let saveNotice="";
  let game;
  let selected=9;
  let raw;
  try {
    raw=localStorage.getItem(STORE);
    const candidate=raw?JSON.parse(raw):null;
    game=candidate&&core.isValid(candidate)?candidate:core.create(20261122,roster);
    if(raw&&!core.isValid(candidate)){unavailableSave=raw;saveNotice="本机进度无法读取。请先下载原始存档，再开始新生涯。"}
  }catch(e){
    unavailableSave=raw||null;game=core.create(20261122,roster);
    saveNotice="浏览器本地存储不可读，可先导出原文或本次进度。";
  }
  const escape=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
  const labels=squad.labels;
  const latest=function(p){return p.seasons[p.seasons.length-1]||null;};
  function persistence(){
    if(unavailableSave)return false;
    try{localStorage.setItem(STORE,JSON.stringify(game));saveNotice="";return true;}
    catch(e){saveNotice="浏览器未能保存11人生涯。建议使用“导出存档”备份当前进度。";return false;}
  }
  function average(){return (game.players.reduce((sum,p)=>sum+p.rating,0)/game.players.length).toFixed(1);}
  function nameShort(name){return name.startsWith("拜合拉木")?"拜合拉木":name;}
  function card(p){
    const active=p.id===selected;
    const stats=latest(p);
    return '<button type="button" class="eleven-player'+(active?" active":"")+'" data-eleven-player="'+p.id+'" aria-pressed="'+active+'" aria-label="查看'+escape(p.name)+'的生涯">'+
      '<span class="eleven-shirt">'+escape(p.number)+'</span>'+
      '<span class="eleven-player-name">'+escape(nameShort(p.name))+'</span>'+
      '<span class="eleven-role">'+escape(labels[p.position]||p.position)+' · '+p.age+'岁</span>'+
      '<span class="eleven-rating">能力 '+p.rating+'</span>'+
      '<span class="eleven-league">'+escape(stats?stats.league:"青训起步")+'</span></button>';
  }
  function internationalRecord(p){
    const years=Object.entries(game.nationalFixtures||{});
    const appearances=years.flatMap(([year,matches])=>matches
      .filter(m=>m.lineups.some(line=>line.includes(p.id))).map(m=>({year,match:m}))).reverse();
    const youth=appearances.filter(row=>row.match.level!=="成年队").length;
    const name=id=>escape(game.players[id-1].name);
    const entries=appearances.map(({year,match:m})=>{
      const goals=m.goals.filter(([,scorer])=>scorer===p.id).length;
      const assists=m.goals.filter(([,,helper])=>helper===p.id).length;
      const participants=m.lineups.map((line,i)=>line.length?escape(i===0?m.home:m.away)+" · "+line.map(name).join("、"):"").filter(Boolean).join(" / ");
      return '<li><strong>'+year+' · '+m.level+' · '+escape(m.home)+' '+m.score.join("–")+' '+escape(m.away)+'</strong>'+
        '<br>联赛第 '+m.round+' 轮后 · '+goals+' 球 '+assists+' 助攻<br><small>本阵容出场：'+participants+'</small></li>';
    }).join("");
    const empty=years.length?"已记录赛季内暂无代表队出场。":"模拟下一季后可查看逐场国家队记录。";
    return '<details data-national-record><summary>国家队比赛履历 · 成年 '+p.careerCaps+' 场</summary>'+
      (years.length?'<p>'+escape(years[0][0])+' 赛季起的逐场记录 · 青年队 '+youth+' 场 · 成年队 '+(appearances.length-youth)+' 场</p>':'')+
      (entries?'<ol>'+entries+'</ol>':'<p>'+empty+'</p>')+'</details>';
  }
  function cupRecord(p){
    const {winner,stageNames}=window.ElevenDomesticCup;
    const entries=[];
    for(const s of p.seasons.slice().reverse()){
      const cup=game.cupHistory?.[s.year]?.find(c=>c.country===core.domesticAssociation(s.league));
      if(!cup)continue;
      const final=cup.matches.at(-1),champion=winner(final);
      const path=cup.matches.filter(m=>m.home===s.club||m.away===s.club);
      const last=path.at(-1),outcome=s.club===champion?"冠军":stageNames[last.round]+"出局";
      const games=cup.matches.map(m=>{
        const tracked=m.home===s.club||m.away===s.club;
        const played=m.lineups.some(line=>line.includes(p.id));
        const goals=m.goals.filter(([,id])=>id===p.id).length;
        const assists=m.goals.filter(([,,id])=>id===p.id).length;
        const score=escape(m.home)+" "+m.score.join("–")+" "+escape(m.away);
        const penalties=m.penalties?" · 点球 "+m.penalties.join("–"):"";
        const display=stageNames[m.round]+" · "+score+penalties;
        return "<li>"+(tracked?"<strong>"+display+"</strong>":display)+
          (tracked?" · "+(played?"出场 · "+goals+" 球 "+assists+" 助攻":"未出场"):"")+"</li>";
      }).join("");
      entries.push('<details><summary>'+s.year+' · '+escape(s.club)+' · '+outcome+'</summary><p>'+
        escape(cup.country)+'国内杯 · 冠军 '+escape(champion)+'</p><ol>'+games+'</ol></details>');
    }
    const empty=game.age<18?"18 岁升入职业队后参加国内杯。":"这份存档保留了原有荣誉，当时未记录逐场杯赛对阵。";
    return '<details data-cup-record><summary>国内杯对阵与个人表现</summary>'+
      (entries.length?entries.join(""):'<p>'+empty+'</p>')+'</details>';
  }
  function competitionRows(p){
    const api=window.ElevenCompetitionLedger;
    const record=api?.career(game,p.id);
    if(!record||!record.seasons.length)return "";
    const recent=record.seasons.at(-1);
    const rows=[["联赛",recent.league],["国内杯",recent.cup],
      ["国家队",recent.national],["赛季合计",recent.total]];
    const body=rows.map(([label,data])=>'<tr><td>'+label+'</td><td>'+data.apps+
      '</td><td>'+data.goals+'</td><td>'+data.assists+'</td><td>'+data.cleanSheets+'</td></tr>').join("");
    const total=record.total;
    return '<details class="eleven-competition-ledger"><summary>三项赛事统一数据台账</summary>'+
      '<p>本赛季各赛事分开统计，合计不重复计入进球、助攻或出场。零封只统计登场的门将和后卫。</p>'+
      '<div class="eleven-scroll"><table class="eleven-history"><thead><tr><th>赛事</th><th>出场</th>'+
      '<th>进球</th><th>助攻</th><th>零封</th></tr></thead><tbody>'+body+'</tbody></table></div>'+
      '<p><b>职业生涯总计：</b>'+total.apps+'场 · '+total.goals+'球 · '+total.assists+
      '助攻 · '+total.cleanSheets+'次零封 · 成年国家队'+record.adultCaps+
      '场 · 国内杯冠军'+record.cupTitles+'次</p></details>';
  }
  function detail(p){
    const height=p.adultHeight?escape(p.adultHeight)+" cm":"未核实";
    const weight=p.adultWeight?escape(p.adultWeight)+" kg":"未核实";
    const attrs=p.attributes||[];
    const titles=["速度","耐力","力量","技术","防守"];
    const history=p.seasons.length?p.seasons.slice().reverse().map(s=>
      '<tr><td>'+s.age+'岁</td><td>'+escape(s.league)+'</td><td>'+escape(s.club)+'</td><td>'+s.rating+'</td><td>'+s.apps+'</td><td>'+s.goals+'</td><td>'+s.assists+'</td><td>'+s.caps+'</td></tr>'
    ).join(""):'<tr><td colspan="8" class="eleven-empty">尚未开始模拟赛季，点击“模拟下一年”。</td></tr>';
    const meta='<div class="eleven-facts">'+
      '<div><small>出生日期</small><strong>'+escape(p.born||PLACEHOLDER)+'</strong></div>'+
      '<div><small>报名参考身高</small><strong>'+height+'</strong></div>'+
      '<div><small>报名参考体重</small><strong>'+weight+'</strong></div>'+
      '<div><small>16岁身高估算（游戏）</small><strong>'+(p.youthHeightEstimate?escape(p.youthHeightEstimate)+" cm":"未提供")+'</strong></div>'+
      '<div><small>16岁体重估算（游戏）</small><strong>'+(p.youthWeightEstimate?escape(p.youthWeightEstimate)+" kg":"未提供")+'</strong></div>'+
      '<div><small>16岁能力估算</small><strong>'+(p.initialRating??core.BASE[p.id-1][4])+'</strong></div>'+
      '<div><small>模拟成长潜力</small><strong>'+p.potential+'</strong></div>'+
      '<div><small>成年国家队生涯出场（模拟）</small><strong>'+p.careerCaps+'</strong></div></div>';
    const metrics='<div class="eleven-metrics">'+attrs.map((v,i)=>'<div><span>'+titles[i]+'</span><b>'+v+'</b><div class="eleven-bar"><i style="width:'+v+'%"></i></div></div>').join("")+'</div>';
    const worldTitles=["金球奖","世界足球先生"].map(award=>{
      const years=Object.entries(game.awardHistory||{}).filter(([,votes])=>votes?.[award]?.id===p.id).map(([year])=>escape(year));
      return award+" · "+(years.length?years.join("、")+" 赛季获奖":"暂无获奖记录");
    }).join("<br>");
    const summary='<p class="eleven-club"><b>16岁青训起点（游戏设定）：</b>'+escape(p.academy)+'<br><b>代表协会：</b>'+escape(p.country||"中国")+' · '+escape(p.nationalStage||"青训阶段")+'<br><b>当前球队：</b>'+escape(p.club)+' · '+escape(p.league)+'</p>'+
      '<p class="eleven-disclaimer">公开生日及成年身高、体重仅在资料可核实时显示，未核实的字段不会编造。16岁身高、体重、能力、潜力与青训路径均为游戏估算，并非历史数据。'+(p.profileUrl?'<a href="'+escape(p.profileUrl)+'" target="_blank" rel="noopener noreferrer">查看公开资料来源</a>':'')+'</p>';
    return '<section class="card eleven-detail" aria-label="'+escape(p.name)+'职业生涯详情">'+
      '<div class="eleven-detail-top"><div><span class="eleven-eyebrow">球员生涯档案 · '+escape(labels[p.position]||p.position)+'</span><h2>'+escape(p.name)+'</h2></div>'+
      '<div class="eleven-big-rating"><b>'+p.rating+'</b><small>综合能力</small></div></div>'+
      summary+meta+metrics+'<p>'+worldTitles+'</p><p>本季估算身价 · '+(latest(p)?.marketValue?new Intl.NumberFormat('zh-CN',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(latest(p).marketValue):'待赛季结算')+'</p><p>个人与球队荣誉 · '+(p.seasons.flatMap(s=>[s.squadAward,s.trophy].filter(Boolean).map(t=>s.year+' '+escape(t))).join('、')||'暂无')+'</p>'+
      '<h3>逐赛季职业生涯</h3><div class="eleven-scroll"><table class="eleven-history"><thead><tr><th>年龄</th><th>联赛</th><th>俱乐部</th><th>能力</th><th>场次</th><th>进球</th><th>助攻</th><th>成年国家队出场</th></tr></thead><tbody>'+history+'</tbody></table></div>'+
      competitionRows(p)+internationalRecord(p)+cupRecord(p)+'<p class="eleven-disclaimer">每季五个模拟友谊赛比赛日，按位置、近期联赛表现和伤停选人。国内杯采用单场淘汰，平局由点球决胜。</p></section>';
  }
  function leaderboard(){
    const rows=window.ElevenCareerRankings?.rank(game)||[];
    if(rows.length!==11)return "";
    const winners=rows.filter(p=>p.ballonYears.length);
    const champions=winners.length?winners.map(p=>escape(p.name)+"（"+p.ballonYears.join("、")+"）").join("、"):
      "截至当前模拟年份，队内暂无金球奖得主。";
    const heading=game.age===16?"16岁开档实力榜 · 1—11名":"职业生涯综合排名 · 1—11名";
    return '<section class="card eleven-leaderboard" aria-label="十一人职业生涯排行榜">'+
      '<h2>'+heading+'</h2>'+
      '<p class="eleven-disclaimer">只依据本次游戏已经模拟的赛季数据排名，不是现实世界的球员能力或金球奖预测。积分考虑金球奖、世界足球先生、五大联赛经历、最高能力、出场、国家队、杯赛及位置贡献；相同存档得出相同排名。</p>'+
      '<p class="eleven-ranking-awards"><strong>队内金球奖第一：</strong>'+champions+'</p>'+
      '<p><a class="button goldbtn" href="./awards.html">年度颁奖典礼 · 查看完整榜单与投票理由</a></p>'+
      '<div class="eleven-ranking-list">'+rows.map(p=>{
        const league=p.topFiveLeagues.length?p.topFiveLeagues.join("、"):"尚未进入";
        const ballon=p.ballonYears.length?" · 金球奖 "+p.ballonYears.length+"次":"";
        const world=p.worldYears.length?" · 世界足球先生 "+p.worldYears.length+"次":"";
        const active=p.id===selected;
        return '<button type="button" class="eleven-ranking-row'+(active?" active":"")+
          '" data-eleven-player="'+p.id+'" aria-label="查看第'+p.rank+'名'+escape(p.name)+'的职业生涯">'+
          '<b class="eleven-ranking-place">#'+p.rank+'</b>'+
          '<span class="eleven-ranking-person"><strong>'+escape(p.name)+'</strong>'+
          '<small>五大联赛：'+escape(league)+'（'+p.topFiveYears+'季）'+ballon+world+'</small>'+
          '<small>最高能力 '+p.peak+' · 联赛 '+p.apps+'场 · '+p.goals+'球 · '+p.assists+'助攻 · 国家队 '+p.caps+'场</small></span>'+
          '<span class="eleven-ranking-points">'+p.points.toFixed(1)+'分</span></button>';
      }).join("")+'</div>'+
      '<p class="eleven-disclaimer">门将与防守球员的贡献包含零封，避免只按进球数评判。点击任意球员可查看其职业生涯。</p></section>';
  }
  function rosterPicker(){
    if(!picking)return "";
    const options=(values,value)=>values.map(v=>{
      const name=typeof v==="string"?v:v.name,label=typeof v==="string"?v:v.label;
      return '<option value="'+escape(name)+'" '+(name===value?'selected':'')+'>'+escape(label)+'</option>';
    }).join("");
    const slots=squad.formation.map((pos,i)=>{
      // Every club's starters and bench are available, regardless of the
      // selected training academy or the player's national association.
      const clubGroups=Object.keys(clubSquads.clubs).map(team=>{
        const clubChoices=people.filter(p=>p.team===team&&squad.eligible(p,i)
          &&(p.name===draft.picks[i]||!draft.picks.includes(p.name)));
        return ["starter","bench"].map(status=>{
          const subset=clubChoices.filter(p=>p.squadStatus===status);
          return subset.length?'<optgroup label="'+escape(team)+' · '+(status==="starter"?"推荐首发":"替补候选")+'">'
            +options(subset.map(p=>({name:p.name,label:p.name})),draft.picks[i])+'</optgroup>':"";
        }).join("");
      }).join("");
      const groups=Object.keys(squad.systems).map(country=>{
        const pool=people.filter(p=>p.country===country&&squad.eligible(p,i)&&(p.name===draft.picks[i]||!draft.picks.includes(p.name)));
        return '<optgroup label="'+country+'">'+options(pool.map(p=>p.name),draft.picks[i])+'</optgroup>';
      }).join("");
      return '<label>'+labels[pos]+'<select data-pick="'+i+'"><option value="">按位置自动补齐</option>'+clubGroups+groups+'</select></label>';
    }).join("");
    const c=clubSquads.clubs[draft.team];
    const detail=c?'<details class="eleven-club-roster"><summary>'+escape(draft.team)+' 2026/27 · 推荐首发11人 / 替补'+c.benchNames.length+'人</summary>'+
      '<p>仅根据官方一线队名单排列的游戏推荐阵容，非真实比赛首发。每位球员从16岁开始重新模拟。</p>'+
      ['starterNames','benchNames'].map((key,i)=>'<p><strong>'+(i?'替补候选':'推荐首发')+'：</strong>'+
        c[key].map(name=>{
          const p=people.find(row=>row.name===name);
          return escape(name)+'（16岁能力估算 '+(p?.initialRating??'—')+' / 潜力估算 '+(p?.potential??'—')+'）';
        }).join('、')+'</p>').join('')+
      '<p><a href="'+escape(c.source)+'" target="_blank" rel="noopener noreferrer">查看俱乐部官方一线队名单</a></p></details>':"";
    return '<section class="card" id="squad-picker"><h2>组建首发阵容</h2><p>可选皇马、巴萨、拜仁、巴黎的2026/27官方一线队成员；每队预置游戏推荐11人，并可使用替补换人。首发只是游戏阵容建议，并非指定比赛的官方首发。空位按位置自动补齐。</p><div class="pick-grid">'+
      '<label>青训体系<select data-team-setting="country">'+options(Object.keys(squad.systems),draft.country)+'</select></label>'+
      '<label>青训母队<select data-team-setting="team">'+options(squad.systems[draft.country],draft.team)+'</select></label>'+
      '<label>模拟种子<input type="number" min="0" max="4294967295" step="1" data-team-setting="seed" value="'+escape(draft.seed)+'"></label></div>'+
      detail+'<div class="pick-grid">'+slots+'</div><label><input type="checkbox" data-team-setting="together" '+(draft.together?'checked':'')+'> 18岁后整队留在母队（不勾选则允许球员各自转会）</label>'+
      '<div class="eleven-actions"><button class="button primary" data-eleven-action="build">确认阵容，从16岁开始</button><button class="button" data-eleven-action="cancel">取消</button></div></section>';
  }
  function teamMatches(p){
    const matches=(game.fixtures?.[game.year]||[]).filter(m=>m.league===p.league&&(m.home===p.club||m.away===p.club));
    if(!matches.length)return "";
    return '<details class="card"><summary>'+escape(p.club)+' · 本季 '+matches.length+' 场比赛</summary><ol>'+matches.map(m=>{
      const scores=m.goals.map(([side,scorer,helper])=>{
        const name=id=>game.players.find(person=>person.id===id)?.name||"轮换球员";
        return escape(side===0?m.home:m.away)+'：'+escape(name(scorer))+(helper?'（'+escape(name(helper))+' 助攻）':'');
      }).join('、');
      return '<li>第 '+m.round+' 轮 · '+escape(m.home)+' '+m.score.join('–')+' '+escape(m.away)+(scores?'<br><small>'+scores+'</small>':'')+'</li>';
    }).join('')+'</ol></details>';
  }
  function legacyKeys(){
    try{return Object.keys(localStorage).filter(k=>k.startsWith("football-dynasty-")||k==="football-legacy-china-academy-v1")}catch{return []}
  }
  function download(body,name){
    const blob=new Blob([body],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function render(){
    if(!core.isValid(game)){root.textContent="11人生涯数据无效。请刷新页面重建。";return;}
    const p=game.players.find(x=>x.id===selected)||game.players[0];
    const years=game.age-16;
    const last=game.players.filter(x=>x.seasons.length).map(x=>({name:x.name,...latest(x)}));
    const injuries=last.filter(x=>x.injuryGames>0);
    const clubs=new Set(game.players.map(x=>x.club)).size;
    const mini=years>0?'<div class="eleven-season-notes">上赛季：'+last.length+'人共同推进；'+injuries.length+'人发生模拟伤停；'+clubs+' 支俱乐部有本阵容球员。点击任何球员查看个人历史。</div>':
      '<div class="eleven-season-notes">全队从 16 岁起步。点击任意球员查看真实基础资料与模型能力值。</div>';
    const rows=[
      [game.players[8],game.players[10],game.players[9]],
      [game.players[7],game.players[6],game.players[5]],
      [game.players[4],game.players[2],game.players[3],game.players[1]],
      [game.players[0]]
    ];
    root.innerHTML='<div class="eleven-summary card"><div class="eleven-intro">'+
      '<span class="eleven-eyebrow">'+escape(game.fixture||"首发阵容")+'</span>'+
      '<h1>'+escape(game.squad?game.squad.team+" · 十一人生涯":"国足十一人生涯")+'</h1>'+
      '<p>按位置组成一支球队，点选球员可查看成长、比赛和荣誉。当前职业道路：'+(game.squad?.together?'整队留在母队':'18岁后允许各自转会')+'。</p></div>'+
      '<div class="eleven-dashboard"><div><small>模拟年份</small><b>'+game.year+'</b></div><div><small>统一年龄</small><b>'+game.age+'岁</b></div><div><small>阵容人数</small><b>11 / 11</b></div><div><small>平均能力</small><b>'+average()+'</b></div></div>'+
      '<div class="eleven-actions"><button type="button" class="button primary" data-eleven-action="next" '+(game.age>=35?"disabled":"")+'>模拟下一年</button>'+
      '<button type="button" class="button goldbtn" data-eleven-action="five" '+(game.age>=35?"disabled":"")+'>连续模拟5年</button>'+
      '<button type="button" class="button" data-eleven-action="retire" '+(game.age>=35?"disabled":"")+'>一键模拟至35岁</button>'+
      '<button type="button" class="button outline" data-eleven-action="export">导出11人存档</button>'+
      '<button type="button" class="button outline" data-eleven-action="reset">选择青训体系与阵容</button>'+
      (game.squad?.together&&!unavailableSave&&game.age<35?'<button type="button" class="button outline" data-eleven-action="allow-transfers">解除留队限制（下赛季起）</button>':'')+'</div>'+
      (unavailableSave?'<button class="button" data-eleven-action="recover">下载无法读取的存档</button>':'')+
      '<p class="eleven-save-notice" role="status">'+escape(saveNotice)+'</p>'+
      '</div>'+rosterPicker()+'<section class="eleven-squad" aria-label="首发11人阵容"><div class="eleven-squad-head"><div><h2>11人首发阵容</h2><p>4-3-3 排列 · 单击查看职业生涯</p></div><span>模拟进度 '+years+' / 19 年</span></div>'+
      '<div class="eleven-pitch">'+rows.map(line=>'<div class="eleven-line">'+line.map(card).join("")+'</div>').join("")+'</div>'+
      mini+'</section>'+leaderboard()+teamMatches(p)+detail(p)+
      '<div class="eleven-links"><p>球员资料 · <a href="https://www.thecfa.cn/nanzuwqmd/20261107/38400.html">中国足协集训名单</a> · <a href="https://fdp.fifa.org/assetspublic/ce303/pdf/SquadLists-English.pdf#page=8">中国 U17 报名表</a> · <a href="https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf">四国世界杯报名表</a> · <a href="https://xinwen.bjd.com.cn/content/s6afd4e91e4b0e42f8f03106e.html">国足对巴林首发</a></p>'+
      (legacyKeys().length?'<button class="button" data-eleven-action="archive">下载历史存档原文</button>':'')+
      '<label>导入十一人存档 <input type="file" data-save-import accept="application/json,.json"></label></div>';
  }
  root.addEventListener("change",async event=>{
    const input=event.target;
    if(input.hasAttribute("data-save-import")){
      const file=input.files[0];if(!file)return;
      try{
        if(file.size>10000000)throw Error("文件过大");
        const data=JSON.parse(await file.text());
        if(data.format!=="china-eleven-career-v1"||!core.isValid(data.game))throw Error("无效的十一人存档");
        if(unavailableSave){saveNotice="请先下载本机无法读取的存档，再导入。";render();return}
        if(!confirm("使用导入的十一人进度替换当前进度？"))return;
        game=data.game;picking=false;persistence();
      }catch(e){saveNotice=e.message}
      render();return;
    }
    if(input.dataset.pick!==undefined)draft.picks[Number(input.dataset.pick)]=input.value;
    else if(input.dataset.teamSetting==="country"){draft.country=input.value;draft.team=squad.systems[draft.country][0];draft.picks=preset(draft.team)}
    else if(input.dataset.teamSetting==="team"){draft.team=input.value;draft.picks=preset(draft.team)}
    else if(input.dataset.teamSetting==="together")draft.together=input.checked;
    else if(input.dataset.teamSetting==="seed"){draft.seed=input.value;return}
    else return;
    const selector=input.dataset.pick!==undefined?'[data-pick="'+input.dataset.pick+'"]':'[data-team-setting="'+input.dataset.teamSetting+'"]';
    render();root.querySelector(selector)?.focus({preventScroll:true});
  });
  root.addEventListener("click",function(event){
    const player=event.target.closest("[data-eleven-player]");
    if(player){
      selected=Number(player.getAttribute("data-eleven-player"))||1;
      render();
      return;
    }
    const button=event.target.closest("[data-eleven-action]");
    if(!button||button.disabled)return;
    const action=button.getAttribute("data-eleven-action");
    if(action==="reset"){picking=true;render();document.getElementById("squad-picker").scrollIntoView();return}
    if(action==="cancel"){picking=false;render();return}
    if(action==="allow-transfers"){
      if(unavailableSave||!game.squad?.together)return;
      if(!confirm("从下一赛季起允许球员各自转会？已模拟的职业生涯记录不会改变。"))return;
      game={...game,squad:{...game.squad,together:false}};
      persistence();render();return;
    }
    if(action==="recover"){
      download(unavailableSave,"十一人原始存档.json");unavailableSave=null;
      saveNotice="已导出原文，下次保存时将写入当前进度。";render();return;
    }
    if(action==="archive"){
      download(JSON.stringify(Object.fromEntries(legacyKeys().map(k=>[k,localStorage.getItem(k)]))),"历史生涯原文.json");return;
    }
    if(action==="export"){download(JSON.stringify({format:"china-eleven-career-v1",game}),"十一人生涯_"+game.age+"岁.json");return}
    if(action==="build"){
      if(unavailableSave){saveNotice="请先下载本机原始存档。";render();return}
      const seed=Number(draft.seed);
      if(draft.seed===""||!Number.isInteger(seed)||seed<0||seed>4294967295){saveNotice="请输入 0 至 4294967295 的整数种子。";render();return}
      if(game.yearsSimulated&&!confirm("重新组队将替换当前十一人生涯，确定继续？"))return;
      const players=squad.select(people,draft.country,draft.picks,seed);
      game=core.create(seed,roster,{...draft,players});picking=false;selected=1;persistence();render();return;
    }
    if(game.age>=35)return;
    if(action==="next")game=core.step(game);
    if(action==="five")game=core.simulate(game,5);
    if(action==="retire")game=core.simulate(game,35-game.age);
    persistence();render();
  });
  render();
})();
