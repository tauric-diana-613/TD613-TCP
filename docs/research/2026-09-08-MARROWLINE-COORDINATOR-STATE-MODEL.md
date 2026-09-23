# Marrowline Coordinator State Model — 2026-09-08

**State:** documentation-only research note  
**Branch:** `docs/research-tour-gemini-drift-20260908`  
**Runtime / provider / deployment / merge authority:** NONE

## 1. Purpose

Marrowline Coordinator should provide repo-wide, project-aware coordination without pretending to possess unbounded knowledge. The target is **bounded omnipresence**: broad reach across TD613 surfaces, explicit retrieval, exact freshness, and visible uncertainty.

## 2. Knowledge-state vocabulary

Every fact-like object Marrowline reasons over should carry one of these states:

```text
LOADED
= currently present in the active working set

RETRIEVED
= fetched from an authoritative source during the current session

INDEXED
= known to exist in the repository/project graph but not loaded in full

INFERRED
= derived from retrieved/loaded evidence; derivation must be inspectable

OPERATOR-SUPPLIED
= supplied directly by the operator; preserve source status

STALE
= previously valid/current context whose freshness window has expired or conflicts with newer state

MISSING
= expected or requested context unavailable

CONTRADICTORY
= two admitted sources conflict and no lawful precedence rule resolves them

UNKNOWN
= no admissible basis for a stronger status
```

Marrowline must never silently upgrade INDEXED, INFERRED, OPERATOR-SUPPLIED, STALE, MISSING, CONTRADICTORY, or UNKNOWN into RETRIEVED fact.

## 3. Freshness law

Current repository claims require live retrieval when state can materially change.

Examples:

- PR head SHA
- workflow run state
- mergeability
- open/closed/draft posture
- issue state
- branch head
- deployment/release posture

A cached object may remain useful for narrative continuity, but current-action decisions must prefer fresh source state.

### Stale-Memory Siren

When remembered/chat context conflicts with live repository state:

```text
MEMORY != LIVE_REPO
→ mark remembered state STALE
→ surface the conflict
→ prefer fresh repository state for current claims
→ retain prior state as historical evidence where chronology matters
```

Do not erase the older state merely because it is stale; temporal non-retroactivity still applies.

## 4. Project graph

Marrowline should maintain a provider-neutral project graph whose nodes can represent:

- projects/subprojects
- PRs
- issues
- branches
- commits
- workflows/runs/jobs
- documents/specifications
- runtime surfaces
- APIs/routes
- tests/witnesses
- people/roles where explicitly documented
- custody/release membranes

Edges should be typed, for example:

```text
DEPENDS_ON
VALIDATES
IMPLEMENTS
SUPERSEDES
BLOCKS
OBSERVES
EXPORTS_TO
IMPORTS_FROM
SHARES_POLICY_WITH
PROPAGATES_TO
HANDOFF_TO
```

Every edge should retain source/provenance and freshness where applicable.

## 5. Bounded omnipresence

The coordinator may search or traverse broadly, but every answer should remain legible about scope.

Recommended answer receipt:

```json
{
  "schema": "td613.marrowline.answer-receipt/v0.1",
  "working_set": [],
  "retrieved_now": [],
  "indexed_not_loaded": [],
  "inferences": [],
  "missing": [],
  "stale": [],
  "contradictions": [],
  "freshness_cutoff": null,
  "claim_ceiling": "repo-grounded-coordination-not-omniscience"
}
```

The UI may collapse this by default, but it must remain inspectable.

## 6. Coordinator modes

### Ask
Answer a question from the smallest lawful working set.

### Orient
Show where the user is in the project graph: current branch, active PRs, blocking witnesses, neighboring work.

### Coordinate
Translate multiple active projects into dependencies, priorities, and lawful next actions.

### Handoff
Generate an exact continuation packet with current heads, open work, RED/GREEN evidence, authority ceilings, and next operations.

### Audit
Show what Marrowline knows, where it came from, what is stale, and what remains missing.

### Replay
Reconstruct a prior project state from exact commits/receipts without letting later knowledge rewrite the historical state.

## 7. Modern dialogue contract

Coordinator Mode should avoid deterministic clause-pool speech and faux-terminal stiffness.

Desired behavior:

- natural conversational continuity;
- concise by default, expandable on request;
- technical precision when state/action depends on exact values;
- direct uncertainty rather than canned disclaimers;
- grounded humor/personality allowed without replacing evidence;
- no ritualized repetition of custody language unless locally useful;
- no generic assistant filler;
- no pretending every reply is a ceremony;
- project vocabulary should remain native to the subsystem being discussed.

The existing Marrowline matrix/receipt station remains valuable as diagnostic/provenance mode and should not be forced to serve as the conversation engine.

## 8. Coordination safety / lifesaving primitives

### Wrong-Target Guard
Before mutating a file/PR/workflow, compare the requested target against the current active blocker and dependency graph. Warn when an edit would touch a neighboring subsystem without evidence.

### Exact-Head Guard
Action recommendations tied to PR state should include exact head SHA and refuse silent carryover after head movement.

### Duplicate-Run Detector
Group runs by workflow + head + trigger context and mark duplicate/superseded/cancelled objects separately from code verdicts.

### Failure-Coordinate Classifier
Classify failures into at least:

```text
PRODUCT_REGRESSION
OBSERVER_OR_TEST_FAILURE
BASELINE_FLAKE
WORKFLOW_OR_APPROVAL_HOLD
CANCELLED_OR_SUPERSEDED
INFRASTRUCTURE_FAILURE
UNKNOWN
```

### Context-Budget Guard
Show when the active working set is approaching a practical context limit and offer a generated handoff packet before important state is lost.

### Authority-Drift Guard
Keep release/deploy/detached-agent authority separate from ordinary repository-read/write coordination; a broad coordinator role does not silently widen operational authority.

## 9. Pedagogue / Dome-Art / Loom visual implications

Marrowline state should be renderable as an inspectable project constellation:

- node halo = freshness state;
- edge treatment = typed dependency/provenance relation;
- weather fronts = active blockers / pressure / stale areas;
- missing seams = absent evidence;
- contradiction seams = incompatible admitted sources;
- replay ghost = historical state distinct from current state;
- current-action path = highlighted dependency route to the next lawful operation.

All such visual grammar should be evaluated for promotion into Pedagogue and `/domeart`, then into Loom's Flow-Core lab when semantically general.

## 10. Stop conditions

- no runtime/provider changes from this note;
- no claim of literal omniscience;
- no hiding inference as retrieval;
- no current-state action from stale-only context when live repository retrieval is available;
- no conflation of coordination authority with release/deploy authority;
- no weakening of Marrowline perimeter traps to improve authorized dialogue.

Marked ⟐
