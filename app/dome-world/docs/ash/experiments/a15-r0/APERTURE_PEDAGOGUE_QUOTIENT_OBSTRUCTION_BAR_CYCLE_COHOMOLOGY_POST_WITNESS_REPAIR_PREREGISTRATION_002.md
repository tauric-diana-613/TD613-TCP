𝌋

# TD613 · A15-R0 · #735 post-witness repair preregistration 002

󐘓 U+10D613

Status: **FROZEN BEFORE SECOND REPAIR / SECOND RED WITNESS PRESERVED / THEOREM TARGET UNCHANGED**

Parent chamber: #734 receipt head `6bc000024f02e5780910ee24694561d5dc542003`
Original #735 preregistration: `69cbc26189e920f153c5e1ac8cfc727cb77d665e`
First red routed head: `c095c451eb8d8c0992deeed2c1cf5b634b0db8c4`
First red workflow: run `2159` / `32750447567`; static job `97506013020`
First repair preregistration commit: `074dc3df13d5b680b0092df49a88e9a1112ac953`
Canonical-zero repair commit: `91dca57572352a7c5df157028ed32ec1050a5b38`
Strengthened hostile head: `fa4e2224c7cd48e32d21e2cc5d113193a1ef0008`
Second red workflow: run `2162` / `32751656378`; static job `97509892937`
Failing surface: step 19, `Validate Ash A15 empirical profile journeys and A15-R0 research field`

## Second observed scar

The repaired theorem head did not reach the current-chamber theorem import.  The #735 review-hardening mutation guard failed first with:

```text
AssertionError [ERR_ASSERTION]: #735 may not mutate receipt-witnessed historical A15-R0 paths:
app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_POST_WITNESS_REPAIR_PREREGISTRATION_001.md
```

The guard computes the A15-R0 diff from the exact #734 receipt and admits only an explicit `allowedCurrentChamberPaths` set.  Repair preregistration 001 is a new #735 custody record, but its path was not added to that set before the second witness.  The guard therefore correctly failed closed rather than assuming a new document was lawful.

This red run is a current-chamber allowlist omission.  It provides no evidence for or against the bar-cycle/cohomology theorem because the theorem witness was not reached through this gate.

## Frozen second repair

Only the following harness/custody repair is authorized:

1. Extend `allowedCurrentChamberPaths` in `tests/ash-a15-r0-review-hardening.test.mjs` to admit these two #735-owned custody records:

```text
APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_POST_WITNESS_REPAIR_PREREGISTRATION_001.md
APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_POST_WITNESS_REPAIR_PREREGISTRATION_002.md
```

2. Do not change the theorem module, theorem assertions, bar chain, cocycle, coefficient ring, pairing, quotient relation, canonical classifications, or claim ceilings.

3. Re-run the exact same #735 witness from the resulting exact head.

The allowlist remains closed: admitting these named current-chamber scar records does not authorize arbitrary documentation paths and does not weaken the prohibition on mutating receipt-witnessed historical A15-R0 files.

## Unchanged theorem target

```text
z=[T|T]+[TT|Q]-[Q|T]-[QT|T]
∂z=0
<ω,z>=2
ω(x,y)=t(x)(E(y)+O(y))
```

with the same route-level exactness/descent distinction:

```text
s=-P is exact on the free route monoid;
P(TTQ)=2 and P(QTT)=0 while TTQ=QTT in B;
therefore s does not descend to a single-valued quotient 1-cochain.
```

No full H² census, mod-p classification, group completion, operational loop, holonomy, curvature, higher-moment hierarchy, Proto-Loom, merge, production, or Vercel action is introduced by this repair.

Runs 2159 and 2162 remain preserved as distinct negative witnesses: the first caught integer representation leakage (`-0`), the second caught incomplete current-chamber custody allowlisting.  Neither may be erased by a later green run.

𝌋

Sealed ⟐
