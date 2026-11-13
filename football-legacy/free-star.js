(()=>{"use strict";
/* Local-only fictional player creator. Identity and appearance never affect
   ability or potential. One locked draw per player and old preset remains intact. */
const COUNTRIES=["中国","英格兰","西班牙","德国","法国","意大利","葡萄牙","荷兰","巴西","阿根廷","日本","韩国","沙特阿拉伯","澳大利亚","美国","加拿大","墨西哥","比利时","克罗地亚","摩洛哥","尼日利亚","塞内加尔","埃及","瑞士","奥地利","丹麦"];
const POS={LW:"左边锋",RW:"右边锋",ST:"中锋",CAM:"前腰",CM:"中场",CDM:"后腰",CB:"中后卫",GK:"门将"};
// Keep legacy labels only for rendering pre-v8.0.1 player saves. New men's
// competition characters always use male, without changing old careers.
const GENDER={male:"男",female:"女",nonbinary:"非二元性别",other:"其他／不透露"};
const CURRENT_COMPETITION="mens";
const QUICK_HEIGHT={
 LW:[166,187],RW:[166,187],ST:[172,198],CAM:[167,190],
 CM:[167,191],CDM:[172,193],CB:[180,201],GK:[183,203]
};
const HERITAGE={unspecified:"不指定",eastAsian:"东亚",southeastAsian:"东南亚",southAsian:"南亚",african:"非洲",european:"欧洲",latin:"拉丁美洲",westAsian:"西亚／北非",mixed:"混合背景",other:"其他／自述"};
const TONE={fair:{label:"浅肤色",color:"#efd0b5"},light:{label:"中浅肤色",color:"#d9a67d"},medium:{label:"中等肤色",color:"#ae7553"},tan:{label:"中深肤色",color:"#885439"},deep:{label:"深肤色",color:"#573a2f"}};
const HAIR={short:"短发",curly:"卷发",fade:"渐变短发",long:"长发",bald:"光头"};
const KEYS=["pace","shoot","pass","dribble","defense","physical","mental"];
const ROLES={
 LW:[2,1,0,2,-4,-1,0],RW:[2,1,0,2,-4,-1,0],
 ST:[0,3,-2,0,-4,2,0],CAM:[0,0,3,2,-3,-1,1],
 CM:[-1,-1,3,0,1,0,1],CDM:[-1,-3,2,-2,4,2,0],
 CB:[-2,-4,-1,-3,5,3,1],GK:[-3,-5,-2,-4,6,2,1]
};
const randint=(a,b,random=Math.random)=>a+Math.min(b-a,Math.floor(Math.max(0,random())*(b-a+1)));
const pick=(items,random=Math.random)=>items[randint(0,items.length-1,random)];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function draftDefaults(){
 return {country:"中国",age:16,height:177,weight:70,gender:"male",heritage:"unspecified",skin:"medium",hair:"short",position:"LW"};
}
function quickDraft(random=Math.random){
 const position=pick(Object.keys(POS),random),range=QUICK_HEIGHT[position],height=randint(range[0],range[1],random);
 // Keep height and mass loosely coupled for believable quick-created footballers.
 const weight=randint(Math.max(45,Math.round(22.5*(height/100)**2)-8),Math.min(125,Math.round(22.5*(height/100)**2)+10),random);
 return {country:pick(COUNTRIES,random),age:randint(16,24,random),
 height,weight,gender:"male",heritage:"unspecified",
 skin:pick(Object.keys(TONE),random),hair:pick(Object.keys(HAIR),random),position};
}
function validate(d){
 const base=draftDefaults(),v={...base};
 if(d&&COUNTRIES.includes(d.country))v.country=d.country;
 if(Number.isInteger(Number(d?.age)))v.age=clamp(Number(d.age),16,39);
 if(Number.isInteger(Number(d?.height)))v.height=clamp(Number(d.height),150,210);
 const suggestedWeight=Math.round(22.5*(v.height/100)**2);
 v.weight=Number.isInteger(Number(d?.weight))?clamp(Number(d.weight),45,125):clamp(suggestedWeight,45,125);
 // The current simulated competitions are men's leagues. Gender is not a
 // randomized gameplay trait; keep non-male entries in existing completed saves.
 v.gender="male";
 for(const [field,table] of [["heritage",HERITAGE],["skin",TONE],["hair",HAIR],["position",POS]]){
  if(d&&Object.hasOwn(table,d[field]))v[field]=d[field];
 }
 return v;
}
function rollPotential(random=Math.random){
 const chance=random();
 if(chance<.45)return randint(65,79,random);
 if(chance<.80)return randint(80,89,random);
 if(chance<.95)return randint(90,94,random);
 return randint(95,99,random);
}
function generatedProfile(d,random=Math.random){
 const identity=validate(d),potential=rollPotential(random),base=clamp(potential-10,51,74),weight=ROLES[identity.position]||ROLES.LW;
 // Gender, national origin, ethnicity and complexion deliberately never enter this calculation.
 const stats=Object.fromEntries(KEYS.map((key,i)=>{
  const n=base+weight[i]+randint(-4,4,random);
  return [key,clamp(n,40,potential-1)];
 }));
 const seed=randint(1,2147483646,random);
 return {...identity,potential,stats,avatarSeed:seed,creatorVersion:1};
}
function rating(p){const sum=KEYS.reduce((a,k)=>a+Number(p?.stats?.[k]||0),0);return Math.round(sum/KEYS.length)}
function potentialReport(p,careerSeasons=0){
 if(!p?.freeStar)return "原有球员模板";
 const count=clamp(Number(careerSeasons)||0,0,50);
 if(!count)return "潜能未知 · 球探尚未评估";
 const margin=count<3?13:count<6?7:3;
 const low=Math.max(65,Number(p.potential)-margin),high=Math.min(99,Number(p.potential)+margin);
 return "球探估计 "+low+"～"+high+"（非最终上限）";
}
function avatar(profile){
 if(!profile)return "";
 const d=validate(profile);
 const seed=Number.isInteger(Number(profile.avatarSeed))?Number(profile.avatarSeed):41;
 const skin=TONE[d.skin].color;
 const hairColor=["#1c2630","#302621","#513524","#151820","#694b37"][seed%5];
 const shirt=["#d62843","#1b8f99","#a78b36","#472b87","#1e5c96"][seed%5];
 const number=1+seed%25;
 const id="fs-portrait-"+String(Math.abs(seed)%999999);
 // Fixed local vector artwork, no photo fetch, no face synthesis or sensitive trait inference.
 const hair=d.hair==="bald"?"":d.hair==="long"?
  '<path d="M39 81 Q32 26 79 29 Q129 21 121 82 L127 124 108 122 105 60 Q80 44 55 60 L53 120 33 121Z" fill="'+hairColor+'"/>':
  d.hair==="curly"?
  '<path d="M39 76 Q28 48 47 37 Q63 17 80 29 Q107 13 120 41 Q135 66 117 78 L111 60 Q80 46 54 62 L50 81Z" fill="'+hairColor+'"/><circle cx="58" cy="42" r="13" fill="'+hairColor+'"/><circle cx="84" cy="34" r="13" fill="'+hairColor+'"/><circle cx="106" cy="46" r="13" fill="'+hairColor+'"/>':
  '<path d="M39 78 Q34 24 81 27 Q125 25 121 75 Q109 56 91 54 Q69 53 51 68 L47 80Z" fill="'+hairColor+'"/>';
 return '<svg viewBox="0 0 160 176" role="img" aria-label="虚构球员头像" xmlns="http://www.w3.org/2000/svg">'+
 '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#173e58"/><stop offset="1" stop-color="#0a172b"/></linearGradient></defs>'+
 '<rect width="160" height="176" rx="18" fill="url(#'+id+')"/><circle cx="128" cy="38" r="32" fill="#ffffff" opacity=".045"/>'+
 '<path d="M-7 181 Q1 133 50 126 L110 126 Q157 135 171 181Z" fill="'+shirt+'"/>'+
 '<path d="M54 125 L105 125 L92 151 L69 151Z" fill="#f4f4e9" opacity=".75"/>'+
 '<rect x="67" y="108" width="27" height="32" rx="8" fill="'+skin+'"/>'+
 '<ellipse cx="80" cy="80" rx="41" ry="51" fill="'+skin+'"/>'+
 hair+
 '<path d="M58 82 Q66 77 72 82 M88 82 Q96 77 103 82" fill="none" stroke="'+hairColor+'" stroke-width="3" stroke-linecap="round"/>'+
 '<circle cx="68" cy="86" r="3" fill="#23282c"/><circle cx="94" cy="86" r="3" fill="#23282c"/>'+
 '<path d="M79 92 L76 105 L84 105" fill="none" stroke="#5c382b" stroke-width="2" opacity=".55"/>'+
 '<path d="M69 115 Q81 122 94 115" fill="none" stroke="#5c382b" stroke-width="2.5" stroke-linecap="round"/>'+
 '<text x="136" y="165" font-size="16" text-anchor="end" fill="#ffffff" opacity=".7" font-family="sans-serif">'+number+'</text></svg>';
}
window.FreeStar=Object.freeze({COUNTRIES,POS,GENDER,HERITAGE,TONE,HAIR,CURRENT_COMPETITION,QUICK_HEIGHT,draftDefaults,quickDraft,validate,rollPotential,generatedProfile,rating,potentialReport,avatar});
})();
