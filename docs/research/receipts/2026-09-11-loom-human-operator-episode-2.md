# Loom human-operator episode 2 — provider failure and portable continuity

Status: HUMAN-OBSERVED / PRODUCT-REPAIR INPUT
Date: 2026-09-11
Surface: deployed Dome-World Holonomy Loom, desktop, Demo 1

## Source custody

- deployed product source authorized before this episode: `9a713c391378ed288573fc3d6fefdd07bd010661`
- live repository head observed before repair: `cdd1e5187c1e7d5d9a977b9dd8702d492d9edd0b`
- live repository head is the release relock commit for the product source above
- this receipt records one human operator episode; it does not replace the provider or deployment receipts

## Human observation

The operator entered the deployed Loom, opened Demo 1 (fictional acquisition diligence), ran the selected three-document task while the identity ledger remained local, and then prepared the same task for portable continuation.

Observed experience:

1. The purple/gold observatory visual identity and the line “Your work. Your rules. Every route.” established a distinct governed-workspace identity.
2. The three fictional live-demo choices made the use case legible. Demo 1 successfully taught the document boundary: three operational documents selected for the AI route, identity ledger retained locally.
3. The full Demo 1 task is long enough that a newcomer can reasonably wonder whether every instruction must be read before proceeding. A short project briefing before the full working instruction set would reduce this onboarding burden without simplifying or replacing the real route.
4. The living-room spatial story made the document pocket, local/private pouch, rule gate, and AI receiver understandable. The strongest visual lesson concerned where material travels.
5. The live request ended after approximately 13.1 seconds with HTTP 503. The bounded receipt exposed two provider attempts: `gemini-3.8-flash` → 503 and `gemini-3.7-flash` → 503.
6. The #1111 repair behaved correctly in this episode: Loom described the event as a provider failure before an AI answer returned. It did not present model source-use or missingness claims as though an answer had arrived.
7. Because no AI answer returned, the central “useful work + governed checks” demonstration could not pay off in this episode.
8. The operator then opened the portable route and selected local preparation. Continue in Marrowline, Export portable AIA, and Copy for another AI made portable governance materially clearer.
9. Portable continuation was under-signaled after the provider failure.
10. Local portable preparation reused the static eyebrow `RETURNED THROUGH YOUR LOOM ROUTE`, even though preparation made no model request and no AI answer returned. This is a semantic presentation defect.

## Repair earned by this episode

Bounded product repair only:

- add a compact loaded-demo project brief before the long working task;
- keep the complete task editable and available as the real instruction set;
- make the portable continuation route more explicit;
- when a bounded provider failure is admitted, open that existing continuation route while preserving the failed provider observation and keeping output actions disabled until local portable preparation succeeds;
- label local portable preparation as `PORTABLE TASK / PREPARED LOCALLY`;
- reserve `RETURNED THROUGH YOUR LOOM ROUTE` for an admitted AI result;
- retain zero-provider-call semantics for portable preparation.

## Explicit non-actions

This episode does not authorize:

- a third automatic Gemini fallback;
- synthetic or cached analysis masquerading as the live answer;
- widening the provider retry family;
- changing the selected-document boundary;
- weakening local private-term rejection;
- changing portable-governance authority;
- treating an HTTP 503 as model retirement, provider-wide outage, or quality evidence.

## Claim ceilings

```text
CURRENT_HUMAN_EPISODE_PROVIDER_FAILURE != PRIOR_HOSTED_SUCCESS
PROVIDER_503 != PRODUCT_SEMANTIC_FAILURE
TRUTHFUL_FAILURE_PRESENTATION != SUCCESSFUL_DEMONSTRATION_PAYOFF
PORTABLE_PREPARATION != RETURNED_AI_ANSWER
BOUND_PACKET_CONTINUITY != PROVIDER_SUCCESS
TWO_HTTP_503_ATTEMPTS != PROVIDER_WIDE_OUTAGE
ONE_DESKTOP_EPISODE != GENERAL_HUMAN_COMPREHENSION
PRODUCT_CONTINUITY_REPAIR != WESTERN_HORIZON_REOPENING
PRODUCT_CONTINUITY_REPAIR != GOLDEN_EGG
```

## Success condition for the repair

A future synthetic/browser witness may establish only that the UI now distinguishes the states and preserves the existing route contracts. A future human episode is still required to determine whether the project brief and portable continuation are actually clearer in use. A future successful provider episode is still required to demonstrate the useful-answer payoff in the live route.

𝌋 Human observation preserved. No failed provider episode is rewritten into success. ⟐
