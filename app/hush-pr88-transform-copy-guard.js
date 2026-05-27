export const HUSH_PR88_TRANSFORM_COPY_GUARD_VERSION = 'pr88.4-disabled-no-fallback';

// PR88 is intentionally inert. Transform timing now belongs to hush-patch38 directly.
// This prevents any local fallback rewrite from appearing when the generator returns no approved candidate.

if (typeof document !== 'undefined') {
  document.body?.setAttribute('data-hush-pr88-disabled', 'true');
}
