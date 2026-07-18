export const ASH_EMERGENCY_STABILITY_EPOCH = 'td613.ash.emergency-stability/2026-07-18-v5';

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Preserve the established browser-flight attribute while exposing the stronger emergency contract separately.
  document.documentElement.dataset.ashFlickerHardening = 'td613.ash.flicker-hardening/v0.1-static-compositor';
  document.documentElement.dataset.ashEmergencyStability = ASH_EMERGENCY_STABILITY_EPOCH;
  window.__td613AshEmergencyStability = Object.freeze({
    version: ASH_EMERGENCY_STABILITY_EPOCH,
    cache_epoch: '20260718-emergency-stability-v5',
    motion_policy: 'STATIC_SURFACE',
    close_policy: 'SAVE_RELEASE_POINTER_RETURN_TO_MEMBRANE'
  });
}
