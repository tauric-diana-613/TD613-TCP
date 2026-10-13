# Pedagogue Interface Audit — Giving Data-Entry Field System

**Audit status:** EXECUTED / RESULTS STAGED / IMPLEMENTATION HELD  
**Pedagogue diagnosis schema:** `td613.pedagogue-interface-diagnosis/v0.2`  
**Specimen schema:** `td613.pedagogue-interface-specimen/v0.1`  
**Source packet:** `d2d2a10bcb7a087f3e93ccf2bf4340e16c0a91c4`  
**Surface:** `Giving/Data-entry field system`  
**Implementation authority:** NONE  
**Automatic redesign:** FORBIDDEN  
**Automatic release:** FORBIDDEN  
**Human closure:** REQUIRED

## 1. What already happened

Request #24 did not merely leave a prose note. PR #676 added a generic Pedagogue interface-diagnosis operator and wired the Giving Research Dossier fixture into `compilePedagogueDesignReview()`. When that fixture is compiled, Pedagogue returns an `interface_diagnosis` object alongside the wider design review.

This packet does **not** rerun or reinterpret Giving as product code. It externalizes the already-authored machine diagnosis into a reviewable decision surface so a human operator can inspect the findings before granting any implementation authority.

The Giving interface is therefore the **specimen**, not the owner of the diagnostic capability. Pedagogue owns the generic diagnostic grammar; Giving supplied one bounded case.

## 2. Pedagogue synthesis

Pedagogue's strongest diagnosis is architectural rather than decorative:

> The dominant discontinuity comes from an undeclared data-entry typography / role system, not from the surrounding TD613 panel design.

The panel grammar, color language, and instrument framing already carry a strong TD613 identity. The fields themselves collapse materially different entry tasks—names, money, dates, selectors, and long-form writing—into one generic control family. That collapse is what creates the "Google Forms" resemblance.

Pedagogue also explicitly classifies the existing 16px mobile entry text as **protective**, not as the aesthetic defect. Any later redesign should create refinement through role, weight, tracking, line-height, inset, padding, and geometry rather than simply shrinking mobile text.

## 3. Findings

| Code | Severity | Diagnosis | Consequence |
|---|---:|---|---|
| `CONTROL_ROLE_COLLAPSE` | MEDIUM | Text, numeric, date, select, and textarea controls share one visual grammar without declared field roles. | Distinct investigative tasks read as one generic form family. |
| `TYPOGRAPHIC_ROLE_UNDECLARED` | MEDIUM | Entered data inherits general interface typography rather than a dedicated field-content role. | Strong surrounding product language collapses at the exact point where the operator enters evidence. |
| `MOBILE_SIZE_IS_PROTECTIVE` | LOW | Mobile entry text is 16px. | Size reduction would trade away platform-safe readability/zoom behavior without solving the real aesthetic discontinuity. |
| `TEXTAREA_VISUAL_MASS` | MEDIUM | Long-form writing surfaces are styled as enlarged single-line inputs. | Blank textarea mass becomes visually louder than its task. |
| `NUMERIC_SIGNAL_LOSS` | MEDIUM | Currency/quantity values use the same content typography as prose and names. | Quantitative evidence loses scanability and instrument character. |
| `NATIVE_CONTROL_SEAM` | LOW | Browser-native date chrome can depart visually from TD613. | A visible seam appears, but replacing native date behavior would create unnecessary accessibility/input risk. |
| `PLACEHOLDER_DOMINANCE` | MEDIUM | Empty-state placeholder copy competes with durable labels. | Blank controls look template-led rather than evidence-led. |

## 4. Pedagogue recommendations

### A. Declare entry roles before decorating them

Create named visual roles for identity/search text, narrative text, currency/numeric entry, temporal entry, selectors, and long-form writing. These roles must remain presentation-only; they may not infer user intent or change storage/query semantics.

### B. Author a dedicated field typography system

Define field-family tokens for font family, weight, tracking, line-height, placeholder hierarchy, and numeric tabularity. Preserve user font scaling and the mobile-safe text floor.

### C. Treat textareas as writing surfaces

Give long-form fields a dedicated inset, line-height, minimum-height rhythm, placeholder posture, and focus treatment while keeping native textarea/accessibility behavior.

### D. Instrument numeric entry

Use tabular numerals and a restrained quantitative role for money/count fields. Keep names and prose in the primary humanist text family. Numeric parsing and locale semantics remain untouched.

### E. Style around native temporal controls

Keep browser-native date semantics. TD613 may own the wrapper geometry, spacing, border, focus lighting, and contextual type; the browser continues to own date-entry behavior unless a future functional blocker is empirically demonstrated.

### F. Subordinate placeholders

Labels retain durable meaning. Placeholder copy should demonstrate example shape only and remain visually secondary to both labels and entered values.

## 5. Action-routing audit

Pedagogue also diagnosed action routing generically from context effects:

| Action | Context effect | Pedagogue route |
|---|---|---|
| `New` | `REPLACE_ACTIVE_CONTEXT` | `NAVIGATE_AFTER_WORLD_ANSWER` → return to `Giving/Search` after the new context becomes visible. |
| `Save` | `PRESERVE_ACTIVE_CONTEXT` | `STAY_IN_PLACE_AFTER_WORLD_ANSWER` → no forced navigation. |
| `Open selected file` | `RESTORE_ACTIVE_CONTEXT` | `NAVIGATE_AFTER_WORLD_ANSWER` → return to `Giving/Search` after the restored context becomes visible. |

That routing distinction was already adopted in the Giving miniupdate as request #17. This audit packet does not reopen or modify it.

## 6. Candidate implementation packets — NOT AUTHORIZED

These are decision envelopes only. They are intentionally separable so the operator can authorize a narrow visual change without silently authorizing the whole redesign.

### Packet A — Field-role + typography grammar

**Would include:** declared field roles, entered-value typography, placeholder hierarchy, tabular numeric treatment.  
**Would exclude:** textarea geometry overhaul, date-picker replacement, data semantics, search behavior.  
**Risk posture:** lowest product risk; widest aesthetic payoff.  
**Authority state:** HELD.

### Packet B — Writing-surface treatment

**Would include:** textarea-specific inset, line-height, focus, placeholder posture, and minimum-height rhythm.  
**Would exclude:** data semantics, autosave, content inference, resize/accessibility removal.  
**Risk posture:** bounded visual change; should receive desktop + mobile witness.  
**Authority state:** HELD.

### Packet C — Native temporal seam polish

**Would include:** wrapper-level date-field geometry/focus treatment only.  
**Would exclude:** custom date picker, locale replacement, keyboard/assistive-technology changes.  
**Risk posture:** conservative; native control remains authoritative.  
**Authority state:** HELD.

## 7. Human decision gate

A later implementation PR requires a fresh explicit operator gesture naming which packet(s), if any, may move from diagnosis to product mutation.

Until then:

```text
diagnosis = available
audit_results = reviewable
Giving_UI_mutation = none
Pedagogue_engine_mutation = none
deployment_authority = none
automatic_redesign = false
human_closure_required = true
```

This separation is intentional: the current Giving build remains usable and demoable while the audit can accumulate human feedback—including TG's next pass—without forcing that feedback into production prematurely.

𝌋 TD613 / Pedagogue — audit staged; consequence authority remains human. ⟐
