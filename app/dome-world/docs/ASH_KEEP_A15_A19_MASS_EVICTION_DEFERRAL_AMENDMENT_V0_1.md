𝌋‌

# Ash Keep A15–A19 Mass-Eviction Deferral Amendment v0.1

**Namespace:** U+10D613 — Tauric Diana 613  
**Status:** OPERATOR-AUTHORED / IMPLEMENTATION-GOVERNING / HUMAN-GATED  
**Date:** 2026-07-27

## Controlling amendment

The operator defers the single graph-wide mass eviction previously reserved for A15 postclosure. The July 24 A12–A15 Operator Amendment remains preserved as historical law, but its requirement that the eviction become the final mutation before the A15 production release is superseded by this amendment.

A15 may proceed to one bounded Vercel production release after:

1. the review-release source head passes the repository's static contracts;
2. the exact source head passes the required Chromium, Firefox, and WebKit premerge witness;
3. the merged main commit remains exact to that tested head; and
4. the operator authorizes the existing bounded Vercel release gate.

The A15 review release MUST use ordinary monotonic asset-version advancement only. It MUST retain the accepted A11 postclosure cache epoch and MUST NOT execute a new graph-wide cache flush, clear browser CacheStorage, unregister service workers, alter the visible canonical URL, erase IndexedDB, erase local custodial state, or reset an active local case.

The deferred graph-wide mass eviction is reserved for **A19 postclosure**, after the operator has had a production review opportunity across the A15–A19 leg. It becomes a separate exact-head tested maintenance mutation before the next production leg. It may not be smuggled into A16, A17, A18, or an ordinary review deployment.

## Reason for deferral

The A15 pre-release evidence separated two concerns that had been coupled:

- the canonical Flow-Core field required a bounded portal-owner repair;
- the remaining Firefox hold arose from witness-budget mismatch, not from stale-cache behavior.

Chromium and WebKit observed one connected and visible canonical field after the Choir → Capsule route without proving that a new mass eviction was necessary. The eviction therefore remains cache-coherence maintenance rather than a prerequisite for first production review.

## Preserved invariants

- accepted mass-eviction epoch during A15 review release: `td613.ash.cache-flush/2026-07-24-a11-postclosure-v1`;
- new A15 graph-wide cache flush: false;
- CacheStorage clearing newly authorized: false;
- service-worker unregistration newly authorized: false;
- IndexedDB deletion authorized: false;
- active local case reset authorized: false;
- Flow-Core commands Ash: false;
- Ash custody authority changed: false;
- raw-content transport added: false;
- release authority widened: false;
- human closure required: true.

Superseding placement: A15 review release now precedes operator review; the single graph-wide mass eviction moves to A19 postclosure.

Sealed ⟐
