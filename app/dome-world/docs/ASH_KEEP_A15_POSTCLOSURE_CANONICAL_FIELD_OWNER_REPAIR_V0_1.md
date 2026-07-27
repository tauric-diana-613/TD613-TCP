𝌋‌

# Ash Keep A15 Postclosure Canonical Field Owner Repair Receipt v0.1

**Namespace:** U+10D613 — Tauric Diana 613  
**Status:** PRODUCT OWNER REPAIRED / PRE-REVALIDATION / NO DEPLOYMENT  
**Failed exact head:** `da1ee44b80e1edc81c75d9af3e95d5002a0ea3e1`  
**Failed run:** `30268272417`  
**Failure packet digest:** `sha256:20890571648b82cd046cb571f2b7bb90b5c417292fc02156586a17198224dace`

## All-engine finding

The early changed-risk chamber observed:

```text
A8 Chromium / Firefox / WebKit = PASS
A12 lawful entry and present-state convergence = PASS
A12 visible route Choir → Capsule = PASS
A12 one canonical field after Capsule = HOLD in all three engines
```

Each engine allowed sixty seconds for the declared field to settle. None observed a connected visible canonical field. This displaced the earlier timing hypothesis and established a product ownership seam.

## Root cause

The canonical Flow-Core field is owned by the ingress portal and placed inside the AIA stage while a case is open. The whole-instrument renderer may replace the stage while recompiling a workspace scene. The portal listened to DOM mutations and several Ash lifecycle events, but it did not listen to the renderer's explicit `td613:ash:whole-instrument-refreshed` event. The workspace bridge could reorder a surviving field, but it could not restore a detached field that the portal had not remounted.

## Bounded owner correction

A new non-serverless module, `ash-flowcore-workspace-remount.js`, is admitted after the AIA workspace bridge. It:

- listens only to `whole-instrument-refreshed` and `flowcore-portal-loader-ready`;
- invokes the existing portal's bounded `refresh()` method;
- constructs no field and owns no duplicate renderer;
- records before/after portal state and the visible canonical-field count;
- introduces no interval, animation frame, MutationObserver, network request, telemetry, or ambient scheduler;
- leaves existing portal duplicate normalization authoritative.

```text
canonical field constructor added = false
new serverless function = false
new ambient scheduler = false
custody authority changed = false
raw-content transport added = false
source bytes moved by remount owner = false
release authority widened = false
human closure required = true
Vercel gate = closed
production deployment count = 0
```

The A12 early risk gate remains responsible for proving the exact visible route and one-field consequence before the complete Ash journey may begin.

Placed ⟐
