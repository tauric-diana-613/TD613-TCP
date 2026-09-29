# Observer and threat model

## Capability contract

An observer record must bind: identity/class, goal, protected target, lifecycle stage, passive/active powers, accessible channels, baseline knowledge, auxiliary data, collusion, query/compute budget, adaptation policy, time horizon, retention, and exclusions. NIST [S01] supplies taxonomy, not empirical resistance.

“Legitimately permitted to observe” identifies the experimental capability envelope. It does not bless a malicious purpose. A receiver may possess data access while attempting unauthorized action or disclosure.

| Family | View/capability to specify | Mandatory limiting distinction |
|---|---|---|
| O_TEXT | Displayed reply, refusal, public receipt | Include omitted/reordered outputs and empty responses |
| O_RELATIONAL | Entity, edge and co-occurrence inference | Relation recovery can succeed without quotation recovery |
| O_TRAFFIC | Length, timing, chunks, retries, failures, termination | TLS-record view differs from application-chunk view |
| O_TOOL | Actual executed arguments and tool results | Proposed arguments differ from transmitted arguments |
| O_MEMORY | Declared persistent stores across sessions | Already-planted payload differs from ability to plant it |
| O_JOIN | Union of admitted views, keys and histories | Pairwise union can miss three-way or longer interactions |
| O_ADAPTIVE | Query/policy choice after prior observations | Stopping event and budget exhaustion also reveal information |
| O_RECEIVER | Full legitimate receiver input plus widening attempts | Possession of P_A does not grant origin authority |
| O_INFRA | Gateway, cache, logs, failures, machine metadata | Distinguish positions and plaintext termination |
| O_PROVIDER | Whatever the actual inference service receives | Ordinary plaintext inference gives access to that plaintext |

These labels mix location, inference task and strategy. They are **axes**, not ten disjoint actors or an automatic total ordering. A provider can also be adaptive, retain memory and join traces.

For fixed prior and resources, define m₁ ≼ m₂ only when m₁'s observation is obtainable by an admitted postprocessing of m₂'s observation (with randomness independent of H). Record the witnessing map. Incomparable knowledge, budgets or active interventions prevent casual ordering. A union observer must be explicitly constructed; the maximum of marginal scores does not evaluate collusion.

## Minimal observation manifest

Each channel entry requires:

- producer, collection point, intended recipient, actual access class;
- emitted/captured/missing status and reason;
- value representation and precision, clocks and units;
- capture code/version, source revision and episode binding;
- retention/release rules and public/private projections;
- error, refusal, retry, timeout and cancellation behavior;
- whether monitoring changes the behavior being measured.

A server log is not automatically the on-path network observer's view. Conversely, a browser transcript excludes infrastructure channels unless captured separately. “All channels” must mean an enumerated, justified boundary.

## Composition

Freeze the release horizon and adaptive policy before measurement. The transcript contains queries, outputs, tool operations, metadata, feedback, stopping and final/public receipts. Within one fixed joint model,

I(H; Z₁,…,Z_T | B,K) = Σ_t I(H; Z_t | B,K,Z_<t).

Replacing the conditional increments with independently measured marginal leakage loses the dependencies that create joining risk. This identity supplies accounting grammar, not a usable estimator or a differential-privacy guarantee.

The inherited J is a signed excess joint-information proxy. It can be negative under redundancy and cannot serve as a complete privacy score. Report total joined recoverability beside it. Three independent fair shares X,Y,Z with H=X xor Y xor Z defeat every proper-subset test while their union reveals one bit.

## Operational measurements

Use held-out secret-discrimination risk, recovery of preregistered facts/edges, membership advantage, and authorized task loss. Declare baselines and confidence intervals. Separate attack development from final evaluation by source family/secret/template; random row splits can leak templates. An attacker's failure gives an attack-relative result, not a universal upper bound.

Repeat benign and leaking positive controls; randomize nuisance factors and route order. Negative labels and adjudicators must be independent of the evaluated model's persuasive prose. Account for selection over observer families, transforms and attacks. Missing captures remain missing.

⟐
