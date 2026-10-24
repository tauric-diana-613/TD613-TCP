# EMSTD613 Atelier · Tracker / Synth / Audio Project-Family First Pass

Date: 2026-09-02
Branch: `amari/em-td613-lineage-atelier`
PR: #962 · DRAFT / OPEN / UNMERGED

## Question

Do the tracker, synth, routing, engine, and low-latency DSP Works form a coherent project family inside the hand-selected Em workspace, rather than merely sharing generic audio-engineering vocabulary?

This receipt records an architectural relation only. It does **not** establish creation order, authorship chronology, or direct derivation.

## Identity membrane

The Work index already treats the relevant sources as distinct operational Works. In particular:

- `emwork_e026dfda7f98393d8c020067` · Mixxx Tracker Engine Architecture · SAME_WORK_CONFIRMED across Markdown/PDF manifestations.
- `emwork_c14c3c415b4c0614335a7f45` · Low-Latency DSP Tracker Engine · SINGLETON_WORK_SURFACE.
- `emwork_dd9a66eba0e2dde8e29f00f6` · Chiptune DSP Synth Architecture · SAME_WORK_CONFIRMED across Markdown/PDF manifestations.
- `emwork_f4cfab9c72c147e15fa5ebe7` · Mixxx Engine Architecture Deep Dive · SINGLETON_WORK_SURFACE.
- `emwork_b5f602e223e39e15b6437a0c` · Mixxx DAW Architecture Research · SAME_WORK_CONFIRMED across Markdown/PDF manifestations.
- `emwork_5b76a62b0dd1c587aee49b10` · Audio Routing and Sync Research · SAME_WORK_CONFIRMED across Markdown/PDF manifestations.
- `emwork_67768e8d5148dd461eb34cac` · Lock-Free DSP Architecture Research · SINGLETON_WORK_SURFACE.
- `emwork_529ae2e9c9423c17886b137d` · Cybernetic Hypervisor Architecture Research · SINGLETON_WORK_SURFACE.

Therefore:

```text
shared project constraints != duplicate manifestation
separate Work != independent convergence
project-family relation != derivation direction
```

## Exact configuration recurrence

### Mixxx Tracker Engine Architecture

Defines a concrete Mixxx tracker/event layer:

- 128-step hybrid tracker engine;
- up to 16 independent lanes;
- 16-byte step structure;
- per-step parameter locks / p-locks;
- no heap allocation on the real-time callback;
- SPSC transport from external/JS/LLM sequence generation into the audio engine;
- dense serialized sequence representation;
- Mixxx EngineObject integration.

### Low-Latency DSP Tracker Engine

Defines a tracker timing / DSP-stability / UI-coherence layer with an unusually close configuration match:

- optimized 128-step tracker engine;
- 4 to 16 polyphonic channels / `C = 16` terminal scale;
- tracker-style high-frequency step modulation;
- parameter-lock / step-boundary smoothing problem;
- SPSC acquire/release queues;
- forward UI→DSP control queue plus reverse DSP→UI telemetry queue;
- absolute monotonic sample counter as audio-clock witness;
- software PLL + NCO + minimum-jerk UI extrapolation;
- TPT / ZDF filtering for time-varying parameter stability.

### Chiptune DSP Synth Architecture

Defines a complementary synthesis/effects layer explicitly optimized for tracker automation:

- ultra-low-latency 8-bit synth/effects architecture;
- step-automated parameter locks;
- ZDF / topology-preserving state-variable filtering;
- 4-point cubic Hermite interpolation;
- first-order control-rate smoothing for 5–15 ms p-lock transitions;
- dual audio-rate / block-rate modulation architecture;
- host-synced versus free-run modulation timing;
- strict CPU budget and constant-time processing discipline.

Chiptune does **not** itself contain the exact `128` configuration and does not name Mixxx. It is therefore a weaker same-project-family edge than the Mixxx Tracker ↔ Low-Latency Tracker pair.

## Provisional architectural composition graph

The corpus supports the following non-chronological composition hypothesis:

```text
Mixxx Engine / Audio Routing
    physical realtime deadlines
    cache / worker separation
    hardware-clock and transport constraints
                |
                v
Mixxx Tracker
    event model / 128-step geometry
    16-lane sequencing
    p-lock and external sequence injection
                |
       +--------+--------+
       |                 |
       v                 v
Chiptune DSP        Low-Latency Tracker
synthesis/effects   clock/UI/DSP stability
p-lock smoothing    128-step / 4–16 channel
TPT/ZDF/Hermite     PLL/SPSC/TPT
       |                 |
       +--------+--------+
                |
                v
Mixxx DAW
    unified telemetry/state
    AI-facing affordance membrane
    SPSC observer boundary
                |
                v
Cybernetic Hypervisor
    Python cognitive/memory layer
    C++ Mixxx telemetry bridge
```

This is an **architectural dependency/composition graph**, not a creation timeline.

## Common-upstream subtraction

Several primitives are native-domain defaults or readily explained upstream:

- SPSC acquire/release in real-time audio;
- hardware sample clocks;
- parameter smoothing;
- PLLs;
- TPT/ZDF filters;
- cache-line isolation;
- no-block / no-allocation realtime rules.

Those primitives alone receive little lineage weight.

The higher-value project-family evidence is the **co-occurrence of exact system-scale constraints across separate Works**, especially:

```text
128-step tracker geometry
+
4–16 / 16-channel scale
+
tracker p-lock automation
+
SPSC boundary discipline
+
realtime audio callback sovereignty
```

The Mixxx Tracker and Low-Latency Tracker pair is therefore stronger than any single generic-DSP motif recurrence.

## AppleDouble / Google Docs export provenance

The relevant Markdown files have distinct Google Docs export identities in their AppleDouble companions. This is evidence that these were separate source documents rather than one Google Doc exported under several names.

Observed source-doc IDs and export-layer times:

| Work | Google Docs ID | observed export/download-layer timestamp (UTC) |
|---|---|---:|
| Chiptune DSP Synth Architecture | `1zQw8SFRXu-PPT-B_Eb95LnlbkVO97siFHll3ecDM-hw` | 2026-09-01 08:22:15 |
| Mixxx Tracker Engine Architecture | `17p3kuB0Vi_duLvCppTQO3NRXmdvnfxoK6XfQ6BoBQbQ` | 2026-09-01 08:22:25 |
| Low-Latency DSP Tracker Engine | `1neorrUWvz0lSe0rUHou5a9lIUcZCN2R28OO6w0fdeVA` | 2026-09-01 08:24:45 |
| Mixxx Engine Architecture Deep Dive | `1upZXZW_oAPYMYgHBMzXFw0oWe9q6YQ52HuRLqUHRxfU` | 2026-09-01 08:25:00 |
| Audio Routing and Sync Research | `16Jy_XzbWZgHrIcYsz1lmObtjbF8qTOgXOsUZ5k1AuXs` | 2026-09-01 08:25:30 |
| Lock-Free DSP Architecture Research | `1isSu67hWesCNPmkgJ5HCDQZcRPSDuHDqR0yxHLjarzY` | 2026-09-01 08:26:40 |

Additional already-receipted export-layer context includes Mixxx DAW around 08:20:45 and other non-audio Works interleaved during the same session.

### Curation-order adjudication

Chiptune and Mixxx Tracker were exported roughly ten seconds apart, and several other audio-engine Works appear inside the same short curation interval. However, unrelated OSSL Works are interleaved in the broader pass.

Therefore:

```text
CURATION_SESSION_CLUSTER = SUPPORTED
STRICT_PROJECT_GROUPING_BY_EXPORT_ORDER = NOT SUPPORTED
CREATION_ORDER = UNRESOLVED
AUTHORING_ORDER = UNRESOLVED
```

And the standing membrane remains:

```text
Google Docs export time
!= creation time
!= authoring time
!= conceptual priority
!= derivation direction
```

## Internal implementation tension: cache-line assumption

The family does not behave as one perfectly synchronized specification.

Observed variants include:

- Mixxx Tracker: describes 16-byte steps fitting two per 32-byte or four per 64-byte cache line.
- Mixxx Engine: formalizes `alignas(64)` as the cache-line isolation boundary.
- Mixxx DAW: uses `alignas(64)` for the SPSC telemetry implementation.
- Low-Latency Tracker: explicitly distinguishes 128-byte Apple-Silicon padding from 64-byte x86_64 padding.
- Cybernetic Hypervisor: mandates `alignas(128)` specifically for Apple M-series shared-memory atomics.

This inconsistency is useful archaeological evidence. It argues against treating the family as one byte-identical or perfectly fixed specification and opens a platform-specific correction / variant hypothesis.

Chronology is not available, so this cannot yet be written as:

```text
64-byte design -> corrected to 128-byte Apple design
```

It may instead represent different source assumptions, target platforms, or research-tool synthesis.

## Current relation status

```text
MIXXX_TRACKER <-> LOW_LATENCY_TRACKER:
SAME_PROJECT_FAMILY_SUPPORTED
DIRECTION_UNRESOLVED

CHIPTUNE <-> TRACKER_FAMILY:
SAME_LARGER_PROJECT_FAMILY_CANDIDATE
DIRECT_DERIVATION_UNRESOLVED

MIXXX_ENGINE / AUDIO_ROUTING / LOCK_FREE_DSP:
FOUNDATIONAL_SUBSTRATE_RELATION_SUPPORTED
DIRECT_CREATION_ORDER_UNRESOLVED

MIXXX_DAW / CYBERNETIC_HYPERVISOR:
AI_BRIDGE_RELATION_SUPPORTED
PROMPT_INHERITANCE_MUST_BE_PRESERVED
```

## Next hostile tests

1. Search for an explicit originating prompt/spec that jointly names the `128-step`, `4–16/16-channel`, Mixxx, and p-lock requirements.
2. Test exact lexical/configuration overlap between Mixxx Tracker and Low-Latency Tracker after subtracting generic tracker/DSP vocabulary.
3. Determine whether Chiptune shares a project-specific requirement beyond generic tracker p-lock terminology.
4. Keep AppleDouble clocks strictly on the curation/delivery layer.
5. Track platform-specific cache-line assumptions as a variant/correction surface without inventing chronology.
6. Continue into the Mixxx→Hypervisor bridge, where transport structure is preserved but payload semantics may drift.

Marked ⟐
