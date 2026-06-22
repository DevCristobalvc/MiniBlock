const HEX = '0123456789abcdef';

export function randomHash(length = 64): string {
  let h = '0x';
  for (let i = 0; i < length; i++) {
    h += HEX[Math.floor(Math.random() * 16)];
  }
  return h;
}

export function formatHash(hash: string): string {
  return hash.slice(0, 10) + '...' + hash.slice(-6);
}

export function randomBlockHash(): string {
  return randomHash(64);
}
