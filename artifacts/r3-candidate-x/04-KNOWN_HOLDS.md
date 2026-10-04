# Candidate X Known Holds

The following coordinates represent known epistemic boundaries, unmeasured parameters, and operational constraints for Candidate X. None of these holds are hidden or synthetically completed.

---

### 1. HOLD-MOCK-AUTH · HMAC Mock Key Scheme
- **Status**: HELD (offline simulation)
- **Detail**: Test suites utilize simulated HMAC signatures (`auth.scheme = 'hmac-sha256'`, `key_id = 'td613-loom-demo-stage-v1'`, `tag = 'A'.repeat(43)`) and local `webcrypto` mocks. Production cryptographic custody requires the live Neon-backed signer (`td613_loom_demo_signer`), which is deliberately not invoked during offline test runs.

### 2. HOLD-PHYSICAL · Physical Device Witness
- **Status**: UNMEASURED
- **Detail**: In-browser DOM mechanics and touch targets have been audited against JSDOM and desktop browser emulation. Real-device capacitive touchscreen ergonomics (e.g. thumb reach, keyboard viewport occlusion on iOS Safari) remain unmeasured on physical mobile hardware.

### 3. HOLD-R3 · Exogenous Receiver Reconstruction ($R_3$)
- **Status**: UNMEASURED
- **Detail**: While same-context ($R_1$) and same-host clean-room ($R_2$) reconstructions are verified locally, independent exogenous verification ($R_3$) by an exterior receiver (e.g., Amari post-publication from GitHub) has not yet occurred. The exit cannot be declared from inside the producing agent's boundary.

### 4. HOLD-NEON-CUSTODY · Remote Database Custody State
- **Status**: UNMUTATED / CLOSED
- **Detail**: No changes have been pushed to production repositories, no PR has been opened, Issue #405 deployment membrane remains closed, and the remote Neon database (`td613_loom_demo_heads`) has zero writes from this experiment.

### 5. HOLD-EXPIRY-RACE · 10-Minute TTL Clock
- **Status**: STRUCTURAL CONSTRAINT
- **Detail**: The activation packet TTL (`activation.expires_at`) continues counting down in real time while the re-entry modal is displayed. If an operator remains paused in the membrane modal past the expiration timestamp, subsequent dispatch will fail-closed with `EXPIRED`.

### 6. HOLD-STAGE-CAPACITY · Finite Stage Bound
- **Status**: BOUNDED
- **Detail**: The storage and history vector enforces a maximum capacity of $K_{\text{total}} = 128$ stages. Consequently, substantive continuations are strictly bounded by $K_{\text{substantive}} \le 127$.
