# Prospective local Experiment B custodian — independent review candidate

SOURCE-FREE SOFTWARE ONLY. NOT INSTALLED. NO PRODUCTION KEY, MANDATE OR FLIGHT GRANT ISSUED.

Base: PR #1628, exact commit e471ce97f1036aa0845a287227e5c34947890a98.
Independent inventory closure: [Amari's adjudication](https://github.com/tauric-diana-613/TD613-TCP/pull/1628#issuecomment-6582344142).
The complete PR #1619–#1628 lineage and historical receipts remain unchanged.
New code requires its own exact-diff independent acceptance.

Human authorization holder: Tawanna C. Miller. Non-human namespace principal:
tauric.diana.613. Heritage key: Tauric Diana. Covenant key: Khona‌lit-po
(interior U+200C). Canonical covenant: Tauric Diana — Crimean heritage custodianship;
display covenant: Blood Rite 613. PUA: U+10D613, UTF-16 \uDBF5\uDE13;
ingress display: 𝌋 (U+1D30B); binding #9B07D8B;
SHI TD613-SH-9B07D8B-78C5B2F3; SAC[X6ZNK5NO51].
These public identifiers select provenance and scope, never prove key possession.

## Selected implementation

Use three distinct standard Windows accounts: custodian, protected runtime
controller and engineering. None may be an Administrators-group member, including
a filtered UAC token. A separate interactive logon session/desktop holds the
custodian's human console. Do not expose that console, password entry or session
to engineering automation. The eventual background service runs as the standard
custodian through a human-configured Task Scheduler task, without highest privileges.
This is a task-hosted user-mode service, not an SCM service executable.

The administrator installs a fresh protected layout. Reviewed code and service
configuration are administrator-writable only. The custodian alone, plus legitimate
SYSTEM/admin recovery, can access issuer storage, SQLite ledger and fsynced audit
file. The controller can read its adapter and separate checkpoint authentication
key; it cannot read the HS256 issuer root. A controller-only writable runtime-state
directory is separate from those read-only files. The child receives neither.
No existing production Loom custodian is changed.

The installer packages the service's complete reviewed static JavaScript import
closure, its PowerShell/C# sources and a copied Node executable. It compiles the
pipe client and records installed file hashes; PowerShell executable identity is
also pinned. The full accepted Flight controller/runtime deployment must separately
be immutable to engineering. Installing only this custody bundle does NOT protect
a controller launched from an engineering-writable checkout. That additional code,
credential and execution boundary is required installation evidence.

The signed permit producer and accepted HS256 verifier both execute inside the
custodian Node worker. No symmetric issuer secret enters the controller, child,
repository, IPC request, environment override or image. The existing accepted
safe-harbor-dispatch-bridge supplies exact namespace, lane, issuer, purpose,
audience, episode, experiment, plan, manifest, policy and dispatch checks.
The new issuer prefix is td613.experiment-b.custodian.v1.; its new key ID has
prospective Experiment B authority only and no historical authority.

The named pipe authenticates the caller's actual Windows token and the kernel
pipe object's owner SID. It uses an explicit ACL, first-instance creation, local
clients only and identification-level client impersonation. Controller access uses
individual rights excluding FILE_CREATE_PIPE_INSTANCE. There is no arbitrary
signing, key retrieval, shell, file, mandate-approval or revocation IPC endpoint.
Frames and replies are bounded to 65,536 bytes, with exact request-ID correlation,
finite I/O timeouts and zero automatic retries.

Windows mechanisms: [named-pipe security](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights),
[kernel security-owner queries](https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getsecurityinfo).
These documents establish API behavior, not this machine's future installation.

## Actual permit and checkpoint semantics

The human custody-account console must approve a finite mandate binding a real
authorization-evidence digest, complete accepted context, expiry, permit lifetime,
exact allowed attempt IDs, executable digest, runtime-policy digest and worker
image. Possessing a key or submitting JSON does not itself approve a mandate.
The console is an OS-controlled human workflow, not a fabricated human signature.

prepare-mandate.mjs derives the entire allowed-attempt list from an already frozen,
lawfully instantiated private plan: every lane, every baseline/document/synthesis
turn and both reasoning arms, attempt-1 only. Its count is
A = 2 × sum_l(2 n_l + 2). No actual corpus membership or numerical A is created here.
This dispatch count is not an evaluator budget, token measurement or entitlement.

SQLite FULL/WAL transactions and unique attempt/dispatch constraints retain permit
state across processes and restarts. Consumption records CONSUMED_UNCERTAIN before
permission is acknowledged. Any ISSUED or CONSUMED_UNCERTAIN permit blocks later
dispatches. Expiry and revocation are checked again inside the consumption
transaction. Replay, competing duplicates, exhausted authority, clock reversal and
scope drift refuse. A crash or lost acknowledgement never authorizes redispatch.
Terminal bookkeeping records only exact capture/journal commitments; the service
does not independently attest provider identity or final-file semantics.

The controller's existing authenticated journal retains complete accepted output
and capture evidence. Its new optional checkpointCustody hook publishes each
committed journal event to the custodian before further progress. A lost anchor
acknowledgement preserves the local event and blocks appends. Restart checks the
external minimum and exact head. If an already anchored TURN_ACCEPTED only lacks
terminal bookkeeping, the adapter resends its retained commitments, never the
model turn. Other disagreement stays HOLD for reviewed recovery.

The custodian audit chain is HMAC-authenticated; a separate append log is fsynced
while the SQLite write lock remains held. Production additionally requires a
separately OS-controlled Windows event-log minimum containing only authenticated
audit-head metadata. A crash between file, OS-log and DB commits produces
detectable divergence and HOLD, not optimistic transaction replay.

The installer proposes a fresh dedicated TD613Custody system log with bounded
capacity and DoNotOverwrite. Custodian gets read/write, no clear; controller read;
engineering/children no rights. SYSTEM/admin remain recovery authorities.
Filling the log HOLDs rather than discarding anchors. The initial 65,536 KiB
installation value is a reviewable storage choice, not a verified full-study
capacity guarantee. Actual rights, retention, access and standard-account writing
are PENDING_REAL_INSTALLATION.
[Windows event-log access rights](https://learn.microsoft.com/en-us/windows/win32/eventlog/event-logging-security)
distinguish read, write and clear. Administrator rollback or total host compromise
is outside this local boundary. No local design protects a root from an engineering
principal that can read it through administrator, broker or Docker authority.

The new TD613_LOCAL_CUSTODIAN_V1 Flight profile requires external private
configuration/roots/key files and custodianCheckpointRequired=true. Its
checkpointAuthority module is the same installed private adapter that exports
authorizeAndConsume; a pinned module digest and real independent acceptance are
required. A digest-shaped acceptance field does not manufacture that acceptance.
Legacy Flight operation remains unchanged when the new profile is not selected.
Protected flags, archive grants and execution-grant verification remain intact.

## Source-free evidence and limits

See LOCAL_CUSTODIAN_TEST_RECEIPT.md and CUSTODIAN_ARTIFACT_DIGESTS.json for exact
commands, file identities, actual outcomes and skipped installation tests.
All test signing roots are explicitly public synthetic fixtures. No real-key
activation function, privileged installer or human grant action was executed.

Actual local Windows transport tests exercised a successful metadata exchange,
wrong expected server-owner rejection and wrong actual caller rejection. Both
positive peers used the same ordinary test identity; this is NOT evidence for
separate-account custody. Framework client compilation includes the production
event-log helper, without executing that helper against a real custody log.

An initial sandboxed pipe lookup returned WAIT_PIPE/native error 2. Running the
authorized transport test in the host tool boundary succeeded without changing
pipe ACLs. Other closed source-only development failures were a relative compiler
input, Core/Framework EventLog compilation differences and a test script inheriting
the expected negative client's exit status. The corrected code uses absolute
compiler input, conditional Framework audit compilation and explicit test exit.
These failures are not replaced by claims of earlier success.

PENDING_REAL_INSTALLATION:

- Three actual distinct-account tokens, key-canary denial from controller,
  protected child and EVERY engineering execution route, including any elevated
  broker and Docker host-file access.
- Protected controller code/configuration, first-party credentials and runtime
  state; no custodian interactive desktop exposed to engineering automation.
- Actual distinct-account pipe authentication and engineering ACL refusal.
- Dedicated system-log write/no-clear access and non-overwrite retention; protected
  acceptance record and complete installed dependency identities.
- Human-approved activation, actual issuer registration and finite mandate.

The currently observed command token is non-administrator; this observation says
nothing about a separate app/broker execution route. If any engineering route has
administrator-equivalent access, production acceptance must HOLD until that access
is absent from the execution environment or custody moves to a separately
administered host. Asymmetric signatures alone cannot hide a private signer on an
administrator-controlled host. A future EdDSA adapter would require separate
review; PR #1628 does not implement it.

## One human-only installation and activation procedure

Execute only AFTER independent approval of this exact software revision. The
engineering agent must not perform these steps or handle their credentials.

1. The human machine administrator selects/creates separate standard custodian
   and controller accounts and identifies all engineering execution identities.
   Use separate logon sessions/desktops. Review host/Docker/broker privileges
   before creating any secret. Prepare a clean checkout at the independently
   accepted implementation commit, preserving existing development changes.
2. Copy CUSTODIAN_SETUP_INPUT_PROPOSED.json to a private operator worksheet.
   Fill the three account names, fresh installation destination, reviewed commit
   and approved shared PowerShell/Node executables. There are no password or
   signing-key fields. Run Setup-Custodian.ps1 -InputFile <private worksheet> from
   the clean reviewed source in a human administrator console. It creates layout,
   compiled client, synthetic canary and dedicated log, but NO KEY or grant.
   Existing destinations/logs are refused; failure is not authority to delete or
   reset a ledger. The installer does not create accounts or accept credentials.
3. Before key creation, independently run Test-InstalledIsolation.ps1 as the real
   engineering and controller accounts against isolation-canary.txt, including
   ProtectedCodeFiles for the complete deployed controller/service and CheckDocker
   with an approved pinned image wherever engineering has Docker access. Repeat
   from every other available engineering execution route. Missing paths,
   timeouts and inconclusive results are not denials. Any readable canary or
   writable protected code prevents acceptance.
4. Use Test-DistinctPeer.ps1 in the installed protected bundle: Listen with
   Configuration in the custodian's own session, Controller with Configuration
   in the controller session. Repeat Listen, then Engineering from its reviewed
   source with the four explicit metadata parameters PipeName, CustodianSid,
   ControllerSid and EngineeringSid. Export no account identifiers in the review
   receipt. The engineering case must receive actual UnauthorizedAccessException;
   timeout is inconclusive. Stop the synthetic listener afterward. No key loads.
   Independently verify actual system-log write/read/no-clear permissions and
   non-overwrite policy before acceptance. Do not clear/fill a live anchor log as
   a test. These privileged installation witnesses have not been performed here.
5. Assemble real private installation evidence with the six acceptance fields
   documented in Accept-Installation.ps1, plus the real independent review
   reference. The human administrator runs Accept-Installation.ps1 with
   Configuration and EvidenceFile and reviews the exact digest before confirming.
   This writes an administrator-controlled installation decision. Its Boolean
   fields are human assertions requiring actual evidence, not machine attestation
   or an evaluator signature. No key is created by this step.
6. Switch to the custodian's separate non-administrator interactive session.
   Run Activate-Custodian.ps1 -Configuration <installed config> -Action Initialize
   and confirm its exact initialization phrase. This separately authorized HUMAN
   action generates the new issuer root and different checkpoint key inside the
   protected boundary. It creates no experimental mandate or source consent.
   Partial initialization HOLDs; do not erase state or automatically retry.
7. The human uses Windows Task Scheduler to run the installed
   Start-Custodian.ps1 with Configuration as the standard custodian, whether or not
   logged on, WITHOUT highest privileges. Enter OS-required credentials only in
   the official Windows UI. Do not place passwords in commands or worksheets.
   Confirm a real non-sensitive synthetic installation permit before any Flight
   mandate, under its own explicit synthetic context, never a protected episode.
8. Later, only after the separate privacy/custody decisions and lawful private
   inventory, freeze the full plan and derive its finite mandate. The human
   custody console reviews and explicitly Approves the exact private input,
   then Binds that mandate to the read-only private client adapter. Real
   execution-grant authorities must independently accept the complete installed
   controller, adapter dependency closure and runtime/plan/policy bindings.
   Register only the new purpose-specific issuer/key ID. Do not export the root.
   No automatic expiry extension, key rotation, ledger reset or mandate expansion
   is permitted. Future rotation/recovery requires review preserving old IDs,
   revocations, consumed attempts and external anchors.

Export only non-secret installation/test receipts and installed dependency hashes
for review. Do not publish the filled worksheet, service configuration, account
metadata, authentication stores, key files, private plan or custody state.

The smallest next real-world action, after Amari's software review, is the human
administrator's separate-account, PRE-KEY layout installation in steps 1–2.
It must not be confused with a request for a protected ZIP.

## Authorities still separate

Scientific adoption D02/D03/D04 observational v1/D13/D17 is preserved. Full
four-arm scope, strong-union comparator, controls, seven dimensions and unrestricted
mathematical candidate generation are unchanged. The authentic archival baseline
remains separately required. This software does not strengthen hidden-provider
observability claims or authorize the conditional live witness.

Provider privacy/source-disclosure acceptance, admission-only authorization and
custodian-controlled initial hashing, manifest escrow, physical re-admission,
complete private schedule, cumulative subscription authority, independent Astra
Stage 2 model/credentials/roots/budget, final inference and D20 grants remain
unissued here. There was no provider call, paid API request, real archive operation,
signature issuance, merge, deployment or unblinding in this commission.
The future entrant registry is not a Flight prerequisite.

Gate F HELD. ZIP SEALED. Human closure RESERVED. ⟐
