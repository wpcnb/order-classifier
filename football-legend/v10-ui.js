(()=>{"use strict";
/* Standalone original v10 UI; no third-party UI or application code reused. */
const escape=x=>String(x??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[t]));
function render(data){
 const {core,people=[],players,leagues,countries,heights,positions,philosophies,operations,step=1,clubs,drawn,gameLeagues,positionLabels,development,openingCards,legacyHtml=""}=data;
 const stage=Math.max(1,Math.min(3,Number(step)||1));
 const titles=["选择两名人物","设置身体与生涯","随机俱乐部抽卡"];
 const bar='<nav class="v10-progress" aria-label="创建生涯进度">'+titles.map((t,i)=>'<span class="'+(i+1===stage?'active':'')+'">'+(i+1)+' · '+escape(t)+'</span>').join("")+'</nav>';
 const heading='<div class="hero opening-hero"><div><div class="cap">FOOTBALL LEGACY 10.0 · TWO CAREERS, ONE WORLD</div><h1>双星时代</h1><p>两名球员，同一个世界，不同职业命运。</p></div></div>';
 const label=id=>id==="wang"?"球员一":"球员二";
 let page="";
 if(stage===1){
  page='<section class="card gap"><h2>第一步 · 人物与随机国籍、联赛</h2><p class="muted small">选两位真实足球人物姓名参考；原有王楚淇角色继续提供。游戏中的国籍、联赛、职业发展属于平行世界，不是现实履历。</p>'+
  '<div class="v10-two">'+["wang","vini"].map(id=>{
   const person=people.find(x=>x.name===players[id]);const isOriginal=person?.source==="原有玩家角色";
   return '<article class="v10-card"><h3>'+label(id)+'</h3>'+
    '<label class="field">选择人物<select data-v10-person="'+id+'" '+(drawn[id]?'disabled':'')+'>'+people.map(x=>
     '<option value="'+escape(x.name)+'" '+(x.name===players[id]?'selected':'')+'>'+escape(x.name)+' · '+escape(positionLabels[x.position]||"球员")+'</option>').join("")+'</select></label>'+
    '<p class="muted small">'+(isOriginal?'原有玩家角色，并非已核验的职业球员。':'人物参考源于游戏名单，现实所属球队与评分不作为本次开局事实。')+'</p>'+
    '<div class="v10-lottery"><span>游戏国籍 <b>'+escape(countries[id])+'</b></span><button type="button" class="button outline" data-action="v10Country" data-id="'+id+'" '+(drawn[id]?'disabled':'')+'>随机国籍</button></div>'+
    '<div class="v10-lottery"><span>初始联赛 <b>'+escape(gameLeagues[leagues[id]]?.name||"—")+'</b></span><button type="button" class="button outline" data-action="v10League" data-id="'+id+'" '+(drawn[id]?'disabled':'')+'>随机联赛</button></div></article>'
  }).join("")+'</div><p class="muted small">六联赛池：英超、西甲、德甲、意甲、法甲、中超。结果独立随机，可在翻牌之前重抽。</p></section>';
 }else if(stage===2){
  page='<section class="card gap"><h2>第二步 · 职业理念与比赛特点</h2><p class="muted small">身高、体重、位置、生涯路线与操作深度分别设置。不同选择有优缺点，能力上限不会直接赠送。</p>'+
  '<div class="v10-two">'+["wang","vini"].map(id=>{
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
  const current=["wang","vini"].find(x=>!drawn[x]);
  page='<section class="card gap"><h2>第三步 · 十张随机球队卡</h2><p class="muted small">俱乐部由刚才抽到的联赛决定；翻牌后锁定球队，避免重复或暗中重抽。</p></section>'+
  (current?openingCards(current):'<section class="card gap"><h2>双星准备就绪</h2><div class="v10-two">'+["wang","vini"].map(id=>
  '<div class="v10-card"><b>'+escape(players[id])+'</b><p class="gold">'+escape(drawn[id])+'</p></div>').join("")+
  '</div><button type="button" class="button primary v10-primary" data-action="preset">开始双人职业生涯</button></section>');
 }
 const previous=stage>1?'<button type="button" class="button outline" data-action="v10Back">← 返回上一步</button>':'';
 const next=stage<3?'<button type="button" class="button primary v10-primary" data-action="v10Next">下一步：'+titles[stage]+' →</button>':'';
 return heading+bar+legacyHtml+page+'<div class="v10-actions">'+previous+next+'</div>';
}
window.DualV10UI=Object.freeze({render});
})();