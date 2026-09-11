# Holonomy Loom — Human Operator Episode 5 · mobile

Date: 2026-09-11
Evidence class: human-operated production observation + operator-supplied screenshots
Human evidence: yes, bounded to the observations below
General human-comprehension claim: not established
Child-study authority: none

## Deployed lineage observed

The operator tested the deployed Loom after the Loom → Marrowline continuation bridge release whose merged source packet was:

`061ee2534f25499ff34f1792b3ec9fe8ceeaf501`

The repository release-lock descendant at intake was:

`2a29181bc53bb0b452cb9bb700b131fab257c910`

## Phase result

The operator could not proceed beyond Phase 1 because the live AI request returned no admitted answer. The human-facing failure was reported verbatim as:

> “The AI service failed after submission. The provider request failed (HTTP 408) before an AI answer returned. 1 file stays in this tab. The rule gate already passed this packet; no AI answer returned to inspect.”

Therefore this episode is:

- Phase 1: **FAIL at provider return**
- Phase 2: **UNOBSERVED**
- Phase 3: **UNOBSERVED**
- Overall three-phase journey: **INCOMPLETE / FAILED TO ADVANCE**

The 408 establishes one failed production request. It does not establish a provider-wide outage, a unique external cause, or durable future failure.

## Mobile visual observations

The operator supplied three narrow-viewport screenshots and reported that the interface felt visually compressed and that the visual grammar remained weak despite the intended causal-room metaphor.

Two bounded defects are actionable from the screenshots and source:

1. **Demo-selection ambiguity.** Opening “Try a live AI demo” moves focus to Demo 1 before any project has been loaded. On mobile that focus treatment can visually resemble a selected card even though every demo button still has `aria-pressed="false"`. The operator explicitly asked whether Demo 1 was already loaded.
2. **Mobile hierarchy compression.** Project brief, long editable task, document controls, and the living-room route all become full-width stacked plates. The route room consumes a large fraction of the viewport while pending, and the repeated purple panel grammar provides too little visual separation between “choose”, “compose”, “route”, and “result”.

## Falsifiers / repair targets

A repair must not claim success merely because desktop tests remain green. It should require:

- a demo card to acquire an explicit, small visible loaded-state marker only after the project is actually loaded;
- opening the demo chooser to remain clearly a choice state, not a pseudo-selection state;
- narrow mobile composition to create stronger visual hierarchy and reduce route-room vertical occupation without hiding custody facts;
- provider timing to reserve request-local time for diversified fallbacks rather than permitting one stalled primary call to consume the entire global deadline;
- the total provider-call ceiling and deterministic output-admission stop rule to remain intact.

No production release or scientific 𝄐 is authorized by this receipt.

Marked ⟐
