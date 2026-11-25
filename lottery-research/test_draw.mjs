import assert from "node:assert/strict";
import test from "node:test";
import {drawNumber} from "./draw-machine.mjs";

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
