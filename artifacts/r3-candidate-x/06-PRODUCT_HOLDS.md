# Product Holds & Ergonomic Constraints · Candidate X

This document records ergonomic observations, UX frictions, and operational boundaries identified during the local browser witness run. None of these holds authorize ad-hoc mutation; they are preserved as empirical feedback for future product design.

---

### 1. HOLD-PRESENTATION-INTERRUPTION · Modal vs Inline Ergonomics
- **Classification**: PRODUCT UX OBSERVATION
- **Finding**: The native `<dialog id="loomReentryModal">` successfully enforces the governance primitive (pre-gesture typed disclosure + explicit consent), but introduces a modal interruption into a chat interface.
- **Open Field Alternative**: Candidate D (an inline composer mode switcher chip/toggle `[ Ordinary Chat | Governed Loom ]` with expandable disclosure) remains an open design candidate that could fulfill the same invariant without modal dialog occlusion.
- **Rule**: The governance invariant ($\vec{A}_{\text{carriage}} = 0$ at REST; single-turn re-arming upon consent) is independent of whether the presentation shell is a dialog, sheet, or inline banner.

### 2. HOLD-LANDSCAPE-STACKING · Landscape Viewport Compression (844 × 390)
- **Classification**: LAYOUT DENSITY CONSTRAINT
- **Finding**: On wide-aspect mobile landscape screens, vertical space (390px) is constrained. The three disclosure cards (`CROSS`, `STAY`, `UNKNOWN`) stack vertically, consuming full viewport height and requiring vertical scrolling to reach action buttons.
- **Observation**: Action buttons meet the 44px height floor, but horizontal card tiling or condensed summaries would reduce scroll effort in landscape mode.

### 3. HOLD-CAPACITIVE-TOUCH · Physical Hardware Unmeasured
- **Classification**: WITNESS BOUNDARY
- **Finding**: All browser tests were executed in headless Chromium under emulated viewport metrics. Physical device touch properties (capacitive touchscreen latency, one-handed thumb arcs, iOS Safari bottom navigation bar occlusion, hardware virtual keyboard resizing) remain UNMEASURED.

### 4. HOLD-RELOAD-TRANSIENCE · Ephemeral In-Memory Controller
- **Classification**: ARCHITECTURAL BEHAVIOR
- **Finding**: Reloading the page at REST intentionally clears the active in-memory controller instance (`window.__TD613_LOOM_DEMO_CONTROLLER__`). 
- **Consequence**: Returned work is preserved in `sessionStorage` for review, but re-engaging governed dispatch requires re-initiating from Loom. The session does not silently restore a live transmission capability.

### 5. HOLD-HISTORY-BOUND · Structural Stage Capacity
- **Classification**: CAPACITY BOUNDARY
- **Finding**: Structural stage capacity is capped at $K_{\text{total}} = 128$. Substantive continuations are bounded by $K_{\text{substantive}} \le 127$.
