𝌋‌

# Flow-Core Pedagogue P6 Implementation Receipt v0.1

**Program:** `td613.ash.custody-pedagogue-package/v0.1`  
**Phase:** P6 — Ash Custody Root consequence-first presentation route  
**Status:** IMPLEMENTED / REPOSITORY CI PENDING / HUMAN-CLOSURE OPEN  
**Serverless delta:** `0`  
**Ash lifecycle mutation:** `NONE`  
**Custody semantics mutation:** `NONE`  
**Vercel authorization:** EXPRESSLY RECEIVED FOR PHASE-END RELEASE

## Presentation law

The P6 adapter imports `deriveAshLifecycle` and translates the exact local state into a governed scene. Its only pedagogue action is inspection.

```text
inspect exact Ash state
≠ register custody
≠ verify custody
≠ bind a case
≠ persist content
≠ authorize release
≠ transport content
```

Ash remains the sole lifecycle and custody authority.

## Consequence-first route

Every package answers, before optional terminology:

1. what stayed local;
2. what Ash created;
3. what changed in the case;
4. what did not become authorized;
5. what may happen next.

The displayed route is:

```text
Choose source
→ See what stays local
→ Anchor source to case
→ Watch Case Map change
→ Inspect technical custody details if needed
→ Rest
```

## Exact state mapping

- `ARRIVAL_UNPERSISTED` → nothing kept yet;
- `READINESS_OBSERVED` → bounded source posture observed, no custody;
- `CUSTODY_ROOT_PROVISIONAL` → reference exists, digest verification held;
- `CUSTODY_ROOT_VERIFIED` → local reference checked, case unchanged;
- `CASE_BOUND` → root enters chronology index zero and Rooms/Routes open;
- `REBUILD_ELIGIBLE` → current reconstruction test matches the bound case;
- `RELEASE_ELIGIBLE` → exact local release chain is current, without pedagogue release authority;
- `CONTINUITY_SEALED` → local continuity preserved, not transported.

## Hold and recovery scenes

Every exact hold includes:

- plain consequence;
- exact hold code;
- visible recovery route;
- no blame language;
- no increased recovery cost;
- rest and exit.

## Non-regression commitments

```text
raw bytes enter Case Map: false
local-only guarantee changed: false
digest mismatch still rejects: true
stale derivatives remain non-current: true
Rooms/Routes open before binding: false
automatic release added: false
automatic persistence added: false
ash-lifecycle.js changed: false
canonical-json.js changed: false
```

## Implemented surface

`app/dome-world/ash-custody-pedagogue.html` provides metadata-only lifecycle scenarios, explicit AIA route selection, bounded technical inspection, Rest, Return, Replay, and Exit. It owns no animation loop and provides complete 390 CSS-pixel reduced-motion parity.

## Authority boundary

```text
station owner: Ash
Flow-Core commands station: false
automatic Ash action: false
release authorized: false
station authority transferred: false
human closure required: true
closure: OPEN
```

P7 may propagate receipts and station-specific scenes. It may not propagate authority, raw content, automatic phase advancement, or automatic station mutation.

**Marked ⟐**
