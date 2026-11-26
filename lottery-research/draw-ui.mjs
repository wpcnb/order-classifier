import {drawNumber} from "./draw-machine.mjs";
import {playFrames} from "./playback.mjs";
import {drawSum} from "./draw-sum.mjs";
import {recentFrequency,renderRecentFrequency} from "./recent-frequency.mjs?v=all-saved";
import {ARCHIVE_KEY, normalizeArchive, readArchive, saveArchive} from "./simulation-archive.mjs";

const button = document.querySelector("#draw");
const pauseButton = document.querySelector("#pause");
const restartButton = document.querySelector("#restart");
const archiveButton = document.querySelector("#replay");
const speed = document.querySelector("#playback-speed");
let playback = null;
let currentDraw = null;
const status = document.querySelector(".status");
const indicator = document.querySelector("#machine-state");
const outputs = [...document.querySelectorAll(".output b")];
const outlets = [...document.querySelectorAll(".neck")];
const history = document.querySelector("#history");
const sumDisplay = document.querySelector("#draw-sum");
const archiveStatus = document.querySelector("#archive-status");
const exportButton = document.querySelector("#archive-export");
const formatTime = new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
let records = [];
let unsaved = [];
function renderArchive(message) {
  function item(row) {
    const li = document.createElement("li");
    li.textContent = row.number + " · 和值 " + row.sum + " · " + formatTime.format(new Date(row.at));
    return li;
  }
  history.replaceChildren(...records.slice(0,10).map(item));
  renderRecentFrequency(document,recentFrequency(records.map(row=>row.number)));
  document.querySelector("#empty-history").hidden = records.length !== 0;
  exportButton.disabled = !records.length;
  archiveStatus.textContent = message + " 显示最近 " + Math.min(records.length,10) + " 条，时间为北京时间。";
}
function restoreArchive() {
  try {
    records = normalizeArchive([...readArchive(localStorage),...unsaved]);
    renderArchive(unsaved.length ? "部分记录尚未写入本机，请导出备份。" : "本机存档已读取。");
  } catch {
    renderArchive("本机存档读取失败，已有存档未覆盖；请导出本页记录。");
  }
}
function recordSimulation(number) {
  const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID().replace(/-/g,"") : Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,"0")).join("");
  const row = {id,at:new Date().toISOString(),number,sum:drawSum(number)};
  unsaved = normalizeArchive([...unsaved,row]);
  records = normalizeArchive([...records,row]);
  try {
    records = saveArchive(localStorage,unsaved);
    unsaved = [];
    renderArchive("已自动保存至本机。");
  } catch {
    renderArchive("本机写入失败，新增记录仅在本页保留，请导出备份。");
  }
}
exportButton.addEventListener("click",()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,records},null,2)],{type:"application/json"}));
  const link=document.createElement("a");
  link.href=url;
  link.download="fc3d-simulation-archive.json";
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
window.addEventListener("storage",event=>{if(event.key===ARCHIVE_KEY||event.key===null)restoreArchive();});
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
  speed.disabled = busy;
  pauseButton.disabled = !busy;
  pauseButton.textContent = "暂停动画";
  archiveButton.disabled = busy;
  document.querySelector("#replay-issue").disabled = busy;
}
function finish(draw, trigger) {
  visualSource.dataset.visualPhase = "idle";
  const {number, issue} = draw;
  const sum = drawSum(number);
  sumDisplay.textContent = "本次和值：" + sum;
  if (!issue && !draw.recorded) {
    recordSimulation(number);
    draw.recorded = true;
  }
  indicator.textContent = issue ? "回放完成" : "已出球";
  status.textContent = issue ? "第 " + issue + " 期历史回放完成，公告号码为 " + number + "。" : "本次模拟号码为 " + number + "。";
  status.textContent += "和值 " + sum + "。";
  button.firstChild.textContent = issue ? "开始摇奖 " : "再摇一次 ";
  const focusOnPause = document.activeElement === pauseButton;
  playback = null;
  setBusy(false);
  if (focusOnPause) trigger.focus({preventScroll:true});
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
function animate(draw, trigger) {
  playback?.pause();
  currentDraw = draw;
  visualSource.dataset.visualRun = String(++visualRun);
  visualSource.dataset.visualElapsed = "0";
  visualSource.dataset.visualPhase = "mixing";
  restartButton.disabled = false;
  const {number, issue} = draw;
  const moveFocus = document.activeElement === trigger && !reducedMotion.matches;
  setBusy(true);
  if (moveFocus) pauseButton.focus({preventScroll:true});
  const simulationTitle = trigger === restartButton ? "重播本次模拟" : "本次模拟号码";
  document.querySelector("#result-title").textContent = issue ? "历史回放 · 第 " + issue + " 期" : simulationTitle;
  sumDisplay.textContent = "本次和值：–";
  resetBalls();
  for (const outlet of outlets) outlet.textContent = "";
  for (const slot of outputs) slot.textContent = "–";
  indicator.textContent = "混球中";
  status.textContent = issue ? "正在回放已公布的号码。" : "正在混球，准备依次出球。";
  let shown = 0;
  playback = playFrames(Number(speed.value), elapsed => {
    visualSource.dataset.visualElapsed = String(Math.max(0,Math.min(elapsed,2300)));
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
        const angle = i * 2.4 + g + elapsed * (.0035 + i * .00012);
        const radius = 19 + 18 * Math.sin(i * 1.7 + elapsed * .0015);
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        // In the final quarter-second the selected ball travels to the top outlet.
        const lift = i === Number(number[g]) ? Math.max(0,(elapsed - (850 + g*600))/250) : 0;
        position(ball,x + (50-x)*lift,y + (5-y)*lift);
      });
    }
    return false;
  });
}
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
// Restore the last completed simulation without starting a new draw or changing the archive.
if (records.length) {
  const {number,sum} = records[0];
  for (let i=0;i<outputs.length;i++) {
    outputs[i].textContent = number[i];
    outlets[i].textContent = number[i];
    groups[i][Number(number[i])].style.visibility = "hidden";
  }
  sumDisplay.textContent = "本次和值：" + sum;
  document.querySelector("#result-title").textContent = "最近一次模拟号码";
  indicator.textContent = "已恢复存档";
  status.textContent = "准备就绪。已恢复最近一次模拟及本机记录。";
} else {
  status.textContent = "准备就绪。";
}
button.addEventListener("click", startDraw);
button.disabled = false;
