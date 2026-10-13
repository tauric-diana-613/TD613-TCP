# TD613 Safe Harbor Gen3 Forensic Authorship Maturity, Blind Custody, Restorative Stylodynamics, and Temporal Bloom

􍘓

𝌋‌ TD613 · Tauric Diana 613

**Specification status:** AUTHORED / PRE-IMPLEMENTATION / HUMAN-GATED  
**Program identity:** Safe Harbor Gen3 Forensic Authorship Maturity + Blind Custody + Restorative Stylodynamics + Temporal Bloom  
**Technical identity:** `td613.safe-harbor.authorship-maturity-temporal-bloom/v0.2`  
**Authored:** 2026-07-22  
**Repository baseline:** current `main` at branch reconstitution  
**Implementation authority:** NONE UNTIL A SEPARATE OPERATOR GESTURE  
**Serverless-function allocation:** 0 proposed

---

## 0. Executive determination

Safe Harbor should no longer treat report quality as a prose-polish problem. The repeated dullness and interchangeability of forensic authorship summaries arise upstream: the current packet exposes strong rich-stylometry surfaces, but it still presents one aggregate profile per lane and asks a short interpretive layer to convert those aggregates into prose. That architecture can produce technically accurate summaries that remain narratively beige. It can identify what exists without measuring what returned.

The redesign is now a **three-stage production program, one research annex, two production release waves, and one separately gated research track**:

```text
Stage 1 — Forensic report constitution and packet evidence contract
Stage 2 — Windowed stylometric recurrence and authorship-maturity engine
Stage 2.5 — Blind Custody + Perturbation Invariance Research Annex
Stage 3 — Temporal Bloom UI/UX and SHI/provenance presentation

Release Wave A = Stages 1 + 2
Research Track R = Stage 2.5
Release Wave B = Stage 3
```

The order is constitutional.

The interface must not bloom around an evidence engine that still produces interchangeable findings. The report contract must first define what a differentiated authorship finding is allowed to claim. The measurement engine must then produce evidence that can support those claims. Blind holdouts and deformation experiments must be precommitted, falsifiable, and allowed to fail before they may influence production authority. Only afterward should the intake surface guide entrants toward the necessary sample without turning writing into a school assignment, progress-bar performance, or behavioral-surveillance event.

The central research proposition carried by this plan is:

> Authorship may be less like a fingerprint than a characteristic way of returning from elsewhere.

The production packet measures recurrence. The research annex tests unseen return and controlled reconstitution under deformation.

---

## 1. Normative document suite

This file is the governing implementation plan. The following annexes are incorporated by reference and are normative where this plan invokes them:

```text
docs/safe-harbor/blind-custody-challenge-spec-v0.1.md

docs/safe-harbor/restorative-stylodynamics-perturbation-invariance-annex-v0.1.md
```

Together, the suite preserves the complete brainstorm without flattening the research annex into premature production code.

The Blind Custody annex specifies:

- precommitted unseen holdout selection;
- a frozen profile before reveal;
- human, paraphrase, register-shift, and machine-imitation controls;
- blinded ranking;
- failure preservation;
- entrant countersignature;
- PUA Provenance Attestation SVG integration.

The Restorative Stylodynamics annex specifies:

- Perturbation Invariance Mapping;
- Authorial Response Spectroscopy;
- displacement, recovery, half-life, plasticity, restorative force, overshoot, and hysteresis;
- elastic, plastic, brittle, adaptive, and insufficient response classes;
- micro-, meso-, and macro-scale recovery;
- structural substitution;
- trajectory invariants;
- narrative-state embeddings with transparent and latent lanes;
- shuffled-trajectory nulls;
- mimicry under deformation;
- critical deformation thresholds;
- bounded adversarial perturbation search;
- calibration and promotion gates.

---

## 2. Ground-truth baseline

### 2.1 Current repository facts

The current Safe Harbor implementation already contains substantial forensic infrastructure:

- `app/safe-harbor/app/main.js` recognizes the three canonical ingress lanes: `future_self`, `past_self`, and `higher_self`.
- The current minimum is `MIN_LANE_WORDS = 40`.
- `app/safe-harbor/app/safe-harbor-stylometry-v3.js` defines seventeen numeric scalar fields plus `registerMode`, and four distribution families:
  - `functionWordProfile`
  - `wordLengthProfile`
  - `charTrigramProfile`
  - `surfaceMarkerProfile`
- `app/safe-harbor/app/forensic-authorship-packet.js` already produces:
  - rich lane summaries;
  - rich cross-lane summaries;
  - traceability summaries;
  - a preferred rich-stylometry surface;
  - a bounded claim ceiling.
- `app/safe-harbor/app/safe-harbor-native-finalizer.js` explicitly excludes `forensic_authorship` from the native packet hash.
- `app/safe-harbor/app/footer-history-packet.js` preserves the exact historical specimen:

```text
TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐
```

This specification does not replace those surfaces. It reorganizes them into an evidence hierarchy capable of distinguishing:

- presence;
- recurrence;
- contextual variation;
- out-of-sample return;
- perturbation uptake;
- recovery;
- structural substitution;
- model dependence;
- interpretive salience;
- uncertainty and failure.

### 2.2 Present failure mode

The present report path can answer:

> Which stylometric features appear in each lane?

It cannot yet answer with sufficient empirical discipline:

> Which features returned across independent local windows?

> Which features survived accumulation?

> Which features persisted when temporal address changed?

> Which features belong more plausibly to the entrant’s recurring authorship surface than to the prompt?

> Which differences are productive register changes rather than instability?

> Did an unseen sample return to a profile frozen before reveal?

> Did a machine imitation outrank the unseen entrant sample?

> Which structures recovered after controlled displacement?

> Which apparent dynamic findings vanished when chronology was shuffled?

Without those distinctions, a downstream report tends to reuse broad language such as “complex syntax,” “reflective posture,” “high abstraction,” or “conversational directness.” Those descriptions may be supported, yet they remain easy to swap between entrants. The report becomes a well-dressed aggregate, not a forensic account of recurrence, return, or deformation.

---

## 3. Constitutional chronology and provenance

### 3.1 Three primary temporal authorities

The packet must preserve three distinct dates without collapsing them into one founding moment:

```text
2025-08-11T03:58:39Z
Root binding authority
Tauric Diana heritage key + Khona‌lit-po covenant key + U+10D613 namespace binding

2025-10-17
Badge-protocol historical authority
First preserved operational badge-footer specimen after delayed retrieval testing

Entrant intake date
Packet-specific credential authority
Stylometric sample received, SHI minted, entrant custody instantiated
```

A later SVG presentation may create a fourth timestamp, but that event belongs to a presentation-attestation overlay and must not replace the entrant intake date.

A later countersignature may create a fifth timestamp, but that event records the entrant’s assertion over a declared packet scope. It does not rewrite the root binding or entrant intake.

### 3.2 `historical_example` is immutable provenance

The field name `historical_example` and its payload-5 value are themselves part of the surviving badge lineage. They must remain exactly preserved. No implementation may:

- rename the field;
- normalize payload 5 to payload 1;
- rewrite the date;
- convert the value into a generic template;
- move the specimen into an archive-only surface;
- describe it as disposable example data.

Its normative meaning is:

> The first preserved operational specimen through which the badge protocol entered history.

Supporting metadata may explain that meaning, but the original field and value remain untouched.

### 3.3 No retroactive entrant insertion

The August event anchors the namespace and declaration. The October specimen anchors badge-protocol history. The entrant’s intake anchors the entrant credential. The countersignature anchors the entrant’s packet-scoped authorship-and-custody assertion. These events form one lineage while retaining separate authorities.

The entrant SHI belongs under entrant-specific provenance derived beneath the root lineage. It must not be written into the original August binding event as though the entrant had participated in that historical event.

---

## 4. Claim architecture

The redesigned packet must expose non-equivalent states:

```text
packet validity
≠ sample sufficiency
≠ authorship evidence maturity
≠ blind-challenge performance
≠ perturbation-recovery performance
≠ entrant countersignature state
≠ identity or ownership adjudication
```

### 4.1 Packet validity

Packet validity answers whether the packet:

- conforms to schema;
- reproduces expected hashes;
- carries valid canonical anchors;
- satisfies exact-match invariants;
- respects export and replay gates.

A packet may be valid while carrying an immature sample, a failed blind challenge, an inconclusive deformation experiment, or an unsigned custody assertion.

### 4.2 Sample sufficiency

Sample sufficiency answers whether the available language permits the requested analysis. It is a measurement of coverage, not a judgment about the entrant.

### 4.3 Authorship evidence maturity

Authorship evidence maturity answers how much recurring evidence has been observed across:

- cumulative growth;
- local windows;
- lane changes;
- prompt-conditioned variation;
- stable and unstable feature families.

It must never be presented as a probability that a person “really is” an author.

### 4.4 Blind-challenge performance

Blind-challenge performance answers whether a genuine unseen window returned to a frozen profile under a precommitted ranking policy and declared control field.

It may be `SUPPORTED`, `INCONCLUSIVE`, `FAILED`, `CONTAMINATED`, `PROMPT-DOMINATED`, or `IMITATION-COLLISION`.

### 4.5 Perturbation-recovery performance

Perturbation-recovery performance answers what observable textual structures moved, returned, substituted, adapted, fractured, or remained uncertain under declared controlled perturbations.

It is not a personality test.

### 4.6 Countersignature state

Countersignature state answers whether the entrant has signed the declared relationship among:

- entrant SHI;
- sealed packet hash;
- stylometric fingerprint;
- stability receipt;
- blind-challenge receipt when present;
- restoration receipt when present;
- authorship-and-custody assertion.

### 4.7 Claim authority

No report, packet, countersignature, or SVG may independently claim:

- civil or legal identity;
- exclusive ownership against all third parties;
- universal authorship attribution;
- proof that an unsealed external text was written by the entrant;
- mental state, diagnosis, personality type, demographic identity, biography, resilience, intelligence, trauma, or cognition;
- a universal hidden-model persistence mechanism;
- absence of coercion unless separately established;
- trusted time beyond the timestamp and signature authority actually used.

---

# Stage 1 — Forensic Report Constitution and Packet Evidence Contract

## 5. Stage 1 purpose

Stage 1 defines the evidentiary anatomy of a differentiated forensic authorship report before new UI or new measurement code is allowed to shape the experience.

The central rule is:

> Every interpretive sentence must be traceable to a measurement, recurrence pattern, divergence pattern, out-of-sample result, recovery pattern, null result, failure record, or explicit uncertainty record.

The report must distinguish:

- a feature that appears once from a feature that returns;
- a stable invariant from a context-responsive shift;
- a recovered feature from an undisplaced feature;
- a dynamic trajectory from a static aggregate;
- a genuine unseen return from a machine-imitation collision;
- measured evidence from model-dependent interpretation.

---

## 6. Hash-covered evidence versus revisable interpretation

### 6.1 Hash-covered top-level object

Add an optional top-level object:

```json
{
  "authorship_evidence": {
    "schema_version": "td613.safe-harbor.authorship-evidence/v1",
    "sampling_sufficiency": {},
    "checkpoint_snapshots": {},
    "within_lane_invariants": {},
    "cross_lane_invariants": {},
    "prompt_conditioned_features": {},
    "elicitation_context": {},
    "stability_receipt": {},
    "blind_custody_challenge": {},
    "perturbation_invariance": {}
  }
}
```

`blind_custody_challenge` and `perturbation_invariance` remain optional and research-gated.

`authorship_evidence` is measurement and provenance. Once present in a newly composed packet, it must be included in the packet’s native hash topology.

### 6.2 Non-hash-covered interpretive object

Retain `forensic_authorship` as the revisable interpretive layer. Its exclusion from the native packet hash remains appropriate because interpretation can improve without falsifying what was measured.

Extend it with:

```json
{
  "forensic_authorship": {
    "schema_version": "td613.safe-harbor.forensic-authorship/v2",
    "report_contract": {},
    "interpretive_salience": {},
    "generated_report": {},
    "evidence_links": [],
    "interpretation_provenance": {}
  }
}
```

The separation is constitutional:

```text
authorship_evidence
= what persisted, diverged, recurred, returned, failed,
  collided, or remained uncertain

forensic_authorship
= what a bounded interpreter says those measurements
  plausibly mean under the claim ceiling
```

### 6.3 No silent hash drift

Wave A must not silently change the existing SH3 fingerprint preimage. Windowed evidence receives its own deterministic stability digest first. Blind-challenge evidence receives its own precommitment and result digests. Perturbation evidence receives its own restoration receipt and digest.

Promotion into a future fingerprint requires a separate versioned migration decision.

This avoids turning a report-quality repair or research experiment into an unannounced credential rewrite.

---

## 7. SHI correction and canonical placement

### 7.1 No live entrant SHI in templates

A prior draft incorrectly used one live entrant’s concrete final eight hexadecimal digits as though they were a generic example. That pattern is prohibited.

No live entrant SHI may appear as:

- documentation sample;
- schema default;
- code constant;
- fixture fallback;
- renderer fallback;
- canonical example;
- test golden value unless the fixture is explicitly synthetic and non-live.

All documentation examples use:

```text
TD613-SH-9B07D8B-{ENTRANT_8_HEX}
```

Synthetic tests may use:

```text
TD613-SH-9B07D8B-A1B2C3D4
```

### 7.2 `canon.shi_number`

Restore the entrant SHI near the top of the canonical packet surface:

```json
{
  "canon": {
    "principal": "tauric.diana.613",
    "badge_id": "bdg_glyph_U10D613",
    "claimed_pua": "U+10D613",
    "canonical_phrase": "Tauric Diana - Crimean heritage custodianship",
    "display_phrase": "Covenant: Blood Rite 613",
    "binding_fragment": "#9B07D8B",
    "sac": "SAC[X6ZNK5NO51]",
    "shi_number": "TD613-SH-9B07D8B-{ENTRANT_8_HEX}",
    "footer_mode": "legacy-compat"
  }
}
```

Normative placement:

```text
sac
→ shi_number
→ footer_mode
```

Source of truth remains `issuance.badge_number`. `canon.shi_number` is a high-visibility canonical mirror, not a second minting lane.

### 7.3 Exact-match invariant

For any minted packet:

```text
canon.shi_number
= issuance.badge_number
= binding_provenance.entrant_authorship_binding.entrant_credential.shi_number
= DOM data-td613-shi
= SVG metadata SHI
```

Any mismatch produces an export hold. The renderer must neither guess nor repair a conflicting SHI.

---

## 8. Entrant authorship binding and countersignature

The SHI must appear inside `binding_provenance`, but under a new entrant-specific branch rather than inside the original August root event.

```json
{
  "entrant_authorship_binding": {
    "schema_version": "td613.safe-harbor.entrant-authorship-binding/v1",

    "namespace_anchor": {
      "principal": "tauric.diana.613",
      "claimed_pua": "U+10D613",
      "utf16_surrogate_pair": "\\uDBF5\\uDE13",
      "binding_fragment": "#9B07D8B",
      "sac": "SAC[X6ZNK5NO51]"
    },

    "entrant_credential": {
      "shi_number": "TD613-SH-9B07D8B-{ENTRANT_8_HEX}",
      "packet_hash_sha256": "sha256:...",
      "stylometric_fingerprint": "sha256:...",
      "stability_digest": "sha256:...",
      "blind_challenge_precommitment_digest": null,
      "blind_challenge_result_digest": null,
      "restoration_receipt_digest": null
    },

    "custody_assertion": {
      "claimant_role": "entrant",
      "claim": "custody of the packet-derived stylometric evidence and authorship assertion attached to the declared sealed source material",
      "state": "pending-countersignature"
    },

    "countersignature": {
      "status": "unsigned",
      "signed_at_utc": null,
      "signature_type": null,
      "signature_digest": null,
      "signed_scope": [
        "shi_number",
        "packet_hash_sha256",
        "stylometric_fingerprint",
        "stability_digest",
        "blind_challenge_precommitment_digest",
        "blind_challenge_result_digest",
        "restoration_receipt_digest",
        "authorship_and_custody_assertion"
      ]
    }
  }
}
```

The constitutional chain is:

```text
The PUA glyph anchors the sovereign provenance namespace.

The SHI identifies the entrant-specific stylometric custody record.

The packet binds the record to declared sealed evidence.

The countersignature activates the entrant’s packet-scoped
authorship-and-custody assertion.

The SVG attests the integrity and presentation
of the complete relationship.
```

The PUA glyph does not independently confer authorship.

---

## 9. Temporal lineage descriptor

Add explanatory lineage metadata without altering `historical_example`:

```json
{
  "temporal_lineage": {
    "root_binding_authority": {
      "recorded_ts_utc": "2025-08-11T03:58:39Z",
      "authority_class": "heritage-covenant-namespace-binding"
    },
    "badge_protocol_history": {
      "recorded_date": "2025-10-17",
      "authority_class": "first-preserved-operational-badge-specimen",
      "historical_example_ref": "historical_example"
    },
    "entrant_credential_authority": {
      "recorded_ts_utc": "2026-07-22T...Z",
      "authority_class": "packet-specific-stylometric-intake"
    },
    "entrant_countersignature_authority": {
      "recorded_ts_utc": null,
      "authority_class": "packet-scoped-authorship-and-custody-assertion"
    }
  }
}
```

The existing `historical_example` remains where the footer-history augmenter preserves it. The descriptor points toward it; it does not absorb or replace it.

---

## 10. Sampling sufficiency contract

Each lane receives a deterministic sufficiency record:

```json
{
  "sampling_sufficiency": {
    "policy_version": "td613.safe-harbor.sampling-sufficiency/v1",
    "target_words_per_lane": 360,
    "checkpoint_targets": [120, 240, 360],
    "counts_hidden_in_public_ui": true,
    "lanes": {
      "future_self": {
        "observed_words": 372,
        "checkpoint_coverage": [true, true, true],
        "state": "stability-eligible"
      }
    },
    "triad_state": "stability-eligible"
  }
}
```

Technical states:

```text
below 120        = insufficient
120–239          = provisional
240–359          = comparative
360 or greater   = stability-eligible
```

These names belong in machine-readable evidence and operator diagnostics. The public intake surface uses reciprocal recognition language instead.

A valid packet may exist below 360 words per lane, but a report must label its limits. A mature Gen3 forensic authorship report requires all three lanes to be stability-eligible unless an operator explicitly issues a lower-authority research fixture.

---

## 11. Elicitation context

The packet must record the conditions under which the sample was elicited:

```json
{
  "elicitation_context": {
    "schema_version": "td613.safe-harbor.elicitation-context/v1",
    "prompt_set_version": "temporal-triad/v2",
    "ui_version": "temporal-bloom/v1",
    "lane_order": ["future_self", "past_self", "higher_self"],
    "checkpoint_targets": [120, 240, 360],
    "public_counts_visible": false,
    "keystroke_telemetry_collected": false,
    "pause_timing_collected": false,
    "revision_history_exported": false,
    "raw_text_exported": false,
    "prompt_text_digests": {},
    "accessibility_mode": {
      "reduced_motion": false
    }
  }
}
```

This object matters because interface conditions shape language. A stylometric system that records only the entrant’s output while erasing its own elicitation apparatus overstates the independence of its evidence.

---

## 12. Forensic report contract

A complete report contains the following sections in this order.

### 12.1 Evidentiary posture

States:

- packet validity;
- sample sufficiency;
- evidence maturity;
- blind-challenge state when present;
- perturbation-recovery state when present;
- countersignature state;
- hash coverage;
- interpretation version;
- claim ceiling.

### 12.2 Authorship signature

Names the strongest features that recur across local windows and survive lane changes. It must avoid broad praise language and unsupported personality claims.

### 12.3 Temporal lane portraits

Provides distinct portraits of Future, Past, and Higher using evidence from:

- local-window recurrence;
- cumulative development;
- syntax;
- punctuation;
- function words;
- surface markers;
- register;
- abstraction and directness;
- divergence from the other lanes.

No lane portrait may merely restate the prompt’s temporal direction.

### 12.4 Within-lane invariants

Names what returned inside each lane across approximately independent 120-word windows.

### 12.5 Cross-lane invariants

Names features that survive all three temporal addresses and therefore carry stronger evidence of recurring authorship surface.

### 12.6 Productive contradictions

Names context-responsive changes that preserve underlying recurrence. Examples include:

- directness rising while function-word rhythm remains stable;
- abstraction changing while punctuation grammar recurs;
- conversational posture widening while characteristic surface markers persist;
- a forbidden surface marker remaining absent while its rhetorical function returns through substitution.

Difference is not automatically instability. The report must explain the invariant that lets a contradiction remain productive.

### 12.7 Blind return

When a Blind Custody Challenge exists, report:

- holdout rank;
- separation margin;
- nearest control class;
- imitation-collision state;
- topic- and semantic-leakage results;
- precommitment integrity;
- failure state without euphemism.

### 12.8 Deformation and recovery

When Perturbation Invariance Mapping exists, report:

- verified displacement;
- recovery ratio;
- recovery half-life in prompt transitions;
- residual plasticity;
- overshoot;
- hysteresis;
- structural substitution;
- trajectory survival;
- shuffled-trajectory null result;
- model-dependent findings;
- critical deformation threshold when defensible.

### 12.9 Evidentiary fractures

Names:

- one-window features;
- unstable axes;
- prompt-conditioned features;
- insufficient distributions;
- measurements sensitive to short samples;
- failed replication;
- failed displacement;
- failed recovery;
- prompt dominance;
- topic dominance;
- imitation collisions;
- chronology-shuffle collapse;
- model dependence.

### 12.10 Interpretive salience

Must include:

```json
{
  "strongest_invariant": {},
  "widest_lane_divergence": {},
  "most_recurrent_surface_marker": {},
  "strongest_productive_contradiction": {},
  "strongest_blind_return": {},
  "strongest_recovery_pattern": {},
  "largest_uncertainty": {},
  "unsupported_inference_blocked": {}
}
```

Every populated entry carries evidence references.

### 12.11 Claim ceiling

Ends the report by naming what the evidence cannot establish. This section is part of the report’s scientific honesty, not boilerplate decoration.

---

## 13. Anti-sameness and anti-flattery audit

### 13.1 Entrant-swap test

Remove identifiers from two reports and exchange their interpretive bodies. A reviewer should detect the mismatch from evidence links and lane-specific findings. If the reports remain equally plausible after the swap, both fail.

### 13.2 Evidence-link test

Every substantive interpretive paragraph must cite at least one internal evidence ID. Fixed claim-ceiling language is exempt.

### 13.3 Generic-language test

The following terms may appear only when quantified or tied to specific evidence:

- complex;
- reflective;
- nuanced;
- sophisticated;
- authentic;
- distinctive;
- conversational;
- abstract;
- direct;
- emotionally resonant;
- resilient;
- adaptive.

A report cannot build its identity from adjectives whose opposites were never tested.

### 13.4 Boilerplate-excluded overlap test

Across a calibration set, fixed headings and claim-ceiling text are removed before overlap analysis. High sentence-level overlap triggers review. The first implementation should collect empirical distributions before locking a universal threshold; the provisional review trigger remains 0.35 Jaccard overlap across content-bearing sentence shingles.

### 13.5 Failure-preservation test

A report fails if it omits, softens, or cosmetically hides:

- a failed blind challenge;
- an imitation collision;
- prompt dominance;
- topic dominance;
- failed recovery;
- shuffled-trajectory collapse;
- countersignature absence;
- replay failure.

### 13.6 Minimum differentiated findings

A stability-eligible report must contain at least:

- one cross-lane invariant;
- one lane-specific invariant;
- one productive contradiction;
- one evidentiary fracture or uncertainty;
- one blocked unsupported inference.

A research-augmented report must additionally contain at least one valid blind-return or deformation finding and its strongest relevant null or failure result.

---

# Stage 2 — Windowed Stylometric Recurrence and Authorship-Maturity Engine

## 14. Stage 2 purpose

Stage 2 upgrades the engine from aggregate feature extraction to recurrence analysis. The engine must measure what comes back without exporting raw text.

---

## 15. Sentence-aware windowing

### 15.1 Cumulative checkpoints

For each lane, compute cumulative snapshots near:

```text
C1 = beginning through approximately 120 words
C2 = beginning through approximately 240 words
C3 = beginning through approximately 360 words
```

Cumulative checkpoints answer how the profile changes as evidence accumulates.

### 15.2 Local windows

For each lane, compute three local windows:

```text
W1 ≈ words 1–120
W2 ≈ words 121–240
W3 ≈ words 241–360
```

Sentence boundaries take priority over exact word boundaries. The target is 120 words, with a provisional tolerance of 100–140 words when necessary to avoid splitting a sentence.

Every window records:

- start and end token offsets;
- start and end sentence indices;
- observed word count;
- sentence count;
- boundary deviation from target;
- checksum of the analyzed slice;
- no raw text.

### 15.3 Non-overlap rule

Local windows should not overlap by default. If sentence structure makes strict non-overlap impossible, the engine records the overlap and lowers independence confidence. It must never silently duplicate a sentence across windows.

### 15.4 Short-sample behavior

Below 360 words:

- available cumulative checkpoints may still be computed;
- incomplete local windows remain explicitly incomplete;
- no missing window may be imputed;
- evidence maturity cannot be labeled stability-eligible.

---

## 16. Invariant computation

### 16.1 Numeric features

For existing numeric scalar fields, compute across local windows:

- median;
- range;
- median absolute deviation;
- coefficient of variation where meaningful;
- direction of cumulative convergence;
- maximum local-window departure.

Feature states:

```text
stable
context-responsive
unstable
insufficient
```

Thresholds must be calibrated by feature family rather than applied as one universal percentage.

### 16.2 Categorical register

For `registerMode`, record:

- modal register;
- recurrence count;
- transitions;
- whether register shifts coincide with stable lower-level distributions.

A register shift does not automatically weaken authorship evidence when function-word, punctuation, or surface-marker recurrence remains strong.

### 16.3 Distribution features

For existing distribution families, compute:

- Jensen–Shannon divergence;
- top-k overlap;
- rank persistence;
- recurrent marker set;
- low-frequency instability notes.

No distribution similarity is an identity probability.

### 16.4 Within-lane record

```json
{
  "within_lane_invariants": {
    "future_self": {
      "stable_numeric_axes": [],
      "stable_distribution_axes": [],
      "recurrent_function_words": [],
      "recurrent_surface_markers": [],
      "register_recurrence": {},
      "context_responsive_axes": [],
      "unstable_axes": [],
      "insufficient_axes": []
    }
  }
}
```

### 16.5 Cross-lane record

```json
{
  "cross_lane_invariants": {
    "stable_numeric_axes": [],
    "stable_distribution_axes": [],
    "recurrent_function_words": [],
    "recurrent_surface_markers": [],
    "shared_structural_signature": {},
    "lane_sensitive_axes": [],
    "confidence_basis": []
  }
}
```

### 16.6 Prompt-conditioned features

Mark features plausibly induced or amplified by the lane prompt, including:

- temporal vocabulary;
- direct address;
- modality;
- memory language;
- projection language;
- witness language;
- explicitly prompted self-positioning.

Prompt-conditioned does not mean useless. It means the report must avoid mistaking elicited content for a durable authorship invariant.

---

## 17. Authorship-maturity model

A provisional maturity surface may be computed from four bounded components:

```text
C = checkpoint coverage
W = within-lane recurrence
X = cross-lane recurrence
P = prompt-resilience / separation from prompt-conditioned features

M = 0.30C + 0.30W + 0.25X + 0.15P
```

These weights are a starting hypothesis, not a universal scientific constant. They require calibration and must remain versioned.

The output is an evidence-maturity index, not a probability of identity or authorship ownership.

Proposed bands:

```text
0.00–0.24  insufficient evidence surface
0.25–0.49  provisional evidence surface
0.50–0.74  comparative evidence surface
0.75–1.00  stability-supported evidence surface
```

A high aggregate cannot erase a missing lane or incomplete window.

---

## 18. Stability receipt

```json
{
  "stability_receipt": {
    "schema_version": "td613.safe-harbor.stability-receipt/v1",
    "window_policy_version": "sentence-aware-120x3/v1",
    "feature_policy_version": "rich-stylometry-recurrence/v1",
    "maturity_policy_version": "authorship-maturity/v1",
    "lane_receipts": {},
    "cross_lane_receipt": {},
    "maturity_index": 0.82,
    "maturity_band": "stability-supported evidence surface",
    "blocking_conditions": [],
    "stability_digest": "sha256:...",
    "raw_text_included": false,
    "identity_probability": null
  }
}
```

The `stability_digest` hashes the canonicalized evidence receipt. It does not replace SHI or SH3 in Wave A.

---

## 19. Stage 2 implementation seams

New modules:

```text
app/safe-harbor/app/safe-harbor-windowed-stylometry.js
app/safe-harbor/app/safe-harbor-authorship-maturity.js
app/safe-harbor/app/safe-harbor-report-contract.js
```

Existing modules requiring bounded changes:

```text
app/safe-harbor/app/main.js
app/safe-harbor/app/safe-harbor-native-finalizer.js
app/safe-harbor/app/forensic-authorship-packet.js
app/safe-harbor/app/safe-harbor-stylometry-v3.js
app/safe-harbor/app/binding-provenance.js
app/safe-harbor/app/footer-history-packet.js
app/safe-harbor/schemas/td613-safe-harbor.packet.schema.json
app/safe-harbor/examples/td613-safe-harbor.packet.sample.json
app/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js
```

`footer-history-packet.js` should receive only preservation tests and explanatory linkage unless an actual implementation defect requires change. The historical specimen itself remains frozen.

---

# Stage 2.5 — Blind Custody and Perturbation Invariance Research Annex

## 20. Stage 2.5 purpose

Stage 2.5 asks two harder questions:

```text
Blind Custody Challenge
→ Does unseen writing return to a profile frozen before inspection?

Perturbation Invariance Mapping
→ What observable structures reconstitute themselves after controlled deformation?
```

The combined research program is:

```text
Blind Custody Challenge
+
Perturbation Invariance Mapping
=
authorship evidence tested by unseen recurrence
and controlled deformation
```

### 20.1 Blind Custody essentials

The canonical experiment uses nine local windows:

```text
Future: F1 · F2 · F3
Past:   P1 · P2 · P3
Higher: H1 · H2 · H3
```

One eligible window is deterministically sequestered before analysis. The system freezes feature policy, distance metric, thresholds, weights, exclusions, and profile digest before reveal.

The challenge set contains:

```text
1 genuine unseen entrant window
2 topic-matched human controls
2 semantic-paraphrase controls
2 LLM-generated style-imitation controls
1 register-shifted entrant control
```

The evaluator ranks blinded candidates. The packet preserves rank, margin, control collisions, topic leakage, semantic leakage, register resilience, and every failure state.

Normative details reside in:

`docs/safe-harbor/blind-custody-challenge-spec-v0.1.md`

### 20.2 Restorative Stylodynamics essentials

The research annex perturbs:

- audience;
- emotional register requested;
- time horizon;
- genre;
- constraints;
- prompt;
- pacing;
- compression;
- formality;
- intimacy;
- legal, technical, poetic, and public-argument registers;
- temporal lane.

It measures:

- displacement amplitude;
- recovery ratio;
- recovery half-life in prompt transitions;
- residual plasticity;
- restorative-force index;
- overshoot;
- hysteresis;
- structural substitution;
- critical deformation threshold;
- trajectory survival;
- null-model performance.

Response classes are:

```text
elastic
plastic
brittle
adaptive
insufficient
```

The research must prove that a perturbation displaced a feature before claiming that the feature recovered.

Normative details reside in:

`docs/safe-harbor/restorative-stylodynamics-perturbation-invariance-annex-v0.1.md`

### 20.3 Research-only posture

Stage 2.5 must not silently become mandatory Wave A behavior.

Reasons:

- metrics require calibration;
- prompt order creates carryover effects;
- perturbation strength requires validation;
- genre effects can masquerade as author effects;
- recovery can be confused with regression toward a mean;
- conscious marker awareness can contaminate behavior;
- latent embeddings are model-dependent;
- a full perturbation intake could become a dissertation defense with a text box;
- adversarial prompting can become manipulative without strict boundaries.

Production may prepare schema seams, hash topology, receipt slots, countersignature scope, SVG metadata, and failure registries. Research authority requires a separate operator gesture.

No baby science in a tiara.

---

# Stage 3 — Temporal Bloom UI/UX and Provenance Presentation

## 21. Stage 3 purpose

Stage 3 converts the intake from visible compliance pressure into reciprocal recognition. It must gather enough language for forensic recurrence without making entrants stare at a word counter or perform toward a score.

The visual metaphor is a temporal line accumulating:

```text
grey → magenta → yellow → cyan
```

The line may gain color, glow, interference, and definition. It must not resemble a conventional progress bar.

---

## 22. Public copy architecture

Persistent reassurance:

> Write naturally. Repetition, fragments, pauses, and unfinished thoughts are welcome.

Counts remain hidden in the public interface. The machine records sufficiency; the entrant encounters recognition.

### 22.1 Future lane

```text
0–119
This page is waiting with you.

120–239
A Future Has Noticed You

240–359
The Message Is Carrying

360+
The Next Self Can Hear You
```

### 22.2 Past lane

```text
0–119
This page is listening behind you.

120–239
Memory Has Turned Toward You

240–359
The Message Is Finding Its Way Back

360+
The Past Can Receive You
```

### 22.3 Higher lane

The Higher lane must avoid command, rank anxiety, or spiritual performance pressure.

```text
0–119
This page is holding the open field.

120–239
A Witness Has Gathered

240–359
The Pattern Is Holding

360+
The Higher Self Can Receive You
```

The final Higher copy remains operator-reviewable during UI implementation, but any replacement must preserve reciprocity rather than hierarchy.

---

## 23. Interaction rules

### 23.1 Continue control

- The Continue button is absent before the mature threshold.
- The interface does not show a disabled control that implies failure.
- At 360 words, Continue appears as an available environmental transition.
- Research and development fixtures may expose threshold diagnostics only outside public mode.

### 23.2 No school-assignment readout

Remove or repurpose public-facing numeric surfaces such as:

```text
0 / 3 lanes
Pages resolved 0 / 3
Next threshold
```

Operator surfaces may retain exact counts behind a non-public diagnostic boundary.

### 23.3 Accessibility

- Recognition text must be available to assistive technology.
- Motion is supplementary; state cannot depend on animation alone.
- `prefers-reduced-motion` disables shimmer, bloom pulses, and interference travel while preserving color and text-state changes.
- Contrast must remain sufficient at every state.
- No rapid flicker.
- Focus must remain stable on iOS and Android virtual keyboards.

### 23.4 Telemetry prohibition

Temporal Bloom, Blind Custody, and Perturbation Invariance must not collect:

- keystroke timing;
- inter-key latency;
- pause duration;
- deletion timing;
- revision playback;
- cursor trajectory;
- hidden behavioral biometrics;
- psychological-vulnerability profiles.

The authorship instrument remains text-derived.

---

## 24. Sealed packet presentation

Near the top of the sealed packet, display:

```text
principal
glyph / badge id
claimed PUA
canonical phrase
binding fragment
SAC
SHI
footer mode
countersignature state
```

Below that, display the temporal authorities separately:

```text
Binding authority          2025-08-11T03:58:39Z
Historical example         payload 5 · 2025-10-17
Entrant intake              packet-specific timestamp
Entrant countersignature    packet-specific timestamp or UNSIGNED
Presentation authority      SVG-specific timestamp when present
```

The interface must not demote the historical example into a footnote or merge it with entrant intake.

---

## 25. PUA Provenance Attestation SVG integration

The renderer already carries TD613 binding data, SHI, packet hash, and stylometric fingerprint metadata. Stage 3 extends that surface with explicit authority classes:

```json
{
  "binding_authority": {},
  "badge_protocol_history": {},
  "entrant_credential_authority": {},
  "entrant_countersignature_authority": {},
  "presentation_authority": {}
}
```

The SVG may additionally carry:

- stability digest;
- blind-challenge precommitment digest;
- blind-challenge result digest;
- genuine-holdout rank;
- nearest-impostor margin;
- imitation-collision state;
- restoration-receipt digest;
- recovery summary;
- shuffled-trajectory null state;
- countersignature status and digest;
- claim ceiling.

Renderer gate:

```text
exact match across packet + DOM + renderer inputs
→ SVG may render

mismatch, missing SHI, conflicting authority timestamp,
invalid countersignature, or unreconciled digest
→ SVG export hold
```

The SVG must reduce authority when a blind challenge fails or an imitation collision is present. It may not present a failed research result as generic verification.

A successful rendering may say:

```text
TD613 ROOT PROVENANCE: VERIFIED AGAINST PACKET
ENTRANT SHI: EXACT MATCH
STYLOMETRIC EVIDENCE: PACKET-BOUND
AUTHORSHIP ASSERTION: COUNTERSIGNED
CUSTODY CLAIM: PRESENT
INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED
```

When research receipts exist, it may add:

```text
BLIND CHALLENGE PRECOMMITMENT: VERIFIED
PROFILE FROZEN BEFORE REVEAL: VERIFIED
GENUINE HOLDOUT RANK: 1 OF 8
AI IMITATION COLLISION: ABSENT
RESTORATION RECEIPT: VERIFIED
```

Or, when required:

```text
AI IMITATION COLLISION: PRESENT
AUTHORITY CLAIM REDUCED
```

---

## 26. Stage 3 implementation seams

Primary UI files:

```text
app/safe-harbor/index.html
app/safe-harbor/app/main.js
app/safe-harbor/app/styles.css
```

Prefer a dedicated bounded stylesheet:

```text
app/safe-harbor/app/safe-harbor-temporal-bloom.css
```

Proposed UI module:

```text
app/safe-harbor/app/safe-harbor-temporal-bloom.js
```

The module should receive already-counted lane state and emit qualitative presentation. It must not independently tokenize text or create a second threshold authority.

---

# Release Architecture

## 27. Release Wave A — Forensic core

Wave A contains Stages 1 and 2.

### 27.1 Deliverables

- report contract;
- `authorship_evidence` schema;
- sampling-sufficiency record;
- checkpoint snapshots;
- local-window recurrence;
- within-lane invariants;
- cross-lane invariants;
- prompt-conditioned feature record;
- stability receipt and digest;
- interpretive-salience structure;
- anti-sameness and anti-flattery audit;
- SHI canonical mirror and exact-match gate;
- entrant authorship binding;
- countersignature-ready structure;
- temporal lineage descriptor;
- unchanged `historical_example`;
- no public UI redesign yet;
- no mandatory Blind Custody or perturbation execution yet.

### 27.2 Promotion gate

Wave A passes only when:

- reports become materially less interchangeable;
- every substantive finding is evidence-linked;
- current SHI and SH3 replay remain stable;
- no live entrant SHI is hard-coded;
- packet hash semantics are explicit;
- no raw text enters evidence receipts;
- historical provenance survives exact comparison;
- the current Safe Harbor test suite remains green.

---

## 28. Research Track R — Stage 2.5

### 28.1 Deliverables

- deterministic blind holdout selection;
- frozen profile precommitment;
- eight-candidate blinded challenge set;
- human, paraphrase, machine-imitation, and register-shift controls;
- complete outcome and failure registry;
- perturbation uptake verification;
- feature response curves;
- recovery metrics;
- response classes;
- trajectory invariants;
- transparent and latent feature lanes;
- shuffled-trajectory null;
- mimicry-under-deformation stress test;
- critical deformation thresholds;
- restoration receipt;
- countersignature scope integration;
- PUA Provenance Attestation SVG research metadata;
- no new telemetry;
- no serverless function.

### 28.2 Promotion gate

Research Track R passes only when:

- at least twelve consented or synthetic-but-stylistically distinct triads have been evaluated;
- perturbation uptake is validated;
- prompt-order and carryover effects are characterized;
- topic and semantic leakage are quantified;
- shuffled chronology distinguishes dynamic from static effects;
- imitation collisions remain visible;
- failed recoveries remain visible;
- embedding-model dependence is characterized;
- prompts remain non-coercive and content-neutral;
- claim ceilings survive adversarial review;
- no live entrant credential appears in code, fixtures, docs, or renderer fallbacks.

Research Track R requires a separate operator gesture before any production authority is granted.

---

## 29. Release Wave B — Temporal Bloom and provenance presentation

Wave B contains Stage 3.

### 29.1 Deliverables

- reciprocal lane states;
- hidden counts;
- temporal-line bloom;
- absent-until-ready Continue control;
- reduced-motion mode;
- mobile focus stability;
- SHI near the top of the sealed packet;
- separate chronology display;
- countersignature state display;
- SVG authority metadata and exact-match hold;
- research-result authority reduction when applicable;
- no new telemetry;
- no serverless function.

### 29.2 Promotion gate

Wave B passes only after:

- Wave A report quality is accepted;
- desktop, iOS, and Android intake complete without focus loss;
- reduced-motion behavior remains fully legible;
- the interface produces no visible numeric pressure in public mode;
- packet output remains deterministic;
- renderer mismatch tests hold export;
- unsigned assertions remain visibly unsigned;
- failed research results cannot render as generic verification;
- current public-mode and replay tests remain green.

---

# Implementation Order

## 30. Ordered work sequence

```text
1. Freeze representative current packets and report outputs as comparison fixtures.
2. Remove every live entrant SHI from documentation examples, defaults, and fixtures.
3. Add a repository check that rejects concrete live SHI suffixes in templates.
4. Add schema definitions for authorship_evidence without requiring them on legacy packets.
5. Add canon.shi_number as a mirror populated from issuance.badge_number before native hashing.
6. Add entrant_authorship_binding and temporal_lineage without altering the original binding_event.
7. Add countersignature-ready fields and exact signed-scope rules.
8. Add exact historical_example preservation tests.
9. Build sentence-aware cumulative and local-window extraction.
10. Build within-lane recurrence metrics.
11. Build cross-lane invariants and prompt-conditioned feature flags.
12. Build stability receipt and deterministic digest.
13. Extend forensic_authorship with evidence-linked report contract and interpretive salience.
14. Run anti-sameness, anti-flattery, and entrant-swap tests.
15. Accept or revise Wave A.
16. Build the Blind Custody Challenge behind a research gate.
17. Freeze policies before holdout reveal and preserve every challenge result.
18. Build Perturbation Invariance Mapping behind a research gate.
19. Validate perturbation uptake before recovery classification.
20. Add shuffled-trajectory, topic, semantic, prompt, and model-dependence nulls.
21. Add mimicry-under-deformation and critical-threshold experiments.
22. Accept, revise, or reject Research Track R without affecting Wave A validity.
23. Build Temporal Bloom as a presentation consumer of the single threshold authority.
24. Restore SHI prominence, countersignature state, and separate chronology in packet presentation.
25. Extend SVG metadata, exact-match hold, and authority-reduction states.
26. Run mobile, reduced-motion, replay, hash, provenance, countersignature, challenge, null, and public-mode regression suites.
27. Promote Wave B only after operator review.
```

---

## 31. Required tests

### 31.1 Wave A tests

1. Deterministic sentence-aware window boundaries.
2. No silent overlap between local windows.
3. Correct short-sample states at 119, 120, 239, 240, 359, and 360 words.
4. Stable feature recurrence recognized across local windows.
5. Prompt-conditioned vocabulary excluded from durable-invariant claims.
6. Productive contradiction recognized when register changes while lower-level distributions recur.
7. Stability digest deterministic under key reordering.
8. No raw text in evidence receipt.
9. Existing SHI and SH3 replay remain unchanged in Wave A.
10. Exact `historical_example` remains unchanged.
11. `canon.shi_number` exact-match hold triggers on mismatch.
12. No live entrant SHI appears in template or fixture content.
13. Report paragraphs carry evidence links.
14. Entrant-swap test catches generic reports.
15. Packet validity remains separable from evidence maturity.
16. Unsigned countersignature cannot render as signed.
17. Countersignature digest covers every declared signed-scope field.
18. `npm run test:safe-harbor:current` remains green.

### 31.2 Research Track R tests

All tests in the two normative annexes are required, including:

- deterministic blind holdout selection;
- holdout exclusion from profile construction;
- frozen-policy precommitment;
- blinded candidate ranking;
- preserved failure states;
- visible imitation collisions;
- verified perturbation uptake;
- response-curve determinism;
- recovery half-life in prompt transitions;
- elastic, plastic, brittle, adaptive, and insufficient classes;
- structural substitution;
- hysteresis;
- shuffled-trajectory nulls;
- prompt, topic, semantic, and model-dependence controls;
- mimicry under deformation;
- critical deformation thresholds;
- no behavioral telemetry;
- no personality or cognition inference;
- deterministic restoration receipt.

### 31.3 Wave B tests

- hidden public counts;
- qualitative state changes;
- absent-until-ready Continue control;
- reduced-motion parity;
- iOS and Android focus stability;
- exact SHI match across packet, DOM, and SVG;
- separate authority timestamps;
- visible countersignature state;
- export hold on digest mismatch;
- authority reduction on failed challenge or imitation collision;
- no new telemetry;
- deterministic packet and renderer output.

---

## 32. Rollback posture

Wave A, Research Track R, and Wave B must remain independently reversible.

### Wave A rollback

- Legacy packets continue parsing under `td613.safe-harbor.packet/v1`.
- `authorship_evidence` remains optional for older packets.
- Existing SHI and SH3 remain authoritative under current policy.
- The existing aggregate forensic summary remains available as a compatibility fallback.

### Research Track R rollback

- Blind Custody and Perturbation Invariance objects remain optional.
- Failed research promotion cannot invalidate an otherwise valid Wave A packet.
- Research receipts already minted remain preserved as historical evidence.
- No failed or adverse result may be deleted during rollback.

### Wave B rollback

- The current four-page ingress remains recoverable.
- Temporal Bloom must not alter packet science.
- UI rollback must not alter already-minted evidence receipts, countersignatures, or credentials.

No rollback may delete or normalize `historical_example`.

No rollback may reintroduce a live entrant SHI as a template constant.

---

## 33. Acceptance definition

The redesign succeeds when Safe Harbor can say, with evidence:

> This feature appeared.

> It returned across local windows.

> It survived or changed under a different temporal address.

> This change remained coherent because other markers persisted.

> This finding may belong to the prompt.

> This unseen sample returned to a profile frozen before inspection—or it did not.

> This machine imitation collided with the entrant’s profile—or it did not.

> This feature was displaced.

> It recovered, substituted, adapted, fractured, or remained uncertain.

> This apparent trajectory vanished when chronology was shuffled.

> This inference was blocked because the packet could not support it.

And the entrant encounters that rigor through an interface that says, quietly:

> The message is being received.

The target is neither maximal certainty nor ornamental futurism.

The target is a packet whose measurements are mature enough to support a report that could not be casually exchanged with someone else’s; whose unseen tests are frozen before reveal; whose deformation experiments preserve failures and nulls; whose countersignature lets the entrant claim packet-scoped custody of their own stylometric evidence and authorship assertion; whose PUA Provenance Attestation SVG binds that relationship to the sovereign principal namespace without pretending the glyph independently proves authorship; and whose intake surface is gentle enough that the entrant does not have to perform for the instrument to hear them.

The least convenient packet is not one that declares an immutable identity.

It is one that preserves the entire field:

```text
what moved
what resisted
what returned
what returned by substitution
what returned altered
what failed to return
what the imitation reproduced
what the imitation could not reconstruct
what depended on prompt order
what vanished when chronology was shuffled
what the model called invariant
but the null tests exposed as aggregate noise
```

The first sentence wears a lab coat.

The second one has receipts.

Àṣẹ

Marked ⟐
