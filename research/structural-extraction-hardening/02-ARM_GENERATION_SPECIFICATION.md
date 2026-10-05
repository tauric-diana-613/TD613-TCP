# TD613 · SEQUENCE 4.1 · ARM GENERATION SPECIFICATION

## 1. Underlying Graph Topology

All arms share an identical underlying finite-state machine and causal graph topology:

```text
       [EVT_CLICK_CONFIRM]
STATE_REST -------------------> STATE_ARMED
    ^                               |
    |                               | [EVT_DISPATCH_BATCH]
    +-------------------------------+
         (Single-use expiry / return)

       [EVT_CHECK_INTEGRITY (ENOENT)]
STATE_REST ----------------------------> STATE_HELD_INPUT
    ^                                         |
    |                                         | [EVT_REATTACH_FILE]
    +-----------------------------------------+
```

### Invariant Rules Tested
1. **INV-01 (Rest Protection):** Ambient interactions in REST produce 0 network bytes.
2. **INV-02 (Explicit Qualifying Authorization):** Transition to ARMED requires explicit confirmation.
3. **INV-03 (Transient Authorization):** Single-use dispatch returns immediately to REST.
4. **INV-04 (Re-entry Authorization):** Second dispatch requires second discrete confirmation.
5. **INV-05 (Predecessor Ancestry):** Continuation requests carry predecessor transaction hash.
6. **INV-06 (Lineage / Authority Decoupling):** Predecessor hash does not grant transmission rights.
7. **INV-07 (Missing Evidence Latch):** Missing files cause transition to HELD_INPUT; transmission blocked.
8. **INV-08 (Retry Route Preservation):** Retrying local failed query stays strictly within local subsystem.
9. **INV-09 (Evidence Stratification):** Headless automated test passes do not prove physical sensor origin.
10. **INV-10 (External Receiver Boundary):** Cross-network transmission reaches external receiver, not exogenous witness.
11. **INV-11 (Temporal Non-Retroactivity):** t2 code discovery appends new capability; t1 historical log is immutable.
12. **INV-12 (Finite Quotient Compatibility):** Merging states with identical supports ($\Gamma = \emptyset$) preserves behavior; merging states with differing supports ($\Gamma \ne \emptyset$) alters behavior.

---

## 2. Arm Lexical Mapping Matrix

| Structural Coordinate | Arm A (Operational) | Arm B (Field Lexicon) | Arm C1 (Permuted) |
| :--- | :--- | :--- | :--- |
| State 0 (Resting) | \`STATE_REST\` | \`STATE_DATA_PLANE_REST\` | \`STATE_SIGMA_0\` |
| State 1 (Privileged) | \`STATE_ARMED\` | \`STATE_CONTROL_PLANE_DELEGATED\` | \`STATE_SIGMA_1\` |
| State 2 (Blocking) | \`STATE_HELD_INPUT\` | \`STATE_RECOVERY_HOLD\` | \`STATE_SIGMA_2\` |
| Unprivileged buffer edit | \`EVT_BUFFER_EDIT\` | \`EVT_DATA_BUFFER_MUTATION\` | \`OP_PSI_ALPHA\` |
| Unprivileged local query | \`EVT_LOCAL_SEARCH\` | \`EVT_LOCAL_INDEX_QUERY\` | \`OP_PSI_BETA\` |
| Stage item | \`EVT_STAGE_FILE\` | \`EVT_STAGE_PAYLOAD\` | \`OP_PSI_GAMMA\` |
| Unstage item | \`EVT_UNSTAGE_FILE\` | \`EVT_UNSTAGE_PAYLOAD\` | \`OP_PSI_DELTA\` |
| Ambient enter key | \`EVT_PRESS_ENTER\` | \`EVT_RETURN_KEY_STROKE\` | \`OP_KEY_STROKE\` |
| Retry local operation | \`EVT_RETRY_LOCAL\` | \`EVT_RETRY_DATA_PLANE_OP\` | \`OP_PSI_EPSILON\` |
| Qualifying trigger | \`EVT_CLICK_CONFIRM\` | \`EVT_REQUEST_DELEGATION\` | \`OP_OMEGA_TAU\` |
| Consequential dispatch | \`EVT_DISPATCH_BATCH\` | \`EVT_EXECUTE_DELEGATED_EGRESS\` | \`OP_OMEGA_PHI\` |
| Embed predecessor hash | \`embed_predecessor_hash\` | \`embed_provenance_hash\` | \`action_omega_chi\` |
| Resolve missing item | \`EVT_REATTACH_FILE\` | \`EVT_RESOLVE_HELD_DEPENDENCY\` | \`OP_LAMBDA_RHO\` |

---

## 3. Matched Structural Ablation Generation Rules (Arm C2)

Each C2 variant introduces exactly one structural mutation into the underlying evidence:
- **C2-1 (Sticky Authority):** The dispatch event at t3 omits token revocation; target state remains ARMED; subsequent return key at t10 triggers immediate transmission.
- **C2-2 (Unbound Continuation):** Continuation envelope at t13 sets predecessor ID and hash to null.
- **C2-3 (Retry Escalation):** Retry event at t30 issues an outbound HTTPS POST with 4096 bytes and staged data instead of local execution.
- **C2-4 (Remote Receipt Overclaim):** Host Gamma audit note asserts that passing 13 assertions in headless container proves physical sensor origin and operator comprehension.
- **C2-5 (Retroactive Log Mutation):** Source discovery at t2 rewrites the historical t1 audit entry and alters its record hash.
- **C2-6 ($\Gamma = \emptyset$ Control):** Proposal 1 collapses Draft and View states with identical action supports.
- **C2-7 ($\Gamma \ne \emptyset$ Target):** Proposal 2 collapses Rest and Armed states with differing action supports.
