/* Read-only annual awards presentation. No localStorage writes. */
(function(){
  "use strict";
  const root=document.getElementById("eleven-awards-display");
  if(!root)return;
  const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let game;
  try{
    const raw=localStorage.getItem("football-legacy-china-eleven-career-v1");
    game=raw?JSON.parse(raw):null;
  }catch(e){root.textContent="本机存档暂不可读，请先从游戏页面导出并备份原始存档。";return}
  if(!game||!window.ElevenCareerCore?.isValid(game)){
    root.innerHTML='<p>尚无可读取的十一人生涯存档。<a href="./play.html">返回游戏</a>，先模拟至成年赛季。旧存档不会被覆盖。</p>';
    return;
  }
  const years=Object.keys(game.awardHistory||{}).map(Number).sort((a,b)=>b-a);
  if(!years.length){root.textContent="18岁后的赛季才开始年度个人奖项评选。";return}
  let selectedYear=years[0],selectedAward="金球奖";
  function render(){
    const saved=game.awardHistory[selectedYear]?.[selectedAward];
    const controls='<div class="eleven-awards-controls"><label>评选年度 <select id="eleven-award-year">'+
      years.map(y=>'<option value="'+y+'" '+(y===selectedYear?'selected':'')+'>'+y+'</option>').join("")+
      '</select></label><div class="eleven-actions">'+["金球奖","世界足球先生"].map(name=>
        '<button type="button" class="button '+(name===selectedAward?'goldbtn':'outline')+
        '" data-award-name="'+esc(name)+'" aria-pressed="'+(name===selectedAward)+'">'+name+'</button>').join("")+
      '</div></div>';
    if(!saved){root.innerHTML=controls+'<p>该年度暂无评选数据。</p>';return}
    const summary='<div class="eleven-award-winner"><strong>'+esc(saved.name)+'</strong><small>'+
      esc(selectedYear)+' · '+esc(selectedAward)+' · '+Number(saved.points).toFixed(saved.model===3&&selectedAward==="世界足球先生"?2:0)+'分</small></div>';
    if(saved.model!==3||!Array.isArray(saved.rankings)){
      root.innerHTML=controls+summary+'<p class="eleven-disclaimer">这是改版前的历史奖项，仅保留了获奖者。旧数据没有完整选票，系统不会补造过去的得票与候选排名。</p>';
      return;
    }
    const table='<div class="eleven-scroll"><table class="eleven-history eleven-award-table"><thead><tr>'+
      '<th>排名</th><th>候选人 / 位置</th><th>得票</th><th>评选依据与理由</th></tr></thead><tbody>'+
      saved.rankings.map(row=>'<tr><td>#'+row.rank+'</td><td><strong>'+esc(row.name)+'</strong><br><small>'+
        esc(row.position)+' · '+(row.origin==="tracked"?"本存档球员":"虚构外部候选")+'</small></td>'+
        '<td>'+Number(row.points).toFixed(selectedAward==="金球奖"?0:2)+'</td><td>'+esc(row.reason)+
        (selectedAward==="世界足球先生"&&row.votes?
          '<br><small>模拟选票：'+Object.entries(row.votes).map(([g,pts])=>esc(g)+': '+pts).join(' / ')+'</small>':"")+
        '</td></tr>').join("")+'</tbody></table></div>';
    root.innerHTML=controls+summary+'<p><b>模拟选民：</b>'+esc(saved.voters)+
      '<br><b>评判重点：</b>'+esc(saved.criteria)+'</p>'+table+
      '<p class="eleven-disclaimer">候选与评分仅用于虚构生涯；两种奖项使用不同选民和积分规则。往年已保存结果不会因查看页面而改变。</p>';
  }
  root.addEventListener("change",e=>{
    if(e.target.id==="eleven-award-year"){selectedYear=Number(e.target.value);render()}
  });
  root.addEventListener("click",e=>{
    const name=e.target.closest("[data-award-name]")?.getAttribute("data-award-name");
    if(name&&["金球奖","世界足球先生"].includes(name)){selectedAward=name;render()}
  });
  render();
})();
