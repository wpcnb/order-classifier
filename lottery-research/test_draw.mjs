import assert from "node:assert/strict";
import test from "node:test";
import {drawNumber} from "./draw-machine.mjs";
import {playFrames} from "./playback.mjs";

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
