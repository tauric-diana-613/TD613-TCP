export const APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE = Object.freeze([
  Object.freeze({ label: 'T0_DOM_READY', targetElapsedMs: 0 }),
  Object.freeze({ label: 'T1_350MS', targetElapsedMs: 350 }),
  Object.freeze({ label: 'T2_1000MS', targetElapsedMs: 1000 }),
  Object.freeze({ label: 'T3_2200MS', targetElapsedMs: 2200 }),
]);

export function remainingWaitMs(targetElapsedMs, observedElapsedMs) {
  const target = Number(targetElapsedMs);
  const observed = Number(observedElapsedMs);
  if (!Number.isFinite(target) || target < 0) throw new TypeError('targetElapsedMs must be a finite non-negative number.');
  if (!Number.isFinite(observed) || observed < 0) throw new TypeError('observedElapsedMs must be a finite non-negative number.');
  return Math.max(0, target - observed);
}

export function sampleTiming(targetElapsedMs, actualElapsedMs) {
  const target = Number(targetElapsedMs);
  const actual = Number(actualElapsedMs);
  if (!Number.isFinite(target) || target < 0) throw new TypeError('targetElapsedMs must be a finite non-negative number.');
  if (!Number.isFinite(actual) || actual < 0) throw new TypeError('actualElapsedMs must be a finite non-negative number.');
  return Object.freeze({
    target_elapsed_ms: target,
    actual_elapsed_ms: actual,
    drift_ms: actual - target,
  });
}
