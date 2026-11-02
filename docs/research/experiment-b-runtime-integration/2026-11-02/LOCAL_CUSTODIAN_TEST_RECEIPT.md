# Local custodian source-free test receipt

Base for publication: e471ce97f1036aa0845a287227e5c34947890a98 (PR #1628).
This receipt describes the file bytes in the accompanying artifact digest manifest;
the publication commit and exact-head CI are recorded on the Draft PR.
The development worktree has an older Git base with accepted PR #1628 source
overlays; it is NOT represented as already checked out at the publication commit.
Only the explicit new/changed file set is applied on top of the verified PR #1628
commit. The original clone/branch and pre-existing worktree changes were untouched.

## Completed observations

| Run | Runtime | Result | Receipt |
| --- | --- | --- | --- |
| Relevant combined source-free suites, including new custody tests | Windows Node v26.7.0 | 89 tests: 85 PASS, 0 FAIL, 4 SKIP | LOCAL_CUSTODIAN_COMBINED.tap |
| Directly affected existing native parser tests | Windows Node v26.7.0 | 4 tests: 4 PASS, 0 FAIL | LOCAL_CUSTODIAN_PARSER.tap |
| Existing dependency-closed offline Linux suites | Node v24.4.0 in pinned image, no network/credentials | 55 tests: 55 PASS, 0 FAIL | LOCAL_CUSTODIAN_LINUX.tap |
| Human-only PowerShell scripts: parser only, no execution | PowerShell 7.6.5 | 8 scripts parsed, no syntax errors | command below |

Combined command:

    node --test --test-concurrency=1 tests/experiment-b-resumable.test.mjs tests/experiment-b-final-integration.test.mjs tests/experiment-b-private-account-receipt.test.mjs tests/experiment-b-runtime-integration.test.mjs tests/experiment-b-safe-harbor-bridge.test.mjs tests/experiment-b-custodian.test.mjs scripts/experiment-b-operational/provider-egress/tls-client-hello.test.mjs

Parser command:

    node --test --test-name-pattern='B-CODEX-0[1237]' tests/test-experiment-b-codex-integration.test.mjs

Offline Linux command:

    node scripts/experiment-b-operational/run-source-free-linux-tests.mjs

Linux worker image:
sha256:3ab1d8a775153425c45ac8c6434c8717fae5866d9dc3e494dc7eb8550d71c75f.
Retained 30-file source closure:
d1c964c7d7c1f6b320ec1860462e308ffc03126fb035e37da3ad9b5445d66413.
The 55-test closure is the inherited runtime suite, not a claim that it includes
the new Windows production installation. Exact-head CI separately includes the
new SQLite custody tests on Linux.

PowerShell syntax check (no setup script invoked):

    Get-ChildItem scripts/experiment-b-operational/custodian/*.ps1 | ForEach-Object {
      $tokens=$null; $errors=$null
      [void][Management.Automation.Language.Parser]::ParseFile($_.FullName,[ref]$tokens,[ref]$errors)
      if($errors.Count){throw 'CUSTODIAN_SCRIPT_SYNTAX_FAILURE'}
    }

The 21 new custody cases include 18 completed tests and 3 explicitly pending
installation tests on this Windows run. The actual named-pipe test contains three
subchecks: successful synthetic metadata exchange, wrong server-owner refusal and
wrong actual caller refusal. Both test peers used the same test identity.
The Framework helper compiled with CUSTODY_SYSTEM_AUDIT; no real event-log operation
was performed. Host-level tool execution was necessary for named-pipe visibility;
the initial sandbox WAIT_PIPE error 2 is preserved as a failed diagnostic in
LOCAL_CUSTODIAN_BOOTSTRAP.md, with no claim it established isolation.

## Explicit skips and non-observations

Three new tests are PENDING_REAL_INSTALLATION: distinct-account key storage
denial; production event-log access/no-clear/retention; engineering Docker canary
denial. The fourth combined skip is the inherited symlink-parent fixture because
symlink creation was unavailable. These are not passes. On Linux, the Windows-only
pipe test additionally skips; on an administrator Windows runner its positive
transport witness also skips rather than asserting a standard-account success.

No installer, installation acceptance, key initializer, human mandate action or
production service was executed. No real signing root was generated or inspected.
All cryptographic test roots are public, explicitly synthetic fixture constants.
No account creation, privilege elevation, ACL modification or real custody-log
creation was performed. Test processes exercised their actual SQLite and
named-pipe mechanisms with invented metadata; they did not dispatch a model.

Existing archive tests use invented ZIP fixtures only. The observed commands
performed zero protected Em archive operations, zero provider inference, zero
paid API calls and zero evaluator calls. This is a statement about these observed
operations, not a forensic claim about unrelated activity elsewhere.

New exact-head CI has two jobs: Ubuntu integration/parser regressions and Windows
custody/syntax regressions. Neither runs installation or key generation. Its actual
completed state and any skipped checks must be read from the Draft PR's final HEAD;
local pass counts are not substituted for CI.

Gate F HELD. No live installation or execution authority. ⟐
