# DOLLHOUSE ROLE PASSES · TD613 EXTERIORITY OBSERVATORY
**Evaluation Target:** Candidate X Extraction, Egress Episodes A & B, Sequence 1 External Execution Witness  
**Frozen Evidence Capsule:** TD613-ADVERSARIAL-EVIDENCE-CAPSULE-01 + Sequence 1 Adjudication Bridge  
**Base Commit:** `5b4b34278c6100d3c21ced35984c046da157e097`  
**Adjudicated External Head:** `582a1f04fd11e502fc7b3083ef6fa079dd0d23c8`  
**External Runner:** GitHub Actions Run `37349177827` (Job `111895380441`)  

---

## 1. PEDAGOGUE AUDIT

* **Jurisdiction:** Encounter order, consequence order, route burden, question quality, falsifiers, negative controls, human-legible transfer.

```text
OBSERVATION
Candidate X introduces an explicit re-entry membrane dialog (#loomReentryModal) after Continuation 1 reaches REST. Automated test assertions confirm that ordinary prompt entry routes to chat without attachments, while clicking "+ Continue with Loom context" opens a confirmation modal requiring explicit confirmation before carriage is re-armed.

PEDAGOGICAL FAILURE
The explicit modal presentation shifts cognitive burden abruptly onto the user during ordinary conversation. An operator encountering an unprompted modal when attempting natural dialogue experiences friction and ontological ambiguity (deciding between "Stay in chat" vs "Cross into governed route" before knowing what AI will answer). Furthermore, mobile screen real estate is heavily consumed by modal chrome rather than communicative context.

FALSIFIER
A hostile first-time human test on mobile (approx. 390px) where users dismiss the re-entry dialog in frustration or mistakenly assume dismissing it deleted their previous work, aborting the governed journey prematurely.

NEXT INFORMATIVE WITNESS
Canonical Practice Fixture / mobile browser witness measuring operator task completion, confusion pauses, and exit-path accessibility on physical/emulated devices.

CLAIM CEILING
Automated passing tests in Sequence 1 prove state-machine gate transitions in headless JSDOM; they do NOT prove human legibility, pedagogical soundness, or consumer mobile ergonomics.
```

---

## 2. APERTURE AUDIT

* **Jurisdiction:** $S \ne O \ne E$, identifiability, conditioning, narrowing loss, typed epistemic deficit, abstention, widening, classification replay stability.

```text
OBSERVED REGIME
Automated execution of node:test runner hosting JSDOM v24 inside a headless Ubuntu 24 runner on GitHub Actions infrastructure.

NARROWING CHAIN
Actual mobile DOM/rendering -> JSDOM synthetic DOM emulation -> TAP output stream -> exit code 0.

DEFICIT TYPE
Sensor & environmental narrowing deficit. JSDOM provides no layout engine, no touch event coordinate resolution, no rendering engine, and no physical viewport clipping boundaries.

DISPOSITION
Abstain from claiming that Candidate X satisfies production UI contracts. Admit automated behavior as PASS_WITH_SCOPE only.

MISSING WITNESS
Multi-engine browser witness (Chromium, WebKit, Gecko) running in headless and visual modes with real viewport constraints (390x844, 360x740) exercising keyboard, scroll, and touch interaction.

REPLAY-STABILITY STATUS
HELD. A single successful run or identical reruns across deterministic test files do not establish classification replay stability. Stability under environmental jitter, timing variance, and DOM noise remains unmeasured.
```

---

## 3. ATLAS AUDIT

* **Jurisdiction:** Receiver-relative relation survival, projection, predecessor continuity, route memory, return, transport across non-equivalent receivers.

```text
RELATION
1. Predecessor cryptographic binding (C_k -> C_{k-1})
   SOURCE RECEIVER: Antigravity producer host (Windows x64)
   TARGET RECEIVER: GitHub Actions runner (Linux x86_64)
   SURVIVED: true (Both environments compute matching digests and assert predecessor linkage)

2. REST Boundary Carriage Revocation (A=0 when phase=DONE)
   SOURCE RECEIVER: Antigravity producer host
   TARGET RECEIVER: GitHub Actions runner
   SURVIVED: true (Ordinary chat send verified to dispatch zero selected documents)

3. Single-Turn Governed Arming Lease
   SOURCE RECEIVER: Antigravity producer host
   TARGET RECEIVER: GitHub Actions runner
   SURVIVED: true (Arming verified to lapse back to REST immediately after dispatch)

4. Visual Modal Containment on Mobile Viewport
   SOURCE RECEIVER: Antigravity local browser (Playwright/Chrome)
   TARGET RECEIVER: GitHub Actions runner (JSDOM headless)
   CHANGED / UNKNOWN: The GitHub Actions runner cannot project visual layout; relation survival in exogenous receiver is UNKNOWN.

5. Durable Neon Custody CAS Admission
   SOURCE RECEIVER: Mock in-memory custody adapter
   TARGET RECEIVER: GitHub Actions runner
   WITHHELD: Live Neon custody endpoint was intentionally not connected in CI runner.
```

---

## 4. FADT AUDIT

* **Jurisdiction:** Permission-relevant erasure, finite quotient, lawful-support preservation, authority-state collapse, basis sufficiency.

```text
CONDITIONING COORDINATE
Phase coordinate: phase in { ARRIVED, AIA_SENT, DONE, REST, ARMED }

ANTECEDENT SUPPORTS
S_REST = { ordinary_chat_send, return_review, export_review }
S_ARMED = { ordinary_chat_send, governed_continuation_dispatch, selected_file_carriage, predecessor_binding, custody_admission_request, return_review, export_review, reentry_request }

UNION U
U = { ordinary_chat_send, governed_continuation_dispatch, selected_file_carriage, predecessor_binding, custody_admission_request, return_review, export_review, reentry_request }

INTERSECTION I
I = { ordinary_chat_send, return_review, export_review }

GAMMA GAP
Gamma = U \ I = { governed_continuation_dispatch, selected_file_carriage, predecessor_binding, custody_admission_request, reentry_request }

DESCENT / HOLD
DESCENT_ADMISSIBLE: Erasing the prompt text conditioning does not cause authority escalation because the explicit re-entry membrane preserves the boundary between S_REST and S_ARMED. The quotient preserves lawful support distinctions.

MINIMALITY STATUS
MINIMALITY_UNPROVEN: The 8-action decomposition proves that Candidate X's authority model is SUFFICIENT to prevent illegal escalation. However, whether 8 actions constitute the minimal generating basis for the quotient algebra has not been demonstrated.
```

---

## 5. TEMPORAL CUSTODIAN AUDIT

* **Jurisdiction:** What existed when, what became observable when, what became registered when, what later evidence may alter, what earlier epistemic state cannot be rewritten.

```text
t1 (R4 Live Production Witness)
STATE: Deployed main d4c05df14... with relock 1f0487b7c...
OBSERVATION: R4 observer executed Setup -> Continuation 1 -> Native Return.
REGISTERED EVENT: R4 route closure admitted within 1-continuation declared scope.
AUTHORITY: Production live witness.
LATER REINTERPRETATION ALLOWED?: Yes (scope clarification).
RETROACTIVE REWRITE FORBIDDEN?: YES. The empirical fact that the R4 observer stopped after 1 continuation cannot be rewritten.

t2 (Model A Adversarial Discovery)
STATE: Inspection of app/dome-world/marrowline-loom-demo.js.
OBSERVATION: Runtime permitted Continuation 2 via chat prompt submission when phase === 'DONE'.
REGISTERED EVENT: Documented divergence between declared 1-continuation Model A canon and executable runtime capability.
AUTHORITY: Source audit.
LATER REINTERPRETATION ALLOWED?: Yes.
RETROACTIVE REWRITE FORBIDDEN?: YES. Discovery at t2 does not invalidate that R4 observed a 1-turn traversal at t1.

t3 (Egress Episode A)
STATE: Remote branch witness/candidate-x-r3-egress-41112992-20261004 @ 4bd363d5c...
OBSERVATION: Remote git blob canonicalization altered CRLF to LF, causing SHA-256 verification failure on 12-SHA256SUMS.txt.
REGISTERED EVENT: R2.5 FAILED (Packet integrity defect reproduced exogenously).
AUTHORITY: Remote byte witness.
LATER REINTERPRETATION ALLOWED?: No.
RETROACTIVE REWRITE FORBIDDEN?: YES. The failure scar is permanent.

t4 (Egress Episode B)
STATE: Remote branch witness/candidate-x-r3-egress2-41112992-20261004 @ 582a1f04f...
OBSERVATION: All 15 member artifacts matched declared SHA-256 checksums on remote fetch.
REGISTERED EVENT: R2.5 PASS.
AUTHORITY: Remote byte witness.
LATER REINTERPRETATION ALLOWED?: No.
RETROACTIVE REWRITE FORBIDDEN?: YES.

t5 (Sequence 1 External CI Witness)
STATE: GitHub Actions Run 37349177827 on branch witness/r3-execution-candidate-x-582a1f04-20261005.
OBSERVATION: Tested checkout of 582a1f04f...; packet integrity OK, patch apply OK, npm ci OK, 13/13 tests passed, exit code 0.
REGISTERED EVENT: R3.0 PASS, R3.1 PASS, R3.2 PASS, R3.3 PASS, R3.4 PASS_WITH_SCOPE.
AUTHORITY: Exogenous GitHub Actions runner & Amari/ChatGPT adjudication.
LATER REINTERPRETATION ALLOWED?: Adjudication scope refineable.
RETROACTIVE REWRITE FORBIDDEN?: YES. Raw run conclusion (SUCCESS) and artifact ID (11361527428) are immutable.
```
