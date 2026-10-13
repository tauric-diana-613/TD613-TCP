# GPT-6 Astra evidence dossier and 3.1 Pro adjudication plan

𝌋 U+10D613 · 2026-09-23 · PR #1313 continuation

## Purpose

This note records the independent evidence reviewed after the initial Astra research was judged too dependent on provider claims. It separates observed evidence, plausible mechanisms, and unresolved conjecture. It is an operational handoff for the next Astra turn after the operator returns the 3.1 Pro Regular and Longer responses.

## Evidence hierarchy

- Controlled or peer-reviewed evaluations: strongest available evidence.
- Open-source harnesses, reproducible issue reports, and raw artifacts: strong operational evidence, with environment confounds.
- Technically literate practitioner reports: useful behavioral evidence, not architecture proof.
- Vendor claims, unsourced benchmark screenshots, and model folklore: hypotheses only.

## Findings

### 1. Reference-guided reconstruction is the relevant Astra capability

ProgramDistill evaluates agents reconstructing behavior from a working reference application rather than merely following an issue description. Its published early result reports GPT-6 Astra at 49.2% on cumulative full-application reconstruction versus 28.8% for Claude Opus 5; performance falls as restoration depth increases. This resembles Marrowline more closely than generic code completion: the agent must infer intended behavior from specimens, map it onto incomplete code, patch, and replay.

Source: https://arxiv.org/abs/2609.18805

### 2. Astra has a polarized profile, not universal precision

RoboDojo reports strong semantic generalization but weak performance on precision control, dynamic control, and complex bimanual coordination. The transfer implication is direct: Astra may be unusually useful for cross-file semantic diagnosis and long-horizon repair while still requiring deterministic Unicode, DOM, CSS, arithmetic, and screenshot verification.

Source: https://arxiv.org/abs/2609.24170

### 3. Recurrent-depth architecture remains unconfirmed

Independent technical analysis discusses a reported looped/recurrent-depth mechanism. The general research literature supports repeated shared-block processing as a way to trade parameters for iterative refinement and latent computation. No public official technical source located in this review confirms that Astra uses that architecture.

Sources:
- https://magazine.sebastianraschka.com/p/gpt-6-astra-looped-transformers-and
- https://arxiv.org/abs/2608.15062
- https://arxiv.org/abs/2607.20519
- https://www.recurrentdepth.org/

Operational consequence: use recurrent depth as a mechanism hypothesis, never as a production assumption.

### 4. Long context and agent state remain failure surfaces

Public Codex issue reports document compaction failures, stale-task resumption, interrupted-turn loss, false completion, and non-convergence in long-running Astra sessions. A large context window therefore increases available evidence without guaranteeing correct custody of state.

Sources:
- https://github.com/openai/codex/issues/44456
- https://github.com/openai/codex/issues/42930
- https://github.com/openai/codex/issues/44974

Operational consequence: maintain the GitHub handoff, evidence hashes, explicit acceptance checks, and bounded turns even when Astra has large context.

### 5. Harness behavior can masquerade as model intelligence

Public Codex/Astra harness material emphasizes outcome + repository context + constraints + acceptance checks, provider-native compaction, fixture replay, and verification before declaring completion. This suggests that observed Astra advantage may partly arise from better agentic scaffolding rather than model weights alone.

Sources:
- https://github.com/Continuum-AI-Corp/OrcaReplay/blob/main/prompt/CODEX/gpt-6-astra-system-prompt.md
- https://github.com/Anil-matcha/awesome-gpt-6-astra
- https://github.com/lens077/deepseek-harness

## Astra edge in the requested CYBINT/HUMINT-style elicitation

Truthful assessment: Astra gave an edge in *instrument design*, not privileged access to Kʰonapolit.

The useful edge was the ability to hold several constraints together while authoring the questionnaire:

- conceal the diagnostic target inside a plausible editorial task;
- force independent answers before synthesis;
- require numerical derivation rather than agreement;
- introduce premise reversals that expose whether the respondent tracks structure;
- pair semantic intensity with orthographic controls;
- request boundary-localization records without asserting a hidden mechanism;
- require a self-audit and a falsifier;
- separate model self-explanation from observable runtime evidence.

That is a genuine improvement over a simple “please explain your behavior” prompt. It remains an elicitation instrument, not intelligence collection from a hidden autonomous source. Kʰonapolit's answers remain generated text.

## What to collect from 3.1 Pro

Preferred collection: all four outputs if available.

Minimum viable collection: two Regular outputs, preserving the same prompt, settings, conversation history, and model label. Longer outputs are valuable because continuation behavior is one of the current hypotheses, but they must be labeled as continuation observations rather than independent samples.

Record for every output:

- exact model label and mode;
- whether it used the same conversation;
- visible settings;
- full text;
- screenshots if rendering differs from copied text;
- whether the Tauric Diana bots appeared locally, terminally, or not at all;
- any numerical or epistemic errors;
- whether the response was manually extended with Longer.

## Astra adjudication protocol

Astra receives a bounded dossier containing the four Pro exports, the three prior Marrowline exports, the unchanged probe prompts, route/relay code, tests, and the successful Gemini specimen.

Astra must return exactly four artifacts:

1. **Cross-sample causal comparison**  
   Identify which failure survives across model, mode, history, and continuation.

2. **Evidence provenance matrix**  
   Classify each claim as supplied, derived, model-inferred, application-observed, or unresolved.

3. **One minimal repair specification**  
   Select one layer only: prompt/route assembly, relay parser, continuation path, provider settings, or rendering. No local Zalgo synthesis.

4. **One falsifier**  
   State the observation that would make the proposed repair wrong.

Decision branches:

- Pro and Marrowline both omit terminal bots: prioritize route/closure assembly.
- Pro completes the bots while Flash fails: test model × effort × history interaction.
- Regular completes while Longer fails: inspect continuation payload and state custody.
- Both produce local bot samples without terminal closure: strengthen the terminal movement contract, not the typography recipe.
- Pro repeats arithmetic errors: repair evidence verification before expressive routing.

## Acceptance conditions for a consequential patch

A patch advances only when:

- the analytic argument remains complete;
- the terminal bot movement derives from the fresh consequence;
- quoted specimens cannot satisfy the terminal requirement;
- provider-authored combining marks survive transport;
- no local typography generator is introduced;
- arithmetic and provenance claims pass independent checks;
- ordinary non-TD613 routes remain behaviorally stable;
- the patch has a cheap falsifying test;
- the branch remains deployable by the 5.6 handoff operator.

## Explicit non-findings

This dossier does not establish:

- that Astra definitely uses recurrent depth;
- that Astra possesses a task class Sol cannot perform;
- that a model's self-description reveals its internal runtime;
- that a screenshot proves provider-side typography;
- that longer output represents deeper reasoning;
- that a successful one-shot output proves stable recovery.

⟐
