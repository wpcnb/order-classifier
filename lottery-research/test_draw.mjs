import assert from "node:assert/strict";
import test from "node:test";
import {drawNumber} from "./draw-machine.mjs";
import {playFrames} from "./playback.mjs";
import {drawSum} from "./draw-sum.mjs";

test("every ordered triplet including 000 and 007 is reachable", () => {
  for (let i=0; i<1000; i++) {
    const result = String(i).padStart(3,"0");
    assert.equal(drawNumber(bytes => bytes.set([...result].map(Number))),result);
  }
});
test("each digit has equal byte multiplicity; rejected bytes never fill a position", () => {
  const counts = Array(10).fill(0);
  for (let value=0; value<250; value++) {
    const result = drawNumber(bytes => bytes.fill(value));
    assert.equal(result,String(value % 10).repeat(3));
    counts[Number(result[0])]++;
  }
  assert.deepEqual(counts,Array(10).fill(25));
  const batches = [[250,251,252],[253,254,255],[0,255,0],[7,255,255]];
  assert.equal(drawNumber(bytes => bytes.set(batches.shift())),"007");
  assert.equal(batches.length,0);
});

test("half-speed playback freezes exactly at the last shown frame and completes once", () => {
  let now = 0;
  let handle = 0;
  const pending = new Map();
  const clock = {
    performance: {now: () => now},
    requestAnimationFrame(callback) { pending.set(++handle, callback); return handle; },
    cancelAnimationFrame(id) { pending.delete(id); }
  };
  function advance(ms) {
    now += ms;
    const batch = [...pending.values()];
    pending.clear();
    batch.forEach(callback => callback(now));
  }
  const samples = [];
  const controls = playFrames(.5, elapsed => {
    samples.push(elapsed);
    return elapsed >= 2300;
  }, clock);
  controls.pause();
  advance(4000);
  assert.deepEqual(samples, []);
  controls.resume();
  advance(2200);
  controls.pause();
  controls.pause();
  advance(5000);
  assert(controls.paused);
  assert.deepEqual(samples, [1100]);
  controls.resume();
  controls.resume();
  advance(1200);
  advance(1200);
  controls.resume();
  advance(1000);
  assert(!controls.paused);
  assert.equal(pending.size, 0);
  assert.deepEqual(samples, [1100,1700,2300]);
});


test("draw sum handles all 1000 triplets, including leading zeros and repeats", () => {
  const counts = Array(28).fill(0);
  for (let i=0; i<1000; i++) {
    const sum = drawSum(String(i).padStart(3,"0"));
    assert.equal(sum, Math.floor(i/100) + Math.floor(i/10)%10 + i%10);
    counts[sum]++;
  }
  assert.deepEqual(counts, [...counts].reverse());
  assert.equal(counts[0],1);
  assert.equal(counts[27],1);
  assert.equal(counts[13],75);
  assert.equal(counts[14],75);
  for (const invalid of ["","12","1234","12a",123,null,"１２３"]) assert.throws(() => drawSum(invalid),TypeError);
});

import {readArchive,saveArchive} from "./simulation-archive.mjs";
test("archive persists, merges, deduplicates, limits and protects corrupt data",()=>{
 const storage={value:null,getItem(){return this.value},setItem(key,value){this.value=value}};
 const row={id:"a".repeat(32),at:"2026-11-26T03:00:00.000Z",number:"007",sum:99};
 assert.deepEqual(readArchive(storage),[]);
 assert.equal(saveArchive(storage,[row])[0].sum,7);
 assert.equal(readArchive(storage)[0].number,"007");
 assert.equal(saveArchive(storage,[row]).length,1);
 const other={...row,id:"b".repeat(32),number:"000",at:"2026-11-26T03:01:00.000Z"};
 assert.equal(saveArchive(storage,[other])[0].number,"000");
 assert.equal(readArchive(storage).length,2);
 const bulk=Array.from({length:1002},(_,i)=>({id:i.toString(16).padStart(32,"0"),at:new Date(1800000000000+i*1000).toISOString(),number:"999"}));
 assert.equal(saveArchive(storage,bulk).length,1000);
 assert.equal(readArchive(storage)[0].sum,27);
 storage.value="{broken";
 assert.throws(()=>saveArchive(storage,[row]));
 assert.equal(storage.value,"{broken");
});

import {mapBall,outletDigit,CHAMBER_CENTERS,CHAMBER_Y,CHAMBER_RADIUS,BALL_RADIUS} from "./view3d-state.mjs";
test("3D adapter keeps every projected ball within its display chamber",()=>{
  for(let i=0;i<3;i++)for(let d=0;d<10;d++)for(let x=-10;x<=110;x+=10)for(let y=-10;y<=110;y+=10){
    const p=mapBall(i,d,x+"%",y+"%");
    assert.ok(p.every(Number.isFinite));
    assert.ok(Math.hypot(p[0]-CHAMBER_CENTERS[i],p[1]-CHAMBER_Y,p[2]) <= CHAMBER_RADIUS-BALL_RADIUS+1e-10);
  }
  assert.deepEqual(mapBall(1,0,"bad",null),mapBall(1,0,"50%","50%"));
  assert.throws(()=>mapBall(3,0,"50%","50%"),RangeError);
  for(let i=0;i<10;i++)assert.equal(outletDigit(String(i)),i);
  for(const v of ["","10","–",null,0])assert.equal(outletDigit(v),null);
});

import {recentFrequency,positionModeLabel} from "./recent-frequency.mjs";
test("frequency uses all retained records, including those outside the visible ten",()=>{
  const numbers=["007","007","007","007","007","007","123","123","456","789",...Array(11).fill("999")];
  const s=recentFrequency(numbers);
  assert.equal(s.sampleSize,21);
  assert.equal(s.digitCount,63);
  assert.equal(positionModeLabel(s.positionModes),"999");
  assert.deepEqual(s.sumMode,{values:[27],count:11});
  assert.deepEqual(s.digitMode,{values:[9],count:34});
  assert.equal(s.overall.reduce((a,b)=>a+b),63);
  assert.equal(s.sums.reduce((a,b)=>a+b),21);
  for(const p of s.positions)assert.equal(p.reduce((a,b)=>a+b),21);
  assert.equal(numbers.length,21);
});
test("recent frequency preserves ties, zeros, partial and empty samples",()=>{
  const s=recentFrequency(["000","111"]);
  assert.equal(positionModeLabel(s.positionModes),"[0/1][0/1][0/1]");
  assert.deepEqual(s.sumMode,{values:[0,3],count:1});
  assert.deepEqual(s.digitMode,{values:[0,1],count:3});
  const e=recentFrequency([]);
  assert.equal(positionModeLabel(e.positionModes),"—");
  assert.deepEqual(e.sumMode,{values:[],count:0});
  assert.deepEqual(e.digitMode,{values:[],count:0});
  assert.throws(()=>recentFrequency(["7"]),TypeError);
  assert.throws(()=>recentFrequency([7]),TypeError);
});

import {PI_DISPLAY,TAU,radians,mixingOrbit,stirringField} from "./circular-motion.mjs";
test("pi-based visual orbit is periodic and bounded",()=>{
  assert.equal(PI_DISPLAY,"3.1415926");
  assert.equal(TAU,2*Math.PI);
  assert.equal(radians(.5),Math.PI);
  assert.ok(Math.abs(radians(100.25)-Math.PI/2)<1e-10);
  for(let g=0;g<3;g++)for(let i=0;i<10;i++)for(let t=0;t<=2300;t+=20){
    const [x,y]=mixingOrbit(g,i,t);
    assert.ok(Number.isFinite(x)&&Number.isFinite(y));
    assert.ok(Math.hypot(x-50,y-50)<=37+1e-9);
    const [ax,ay,az]=stirringField((x-50)/50,(y-50)/50,.2,t/1000,g,i);
    assert.ok([ax,ay,az].every(Number.isFinite));
    assert.ok(Math.hypot(ax,az)<=2.55+1e-9&&ay>=1.7-1e-9&&ay<=8.4+1e-9);
  }
  assert.notDeepEqual(mixingOrbit(0,0,0),mixingOrbit(0,0,100));
  assert.throws(()=>mixingOrbit(0,10,0),RangeError);
  assert.throws(()=>radians(Infinity),RangeError);
});
