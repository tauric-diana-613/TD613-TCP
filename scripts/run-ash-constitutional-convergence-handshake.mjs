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

await fs.mkdir(artifactDir, { recursive:true });
let wrapperSource = await fs.readFile(wrapperPath, 'utf8');
let guardMaterialized = false;
if (!wrapperSource.includes(finiteLockGuard)) {
  const markerIndex = wrapperSource.indexOf(wrapperWriteMarker);
  if (markerIndex < 0 || wrapperSource.indexOf(wrapperWriteMarker, markerIndex + wrapperWriteMarker.length) >= 0) {
    throw new Error('Convergence handshake preflight could not locate one wrapper write boundary.');
  }
  wrapperSource = wrapperSource.replace(wrapperWriteMarker, `${finiteLockGuard}\n\n${wrapperWriteMarker}`);
  await fs.writeFile(wrapperPath, wrapperSource, 'utf8');
  guardMaterialized = true;
}
await fs.writeFile(path.join(artifactDir, 'convergence-materialization-preflight.json'), `${JSON.stringify({
  schema:'td613.ash.constitutional-convergence-materialization/v0.1',
  status:'PASS',
  finite_lock_guard_present:true,
  guard_materialized_in_ephemeral_checkout:guardMaterialized,
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
