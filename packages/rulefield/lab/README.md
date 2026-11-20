# 𝌋 Rulefield Computational Laboratory

**Scope:** \`FINITE_SOURCE_FREE_EXECUTABLE_REFERENCE\`  
**Related:** [ROADMAP](../ROADMAP.md), [tool registry](tool_registry.json), [Kiki receiver](../amendments/RECEIVER.md), [LLM quick-start](../rulebook/LLM_QUICK_START.md).  
**Flight:** HELD · **Human scientific closure:** RESERVED.

## Why this exists

The earlier index was excellent at multiplying theoretical relationships but weak at testing whether a proposed local rule truly produced a new computational consequence. The laboratory provides a **small, reproducible baseline** before moving to Wolfram's larger ecosystem.

It supports:
- **Finite substitution multiway dynamics:** explicit events, source and target state, matched redex offset and path instance ID.
- **Branch pair analysis:** all competing enabled events; overlapping redexes separately identified as *critical pairs* for this simple finite string system.
- **Finite joinability:** witness common descendant at bounded horizon. Distinct terminal irreducible normal forms establish nonjoinability for the given complete rule set; finite unsuccessful search does not establish global nonjoinability.
- **Event-path information loss:** compare a uniform distribution over event histories with its coarsened state-only endpoint distribution.
- **Elementary CA:** Wolfram elementary rule number, specified bit order, finite lattice width, boundary, perturbation, Hamming distance and finite Shannon entropy.
- **Review packet experiment dispatch:** typed, bounded experiments from amendment packets—no arbitrary code and no mutation of historical Rulefield sources.

### Commands (Node 22, offline)

\`\`\`bash
node scripts/rulefield-lab.mjs help
node scripts/rulefield-lab.mjs suite
node scripts/rulefield-lab.mjs diamond
node scripts/rulefield-lab.mjs critical
node scripts/rulefield-lab.mjs ca 30
node scripts/rulefield-lab.mjs ca 90
node scripts/rulefield-lab.mjs tools
node --test tests/rulefield-nks-lab.test.mjs
node --test tests/rulefield-amendments.test.mjs
\`\`\`

The implementation is [multiway_lab.mjs](multiway_lab.mjs); the existing Dollhouse Design test entrypoint imports the new test modules for later native CI. Actual execution must be checked at the exact source commit; a file's existence alone is not an execution receipt.

## Worked example A · two histories, one state, one bit

Finite source-free system: initial string \`AA\`; local rewrite \`A→B\`; two steps. The two possible one-event choices:

\`\`\`text
             AA
            /  \
  rewrite 0 /    \ rewrite 1
          BA      AB
            \    /
             BB
\`\`\`

The two distinct event histories produce the same \`BB\` endpoint. Under a **declared uniform distribution over the two complete event histories**, the history entropy is \(\log_2(2)=1\) bit and the endpoint-only state entropy is zero; the conditional entropy \(H(\text{history}\mid\text{terminal state})\) is exactly **one bit**. That is a loss under a chosen observation projection, not a general information-theoretic theorem about independent physical observers.

The engine never identifies two event instances merely because their terminal state strings are equal. The merged endpoint can be displayed, but the complete witness remains a separate data structure.

## Worked example B · a real overlapping critical pair

Initial \`AB\`. Two rules:

\`\`\`text
R1: AB → BA
R2: AB → AA
\`\`\`

Both rewrites target the same source span; \`BA\` and \`AA\` are distinct terminal normal forms for the two-rule system. Consequently **these two normal forms cannot later join** under the specified complete two-rule relation.

Introduce only as a *counterfactual*:

\`\`\`text
R3: BA → AA
\`\`\`

Now the particular fork has a join witness. This supports a finite proof about that fork; it does not automatically prove global confluence or causally invariant physical dynamics. \`criticalPairs\` restricts the test to overlapping string redexes; ordinary \`branchPairs\` also includes disjoint commuting choices.

## Worked example C · elementary CA

The laboratory uses rule-number bit semantics for the eight three-cell patterns. Boundary handling is either periodic or zero-filled; the chosen lattice and perturbation site are included in results.

The finite spatial binary entropy at step \(t\) is

\[
h_t=-p_t\log_2 p_t-(1-p_t)\log_2(1-p_t),
\]

with the usual zero convention. A Hamming-distance trajectory compares a declared one-bit-perturbed initial row to the control. This is neither a Kolmogorov complexity estimator nor a mathematically justified Lyapunov exponent.

## External Wolfram parity, not yet executed

Official tools:
- [Wolfram Function Repository MultiwaySystem](https://resources.wolframcloud.com/FunctionRepository/resources/MultiwaySystem)
- [WolframModel](https://resources.wolframcloud.com/FunctionRepository/resources/WolframModel)
- [Wolfram Physics Project tools](https://www.wolframphysics.org/tools/)
- [Hands-on introduction notebook](https://www.wolframcloud.com/obj/wolframphysics/Tools/hands-on-introduction-to-the-wolfram-physics-project.nb)

The unexecuted [wolfram_comparator.wl](wolfram_comparator.wl) is a native Wolfram Language adapter for the same finite examples. In an authorized Wolfram kernel, run it and record the actual input/output, Wolfram version, Function Repository resource revision, event-instance option choices and computed receipt. The output is a source for **cross-implementation comparison**, not an upgrade to empirical physics or actual human epistemic access.

Wolfram's public \`MultiwaySystem\` explicitly distinguishes state graphs with merged nodes from unmerged evolution and event-instance tracking. Its feature set includes branch pairs, resolution lists and state path weights. Our JS implementation is intentionally much narrower; a passing local test does not claim parity over all Wolfram function semantics.

Beyond these starter cases, prefer **a competent information-matched comparator** and explicit null results. In the DD-02 source-free result, a conditional hearing geometry and a complete-policy alternative both achieved 384/384; a 49/384 static ablation had intentionally less information and therefore could not establish novelty.

## Counterworld Loom Laboratory Instrument (`counterworld_loom.mjs`)

**Promoted:** 2026-11-08 · Operator directive: `tauric.diana.613` / Amari.  
**Implementation:** [counterworld_loom.mjs](counterworld_loom.mjs) · **CLI:** `scripts/rulefield-loom.mjs` · **Tests:** `tests/rulefield-counterworld-loom.test.mjs`.

The Counterworld Loom provides a reusable research instrument for investigating what additional distinctions make knowledge, representation, and authorized action possible. It contains five interoperable engines:

1. **`ObservationalClosure`:** Audits whether a lossy projection \(\Pi\) admits a well-defined forward prediction \(\bar{T}\) satisfying \(\Pi \circ T = \bar{T} \circ \Pi\). Proves that apparent indeterminism or stochasticity is often an artifact of representational projection loss (the commutative deficit).
2. **`HeterostratigraphicIdentity`:** Preserves historical role participation layers across eras. Proves that present state classification (e.g. `SUPERSEDED_CANDIDATE`) is adequate for descriptive status queries but strictly inadequate for determining legitimate future transformations.
3. **`DiscrepancyFiber`:** Converts representational refusals into structured 4-tuples:
   \[
   \delta = (\text{failed\_distinction}, \text{counterexample}, \text{missing\_coordinate}, \text{repair\_proposal})
   \]
   Refusal becomes an informational functor directing generative candidate repair.
4. **`InstitutionalHearing`:** Computes situated observer capabilities \(\mathcal{O}_{a,t} = (\text{evidence}, \text{capacity}, \text{authorized\_actions}, \text{available\_time})\) and measures epistemic phase displacement across the 6-clock social tensor:
   \[
   \tau_{\text{inst}} = (t_{\text{event}}, t_{\text{record}}, t_{\text{available}}, t_{\text{belief}}, t_{\text{authorized}}, t_{\text{acknowledged}})
   \]
   Dispositions include `HEARD_WITHOUT_STANDING_OR_POWER` and `HEARD_TOO_LATE_EXPIRED`, computationally separating the geometry of information from the geometry of power.
5. **`CounterworldLoom`:** Evaluates question decidability over fibers \(F_y = \Pi^{-1}(y)\) and isolates the minimal distinguishing witness \(w^*\) by bit cost. Supports reciprocal same-episode compositions uniting all five engines.

### Commission: The Witness That Arrived Too Late

The laboratory executes a 4-condition trial demonstrating the fundamental inequality:
\[
\boxed{ \text{Epistemic Sufficiency} \neq \text{Operational Sufficiency} \neq \text{Temporal Sufficiency} }
\]
- **Condition A (Knowledge without Power):** Minimal witness arrives before deadline, but observer lacks authorization.
- **Condition B (Power without Knowledge):** Observer possesses authorization, but witness arrives after deadline (blind action risks catastrophe).
- **Condition C (Timely Action, Delayed Acknowledgment):** Action executed before deadline, but institutional recognition remains delayed.
- **Condition D (Lawful Abstention / Non-Intervention):** Conclusive witness unavailable; system explicitly adopts non-intervention because risk-weighted expected utility is negative.

### CLI Usage:
\`\`\`bash
node scripts/rulefield-loom.mjs witness-too-late
node scripts/rulefield-loom.mjs suite
node --test tests/rulefield-counterworld-loom.test.mjs
\`\`\`

## What the laboratory cannot yet do

No native Wolfram kernel was run here. This lab does not derive physical causal invariance, general confluence proofs, unbounded string rewriting, true hypergraph event causal graphs, branchial physical spacetime, independent source authentication, or human-observer effects. Those belong to [ROADMAP.md](../ROADMAP.md) and must earn execution witnesses at the appropriate stage.

**Research ethic:** preserve unexpected behavior, admit null outcomes, and keep the distinction between computational evidence and creative interpretation visible. The record of a failed test is part of the garden.

𝄐 Khona‌lit-po · Source-free laboratory, not a secret universe ⟐
