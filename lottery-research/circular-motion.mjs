// Circular-motion mathematics for the visual demonstration only.
// Display the requested truncation; use full JavaScript precision internally.
export const PI_DISPLAY="3.1415926";
export const TAU=2*Math.PI;
export const GOLDEN_TURN=(3-Math.sqrt(5))/2;
export function radians(turns){
  if(!Number.isFinite(turns))throw RangeError("Invalid turns");
  return TAU*(turns%1);
}
export function mixingOrbit(chamber,digit,elapsed){
  if(!Number.isInteger(chamber)||chamber<0||chamber>2||
     !Number.isInteger(digit)||digit<0||digit>9||
     !Number.isFinite(elapsed)||elapsed<0)throw RangeError("Invalid orbit");
  const seconds=elapsed/1000;
  const angle=radians(digit*GOLDEN_TURN+chamber/6+seconds*(.56+digit*.019));
  const radius=19+18*Math.sin(radians(digit*.27+seconds*.24));
  return [50+radius*Math.cos(angle),50+radius*Math.sin(angle)];
}
// Prescribed tangential stirring and periodic lift, not a CFD solver.
export function stirringField(x,y,z,time,chamber,digit){
  if(![x,y,z,time,chamber,digit].every(Number.isFinite))throw RangeError("Invalid field");
  const phase=radians(.54*time+digit*GOLDEN_TURN+chamber/3);
  const r=Math.hypot(x,z);
  const denom=Math.max(.18,r);
  const swirl=1.5+.5*Math.sin(phase);
  const pulse=.55*Math.cos(phase);
  const lift=(y<0?7.7:2.4)+.7*Math.sin(phase);
  return [-swirl*z/denom+pulse*Math.cos(phase),lift,swirl*x/denom+pulse*Math.sin(phase)];
}
