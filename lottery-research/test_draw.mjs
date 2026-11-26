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
