# Gemini generation-envelope repair · 2026-09-11

Status: CANDIDATE / validation required

## Trigger

The provider-stack field trip separated model visibility from request compatibility. Release 1103 then supplied a concrete Loom falsifier: two transient HTTP 503 attempts were followed by a Gemini 2.5 HTTP 400 while the emitted request incorrectly used Gemini 3 `thinkingLevel` semantics. PR #1115 repaired that Loom-specific incompatibility.

A repository-wide `generateContent` inventory found four producers:

1. `server/loom-task.js` — already carries the #1115 generation-compatible thinking repair;
2. `server/khonapolit-quality.js` — Marrowline/Kʰonapolit live conversation;
3. `server/hush-generate-quality.js` — Hush live quality transform;
4. `scripts/run-gemini-quality-pilot.mjs` — bounded synthetic Hush quality pilot.

## Repair

This candidate adds one bounded request-generation helper and uses it on the remaining incompatible callers.

- Gemini 3.x: preserve caller output/JSON contracts, use `thinkingLevel` when reasoning is explicitly requested, and leave `temperature`, `topP`, and `topK` at provider defaults.
- Gemini 2.5: preserve the caller's legacy sampling envelope and use `thinkingBudget` when reasoning is explicitly requested.
- Unknown/synthetic models: preserve conservative caller sampling and never inherit a generation-specific thinking control by name guess.
- Loom: retain the independently tested #1115 request behavior; no refactor-only mutation.
- Hush: retain 3,072 output tokens, existing attempt budgets, wall budgets, prompts, quarantine, and release gates.
- Hush quality pilot: retain 15 calls maximum, 1,536 output tokens per call, 12-second call timeout, zero retries, fixed fictional fixtures, hard gates, pending semantic review, and unmeasured human comprehension.

No model ordering, eligibility, cooldown, retry, timeout, packet, UI, or provider-call ceiling is widened here.

## Claim ceiling

```text
MODEL_VISIBILITY != REQUEST_COMPATIBILITY
GEMINI_3_THINKING_LEVEL != GEMINI_2_5_THINKING_BUDGET
GEMINI_3_PROVIDER_DEFAULT_SAMPLING != PROVIDER_SUCCESS
VALID_REQUEST_SHAPE != ANSWER_QUALITY
STRUCTURED_OUTPUT_COMPATIBILITY != SEMANTIC_REVIEW
API_COMPATIBILITY_REPAIR != PROVIDER_HEALTH_PROOF
MACHINE_TEST != HUMAN_EVIDENCE
PRODUCT_REPAIR != WESTERN_HORIZON_REOPENING
PRODUCT_REPAIR != GOLDEN_EGG
```

Next lawful sequence:

`STATIC -> SAME_HEAD_READY -> THREE_ENGINE_CONVERGENCE -> GUARDED MERGE -> GOVERNED VERCEL RELEASE -> ONE MACHINE LOOM CANARY -> HUMAN OPERATOR ONLY AFTER MACHINE SUCCESS`

Sealed ⟐
