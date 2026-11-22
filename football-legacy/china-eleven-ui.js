/* 绿茵传奇11人 · 国足11人共享生涯页面（独立于旧三人生涯存档） */
(function(){
  "use strict";
  const root=document.getElementById("eleven-app");
  if(!root||!window.ElevenCareerCore)return;
  const core=window.ElevenCareerCore;
  const params=new URLSearchParams(location.search);
  const classic=params.get("classic")==="1";
  if(classic){document.body.classList.remove("eleven-active");root.hidden=true;return;}
  document.body.classList.add("eleven-active");
  root.hidden=false;
  const STORE="football-legacy-china-eleven-career-v1";
  const roster=window.ChinaAcademyData&&window.ChinaAcademyData.players||[];
  const PLACEHOLDER="尚未核实";
  let saveNotice="";
  let game;
  let selected=9;
  try {
    const raw=localStorage.getItem(STORE);
    const candidate=raw?JSON.parse(raw):null;
    game=candidate&&core.isValid(candidate)?candidate:core.create(20261122,roster);
    if(raw&&!core.isValid(candidate))saveNotice="旧的11人数据格式无效，已载入新的初始阵容；原数据未被覆盖。";
  }catch(e){
    game=core.create(20261122,roster);
    saveNotice="浏览器本地存储不可读：本次模拟仍可进行，但页面关闭后可能无法保存。";
  }
  const escape=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
  const labels={GK:"门将",RB:"右后卫",CB:"中后卫",LB:"左后卫",CDM:"后腰",CM:"中场",LW:"左边锋",RW:"右边锋",ST:"中锋"};
  const latest=function(p){return p.seasons[p.seasons.length-1]||null;};
  function persistence(){
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
      '<div><small>成年参考身高</small><strong>'+height+'</strong></div>'+
      '<div><small>成年参考体重</small><strong>'+weight+'</strong></div>'+
      '<div><small>16岁能力估算</small><strong>'+core.BASE[p.id-1][4]+'</strong></div>'+
      '<div><small>模拟成长潜力</small><strong>'+p.potential+'</strong></div>'+
      '<div><small>成年国足生涯出场（模拟）</small><strong>'+p.careerCaps+'</strong></div></div>';
    const metrics='<div class="eleven-metrics">'+attrs.map((v,i)=>'<div><span>'+titles[i]+'</span><b>'+v+'</b><div class="eleven-bar"><i style="width:'+v+'%"></i></div></div>').join("")+'</div>';
    const summary='<p class="eleven-club"><b>16岁青训起点（游戏设定）：</b>'+escape(p.academy)+'<br><b>当前球队：</b>'+escape(p.club)+' · '+escape(p.league)+'</p>'+
      '<p class="eleven-disclaimer">成年身高、体重和出生日期参考中国队球员公开资料；16岁能力、潜力、青训归属及所有未来联赛、伤病和转会均为虚拟游戏参数，不是16岁历史实测或现实预测。</p>';
    return '<section class="card eleven-detail" aria-label="'+escape(p.name)+'职业生涯详情">'+
      '<div class="eleven-detail-top"><div><span class="eleven-eyebrow">球员生涯档案 · '+escape(labels[p.position]||p.position)+'</span><h2>'+escape(p.name)+'</h2></div>'+
      '<div class="eleven-big-rating"><b>'+p.rating+'</b><small>综合能力</small></div></div>'+
      summary+meta+metrics+
      '<h3>逐赛季职业生涯</h3><div class="eleven-scroll"><table class="eleven-history"><thead><tr><th>年龄</th><th>联赛</th><th>俱乐部</th><th>能力</th><th>场次</th><th>进球</th><th>助攻</th><th>国足</th></tr></thead><tbody>'+history+'</tbody></table></div>'+
      '<p class="eleven-disclaimer">赛季级虚拟推演：联赛、球队及比赛数字由模型生成，目前尚非完整逐场赛程引擎。</p></section>';
  }
  function render(){
    if(!core.isValid(game)){root.textContent="11人生涯数据无效。请刷新页面重建。";return;}
    const p=game.players.find(x=>x.id===selected)||game.players[0];
    const years=game.age-16;
    const last=game.players.filter(x=>x.seasons.length).map(x=>({name:x.name,...latest(x)}));
    const injuries=last.filter(x=>x.injuryGames>0);
    const foreign=game.players.filter(x=>!["青训联赛","中乙","中甲","中超"].includes(x.league)).length;
    const mini=years>0?'<div class="eleven-season-notes">上赛季：'+last.length+'人共同推进；'+injuries.length+'人发生模拟伤停；'+foreign+'人目前效力其他国家或地区的联赛。点击任何球员查看个人历史。</div>':
      '<div class="eleven-season-notes">这11人均从16岁开始，处于各自的青训梯队。点击任意球员查看真实基础资料与模型能力值。</div>';
    const rows=[
      [game.players[8],game.players[10],game.players[9]],
      [game.players[7],game.players[6],game.players[5]],
      [game.players[4],game.players[2],game.players[3],game.players[1]],
      [game.players[0]]
    ];
    root.innerHTML='<div class="eleven-summary card"><div class="eleven-intro">'+
      '<span class="eleven-eyebrow">国足最近首发 · 2026年11月17日 2:2 巴林</span>'+
      '<h1>中国队首发11人 · 从16岁开始</h1>'+
      '<p>11人共享一个虚拟赛季时间轴，分别发展、升入职业队、转会、受伤、争取国家队出场。不是原来的三人开局。</p></div>'+
      '<div class="eleven-dashboard"><div><small>模拟年份</small><b>'+game.year+'</b></div><div><small>统一年龄</small><b>'+game.age+'岁</b></div><div><small>阵容人数</small><b>11 / 11</b></div><div><small>平均能力</small><b>'+average()+'</b></div></div>'+
      '<div class="eleven-actions"><button type="button" class="button primary" data-eleven-action="next" '+(game.age>=35?"disabled":"")+'>模拟下一年</button>'+
      '<button type="button" class="button goldbtn" data-eleven-action="five" '+(game.age>=35?"disabled":"")+'>连续模拟5年</button>'+
      '<button type="button" class="button" data-eleven-action="retire" '+(game.age>=35?"disabled":"")+'>一键模拟至35岁</button>'+
      '<button type="button" class="button outline" data-eleven-action="export">导出11人存档</button>'+
      '<button type="button" class="button outline" data-eleven-action="reset">重新从16岁开始</button></div>'+
      '<p class="eleven-save-notice" role="status">'+escape(saveNotice)+'</p>'+
      '</div><section class="eleven-squad" aria-label="国足首发11人阵容"><div class="eleven-squad-head"><div><h2>11人首发阵容</h2><p>4-3-3 排列 · 单击查看职业生涯</p></div><span>模拟进度 '+years+' / 19 年</span></div>'+
      '<div class="eleven-pitch">'+rows.map(line=>'<div class="eleven-line">'+line.map(card).join("")+'</div>').join("")+'</div>'+
      mini+'</section>'+detail(p)+
      '<div class="eleven-links"><p>名单来源：<a href="https://xinwen.bjd.com.cn/content/s6afd4e91e4b0e42f8f03106e.html" target="_blank" rel="noopener noreferrer">2026-11-17国足对巴林首发报道</a>。球员公开档案沿用项目现有中国队资料库。</p>'+
      '<p><a href="?classic=1">打开旧版三人生涯存档（兼容入口）</a>。原有存档未被覆盖。</p></div>';
  }
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
    if(action==="reset"){
      if(!confirm("重新开始11人生涯？当前11人进度将被覆盖，旧版三人生涯存档不受影响。建议先导出备份。"))return;
      game=core.create(20261122,roster);selected=9;persistence();render();return;
    }
    if(action==="export"){
      const blob=new Blob([JSON.stringify({format:"china-eleven-career-v1",game},null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="绿茵传奇11人_"+game.age+"岁生涯.json";document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},500);
      return;
    }
    if(game.age>=35)return;
    if(action==="next")game=core.step(game);
    if(action==="five")game=core.simulate(game,5);
    if(action==="retire")game=core.simulate(game,35-game.age);
    persistence();render();
  });
  render();
})();