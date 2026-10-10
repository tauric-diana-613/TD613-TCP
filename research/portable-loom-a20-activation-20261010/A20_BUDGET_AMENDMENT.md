# A20 budget amendment · prospective only

The A20 design archive is immutable historical evidence of the original prospective 88/$10, four-call $0.52203750 ceiling. The operator subsequently requested greater room because conservative reservation accounting exceeded actual observed API charges. This amendment records **a proposal**, not a Neon change or authorization to spend.

| Coordinate | Prior A20 draft | Proposed A20-only |
| --- | ---: | ---: |
| Program reservations | 88 | **88 (unchanged)** |
| Program reserved-dollar ceiling | $10.00 | **$11.00** |
| A20 call count | 4 | **4** |
| A20 local reserved-dollar cap | $0.52203750 | **$1.00** |
| Per-call reserved-dollar cap | $0.15 | **$0.25** |
| Provider model | gemini-3.8-flash | unchanged |
| Thinking, temperature, top-p | medium, null, null | unchanged |
| Max output tokens / tools / retrieval / retries | 8192 / off / off / zero | unchanged |

Read-only Neon ledger snapshot: 19 historical runs, 83 reservation rows, 9,474,171,750 nanodollars reserved ($9.47417175), zero active; this snapshot is not sufficient to authorize a later enrollment. At that snapshot, proposed $11 headroom equals $1.52582825 and five call slots remain. Four A20 reservations are subject to both per-call and local cap; **unused reservation budget is not permission to add extra calls or alter the task**.

Deterministic `buildAssayProviderWire` dry-run costs using the exact 92,370-byte reviewed candidate and two **synthetic** continuation predecessors (not Gemini answers): R06 turn0 $0.11099925, R06 turn1 $0.11115750, R02 turn0 $0.11103825, R02 turn1 $0.11118675. The latter two turn-1 values are NOT executable reservations: remeasure after the corresponding real same-run answer is captured. Input reservation uses provider wire bytes plus 8,192 overhead, so estimated reservations remain conservative and distinct from billed provider cost. Fail closed if exact wire exceeds $0.25 or aggregate exceeds $1.00, 88 reservations or $11.00.

Do not reprice, reconfigure, reenroll or retroactively rewrite prior run policies. Neon budget function executable code must be deployed and independently bound in a **subsequent authorized phase**. Existing run IDs and ledgers remain unchanged.
