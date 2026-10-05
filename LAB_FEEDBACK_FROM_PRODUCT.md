# LAB FEEDBACK FROM PRODUCT: SEQUENCE 3 (CATHEDRAL TOURNAMENT)

**Date**: 2026-10-05  
**Covenant**: Tauric Diana — Crimean heritage custodianship / Tauri Goddess of the Ash Moon⟐  
**Author**: Tawanna’s Product Lane (TD613 / Marrowline)  
**Target**: Laboratory Architecture & Sequence 1 Research Governance  

---

## 1. What the Laboratory Got Exactly Right

1. **The REST Boundary Invariant ($\vec{A}_{\text{carriage}} = 0$)**:  
   The lab's uncompromising insistence that the route must visibly and authoritatively return to REST after every governed turn was entirely vindicated by product testing. When users understand that the system powers down its carriage authority after an answer returns, anxiety plummets. They do not fear that subsequent private chat messages will accidentally transmit confidential files.

2. **Single-Turn Authority Granting**:  
   Arming authority for exactly one turn prevents "sticky mode" contamination where a user believes they are chatting casually while the system continues to retransmit corporate attachments to external model APIs.

3. **Predecessor Digest Chaining**:  
   Enforcing that Continuation $N+1$ binds the exact stage receipt of Continuation $N$ maintains auditability without complicating the user's mental model. In product testing, users intuitively grasped that each step "built on the last verified checkpoint" without needing to parse the cryptographic SHA-256 strings directly.

4. **#1433 Ingestion Integrity**:  
   Ingesting PR #1433 cleanly—preserving live attachment retry memory and browser-local Unicode-normalized thread search—proved that parallel product repairs do not need to be discarded when laboratory governance arrives.

---

## 2. What the Laboratory Made Too Academic

1. **Jargon as a Substitute for Interaction**:  
   Early laboratory specifications relied heavily on ontological shorthand: "AIA admission," "SHI waiver," "FADT stage quotient," "receiver-relative holonomy," and "aperture uncertainty." In hostile first-time-human testing, every single encounter with these terms halted user progress. Users hesitated, assumed they had entered a misconfigured administrator panel, or feared clicking the wrong button.  
   *Correction applied in product*: Replaced with direct, plain-language categories: **SENDS TO AI**, **STAYS HERE**, and **WE CAN'T SEE**.

2. **The Dialog Centering Fallacy**:  
   The lab designed a centered `<dialog>` element in Candidate X and treated it as a completed product solution. On a 1080p desktop monitor, centering a modal detached the disclosure by 400 pixels from the composer where the user was actually typing. On mobile (390×844), centering the dialog obscured the virtual keyboard, creating jarring focus jumping (`HOLD-COMPOSER-DISCLOSURE-SPLIT`).  
   *Correction applied in product*: DOCKED Adaptive Hybrid (Inline on desktop, Bottom Sheet on mobile, docked directly above the composer).

3. **Claim-Ceiling Mush vs. Confident Boundary Statements**:  
   The lab's draft disclaimers were so defensive that they undermined confidence: "The terminal cannot verify entity identity, permission, legal authority, model consciousness, or historical truth." While legally rigorous, piling thirteen disclaimers onto a disclosure card makes the software look broken or terrified of itself.  
   *Correction applied in product*: Precise, matter-of-fact statements of scope: "Selected files leave live memory after this turn. Provider internal reasoning is unobserved."

---

## 3. Where the Laboratory Forced Product Acrobatics

1. **`HOLD-LANDSCAPE-STACKING` (844 × 390 Viewport)**:  
   The lab required three separate cards (Cross, Stay, Unknown). In standard vertical mobile layouts, stacking three cards requires ~480px of vertical space. On mobile landscape viewports (844 × 390) and split-screen multitasking, the action buttons (`Cancel` and `Confirm`) were pushed entirely off-screen below the fold. The user was forced to scroll inside an un-scrollable modal container to find the submit button.  
   *Correction applied in product*: Implemented `@media (max-height: 500px)` 3-column horizontal grid (`grid-template-columns: repeat(3, 1fr)`) bounding card height under 220px and keeping action controls immediately reachable.

2. **`HOLD-STATIC-DOM-HINT`**:  
   The lab placed a static instruction card in the context menu that never changed as turns advanced. After Turn 1 returned, the card still told the user to "begin with setup." This confused testers, who attempted to run the setup handshake a second time, triggering hold states.  
   *Correction applied in product*: Bound dynamic hint text directly to `emit()` state transitions, reflecting ARRIVED -> AIA_SENT -> DONE/REST -> STAGED.

3. **Particle Chaos vs. Semantic Carriers**:  
   The lab's initial visual mockups leaned into generic high-frequency particle clouds or low-resolution vector illustrations ("squashed baby") that created visual clutter and CPU throttling on mobile devices.  
   *Correction applied in product*: Replaced with the 39-carrier Flow-Core depth architecture (6 near, 13 mid, 20 far) driven by a single `AnimationCoordinator` clock pass, moving at low frame rates (30fps) with semantic glyph identities (`à`, `米`, `出`, `hõt`, `cōl`, `上`, `下`, `𝄐`).

---

## 4. Which Lab Metrics Predicted Good Product Behavior

- **Admitted Input Class Validation**: Accurately prevented corrupted or mismatched files from entering the pipeline.
- **Stage Receipt Digest Verification**: Reliably caught network races and out-of-order responses during rapid tapping.
- **Fail-Closed State Invariant**: Ensured that aborted or timed-out requests left zero ghost attachments in the composer.

---

## 5. Which Lab Metrics Measured Theater

- **Word-Count Strictness in Task Drafts**: Arbitrary length checks did not correlate with user comprehension or model task performance.
- **Presence of Monolithic `<dialog>` Tag**: Marking a design as "standardized" merely because it used native `<dialog>` ignored the reality of mobile touch ergonomics, bottom-sheet gestures, and landscape clipping.
- **Static Checksum Visibility**: Forcing the user to stare at raw 64-character hex digests provided zero reassurance to non-cryptographers while cluttering the interface.

---

## 6. Proposals for Lab Contract Updates

1. **Adopt Plain-Language Triad in Schema Definitions**:  
   Update lab governance manifests to officially include plain-language human labels:  
   - `crosses_to_receiver` -> **SENDS TO AI**  
   - `retained_in_browser` -> **STAYS HERE**  
   - `unobserved_remote_state` -> **WE CAN'T SEE**  

2. **Codify Viewport Height Invariants for Modal Specifications**:  
   No laboratory disclosure card set may exceed `min(240px, 50vh)` without declaring horizontal multi-column layout or verified scroll containment.

3. **Incorporate Single-Turn Tethering into Governance State Specifications**:  
   Recognize the **Dynamic Route Tether** as an official governance witness component that bridges the gap between background REST state and conscious human re-entry.
