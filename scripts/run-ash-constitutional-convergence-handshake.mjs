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
await fs.mkdir(artifactDir, { recursive:true });

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
