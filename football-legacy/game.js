(()=>{"use strict";
const FS=window.FreeStar||null;
const BP=window.BodyPath||null;
const V10=window.DualV10||null, V10UI=window.DualV10UI||null; // Optional for older test harnesses and saves.
const CD=window.CareerDepth||null; // Optional: legacy tests and old saves still load without the new module.
const STORE="football-dynasty-duo-v2-20261110",LEGACY_STORE="football-dynasty-v4-independent-20261101",CUT="2026-11-01";
const VERIFIED_REAL_PEOPLE_FALLBACK={"roster":[["贝林厄姆","皇家马德里","CAM",92,23],["库巴西","巴塞罗那","CB",86,19],["库库雷利亚","皇家马德里","CB",86,28],["登贝莱","巴黎圣日耳曼","RW",91,29],["路易斯·迪亚斯","拜仁慕尼黑","LW",88,29],["布鲁诺·费尔南德斯","曼联","CAM",89,32],["加布里埃尔·马加良斯","阿森纳","CB",88,28],["哈兰德","曼城","ST",95,26],["阿什拉夫","巴黎圣日耳曼","RW",91,28],["凯恩","拜仁慕尼黑","ST",95,33],["克瓦拉茨赫利亚","巴黎圣日耳曼","LW",92,25],["亚马尔","巴塞罗那","RW",94,19],["马内","利雅得胜利","LW",84,34],["马尔基尼奥斯","巴黎圣日耳曼","CB",86,32],["劳塔罗·马丁内斯","国际米兰","ST",90,29],["姆巴佩","皇家马德里","ST",96,27],["努诺·门德斯","巴黎圣日耳曼","CB",89,24],["梅西","迈阿密国际","RW",86,39],["若昂·内维斯","巴黎圣日耳曼","CM",89,22],["奥利塞","拜仁慕尼黑","RW",91,24],["帕乔","巴黎圣日耳曼","CB",86,25],["胡利安·基尼奥内斯","卡迪西亚","ST",82,29],["赖斯","阿森纳","CM",90,27],["罗德里","巴塞罗那","CM",91,30],["法比安·鲁伊斯","巴黎圣日耳曼","CM",87,30],["萨利巴","阿森纳","CB",89,25],["费兰·托雷斯","巴黎圣日耳曼","RW",85,26],["于帕梅卡诺","拜仁慕尼黑","CB",88,27],["维尼修斯","皇家马德里","LW",93,26],["维蒂尼亚","巴黎圣日耳曼","CM",92,26],["佩德里","巴塞罗那","CM",91,23],["加维","巴塞罗那","CM",86,22],["穆西亚拉","拜仁慕尼黑","CAM",92,23],["维尔茨","利物浦","CAM",92,23],["帕尔默","切尔西","CAM",91,24],["福登","曼城","RW",90,26],["萨卡","阿森纳","RW",91,25],["阿尔瓦雷斯","马德里竞技","ST",90,26],["拉菲尼亚","巴塞罗那","RW",91,29],["伊萨克","利物浦","ST",90,27],["埃斯特旺","切尔西","RW",84,19],["恩德里克","皇家马德里","ST",83,20],["居莱尔","皇家马德里","CAM",88,21],["马斯坦托诺","皇家马德里","RW",82,19],["杜埃","巴黎圣日耳曼","LW",89,21],["扎伊尔-埃梅里","巴黎圣日耳曼","CM",87,20],["巴尔韦德","皇家马德里","CM",90,28],["莱万多夫斯基","巴塞罗那","ST",88,38],["奥斯梅恩","加拉塔萨雷","ST",90,27],["罗德里戈","皇家马德里","RW",88,25],["切尔基","曼城","CAM",85,23],["加纳乔","切尔西","LW",84,22],["基米希","拜仁慕尼黑","CM",90,31],["萨内","加拉塔萨雷","RW",86,30],["迪奥曼德","RB莱比锡","RW",86,19],["巴斯托尼","国际米兰","CB",90,27],["多纳鲁马","曼城","GK",92,27],["奥布拉克","马德里竞技","GK",88,33],["库尔图瓦","皇家马德里","GK",91,34],["尼科·威廉姆斯","毕尔巴鄂竞技","LW",86,24],["苏比门迪","阿森纳","CM",86,27],["卡马文加","皇家马德里","CM",87,23],["楚阿梅尼","皇家马德里","CM",88,26],["斯凯利","阿森纳","CB",82,20],["恩瓦内里","阿森纳","RW",82,19],["埃切维里","勒沃库森","CAM",81,20],["昆达","葡萄牙体育","RW",81,19],["肯德里·派斯","斯特拉斯堡","CAM",78,19],["亚历杭德罗·巴尔德","巴塞罗那","CB",86,22],["格瓦迪奥尔","曼城","CB",90,24],["鲁本·迪亚斯","曼城","CB",88,29],["范戴克","利物浦","CB",90,35],["科纳特","利物浦","CB",87,27],["索博斯洛伊","利物浦","CM",88,25],["麦卡利斯特","利物浦","CM",89,27],["埃基蒂克","利物浦","ST",87,24],["约克雷斯","阿森纳","ST",88,28],["阿马德·迪亚洛","曼联","RW",84,24],["梅努","曼联","CM",83,21],["谢什科","曼联","ST",84,23],["乌加特","曼联","CM",82,25],["特尔","热刺","ST",81,21],["沃顿","水晶宫","CM",85,22],["摩根·罗杰斯","阿斯顿维拉","CAM",85,24],["奥蓬达","尤文图斯","ST",85,26],["维托尔·罗克","帕尔梅拉斯","ST",82,21],["罗德里戈·莫拉","波尔图","CAM",82,19],["弗朗西斯科·孔塞桑","尤文图斯","RW",84,23],["科尔·穆阿尼","热刺","ST",84,27],["伊尼戈·马丁内斯","利雅得胜利","CB",82,35],["奥纳纳","特拉布宗体育","GK",81,30],["斯卡尔维尼","亚特兰大","CB",86,22],["弗拉霍维奇","尤文图斯","ST",85,26],["马库斯·图拉姆","国际米兰","ST",87,29],["迪马尔科","国际米兰","CB",88,28]],"referenceYear":2026,"officialNomineeCount":30,"official2026Top10":[["凯恩",1055],["姆巴佩",1027],["亚马尔",881],["罗德里",726],["梅西",612],["克瓦拉茨赫利亚",541],["登贝莱",418],["哈兰德",378],["奥利塞",296],["法比安·鲁伊斯",201]],"rules":{"candidates":30,"jurors":100,"perBallot":[15,12,10,8,7,5,4,3,2,1],"maxPersonalPoints":1500,"totalPoints":6700},"sources":["https://www.uefa.com/uefachampionsleague/news/02a9-218b019cbca5-cb4b9be51c4b-1000--2026-ballon-dor-awards-nominees-revealed/","https://ballondor.com/news/posts/2026-mens-ballon-dor-the-full-ranking-and-the-28-points-that-kept-mbappe-from-the-trophy"]};
const $=x=>document.getElementById(x),R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,C=(n,a,b)=>Math.max(a,Math.min(b,n)),P=a=>a[R(0,a.length-1)],E=v=>String(v??"").replace(/\u6a21\u62df/g,"游戏赛季").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x])),M=n=>"¥"+Math.round(n).toLocaleString("zh-CN"),percent=n=>C(Math.round(n),0,100);
const STATS={pace:"速度",shoot:"射门",pass:"传球",dribble:"盘带",defense:"防守",physical:"身体",mental:"意识"};
const POS={LW:"左边锋",RW:"右边锋",ST:"中锋",CAM:"前腰",CM:"中场",CDM:"后腰",CB:"中后卫",GK:"门将"};
const WEIGHTS={LW:[.25,.22,.13,.23,.02,.05,.10],RW:[.25,.22,.13,.23,.02,.05,.10],ST:[.12,.40,.08,.18,.02,.10,.10],CAM:[.12,.16,.28,.20,.04,.04,.16],CM:[.11,.11,.30,.14,.10,.10,.14],CDM:[.09,.05,.24,.07,.29,.12,.14],CB:[.10,.01,.11,.03,.43,.20,.12],GK:[.06,.02,.10,.04,.48,.20,.10]};
const DUO_IDS=["wang","vini"],FIVE_LEAGUES=["ENG","ESP","ITA","GER","FRA"];
const ACADEMY_START_AGE=16,ACADEMY_GRADUATION_AGE=18;
const DUO_TEMPLATES={
 wang:{id:"wang",name:"王楚淇",born:"1999-02-06",height:177,actualCountry:"中国",age:18,leagueId:"CHN",club:null,position:"LW",number:7,
  historicalOverall:83,potential:94,reference:"FIFA 18：18岁姆巴佩基础卡（能力模板，非王楚淇真实评分）",
  stats:{pace:90,shoot:80,pass:74,dribble:84,defense:47,physical:74,mental:92}},
 vini:{id:"vini",name:"维尼修斯",born:"2000-07-12",height:176,actualCountry:"巴西",age:18,leagueId:"CHN",club:null,position:"LW",number:20,
  historicalOverall:77,potential:92,reference:"FIFA 19：18岁维尼修斯基础卡（历史游戏能力，非2026现状）",
  stats:{pace:93,shoot:72,pass:64,dribble:81,defense:29,physical:60,mental:77}}
};
// Keep the existing league schedule for older saves; new draws use its 2026-CSL intersection.
const CSL_DRAW_TEAMS=()=>DB.CHN.teams.map(t=>t.name); // Verified 2026 CSL membership (16 clubs); domestic pyramid stays fixed in this game.
const PLAYER_STYLES={
 default:{name:"默认模板",adjust:{}},
 pace:{name:"速度型",adjust:{pace:4,dribble:1,shoot:-2,pass:-1,physical:-2}},
 technique:{name:"技术型",adjust:{pass:4,dribble:3,mental:1,pace:-3,physical:-3,shoot:-2}},
 power:{name:"力量型",adjust:{physical:5,shoot:3,mental:1,pace:-3,dribble:-3,pass:-3}}
};
let drawnClubs={wang:null,vini:null},openingDecks={wang:null,vini:null},openingSelectedIndex={wang:null,vini:null},openingStyles={wang:"default",vini:"default"};
let creatorMode="preset",creatorDrafts={wang:FS?FS.draftDefaults():null,vini:FS?FS.draftDefaults():null},creatorLocked={wang:null,vini:null};
let openingPositions={wang:"LW",vini:"LW"},openingPaths={wang:"balanced",vini:"balanced"},openingWeights={wang:73,vini:72};
let v10Persons={wang:"王楚淇",vini:"维尼修斯"},
 v10Countries={wang:V10?V10.chooseCountry():"中国",vini:V10?V10.chooseCountry():"巴西"},
 v10Heights={wang:177,vini:176},v10Philosophies={wang:"balanced",vini:"balanced"},
 v10Operations={wang:"guided",vini:"guided"},v10Step=1;
function resetDraw(){
 drawnClubs={wang:null,vini:null};openingDecks={wang:null,vini:null};openingSelectedIndex={wang:null,vini:null};
 openingStyles={wang:"default",vini:"default"};openingLeagues={wang:V10?V10.chooseLeague():"CHN",vini:V10?V10.chooseLeague():"CHN"};
 creatorMode="preset";creatorDrafts={wang:FS?FS.draftDefaults():null,vini:FS?FS.draftDefaults():null};creatorLocked={wang:null,vini:null};
 openingPositions={wang:"LW",vini:"LW"};openingPaths={wang:"balanced",vini:"balanced"};openingWeights={wang:73,vini:72};
 if(V10){v10Persons={wang:"王楚淇",vini:"维尼修斯"};
 v10Countries={wang:V10.chooseCountry(),vini:V10.chooseCountry()};v10Heights={wang:177,vini:176};
 v10Philosophies={wang:"balanced",vini:"balanced"};v10Operations={wang:"guided",vini:"guided"};v10Step=1;}
 localStorage.removeItem?.(OPENING_STORE)
}
const OPENING_LEAGUES=["CHN","ENG","ESP","GER","ITA","FRA"];
const OPENING_STORE="football-dynasty-opening-v3";
let openingLeagues={wang:V10?V10.chooseLeague():"CHN",vini:V10?V10.chooseLeague():"CHN"};
function openingState(){try{const d=JSON.parse(localStorage.getItem(OPENING_STORE)||"null");if(!d)return;
 if(FS&&["preset","quick","custom"].includes(d.mode))creatorMode=d.mode;
 if(V10){
  if([1,2,3].includes(d.v10Step))v10Step=d.v10Step;
  else if(d.drawn?.wang||d.drawn?.vini)v10Step=3;
  if(creatorMode!=="preset")creatorMode="preset";
  for(const id of DUO_IDS){
   const person=V10.findPerson(d.v10Persons?.[id],window.FOOTBALL_AWARD_REAL_PEOPLE);
   if(person){v10Persons[id]=person.name;duoDraft[id]=person.name}
   if(V10.COUNTRIES.includes(d.v10Countries?.[id]))v10Countries[id]=d.v10Countries[id];
   if(Number.isInteger(Number(d.v10Heights?.[id])))v10Heights[id]=V10.allowedHeight(d.v10Heights[id]);
   v10Philosophies[id]=V10.scrubPhilosophy(d.v10Philosophies?.[id]);
   v10Operations[id]=V10.scrubOperation(d.v10Operations?.[id]);
  }
 }
 for(const id of DUO_IDS){if(OPENING_LEAGUES.includes(d.leagues?.[id]))openingLeagues[id]=d.leagues[id];
 if(Array.isArray(d.decks?.[id])&&d.decks[id].length===10)openingDecks[id]=d.decks[id];
 if(typeof d.drawn?.[id]==="string")drawnClubs[id]=d.drawn[id];
 if(Number.isInteger(d.indices?.[id]))openingSelectedIndex[id]=d.indices[id];
 if(typeof d.names?.[id]==="string")duoDraft[id]=d.names[id];
 if(Object.hasOwn(PLAYER_STYLES,d.styles?.[id]))openingStyles[id]=d.styles[id];
  if(Object.hasOwn(POS,d.positions?.[id]))openingPositions[id]=d.positions[id];
  if(BP)openingPaths[id]=BP.sanitizedPath(d.paths?.[id]);
  if(Number.isFinite(Number(d.weights?.[id]))&&Number(d.weights[id])>=45&&Number(d.weights[id])<=125)openingWeights[id]=Number(d.weights[id]);
 if(FS&&d.creatorDrafts?.[id])creatorDrafts[id]=FS.validate(d.creatorDrafts[id]);
 if(FS&&d.creatorLocked?.[id]?.creatorVersion===1&&Number.isInteger(d.creatorLocked[id].potential)){
  const locked=d.creatorLocked[id];
  if(locked.potential>=65&&locked.potential<=99&&Object.values(locked.stats||{}).length===7)creatorLocked[id]=locked;
 }
 }}catch(e){}
}
function persistOpening(){try{
 localStorage.setItem(OPENING_STORE,JSON.stringify({leagues:openingLeagues,decks:openingDecks,drawn:drawnClubs,indices:openingSelectedIndex,names:duoDraft,styles:openingStyles,positions:openingPositions,paths:openingPaths,weights:openingWeights,v10Step,v10Persons,v10Countries,v10Heights,v10Philosophies,v10Operations,mode:creatorMode,creatorDrafts,creatorLocked}));
 return true
 }catch(e){return false}}
function duoPlayerTemplate(id){
 const person=V10?V10.findPerson(v10Persons[id],window.FOOTBALL_AWARD_REAL_PEOPLE):null;
 const known=person&&Object.values(DUO_TEMPLATES).find(t=>t.name===person.name);
 const generated=person&&!known?V10.templateFor(person.name,window.FOOTBALL_AWARD_REAL_PEOPLE):null;
 const base=known||generated||DUO_TEMPLATES[id],style=PLAYER_STYLES[openingStyles[id]]||PLAYER_STYLES.default;
 return {...base,stats:Object.fromEntries(Object.entries(base.stats).map(([key,value])=>[key,C(value+(style.adjust[key]||0),1,99)]))};
}
function openingPlayerStyle(id){
 const selected=openingStyles[id],locked=!!drawnClubs[id];
 return '<details class="item"><summary>能力风格：'+E((PLAYER_STYLES[selected]||PLAYER_STYLES.default).name)+'（可选）</summary><label class="field">选择能力风格<select data-duo-style="'+E(id)+'" '+(locked?'disabled':'')+'>'+Object.entries(PLAYER_STYLES).map(([key,style])=>'<option value="'+E(key)+'" '+(key===selected?'selected':'')+'>'+E(style.name)+'</option>').join("")+'</select></label><p class="muted small">风格是游戏估算，不会根据姓名自动识别真实身体或足球能力；游戏国籍默认中国。</p></details>';
}

function setCreatorMode(mode){
 if(!FS||!["preset","quick","custom"].includes(mode))return;
 if(DUO_IDS.some(id=>drawnClubs[id])){notify("已有球员完成抽卡，无法修改创建模式；原结果已锁定。");return}
 const oldMode=creatorMode,oldDrafts={wang:creatorDrafts.wang,vini:creatorDrafts.vini};
 creatorMode=mode;
 if(mode==="quick")creatorDrafts={wang:FS.quickDraft(),vini:FS.quickDraft()};
 if(mode==="custom")creatorDrafts={wang:FS.draftDefaults(),vini:FS.draftDefaults()};
 if(!persistOpening()){creatorMode=oldMode;creatorDrafts=oldDrafts;notify("无法保存创建模式，请检查存储空间");return}
 render();
}
function creatorModeChooser(){
 if(!FS)return "";
 const locked=DUO_IDS.some(id=>drawnClubs[id]);
 return '<section class="card creator-modes"><h2>选择你的双人开局</h2><div class="creator-choice">'+
 [["preset","经典双星","保留原始王楚淇与维尼修斯模板"],["quick","快速造星","随机男性球员、身高按位置生成"],["custom","自定义造星","男性球员，国籍、年龄、身高及外貌自选"]].map(([mode,label,desc])=>
  '<button type="button" class="creator-mode-btn '+(creatorMode===mode?'selected':'')+'" data-action="creatorMode" data-mode="'+mode+'" '+(locked?'disabled':'')+' aria-pressed="'+(creatorMode===mode)+'"><b>'+label+'</b><small>'+desc+'</small></button>'
 ).join("")+'</div><p class="muted small gap">全新虚构球员的潜能在首次翻牌时确定并存档，刷新不会重抽。男子职业赛事目前只生成男性球员；原有存档保持不变。</p></section>';
}
function creatorSelect(id,key,label,options,selected,locked){
 return '<label class="field">'+label+'<select data-creator-field="'+key+'" data-creator-id="'+id+'" '+(locked?'disabled':'')+'>'+
  Object.entries(options).map(([v,t])=>'<option value="'+E(v)+'" '+(v===String(selected)?'selected':'')+'>'+E(t)+'</option>').join("")+'</select></label>';
}

function openingDevelopmentPanel(id){
 if(!BP)return "";
 const selected=openingPaths[id]||"balanced",locked=!!drawnClubs[id],draft=creatorDrafts[id]||FS?.draftDefaults();
 const position=creatorMode==="preset"?openingPositions[id]:draft?.position||"LW";
 const weight=creatorMode==="preset"?openingWeights[id]:draft?.weight||70;
 const preview=BP.profile({heightCm:creatorMode==="preset"?(V10?v10Heights[id]:DUO_TEMPLATES[id].height):draft?.height,weightKg:weight,position});
 const labels=BP.label({heightCm:preview.height,weightKg:preview.weight,position});
 return '<details class="item opening-development" open><summary><b>开局发展方向 · '+E(BP.PATHS[selected].name)+'</b></summary>'+
 '<div class="creator-form-grid">'+
 (creatorMode==="custom"?'':creatorSelect(id,"_position","首发适配位置（开局选定）",FS?.POS||POS,position,locked))+
 (V10?'<label class="field">身高（150～210cm）<select data-v10-height="'+id+'" '+(locked?'disabled':'')+'>'+Array.from({length:61},(_,i)=>'<option value="'+(i+150)+'" '+(v10Heights[id]===i+150?'selected':'')+'>'+(i+150)+' cm</option>').join("")+'</select></label>':'')+
 '<label class="field">体重（45～125kg）<select data-opening-weight="'+id+'" '+(locked?'disabled':'')+'>'+
 Array.from({length:81},(_,i)=>{const v=i+45;return '<option value="'+v+'" '+(v===weight?'selected':'')+'>'+v+' kg</option>'}).join("")+'</select></label>'+
 '<label class="field">生涯优先方向<select data-opening-path="'+id+'" '+(locked?'disabled':'')+'>'+
 Object.entries(BP.PATHS).map(([key,v])=>'<option value="'+key+'" '+(key===selected?'selected':'')+'>'+E(v.name)+'</option>').join("")+'</select></label></div>'+
 '<p class="muted small">成长优先：训练更快、首发稍慢；出场优先：更容易登场、训练略慢。均衡发展不调整原机制。</p>'+
 '<div class="body-effects"><span>高空球 '+labels.aerial+'</span><span>对抗 '+labels.duel+'</span><span>灵活 '+labels.agility+'</span><span>体能 '+labels.endurance+'</span></div>'+
 '<p class="muted small">数值为相对游戏修正，不是现实能力测试。身高和体重各有利弊；肤色与族裔不参与计算。</p></details>';
}
function creatorForm(id){
 if(!FS||creatorMode==="preset")return openingPlayerStyle(id);
 const draft=FS.validate(creatorLocked[id]||creatorDrafts[id]||FS.draftDefaults()),locked=!!drawnClubs[id];
 const picture=FS.avatar(draft),title=creatorMode==="quick"?"随机球员档案":"自定义球员档案";
 const optionNames=Object.fromEntries(FS.COUNTRIES.map(country=>[country,country]));
 const yearChoices=Object.fromEntries(Array.from({length:24},(_,i)=>[String(i+16),String(i+16)+" 岁"]));
 const heightChoices=Object.fromEntries(Array.from({length:61},(_,i)=>[String(i+150),String(i+150)+" cm"]));
 const controls=creatorMode==="custom"?'<div class="creator-form-grid">'+
 creatorSelect(id,"country","游戏国籍",optionNames,draft.country,locked)+
 creatorSelect(id,"age","开局年龄（16～39）",yearChoices,draft.age,locked)+
 creatorSelect(id,"height","身高（150～210cm）",heightChoices,draft.height,locked)+
 '<div class="field creator-fixed-gender"><span class="muted small">性别 · 当前男子赛事</span><strong>男（固定）</strong></div>'+
 creatorSelect(id,"heritage","族裔／地区背景（可选）",FS.HERITAGE,draft.heritage,locked)+
 creatorSelect(id,"skin","肤色",Object.fromEntries(Object.entries(FS.TONE).map(([k,v])=>[k,v.label])),draft.skin,locked)+
 creatorSelect(id,"hair","发型",FS.HAIR,draft.hair,locked)+
 creatorSelect(id,"position","场上位置",FS.POS,draft.position,locked)+
 '</div>':'<p class="muted small">国籍 '+E(draft.country)+' · '+draft.age+'岁 · '+draft.height+'cm · '+E(FS.GENDER[draft.gender])+' · '+E(FS.POS[draft.position])+'。身份与外观已随机生成。</p>';
 return '<section class="item creator-profile"><div class="creator-profile-head"><div class="creator-avatar">'+picture+'</div><div><h3>'+title+'</h3>'+
 '<p class="muted small">初始能力与隐藏潜能随机生成，实际潜能值不会提前展示。</p>'+
 (locked?'<p class="gold small">人物和潜能已锁定，不可重新抽取</p>':'<p class="muted small">翻开球队卡后，人物与潜能一起锁定保存。</p>')+
 '</div></div>'+controls+
 '<p class="muted small">当前仅模拟男子职业赛事，新球员性别固定为男性。快速模式身高依位置生成；手动身高仍可选150～210cm。国籍、族裔背景及肤色不决定能力和潜力。</p></section>';
}

function chooseAcademy(id,league){
 if(!DUO_IDS.includes(id)||!OPENING_LEAGUES.includes(league)||drawnClubs[id])return;
 openingLeagues[id]=league;openingDecks[id]=null;persistOpening();render();
}
function openingPool(id){const league=openingLeagues[id];return (league==="CHN"?CSL_DRAW_TEAMS():DB[league].teams.map(t=>t.name)).filter(name=>
 !DUO_IDS.some(who=>who!==id&&openingLeagues[who]===league&&drawnClubs[who]===name));
}
function openingCards(id){
 if(!openingDecks[id]){openingDecks[id]=shuffleDraw(openingPool(id)).slice(0,10);persistOpening()}
 return openingDecks[id];
}
function flipOpeningCard(id,index){
 if(!DUO_IDS.includes(id)||drawnClubs[id])return;
 const options=openingCards(id);
 if(!Number.isInteger(index)||index<0||index>=options.length)return;
 const club=options[index],other=DUO_IDS.find(x=>x!==id);
 const previousDraw=drawnClubs[id],previousIndex=openingSelectedIndex[id];
 const previousOtherDeck=openingDecks[other]?openingDecks[other].slice():openingDecks[other];
 const previousLocked=creatorLocked[id];
 if(FS&&creatorMode!=="preset"&&!creatorLocked[id])creatorLocked[id]=FS.generatedProfile(creatorDrafts[id]);
 drawnClubs[id]=club;openingSelectedIndex[id]=index;
 // The second player's deck is refreshed without the first player's club.
 if(!drawnClubs[other]&&openingLeagues[other]===openingLeagues[id]&&openingDecks[other]?.includes(club)){
  const otherCards=openingDecks[other],at=otherCards.indexOf(club);
  const replacements=openingPool(other).filter(t=>!otherCards.includes(t));
  if(replacements.length)otherCards[at]=replacements[R(0,replacements.length-1)];
  else openingDecks[other]=shuffleDraw(openingPool(other)).slice(0,10);
 }
 if(!persistOpening()){
  drawnClubs[id]=previousDraw;openingSelectedIndex[id]=previousIndex;openingDecks[other]=previousOtherDeck;creatorLocked[id]=previousLocked;
  notify("无法保存抽卡结果，请先清理浏览器存储空间再选择。");return;
 }
 const el=document.querySelector('[data-action="flipOpeningCard"][data-id="'+id+'"][data-i="'+index+'"]');
 if(el)el.classList.add("revealed");
 notify((duoDraft[id]||DUO_TEMPLATES[id].name)+" 抽中 "+club);
 setTimeout(render,850);
}
function openingCardPanel(id){
 const t=duoPlayerTemplate(id),leagueId=openingLeagues[id],league=DB[leagueId],deck=openingCards(id),picked=drawnClubs[id];
 return '<section class="card opening-draw"><div class="row"><h2>'+E(duoDraft[id]||t.name)+' · '+(creatorMode==="preset"||creatorDrafts[id]?.age<18?"选择青训球队":"选择职业球队")+'</h2><span class="chip">'+E(league.name)+'</span></div>'+
 '<label class="field">'+(creatorMode==="preset"?"青训联赛":"起始联赛")+' <select data-opening-league="'+id+'" '+(picked?'disabled':'')+'>'+OPENING_LEAGUES.map(l=>'<option value="'+l+'" '+(l===leagueId?'selected':'')+'>'+E(DB[l].name)+'</option>').join('')+'</select></label>'+
 creatorForm(id)+openingDevelopmentPanel(id)+
 '<p class="muted small">亲自翻开十张随机球队卡中的一张；球队选定后立即保存。</p>'+
 '<div class="draw-card-grid">'+deck.map((club,i)=>{
 const open=!!picked&&openingSelectedIndex[id]===i;
 return '<button type="button" class="draw-card '+(open?'revealed':'')+'" data-action="flipOpeningCard" data-id="'+id+'" data-i="'+i+'" '+(picked?'disabled':'')+' aria-label="'+(open?E("已抽中"+club):"第"+(i+1)+"张未翻开球队卡")+'"><span class="draw-card-inner"><span class="draw-card-back"><b>★</b><small>FOOTBALL<br>DYNASTY</small><em>'+String(i+1).padStart(2,"0")+'</em></span><span class="draw-card-front">'+clubShield(club)+'<strong>'+E(club)+'</strong><small>'+E(league.name)+(creatorMode==="preset"||creatorDrafts[id]?.age<18?' · 青训':' · 一线队')+'</small></span></span></button>';
 }).join('')+'</div><p class="gold"><b>'+(picked?'已抽中：'+E(picked):'请选择一张卡牌')+'</b></p>'+
 (creatorMode==="preset"?'<details class="item"><summary>查看球员模板</summary><p class="muted small">'+E(openingStyles[id]==="default"&&duoDraft[id]===t.name?t.reference:"根据所选风格调整的游戏估算，不代表该人物真实能力。")+' · 潜力 '+t.potential+'</p></details>':'<p class="muted small">潜能：未知（随职业生涯通过球探逐步评估）。</p>')+'</section>';
}

const COUNTRIES=["中国","英格兰","西班牙","德国","法国","意大利","葡萄牙","荷兰","巴西","阿根廷","日本","韩国","沙特阿拉伯","澳大利亚","美国","加拿大","墨西哥","比利时","克罗地亚","摩洛哥","尼日利亚","塞内加尔","埃及","瑞士","奥地利","丹麦"];
const RAW={
ENG:["英超","英格兰",["阿森纳","曼城","利物浦","曼联","切尔西","热刺","纽卡斯尔联","阿斯顿维拉","布莱顿","埃弗顿","富勒姆","布伦特福德","伯恩茅斯","诺丁汉森林","利兹联","桑德兰","水晶宫","赫尔城","伊普斯维奇","考文垂"]],
ESP:["西甲","西班牙",["皇家马德里","巴塞罗那","马德里竞技","毕尔巴鄂竞技","比利亚雷亚尔","皇家贝蒂斯","皇家社会","塞维利亚","瓦伦西亚","赫罗纳","西班牙人","马略卡","奥萨苏纳","塞尔塔","巴列卡诺","赫塔费","阿拉维斯","埃尔切","莱万特","皇家奥维耶多"]],
ITA:["意甲","意大利",["国际米兰","AC米兰","那不勒斯","尤文图斯","罗马","亚特兰大","拉齐奥","博洛尼亚","佛罗伦萨","都灵","热那亚","乌迪内斯","卡利亚里","维罗纳","莱切","帕尔马","萨索洛","比萨","科莫","克雷莫内塞"]],
GER:["德甲","德国",["拜仁慕尼黑","多特蒙德","勒沃库森","RB莱比锡","法兰克福","斯图加特","弗赖堡","霍芬海姆","沃尔夫斯堡","门兴","美因茨","不莱梅","柏林联合","奥格斯堡","汉堡","科隆","圣保利","海登海姆"]],
FRA:["法甲","法国",["巴黎圣日耳曼","马赛","摩纳哥","里尔","里昂","尼斯","朗斯","雷恩","斯特拉斯堡","布雷斯特","南特","图卢兹","欧塞尔","梅斯","洛里昂","勒阿弗尔","昂热","兰斯"]],
CHN:["中超","中国",["成都蓉城","上海海港","上海申花","北京国安","山东泰山","浙江队","天津津门虎","武汉三镇","河南队","深圳新鹏城","云南玉昆","青岛西海岸","青岛海牛","大连英博","辽宁铁人","重庆铜梁龙"]],
NED:["荷甲","荷兰",["埃因霍温","阿贾克斯","费耶诺德","阿尔克马尔","特温特","乌德勒支","海伦芬","格罗宁根","前进之鹰","奈梅亨","鹿特丹斯巴达","兹沃勒","锡塔德幸运","赫拉克勒斯","威廉二世","瓦尔韦克","布雷达","阿尔梅勒城"]],
POR:["葡超","葡萄牙",["葡萄牙体育","本菲卡","波尔图","布拉加","吉马良斯","法马利康","里奥阿维","圣克拉拉","莫雷伦斯","埃斯托里尔","卡萨皮亚","吉尔维森特","阿罗卡","博阿维斯塔","阿马多拉之星","法鲁人","通德拉","阿维什"]],
TUR:["土超","土耳其",["加拉塔萨雷","费内巴切","贝西克塔斯","特拉布宗体育","伊斯坦布尔巴萨克赛尔","萨姆松体育","哥兹塔比","里泽斯堡","阿兰亚体育","安塔利亚体育","科尼亚体育","加济安泰普","开塞利体育","卡斯帕萨","埃于普体育","法蒂赫卡拉古鲁克"]],
BEL:["比甲","比利时",["布鲁日","安德莱赫特","圣吉罗斯联合","亨克","根特","安特卫普","标准列日","梅赫伦","沙勒罗瓦","韦斯特洛","色格拉布鲁日","旧海弗莱鲁汶","圣图尔登","登德尔","拉卢维耶尔","威尔郡"]],
SCO:["苏超","苏格兰",["凯尔特人","格拉斯哥流浪者","哈茨","希伯尼安","阿伯丁","邓迪联","马瑟韦尔","圣米伦","基尔马诺克","邓迪FC","利文斯顿","福尔柯克"]],
AUT:["奥甲","奥地利",["萨尔茨堡红牛","格拉茨风暴","维也纳快速","奥地利维也纳","林茨","沃尔夫斯贝格","哈特贝格","BW林茨","阿尔塔奇","WSG蒂罗尔","格拉茨AK","里德"]],
SUI:["瑞超","瑞士",["巴塞尔","年轻人","苏黎世","卢加诺","塞尔维特","圣加仑","洛桑体育","锡永","卢塞恩","温特图尔","草蜢","图恩"]],
DEN:["丹超","丹麦",["哥本哈根","中日德兰","布隆德比","北西兰","奥胡斯","欧登塞","兰讷斯","锡尔克堡","维堡","桑德捷斯基","腓特烈西亚","瓦埃勒"]],
BRA:["巴甲","巴西",["弗拉门戈","帕尔梅拉斯","博塔弗戈","弗鲁米嫩塞","科林蒂安","圣保罗","桑托斯","国际","格雷米奥","米内罗竞技","克鲁塞罗","巴伊亚","福塔莱萨","瓦斯科达伽马","布拉甘蒂诺","塞阿拉","维多利亚","尤文图德","累西腓体育","米拉索尔"]]
};
const DB={};Object.entries(RAW).forEach(([id,v])=>{DB[id]={id,name:v[0],country:v[1],teams:v[2].map((name,i)=>({name,power:C(Math.round((id==="CHN"?75:id==="BRA"?82:94)-i*1.55+(i%3)-1),48,96)}))}});
const MANU_26=[
["2026-08-22","赫尔城","A",0,2],["2026-08-30","伊普斯维奇","H",5,2],["2026-09-06","埃弗顿","A",2,2],["2026-09-13","曼城","H",0,1],["2026-09-20","富勒姆","A",1,1],
["2026-10-10","热刺","H",1,1],["2026-10-18","利兹联","A",1,1],["2026-10-25","伯恩茅斯","H",0,3],["2026-10-31","切尔西","A",0,2],
["2026-11-08","阿斯顿维拉","H"],["2026-11-22","利物浦","A"],["2026-11-28","布伦特福德","H"],["2026-12-02","纽卡斯尔联","A"],["2026-12-05","考文垂","H"],["2026-12-12","水晶宫","A"],["2026-12-19","阿森纳","A"],["2026-12-26","诺丁汉森林","H"],["2026-12-30","桑德兰","H"],["2027-01-02","布莱顿","A"],["2027-01-06","纽卡斯尔联","H"],["2027-01-16","阿斯顿维拉","A"],["2027-01-23","利物浦","H"],["2027-01-30","布伦特福德","A"],["2027-02-06","切尔西","H"],["2027-02-10","布莱顿","H"],["2027-02-20","诺丁汉森林","A"],["2027-02-27","阿森纳","H"],["2027-03-03","桑德兰","A"],["2027-03-13","埃弗顿","H"],["2027-03-20","曼城","A"],["2027-04-10","赫尔城","H"],["2027-04-17","伊普斯维奇","A"],["2027-04-24","水晶宫","H"],["2027-05-01","考文垂","A"],["2027-05-08","伯恩茅斯","A"],["2027-05-15","利兹联","H"],["2027-05-23","热刺","A"],["2027-05-30","富勒姆","H"]];
const MANU_CL=[
["2026-09-10","Sabah","H",4,0],["2026-10-13","马德里竞技","A",0,2],["2026-10-21","科莫","A",1,4],
["2026-11-03","罗马","H"],["2026-11-25","葡萄牙体育","A"],["2026-12-08","RB莱比锡","H"],["2027-01-20","拜仁慕尼黑","H"],["2027-01-27","比利亚雷亚尔","A"]];
const UEFA_TEAMS=["曼联","阿森纳","利物浦","曼城","那不勒斯","皇家马德里","罗马","Sabah","顿涅茨克矿工","马德里竞技","国际米兰","布鲁日","加拉塔萨雷","巴塞罗那","RB莱比锡","埃因霍温","维京","比利亚雷亚尔","布拉格斯拉维亚","朗斯","葡萄牙体育","里尔","费内巴切","费耶诺德","LASK","巴黎圣日耳曼","皇家贝蒂斯","波尔图","斯图加特","布拉迪斯拉发","科莫","博德闪耀","多特蒙德","阿斯顿维拉","拜仁慕尼黑","雅典AEK"];
const STAR_SEEDS=[["姆巴佩","皇家马德里","ST",96],["哈兰德","曼城","ST",95],["亚马尔","巴塞罗那","RW",94],["维尼修斯","皇家马德里","LW",93],["贝林厄姆","皇家马德里","CAM",92],["凯恩","拜仁慕尼黑","ST",92],["萨卡","阿森纳","RW",91],["登贝莱","巴黎圣日耳曼","RW",91],["萨拉赫","利物浦","RW",90],["福登","曼城","CAM",89],["佩德里","巴塞罗那","CM",91],["穆西亚拉","拜仁慕尼黑","CAM",91],["劳塔罗","国际米兰","ST",90],["莱奥","AC米兰","LW",89],["奥斯梅恩","那不勒斯","ST",89],["罗德里","曼城","CDM",90],["巴尔韦德","皇家马德里","CM",90],["阿尔瓦雷斯","马德里竞技","ST",89]];
const NAMES1=["亚历克斯","卢卡","伊万","阿尔瓦罗","安德烈","维克托","马特奥","里奥","丹尼尔","穆罕默德","埃里克","尼科","布鲁诺","莱昂","朱利安","阿德里安"],NAMES2=["席尔瓦","费尔南德斯","马丁内斯","卡瓦略","罗德里格斯","加西亚","德容","莫雷诺","洛佩斯","迪亚斯","佩雷拉","穆勒"];
const UCL_PTS=[15,12,10,8,7,5,4,3,2,1];
let sharedUniverse=null,syncSeasonChange=false,g=null,duoGames=null,activeDuo="wang",duoDraft={wang:"王楚淇",vini:"维尼修斯"},page="dashboard",draft=null,awardViewed=false,toastTimeout=0;
function toDate(d){return d==="—"?"":d}
function power(team){
 if(team.endsWith("青训"))return Math.max(42,power(team.slice(0,-2))-30);
 if(g?.clubRatings&&Number.isFinite(g.clubRatings[team]))return g.clubRatings[team];
 for(const x of Object.values(DB)){const t=x.teams.find(z=>z.name===team);if(t)return t.power}
 return 80
}

function overall(p){const a=Object.values(p.stats),w=WEIGHTS[p.position]||WEIGHTS.CM;return Math.round(a.reduce((s,v,i)=>s+v*w[i],0))}
function mkTalent(){let s={};Object.keys(STATS).forEach(k=>s[k]=R(42,67));let specialty=P(Object.keys(STATS));s[specialty]=C(s[specialty]+R(9,16),1,99);return {stats:s,potential:R(80,98),specialty}}
function realAwardRoster(){
 const data=window.FOOTBALL_AWARD_REAL_PEOPLE;
 return Array.isArray(data?.roster)&&data.roster.length>=30?data.roster:VERIFIED_REAL_PEOPLE_FALLBACK.roster;
}
function realNPC(person,i){
 const [name,club,pos,ov,age]=person;
 return {id:"real-"+i,name,club,pos,ov,age,potential:C(ov+R(0,3),ov,99),
  apps:0,goals:0,assists:0,europeGoals:0,europeAssists:0,rating:6.5,form:60,realPerson:true}
}
function ensureRealAwardPlayers(){
 if(!g||!Array.isArray(g.npcs))return;
 const roster=realAwardRoster(), byName=new Map(roster.map(person=>[person[0],person]));
 const retired=new Set([...(sharedUniverse?.retiredRealPeople||[]),...(sharedUniverse?.npcRetirements||[]).map(n=>n.name)].filter(name=>byName.has(name)));
 if(sharedUniverse)sharedUniverse.retiredRealPeople=[...retired];
 // Older saves could resurrect a real player at their 2026 age. Restore the
 // minimum plausible age and discard anyone already retired or over the limit.
 for(let i=g.npcs.length-1;i>=0;i--){
  const n=g.npcs[i],person=byName.get(n.name);if(!n.realPerson||!person)continue;
  const ageLimit=n.pos==="GK"?41:["CB","CDM"].includes(n.pos)?40:39;
  n.age=Math.max(Number(n.age)||0,person[4]+Math.max(0,g.year-2026));
  if(retired.has(n.name)||(g.year>2026&&n.age>=ageLimit)){retired.add(n.name);g.npcs.splice(i,1)}
 }
 if(sharedUniverse)sharedUniverse.retiredRealPeople=[...retired];
 const real=roster.filter(person=>duoGames?!DUO_IDS.some(id=>person[0]===duoGames[id].player.name):person[0]!==g.player.name),present=new Set(g.npcs.filter(n=>n.realPerson).map(n=>n.name));
 for(let i=0;i<real.length;i++)if(!present.has(real[i][0])){
  // A missing real person in a later save may already have retired. Do not
  // recreate them with their original 2026 age when loading or playing.
  if(retired.has(real[i][0])||g.year>2026)continue;
  const existing=g.npcs.find(n=>n.name===real[i][0]);
  if(existing){existing.realPerson=true;present.add(existing.name);continue}
  g.npcs.push(realNPC(real[i],i));present.add(real[i][0])
 }
}

function initNPC(){
 const roster=realAwardRoster().map(realNPC);
 const positions=["ST","LW","RW","CAM","CM","CDM","CB","CB","GK"];
 Object.values(DB).forEach(l=>l.teams.forEach((t,i)=>{
  for(let j=0;j<positions.length;j++)roster.push({
   id:l.id+i+"_"+j,name:P(NAMES1)+"·"+P(NAMES2),club:t.name,pos:positions[j],
   ov:C(t.power+R(-15,5)-(j===8?0:2),42,94),
   age:R(18,33),potential:R(75,97),apps:0,goals:0,assists:0,ratings:0,rating:6.5,form:50,realPerson:false
  })
 }));
 return roster
}

function log(msg){g.logs.unshift({year:g.year,week:g.season.completed,description:msg});g.logs=g.logs.slice(0,160)}

function compactWorld(world){
 if(!world)return {};
 return Object.fromEntries(Object.entries(world).map(([id,w])=>[id,{played:w.played,total:w.total,table:w.table}]))
}
function restoreWorld(world){
 for(const [id,w] of Object.entries(world||{})){
  if(!DB[id])continue;
  const names=DB[id].teams.map(t=>t.name);
  w.rounds=makeRR(names);
  w.total=w.rounds.length;
 }
 return world||{};
}
function duoPayload(){
 if(!duoGames||!g)return null;
 duoGames[activeDuo]=g;
 const a=duoGames.wang,b=duoGames.vini;
 const shared=sharedUniverse||{};
 const now=a.year;
 const packedShared={
  europeCompetitions:Object.fromEntries(Object.entries(shared.europeCompetitions||{}).filter(([key])=>Number(key.split(":")[0])===now)),
  europeFinals:shared.europeFinals||{},
  europeTitleCorrections:(shared.europeTitleCorrections||[]).slice(-30),
  rounds:Object.fromEntries(Object.entries(shared.rounds||{}).filter(([key])=>Number(key.split(":")[0])===now)),
  awards:shared.awards||{},leagueYouthAwards:shared.leagueYouthAwards||{},national:shared.national||{},npcRetirements:(shared.npcRetirements||[]).slice(-140),retiredRealPeople:shared.retiredRealPeople||[],
  offseasonYears:(shared.offseasonYears||[]).slice(-3),npcOffseasonYears:(shared.npcOffseasonYears||[]).slice(-3),
  clubRatings:shared.clubRatings||{},npcs:a.npcs||[],
  world:compactWorld(a.season.world||b.season.world)
 };
 const packed={};
 for(const id of DUO_IDS){
  const x=duoGames[id],season={...x.season};
  delete season.world;
  delete season.leagueRounds;
  if(season.uefa?.sharedKey)season.uefa={...season.uefa,table:undefined,drawRounds:undefined};
  const earlier=(x.ballonHistory||[]).map(entry=>entry.model>=6?{
    year:entry.year,model:entry.model,rank:entry.rank,playerNominated:entry.playerNominated,
    playerPoints:entry.playerPoints,winner:entry.winner,generation:entry.generation
  }:entry);
  packed[id]={...x,npcs:undefined,clubRatings:undefined,season,
    ballonHistory:earlier,logs:(x.logs||[]).slice(0,70)};
 }
 return {version:2,compact:1,activeDuo:"wang",duoGames:packed,sharedUniverse:packedShared};
}
let ageMigrationBlocked=false;
function hydratePayload(data){
 if(!data?.duoGames?.wang?.player||!data.duoGames?.vini?.player)throw Error("invalid save");
 // Preserve the exact old payload separately before automatically retiring anyone.
 const overdue=DUO_IDS.filter(id=>!data.duoGames[id].player.retired&&data.duoGames[id].player.age>=40);
 ageMigrationBlocked=false;
 if(overdue.length){
  const raw=JSON.stringify(data);let key=STORE+"-before-auto-retirement",suffix=0;
  try{
   while(localStorage.getItem(key)!==null)key=STORE+"-before-auto-retirement-"+(++suffix);
   localStorage.setItem(key,raw);
   if(localStorage.getItem(key)!==raw)throw Error("backup mismatch");
  }catch(e){ageMigrationBlocked=true}
 }
 duoGames=data.duoGames;sharedUniverse=data.sharedUniverse||{};
 if(data.compact){
  const npc=sharedUniverse.npcs||[];
  const world=restoreWorld(sharedUniverse.world);
  for(const id of DUO_IDS){
   const x=duoGames[id];x.npcs=npc;
   x.season.world=world;
   x.season.leagueRounds=leagueCalendar(x.player.leagueId,x.player.club,x.year);
   if(x.season.uefa?.sharedKey){
    const comp=sharedUniverse.europeCompetitions?.[x.season.uefa.sharedKey];
    if(comp){x.season.uefa.table=comp.table;x.season.uefa.drawRounds=comp.rounds;}
   }
  }
  delete sharedUniverse.npcs;delete sharedUniverse.world;
 }
 activeDuo="wang";g=duoGames.wang;
 for(const id of overdue)recordPlayerRetirement(id,true);
 linkSharedWorld();
 if(reconcileEuropeanHonors())save();
 if(DUO_IDS.every(id=>duoGames[id].season.stage==="playing"&&duoGames[id].season.index===0))
  setupSharedUefaSeason();
 if(overdue.length){finalizeRetiredSeasonIfReady();save()}
}
let storageWarningShown=false;
function save(){
 if(ageMigrationBlocked){
  if(!storageWarningShown){storageWarningShown=true;notify("无法备份自动退役前的旧存档，已保留原档；请先导出并清理存储空间")}
  return false;
 }
 try{
  const payload=duoPayload();
  if(!payload)return false;
  localStorage.setItem(STORE,JSON.stringify(payload));
  storageWarningShown=false;
  return true;
 }catch(e){
  if(!storageWarningShown){storageWarningShown=true;notify("本机浏览器存储容量不足，请先导出存档，不要清除当前数据")}
  return false;
 }
}
function notify(s){const t=$("toast");t.textContent=s;t.classList.remove("hidden");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.add("hidden"),3400)}
function titleResult(d){return d.home+" "+d.hs+" : "+d.as+" "+d.away}
function makeRR(names){const a=names.slice();if(a.length%2)a.push(null);const n=a.length,first=[],rotate=a.slice();for(let r=0;r<n-1;r++){const matches=[];for(let i=0;i<n/2;i++){let x=rotate[i],y=rotate[n-1-i];if(!x||!y)continue;const flip=(r+i)%2===1;matches.push({home:flip?y:x,away:flip?x:y})}first.push(matches);rotate.splice(1,0,rotate.pop())}return first.concat(first.map(round=>round.map(f=>({home:f.away,away:f.home}))))}
function leagueCalendar(id,club,year){let teams=DB[id].teams.map(z=>z.name+(club.endsWith("青训")?"青训":""));if(!teams.includes(club))teams[teams.length-1]=club;let rr=makeRR(teams);if(year===2026&&id==="ENG"&&club==="曼联"){rr=MANU_26.map(([date,opp,ha,gf,ga],idx)=>{let j=rr.findIndex(r=>r.some(f=>f.home===(ha==="H"?club:opp)&&f.away===(ha==="H"?opp:club)));if(j<0)throw Error("曼联完整赛程生成失败:"+opp+ha);const round=rr.splice(j,1)[0];round._date=date;round._manu={gf,ga,opp,ha};return round}).concat(rr);return rr.slice(0,38).map((round,i)=>({round:i+1,date:MANU_26[i][0],fixtures:round,verified:i<9?{gf:MANU_26[i][3],ga:MANU_26[i][4]}:null}))}const monthDates=[9,16,23,30];return rr.map((round,i)=>({round:i+1,date:new Date(Date.UTC(year,7,22+i*7)).toISOString().slice(0,10),fixtures:round,verified:null}))}
function makeUefaDraw(clubs,preset=[]){
 // Eight distinct opponents, eight matchdays with 18 fixtures each, four home and four away per club.
 const ids=Array.from({length:36},(_,i)=>"S"+i);
 const rounds=makeRR(ids).slice(0,8),slots={S0:clubs[0]},used=new Set([clubs[0]]);
 for(let i=0;i<preset.length;i++){
  const f=rounds[i].find(m=>m.home==="S0"||m.away==="S0"),other=f.home==="S0"?f.away:f.home;
  slots[other]=preset[i].opponent;used.add(preset[i].opponent)
 }
 const unused=clubs.filter(x=>!used.has(x));
 for(const id of ids)if(!slots[id])slots[id]=unused.shift();
 const matches=rounds.map(r=>r.map(f=>({a:slots[f.home],b:slots[f.away]})));
 const fixedHome=Object.fromEntries(clubs.map(x=>[x,0])),free=[];
 for(let i=0;i<8;i++)for(const f of matches[i]){
  if(f.a===clubs[0]||f.b===clubs[0]){
   if(preset.length){const home=preset[i].home?clubs[0]:(f.a===clubs[0]?f.b:f.a);
    f.home=home;f.away=home===f.a?f.b:f.a;fixedHome[home]++;
   }else free.push(f);
  }else free.push(f)
 }
 // Match-to-club max flow orients each match; every team gets exactly four home games.
 const size=free.length,teams=clubs.length,S=0,matchBase=1,teamBase=matchBase+size,T=teamBase+teams;
 let G=Array.from({length:T+1},()=>[]), refs=[];
 function add(u,v,cap){const e={to:v,rev:G[v].length,cap},back={to:u,rev:G[u].length,cap:0};G[u].push(e);G[v].push(back);return e}
 const index=Object.fromEntries(clubs.map((x,i)=>[x,i]));
 for(let i=0;i<size;i++){add(S,matchBase+i,1);const a=free[i];refs.push([add(matchBase+i,teamBase+index[a.a],1),add(matchBase+i,teamBase+index[a.b],1)])}
 for(let j=0;j<teams;j++)add(teamBase+j,T,4-fixedHome[clubs[j]]);
 let flow=0;
 while(true){let prev=Array(T+1).fill(null),q=[S];prev[S]=[-1,-1];
  for(let head=0;head<q.length&&!prev[T];head++){const u=q[head];for(let k=0;k<G[u].length;k++){const e=G[u][k];if(e.cap>0&&!prev[e.to]){prev[e.to]=[u,k];q.push(e.to)}}}
  if(!prev[T])break;
  for(let x=T;x!==S;){const [u,k]=prev[x],e=G[u][k];e.cap--;G[x][e.rev].cap++;x=u}flow++;
 }
 if(flow!==size)throw Error("欧战对阵主客分配失败:"+flow+"/"+size);
 free.forEach((f,i)=>{f.home=refs[i][0].cap===0?f.a:f.b;f.away=f.home===f.a?f.b:f.a});
 return matches.map(r=>r.map(f=>({home:f.home,away:f.away})))
}

function sharedUefaKey(year,type){return year+":"+type}
function setupSharedUefaSeason(){
 if(!duoGames||!sharedUniverse||duoGames.wang.year!==duoGames.vini.year)return;
 sharedUniverse.europeCompetitions=sharedUniverse.europeCompetitions||{};
 const year=duoGames.wang.year;
 // A club cannot play in the Champions League and Europa League in the same year.
 const entrants=DUO_IDS.map(id=>duoGames[id]).filter(x=>x.season.uefa);
 const types=[...new Set(entrants.map(x=>x.season.uefa.type))].sort((a,b)=>a==="欧冠"?-1:b==="欧冠"?1:a.localeCompare(b));
 for(const type of types){
  const members=DUO_IDS.map(id=>duoGames[id]).filter(x=>x.season.uefa?.type===type);
  // A legacy season with UEFA matches already played cannot be rewritten without
  // changing results; it will migrate at the next season boundary.
  if(members.some(x=>!x.season.uefa.sharedKey&&x.season.results.some(m=>m.kind==="europe"||m.kind==="europeKO")))continue;
  const key=sharedUefaKey(year,type);
  let comp=sharedUniverse.europeCompetitions[key];
  if(!comp){
   const otherPlayers=new Set(entrants.filter(x=>x.season.uefa.type!==type).map(x=>x.player.club));
   const otherCompetitions=new Set(Object.values(sharedUniverse.europeCompetitions)
    .filter(c=>c.year===year&&c.type!==type).flatMap(c=>c.clubs||[]));
   const pool=Object.values(DB).filter(l=>["ENG","ESP","GER","ITA","FRA","POR","NED","TUR","BEL","SCO","AUT","SUI","DEN"].includes(l.id))
    .flatMap(l=>l.teams.map(t=>t.name))
    .filter(name=>!otherPlayers.has(name)&&!otherCompetitions.has(name));
   comp=window.FOOTBALL_SHARED_UEFA.create({
    year,type,participants:[...new Set(members.map(x=>x.player.club))],pool,officialTeams:UEFA_TEAMS,
    officialRounds:window.FOOTBALL_OFFICIAL_UCL_2026?.fixtures,draw:makeUefaDraw,
    score:simulateScore,updateTable,ranked:sortedTable
   });
   sharedUniverse.europeCompetitions[key]=comp;
  }
  for(const x of members){
   const club=x.player.club,old=x.season.uefa;
   if(old.sharedKey===key){old.table=comp.table;old.drawRounds=comp.rounds;continue}
   const matches=comp.rounds.map((round,i)=>{
    const m=round.find(x=>x.home===club||x.away===club);
    if(!m)throw Error("统一欧战赛程缺少"+club+"第"+(i+1)+"轮");
    return {id:"u"+i,kind:"europe",date:m.date,competition:type,home:m.home,away:m.away,
     stage:"联赛阶段 · 第"+(i+1)+"轮",round:i,sharedUefa:key,fixtureId:m.id,
     verified:m.real?{gf:m.home===club?m.hs:m.as,ga:m.home===club?m.as:m.hs}:null};
   });
   x.season.uefa={...old,sharedKey:key,table:comp.table,drawRounds:comp.rounds,
    matches,verifiedHistory:comp.verifiedHistory,source:comp.source};
   x.season.events=x.season.events.filter(e=>e.kind!=="europe"&&e.kind!=="europeKO").concat(matches)
    .sort((a,b)=>a.date.localeCompare(b.date));
   x.season.index=0;
  }
 }
}
function findSharedUefa(ev){
 if(!ev.sharedUefa||!sharedUniverse?.europeCompetitions)return null;
 const comp=sharedUniverse.europeCompetitions[ev.sharedUefa];
 if(!comp)throw Error("共享欧战数据遗失："+ev.sharedUefa);
 const fixture=ev.kind==="europe"?comp.rounds[ev.round]?.find(m=>m.id===ev.fixtureId):
  comp.ko.find(m=>m.id===ev.fixtureId);
 if(!fixture)throw Error("共享欧战赛程遗失："+ev.fixtureId);
 return {comp,fixture};
}
function processSharedUefaRound(ev){
 const data=findSharedUefa(ev);if(!data)return;
 const comp=data.comp;
 if(comp.processedRounds[ev.round])return;
 comp.processedRounds[ev.round]=true;
 for(const m of comp.rounds[ev.round]){
  updateTable(comp.table,m.home,m.away,m.hs,m.as);m.processed=true;
  const involving=DUO_IDS.some(id=>duoGames[id].season.uefa?.sharedKey===comp.key&&
   [m.home,m.away].includes(duoGames[id].player.club));
  if(!involving){simulateNPCGame(m.home,m.away,m.hs,m.as,0,0,"europe");m.npcAllocated=true}
 }
}
function processSharedUefaKO(ev){
 const data=findSharedUefa(ev);if(!data)return;
 const {comp,fixture:m}=data;
 if(comp.processedKO[m.id])return;
 comp.processedKO[m.id]=true;
 if(ev.stage==="决赛"){
  sharedUniverse.europeFinals=sharedUniverse.europeFinals||{};
  sharedUniverse.europeFinals[comp.key]={key:comp.key,year:comp.year,type:comp.type,
   date:m.date,home:m.home,away:m.away,hs:m.hs,as:m.as,winner:comp.champion};
 }
}
function allocateSharedUefaNPC(date){
 if(!duoGames||!sharedUniverse?.europeCompetitions)return;
 const previous=g;
 for(const comp of Object.values(sharedUniverse.europeCompetitions)){
  if(comp.year!==duoGames.wang.year)continue;
  for(const m of [...comp.rounds.flat(),...comp.ko]){
   if(m.npcAllocated||m.date!==date||!m.processed&&!comp.processedKO[m.id])continue;
   const users=DUO_IDS.map(id=>duoGames[id]).filter(x=>x.season.uefa?.sharedKey===comp.key&&
    [m.home,m.away].includes(x.player.club));
   if(!users.length){m.npcAllocated=true;continue}
   const played=users.map(x=>({club:x.player.club,match:x.season.results.findLast(z=>
    z.sharedUefa===comp.key&&z.fixtureId===m.id&&z.date===date)}));
   if(played.some(x=>!x.match))continue;
   let gh=0,ga=0,ah=0,aa=0;
   for(const x of played)if(x.club===m.home){gh+=x.match.goals||0;ah+=x.match.assists||0}
   else{ga+=x.match.goals||0;aa+=x.match.assists||0}
   g=duoGames.wang;simulateNPCGame(m.home,m.away,m.hs,m.as,gh,ga,"europe",ah,aa);m.npcAllocated=true;
  }
 }
 g=previous;
}
function settleSharedUefaWinners(year){
 if(!duoGames||!sharedUniverse?.europeCompetitions)return;
 sharedUniverse.europeFinals=sharedUniverse.europeFinals||{};
 const original=g;
 for(const comp of Object.values(sharedUniverse.europeCompetitions)){
  if(comp.year!==year)continue;
  // Finalize non-player knockout fixtures exactly once.
  for(const m of comp.ko){
   if(m.npcAllocated)continue;
   const involving=DUO_IDS.some(id=>duoGames[id].season.uefa?.sharedKey===comp.key&&
    [m.home,m.away].includes(duoGames[id].player.club));
   if(involving)continue;
   g=duoGames.wang;simulateNPCGame(m.home,m.away,m.hs,m.as,0,0,"europe");m.npcAllocated=true;
  }
  if(sharedUniverse.europeFinals[comp.key])continue;
  const m=comp.ko.find(e=>e.stage==="决赛");
  if(m)sharedUniverse.europeFinals[comp.key]={key:comp.key,year:comp.year,type:comp.type,
   date:m.date,home:m.home,away:m.away,hs:m.hs,as:m.as,winner:comp.champion};
 }
 g=original;
}
function addSharedKnockouts(){
 const e=g.season.uefa,comp=sharedUniverse?.europeCompetitions?.[e?.sharedKey];
 if(!comp||e.knockoutsScheduled)return;
 const club=g.player.club;
 const events=comp.ko.filter(m=>m.home===club||m.away===club).map(m=>({
  id:m.id,kind:"europeKO",date:m.date,competition:e.type,stage:m.stage,leg:m.leg,
  home:m.home,away:m.away,sharedUefa:comp.key,fixtureId:m.id}));
 e.koAggregate={};e.knockoutsScheduled=true;
 g.season.events.push(...events);g.season.events.sort((a,b)=>a.date.localeCompare(b.date));
}
function createUefa(club,id,year,rank){
 if(!["ENG","ESP","ITA","GER","FRA","POR","NED","TUR","BEL","SCO","AUT","SUI","DEN"].includes(id))return null;
 const isManu=year===2026&&club==="曼联",type=isManu?"欧冠":rank<=4?"欧冠":rank<=7?"欧联":null;
 if(!type)return null;
 let clubs=isManu?UEFA_TEAMS.slice():[club,...Object.values(DB).filter(l=>["ENG","ESP","GER","ITA","FRA","POR","NED"].includes(l.id)).flatMap(l=>l.teams.map(t=>t.name)).filter(x=>x!==club)];
 clubs=[club,...new Set(clubs.filter(x=>x!==club))].slice(0,36);
 if(clubs.length!==36)throw Error("欧战参赛队不是36支");
 const preset=isManu?MANU_CL.map(f=>({opponent:f[1],home:f[2]==="H"})):[];
 const imported=isManu&&window.FOOTBALL_OFFICIAL_UCL_2026?.fixtures?.length===8?window.FOOTBALL_OFFICIAL_UCL_2026.fixtures:null;
 const drawRounds=imported?imported.map(round=>round.map(x=>({...x,real:Number.isInteger(x.hs)&&Number.isInteger(x.as)}))):makeUefaDraw(clubs,preset);
 const days=["09-10","10-13","10-21","11-03","11-25","12-08","01-20","01-27"];
 const matches=drawRounds.map((round,i)=>{const fixture=round.find(x=>x.home===club||x.away===club),official=isManu?MANU_CL[i]:null,real=fixture.real;
  return {id:"u"+i,kind:"europe",date:fixture.date||((i>=6?year+1:year)+"-"+days[i]),competition:type,home:fixture.home,away:fixture.away,stage:"联赛阶段 · 第"+(i+1)+"轮",verified:real?{gf:fixture.home===club?fixture.hs:fixture.as,ga:fixture.home===club?fixture.as:fixture.hs}:official&&i<3?{gf:official[3],ga:official[4]}:null}
 });
 return {type,drawRounds,verifiedHistory:!!imported,source:imported?"UEFA官方（截至2026-11-01）":"游戏赛季结果",table:Object.fromEntries(clubs.map(name=>[name,{name,p:0,w:0,d:0,l:0,gf:0,ga:0,points:0}])),played:0,stage:"league",completed:false,knockoutIndex:0,knockoutResults:[],matches}
}

function createCups(id,year){const name=({ENG:"足总杯",ESP:"国王杯",GER:"德国杯",ITA:"意大利杯",FRA:"法国杯",CHN:"足协杯",BRA:"巴西杯",NED:"荷兰杯",POR:"葡萄牙杯",TUR:"土耳其杯",BEL:"比利时杯",SCO:"苏格兰杯",AUT:"奥地利杯",SUI:"瑞士杯",DEN:"丹麦杯"})[id]||"国内杯";return {name,active:true,stage:0,stages:["第三轮","第四轮","第五轮","八强","半决赛","决赛"],results:[]}}
function makeSchedule(player,year,prevRank=10){
 const league=leagueCalendar(player.leagueId,player.club,year),uefa=player.youth?null:createUefa(player.club,player.leagueId,year,prevRank),cup=createCups(player.leagueId,year);
 let events=league.map(r=>{const f=r.fixtures.find(f=>f.home===player.club||f.away===player.club);return {id:"l"+r.round,kind:"league",date:r.date,round:r.round,home:f.home,away:f.away,verified:r.verified?{gf:r.verified.gf,ga:r.verified.ga}:null}});
 if(uefa)events.push(...uefa.matches);
 const dates=[[2027,1,9],[2027,1,30],[2027,2,27],[2027,3,20],[2027,4,24],[2027,5,22]];dates.forEach((x,i)=>events.push({id:"c"+i,kind:"cup",date:(year===2026?x[0]:year+1)+"-"+String(x[1]).padStart(2,"0")+"-"+String(x[2]).padStart(2,"0"),competition:cup.name,stage:cup.stages[i]}));
 if(player.youth)events=events.filter(x=>x.kind==="league");
 let national=null;
 if(!player.youth&&player.age>=18){
 const isAsia=["中国","日本","韩国","沙特阿拉伯","澳大利亚"].includes(player.country);
 const isEu=["英格兰","西班牙","德国","法国","意大利","葡萄牙","荷兰","比利时","克罗地亚","瑞士","奥地利","丹麦"].includes(player.country);
 const nextYear=year+1;
 const tournament=nextYear%4===3&&isAsia?"亚洲杯":nextYear%4===0&&isEu?"欧洲杯":nextYear%4===2?"世界杯":"国际比赛";
 const knockout=tournament!=="国际比赛";
 const asian=tournament==="亚洲杯",summer=tournament==="欧洲杯"||tournament==="世界杯";
 const dateList=asian?["01-10","01-15","01-20","01-23","01-29","02-02","02-05"]:
  summer?["06-13","06-18","06-23","06-28","07-03","07-08","07-14","07-19"]:
  ["09-06","11-18","03-23","03-30"];
 let stages=knockout?["小组赛①","小组赛②","小组赛③",...(tournament==="世界杯"?["三十二强"]:[]),"十六强","八强","半决赛","决赛"]:["国际友谊赛①","国际友谊赛②","国家队预选赛①","国家队预选赛②"];
 const opponents=isAsia?["日本","韩国","沙特阿拉伯","伊朗","卡塔尔","澳大利亚","阿联酋","乌兹别克斯坦","巴林","阿曼","伊拉克"]:
  isEu?["英格兰","法国","德国","西班牙","葡萄牙","意大利","荷兰","克罗地亚","丹麦","比利时","瑞士","奥地利"]:
  ["巴西","阿根廷","德国","法国","英格兰","日本","摩洛哥","美国","塞内加尔","墨西哥"];
 const pool=opponents.filter(n=>n!==player.country),chosen=[];
 while(chosen.length<stages.length){const options=pool.filter(n=>!chosen.includes(n));chosen.push(P(options.length?options:pool));}
 stages.forEach((stage,i)=>events.push({id:"n"+i,kind:"national",date:(summer||asian?nextYear:i<2?year:nextYear)+"-"+(summer||asian?dateList[i]:dateList[i]),competition:tournament,stage,home:player.country,away:chosen[i],nationalIndex:i}));
 national={name:tournament,knockout,active:true,groupPoints:0,groupPlayed:0,results:[],stage:"group"};
 }
 events.sort((a,b)=>a.date.localeCompare(b.date)||({europe:0,national:1,cup:2,league:3}[a.kind]-({europe:0,national:1,cup:2,league:3}[b.kind])));
 return {events,leagueRounds:league,leagueTable:Object.fromEntries(DB[player.leagueId].teams.map(x=>{const name=x.name+(player.youth?"青训":"");return [name,{name,p:0,w:0,d:0,l:0,gf:0,ga:0,points:0}]})),uefa,cup,national,index:0,completed:0,leaguePlayed:0,europeApps:0,europeGoals:0,europeAssists:0,results:[],ratings:[],goals:0,assists:0,apps:0,clean:0,leagueGoals:0,leagueAssists:0,leagueApps:0,leagueRatings:[],leagueClean:0,points:0,nationalApps:0,stage:"playing"};
}
function initialPlayer(custom=false){const talent=custom?draft.talent:mkTalent();const id=custom?draft.leagueId:"CHN",team=custom?draft.club:"成都蓉城",age=custom?16:18,position=custom?draft.position:"LW";const stats={...talent.stats};if(!custom){Object.assign(stats,{pace:81,shoot:74,pass:72,dribble:80,defense:43,physical:72,mental:74})}
 return {name:custom?draft.name:"新球员",country:custom?draft.country:"中国",age,position,club:team,leagueId:id,youth:custom,number:custom?R(14,39):9,stats,potential:Math.max(talent.potential,...Object.values(stats)),trait:talent.specialty,stamina:95,morale:82,form:69,coachTrust:66,points:0,autoPoints:true,autoTraining:true,injuryMatches:0,suspension:0,yellowCards:0,redCards:0,trainingUsed:false,trainingProgress:{},wage:custom?1200:68000,cash:custom?3000:350000,contract:custom?2:4,fame:custom?5:33,career:{apps:0,goals:0,assists:0,national:0},parentCoach:null};}
function academyStats(t){
 // Each profile descends from the EXISTING Wang (Mbappé 18) and Vini (FIFA 19)
 // historical templates; 16-year-old skills are fictional and deliberately lower.
 const drop={pace:11,shoot:13,pass:11,dribble:12,defense:7,physical:12,mental:11};
 return Object.fromEntries(Object.entries(t.stats).map(([key,v])=>[key,Math.max(30,v-(drop[key]||9))]));
}

function makeFreeStarCareer(id){
 const profile=creatorLocked[id];
 if(!FS||!profile||profile.creatorVersion!==1)throw Error("random player profile not saved");
 const d=FS.validate(profile),player=initialPlayer(false);
 const name=String(duoDraft[id]||DUO_TEMPLATES[id].name).trim().slice(0,22)||DUO_TEMPLATES[id].name;
 const youth=d.age<18,club=drawnClubs[id]+(youth?"青训":"");
 // All gameplay abilities come from a random potential roll and position weights,
 // never from nationality, heritage, skin color or gender.
 const skills={...profile.stats};
 Object.assign(player,{name,country:d.country,actualCountry:null,born:null,heightCm:d.height,weightKg:d.weight,careerPath:openingPaths[id]||"balanced",
  gender:d.gender,heritage:d.heritage,skinTone:d.skin,freeStar:{country:d.country,age:d.age,height:d.height,weight:d.weight,gender:d.gender,heritage:d.heritage,skin:d.skin,hair:d.hair,position:d.position,avatarSeed:profile.avatarSeed},
  creationMode:creatorMode,freeStarHidden:true,age:d.age,position:d.position,club,leagueId:openingLeagues[id],
  academyParentClub:drawnClubs[id],academyStartYear:2026,academyGraduationAge:18,
  stats:skills,potential:profile.potential,sourceRating:null,sourceReference:"自由造星 · 游戏随机能力与隐藏潜能",
  profileStyle:"random",academyReferenceStats:{...skills},number:R(2,40),contract:youth?2:3,
  poorStreak:0,forcedMove:false,youth,stamina:95,points:0,wage:youth?1500:11000,cash:youth?3000:35000,
  fame:5,academyCareer:{apps:0,goals:0,assists:0},academyHonors:[],seasonForm:R(-90,90)/100,scoutingRoll:Math.random(),
  seasonPeak:0,injuryHistory:0});
 if(CD)player.careerTrait=CD.traitFor(player);
 g={version:4,duoId:id,createdAt:"2026-11-13",year:2026,generation:1,player,ancestors:[],honors:[],
 logs:[],history:[],offers:[],npcs:initNPC().filter(n=>n.name!==player.name),ballonHistory:[],
 settings:{difficulty:"standard"},season:null,live:null,lastReview:null};
 g.season=makeSchedule(player,g.year,10);createWorld(g.season);
 log(player.name+" · "+d.age+"岁 · "+d.country+" · "+(youth?"青训":"一线队")+"起步；潜能隐藏，非现实人物能力评级。");
 return g;
}
function makeDuoCareer(id){
 if(FS&&creatorMode!=="preset")return makeFreeStarCareer(id);
 const t=duoPlayerTemplate(id),player=initialPlayer(false),name=String(duoDraft[id]||t.name).trim().slice(0,22)||t.name;
 const namedOriginal=name===t.name,sourceReference=namedOriginal&&openingStyles[id]==="default"?t.reference:"基于"+PLAYER_STYLES[openingStyles[id]].name+"的游戏估算，不代表真实人物能力";
 Object.assign(player,{name,country:"中国",actualCountry:namedOriginal?t.actualCountry:null,born:namedOriginal?t.born:null,heightCm:namedOriginal?t.height:null,weightKg:openingWeights[id],careerPath:openingPaths[id]||"balanced",age:ACADEMY_START_AGE,
  position:openingPositions[id]||t.position,club:drawnClubs[id]+"青训",academyParentClub:drawnClubs[id],academyStartYear:2026,academyGraduationAge:ACADEMY_GRADUATION_AGE,leagueId:openingLeagues[id],number:t.number,stats:academyStats(t),potential:t.potential,
  sourceRating:namedOriginal&&openingStyles[id]==="default"?t.historicalOverall:null,sourceReference,profileStyle:openingStyles[id],academyReferenceStats:{...t.stats},contract:2,poorStreak:0,forcedMove:false,youth:true,stamina:95,points:0,wage:1500,cash:3000,fame:6,academyCareer:{apps:0,goals:0,assists:0},academyHonors:[],seasonForm:R(-90,90)/100,scoutingRoll:Math.random(),seasonPeak:0,injuryHistory:0});
 if(CD)player.careerTrait=CD.traitFor(player);
 g={version:4,duoId:id,createdAt:"2026-11-10",year:2026,generation:1,player,ancestors:[],honors:[],logs:[],history:[],offers:[],npcs:initNPC().filter(n=>n.name!==player.name),ballonHistory:[],settings:{difficulty:"standard"},season:null,live:null,lastReview:null};
 g.season=makeSchedule(player,g.year,10);createWorld(g.season);
 log(player.name+"以16岁进入 "+drawnClubs[id]+" 青训（架空生涯）；中国游戏国籍。16岁属性根据 "+sourceReference+" 进行青年化推算，非真实能力评分。");
 return g;
}
function buildDuoGame(){
 if(incompatibleLegacySave){notify("检测到旧版不兼容联赛存档，请先保留原始备份再重新开局");return}
 if(!DUO_IDS.every(id=>DB[openingLeagues[id]]?.teams.some(t=>t.name===drawnClubs[id]))){notify("请先为两名球员分别抽取青训球队");return}
 if(FS&&creatorMode!=="preset"&&!DUO_IDS.every(id=>creatorLocked[id]?.creatorVersion===1)){
  notify("随机人物数据未锁定，请重新翻牌或导出开局备份");return
 }
 const wang=makeDuoCareer("wang"),vini=makeDuoCareer("vini");
 duoGames={wang,vini};sharedUniverse={rounds:{},offseasonYears:[],clubRatings:{},awards:{}};linkSharedWorld();setupSharedUefaSeason();activeDuo="wang";g=wang;page="dashboard";
 if(!save()){duoGames=null;g=null;sharedUniverse=null;render();notify("无法保存新生涯，已保留开局抽卡；请先清理浏览器存储空间。");return}
 try{localStorage.removeItem?.(OPENING_STORE)}catch(e){}render();
}
function buildGame(){buildDuoGame()}
function linkSharedWorld(){
 if(!duoGames)return;
 const a=duoGames.wang,b=duoGames.vini;
 sharedUniverse=sharedUniverse||{rounds:{},offseasonYears:[],clubRatings:{},national:{}};
 sharedUniverse.rounds=sharedUniverse.rounds||{};sharedUniverse.national=sharedUniverse.national||{};sharedUniverse.awards=sharedUniverse.awards||{};
 sharedUniverse.offseasonYears=sharedUniverse.offseasonYears||[];
 sharedUniverse.europeFinals=sharedUniverse.europeFinals||{};
 sharedUniverse.europeCompetitions=sharedUniverse.europeCompetitions||{};
 sharedUniverse.europeTitleCorrections=sharedUniverse.europeTitleCorrections||[];
 sharedUniverse.clubRatings=sharedUniverse.clubRatings||{};
 a.npcs=b.npcs=a.npcs.filter(n=>!DUO_IDS.some(id=>n.name===duoGames[id].player.name)); // One AI roster without duplicated protagonists
 a.clubRatings=b.clubRatings=sharedUniverse.clubRatings;
 if(a.year===b.year){
  const occupied=new Set(DUO_IDS.filter(id=>!duoGames[id].player.retired).map(id=>duoGames[id].player.leagueId));
  const common=(!a.player.retired&&a.season.world)||(!b.player.retired&&b.season.world)||{};
  for(const id of occupied)delete common[id];
  for(const [id,db] of Object.entries(DB))if(!occupied.has(id)&&!common[id]){const names=db.teams.map(t=>t.name),rounds=makeRR(names);common[id]={played:0,total:rounds.length,rounds,table:Object.fromEntries(names.map(name=>[name,{name,p:0,w:0,d:0,l:0,gf:0,ga:0,points:0}]))}}
  a.season.world=b.season.world=common;
  // Both Chinese internationals play the same national team fixture list.
  if(a.player.country===b.player.country){const na=a.season.events.filter(ev=>ev.kind==="national"),nb=b.season.events.filter(ev=>ev.kind==="national");if(na.length===nb.length)for(let i=0;i<na.length;i++){nb[i].home=na[i].home;nb[i].away=na[i].away;nb[i].date=na[i].date}}
 }
 if(a.year===b.year&&!a.player.retired&&!b.player.retired&&a.player.leagueId===b.player.leagueId){
  // Both players see one table; never calculate a league's fixtures twice.
  const key=a.year+":"+a.player.leagueId+(a.player.youth?":ACADEMY":""),data=sharedUniverse.rounds[key];
  if(data?.table){a.season.leagueTable=b.season.leagueTable=data.table}
  else{a.season.leagueTable=b.season.leagueTable=a.season.leagueTable}
 }
}
function sharedLeagueRound(ev,redScore=null){
 if(!sharedUniverse||ev.kind!=="league")return null;
 const s=g.season,key=g.year+":"+g.player.leagueId+(g.player.youth?":ACADEMY":"");
 let data=sharedUniverse.rounds[key];
 if(!data){data={table:s.leagueTable,rounds:{}};sharedUniverse.rounds[key]=data}
 if(!data.rounds[ev.round]){
  const round=s.leagueRounds.find(x=>x.round===ev.round);
  if(!round)throw Error("missing shared league round "+ev.round);
  data.rounds[ev.round]=round.fixtures.map(f=>{
   let hs,as;
   if(ev.verified&&(f.home===ev.home&&f.away===ev.away)){
    hs=f.home==="曼联"?ev.verified.gf:ev.verified.ga;
    as=f.away==="曼联"?ev.verified.gf:ev.verified.ga;
   }else{
    // Scores are adjusted before the shared fixture and standings are written.
    const impact=f.home===ev.home&&f.away===ev.away?redScore:null;
    [hs,as]=simulateScore(f.home,f.away,0,impact?.home||0,impact?.away||0);
    // Elite creators/finishers should change their club's attacking output.
    for(const id of DUO_IDS){const p=duoGames[id].player;if(p.retired||p.leagueId!==g.player.leagueId)continue;
     const uplift=C((overall(p)-75)*.045,0,.85);
     if(p.club===f.home&&Math.random()<uplift)hs=Math.min(6,hs+1);
     if(p.club===f.away&&Math.random()<uplift)as=Math.min(6,as+1);
    }
   }
   updateTable(data.table,f.home,f.away,hs,as);
   const hasDuo=DUO_IDS.some(id=>duoGames[id].player.leagueId===g.player.leagueId&&!duoGames[id].player.retired&&[f.home,f.away].includes(duoGames[id].player.club));
   if(!hasDuo)simulateNPCGame(f.home,f.away,hs,as);
   return {home:f.home,away:f.away,hs,as,npcAllocated:!hasDuo,redScoreEffect:!!(redScore&&!ev.verified&&f.home===ev.home&&f.away===ev.away)}
  });
 }
 s.leagueTable=data.table;
 return data.rounds[ev.round].find(f=>f.home===ev.home&&f.away===ev.away)||null;
}
function recordPlayerRetirement(id,automatic=false,completedSeasonYear=null){
 if(!duoGames||!DUO_IDS.includes(id))return;
 const x=duoGames[id],p=x.player;
 if(p.retired)return;
 const partial=x.season.stage==="playing"?{year:x.year,apps:x.season.apps||0,goals:x.season.goals||0,assists:x.season.assists||0,results:(x.season.results||[]).map(m=>({...m}))}:null;
 p.retired=true;p.retiredAt={year:x.year,age:p.age,club:p.club,league:DB[p.leagueId]?.name,automatic};
 const completed=x.season.stage==="review"?(completedSeasonYear??x.year):null;
 x.retirementSummary={at:{...p.retiredAt},completedSeasonYear:completed,career:{...p.career},academy:{...(p.academyCareer||{})},
  honors:x.honors.map(h=>({...h})),history:x.history.map(h=>({...h})),transfers:(p.transferHistory||[]).map(t=>({...t})),partialSeason:partial};
 delete p.transferDraw;p.forcedMove=false;p.forcedSameTier=false;x.offers=[];
 x.season.stage="retired";
}
function retirePlayer(id){
 if(!duoGames||!DUO_IDS.includes(id)||duoGames[id].player.retired)return;
 const p=duoGames[id].player;
 if(!confirm("确定让 "+p.name+" 在"+p.age+"岁退役？退役后不可重新参赛，另一人的生涯会继续。"))return;
 recordPlayerRetirement(id);const settled=finalizeRetiredSeasonIfReady(),saved=save();page="career";render();if(settled&&saved)notify(p.name+"已退役，另一名球员可以继续比赛");
}
function nextSharedDate(){
 const dates=DUO_IDS.map(id=>{const x=duoGames[id];return x.season.stage==="playing"?x.season.events[x.season.index]?.date:null}).filter(Boolean);
 return dates.length?dates.sort()[0]:null;
}
function allocateSharedNpcForDay(date){
 if(!sharedUniverse||!duoGames)return;
 const original=activeDuo;
 for(const [key,data]of Object.entries(sharedUniverse.rounds||{})){
  if(Number(key.split(":")[0])!==duoGames.wang.year)continue;
  for(const fixtures of Object.values(data.rounds||{}))for(const fixture of fixtures){
   if(fixture.npcAllocated)continue;
   const users=DUO_IDS.map(id=>duoGames[id]).filter(x=>x.player.leagueId===key.split(":")[1]&&!!x.player.youth===(key.endsWith(":ACADEMY"))&&!x.player.retired&&[fixture.home,fixture.away].includes(x.player.club));
   const recent=users.map(x=>x.season.results.findLast(z=>z.date===date&&z.kind==="league"&&z.home===fixture.home&&z.away===fixture.away));
   if(recent.some(x=>!x))continue;
   let gh=0,ga=0,ah=0,aa=0;
   for(let i=0;i<users.length;i++){
    const m=recent[i],home=users[i].player.club===fixture.home;
    if(home){gh+=m.goals||0;ah+=m.assists||0}else{ga+=m.goals||0;aa+=m.assists||0}
   }
   g=duoGames[original];
   simulateNPCGame(fixture.home,fixture.away,fixture.hs,fixture.as,gh,ga,"league",ah,aa);
   fixture.npcAllocated=true;
  }
 }
 g=duoGames[original];
}
function europeanFinalKey(year,type){return String(year)+":"+type}
function eligibleSharedFinalist(x,date,type){
 return x&&x.season.stage==="playing"&&x.season.uefa?.type===type&&!x.season.uefa.completed&&
  x.season.events.slice(x.season.index).some(e=>e.kind==="europeKO"&&e.stage==="决赛"&&e.date===date);
}
function sharedEuropeanFinal(ev){
 if(!duoGames||!sharedUniverse||ev.kind!=="europeKO"||ev.stage!=="决赛"||!g.season.uefa)return null;
 const type=g.season.uefa.type,key=europeanFinalKey(g.year,type);
 const existing=sharedUniverse.europeFinals[key];if(existing)return existing;
 const other=DUO_IDS.map(id=>duoGames[id]).find(x=>x!==g);
 const shared=eligibleSharedFinalist(other,ev.date,type);
 let home=ev.home,away=ev.away;
 if(shared&&other.player.club!==g.player.club){
  [home,away]=Math.random()<.5?[g.player.club,other.player.club]:[other.player.club,g.player.club];
 }
 return {key,year:g.year,type,date:ev.date,home,away,sharedDuo:!!shared};
}
function assignEuropeanFinal(fixture,hs,as){
 const winner=hs>as?fixture.home:as>hs?fixture.away:(Math.random()<.5?fixture.home:fixture.away);
 const data={...fixture,hs,as,winner,npcAllocated:false};
 sharedUniverse.europeFinals[fixture.key]=data;
 return data;
}
function allocateSharedEuropeFinalNPC(date){
 if(!duoGames||!sharedUniverse)return;
 const before=g;
 for(const entry of Object.values(sharedUniverse.europeFinals||{})){
  if(!entry.sharedDuo||entry.npcAllocated||entry.date!==date||entry.hs===undefined)continue;
  const matches=DUO_IDS.map(id=>({player:duoGames[id].player,match:duoGames[id].season.results.findLast(m=>m.kind==="europeKO"&&m.stage==="决赛"&&m.date===date&&m.home===entry.home&&m.away===entry.away)}));
  if(matches.some(x=>!x.match))continue;
  let gh=0,ga=0,ah=0,aa=0;
  for(const x of matches){
   if(x.player.club===entry.home){gh+=x.match.goals||0;ah+=x.match.assists||0}
   else if(x.player.club===entry.away){ga+=x.match.goals||0;aa+=x.match.assists||0}
  }
  g=duoGames.wang;
  simulateNPCGame(entry.home,entry.away,entry.hs,entry.as,gh,ga,"europe",ah,aa);
  entry.npcAllocated=true;
 }
 g=before;
}
// Historic careers had independent European finals. No actual shared result
// exists to reconstruct, so choose deterministically using saved season data
// and leave a visible audit trail instead of deleting the old save.
function reconcileEuropeanHonors(){
 if(!duoGames||!sharedUniverse)return false;
 const claimsBySeason={};
 for(const id of DUO_IDS){
  const x=duoGames[id];
  for(const h of x.honors||[]){
   if(h.type!=="team"||!["欧冠冠军","欧联冠军"].includes(h.name))continue;
   const history=x.history?.findLast(m=>m.year===h.year&&m.generation===h.generation);
   const club=history?.club||x.player.club,type=h.name.replace("冠军",""),key=europeanFinalKey(h.year,type);
   (claimsBySeason[key]||(claimsBySeason[key]=[])).push({id,x,h,club});
  }
 }
 let changed=false;
 for(const [key,claims] of Object.entries(claimsBySeason)){
  if(claims.length<2||new Set(claims.map(c=>c.club)).size<2)continue;
  const recorded=sharedUniverse.europeFinals?.[key],verified=recorded?.winner||null;
  // Never invent a winner, delete a legacy trophy, or rewrite historic match data.
  // A record of the conflict is not a new official championship declaration.
  for(const c of claims){
   const disputed=!verified||c.club!==verified;
   if(c.h.legacyDisputed!==disputed||c.h.legacyConflictKey!==key){
    c.h.legacyDisputed=disputed;
    c.h.legacyConflictKey=key;
    changed=true;
   }
  }
  const corrections=sharedUniverse.europeTitleCorrections||(sharedUniverse.europeTitleCorrections=[]);
  if(!corrections.some(entry=>entry.key===key)){
   corrections.push({key,year:claims[0].h.year,competition:claims[0].h.name,
    winner:verified,conflictingClubs:claims.map(c=>c.club),
    reason:verified?"保留旧档冲突奖杯并标注；统一赛事冠军有独立证据":"旧档同届冠军相互矛盾，保留原记录，真实冠军待核实"});
   changed=true;
  }
 }
 return changed;
}

function runSharedDay(date,focusId=null,focusChoice="balanced"){
 const original=activeDuo;
 let total=0;
 // When both protagonists share a fixture and side, alternate processing order
 // across matchdays. The later player draws from the remaining scoring budget,
 // so a fixed Wang-first order would otherwise create a systematic advantage.
 const a=duoGames.wang,b=duoGames.vini,ea=a.season.events[a.season.index],eb=b.season.events[b.season.index];
 const sameSide=ea&&eb&&ea.date===date&&eb.date===date&&ea.kind===eb.kind&&ea.home===eb.home&&ea.away===eb.away&&
  (ea.kind==="national"?a.player.country===b.player.country:a.player.club===b.player.club&&a.player.leagueId===b.player.leagueId&&!!a.player.youth===!!b.player.youth);
 const dayHash=String(date).split("").reduce((n,c)=>n+c.charCodeAt(0),0);
 const order=sameSide&&dayHash%2?[...DUO_IDS].reverse():DUO_IDS;
 for(const id of order){
  activeDuo=id;g=duoGames[id];
  let safe=0;
  while(g.season.stage==="playing"&&g.season.events[g.season.index]?.date===date&&safe++<16){
   const ev=currentEvent();automaticPrep();
   playEvent(ev,id===focusId?focusChoice:"balanced",true);total++;
  }
  if(g.season.stage==="playing"&&g.season.index>=g.season.events.length)endSeason();
 }
 activeDuo=original;g=duoGames[original];allocateSharedNpcForDay(date);allocateSharedUefaNPC(date);linkSharedWorld();return total;
}
function sharedAdvanceDates(maxDays=1,focusDate=null,focusChoice="balanced"){
 if(!duoGames)return;
 let count=0,days=0,date;
 while((date=nextSharedDate())&&days<maxDays&&(!focusDate||date<=focusDate)){
  runSharedDay(date,focusDate===date?activeDuo:null,focusChoice);days++;count++;
 }
 for(const id of DUO_IDS){const x=duoGames[id];if(x.season.stage==="playing"&&x.season.index>=x.season.events.length){
  const original=activeDuo;activeDuo=id;g=x;endSeason();activeDuo=original;g=duoGames[original]
 }}
 linkSharedWorld();finalizeSharedSeason();save();render();return count;
}
function playSharedSelected(choice){
 const ev=currentEvent();if(!ev)return;
 // Run the entire shared calendar through the selected fixture's date.
 const date=ev.date;g.live=null;page="report";
 sharedAdvanceDates(400,date,choice);
 if(g.season.stage==="review")page="review";else page="report";
 save();render();
}

function simNext(){
 if(!duoGames||DUO_IDS.every(id=>duoGames[id].player.retired))return;
 const done=DUO_IDS.every(id=>duoGames[id].player.retired||duoGames[id].season.stage==="review");
 if(done){const old=duoGames.wang.year;nextSeason();if(duoGames.wang.year===old)return}
 sharedAdvanceDates(1);
}
function simBoth(){
 if(!duoGames)return;
 if(DUO_IDS.every(id=>duoGames[id].player.retired)){notify("两名球员均已退役，可查看生涯总结或开始新存档");return}
 const done=DUO_IDS.every(id=>duoGames[id].player.retired||duoGames[id].season.stage==="review");
 if(done){const oldYear=duoGames.wang.year;nextSeason();if(duoGames.wang.year!==oldYear)sharedAdvanceDates(400);return}
 sharedAdvanceDates(400);
}

function updateTable(table,home,away,hs,as){const a=table[home],b=table[away];if(!a||!b)return;for(const [t,sc,oc]of [[a,hs,as],[b,as,hs]]){t.p++;t.gf+=sc;t.ga+=oc;t.w+=sc>oc?1:0;t.d+=sc===oc?1:0;t.l+=sc<oc?1:0;t.points+=sc>oc?3:sc===oc?1:0}}
// Independent Poisson goal counts, inspired by open football goals models (no Python runtime required).
// Match-environment calibration table. Values are game tuning coefficients, not
// measured 2026 league figures. The structure accepts audited soccerdata imports
// in future without requiring its Python scrapers in the browser.
const LEAGUE_GOAL_ENV={ENG:1,ESP:1,ITA:1,GER:1,FRA:1,CHN:1,NED:1,POR:1,BRA:1,TUR:1,BEL:1,SCO:1,AUT:1,SUI:1,DEN:1};
function leagueFromClub(name){
 for(const [id,league] of Object.entries(DB))if(league.teams.some(t=>t.name===name))return id;
 return null;
}
function poissonGoals(lambda){const threshold=Math.exp(-C(lambda,.08,4.6));let n=0,product=1;do{product*=Math.random();n++}while(product>threshold&&n<12);return Math.min(n-1,7)}
function simulateScore(a,b,boost=0,reduceHome=0,reduceAway=0){
 const difference=C(power(a)-power(b)+boost,-38,38);
 const environment=LEAGUE_GOAL_ENV[leagueFromClub(a)]||1;
 const homeLambda=C(1.43*environment*Math.exp(difference/48)-reduceHome,.35,3.25);
 const awayLambda=C(1.12*environment*Math.exp(-difference/48)-reduceAway,.25,2.85);
 return [poissonGoals(homeLambda),poissonGoals(awayLambda)]
}
function otherLeagueGames(round,except){if(!round)return;for(const f of round.fixtures){if(f.home===except.home&&f.away===except.away)continue;const [hs,as]=simulateScore(f.home,f.away);updateTable(g.season.leagueTable,f.home,f.away,hs,as);simulateNPCGame(f.home,f.away,hs,as)}}
function finishHistoricalLeague(ev){const f=g.season.leagueRounds.find(x=>x.round===ev.round);let hs=ev.home==="曼联"?ev.verified.gf:ev.verified.ga,as=ev.away==="曼联"?ev.verified.gf:ev.verified.ga;updateTable(g.season.leagueTable,ev.home,ev.away,hs,as);otherLeagueGames(f,ev);simulateNPCGame(ev.home,ev.away,hs,as);g.season.leaguePlayed++;g.season.results.push({...ev,hs,as,real:true})}
function finishHistoricalEurope(ev){const e=g.season.uefa;if(!e)return;const hs=ev.home==="曼联"?ev.verified.gf:ev.verified.ga,as=ev.away==="曼联"?ev.verified.gf:ev.verified.ga;updateTable(e.table,ev.home,ev.away,hs,as);simulateNPCGame(ev.home,ev.away,hs,as,0,0,"europe");e.played++;g.season.results.push({...ev,hs,as,real:true});simulateUefaOthers(e,ev)}
function simulateUefaOthers(uefa,ev){
 const roundIdx=Number(ev.id?.slice(1));
 const rounds=uefa.drawRounds?.[roundIdx];
 if(rounds){
  for(const m of rounds){if(m.home===g.player.club||m.away===g.player.club)continue;
   const [hs,as]=m.real?[m.hs,m.as]:simulateScore(m.home,m.away);updateTable(uefa.table,m.home,m.away,hs,as);simulateNPCGame(m.home,m.away,hs,as,0,0,"europe")
  }
 }else{
  // Previous v4 save compatibility; newly created seasons use the complete drawn schedule above.
  const names=Object.keys(uefa.table).filter(n=>n!==ev.home&&n!==ev.away);names.sort(()=>Math.random()-.5);
  for(let j=0;j+1<names.length;j+=2){const [hs,as]=simulateScore(names[j],names[j+1]);updateTable(uefa.table,names[j],names[j+1],hs,as);simulateNPCGame(names[j],names[j+1],hs,as,0,0,"europe")}
 }
}

function simulateNPCGame(home,away,hs,as,excludeHome=0,excludeAway=0,mode="league",assistHome=0,assistAway=0){
 if(!g||!g.npcs)return;
 const euro=mode==="europe",appKey=euro?"europeApps":"apps",goalKey=euro?"europeGoals":"goals",assistKey=euro?"europeAssists":"assists",cleanKey=euro?"europeClean":"clean";
 for(const [club,goals,excluded,assisted] of [[home,hs,excludeHome,assistHome],[away,as,excludeAway,assistAway]]){
  const roster=g.npcs.filter(n=>n.club===club);if(!roster.length)continue;
  const active=roster.filter(n=>Math.random()<.86);if(!active.length)active.push(P(roster));
  active.forEach(n=>{n[appKey]=(n[appKey]||0)+1;if(n.pos==="GK"&&(club===home?as:hs)===0)n[cleanKey]=(n[cleanKey]||0)+1;if(!euro){const next=6.14+(Math.random()-.5)*1.3+(goals>0?.25:0)+C(((n.ov||76)-76)*.019,-.18,.38);n.rating=Number(((n.rating*(n.apps-1)+C(next,5,9.5))/n.apps).toFixed(2))}n.form=C(n.form+R(-3,4),0,100)});
  const pool=active.filter(n=>n.pos!=="GK");if(!pool.length)pool.push(...active);
  let left=C(goals-excluded,0,goals);
  while(left-->0){const weights=pool.map(n=>(n.pos==="ST"?6:["LW","RW","CAM"].includes(n.pos)?4:n.pos==="CM"?2:1)*C(Math.exp(((n.ov||76)-76)/16),.55,3.9));
   let v=Math.random()*weights.reduce((x,y)=>x+y,0),scorer=pool[0];for(let j=0;j<pool.length;j++){v-=weights[j];if(v<=0){scorer=pool[j];break}}scorer[goalKey]=(scorer[goalKey]||0)+1}
  for(let i=0;i<Math.max(0,goals-excluded-assisted);i++)if(Math.random()<.68){const creators=pool.filter(n=>["CM","CAM","LW","RW","CDM"].includes(n.pos)),choices=creators.length?creators:pool;
   const weights=choices.map(n=>C(Math.exp(((n.ov||76)-76)/16),.55,3.9)*(n.pos==="CAM"?1.35:1));
   let roll=Math.random()*weights.reduce((a,b)=>a+b,0),passer=choices[0];
   for(let j=0;j<choices.length;j++){roll-=weights[j];if(roll<=0){passer=choices[j];break}}
   passer[assistKey]=(passer[assistKey]||0)+1}
 }
}

function createWorld(season){
 const leagues={};const occupied=new Set(duoGames?DUO_IDS.map(id=>duoGames[id].player.leagueId):[g.player.leagueId]);for(const [id,db]of Object.entries(DB)){
  if(occupied.has(id))continue;
  const names=db.teams.map(t=>t.name),rounds=makeRR(names);
  leagues[id]={played:0,total:rounds.length,rounds,table:Object.fromEntries(names.map(name=>[name,{name,p:0,w:0,d:0,l:0,gf:0,ga:0,points:0}]))};
 }
 season.world=leagues;
 return leagues;
}
function advanceWorld(final=false){
 const s=g.season;if(!s.world)createWorld(s);
 const fraction=final?1:s.leaguePlayed/Math.max(1,s.leagueRounds.length);
 for(const [id,data]of Object.entries(s.world)){
  const target=Math.floor(fraction*data.total);
  while(data.played<target){const round=data.rounds[data.played];
   for(const f of round){const [hs,as]=simulateScore(f.home,f.away);updateTable(data.table,f.home,f.away,hs,as);simulateNPCGame(f.home,f.away,hs,as)}
   data.played++;
  }
 }
}
function offseasonClubUpdate(){
 if(!g?.season)return;
 g.clubRatings=g.clubRatings||{};
 for(const [id,db]of Object.entries(DB)){
  const table=id===g.player.leagueId?g.season.leagueTable:sharedUniverse?.rounds?.[g.year+":"+id]?.table||g.season.world?.[id]?.table;
  if(!table)continue;
  const sorted=sortedTable(table),total=sorted.length;
  sorted.forEach((t,idx)=>{const baseline=db.teams.find(x=>x.name===t.name.replace(/青训$/,""))?.power;
   if(baseline===undefined)return;
   const old=g.clubRatings[t.name.replace(/青训$/,"")]||baseline;
   const adjustment=idx<3?R(0,2):idx>=total-3?-R(0,2):R(-1,1);
   const next=C(old+adjustment,baseline-13,baseline+13);
   g.clubRatings[t.name.replace(/青训$/,"")]=C(next,40,99)
  })
 }
}

function simulateNPCOffseason(){
 if(!Array.isArray(g.npcs))return;
 const notable=g.npcs.filter(n=>n.apps>=12).sort((a,b)=>b.goals-a.goals).slice(0,10);
 g.npcHistory=g.npcHistory||[];g.npcHistory.push({year:g.year,top:notable.map(n=>({name:n.name,club:n.club,goals:n.goals,assists:n.assists}))});g.npcHistory=g.npcHistory.slice(-50);
 g.worldTransfers=g.worldTransfers||[];
 const allTeams=Object.entries(DB).flatMap(([id,league])=>league.teams.map(t=>({id,name:t.name,strength:power(t.name)})));
 for(const n of g.npcs){
  n.age=(n.age||24)+1;n.potential=n.potential||90;
  const ageLimit=n.pos==="GK"?41:["CB","CDM"].includes(n.pos)?40:39;
  const retirementRisk=n.age>=35?Math.min(.24,(n.age-34)*.023):0;
  if(n.age>=ageLimit||n.age>=35&&Math.random()<retirementRisk){
   sharedUniverse=sharedUniverse||{};
   if(n.realPerson){const names=sharedUniverse.retiredRealPeople||(sharedUniverse.retiredRealPeople=[]);if(!names.includes(n.name))names.push(n.name)}
   const retired=sharedUniverse.npcRetirements||(sharedUniverse.npcRetirements=[]);
   retired.push({year:g.year,name:n.name,age:n.age,club:n.club,position:n.pos,finalOverall:n.ov});
   if(retired.length>140)retired.splice(0,retired.length-140);
   n.realPerson=false;n.name=P(NAMES1)+"·"+P(NAMES2);n.age=R(17,21);
   n.ov=R(49,73);n.potential=R(78,96);n.id="new_"+g.year+"_"+n.id;n.form=45
  }
  else n.ov=C(n.ov+(n.age<25&&n.ov<n.potential?R(0,2):n.age>33?-R(0,2):R(-1,1)),40,99);
  if(n.age>=19&&n.age<=34&&n.ov>=64&&Math.random()<.022){
   const eligible=allTeams.filter(t=>t.name!==n.club&&Math.abs(t.strength-n.ov)<17);
   if(eligible.length){const dest=P(eligible),old=n.club;n.club=dest.name;g.worldTransfers.unshift({year:g.year,name:n.name,from:old,to:dest.name});}
  }
  n.apps=0;n.goals=0;n.assists=0;n.clean=0;n.europeApps=0;n.europeGoals=0;n.europeAssists=0;n.europeClean=0;n.rating=6.5;n.form=50;
 }
 g.worldTransfers=g.worldTransfers.slice(0,110)
}

function currentEvent(){return g.season.events[g.season.index]||null}
function sortedTable(table){return Object.values(table).sort((a,b)=>b.points-a.points||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf)}
function previousClubRank(id,club,year){
 const tables=[sharedUniverse?.rounds?.[year+":"+id]?.table];
 if(duoGames)for(const who of DUO_IDS){const x=duoGames[who];
  if(x.year===year&&x.player.leagueId===id&&!x.player.youth)tables.push(x.season.leagueTable);
  if(x.year===year)tables.push(x.season.world?.[id]?.table);
 }
 tables.push(g?.season?.world?.[id]?.table);
 for(const table of tables){
  if(!table?.[club]||!table[club].p)continue;
  const rank=sortedTable(table).findIndex(entry=>entry.name===club);
  if(rank>=0)return rank+1;
 }
 return null;
}
function playerFit(){let p=g.player;return C(.20+overall(p)/155+(p.coachTrust-55)/450+(p.parentCoach?.skills?.motivation||0)/650-(p.stamina<40?.16:0)+(p.seasonForm||0)*.10+(BP?BP.appearancesBonus(p.careerPath):0),.26,.91)}
function allocateAvailable(points,values,keys,limit){
 let n=0;while(points>0){const available=keys.filter(k=>values[k]<limit);if(!available.length)break;const key=available[n%available.length];values[key]++;points--;n++}return points
}
function autoPoints(){const p=g.player,weights=WEIGHTS[p.position],keys=Object.keys(STATS),sorted=keys.map((k,i)=>({k,w:weights[i],score:p.stats[k]})).sort((a,b)=>b.w-a.w||a.score-b.score).map(x=>x.k);if(Object.hasOwn(STATS,p.trainingFocus))sorted.unshift(sorted.splice(sorted.indexOf(p.trainingFocus),1)[0]);p.points=allocateAvailable(p.points,p.stats,sorted,p.potential);if(p.parentCoach){const c=p.parentCoach;c.points=allocateAvailable(c.points,c.skills,["training","tactics","motivation","scouting"],100)}}
function automaticPrep(){
 if(g.mode==="coach")return coachPreparation();const p=g.player;if(p.autoPoints)autoPoints();
 if(!p.autoTraining||p.trainingUsed)return;
 if(p.injuryMatches>0||p.stamina<64){p.stamina=C(p.stamina+(p.injuryMatches>0?13:20)+Math.round((p.parentCoach?.skills?.motivation||0)/30),0,100)}
 else{
  const weights=WEIGHTS[p.position],keys=Object.keys(STATS);
  const eligible=keys.filter(k=>p.stats[k]<p.potential);if(!eligible.length){p.stamina=C(p.stamina+10,0,100);p.trainingUsed=true;return}const focus=eligible.includes(p.trainingFocus)?p.trainingFocus:eligible.map(k=>({key:k,score:weights[keys.indexOf(k)]*(p.potential-p.stats[k])})).sort((a,b)=>b.score-a.score)[0].key;
  p.trainingProgress=p.trainingProgress||{};p.trainingProgress[focus]=(p.trainingProgress[focus]||0)+1;
  const baseThreshold=p.age<22?7:p.age<28?12:18,threshold=BP?BP.trainingThreshold(baseThreshold,p.careerPath):baseThreshold;const coachBonus=(p.parentCoach?.skills?.training||0)>=55?1:0;
  if(p.trainingProgress[focus]>=(threshold-coachBonus)&&p.stats[focus]<p.potential){p.stats[focus]++;p.trainingProgress[focus]=0}
  p.stamina=C(p.stamina-3,0,100)
 }
 p.trainingUsed=true
}

function training(k){const p=g.player;if(!STATS[k]||p.points<=0||p.stats[k]>=p.potential)return;p.stats[k]++;p.points--;save();render()}
function coachPoint(k){const c=g.player.parentCoach;if(!c||!Object.hasOwn(c.skills,k)||!c.points||c.skills[k]>=100)return;c.skills[k]++;c.points--;save();render()}
function manualRecovery(){
 const p=g?.player;if(!p||g.season.stage!=="playing"||p.trainingUsed){notify("本场比赛前已经训练或恢复过");return}
 p.stamina=C(p.stamina+25,0,100);p.trainingUsed=true;log("完成体能恢复课程：体能提升至"+p.stamina);save();render()
}
function manualTraining(key){
 const p=g?.player;if(!p||g.season.stage!=="playing"||p.trainingUsed||!STATS[key]){notify("本轮无法继续训练");return}
 if(p.stamina<23){notify("体能不足，请优先休息恢复");return}
 p.trainingProgress=p.trainingProgress||{};p.trainingProgress[key]=(p.trainingProgress[key]||0)+2;
 const baseThreshold=p.age<22?7:p.age<28?12:18,threshold=BP?BP.trainingThreshold(baseThreshold,p.careerPath):baseThreshold;
 if(p.trainingProgress[key]>=threshold&&p.stats[key]<p.potential){p.stats[key]++;p.trainingProgress[key]=0;notify(STATS[key]+"能力提升1点")}
 p.stamina=C(p.stamina-12,0,100);p.trainingUsed=true;log("进行了"+STATS[key]+"专项训练，体能消耗12点。");save();render()
}
function advance(skip=false){if(!g||g.season.stage!=="playing")return;if(g.mode==="coach")coachPreparation();const ev=currentEvent();if(!ev){endSeason();return}if(!skip&&(!g.player.autoPoints&&g.player.points>0||g.player.parentCoach&&!g.player.autoPoints&&g.player.parentCoach.points>0)){if(!confirm("有未分配的能力点，是否先继续比赛？你也可以前往训练页面加点。"))return}automaticPrep();if(skip){playEvent(ev,"balanced",true);return}g.live={index:g.season.index,event:ev};page="match";save();render()}
// Calibrated match rating: goals and assists matter, but even a scoreless good team
// performance receives a professional-grade rating. This is a lightweight xT-like
// proxy, NOT a claim to implement event-level VAEP without action event feeds.
function calcRating(outcome,goals,assists,win,context={}){
 const opposition=C((context.opponentPower||75)-(context.teamPower||75),-25,25);
 const resultBonus=win?.38:-.08;
 const involvement=goals*.62+assists*.40;
 const strengthBonus=C(opposition*.006,-.15,.15);
 const competitionBonus=context.leagueId==="CHN"?-.02:0;
 const rating=6.47+(outcome?.15:0)+resultBonus+involvement+strengthBonus+competitionBonus+C(context.seasonForm||0,-1,1)*.58+(Math.random()-.5)*1.10;
 return Math.round(C(rating,4.6,9.8)*10)/10;
}
// Only use the actual team score already simulated for this match. This is a
// small role-sensitive rating adjustment, not a claim that tackles or saves
// were simulated. Attacking positions preserve their existing rating exactly.
function roleAdjustedRating(rating,position,goalsAgainst){
 if(!["CDM","CB","LB","RB","GK"].includes(position)||!Number.isFinite(goalsAgainst))return rating;
 const factor=position==="CDM"?.5:1;
 const impact=goalsAgainst===0?.25:-Math.min(.35,Math.max(0,goalsAgainst-1)*.12);
 return Math.round(C(rating+impact*factor,4.6,9.8)*10)/10;
}
// Allocate actual team goals to the player and teammates; no invented personal goals.
// A scorer's probability is a share of the team's actual goals, not extra goals.
function playerMatchContribution(p,ev,opponentPower,teamGoals,choice="balanced",minutes=90){
 const ov=overall(p),advantage=C((ov-opponentPower)/35,-.65,.75);
 const attacker=["ST","LW","RW"].includes(p.position),creator=["CAM","CM","LW","RW"].includes(p.position);
 const shotBase=p.position==="ST"?.16:attacker?.125:p.position==="CAM"?.065:.018;
 const assistBase=p.position==="CAM"?.19:creator?.14:p.position==="ST"?.065:.035;
 const traitBonus=CD?CD.contributionModifiers(p,ev):{shoot:1,assist:1};
 const shoot=C((shotBase+advantage*.095+(p.stats.shoot-70)*.0016+(choice==="attack"?.018:0)+(p.seasonForm||0)*.055)*traitBonus.shoot*(BP?BP.contributionBonus(p,"shoot"):1),.005,.30);
 const assist=C((assistBase+advantage*.055+(p.stats.pass-70)*.0017+(choice==="creative"?.02:0)+(p.seasonForm||0)*.042)*traitBonus.assist*(BP?BP.contributionBonus(p,"assist"):1),.008,.28);
 // Soft upper tail: historic 50+ goal club seasons should be very rare, not routine.
 const already=g?.season?.goals||0,created=g?.season?.assists||0;
 const finishingDiminish=already>45?.30:already>35?.50:already>25?.72:1;
 const assistDiminish=created>35?.48:created>25?.72:1;
 let goals=0,assists=0;
 for(let i=0;i<teamGoals;i++){
  // Goals are not yet simulated minute by minute. For a dismissed player,
  // sample whether this team goal happened while they were still on the pitch.
  if(minutes<90&&Math.random()>=C(minutes/90,0,1))continue;
  const r=Math.random();
  if(r<shoot*finishingDiminish)goals++;
  else if(r<shoot*finishingDiminish+(1-shoot*finishingDiminish)*assist*assistDiminish)assists++;
 }
 return {goals,assists}
}
// Both protagonists must share the actual team goals in the same fixture.
// Each goal has at most one scorer and at most one assist; a goal scored by
// one protagonist may legitimately have been assisted by the other.
function sharedTeammateResult(p,ev,home,away){
 if(!duoGames)return null;
 const other=DUO_IDS.map(id=>duoGames[id]).find(x=>x&&x!==g&&x.year===g.year);
 if(!other)return null;
 const sameTeam=ev.kind==="national"?other.player.country===p.country:
  other.player.club===p.club&&other.player.leagueId===p.leagueId&&!!other.player.youth===!!p.youth;
 if(!sameTeam)return null;
 return (other.season.results||[]).findLast(m=>m.kind===ev.kind&&m.date===ev.date&&
  m.home===home&&m.away===away&&m.competition===ev.competition&&
  m.stage===ev.stage&&(!ev.fixtureId||m.fixtureId===ev.fixtureId))||null;
}
function capSharedContributions(p,ev,home,away,teamGoals,contribution){
 const prior=sharedTeammateResult(p,ev,home,away);
 if(!prior)return contribution;
 return {goals:Math.min(contribution.goals,Math.max(0,teamGoals-(prior.goals||0))),
  assists:Math.min(contribution.assists,Math.max(0,teamGoals-(prior.assists||0)))};
}
// Discipline is competition-specific; injuries cover the player's team fixtures.
function disciplinaryScope(ev){return ev.kind==="europeKO"||ev.kind==="europe"?"europe":ev.kind==="national"?"national":ev.kind==="cup"?"cup":"league"}
function disciplinaryRecord(p,ev){
 const scope=disciplinaryScope(ev);
 if(!p.discipline){
  p.discipline={league:{yellow:Math.max(0,p.yellowCards||0),ban:Math.max(0,p.suspension||0)},europe:{yellow:0,ban:0},cup:{yellow:0,ban:0},national:{yellow:0,ban:0}};
 }
 if(!p.discipline[scope])p.discipline[scope]={yellow:0,ban:0};
 return p.discipline[scope];
}
// Match-card probabilities are per appearance. Second caution means immediate dismissal;
 // serious direct red is rare, and never combined with yellow in the same match.
function rollMatchCards(p,choice="balanced",random=Math.random){
 const byPosition={GK:.045,ST:.105,LW:.165,RW:.165,CAM:.155,CM:.19,CDM:.245,LB:.21,RB:.21,CB:.235};
 const yellowChance=C((byPosition[p.position]??.16)+(choice==="defend"?.025:choice==="attack"?-.01:0),.03,.29);
 const roll=random();
 if(roll<.001)return {yellowCards:0,redCard:"direct"};
 if(roll<.001+yellowChance)return random()<.012?
  {yellowCards:2,redCard:"second-yellow"}:{yellowCards:1,redCard:null};
 return {yellowCards:0,redCard:null};
}
function applyMatchDiscipline(p,ev,choice="balanced",random=Math.random){
 const scope=disciplinaryScope(ev),record=disciplinaryRecord(p,ev);
 const cards=rollMatchCards(p,choice,random);
 if(cards.redCard){
  p.redCards=(p.redCards||0)+1;
  const ban=cards.redCard==="second-yellow"?1:2;
  record.ban=Math.max(record.ban,ban);
  log(p.name+"在"+scope+"赛事"+(cards.redCard==="second-yellow"?"两黄变一红":"因严重犯规被直接红牌罚下")+"，该项赛事停赛"+ban+"场。");
 }else if(cards.yellowCards===1){
  record.yellow++;
  log(p.name+"在"+scope+"赛事领到1张黄牌。");
  if(record.yellow>=5){record.ban=Math.max(record.ban,1);record.yellow=0;log(p.name+"在"+scope+"累计5张黄牌，该赛事下轮停赛。")}
 }
 return cards;
}
function refreshSuspensionSummary(p){
 p.suspension=Math.max(0,...Object.values(p.discipline||{}).map(x=>x.ban||0));
 p.yellowCards=p.discipline?.league?.yellow||0;
}
// Game estimate based on the last five actual player fixtures. A missed match
// contributes zero minutes so a period of rest reduces the recorded workload.
function recordRecentMatchMinutes(p,minutes){
 const previous=Array.isArray(p.recentMatchMinutes)?p.recentMatchMinutes:[];
 const valid=previous.filter(Number.isFinite).map(n=>C(n,0,90)).slice(-4);
 p.recentMatchMinutes=[...valid,C(Number.isFinite(minutes)?minutes:0,0,90)];
}
function injuryRiskFor(p,minutes=90){
 const recent=Array.isArray(p.recentMatchMinutes)?p.recentMatchMinutes:[];
 const load=recent.filter(Number.isFinite).slice(-5).reduce((sum,n)=>sum+C(n,0,90),0)/90;
 const age=Number.isFinite(p.age)?p.age:25,fitness=Number.isFinite(p.stamina)?p.stamina:70;
 const fullMatchRisk=.008+Math.max(0,44-fitness)*.0015+Math.max(0,age-29)*.0006+Math.max(0,load-3)*.002;
 return C(fullMatchRisk,.005,.075)*C(Number.isFinite(minutes)?minutes:0,0,90)/90;
}
function injuryDuration(random=Math.random){
 const kind=C(random(),0,.999999),bounds=kind<.58?[1,2]:kind<.88?[3,7]:kind<.98?[8,15]:[16,30];
 return bounds[0]+Math.floor(C(random(),0,.999999)*(bounds[1]-bounds[0]+1));
}
function offseasonRecovery(p){
 const before={injury:Math.max(0,p.injuryMatches||0),fitness:p.stamina||0};
 // Summer rest heals most fatigue and a portion of injury, but serious injuries persist.
 const healed=C(R(1,2),0,3);
 p.injuryMatches=Math.max(0,before.injury-healed);
 p.stamina=C(before.fitness+R(20,38),0,95);
 p.trainingUsed=false;
 p.recentMatchMinutes=[];
 if(p.discipline)for(const record of Object.values(p.discipline)){
  record.yellow=0; // accumulated bookings reset; bans carry through.
 }
 refreshSuspensionSummary(p);
 return {injuryBefore:before.injury,injuryAfter:p.injuryMatches,fitnessBefore:before.fitness,fitnessAfter:p.stamina};
}
// Share national-team knockout shootout outcomes across both player careers.
// The decision is stored in national match data, already persisted in compact saves.
function sharedNationalKnockoutWin(ev,home,away,our,their,random=Math.random){
 if(our!==their)return our>their;
 const key=g.year+":"+ev.date+":"+ev.stage+":"+home+":"+away;
 const entry=sharedUniverse?.national?.[key];
 if(!entry)return random()<.5;
 if(typeof entry.penaltyWin!=="boolean")entry.penaltyWin=random()<.5;
 return entry.penaltyWin;
}
// A score can only respond to a dismissal before that match is shared or fixed.
// For a single controlled player, scale the change to the remaining match time.
// Multiple controlled players in the same competition are deliberately left
// unchanged until their appearances/cards can be generated together; UEFA is
// precomputed and also remains unchanged rather than corrupting its bracket.
function dismissalScoreModifiers(p,ev,home,away,cards){
 if(!cards?.redCard||!Number.isFinite(cards.redMinute)||ev.verified||!["league","cup","national"].includes(ev.kind))return null;
 const team=ev.kind==="national"?p.country:p.club;
 if(team!==home&&team!==away)return null;
 const others=duoGames?DUO_IDS.map(id=>duoGames[id]).filter(x=>x&&x!==g&&!x.player.retired):[];
 if(ev.kind==="league"){
  if(others.some(x=>x.player.leagueId===p.leagueId&&!!x.player.youth===!!p.youth))return null;
  const key=g.year+":"+p.leagueId+(p.youth?":ACADEMY":"");
  if(sharedUniverse?.rounds?.[key]?.rounds?.[ev.round])return null;
 }else if(ev.kind==="cup"){
  if(others.some(x=>x.player.leagueId===p.leagueId&&!!x.player.youth===!!p.youth&&[home,away].includes(x.player.club))||sharedTeammateResult(p,ev,home,away))return null;
 }else{
  if(others.some(x=>[home,away].includes(x.player.country)))return null;
  const key=g.year+":"+ev.date+":"+ev.stage+":"+home+":"+away;
  if(sharedUniverse?.national?.[key])return null;
 }
 const remaining=C((90-cards.redMinute)/90,0,1);
 if(!remaining)return null;
 const own=.40*remaining,opponent=-.25*remaining;
 return team===home?{home:own,away:opponent}:{home:opponent,away:own};
}
function playEvent(ev,choice="balanced",batch=false){if(g.mode==="coach")return coachMatch(ev,choice,batch);const p=g.player,s=g.season;let isOut=(ev.kind==="cup"&&!s.cup.active)||((ev.kind==="europe"||ev.kind==="europeKO")&&(!s.uefa||s.uefa.completed))||(ev.kind==="national"&&(p.age<18||s.national&&!s.national.active));let eventResult=null;
 if(isOut){p.trainingUsed=false;s.index++;s.completed++;g.live=null;if(!batch){save();render()}return}
 const sharedMatch=findSharedUefa(ev);
 const home=ev.home|| (ev.kind==="national"?p.country:ev.kind==="cup"?(s.cup.stage%2?p.club:"对手") :p.club),away=ev.away|| (ev.kind==="national"?"国家队对手":ev.kind==="cup"?(s.cup.stage%2?"对手":p.club):"对手");
 const ownHome=home===p.club||ev.kind==="national"&&home===p.country;
 const opponent=ownHome?away:home,oppStrength=ev.kind==="national"?C(75+R(-12,12),50,94):ev.kind==="cup"?R(62,94):power(opponent);
 const formationBonus={"4-3-3":1,"4-2-3-1":2,"3-5-2":1,"4-4-2":0,"5-3-2":-1}[p.parentCoach?.formation||"4-3-3"]||0;const ourPower=C(power(p.club)+(overall(p)-75)*.23+(p.parentCoach?p.parentCoach.skills.tactics*.1+formationBonus:0),45,99);
 const disciplinary=disciplinaryRecord(p,ev);
 const injuredBefore=(p.injuryMatches||0)>0,suspendedBefore=(disciplinary.ban||0)>0;
 const unable=injuredBefore||suspendedBefore;
 const appears=!unable&&p.stamina>20&&Math.random()<playerFit();
 if(!appears)choice="balanced";
 const played=appears;
 const lineup=played&&CD?CD.lineup(p,overall(p),power(p.club)):null;
 const started=played?(lineup?lineup.started:true):false;
 const entryMinute=played&&!started?lineup.entryMinute:0;
 let matchCards={yellowCards:0,redCard:null};
 if(played){matchCards=applyMatchDiscipline(p,ev,choice);
  if(matchCards.redCard)matchCards.redMinute=R(Math.max(entryMinute+5,matchCards.redCard==="second-yellow"?35:15),89)}
 const minutesPlayed=played?(matchCards.redMinute?Math.max(1,matchCards.redMinute-entryMinute):90-entryMinute):0;
 const bias=choice==="creative"?4:0;
 const targetDiff=(ownHome?1:-1)*(ourPower-oppStrength+bias);
 const defending=choice==="defend";
 const redScore=dismissalScoreModifiers(p,ev,home,away,matchCards);
 const baselineImpact=ev.kind==="league"&&sharedUniverse?null:redScore;
 const baseline=simulateScore(home,away,targetDiff-(power(home)-power(away)),(defending?(ownHome?.2:.55):choice==="attack"?(ownHome?-.35:-.2):0)+(baselineImpact?.home||0),(defending?(ownHome?.55:.2):choice==="attack"?(ownHome?-.2:-.35):0)+(baselineImpact?.away||0));
 let hs=baseline[0],as=baseline[1];
 if(sharedMatch){hs=sharedMatch.fixture.hs;as=sharedMatch.fixture.as;}
 let redScoreEffect=!!baselineImpact;
 if(ev.kind==="league"){const fixture=sharedLeagueRound(ev,redScore);if(fixture){hs=fixture.hs;as=fixture.as;redScoreEffect=!!fixture.redScoreEffect}}else if(ev.kind==="national"&&sharedUniverse){const key=g.year+":"+ev.date+":"+ev.stage+":"+home+":"+away,existing=sharedUniverse.national[key];if(existing){hs=existing.hs;as=existing.as;redScoreEffect=false}else sharedUniverse.national[key]={hs,as}}let our=ownHome?hs:as,their=ownHome?as:hs;
 // Teammates play one domestic cup fixture, including a shared shootout.
 const priorCup=ev.kind==="cup"?sharedTeammateResult(p,ev,home,away):null;
 if(priorCup){hs=priorCup.hs;as=priorCup.as;our=ownHome?hs:as;their=ownHome?as:hs}
 const contribution=played?capSharedContributions(p,ev,home,away,our,playerMatchContribution(p,ev,oppStrength,our,choice,minutesPlayed)):{goals:0,assists:0};
 let goals=contribution.goals,assists=contribution.assists;
 let rating=played?roleAdjustedRating(calcRating(choice==="attack"||choice==="creative",goals,assists,our>their,{opponentPower:oppStrength,teamPower:ourPower,leagueId:p.leagueId,seasonForm:p.seasonForm||0}),p.position,their):0;
 const bodyContests=played&&BP?BP.simulateContests(p,Math.random,minutesPlayed):null;
 if(played&&BP)rating=Math.round(C(rating+BP.matchScoreBonus(p)+(bodyContests?.ratingDelta||0),4.6,9.8)*10)/10;
 if(played&&p.positionTarget)rating=Math.max(4.6,Math.round((rating-.10)*10)/10);
 if(matchCards.redCard)rating=Math.max(4.6,Math.round((rating-.4)*10)/10);
 if(ev.kind==="league"){if(!sharedUniverse){const round=s.leagueRounds.find(r=>r.round===ev.round);otherLeagueGames(round,ev);updateTable(s.leagueTable,home,away,hs,as);simulateNPCGame(home,away,hs,as,ownHome?goals:0,ownHome?0:goals)}s.leaguePlayed++;if(our>their)s.points+=3;else if(our===their)s.points++;advanceWorld()}
 if(ev.kind==="europe"){const e=s.uefa;
 if(sharedMatch)processSharedUefaRound(ev);
 else{updateTable(e.table,home,away,hs,as);simulateNPCGame(home,away,hs,as,ownHome?goals:0,ownHome?0:goals,"europe");simulateUefaOthers(e,ev)}
 e.played++;
 if(e.played>=8){const rank=sharedMatch?sharedMatch.comp.standings.indexOf(p.club)+1:sortedTable(e.table).findIndex(t=>t.name===p.club)+1;e.rank=rank;if(rank>24){e.completed=true;e.stage="eliminated";log(e.type+"联赛阶段第"+rank+"名，未能晋级。")}else{e.stage="knockout";if(sharedMatch)addSharedKnockouts();else addKnockouts()}}}
 let cupWin=null;
 if(ev.kind==="cup"){
  const penalties=our===their,peer=DUO_IDS.map(id=>duoGames?.[id]).find(x=>x&&x!==g&&x.year===g.year);
  // Old saves may have the shootout in cup.results rather than on the match.
  const recorded=priorCup?(typeof priorCup.cupWin==="boolean"?priorCup.cupWin:peer?.season.cup?.results?.findLast(r=>r.stage===ev.stage&&r.hs===hs&&r.as===as)?.win):null;
  const win=typeof recorded==="boolean"?recorded:our>their||(penalties&&Math.random()<C(.5+(overall(p)-75)/250,.35,.68));
  cupWin=win;s.cup.results.push({stage:ev.stage,hs,as,win,penalties});if(penalties)log(s.cup.name+ev.stage+"90分钟战平，"+(win?"点球晋级。":"点球出局。"));if(!win){s.cup.active=false;log(s.cup.name+" "+ev.stage+"止步。")}else{s.cup.stage++;if(ev.stage==="决赛"){s.cup.active=false;award(s.cup.name+"冠军","team")}}}
 if(ev.kind==="national"){s.nationalApps++;if(played)p.career.national++;const n=s.national;
 if(n){n.results.push({stage:ev.stage,home,away,hs,as});if(n.knockout){
  if(ev.nationalIndex<=2){n.groupPlayed++;n.groupPoints+=our>their?3:our===their?1:0;if(n.groupPlayed===3){if(n.groupPoints>=4){n.stage="knockout";log(p.country+" "+n.name+"小组赛出线！")}else{n.active=false;n.stage="eliminated";log(p.country+" "+n.name+"小组赛出局。")}}}
  else{const pen=our===their,win=sharedNationalKnockoutWin(ev,home,away,our,their);if(pen)log(p.country+n.name+ev.stage+(win?"通过点球大战晋级。":"点球大战遗憾出局。"));if(!win){n.active=false;n.stage="eliminated";log(p.country+" "+n.name+ev.stage+"出局。")}else if(ev.stage==="决赛"){n.active=false;n.stage="champion";award(ev.competition+"冠军","national")}}}
 }}
 if(ev.kind==="europeKO"){if(sharedMatch)processSharedUefaKO(ev);
 else simulateNPCGame(home,away,hs,as,ownHome?goals:0,ownHome?0:goals,"europe");
 const e=s.uefa;if(!e.koAggregate)e.koAggregate={};let agg=e.koAggregate[ev.stage]||{for:0,against:0,legs:0};agg.for+=our;agg.against+=their;agg.legs++;e.koAggregate[ev.stage]=agg;
 if(ev.stage==="决赛"||ev.leg===2){let win=sharedMatch?sharedMatch.fixture.winner===p.club:(agg.for>agg.against||(agg.for===agg.against&&Math.random()<.5));if(agg.for===agg.against)log(e.type+ev.stage+"总比分打平，进行加时与点球决胜。");e.knockoutResults.push({stage:ev.stage,win,score:agg.for+"-"+agg.against,legs:agg.legs});if(!win){e.completed=true;e.stage="eliminated";log(e.type+ev.stage+"两回合总比分"+agg.for+"-"+agg.against+"，出局。")}else if(ev.stage==="决赛"){e.completed=true;e.stage="champion";award(e.type+"冠军","team")}else log(e.type+ev.stage+"两回合晋级。")}
}
 if(played&&CD){s.starts=(s.starts||0)+(started?1:0);s.subApps=(s.subApps||0)+(started?0:1);p.lineupCareer=p.lineupCareer||{starts:0,substitutes:0};p.lineupCareer.starts+=started?1:0;p.lineupCareer.substitutes+=started?0:1;}
 if(played){s.apps++;s.goals+=goals;s.assists+=assists;s.ratings.push(rating);if(their===0)s.clean++;if(ev.kind==="europe"||ev.kind==="europeKO"){s.europeApps=(s.europeApps||0)+1;s.europeGoals=(s.europeGoals||0)+goals;s.europeAssists=(s.europeAssists||0)+assists}if(ev.kind==="league"){s.leagueApps=(s.leagueApps||0)+1;s.leagueGoals=(s.leagueGoals||0)+goals;s.leagueAssists=(s.leagueAssists||0)+assists;(s.leagueRatings||(s.leagueRatings=[])).push(rating);if(their===0)s.leagueClean=(s.leagueClean||0)+1}{
 const record=p.youth?(p.academyCareer||(p.academyCareer={apps:0,goals:0,assists:0})):p.career;
 record.apps++;record.goals+=goals;record.assists+=assists;
 p.points+=(record.apps%(p.age<22?9:p.age<28?15:24)===0?1:0);
 }if(rating>=8.7&&Math.random()<.15)p.points++;p.form=percent(p.form+(rating-6.6)*2.2);p.coachTrust=percent(p.coachTrust+(rating-6.3)*1.5);p.fame=percent(p.fame+(rating>8?2:0))}
 if(injuredBefore){p.injuryMatches--;if(p.injuryMatches===0)log(p.name+"伤愈归队。")}
 if(suspendedBefore){disciplinary.ban--;if(disciplinary.ban===0)log(p.name+"在本项赛事停赛期满。")}
 let newInjury=0;
 recordRecentMatchMinutes(p,minutesPlayed);
 if(played&&CD){const positionUpdate=CD.progressPosition(p);if(positionUpdate?.completed)log(p.name+"位置改造成功："+CD.ROLE_NAMES[positionUpdate.from]+" → "+CD.ROLE_NAMES[positionUpdate.to]);}
 if(played){
  const loss=Math.round((R(8,17)+(choice==="attack"?4:choice==="creative"?2:0)-Math.round((p.stats.physical-60)/30))*minutesPlayed/90/(BP?BP.profile(p).endurance:1));
  p.stamina=percent(p.stamina-loss+(ev.kind==="league"?5:3));
  const injuryRisk=injuryRiskFor(p,minutesPlayed)*(CD?CD.injuryFactor(p):1);
  if(Math.random()<injuryRisk){newInjury=injuryDuration();p.injuryMatches=newInjury;p.injuryHistory=(p.injuryHistory||0)+1;log(p.name+"在"+(ev.competition||DB[p.leagueId].name)+"中受伤，预计缺阵"+p.injuryMatches+"场比赛。")}
 }else{p.stamina=percent(p.stamina+R(4,9))}
 refreshSuspensionSummary(p);p.trainingUsed=false;p.morale=percent(p.morale+(our>their?3:our===their?0:-3));p.cash+=p.wage/2;if(p.parentCoach)p.parentCoach.points+=ev.kind==="league"&&Math.random()<.25?1:0;
 eventResult={...ev,home,away,hs,as,played,started:played?started:null,entryMinute:played?entryMinute:null,lineupRole:played?(started?"首发":"替补"):null,goals,assists,rating,real:false,
  injury:p.injuryMatches||0,newInjury,suspension:disciplinary.ban||0,competitionBan:disciplinaryScope(ev),yellowCards:matchCards.yellowCards,redCard:matchCards.redCard,redMinute:matchCards.redMinute||null,redMinuteSource:matchCards.redCard?"simulation":null,redScoreEffect,minutesPlayed,cupWin,
  missedReason:injuredBefore?"injury":suspendedBefore?"suspension":!played?"rotation":null,bodyContests};s.results.push(eventResult);g.lastMatch=eventResult;log((ev.competition||DB[p.leagueId].name)+"："+home+" "+hs+"–"+as+" "+away+(played?"，"+p.name+" "+goals+"球"+assists+"助，评分"+rating:"，未出场"));
 s.index++;s.completed++;g.live=null;
 if(!batch){if(s.index>=s.events.length)endSeason();else{save();page="report";render()}}
}
function addKnockouts(){
 const e=g.season.uefa,p=g.player;if(!e||e.rank>24)return;
 const stages=e.rank<=8?["十六强","八强","半决赛","决赛"]:["附加赛","十六强","八强","半决赛","决赛"];
 const dates={"附加赛":["02-17","02-24"],"十六强":["03-10","03-17"],"八强":["04-07","04-14"],"半决赛":["05-05","05-12"],"决赛":["05-29"]};
 const year=g.year+1,possible=Object.keys(e.table).filter(t=>t!==p.club);
 e.koAggregate={};let additional=[];
 for(const stage of stages){const opp=P(possible);dates[stage].forEach((part,index)=>{const leg=index+1,home=(leg===1&&stage!=="决赛")?opp:p.club,away=home===p.club?opp:p.club;
   additional.push({id:"ko_"+stage+"_"+leg,kind:"europeKO",date:year+"-"+part,competition:e.type,stage,leg,home,away});
 });}
 g.season.events.push(...additional);
 g.season.events.sort((a,b)=>a.date.localeCompare(b.date));
}
function award(name,type){
 if(type==="team"&&["欧冠冠军","欧联冠军"].includes(name)&&g.season.uefa?.sharedKey){
  const winner=sharedUniverse?.europeCompetitions?.[g.season.uefa.sharedKey]?.champion;
  if(winner!==g.player.club){log(name+"冠军与统一赛程不符，拒绝重复颁奖");return}
 }
 if(!g.honors.some(h=>h.name===name&&h.year===g.year&&h.generation===g.generation)){g.honors.push({year:g.year,name,type,generation:g.generation});log("赢得荣誉："+name)}}
function finishVote(){
 ensureRealAwardPlayers();
 const s=g.season,p=g.player,avg=s.ratings.length?s.ratings.reduce((a,b)=>a+b,0)/s.ratings.length:6.2;
 const year=g.year+1,pointsFor=UCL_PTS;
 const honors=g.honors.filter(h=>h.year===g.year&&h.generation===g.generation).length;
 const candidates=g.npcs.filter(n=>n.realPerson).map(n=>{
  const goals=(n.goals||0)+(n.europeGoals||0),assists=(n.assists||0)+(n.europeAssists||0),apps=(n.apps||0)+(n.europeApps||0);
  const rating=n.rating||6.3;
  return {id:n.id,name:n.name,club:n.club,goals,assists,apps,ov:n.ov,rating,
   realPerson:true,score:awardCandidateScore({club:n.club,goals,assists,apps,ov:n.ov,rating},g.year,awardTeamHonours(n.club,g.year))}
 });
 const you={id:"USER",name:p.name,club:p.club,goals:s.goals,assists:s.assists,apps:s.apps,ov:overall(p),rating:avg,
  realPerson:false,score:awardCandidateScore({club:p.club,goals:s.goals,assists:s.assists,apps:s.apps,ov:overall(p),rating:avg},g.year,honors)};
 candidates.push(you);candidates.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
 const list=candidates.slice(0,30),qualified=list.some(x=>x.id==="USER");
 if(list.length!==30)throw Error("金球奖候选名单必须包含30位球员");
 const points=Object.fromEntries(list.map(x=>[x.id,0]));
 const votes=Object.fromEntries(list.map(x=>[x.id,Array(10).fill(0)]));
 const ballots=[];
 for(let juror=0;juror<100;juror++){
  const top=list.map(x=>({id:x.id,score:x.score+R(-13,13)+.12*x.goals*Math.sin(juror*1.41)}))
    .sort((a,b)=>b.score-a.score).slice(0,10);
  top.forEach((x,i)=>{points[x.id]+=pointsFor[i];votes[x.id][i]++});
  ballots.push(top.map(x=>x.id))
 }
 const tie=(a,b)=>{for(let i=0;i<10;i++)if(votes[a.id][i]!==votes[b.id][i])return votes[b.id][i]-votes[a.id][i];return a.name.localeCompare(b.name)};
 const ranked=list.map(x=>({id:x.id,name:x.name,club:x.club,goals:x.goals,assists:x.assists,apps:x.apps,
  points:points[x.id],firstPlaceVotes:votes[x.id][0],voteRanks:votes[x.id],realPerson:x.realPerson}))
   .sort((a,b)=>b.points-a.points||tie(a,b));
 const place=qualified?ranked.findIndex(x=>x.id==="USER")+1:null;
 const winner=ranked[0],pointTotal=ranked.reduce((a,b)=>a+b.points,0);
 if(pointTotal!==6700||ranked.some(x=>x.points>1500))throw Error("金球奖计票检查失败");
 g.ballonHistory.push({year,generation:g.generation,rank:place,playerNominated:qualified,playerPoints:qualified?points.USER:0,
   winner:{id:winner.id,name:winner.name,club:winner.club,points:winner.points},
   rankings:ranked,ballots,totalPoints:pointTotal,maxPlayerPoints:1500,model:5});
 g.awardViewIndex=g.ballonHistory.length-1;
 if(place===1)award("金球奖（法国足球规则）","individual");
 log("金球奖"+year+"年："+winner.name+"获得"+winner.points+"分；"+(qualified?p.name+"排名第"+place:"你未进入30人候选名单")+"。")
}


function awardLeagueTier(club){
 for(const [id,l] of Object.entries(DB))if(l.teams.some(t=>t.name===club))return id==="CHN"?.55:["NED","POR","TUR","BEL","SCO","AUT","SUI","DEN"].includes(id)?.82:id==="BRA"?.78:1;
 return .76;
}
// Version 7 award model: verified club achievements are shared by every
// player at that club, including NPCs. Old award records remain untouched.
function awardTeamHonours(club,year){
 const tables=Object.entries(sharedUniverse?.rounds||{}).filter(([k])=>k.startsWith(year+":")).map(([,x])=>x.table)
  .concat(Object.values(g?.season?.world||{}).map(x=>x.table),[g?.season?.leagueTable]);
 // One league championship counts once, even if the same table is in multiple
 // shared-world ledgers. Domestic league prestige is a game estimate.
 const leagueWin=tables.some(t=>t&&sortedTable(t)[0]?.name===club);
 const leagueValue=leagueWin?Math.round(8*awardLeagueTier(club)):0;
 // European final results are unique to the shared football world.
 const ucl=sharedUniverse?.europeFinals?.[year+":欧冠"]?.winner===club;
 const uel=sharedUniverse?.europeFinals?.[year+":欧联"]?.winner===club;
 // Domestic cups are not yet fully simulated for NPC-only clubs. When a cup
 // title was actually recorded, credit the same club bonus to all its players.
 const cup=!!duoGames&&DUO_IDS.some(id=>{
  const career=duoGames[id];
  return career.year===year&&career.player.club===club&&career.honors.some(h=>h.year===year&&h.type==="team"&&
   /杯冠军$/.test(h.name)&&h.name!=="欧冠冠军"&&h.name!=="欧联冠军");
 });
 return Math.min(32,leagueValue+(ucl?22:0)+(uel?12:0)+(cup?3:0));
}
function awardCandidateScore(x,year,teamBonus=0,random=()=>R(-8,8)){
 const quality=awardLeagueTier(x.club);
 const goals=Math.max(0,x.goals||0),assists=Math.max(0,x.assists||0),apps=Math.min(Math.max(0,x.apps||0),60);
 // Elite attacking output still matters beyond 24 goals and 15 assists.
 const attack=(Math.min(goals,35)*1.34+Math.max(0,goals-35)*.78+
  Math.min(assists,25)*.95+Math.max(0,assists-25)*.56)*quality;
 const rating=C(x.rating??6.5,5,10);
 return (x.ov||76)*.58+attack+(rating-6.5)*15+apps*.12+
  C(teamBonus,0,32)+quality*14+random();
}
// A retired player remains eligible for the season they actually played.
// Retired players' old season totals are retained while the other career
// continues, so require a real played result in the retirement year.
function awardSeasonParticipant(x,year){
 const p=x.player;
 return !p.youth&&(!p.retired||(p.retiredAt?.year===year&&(x.season.results||[]).some(m=>m.played&&m.kind!=="national")));
}
function hasCompletedCurrentSeason(x){
 return x.season.stage==="review"||x.retirementSummary?.completedSeasonYear===x.year||
  (x.history||[]).some(h=>h.year===x.year&&!h.manager&&(!h.generation||h.generation===x.generation));
}
// Manual and legacy-save retirements may be the last state transition needed
// for a shared year to end. Never advance past a failed award settlement.
function finalizeRetiredSeasonIfReady(){
 if(!duoGames||!DUO_IDS.some(id=>duoGames[id].player.retired)||!DUO_IDS.every(id=>duoGames[id].player.retired||duoGames[id].season.stage==="review"))return true;
 if(!DUO_IDS.some(id=>hasCompletedCurrentSeason(duoGames[id])))return true;
 const previousActive=activeDuo,previousGame=g;
 try{finalizeSharedSeason();return true}catch(e){activeDuo=previousActive;g=previousGame;notify("赛季奖项暂时无法结算，请先导出存档并检查赛季数据");return false}
}

/* v8: one winner per league/year for newly completed seasons.
   Existing historic honours are deliberately preserved unchanged. */
function settleLeagueYouthAwards(year){
 if(!duoGames||!sharedUniverse)return;
 const ledger=sharedUniverse.leagueYouthAwards||(sharedUniverse.leagueYouthAwards={});
 const leagues=new Set(DUO_IDS.filter(id=>!duoGames[id].player.youth&&duoGames[id].player.leagueId).map(id=>duoGames[id].player.leagueId));
 for(const leagueId of leagues){
  const key=year+":"+leagueId;
  if(Object.hasOwn(ledger,key))continue;
  const league=DB[leagueId];if(!league)continue;
  const candidates=[];
  for(const n of duoGames.wang.npcs||[]){
   if(n.age>21||n.age<16||!league.teams.some(t=>t.name===n.club)||Number(n.apps||0)<12||Number(n.rating||0)<7.2)continue;
   candidates.push({id:n.id,name:n.name,score:n.rating*10+(n.goals||0)*1.1+(n.assists||0)*.8+(n.apps||0)*.1});
  }
  for(const id of DUO_IDS){
   const x=duoGames[id],p=x.player,a=x.season.leagueRatings||[];
   if(p.youth||p.retired||p.leagueId!==leagueId||p.age>21||p.age<16||x.season.leagueApps<12||!a.length)continue;
   const avg=a.reduce((z,v)=>z+v,0)/a.length;
   if(avg<7.2)continue;
   candidates.push({id:"DUO_"+id,name:p.name,score:avg*10+(x.season.leagueGoals||0)*1.1+(x.season.leagueAssists||0)*.8+x.season.leagueApps*.1});
  }
  candidates.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const winner=candidates[0];
  ledger[key]={year,leagueId,winnerId:winner?.id||null,winner:winner?.name||null,score:winner?Number(winner.score.toFixed(2)):null};
  if(!winner?.id.startsWith("DUO_"))continue;
  const id=winner.id.slice(4),before=g,beforeId=activeDuo;
  activeDuo=id;g=duoGames[id];award(league.name+"最佳年轻球员","individual");g=before;activeDuo=beforeId;
 }
}

function finalizeSharedSeason(){
 if(!duoGames||!DUO_IDS.every(id=>duoGames[id].season.stage==="review"||duoGames[id].player.retired))return;
 if(DUO_IDS.every(id=>duoGames[id].player.retired)&&!DUO_IDS.some(id=>hasCompletedCurrentSeason(duoGames[id])))return;
 const year=duoGames.wang.year;
 if(duoGames.vini.year!==year||sharedUniverse.awards[year])return;
 settleSharedUefaWinners(year);
 if(reconcileEuropeanHonors())save();
 const original=activeDuo,originalGame=g;
 // Later generations remain eligible for annual awards after original real-person seeds retire.
 // Keep 100 jurors × 67 points = 6700 even in 2048+ seasons.
 const roster=duoGames.wang.npcs.filter(n=>Number.isFinite(n.ov)&&(n.apps||0)+(n.europeApps||0)>0&&!DUO_IDS.some(id=>n.name===duoGames[id].player.name));
 const nominees=roster.map(n=>{const goals=(n.goals||0)+(n.europeGoals||0),assists=(n.assists||0)+(n.europeAssists||0),apps=(n.apps||0)+(n.europeApps||0);
 return {id:n.id,name:n.name,club:n.club,goals,assists,apps,ov:n.ov,rating:n.rating??6.3,teamBonus:awardTeamHonours(n.club,year),score:awardCandidateScore({club:n.club,goals,assists,apps,ov:n.ov,rating:n.rating??6.3},year,awardTeamHonours(n.club,year))}});
 for(const id of DUO_IDS){const x=duoGames[id],p=x.player,s=x.season,r=s.ratings,avg=r.length?r.reduce((a,b)=>a+b,0)/r.length:6.2,honors=x.honors.filter(h=>h.year===year).length;
 if(!awardSeasonParticipant(x,year))continue;
 nominees.push({id:"DUO_"+id,name:p.name,club:p.club,goals:s.goals,assists:s.assists,apps:s.apps,ov:overall(p),
 rating:avg,teamBonus:awardTeamHonours(p.club,year),
 score:awardCandidateScore({club:p.club,goals:s.goals,assists:s.assists,apps:s.apps,ov:overall(p),rating:avg},year,awardTeamHonours(p.club,year))})}
 nominees.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
 if(nominees.length<10)throw Error("当季活跃球员不足10人：无法进行合法金球奖投票");
 const list=nominees.slice(0,30),points=Object.fromEntries(list.map(x=>[x.id,0])),votes=Object.fromEntries(list.map(x=>[x.id,Array(10).fill(0)])),ballots=[];
 for(let juror=0;juror<100;juror++){const pick=list.map(x=>({id:x.id,score:x.score+R(-19,19)+.16*x.goals*Math.sin(juror*1.41)})).sort((a,b)=>b.score-a.score).slice(0,10);
 pick.forEach((x,i)=>{points[x.id]+=UCL_PTS[i];votes[x.id][i]++});ballots.push(pick.map(x=>x.id))}
 const ranked=list.map(x=>({id:x.id,name:x.name,club:x.club,goals:x.goals,assists:x.assists,apps:x.apps,averageRating:Number((x.rating??6.5).toFixed(2)),teamBonus:x.teamBonus,points:points[x.id],firstPlaceVotes:votes[x.id][0],voteRanks:votes[x.id]})).sort((a,b)=>b.points-a.points||b.firstPlaceVotes-a.firstPlaceVotes||a.name.localeCompare(b.name));
 if(ranked.reduce((a,b)=>a+b.points,0)!==6700)throw Error("双人统一金球奖计票错误");
 const awardData={year,model:7,rankings:ranked,ballots,winner:ranked[0],totalPoints:6700};sharedUniverse.awards[year]=awardData;
 const leagues=new Set(DUO_IDS.filter(id=>awardSeasonParticipant(duoGames[id],year)).map(id=>duoGames[id].player.leagueId));
 for(const id of leagues){
 const entries=duoGames.wang.npcs.filter(n=>DB[id].teams.some(t=>t.name===n.club)&&n.pos!=="GK").map(n=>({id:n.id,goals:n.goals||0,assists:n.assists||0,apps:n.apps||0}));
 for(const who of DUO_IDS){const x=duoGames[who];if(awardSeasonParticipant(x,year)&&x.player.leagueId===id&&x.season.leagueApps>=12)entries.push({id:who,goals:x.season.leagueGoals||0,assists:x.season.leagueAssists||0,apps:x.season.leagueApps})}
 const goals=entries.slice().sort((a,b)=>b.goals-a.goals||b.assists-a.assists||a.apps-b.apps),assists=entries.slice().sort((a,b)=>b.assists-a.assists||b.goals-a.goals||a.apps-b.apps);
 for(const who of DUO_IDS){const x=duoGames[who];if(!awardSeasonParticipant(x,year)||x.player.leagueId!==id)continue;
 activeDuo=who;g=x;
 if(goals[0]?.id===who&&goals[0].goals>=9)award(DB[id].name+"金靴奖","individual");
 if(assists[0]?.id===who&&assists[0].assists>=7)award(DB[id].name+"助攻王","individual");
 }}
 settleLeagueYouthAwards(year);
 for(const id of DUO_IDS){const x=duoGames[id],key="DUO_"+id,place=ranked.findIndex(r=>r.id===key),personal={...awardData,rank:place>=0?place+1:null,playerNominated:place>=0,playerPoints:place>=0?points[key]:0};
 x.ballonHistory.push(personal);x.awardViewIndex=x.ballonHistory.length-1;
 if(place===0){activeDuo=id;g=x;award("金球奖（法国足球规则）","individual")}
 if(x.player.retired&&x.retirementSummary?.at?.year===year)x.retirementSummary.honors=x.honors.map(h=>({...h}));
 }
 activeDuo=original;g=originalGame;
}
// Club reputation tiers are based on specific teams, not just their domestic league.
const LEGENDARY_CLUBS=new Set(["皇家马德里","巴塞罗那","巴黎圣日耳曼","曼城","曼联","利物浦","拜仁慕尼黑","阿森纳","尤文图斯","AC米兰"]);
const FIVE_ELITE_CLUBS=new Set(["阿森纳","切尔西","热刺","马德里竞技","国际米兰","AC米兰","尤文图斯","那不勒斯","多特蒙德","勒沃库森","罗马","马赛","里昂"]);
const NON_FIVE_ELITE_CLUBS=new Set(["本菲卡","波尔图","葡萄牙体育","阿贾克斯","埃因霍温","费耶诺德","布拉加","阿尔克马尔","特温特","乌德勒支","加拉塔萨雷","费内巴切","贝西克塔斯","特拉布宗体育","布鲁日","安德莱赫特","圣吉罗斯联合","亨克","根特","凯尔特人","格拉斯哥流浪者","哈茨","萨尔茨堡红牛","格拉茨风暴","维也纳快速","巴塞尔","年轻人","苏黎世","哥本哈根","中日德兰","布隆德比"]);
const TRANSFER_LEVELS=["中超","欧洲非五大联赛普通球队","欧洲非五大联赛豪门","五大联赛普通球队","五大联赛豪门","世界传奇豪门"];
// Tier-aware and position-adjusted criteria: match ratings use calibrated values
// and target output scales across competition levels. One tier per season maximum.
const TRANSFER_GOALS={
 europe:{g:4,a:4,sum:7,apps:14,avg:6.70,ov:0},
 nonFiveElite:{g:5,a:4,sum:9,apps:17,avg:6.83,ov:74},
 five:{g:6,a:5,sum:11,apps:19,avg:6.94,ov:78},
 fiveElite:{g:7,a:6,sum:13,apps:20,avg:7.05,ov:83},
 legendary:{g:8,a:7,sum:15,apps:22,avg:7.16,ov:87}
};
const TRANSFER_GATES=[TRANSFER_GOALS.europe,TRANSFER_GOALS.nonFiveElite,TRANSFER_GOALS.five,TRANSFER_GOALS.fiveElite,TRANSFER_GOALS.legendary];
function transferLevel(id,club){
 if(LEGENDARY_CLUBS.has(club))return 5;
 if(id==="CHN")return 0;
 if(["NED","POR","TUR","BEL","SCO","AUT","SUI","DEN"].includes(id))return NON_FIVE_ELITE_CLUBS.has(club)?2:1;
 if(FIVE_LEAGUES.includes(id))return FIVE_ELITE_CLUBS.has(club)?4:3;
 // South American clubs are never mislabeled as "European non-top-five".
 return 0;
}
function clubSeasonNumbers(s,club=null){
 const played=(s.results||[]).filter(x=>x.played&&x.kind!=="national");
 const n={apps:played.length,goals:0,assists:0,avg:0,cleanSheets:0,matchesWithScore:0},ratings=[];
 for(const match of played){
  n.goals+=match.goals||0;n.assists+=match.assists||0;if(match.rating>0)ratings.push(match.rating);
  const against=club&&match.home===club?match.as:club&&match.away===club?match.hs:null;
  if(Number.isFinite(against)&&against>=0){n.matchesWithScore++;if(against===0)n.cleanSheets++}
 }
 n.avg=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:0;return n;
}
function transferQualified(t,n,ov,position="LW"){
 // Midfielders and defenders can qualify through strong ratings and their
 // club's real simulated clean sheets, with no fabricated tackles or saves.
 const nonOffense=["CM","CDM","CB","LB","RB","GK"].includes(position);
 if(nonOffense){
  const known=n.matchesWithScore||0,clean=n.cleanSheets||0;
  const fraction=position==="CM"?.20:.28;
  return n.apps>=t.apps&&n.avg>=t.avg+.22&&ov>=t.ov&&known>=Math.ceil(n.apps*.7)&&clean>=Math.max(4,Math.ceil(known*fraction));
 }
 const creator=["CAM","CM","CDM"].includes(position);
 const goalsTarget=creator?Math.max(2,t.g-3):t.g;
 const assistsTarget=creator?t.a: t.a;
 const combinedTarget=creator?Math.max(5,t.sum-2):t.sum;
 return n.apps>=t.apps&&n.avg>=t.avg&&ov>=t.ov&&(
  n.goals>=goalsTarget||n.assists>=assistsTarget||
  n.goals+n.assists>=combinedTarget
 );
}
function seasonPerformance(){
 const p=g.player,n=clubSeasonNumbers(g.season,p.club),tier=transferLevel(p.leagueId,p.club),ov=overall(p);
 const offense=["ST","LW","RW","CAM"].includes(p.position),exempt=p.youth||!offense||n.apps<15;
 const expectedOutput=n.goals+n.assists;
 const roleFactor=p.position==="ST"?1.12:p.position==="CAM"?.88:1;
 const expectedByTier=[12,14,17,19,22,25][tier]*roleFactor;
 const performanceRatio=expectedOutput/Math.max(1,expectedByTier);
 const poor=!exempt&&(n.apps<23||n.avg<6.38||performanceRatio<.67&&n.avg<7.12||performanceRatio<.40);
 // Scoring 15+ goals can never be branded a bad season merely because a
 // formerly harsh, low-centred match-rating formula gave below 7.15.

 p.poorStreak=poor?(p.poorStreak||0)+1:0;
 // Only club team trophies count. Individual awards / national-team trophies do not.
 const teamChampion=(g.honors||[]).some(h=>h.year===g.year&&h.generation===g.generation&&h.type==="team"&&h.name.includes("冠军"));
 p.trophylessStreak=p.youth?0:teamChampion?0:(p.trophylessStreak||0)+1;
 // Poor performance takes precedence over an honour-driven lateral transfer.
 p.forcedMove=!p.youth&&p.poorStreak>=2&&tier>0;
 p.sameTierReminder=!p.youth&&p.trophylessStreak>=2;
 p.forcedSameTier=false;
 const gate=TRANSFER_GATES[tier]||null;
 const ratingStandard=[6.98,7.00,7.04,7.10,7.18][tier]??7.2;
 const performanceStandard=[16,18,20,23,25][tier]??25;
 const roleAdjustedOutput=expectedOutput/(p.position==="CAM"?.90:p.position==="ST"?1.12:1);
 const scoutingChance=[.69,.62,.58,.50,.44][tier]??0;
 const qualified=!!gate&&transferQualified(gate,n,ov,p.position)&&n.avg>=ratingStandard&&(!offense||roleAdjustedOutput>=performanceStandard)&&(p.scoutingRoll??(p.scoutingRoll=Math.random()))<scoutingChance;
 const eligible=!p.youth&&n.apps>=15;
 const maxTier=eligible&&!poor&&qualified?Math.min(tier+1,TRANSFER_LEVELS.length-1):tier;
 const comment=p.youth?"青训阶段：16—17岁参加青年联赛，18岁自动进入本俱乐部一线队；青年数据不计入成年赛季。":p.forcedSameTier?"连续两个赛季没有获得俱乐部冠军，必须申请同档转会":n.apps<15?"出场不足，不按进球助攻处罚":!offense?(maxTier>tier?"已解锁"+TRANSFER_LEVELS[maxTier]+"升级报价":"根据评分、出场和球队零封考核，不按进球助攻处罚"):
  p.forcedMove?"连续两个赛季未达标，可选择降档或留队":
  tier===0&&poor&&p.poorStreak>=2?"中超已是起步最低档，留队或同级转会，不会假装降档":
  poor?"本赛季低于留队标准，累计不达标"+p.poorStreak+"季":
  tier===TRANSFER_LEVELS.length-1?"已达到最高的世界传奇豪门档次":
  maxTier>tier?"已解锁"+TRANSFER_LEVELS[maxTier]+"升级报价":"尚未达到下一档转会门槛";
 const roleCleanTarget=gate&&!offense?Math.max(4,Math.ceil(n.matchesWithScore*(p.position==="CM"?.20:.28))):null;
 const assessment={...n,avg:Number(n.avg.toFixed(2)),goalsTarget:offense?gate?.g??null:null,assistsTarget:offense?gate?.a??null:null,roleCleanTarget,
  tier,maxTier,poor,exempt,offense,expectedByTier:Number(expectedByTier.toFixed(1)),performanceRatio:Number(performanceRatio.toFixed(2)),scoutingChance,poorStreak:p.poorStreak,forcedMove:p.forcedMove,forcedSameTier:p.forcedSameTier,trophylessStreak:p.trophylessStreak,teamChampion,qualified,comment};
 p.transferAssessment={...assessment,year:g.year};
 if(eligible&&!poor&&maxTier>tier)p.points=Math.min(15,(p.points||0)+2);
 return assessment;
}
function generateOffers(){
 const p=g.player,ov=overall(p),current=transferLevel(p.leagueId,p.club),a=p.transferAssessment||g.lastReview?.performance||{};
 const limit=p.forcedMove?current-1:p.forcedSameTier?current:(Number.isInteger(a.maxTier)?Math.min(a.maxTier,current+1):current);
 const all=Object.entries(DB).filter(([id])=>id!=="BRA").flatMap(([id,l])=>l.teams.map(t=>({id,club:t.name,power:power(t.name),tier:transferLevel(id,t.name)})));
 let pool=all.filter(o=>{
  if(o.club===p.club)return false;
  if(p.forcedMove)return o.tier===current-1;
  if(p.forcedSameTier)return o.tier===current;
  if(o.tier>limit)return false;
  if(a.poor&&o.tier>=current&&o.power>=power(p.club))return false;
  if(o.tier>current&&o.power>ov+23)return false;
  return true;
 });
 if(p.forcedMove&&pool.length===0)pool=all.filter(o=>o.club!==p.club&&o.tier===current-1);
 const shuffle=v=>v.slice().sort(()=>Math.random()-.5),out=[];
 const add=o=>{if(o&&!out.some(x=>x.club===o.club))out.push(o)};
 if(p.forcedMove)add(shuffle(pool.filter(o=>o.tier===current-1))[0]);
 else if(p.forcedSameTier)add(shuffle(pool.filter(o=>o.tier===current))[0]);
 else if(limit>current)for(const o of shuffle(pool.filter(o=>o.tier===current+1)).slice(0,6))add(o);
 for(const o of shuffle(pool))if(out.length<8)add(o);
 // Up/down moves use blind cards. Reserve a few genuine same-tier offers so
 // the player can actually choose a lateral transfer after a finished season.
 if(!p.forcedMove){
  const lateral=shuffle(pool.filter(o=>o.tier===current));
  for(const o of lateral){
   if(out.filter(x=>x.tier===current).length>=Math.min(3,lateral.length))break;
   if(out.some(x=>x.club===o.club))continue;
   if(out.length>=8){const at=out.findLastIndex(x=>x.tier!==current);if(at<0)break;out.splice(at,1)}
   add(o);
  }
 }
 return out.map(o=>({...o,move:o.tier>current?"升级":o.tier<current?"降档":"同级转会",
  wage:Math.round((o.power*480+ov*270+p.fame*140)*(.85+Math.random()*.5)/1000)*1000,years:R(2,5)}));
}
// Player-controlled next-tier draw. A selected destination is persisted at once,
// and the shared calendar must wait for both eligible players to finish their draws.
// 10 distinct hidden cards: nine next-tier clubs plus one lucky two-tier jump.
function promotionOptions(x){
 if(!x||x.player.retired||x.player.age>=39||x.player.sameTierMoveYear===x.year||x.season.stage!=="review")return [];
 const p=x.player,current=transferLevel(p.leagueId,p.club),target=current+(p.forcedMove?-1:1);
 if(!p.forcedMove&&(p.transferAssessment?.maxTier??current)<=current)return [];
 if(target<0||target>=TRANSFER_LEVELS.length)return [];
 const all=Object.entries(DB).filter(([id])=>id!=="BRA").flatMap(([id,l])=>l.teams.map(t=>({id,club:t.name,power:power(t.name),tier:transferLevel(id,t.name)})));
 return all.filter(o=>o.club!==p.club&&(o.tier===target||(!p.forcedMove&&target+1<TRANSFER_LEVELS.length&&o.tier===target+1)));
}
function shuffleDraw(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
function tenCardOptions(options,level,down=false){
 const normal=shuffleDraw(options.filter(o=>o.tier===level)),lucky=down||level+1>=TRANSFER_LEVELS.length?[]:shuffleDraw(options.filter(o=>o.tier===level+1));
 const count=lucky.length?9:10;
 if(normal.length<count)throw Error("该档球队不足10张卡："+TRANSFER_LEVELS[level]+"只有"+normal.length+"队");
 return shuffleDraw([...normal.slice(0,count),...lucky.slice(0,1)]);
}
function ensurePromotionDraw(x){
 const p=x.player,old=p.transferDraw;
 if(p.retired||p.age>=39)return null;
 if(old&&(old.selected||old.declined)&&old.year===x.year&&old.from===p.club)return old;
 const eligible=promotionOptions(x);
 if(!eligible.length){delete p.transferDraw;return null}
 const level=transferLevel(p.leagueId,p.club)+(p.forcedMove?-1:1);
 if(!old||old.year!==x.year||old.from!==p.club||old.level!==level||old.options?.length!==10||old.layoutVersion!==1){
  p.transferDraw={year:x.year,from:p.club,level,direction:p.forcedMove?"down":"up",options:tenCardOptions(eligible,level,!!p.forcedMove),selectedIndex:null,selected:null,layoutVersion:1};
 }
 return p.transferDraw;
}
function missingPromotionDraws(){
 if(!duoGames)return [];
 return DUO_IDS.filter(id=>{const d=ensurePromotionDraw(duoGames[id]);return d&&!d.accepted&&!d.declined});
}
function decidePromotion(id,accept){
 if(!duoGames||!DUO_IDS.includes(id))return;
 const x=duoGames[id],d=ensurePromotionDraw(x);
 if(!d||d.accepted||d.declined||accept&&!d.selected)return;
 const beforeAccepted=d.accepted,beforeDeclined=d.declined;
 if(accept)d.accepted=true;
 else d.declined=true;
 if(!save()){d.accepted=beforeAccepted;d.declined=beforeDeclined;notify("无法保存转会决定，请先导出存档并清理浏览器空间。");return}
 render();
}
function flipPromotionCard(id,index){
 if(!duoGames||!DUO_IDS.includes(id))return;
 const x=duoGames[id],d=ensurePromotionDraw(x);
 if(!d||d.selected||!Number.isInteger(index)||index<0||index>=d.options.length)return;
 const o=d.options[index],previousSelected=d.selected,previousIndex=d.selectedIndex;
 d.selected={...o};d.selectedIndex=index;
 if(!save()){d.selected=previousSelected;d.selectedIndex=previousIndex;notify("无法保存抽卡结果，请先导出存档并清理浏览器空间。");return}
 const el=document.querySelector('[data-action="flipPromotionCard"][data-id="'+id+'"][data-i="'+index+'"]');
 if(el){el.classList.add("revealed");el.setAttribute("aria-label","已抽中"+o.club)}
 notify(x.player.name+" 抽中 "+o.club+(o.tier===d.level+1?" · 幸运跳级！":""));
 setTimeout(()=>{page="transfer";render()},850);
}
function promotionDrawCard(id){
 const x=duoGames[id],d=ensurePromotionDraw(x);if(!d)return "";
 const high=d.direction!=="down"&&d.level+1<TRANSFER_LEVELS.length?TRANSFER_LEVELS[d.level+1]:null;
 const desc=high?"9张"+TRANSFER_LEVELS[d.level]+" + 1张"+high+"幸运跳级":"10张"+TRANSFER_LEVELS[d.level];
 return '<section class="item promotion-draw"><div class="row"><h3>'+E(x.player.name)+' · 十张球队盲抽卡</h3><span class="chip">'+E(TRANSFER_LEVELS[d.level])+'</span></div>'+
 '<p class="muted small">'+E(desc)+'。十张卡位置随机，你亲自翻开一张；结果即时保存且不可重新抽。'+(high?"跳级机会10%。":"")+'</p>'+
 '<div class="draw-card-grid">'+d.options.map((o,i)=>{
 const open=!!d.selected&&d.selectedIndex===i;
 return '<button type="button" class="draw-card '+(open?"revealed":"")+'" data-action="flipPromotionCard" data-id="'+id+'" data-i="'+i+'" '+(d.selected?"disabled":"")+' aria-label="'+(open?E("已选中"+o.club):"第"+(i+1)+"张未翻开卡牌")+'"><span class="draw-card-inner"><span class="draw-card-back"><b>★</b><small>FOOTBALL<br>DYNASTY</small><em>'+String(i+1).padStart(2,"0")+'</em></span><span class="draw-card-front">'+clubShield(o.club)+'<strong>'+E(o.club)+'</strong><small>'+E(DB[o.id].name)+'</small><em>'+(o.tier===d.level+1?"幸运跳级":"已抽中")+'</em></span></span></button>';
 }).join("")+'</div>'+
 (d.selected?'<div class="signing-result gap"><span class="cap">TRANSFER REVEAL</span><h3>正式报价 · '+E(d.selected.club)+'</h3><p>'+E(DB[d.selected.id].name)+(d.selected.tier===d.level+1?" · 幸运跳级！":"")+'</p><p class="muted small">球队游戏实力：'+power(x.player.club)+' → '+power(d.selected.club)+' · 六档级别：'+E(TRANSFER_LEVELS[d.selected.tier])+'</p><p class="muted small">实力仅用于游戏模拟，不代表现实排名。去留仍由你决定。</p></div>':'<p class="muted small gap">点击一张卡牌翻开，其余卡牌继续隐藏。</p>')+
 (d.accepted?'<p class="gold">已接受该球队，下一赛季生效。</p>':d.declined?'<p class="muted">已决定留队，本赛季不会转会。</p>':
 '<div class="flex gap">'+(d.selected?'<button class="button primary" data-action="acceptDraw" data-id="'+id+'">接受 '+E(d.selected.club)+'</button>':'')+
 '<button class="button outline" data-action="declineDraw" data-id="'+id+'">留在当前俱乐部</button></div>')+'</section>';
}
function renderHonorsSummary(){
 return '<div class="grid2 gap">'+DUO_IDS.map(id=>{
  const x=duoGames[id],h=x.honors||[],gold=(x.ballonHistory||[]).filter(v=>v.rank===1),team=h.filter(v=>v.type==="team"),national=h.filter(v=>v.type==="national");
  const league=team.filter(v=>Object.values(DB).some(l=>v.name===l.name+"冠军")).length;
  const euro=team.filter(v=>/欧冠冠军|欧联冠军/.test(v.name)).length;
  const cup=team.filter(v=>v.name.includes("冠军")&&!Object.values(DB).some(l=>v.name===l.name+"冠军")&&!/欧冠冠军|欧联冠军/.test(v.name)).length;
  const individual=h.filter(v=>v.type==="individual"&&!v.name.includes("金球奖")).length;
  const counts=[["联赛冠军",league],["国内杯赛冠军",cup],["欧战冠军",euro],["国家队冠军",national.filter(v=>v.name.includes("冠军")).length],["金球奖",gold.length],["其他个人荣誉",individual]];
  const timeline=h.slice().sort((a,b)=>b.year-a.year).map(v=>'<div class="item row"><span><span class="cap">'+(v.year+ (v.type==="national"?"":""))+'</span> · '+E(v.name)+'</span><span class="chip">'+(v.type==="team"?"俱乐部":v.type==="national"?"国家队":"个人")+'</span></div>');
  const rankHistory=(x.ballonHistory||[]).slice().reverse().map(v=>'<div class="item row"><span>'+E(String((v.year||0)))+'年金球奖</span><strong class="'+(v.rank===1?"gold":"")+'">'+(v.rank?"第"+v.rank+"名":"未入围")+(v.rank===1?" · 获奖":"")+'</strong></div>');
  return '<section class="card"><div class="row"><h2>'+E(x.player.name)+' · 荣誉殿堂</h2><span class="chip">累计'+h.length+'项官方模拟荣誉</span></div>'+
   '<div class="grid3">'+counts.map(([name,n])=>metric(name,n)).join("")+'</div>'+
   '<h3 class="gap">历年冠军与个人荣誉</h3><div class="list">'+(timeline.join("")||'<p class="muted">暂无冠军和个人奖项。</p>')+'</div>'+
   '<h3 class="gap">金球奖逐年排名</h3><div class="list">'+(rankHistory.join("")||'<p class="muted">赛季结算后显示金球奖排名。</p>')+'</div></section>';
 }).join("")+'</div>';
}
function duoHonorsPage(){
 const years=Object.values(sharedUniverse?.awards||{}).sort((a,b)=>b.year-a.year);
 return '<section class="hero hero-awards"><div><div class="cap">TROPHY CABINET · ONE SHARED WORLD</div><h1>双星荣誉陈列室</h1><p>联赛、杯赛、欧战、国家队冠军和金球奖集中记录，按赛季回顾两人的全部荣誉。</p></div></section>'+
 renderHonorsSummary()+
 (sharedUniverse?.europeTitleCorrections?.length?'<section class="card gap"><h3>旧档欧战冠军冲突（原记录保留）</h3><p class="muted">旧档同届欧战曾分别模拟出不同冠军。原奖杯和历史不删除；缺少统一赛果时不推测冠军，相关记录均标记争议。</p><div class="list">'+sharedUniverse.europeTitleCorrections.slice(-8).reverse().map(c=>'<div class="item">'+(c.year+1)+'年 '+E(c.competition)+' · '+E(c.conflictingClubs.join(" / "))+' · '+(c.winner?'经统一赛事核实：'+E(c.winner):'真实冠军未核实')+'</div>').join("")+'</div></section>':'')+
 '<section class="card gap"><h2>历届世界金球奖得主</h2><div class="list">'+(years.length?years.map(v=>'<div class="item row"><span>'+E(String(v.year+1))+'年 · '+E(v.winner.name)+' · '+E(v.winner.club)+'</span><strong class="gold">'+v.winner.points+'分</strong></div>').join(""):'<p class="muted">首次赛季结束后开始记录。</p>')+'</div><button class="button gap" data-page="awards">查看历届金球奖完整30人榜</button></section>';
}
function endSeason(){
 if(g.mode==="coach")return endCoachSeason();const s=g.season;if(s.stage==="review")return;
 advanceWorld(true);
 const p=g.player,league=DB[p.leagueId],rank=sortedTable(s.leagueTable).findIndex(t=>t.name===p.club)+1;
 const rivals=g.npcs.filter(n=>league.teams.some(c=>c.name===n.club));
 const goalKing=rivals.slice().sort((a,b)=>b.goals-a.goals)[0],assistKing=rivals.slice().sort((a,b)=>b.assists-a.assists)[0];
 const keeperKing=rivals.filter(n=>n.pos==="GK").sort((a,b)=>(b.clean||0)-(a.clean||0))[0];
 const avg=s.ratings.length?s.ratings.reduce((a,b)=>a+b,0)/s.ratings.length:0;
 const leagueAvg=s.leagueRatings?.length?s.leagueRatings.reduce((a,b)=>a+b,0)/s.leagueRatings.length:0;
 if(rank===1){if(p.youth){p.academyHonors=p.academyHonors||[];p.academyHonors.push({year:g.year,name:league.name+"青训联赛冠军"});log("青年赛事冠军："+league.name+"青训联赛");}else award(league.name+"冠军","team")}
 if(!p.youth&&s.leagueApps>=12){
  if(!duoGames&&p.position!=="GK"&&(s.leagueGoals||0)>=Math.max(9,goalKing?.goals||0))award(league.name+"金靴奖","individual");
  if(!duoGames&&(s.leagueAssists||0)>=Math.max(7,assistKing?.assists||0))award(league.name+"助攻王","individual");
  if(p.position==="GK"&&(s.leagueClean||0)>=Math.max(8,keeperKing?.clean||0))award(league.name+"金手套奖","individual");
  if(!duoGames&&leagueAvg>=7.8)award(league.name+"赛季最佳球员","individual");
  if(!duoGames&&p.age<=21&&leagueAvg>=7.2)award(league.name+"最佳年轻球员","individual");
 }
 if(s.uefa&&s.europeApps>=3){
  const euroNPC=g.npcs.filter(n=>s.uefa.table[n.club]);
  const bestGoals=euroNPC.reduce((m,n)=>Math.max(m,n.europeGoals||0),0);
  const bestAssists=euroNPC.reduce((m,n)=>Math.max(m,n.europeAssists||0),0);
  if((s.europeGoals||0)>=Math.max(5,bestGoals))award(s.uefa.type+"最佳射手","individual");
  if((s.europeAssists||0)>=Math.max(4,bestAssists))award(s.uefa.type+"助攻王","individual");
 }
 if(!p.youth&&avg>=8.1&&s.apps>=24)award("世界年度最佳阵容","individual");
 if(s.uefa&&!s.uefa.completed){s.uefa.completed=true;s.uefa.stage="season-end";log("赛季结束，未完成的欧战结算为终止。")}
 if(!duoGames&&!p.youth)finishVote();
 const champions={};for(const [id,w]of Object.entries(s.world||{}))champions[id]=sortedTable(w.table)[0]?.name;
 for(const [key,data]of Object.entries(sharedUniverse?.rounds||{})){const [year,league,level]=key.split(":");if(Number(year)===g.year&&level!=="ACADEMY")champions[league]=sortedTable(data.table)[0]?.name}
 // Youth competitions never establish a senior league champion.
 if(!p.youth)champions[p.leagueId]=sortedTable(s.leagueTable)[0]?.name;
 g.worldHistory=g.worldHistory||[];g.worldHistory.push({year:g.year,champions});g.worldHistory=g.worldHistory.slice(-50);
 const performance=seasonPerformance();
 if(CD&&!p.retired){
  const level=p.youth?0:transferLevel(p.leagueId,p.club);
  const goals=CD.settleObjectives(p,g.year,level,s);
  CD.recordMarketValue(p,g.year,overall(p),level,s);
  if(goals)log("赛季目标："+goals.completed+"/"+goals.total+"完成。");
 }
  g.history.push({year:g.year,generation:g.generation,club:p.club,league:league.name,age:p.age,rank,apps:s.apps,goals:s.goals,assists:s.assists,leagueGoals:s.leagueGoals||0,leagueAssists:s.leagueAssists||0,average:avg.toFixed(2),points:sortedTable(s.leagueTable).find(t=>t.name===p.club)?.points||0,europa:s.uefa?.type||null});
 g.lastReview={rank,avg:avg.toFixed(2),goals:s.goals,assists:s.assists,performance,leagueGoalLeader:goalKing?{name:goalKing.name,goals:goalKing.goals}:null};
 g.offers=p.youth?[]:generateOffers();
 s.stage="review";ensurePromotionDraw(g);page="review";log("完成 "+g.year+"/"+(g.year+1)+" 赛季，联赛第"+rank+"名。"+(performance.poor?"进球助攻未达标，连续"+performance.poorStreak+"季；"+(performance.forcedMove?"可选择降档或留队。":"将影响球队信任。"):"表现考核："+performance.comment));save();render()
}

function applyPlayerTransfer(o,automatic=false,deferDisplay=false){
 if(!o||!g||g.season.stage!=="review")return false;
 const p=g.player,current=transferLevel(p.leagueId,p.club),dest=transferLevel(o.id,o.club);
 if(p.youth&&!o.promotion)return notify("青训未晋升"),false;
 if(!p.youth&&o.club.endsWith("青训"))return notify("已进入一线队，不能退回青训"),false;
 if(p.forcedMove&&!(dest<current))return notify("未达标，必须接受降档报价"),false;
 
 if(!p.forcedMove&&dest>current&&dest>(p.transferAssessment?.maxTier??current)&&!(automatic&&p.transferDraw?.selected?.club===o.club&&p.transferDraw?.selected?.id===o.id&&p.transferDraw?.year===g.year&&dest===current+2&&p.transferAssessment?.maxTier===current+1))return notify("进球助攻和评分未达到升级资格"),false;
 const wasForced=p.forcedMove,old=p.club;p.club=o.club;p.leagueId=o.id;p.youth=false;
 if(p.parentCoach)p.parentCoach.club=o.club;
 p.wage=o.wage;p.contract=o.years;p.morale=85;p.coachTrust=65;p.forcedMove=false;p.forcedSameTier=false;p.poorStreak=0;p.trophylessStreak=0;
 p.transferHistory=p.transferHistory||[];p.transferHistory.push({year:g.year,from:old,to:o.club,reason:automatic?(wasForced?"降档转会":o.move==="同级转会"?"连续无冠·同档转会":"抽签达标升级"):o.move||"转会"});
 g.offers=[];log((automatic?(wasForced?"考核未达标抽签降档":o.move==="同级转会"?"连续无冠自动同档抽签":"赛季达标抽签升级"):"正式转会")+": "+old+" → "+p.club);
 if(!automatic&&!deferDisplay){save();render()}return true;
}
function transfer(i){if(!g?.offers?.[i])return;applyPlayerTransfer(g.offers[i])}
function lateralTransferReason(x){
 if(!x||x.player.retired)return "球员已退役";
 const p=x.player;
 if(p.youth)return "青训阶段不提供一线队转会报价";
 if(p.age>=39)return "年满40岁前的最后一个赛季不提供新转会";
 if(x.season.stage!=="review"||!DUO_IDS.every(id=>duoGames[id].season.stage==="review"||duoGames[id].player.retired))return "请先完成两人的本赛季";
 if(p.forcedMove)return "本赛季需要处理降档盲卡";
 if(p.sameTierMoveYear===x.year)return "本赛季已完成同档转会";
 const d=ensurePromotionDraw(x);
 if(d?.accepted)return "已接受升档盲卡，不能同时选择其他球队";
 if(d&&!d.declined)return "请先完成升档盲卡或选择留队";
 return "";
}
function requestLateralOffers(id){
 if(!duoGames||!DUO_IDS.includes(id))return;
 const x=duoGames[id],reason=lateralTransferReason(x);
 if(reason){notify(reason);return}
 if(x.lateralOffersYear===x.year){notify("本赛季报价已经生成");return}
 const p=x.player,current=transferLevel(p.leagueId,p.club),ov=overall(p),a=p.transferAssessment||{};
 const pool=Object.entries(DB).filter(([league])=>league!=="BRA").flatMap(([league,l])=>l.teams.map(t=>({id:league,club:t.name,power:power(t.name),tier:transferLevel(league,t.name)}))).filter(o=>o.club!==p.club&&o.tier===current&&(!a.poor||o.power<power(p.club)));
 if(!pool.length){notify("目前没有符合条件的同档球队");return}
 const previousOffers=x.offers,previousYear=x.lateralOffersYear;
 x.offers=shuffleDraw(pool).slice(0,6).map(o=>({...o,move:"同级转会",wage:Math.round((o.power*480+ov*270+(p.fame||0)*140)*(.85+Math.random()*.5)/1000)*1000,years:R(2,5)}));
 x.lateralOffersYear=x.year;
 if(!save()){x.offers=previousOffers;x.lateralOffersYear=previousYear;notify("无法保存同档报价，请先导出存档并清理浏览器空间。");return}
 render();
}
function acceptLateralOffer(id,index){
 if(!duoGames||!DUO_IDS.includes(id))return;
 const x=duoGames[id],reason=lateralTransferReason(x),o=x.offers?.[index];
 if(reason){notify(reason);return}
 if(!Number.isInteger(index)||!o||o.club===x.player.club||transferLevel(o.id,o.club)!==transferLevel(x.player.leagueId,x.player.club)||!DB[o.id]?.teams.some(t=>t.name===o.club)){notify("该同档报价已不可用");return}
 const previousPlayer=JSON.parse(JSON.stringify(x.player)),previousOffers=x.offers,previousLogs=(x.logs||[]).slice();
 const previous=g,previousId=activeDuo;activeDuo=id;g=x;
 let moved=false;
 try{moved=applyPlayerTransfer(o,false,true);if(moved){x.player.sameTierMoveYear=x.year;delete x.player.transferDraw}}finally{g=previous;activeDuo=previousId}
 if(moved){
  if(!save()){x.player=previousPlayer;x.offers=previousOffers;x.logs=previousLogs;render();notify("无法保存同档转会，已保留原俱乐部和报价；请先导出存档并清理浏览器空间。");return}
  render();notify(x.player.name+"已同档转会至"+o.club)
 }
}
function lateralOfferPanel(id){
 const x=duoGames[id],reason=lateralTransferReason(x);
 if(reason)return '<p class="muted small">同档转会：'+E(reason)+'。</p>';
 const current=transferLevel(x.player.leagueId,x.player.club),offers=(x.offers||[]).map((o,i)=>({o,i})).filter(({o})=>o.club!==x.player.club&&transferLevel(o.id,o.club)===current&&DB[o.id]?.teams.some(t=>t.name===o.club));
 if(!offers.length)return '<details class="item"><summary>同档转会（可选）</summary><p class="muted small">留队无需操作；也可以获取同档报价。</p><button class="button" data-action="requestLateralOffers" data-id="'+id+'">查看同档报价</button></details>';
 return '<details class="item"><summary>同档转会（可选）</summary><p class="muted small">留队无需操作；选择报价后确认转会，每赛季最多一次。</p><label class="field">同档球队<select data-lateral-offer="'+id+'">'+offers.map(({o,i})=>'<option value="'+i+'">'+E(o.club)+' · '+E(DB[o.id].name)+'</option>').join("")+'</select></label><button class="button" data-action="acceptLateralOffer" data-id="'+id+'">确认同档转会</button></details>';
}
function trainingFocusPanel(id){
 const x=duoGames?.[id];if(!x||x.player.retired)return "";
 const focus=Object.hasOwn(STATS,x.player.trainingFocus)?x.player.trainingFocus:"auto";
 return '<details class="item gap"><summary>成长偏向（默认自动）</summary><p class="muted small">训练和休息会自动安排，选择偏向后优先训练该能力；达到潜力上限或需要休息时自动调整。</p><label class="field">'+E(x.player.name)+'的训练方向<select data-training-focus="'+id+'"><option value="auto" '+(focus==="auto"?"selected":"")+'>自动安排</option>'+Object.entries(STATS).map(([key,label])=>'<option value="'+key+'" '+(focus===key?"selected":"")+'>'+E(label)+'</option>').join("")+'</select></label></details>';
}
function nextSeason(){if(!g||(g.season.stage!=="review"&&!g.player.retired))return;
 if(duoGames&&!syncSeasonChange){if(!DUO_IDS.every(id=>duoGames[id].season.stage==="review"||duoGames[id].player.retired)){notify("同一时间线：请先完成仍在参赛球员的当前赛季");return}if(!finalizeRetiredSeasonIfReady())return;if(missingPromotionDraws().length){page="transfer";save();render();notify("请先为需要升档或降档的球员分别抽取新球队");return}syncSeasonChange=true;const original=activeDuo;for(const id of DUO_IDS){activeDuo=id;g=duoGames[id];nextSeason()}activeDuo=original;g=duoGames[original];syncSeasonChange=false;linkSharedWorld();setupSharedUefaSeason();save();render();return}
if(g.player.retired){g.year++;g.season={...g.season,stage:"retired",events:[],index:0,completed:0,world:null,leagueRounds:[],results:[],uefa:null,national:null};return}
if(g.mode==="coach")return nextCoachSeason();const p=g.player;
 const previousClub=p.club,previousLeague=p.leagueId,previousYear=g.year;
 // A player finishes their age-39 season and retires when turning 40.
 // A loaded legacy player already aged 40+ retires during hydration instead.
 if(duoGames&&p.age>=39){
  g.year++;p.age=Math.max(40,p.age);recordPlayerRetirement(activeDuo,true,previousYear);
  g.season={...g.season,stage:"retired",events:[],index:0,completed:0,world:null,leagueRounds:[],results:[],uefa:null,national:null};
  log(p.name+"年满"+p.age+"岁，正式退役。另一名球员仍可继续职业生涯。");return;
 }
 let movedByDraw=false;
 if(p.forcedMove&&p.transferDraw?.accepted&&p.transferDraw?.selected){
  if(!applyPlayerTransfer(p.transferDraw.selected,true))return;
  movedByDraw=true;
 }
 if(!movedByDraw&&p.transferDraw?.accepted&&p.transferDraw?.selected){
  if(!applyPlayerTransfer(p.transferDraw.selected,true))return;
 }
 if(p.transferDraw?.declined){p.forcedMove=false;p.forcedSameTier=false;p.poorStreak=0;}
 delete p.transferDraw;
 const graduating=p.youth&&p.age+1>=ACADEMY_GRADUATION_AGE;
 if(graduating){
  // After two academy seasons the player reaches the SAME original age-18
  // reference template; subsequent growth remains governed by training.
  const reference=p.academyReferenceStats||DUO_TEMPLATES[g.duoId]?.stats;
  if(reference)for(const [key,value]of Object.entries(reference))
   p.stats[key]=Math.max(p.stats[key]||0,value);
  p.club=p.academyParentClub||p.club.replace(/青训$/,"");p.youth=false;p.wage=Math.max(p.wage,7000);p.contract=4;
  p.poorStreak=0;p.trophylessStreak=0;p.forcedMove=false;p.forcedSameTier=false;
  log("青训毕业：18岁升入 "+p.club+" 一线队。青训进球助攻单独保存在青年履历中。")}
 const rankForNextSeason=previousClubRank(p.leagueId,p.club,previousYear)??
  (p.club===previousClub&&p.leagueId===previousLeague&&p.sameTierMoveYear!==previousYear?(g.lastReview?.rank||10):10);
 g.year++;p.age++;p.contract=Math.max(0,p.contract-1);if(CD&&!p.careerTrait)p.careerTrait=CD.traitFor(p);
 const recovery=offseasonRecovery(p);
 if(recovery.injuryBefore)log("休赛期伤病恢复："+recovery.injuryBefore+"→"+recovery.injuryAfter+"场，严重伤病不会自动清零。");
 if(p.suspension>0)log("新赛季仍需执行剩余"+p.suspension+"场赛事停赛。");p.morale=percent(p.morale+8);if(p.contract===0){p.contract=2;p.wage=Math.round(p.wage*1.08);log("合约到期，续约两年。")}
 if(p.age>=35){
  const old={pace:p.stats.pace,physical:p.stats.physical,dribble:p.stats.dribble},loss=p.age>=37?3:2;
  for(const k of ["pace","physical"])p.stats[k]=Math.min(p.stats[k],Math.max(30,p.stats[k]-loss));
  if(p.age>=37)p.stats.dribble=Math.min(p.stats.dribble,Math.max(30,p.stats.dribble-1));
  p.agingImpact={age:p.age,pace:old.pace-p.stats.pace,physical:old.physical-p.stats.physical,dribble:old.dribble-p.stats.dribble};
  log("年龄影响：速度 -"+p.agingImpact.pace+"，身体 -"+p.agingImpact.physical+(p.agingImpact.dribble?"，盘带 -"+p.agingImpact.dribble:"")+"。");
 }else if(p.age<24){p.points+=R(0,2)}
 p.seasonForm=C(R(-100,100)/100-(p.age>=35?.12:0)-(p.injuryHistory||0)*.008,-1,1);p.scoutingRoll=Math.random();if(p.parentCoach)p.parentCoach.points+=3;if(!sharedUniverse||!sharedUniverse.offseasonYears.includes(g.year)){offseasonClubUpdate();if(sharedUniverse)sharedUniverse.offseasonYears.push(g.year)}g.season=makeSchedule(p,g.year,rankForNextSeason);g.lastMatch=null;g.offers=[];g.live=null;// Age the shared AI roster once per year even when Wang has retired and Vini plays on.
 if(!sharedUniverse||!sharedUniverse.npcOffseasonYears?.includes(g.year)){
  simulateNPCOffseason();
  if(sharedUniverse)(sharedUniverse.npcOffseasonYears||(sharedUniverse.npcOffseasonYears=[])).push(g.year);
 }createWorld(g.season);page="dashboard";log("第"+g.generation+"代 · "+g.year+"/"+(g.year+1)+" 赛季开始。");save();render()}
function retire(withCoach){const p=g.player;if(p.age<32){notify("球员至少32岁才能主动退役并开启下一代");return}const archive={generation:g.generation,name:p.name,country:p.country,club:p.club,position:p.position,age:p.age,career:{...p.career},honors:g.honors.filter(h=>h.generation===g.generation),headCoach:!!withCoach,year:g.year};g.ancestors.push(archive);const lastClub=p.club.replace(/青训$/,"");let t=mkTalent(),name=p.name.replace(/(·\d+世)+$/,"")+"·"+(g.generation+1)+"世";const child={...initialPlayer(false),name,country:p.country,age:16,position:P(["LW","RW","ST","CAM","CM","CB"]),club:lastClub+"青训",leagueId:p.leagueId,youth:true,number:R(11,40),stats:t.stats,potential:t.potential,trait:t.specialty,cash:12000,wage:1600,contract:2,fame:5,career:{apps:0,goals:0,assists:0,national:0},parentCoach:withCoach?{name:p.name,club:lastClub,points:5,skills:{tactics:20,training:25,motivation:20,scouting:20}}:null};g.generation++;g.player=child;g.year++;g.offers=[];g.live=null;g.season=makeSchedule(child,g.year,10);simulateNPCOffseason();createWorld(g.season);log("家族第"+g.generation+"代正式开启："+child.name+"，父亲"+(withCoach?"担任 "+lastClub+" 主教练":"选择退役生活")+"。");page="family";save();render()}
function createCoachSchedule(){
 const p={...g.player,club:g.coach.club,leagueId:g.coach.leagueId,age:g.coach.age,youth:false};
 const season=makeSchedule(p,g.year,g.lastReview?.rank||6);
 season.events=season.events.filter(ev=>ev.kind!=="national");season.national=null;
 season.index=0;season.completed=0;return season
}
function startCoachMode(){
 if(!g||g.mode==="coach"||g.player.age<32)return notify("至少32岁才能退役当主教练");
 const p=g.player;if(!g.ancestors.some(a=>a.generation===g.generation)){
  g.ancestors.push({generation:g.generation,name:p.name,country:p.country,club:p.club,position:p.position,age:p.age,career:{...p.career},honors:g.honors.filter(h=>h.generation===g.generation),headCoach:true,year:g.year})
 }
 const old=p.parentCoach?.skills;
 g.coach={name:p.name,age:p.age,club:p.club,leagueId:p.leagueId,formation:"4-2-3-1",points:7,
  skills:{tactics:old?.tactics||42,training:old?.training||40,motivation:old?.motivation||40,scouting:old?.scouting||36},
  contract:3,budget:5000000,board:68,reputation:35,seasons:0,record:{w:0,d:0,l:0},signings:[],scoutUsed:false,prospects:[],autoPoints:true};
 g.mode="coach";g.offers=[];g.live=null;g.year++;
 g.season=createCoachSchedule();simulateNPCOffseason();createWorld(g.season);
 page="coach";log("退役后担任 "+g.coach.club+" 主教练，开启独立教练生涯。");
 save();render()
}
function coachPreparation(){
 const c=g.coach;if(!c||!c.autoPoints)return;
 const keys=["tactics","training","motivation","scouting"];
 c.points=allocateAvailable(c.points,c.skills,keys,100)
}
function coachMatch(ev,choice="balanced",batch=false){
 const c=g.coach,s=g.season;
 const inactive=(ev.kind==="cup"&&!s.cup.active)||((ev.kind==="europe"||ev.kind==="europeKO")&&(!s.uefa||s.uefa.completed));
 if(inactive){s.index++;s.completed++;g.live=null;if(!batch){save();page="coach";render()}return}
 const home=ev.home|| (s.cup.stage%2?c.club:"杯赛对手"),away=ev.away||(home===c.club?"杯赛对手":c.club);
 const ours=home===c.club,enemy=ours?away:home;
 const tactic=({"4-3-3":2,"4-2-3-1":3,"3-5-2":2,"4-4-2":0,"5-3-2":-2}[c.formation]||0);
 const strength=C(power(c.club)+(c.skills.tactics-45)*.16+(c.skills.motivation-45)*.09+tactic+c.signings.length*.9,45,99);
 const rival=power(enemy);
 const bias=choice==="creative"?3:0;
 const targetDiff=(ours?1:-1)*(strength-rival+bias);
 const defending=choice==="defend";
 let [hs,as]=simulateScore(home,away,targetDiff-(power(home)-power(away)),defending?(ours?.2:.55):choice==="attack"?(ours?-.35:-.2):0,defending?(ours?.55:.2):choice==="attack"?(ours?-.2:-.35):0),our=ours?hs:as,their=ours?as:hs,penalties=false;
 if(ev.kind==="league"){const round=s.leagueRounds.find(r=>r.round===ev.round);otherLeagueGames(round,ev);updateTable(s.leagueTable,home,away,hs,as);simulateNPCGame(home,away,hs,as);s.leaguePlayed++;advanceWorld()}
 if(ev.kind==="europe"){updateTable(s.uefa.table,home,away,hs,as);simulateNPCGame(home,away,hs,as,0,0,"europe");simulateUefaOthers(s.uefa,ev);s.uefa.played++;
  if(s.uefa.played===8){const rank=sortedTable(s.uefa.table).findIndex(t=>t.name===c.club)+1;s.uefa.rank=rank;if(rank>24){s.uefa.completed=true;s.uefa.stage="eliminated"}else{s.uefa.stage="knockout";addKnockouts()}}}
 if(ev.kind==="cup"){penalties=our===their;const win=our>their||(penalties&&Math.random()<.5);s.cup.results.push({stage:ev.stage,hs,as,win,penalties});if(!win){s.cup.active=false}else{s.cup.stage++;if(ev.stage==="决赛"){s.cup.active=false;award(s.cup.name+"冠军（主教练）","coach")}}}
 if(ev.kind==="europeKO"){simulateNPCGame(home,away,hs,as,0,0,"europe");const e=s.uefa;e.koAggregate=e.koAggregate||{};let agg=e.koAggregate[ev.stage]||{for:0,against:0,legs:0};agg.for+=our;agg.against+=their;agg.legs++;e.koAggregate[ev.stage]=agg;
  if(ev.stage==="决赛"||ev.leg===2){const win=agg.for>agg.against||(agg.for===agg.against&&Math.random()<.5);e.knockoutResults.push({stage:ev.stage,win,score:agg.for+"-"+agg.against,legs:agg.legs});if(!win){e.completed=true;e.stage="eliminated"}else if(ev.stage==="决赛"){e.completed=true;e.stage="champion";award(e.type+"冠军（主教练）","coach")}}
 }
 c.record[our>their?"w":our===their?"d":"l"]++;
 c.board=percent(c.board+(our>their?2:our===their?0:-3));
 c.budget+=R(18000,64000)+(our>their?38000:0);
 c.reputation=percent(c.reputation+(our>their?1:0));
 if(s.completed%4===0)c.points+=1;
 g.lastMatch={...ev,home,away,hs,as,coach:true,penalties,real:false};s.results.push(g.lastMatch);s.index++;s.completed++;g.live=null;
 log("主教练"+c.name+"："+home+" "+hs+" : "+as+" "+away+(penalties?"（点球决胜）":""));
 if(!batch){if(s.index>=s.events.length)endCoachSeason();else{page="report";save();render()}}
}
function endCoachSeason(){
 const s=g.season;if(s.stage==="review")return;
 advanceWorld(true);const c=g.coach,rank=sortedTable(s.leagueTable).findIndex(t=>t.name===c.club)+1;
 if(rank===1){award(DB[c.leagueId].name+"冠军（主教练）","coach");c.reputation=percent(c.reputation+9);c.board=percent(c.board+15)}
 if(rank<=4){c.budget+=2500000;c.reputation=percent(c.reputation+4)}
 if(s.uefa&&!s.uefa.completed){s.uefa.completed=true;s.uefa.stage="season-end"}
 const champions={};for(const [id,w]of Object.entries(s.world||{}))champions[id]=sortedTable(w.table)[0]?.name;
 champions[c.leagueId]=sortedTable(s.leagueTable)[0]?.name;
 g.worldHistory=g.worldHistory||[];g.worldHistory.push({year:g.year,champions});g.worldHistory=g.worldHistory.slice(-50);
 c.seasons++;
 g.history.push({year:g.year,generation:g.generation,club:c.club,league:DB[c.leagueId].name,rank,manager:true,points:sortedTable(s.leagueTable).find(x=>x.name===c.club)?.points||0,average:"—",apps:0,goals:0,assists:0});
 g.lastReview={rank,avg:"—",goals:0,assists:0,coach:true};g.offers=generateCoachOffers();
 s.stage="review";page="coach";log(c.name+"教练第"+c.seasons+"赛季结束，联赛第"+rank+"名。");save();render()
}
function generateCoachOffers(){
 const c=g.coach;if(!c)return[];
 const teams=Object.entries(DB).flatMap(([id,l])=>l.teams.map(t=>({...t,id})));
 return teams.filter(t=>t.name!==c.club&&t.power<=65+c.reputation*.5).sort(()=>Math.random()-.5).slice(0,5).map(t=>({club:t.name,id:t.id,yearlySalary:Math.round((t.power*35000+c.reputation*10000)/10000)*10000,years:R(2,4),manager:true}))
}
function nextCoachSeason(){
 const c=g.coach;g.year++;c.age++;c.contract=Math.max(0,c.contract-1);if(c.contract===0)c.contract=3;
 c.points+=3;c.scoutUsed=false;c.prospects=[];
 g.player.club=c.club;g.player.leagueId=c.leagueId;g.player.age=c.age;
 offseasonClubUpdate();g.season=createCoachSchedule();g.lastMatch=null;simulateNPCOffseason();createWorld(g.season);g.offers=[];g.live=null;
 page="coach";log(c.name+"教练开启 "+g.year+"/"+(g.year+1)+" 赛季。");save();render()
}
function scoutForCoach(){
 const c=g.coach;if(!c||g.season.stage!=="playing"||c.scoutUsed)return notify("本赛季已经使用过球探报告");
 if(c.budget<60000)return notify("俱乐部预算不足");
 c.budget-=60000;c.scoutUsed=true;
 c.prospects=g.npcs.filter(n=>n.club!==c.club&&n.ov>58&&n.ov<Math.min(94,power(c.club)+14)).sort(()=>Math.random()-.5).slice(0,6).map(n=>({id:n.id,name:n.name,club:n.club,ov:n.ov,pos:n.pos,fee:Math.round(n.ov*n.ov*70/10000)*10000}));
 log("球探提供6名候选引援（侦察成本6万元）");save();render()
}
function signCoachProspect(i){
 const c=g.coach,x=c.prospects[i];if(!x||!g||g.season.stage!=="playing")return;
 if(c.budget<x.fee)return notify("预算不足，无法完成引援");
 const npc=g.npcs.find(n=>n.id===x.id);if(!npc)return;
 c.budget-=x.fee;npc.club=c.club;c.signings.push({year:g.year,name:npc.name,fee:x.fee,ov:npc.ov});
 c.prospects.splice(i,1);log("主教练引入 "+npc.name+"，转会费 "+M(x.fee));save();render()
}
function coachPointAlloc(key){const c=g.coach;if(!c||c.points<=0||!Object.hasOwn(c.skills,key)||c.skills[key]>=100)return;c.points--;c.skills[key]++;save();render()}
function coachTransfer(i){
 const o=g.offers[i];if(!o?.manager||g.season.stage!=="review")return;
 const c=g.coach,old=c.club;c.club=o.club;c.leagueId=o.id;c.contract=o.years;g.player.club=c.club;g.player.leagueId=c.leagueId;g.offers=[];
 log("主教练转会："+old+" → "+c.club);save();render()
}
function startNextGenerationFromCoach(){
 const c=g.coach,former=g.player,t=mkTalent();
 if(!g.ancestors.some(x=>x.generation===g.generation)){
  g.ancestors.push({generation:g.generation,name:former.name,country:former.country,club:c.club,position:former.position,age:former.age,career:{...former.career},honors:g.honors.filter(h=>h.generation===g.generation),headCoach:true,year:g.year})
 }
 const child={...initialPlayer(false),name:former.name.replace(/(·\d+世)+$/,"")+"·"+(g.generation+1)+"世",country:former.country,age:16,position:P(["LW","RW","ST","CAM","CM","CB","GK"]),club:c.club+"青训",leagueId:c.leagueId,youth:true,number:R(11,44),stats:t.stats,potential:t.potential,trait:t.specialty,cash:12000,wage:1600,contract:2,fame:5,career:{apps:0,goals:0,assists:0,national:0},parentCoach:{name:c.name,club:c.club,formation:c.formation,skills:{...c.skills},points:c.points}};
 g.mode="player";g.generation++;g.player=child;g.year++;g.offers=[];g.live=null;g.season=makeSchedule(child,g.year,10);
 simulateNPCOffseason();createWorld(g.season);page="family";
 log("第"+g.generation+"代 "+child.name+" 进入 "+child.club+"；父亲"+c.name+"继续担任主教练。");save();render()
}

function simSeason(quiet=false){
 if(!g||g.season.stage!=="playing")return;
 if(!quiet&&!confirm("同步完成两名球员在同一个足球世界中的剩余赛季，确定？"))return;
 if(duoGames){sharedAdvanceDates(400);if(!quiet)notify("两人已在同一时间线上完成赛季");return}
 const p=g.player,oldAuto=p.autoPoints,oldTrain=p.autoTraining;p.autoPoints=true;p.autoTraining=true;
 let n=0;while(g.season.index<g.season.events.length&&n<110){const ev=currentEvent();automaticPrep();playEvent(ev,"balanced",true);n++}
 p.autoPoints=oldAuto;p.autoTraining=oldTrain;if(g.season.stage==="playing")endSeason();else{save();render()}
}
function simThree(){if(!g||g.season.stage!=="playing")return;if(duoGames){sharedAdvanceDates(3);notify("双方同步推进3个比赛日");return}
 let n=0;while(n<3&&g.season.index<g.season.events.length){automaticPrep();playEvent(currentEvent(),"balanced",true);n++}if(g.season.index>=g.season.events.length)endSeason();else{save();page="dashboard";render()}
}
function exportFile(){if(!duoGames)return;const blob=new Blob([JSON.stringify({format:"football-dynasty-duo-v2",save:duoPayload()},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="绿茵世代_双人生涯_"+g.year+".json";document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},800)}
async function importFile(file){if(!file||file.size>16000000){notify("文件过大或无效");return}try{const data=JSON.parse(await file.text());const v=data.save;if(data.format!=="football-dynasty-duo-v2"||v?.version!==2||!v.duoGames?.wang?.player||!v.duoGames?.vini?.player)throw Error("invalid");if(DUO_IDS.some(id=>!DB[v.duoGames[id].player.leagueId])){notify("该旧存档包含已取消联赛。文件保持原样，不会覆盖当前存档");return}if(!confirm("导入双人生涯存档会覆盖当前进度，确定？"))return;hydratePayload(v);page="dashboard";save();render();if(!ageMigrationBlocked)notify("同一足球世界双人生涯导入成功")}catch(e){notify("只支持本游戏双人生涯格式；旧陆白版本不再导入")}}
function newGameDialog(){if(g&&!confirm("删除当前两人生涯并重新开档？此操作不能撤销，建议先导出存档。"))return;g=null;duoGames=null;sharedUniverse=null;activeDuo="wang";page="start";localStorage.removeItem(STORE);localStorage.removeItem(SAFETY_STORE);resetDraw();render()}
function choosePage(p){page=p;render()}
function bar(n){return '<div class="meter"><span style="width:'+percent(n)+'%"></span></div>'}
function metric(label,val){return '<div class="metric"><label>'+label+'</label><b>'+val+'</b></div>'}
function badge(s){return '<span class="badge">'+E(s)+'</span>'}
function clubShield(name){
 const label=String(name||"队");const token=label.replace(/青训$/,"").slice(0,2);
 let hue=0;for(const ch of label)hue=(hue*13+ch.charCodeAt(0))%360;
 return '<span class="clubcrest" aria-label="'+E(label)+'虚构球队徽章" style="--club-hue:'+hue+'">'+E(token)+'</span>'
}

function coachDashboard(){
 const m=g.coach,s=g.season,e=currentEvent(),rank=sortedTable(s.leagueTable).findIndex(x=>x.name===m.club)+1;
 return '<div class="hero"><div><div class="cap">MANAGER CAREER · 第'+g.generation+'代 · '+g.year+'/'+(g.year+1)+'</div><h1>主教练 '+E(m.name)+'<br><span class="gold">'+E(m.club)+'</span></h1><p>'+m.age+'岁 · '+DB[m.leagueId].name+' · 阵型 '+E(m.formation)+' · 执教第'+(m.seasons+1)+'赛季</p><div class="flex">'+(s.stage==="playing"?'<button class="button primary" data-action="nextMatch">执教下一场</button><button class="button goldbtn" data-action="simSeason">一键完成完整赛季</button>':'<button class="button goldbtn" data-action="nextSeason">进入下一赛季</button>')+'<button class="button" data-page="coach">战术与球探中心</button><button class="button outline" data-action="coachChild">开启下一代</button></div></div></div>'+
 '<div class="grid4 gap">'+metric("董事会信任",m.board+"/100")+metric("俱乐部预算",M(m.budget))+metric("联赛排名","#"+rank)+metric("教练声望",m.reputation+"/100")+'</div>'+
 '<div class="columns gap"><section class="card"><div class="row"><h2>教练赛程</h2><span class="chip">'+(e?e.date:"已完成")+'</span></div>'+(e?'<div class="scoreboard"><div class="inside"><div class="cap">'+E(e.competition||DB[m.leagueId].name)+'</div><div class="club-match">'+clubShield(e.home||m.club)+'<span class="match-club-name">'+E(e.home||m.club)+'</span><span class="gold match-vs">VS</span><span class="match-club-name">'+E(e.away||"杯赛对手")+'</span>'+clubShield(e.away||"杯赛对手")+'</div></div></div>':'<p>赛季已结束。</p>')+
 '<div class="flex gap"><button class="button" data-action="simThree" '+(s.stage!=="playing"?"disabled":"")+'>快进3场</button><button class="button" data-page="calendar">全年赛程</button><button class="button" data-page="world">世界足球</button></div></section>'+
 '<section class="card"><h2>执教数据</h2><div class="grid3">'+metric("累计胜",m.record.w)+metric("累计平",m.record.d)+metric("累计负",m.record.l)+'</div><p class="muted gap">已签入 '+m.signings.length+' 人 · 可用教练点数 '+m.points+' · 教练生涯'+m.seasons+'赛季</p>'+eventPanels()+'</section></div>'
}
function coachPage(){
 const m=g.coach,formation=["4-3-3","4-2-3-1","3-5-2","4-4-2","5-3-2"];
 return '<div class="columns"><section class="card"><h2>战术与教练加点</h2><div class="grid3">'+metric("教练点数",m.points)+metric("董事会信任",m.board)+metric("声望",m.reputation)+'</div>'+
 '<label class="field">执教阵型<select id="coachFormation">'+formation.map(x=>'<option '+(m.formation===x?"selected":"")+'>'+x+'</option>').join('')+'</select></label><label class="flex item"><input type="checkbox" id="coachAutoPoints" '+(m.autoPoints?"checked":"")+'> 自动分配教练点数</label>'+
 Object.entries(m.skills).map(([k,v])=>'<div class="item gap"><div class="row"><strong>'+({tactics:"战术",training:"训练",motivation:"激励",scouting:"球探"}[k])+'</strong><b class="gold">'+v+'</b></div>'+bar(v)+'<button class="button" data-action="coachAdd" data-key="'+k+'" '+(!m.points?"disabled":"")+'>+1教练点数</button></div>').join('')+
 '<div class="item gap"><b>战术说明</b><p class="muted small">阵型、战术、激励和引援影响比赛实力；转会和成绩改变俱乐部预算及董事会信任。</p></div></section>'+
 '<section class="card"><h2>球队经营与球探</h2><div class="grid3">'+metric("预算",M(m.budget))+metric("引援数",m.signings.length)+metric("阵容增益",m.signings.length)+'</div>'+
 '<button class="button goldbtn gap" data-action="coachScout" '+(m.scoutUsed||g.season.stage!=="playing"?"disabled":"")+'>球探搜索 · ¥60,000</button><div class="list gap">'+(m.prospects.length?m.prospects.map((x,i)=>'<div class="item"><div class="row"><b>'+E(x.name)+'</b><span class="chip">'+E(x.pos)+' · '+x.ov+'</span></div><p class="muted small">原球队 '+E(x.club)+' · 转会费 '+M(x.fee)+'</p><button class="button primary" data-action="coachSign" data-i="'+i+'" '+(m.budget<x.fee?"disabled":"")+'>签下球员</button></div>').join(''):'<p class="muted">使用球探报告找出可引进球员，并通过预算签约。签约会改变球员所属球队。</p>')+'</div>'+
 '<h3 class="gap">引援历史</h3><div class="list">'+(m.signings.slice(-10).reverse().map(x=>'<div class="item">'+x.year+' · '+E(x.name)+' · '+M(x.fee)+'</div>').join('')||'<p class="muted">暂无记录。</p>')+'</div></section></div>'
}
function coachTransferPage(){
 const m=g.coach;return '<div class="grid2"><section class="card"><h2>主教练合同</h2><h3>'+E(m.name)+' / '+E(m.club)+'</h3><div class="kv"><span>合同剩余</span><b>'+m.contract+'年</b></div><div class="kv"><span>董事会信任</span><b>'+m.board+'/100</b></div><div class="kv"><span>赛季推演教练预算</span><b>'+M(m.budget)+'</b></div></section>'+
 '<section class="card"><h2>其他球队执教邀请</h2><div class="list">'+(g.offers.length?g.offers.map((x,i)=>'<div class="item"><div class="row"><b>'+E(x.club)+'</b><span class="chip">'+E(DB[x.id].name)+'</span></div><p class="muted">赛季推演年薪 '+M(x.yearlySalary)+' · '+x.years+'年</p><button class="button primary" data-action="coachJob" data-i="'+i+'">签约执教</button></div>').join(''):'<p class="muted">赛季结束后获得教练岗位邀请。</p>')+'</div></section></div>'
}
function coachFamilyPage(){
 const m=g.coach;return '<div class="hero"><div><div class="cap">FATHER AND SON DYNASTY</div><h1>父亲在场边，<br><span class="gold">儿子在场上</span></h1><p>'+E(m.name)+'执教'+E(m.club)+'，已完成'+m.seasons+'个教练赛季。可以继续执教，也可以开启第'+(g.generation+1)+'代儿子。</p><div class="flex"><button class="button goldbtn" data-action="coachChild">开启第'+(g.generation+1)+'代球员</button><button class="button" data-page="coach">返回教练办公室</button></div></div></div>'
}
function coachReviewPage(){
 const m=g.coach,r=g.lastReview;return '<div class="hero"><div><div class="cap">MANAGER YEAR-END REVIEW</div><h1>教练赛季结算<br><span class="gold">'+E(m.club)+' · 联赛第'+r.rank+'名</span></h1><p>执教'+m.record.w+'胜 '+m.record.d+'平 '+m.record.l+'负 · 预算 '+M(m.budget)+'</p><div class="flex"><button class="button goldbtn" data-action="nextSeason">进入下一教练赛季</button><button class="button" data-page="transfer">教练邀请</button><button class="button primary" data-action="coachChild">父亲执教，开启下一代</button></div></div></div>'
}

function dashboard(){if(g.mode==="coach")return coachDashboard();const p=g.player,s=g.season,next=currentEvent(),rank=sortedTable(s.leagueTable).findIndex(t=>t.name===p.club)+1;return '<div class="hero"><div><div class="cap">THE NEXT GENERATION · '+g.year+'/'+(g.year+1)+'</div><h1>'+E(p.name)+' <span class="gold">#'+p.number+'</span><br>'+E(p.club)+'</h1><p>'+p.age+'岁 · '+E(p.country)+' · '+E(POS[p.position])+' · 第'+g.generation+'代职业生涯<br>'+(p.parentCoach?'主教练：'+E(p.parentCoach.name)+'（父子同队）':'2026/27 独立重启存档，不读取旧版进度')+'</p><div class="flex">'+(s.stage==="review"?'<button class="button goldbtn" data-action="nextSeason">进入下赛季</button>':'<button class="button primary" data-action="nextMatch">下一场比赛</button><button class="button goldbtn" data-action="simSeason">一键完成整个剩余赛季</button>')+'<button class="button outline" data-page="calendar">赛程日历</button></div></div></div><div class="grid4 gap">'+metric("综合评分",overall(p))+metric("本季进球 / 助攻",s.goals+" / "+s.assists)+metric("联赛排名","#"+rank)+metric("家族第几代",g.generation)+'</div>'+FootballAdvice.render(p,next,s)+careerHonorsPanel()+'<div class="columns gap"><section class="card"><div class="row"><h2>下一场比赛</h2><span class="chip">'+(next?next.date:"赛季已结束")+'</span></div>'+(next?'<div class="scoreboard"><div class="inside"><div class="cap">'+E(next.competition||DB[p.leagueId].name)+'</div><div class="club-match">'+clubShield(next.home||p.club)+'<span class="match-club-name">'+E(next.home||p.club)+'</span><span class="gold match-vs">VS</span><span class="match-club-name">'+E(next.away||"杯赛对手")+'</span>'+clubShield(next.away||"杯赛对手")+'</div><div class="muted">'+E(next.stage||"正式比赛")+'</div></div></div>':'<p class="muted">所有比赛已完成。查看赛季结算与转会报价。</p>')+'<div class="flex gap"><button class="button primary" data-action="nextMatch" '+(s.stage!=="playing"?"disabled":"")+'>进入比赛</button><button class="button" data-action="simThree" '+(s.stage!=="playing"?"disabled":"")+'>快速赛季推演3场</button><button class="button" data-page="training">球员 / 教练加点</button></div></section><section class="card"><h2>能力与状态</h2><div class="row"><span class="muted">球员可用点数</span><strong class="gold">'+p.points+'</strong></div>'+Object.keys(STATS).map(k=>'<div class="stat"><span>'+STATS[k]+'</span>'+bar(p.stats[k])+'<b>'+p.stats[k]+'</b></div>').join('')+'<div class="grid3 gap">'+metric("体能",p.stamina)+metric("士气",p.morale)+metric("教练信任",p.coachTrust)+'</div></section></div><div class="grid2 gap"><section class="card"><h2>赛事速览</h2>'+eventPanels()+'</section><section class="card"><h2>最新赛事动态</h2><div class="list">'+g.logs.slice(0,6).map(x=>'<div class="item"><span class="cap">'+x.year+' / '+x.week+'</span><div>'+E(x.description)+'</div></div>').join('')+'</div></section></div>'}
function eventPanels(){const s=g.season;return '<div class="kv"><span>联赛</span><b>'+DB[g.player.leagueId].name+' · '+s.leaguePlayed+'/'+s.leagueRounds.length+'场</b></div><div class="kv"><span>欧战</span><b>'+(s.uefa?s.uefa.type+' · '+s.uefa.played+'/8场联赛阶段':'无资格')+'</b></div><div class="kv"><span>国内杯赛</span><b>'+s.cup.name+(s.cup.active?" · 进行中":" · 已结束")+'</b></div><div class="kv"><span>国家队</span><b>'+E(g.player.country)+' · 本季 '+s.nationalApps+'场</b></div><div class="kv"><span>赛季已处理</span><b>'+s.completed+' / '+s.events.length+'项日程</b></div>'}
function tablePanel(table,top=40){if(!table)return '<p class="muted">暂无赛事排名</p>';return '<div class="tablewrap"><table><thead><tr><th>#</th><th>球队</th><th>场</th><th>胜</th><th>平</th><th>负</th><th>净胜</th><th>分</th></tr></thead><tbody>'+sortedTable(table).slice(0,top).map((t,i)=>'<tr class="'+(t.name===g.player.club?"me":"")+'"><td>'+(i+1)+'</td><td>'+E(t.name)+'</td><td>'+t.p+'</td><td>'+t.w+'</td><td>'+t.d+'</td><td>'+t.l+'</td><td>'+(t.gf-t.ga)+'</td><td><b>'+t.points+'</b></td></tr>').join('')+'</tbody></table></div>'}
function leaguePage(){const s=g.season,p=g.player;return '<div class="card"><div class="row"><h2>'+DB[p.leagueId].name+' · 联赛积分榜</h2><span class="chip">'+s.leaguePlayed+'/'+s.leagueRounds.length+'轮 · 完整主客场</span></div><p class="muted small">'+(g.year===2026&&p.club==="曼联"?"曼联前9场为已核实历史结果；其他俱乐部开档前结果为游戏赛季结果，不冒充官方积分。":"所有未锁定比赛均为游戏赛季结果。")+'</p>'+tablePanel(s.leagueTable)+'</div>'}
function calendarPage(){const s=g.season;return '<div class="card"><div class="row"><h2>全年赛事日历</h2><span class="chip">联赛 '+s.leagueRounds.length+' 场 · 国内杯赛 · 欧战 · 国家队</span></div><p class="muted">已确认的曼联英超和欧冠比赛不会重新赛季推演；杯赛淘汰后对应后续轮次自动跳过。多代生涯每年重新生成赛程。</p><div class="list">'+[...s.results.slice().reverse(),...s.events.slice(s.index)].map(ev=>'<div class="item '+(ev.real?"locked":"")+'"><div class="row"><span class="cap">'+E(ev.date||"")+' · '+E(ev.competition||(ev.kind==="league"?DB[g.player.leagueId].name:"赛事"))+'</span><span class="chip">'+(ev.real?"已核实结果":Number.isFinite(ev.hs)?"赛季推演完成":"待赛季推演")+'</span></div><div class="title">'+E(ev.home||"待定")+' '+(Number.isFinite(ev.hs)?ev.hs:"—")+' : '+(Number.isFinite(ev.as)?ev.as:"—")+' '+E(ev.away||"待定")+'</div><span class="muted small">'+E(ev.stage||"")+'</span></div>').join('')+'</div></div>'}
function uefaPage(){const x=g.season.uefa;return '<div class="card"><div class="row"><h2>欧冠 / 欧联 · 2026/27 新赛制</h2><span class="chip">36队 · 8场联赛阶段 · 4主4客</span></div><p class="muted">第1—8名直通16强，第9—24名进入淘汰赛附加赛，第25—36名出局；赛季推演其他球队，依据36队统一积分排行。附加赛、16强、8强、半决赛均采用主客场两回合，决赛为单场。</p>'+(x?'<div class="grid4">'+metric("参赛赛事",x.type)+metric("欧战已赛",x.played+"/8")+metric("目前排名","#"+(sortedTable(x.table).findIndex(z=>z.name===g.player.club)+1))+metric("淘汰赛",x.stage==="league"?"未开始":x.stage)+'</div><h3 class="gap">36队欧战积分榜</h3>'+tablePanel(x.table,36):'<p class="muted">当前赛季未获得欧战资格，获得联赛前列名次可争取下赛季参加欧冠或欧联。</p>')+'</div>'}
function worldPage(){
 const s=g.season,p=g.player,id=DB[g.worldFocus]?g.worldFocus:p.leagueId,league=DB[id],peer=duoGames&&Object.values(duoGames).find(x=>x.year===g.year&&x.player.leagueId===id),stand=id===p.leagueId?s.leagueTable:peer?.season.leagueTable||s.world?.[id]?.table;
 const npc=g.npcs.filter(n=>league.teams.some(t=>t.name===n.club)&&n.pos!=="GK");
 const top=npc.map(n=>({name:n.name,club:n.club,goals:n.goals,assists:n.assists,isUser:false}));
 if(id===p.leagueId&&!p.youth)top.push({name:p.name,club:p.club,goals:s.leagueGoals||0,assists:s.leagueAssists||0,isUser:true});
 top.sort((a,b)=>b.goals-a.goals||b.assists-a.assists);
 const assists=top.slice().sort((a,b)=>b.assists-a.assists||b.goals-a.goals);
 const years=(g.worldHistory||[]).slice(-12).reverse();
 const choose=Object.values(DB).map(l=>'<button class="button '+(id===l.id?"goldbtn":"")+'" data-action="worldSelect" data-id="'+l.id+'">'+l.name+'</button>').join("");
 return '<section class="card"><div class="cap">WORLD FOOTBALL · 全球联动赛季推演</div><h2>世界足球中心</h2><p class="muted">多个联赛随玩家赛季同步推进，分别进行30/34/38轮主客场双循环；AI球员的出场、进球、助攻逐场生成。非锁定的比赛和球星数据全部属于游戏赛季结果。</p><div class="flex">'+choose+'</div><h3 class="gap">'+league.name+' · 积分榜</h3>'+tablePanel(stand,league.teams.length)+'</section><div class="grid2 gap"><section class="card"><h2>'+league.name+' · 射手榜</h2><div class="list">'+top.slice(0,15).map((n,i)=>'<div class="item row '+(n.isUser?"mine":"")+'"><div><strong>'+(i+1)+'. '+E(n.name)+'</strong><div class="muted small">'+E(n.club)+'</div></div><b class="gold">'+n.goals+'球</b></div>').join('')+'</div></section><section class="card"><h2>'+league.name+' · 助攻榜</h2><div class="list">'+assists.slice(0,15).map((n,i)=>'<div class="item row '+(n.isUser?"mine":"")+'"><div><strong>'+(i+1)+'. '+E(n.name)+'</strong><div class="muted small">'+E(n.club)+'</div></div><b class="green">'+n.assists+'助</b></div>').join('')+'</div></section></div><section class="card gap"><h2>历年全球冠军年鉴</h2><div class="list">'+(years.length?years.map(y=>'<div class="item"><div class="cap">'+y.year+'</div>'+Object.entries(y.champions).map(([lid,name])=>'<span class="badge">'+E(DB[lid]?.name||lid)+' · '+E(name)+'</span>').join('')+'</div>').join(''):'<p class="muted">赛季推演完首个赛季后自动建立冠军年鉴。</p>')+'</div></section>'
}
function trainingPage(){if(g.mode==="coach")return coachPage();
 const p=g.player,coach=p.parentCoach,keys=Object.keys(STATS);
 const formationChoices=["4-3-3","4-2-3-1","3-5-2","4-4-2","5-3-2"];
 return '<div class="columns"><section class="card"><div class="row"><h2>球员成长 · 专项训练</h2><span class="chip">'+(p.freeStarHidden?E(hiddenPotentialText(g)):'成长潜力 '+p.potential+' / 100')+'</span></div><div class="grid3">'+metric("可用成长点数",p.points)+metric("当前体能",p.stamina)+metric("本场训练",p.trainingUsed?"已完成":"未安排")+'</div>'+
 '<p class="muted small gap">训练经验需要多场积累。青训成长较快，成年后逐步放缓，30岁后自然衰退。手动加点每次消耗1点；自动加点按球员位置权重分配。</p>'+
 '<label class="flex item"><input type="checkbox" id="autoPoints" '+(p.autoPoints?"checked":"")+'> 自动分配球员及父亲教练能力点</label>'+
 '<label class="flex item gap"><input type="checkbox" id="autoTraining" '+(p.autoTraining?"checked":"")+'> 自动规划专项训练与休息</label>'+
 '<div class="list gap">'+keys.map(k=>'<div class="item"><div class="row"><strong>'+STATS[k]+' <span class="gold">'+p.stats[k]+'</span></strong><span class="muted small">训练经验 '+(p.trainingProgress?.[k]||0)+'</span></div>'+bar(p.stats[k])+'<div class="flex"><button class="button" data-action="addPoint" data-key="'+k+'" '+(p.points<=0||p.stats[k]>=p.potential?"disabled":"")+'>使用成长点 +1</button><button class="button" data-action="manualTraining" data-key="'+k+'" '+(p.trainingUsed||p.stamina<23||g.season.stage!=="playing"?"disabled":"")+'>本轮专项训练</button></div></div>').join('')+'</div>'+
 '<div class="flex gap"><button class="button goldbtn" data-action="autoDistribute">智能分配剩余能力点</button><button class="button primary" data-action="manualRecovery" '+(p.trainingUsed||g.season.stage!=="playing"?"disabled":"")+'>休息恢复 +25 体能</button></div>'+
 '<div class="item gap"><b>医疗及纪律中心</b><p class="muted small">伤停 '+(p.injuryMatches||0)+'场 · 停赛 '+(p.suspension||0)+'场 · 本周期黄牌 '+(p.yellowCards||0)+'/5 · 生涯红牌 '+(p.redCards||0)+'</p></div></section>'+
 '<section class="card"><h2>父亲教练 · 战术工作室</h2>'+(coach?'<div class="item"><strong>'+E(coach.name)+'</strong><div class="muted">'+E(coach.club)+' · 与儿子在同一家俱乐部 · 剩余教练点数 '+coach.points+'</div></div>'+
 '<label class="field">主教练战术阵型<select id="formationChoice">'+formationChoices.map(f=>'<option '+((coach.formation||"4-3-3")===f?"selected":"")+'>'+f+'</option>').join('')+'</select></label>'+
 '<p class="muted small">阵型、战术理解影响比赛赛季推演；训练与激励属性影响成长和出场概率。</p>'+
 Object.entries(coach.skills).map(([k,v])=>'<div class="item gap"><div class="row"><strong>'+({tactics:"战术理解",training:"训练水平",motivation:"队员激励",scouting:"球探网络"}[k])+'</strong><span class="gold">'+v+'/100</span></div>'+bar(v)+'<button class="button" data-action="coachPoint" data-key="'+k+'" '+(!coach.points?"disabled":"")+'>教练加点 +1</button></div>').join(''):'<p class="muted">当前没有父亲担任主教练。退役时选择“执教并开启下一代”，就能让父亲执教儿子所在球队。亦可开启独立纯教练模式。</p>')+
 '<div class="gap"><span class="cap">随机天赋</span><p>'+E(STATS[p.trait])+' / 潜力 '+p.potential+'。每一代独立抽取，不直接继承上一代数值。</p></div></section></div>'
}

function transferRulePanel(){
 const level=transferLevel(g.player.leagueId,g.player.club),n=clubSeasonNumbers(g.season),r=g.lastReview?.performance;
 const gate=x=>x.g+"球或"+x.a+"助或合计"+x.sum+"次；至少"+x.apps+"场，评分≥"+x.avg+"，综合≥"+(x.ov||"不限");
 const rows=TRANSFER_GATES.map((target,i)=>TRANSFER_LEVELS[i]+"→"+TRANSFER_LEVELS[i+1]+"："+gate(target));
 return '<div class="item gap"><h3>六档球队声望与成绩门槛</h3><p>当前：'+E(TRANSFER_LEVELS[level])+'；本季俱乐部比赛 '+n.apps+'场 '+n.goals+'球 '+n.assists+'助</p>'+
  rows.map(x=>'<p class="muted small">'+E(x)+'</p>').join('')+
  '<p class="muted small">正常每赛季晋升一档；翻中唯一幸运卡时可跳两档。同一档内部转会不算升级或降档。两季明显不佳可逐级降档，但中超已是最低起点，只允许留队或同级转会。传奇豪门包括皇马、巴萨、巴黎、曼城、曼联等，按俱乐部声望判定，而非仅按联赛。</p>'+
  (r?'<p class="gold">上季考核：'+E(r.comment)+'</p>':'')+'</div>';
}
function transferPage(){if(g.mode==="coach")return coachTransferPage();const p=g.player;return '<div class="columns"><section class="card"><h2>转会与合同</h2>'+transferRulePanel()+'<div class="photo"></div><h3>'+E(p.club)+'</h3><div class="kv"><span>当前身份</span><b>'+(p.youth?"青训球员":"一线队球员")+'</b></div><div class="kv"><span>合同年限</span><b>'+p.contract+'年</b></div><div class="kv"><span>周薪</span><b>'+M(p.wage)+'</b></div><div class="kv"><span>虚拟身价</span><b>'+M(Math.round(overall(p)*overall(p)*1450))+'</b></div><p class="muted small gap">转会仅在赛季结束进行；已进一线队不会再转回任何青训体系。青训毕业自动升入当前俱乐部一线队。</p></section><section class="card"><h2>赛季转会报价</h2>'+(g.offers.length?'<div class="list">'+g.offers.map((o,i)=>'<div class="item"><div class="row"><b>'+E(o.club)+'</b><span class="chip">'+E(DB[o.id].name)+'</span></div><p class="muted small">周薪 '+M(o.wage)+' · 合同 '+o.years+'年 · '+E(o.move||"同级转会")+'</p><button class="button primary" data-action="transfer" data-i="'+i+'">接受'+(o.promotion?"一线队晋升":"转会报价")+'</button></div>').join('')+'</div>':'<p class="muted">赛季结束后会出现符合当前能力和身价的正式报价。</p>')+'</section></div>'}
function cupPage(){const s=g.season;return '<div class="grid2"><div class="card"><h2>'+E(s.cup.name)+'</h2><p class="muted">'+(s.cup.active?"仍在争夺中":"本季杯赛结束")+'</p><div class="list">'+s.cup.results.map(x=>'<div class="item">'+E(x.stage)+' · '+x.hs+'-'+x.as+(x.penalties?" · 点球决胜":"")+(x.win?" · 晋级":" · 出局")+'</div>').join('')+'</div></div><div class="card"><h2>国家队赛事</h2><p>国籍：<b>'+E(g.player.country)+'</b></p><p>本赛季国家队比赛：'+s.nationalApps+'场</p><p>当前国家队赛事：'+E(s.national?.name||"暂无")+' · '+(s.national?.stage||"未开始")+'</p><p>小组积分：'+(s.national?.groupPoints||0)+'</p><p class="muted">世界杯、欧洲杯、亚洲杯等赛事根据所属国家和赛历触发；赛季推演赛制不会让中国球员强制进入英格兰队，也不会自动换国籍。</p></div></div>'}
function honorsByGeneration(gen=g.generation){
 const records=(g.honors||[]).filter(h=>h.generation===gen);
 const named=(pattern)=>records.filter(h=>pattern.test(h.name)).length;
 const goldByVote=new Set((g.ballonHistory||[]).filter(b=>b.generation===gen&&b.rank===1).map(b=>b.year)).size;
 return [
  {name:"金球奖",value:Math.max(named(/金球奖/),goldByVote)},
  {name:"金靴奖",value:named(/金靴|最佳射手/)},
  {name:"最佳球员",value:named(/最佳球员|最佳阵容/)},
  {name:"欧冠冠军",value:named(/欧冠冠军/)},
  {name:"欧联冠军",value:named(/欧联冠军/)},
  {name:"全部荣誉",value:records.length}
 ]
}
function careerHonorsPanel(){
 return '<section class="card gap"><div class="row"><h2>生涯奖项累计 · 第'+g.generation+'代</h2><span class="chip">每座奖杯只计一次</span></div>'+
  '<div class="grid3">'+honorsByGeneration().map(h=>metric(h.name,h.value)).join('')+'</div>'+
  '<p class="muted small gap">金球奖按历年100名记者投票结果及荣誉记录统计；其他奖项按已获奖杯累计。历代家族荣誉分开计算。</p></section>'
}

function careerPage(){const p=g.player;return '<div class="card"><div class="row"><div class="flex"><div class="portrait">'+overall(p)+'</div><div><div class="cap">PLAYER HISTORY · 第'+g.generation+'代</div><h2>'+E(p.name)+' · '+E(p.country)+'</h2><div class="muted">'+p.age+'岁 · '+E(POS[p.position])+' · '+E(p.club)+'</div></div></div><div class="flex"><button class="button" data-page="family">家族传承</button>'+(p.age>=32?'<button class="button goldbtn" data-action="retireCoach">退役执教＋开启下一代</button><button class="button" data-action="startCoach">单独开启主教练生涯</button><button class="button" data-action="retireSolo">退役＋下一代</button>':'<span class="chip">32岁后解锁退役分支</span>')+'</div></div><div class="grid4 gap">'+metric("生涯出场",p.career.apps)+metric("生涯进球",p.career.goals)+metric("生涯助攻",p.career.assists)+metric("国家队出场",p.career.national)+'</div>'+careerHonorsPanel()+'<h3 class="gap">球员荣誉</h3><p>'+(g.honors.filter(x=>x.generation===g.generation).map(x=>badge(x.year+" "+x.name)).join('')||'<span class="muted">尚无荣誉</span>')+'</p><h3 class="gap">赛季履历</h3><div class="list">'+g.history.filter(x=>x.generation===g.generation).slice().reverse().map(x=>'<div class="item row"><b>'+x.year+' · '+E(x.club)+'</b><span>'+E(x.league)+' 第'+x.rank+'名 · '+x.apps+'场 '+x.goals+'球 '+x.assists+'助 · '+x.average+'分</span></div>').join('')+'</div></div>'}
function familyPage(){if(g.mode==="coach")return coachFamilyPage();return '<div class="card"><div class="row"><div><div class="cap">INFINITE FAMILY LEGACY</div><h2>家族世代 · 永续职业生涯</h2></div><span class="chip">目前第 '+g.generation+' 代</span></div><p class="muted">每一代重新抽取天赋；历代球员职业数据、荣誉不会清空。父亲退役执教后可作为下一代的主教练，一直延续到三世、四世乃至更久。</p><div class="family">'+g.ancestors.map(a=>'<div class="item"><div class="row"><b>第'+a.generation+'代 '+E(a.name)+'</b><span class="chip">'+(a.headCoach?"退役主教练":"已退役")+'</span></div><div class="muted">'+E(a.club)+' · '+a.career.apps+'场 / '+a.career.goals+'球 / '+a.career.assists+'助 · '+a.honors.length+'项荣誉</div></div>').join('')+'<div class="item mine"><div class="row"><b>第'+g.generation+'代 '+E(g.player.name)+'</b><span class="chip">正在效力</span></div><span class="muted">'+E(g.player.club)+' · '+g.player.age+'岁</span></div></div>'+(g.player.age>=32?'<div class="flex gap"><button class="button goldbtn" data-action="retireCoach">退役担任教练＋开启下一代</button><button class="button" data-action="retireSolo">退役不执教＋开启下一代</button></div>':'<p class="muted gap">球员满32岁后可以主动退役传承。也可以继续踢到40岁，再选择开启下一代。</p>')+'</div>'}
function awardsPage(){
 const all=g.ballonHistory||[],idx=Number.isInteger(g.awardViewIndex)?C(g.awardViewIndex,0,Math.max(0,all.length-1)):all.length-1,b=all[idx],newRules=b?.model>=5;
 const data=window.FOOTBALL_AWARD_REAL_PEOPLE||VERIFIED_REAL_PEOPLE_FALLBACK,history=data.official2026Top10;
 const buttons=all.map((v,i)=>'<button class="button '+(idx===i?"goldbtn":"")+'" data-action="awardYear" data-i="'+i+'">'+v.year+' · 第'+v.generation+'代</button>').join('');
 const old='本届属于旧版评选，历史成绩与已获奖杯保留，但候选姓名未经逐一核实，因此不展示旧版名单；以后赛季采用真实球员姓名。';
 const panel=newRules?
  '<div class="grid4 gap">'+metric("获奖人物",E(b.winner.name))+metric("冠军得分",b.winner.points+" / 1500")+
  metric("你的名次",b.playerNominated?"第"+b.rank+"名":"未入围30人")+
  metric("你的得分",b.playerNominated?b.playerPoints+" / 1500":"—")+'</div>'+
  '<div class="grid2 gap"><section class="card"><h2>30位候选人物 · 全部排名</h2><div class="list">'+
  b.rankings.map((x,i)=>'<div class="item row '+(x.id==="USER"?"mine":"")+'"><div><strong>'+(i+1)+'. '+E(x.name)+(x.id==="USER"?"（你）":"")+'</strong><div class="muted small">'+E(x.club)+' · '+x.goals+'球 '+x.assists+'助 · 第1选票 '+x.firstPlaceVotes+'</div></div><b class="gold">'+x.points+' / 1500</b></div>').join('')+
  '</div></section><section class="card"><h2>100位记者 · 十人选票</h2><div class="list">'+b.ballots.map((one,i)=>
  '<details class="item"><summary><strong>记者 '+(i+1)+'</strong> · 第一名 '+E(b.rankings.find(x=>x.id===one[0])?.name||"—")+'</summary><div class="list gap">'+
  one.map((id,k)=>'<div class="row"><span>'+(k+1)+'. '+E(b.rankings.find(x=>x.id===id)?.name||"—")+'</span><b class="gold">+'+UCL_PTS[k]+'分</b></div>').join('')+
  '</div></details>').join('')+'</div></section></div>'+
  '<button class="button goldbtn gap" data-action="ballotCsv">导出本届100份投票 CSV（WPS可打开）</button>':
  b?'<div class="item"><strong>旧版年份：'+b.year+'</strong><p class="muted">'+old+'</p>'+
  '<div class="grid3">'+metric("你的历史名次",b.rank?"第"+b.rank+"名":"未入围")+metric("历史票分",b.playerPoints||0)+metric("已保留记录",b.ballots?.length||0)+'</div></div>':
  '<p class="muted">完成本赛季后公布30位候选人物及100名记者投票结果。</p>';
 const official='<details class="item gap"><summary><strong>2026年现实金球奖 · 凯恩1055分</strong></summary>'+
  '<p class="muted small">以下为法国足球公布的2026年现实评选结果，不计入本职业生涯奖杯数。</p>'+
  '<div class="list">'+history.map((x,i)=>'<div class="item row"><strong>'+(i+1)+'. '+E(x[0])+'</strong><b>'+x[1]+'分</b></div>').join('')+'</div></details>';
 return '<section class="card"><div class="cap">BALLON D’OR · FRANCE FOOTBALL RULES</div><h2>金球奖 · 30人候选与100名记者</h2>'+
 '<p class="muted">每位记者选10人，计分15、12、10、8、7、5、4、3、2、1。每人理论最高1500分，全体合计6700分；同分按第一名选票数依次判定。游戏赛季的获奖者和票分由比赛结果决定，并非现实颁奖。</p>'+
 (all.length?'<div class="flex gap">'+buttons+'</div>':'')+panel+official+careerHonorsPanel()+'</section>'
}

function exportBallotCsv(){
 const all=g?.ballonHistory||[],idx=Number.isInteger(g.awardViewIndex)?g.awardViewIndex:all.length-1,b=all[idx];
 if(!b)return notify("本届还没有记者评分");if(b.model<5)return notify("旧版候选人姓名未经核验，不提供该届名单导出");
 const name=Object.fromEntries(b.rankings.map(n=>[n.id,n.name]));
 const quote=x=>'"'+String(x??"").replace(/"/g,'""')+'"';
 const header=["记者","第1名","第2名","第3名","第4名","第5名","第6名","第7名","第8名","第9名","第10名"];
 const lines=[header.map(quote).join(",")];
 b.ballots.forEach((vote,i)=>lines.push([i+1,...vote.map(id=>name[id]||id)].map(quote).join(",")));
 const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="绿茵世代_金球奖百人投票_"+b.year+".csv";document.body.appendChild(a);a.click();
 setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},1200)
}

function reviewPage(){if(g.mode==="coach")return coachReviewPage();const r=g.lastReview;return '<div class="hero"><div><div class="cap">SEASON COMPLETE · '+g.year+'</div><h1>赛季结束<br><span class="gold">成绩与荣誉</span></h1><p>联赛第 '+r.rank+' 名 · '+r.goals+' 球 · '+r.assists+' 助 · 场均评分 '+r.avg+'</p><div class="flex"><button class="button goldbtn" data-action="nextSeason">进入下一赛季</button><button class="button" data-page="transfer">处理转会报价</button><button class="button" data-page="awards">查看金球奖</button></div></div></div><div class="grid2 gap"><section class="card"><h2>本赛季荣誉</h2>'+(g.honors.filter(x=>x.year===g.year&&x.generation===g.generation).map(x=>badge(x.name)).join('')||'<p class="muted">本赛季暂无冠军。</p>')+'</section><section class="card"><h2>下一步</h2><p>本赛季进攻考核：进球目标 '+(r.performance?.goalsTarget??"—")+' / 助攻目标 '+(r.performance?.assistsTarget??"—")+'；'+E(r.performance?.comment||"尚未评估")+'。连续不达标 '+(r.performance?.poorStreak||0)+' 季。'+(r.performance?.forcedMove?" 已触发降档选择，可留队。":"")+'.</p><button class="button primary" data-action="nextSeason">继续职业生涯</button></section></div>'}
function reportPage(){
 const m=g.lastMatch;if(!m)return '<section class="card"><h2>暂无比赛报告</h2><p class="muted">选择一场比赛开始赛季推演后即可解锁。</p></section>';
 const p=g.player,our=m.home===(g.mode==="coach"?g.coach.club:p.club)||m.kind==="national"&&m.home===p.country;
 const ours=our?m.hs:m.as,opp=our?m.as:m.hs;
 return '<section class="card"><div class="row"><div class="cap">POST MATCH · 比赛报告</div><span class="chip">'+E(m.date||"")+' · '+E(m.competition||DB[p.leagueId].name)+'</span></div>'+
 '<div class="scoreboard"><div class="inside"><div class="cap">'+(m.real?"已核实结果":"游戏赛季结果 · 已完赛")+'</div><div class="club-match">'+clubShield(m.home)+'<span class="match-club-name">'+E(m.home)+'</span><span class="gold match-vs">'+m.hs+' : '+m.as+'</span><span class="match-club-name">'+E(m.away)+'</span>'+clubShield(m.away)+'</div><p class="muted small">'+E(m.stage||"正式比赛")+'</p></div></div>'+
 '<div class="grid4 gap">'+metric("本场评分",m.coach?"教练执教":m.played?m.rating+"/10":"未上场")+metric("个人进球",m.coach?"—":m.goals||0)+metric("个人助攻",m.coach?"—":m.assists||0)+metric("比赛结果",ours>opp?"获胜":ours<opp?"落败":"战平")+'</div>'+
 (m.bodyContests?.attempts?'<section class="card gap"><h2>场上身体技术对抗 · 游戏模拟</h2><p class="muted small">'+
 Object.values(m.bodyContests.byType||{}).map(e=>E(e.label)+'：'+e.wins+'/'+e.attempts).join(' · ')+
 '</p><p class="muted small">根据身高、体重和位置生成的简化场上事件；不是现实球员比赛统计。</p></section>':'')+
 '<section class="card gap"><h2>赛后状态</h2>'+(m.coach?'<p class="muted">本场以主教练身份执教。</p>':'<p>出场：'+(m.played?'是':'否')+' · 伤停剩余：'+(m.injury||0)+' 场 · 停赛剩余：'+(m.suspension||0)+' 场</p>'+(m.played&&m.yellowCards!==undefined?'<p>本场纪律：'+(m.redCard==="second-yellow"?"两黄变一红":m.redCard==="direct"?"直接红牌":m.yellowCards===1?"黄牌1张":"无牌")+'</p>':""))+'</section>'+
 '<div class="flex gap"><button class="button primary" data-action="nextMatch" '+(g.season.stage!=="playing"?"disabled":"")+'>下一场比赛</button><button class="button" data-page="calendar">查看全年赛历</button><button class="button goldbtn" data-action="simSeason" '+(g.season.stage!=="playing"?"disabled":"")+'>一键完成剩余赛季</button></div></section>'
}

function matchPage(){let ev=g.live?.event||currentEvent();if(!ev)return dashboard();let opp=ev.home&&ev.away?ev.home+" vs "+ev.away:g.player.club+" vs "+(ev.kind==="national"?"国家队对手":"杯赛对手");return '<div class="card"><div class="row"><div><div class="cap">MATCH CENTER · '+E(ev.date)+'</div><h2>'+E(ev.competition||(ev.kind==="league"?DB[g.player.leagueId].name:"正式比赛"))+'</h2></div><span class="chip">'+E(ev.stage||"对决")+'</span></div><div class="scoreboard"><div class="inside"><div class="vs">'+E(opp)+'</div><div class="muted">策略影响进球机会与个人表现；球员未出场时按均衡策略推演。</div></div></div><h3 class="gap">选择比赛策略</h3><div class="grid2"><button class="button" data-action="play" data-choice="balanced">均衡比赛 · 稳健发挥</button><button class="button primary" data-action="play" data-choice="attack">积极进攻 · 增加进球机会，也增加失球风险</button><button class="button" data-action="play" data-choice="creative">创造机会 · 提高进攻优势，争取助攻</button><button class="button" data-action="play" data-choice="defend">稳守反击 · 减少对手机会，己方进球也更难</button></div><div class="flex gap"><button class="button goldbtn" data-action="simSeason">从这里一键完成剩余赛季</button></div></div>'}
let incompatibleLegacySave="";
const INCOMPATIBLE_ARCHIVE=STORE+"-incompatible-archive";
function archiveIncompatibleSave(){
 if(!incompatibleLegacySave)return;
 try{
  const raw=localStorage.getItem(STORE);
  if(!raw)return notify("无法找到原始存档");
  if(localStorage.getItem(INCOMPATIBLE_ARCHIVE))return notify("已有一份不兼容旧档备份。为避免覆盖，请先导出已备份的旧档");
  localStorage.setItem(INCOMPATIBLE_ARCHIVE,raw);
  if(localStorage.getItem(INCOMPATIBLE_ARCHIVE)!==raw)throw Error("backup mismatch");
  incompatibleLegacySave="";render();notify("旧存档完整保存在单独的旧版备份中，可导出，现可开始新游戏");
 }catch(e){notify("备份失败。原始存档未被删除，请先导出 JSON 文件")}
}
function startPage(){
 if(V10&&V10UI){
  const legacy=incompatibleLegacySave?'<section class="card gap"><h2>旧版存档需要先备份</h2><p>'+E(incompatibleLegacySave)+'</p><button class="button" data-action="exportIncompatible">导出原始旧档 JSON</button><button class="button" data-action="archiveIncompatible">先备份旧档，再开始</button></section>':'';
  return V10UI.render({core:V10,people:V10.catalog(window.FOOTBALL_AWARD_REAL_PEOPLE),
    players:v10Persons,leagues:openingLeagues,countries:v10Countries,heights:v10Heights,
    positions:openingPositions,philosophies:v10Philosophies,operations:v10Operations,
    step:v10Step,clubs:openingDecks,drawn:drawnClubs,gameLeagues:DB,positionLabels:POS,
    development:id=>openingDevelopmentPanel(id),openingCards:id=>openingCardPanel(id),legacyHtml:legacy})+
    legacyArchiveButtons();
 }
 const current=DUO_IDS.find(id=>!drawnClubs[id]);
 const names=DUO_IDS.map(id=>'<label class="field">'+(id==="wang"?"球员一":"球员二")+' <input data-duo-name="'+id+'" maxlength="22" value="'+E(duoDraft[id])+'" '+(drawnClubs[id]?'disabled':'')+'></label>').join("");
 const summary=DUO_IDS.map(id=>'<span class="chip">'+E(duoDraft[id])+" · "+E(DB[openingLeagues[id]].name)+(drawnClubs[id]?" · 已抽中 "+E(drawnClubs[id]):" · 待抽卡")+'</span>').join("");
 return '<div class="hero opening-hero"><div><div class="cap">ONE SHARED FOOTBALL WORLD</div><h1>双星同场 · 青训起航</h1><p>两人分别选择联赛，亲手翻开球队卡。</p></div></div>'+
 (incompatibleLegacySave?'<section class="card gap"><h2>旧版存档需要手动处理</h2><p class="muted">'+E(incompatibleLegacySave)+'。原始存档仍留在本设备。</p><div class="flex"><button class="button" data-action="exportIncompatible">导出原始存档 JSON</button><button class="button goldbtn" data-action="archiveIncompatible">先备份旧档，再开始</button></div></section>':'')+
 '<section class="card gap"><h2>两名球员</h2><div class="opening-names">'+names+'</div><div class="flex">'+summary+'</div></section>'+
 creatorModeChooser()+
 (current?'<div class="gap">'+openingCardPanel(current)+'</div>':'<section class="card gap"><h2>两人球队已选好</h2><p>青年与成年比赛数据分别保存。</p><button class="button primary" data-action="preset">生成球员，开启双人生涯</button></section>')+legacyArchiveButtons();
}
const SAFETY_STORE=STORE+"-safety";
const LEGACY_ARCHIVES=[
 {key:LEGACY_STORE,label:"旧版单人生涯",format:"football-dynasty-v4"},
 {key:LEGACY_STORE+"-safety",label:"旧版单人保险备份",format:"football-dynasty-v4"},
 {key:"football-dynasty-duo-v1-20261110",label:"旧版双人生涯",format:"football-dynasty-duo-v1"},
 {key:"football-dynasty-duo-v1-20261110-safety",label:"旧版双人保险备份",format:"football-dynasty-duo-v1"},
 {key:INCOMPATIBLE_ARCHIVE,label:"不兼容旧版双人生涯备份",format:"football-dynasty-duo-v2"},
 {key:STORE,label:"待迁移旧版双人生涯",format:"football-dynasty-duo-v2",onlyIncompatible:true},
 {key:STORE,label:"自动退役前原始存档",format:"football-dynasty-duo-v2",onlyAgeBlocked:true}
];
function legacyArchives(){
 const entries=LEGACY_ARCHIVES.slice();
 for(let i=0;i<(localStorage.length||0);i++){
  const key=localStorage.key(i);
  if(key?.startsWith(STORE+"-before-auto-retirement"))entries.push({key,label:"自动退役前备份 "+(i+1),format:"football-dynasty-duo-v2"});
 }
 return entries;
}
function legacyArchiveButtons(){
 let found=[];try{found=legacyArchives().filter(x=>(!x.onlyIncompatible||incompatibleLegacySave)&&(!x.onlyAgeBlocked||ageMigrationBlocked)&&localStorage.getItem(x.key)!=null)}catch(e){return ""}
 if(!found.length)return "";
 return '<section class="card gap"><h2>旧版存档</h2><p class="muted small">旧档保留在本设备，不自动转换；请导出备份。</p><div class="flex">'+found.map((x,i)=>'<button class="button" data-action="exportLegacy" data-key="'+E(x.key)+'">导出'+E(x.label)+'</button>').join("")+'</div></section>';
}
function exportLegacy(key){
 const entry=legacyArchives().find(x=>x.key===key);if(!entry){notify("找不到旧存档");return}
 try{
  const raw=localStorage.getItem(key);if(raw==null){notify("找不到旧存档");return}
  const data=JSON.parse(raw),blob=new Blob([JSON.stringify({format:entry.format,save:data},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=entry.label+".json";document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},800);
 }catch(e){notify("旧存档无法读取，请勿清理浏览器数据")}
}
function createSafetyBackup(){try{if(!duoGames)return;localStorage.setItem(SAFETY_STORE,JSON.stringify(duoPayload()));notify("已保存精简版双人生涯保险备份");render()}catch(e){notify("本机空间不足，建议直接导出 JSON 存档")}}
function restoreSafetyBackup(){try{const raw=localStorage.getItem(SAFETY_STORE);if(!raw){notify("还没有保险备份");return}const backup=JSON.parse(raw);if(backup.version!==2||!backup.duoGames?.wang||!backup.duoGames?.vini)throw Error("invalid");if(!confirm("恢复双人生涯保险备份会覆盖当前进度。确定？"))return;hydratePayload(backup);page="dashboard";save();render();if(!ageMigrationBlocked)notify("已恢复双人生涯保险备份")}catch(e){notify("备份无法读取，请使用导出的双人生涯 JSON 存档")}}
function savePage(){return '<div class="card"><h2>双人生涯存档中心</h2><p>王楚淇与维尼修斯的比赛、伤停、成长和转会独立存储在同一份新档案里。旧版档案不会自动转换或删除。</p><div class="flex"><button class="button primary" data-action="export">导出双人生涯 JSON</button><button class="button" data-action="import">导入双人生涯 JSON</button><button class="button" data-action="backup">创建双人保险备份</button><button class="button" data-action="restoreBackup">恢复保险备份</button><button class="button danger" data-action="newGame">删除当前双人存档并重新开局</button></div><p class="muted small gap">浏览器存档和保险备份都保存在当前设备。定期导出 JSON 才能在清理浏览器数据时继续使用。</p></div>'+legacyArchiveButtons()}

function duoTop(){
 if(!duoGames)return "";
 return (ageMigrationBlocked?'<section class="card"><p class="gold">退役前旧存档无法备份，原档仍保留，当前进度无法保存。</p><button class="button" data-page="save">前往存档中心</button></section>':'')+
 '<section class="duo-overview"><div class="duo-overview-title"><b>双人职业生涯</b><span class="muted small">'+duoGames.wang.year+' 赛季</span></div><div class="duo-overview-players">'+DUO_IDS.map(id=>{
 const x=duoGames[id],p=x.player,v=x.season;
 return '<details class="duo-compact"><summary><b>'+E(p.name)+'</b> · '+p.age+'岁 · '+E(p.club)+'<br><span class="muted small">'+(p.retired?'已退役':v.goals+'球 '+v.assists+'助 · 综合 '+overall(p))+'</span></summary>'+
 '<p class="muted small">'+E(DB[p.leagueId]?.name||p.leagueId)+' · 出场 '+v.apps+' · 伤停 '+(p.injuryMatches||0)+'场 · 联赛黄牌 '+(p.discipline?.league?.yellow??p.yellowCards??0)+' · 红牌 '+(p.redCards||0)+' · 停赛 '+(p.discipline?.league?.ban??p.suspension??0)+'场</p>'+
 (p.agingImpact&&!p.retired?'<p class="muted small">本赛季年龄影响：速度 -'+p.agingImpact.pace+' · 身体 -'+p.agingImpact.physical+(p.agingImpact.dribble?' · 盘带 -'+p.agingImpact.dribble:'')+'</p>':'')+
 (p.retired?'<p class="gold">已'+(p.retiredAt?.automatic?'年满40岁自动':'自主')+'退役 · '+p.retiredAt?.year+'赛季（'+p.retiredAt?.age+'岁）</p>':'<button class="button outline" data-action="retirePlayer" data-id="'+id+'">让'+E(p.name)+'自主退役</button>')+'</details>';
 }).join("")+'</div></section>';
}
function duoLatestMatch(x){
 const m=(x.season.results||[]).at(-1),next=x.season.stage==="playing"?x.season.events[x.season.index]:null;
 const nextText=next?'<p class="muted small">下一场：'+E(next.home||x.player.club)+' vs '+E(next.away||'待定')+'</p>':'';
 if(!m)return '<p class="muted small">本赛季尚无比赛</p>'+nextText;
 const score=E(m.home||x.player.club)+' '+(Number.isFinite(m.hs)?m.hs:'–')+' : '+(Number.isFinite(m.as)?m.as:'–')+' '+E(m.away||'待定');
 const highlights=[];
 if(m.yellowCards)highlights.push('黄牌 '+m.yellowCards+' 张');
 if(m.redCard)highlights.push('红牌'+(m.redMinute?' · 第 '+m.redMinute+' 分钟':''));
 if(m.newInjury)highlights.push('受伤 · 预计缺阵 '+m.newInjury+' 场');
 const bodyNote=m.bodyContests?.attempts?Object.values(m.bodyContests.byType||{}).map(e=>E(e.label)+' '+e.wins+'/'+e.attempts).join(' · '):"";
 return '<p>'+score+'</p><p class="muted small">'+(m.played?(m.goals||0)+'球 '+(m.assists||0)+'助 · 评分 '+(m.rating??'–'):'未出场')+'</p>'+(highlights.length?'<p class="pink small">'+highlights.map(E).join(' · ')+'</p>':'')+
 (bodyNote?'<p class="muted small">体格对抗（简化模拟）：'+bodyNote+'</p>':'')+nextText;
}
// A finished season may already have a new club selected for next year.
// Use the recorded season club when available, never infer a past teammate
// from the current club after a transfer.
function storySeasonClub(x){
 if(x.season?.stage==="playing")return x.player?.club||null;
 const record=(x.history||[]).findLast(h=>h.year===x.year&&(!h.generation||h.generation===x.generation));
 if(record?.club)return record.club;
 if(x.retirementSummary?.partialSeason?.year===x.year)return x.retirementSummary?.at?.club||null;
 return null;
}
function duoSharedStory(a,b){
 if(!a||!b||a.year!==b.year)return "";
 const clubA=storySeasonClub(a),clubB=storySeasonClub(b);
 if(!clubA||!clubB)return "";
 const other=b.season?.results||[],matches=a.season?.results||[];
 for(let i=matches.length-1;i>=0;i--){
  const m=matches[i];
  if(!m.played||!["league","cup","europe","europeKO","national"].includes(m.kind)||!m.date||!m.home||!m.away||!Number.isFinite(m.hs)||!Number.isFinite(m.as))continue;
  const n=other.findLast(t=>t.played&&t.kind===m.kind&&t.date===m.date&&t.competition===m.competition&&t.stage===m.stage&&t.home===m.home&&t.away===m.away&&t.hs===m.hs&&t.as===m.as);
  const sideA=m.kind==="national"?a.player.country:clubA,sideB=m.kind==="national"?b.player.country:clubB;
  if(!n||![m.home,m.away].includes(sideA)||![m.home,m.away].includes(sideB))continue;
  const same=sideA===sideB;
  const val=x=>Number.isFinite(x)?String(x):"—";
  const player=(x,r)=>E(x.player.name)+" "+val(r.goals)+"球 "+val(r.assists)+"助";
  return '<section class="card gap"><h2>'+(m.kind==="national"?(same?'国家队携手':'国家队交锋'):(same?'双人同队':'双人交锋'))+'</h2><p class="muted small">本赛季共同出场 · '+E(m.date)+' · '+E(m.competition||"比赛")+'</p><p><b>'+E(m.home)+' '+m.hs+' : '+m.as+' '+E(m.away)+'</b></p><p>'+player(a,m)+'　｜　'+player(b,n)+'</p></section>';
 }
 return "";
}
function duoSeasonComparison(a,b){
 if(!a||!b||a.year!==b.year||a.player?.retired||b.player?.retired)return "";
 const sa=a.season,sb=b.season;
 if(sa?.stage!=="review"||sb?.stage!=="review"||![sa.goals,sa.assists,sb.goals,sb.assists].every(Number.isFinite))return "";
 return '<p class="muted small gap">两人本季对比（各项比赛）：进球 '+E(a.player.name)+' '+sa.goals+' : '+sb.goals+' '+E(b.player.name)+' · 助攻 '+sa.assists+' : '+sb.assists+'</p>';
}

/* Quick-play preference lives outside the career save, avoiding migration. */
const CAREER_PACE_KEY="football-dynasty-career-pace-v1";
let careerPace="season";
try{const storedPace=localStorage.getItem(CAREER_PACE_KEY);if(["day","week","season"].includes(storedPace))careerPace=storedPace}catch(e){}
function quickCareerAdvance(){
 if(!duoGames||DUO_IDS.every(id=>duoGames[id].player.retired))return;
 const allReview=DUO_IDS.every(id=>duoGames[id].player.retired||duoGames[id].season.stage==="review");
 if(allReview){notify("请先完成赛季转会决定");return}
 if(careerPace==="day")sharedAdvanceDates(1);
 else if(careerPace==="week")sharedAdvanceDates(7);
 else sharedAdvanceDates(400);
}

function verifiedDuoFixtures(a,b){
 if(!a||!b||a.year!==b.year)return [];
 const aClub=storySeasonClub(a),bClub=storySeasonClub(b);
 if(!aClub||!bClub)return [];
 const other=b.season?.results||[],matches=a.season?.results||[],seen=new Set(),out=[];
 for(const m of matches){
  if(!m.played||!["league","cup","europe","europeKO","national"].includes(m.kind)||!m.date||!m.home||!m.away||!Number.isFinite(m.hs)||!Number.isFinite(m.as))continue;
  const key=[m.kind,m.date,m.competition||"",m.stage||"",m.home,m.away,m.hs,m.as].join("|");
  if(seen.has(key))continue;
  const n=other.find(t=>t.played&&t.kind===m.kind&&t.date===m.date&&t.competition===m.competition&&t.stage===m.stage&&t.home===m.home&&t.away===m.away&&t.hs===m.hs&&t.as===m.as);
  const sideA=m.kind==="national"?a.player.country:aClub,sideB=m.kind==="national"?b.player.country:bClub;
  if(!n||![m.home,m.away].includes(sideA)||![m.home,m.away].includes(sideB))continue;
  seen.add(key);out.push({m,n,sideA,sideB});
 }
 return out;
}
function duoMatchArchive(a,b){
 const fixtures=verifiedDuoFixtures(a,b);
 if(!fixtures.length)return "";
 let aWins=0,bWins=0,draws=0,teammates=0;
 for(const {m,sideA,sideB} of fixtures){
  if(sideA===sideB){teammates++;continue}
  if(m.hs===m.as){draws++;continue}
  const winner=m.hs>m.as?m.home:m.away;
  if(winner===sideA)aWins++;else if(winner===sideB)bWins++;
 }
 const line=fixtures.slice(-4).reverse().map(({m,n,sideA,sideB})=>
  '<div class="news-line"><span class="muted small">'+E(m.date)+' · '+E(m.competition||"比赛")+'</span><b>'+E(m.home)+' '+m.hs+' : '+m.as+' '+E(m.away)+'</b><span class="muted small">'+E(a.player.name)+' '+(Number.isFinite(m.goals)?m.goals:"—")+'球 · '+E(b.player.name)+' '+(Number.isFinite(n.goals)?n.goals:"—")+'球'+(sideA===sideB?' · 同队':' · 交锋')+'</span></div>').join("");
 return '<details class="card gap duo-ledger"><summary><b>本赛季双星交集 · '+fixtures.length+'场</b> <small class="muted">点击展开真实赛程</small></summary><p class="muted small gap">交锋 '+E(a.player.name)+' '+aWins+'胜 · '+draws+'平 · '+E(b.player.name)+' '+bWins+'胜；同队赛程 '+teammates+'场。仅统计双方赛果完全匹配的比赛。</p><div class="news-list">'+line+'</div></details>';
}
function duoNewsFeed(){
 if(!duoGames)return "";
 const entries=[];
 for(const id of DUO_IDS){
  const x=duoGames[id],p=x.player;
  for(const m of (x.season?.results||[]).slice(-3)){
   if(!m.played||!m.date||!m.home||!m.away||!Number.isFinite(m.hs)||!Number.isFinite(m.as))continue;
   const contribution=Number.isFinite(m.goals)&&Number.isFinite(m.assists)?' · '+m.goals+'球'+m.assists+'助':'';
   entries.push({key:String(m.date),tone:m.redCard||m.newInjury?"alert":"match",title:p.name+" · "+(m.competition||"最新比赛"),body:m.home+" "+m.hs+" : "+m.as+" "+m.away+contribution});
   if(m.newInjury)entries.push({key:String(m.date)+"z",tone:"alert",title:p.name+" · 伤停通报",body:"比赛记录显示受伤，预计缺阵 "+m.newInjury+" 场"});
  }
  const transfer=(p.transferHistory||[]).at(-1);
  if(transfer&&Number(transfer.year)===x.year)entries.push({key:String(x.year)+"-13",tone:"transfer",title:p.name+" · 转会动态",body:transfer.from+" → "+transfer.to+" · "+(transfer.reason||"转会")});
  if(x.season?.stage==="review")entries.push({key:String(x.year)+"-12",tone:"season",title:p.name+" · 年度战报",body:x.season.apps+"场 "+x.season.goals+"球 "+x.season.assists+"助；赛季已结算"});
 }
 const awards=sharedUniverse?.awards||{},currentYear=duoGames.wang.year;
 const award=awards[currentYear];
 if(award?.winner?.name)entries.push({key:String(currentYear)+"-14",tone:"season",title:"年度金球奖",body:award.winner.name+"获得本届金球奖 · "+(award.winner.points??"—")+"分"});
 entries.sort((a,b)=>b.key.localeCompare(a.key));
 const shown=entries.slice(0,5);
 return '<section class="card gap news-feed"><div class="row"><h2>绿茵快讯</h2><span class="chip">依据实际存档</span></div>'+
 (shown.length?'<div class="news-list">'+shown.map(item=>'<article class="news-line news-'+E(item.tone)+'"><span class="cap">'+E(item.key.slice(0,10))+'</span><b>'+E(item.title)+'</b><p class="muted small">'+E(item.body)+'</p></article>').join("")+'</div>':'<p class="muted small">开赛后自动生成比分、伤停、转会和年度新闻，无需手动操作。</p>')+
 '<p class="muted small gap">新闻仅根据已保存比赛与事件生成，不接入实时媒体。</p></section>';
}


function hiddenPotentialText(x){
 if(FS&&x?.player?.freeStarHidden)return FS.potentialReport(x.player,(x.history||[]).length);
 return "原有球员模板";
}
function creatorPortrait(p){return FS&&p?.freeStar?'<span class="creator-inline-avatar">'+FS.avatar(p.freeStar)+'</span>':""}
function careerDepthOverview(){
 if(!CD||!duoGames)return "";
 return '<section class="grid2 gap career-depth-overview">'+DUO_IDS.map(id=>{
  const x=duoGames[id],p=x.player,tier=p.youth?0:transferLevel(p.leagueId,p.club);
  const value=CD.money(CD.marketValue(p,overall(p),tier,x.season)),trait=CD.traitInfo(p);
  const targets=CD.objectiveTargets(p,x.year,tier,x.season),complete=targets.filter(item=>item.done).length;
  const lineup=CD.lineup(p,overall(p),power(p.club),()=>.5);
  return '<div class="card depth-player-card"><div class="row"><div class="depth-identity">'+creatorPortrait(p)+'<h2>'+E(p.name)+' · '+E(CD.ROLE_NAMES[p.position]||p.position)+'</h2></div><span class="chip">'+(p.retired?'已退役':E(trait.label))+'</span></div>'+
 '<p class="muted small">'+(p.freeStar?E(p.country)+' · '+p.heightCm+'cm · '+E(FS.GENDER[p.gender]||"自定义")+' · '+E(hiddenPotentialText(x)):"经典预设球员")+'</p>'+
 (BP?'<div class="body-detail-summary"><p class="muted small"><b>生涯路线：</b>'+E(BP.PATHS[BP.sanitizedPath(p.careerPath)].name)+' · '+(Number.isFinite(p.heightCm)&&Number.isFinite(p.weightKg)?p.heightCm+'cm / '+p.weightKg+'kg':'旧档体格数据未完整记录')+'</p>'+
 (Number.isFinite(p.heightCm)&&Number.isFinite(p.weightKg)?'<div class="body-effects">'+Object.entries(BP.label(p)).map(([key,val])=>'<span>'+E(({aerial:"空中",duel:"对抗",agility:"灵活",endurance:"体能"})[key])+' '+E(val)+'</span>').join("")+'</div>':'')+'</div>':'')+
    '<div class="grid2 depth-metrics"><div><span class="muted small">游戏估算身价</span><strong class="gold depth-number">'+(p.retired?'退役':value)+'</strong></div><div><span class="muted small">首发竞争</span><strong class="depth-number">'+(p.retired?'已结束':Math.round(lineup.starterChance*100)+'%')+'</strong></div></div>'+
    (p.retired?'<p class="muted small">查看履历了解完整生涯。</p>':
    '<div class="depth-goals"><b>本季目标 · '+complete+'/'+targets.length+'完成</b>'+targets.map(t=>'<div class="depth-goal"><span>'+E(t.label)+'</span><span>'+t.value+' / '+t.target+(t.done?' ✓':'')+'</span></div>').join("")+'</div>')+
    (p.positionTarget?'<p class="muted small">位置改造：'+E(CD.ROLE_NAMES[p.positionTarget])+' · '+(p.positionProgress||0)+'/9场</p>':'')+
    '<p class="muted small">游戏模型估值与首发概率，非真实身价或球队名单。</p></div>';
 }).join("")+'</section>';
}
function careerDepthDetails(id){
 const x=duoGames?.[id];if(!CD||!x)return "";
 const p=x.player,trait=CD.traitInfo(p),current=CD.positionOptions(p.position);
 const values=(p.marketValueHistory||[]).slice(-7);
 const peak=Math.max(1,...values.map(v=>v.value||0));
 const market=values.length?'<div class="depth-value-history">'+values.map(v=>'<div class="depth-value-row"><span>'+E(v.year)+'</span><span class="meter"><span style="width:'+Math.round((v.value||0)/peak*100)+'%"></span></span><b>'+E(CD.money(v.value))+'</b></div>').join("")+'</div>':'<p class="muted small">完成本赛季后开始保存年度身价记录。</p>';
 return '<details class="item gap depth-detail"><summary>位置、技术特质与身价走势</summary><p class="gold gap"><b>'+E(trait.label)+'</b></p><p class="muted small">'+E(trait.detail)+'</p>'+
  (p.retired?'<p class="muted small">已退役，无法改造位置。</p>':
  '<label class="field">位置改造（可选，默认维持当前位置）<select data-position-target="'+id+'">'+current.map(pos=>'<option value="'+E(pos)+'" '+((p.positionTarget||p.position)===pos?'selected':'')+'>'+E(CD.ROLE_NAMES[pos])+(pos===p.position?'（当前）':'')+'</option>').join("")+'</select></label><p class="muted small">'+(p.positionTarget?'已完成 '+(p.positionProgress||0)+'/9 场；每次实际出场积累改造进度。':'选择其他位置后自动训练9次实际出场，不增加额外操作。')+'</p>')+
  '<p class="muted small">累计首发 '+(p.lineupCareer?.starts||0)+'场 · 替补出场 '+(p.lineupCareer?.substitutes||0)+'场</p>'+
 (BP?'<p class="muted small">开局生涯路线：'+E(BP.PATHS[BP.sanitizedPath(p.careerPath)].name)+'。该路线只影响训练与出场概率，不保证上场或能力提升。</p>':'')+
  '<h3>历年身价（游戏估算）</h3>'+market+
  '<h3 class="gap">历史赛季目标</h3><div class="list">'+((p.goalHistory||[]).slice(-7).reverse().map(h=>'<p class="muted small">'+E(h.year)+'赛季 · '+h.completed+'/'+h.total+' 完成</p>').join("")||'<p class="muted small">完成首个赛季后记录。</p>')+'</div></details>';
}

function duoDashboard(){
 const both=DUO_IDS.map(id=>duoGames[id]);
 const retired=both.every(x=>x.player.retired);
 const allReview=both.every(x=>x.player.retired||x.season.stage==="review");
 const missing=allReview&&!retired?missingPromotionDraws():[];
 const date=nextSharedDate();
 const action=retired?'<button class="button" data-page="career">查看生涯总结</button>':
  allReview?(missing.length?'<button class="button primary" data-page="transfer">处理转会决定</button>':'<button class="button primary" data-action="nextSeason">进入下一赛季</button>'):
  '<button class="button primary career-main-action" data-action="quickCareerAdvance">'+({day:"推进下一比赛日",week:"快进7个比赛日",season:"模拟剩余赛季"}[careerPace])+'</button><label class="pace-picker">节奏 <select data-career-pace="1" aria-label="生涯推进节奏">'+[["season","整个赛季"],["week","7个比赛日"],["day","下个比赛日"]].map(([v,title])=>'<option value="'+v+'" '+(careerPace===v?"selected":"")+'>'+title+'</option>').join("")+'</select></label>';
 const summary=allReview&&!retired?'<section class="card gap"><h2>赛季总结</h2>'+DUO_IDS.map(id=>{const x=duoGames[id];return '<div class="item"><b>'+E(x.player.name)+'</b> · '+E(x.player.club)+' · '+x.season.apps+'场 '+x.season.goals+'球 '+x.season.assists+'助<br><span class="muted small">'+E(x.lastReview?.performance?.comment||"已结算")+'</span></div>'}).join("")+duoSeasonComparison(both[0],both[1])+'</section>':'';
 return '<div class="hero career-hero hero-match"><div><div class="cap">ONE WORLD · TWO PLAYERS</div><h1>双星同步职业生涯</h1><p>'+(retired?'两人均已退役，可以查看完整履历。':allReview?'本赛季已结束，处理决定后进入下一季。':'下个比赛日：'+E(date||'待定'))+'</p><div class="flex">'+action+'</div></div></div>'+summary+careerDepthOverview()+duoSharedStory(both[0],both[1])+duoMatchArchive(both[0],both[1])+duoNewsFeed()+
 '<section class="card gap"><h2>最近比赛</h2><div class="grid2">'+DUO_IDS.map(id=>'<div class="item"><b>'+E(duoGames[id].player.name)+'</b>'+duoLatestMatch(duoGames[id])+'</div>').join("")+'</div></section>';
}
function duoWorldPage(){
 const id=DB[g.worldFocus]?g.worldFocus:duoGames.wang.player.leagueId,l=DB[id],year=duoGames.wang.year;
 const peer=DUO_IDS.map(who=>duoGames[who]).find(x=>!x.player.retired&&x.player.leagueId===id);
 const table=peer?.season.leagueTable||duoGames.wang.season.world?.[id]?.table;
 const academy=!!peer?.player.youth,names=new Set(l.teams.map(t=>t.name)),npcs=academy?[]:duoGames.wang.npcs.filter(n=>names.has(n.club)&&n.pos!=="GK");
 const players=npcs.map(n=>({id:n.id,name:n.name,club:n.club,goals:n.goals||0,assists:n.assists||0}));
 for(const who of DUO_IDS){const x=duoGames[who];if(!x.player.retired&&x.player.leagueId===id&&!!x.player.youth===academy)players.push({id:who,name:x.player.name,club:x.player.club,goals:x.season.leagueGoals||0,assists:x.season.leagueAssists||0})}
 const score=(key,other)=>players.slice().sort((a,b)=>b[key]-a[key]||b[other]-a[other]).slice(0,20).map((p,i)=>'<div class="item row '+(DUO_IDS.includes(p.id)?"mine":"")+'"><span><b>'+(i+1)+'. '+E(p.name)+'</b><br><small class="muted">'+E(p.club)+'</small></span><strong>'+p[key]+'</strong></div>').join("");
 return '<section class="card"><h2>统一世界足球中心 · '+year+'</h2><label class="field">选择联赛<select data-world-league="1">'+Object.entries(DB).map(([key,val])=>'<option value="'+key+'" '+(id===key?"selected":"")+'>'+E(val.name)+'</option>').join("")+'</select></label><h3 class="gap">'+E(l.name)+(academy?'青训':'')+' · 唯一积分榜</h3>'+tablePanel(table,l.teams.length)+'</section><div class="grid2 gap"><section class="card"><h2>'+(academy?"双主角进球对比":"统一射手榜")+'</h2>'+(academy?'<p class="muted small">仅显示两名主角，不是全部青训球员排名。</p>':"")+score("goals","assists")+'</section><section class="card"><h2>'+(academy?"双主角助攻对比":"统一助攻榜")+'</h2>'+score("assists","goals")+'</section></div>';
}
function transferCriteria(p,n,level){
 const gate=TRANSFER_GATES[level];if(!gate||p.youth)return "";
 const attack=["ST","LW","RW","CAM"].includes(p.position);
 const ratingStandard=[6.98,7.00,7.04,7.10,7.18][level]??7.2;
 const rating=Math.max(gate.avg+(attack?0:.22),ratingStandard).toFixed(2);
 const apps=Math.max(15,gate.apps);
 let detail;
 if(attack){
  const creator=p.position==="CAM",g=creator?Math.max(2,gate.g-3):gate.g,sum=creator?Math.max(5,gate.sum-2):gate.sum;
  const threshold=[16,18,20,23,25][level]??25,divisor=p.position==="CAM"?.90:p.position==="ST"?1.12:1;
  const output=Math.ceil(threshold*divisor);
  detail='进球至少 '+g+'、助攻至少 '+gate.a+' 或两项合计至少 '+sum+'；且进球助攻合计至少 '+output+'。';
 }else{
  const known=n.matchesWithScore||0,rate=p.position==="CM"?.20:.28;
  detail='按实际出场比赛中的球队零封考核；当前有效比分 '+known+' 场，需至少 '+Math.max(4,Math.ceil(known*rate))+' 场零封，且有效比分覆盖至少七成出场。';
 }
 const chance=Math.round(([.69,.62,.58,.50,.44][level]??0)*100);
 return '<details class="item"><summary>查看升档条件</summary><p class="muted small">俱乐部赛事出场至少 '+apps+' 场，场均评分至少 '+rating+'，综合能力至少 '+gate.ov+'。'+E(detail)+'满足数据后还需球探评估（游戏概率 '+chance+'%，每赛季固定一次）。</p></details>';
}
function duoTransferPage(){
 const missing=missingPromotionDraws();
 return '<div class="card transfer-hero"><h2>双人转会</h2><p class="muted">两人分别决定去留，升降档球队需亲自抽卡。</p><details class="item"><summary>查看抽卡与转会规则</summary><p class="muted small">达标升级时各自抽10张卡：9张下一档、1张再上一档；只差一级到最高档时10张均为最高档。降档时抽10张目标档球队卡。翻牌结果即时保存，必须处理完成才能进入下赛季。连续两季无冠仅提醒，翻牌后可以接受或留队。</p></details>'+
 (missing.length?'<p class="gold"><b>等待 '+missing.map(id=>E(duoGames[id].player.name)).join("、")+' 完成升降档抽签</b></p>':'')+
 '<div class="flex">'+(DUO_IDS.every(id=>duoGames[id].player.retired||duoGames[id].season.stage==="review")?(missing.length?'':(DUO_IDS.every(id=>duoGames[id].player.retired)?'':'<button class="button primary" data-action="nextSeason">进入下一赛季</button>')):'<button class="button primary" data-action="simBoth">模拟本赛季</button>')+'</div></div>'+
 '<div class="grid2 gap">'+DUO_IDS.map(id=>{
  const x=duoGames[id],p=x.player,r=x.lastReview?.performance||p.transferAssessment,level=transferLevel(p.leagueId,p.club);
  const n=clubSeasonNumbers(x.season,p.club);
  return '<section class="card"><h2>'+E(p.name)+'</h2><p>'+E(p.club)+' · '+E(TRANSFER_LEVELS[level])+'</p>'+
   '<div class="grid3">'+metric("比赛",n.apps)+metric("进球",n.goals)+metric("助攻",n.assists)+'</div>'+
   '<p class="gold gap">'+E(r?.comment||"赛季进行中，尚待考核")+'</p>'+
   '<p class="muted small">连续无冠 '+(p.trophylessStreak||0)+' 季 · 连续表现不佳 '+(p.poorStreak||0)+' 季</p>'+
   promotionDrawCard(id)+transferCriteria(p,n,level)+
   lateralOfferPanel(id)+'</section>';
 }).join("")+'</div><section class="card gap"><h3>六档逐级晋升</h3><p>'+TRANSFER_LEVELS.map((name,i)=>(i+1)+'. '+name).join(" → ")+'</p><p class="muted small">普通升级一档；抽中唯一幸运卡可以跳两档。同档转会不计算晋升。必须通过赛季考核才可参与升级抽卡。</p></section>';
}
function duoAwardsPage(){
 const y=duoGames.wang.year;
 const history=sharedUniverse?.awards||{},years=Object.keys(history).sort((a,b)=>b-a),chosen=history[g.awardWorldYear]||history[years[0]];
 if(!chosen)return '<section class="card"><h2>统一金球奖</h2><p>两人所在世界每年仅举办一次金球奖评选。完成本赛季后可同时查看两名球员、其他球星的统一排名。</p></section>';
 return '<section class="card"><h2>同一届金球奖 · '+(chosen.year+1)+'年</h2><p>获奖者：<b>'+E(chosen.winner.name)+'</b> · '+chosen.winner.points+'分</p><details class="item gap"><summary>v8.0 评奖依据与公平性说明</summary><p class="muted small">当前赛季使用第7代评分模型：进球、助攻、平均评分、个人综合能力、出场、联赛系数及球队实际冠军。冠军加分统一封顶32，之后由100名记者的十人选票产生唯一得主。此机制不承诺主角获奖，旧存档奖项不改写。旧版第6代更重视冠军和综合能力。</p></details><div class="flex">'+years.map(y=>'<button class="button" data-action="sharedAwardYear" data-year="'+y+'">'+(Number(y)+1)+'年</button>').join("")+'</div><div class="list gap">'+chosen.rankings.map((x,i)=>'<div class="item row '+(x.id.startsWith("DUO_")?"mine":"")+'"><span><b>'+(i+1)+'. '+E(x.name)+'</b><br><small class="muted">'+E(x.club)+' · '+x.goals+'球 '+x.assists+'助</small></span><strong>'+x.points+'分</strong></div>').join("")+'</div></section>';
}
function partialRetirementHistory(x){
 const part=x.retirementSummary?.partialSeason,at=x.retirementSummary?.at;
 if(!part||(!part.apps&&!part.results?.length)||x.history.some(h=>h.year===part.year&&h.club===at?.club))return "";
 return '<div class="item">'+E(part.year)+' · '+(x.player.youth?'青训 · ':'')+E(at?.club||x.player.club)+' · '+E(part.apps||0)+'场 '+E(part.goals||0)+'球 '+E(part.assists||0)+'助 · 未完赛季（退役）</div>';
}
function duoHistoryPage(){
 return '<div class="grid2">'+DUO_IDS.map(id=>{const x=duoGames[id],p=x.player;return '<section class="card"><h2>'+E(p.name)+'</h2>'+(p.freeStar?'<div class="creator-history-avatar">'+creatorPortrait(p)+'</div><p class="muted small">'+E(p.country)+' · '+p.age+'岁 · '+p.heightCm+'cm · '+E(hiddenPotentialText(x))+'</p>':'')+trainingFocusPanel(id)+careerDepthDetails(id)+'<div class="grid3">'+metric("一线队进球",p.career.goals)+metric("一线队助攻",p.career.assists)+metric("一线队出场",p.career.apps)+'</div><h3 class="gap">转会历程</h3><div class="list">'+((p.transferHistory||[]).map(t=>'<div class="item">'+t.year+' · '+E(t.from)+' → '+E(t.to)+' · '+E(t.reason)+'</div>').join("")||'<p class="muted">暂无转会</p>')+'</div><h3 class="gap">赛季记录</h3><div class="list">'+x.history.map(h=>'<div class="item">'+h.year+' · '+(h.age<18?'青训 · ':'')+E(h.club)+' · '+h.goals+'球 '+h.assists+'助</div>').join("")+partialRetirementHistory(x)+'</div><h3 class="gap">青训履历（与成年数据分开）</h3><div class="grid3">'+metric("青训出场",p.academyCareer?.apps||0)+metric("青训进球",p.academyCareer?.goals||0)+metric("青训助攻",p.academyCareer?.assists||0)+'</div><p class="muted small">'+(p.academyHonors||[]).map(h=>E(h.year+"年 "+h.name)).join(" · ")+'</p><h3 class="gap">个人奖杯</h3>'+x.honors.map(h=>badge(h.year+" "+h.name+(h.legacyDisputed?"（旧档争议）":""))).join("")+'</section>'}).join("")+'</div>';
}
function duoMyPage(){
 const tabs=[["honors","冠军与荣誉"],["awards","金球奖"],["career","两人履历"],["save","存档与备份"]];
 return '<section class="card"><h2>我的生涯</h2><p class="muted">查看记录、荣誉和存档。</p><div class="list">'+tabs.map(([key,name])=>'<button class="button" data-page="'+key+'">'+name+'</button>').join("")+'</div></section>';
}
function topNav(){
 const tabs=[["dashboard","生涯"],["transfer","转会"],["world","世界"],["my","我的"]],mine=["my","honors","awards","career","save"].includes(page);
 return '<nav class="nav" aria-label="游戏页面">'+tabs.map(([key,name])=>'<button data-page="'+key+'" class="'+((page===key||key==="my"&&mine)?"active":"")+'">'+name+'</button>').join("")+'</nav>';
}
function render(){const a=$("app");if(!g){a.innerHTML=startPage();return}const pages={dashboard:duoDashboard,world:duoWorldPage,transfer:duoTransferPage,my:duoMyPage,honors:duoHonorsPage,awards:duoAwardsPage,career:duoHistoryPage,save:savePage};a.innerHTML=duoTop()+topNav()+(pages[page]||duoDashboard)()}
$("app").addEventListener("change",ev=>{if(ev.target.dataset.careerPace){const value=ev.target.value;if(["day","week","season"].includes(value)){careerPace=value;try{localStorage.setItem(CAREER_PACE_KEY,value)}catch(e){}render()}return}
 const changePosition=ev.target.dataset.positionTarget;
 if(changePosition&&CD&&duoGames&&DUO_IDS.includes(changePosition)){
  const p=duoGames[changePosition].player,oldTarget=p.positionTarget,oldProgress=p.positionProgress;
  if(CD.setPositionTarget(p,ev.target.value)){
   if(!save()){p.positionTarget=oldTarget;p.positionProgress=oldProgress;notify("存档空间不足，位置选择没有生效");}
   else notify(p.positionTarget?"开始位置训练："+CD.ROLE_NAMES[p.positionTarget]:"已恢复原位置");
  }render();return
 }


 const pathId=ev.target.dataset.openingPath;
 if(BP&&DUO_IDS.includes(pathId)&&!drawnClubs[pathId]&&Object.hasOwn(BP.PATHS,ev.target.value)){
  const previous=openingPaths[pathId];openingPaths[pathId]=ev.target.value;
  if(!persistOpening()){openingPaths[pathId]=previous;notify("无法保存生涯路线")}render();return
 }
 const weightId=ev.target.dataset.openingWeight;
 if(BP&&DUO_IDS.includes(weightId)&&!drawnClubs[weightId]){
  const weight=Number(ev.target.value);
  if(Number.isInteger(weight)&&weight>=45&&weight<=125){
   const previous=creatorMode==="preset"?openingWeights[weightId]:creatorDrafts[weightId];
   if(creatorMode==="preset")openingWeights[weightId]=weight;
   else creatorDrafts[weightId]=FS.validate({...creatorDrafts[weightId],weight});
   if(!persistOpening()){if(creatorMode==="preset")openingWeights[weightId]=previous;else creatorDrafts[weightId]=previous;notify("无法保存球员体重")}
  }render();return
 }
 const roleId=ev.target.dataset.creatorField==="_position"?ev.target.dataset.creatorId:null;
 if(BP&&DUO_IDS.includes(roleId)&&!drawnClubs[roleId]&&Object.hasOwn(POS,ev.target.value)){
  const previous=creatorMode==="preset"?openingPositions[roleId]:creatorDrafts[roleId];
  if(creatorMode==="preset")openingPositions[roleId]=ev.target.value;
  else creatorDrafts[roleId]=FS.validate({...creatorDrafts[roleId],position:ev.target.value});
  if(!persistOpening()){if(creatorMode==="preset")openingPositions[roleId]=previous;else creatorDrafts[roleId]=previous;notify("无法保存开局位置")}
  render();return
 }

 const creatorId=ev.target.dataset.creatorId,creatorField=ev.target.dataset.creatorField;
 if(FS&&creatorMode==="custom"&&DUO_IDS.includes(creatorId)&&creatorField&&!drawnClubs[creatorId]&&Object.hasOwn(FS.draftDefaults(),creatorField)){
  const before=creatorDrafts[creatorId],height=Number(ev.target.value);
  const weightAuto=creatorField==="height"&&BP&&Number.isInteger(height)&&before.weight===BP.referenceWeight(before.height);
  const next=FS.validate({...before,[creatorField]:ev.target.value,...(weightAuto?{weight:BP.referenceWeight(height)}:{})});
  creatorDrafts[creatorId]=next;
  if(!persistOpening()){creatorDrafts[creatorId]=before;notify("无法保存人物设定，已恢复原值");}
  render();return
 }
 const styleId=ev.target.dataset.duoStyle;if(styleId&&DUO_IDS.includes(styleId)&&!drawnClubs[styleId]&&Object.hasOwn(PLAYER_STYLES,ev.target.value)){openingStyles[styleId]=ev.target.value;persistOpening();render();return}const leagueFor=ev.target.dataset.openingLeague;if(leagueFor){chooseAcademy(leagueFor,ev.target.value);return}if(ev.target.dataset.worldLeague){g.worldFocus=ev.target.value;save();render();return}const id=ev.target.dataset.duoName;if(id&&DUO_IDS.includes(id)&&!drawnClubs[id]){duoDraft[id]=String(ev.target.value||DUO_TEMPLATES[id].name).trim().slice(0,22)||DUO_TEMPLATES[id].name;persistOpening();}const trainee=ev.target.dataset.trainingFocus;if(duoGames&&DUO_IDS.includes(trainee)&&!duoGames[trainee].player.retired){const focus=ev.target.value;if(focus==="auto"||Object.hasOwn(STATS,focus)){const p=duoGames[trainee].player;p.trainingFocus=focus==="auto"?null:focus;p.autoPoints=true;p.autoTraining=true;save()}}});
$("app").addEventListener("click",ev=>{const b=ev.target.closest("button");if(!b||b.disabled)return;const tab=b.dataset.page;if(tab){choosePage(tab);return}const action=b.dataset.action,key=b.dataset.key,i=Number(b.dataset.i||0);switch(action){
 case"exportLegacy":exportLegacy(key);break;case"exportIncompatible":exportLegacy(STORE);break;case"archiveIncompatible":archiveIncompatibleSave();break;case"preset":buildDuoGame();break;case"creatorMode":setCreatorMode(b.dataset.mode);break;case"flipOpeningCard":flipOpeningCard(b.dataset.id,i);break;case"retirePlayer":retirePlayer(b.dataset.id);break;case"requestLateralOffers":requestLateralOffers(b.dataset.id);break;case"acceptLateralOffer":{const id=b.dataset.id,select=DUO_IDS.includes(id)?document.querySelector('[data-lateral-offer="'+id+'"]'):null;if(select)acceptLateralOffer(id,Number(select.value));break}case"chooseAcademy":chooseAcademy(b.dataset.id,b.dataset.league);break;case"flipPromotionCard":flipPromotionCard(b.dataset.id,i);break;case"acceptDraw":decidePromotion(b.dataset.id,true);break;case"declineDraw":decidePromotion(b.dataset.id,false);break;case"sharedAwardYear":g.awardWorldYear=b.dataset.year;save();render();break;case"simBoth":simBoth();break;case"quickCareerAdvance":quickCareerAdvance();break;case"reroll":{let f=$("customForm");if(f){const data=new FormData(f);draft={name:String(data.get("name")||"王楚淇"),country:data.get("country"),leagueId:data.get("leagueId"),club:data.get("club"),position:data.get("position"),talent:mkTalent()}}render();break}
 case"nextMatch":simNext();break;case"play":break;
 case"simSeason":simBoth();break;case"simThree":simThree();break;case"addPoint":training(key);break;case"manualRecovery":manualRecovery();break;case"manualTraining":manualTraining(key);break;case"coachPoint":coachPoint(key);break;case"autoDistribute":autoPoints();save();render();break;
 case"awardYear":g.awardViewIndex=i;save();render();break;case"ballotCsv":exportBallotCsv();break;case"transfer":break;case"startCoach":notify("本版本专注双人生涯，不再开启转世或下一代");break;case"coachScout":scoutForCoach();break;case"coachSign":signCoachProspect(i);break;case"coachJob":coachTransfer(i);break;case"coachAdd":coachPointAlloc(key);break;case"coachChild":notify("本版本已取消下一代球员系统");break;case"worldSelect":g.worldFocus=b.dataset.id;save();render();break;case"nextSeason":nextSeason();break;case"retireCoach":retirePlayer(activeDuo);break;case"retireSolo":retirePlayer(activeDuo);break;
 case"backup":createSafetyBackup();break;case"restoreBackup":restoreSafetyBackup();break;case"newGame":newGameDialog();break;case"export":exportFile();break;case"import":$("importFile").click();break;
 }});
$("app").addEventListener("submit",ev=>{if(ev.target.id!=="customForm")return;ev.preventDefault();const f=new FormData(ev.target);draft={name:String(f.get("name")||"陆白").trim().slice(0,22),country:f.get("country"),leagueId:f.get("leagueId"),club:f.get("club"),position:f.get("position"),talent:draft.talent};buildGame(true)});
$("app").addEventListener("change",ev=>{if(ev.target.id==="leagueChoice"){const id=ev.target.value,c=$("clubChoice");c.innerHTML=DB[id].teams.map(t=>'<option value="'+E(t.name+"青训")+'">'+E(t.name+"青训")+'</option>').join("")}if(ev.target.id==="autoPoints"&&g){g.player.autoPoints=ev.target.checked;save()}if(ev.target.id==="autoTraining"&&g){g.player.autoTraining=ev.target.checked;save()}if(ev.target.id==="coachFormation"&&g?.coach){g.coach.formation=ev.target.value;log("采用"+ev.target.value+"阵型");save()}if(ev.target.id==="coachAutoPoints"&&g?.coach){g.coach.autoPoints=ev.target.checked;save()}if(ev.target.id==="formationChoice"&&g?.player.parentCoach){g.player.parentCoach.formation=ev.target.value;log("主教练采用 "+ev.target.value+" 阵型");save()}});
$("importFile").addEventListener("change",e=>{importFile(e.target.files[0]);e.target.value=""});
try{
 const v=JSON.parse(localStorage.getItem(STORE));
 if(v?.version===2&&v.duoGames?.wang?.player&&v.duoGames?.vini?.player){
  const invalid=DUO_IDS.filter(id=>!DB[v.duoGames[id].player.leagueId]).map(id=>v.duoGames[id].player.leagueId);
  if(invalid.length)incompatibleLegacySave="检测到本版本已取消的联赛："+[...new Set(invalid)].join("、");
  else hydratePayload(v);
  if(duoGames){for(const id of DUO_IDS){const item=duoGames[id];item.mode=item.mode||"player";if(item.player.trainingUsed===undefined)item.player.trainingUsed=false}
   if(!g.season.world)createWorld(g.season);ensureRealAwardPlayers()}

 }
}catch(e){g=null;duoGames=null}openingState();render();
window.__footballDynastySelfTest=()=>{const tests=[];let rr=makeRR(DB.ENG.teams.map(x=>x.name));tests.push(["英超38轮",rr.length===38]);tests.push(["每轮10场",rr.every(x=>x.length===10)]);let key={};for(const round of rr)for(const f of round){key[f.home+"|"+f.away]=(key[f.home+"|"+f.away]||0)+1}tests.push(["每对主客仅交手一次",Object.values(key).every(n=>n===1)&&Object.keys(key).length===380]);tests.push(["曼联真实赛程38场",MANU_26.length===38]);tests.push(["曼联欧冠前三场历史锁定",MANU_CL.slice(0,3).every(x=>x.length===5)]);tests.push(["七项能力",Object.keys(STATS).length===7]);tests.push(["双人开局资料",DUO_IDS.length===2&&DUO_TEMPLATES.wang.historicalOverall===83&&DUO_TEMPLATES.vini.historicalOverall===77]);tests.push(["转会层级判定",transferLevel("CHN","上海海港")===0&&transferLevel("NED","海伦芬")===1&&transferLevel("POR","本菲卡")===2&&transferLevel("ENG","布莱顿")===3&&transferLevel("ENG","阿森纳")===4&&transferLevel("ESP","皇家马德里")===5&&transferLevel("FRA","巴黎圣日耳曼")===5]);return tests};
})();
