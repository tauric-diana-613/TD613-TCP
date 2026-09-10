/**
 * One finite, view-owned clock for Loom's admitted semantic packet.
 * Render passes project a shared immutable snapshot; they own neither clocks
 * nor evidence authority. Continuous decorative/request motion is an explicit
 * opt-in on this same owner; semantic progress remains finite.
 */

function boundedNumber(value, name, minimum, maximum) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new TypeError(`${name} must be a finite number in [${minimum}, ${maximum}]`);
  }
  return value;
}

function frozenJson(value, ancestors = new Set(), depth = 0, budget = { remaining: 20000 }) {
  if (--budget.remaining < 0 || depth > 40) throw new TypeError('packet exceeds the bounded JSON budget');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || ancestors.has(value)) throw new TypeError('packet must contain acyclic JSON data');
  if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError('packet must contain plain JSON objects');
  }
  ancestors.add(value);
  const result = Array.isArray(value)
    ? value.map((entry) => frozenJson(entry, ancestors, depth + 1, budget))
    : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, frozenJson(entry, ancestors, depth + 1, budget)]));
  ancestors.delete(value);
  return Object.freeze(result);
}

function packetSeed(packet) {
  const seed = packet.replay?.seed ?? packet.receipt?.replay?.seed;
  if ((typeof seed === 'number' && Number.isFinite(seed)) || typeof seed === 'string') return seed;
  // A deterministic layout seed, not a receipt digest or provenance claim.
  let hash = 2166136261;
  for (const character of packet.scene.id) hash = Math.imul(hash ^ character.codePointAt(0), 16777619) >>> 0;
  return hash;
}

export class AnimationCoordinator {
  #requestFrame;
  #cancelFrame;
  #now;
  #onState;
  #durationMs;
  #frameInterval;
  #passes = new Map();
  #packet = null;
  #viewport = Object.freeze({ width: 1, height: 1, dpr: 1 });
  #timeMs = 0;
  #motionTimeMs = 0;
  #anchorMotionTime = 0;
  #continuous = false;
  #playing = false;
  #reducedMotion = false;
  #visible = true;
  #resumeOnVisible = false;
  #pending = null;
  #anchorWall = 0;
  #anchorTime = 0;
  #lastRenderWall = -Infinity;
  #frameCount = 0;
  #rendering = false;
  #destroyed = false;

  constructor({
    requestFrame = (callback) => globalThis.requestAnimationFrame(callback),
    cancelFrame = (id) => globalThis.cancelAnimationFrame(id),
    now = () => globalThis.performance.now(),
    durationMs = 2600,
    maxFps = 30,
    onState,
  } = {}) {
    for (const [name, callback] of Object.entries({ requestFrame, cancelFrame, now })) {
      if (typeof callback !== 'function') throw new TypeError(`${name} must be a function`);
    }
    if (onState !== undefined && typeof onState !== 'function') throw new TypeError('onState must be a function');
    this.#durationMs = boundedNumber(durationMs, 'durationMs', 1, 60000);
    this.#frameInterval = 1000 / boundedNumber(maxFps, 'maxFps', 1, 120);
    this.#requestFrame = requestFrame;
    this.#cancelFrame = cancelFrame;
    this.#now = now;
    this.#onState = onState;
  }

  #assertActive() {
    if (this.#destroyed) throw new Error('AnimationCoordinator is destroyed');
  }

  #assertWritable() {
    this.#assertActive();
    if (this.#rendering) throw new Error('Render passes may project state, not replace it during a render');
  }

  #readNow() {
    return boundedNumber(this.#now(), 'clock time', 0, Number.MAX_SAFE_INTEGER);
  }

  #isStatic() {
    return this.#reducedMotion || this.#packet?.geometry?.rest === true;
  }

  #cancelPending() {
    const pending = this.#pending;
    // Invalidate before cancellation: even a stale callback cannot revive us.
    this.#pending = null;
    if (pending !== null) this.#cancelFrame(pending.id);
  }

  #stop() {
    this.#playing = false;
    this.#resumeOnVisible = false;
    this.#cancelPending();
  }

  #notify() {
    if (!this.#destroyed) this.#onState?.(this.inspect());
  }

  #render() {
    if (!this.#packet || this.#destroyed) return;
    const snapshot = Object.freeze({
      packet: this.#packet,
      timeMs: this.#timeMs,
      motionTimeMs: this.#motionTimeMs,
      progress: this.#timeMs / this.#durationMs,
      viewport: this.#viewport,
      reducedMotion: this.#reducedMotion,
      rest: this.#packet.geometry?.rest === true,
      seed: packetSeed(this.#packet),
    });
    this.#frameCount += 1;
    this.#rendering = true;
    try {
      // Registration changes take effect next render. All current passes see
      // the very same snapshot, not independently sampled world states.
      for (const { callback } of [...this.#passes.values()]) {
        if (this.#destroyed) break;
        callback(snapshot);
      }
    } catch (error) {
      this.#stop();
      throw error;
    } finally {
      this.#rendering = false;
    }
    try {
      this.#notify();
    } catch (error) {
      this.#stop();
      throw error;
    }
  }

  #schedule() {
    if (this.#pending || !this.#playing || !this.#visible || this.#destroyed || this.#isStatic()) return;
    const pending = { id: null };
    this.#pending = pending;
    try {
      pending.id = this.#requestFrame(() => {
        if (this.#pending !== pending || this.#destroyed) return;
        this.#pending = null;
        if (!this.#playing || !this.#visible || this.#isStatic()) return;
        try {
          const wall = this.#readNow();
          const elapsed = Math.max(0, wall - this.#anchorWall);
          const nextTime = Math.min(this.#durationMs, Math.max(this.#timeMs, this.#anchorTime + elapsed));
          if ((nextTime === this.#durationMs && this.#timeMs < this.#durationMs) || wall - this.#lastRenderWall >= this.#frameInterval) {
            this.#timeMs = nextTime;
            this.#motionTimeMs = this.#anchorMotionTime + elapsed;
            this.#lastRenderWall = wall;
            if (nextTime === this.#durationMs && !this.#continuous) this.#playing = false;
            this.#render();
          }
          this.#schedule();
        } catch (error) {
          this.#stop();
          throw error;
        }
      });
      this.#notify();
    } catch (error) {
      this.#pending = null;
      this.#playing = false;
      throw error;
    }
  }

  registerPass(name, callback) {
    this.#assertActive();
    if (typeof name !== 'string' || !name.trim() || typeof callback !== 'function') {
      throw new TypeError('A render pass needs a nonempty name and a function');
    }
    if (this.#passes.has(name)) throw new Error(`Render pass already registered: ${name}`);
    const registration = { callback };
    this.#passes.set(name, registration);
    return () => {
      if (this.#passes.get(name) === registration) this.#passes.delete(name);
    };
  }

  setPacket(packet, { animate = true } = {}) {
    this.#assertWritable();
    if (typeof animate !== 'boolean') throw new TypeError('animate must be boolean');
    if (!packet || typeof packet.scene?.id !== 'string' || !packet.scene.id.trim()) {
      throw new TypeError('A semantic packet needs scene.id');
    }
    const admittedPacket = frozenJson(packet);
    const wall = this.#readNow();
    this.#stop();
    this.#packet = admittedPacket;
    this.#timeMs = animate && !this.#isStatic() ? 0 : this.#durationMs;
    this.#playing = animate && !this.#isStatic() && this.#visible;
    this.#resumeOnVisible = animate && !this.#isStatic() && !this.#visible;
    this.#anchorWall = wall;
    this.#anchorTime = this.#timeMs;
    this.#anchorMotionTime = this.#motionTimeMs;
    this.#lastRenderWall = wall;
    this.#render();
    this.#schedule();
  }

  seek(timeMs) {
    this.#assertWritable();
    if (typeof timeMs !== 'number' || !Number.isFinite(timeMs)) throw new TypeError('timeMs must be finite');
    this.#stop();
    this.#timeMs = this.#isStatic() ? this.#durationMs : Math.max(0, Math.min(this.#durationMs, timeMs));
    this.#motionTimeMs = this.#timeMs;
    this.#render();
  }

  play() {
    this.#assertWritable();
    if (!this.#packet || this.#playing || this.#isStatic()) return;
    if (!this.#visible) {
      this.#resumeOnVisible = true;
      this.#notify();
      return;
    }
    const wall = this.#readNow();
    const replay = this.#timeMs >= this.#durationMs && !this.#continuous;
    if (replay) this.#timeMs = 0;
    this.#anchorTime = this.#timeMs;
    this.#anchorMotionTime = this.#motionTimeMs;
    this.#anchorWall = wall;
    this.#lastRenderWall = wall;
    this.#playing = true;
    if (replay) this.#render();
    else this.#notify();
    this.#schedule();
  }

  /** Explicit view-owned motion; never alters packet authority or progress. */
  setContinuous(continuous) {
    this.#assertWritable();
    if (typeof continuous !== 'boolean') throw new TypeError('continuous must be boolean');
    if (continuous === this.#continuous) return;
    this.#continuous = continuous;
    if (!continuous && this.#timeMs >= this.#durationMs) this.pause();
    else if (continuous) this.play();
  }

  pause() {
    this.#assertActive();
    this.#stop();
    this.#notify();
  }

  reset() {
    this.seek(0);
  }

  setReducedMotion(reducedMotion) {
    this.#assertWritable();
    if (typeof reducedMotion !== 'boolean') throw new TypeError('reducedMotion must be boolean');
    if (reducedMotion === this.#reducedMotion) return;
    this.#reducedMotion = reducedMotion;
    if (reducedMotion) {
      this.#stop();
      this.#timeMs = this.#durationMs;
    }
    this.#render();
  }

  setVisible(visible) {
    this.#assertWritable();
    if (typeof visible !== 'boolean') throw new TypeError('visible must be boolean');
    if (visible === this.#visible) return;
    this.#visible = visible;
    if (!visible) {
      const resume = this.#playing;
      this.#stop();
      this.#resumeOnVisible = resume;
      this.#notify();
    } else {
      const resume = this.#resumeOnVisible;
      this.#resumeOnVisible = false;
      if (resume) this.play();
      else this.#notify();
    }
  }

  setViewport({ width, height, dpr = 1 }) {
    this.#assertWritable();
    const viewport = Object.freeze({
      width: boundedNumber(width, 'width', 1, 32768),
      height: boundedNumber(height, 'height', 1, 32768),
      dpr: boundedNumber(dpr, 'dpr', 0.1, 8),
    });
    if (Object.keys(viewport).every((key) => viewport[key] === this.#viewport[key])) return;
    this.#viewport = viewport;
    this.#render();
  }

  inspect() {
    return Object.freeze({
      pendingFrames: this.#pending === null ? 0 : 1,
      timeMs: this.#timeMs,
      durationMs: this.#durationMs,
      motionTimeMs: this.#motionTimeMs,
      continuous: this.#continuous,
      playing: this.#playing,
      reducedMotion: this.#reducedMotion,
      visible: this.#visible,
      passCount: this.#passes.size,
      frameCount: this.#frameCount,
      destroyed: this.#destroyed,
    });
  }

  destroy() {
    if (this.#destroyed) return;
    this.#stop();
    this.#passes.clear();
    this.#packet = null;
    this.#destroyed = true;
  }
}
