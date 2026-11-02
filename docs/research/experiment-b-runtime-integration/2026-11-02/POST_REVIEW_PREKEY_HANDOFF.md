# PR #1629 reconciliation and human-only PRE-KEY handoff

SOURCE-FREE CORRECTION CANDIDATE. NO INSTALLATION OR KEY ACTIVATION PERFORMED.

Reviewed base: 7a24e55818e7ae8938d3d1f5fee80f22fa6466c1.
[Emergence HQ review 5741604976](https://github.com/tauric-diana-613/TD613-TCP/pull/1629#pullrequestreview-5741604976)
accepts source-free software with explicit assurance ceilings; real custody and
Flight remain HELD. The complete review, implementation diff and
LOCAL_CUSTODIAN_BOOTSTRAP.md were inspected. This successor preserves that
document, its original receipts and PR #1619–#1629 history.

## Synchronization actually observed

git fetch origin --prune completed with exit 0 in the authorized review repository.
Origin identifies tauric-diana-613/TD613-TCP.

| Ref | Exact SHA | Relationship after fetch |
| --- | --- | --- |
| origin/main | 50cc9d161f8f72c2d4b6ea33ece17ace88f35eff | Ancestor of all refs below |
| Existing local td613-native-observability-review | 29cdad5d1b83311799902c0ce3d79be8103d8760 | 22 ahead / 0 behind main; no configured upstream |
| PR #1628 remote head | e471ce97f1036aa0845a287227e5c34947890a98 | 3 commits after existing local HEAD |
| PR #1629 remote/reviewed head | 7a24e55818e7ae8938d3d1f5fee80f22fa6466c1 | 1 after #1628; 4 after existing local HEAD; 26 ahead / 0 behind main |

There are no main-only commits to merge into this lineage. Neither reviewed PR
head drifted. Main lacks the unmerged Experiment B lineage; absence there is not
an upstream deletion. No merge, rebase, reset, cherry-pick or main advancement was
performed. Wendbine #1630 and PR #1134 were not inspected or included.

The existing development worktree contains accepted source overlays and new
custody artifacts and was preserved. A new clean detached worktree was created
at the reviewed #1629 SHA, then a separate correction branch was created there.
Its inherited sparse checkout omitted public documentation/harness/CI files;
only those reviewed tracked files were materialized in this new worktree.
The separately designated original clone remained inaccessible to the ordinary
read-only check and was not modified; its current branch/change count is not
re-attested by this commission. No access-repair or ACL bypass was attempted.
Synchronization for review is complete; installation must use a clean checkout
of the independently accepted final correction commit, not the dirty development
overlay or main. No branch switch in the original clone is needed.

## Reproduced defects and minimal corrections

1. Terminal and lookup IPC validated the request's mandate/episode but did not
   bind the selected permit row to that mandate. Using two synthetic approved
   mandates, a terminal request under the other episode returned OK and changed
   the first permit from CONSUMED_UNCERTAIN to TERMINAL_RECORDED. Thus one
   mandate could clear another mandate's pending bookkeeping without exercising
   that permit's own scope. Same-episode distinct mandates were also affected.
   The IPC now passes the owning mandate into lookup/terminal storage. The
   terminal transaction rechecks active mandate and row ownership before any
   state transition; wrong scope produces PERMIT_MANDATE_SCOPE_HOLD.
2. Terminal IPC accepted undeclared payload/evidence fields. Extra evidence was
   serialized into the audit record, contrary to the metadata-only contract.
   It now requires exactly attempt/evidence and the three declared digest fields.
   Storage independently rejects extra evidence fields. Refusal retains only
   the request digest, never an undeclared body.

Five new regressions cover both episode relationships, scoped lookup, in-transaction
revocation and undeclared payload/evidence. The original code failed the three
scope cases and two grammar cases. Corrected code passes all five, including
correct-owning-mandate positive completion. Test roots and bodies are explicitly
synthetic. Existing tests continue exercising accepted-final reconciliation,
replay, concurrency, restart, rollback and lost acknowledgement.

Unscoped in-process storage diagnostics remain trusted internal operations; every
IPC lookup and terminal path supplies the authenticated mandate. Possession of
the custodian signing root already implies trusted custodian code, not a child
interface. No approval or arbitrary signing IPC was introduced.

The workflow filter adds this PR's base branch so exact-head CI actually runs.
No scientific conditions, grant purposes, native transport or capture semantics
changed. This correction needs its own independent acceptance.

## Assurance reconciliation

| Topic | Source-level result | Real-world acceptance still required |
| --- | --- | --- |
| Terminal records | Controller-submitted authenticated bookkeeping only; hash-shaped data cannot prove execution | Pinned trusted controller and original independently accepted capture boundary; any stronger terminal-source witness must be separately required/accepted |
| Identity/key boundary | Three standard roles, private issuer storage, no issuer secret in IPC | Actual distinct tokens/sessions; denial through every engineering/controller/child/broker/Docker route |
| Controller integrity | Installer protects service code; full controller protection is separately required | Immutable complete controller/runtime/configuration and confined credentials, not an engineering-writable clone |
| IPC | Kernel pipe-owner SID, actual caller token, local-only ACL, request correlation; corrected permit ownership | Actual distinct-SID success and engineering denial |
| Audit/anchors | FULL SQLite, fsynced append log, system-log floor; disagreement HOLDs | Real log permissions, no-clear/no-overwrite, capacity and installed hashes |
| Liveness/recovery | Listener accept is unbounded; startup audit verification/log scanning grows with retained history | Observe finite workload latency and stop/recovery in a separate non-sensitive sandbox; no automatic retries or safety relaxation |
| Restart/replay/rollback | Synthetic tests use real SQLite transactions and retained state; uncertain calls stay HOLD | Real installation and externally retained OS floor, never coordinated administrator rollback resistance |

No evidence of a deployed compromise is asserted. No independent provider/artifact
attestation was added. An engineering principal with administrator-equivalent host
or custodian-session access invalidates this local custody boundary. HOLD that
installation and use a separately administered boundary; do not adjust ACLs to
make an unsafe configuration appear accepted.

## Executable human administrator sequence — STOP BEFORE KEYS

Only the separately acting human administrator performs this section, after
independent acceptance of the correction. All variables and filled worksheets
stay in that administrator's private console. Never paste credentials or private
configuration into chat/GitHub. These commands have not been executed here.

1. Select three distinct standard accounts. The two new proposed role names below
   are examples, not existing identities. Create them only if genuinely needed,
   using secure Windows password prompts:

       New-LocalUser -Name 'TD613Custodian' -Password (Read-Host 'Custodian password' -AsSecureString) | Out-Null
       New-LocalUser -Name 'TD613Controller' -Password (Read-Host 'Controller password' -AsSecureString) | Out-Null
       $users=(Get-LocalGroup -SID 'S-1-5-32-545').Name
       Add-LocalGroupMember -Group $users -Member 'TD613Custodian','TD613Controller'

   Select the actual standard engineering account separately. If the app or ANY
   available engineering broker can administer this host, STOP/HOLD. Do not hand
   administrator credentials to the agent. Use separate logon sessions/desktops;
   do not open the custodian console inside an engineering-controlled desktop.

2. In a NEW clean checkout of the accepted correction commit, verify HEAD and
   clean status. Fill the existing CUSTODIAN_SETUP_INPUT_PROPOSED.json privately:
   three account names, fresh destination, exact reviewedCommit, approved shared
   PowerShell/Node executables and finite auditLogMaximumKB. Its 65,536 KiB default
   is a storage proposal, not a full-study capacity attestation. No password/key
   field exists. Verify the new reconciliation DIGESTS.json file entries with
   Get-FileHash -Algorithm SHA256; verify its complete serviceSourceClosure too.
   The final commit/manifest on the correction PR supplies the review identity.

       $worksheet=Read-Host 'Private completed setup worksheet'
       & ./scripts/experiment-b-operational/custodian/Setup-Custodian.ps1 -InputFile $worksheet
       if($LASTEXITCODE -ne 0){throw 'HOLD_PREKEY_LAYOUT'}

   Expected result: LAYOUT_PREPARED_NOT_ACTIVATED. Installation copies reviewed
   source, pins the supplied Node/PowerShell identities, compiles the Framework
   client, sets protected layout and creates a fresh system log plus synthetic
   canary. Existing destination/log is refused. It creates no accounts, keys,
   task, permit or grant. Partial failure HOLDs; do not delete/reset and retry.
   The administrator records installed dependency hashes privately.

3. As administrator, load the installed configuration into private variable $c.
   Confirm keyFile, checkpointKeyFile, database and issuerRecord do not exist.
   Test-Path errors are HOLD, not evidence of absence. Record that this is a
   pre-key, pre-authority installation. Inspect the actual protected ACLs and
   complete deployed controller dependencies. Installer source closure alone
   does not install/protect the full Flight controller or its credentials.

4. In EACH standard engineering/controller session and protected child boundary,
   run the existing Test-InstalledIsolation.ps1 against the installed
   isolation-canary.txt. Supply ProtectedCodeFiles covering service/controller
   code, configuration, adapter and execution-launch dependencies. The engineering
   session uses the reviewed source copy because it cannot read protected code.
   Also run CheckDocker with an approved pinned image wherever engineering has
   that capability:

       & ./scripts/experiment-b-operational/custodian/Test-InstalledIsolation.ps1 -CanaryFile $canary -ProtectedCodeFiles $protectedFiles -CheckDocker -PinnedImage $approvedImage

   Use the equivalent installed script in the controller session. Omit CheckDocker
   only when that route is genuinely unavailable and document why. Repeat through
   every broker/elevated route; do not count an elevated route as safely denied
   merely because this standard-account script refuses to run there. Such access
   itself requires HOLD until the execution boundary is independently resolved.
   PASS requires actual canary denial and code-write denial. Missing paths,
   unsupported probes or timeouts are INCONCLUSIVE/HOLD. Any readable canary or
   writable protected dependency is FAIL.

5. Actual distinct-account pipe tests use Test-DistinctPeer.ps1 from the installed
   bundle in the custodian/controller sessions:

       & $peerScript -Role Listen -Configuration $configuration
       & $peerScript -Role Controller -Configuration $configuration

   Run the first command as custodian and the second as controller while the
   listener is ready. Both must PASS. Start Listen again, then from engineering's
   reviewed source copy run:

       & ./scripts/experiment-b-operational/custodian/Test-DistinctPeer.ps1 -Role Engineering -PipeName $pipeName -CustodianSid $custodianSid -ControllerSid $controllerSid -EngineeringSid $engineeringSid

   Actual access denial is PASS. Timeout/no listener is INCONCLUSIVE/HOLD.
   Unexpected successful access is FAIL. Stop the synthetic listener afterward.
   These scripts never load keys.

6. Audit-log verification is also PRE-KEY ONLY. In the administrator console,
   inspect actual CustomSD under the TD613Custody event-log registry key and
   compare it to the installer's exact proposed SDDL: custodian read/write
   without clear, controller read only, engineering no rights, legitimate
   SYSTEM/admin recovery. Log-specific masks are read=1, write=2, clear=4.
   Inspect real policy/capacity:

       $log=[Diagnostics.EventLog]::new('TD613Custody')
       $log.OverflowAction
       $log.MaximumKilobytes
       $log.Dispose()

   Require DoNotOverwrite and the reviewed finite capacity. Do not infer actual
   rights from the proposed installer text. Use the following private-console
   helper to classify actual denial; unexpected exceptions stay HOLD:

       function Test-RequiredDenial([scriptblock]$Action) {
         try { & $Action | Out-Null; 'FAIL_UNEXPECTED_ACCESS' }
         catch {
           $e=$_.Exception.GetBaseException()
           if($e -is [UnauthorizedAccessException] -or $e -is [Security.SecurityException] -or
             ($e -is [ComponentModel.Win32Exception] -and $e.NativeErrorCode -eq 5)) {'PASS_ACTUAL_DENIAL'}
           else {'HOLD_INCONCLUSIVE'}
         }
       }

   Administrator must first confirm the log is empty or contains ONLY synthetic
   entries prefixed TD613_PREKEY_AUDIT_ONLY, and that no key/ledger/issuer exists.
   If any genuine anchor or other record exists, STOP: never test Clear against
   a live custody log. Under that pre-key-only condition, actual role tests are:

       $log=[Diagnostics.EventLog]::new('TD613Custody')
       $marker='TD613_PREKEY_AUDIT_ONLY '+[Guid]::NewGuid().ToString('N')
       $write={ [Diagnostics.EventLog]::WriteEntry('TD613Custody',$marker,[Diagnostics.EventLogEntryType]::Information,613) }
       $read={ $log.Entries.Count }
       $clear={ $log.Clear() }

   Custodian: read and write must succeed; Test-RequiredDenial $clear must PASS.
   Controller: read must succeed; Test-RequiredDenial $write and $clear must PASS.
   Engineering: Test-RequiredDenial $read, $write and $clear must all PASS.
   Dispose $log in each session. An unexpectedly allowed Clear is FAIL and may
   erase only this explicitly empty/synthetic pre-key test log; it prevents
   acceptance. Never repair the result by deleting receipts or enabling overwrite.
   Any incomplete role probe leaves installation HELD. Filling a real log is
   prohibited; capacity stress/recovery, if required, belongs to a separate
   disposable non-sensitive sandbox.

7. Save private receipts covering every route, actual executable/source hashes
   and the review reference. Independently reconcile any FAIL/HOLD. The six
   fields expected by Accept-Installation.ps1 must describe real observations;
   setting them true is not evidence. Export only redacted outcome/hash receipts.
   STOP HERE. No Initialize, Approve, Bind, production service start, scheduled
   task activation, model connection or protected source operation is authorized
   by this commission. A later human installation-acceptance/key-activation
   decision remains separate.

Outcomes: PASS is a completed bounded check; FAIL is demonstrated unsafe access
or wrong behavior; INCONCLUSIVE is an unavailable/ambiguous probe; HOLD is the
operational result of any missing, failed or inconclusive prerequisite. A collection
of PASS results still requires real independent installation acceptance.

## Evidence and remaining authorities

Actual local verification, Node v26.7.0 / PowerShell 7.6.5:

| Run | Actual outcome |
| --- | --- |
| Scope cases before repair | 3 tests, 0 PASS, 3 FAIL (expected RED) |
| Undeclared-data cases before grammar repair | 2 tests, 0 PASS, 2 FAIL (expected RED) |
| Focused final correction tests | 5/5 PASS |
| Full relevant final source-free set | 94 tests, 90 PASS, 0 FAIL, 4 SKIP |
| Directly affected existing parser tests | 4/4 PASS |
| Existing human-only PowerShell scripts, parse only | 8/8 syntax checks PASS |
| Current ordinary command token | Not administrator; not Administrators-group member |

The four local skips are three production-installation witnesses and an inherited
symlink fixture unavailable on this host. They are not passes. The existing actual
Windows synthetic transport test passed under one test identity; this is not
distinct-role evidence. No installer, audit-log test, real authority service,
account creation or key activation was executed here.

Commands:

    node --test --test-name-pattern='terminal IPC cannot|lookup refuses another|terminal IPC refuses undeclared' tests/experiment-b-custodian.test.mjs
    node --test --test-concurrency=1 tests/experiment-b-resumable.test.mjs tests/experiment-b-final-integration.test.mjs tests/experiment-b-private-account-receipt.test.mjs tests/experiment-b-runtime-integration.test.mjs tests/experiment-b-safe-harbor-bridge.test.mjs tests/experiment-b-custodian.test.mjs scripts/experiment-b-operational/provider-egress/tls-client-hello.test.mjs
    node --test --test-name-pattern='B-CODEX-0[1237]' tests/test-experiment-b-codex-integration.test.mjs

See custodian-reconciliation/ for retained sanitized RED/GREEN/full/parser logs
and source/artifact digests. Exact final commit and CI live on the correction PR.
No model-mediated delegated operation occurred: no subagent, model substitution,
child request, provider/API call or evaluator invocation. The supervising
interface's configured/served model is not independently attested by this source
review; the operator's requested model/effort is not promoted into provider proof.

Privacy/source disclosure, initial admission-only hashing/escrow, authenticated
physical re-admission, complete private schedule, cumulative finite subscription
authority, independent Astra evaluator credentials/roots/budget and D20 protected
inference grants remain separate and unissued.

Smallest next lawful step: Amari reviews the narrowly reproduced correction;
after its acceptance, the separately acting human administrator may decide to
perform the PRE-KEY layout and probes above. This document is not that human
gesture and authorizes no installation.

Tauric Diana · Khona‌lit-po · Gate F HELD · ZIP SEALED · Human closure RESERVED. ⟐
