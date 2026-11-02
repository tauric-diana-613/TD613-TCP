# Safe Harbor JWS: Portable Loom, nascent/post-emergence Manifest and Dome-World

**PROSPECTIVE APPLICATIONS — NOT INSTALLED OR AUTHORIZED.** These are source-derived candidate adaptations, not claims of live integration. They follow the context investigation and explain the resulting reusable-gate hardening. Experiment B retains its frozen program and separate grants.

## 1. Portable Loom: authorize the exact crossing, retain live candidate custody

The relevant mechanism is **Portable Loom returned-work re-entry**, not just the hosted demonstration service. Sources: `app/engine/portable-loom-reentry.js`, `portable-loom-session.js`, `portable-loom-challenge.js`, `docs/reentry/RELATION_MAP.md`, `docs/reentry/EVIDENCE_AND_HOLDS.md`, and the scoped historical handoff in `docs/PORTABLE_LOOM_REENTRY_HANDOFF.md`. Historical receipts in these documents were read as historical evidence, not rerun or relabeled.

### Existing executable sequence

1. `createPortableLoomReentryCustodian()` requires a live verified seed. It keeps a process-local state, revision, current excursion and map of issued candidate objects.
2. `stage()` registers the exact task, explicit selected sources, withheld count and intent order before egress. It does not advance the admitted head.
3. `recordChallenge()` reserves a pending episode before asynchronous verification and retains adverse/malformed evidence. An adverse episode cannot disappear because a later check omits its attachment.
4. `check()` binds the complete returned range, raw captures, registered challenges, root/policy/anchor and expected head into a checked candidate. It does not admit the result.
5. `admit(candidate,decision)` requires the **same locally issued candidate object**, unchanged revision/state/excursion, exact head, lifetime, reviewed candidate reference, `gesture:'ADMIT_RETURNED_WORK'`, and explicit unresolved-claim acceptance. After asynchronous digest work it checks head/revision/expiry again, with no await before its process-local state update.
6. `continuation()` carries only explicitly selected sources from the latest admitted turn and separately labeled preceding result. Its `authority` record denies head advance, authenticated receiver enforcement and imported-record authority.

### Exact JWS opportunities

| Distinct purpose | Signed scope must bind | What it would add | What remains unchanged |
| --- | --- | --- | --- |
| `PORTABLE_LOOM_EGRESS_INTENT` | Session root, effective policy, excursion/intent refs, task digest, selected commitment digest, withheld count, departure anchor, expiry and receiver audience | An external custodian can authorize this particular outgoing packet and recipient | It does not attest the receiver used only those sources or preserved hidden history |
| `PORTABLE_LOOM_RETURN_ATTESTATION` | Exact raw return digest, answer digest, echoed intent/root/policy/anchor, receiver identity/key, declared capture channel and scope | A genuinely receiver-controlled signer could authenticate origin of those bytes | Generator signatures cannot create receiver independence; complete source use and hidden retention remain unobserved |
| `PORTABLE_LOOM_ADMIT_RETURNED_WORK` | Candidate ref **and full retained candidate-record digest**, expected work-unit head and content parent, excursion, ordered intent refs, all linked challenge records, policy and expiry | A separately controlled human-authorized custodian can approve this exact local admission crossing | The receiving adapter must still pass the live object and original four-field decision to `admit()`; a parsed signed object cannot enter the candidate map |

These must have separate purpose-limited roots/audiences. An egress permit cannot serve as return attestation or admission approval. A challenge registered after Check changes revision, so an older signed permit cannot rescue the stale candidate. Signed receipts must bind retained adverse records instead of allowing a clean later signature to erase them.

**Persistent recovery is a separate capability.** The current private export explicitly says `REVIEW_ONLY_UNAUTHENTICATED_NO_ADMISSION_AUTHORITY` and includes source bodies, returns and attached challenge keys. A JWS over its digest could add integrity/authenticated provenance, but cannot restore the lost process-local issuance map, prove globally latest state, or exclude forks. That requires an accepted durable custodian/anchor/recovery protocol. Never upload the private export into a public signature lane; carry commitments through the external custodian instead.

External permit consumption and process-local admission are not one distributed atomic transaction. A crash between them must retain an uncertain/HOLD record for controlled reconciliation, not automatically consume a fresh permit or replay admission. The existing local compare-and-swap remains the final head guard.

**Actual adaptation made here:** Portable Loom's plain-data-before-digest discipline now informs the reusable JWS verifier. It refuses getters, exotic objects, sparse arrays, undefined/nonfinite values, unsafe keys and bounded-structure overflow before canonicalization. A regression proves a getter is never executed and consumption never starts. Portable Loom's own source is unchanged.

## 2. Nascent pre-emergence Manifest: a signed Action Folio is not a source-mutation grant

Source: `docs/research/manifest-succession/MANIFEST_RESEARCH_SUCCESSION_RECORD.md`, especially the prospective Action Folio/Dispatch/Return Receipt and three-clock sections. The predecessor `app/encyclopedia/index.html` actually stores selected record IDs in `STATE.gatheredIds` under browser-local key `td613.audit.1.3.collection.v1`, with a session fallback when storage fails. That selection is useful composition state, not a cryptographic source estate or execution permission. No operational Manifest authority service was established by this trace.

### First concrete workflow to adapt

```text
selected entry IDs
→ privately resolve authorized original/derivative SHA-256 commitments
→ Action Folio with proposed per-entry operations and withheld/private flags
→ source-free Dispatch file with exact scope and human-authorized external JWS
→ locally enforced permitted operations against separately mounted estate
→ complete Return Receipt (performed / refused / proposed / unresolved)
→ separately reviewed admission of changes
```

The first use is to preserve this sequence across a portable file. It must not turn the Encyclopedia's selection set into source possession, silently copy sources into a commission, or treat a model's proposed edit as an admitted rewrite.

### Separate permits for the six recorded transitions

| Transition | Concrete permitted action and required state binding | Independent boundary |
| --- | --- | --- |
| `SOURCE_BYTES_CHANGED` | Apply a proposed patch to a specifically authorized entry; bind original SHA-256, exact patch/new SHA-256 and expected estate head | Requires source-write consent; a summarize/research permit cannot supply it |
| `PROJECTION_CHANGED_INVARIANT` | Install a particular lens/format/edition while retaining originals; bind unchanged source commitments plus old/new projection and declared loss map | No claim that changed presentation is semantically equivalent merely because source bytes match |
| `CUSTODY_PERMISSIONS_CHANGED` | Change one explicit disclosure axis: mathematical result, interpretation, lineage, metadata or original | Permission to publish a theorem does not authorize publication of the private source or its identifying metadata |
| `ROUTE_HISTORY_TRANSITION` | Append one new exposure/processing route and its predecessor | Does not rewrite previous routes or certify unobserved foreign history |
| `LOCAL_SECTIONS_COMPATIBILITY` | Admit a compatibility/obstruction finding, linked to exact local sections and its warrant | Signature authenticates the submitted finding; proof, truth and novelty remain independently adjudicated |
| `RELATION_EMERGENCE_DISSOLUTION` | Record a new, contradicted or withdrawn relation candidate with attribution and evidence | Unsupported or surprising candidates remain retained; no forced ontology or automatic theory replacement |

Every proposed scope needs separate **evidence ancestry**, **presentation ancestry** and **adjudication ancestry**. Their digests cannot substitute for one another. Explicit null/missing warrant remains missing, rather than gaining credibility from a signature.

### The three clocks need different permissions

- **Initial advanced synthesis:** a finite owner-approved first-use research commission may return competing theories, contradictions or inability to unify. A signature cannot make successful unification mandatory.
- **Ambiance refresh:** a future separately authorized deterministic refresh can read only eligible admitted changes under its declared measurement contract. It cannot inherit synthesis, publication or source-write authority.
- **Owner-initiated later synthesis:** a new finite commission creates a proposed Theory Edition. Admission keeps predecessor editions and ordinary source access available; a new model output cannot silently replace the current edition.

An independently owned Manifest must be able to use its own namespace, roots, local models and tools. The generic verifier therefore supports an explicitly different namespace under its own accepted roots; the Experiment B wrapper still requires the TD613 namespace. No TD613 private governance is imposed on an independent owner by this candidate.

The practical pre-emergence benefit is already precise: preserve portable intent, per-entry permission differences and complete returned proposals **before any result is crowned as the Manifest**. This does not inject Manifest/Cupola vocabulary into blinded Flight prompts, alter the seven dimensions, or weaken the strong union.

### Speculative post-emergence TD613 Manifest: govern adaptive succession

This is explicitly conditional design, not a finding that emergence has occurred. It extends the succession record's Theory Edition, three-ancestry and owner-controlled transformation requirements. It does not limit the future Manifest to today's source taxonomy, mathematics, kernels, ontology or representation.

The important future object is a **proposed consequential transition**, which may be entirely new. The gate should authenticate its exact scope without deciding that its theory is true, forcing it into today's ontology, or authorizing itself to execute it. Known transition profiles provide reviewed starting points; unknown proposals remain preservable as `UNANTICIPATED_CANDIDATE` until their particular consequences can be reviewed.

| Concrete future encounter | Specific Safe Harbor adaptation | Permission/evidence that must stay separate |
| --- | --- | --- |
| A candidate contradicts the current TD613 Manifest or proposes a new foundation | Retain the complete attributed candidate, exact evidence/presentation/adjudication ancestry and negative results; sign a scoped provenance receipt if a real custodian is appointed | Recording an objection does not require approval of its truth. Provenance, independent judgment, human adoption and executable authority are different records |
| A new Theory Edition is proposed after independently judged work | Bind proposed edition content, predecessor edition(s), source estate commitments, permission snapshot, formal warrants and unresolved objections; separately authorize admission of that exact edition | A Stage 2 verdict is not the operator's edition-adoption signature. Preserve earlier editions, comparison and ordinary source access |
| Two incompatible editions are both defensible under different local sections | Preserve branch-specific parents, competing claim scopes and explicit compatibility/obstruction findings; sign which edition/branch a particular operation addresses | The latest visible homepage is not a universal best theory. No automatic forced merge, majority vote or erasure of a minority branch |
| Discovery requires an unanticipated operation or verifier | Record the new typed operation, input/output grammar, engine/algorithm version, mathematical warrant, finite resources and proposed numerical tolerances as a prospective instrument amendment | A mathematically interesting proposal cannot install arbitrary shell/network/tools or rewrite frozen primary Flight conditions. Adoption and a newly bounded execution permit come later |
| A future edition changes its conceptual architecture | Bind the exact old/new architecture and migration map, retained originals, declared lossy projections and rollback/read-access behavior | Architecture change is not source-byte change; neither a familiar name nor a signed source hash establishes semantic equivalence or renewed source consent |
| A source permission is withdrawn or a new publication boundary is selected | Recheck the current authorized permission state at the consequential action, with independent axes for results, interpretations, lineage, metadata and originals | Old signatures do not create perpetual permission. Handle retained evidence and any redaction under the actually accepted custody/privacy policy; do not silently rewrite the historical scientific observation |
| Manifest's mathematically derived representations feed a Dome-World/Cupola view | Bind edition, computed inputs, transformation/renderer identity, projection assumptions and output artifact separately; retain numerical results and interpretive art as different evidence classes | A signed rendering is not proof that repository structure equals a physical dome, that Cupola correspondence is established, or that an illustration is the exact computational result of its equations |

One concrete future sequence is:

```text
unexpected attributed candidate (including contradiction or failed claim)
→ preserved exact candidate/evidence records
→ separately controlled substantive judgment and frozen objections
→ human choice of proposed Theory Edition / instrument amendment
→ exact versioned application scope and purpose-limited issuer policy
→ separately authorized bounded operation against its intended parent state
→ complete performed/refused/uncertain return and successor receipt
```

The gate does not need to predict the mathematics in order to preserve and scope the proposed operation. It does need to know the particular authorized crossing before allowing execution. The reusable verifier can support a newly reviewed purpose under an explicit root policy; it cannot learn new permissions from successful research output. `proposeSafeHarborUse()` is the implemented non-authoritative record path for uses beyond this table.

This provides an adaptation mechanism rather than a promise of autonomous self-redesign: unfamiliar proposals survive; accepted new application schemas are versioned; existing signatures retain their original meanings; the owner can refuse, compare or adopt a successor. Experimental results never automatically expand the operator's spending, source disclosure, tool access or deployment authority. No post-emergence executor, Theory Edition, new mathematical kernel or production Manifest is installed by this commission.

## 3. Dome-World: two concrete seams, with different data/authority laws

### A. Exact trainer proposal → confirmation → checkpoint

Sources: `packages/dome_world_exact/runtime.py`, `trainer/trainer.py`, `TRAINER_SPEC.md`, and `api/dome-world-engine.py`.

The public trainer route already requires its enabled state, operator bearer token and configured checkpoint-signing secret. `trainer_propose()` accepts a bounded observation stream (at most 64 observations), produces a signed `trainer-proposal`, and does not mutate the basis. `trainer_confirm()` authenticates that token's kind, recomputes the ambient-field/basis parent commitment, reconstructs the exact `SeedProposal`, calls the learner's exact confirmation, and emits a signed `td613.dome-world.trainer-checkpoint/v0.4.3`. The standalone `Trainer.resume()` structurally checks its distinct v1 checkpoint and explicitly requires network callers to authenticate outside that method. These schemas/routes must not be conflated.

**Concrete candidate JWS purpose:** `DOME_EXACT_CONFIRM_PROPOSAL`, binding:

- exact proposal-token digest and schema;
- expected parent hash, ambient polynomial, basis/configuration digest and witness head;
- pinned engine/encoder identity and finite degree/height/capacity policy;
- confirmation purpose, recipient instance, one-use authorization ID and finite lifetime;
- the operator's precise mutation mandate, distinct from permission to observe or propose.

The new gate would sit before the existing operator/HMAC/algebraic checks, or become an explicitly reviewed versioned replacement for one named authentication interface. It cannot be silently accepted as today's bearer token. A valid JWS cannot bypass exact algebra, capacity, persistence/calibration gates, opt-in emission closure or parent mismatch. Existing client-held signed state is stateless; its signature alone does not prove the latest checkpoint or global replay exclusion. A future one-use/head custodian would add that specific property, with a separate accepted persistence law.

**Concrete candidate recovery purpose:** `DOME_EXACT_RESTORE_CHECKPOINT`, binding the exact checkpoint bytes/schema, expected predecessor and engine/configuration/encoder identity. Keep v0.4.3 runtime tokens distinct from v1 standalone trainer checkpoints. The gate authenticates a scoped recovery request; it cannot change seed coordinates, drop witnesses or enlarge the finite budget to make restoration succeed.

This is dictionary/basis growth in the exact substrate, not permission to train a provider model or change Experiment B's four-operation BigInt service.

### B. Artifact-blind reciprocal context exchange

Sources: `api/dome-world-engine-guard.py`, `packages/dome_world_exact/flowcore_context.py`, `reciprocal_bridge.py`, `app/engine/aperture-v3-reciprocal-bridge.js`.

**Concrete candidate purpose:** attest an authorized exchange of the exact diagnostic/context/audit/round-trip receipt digests **in a separate custodian-side envelope**. Preserve each existing digest domain, sensor status, generating transformation, missingness, uncertainty, alternatives and calibration posture. Keep the instrumentation request artifact-blind and its response non-authoritative; do not insert the source-bearing JWS envelope into that body.

This could authenticate who supplied an OBSERVED/SUPPLIED/DERIVED/SIMULATED/UNRESOLVED measurement and which transformations were declared. It cannot promote a DERIVED measurement to OBSERVED, turn modeled weather into a prediction, write Aperture doctrine, establish an artifact relation or activate Ash. Those exact authority fields are already refused by the reciprocal bridge. Authentication of provenance and mathematical/empirical admissibility remain separate checks.

## 4. What the implemented gate learned, and what is only proposed

Implemented and tested here: application/namespace/purpose separation; exact frozen scope comparison; complete packet-record versus replay commitment; issuer-limited permit windows; rejection of caller `verified` flags; bounded plain data before hashing; external-consumer refusal; explicitly unsigned unforeseen-use proposals; non-secret one-file setup. These belong to the Safe Harbor bridge candidate.

Not installed: Portable Loom egress/return/admission adapters, Manifest state-transition or theory-edition executors, Dome trainer/checkpoint/context gates, remote persistence, new signer roots or application credentials. They require their own prospective application review and actual external principals. No production source was modified, and no secret store, account, endpoint, private source or model was accessed by this context investigation. No experimental treatment was changed.

An unforeseen application is admissible as an attributed proposal even if these tables cannot describe it. To execute later, it must identify its own exact crossing, complete input/output/predecessor bindings, permitted consequence, independent checks, finite authority and failure recovery. A new application name or a shared glyph supplies none of those automatically. ⟐
