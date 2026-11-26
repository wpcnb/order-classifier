export function drawSum(number) {
  if (typeof number !== "string" || !/^[0-9]{3}$/.test(number)) throw new TypeError("Expected three digits");
  return Number(number[0]) + Number(number[1]) + Number(number[2]);
}
