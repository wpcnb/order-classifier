import {drawNumber} from "./draw-machine.mjs";
import {drawSum} from "./draw-sum.mjs";

export const BATCH_SIZES = Object.freeze([10,100,1000]);
export const BATCH_REPORT_KEY = "fc3d-last-batch-summary-v1";

// Sampling remains independent of the presentation and of previous results.
export function sampleBatch(count, sample = drawNumber) {
  if (!BATCH_SIZES.includes(count)) throw new RangeError("Unsupported batch size");
  const numbers = [];
  for (let i=0;i<count;i++) {
    const number = sample();
    drawSum(number); // Validate before any batch results are committed.
    numbers.push(number);
  }
  return numbers;
}

export function createBatchReport(numbers, at = new Date().toISOString()) {
  if (!Array.isArray(numbers) || !BATCH_SIZES.includes(numbers.length) || !Number.isFinite(Date.parse(at))) {
    throw new TypeError("Invalid batch report");
  }
  const positions=Array.from({length:3},()=>Array(10).fill(0));
  const sums=Array(28).fill(0);
  const forms=[0,0,0]; // 豹子、组三、组六
  for (const number of numbers) {
    sums[drawSum(number)]++;
    for (let i=0;i<3;i++) positions[i][Number(number[i])]++;
    forms[new Set(number).size-1]++;
  }
  return {version:1,at:new Date(at).toISOString(),count:numbers.length,
    unique:new Set(numbers).size,lastNumber:numbers[numbers.length-1],positions,sums,forms};
}

// A report contains aggregate statistics only, not a second history of numbers.
export function validateBatchReport(report) {
  const counts=(array,length,total)=>Array.isArray(array) && array.length===length &&
    array.every(n=>Number.isSafeInteger(n)&&n>=0) && array.reduce((a,b)=>a+b,0)===total;
  if (!report || report.version!==1 || !BATCH_SIZES.includes(report.count) ||
      typeof report.at!=="string" || !Number.isFinite(Date.parse(report.at)) ||
      !Number.isSafeInteger(report.unique) || report.unique<1 || report.unique>report.count ||
      typeof report.lastNumber!=="string" || !/^[0-9]{3}$/.test(report.lastNumber) ||
      !Array.isArray(report.positions) || report.positions.length!==3 ||
      !report.positions.every(row=>counts(row,10,report.count)) ||
      !counts(report.sums,28,report.count) || !counts(report.forms,3,report.count)) {
    throw new TypeError("Invalid saved batch report");
  }
  return report;
}
