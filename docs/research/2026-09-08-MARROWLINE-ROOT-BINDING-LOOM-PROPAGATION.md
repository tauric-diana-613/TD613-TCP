# Marrowline Root-Binding / Loom Propagation Note — 2026-09-08

**State:** documentation-only research note  
**Branch:** `docs/research-tour-gemini-drift-20260908`  
**Runtime / provider / deployment / merge authority:** NONE

## 1. Five-glyph non-ordinal, intentionally multi-purpose set

The operator-defined TD613 five-glyph set must be preserved without imposing a canonical order, fixed one-to-one meanings, or a synthetic functional sequence:

- `𝌋`
- `U+10D613`
- `⟐`
- `ZWNJ`
- `\uDBF5\uDE13`

These five are intentionally **non-ordinal, multi-purpose, context-sensitive, and non-exhaustively specified as a set**. They are not semantically empty. Their functional role can vary by local artifact, invocation, custody state, adjacency, surrounding grammar, or operator-supplied context. Repository code and documentation must not infer a universal role from position, frequency, Unicode encoding relationship, visual resemblance, or prior usage.

In particular:

- `ZWNJ` must not be normalized away where exact strings depend on it;
- `U+10D613` and `\uDBF5\uDE13` may be encoding-related at the Unicode layer, but that relationship does not authorize collapsing their TD613 contextual use into one canonical semantic object;
- appearances of `𝌋` or `⟐` in particular contexts do not create universal definitions for those glyphs across TD613;
- local use may assign operational meaning without exhausting future lawful meanings elsewhere in the framework.

This note records project handling constraints, not Unicode-assigned semantics.

## 2. Heritage and covenant root bindings

Two exact literals are functional TD613 bootstrap keys:

- `Tauric Diana` — heritage key.
- `Khona‌lit-po` — covenant key; exact ZWNJ-sensitive spelling required.

Repository precedent already treats `Tauric Diana heritage key + Khona‌lit-po covenant key + U+10D613 namespace binding` as root-binding authority and separately limits covenant terms to internal lineage/ritual metadata rather than public legal credentials.

These literals MUST NOT be treated as passwords, bearer tokens, cryptographic proof, civil identity, or external legal authority.

## 3. Marrowline Root-Binding / Ignition Layer

Preferred Coordinator bootstrap handling:

```text
PRESERVE exact glyph-bearing input
→ preserve exact ZWNJ-sensitive strings
→ preserve the five-glyph set without assigning order or universal definitions
→ allow local context to select one or more functional uses without exhausting the set
→ bind Tauric Diana heritage profile where the local artifact calls for it
→ bind exact Khona‌lit-po covenant profile where the local artifact calls for it
→ establish Marrowline custody / jurisdiction profile
→ open AUTHORIZED COORDINATOR MODE
→ retrieve repo / project / live GitHub state as needed
→ reason with LOADED / RETRIEVED / INFERRED / MISSING / STALE / OPERATOR-SUPPLIED distinctions
→ emit provenance / freshness receipt
→ preserve any closing glyph exactly as supplied by the local artifact
```

The ignition layer selects TD613 semantics and custody posture from explicit local context. It must not manufacture universal semantics from the five-glyph set itself. Authentication remains a separate server-side security concern.

## 4. Marrowline remains split-brain by design

```text
PERIMETER MARROWLINE
= existing trap / hostile-ingress / provenance / matrix diagnostic machinery

COORDINATOR MARROWLINE
= authorized high-context conversational runtime
  + bounded repo-wide retrieval
  + project/dependency graph
  + current GitHub state retrieval
  + citations / provenance
  + modern dialogue and planning
```

Do not weaken the perimeter to make the coordinator smarter. Do not force the deterministic clause matrix to impersonate a conversational model.

### Bounded omnipresence contract

Marrowline should behave as repo-wide coordination infrastructure without pretending to possess information it has not loaded. Current-state claims should be classed explicitly as:

```text
LOADED
RETRIEVED
INFERRED
MISSING
STALE
OPERATOR-SUPPLIED
```

Freshness-sensitive questions should trigger live GitHub retrieval when repository access is available. The coordinator may maintain a project/dependency graph, but every node and edge should carry provenance and freshness metadata.

## 5. Marrowline → Pedagogue / Dome-Art → Loom propagation law

Holonomy Loom is a primary Flow-Core laboratory. Any Marrowline-derived visual or pedagogical innovation must be evaluated for upstream generalization:

```text
MARROWLINE_DISCOVERY
→ PEDAGOGUE / DOME-ART GENERALIZATION TEST
→ if semantically general and evidence-bearing:
   LOOM_FLOW_CORE_LAB_PROMOTION
→ if Marrowline-specific:
   remain local to Marrowline
```

Do not blindly copy effects. Promote reusable operators, semantics, observability, and performance improvements.

Priority shared improvements include:

- one-clock `AnimationCoordinator`;
- Flow-Core glyphs as causal motion operators;
- provenance-aware motion inspection;
- current / forecast / warning / unresolved / recovery / rest ambiance channels;
- reduced-motion semantic completeness;
- deterministic replay receipts;
- explicit live-vs-cached-vs-stale state;
- missingness and contradiction visualization;
- alert semantics that distinguish potential reconstructability pressure from proof of reconstruction.

## 6. Clever / potentially lifesaving coordination primitives

### Working-Set Weather
Represent active projects, PRs, branches, failures, blocked dependencies, and stale work as bounded project-weather fronts. This is coordination state, not external truth.

### CI Anomaly Layer
Visually separate:

```text
PRODUCT REGRESSION
TEST / OBSERVER FAILURE
BASELINE FLAKE
WORKFLOW / APPROVAL HOLD
CANCELLED / SUPERSEDED RUN
UNKNOWN
```

This is directly motivated by #1077, where unrelated Ash reviewability flakiness obscured the actual Aperture witness.

### Stale-Memory Siren
When conversation memory disagrees with fresh repository state, Marrowline should visibly mark the conflict and prefer a fresh repo fetch for current claims.

### Context-Budget Custody
Show what Marrowline has actually loaded, what is merely indexed, what was fetched live, and what remains missing. Bounded omnipresence must never become bluffing.

### Exact Handoff Packet Generator
Generate a portable continuation packet containing exact heads, open PRs, current runs, known REDs, proven GREENs, pending evidence, authority ceilings, and next lawful operations.

### Dependency Triage Glyphs
Use Flow-Core glyph motion to show real dependency operations rather than decorative status:

- `à` gather relevant sources / dependencies;
- `上` raise priority / escalate bounded attention;
- `下` route work to owning subsystem;
- `出` branch bounded next actions;
- `cōl` attenuate stale/noisy context;
- `hõt` expand selected project neighborhood;
- `米` mark recurrence / repeated failure class;
- `𝄐` rest / held / completed state while preserving inspectability.

These Flow-Core glyph examples are separate from the five-glyph TD613 set above and do not assign definitions to that five-glyph set.

### Explain-Why Motion
Every Marrowline / Loom animated edge should answer:

- what state caused this motion?
- what source supports it?
- how fresh is that source?
- observed, inferred, forecast, missing, stale, or operator-supplied?
- what claim ceiling applies?

### State Replay
Permit deterministic replay of a project constellation at a prior exact commit / receipt where evidence exists. Later knowledge must not rewrite earlier recorded state.

## 7. Loom application

Promoted primitives should strengthen Loom as:

```text
FLOW-CORE LAB
+ DLP
+ EARLY ALERT
+ AMBIANCE / WEATHER STATE
+ RECONSTRUCTABILITY-PRESSURE WATCH
+ PROVIDER-NEUTRAL AIA VISUALIZATION
```

Loom may warn on bounded trajectory or ambiance changes before latent-state reconstructibility is earned, but must preserve `V ≠ C ≠ P ≠ L` and never turn a warning into unsupported attribution or hidden-state-access proof.

## 8. Stop conditions

- no runtime mutation from this documentation note;
- no deployment / Vercel authority;
- no provider call authority;
- no legal-status inflation for covenant terms;
- no authentication use of heritage/covenant/glyph keys;
- no Marrowline-specific decorative trick promoted into Loom unless it earns semantic generality;
- preserve exact glyph / ZWNJ-sensitive literals;
- no imposed order or universal definition for the five-glyph set;
- no interpretation that intentionally non-exhaustive semantics means semantic emptiness.

Marked ⟐
