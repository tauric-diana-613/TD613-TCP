# A15-R0 #772 · repair 001 preregistration

Status: PRE-IMPLEMENTATION HARDENING REPAIR ONLY.

Initial exact-head witness `95bea556c0f4787b9329f9461b528e838c055763` passed TD613 Consolidated Validation run `2305 / 33015421847`, including A15/A15-R0 step 19.

Promotion is nevertheless withheld because post-witness audit found one coverage gap in the preregistered **strict 2-groupoid** naming criterion:

```text
formal C1 inverse u -> -u was implemented,
but the hostile suite did not separately assert
u + (-u) = 0 = (-u) + u
for a nonzero formal bar-1 chain.
```

Repair 001 may change only the #772 hostile test / hardening witness as necessary to add explicit finite assertions for:

```text
C1 additive identity
C1 additive inverse
C1 additive associativity
```

using the already implemented exported bar-1 chain operations.

The repair may not alter:

```text
source/target convention
bar-2 composition laws
interchange law
bar-3 representative relation
R_(omega,lambda)
B^2 Z target
open-cell holonomy rejection
z -> tau_2
formal-vs-geometric naming ceiling
```

The initial green run remains a preserved pre-promotion witness, not the authority-bearing naming witness.

A fresh exact-head witness is required after repair freeze.

No merge, SRC sync, production, Vercel, connection, geometric holonomy, or operational path authority.
