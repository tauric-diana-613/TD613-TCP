# Candidate X Known Holds (Episode B)

The following coordinates represent known epistemic boundaries, unmeasured parameters, operational constraints, and historical scars for Candidate X. None of these holds are hidden or synthetically completed.

---

### 1. HOLD-EPISODE-A-SCAR · Historical Witness Egress Failure
- **Status**: EMPIRICAL SCAR · IMMUTABLE
- **Detail**: Episode A (`witness/candidate-x-r3-egress-41112992-20261004`, head `4bd363d5c4714bc086fe4bcd5580bb3b4d0fe6e0`) failed remote byte return verification because `11-NEUTRAL_INVARIANT_KEY.sha256` was hashed locally with CRLF line endings (94 bytes, hash `2e1893754e27abe940510c448e198ab5c84f39c4d231dbe8102474bfccaff299`), while Git normalized it to LF on commit (93 bytes, hash `2385a5615a7db902e744e895858240f911c2d6344fbb5bce97b06c781ac3f1ad`). An independent exogenous receiver corroborated this defect. Episode A remains preserved without in-place modification.

### 2. HOLD-ACTION-MINIMALITY · Sufficiency Versus Minimality
- **Status**: SUFFICIENT · MINIMALITY UNPROVEN
- **Detail**: The 8-action support representation $\vec{A}$ successfully keeps ordinary chat and governed continuation partitioned across REST, ARMED, DISPATCH, and POST_ADMISSION states. However, mathematical minimality of this 8-action basis remains unproven.

### 3. HOLD-MOCK-AUTH · HMAC Mock Key Scheme
- **Status**: HELD (offline simulation)
- **Detail**: Test suites utilize simulated HMAC signatures (`auth.scheme = 'hmac-sha256'`, `key_id = 'td613-loom-demo-stage-v1'`, `tag = 'A'.repeat(43)`) and local `webcrypto` mocks. Production cryptographic custody requires the live Neon-backed signer (`td613_loom_demo_signer`), which is deliberately not invoked during offline test runs.

### 4. HOLD-PHYSICAL · Physical Device Witness
- **Status**: UNMEASURED
- **Detail**: In-browser DOM mechanics and touch targets have been audited against JSDOM and desktop browser emulation. Real-device capacitive touchscreen ergonomics (e.g. thumb reach, keyboard viewport occlusion on iOS Safari) remain unmeasured on physical mobile hardware.

### 5. HOLD-R3 · Exogenous Receiver Reconstruction ($R_3$)
- **Status**: AWAITING EXOGENOUS OBSERVATION
- **Detail**: Episode A contact was observed and produced an integrity defect reproduction. Episode B carrier is published for exogenous evaluation by Amari. The exit cannot be declared from inside the producing agent's boundary.

### 6. HOLD-NEON-CUSTODY · Remote Database Custody State
- **Status**: UNMUTATED / CLOSED
- **Detail**: NO PRODUCTION CUSTODY CALL WAS INTENTIONALLY ISSUED DURING THIS EPISODE. Issue #405 deployment membrane remains closed, and remote Neon custody heads remain untouched.

### 7. HOLD-EXPIRY-RACE · 10-Minute TTL Clock
- **Status**: STRUCTURAL CONSTRAINT
- **Detail**: The activation packet TTL (`activation.expires_at`) continues counting down in real time while the re-entry modal is displayed. If an operator remains paused in the membrane modal past the expiration timestamp, subsequent dispatch will fail-closed with `EXPIRED`.

### 8. HOLD-STAGE-CAPACITY · Finite Stage Bound
- **Status**: BOUNDED
- **Detail**: The storage and history vector enforces a maximum capacity of $K_{\text{total}} = 128$ stages. Consequently, substantive continuations are strictly bounded by $K_{\text{substantive}} \le 127$.
