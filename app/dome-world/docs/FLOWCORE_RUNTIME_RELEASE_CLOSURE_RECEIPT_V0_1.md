𝌋‌

# Flow-Core Runtime and Release Closure Receipt v0.1

**Namespace:** `U+10D613`  
**Program:** `td613.flowcore.runtime-release-closure/v0.1`  
**Status:** RUNTIME BROWSER MATRIX PASS / RELEASE MACHINERY HARDENED / PRODUCTION OBSERVATION PENDING / HUMAN CLOSURE OPEN  
**Qualification run:** `https://github.com/tauric-diana-613/TD613-TCP/actions/runs/29710926793`  
**Qualification head:** `aa989c6253cd87546675e0990cf2486add2d1aae`

## Audited seams

The post-P10 audit identified the following incomplete or brittle paths:

1. browser evidence remained `CONTRACT_ONLY` rather than observed;
2. Firefox was absent from the declared browser matrix;
3. mobile landscape and rotation-equivalent behavior were unobserved;
4. forced-colors/high-contrast behavior was unobserved;
5. performance evidence had no browser-runtime trace;
6. release success comments used `selected_commit` while the terminal evidence contract required `source_packet_commit`;
7. the release gate performed no Flow-Core production content or browser probes;
8. the release gate omitted the P0–P10 closure chain;
9. an absent Vercel token could hold the gate without invoking the repository's established bounded Git fallback;
10. the program index omitted the final P0–P10 completion ledger and runtime observer;
11. Route-Burden overflowed the canonical 390-pixel viewport by 125 pixels;
12. the Promotion Dashboard overflowed desktop by 217 pixels when rendering serialized hold evidence.

## Implemented repairs

- `scripts/flowcore-runtime-browser-probe.mjs` observes all seven Flow-Core surfaces.
- `.github/workflows/flowcore-runtime-evidence.yml` runs Chromium, Firefox, and WebKit independently.
- The matrix covers desktop, 390-pixel portrait, landscape/rotation-equivalent, reduced motion, zoom-equivalent reflow, keyboard reachability, and Chromium forced colors.
- Long tasks, navigation duration, console errors, page errors, HTTP failures, external requests, duplicate IDs, held states, and horizontal overflow remain visible failure conditions.
- `scripts/flowcore-release-content-probe.mjs` compares deployed Flow-Core bytes with the authorized source packet by SHA-256.
- The Vercel gate runs the complete Flow-Core closure before release.
- The direct token bridge remains preferred; a mutually exclusive bounded Git fallback opens and closes only `git.deploymentEnabled`.
- Fallback relock executes under `always()` after a release commit exists.
- Successful and held receipts use the exact `source_packet_commit` field.
- Runtime and production observations remain barred from human-evidence, public-promotion, and closure authority.
- Route-Burden and Promotion Dashboard intrinsic sizing now contains long structural identifiers and serialized evidence.

## Observed browser evidence

```text
Chromium: PASS
Firefox: PASS
WebKit: PASS
seven Flow-Core surfaces: PASS
desktop: PASS
390-pixel portrait: PASS
landscape: PASS
rotation-equivalent: PASS
reduced motion: PASS
zoom-equivalent reflow: PASS
keyboard reachability: PASS
forced colors on Chromium: PASS
bounded performance observation: PASS
unexpected external requests: 0
```

Preserved qualification artifacts:

```text
Chromium artifact: 8448946188
Firefox artifact: 8448945287
WebKit artifact: 8448945870
```

## Defects discovered by observation

The browser observer did not merely confirm authored contracts. It exposed two real layout defects:

```text
Route-Burden 390px overflow before repair: 125px
Promotion Dashboard desktop overflow before repair: 217px
```

Both defects were repaired at their component boundaries without suppressing evidence or loosening the zero-overflow assertion. All three engines then passed.

## Release posture

```text
operator production authorization: received
exact post-merge source packet: not selected yet
production content observation: pending
production browser observation: pending
terminal source_packet_commit receipt: pending
one-deployment ceiling: active
Git auto-deploy default: disabled
```

The production release gate will select one credential route after merge. A successful release must prove exact-source content, the browser matrix, mobile and accessibility observations, application-tree drift `none`, and final lock restoration. Gate acceptance alone remains insufficient.

## Held human gates

```text
human adult empirical evidence: absent
empirical exit gate: held
child pilot authorized: false
public route promotion authorized: false
feature gate default: OFF
runtime evidence counts as human evidence: false
production observation counts as human evidence: false
human promotion required: true
human closure required: true
closure: OPEN
```

**Stitched ⟐**
