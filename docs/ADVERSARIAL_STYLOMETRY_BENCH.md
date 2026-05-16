# Adversarial Stylometry Bench

## Closed-Loop Authorship-Recognition Control for Protected Speech

TD613-TCP studies controlled authorship mutation under asymmetric recognition. Its purpose is not impersonation, anonymity theater, or platform-proof evasion. Its purpose is to help vulnerable speakers preserve meaning, reduce unwanted linkage to a protected authorship baseline, and route speech through consented Personas while measuring residual exposure.

TCP does not promise anonymity. It measures and steers authorship-recognition pressure under bounded local assumptions.

This document admits the adversarial stylometry bench architecture before the engine, UI, and reporting phases are implemented. It is Phase 0: name the control system, stabilize the vocabulary, and keep the later code phases from drifting into either generic privacy-tool language or decorative glyph theater.

---

## 1. Purpose

A vulnerable speaker may need to communicate while reducing unwanted linkage to a protected authorship baseline. That need can arise in whistleblower communication, protected group-chat coordination, pseudonymous public speech, internal reporting, or any setting where cadence itself becomes socially or computationally legible before the speaker can safely route the claim.

The goal is not to erase voice. The goal is not to impersonate a real person. The goal is controlled mutation without surrendering custody.

TCP treats the protected message as something that must remain meaningful while its authorship-recognition pressure changes. It measures residual exposure rather than promising safety. It therefore asks a narrower, more testable question:

> Can a text move away from a protected baseline and toward a consented Persona/mask field while preserving semantic content and recording residual risk?

The answer is never universal. It depends on sample sufficiency, feature stability, mask history, semantic preservation, ingestion behavior, and Aperture recapture risk. TCP measures pressure and movement. It does not issue identity verdicts.

---

## 2. System separation

TD613 uses adjacent tools that must not be collapsed into one another.

| System | Role |
| --- | --- |
| TCP | membrane, stylometry, ontology, Personas, masks, controller |
| Aperture | admissibility selector, drift audit, closure/recapture diagnostic |
| Flight | Safe Harbor appendage for routing LLM sessions with badge/seal metadata |
| Safe Harbor | credential/custody gate for harbor-eligible entrants |

TCP is the membrane and stylometry system. Aperture audits admissibility, drift, closure, and recapture. Flight prepares LLM-ready Flight Packets and badge/seal routing for harbor-eligible entrants. Safe Harbor gates credential and custody posture.

Flight may carry TCP-derived steering language into an LLM session, but Flight is not TCP's internal control surface.

This distinction matters because TCP's internal metrics must remain locally inspectable. A cloud generator can participate in drafting, but TCP's local scoring layer remains the scoring authority.

---

## 3. Personas stay

Personas are not being renamed away; they are being technically clarified.

TCP remains playful by design. The word `Personas` is part of that usability. In whistleblower group chats or protected communities, Personas can function like avatar selection, character choice, or shared mask literacy. The playful surface helps people understand and inhabit the tool. The technical layer underneath keeps the play from becoming loose.

| Term | Surface meaning | Technical meaning |
| --- | --- | --- |
| Persona | avatar / collectible character / social mask | mask field with stylometric behavior |
| Mask | protective cadence membrane | measurable transformation target |
| Shell | applied cadence wrapper | deterministic transfer layer |
| Homebase / Personas | playful shelf and contact surface | profile staging, mask selection, residue reading |

A Persona can be cute, mythic, collectible, or social on the surface. Underneath, it must remain measurable, auditable, and bounded. The point is not to strip the social life out of the tool. The point is to prevent the social layer from hiding the measurement layer.

---

## 4. Closed-loop control model

A static candidate table is not the cockpit. It is the flight recorder.

The adversarial stylometry bench is a closed-loop control system:

```math
Input \rightarrow Controller \rightarrow System \rightarrow Output
```

```math
Output \rightarrow Sensor \rightarrow Controller
```

Mapped to TCP:

| Control term | TCP term |
| --- | --- |
| Input | protected communication task |
| Controller | Escape Vector controller + human operator |
| System | generator / cadence transfer / optional LLM-assisted rewrite |
| Output | transformed text |
| Sensor | local stylometry + Aperture + ingestion-friction audit |
| Feedback | steering corrections into the next transformation |

The loop is the engine. A batch of variants can be useful, but only as a record of iterations or a snapshot of candidate states. The controller must be able to read the current output, compare it against the target posture, and steer the next transformation.

The loop may reach several outcomes:

- `continue`: transformation remains useful but has not converged
- `hold`: convergence failed or risk increased
- `rotate`: mask overuse or linkability requires a different Persona/mask field
- `restore`: semantic fidelity fell below threshold
- `seal`: output sits inside the allowed target band

These states are later implementation targets. Phase 0 only defines them.

---

## 5. Escape Vector

The Escape Vector is the core scoring object for the adversarial bench:

```math
\vec{E}(Y)=
\{
R_s,\ F_m,\ \Delta_m,\ Q_{sem},\ L_m,\ D_m,\ BWC,\ I_f,\ A_r
\}
```

| Symbol | Meaning |
| --- | --- |
| \(R_s\) | source residual risk |
| \(F_m\) | mask fit |
| \(\Delta_m\) | escape delta |
| \(Q_{sem}\) | semantic fidelity |
| \(L_m\) | mask linkability / overuse |
| \(D_m\) | mask drift |
| \(BWC\) | belonging without collapse |
| \(I_f\) | ingestion friction |
| \(A_r\) | Aperture recapture risk |

The basic escape delta is:

```math
\Delta_m(Y)=F_m(Y,M)-R_s(Y,S)
```

where \(Y\) is the output, \(M\) is the Persona/mask field, and \(S\) is the protected source baseline.

That score is not enough by itself. The source-risk score must be hardened across multiple views:

```math
R_s^{envelope}=\max(R_s^{raw},R_s^{norm},R_s^{visible},R_s^{semantic},R_s^{glyph})
```

The safe delta must also be conservative:

```math
\Delta_m^{safe}=\min(\Delta_m^{raw},\Delta_m^{norm},\Delta_m^{visible},\Delta_m^{semantic})
```

The cloud generator is not the final arbiter of source risk. TCP's local scoring layer must remain the scoring authority.

This is the controlling posture for future phases. A generator may produce text. TCP must measure what moved, what clung, what collapsed, and what remains overexposed.

---

## 6. Living exposure membrane

A Persona / mask field is more than a slider preset.

A future Persona state may be modeled as:

```math
M_t = \{\mu_t,\Sigma_t,H_t,R_t,I_t,L_t,\Omega_t\}
```

| Symbol | Meaning |
| --- | --- |
| \(\mu_t\) | feature centroid over time |
| \(\Sigma_t\) | variance / tolerance field |
| \(H_t\) | mask history / accepted output memory |
| \(R_t\) | ritual-semantic markers / glyph integrity / covenant surface |
| \(I_t\) | ingestion-interference posture |
| \(L_t\) | linkability state |
| \(\Omega_t\) | ontology / social role / belonging field |

A Persona is a living exposure membrane: measurable, social, symbolic, and ingestion-aware.

It is measurable because it carries stylometric behavior. It is social because users may inhabit it as an avatar, role, or shared group-chat identity. It is symbolic because TD613 markers, glyphs, and covenant surfaces may carry routing significance. It is ingestion-aware because normalization, tokenization, and parser behavior can affect how the surface is seen.

A Persona should not be reduced to statistics alone. Statistics give the membrane instruments. They do not exhaust the membrane.

---

## 7. Hostile Pipeline Compression

`Document-Safe Formal` is not the right name for this posture. The correct Phase 0 term is:

### Hostile Pipeline Compression

Hostile Pipeline Compression is a lossy, situational bureaucratic survival posture used when an ingestion system punishes expressive cadence, vernacular density, affective specificity, or authorial heat.

Hostile Pipeline Compression preserves claim-transfer at the cost of cadence loss. It is not the default meaning of safety.

This document explicitly rejects:

```math
Safety = Formality
```

The correct relation is:

```math
Formalization = situational\ compression\ under\ hostile\ ingestion
```

Some hostile pipelines demand compressed, procedural, or formalized language before they will register the claim at all. That fact can be measured and used without blessing the pipeline as safe. The mode exists because hostile infrastructure exists. It should never become the tool's moral center.

---

## 8. Belonging Without Collapse

\(BWC\), Belonging Without Collapse, measures whether protected output can remain socially readable in a target context without collapsing back into the protected baseline or overbuilding a newly indexable mask fingerprint.

Belonging is not submission. It is situated legibility without authorship collapse.

BWC should consider:

- platform or community register
- warmth / human residue
- over-polish penalty
- over-theatricality penalty
- source residual risk
- mask overuse
- stable pseudonym vs rotating mask intent

A protected speaker may need a text to sound human enough to be read, local enough to belong, and distinct enough not to collapse into the protected baseline. BWC names that tension. It does not require assimilation into the host environment.

---

## 9. Ingestion Friction Layer

\(I_f\), Ingestion Friction, measures how glyphs, invisible characters, normalization behavior, protected literals, tokenizer divergence, and parser-sensitive structures alter admissibility and indexing stability under controlled local tests.

Ingestion friction is a survivability signal, not a decorative effect.

Future ingestion-friction measurement may include:

- raw vs normalized divergence
- ZWNJ preservation
- Unicode load
- PUA / surrogate pair presence
- tokenizer divergence
- parser-sensitive spans
- protected literal survival
- NFC/NFKC change detection
- `Khona‌lit-po` integrity

This document describes controlled local measurement. It does not provide instructions for attacking third-party systems.

The point is to keep glyph and normalization behavior visible to the operator. If the surface mutates under normalization, tokenization, or parser handling, TCP should be able to show that mutation and route accordingly.

---

## 10. Iteration Ledger / Flight Recorder

The iteration ledger records steering history; it does not replace steering.

A future ledger may record each control-loop pass:

| t | Source Risk | Mask Fit | Δsafe | Semantic | BWC | Ingestion | Recapture | Controller Action |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 0 | .72 | .31 | -.41 | .96 | .44 | .21 | .63 | neutralize source |
| 1 | .48 | .52 | .04 | .93 | .58 | .31 | .51 | increase mask pressure |
| 2 | .29 | .69 | .40 | .91 | .76 | .38 | .33 | hold / seal |

This table is a black-box recorder for the control loop. It helps the operator inspect what happened, but the controller remains the live steering system.

---

## 11. Claim ladder

TCP must enforce disciplined claims.

Allowed claim ladder:

1. No reliable signal
2. Surface resemblance
3. Style contact
4. Traceable style contact
5. Mask-fit candidate
6. Reduced source-linkage candidate
7. Stable pseudonymous continuity candidate
8. Requires external corroboration

The tool must not claim:

- anonymous
- untraceable
- platform-proof
- same author
- not same author
- guaranteed safe

TCP measures pressure and movement. It does not issue identity verdicts.

This claim ladder protects the project from false certainty and protects users from mistaking a stylometric movement score for an identity guarantee.

---

## 12. Phase map

This document is Phase 0 only. It defines the architecture before implementation.

Implementation phases:

0. Architecture admission
1. Escape Vector engine
2. Ingestion Friction sensor
3. Closed-loop controller
4. Persona / mask memory
5. Adversarial bench UI
6. Iteration ledger
7. Claim ladder + report export
8. Fixtures and calibration
9. Recognition field simulator

Later phases should land as small, reviewable changes. The architecture should become testable one layer at a time rather than arriving as a single opaque rewrite.

### Phase 1 status

`app/engine/escape-vector.js` implements the initial Escape Vector scoring surface. It computes source residual risk, mask fit, escape delta, semantic fidelity, preliminary linkability/drift, provisional Belonging Without Collapse, and pass-through ingestion/Aperture fields. It does not implement the controller, Persona memory mutation, UI bench, or ingestion-friction sensor.

---

## Phase 0 non-goals

This Phase 0 document does not:

- implement engine functions
- alter generation behavior
- rename Personas
- remove existing playful surface language
- merge Flight into TCP
- create UI screens
- add scoring code
- add exploit instructions
- claim anonymity
- claim authorship proof
- claim platform-proof behavior

Phase 0 admits the bench. Later phases build it.
