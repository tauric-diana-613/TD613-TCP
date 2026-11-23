/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Deterministic Cryptographic Counter-Mode PRNG (Zero Math.random())
 *
 * Uses buffered SHA-256 counter-mode blocks (8 uint32 words per 256-bit digest)
 * keyed by explicit preregistered seed strings for fast, 100% reproducible draws.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import crypto from 'node:crypto';

export function sha256Hex(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export class DeterministicRng {
  constructor(seedString) {
    if (!seedString || typeof seedString !== 'string') {
      throw new TypeError('DeterministicRng requires a non-empty seed string.');
    }
    this.seedString = seedString;
    this.blockCounter = 0;
    this.pool = null;
    this.poolOffset = 32;
    this.spareNormal = null;
  }

  fork(subLabel) {
    return new DeterministicRng(`${this.seedString}::${subLabel}`);
  }

  _refillPool() {
    this.pool = crypto
      .createHash('sha256')
      .update(`${this.seedString}#${this.blockCounter}`, 'utf8')
      .digest();
    this.blockCounter += 1;
    this.poolOffset = 0;
  }

  nextUint32() {
    if (!this.pool || this.poolOffset > 28) {
      this._refillPool();
    }
    const val = this.pool.readUInt32BE(this.poolOffset);
    this.poolOffset += 4;
    return val;
  }

  /** Uniform in [0, 1) with 53-bit precision */
  nextFloat() {
    const hi = this.nextUint32() >>> 5; // 27 bits
    const lo = this.nextUint32() >>> 6; // 26 bits
    return (hi * 67108864 + lo) / 9007199254740992; // 2^53
  }

  nextRange(min, max) {
    return min + (max - min) * this.nextFloat();
  }

  nextInt(minInclusive, maxExclusive) {
    const span = maxExclusive - minInclusive;
    if (!Number.isInteger(span) || span <= 0) {
      throw new RangeError(`Invalid integer span [${minInclusive}, ${maxExclusive})`);
    }
    return minInclusive + Math.floor(this.nextFloat() * span);
  }

  nextNormal(mean = 0, std = 1) {
    if (this.spareNormal !== null) {
      const z = this.spareNormal;
      this.spareNormal = null;
      return mean + std * z;
    }
    let u = 0;
    while (u <= 1e-15) u = this.nextFloat();
    const v = this.nextFloat();
    const mag = Math.sqrt(-2.0 * Math.log(u));
    const z0 = mag * Math.cos(2.0 * Math.PI * v);
    const z1 = mag * Math.sin(2.0 * Math.PI * v);
    this.spareNormal = z1;
    return mean + std * z0;
  }

  shuffle(items) {
    const arr = Array.from(items);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  choice(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new RangeError('Cannot choose from empty array.');
    }
    return items[this.nextInt(0, items.length)];
  }
}
