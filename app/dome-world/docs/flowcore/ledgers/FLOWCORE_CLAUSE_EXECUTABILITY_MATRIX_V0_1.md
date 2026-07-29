𝌋‌

# Flow-Core Clause Executability Matrix v0.1

**Program:** `td613.flowcore.pedagogue-spine/v0.1`  
**Phase:** P0  
**Purpose:** distinguish executable guarantees from review duties, empirical hypotheses, and human authority.

## Executability classes

| Class | Meaning |
|---|---|
| CODE | enforced by pure/runtime code |
| SCHEMA | rejected or constrained by a machine-readable schema |
| TEST | demonstrated by deterministic or regression test |
| REVIEW | requires human inspection against evidence |
| EMPIRICAL | requires observed interaction or research evidence |
| HUMAN | cannot be delegated; only the human may decide or close |

## Matrix

| Clause | Class | P0/P1 implementation target | Required evidence | Failure posture |
|---|---|---|---|---|
| Consequence precedes ontology | SCHEMA + CODE + TEST | phase-order validator; NAME blocked before WORLD_ANSWERS | invalid NAME-first fixture | reject or HELD; never auto-reorder silently |
| Flow-Core commands no station | SCHEMA + CODE + TEST | station owner and authorized-action ceilings | authority-transfer adversarial fixture | reject receipt |
| Dome-World hosts ecology and proving scenes | SCHEMA + REVIEW | station owner fields and scene provenance | concordance and scene review | hold promotion |
| Ash remains sole custody and ancestry authority | SCHEMA + TEST + REVIEW | forbidden `automatic_ash_action`; no lifecycle mutation | Ash non-regression later; P1 authority fixture now | reject and hold |
| Aperture audits and reconstructs | SCHEMA + REVIEW | audit view may compare/abstain but cannot bind custody | AIA invariant review | reject authority gain |
| Receipts may cross; authority does not | CODE + TEST | receipt carries station ownership and authority ceiling | cross-station replay fixture | reject receipt |
| Only the human closes | SCHEMA + CODE + TEST + HUMAN | closure defaults OPEN; automatic closure forbidden | auto-close adversarial fixture | reject compilation |
| Identical governed inputs produce byte-identical receipts | CODE + TEST | frozen clock, ID seed, canonical serializer, deterministic sorting | replay test over exact bytes | fail P1 gate |
| Unicode scalar sequences remain unnormalized | CODE + TEST | reuse TD613 canonical JSON profile | ZWNJ, U+10D613, composed/decomposed fixtures | reject malformed surrogate; preserve valid sequence |
| Every scene carries research frame | SCHEMA + CODE + TEST | required question, hypothesis, observable behavior, alternative explanation, failure modes, falsifier, abstention conditions, claim ceiling | valid/invalid scene fixtures | reject scene |
| Missingness and contradiction remain admissible | SCHEMA + CODE + TEST | explicit arrays and observation status | unresolved/contradictory fixtures | preserve; never synthesize closure |
| Experiential, custodial, audit, and implementation AIA views remain non-equivalent | SCHEMA + CODE + TEST + REVIEW | explicit route compiler with route-specific priorities | cross-view comparison | reject equivalent payload or authority drift |
| AIA views conserve provenance | CODE + TEST | canonical invariant subject copied into every view | invariant equality test | reject view set |
| AIA views conserve causal structure | CODE + TEST | route/transition causal trace remains identical | invariant equality test | reject view set |
| AIA views conserve claim ceiling | CODE + TEST | identical claim ceiling object content | invariant equality test | reject view set |
| AIA views conserve missingness and contradiction | CODE + TEST | identical canonical sets | invariant equality test | reject view set |
| AIA views conserve station ownership and authorized actions | CODE + TEST | no route may add authority or action | adversarial view mutation test | reject view set |
| AIA views conserve rest and exit | CODE + TEST | required availability in scene/view schemas | no-rest/no-exit fixtures | reject scene/view |
| Every animation has information-complete static equivalent | SCHEMA + TEST + REVIEW | P1 transition contract reserves static equivalent; P3 renderer implements parity | static-parity fixture and later renderer test | block P3/P4 promotion |
| Glyph motion derives from state | SCHEMA + REVIEW | canonical glyph registry declares trigger and motion law | registry audit and P3 visual receipt | reject decorative-only glyph use |
| Color never carries meaning alone | SCHEMA + TEST + REVIEW | visual channel contract later requires second signal | P3 accessibility test | block visual promotion |
| Route-burden models remain comparative and uncrowned | SCHEMA + CODE + TEST + EMPIRICAL | P5 registry requires multiple models and disagreement output | model-comparison tests and calibration evidence | no access gate or redesign command |
| Gluing mismatch does not diagnose a person | SCHEMA + CODE + TEST | forbidden claims and no learner profile | adversarial cognition/identity fixture | reject claim |
| Phason projection change does not imply content mutation | SCHEMA + TEST | scene claim ceiling and exact-origin provenance | P4 exact fixture | reject widened claim |
| Pair residue does not imply intent, identity, authorship, or causation | SCHEMA + TEST | scene claim ceiling | P4 Moiré fixture | reject widened claim |
| Child legibility does not create hidden learner profiling | SCHEMA + CODE + TEST + REVIEW | forbidden stable identity, age inference, emotional inference, developmental rank | profile adversarial fixtures | reject input/receipt |
| Rest preserves continuity and applies no penalty | SCHEMA + CODE + TEST | rest state fields | rest fixture | reject punitive rest |
| Exit remains available | SCHEMA + CODE + TEST | exit affordance required | no-exit fixture | reject scene |
| Ash lifecycle, digest semantics, and local-only guarantees remain unchanged | TEST + REVIEW | no P0/P1 import or mutation of Ash lifecycle; later non-regression | diff review and Ash suite | block P6 |
| Serverless allocation remains unchanged | TEST + REVIEW | no `api/` or `vercel.json` mutation | diff and inventory receipt | block deployment promotion |
| Deployment does not equal production demonstration | REVIEW + HUMAN | phase receipt records preview evidence separately from promotion | Vercel/GitHub status plus human gate | remain draft/human-gated |
| Beauty confers no authority | REVIEW + HUMAN | claim ceiling and visual receipt | design review | hold promotion |
| Claim ceiling survives every route and rendering | CODE + TEST + REVIEW | immutable canonical claim ceiling | core/AIA/static parity tests | reject output |

## Clause closure rule

A clause marked REVIEW, EMPIRICAL, or HUMAN cannot become “executed” merely because adjacent code passes. Machine enforcement may protect the boundary around the clause; it cannot manufacture the human observation or decision named by the clause.

## P0/P1 focus

P0 establishes provenance and executable targets. P1 implements only pure contracts, deterministic compilation, receipt verification, protected Unicode serialization, and phase/authority/non-claim guards. P1 introduces no UI, animation loop, storage, network call, Ash action, or release path.

**Marked ⟐**
