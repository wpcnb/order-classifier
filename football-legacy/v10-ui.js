(()=>{"use strict";
/* Standalone original v10 UI; no third-party UI or application code reused. */
const escape=x=>String(x??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[t]));
function render(data){
 const {core,people=[],players,leagues,countries,heights,positions,philosophies,operations,step=1,clubs,drawn,gameLeagues,positionLabels,development,openingCards,legacyHtml=""}=data;
 const stage=Math.max(1,Math.min(3,Number(step)||1));
 const ids=data.ids||["wang","vini"];
 const titles=[ids.length===3?"选择三名人物":"选择两名人物","设置身体与生涯","真实青训确认／随机抽卡"];
 const bar='<nav class="v10-progress" aria-label="创建生涯进度">'+titles.map((t,i)=>'<span class="'+(i+1===stage?'active':'')+'">'+(i+1)+' · '+escape(t)+'</span>').join("")+'</nav>';
 const heading='<div class="hero opening-hero"><div><h1>绿茵三剑客2</h1><p>三名球员共享赛程。一键开局会自动抽取剩余球队，赛季中自动训练、成长和转会。</p><button class="button primary" data-action="trioOpening">一键开启三人生涯</button></div></div>';
 const label=id=>id==="wang"?"球员一":id==="vini"?"球员二":"球员三";
 let page="";
 if(stage===1){
  page='<section class="card gap"><h2>第一步 · 选择人物和起始联赛</h2><p class="muted small">三人均可输入姓名，或从同一份名单选球星。选择队友已选的球星时，两人交换人物。自定义人物的足球能力和体格属于游戏设定，不会仅凭姓名推断真实数据。</p>'+
  '<div class="v10-two">'+ids.map(id=>{
   const person=people.find(x=>x.name===players[id]);const isOriginal=person?.source==="原有玩家角色",verified=core.verifiedPerson?.(players[id]);
   return '<article class="v10-card"><h3>'+label(id)+'</h3>'+
    '<label class="field">选择球星<select data-v10-star="'+id+'" '+(drawn[id]?'disabled':'')+'><option value="" disabled '+(!person?'selected':'')+'>选择名单中的球员</option>'+people.map(star=>'<option '+(star.name===players[id]?'selected':'')+' value="'+escape(star.name)+'">'+escape(star.name)+'</option>').join("")+'</select></label>'+
    '<label class="field">人物姓名<input type="text" data-v10-person="'+id+'" list="v10-people" maxlength="22" value="'+escape(players[id])+'" '+(drawn[id]?'disabled':'')+'></label>'+
    '<p class="muted small">'+(isOriginal?'原有玩家角色，并非已核验的职业球员。':verified?'已核验中国球员：'+escape(verified.academy)+'（'+escape(verified.academyYears)+'）；成年参考来自FC 25，后续成长为游戏推演。':person?'人物参考源于游戏名单，现实所属球队与评分不作为本次开局事实。':'自定义名字：依据所选位置生成游戏能力，请在下一步自行设置体格。')+'</p>'+
    '<div class="v10-lottery"><span>游戏国籍 <b>'+escape(countries[id])+'</b></span><button type="button" class="button outline" data-action="v10Country" data-id="'+id+'" '+(drawn[id]||verified?'disabled':'')+'>随机国籍</button></div>'+
    '<label class="field">起始联赛<select data-opening-league="'+id+'" '+(drawn[id]||verified?'disabled':'')+'>'+core.LEAGUES.map(l=>'<option value="'+escape(l)+'" '+(l===leagues[id]?'selected':'')+'>'+escape(gameLeagues[l]?.name||l)+'</option>').join("")+'</select></label>'+
    '<button type="button" class="button outline" data-action="v10League" data-id="'+id+'" '+(drawn[id]||verified?'disabled':'')+'>随机联赛（可选）</button></article>'
  }).join("")+'</div><datalist id="v10-people">'+people.map(x=>'<option value="'+escape(x.name)+'"></option>').join("")+'</datalist><p class="muted small">已核实国足球员使用真实青训机构、固定中国籍和中超模拟母队；其他人物仍可选择联赛并翻选十张随机球队卡。</p></section>';
 }else if(stage===2){
  page='<section class="card gap"><h2>第二步 · 职业理念与比赛特点</h2><p class="muted small">身高、体重、位置、生涯路线与操作深度分别设置。不同选择有优缺点，能力上限不会直接赠送。</p>'+
  '<div class="v10-two">'+ids.map(id=>{
   const chosen=core.scrubPhilosophy(philosophies[id]),assist=core.scrubOperation(operations[id]);
   return '<article class="v10-card"><h3>'+escape(players[id])+'</h3>'+development(id)+
    '<label class="field">比赛理念<select data-v10-philosophy="'+id+'">'+Object.entries(core.PHILOSOPHIES).map(([key,option])=>
    '<option value="'+key+'" '+(key===chosen?'selected':'')+'>'+escape(option.label)+'</option>').join("")+'</select></label>'+
    '<p class="muted small">'+escape(core.PHILOSOPHIES[chosen].description)+'</p>'+
    '<label class="field">操作深度<select data-v10-operation="'+id+'">'+Object.entries(core.OPERATIONS).map(([key,option])=>
    '<option value="'+key+'" '+(key===assist?'selected':'')+'>'+escape(option.label)+'</option>').join("")+'</select></label>'+
    '<p class="muted small">'+escape(core.OPERATIONS[assist].description)+'</p></article>'
  }).join("")+'</div></section>';
 }else{
  const current=ids.find(x=>!drawn[x]);
  page='<section class="card gap"><h2>第三步 · 十张随机球队卡</h2><p class="muted small">实名已核实的国足球员确认真实青训；其他人物从所属联赛的十张卡中抽选，锁定后不再重抽。</p></section>'+
  (current?openingCards(current):'<section class="card gap"><h2>球员准备就绪</h2><div class="v10-two">'+ids.map(id=>
  '<div class="v10-card"><b>'+escape(players[id])+'</b><p class="gold">'+escape(drawn[id])+'</p></div>').join("")+
  '</div><button type="button" class="button primary v10-primary" data-action="'+(ids.length===3?"trioOpening":"preset")+'">开始'+(ids.length===3?"三":"双")+'人职业生涯</button></section>');
 }
 const previous=stage>1?'<button type="button" class="button outline" data-action="v10Back">← 返回上一步</button>':'';
 const next=stage<3?'<button type="button" class="button primary v10-primary" data-action="v10Next">下一步：'+titles[stage]+' →</button>':'';
 return heading+legacyHtml+'<section class="gap"><h2>自定义球员开局</h2>'+bar+page+'<div class="v10-actions">'+previous+next+'</div></section>';
}
window.DualV10UI=Object.freeze({render});
})();
