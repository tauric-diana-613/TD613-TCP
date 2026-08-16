# AIA Cistern Law

**Status:** EXPERIMENTAL / reusable security architecture candidate  
**Current technical identity:** `td613.aia.cistern-law/v0.2`  
**Reference implementation:** `app/engine/aia-cistern-law.js`

Cistern Law is an AIA-derived DLP / OPSEC / INFOSEC boundary discipline for consequential information routes. It is repository ontology and implementation law, not a user-interface brand.

AIA is the structure. TD613 supplies data-governance authority. Dome-World supplies the information-architecture environment in which a governed surface is encountered. Cistern Law uses those layers without redefining them and without making itself a new station or a security crown.

## Core law

> Consequential information crosses a governed boundary only through an inspectable, qualified, witnessed, bounded, receipted route; endpoint sameness never substitutes for route authority.

The compact route is:

`consequence notice -> lawful route -> witness -> bounded intent -> separate confirmation when required -> egress -> receipt -> replay posture`

A release is therefore not authorized merely because a caller can reach the correct endpoint or assemble a valid-looking payload.

## AIA relationship

Cistern Law inherits four AIA commitments:

1. **Internal legibility.** An authorized operator should be able to answer NOW / WHY / EXACT: what is about to cross, why the route is admitted, and what exact consequence is being authorized.
2. **Non-equivalent routes.** Different projections of the same governed boundary may be useful without becoming interchangeable. Operator consequence, custody / authority, audit receipt, and implementation contract can remain distinct views of one boundary.
3. **Route memory.** `SAME_ENDPOINT` does not imply `SAME_ROUTE`, and `SAME_ROUTE_SHAPE` does not imply `SAME_AUTHORITY`. The current implementation treats heterostratigraphic / holonomy language as a comparative route-history model, not as a claim of exact differential geometry.
4. **Asymmetric disclosure.** Authorized internal routes may be child-legible while unauthorized routes return only the minimum information needed for a safe refusal. The default law forbids fabricated decoys. A future deployment may separately define canaries or deception surfaces, but Cistern Law does not silently manufacture them.

The generic Pedagogue Design Gate carries a Cistern boundary fixture through the actual four-route AIA compiler and verifies invariant preservation, non-equivalent surfaces, consequence-before-ontology, REST / exit, route-burden comparison, and human closure. The fixture lives outside Pedagogue core so Cistern taxonomy does not become Pedagogue taxonomy.

## Defensive composition

Cistern Law was derived by separating three previously useful defensive jobs rather than forcing one mechanism to do all of them:

- **Ingress containment:** a caller on the wrong route reaches no meaningful governed state.
- **Semantic refusal:** forbidden fields, contract drift, unsupported schema, or contaminated payloads become WITHHELD / HELD rather than silently normalized.
- **Human-latched actuation:** a consequential write is candidate-qualified, witnessed, bounded in time / intent, separately confirmed where required, and receipted.

The reference proving case additionally distinguishes **idempotent** and **non-idempotent** egress. An operation that can create a new external identity receives stronger replay treatment than a membership operation that first reconciles destination state.

## Replay law

Signed-session rotation is useful client hygiene, but it is **not a durable replay tombstone**. A previously issued stateless signed cookie may remain cryptographically valid until its original expiry.

For non-idempotent writes that claim replay death, Cistern v0.2 requires a durable spent-intent record independent of the rotated browser cookie. The current Giving proving case stores only digests and bounded operation metadata in the admitted Neon boundary:

- session digest;
- intent digest;
- operation;
- request digest;
- spent timestamp;
- expiry timestamp.

It does **not** store donor payloads, Campaign Deputy credentials, plaintext contact data, or raw session nonces. The insert is conflict-refusing: the same session + intent cannot be consumed twice even across serverless instances. If the durable ledger is unavailable, the protected non-idempotent route fails closed.

Idempotent / state-reconciling routes may retain `SIGNED_SESSION_ROTATION_ONLY` posture and must not claim durable replay death unless they also record a tombstone.

## Consequence directives

`CISTERN_LAW_ELIGIBLE`

Use when a boundary would benefit from explicit route memory, refusal receipts, or human-visible consequence, but the action is reversible or destination-idempotent enough that the full actuation membrane would add unnecessary burden.

`CISTERN_LAW_REQUIRED`

Use when a route can perform a sensitive disclosure, non-idempotent external mutation, irreversible custody change, privileged release, credentialed egress, or another consequence for which endpoint access alone must never constitute authority.

A `CISTERN_LAW_REQUIRED` route should define, at minimum:

- the exact admitted route steps;
- the human witness / confirmation requirement;
- the bounded intent rule;
- the egress projection that may be attested;
- the refusal posture;
- the replay posture and, when replay death is claimed, the durable tombstone store;
- the receipt fields exposed internally and the smaller public / caller-safe projection.

## Claim ceiling

Cistern Law may support claims such as:

- a declared route matched or differed from an observed route;
- a human confirmation was present or absent;
- a bounded intent was accepted or refused;
- a digest-only spent-intent tombstone was recorded;
- an egress projection produced a particular digest;
- an alternate route reached the same endpoint without inheriting the original route authority.

Cistern Law does not by itself prove that:

- AIA is a firewall;
- every attack class is prevented;
- the external destination is uncompromised;
- a signed session proves operator identity in an unlimited sense;
- a route-memory mismatch identifies attacker motive;
- a rotated stateless cookie is replay-dead;
- a security receipt transfers authority to another subsystem.

## Current proving case

Giving's Campaign Deputy connector is the first bounded proving case.

- `campaign-deputy.create-confirmed` requires the full human confirmation chain and a durable spent-intent tombstone before the external person-create call.
- existing-person membership and committee-list routes retain destination-state reconciliation and do not falsely advertise a durable tombstone merely because the browser receives a new intent.
- every successful connector receipt keeps `external_contribution_created: false`; Giving does not convert historical public giving into a Campaign Deputy contribution.

This is a proving case, not Cistern's taxonomy. Future products should depend on the generic law and define their own fixtures / policies outside `app/engine/aia-cistern-law.js`.

## Verification surfaces

- `tests/fixtures/pedagogue/cistern-boundary-design.json` — generic AIA / Pedagogue design fixture.
- `tests/pedagogue-design-gate.test.mjs` — verifies the boundary survives the real AIA compiler without product authority.
- `tests/giving-cistern-replay.test.mjs` — proves first-use tombstone insertion and second-use replay refusal for the non-idempotent proving route.
- `server/giving/intent-ledger.js` — digest-only durable spent-intent implementation for the current proving case.

Promotion beyond EXPERIMENTAL requires observed production receipts, replay / concurrency testing, and an explicit human review of the added operator burden. No burden model may promote the architecture automatically.
