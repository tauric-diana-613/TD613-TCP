# TD613 bounded runtime provisioning review

Disposition: HELD_PERMITTED_WORKSPACE_OR_RUNTIME_DEPENDENCY

SOURCE-FREE ENGINEERING ONLY. PROPOSED — NOT SIGNED. Gate F HELD. ZIP STAYS SEALED. ⟐

## A. Runtime module artifact status

An operational six-function module is HELD. The missing dependency is an independently provisioned security supervisor capable of enforcing per-child filesystem, instruction, credential, network, tool and delegation restrictions, plus the accepted mathematical service and independent Stage 2 principal. The existing local process boundary and read-only CLI sandbox do not demonstrate those properties. Exporting functions that merely assert isolation would misrepresent readiness. This package therefore supplies a precise integration contract and reproductions, without a launch-capable module or permissive stubs.

The permitted workspace contains an exact-text snapshot of six reviewed files fetched through the authorized GitHub connector at c7ee69abc9800d0abdf21bbb957c5534f86b01ad. It is a scoped source snapshot, not a complete executable checkout. Baseline implementation and tests are preserved. No local ACL was changed or bypassed. No GitHub mutation or push was attempted. A local additive review patch and SHA-256 inventory accompany this report. GitHub raw source retrieval is the evidence origin for the snapshot. This package makes no independent scientific acceptance claim.

### Required external module contract

| Export | Required provision and fail-closed behavior |
|---|---|
| observeRuntime | Stable canonical manifest from the security supervisor, with executable/module/dependency digests, instruction sources, effective model and effort request, credential class, permitted destinations, tool/kernel inventories and tolerances, filesystem mounts and policy revisions. Keep ephemeral IDs in receipts. Provider served identity, retention and hidden reasoning controls must be explicitly unavailable unless authentically evidenced. Compare observed manifests before and after each dispatch. |
| confirmQuotaWindow | Read operator-approved account/window evidence with provenance and validity. Return false on missing, stale or unverified availability. Never derive provider quota from token counts. Preserve cumulative episode spending authority. |
| measureInput | Pinned model-appropriate tokenizer and serialization/overhead policy. Require accepted context/output bounds. Hold if tokenizer or accounting semantics are absent. No guessed limits. |
| spawnNative | Accept only the approved executable digest and exact pinned native arguments from the reviewed adapter. The external supervisor must enforce isolated scratch, allowed provider-only egress, credential allowlist, no ambient skills/MCP/host context, no undeclared tools/subagents and bounded connection/transport attempts. Capture every stdout/stderr chunk through the controller callback and retain terminal bytes and usage. Fail on stream/storage loss, unexpected activity, drift or ambiguous completion. No internal model retry or model fallback. |
| freezeStage2Packets | Retrieve custodian-prepared complete packets and actual independent semantic-equivalence/leakage review under the frozen binding. Preserve all candidates and controls. Hold on missing review or overflow. |
| collectIndependentStage2 | Retrieve an independently produced receipt bound to the packet digest, evaluator configuration, proof work and independent principal. No evaluator inference or evaluator retries in the generator runtime. Return no receipt when unavailable. |

The required mathematical service must expose a reviewed, typed finite operation list, pinned engines, deterministic input/output encoding and numerical tolerances identically for both arms. Log every invocation. Restrict file, network and inference access in the service itself. Its exact operation list remains an independent scientific acceptance dependency. The reviewed wrapper allows kernelActivity supplied out of band but rejects ordinary CLI tools. Connecting a kernel through a generic shell/MCP tool would require a separately reviewed interface correction. No such service is provisioned by this package.

## B. Isolation and capability evidence

Run `node --test adapter-redpen.test.mjs` in this package. Tests import only the standalone unmodified adapter and ZIP-intake source. They invoke no subprocess, provider, archive path or signature helper. All payloads are invented and labeled SYNTHETIC. Passing tests establish the reproduced behavior and negative guards, not runtime isolation or empirical emergence.

The prior accepted inspection records CLI 0.166.0-alpha.5.1, Node 26.7.0, native JSONL/ephemeral/config controls and a ChatGPT login route. It also records ambient shell/apps/plugins/multi-agent capabilities and unbounded connection retries. Reuse that evidence. No model probe or budget study was repeated here. Local source snapshots and candidate dependency digests appear in manifest.json. Baseline imports resolve locally for the focused tests only; all six reviewed files are not claimed to form a complete repository.

## C. Admission-only bootstrap candidate

No authoritative manifest escrow was supplied or established in the inspected source. This does not prove no external escrow exists. An escrow would need custodian authentication, exact archive-byte binding, metadata/derivative provenance, compatible ordered broker-manifest commitments and lawful later re-admission. A serialized manifest would supply commitments only.

The cold-start conflict is present in the inspected implementation. loadAuthorizedRuntime verifies a final plan/source-bound execution grant before admission. admitArchive separately checks both contemporaneous Flight flags. The original archive grant signature covers path, optional archive hash, operation, episode and issuer. It does not bind an expiry or a distinct admission-only purpose. Flags alone and caller-consistent HMAC integrity cannot resolve human authorization.

Smallest proposed correction, requiring independent review before implementation/use:

1. Add a separate admission-only entry point and distinct externally controlled authorization operation, with exact designated archive, mandatory archive-byte hash, episode, issuer, expiry, single-use authorization ID, metadata/derivative policy digests, finite ZIP limits and private output custody policy. Human authorization must be recorded and independently checked by the designated custodian; a locally generated signed JSON object is insufficient. Archive hashing itself requires the later authorized inspection permission.
2. Refactor only the physical authorization gate into purpose-specific verification. The admission-only branch requires its own contemporaneous admission flag and independently validated grant. Keep the existing Flight branch and final inference authorization checks intact. Do not temporarily set the Flight-execution flag for bootstrap, impersonate Flight, or issue a full execution grant with a placeholder manifest.
3. Share the genuine physical ZIP verification and WeakMap binding implementation across both authorized purposes. Retain size/ratio/CRC/encryption/path/duplicate/symlink checks, exact archive hash and designated path checks. A new public function must not mint physical members from buffers, serialized objects or asserted hashes.
4. Run the admission-only process in a custodian-controlled offline environment with no model transport imported or provider credentials. Read only the designated archive after authorization, retain raw membership, binary/text status, necessary metadata and derivative provenance privately. Produce the exact ordered broker manifest digest plus archive-byte digest and metadata/policy commitments. Distinguish the intake manifest (filename/hash/size) from the broker manifest (ID/raw hash/text hash). They are different digest schemas.
5. Freeze the complete scientific plan, controls/orders, source/metadata bindings and runtime configuration after identification and before reasoning exposure. Obtain a separate inference grant bound to those frozen commitments. Bootstrap authority must be rejected by the existing final runner.
6. At a later authorized re-admission, verify the same designated archive-byte hash and frozen metadata/derivative policy, use genuine physical intake again, and compare ordered manifests exactly. New physical members acquire fresh in-process WeakMap membership. Serialized escrow objects never replace them. Hold on drift. Bootstrap does not authorize unblinding.

This is a design candidate only. The purpose-specific admission code and human authorization infrastructure remain unimplemented. The tests cover existing synthetic nonauthority and physical denial, not successful admission-only execution or full grant-separation enforcement.

## D. Narrow redpen

| Established behavior | Consequence | Smallest proposed repair |
|---|---|---|
| Parser joins every completed agent_message, with no terminal-final identifier | Commentary can enter scientific replay as if part of the final | Require a witnessed terminal-final channel or authoritative final-message artifact. Bind it to the terminal event and exact bytes. Hold on ambiguity. Preserve raw JSONL. Do not assume the last message is a final without interface evidence. |
| Parser accepts messages after turn.completed | Late material can alter accepted output | Enforce stream lifecycle/order and hold on post-terminal output. |
| Activity filtering examines only item.completed | A started, incomplete disallowed tool escapes this check | Observe starts/updates/completions and reject disallowed activity immediately. Unknown events require explicit adjudication. External enforcement must prevent effects before the event arrives. |
| Parser refuses records exceeding 16 MiB | Safe refusal exists, but complete custody depends on wrapper capture | Keep refusal and all-byte journal/spool capture before parsing. On storage/capture failure or overflow hold without retry. The legacy synthetic spawnSync maxBuffer alone cannot establish complete capture. No truncation or higher-capacity claim is made. |
| Pinned args contain ignore-user-config but omit ignore-rules, daemon and complete instruction/tool restrictions | User configuration exclusion does not demonstrate host/plugin/rule isolation | Preserve accepted source pending review. Specify exact hardened arguments/configuration and minimal environment inside the external security supervisor, verify against installed CLI, and witness the effective instruction/tool inventory before separate live authorization. |

Hidden provider delegation/network activity is not comprehensively observable in JSONL. Local security controls can restrict local effects and destinations. Provider-side properties need authentic documentation/attestation or an explicit accepted limitation. If unavailable for an indispensable condition, hold the corresponding isolation/treatment claim. No alternative model or REST route is selected.

## E. Residual provisioning register

| Responsible principal | Required action before separately authorized native witness |
|---|---|
| Operator/local security owner | Designate and provision the enforced external child boundary, private store/anchor custody and reviewed runtime module; supply account/privacy acceptance and finite source-free witness authorization. |
| Runtime provisioner | Supply actual module, dependency/policy digests, tokenizer, context-control evidence, quota evidence, bounded-attempt transport, complete capture and matched kernel service. Local read-only flags are insufficient evidence. |
| Provider/account administrator | Establish account class, entitlement and acceptable privacy/retention posture; identify available served-identity/configuration evidence and unavailable properties. |
| Independent evaluator/custodian | Establish independent Stage 2 credentials and roots, evaluator configuration, complete packet/proof/blinding procedure and separate finite resources. |
| Amari | Review this exact additive package and admission-only design, adjudicate the adapter corrections and remaining evidence limitations. New work needs separate acceptance. |

Next physical action: the operator-appointed security provisioner supplies a concrete enforceable isolated child execution service and its non-secret policy/dependency inventory. A separately authorized native witness follows only after that service and the runtime module are reviewed. Archive inspection has a separate later admission-only authorization path pending correction review.

No runtime was operationally certified, child dispatched, archive admitted, key/signature generated, receipt rewritten, PR merged or deployment performed. Human authority and final closure remain reserved. ⟐
