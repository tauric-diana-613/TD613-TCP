import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const artifactRoot = process.env.TD613_ARTIFACT_DIR || 'artifacts/td613-full-browser-closure';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const port = new URL(baseUrl).port || '6130';
const serverLogPath = path.join(artifactRoot, 'server.log');
const receiptPath = path.join(artifactRoot, 'receipt.json');
const browsers = (process.env.TD613_BROWSERS || 'chromium,firefox,webkit')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

await fs.mkdir(artifactRoot, { recursive:true });
await fs.writeFile(serverLogPath, '');

const results = [];
let server = null;
let hardKill = null;

function runProcess(label, command, args, {
  env = {},
  timeoutMs = 600_000,
  logPath = path.join(artifactRoot, `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.log`)
} = {}) {
  return new Promise(async (resolve, reject) => {
    await fs.mkdir(path.dirname(logPath), { recursive:true });
    await fs.writeFile(logPath, '');
    const startedAt = new Date().toISOString();
    const started = Date.now();
    const child = spawn(command, args, {
      cwd:root,
      env:{ ...process.env, ...env },
      stdio:['ignore', 'pipe', 'pipe']
    });
    let timedOut = false;
    const append = chunk => {
      process.stdout.write(chunk);
      fs.appendFile(logPath, chunk).catch(error => {
        console.error(`[TD613 browser closure] log write failed for ${label}:`, error);
        child.kill('SIGTERM');
      });
    };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    const ceiling = setTimeout(() => {
      timedOut = true;
      console.error(`[TD613 browser closure] ${label} exceeded ${timeoutMs}ms.`);
      child.kill('SIGINT');
      hardKill = setTimeout(() => child.kill('SIGKILL'), 15_000);
    }, timeoutMs);
    child.once('error', error => {
      clearTimeout(ceiling);
      if (hardKill) clearTimeout(hardKill);
      reject(error);
    });
    child.once('exit', (code, signal) => {
      clearTimeout(ceiling);
      if (hardKill) clearTimeout(hardKill);
      const result = {
        label,
        command:[command, ...args],
        started_at:startedAt,
        duration_ms:Date.now() - started,
        exit_code:code,
        signal:signal || null,
        timed_out:timedOut,
        log_path:logPath,
        status:code === 0 && !timedOut ? 'PASS' : 'FAIL'
      };
      results.push(result);
      if (result.status === 'PASS') resolve(result);
      else reject(Object.assign(new Error(`${label} failed with exit ${code ?? 'none'}${signal ? ` after ${signal}` : ''}.`), { result }));
    });
  });
}

async function startServer() {
  server = spawn(process.execPath, ['scripts/ash-keep-local-closure-server.mjs', port], {
    cwd:root,
    env:process.env,
    stdio:['ignore', 'pipe', 'pipe']
  });
  const append = chunk => {
    process.stdout.write(chunk);
    fs.appendFile(serverLogPath, chunk).catch(() => {});
  };
  server.stdout.on('data', append);
  server.stderr.on('data', append);
  server.once('error', error => console.error('[TD613 browser closure] server error:', error));

  const readinessUrl = `${baseUrl}/__ash_keep_closure/readiness`;
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    if (server.exitCode != null) throw new Error(`Ash local closure server exited before readiness with ${server.exitCode}.`);
    try {
      const response = await fetch(readinessUrl, { cache:'no-store', signal:AbortSignal.timeout(2_000) });
      if (response.ok) {
        const body = await response.text();
        await fs.writeFile(path.join(artifactRoot, 'readiness.json'), body);
        return;
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 1_000));
  }
  throw new Error('Ash local closure server did not become ready within 60 seconds.');
}

async function stopServer() {
  if (!server || server.exitCode != null) return;
  server.kill('SIGINT');
  await Promise.race([
    new Promise(resolve => server.once('exit', resolve)),
    new Promise(resolve => setTimeout(resolve, 10_000))
  ]);
  if (server.exitCode == null) server.kill('SIGKILL');
}

const probes = [
  ['A2-A5 whole instrument', 'scripts/ash-a2-a5-browser-probe.mjs', 540_000],
  ['A7-A11 workspaces', 'scripts/ash-a7-a11-browser-probe.mjs', 480_000],
  ['A12 command ownership', 'scripts/ash-a12-browser-probe.mjs', 420_000],
  ['Flow-Core live field', 'scripts/run-ash-flowcore-live-field-browser-probe.mjs', 480_000],
  ['Ingress first paint', 'scripts/ash-ingress-polish-browser-probe.mjs', 360_000],
  ['Reviewability', 'scripts/ash-reviewability-browser-probe.mjs', 420_000],
  ['Research hydration', 'scripts/ash-research-ux-browser-probe.mjs', 480_000]
];

let status = 'PASS';
let failure = null;
try {
  await startServer();

  await runProcess('Ash production closure', process.execPath, ['scripts/run-ash-keep-a1-production-probe.mjs'], {
    timeoutMs:540_000,
    env:{
      TD613_BASE_URL:baseUrl,
      TD613_ARTIFACT_DIR:path.join(artifactRoot, 'production-closure'),
      TD613_PROBE_RUNTIME_DIR:path.join(artifactRoot, 'probe-runtime')
    }
  });

  await runProcess('Constitutional convergence', process.execPath, ['scripts/run-ash-constitutional-convergence-handshake.mjs'], {
    timeoutMs:390_000,
    env:{
      TD613_BASE_URL:baseUrl,
      TD613_ARTIFACT_DIR:path.join(artifactRoot, 'constitutional-convergence')
    }
  });

  for (const browser of browsers) {
    for (const [label, script, timeoutMs] of probes) {
      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const env = {
        TD613_BROWSER:browser,
        TD613_BASE_URL:baseUrl,
        TD613_ARTIFACT_DIR:path.join(artifactRoot, browser, slug)
      };
      if (script.includes('a7-a11')) env.TD613_ASH_STAGES = 'A7,A8,A9,A10,A11';
      await runProcess(`${browser} ${label}`, process.execPath, [script], {
        timeoutMs,
        env,
        logPath:path.join(artifactRoot, browser, `${slug}.log`)
      });
    }
  }
} catch (error) {
  status = 'FAIL';
  failure = String(error?.message || error);
  console.error(`[TD613 browser closure] held: ${failure}`);
} finally {
  await stopServer();
  const receipt = {
    schema:'td613.workflow-estate.full-browser-closure/v0.1',
    status,
    observed_at:new Date().toISOString(),
    base_url:baseUrl,
    browsers,
    results,
    failure,
    deployment_authorized:false,
    counts_as_human_evidence:false,
    authority_changed:false,
    source_bytes_moved:false,
    human_closure_required:true
  };
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
}

if (status !== 'PASS') process.exitCode = 1;
