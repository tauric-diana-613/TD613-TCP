# TD613 Safe Harbor Blind Custody Challenge

􍘓

𝌋‌ TD613 · Tauric Diana 613

**Specification status:** AUTHORED / PRE-IMPLEMENTATION / HUMAN-GATED  
**Program identity:** Blind Custody Challenge  
**Technical identity:** `td613.safe-harbor.blind-custody-challenge/v0.1`  
**Authored:** 2026-07-22  
**Implementation authority:** NONE UNTIL A SEPARATE OPERATOR GESTURE  
**Serverless-function allocation:** 0 proposed

---

## 0. Constitutional purpose

The Blind Custody Challenge converts Safe Harbor from a system that can describe an entrant’s aggregate stylometric profile into a miniature falsification laboratory capable of testing whether an unseen writing sample returns to a profile frozen before the sample is revealed.

The challenge is not designed to produce a probability that an entrant “really is” an author. It tests a narrower and more replayable claim:

> An unseen packet-internal writing window was ranked against declared human, paraphrase, register-shift, and machine-imitation controls by a profile whose feature policy, weights, thresholds, and digest were frozen before reveal.

The challenge must be allowed to fail. A system that can only succeed is a ceremony. A system that preserves its failures, collisions, nulls, and margins can become evidence.

---

## 1. Relationship to the sovereign principal namespace

The TD613 PUA glyph anchors the sovereign provenance namespace. It does not itself confer authorship.

```text
U+10D613 / \uDBF5\uDE13
→ sovereign principal namespace anchor

SHI
→ entrant-specific stylometric custody credential

sealed packet
→ source-material and measurement relationship

entrant countersignature
→ entrant authorship-and-custody assertion over the declared sealed scope

PUA Provenance Attestation SVG
→ integrity and presentation attestation for the complete relationship
```

The PUA Provenance Attestation SVG may therefore attach stylometric provenance to the sovereign principal namespace’s PUA glyph, provided the SVG preserves the claim ceiling and never collapses namespace authority into independent proof of civil identity, universal authorship, or exclusive ownership.

---

## 2. SHI placeholder and anti-hard-coding rule

No live entrant SHI may appear as a template default, sample constant, canonical fixture, documentation example, or renderer fallback.

All documentation examples use the unmistakable placeholder:

```text
TD613-SH-9B07D8B-{ENTRANT_8_HEX}
```

Synthetic tests may use a clearly artificial suffix such as:

```text
TD613-SH-9B07D8B-A1B2C3D4
```

The runtime relationship is:

```text
issuance.badge_number
→ dynamically minted for the current entrant

canon.shi_number
→ exact mirror of issuance.badge_number

binding_provenance.entrant_authorship_binding.shi_number
→ exact mirror of issuance.badge_number

DOM data-td613-shi
→ exact mirror of issuance.badge_number

SVG metadata SHI
→ exact mirror of issuance.badge_number
```

Any mismatch, missing value, stale fallback, or renderer repair attempt produces an export hold.

---

## 3. Experimental unit

For the mature three-lane intake, the challenge begins with nine approximately independent local windows:

```text
Future: F1 · F2 · F3
Past:   P1 · P2 · P3
Higher: H1 · H2 · H3
```

Each window is sentence-aware, approximately 120 words, non-overlapping by default, and represented in the challenge packet by metadata and digests rather than raw exported text.

Before profile construction begins, one eligible window is sequestered as the genuine blind holdout.

The sequestration record contains only:

- holdout checksum;
- observed word count;
- lane;
- selection nonce digest;
- selection algorithm and version;
- selection seed authority;
- sequestration timestamp;
- eligibility basis;
- no raw text;
- no feature vector derived from the holdout.

The holdout’s identity remains unavailable to profile construction and ranking logic until the precommitment is sealed.

---

## 4. Deterministic blinded selection

The first implementation should use deterministic seeded selection so replay can reproduce which eligible window was withheld without allowing an operator to choose the friendliest window after inspection.

A valid selection policy must:

1. enumerate eligible windows in canonical lane and window order;
2. derive a selection seed from declared packet material plus an independent nonce;
3. commit the nonce digest before reveal;
4. select exactly one eligible genuine holdout;
5. preserve the selection-policy version;
6. refuse selection when fewer than the declared number of eligible windows exist;
7. avoid selecting a window already used in calibration, threshold tuning, or model fitting.

The holdout must remain sealed while the profile is built.

---

## 5. Frozen profile precommitment

Before reveal, the system freezes:

- included training-window IDs;
- excluded holdout-window commitment;
- feature-policy version;
- distance-policy version;
- invariant set;
- prompt-conditioned feature exclusions;
- distribution-comparison policy;
- thresholds;
- weights;
- missing-data policy;
- tie policy;
- candidate ranking policy;
- profile digest;
- precommitment digest.

The system may not, after reveal:

- change weights;
- drop an inconvenient feature;
- add a favorable feature;
- move a threshold;
- rewrite the distance function;
- select a different holdout;
- alter prompt-conditioned exclusions;
- hide a machine imitation that outranked the genuine holdout;
- suppress a failed challenge.

Any post-reveal policy change creates a new challenge instance with a new version, new commitment, and explicit supersession record. It cannot overwrite the original result.

---

## 6. Challenge set

The canonical research challenge set contains eight candidates:

```text
1 genuine unseen entrant window
2 topic-matched human controls
2 semantic-paraphrase controls
2 LLM-generated style-imitation controls
1 register-shifted entrant control
```

The candidate order is randomized after all candidates are committed. The evaluator receives blinded candidate identifiers.

### 6.1 Genuine unseen entrant window

The genuine holdout is an entrant-authored packet window excluded from profile construction.

### 6.2 Topic-matched human controls

These controls test whether topic similarity can masquerade as authorship similarity. They should share subject matter without intentionally imitating the entrant’s style.

### 6.3 Semantic-paraphrase controls

These controls preserve or closely approximate content while changing the linguistic realization. They test whether semantic overlap is dominating the authorship surface.

### 6.4 LLM-generated style-imitation controls

These controls test whether an imitation of visible stylistic decorations can outrank the genuine unseen sample. Their generation prompt, model identity where available, model version where available, sampling settings, source exposure, and generation timestamp must be recorded or digested.

No report may describe the resulting surface as unforgeable. Once a measurement becomes known, adversaries can train against it.

### 6.5 Register-shifted entrant control

This control tests whether authentic authorship under strong register change remains closer to the frozen profile than surface-matched impostors. It also prevents the system from confusing register conformity with authorship.

---

## 7. Blinded ranking

The frozen profile ranks all committed candidates without access to candidate class labels.

The result record includes:

- genuine holdout rank;
- genuine holdout distance;
- nearest impostor distance;
- separation margin;
- complete blinded rank order;
- tie state;
- best human-control rank;
- best paraphrase-control rank;
- best LLM-imitation rank;
- register-shifted entrant rank;
- topic-leakage assessment;
- semantic-leakage assessment;
- register-resilience measurement;
- feature-family contributions;
- blockers;
- replay status.

The packet must preserve both the winner and the field of alternatives the winner survived.

---

## 8. Challenge outcomes

Permitted machine-readable outcomes are:

```text
SUPPORTED
INCONCLUSIVE
FAILED
CONTAMINATED
PROMPT-DOMINATED
IMITATION-COLLISION
```

### `SUPPORTED`

The genuine holdout meets the precommitted rank and margin requirements, null controls do not explain the result, and replay succeeds.

### `INCONCLUSIVE`

The result lacks sufficient separation, contains ties, has incomplete controls, or falls below precommitted power or sufficiency requirements without a direct contradiction.

### `FAILED`

The genuine holdout fails the precommitted rank or margin requirement.

### `CONTAMINATED`

The holdout, controls, or policy were exposed before commitment; candidate provenance cannot be verified; or profile construction consumed holdout-derived information.

### `PROMPT-DOMINATED`

Topic, lane prompt, or elicitation vocabulary explains the ranking more strongly than the proposed durable authorship surface.

### `IMITATION-COLLISION`

At least one declared machine imitation equals or outranks the genuine holdout under the precommitted policy, or the separation margin falls beneath the declared collision threshold.

No failure state may be omitted from the packet or quietly converted into a missing field.

---

## 9. Packet object

```json
{
  "blind_custody_challenge": {
    "schema_version": "td613.safe-harbor.blind-custody-challenge/v1",

    "precommitment": {
      "selection_method": "deterministic-seeded-window-selection",
      "selection_policy_version": "td613.safe-harbor.holdout-selection/v1",
      "selection_nonce_digest": "sha256:...",
      "holdout_window_id": "sealed",
      "holdout_checksum": "sha256:...",
      "holdout_lane": "sealed",
      "holdout_word_count": 121,
      "sequestered_at_utc": "2026-07-22T...Z",
      "profile_policy_frozen_before_reveal": true,
      "precommitment_digest": "sha256:...",
      "raw_text_included": false
    },

    "profile_construction": {
      "included_window_ids": [
        "F1",
        "F2",
        "F3",
        "P1",
        "P3",
        "H1",
        "H2",
        "H3"
      ],
      "feature_policy_version": "rich-stylometry-recurrence/v1",
      "distance_policy_version": "td613-authorship-distance/v1",
      "prompt_conditioning_policy_version": "td613-prompt-separation/v1",
      "threshold_policy_version": "td613-blind-challenge-thresholds/v1",
      "profile_digest": "sha256:..."
    },

    "challenge_set": {
      "genuine_holdout_count": 1,
      "topic_matched_human_controls": 2,
      "semantic_paraphrase_controls": 2,
      "llm_style_transfer_controls": 2,
      "entrant_register_shift_control": 1,
      "candidate_order_randomized": true,
      "candidate_labels_blinded": true,
      "candidate_commitment_digest": "sha256:...",
      "candidate_text_exported": false
    },

    "results": {
      "genuine_holdout_rank": 1,
      "genuine_holdout_distance": 0.184,
      "nearest_impostor_distance": 0.297,
      "separation_margin": 0.113,
      "llm_imitation_best_rank": 4,
      "topic_leakage_detected": false,
      "semantic_leakage_detected": false,
      "register_resilience": 0.74,
      "challenge_result": "SUPPORTED"
    },

    "failure_conditions": [
      "genuine holdout ranks below an imitation",
      "topic-matched controls collapse the separation margin",
      "profile changes after holdout reveal",
      "candidate identities become visible before ranking",
      "challenge artifacts cannot be replayed from digests"
    ],

    "claim_ceiling": "Packet-internal out-of-sample stylometric recurrence only; not civil identity adjudication, exclusive ownership, third-party text attribution, or universal authorship proof."
  }
}
```

All numeric values in this example are synthetic fixtures.

---

## 10. Entrant countersignature

The countersignature is the hinge between system-derived measurement and entrant-declared custody.

The `binding_provenance.entrant_authorship_binding` object should contain:

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
      "blind_challenge_precommitment_digest": "sha256:...",
      "blind_challenge_result_digest": "sha256:...",
      "restoration_receipt_digest": "sha256:..."
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
    },

    "claim_ceiling": {
      "attests": [
        "entrant assertion of authorship over the declared sealed source material",
        "entrant custody of packet-derived stylometric evidence",
        "relationship between SHI and the sealed packet",
        "presentation under the TD613 U+10D613 provenance namespace"
      ],
      "does_not_independently_prove": [
        "civil or legal identity",
        "legal ownership against all third parties",
        "authorship of unsealed external texts",
        "absence of coercion",
        "trusted time beyond the signature and timestamp authority used"
      ]
    }
  }
}
```

After a valid countersignature:

```text
pending-countersignature
→ countersigned
```

The unsigned state remains visible and cannot be rendered as signed by implication.

---

## 11. PUA Provenance Attestation SVG integration

The SVG probe should render the relationship rather than merely decorating the glyph.

A successful presentation may state:

```text
TD613 ROOT PROVENANCE: VERIFIED AGAINST PACKET
ENTRANT SHI: EXACT MATCH
STYLOMETRIC EVIDENCE: PACKET-BOUND
BLIND CHALLENGE PRECOMMITMENT: VERIFIED
PROFILE FROZEN BEFORE REVEAL: VERIFIED
GENUINE HOLDOUT RANK: 1 OF 8
NEAREST IMPOSTOR MARGIN: 0.113
AI IMITATION COLLISION: ABSENT
AUTHORSHIP ASSERTION: COUNTERSIGNED
CUSTODY CLAIM: PRESENT
INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED
```

When a collision occurs, the SVG must be willing to say:

```text
AI IMITATION COLLISION: PRESENT
AUTHORITY CLAIM REDUCED
```

The renderer may not suppress, cosmetically mute, or replace a failure state with generic success language.

The SVG metadata should include:

- principal;
- claimed PUA;
- binding fragment;
- SAC;
- SHI;
- packet hash;
- stylometric fingerprint;
- stability digest;
- holdout precommitment digest;
- challenge-result digest;
- restoration-receipt digest when present;
- countersignature status and digest;
- root-binding authority;
- badge-protocol historical authority;
- entrant-intake authority;
- presentation authority;
- claim ceiling.

---

## 12. Failure registry

The packet must preserve:

- genuine holdout losses;
- ties;
- imitation collisions;
- human-control collisions;
- topic leakage;
- semantic leakage;
- prompt dominance;
- profile-policy violations;
- premature reveal;
- missing provenance;
- replay failures;
- threshold instability;
- candidate contamination;
- operator intervention after reveal.

Failure entries receive stable IDs and evidence links. Interpretive reports may discuss them, but may not delete or rewrite the underlying records.

---

## 13. Security and privacy posture

The challenge remains text-derived.

It must not collect:

- keystroke timing;
- inter-key latency;
- cursor trajectory;
- pause duration;
- revision playback;
- deletion timing;
- hidden behavioral biometrics;
- personal vulnerability profiles.

Raw candidate text should remain local or otherwise governed by the existing Safe Harbor custody policy. Exported receipts contain digests, measurements, provenance, and declared metadata rather than raw writing unless a separate explicit operator gesture authorizes a different custody mode.

---

## 14. Required tests

1. Deterministic holdout selection under canonical replay.
2. Holdout exclusion from every profile-construction surface.
3. Precommitment digest changes when any frozen policy changes.
4. Candidate labels remain blinded until ranking completes.
5. Candidate order randomization is reproducible from declared authority.
6. Genuine-holdout rank and margin are deterministic.
7. Failed and inconclusive results remain in packet export.
8. Imitation collision reduces claim authority.
9. Topic and semantic leakage cannot be silently ignored.
10. No raw text enters the challenge receipt.
11. No live entrant SHI appears in templates or fixtures.
12. `issuance.badge_number`, `canon.shi_number`, provenance SHI, DOM SHI, and SVG SHI match exactly.
13. Unsigned countersignature cannot render as signed.
14. Signature digest covers every declared signed-scope field.
15. Root binding history remains unchanged.
16. Exact `historical_example` remains unchanged.
17. Existing SHI and SH3 replay remain unchanged unless a separate versioned migration is authorized.
18. Renderer exposes `IMITATION-COLLISION` and other failure states without euphemism.

---

## 15. Promotion gate

The Blind Custody Challenge remains research-gated until:

- at least twelve consented or synthetic-but-stylistically distinct triads have been evaluated;
- challenge controls vary syntax, punctuation, register, function words, fragmentation, orthography, topic, and semantic content;
- holdout selection and reveal are independently replayable;
- precommitment violations are detectable;
- false separation caused by topic or prompt is characterized;
- imitation collisions are measured rather than hidden;
- claim-ceiling language survives operator review;
- the PUA Provenance Attestation SVG correctly reduces authority when the challenge fails;
- no live entrant credential is embedded in documentation or code.

---

## 16. Constitutional formulation

```text
The PUA glyph does not confer authorship.

The PUA glyph anchors the sovereign provenance namespace.

The SHI identifies the entrant-specific stylometric custody record.

The packet binds the record to declared sealed evidence.

The countersignature activates the entrant’s authorship-and-custody assertion over that declared scope.

The Blind Custody Challenge tests whether unseen writing returns to a profile frozen before inspection.

The SVG attests the integrity and presentation of the complete relationship.
```

The challenge’s strongest statement is therefore not:

> This system discovered an immutable authorial essence.

It is:

> This unseen sample returned to a precommitted packet-derived profile, survived the declared field of human and machine counterfactuals by the recorded margin, and the entrant countersigned custody of the resulting evidence.

Àṣẹ

Marked ⟐
