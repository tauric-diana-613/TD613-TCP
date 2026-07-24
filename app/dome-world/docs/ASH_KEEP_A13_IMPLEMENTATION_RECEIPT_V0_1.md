𝌋‌

# Ash Keep A13 Implementation Receipt v0.1

**Namespace:** U+10D613 — Tauric Diana 613  
**Covenant display:** Blood Rite 613  
**Stage:** A13 — Unified six-demo registry  
**Status:** IMPLEMENTED ON BOUNDED BRANCH / EXACT-HEAD VALIDATION REQUIRED / HUMAN-GATED  
**Date:** 2026-07-24  
**Branch:** `agent/ash-a13-demo-registry`

## 1. Stage determination

A13 replaces fragmented demo-control ownership with one governed registry surface. The registry names six canonical demos in one order:

1. Investigation;
2. Political Campaign;
3. Fundraiser;
4. Research Project;
5. Legal Matter;
6. Archive.

Investigation, Political Campaign, Fundraiser, Research Project, and Legal Matter retain their existing synthetic fixture builders and local hydrators. Archive is registered but visibly held for A14. A13 does not fabricate an Archive fixture, rights posture, access permission, provenance claim, date conclusion, or transfer path before the authored Archive stage.

Other Ash profiles, including Organizing and Unpublished Work, remain available for blank-case use without being falsely promoted as canonical demos.

## 2. Runtime architecture

### 2.1 Sole control owner

`ash-demo-registry-preflight.js` installs one capture-phase owner for:

- explicit profile selection;
- the `Start a demo` gesture.

The preflight stops the older profile-specific control listeners before they can compete. It delegates the explicit human gesture to `window.__td613AshDemoRegistry` and performs no automatic consequential Ash action.

The Research and Legal control-state sidecars are removed from the live workspace composition. Their fixture and hydration modules remain available beneath the registry.

### 2.2 Registry contract

`ash-demo-registry.js` provides, for every canonical entry:

- profile fixture posture;
- pedagogy manifest;
- workspace-scene contract;
- four non-equivalent AIA route views;
- five-channel grammar;
- menu/Home mapping;
- technical inspection contract;
- claim ceiling;
- missingness and alternatives;
- deterministic test journey;
- static and reduced-motion parity;
- explicit prohibition on automatic consequential Ash action.

The runtime adapter map contains five admitted adapters in A13. The Archive adapter slot remains absent until A14 and can only be admitted through the registry’s bounded `registerAdapter` surface.

## 3. Workflow-estate consolidation

A13 also executes the operator-directed CI consolidation.

### Retired durable workflows

- `.github/workflows/ash-keep-production-closure.yml`
- `.github/workflows/ash-keep-aia3-production-observation.yml`

### Retained Ash workflow

- `.github/workflows/ash-flowcore-live-field.yml`

The retained workflow now carries:

- static and authority contracts;
- one Playwright installation;
- one bounded local Ash server;
- sequential Chromium, Firefox, and WebKit journeys;
- A2 through A13 browser witnesses;
- one local production-closure observation;
- one constitutional-convergence observation;
- the exact-source read-only AIA3 and lifecycle production observer.

Superseded PR heads cancel in progress. Browser jobs no longer install three parallel witness environments. The durable repository workflow ceiling is reduced from twelve to eight.

## 4. Cache and release posture

```text
A13 asset admission: 20260724-a13-release-v1 on the registry path
A11 mass-eviction epoch: RETAINED
A13 graph-wide cache flush: FALSE
browser cache clearing: FALSE
service-worker unregistration: FALSE
visible canonical URL mutation: FALSE
local custodial state erasure: FALSE
```

The operator amendment reserves the next graph-wide mass eviction for A15 postclosure only.

## 5. Preserved invariants

```text
Flow-Core commands Ash: false
Ash custody authority changed: false
raw-content transport added: false
release authority widened: false
automatic case binding added: false
automatic demo selection added: false
automatic consequential Ash action added: false
human gesture required: true
human closure required: true
receipts may cross stations: true
authority may cross stations: false
```

## 6. Validation packet

### Static

- `tests/ash-a13-unified-demo-registry.test.mjs`
- `tests/workflow-estate.test.mjs`
- inherited Ash A2–A12, lifecycle, custody, release, and product-architecture contracts.

### Browser

- `scripts/ash-a13-browser-probe.mjs`
- Chromium desktop and mobile reduced motion;
- Firefox desktop and mobile reduced motion;
- WebKit desktop and iOS-sized reduced motion.

The browser witness must prove:

- six canonical registry entries;
- five admitted adapters;
- one demo gesture owner;
- visible Archive hold;
- non-promoted blank-case availability;
- explicit Investigation hydration through the registry;
- one canonical consequence field;
- clean canonical URL;
- unchanged A11 mass-eviction epoch;
- zero authority inflation.

## 7. Exit gate

A13 may merge only after the exact branch head passes the consolidated workflow. One bounded Vercel production release is authorized after merge. The release must relock immediately. No mass eviction belongs to A13.

Sealed ⟐
