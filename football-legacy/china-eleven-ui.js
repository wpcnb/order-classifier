/* 绿茵传奇11人 · 国足11人共享生涯页面（独立于旧三人生涯存档） */
(function(){
  "use strict";
  const root=document.getElementById("eleven-app");
  if(!root||!window.ElevenCareerCore)return;
  const core=window.ElevenCareerCore;
  const STORE="football-legacy-china-eleven-career-v1";
  const roster=window.ChinaAcademyData&&window.ChinaAcademyData.players||[];
  const squad=window.AcademySquad;
  const people=squad.catalog(window.ChinaAcademyData,window.WorldCupSquads,core.BASE);
  const draft={country:"中国",team:squad.systems.中国[0],seed:20261122,picks:Array(11).fill(""),together:true};
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
      '<div><small>16岁能力估算</small><strong>'+(p.initialRating??core.BASE[p.id-1][4])+'</strong></div>'+
      '<div><small>模拟成长潜力</small><strong>'+p.potential+'</strong></div>'+
      '<div><small>成年国家队生涯出场（模拟）</small><strong>'+p.careerCaps+'</strong></div></div>';
    const metrics='<div class="eleven-metrics">'+attrs.map((v,i)=>'<div><span>'+titles[i]+'</span><b>'+v+'</b><div class="eleven-bar"><i style="width:'+v+'%"></i></div></div>').join("")+'</div>';
    const worldTitles=["金球奖","世界足球先生"].map(award=>{
      const years=Object.entries(game.awardHistory||{}).filter(([,votes])=>votes?.[award]?.id===p.id).map(([year])=>escape(year));
      return award+" · "+(years.length?years.join("、")+" 赛季获奖":"暂无获奖记录");
    }).join("<br>");
    const summary='<p class="eleven-club"><b>16岁青训起点（游戏设定）：</b>'+escape(p.academy)+'<br><b>代表协会：</b>'+escape(p.country||"中国")+' · '+escape(p.nationalStage||"青训阶段")+'<br><b>当前球队：</b>'+escape(p.club)+' · '+escape(p.league)+'</p>'+
      '<p class="eleven-disclaimer">生日和报名身高取自公开档案。16 岁能力、青训归属和未来表现由游戏估算。</p>';
    return '<section class="card eleven-detail" aria-label="'+escape(p.name)+'职业生涯详情">'+
      '<div class="eleven-detail-top"><div><span class="eleven-eyebrow">球员生涯档案 · '+escape(labels[p.position]||p.position)+'</span><h2>'+escape(p.name)+'</h2></div>'+
      '<div class="eleven-big-rating"><b>'+p.rating+'</b><small>综合能力</small></div></div>'+
      summary+meta+metrics+'<p>'+worldTitles+'</p><p>本季估算身价 · '+(latest(p)?.marketValue?new Intl.NumberFormat('zh-CN',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(latest(p).marketValue):'待赛季结算')+'</p><p>个人与球队荣誉 · '+(p.seasons.flatMap(s=>[s.squadAward,s.trophy].filter(Boolean).map(t=>s.year+' '+escape(t))).join('、')||'暂无')+'</p>'+
      '<h3>逐赛季职业生涯</h3><div class="eleven-scroll"><table class="eleven-history"><thead><tr><th>年龄</th><th>联赛</th><th>俱乐部</th><th>能力</th><th>场次</th><th>进球</th><th>助攻</th><th>成年国家队出场</th></tr></thead><tbody>'+history+'</tbody></table></div>'+
      internationalRecord(p)+'<p class="eleven-disclaimer">每季五个模拟友谊赛比赛日，按位置、近期联赛表现和伤停选人。杯赛荣誉按赛季估算。</p></section>';
  }
  function rosterPicker(){
    if(!picking)return "";
    const options=(values,value)=>values.map(v=>'<option '+(v===value?'selected':'')+'>'+escape(v)+'</option>').join("");
    const slots=squad.formation.map((pos,i)=>{
      const groups=Object.keys(squad.systems).map(country=>{
        const pool=people.filter(p=>p.country===country&&squad.eligible(p,i)&&(p.name===draft.picks[i]||!draft.picks.includes(p.name)));
        return '<optgroup label="'+country+'">'+options(pool.map(p=>p.name),draft.picks[i])+'</optgroup>';
      }).join("");
      return '<label>'+labels[pos]+'<select data-pick="'+i+'"><option value="">按位置自动补齐</option>'+groups+'</select></label>';
    }).join("");
    return '<section class="card" id="squad-picker"><h2>组建首发阵容</h2><p>可以跨国选人。空位优先使用本体系的同位置球员。</p><div class="pick-grid">'+
      '<label>青训体系<select data-team-setting="country">'+options(Object.keys(squad.systems),draft.country)+'</select></label>'+
      '<label>青训母队<select data-team-setting="team">'+options(squad.systems[draft.country],draft.team)+'</select></label>'+
      '<label>模拟种子<input type="number" min="0" max="4294967295" step="1" data-team-setting="seed" value="'+escape(draft.seed)+'"></label></div>'+
      '<div class="pick-grid">'+slots+'</div><label><input type="checkbox" data-team-setting="together" '+(draft.together?'checked':'')+'> 18 岁后整队留在母队</label>'+
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
      '<p>按位置组成一支球队，点选球员可查看成长、比赛和荣誉。</p></div>'+
      '<div class="eleven-dashboard"><div><small>模拟年份</small><b>'+game.year+'</b></div><div><small>统一年龄</small><b>'+game.age+'岁</b></div><div><small>阵容人数</small><b>11 / 11</b></div><div><small>平均能力</small><b>'+average()+'</b></div></div>'+
      '<div class="eleven-actions"><button type="button" class="button primary" data-eleven-action="next" '+(game.age>=35?"disabled":"")+'>模拟下一年</button>'+
      '<button type="button" class="button goldbtn" data-eleven-action="five" '+(game.age>=35?"disabled":"")+'>连续模拟5年</button>'+
      '<button type="button" class="button" data-eleven-action="retire" '+(game.age>=35?"disabled":"")+'>一键模拟至35岁</button>'+
      '<button type="button" class="button outline" data-eleven-action="export">导出11人存档</button>'+
      '<button type="button" class="button outline" data-eleven-action="reset">选择青训体系与阵容</button></div>'+
      (unavailableSave?'<button class="button" data-eleven-action="recover">下载无法读取的存档</button>':'')+
      '<p class="eleven-save-notice" role="status">'+escape(saveNotice)+'</p>'+
      '</div>'+rosterPicker()+'<section class="eleven-squad" aria-label="首发11人阵容"><div class="eleven-squad-head"><div><h2>11人首发阵容</h2><p>4-3-3 排列 · 单击查看职业生涯</p></div><span>模拟进度 '+years+' / 19 年</span></div>'+
      '<div class="eleven-pitch">'+rows.map(line=>'<div class="eleven-line">'+line.map(card).join("")+'</div>').join("")+'</div>'+
      mini+'</section>'+teamMatches(p)+detail(p)+
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
    else if(input.dataset.teamSetting==="country"){draft.country=input.value;draft.team=squad.systems[draft.country][0]}
    else if(input.dataset.teamSetting==="team")draft.team=input.value;
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
