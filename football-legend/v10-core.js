(()=>{"use strict";
/* Original v10 dual-career UX and probability helpers.
   The public footballer roster is a game reference, NOT a factual 2026
   registration/ratings database. All future careers remain fictional.
   This module never copies code, styles, or assets from other games. */
const LEAGUES=Object.freeze(["ENG","ESP","GER","ITA","FRA","CHN"]);
const COUNTRIES=Object.freeze(["中国","英格兰","西班牙","德国","法国","意大利","葡萄牙","荷兰","巴西","阿根廷","日本","韩国","沙特阿拉伯","澳大利亚","美国","加拿大","墨西哥","比利时","克罗地亚","摩洛哥","尼日利亚","塞内加尔","埃及","瑞士","奥地利","丹麦"]);
const STATS=["pace","shoot","pass","dribble","defense","physical","mental"];
const ROLES=Object.freeze({
 LW:[11,4,1,9,-11,-3,3],RW:[11,4,1,9,-11,-3,3],
 ST:[3,12,-4,3,-13,6,3],CAM:[1,4,11,9,-8,-6,6],
 CM:[0,-2,12,3,4,-2,8],CDM:[-3,-10,7,-6,14,7,8],
 CB:[-8,-17,-5,-12,20,12,8],GK:[-11,-23,-14,-16,24,11,7]
});
const PHILOSOPHIES=Object.freeze({
 balanced:{label:"全面发展",description:"技术、机会与体能相对均衡",shot:1,assist:1,fatigue:1},
 creator:{label:"技术组织",description:"传球配合更积极，个人射门机会略少",shot:.97,assist:1.06,fatigue:1.01},
 finisher:{label:"进攻终结",description:"更多尝试射门，参与助攻略少",shot:1.06,assist:.96,fatigue:1.035},
 worker:{label:"全场压迫",description:"比赛中更积极参与进攻，体能消耗更高",shot:1.025,assist:1.02,fatigue:1.085},
 patient:{label:"耐心经营",description:"减少无效冲刺，偏向持续健康与效率",shot:.985,assist:1.005,fatigue:.925}
});
const OPERATIONS=Object.freeze({
 guided:{label:"轻松生涯",description:"自动训练与分配，重点处理重大抉择"},
 deep:{label:"深度生涯",description:"亲自决定训练和能力分配，不提供无条件能力加成"}
});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
const draw=(items,r=Math.random)=>items[clamp(Math.floor(clamp(Number(r()),0,.999999999)*items.length),0,items.length-1)];
const chooseLeague=(r=Math.random)=>draw(LEAGUES,r);
const chooseCountry=(r=Math.random)=>draw(COUNTRIES,r);
const allowedHeight=x=>Math.round(clamp(Number(x),150,210));
const seedWeight=h=>Math.round(clamp(22.5*Math.pow(allowedHeight(h)/100,2),45,125));
const allowedWeight=x=>Math.round(clamp(Number(x),45,125));
const scrubPhilosophy=x=>Object.hasOwn(PHILOSOPHIES,x)?x:"balanced";
const scrubOperation=x=>Object.hasOwn(OPERATIONS,x)?x:"guided";
const IMPORTANT=["维尼修斯","姆巴佩","哈兰德","亚马尔","贝林厄姆","凯恩","萨卡","佩德里","巴尔韦德","穆西亚拉","维尔茨","帕尔默","福登","劳塔罗·马丁内斯","奥利塞","维蒂尼亚","阿马德·迪亚洛","梅努","谢什科","库巴西","赖斯","多纳鲁马","库尔图瓦","格瓦迪奥尔","萨利巴","加维","杜埃","埃斯特旺","巴斯托尼","奥布拉克","加纳乔","罗德里戈","阿尔瓦雷斯","基米希","莱万多夫斯基","登贝莱","罗德里","布鲁诺·费尔南德斯","伊萨克","约克雷斯"];
const REFERENCE_COUNTRIES=Object.freeze({
 "王楚淇":"中国","维尼修斯":"巴西","姆巴佩":"法国","哈兰德":"挪威","亚马尔":"西班牙","贝林厄姆":"英格兰","凯恩":"英格兰","萨卡":"英格兰","佩德里":"西班牙","巴尔韦德":"乌拉圭","穆西亚拉":"德国","维尔茨":"德国","帕尔默":"英格兰","福登":"英格兰","劳塔罗·马丁内斯":"阿根廷","奥利塞":"法国","维蒂尼亚":"葡萄牙","阿马德·迪亚洛":"科特迪瓦","梅努":"英格兰","谢什科":"斯洛文尼亚","库巴西":"西班牙","赖斯":"英格兰","多纳鲁马":"意大利","库尔图瓦":"比利时","格瓦迪奥尔":"克罗地亚","萨利巴":"法国","加维":"西班牙","杜埃":"法国","埃斯特旺":"巴西","巴斯托尼":"意大利","奥布拉克":"斯洛文尼亚","加纳乔":"阿根廷","罗德里戈":"巴西","阿尔瓦雷斯":"阿根廷","基米希":"德国","莱万多夫斯基":"波兰","登贝莱":"法国","罗德里":"西班牙","布鲁诺·费尔南德斯":"葡萄牙","伊萨克":"瑞典","约克雷斯":"瑞典"
});
function catalog(rawRoster){
 const rows=rawRoster?.roster;
 const found=new Map();
 if(Array.isArray(rows))for(const item of rows){
  if(!Array.isArray(item)||!IMPORTANT.includes(item[0])||found.has(item[0]))continue;
  if(!["LW","RW","ST","CAM","CM","CDM","CB","GK"].includes(item[2]))continue;
  found.set(item[0],{name:item[0],referenceClub:String(item[1]||""),position:item[2],rating:clamp(Number(item[3]),65,99),source:"游戏球员名单 · 2026参考"});
 }
 // A longtime user-provided comparison character; it is not represented as
 // a verified official footballer in the public roster.
 const output=[{name:"王楚淇",referenceClub:"玩家经典角色",position:"LW",rating:83,source:"原有玩家角色"}];
 for(const name of IMPORTANT){if(found.has(name))output.push(found.get(name))}
 return output;
}
function findPerson(id,rawRoster){
 return catalog(rawRoster).find(x=>x.name===id)||null;
}
function templateFor(id,rawRoster){
 const row=findPerson(id,rawRoster);if(!row)return null;
 const mean=clamp(Math.round(64+(row.rating-80)*.49),59,75);
 const offsets=ROLES[row.position]||ROLES.LW;
 const stats=Object.fromEntries(STATS.map((key,i)=>[key,Math.round(clamp(mean+offsets[i],32,92))]));
 const potential=Math.round(clamp(row.rating+3,77,98));
 return {...row,stats,potential,sourceReference:"v10平行世界能力估算；不代表真实球员当前评分"};
}
function matchInfluence(p){
 const row=PHILOSOPHIES[scrubPhilosophy(p?.careerPhilosophy)];
 return {shot:row.shot,assist:row.assist,fatigue:row.fatigue};
}
function narrative(player,season){
 const p=player||{},s=season||{},events=[],name=String(p.name||"球员");
 const apps=Math.max(0,Number(s.apps)||0),goals=Math.max(0,Number(s.goals)||0),assists=Math.max(0,Number(s.assists)||0);
 if(p.retired)events.push({kind:"retirement",title:"生涯落幕",text:name+"已经退役，荣誉与履历继续保存。"});
 else if((p.injuryMatches||0)>0)events.push({kind:"injury",title:"伤病考验",text:"还需休养约"+Math.floor(p.injuryMatches)+"场；出场机会可能受到影响。"});
 else if(apps>=20&&goals>=15)events.push({kind:"breakthrough",title:"得分突破",text:"本赛季已完成"+goals+"球，正逐渐成为球队重要得分点。"});
 else if(apps>=20&&assists>=10)events.push({kind:"creator",title:"组织核心",text:"本赛季已送出"+assists+"次助攻，组织能力得到体现。"});
 else if(apps>=15)events.push({kind:"regular",title:"稳定积累",text:"本赛季已经上场"+apps+"次，持续累积职业经验。"});
 else events.push({kind:"challenge",title:"争取机会",text:"本赛季已出场"+apps+"次，继续为稳定的位置努力。"});
 return events;
}
const SLOT_KEY="football-dynasty-v10-snapshots";
function parseCareer(raw){
 if(typeof raw!=="string"||raw.length<10)return null;
 try{const data=JSON.parse(raw);return data?.version===2&&data?.duoGames?.wang?.player&&data?.duoGames?.vini?.player?data:null}catch(_){return null}
}
function readSlots(storage,key=SLOT_KEY){
 try{const data=JSON.parse(storage.getItem(key)||"[]");return Array.isArray(data)?data.filter(x=>typeof x?.body==="string"&&parseCareer(x.body)&&typeof x?.createdAt==="string").slice(0,2):[]}catch(_){return []}
}
function saveSnapshot(storage,currentKey,key=SLOT_KEY,now=()=>new Date().toISOString()){
 const raw=storage.getItem(currentKey);
 if(!parseCareer(raw))return {ok:false,reason:"没有可备份的双人生涯"};
 const old=readSlots(storage,key),slot={createdAt:String(now()),body:raw};
 const next=[slot,...old].slice(0,2);
 try{storage.setItem(key,JSON.stringify(next));if(storage.getItem(key)!==JSON.stringify(next))throw Error("write verification");return {ok:true,count:next.length}}catch(_){return {ok:false,reason:"本机空间不足，请先导出 JSON"}}
}
function snapshotForRestore(storage,index,key=SLOT_KEY){
 if(!Number.isInteger(index)||index<0||index>=2)return null;
 const slot=readSlots(storage,key)[index];
 return slot&&parseCareer(slot.body)?slot.body:null;
}
window.DualV10=Object.freeze({LEAGUES,COUNTRIES,STATS,PHILOSOPHIES,OPERATIONS,REFERENCE_COUNTRIES,SLOT_KEY,chooseLeague,chooseCountry,allowedHeight,seedWeight,allowedWeight,scrubPhilosophy,scrubOperation,catalog,findPerson,templateFor,matchInfluence,narrative,parseCareer,readSlots,saveSnapshot,snapshotForRestore});
})();