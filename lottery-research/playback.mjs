// Count only the animation time shown to the player. A pause freezes the last painted frame.
export function playFrames(rate, paint, clock = globalThis) {
  let elapsed = 0;
  let previousTime;
  let pending = null;
  let finished = false;

  function frame(now) {
    elapsed += Math.max(0, now - previousTime) * rate;
    previousTime = now;
    finished = paint(elapsed);
    pending = finished ? null : clock.requestAnimationFrame(frame);
  }

  function resume() {
    if (finished || pending !== null) return;
    previousTime = clock.performance.now();
    pending = clock.requestAnimationFrame(frame);
  }

  resume();
  return {
    get paused() { return !finished && pending === null; },
    pause() {
      if (pending === null) return;
      clock.cancelAnimationFrame(pending);
      pending = null;
    },
    resume
  };
}
