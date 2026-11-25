import {replayDraw} from "./draw-ui.mjs";

const meta = document.querySelector("#official-meta");
const cacheKey = "fc3d-verified-draws-v1";

function verified(data) {
  if (!Number.isFinite(Date.parse(data?.updatedAt)) || !Array.isArray(data?.records) || data.records.length !== 100) return false;
  return data.records.every((row, i, rows) => {
    if (!row || typeof row.issue !== "string" || !/^[0-9]{7}$/.test(row.issue) || !/^[0-9]{3}$/.test(row.number) ||
        typeof row.number !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(row.date) ||
        !/^https:\/\/www\.jslottery\.com\/winning_detail\?id=[0-9]+&locale=zh-CN$/.test(row.source)) return false;
    if (!i) return true;
    const newer = rows[i-1];
    const adjacent = newer.issue.slice(0,4) === row.issue.slice(0,4)
      ? Number(newer.issue) === Number(row.issue) + 1
      : Number(newer.issue.slice(0,4)) === Number(row.issue.slice(0,4)) + 1 && newer.issue.endsWith("001");
    return newer.date > row.date && adjacent;
  });
}

async function snapshot() {
  try {
    const response = await fetch(new URL("./official-draws.json", import.meta.url), {cache:"no-cache"});
    if (!response.ok) throw Error("快照不可用");
    const data = await response.json();
    if (!verified(data)) throw Error("快照校验失败");
    try {
      const serialized = JSON.stringify(data);
      if (localStorage.getItem(cacheKey) !== serialized) localStorage.setItem(cacheKey,serialized);
    } catch { /* The published snapshot also works without device storage. */ }
    return {data,cached:false};
  } catch {
    const data = JSON.parse(localStorage.getItem(cacheKey));
    if (!verified(data)) throw Error("没有可用的已核验快照");
    return {data,cached:true};
  }
}

function analyze(rows) {
 const positions=Array.from({length:3},()=>Array(10).fill(0)), sums=Array(28).fill(0), spans=Array(10).fill(0), parity=Array(4).fill(0), size=Array(4).fill(0), forms=Array(3).fill(0);
 for (const row of rows) {
  const d=row.number.split("").map(Number);
  d.forEach((v,i)=>positions[i][v]++);
  sums[d.reduce((a,b)=>a+b,0)]++;
  spans[Math.max(...d)-Math.min(...d)]++;
  parity[d.filter(n=>n%2===1).length]++;
  size[d.filter(n=>n>=5).length]++;
  forms[new Set(d).size-1]++;
 }
 return {positions,sums,spans,parity,size,forms};
}
function table(id,caption,headers,rows) {
 const target=document.getElementById(id);
 const cap=target.createCaption();cap.textContent=caption;
 const head=target.createTHead().insertRow();
 headers.forEach(h=>{const th=document.createElement("th");th.scope="col";th.textContent=h;head.append(th)});
 const body=target.createTBody();
 for(const values of rows) { const tr=body.insertRow();for(const v of values){tr.insertCell().append(v);} }
}

function show({data,cached}) {
 const records = data.records;
 const first = records[0], last = records.at(-1);
 const timestamp = data.updatedAt.replace("T"," ").slice(0,16);
 meta.textContent = (cached ? "暂时无法读取线上数据，使用本机已核验快照。" : "显示最近一次核验的公告快照。") +
   last.issue + "—" + first.issue + " 期（" + last.date + " 至 " + first.date + "），共 100 期。快照更新于北京时间 " + timestamp + "。";
 const n=records.length, a=analyze(records), theory=analyze(Array.from({length:1000},(_,i)=>({number:String(i).padStart(3,"0")})));
 const pct=(v,total)=> (100*v/total).toFixed(1)+"%";
 const cell=(v,total)=> v+"（"+pct(v,total)+"）";
 table("position-table","按位置统计（次数 / 占比）",["数字","百位","十位","个位","合计"],Array.from({length:10},(_,d)=>[d,...a.positions.map(p=>cell(p[d],n)),cell(a.positions.reduce((s,p)=>s+p[d],0),n*3)]));
 const dist=(name,labels,k)=>labels.map((label,i)=>[name,label,cell(a[k][i],n),pct(theory[k][i],1000)]);
 table("shape-table","样本与均匀随机理论比较",["类别","分组","历史次数/占比","理论占比"],[...dist("号码形态",["豹子","组三","组六"],"forms"),...dist("奇偶",["0奇3偶","1奇2偶","2奇1偶","3奇0偶"],"parity"),...dist("大小",["0大3小","1大2小","2大1小","3大0小"],"size")]);
 table("sum-table","和值",["和值","历史次数/占比","理论占比"],a.sums.map((v,i)=>[i,cell(v,n),pct(theory.sums[i],1000)]));
 table("span-table","跨度",["跨度","历史次数/占比","理论占比"],a.spans.map((v,i)=>[i,cell(v,n),pct(theory.spans[i],1000)]));

 table("official-table","开奖历史快照",["期号","开奖日期","百十个位","来源"],records.map(r=>{
   const link=document.createElement("a");
   link.href=r.source;
   link.textContent="公告原文";
   link.setAttribute("aria-label","第 "+r.issue+" 期公告原文");
   return [r.issue,r.date,r.number,link];
 }));
 const select=document.querySelector("#replay-issue");
 for (const row of records) select.add(new Option(row.issue+" 期 · "+row.number,row.issue));
 document.querySelector("#replay").addEventListener("click",()=>{
   const row=records.find(r=>r.issue===select.value);
   if(row)replayDraw(row);
 });
 document.querySelector("#replay-options").disabled=false;
}

snapshot().then(show).catch(()=>{
 meta.textContent="历史快照暂时不可用，请稍后刷新。随机摇奖仍可使用。";
});
