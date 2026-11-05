/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Deterministic Cryptographic Counter-Mode PRNG (Zero Math.random())
 *
 * All world parameters, variable permutations, historical trial realizations,
 * Common Random Number (CRN) observation noise draws, randomized control choices,
 * and paired bootstrap confidence intervals derive strictly from SHA-256 / HMAC-SHA256
 * streams keyed by explicit preregistered seed strings.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import crypto from 'node:crypto';

export function sha256Hex(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function hmacSha256Buffer(key, message) {
  return crypto.createHmac('sha256', String(key)).update(String(message), 'utf8').digest();
}

export class DeterministicRng {
  constructor(seedString) {
    if (!seedString || typeof seedString !== 'string') {
      throw new TypeError('DeterministicRng requires a non-empty seed string.');
    }
    this.seedString = seedString;
    this.key = crypto.createHash('sha256').update(seedString, 'utf8').digest();
    this.counter = 0n;
    this.spareNormal = null;
  }

  fork(subLabel) {
    return new DeterministicRng(`${this.seedString}::${subLabel}`);
  }

  nextUint32() {
    const block = crypto
      .createHmac('sha256', this.key)
      .update(this.counter.toString(10), 'utf8')
      .digest();
    this.counter += 1n;
    return block.readUInt32BE(0);
  }

  /** Uniform in [0, 1) with 53-bit precision */
  nextFloat() {
    const block = crypto
      .createHmac('sha256', this.key)
      .update(this.counter.toString(10), 'utf8')
      .digest();
    this.counter += 1n;
    const hi = block.readUInt32BE(0) >>> 5; // 27 bits
    const lo = block.readUInt32BE(4) >>> 6; // 26 bits
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
    let v = 0;
    while (u <= 1e-15) u = this.nextFloat();
    v = this.nextFloat();
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
