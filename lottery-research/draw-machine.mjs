// Bytes 0–249 have exactly 25 representatives for each digit.
export function drawNumber(fill = bytes => globalThis.crypto.getRandomValues(bytes)) {
  const digits = [];
  const bytes = new Uint8Array(3);
  while (digits.length < 3) {
    fill(bytes);
    for (const value of bytes) {
      if (value < 250) digits.push(value % 10);
      if (digits.length === 3) break;
    }
  }
  return digits.join("");
}
