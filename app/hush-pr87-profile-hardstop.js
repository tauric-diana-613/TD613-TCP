export const HUSH_PR87_PROFILE_HARDSTOP_VERSION = 'pr87.3-disabled-pr76-owns-profile';

// PR87 is intentionally inert. PR76 owns the Authorship Profile and Suggested Masks surfaces.
// Keeping this module as a no-op prevents older boot stacks from fighting PR76 and causing profile blink.

if (typeof document !== 'undefined') {
  document.body?.setAttribute('data-hush-pr87-disabled', 'true');
}
