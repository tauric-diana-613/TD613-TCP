# Source custody and protected-ingress transfer specification

**Design only. No transfer, archive admission, archive hash or grant is produced by this commission.** Every protected identifier/digest below is a field name without a value. Gate F and separate operator exposure authority must both be satisfied before any future operation.

## Existing boundary and exact gap

At baseline the private AUTHENTICATED_PHYSICAL_ARCHIVE_MEMBERS WeakMap binds the original descriptor object, raw bytes and text digest; verification checks membership and bound fields. Only the physical-admission path calls its private binder after grant and ZIP checks. JSON serialization, structured cloning, a matching SHA-256 or an archive_intake_verified Boolean cannot reproduce membership. [B05 lines 37–57](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs#L37-L57), [physical-admission return](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs#L585-L643).

The harness accepts protected in-memory descriptors only with that capability, or a physical path that must pass canonical authorization and byte binding before exposure. Direct-file allowlists are exact preflight specimen lists; several internal math engines, charters and manifest material are forbidden as source evidence. [B06 lines 46–139, 150–247 and 740–844](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs#L740-L844).

The Codex adapter explicitly requires SOURCE_FREE_SYNTHETIC and rejects physical paths, grants and claimed archive admission. The Flight runner's native backend is an Antigravity route that refuses live native reasoning before archive admission. No merged protected ZIP-to-Codex adapter exists at these revisions. [B08 lines 11–67](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/scripts/experiment-b-codex-exec-adapter.mjs#L11-L67), [B10 lines 967–985](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/scripts/run-experiment-b-flight.mjs#L967-L985).

## Proposed trusted parent and receiver

Preserve admission and WeakMap verification inside one narrowly trusted parent process. An independently reviewed broker may attest a **new transport authorization** after validating the original object; it must never claim that WeakMap membership crossed the process boundary. The receiver verifies a broker capability using a trust root provisioned independently by the operator/custodian. Signing keys remain outside child workers and outside this repository. Existing operator grants and signatures are verified, never minted by Codex. Grant integrity, human authority, transfer authority and provider data-use consent are distinct decisions.

Before any future admission, verify the approved contract/configuration hashes, model receipt standard, budgets, evaluator readiness, episode uniqueness and operator exposure decision. Only the trusted custodian may then use the existing physical intake under its original path, grant, digest and ZIP safeguards. This specification changes no existing guard and authorizes no call to it now.

## Envelope and source-specific visibility

The private, versioned, domain-separated canonical envelope must bind:

| Group | Required fields |
|---|---|
| Authority | schema/version, domain separator, protocol/amendment hash, operator decision reference, admission ID, private corpus-manifest digest, approved issuer/key ID |
| Destination | episode, architecture lane, evidence/representation/order/replicate/model block, stage, receiver identity, allowed operation |
| Chronology | exact current exposure index, previous exposure receipt digest, released source-prefix root, schedule digest, expiry and one-use nonce |
| Bytes | opaque source ID, original raw-member digest/length/encoding, consumed text digest/length, exact half-open byte spans, serialization digest |
| Derivative | parent raw digest, derivative digest, transformation/version, authenticated provenance and uncertainty receipt, or explicit none |
| Policy | permitted source/tool set digest, current-document and prior-prefix visibility, prohibition on future/cross-arm reads, retention/logging class, budget permit |
| Authentication | signature algorithm and signature covering canonical bytes; independently provisioned trust-root reference, never a secret or signing key |

The proposed wire version uses Ed25519 signatures over the UTF-8 bytes of a fixed domain separator TD613_CODEX_TRANSFER_V1 followed by a zero byte and canonical envelope bytes excluding the signature. Canonical envelope encoding recursively sorts object keys by Unicode scalar order, uses minimal decimal safe integers, JSON string escaping, no insignificant whitespace and no Unicode normalization. Reject duplicate keys, non-finite numbers, floats, negative lengths, out-of-range integers and unknown required-policy versions before signature verification. Freeze a reference encoder and cross-language byte vectors in a later implementation review; no keys or signatures are generated here. Algorithm changes require a new version and operator approval under D12.

Base64 payload decoding must be exact. Preserve U+200C, namespaces P1::/EM:: and raw encodings; normalization or OCR is a derivative with lineage, not replacement of original evidence. Missing or unauthenticated binary text causes recorded abstention, never a guessed transcription.

The parent revalidates WeakMap membership and raw/text digests immediately before rendering. It sends only the currently permitted payload over authenticated private IPC, not command-line arguments, world-readable files, a general archive mount or a repository path. The child verifies scope, freshness, destination, sequence and source-prefix membership before consuming bytes, and binds the complete rendered prompt hash to its final receipt. The parent binds that receipt back to its private admission record. A signed digest without matching consumed bytes is insufficient. A malicious broker remains a trust risk; independent custody review is required.

For 2A stage 1 and 2B, the envelope may expose the same released raw-source prefix. For 2A stage 2 it permits the authenticated actual handoff and prior allowed handoffs/commitments only. It cannot turn a span-check request into a raw-source read that bypasses the bottleneck. Engine calls use supplied typed operands and deterministic outputs, not filesystem access to answer-bearing internal code. Pure kernel access requires an independently reviewed API and parity manifest.

## Direct-file route is a separate alternative

If direct files are ever proposed instead of IPC, the operator must approve a run-scoped exact member allowlist, verified declared AND canonical paths, inode/file-handle or equivalent replacement resistance, byte identity at consumption and stage-specific permissions. Do not widen the baseline fixture allowlist, allow a repository root, or set a trustClass flag as a shortcut. A serialized broker envelope must not be accepted by the existing harness as a protected object without a separately reviewed receiver integration. Reparse/symlink aliases, traversal, path prefix tricks, mutation and file substitution must refuse before model exposure.

## Confidentiality and receipts

The provider receives only explicitly approved private evidence. A ChatGPT login or read-only sandbox does not establish retention, training, residency, organization controls, contract terms or deletion. The operator must approve the actual account/provider data handling before upload; if protected-data requirements cannot be supported, transfer is HELD. All private prompts, source hashes where sensitive, source identities, proofs and transcripts stay in private custody. Public artifacts contain source-free designs and non-sensitive aggregate findings only after separate publication review.

No secrets in arguments or stdout. Disable crash dumps and unapproved telemetry where controllable; establish encrypted private storage, least-privilege access, limited retention, recovery and destruction evidence. Failed or interrupted calls still require private custody and accounting. Confidentiality promises that cannot be independently verified remain declared limitations, not deletion attestations.

## Required future acceptance evidence, not tests executed now

Reject cloned/forged descriptors, unsigned or wrong-destination envelopes, cross-arm replay, expired/reused nonces, future-document sequence gaps, altered payload/spans, stale file substitutions and unauthenticated derivatives. Demonstrate authorized inline transfer with **new synthetic fixtures only** under a later separately authorized implementation commission before any protected use. No live source bytes are needed to test the boundary. Successful negative tests would establish the tested implementation scope, not provider confidentiality or human authority. Current status remains AUTHENTICATED_PROCESS_TRANSFER_UNIMPLEMENTED.
