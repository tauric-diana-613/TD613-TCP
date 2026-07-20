𝌋‌

# Flow-Core Production Observation Repair Receipt v0.1

**Namespace:** `U+10D613`  
**First observed source:** `13e2fa584f685d847424c4b82e66496b583573a5`  
**Second observed source:** `cc8c323558a8aa4cfc42a602903e3c83ccce6914`  
**Second release workflow:** `29712751662`  
**Second release commit:** `397af541c6e17aafa26d7952d05322fdb5aee75e`  
**Second relock commit:** `8d198a9ea098554ce247eb6406f712f49ad731ba`  
**Status:** APPLICATION REPAIR DEPLOYED / OBSERVER REWRITE REPAIR QUALIFYING / FINAL EXACT-MAIN RELEASE REQUIRED / HUMAN CLOSURE OPEN

## Application seam and repair

The first bounded deployment exposed a WebKit readiness hold at `station-propagation/desktop`. The four independent station packages were compiled serially. P7 now uses deterministic `Promise.all` compilation in fixture order.

Qualification after that repair established:

```text
P7 full inherited contracts: PASS
Chromium local seven-surface matrix: PASS
Firefox local seven-surface matrix: PASS
WebKit local seven-surface matrix: PASS
Ash lifecycle regression: none
station authority transfer: false
```

## Second deployment observation

The bounded Git fallback for source packet `cc8c323558a8aa4cfc42a602903e3c83ccce6914` completed one Vercel deployment and restored the Git deployment lock. Vercel marked the deployment successful. The release witness then held before browser observation while checking recursive source parity.

The preserved evidence recorded:

```text
production dependency count: 103
reported mismatch route: /dome-world/ash-custody.html
remote digest: 262b2f2e43985270d3855b19f5a6d45f4c87fbd653d794f3c3dfb21ba2258c1a
expected digest: 3ac2db0cf5bb6b75ad51392a016aca10372f86226791bcba5233152f7b0d7437
```

This was an observer false hold. `vercel.json` explicitly rewrites:

```text
/dome-world/ash-custody.html
→ /app/dome-world/ash-custody-v08.html
```

The remote digest matched the declared `ash-custody-v08.html` destination. The observer had also followed ordinary navigation `href` values as though they were executable dependencies, pulling unrelated Dome-World pages into the Flow-Core runtime closure.

## Rewrite-aware observer repair

```text
HTML dependency class: script/src plus link assets only
ordinary anchor navigation followed: false
JavaScript imports followed: true
literal fetched fixtures followed: true
CSS assets followed: true
exact static Vercel rewrites resolved: true
stale workflow-dispatch source default: removed
standalone production observer: read-only
```

When a discovered production route has an exact static rewrite, the observer now hashes the declared local destination. It does not treat navigation destinations as part of an entrypoint's executable dependency closure.

## Required final witness

A final exact-main bounded Vercel release must prove together:

```text
single deployment: 1
rewrite-aware exact source parity: PASS
Chromium production matrix: PASS
Firefox production matrix: PASS
WebKit production matrix: PASS
mobile portrait and landscape: PASS
reduced motion: PASS
zoom-equivalent reflow: PASS
forced colors: PASS
performance observation: PASS
Git deployment lock restored: true
application tree drift: none
```

## Preserved boundary

```text
Ash lifecycle changed: false
canonical digest law changed: false
station authority transferred: false
raw-content transport added: false
serverless delta: 0
persistence delta: 0
counts as human evidence: false
public route promotion authorized: false
automatic closure: false
human promotion required: true
human closure required: true
closure: OPEN
```

**Qualified for final bounded witness ⟐**
