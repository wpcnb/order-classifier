// Descriptive modes only. Input is newest-first completed simulation numbers.
// This module does not generate random draws, rank predictions, or write storage.
import {drawSum} from "./draw-sum.mjs";
export const RECENT_LIMIT=10;

function mode(counts){
  const count=Math.max(...counts);
  return {values:count===0?[]:counts.flatMap((n,i)=>n===count?[i]:[]),count};
}

export function recentFrequency(numbers){
  if(!Array.isArray(numbers))throw TypeError("Expected simulation numbers");
  const recent=numbers.slice(0,RECENT_LIMIT);
  const positions=Array.from({length:3},()=>Array(10).fill(0));
  const overall=Array(10).fill(0);
  const sums=Array(28).fill(0);
  for(const number of recent){
    if(typeof number!=="string"||! /^[0-9]{3}$/.test(number))throw TypeError("Invalid simulation number");
    sums[drawSum(number)]++;
    for(let i=0;i<3;i++){
      const digit=Number(number[i]);
      positions[i][digit]++;
      overall[digit]++;
    }
  }
  return {sampleSize:recent.length,digitCount:recent.length*3,
    positions,overall,sums,
    positionModes:positions.map(mode),sumMode:mode(sums),digitMode:mode(overall)};
}

// Preserve all ties without enumerating up to 1000 combinations.
export function positionModeLabel(modes){
  if(modes.some(m=>!m.values.length))return "—";
  return modes.map(m=>m.values.length===1?String(m.values[0]):"["+m.values.join("/") + "]").join("");
}

export function renderRecentFrequency(root,stats){
  const $=id=>root.querySelector("#"+id);
  const n=stats.sampleSize;
  $("recent-frequency-sample").textContent="样本 "+n+"/10 次 · "+stats.digitCount+"/30 个数字"+(n<10?" · 尚未满10次":" · 滚动统计");
  $("recent-position-mode").textContent=positionModeLabel(stats.positionModes);
  $("recent-position-detail").textContent=n?stats.positionModes.map((m,i)=>["百位","十位","个位"][i]+"："+m.values.join("/")+"（各"+m.count+"次）").join("；"):"百位、十位、个位分别统计";
  $("recent-sum-mode").textContent=stats.sumMode.values.join(" / ")||"—";
  $("recent-sum-detail").textContent=n?"各出现 "+stats.sumMode.count+" / "+n+" 次":"统计和值出现次数";
  $("recent-digit-mode").textContent=stats.digitMode.values.join(" / ")||"—";
  $("recent-digit-detail").textContent=n?"各出现 "+stats.digitMode.count+" / "+stats.digitCount+" 次":"合并三位数字，满10次共30个";
  const table=$("recent-digit-table");
  const doc=table.ownerDocument;
  const rows=stats.overall.map((count,i)=>{
    const row=doc.createElement("tr");
    [i,...stats.positions.map(p=>p[i]),count].forEach((v,j)=>{
      const cell=doc.createElement(j===0?"th":"td");
      if(j===0)cell.scope="row";
      cell.textContent=String(v);
      row.append(cell);
    });
    return row;
  });
  table.replaceChildren(...rows);
  $("recent-sum-table").textContent=n?"和值频数："+stats.sums.flatMap((count,sum)=>count?[sum+"："+count+"次"]:[]).join("；"):"暂无和值";
}
