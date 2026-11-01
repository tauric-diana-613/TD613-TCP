# TD613 operational provisioning receipt

GATE_F_HELD_EXTERNAL_PROVISIONING_REQUIRED. PROPOSED — INDEPENDENT REVIEW REQUIRED. Engineering conversation ACTIVE. ⟐

## Actual progress

The accepted Flight implementation remains fcdafe418b7a1686f4f9da3d018345d1a595e69d, with prior exact-head CI run 41352231850. This additive operational package changes none of that implementation. The previous operational receipt is superseded only where the environment findings below materially changed.

The restricted command context still reports a non-administrator token. A permitted command outside that sandbox established running Hyper-V/network services and two WSL2 instances. Hyper-V enumeration remained unavailable. The existing signed container application was started without installation, ACL changes or bypass. Docker Linux engine 29.7.2 then became reachable. Its daemon remains an externally trusted host capability and must never be exposed to reasoning children.

The official Node 24.4.0 Alpine image was pulled and pinned to sha256:3ab1d8a775153425c45ac8c6434c8717fae5866d9dc3e494dc7eb8550d71c75f. The exact official Linux native CLI package 0.166.0-alpha.5.1-linux-x64 was downloaded and verified against registry SHA-512 integrity. Its 318015496-byte executable has SHA-256 6253fb59fc4c21a9134b2f73237650eaec4a3d9380e5af12f3f1e9040dc24c14. The initial 256 MiB extraction ceiling refused the payload; bounded file streaming resolved this access barrier. The Flight parser's separate 16 MiB complete-record refusal was not altered.

An immutable credential-free image was built from those bytes. Its actual offline --version witness returned codex-cli 0.166.0-alpha.5.1, and an in-image digest check matched the verified executable. native-version-receipt.json records the image identity. No native reasoning request was issued. The acquisition/build scripts are preserved as the exact engineering prototypes used, with their repository-relative staging layout. The build context admitted only the Dockerfile and verified executable. No binary, credential or protected source is included in GitHub.

## Enforced capability and measured limits

The actual Docker-backed supervisor admits only two pinned engineering image identities and a fixed JSON protocol. It creates separate non-root workers with no host bind mounts, network none, read-only root, dropped Linux capabilities, no-new-privileges, default seccomp, isolated IPC, 32-process limit, one CPU and 128 MiB memory. A 16 MiB noexec/nosuid/nodev temporary scratch mount is the sole writable workspace. Each request has one attempt, a 30-second process timeout, an 8192-byte input ceiling and a bounded output buffer. No host credential, instruction, skill, MCP configuration or Docker socket is mounted. Container policy is inspected before worker start. Created workers are removed after execution.

The final real enforcement run passed 3/3 tests. The filesystem probe received EROFS on a root write; outbound TEST-NET TCP received ENETUNREACH; scratch worked; capabilities were zero; NoNewPrivs was 1; seccomp was 2; UID was 65534; ambient credential environment, host mount and Codex-home probes were absent. Two separate workers produced identical exact-integer add/subtract/multiply/gcd results, including an integer above JavaScript's safe-number range. Both used the same worker and image identity. These labels exercise prospective arm parity only; neither experimental reasoning treatment was run.

The arithmetic service implements four exact BigInt operations, at most eight operations per request with at most 512 digits per operand and zero numerical tolerance. Amari must decide whether this finite operation set is scientifically adequate or which additional pinned capabilities are required. It is not yet the approved complete Flight kernel service. This fixed offline worker protocol has no model/tool/delegation request surface. The same enforcement has not been attested for a future autonomous Codex session, which would require its own instruction/tool/credential and process restrictions.

## Single immediate external action

The operator-controlled credential/security custodian must approve and supply the isolated subscription credential bridge and exact provider-only egress policy, including account/privacy acceptance. The currently verified network-none boundary intentionally has no provider connectivity or credentials. Broad network access or copying an ambient credential store is not supplied as a fallback. After this authorized capability is available, the runtime provisioner can extend the real supervisor to the accepted spawnNative and captureService interfaces and independently witness that restricted path. No six-function runtime is claimed provisioned while those services, quota evidence and tokenizer controls remain absent.

## Remaining custody and account requirements

Host ChatGPT login and the local catalog remain the available non-inferential account/model evidence. Sol xhigh remains proposed for both reasoning treatments. Effective served revision, provider retention, exact context/output/reasoning limits, quota consumption and credential isolation remain unverified. The Linux binary/platform image adds a new observed execution binding requiring independent acceptance; equal CLI version does not attest identical provider treatment.

The existing exact Stage 2 configuration/custody interface is recorded at https://github.com/tauric-diana-613/TD613-TCP/pull/1621#issuecomment-6564324624 . Astra max remains a proposal for an independently controlled evaluator. Actual model/effort approval, independent credentials and roots, semantic masking, complete candidates, proof/counterexample review and finite recoverable accounting must come from that principal. No evaluator was created or invoked. Stage 2 remains within Flight, before the separately commissioned Claude Opus 5.5 High Postflight program.

A separately controlled custodian must still authorize initial protected hashing, issue/consume admission-only permission, retain private manifest escrow and authorize future genuine physical re-admission. A distinct frozen inference grant is required afterward. The existing admission-only code and external authority requirements are preserved. No actual protected archive was designated, searched, read, hashed or unpacked.

Subscription-only and zero additional paid-API authority remain proposed. Finite episode/window attempts, reservations, total accounted authority, retry policy, effective input/output/tokenizer controls and separate evaluator allocation still require account evidence and prospective operator decisions. Resource-amendment adoption and all D01–D20 decisions remain external human authority. Earlier token-capacity work was not rerun.

After actual credential/egress and complete runtime acceptance, a separately authorized minimal live witness can use at most one invented-input terminal request in each isolated reasoning environment, matched Sol xhigh, no retries or fallback. It must retain actual final-file bytes, complete JSONL, terminal status, executable/configuration identities, usage availability and authenticated checkpoints. Installed --version evidence does not close final-file designation/newline/write-timing uncertainty. No live model witness was performed or authorized here.

## Review and disposition

New supervisor, deterministic tests, image recipe and acquisition/witness prototypes require independent review. manifest.json binds their exact bytes and records successful and failed operations. boundary-native-result.tap is the final actual-enforcement receipt. Existing synthetic Flight qualification and source-free implementation CI were not rerun or promoted into operational proof. No CI result is claimed for this new operational package.

This conversation remains active under the operator's protected Flight readiness condition. No retirement recommendation follows from this partial provisioning progress. ZIP SEALED. Gate F HELD. Human closure RESERVED. Tauric Diana · Khona‌lit-po · Sealed ⟐
