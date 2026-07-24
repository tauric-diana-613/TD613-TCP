import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/td613-consolidated-ci';
const logPath = path.join(artifactDir, 'contracts.log');
const receiptPath = path.join(artifactDir, 'receipt.json');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const python = process.env.PYTHON || (process.platform === 'win32' ? 'python.exe' : 'python');

await fs.mkdir(artifactDir, { recursive:true });
await fs.writeFile(logPath, '');

const commands = [
  ['Workflow estate', process.execPath, ['tests/workflow-estate.test.mjs']],
  ['TCP smoke', process.execPath, ['tests/tcp-smoke.test.mjs']],
  ['Maintained repository suite', npm, ['test']],
  ['Hush phase 9', npm, ['run', 'test:hush:phase9']],
  ['Hush phase 10', npm, ['run', 'test:hush:phase10']],
  ['Hush phase 11', npm, ['run', 'test:hush:phase11']],
  ['Hush phase 12', npm, ['run', 'test:hush:phase12']],
  ['Hush phase 13', npm, ['run', 'test:hush:phase13']],
  ['Hush phase 14', npm, ['run', 'test:hush:phase14']],
  ['Hush packet integration', npm, ['run', 'test:hush:packets:check']],
  ['Safe Harbor current', npm, ['run', 'test:safe-harbor:current']],
  ['Safe Harbor Gen3 Wave B', npm, ['run', 'test:safe-harbor:gen3:wave-b']],
  ['Dome-World maintained suite', npm, ['run', 'test:dome-world']],
  ['Dome-World Python compile', python, ['-m', 'py_compile', 'api/dome-world-engine-guard.py', 'packages/dome_world_exact/reciprocal_bridge.py', 'packages/dome_world_exact/flowcore_context.py', 'scripts/phase4-local-integration-server.py']],
  ['Dome-World Python contexts', python, ['-m', 'pytest', 'packages/dome_world_exact/tests/test_flowcore_context.py', 'packages/dome_world_exact/tests/test_flowcore_context_api.py', 'packages/dome_world_exact/tests/test_reciprocal_bridge_v01.py', '-q']],
  ['Phase 4 bridge contract', process.execPath, ['tests/aperture-phase4-bridge.test.mjs']],
  ['Phase 4 deployment contract', process.execPath, ['tests/phase4-deployment-probe.test.mjs']],
  ['Phase 4 release sync', process.execPath, ['tests/phase4-release-sync.test.mjs']],
  ['Ash A2-A5', process.execPath, ['tests/ash-a2-a5-whole-instrument.test.mjs']],
  ['Ash A7 Home', process.execPath, ['tests/ash-a7-home-recompilation.test.mjs']],
  ['Ash A8 Case Map', process.execPath, ['tests/ash-a8-case-map-recompilation.test.mjs']],
  ['Ash A9 Work', process.execPath, ['tests/ash-a9-work-recompilation.test.mjs']],
  ['Ash A10 Choir', process.execPath, ['tests/ash-a10-choir-recompilation.test.mjs']],
  ['Ash A11 Capsule', process.execPath, ['tests/ash-a11-capsule-recompilation.test.mjs']],
  ['Ash A11 postclosure cache', process.execPath, ['tests/ash-a11-postclosure-cache-eviction.test.mjs']],
  ['Ash A12 command ownership', process.execPath, ['tests/ash-a12-command-rationalization.test.mjs']],
  ['Ash Flow-Core field', process.execPath, ['tests/ash-flowcore-live-field.test.mjs']],
  ['Ash ingress polish', process.execPath, ['tests/ash-ingress-polish.test.mjs']],
  ['Ash AIA3 eviction', process.execPath, ['tests/ash-aia3-mass-eviction.test.mjs']],
  ['Ash demo cache', process.execPath, ['tests/ash-live-ingress-demos-cache.test.mjs']],
  ['Ash shell architecture', process.execPath, ['tests/product-architecture/shell.test.mjs']],
  ['Ash reviewability', process.execPath, ['tests/ash-reviewability.test.mjs']],
  ['Ash Research hydration', process.execPath, ['tests/ash-research-ux-rehydration.test.mjs']],
  ['Ash rehydration boundaries', process.execPath, ['tests/ash-final-rehydration-boundaries.test.mjs']],
  ['Flow-Core visual grammar', process.execPath, ['--test', 'tests/flowcore-pedagogue-visual.test.mjs']],
  ['Ash live AIA surface', process.execPath, ['tests/ash-keep-live-aia-surface.test.mjs']],
  ['Ash ingress close boundary', process.execPath, ['tests/ash-keep-ingress-readiness-close-boundary.test.mjs']],
  ['Ash production closure contract', process.execPath, ['tests/ash-keep-production-closure-contract.test.mjs']],
  ['Ash production promotion gate', process.execPath, ['tests/ash-keep-production-promotion-gate.test.mjs']],
  ['Ash lifecycle production contract', process.execPath, ['tests/ash-lifecycle-production-contract.test.mjs']],
  ['Ash lifecycle', process.execPath, ['tests/ash-lifecycle.test.mjs']],
  ['Ash draft lifecycle binding', process.execPath, ['tests/ash-draft-lifecycle-binding.test.mjs']],
  ['Ash product architecture', process.execPath, ['tests/ash-product-architecture.test.mjs']],
  ['Flow-Core P0-P7', process.execPath, ['tests/flowcore-p0-p7-seam-closure.test.mjs']],
  ['Flow-Core P0-P10', process.execPath, ['tests/flowcore-p0-p10-completion.test.mjs']],
  ['Flow-Core production observation', process.execPath, ['tests/flowcore-production-observation.test.mjs']],
  ['Flow-Core runtime probe contract', process.execPath, ['tests/flowcore-runtime-browser-probe.test.mjs']],
  ['Flow-Core physical scene', process.execPath, ['tests/flowcore-physical-scene.test.mjs']],
  ['Flow-Core empirical validation', process.execPath, ['tests/flowcore-empirical-validation.test.mjs']],
  ['Flow-Core production promotion', process.execPath, ['tests/flowcore-production-promotion.test.mjs']],
  ['Vercel operator gate', process.execPath, ['tests/vercel-operator-release-gate.test.mjs']],
  ['Vercel relock safety', process.execPath, ['tests/vercel-relock-safety.test.mjs']],
  ['Ash release posture', process.execPath, ['scripts/assert-ash-keep-release-posture.mjs']],
  ['Aperture download sync', npm, ['run', 'aperture:check-sync']]
];

const results = [];

async function append(text) {
  await fs.appendFile(logPath, text);
}

function run(label, command, args) {
  return new Promise((resolve, reject) => {
    const startedAt = new Date().toISOString();
    const started = Date.now();
    const heading = `\n\n=== ${label} ===\n$ ${command} ${args.join(' ')}\n`;
    process.stdout.write(heading);
    append(heading).catch(reject);

    const child = spawn(command, args, {
      cwd:root,
      env:process.env,
      stdio:['ignore', 'pipe', 'pipe']
    });

    const write = chunk => {
      process.stdout.write(chunk);
      append(chunk).catch(error => child.kill('SIGTERM'));
    };
    child.stdout.on('data', write);
    child.stderr.on('data', write);
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      const result = {
        label,
        command:[command, ...args],
        started_at:startedAt,
        duration_ms:Date.now() - started,
        exit_code:code,
        signal:signal || null,
        status:code === 0 ? 'PASS' : 'FAIL'
      };
      results.push(result);
      if (code === 0) resolve(result);
      else reject(Object.assign(new Error(`${label} failed with exit ${code ?? 'none'}${signal ? ` after ${signal}` : ''}.`), { result }));
    });
  });
}

let status = 'PASS';
let failure = null;
try {
  for (const [label, command, args] of commands) await run(label, command, args);
} catch (error) {
  status = 'FAIL';
  failure = String(error?.message || error);
  console.error(`\nTD613 consolidated contracts held: ${failure}`);
} finally {
  const receipt = {
    schema:'td613.workflow-estate.consolidated-contracts/v0.1',
    status,
    observed_at:new Date().toISOString(),
    command_count:commands.length,
    results,
    failure,
    authority_changed:false,
    deployment_authorized:false,
    human_closure_required:true
  };
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
}

if (status !== 'PASS') process.exitCode = 1;
