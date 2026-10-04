󐘓 U+10D613

# EMSTD613 Atelier · State / Route / Authority and Minimal Witness · First Pass

Status: research-only assay receipt
Branch: `amari/em-td613-lineage-atelier`
PR: #962 · draft / open / unmerged
Date: 2026-09-02

## Question

Do several apparently unrelated Em workspace Works preserve a meaningful distinction among:

1. present-state resemblance / prediction / classification,
2. directed route / predecessor / ancestry / publication history,
3. authority to mutate consequential state?

And, when route evidence must survive compression, privacy, asynchronous execution, or loss, does the corpus require full payload retention or only a sufficient witness?

## First-pass result

The cross-Work evidence supports the following provisional separation:

```text
STATE != ROUTE != AUTHORITY
```

- `STATE` answers what an object currently looks like, predicts as, or classifies as.
- `ROUTE` answers how the object arrived here: predecessor, parent, publication order, execution path, custody chain, temporal supersession.
- `AUTHORITY` answers what the object or subsystem is permitted to mutate, authorize, ratify, or make externally consequential.

A second, narrower result also survives hostile controls:

```text
resemblance may classify
!= resemblance establishes directed route
!= resemblance grants consequential authority
```

This is not a universal prohibition on similarity-based actuation. Similarity or confidence may legitimately control an actuator inside its calibrated/native jurisdiction. The failure occurs when a state estimator acquires route or authority jurisdiction without an additional directional/calibration witness.

## Mathematical orientation control

Many resemblance objects used in the corpus are local or orientation-poor. Cosine similarity and Mahalanobis-type distances can report closeness but do not, by themselves, determine:

- predecessor versus successor,
- parent versus child,
- authorized delegator versus delegatee,
- publication-before versus publication-after,
- causal or custodial direction.

Therefore:

```text
local/symmetric resemblance != directed route
```

Directed relations require additional structure: explicit predecessor edges, timestamps/chronology, parent identifiers, Merkle edges, SWHIDs, acquire/release publication order, capability attenuation chains, or other route-bearing witnesses.

## Positive controls

### Audio key detection — state classification with a typed null

`Audio Key Detection Plugin Design.md` uses cosine similarity between a chroma representation and key profiles to classify musical key. When harmonic support falls below the defined threshold, the system emits `No Key` / `Atonal` rather than forcing a low-confidence class.

This is a clean native-jurisdiction use:

```text
similarity -> property classification
```

It does not ask the similarity score to prove ancestry, chronology, or execution authority.

### Chat Context / Certaindex — confidence controls compute, not truth

`Chat Context Research Dive.md` describes Certaindex as an internal stabilization/confidence signal for early stopping of reasoning compute. The same Work separately calls for evaluator agents to validate factuality and format before downstream propagation.

Thus:

```text
confidence -> resource stopping
confidence != factual acceptance
```

`Cybernetic Multi-Agent Systems Research.md` supplies a second positive control: generated patches run inside a stateless sandbox; compiler/unit-test exit status forms a Verification Gate; successful strategy is stored only after that independent execution witness. Repeated failures eventually escalate to a human.

### Wearable — prediction actuates expression under a separate safety ceiling

`Wearable Drone Control System Design.md` explicitly transfers text-authorship stylometry into kinematic stylometry. A learned style representation predicts the dancer's next spatial coordinate and modulates the 11 expressive Boids swarm.

But two UI drones remain deterministic relative to the palm frame, and an RC + Schmitt-trigger hardware button bypasses the coordination loop and forces Diagnostic Hover.

Thus:

```text
prediction -> expressive actuation
prediction != final safety authority
```

### Open Seed — route is cryptographic; style is corroborative

`Open Seed License_ Multi-Party Framework & Stylometry Integration.md` assigns different evidentiary jobs to different channels:

- stylometric transition metadata / contribution ratios / writeprint deltas -> contribution or authorship evidence;
- immediate-upstream SWHID -> computationally addressable parent / artifact route;
- SPDX -> license identity;
- Private Context -> explicitly excluded from required public derivative distribution.

The draft clause requires an upstream SWHID referencing the immediate parent version. This is materially more directional than a style-distance score.

### OSSL Stylometric Lineage — formal route is assumed before drift is measured

`OSSL Stylometric Lineage Tracking Framework.md` was previously over-read as a genealogy discovery mechanism. Its formal lineage model explicitly assumes:

```text
M0 -> M1 -> ... -> Mk
```

and describes each child as derived from its immediate predecessor. The Merkle-DAG construction similarly operates on known parent relationships.

The stylometric machinery therefore measures drift, retention, collapse, and evasion along an already oriented lineage. It does not, by itself, orient an unknown parent-child edge.

### Long-horizon memory — similarity cannot answer predecessor queries

`LLM Architecture Deep Dive.md` explicitly names `wrong-time retrieval`: embedding similarity may retrieve a locally similar record while returning the wrong temporal state because it does not encode chronological order, supersession, or predecessor relations.

A query requiring the state immediately prior to a later state requires route-bearing temporal evidence, not semantic resemblance alone.

### Myth Transmission — route inference remains probabilistic when custody is absent

`Cybernetic Modeling of Myth Transmission.md` lacks a cryptographic custody chain. It therefore combines motif state, chronology, geography, transition assumptions, phylogenetic/NeighborNet proximity, observer/survival bias, and Bayesian inference.

Its ancestry claims are reconstruction under uncertainty rather than SWHID-like custody facts.

This is an important control:

```text
route unavailable -> infer route probabilistically
```

rather than pretending motif resemblance itself is a custody receipt.

## Failure-tail / jurisdiction-leak specimens

### Semantic Kalman culling

`AI Hypervisor Control Mathematics.md` uses cosine/task relevance in a semantic Kalman formulation whose latent quantity is described as `true semantic utility`. The estimate can authorize permanent vector culling. No empirical calibration bridge from current similarity/relevance to future operational utility has yet been located in the Work.

Candidate jurisdiction leak:

```text
state proxy
-> latent truth claim
-> irreversible authority
```

### OSSL-Seed Language Style Matching

`OSSL-Seed Framework Research.md` computes human-AI Language Style Matching / Total Synchronization and then lowers baseline state-mutation risk weights as synchronization increases, because the agent linguistically resembles the human principal.

The bibliography supports interpersonal language-style matching / accommodation; a separate calibration from linguistic synchronization to operational alignment or safe state-mutation risk has not been located.

Candidate jurisdiction leak:

```text
state resemblance
-> cognitive alignment claim
-> authority/risk modulation
```

The Work still retains a separate Certified Logic Sandbox + human ratification ceiling for sufficiently high-risk legal/financial mutations, so this is risk-sensitivity modulation rather than unlimited autonomous authority.

## Minimal witness under loss / compression

A further pattern survives an important negative control.

The corpus does NOT preserve a witness for every dropped datum. `Mixxx DAW Architecture Research.md` explicitly permits expendable telemetry frames to be dropped rather than block the real-time audio callback.

Where missingness would affect recoverability, chronology, ancestry, or externally consequential interpretation, stronger Works preserve a smaller witness even when the full payload cannot remain present:

### Mixxx cache miss

`Mixxx Engine Architecture Deep Dive.md`:

```text
cache miss
-> synthesize bounded silence / soft fade now
-> publish missing chunk index
-> background decoder retrieves exact chunk later
```

Immediate payload fidelity may be sacrificed while deficit identity remains addressable.

### Memory compression

`Cybernetic Memory Algorithms Research.md` allows the most aggressive active-context compression to replace raw content with a minimal reference pointer while retaining the uncompressed original in external archival storage.

`LLM Architecture Deep Dive.md` describes a terminal tombstone state retaining metadata that proves a memory existed.

### Open Seed privacy / provenance compromise

Open Seed explicitly identifies the reproducibility/privacy conflict: distributing dynamic contextual state may improve reproducibility but exposes private interaction data; stripping that state protects privacy but prevents exact behavioral reproduction.

Its proposed compromise is a reduced route witness:

```text
publish Seed / Derivative Spec
+ immediate-parent SWHID
+ stylometric transition metadata
- Private Context
```

Both the Markdown Work surface and the supported PDF manifestation contain the Private Context firewall / sovereignty carve-out.

## OSSL-family privacy/provenance tension

`OSSL-Seed Framework Research.md` proposes a materially different route instrument:

- Layer 3 = `Trajectory Manifest`;
- continuous agent-environment interaction logs;
- explicitly includes internal chain-of-thought and external tool responses;
- placed under CDLA-Permissive-2.0;
- described as enabling third-party auditors to inspect action lineage;
- the `symbiotic_lineage` layer preserves/analyzes generational prompt mutations.

Exact-text searches on the Markdown Work surface found no occurrences of:

```text
privacy
private
redact
strip
anonym*
PII
zero-knowledge
SWHID
```

No explicit privacy-preserving transducer, redaction layer, parent-hash substitute, or access-control mechanism for the Trajectory Manifest has yet been located in this Work.

Important precision:

```text
CDLA licensing / third-party audit
!= proof of universal public disclosure
```

The source says auditors may inspect the trajectory; it does not by that fact alone prove that raw trajectories are globally public. The unresolved problem is that the Work does not specify how private interaction content is separated from the audit trajectory.

Because this is a mass workspace export with separate Work entities and unresolved creation chronology, this is recorded as an `OSSL PROJECT-FAMILY DESIGN TENSION`, not as a demonstrated chronological regression or a contradiction in a single final doctrine.

## Route observability continuum

The OSSL family now exposes a useful design space:

```text
ROUTE-POOR
similarity / style alone
(no reliable edge orientation)

ROUTE-MINIMAL
immediate-parent SWHID + transition metadata
(private payload excluded)

ROUTE-RICH
continuous trajectory / interaction logs
(high audit detail; unresolved privacy membrane)
```

This suggests a deeper optimization question:

```text
How little route evidence can be retained
while preserving ancestry / auditability / recoverability
without unnecessarily exposing payload or private context?
```

## Candidate residual

The current strongest formulation is not `preserve everything`.

It is:

```text
Preserve the minimum witness required
so consequential absence, route, and authority
cannot masquerade as complete or self-certified state.
```

Or equivalently:

```text
state estimator
!= route witness
!= authority certificate
```

This remains a research candidate, not an Em-specific lineage promotion. Many individual mechanisms are domain-standard. The potentially interesting residual is the repeated migration of this separation into memory, prompt provenance, stylometric lineage, agent governance, and human-machine performance.

## Next hostile route

1. Search for cases where similarity legitimately determines a directed edge without auxiliary chronology / parent data.
2. Search OSSL/Open Seed manifestations for an unobserved privacy bridge before declaring the project-family tension unresolved.
3. Compare route-minimal designs against full trajectory logging for audit sufficiency.
4. Test whether `minimal witness` survives non-VSM source subtraction or is entirely supplied by each native domain's defaults.
5. Revisit SparkleMask only as a known-contact provenance control; it cannot count as independent convergence evidence.
6. Continue preserving `Work x speech-act zone` typing.

## Membrane

```text
similarity != ancestry
confidence != correctness
prediction != authority
state != route
route != authority
metadata witness != full payload
licensed trajectory != public trajectory unless source-witnessed
project-family tension != chronological self-correction
```

Marked ⟐
