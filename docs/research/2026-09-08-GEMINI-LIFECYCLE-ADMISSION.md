# 𝌋 Gemini lifecycle and credential-visible admission

Successor to the Hush authority consolidation. The historical acquisition is
`2026-09-08-GEMINI-OBSERVATION-2925.json`; it remains an archive and is never
imported into runtime admission.

## Deficit and bounded falsifier

Previously, `resolveGeminiModelPlan` used a pinned order and cooldown state;
provider listing was advisory in readiness. A configured model absent from a
complete credential-scoped listing could still receive automatic generation.
The falsifier is a valid request paired with a complete empty model listing:
any generateContent attempt violates admission. The new hostile test requires
zero generation attempts and an explained 503 hold.

Hush and Khonapolit now acquire listing evidence through the credential-scoped
reader before resolving their generation plans. The reader retains its bounded
watchdog and cache. The request wall clock includes acquisition. GET diagnostics
remain read-only local plans; absent provider evidence, callableModels is empty.
Readiness uses its actual listing when resolving its plans.

Eligibility requires complete successful listing, a non-future observation,
an unexpired interval of at most ten minutes, model membership, compatible
capability, non-shutdown lifecycle, no operator disable, and no active cooldown.
Incomplete or failed acquisition never becomes an empty-but-valid fallback plan.
The caller's maximum model count also bounds callableModels.

## Shared registry

Evidence checked September 8, 2026:
[Google catalog](https://ai.google.dev/gemini-api/docs/models) and
[lifecycle schedules](https://ai.google.dev/gemini-api/docs/deprecations).

The existing seven policy entries move into a shared registry. Their numeric
quality fields are explicitly labeled historical policy priors, not measured
quality. Four visible stable text models (3.8 Flash, 3.7 Flash, 3.6 Flash,
3.5 Flash-Lite) receive candidate entries with unknown quality. Default order
remains unchanged. Documented shutdowns and known specialized models are held
from these text routes even if listed. 3.1 Flash-Lite records its earliest
shutdown date; reaching that date requires lifecycle review rather than
asserting that a shutdown actually happened.

Explicit operator selections remain in the plan with their requested order and
exclusion reasons. Unknown or moving-alias selections may be explicitly admitted
when listed; this is recorded operator input, never an automatic fallback.
An override cannot erase a documented shutdown, unsupported specialized route,
operator disable, missing listing, or cooldown. Specialized consumers need their
own declared protocol before admission. Registry evidence is dated maintenance
input; provider listing does not refresh lifecycle documentation.

## Pedagogue / Aperture review

The consequence is an explained hold before transmitting a generation request.
This is backend admission, with no new human-facing route or interaction design;
no fictional UI fixture is presented as a comprehension witness. Missingness and
contradiction are retained in excludedModels. The observation audit distinguishes
listed identity from generation availability, entitlement, and task quality.
The documented-shutdown/listed-preview contradiction is resolved conservatively
for admission while both evidence records survive. Machine tests grant no human
comprehension or empirical-exteriority claim.

Synthetic tests cover absent, empty, failed, incomplete, expired, future-dated,
overlong, disabled, cooldown, shutdown, specialized, and explicit selections;
router tests exercise listing before generation. Existing prompt/custody tests
remain required. No live generation is performed by this PR's tests.

Next: separately preregister task-quality fixtures and a bounded generation
workflow. The metadata-only gemini-observation Environment remains unchanged.
No automatic ranking promotion, Vercel release, or Golden-Egg completion.

Sealed ⟐
