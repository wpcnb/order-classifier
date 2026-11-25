import {drawNumber} from "./draw-machine.mjs";

const button = document.querySelector("#draw");
const status = document.querySelector(".status");
const indicator = document.querySelector("#machine-state");
const outputs = [...document.querySelectorAll(".output b")];
const outlets = [...document.querySelectorAll(".neck")];
const history = document.querySelector("#history");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const places = ["百位", "十位", "个位"];
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
  document.querySelector("#replay").disabled = busy;
  document.querySelector("#replay-issue").disabled = busy;
}
function finish(number, issue) {
  if (!issue) {
    const item = document.createElement("li");
    item.textContent = number;
    history.prepend(item);
    if (history.children.length > 10) history.lastElementChild.remove();
    document.querySelector("#empty-history").hidden = true;
  }
  indicator.textContent = issue ? "回放完成" : "已出球";
  status.textContent = issue ? "第 " + issue + " 期历史回放完成，公告号码为 " + number + "。" : "本次模拟号码为 " + number + "。";
  button.firstChild.textContent = issue ? "开始摇奖 " : "再摇一次 ";
  setBusy(false);
}
export function replayDraw(row) {
  if (!button.disabled) animate(row.number,row.issue);
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
  animate(number,null);
}
function animate(number,issue) {
  setBusy(true);
  document.querySelector("#result-title").textContent = issue ? "历史回放 · 第 " + issue + " 期" : "本次模拟号码";
  resetBalls();
  for (const outlet of outlets) outlet.textContent = "";
  for (const slot of outputs) slot.textContent = "–";
  indicator.textContent = "混球中";
  status.textContent = issue ? "正在回放已公布的号码。" : "正在混球，准备依次出球。";
  let shown = 0;
  const start = performance.now();
  function frame(now) {
    const elapsed = now - start;
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
    if (shown === 3) { finish(number,issue); return; }
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
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
button.addEventListener("click", startDraw);
button.disabled = false;
status.textContent = "准备就绪。";
