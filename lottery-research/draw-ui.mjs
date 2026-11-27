import {drawNumber} from "./draw-machine.mjs";
import {playFrames} from "./playback.mjs";
import {mixingOrbit} from "./circular-motion.mjs";
import {drawSum} from "./draw-sum.mjs";
import {recentFrequency,renderRecentFrequency} from "./recent-frequency.mjs?v=20261127-multi-draw";
import {ARCHIVE_KEY, normalizeArchive, readArchive, saveArchive} from "./simulation-archive.mjs?v=20261127-multi-draw";
import {BATCH_REPORT_KEY, sampleBatch, createBatchReport, validateBatchReport} from "./batch-draw.mjs";

const button = document.querySelector("#draw");
const pauseButton = document.querySelector("#pause");
const restartButton = document.querySelector("#restart");
const skipButton = document.querySelector("#skip-animation");
const archiveButton = document.querySelector("#replay");
const speed = document.querySelector("#playback-speed");
const PLAYBACK_SPEED_KEY = "fc3d-playback-speed-v1";
let playback = null;
let revealFinalFrame = null;
let currentDraw = null;
const FINAL_FRAME_MS = 2300;
const status = document.querySelector(".status");
const resultTitle = document.querySelector("#result-title");
const indicator = document.querySelector("#machine-state");
const outputs = [...document.querySelectorAll(".output b")];
const outlets = [...document.querySelectorAll(".neck")];
const history = document.querySelector("#history");
const sumDisplay = document.querySelector("#draw-sum");
const archiveStatus = document.querySelector("#archive-status");
const archiveNumber = document.querySelector("#archive-number");
const archiveSearchStatus = document.querySelector("#archive-search-status");
const archiveSearchClear = document.querySelector("#archive-search-clear");
const archivePagination = document.querySelector("#archive-pagination");
const archivePrev = document.querySelector("#archive-prev");
const archiveNext = document.querySelector("#archive-next");
const ARCHIVE_PAGE_SIZE = 10;
let archivePage = 1;
const exportButton = document.querySelector("#archive-export");
const batchButtons = [...document.querySelectorAll("[data-batch]")];
const batchInstant = document.querySelector("#batch-instant");
const BATCH_INSTANT_KEY = "fc3d-batch-instant-v1";
const batchReport = document.querySelector("#batch-report");
let displayedBatchReport = null;
const formatTime = new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
let records = [];
let unsaved = [];
const theoreticalSumCounts = Array(28).fill(0);
for (let number = 0; number < 1000; number++) {
  theoreticalSumCounts[drawSum(String(number).padStart(3, "0"))]++;
}
function renderHistory() {
  function item(row) {
    const li = document.createElement("li");
    const summary = document.createElement("span");
    summary.textContent = row.number + " · 和值 " + row.sum + " · " + formatTime.format(new Date(row.at));
    const replay = document.createElement("button");
    replay.type = "button";
    replay.className = "saved-replay";
    replay.textContent = "回放";
    replay.setAttribute("aria-label", "回放模拟号码 " + row.number);
    replay.disabled = button.disabled;
    replay.addEventListener("click", () => {
      if (button.disabled) return;
      animate({number: row.number, saved: true}, replay);
    });
    li.append(summary, replay);
    return li;
  }
  const query = archiveNumber.value.trim();
  const valid = /^[0-9]{0,3}$/.test(query);
  const matches = !valid ? [] : query ? records.filter(row => row.number.startsWith(query)) : records;
  const totalPages = Math.max(1, Math.ceil(matches.length / ARCHIVE_PAGE_SIZE));
  archivePage = Math.min(Math.max(archivePage, 1), totalPages);
  const offset = (archivePage - 1) * ARCHIVE_PAGE_SIZE;
  const visible = matches.slice(offset, offset + ARCHIVE_PAGE_SIZE);
  const focused = document.activeElement;
  archivePrev.disabled = archivePage === 1;
  archiveNext.disabled = archivePage === totalPages;
  archivePagination.hidden = totalPages === 1;
  history.start = offset + 1;
  if (focused === archivePrev && archivePrev.disabled) {
    (archiveNext.disabled ? archiveNumber : archiveNext).focus({preventScroll:true});
  } else if (focused === archiveNext && archiveNext.disabled) {
    (archivePrev.disabled ? archiveNumber : archivePrev).focus({preventScroll:true});
  }
  archiveNumber.setAttribute("aria-invalid", String(!valid));
  archiveSearchClear.disabled = !archiveNumber.value;
  history.replaceChildren(...visible.map(item));
  if (!valid) archiveSearchStatus.textContent = "请输入 1–3 位数字。";
  else if (!matches.length) archiveSearchStatus.textContent = query ? "存档中没有匹配 " + query + " 的号码。" : "";
  else {
    const total = (query ? "找到 " : "共 ") + matches.length + " 条";
    const first = offset + 1;
    const last = offset + visible.length;
    const range = first === last ? "第 " + first + " 条" : "第 " + first + "–" + last + " 条";
    archiveSearchStatus.textContent = total + " · 第 " + archivePage + " / " + totalPages + " 页 · " + range;
  }
}
function renderArchive(message) {
  renderHistory();
  renderRecentFrequency(document,recentFrequency(records.map(row=>row.number)));
  document.querySelector("#empty-history").hidden = records.length !== 0;
  exportButton.disabled = !records.length;
  archiveStatus.textContent = message + " 时间为北京时间。";
}
function restoreArchive() {
  try {
    records = normalizeArchive([...readArchive(localStorage),...unsaved]);
    renderArchive(unsaved.length ? "部分记录尚未写入本机，请导出备份。" : "本机存档已读取。");
  } catch {
    renderArchive("本机存档读取失败，已有存档未覆盖；请导出本页记录。");
  }
}
function recordSimulations(numbers) {
  const prefix = (typeof crypto.randomUUID === "function" ? crypto.randomUUID().replace(/-/g,"") : Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,"0")).join("")).slice(0,28);
  const at = new Date().toISOString();
  const firstSequence = records.reduce((max,row)=>Math.max(max,row.sequence||0),0)+1;
  if (!Number.isSafeInteger(firstSequence+numbers.length-1)) throw new RangeError("Archive sequence exhausted");
  const rows = numbers.map((number,i)=>({id:prefix+i.toString(16).padStart(4,"0"),at,number,sum:drawSum(number),sequence:firstSequence+i}));
  unsaved = normalizeArchive([...unsaved,...rows]);
  records = normalizeArchive([...records,...rows]);
  try {
    records = saveArchive(localStorage,unsaved);
    unsaved = [];
    renderArchive("已自动保存至本机。");
    return true;
  } catch {
    renderArchive("本机写入失败，新增记录仅在本页保留，请导出备份。");
    return false;
  }
}
function batchSumRows(report) {
  return report.sums.map((count, sum) => [
    sum, count, (100 * count / report.count).toFixed(1), (theoreticalSumCounts[sum] / 10).toFixed(1)
  ]);
}
function renderBatchSums(report) {
  const rows = batchSumRows(report).map(([sum, count, observed, theoretical]) => {
    const row = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    label.textContent = String(sum);
    row.append(label);
    row.insertCell().textContent = String(count);
    row.insertCell().textContent = observed + "%";
    row.insertCell().textContent = theoretical + "%";
    return row;
  });
  document.querySelector("#batch-sums").replaceChildren(...rows);
}
function renderBatchReport(report, saveMessage = "") {
  validateBatchReport(report);
  const $=id=>document.querySelector("#"+id);
  const modes=counts=>{
    const maximum=Math.max(...counts);
    return counts.flatMap((n,i)=>n===maximum?[i]:[]).join(" / ");
  };
  $("batch-time").textContent=formatTime.format(new Date(report.at))+" · 北京时间";
  $("batch-count").textContent=report.count+" 次";
  $("batch-unique").textContent=String(report.unique);
  $("batch-repeats").textContent=String(report.count-report.unique);
  const total=report.sums.reduce((sum,count,value)=>sum+count*value,0);
  $("batch-mean-sum").textContent=(total/report.count).toFixed(2);
  $("batch-forms").textContent="豹子 "+report.forms[0]+" · 组三 "+report.forms[1]+" · 组六 "+report.forms[2];
  $("batch-modes").textContent="本次最高频和值："+modes(report.sums);
  $("batch-last").textContent="最后一组："+report.lastNumber+" · 和值 "+drawSum(report.lastNumber);
  $("batch-save-status").textContent=saveMessage;
  const rows=Array.from({length:10},(_,digit)=>{
    const tr=document.createElement("tr");
    const label=document.createElement("th");
    label.scope="row";
    label.textContent=String(digit);
    tr.append(label);
    for (const position of report.positions) {
      const cell=document.createElement("td");
      cell.textContent=String(position[digit]);
      tr.append(cell);
    }
    return tr;
  });
  $("batch-frequency").replaceChildren(...rows);
  renderBatchSums(report);
  displayedBatchReport = report;
  batchReport.hidden=false;
}
function restoreBatchReport() {
  try {
    const raw=localStorage.getItem(BATCH_REPORT_KEY);
    if (raw !== null) {
      renderBatchReport(JSON.parse(raw));
      return;
    }
  } catch {
    // An invalid saved report cannot be shown or downloaded.
  }
  displayedBatchReport = null;
  batchReport.hidden = true;
}
function downloadFile(contents, type, filename) {
  const url = URL.createObjectURL(new Blob([contents], {type}));
  const link=document.createElement("a");
  link.href=url;
  link.download=filename;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
exportButton.addEventListener("click", () => {
  downloadFile(JSON.stringify({version:1,records},null,2), "application/json", "fc3d-simulation-archive.json");
});
document.querySelector("#batch-sum-export").addEventListener("click", () => {
  const report = displayedBatchReport;
  if (!report) return;
  const timestamp = new Date(report.at).toISOString();
  const rows = batchSumRows(report).map(row => [timestamp, report.count, ...row].join(","));
  const header = "批次时间(UTC),批次抽取次数,和值,出现次数,样本占比(%),理论占比(%)";
  const csv = "\uFEFF" + [header, ...rows].join("\r\n") + "\r\n";
  const filename = "fc3d-batch-sums-" + timestamp.replace(/[:.]/g, "-") + ".csv";
  downloadFile(csv, "text/csv;charset=utf-8", filename);
});
window.addEventListener("storage",event=>{
  if(event.key===ARCHIVE_KEY||event.key===null)restoreArchive();
  if(event.key===BATCH_REPORT_KEY||event.key===null)restoreBatchReport();
});
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const places = ["百位", "十位", "个位"];
const visualSource = document.querySelector(".machine .studio");
let visualRun = 0;
visualSource.dataset.visualPhase = "idle";
visualSource.dataset.visualRun = "0";
visualSource.dataset.visualElapsed = "0";
// Coordinates in each viewing window, ordered from the lowest row upwards.
const resting = [[30,82],[45,85],[60,84],[73,78],[21,70],[36,68],[51,70],[65,65],[43,55],[57,54]];
const groups = [...document.querySelectorAll(".glass")].map(glass =>
  resting.map(([x,y], digit) => {
    const ball = document.createElement("b");
    ball.className = "ball";
    ball.textContent = String(digit);
    glass.append(ball);
    position(ball,x,y);
    return ball;
  })
);
function position(ball,x,y) {
  ball.style.left = x + "%";
  ball.style.top = y + "%";
}
function resetBalls() {
  for (const balls of groups) balls.forEach((ball,i) => {
    ball.style.visibility = "";
    position(ball,...resting[i]);
  });
}
function setBusy(busy) {
  button.disabled = busy;
  batchButtons.forEach(batchButton=>{batchButton.disabled=busy;});
  speed.disabled = busy;
  pauseButton.disabled = !busy;
  pauseButton.textContent = "暂停动画";
  skipButton.disabled = !busy;
  archiveButton.disabled = busy;
  for (const replay of history.querySelectorAll(".saved-replay")) replay.disabled = busy;
  document.querySelector("#replay-issue").disabled = busy;
}
function finish(draw, trigger) {
  visualSource.dataset.visualPhase = "idle";
  const {number, issue, saved} = draw;
  const isReplay = Boolean(issue || saved);
  const sum = drawSum(number);
  sumDisplay.textContent = "本次和值：" + sum;
  if (!isReplay && !draw.recorded) {
    recordSimulations([number]);
    draw.recorded = true;
  }
  indicator.textContent = isReplay ? "回放完成" : "已出球";
  if (issue) status.textContent = "第 " + issue + " 期历史回放完成，公告号码为 " + number + "。";
  else if (saved) status.textContent = "模拟记录回放完成，号码为 " + number + "。";
  else if (draw.batchCount) status.textContent = draw.batchCount + " 连抽完成，最后一组为 " + number + "。";
  else status.textContent = "本次模拟号码为 " + number + "。";
  status.textContent += "和值 " + sum + "。";
  button.firstChild.textContent = isReplay ? "开始摇奖 " : "再摇一次 ";
  const focusOnPlayback = [pauseButton, skipButton].includes(document.activeElement);
  playback = null;
  revealFinalFrame = null;
  setBusy(false);
  if (focusOnPlayback) (trigger.isConnected ? trigger : resultTitle).focus({preventScroll:true});
}
function restorePlaybackSpeed() {
  let savedSpeed;
  try {
    savedSpeed = localStorage.getItem(PLAYBACK_SPEED_KEY);
  } catch {
    // Playback remains available even when storage is blocked.
  }
  const supported = Array.from(speed.options).some(option => option.value === savedSpeed);
  speed.value = supported ? savedSpeed : "1";
}
export function replayDraw(row) {
  if (!button.disabled) animate({number:row.number, issue:row.issue}, archiveButton);
}
function startDraw() {
  if (button.disabled) return;
  let number;
  try {
    number = drawNumber();
  } catch {
    status.textContent = "浏览器随机数服务不可用，请刷新后重试。";
    return;
  }
  animate({number, issue:null, recorded:false}, button);
}
function startBatch(trigger) {
  if (button.disabled) return;
  const count=Number(trigger.dataset.batch);
  let numbers, report, saved;
  try {
    numbers=sampleBatch(count);
    report=createBatchReport(numbers);
    saved=recordSimulations(numbers);
  } catch {
    status.textContent="连抽未完成，请检查浏览器随机数服务后重试。";
    return;
  }
  let saveMessage="";
  if (saved) {
    try { localStorage.setItem(BATCH_REPORT_KEY,JSON.stringify(report)); }
    catch { saveMessage="报告仅在本页保留；号码已保存至本机。"; }
  } else {
    saveMessage="本次号码和报告仅在本页保留，请导出存档备份。";
  }
  renderBatchReport(report,saveMessage);
  // The entire batch is already recorded once; present only its last number.
  animate({number:report.lastNumber,issue:null,recorded:true,batchCount:count},trigger, {immediate: batchInstant.checked});
}
function animate(draw, trigger, {immediate = false} = {}) {
  playback?.pause();
  currentDraw = draw;
  visualSource.dataset.visualRun = String(++visualRun);
  visualSource.dataset.visualElapsed = "0";
  visualSource.dataset.visualPhase = "mixing";
  restartButton.disabled = false;
  const {number, issue, saved} = draw;
  const focusResult = saved && trigger !== restartButton;
  if (!immediate) {
    const moveFocus = !focusResult && document.activeElement === trigger && !reducedMotion.matches;
    setBusy(true);
    if (moveFocus) pauseButton.focus({preventScroll:true});
  }
  const simulationTitle = trigger === restartButton ? "重播本次模拟" : draw.batchCount ? "连抽 · 最后一组" : "本次模拟号码";
  resultTitle.textContent = issue ? "历史回放 · 第 " + issue + " 期" : saved ? "模拟记录回放" : simulationTitle;
  if (focusResult) resultTitle.focus();
  sumDisplay.textContent = "本次和值：–";
  resetBalls();
  for (const outlet of outlets) outlet.textContent = "";
  for (const slot of outputs) slot.textContent = "–";
  indicator.textContent = "混球中";
  status.textContent = issue ? "正在回放已公布的号码。" : saved ? "正在回放本机模拟记录。" : "正在混球，准备依次出球。";
  let shown = 0;
  function paint(elapsed) {
    visualSource.dataset.visualElapsed = String(Math.max(0,Math.min(elapsed,FINAL_FRAME_MS)));
    if (reducedMotion.matches) visualSource.dataset.visualPhase = "idle";
    const next = reducedMotion.matches ? 3 : Math.min(3, Math.max(0, 1 + Math.floor((elapsed-1100)/600)));
    while (shown < next) {
      outputs[shown].textContent = number[shown];
      outlets[shown].textContent = number[shown];
      const balls = groups[shown];
      balls.forEach((ball,i) => position(ball,...resting[i]));
      balls[Number(number[shown])].style.visibility = "hidden";
      indicator.textContent = places[shown] + "出球";
      shown++;
    }
    if (shown === 3) { finish(draw,trigger); return true; }
    for (let g=shown; g<groups.length; g++) {
      groups[g].forEach((ball,i) => {
        const [x,y] = mixingOrbit(g,i,Math.max(0,elapsed));
        // In the final quarter-second the selected ball travels to the top outlet.
        const lift = i === Number(number[g]) ? Math.max(0,(elapsed - (850 + g*600))/250) : 0;
        position(ball,x + (50-x)*lift,y + (5-y)*lift);
      });
    }
    return false;
  }
  if (immediate) {
    paint(FINAL_FRAME_MS);
    return;
  }
  revealFinalFrame = () => {
    playback.pause();
    paint(FINAL_FRAME_MS);
  };
  playback = playFrames(Number(speed.value), paint);
}
skipButton.addEventListener("click", () => revealFinalFrame?.());
restartButton.addEventListener("click", () => {
  if (currentDraw) animate(currentDraw, restartButton);
});
pauseButton.addEventListener("click", () => {
  if (!playback) return;
  if (playback.paused) {
    playback.resume();
    visualSource.dataset.visualPhase = "mixing";
    pauseButton.textContent = "暂停动画";
    indicator.textContent = "混球中";
    status.textContent = "已从暂停处继续出球。";
  } else {
    playback.pause();
    visualSource.dataset.visualPhase = "paused";
    pauseButton.textContent = "继续动画";
    indicator.textContent = "已暂停";
    const revealed = outputs.filter(slot => slot.textContent !== "–").map(slot => slot.textContent);
    status.textContent = revealed.length ? "动画已暂停，已出 " + revealed.join("、") + "。" : "动画已暂停，尚未出球。";
  }
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches && playback?.paused) playback.resume();
});
restoreArchive();
archiveNumber.disabled = false;
function resetArchivePage() {
  archivePage = 1;
  renderHistory();
}
archiveNumber.addEventListener("input", resetArchivePage);
archiveSearchClear.addEventListener("click", () => {
  archiveNumber.value = "";
  resetArchivePage();
  archiveNumber.focus();
});
archivePrev.addEventListener("click", () => {
  archivePage--;
  renderHistory();
});
archiveNext.addEventListener("click", () => {
  archivePage++;
  renderHistory();
});
restoreBatchReport();
restorePlaybackSpeed();
speed.addEventListener("change", () => {
  try {
    localStorage.setItem(PLAYBACK_SPEED_KEY, speed.value);
  } catch {
    // The selected speed still applies in this tab.
  }
});
// Restore the last completed simulation without starting a new draw or changing the archive.
if (records.length) {
  const {number,sum} = records[0];
  for (let i=0;i<outputs.length;i++) {
    outputs[i].textContent = number[i];
    outlets[i].textContent = number[i];
    groups[i][Number(number[i])].style.visibility = "hidden";
  }
  sumDisplay.textContent = "本次和值：" + sum;
  resultTitle.textContent = "最近一次模拟号码";
  indicator.textContent = "已恢复存档";
  status.textContent = "准备就绪。已恢复最近一次模拟及本机记录。";
} else {
  status.textContent = "准备就绪。";
}
button.addEventListener("click", startDraw);
try {
  batchInstant.checked = localStorage.getItem(BATCH_INSTANT_KEY) === "1";
} catch {
  batchInstant.checked = false;
}
batchInstant.addEventListener("change", () => {
  try {
    localStorage.setItem(BATCH_INSTANT_KEY, batchInstant.checked ? "1" : "0");
  } catch {
    // The setting still applies to this page when storage is unavailable.
  }
});
batchInstant.disabled = false;
batchButtons.forEach(batchButton=>{
  batchButton.addEventListener("click",()=>startBatch(batchButton));
});
setBusy(false);
