# A15-R0 · Target-Equivalence Quotient/Congruence Vector Repair Preregistration

Status: **PREREGISTERED / REPAIR-ONLY / PRE-IMPLEMENTATION**

Parent chamber: PR #729
Parent receipt: `b08fab1ca7786a3f70c5e1816f41c1bc9f856723`
Original chamber preregistration: `b7684cbf9c995cd9489ea5307a3af523d95f511b`
Preserved red witness: run 2128 / `32725803225`

## Observed failure

The repaired exact-head witness reached the A15-R0 static gate and failed the aggregate quotient/congruence obligation. Inspection of the frozen executable shows the failure is generated inside `congruenceCertificate()` by the representative pair:

```text
q = TQQ  -> c(q) = (1,0,2)
r = QQT  -> c(r) = (1,2,0)
```

The certificate simultaneously requires `sameCoordinate(cq, cr)`. The selected pair therefore cannot witness representative-independent typed composition; it is not quotient-equivalent by the chamber's own coordinate definition.

This is a witness-vector construction error, not evidence that the parity-twisted product law failed.

## Authorized repair

Replace only the second representative pair with two distinct words already equal under the declared quotient coordinate:

```text
q = TTQ  -> c(q) = (2,1,0)
r = QTT  -> c(r) = (2,1,0)
```

The repair may change only those representative words, plus any strictly necessary receipt/provenance text after a successful exact-head witness.

## Frozen non-changes

The following remain frozen:

- quotient coordinate definition `c(w)=(t,E,O)`;
- parity-twisted product law;
- identity and associativity proof;
- source-conditioned evaluation;
- transition-locality formula and controls;
- right-congruence claim;
- typed source/middle/target checks;
- hostile parity, total-Q-collapse, source-retention, and custody-externality controls;
- claim ceiling;
- no H8+ enumeration;
- no transport, connection, holonomy, curvature, groupoid, A16, production, or Vercel promotion.

## Falsification rule

After this vector-only repair, any remaining red quotient/congruence obligation is preserved as a new obstruction and must be diagnosed from the exact failing predicate before further mutation.

󐘓 U+10D613

𝌋

Sealed ⟐
