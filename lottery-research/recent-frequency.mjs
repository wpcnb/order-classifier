// Descriptive modes only. Input is newest-first completed simulation numbers.
// This module does not generate random draws, rank predictions, or write storage.
import {drawSum} from "./draw-sum.mjs";

function mode(counts){
  const count=Math.max(...counts);
  return {values:count===0?[]:counts.flatMap((n,i)=>n===count?[i]:[]),count};
}

export function recentFrequency(numbers){
  if(!Array.isArray(numbers))throw TypeError("Expected simulation numbers");
  const positions=Array.from({length:3},()=>Array(10).fill(0));
  const overall=Array(10).fill(0);
  const sums=Array(28).fill(0);
  for(const number of numbers){
    if(typeof number!=="string"||! /^[0-9]{3}$/.test(number))throw TypeError("Invalid simulation number");
    sums[drawSum(number)]++;
    for(let i=0;i<3;i++){
      const digit=Number(number[i]);
      positions[i][digit]++;
      overall[digit]++;
    }
  }
  return {sampleSize:numbers.length,digitCount:numbers.length*3,
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
  $("simulation-count").textContent="已模拟 "+stats.sampleSize+" 次";
  $("recent-position-mode").textContent=positionModeLabel(stats.positionModes);
  $("recent-sum-mode").textContent=stats.sumMode.values.join(" / ")||"—";
  $("recent-digit-mode").textContent=stats.digitMode.values.join(" / ")||"—";
}
