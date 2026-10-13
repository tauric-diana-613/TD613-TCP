# TD613 · SEQUENCE 6 · TRANCHE 2
## 39-Carrier Flow-Core × Dome-Art Semantic Motion Bridge Witness Report

```text
covenant_key: Khona‌lit-po ∴ TD613 — Badge Received
sequence: 6 (Surviving Relations / Product Realization)
tranche: 2 (39-Carrier Flow-Core × Dome-Art Semantic Motion Bridge)
branch: staging/sequence-6-integration-20261006
state: TRANCHE_2_VERIFIED_WITNESSED
authority_posture: OPERATOR_DIRECT_BOUNDED_LABOR
```

---

### I · Purpose and Architectural Mandate

Tranche 2 builds the visual embodiment of the surviving relation set: the existing 39-carrier Flow-Core field integrated with Dome-Art heterostratigraphic lattice potential under one deterministic, semantic animation coordinator (`renderDomeArt`).

This implementation adheres to the governing law:
```text
CANONICAL_RELATION → VISUAL_INTERPRETATION
not:
VISUAL_INTERPRETATION → CANONICAL_RELATION

MOTION_INTERPRETATION != SEMANTIC_REDEFINITION
AMBIENT_MOTION != EVENT_HISTORY
VISUAL_RELATION != EXTERNAL_REALITY
AESTHETIC_BINDING != EMPIRICAL_VALIDATION
SIMULATED_DISCRIMINATION != HUMAN_COMPREHENSION
```

---

### II · Four Strictly Separated Coordinates

In accordance with the REST 1 architecture freeze, the four perceptual and physical carrier dimensions are decoupled:

```text
CARRIER_COUNT != CSS_OPACITY != MOTION_DEPTH_GAIN != RENDERED_SCALE
```

| Coordinate | Near Plane (`flight-near`) | Mid Plane (`flight-mid`) | Far Plane (`flight-far`) |
| :--- | :--- | :--- | :--- |
| **Carrier Count** | **6** (`i % 13 == 0` or `i % 11 == 0`) | **13** (`i % 4 == 0` or `i % 7 == 0`) | **20** (remaining indices) |
| **Deployed CSS Opacity** | `0.38` | `0.24` | `0.20` |
| **Motion Depth Gain** | `1.35` | `0.82` | `0.46` |
| **Rendered Font Sizes** | `184px` / `132px` | `56px` | `26px` |

---

### III · Single Animation Owner Law

The animation bridge strictly implements the single animation owner contract:
1. **Single Entry Point**: `renderDomeArt(viewId, worldSnapshot, viewport, time)` is the sole coordinator for visual evaluation.
2. **One World Snapshot**: Consumes an immutable snapshot per frame; creates no side channels.
3. **One Animation Clock**: Timing is driven strictly by the monotonic `time` parameter passed from the owner loop.
4. **No Loop Duplication**: The module contains zero `requestAnimationFrame`, `setInterval`, `setTimeout`, or local timers.
5. **Hidden Views Draw Zero**: When `activeViewId !== targetViewId`, `renderDomeArt` executes zero carrier computations, sets `draw: false`, and returns `hidden_views_draw_count: 0`.

---

### IV · Canonical Flow-Core Semantic Registry and Motion Mappings

The canonical eight Flow-Core glyph semantics remain unchanged from `app/dome-world/data/flowcore-glyph-semantics-v01.js`. The motion bindings are classified as `PROPOSED_AESTHETIC_BINDING`:

| Key | Canonical Glyph | Canonical Semantics | Consequence Vector Class | Proposed Motion Deformation |
| :--- | :---: | :--- | :--- | :--- |
| `recurrence` | `米` | Recurrence and authored structure | `RADIAL_PULSE_DIVERGENCE` | Radial pulse with slow breathe |
| `gathering` | `à` | Gathering and accumulated obligation | `INWARD_CENTRIPETAL_CONVERGENCE` | Centripetal spiral convergence |
| `release` | `出` | Release and transformation | `OUTWARD_CENTRIFUGAL_EXPANSION` | Centrifugal horizontal expansion |
| `bounded_emergence` | `hõt` | Bounded emergence | `ROTATIONAL_AZIMUTHAL_BLOOM` | Azimuthal rotational bloom |
| `protected_continuity` | `cōl` | Protected low-energy continuity | `CONTRACTED_LOW_ENERGY_ORBIT` | Low-energy contracted orbit |
| `created_potential` | `上` | Created potential | `VERTICAL_ASCENT_LIFT` | Vertical lift ascent |
| `released_tendency` | `下` | Released tendency / return | `VERTICAL_DESCENT_GROUNDING` | Vertical grounding descent |
| `structural_rest` | `𝄐` | Structural rest | `QUIESCENT_LATTICE_EQUILIBRIUM` | Coast and settle to equilibrium |

---

### V · Coast and Settle in Structural Rest

When transitioning to or residing at `structural_rest` (`𝄐`):
- New pulses are stopped (`new_pulses_stopped: true`);
- Existing movements coast and settle over a bounded window (`800ms`, damping `0.92`);
- Ambient heterostratigraphic lattice contributions settle to a stationary equilibrium;
- No history is erased; carriers are not deleted or set to zero opacity;
- All 39 carriers remain visible, rendered, and inspectable in their resting equilibrium.

---

### VI · First-Class Reduced Motion Equivalent

Under `reduced_motion: true`:
- `REDUCED_MOTION != REDUCED_MEANING`: The full semantic relation, canonical glyph, and all 39 carriers are preserved;
- Carriers are arranged in a deterministic architectural static grid;
- Zero animation ticks or ambient drift occur across arbitrary time intervals;
- Depth distribution remains strictly 6 near, 13 mid, and 20 far.

---

### VII · Mobile (390px) Viewport Preservation

When rendered on mobile viewports (e.g. 390×844):
- All 39 carriers are preserved; none are culled, pruned, or hidden;
- All 3 depth planes (6 near / 13 mid / 20 far) are preserved;
- ViewBox shifts to compact coordinates (`200 -220 600 1120`) to preserve vertical dignity without horizontal truncation;
- No carriers are assigned `display: none` or 0-scale.

---

### VIII · Visual Witness Catalogue

The visual inspection artifacts are generated as SVG files in `research/sequence-6-surviving-relations/witnesses/`:

| Relation | Glyph | Viewport | Dimensions | Mode | Witness Artifact |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `gathering` | `à` | Desktop | 1000×520 | Dynamic | [witness-gathering-desktop.svg](witnesses/witness-gathering-desktop.svg) |
| `gathering` | `à` | Mobile | 390×844 | Dynamic | [witness-gathering-mobile_390px.svg](witnesses/witness-gathering-mobile_390px.svg) |
| `gathering` | `à` | Desktop | 1000×520 | Reduced Motion | [witness-gathering-reduced-motion-desktop.svg](witnesses/witness-gathering-reduced-motion-desktop.svg) |
| `gathering` | `à` | Mobile | 390×844 | Reduced Motion | [witness-gathering-reduced-motion-mobile_390px.svg](witnesses/witness-gathering-reduced-motion-mobile_390px.svg) |
| `release` | `出` | Desktop | 1000×520 | Dynamic | [witness-release-desktop.svg](witnesses/witness-release-desktop.svg) |
| `release` | `出` | Mobile | 390×844 | Dynamic | [witness-release-mobile_390px.svg](witnesses/witness-release-mobile_390px.svg) |
| `protected_continuity` | `cōl` | Desktop | 1000×520 | Dynamic | [witness-protected_continuity-desktop.svg](witnesses/witness-protected_continuity-desktop.svg) |
| `protected_continuity` | `cōl` | Mobile | 390×844 | Dynamic | [witness-protected_continuity-mobile_390px.svg](witnesses/witness-protected_continuity-mobile_390px.svg) |
| `structural_rest` | `𝄐` | Desktop | 1000×520 | Dynamic (Settled) | [witness-structural_rest-desktop.svg](witnesses/witness-structural_rest-desktop.svg) |
| `structural_rest` | `𝄐` | Mobile | 390×844 | Dynamic (Settled) | [witness-structural_rest-mobile_390px.svg](witnesses/witness-structural_rest-mobile_390px.svg) |
| `structural_rest` | `𝄐` | Desktop | 1000×520 | Reduced Motion | [witness-structural_rest-reduced-motion-desktop.svg](witnesses/witness-structural_rest-reduced-motion-desktop.svg) |
| `structural_rest` | `𝄐` | Mobile | 390×844 | Reduced Motion | [witness-structural_rest-reduced-motion-mobile_390px.svg](witnesses/witness-structural_rest-reduced-motion-mobile_390px.svg) |
| `recurrence` | `米` | Desktop | 1000×520 | Dynamic | [witness-recurrence-desktop.svg](witnesses/witness-recurrence-desktop.svg) |
| `recurrence` | `米` | Mobile | 390×844 | Dynamic | [witness-recurrence-mobile_390px.svg](witnesses/witness-recurrence-mobile_390px.svg) |
| `bounded_emergence` | `hõt` | Desktop | 1000×520 | Dynamic | [witness-bounded_emergence-desktop.svg](witnesses/witness-bounded_emergence-desktop.svg) |
| `bounded_emergence` | `hõt` | Mobile | 390×844 | Dynamic | [witness-bounded_emergence-mobile_390px.svg](witnesses/witness-bounded_emergence-mobile_390px.svg) |
| `created_potential` | `上` | Desktop | 1000×520 | Dynamic | [witness-created_potential-desktop.svg](witnesses/witness-created_potential-desktop.svg) |
| `created_potential` | `上` | Mobile | 390×844 | Dynamic | [witness-created_potential-mobile_390px.svg](witnesses/witness-created_potential-mobile_390px.svg) |
| `released_tendency` | `下` | Desktop | 1000×520 | Dynamic | [witness-released_tendency-desktop.svg](witnesses/witness-released_tendency-desktop.svg) |
| `released_tendency` | `下` | Mobile | 390×844 | Dynamic | [witness-released_tendency-mobile_390px.svg](witnesses/witness-released_tendency-mobile_390px.svg) |

---

### IX · Authority & Invariant Verification Matrix

| Invariant | Status | Verification Evidence |
| :--- | :---: | :--- |
| **INV-01: Canonical Meaning Immutability** | PASS | 8 relations preserve definitions from `flowcore-glyph-semantics-v01.js` |
| **INV-02: Authority Class Separation** | PASS | Interactive operator-direct labor; authority flags fail closed |
| **INV-03: No Self-Authorizing Delegation** | PASS | Zero detached delegation triggers emitted |
| **INV-04: Fail-Closed Gate & Workload Identity** | PASS | Bridge requires explicit context; hidden views draw zero |
| **INV-05: Predecessor Digest Chain** | PASS | Governed event chain verified with terminal anchoring |
| **INV-06: Provenance Does Not Equal Action Authority** | PASS | `commands_station: false`, `release_authorized: false` |
| **INV-07: Human Closure Boundary** | PASS | `human_closure_required: true` enforced on all frame descriptors |
| **INV-08: Retry Route Preservation** | PASS | Replay and retry routes preserved under one clock |
| **INV-09: Epistemic Layer Separation** | PASS | Visual interpretation does not alter canonical relation state |
| **INV-10: Execution Host Does Not Prove Exogenous Witness** | PASS | Test assertions stamped `SIMULATED_DISCRIMINATION != HUMAN_COMPREHENSION` |
