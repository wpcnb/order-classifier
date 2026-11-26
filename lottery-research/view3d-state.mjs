// Pure presentation adapter. No sampling, storage, or physical outcome selection.
export const CHAMBER_CENTERS = Object.freeze([-2.45, 0, 2.45]);
export const CHAMBER_Y = 2.15;
export const CHAMBER_RADIUS = 0.96;
export const BALL_RADIUS = 0.145;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function percent(value) {
  if (typeof value !== "string" || !value.endsWith("%")) return 50;
  const n = Number(value.slice(0,-1));
  return Number.isFinite(n) ? clamp(n,0,100) : 50;
}

// Constrain projected positions to the spherical display chamber. The depth
// is illustrative, not computed from measurements or a physical engine.
export function mapBall(index, digit, left, top) {
  if (!Number.isInteger(index) || index < 0 || index > 2 ||
      !Number.isInteger(digit) || digit < 0 || digit > 9) throw new RangeError("Invalid ball");
  const limit = CHAMBER_RADIUS - BALL_RADIUS;
  let x = (percent(left)-50)*CHAMBER_RADIUS/50;
  let y = (50-percent(top))*CHAMBER_RADIUS/50;
  const length = Math.hypot(x,y);
  if (length > limit) {
    x *= limit / length;
    y *= limit / length;
  }
  const remaining = Math.sqrt(Math.max(0,limit*limit-x*x-y*y));
  const z = Math.sin(digit*2.4+index)*remaining*.48;
  return [CHAMBER_CENTERS[index]+x, CHAMBER_Y+y, z];
}

export function outletDigit(text) {
  return typeof text === "string" && /^[0-9]$/.test(text) ? Number(text) : null;
}
