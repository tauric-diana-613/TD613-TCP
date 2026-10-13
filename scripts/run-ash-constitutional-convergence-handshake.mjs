import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-constitutional-convergence';
const ceilingMs = Number.parseInt(process.env.TD613_CONVERGENCE_HANDSHAKE_CEILING_MS || '360000', 10);
if (!Number.isFinite(ceilingMs) || ceilingMs < 1000) {
  throw new Error('TD613 convergence handshake ceiling must be a finite duration of at least 1000ms.');
}

const workerPath = fileURLToPath(new URL('./run-ash-constitutional-convergence-handshake-worker.mjs', import.meta.url));
const wrapperPath = fileURLToPath(new URL('./run-ash-constitutional-convergence-probe.mjs', import.meta.url));
const finiteLockGuard = `if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.')) {
  throw new Error('Convergence observer bounded cross-tab join was not materialized.');
}`;
const wrapperWriteMarker = "await fs.mkdir(artifactDir, { recursive:true });";
const staleCloseTarget = "const closeTarget = `    await page.locator('#closeCase').click();`;";
const currentCloseTarget = "const closeTarget = `  await page.locator('#closeCase').click();`;";
const releaseDefinitionsStart = '\nconst releaseTarget = ';
const releaseDefinitionsEnd = "\n\nconst source = await fs.readFile(sourceUrl, 'utf8');";
const releaseArrayEntry = '  [releaseTarget, releaseReplacement]\n';
const sessionEpochAnchor = "allowedLocalKeys.add('td613.ash.cache-preflight.epoch');";
const sessionEpochAllowance = "allowedLocalKeys.add('td613.ash.session.epoch');";
const strictRebuildWait = `  const rebuildConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
  await rebuildConfirmation.waitFor({ state:'visible', timeout:45000 });
  await rebuildConfirmation.click();
  await page.waitForFunction(() => /"test_digest"/.test(document.getElementById('testReceipt')?.textContent || ''), null, { timeout:45000 });`;
const modeAwareRebuildWait = `  const rebuildConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
  let rebuildActionPath = 'DIRECT_RECEIPT';
  try {
    await rebuildConfirmation.waitFor({ state:'visible', timeout:5000 });
    await rebuildConfirmation.click();
    rebuildActionPath = 'AIA_CONFIRMED';
  } catch {}
  await page.waitForFunction(() => /"test_digest"/.test(document.getElementById('testReceipt')?.textContent || ''), null, { timeout:45000 });
  report.observations.rebuild_action = {
    presentation_route: new URL(keepUrl).searchParams.get('presentation') || 'child-legible',
    action_path: rebuildActionPath,
    receipt_observed: true
  };`;
const presentationAwareRebuildMarker = "report.observations.rebuild_transition = {";
const replacementLoopTarget = `for (const [target, replacement] of replacements) {
  if (!runtime.includes(target)) throw new Error(\`Ash convergence runtime target missing: \${target.slice(0, 80)}\`);
  runtime = runtime.replace(target, replacement);
}`;
const replacementLoopReplacement = `for (const [target, replacement] of replacements) {
  if (!runtime.includes(target)) throw new Error(\`Ash convergence runtime target missing: \${target.slice(0, 80)}\`);
  runtime = target === closeTarget ? runtime.split(target).join(replacement) : runtime.replace(target, replacement);
}`;

await fs.mkdir(artifactDir, { recursive:true });
let wrapperSource = await fs.readFile(wrapperPath, 'utf8');
let wrapperChanged = false;
let guardMaterialized = false;
let closeTargetNormalized = false;
let retiredReleaseTargetRemoved = false;
let closeReplacementWidened = false;
let sessionEpochAllowanceMaterialized = false;
let rebuildActionPathNormalized = false;

if (!wrapperSource.includes(finiteLockGuard)) {
  const markerIndex = wrapperSource.indexOf(wrapperWriteMarker);
  if (markerIndex < 0 || wrapperSource.indexOf(wrapperWriteMarker, markerIndex + wrapperWriteMarker.length) >= 0) {
    throw new Error('Convergence handshake preflight could not locate one wrapper write boundary.');
  }
  wrapperSource = wrapperSource.replace(wrapperWriteMarker, `${finiteLockGuard}\n\n${wrapperWriteMarker}`);
  wrapperChanged = true;
  guardMaterialized = true;
}

if (wrapperSource.includes(staleCloseTarget)) {
  wrapperSource = wrapperSource.replace(staleCloseTarget, currentCloseTarget);
  wrapperChanged = true;
  closeTargetNormalized = true;
}

const releaseStart = wrapperSource.indexOf(releaseDefinitionsStart);
if (releaseStart >= 0) {
  const releaseEnd = wrapperSource.indexOf(releaseDefinitionsEnd, releaseStart);
  if (releaseEnd < 0) throw new Error('Convergence handshake preflight could not bound the retired release-capsule definition.');
  wrapperSource = wrapperSource.slice(0, releaseStart) + wrapperSource.slice(releaseEnd);
  wrapperChanged = true;
  retiredReleaseTargetRemoved = true;
}
if (wrapperSource.includes(releaseArrayEntry)) {
  wrapperSource = wrapperSource.replace(releaseArrayEntry, '');
  wrapperChanged = true;
  retiredReleaseTargetRemoved = true;
}

if (!wrapperSource.includes(sessionEpochAllowance)) {
  const anchorIndex = wrapperSource.indexOf(sessionEpochAnchor);
  if (anchorIndex < 0 || wrapperSource.indexOf(sessionEpochAnchor, anchorIndex + sessionEpochAnchor.length) >= 0) {
    throw new Error('Convergence handshake preflight could not locate exactly one session-epoch allowlist anchor.');
  }
  wrapperSource = wrapperSource.replace(sessionEpochAnchor, `${sessionEpochAnchor}\n${sessionEpochAllowance}`);
  wrapperChanged = true;
  sessionEpochAllowanceMaterialized = true;
}

if (wrapperSource.includes(strictRebuildWait)) {
  wrapperSource = wrapperSource.replace(strictRebuildWait, modeAwareRebuildWait);
  wrapperChanged = true;
  rebuildActionPathNormalized = true;
}

if (wrapperSource.includes(replacementLoopTarget)) {
  wrapperSource = wrapperSource.replace(replacementLoopTarget, replacementLoopReplacement);
  wrapperChanged = true;
  closeReplacementWidened = true;
}

if (!wrapperSource.includes(currentCloseTarget)
  || wrapperSource.includes(staleCloseTarget)
  || wrapperSource.includes('const releaseTarget =')
  || wrapperSource.includes('[releaseTarget, releaseReplacement]')) {
  throw new Error('Convergence handshake preflight did not normalize the current close and retired release seams.');
}
if (!wrapperSource.includes(replacementLoopReplacement)) {
  throw new Error('Convergence handshake preflight did not materialize all-close confirmation handling.');
}
if (!wrapperSource.includes(sessionEpochAllowance)) {
  throw new Error('Convergence handshake preflight did not admit the current session epoch bookkeeping key.');
}
if (!wrapperSource.includes(modeAwareRebuildWait)
  && !wrapperSource.includes(presentationAwareRebuildMarker)) {
  throw new Error('Convergence handshake preflight did not normalize rebuild observation across presentation modes.');
}

if (wrapperChanged) await fs.writeFile(wrapperPath, wrapperSource, 'utf8');
await fs.writeFile(path.join(artifactDir, 'convergence-materialization-preflight.json'), `${JSON.stringify({
  schema:'td613.ash.constitutional-convergence-materialization/v0.3-session-epoch-allowlist',
  status:'PASS',
  finite_lock_guard_present:true,
  guard_materialized_in_ephemeral_checkout:guardMaterialized,
  current_close_target_present:true,
  close_target_normalized_in_ephemeral_checkout:closeTargetNormalized,
  all_close_confirmations_materialized:true,
  close_replacement_widened_in_ephemeral_checkout:closeReplacementWidened,
  retired_release_target_absent:true,
  retired_release_target_removed_in_ephemeral_checkout:retiredReleaseTargetRemoved,
  session_epoch_allowance_present:true,
  session_epoch_allowance_materialized_in_ephemeral_checkout:sessionEpochAllowanceMaterialized,
  rebuild_action_path_mode_aware:true,
  rebuild_action_path_normalized_in_ephemeral_checkout:rebuildActionPathNormalized,
  product_runtime_mutated:false,
  authority_changed:false,
  source_bytes_moved:false,
  promotion_authorized:false,
  human_closure_required:true
}, null, 2)}\n`);

const child = spawn(process.execPath, [workerPath], {
  env:process.env,
  stdio:'inherit'
});

let timedOut = false;
let hardKill = null;
const watchdog = setTimeout(async () => {
  timedOut = true;
  const receipt = {
    schema:'td613.ash.constitutional-convergence-watchdog/v0.2',
    status:'HOLD_FOR_REPAIR',
    reason:'HANDSHAKE_CHILD_PROCESS_CEILING',
    ceiling_ms:ceilingMs,
    observed_at:new Date().toISOString(),
    source_status:/localhost|127\.0\.0\.1/.test(process.env.TD613_BASE_URL || '') ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
    promotion_authorized:false,
    authority_changed:false,
    source_bytes_moved:false,
    human_closure_required:true
  };
  try {
    await fs.writeFile(path.join(artifactDir, 'convergence-watchdog.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  } catch (error) {
    console.error('[TD613 convergence] watchdog receipt write failed:', error);
  }
  console.error(`[TD613 convergence] child handshake exceeded ${ceilingMs}ms; holding for repair.`);
  child.kill('SIGINT');
  hardKill = setTimeout(() => child.kill('SIGKILL'), 15000);
}, ceilingMs);

const result = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', (code, signal) => resolve({ code, signal }));
});

clearTimeout(watchdog);
if (hardKill) clearTimeout(hardKill);

if (timedOut) {
  process.exitCode = 124;
} else if (result.code !== 0) {
  console.error(`[TD613 convergence] worker exited with ${result.code ?? 'no code'}${result.signal ? ` after ${result.signal}` : ''}.`);
  process.exitCode = result.code ?? 1;
}
