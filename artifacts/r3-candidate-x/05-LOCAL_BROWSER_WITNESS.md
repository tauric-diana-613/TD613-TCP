# Local Browser Witness Receipt · Candidate X

**Harness**: Headless Chromium via Playwright  
**Target URL**: `http://127.0.0.1:<port>/dome-world/marrowline.html`  
**Candidate Commit**: `41112992ffd82dd1f06552b3c5881dc43de3cb20`  
**Base Commit**: `5b4b34278c6100d3c21ced35984c046da157e097`  
**Execution Timestamp**: `2026-10-04T20:53:23Z`  

---

## 1. Viewports & Responsiveness Matrix

All 6 required viewports were exercised against the exact frozen implementation.

| Viewport | Device Profile | Horizontal Spill (`scrollWidth > clientWidth`) | Touch Target Status | Result |
| :--- | :--- | :---: | :---: | :---: |
| **1280 × 800** | Desktop standard | None (`false`) | Send: 44×44px, Modal: 44px height | **PASS** |
| **390 × 844** | iPhone portrait | None (`false`) | Send: 44×44px, Modal: 44px height | **PASS** |
| **390 × 700** | Short mobile | None (`false`) | Send: 44×44px, Modal: 44px height | **PASS** |
| **360 × 740** | Android portrait | None (`false`) | Send: 44×44px, Modal: 44px height | **PASS** |
| **844 × 390** | Mobile landscape | None (`false`) | Send: 44×44px, Modal: 44px height | **PASS** |
| **390 × 844** | Reduced motion (`reduce`) | None (`false`) | Send: 44×44px, Modal: 44px height | **PASS** |

---

## 2. Interaction & State Machine Traversal

### A. Direct Marrowline Entry
- Navigating directly to `/dome-world/marrowline.html` without `#loom-demo` hash:
  - `#loomDemoMenu` is not rendered or visible.
  - `#loomReentryModal` is not rendered or visible.
  - Ordinary chat interface is clean without Loom furniture leakage.
  - Zero horizontal page overflow observed.

### B. Governed Arrival & Step Progression
- Injected Loom handoff with 1 selected file (`market.md`) and 1 withheld file.
- **Setup (ACTIVATE)**: Staged activation handoff $\to$ dispatched $\to$ received acknowledgement $\to$ phase transitions to `AIA_SENT`.
- **Continuation 1 (CONTINUE)**: Staged selected files $\to$ dispatched $\to$ admitted `State B` $\to$ phase transitions to `DONE`.
- **Automatic Return to REST**: Immediately upon C1 admittance, `controller.snapshot().active` transitions to `false`.

### C. Ordinary Chat Interleaving at REST
- Operator entered message: `"Can you clarify item 2 in simple terms?"` into `#khonapolitPrompt` and clicked `#khonapolitSend`.
- **Telemetry**:
  - Exactly 1 request routed to `/api/dome-world/khonapolit` (ordinary chat handler).
  - Exactly 0 requests routed to Loom transport (`/api/khonapolit?operation=loom-demo-task`).
  - Request carried zero selected file attachments.
  - Controller `active` state remained strictly `false`.

### D. Re-Entry Membrane Modal Inspection
- Triggered `openReentryModal()`:
  - Dialog element `#loomReentryModal` displayed (`open = true`, `hidden = false`).
  - **CROSS Card**: Explicitly displays task description, selected file list (`market.md`), and prior answer brief (`State B`).
  - **STAY Card**: Discloses withheld count (`1 unselected/local files remain withheld`) and private chat retention.
  - **UNKNOWN Card**: Discloses remote provider uncertainty (`internal reasoning, provider context memory`).
- **Touch Target Measurements**:
  - `#loomReentryCancel`: Bounding box `209.6 × 44 px` (meets WCAG 2.2 AA floor).
  - `#loomReentryConfirm`: Bounding box `215.6 × 44 px` (meets WCAG 2.2 AA floor).

### E. Modal Dismissal Invariants
- **Escape Key**: Pressing `Escape` closes `#loomReentryModal`; controller strictly remains `active = false`.
- **Cancel Button**: Clicking `#loomReentryCancel` dismisses modal; controller strictly remains `active = false`.
- Zero network requests emitted during dismissals.

### F. Re-Entry Authorization & Subsequent Turns
- Clicking `#loomReentryConfirm`:
  - Modal hides.
  - Controller state updates to `active = true`, `phase = 'FILES_STAGED'`.
  - Prompt populated with portable evidence instructions.
- **Continuation 2**: Dispatched $\to$ admitted `State C` $\to$ binds C1 as predecessor $\to$ controller returns to `active = false` (`REST`), `substantive_continuation_count = 2`.
- **Continuation 3**: Re-opened modal $\to$ confirmed $\to$ dispatched $\to$ admitted $\to$ returns to `active = false` (`REST`), `substantive_continuation_count = 3`.

---

## 3. Edge-Case Matrix Observations

1. **Virtual Keyboard Compression**:
   - Compressed mobile viewport height to 450px. Modal dialog remained contained within viewport; buttons remained clickable and visible without clipping.
2. **Double-Confirm Attempt**:
   - Invocations of `confirmReentry()` while already in `FILES_STAGED` returned cleanly without duplicate file staging or corrupted state.
3. **TTL Expiry at REST**:
   - When activation timestamp passes `expires_at`, controller transitions to `phase = 'EXPIRED'`, locking staging and refusing dispatch.
4. **Reload Behavior**:
   - Reloading page at REST clears live in-memory controller instance (`window.__TD613_LOOM_DEMO_CONTROLLER__ = undefined`), preventing silent state phantom recovery.
