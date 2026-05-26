export const HUSH_PR86_PROFILE_RESCUE_VERSION = 'pr86.4-disabled-superseded-by-pr87';

// PR86 is intentionally inert. PR87 owns the message Authorship Profile surface.
// Leaving this module as a no-op prevents older bootstrap versions from loading
// the previous PR86 renderer and clearing PR87 after Analyze.

if (typeof document !== 'undefined') {
  document.body?.setAttribute('data-hush-pr86-disabled', 'true');
}
