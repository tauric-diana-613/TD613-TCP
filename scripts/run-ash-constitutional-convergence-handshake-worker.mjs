import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const wrapperUrl = new URL('./run-ash-constitutional-convergence-probe.mjs', import.meta.url);
const runtimeUrl = new URL('./run-ash-constitutional-convergence-probe.handshake.runtime.mjs', import.meta.url);
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-constitutional-convergence';
const handshakeCeilingMs = Number.parseInt(process.env.TD613_CONVERGENCE_HANDSHAKE_CEILING_MS || '360000', 10);
if (!Number.isFinite(handshakeCeilingMs) || handshakeCeilingMs < 1000) {
  throw new Error('TD613 convergence handshake ceiling must be a finite duration of at least 1000ms.');
}

const contentionTarget = `  const firstLock = page.evaluate(() => window.TD613AshConvergence.withOperation('probe-contention', async () => {
    const acquiredAt = Date.now();
    localStorage.setItem('td613.ash-keep.probe-lock', 'HELD_BY_FIRST_TAB');
    await new Promise(resolve => setTimeout(resolve, 240));
    localStorage.setItem('td613.ash-keep.probe-lock', 'RELEASED_BY_FIRST_TAB');
    return { state:'RELEASED_BY_FIRST_TAB', acquired_at:acquiredAt, released_at:Date.now() };
  }));
  await secondPage.waitForFunction(() => localStorage.getItem('td613.ash-keep.probe-lock') === 'HELD_BY_FIRST_TAB');
  const secondLock = secondPage.evaluate(() => window.TD613AshConvergence.withOperation('probe-contention', async () => ({
    state:localStorage.getItem('td613.ash-keep.probe-lock'),
    acquired_at:Date.now()
  })));
  const [firstResult, secondResult] = await Promise.all([firstLock, secondLock]);`;

const contentionReplacement = `  const contentionEvent = 'td613:ash:probe-contention-release:v4';
  const releaseSignal = 'RELEASE_FIRST_TAB';
  const intentKey = 'td613.ash-keep.probe-lock-intent';
  const lockName = 'td613:ash:probe-contention';
  const firstLock = page.evaluate(({ eventName, signal }) => window.TD613AshConvergence.withOperation('probe-contention', async () => {
    const acquiredAt = Date.now();
    localStorage.setItem('td613.ash-keep.probe-lock', 'HELD_BY_FIRST_TAB');
    await new Promise(resolve => {
      window.addEventListener(eventName, event => {
        if (event.detail === signal) resolve();
      }, { once:true });
      window.__td613ProbeContentionReleaseReady = true;
    });
    delete window.__td613ProbeContentionReleaseReady;
    localStorage.setItem('td613.ash-keep.probe-lock', 'RELEASED_BY_FIRST_TAB');
    return { state:'RELEASED_BY_FIRST_TAB', acquired_at:acquiredAt, released_at:Date.now() };
  }), { eventName:contentionEvent, signal:releaseSignal });
  await secondPage.waitForFunction(() => localStorage.getItem('td613.ash-keep.probe-lock') === 'HELD_BY_FIRST_TAB', null, { timeout:10000 });
  await page.waitForFunction(() => window.__td613ProbeContentionReleaseReady === true, null, { timeout:10000 });
  const preRelease = await secondPage.evaluate(async name => {
    const manager = navigator.locks;
    const nativeRequest = manager && Object.getPrototypeOf(manager)?.request;
    if (typeof nativeRequest !== 'function') return { supported:false, acquired:null, observed_at:Date.now() };
    return nativeRequest.call(manager, name, { mode:'exclusive', ifAvailable:true }, lock => ({
      supported:true,
      acquired:Boolean(lock),
      observed_at:Date.now(),
      observer_path:'NATIVE_LOCK_MANAGER_PROTOTYPE'
    }));
  }, lockName);
  assert(preRelease.supported === true, 'Cross-tab lock witness requires the browser lock owner used by Ash.');
  assert(preRelease.acquired === false, 'Second tab acquired the Ash operation while the first tab still held it.');
  assert(preRelease.observer_path === 'NATIVE_LOCK_MANAGER_PROTOTYPE', 'Pre-release exclusion assay re-entered the coordinated Ash lease path.');
  const intendedAt = await secondPage.evaluate(key => {
    const timestamp = Date.now();
    localStorage.setItem(key, 'SECOND_TAB_BLOCKED_WHILE_HELD');
    return timestamp;
  }, intentKey);
  await page.evaluate(({ eventName, signal }) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail:signal }));
  }, { eventName:contentionEvent, signal:releaseSignal });
  const firstResult = await Promise.race([
    firstLock,
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('First-tab lock release exceeded 10000ms.')),
      10000
    ))
  ]);
  const postReleaseLockSnapshot = await secondPage.evaluate(async () => {
    if (typeof navigator.locks?.query !== 'function') return { supported:false, status:'UNAVAILABLE', held:[], pending:[] };
    const simplify = rows => rows.map(row => ({ name:row.name, mode:row.mode, client_id:row.clientId || null }));
    return Promise.race([
      navigator.locks.query().then(snapshot => ({
        supported:true,
        status:'OBSERVED',
        held:simplify(snapshot.held || []),
        pending:simplify(snapshot.pending || [])
      })),
      new Promise(resolve => setTimeout(() => resolve({
        supported:true,
        status:'QUERY_TIMEOUT',
        held:[],
        pending:[]
      }), 2000))
    ]);
  });
  const secondStartedAt = await secondPage.evaluate(() => {
    const startedAt = Date.now();
    window.__td613ProbePostRelease = { state:'STARTED', started_at:startedAt, result:null, error:null };
    window.TD613AshConvergence.withOperation('probe-contention', async () => ({
      state:localStorage.getItem('td613.ash-keep.probe-lock'),
      acquired_at:Date.now()
    })).then(result => {
      window.__td613ProbePostRelease = { state:'RESOLVED', started_at:startedAt, result, error:null };
    }).catch(error => {
      window.__td613ProbePostRelease = { state:'REJECTED', started_at:startedAt, result:null, error:String(error?.message || error) };
    });
    return startedAt;
  });
  let secondRecord;
  try {
    const handle = await secondPage.waitForFunction(startedAt => {
      const probe = window.__td613ProbePostRelease;
      return probe?.started_at === startedAt && ['RESOLVED','REJECTED'].includes(probe.state) ? probe : false;
    }, secondStartedAt, { timeout:35000 });
    secondRecord = await handle.jsonValue();
  } catch (error) {
    throw new Error('Cross-tab lock witness exceeded 35000ms. ' + String(error?.message || error));
  }
  if (secondRecord.state === 'REJECTED') throw new Error('Second-tab post-release Ash operation rejected: ' + secondRecord.error);
  const secondResult = secondRecord.result;
  await secondPage.evaluate(key => {
    localStorage.removeItem(key);
    delete window.__td613ProbePostRelease;
  }, intentKey);
  assert(intendedAt <= firstResult.released_at, 'Second-tab contention intent was not observed before first-tab release.');
  report.observations.multi_tab_pre_release = {
    second_tab_attempt:'DENIED_WHILE_HELD',
    lock_name:lockName,
    intended_at:intendedAt,
    first_tab_released_at:firstResult.released_at,
    pre_release_observer_path:preRelease.observer_path,
    post_release_lock_snapshot:postReleaseLockSnapshot,
    second_tab_started_at:secondStartedAt,
    finite_release_ceiling_ms:10000,
    finite_query_ceiling_ms:2000,
    finite_acquisition_ceiling_ms:35000
  };`;

const materializedSeams = [];

function replaceUniquePattern(source, pattern, replacement, name) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...source.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) {
    throw new Error(`Convergence semantic seam ${name} expected exactly one match; observed ${matches.length}.`);
  }
  const match = matches[0];
  materializedSeams.push(Object.freeze({
    name,
    start:match.index,
    end:match.index + match[0].length,
    prior_length:match[0].length,
    replacement_length:replacement.length
  }));
  return `${source.slice(0, match.index)}${replacement}${source.slice(match.index + match[0].length)}`;
}

function insertBeforeUniqueAnchor(source, anchor, insertion, name) {
  const first = source.indexOf(anchor);
  const second = first < 0 ? -1 : source.indexOf(anchor, first + anchor.length);
  if (first < 0 || second >= 0) {
    throw new Error(`Convergence semantic seam ${name} expected one anchor; observed ${first < 0 ? 0 : 2}.`);
  }
  materializedSeams.push(Object.freeze({
    name,
    start:first,
    end:first,
    prior_length:0,
    replacement_length:insertion.length
  }));
  return `${source.slice(0, first)}${insertion}${source.slice(first)}`;
}

const replacementDefinitions = `const lockWaitTarget = ${JSON.stringify(contentionTarget)};
const lockWaitReplacement = ${JSON.stringify(contentionReplacement)};

`;

const finiteExclusionGuard = `if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.')
  || !runtime.includes('First-tab lock release exceeded 10000ms.')
  || !runtime.includes('QUERY_TIMEOUT')
  || !runtime.includes('DENIED_WHILE_HELD')
  || !runtime.includes('Second-tab contention intent was not observed before first-tab release.')
  || !runtime.includes('__td613ProbePostRelease')
  || !runtime.includes('NATIVE_LOCK_MANAGER_PROTOTYPE')) {
  throw new Error('Convergence observer finite cross-tab exclusion witness was not materialized.');
}

`;

const scopedCloseReplacement = `const closeReplacement = \`  {
    await page.locator('#closeCase').click();
    const closeConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
    if (await closeConfirmation.isVisible().catch(() => false)) await closeConfirmation.click();
  }\`;`;

const pageCreationTarget = 'const page = await context.newPage();';
const pageCreationReplacement = `${pageCreationTarget}
page.setDefaultTimeout(45000);
page.setDefaultNavigationTimeout(90000);
const checkpoint = async label => {
  console.log('[TD613 convergence] ' + label);
  await fsp.writeFile(path.join(artifactDir, 'convergence-checkpoint.json'), JSON.stringify({
    schema:'td613.ash.constitutional-convergence-checkpoint/v0.1',
    label,
    observed_at:new Date().toISOString(),
    promotion_authorized:false
  }, null, 2) + '\\n');
};`;

const checkpoints = [
  ["  await page.goto(keepUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });", 'BOOT'],
  ['  report.observations.custody_binding = await bindSyntheticCustody(page);', 'CUSTODY_BINDING'],
  ["  await page.locator('#loadSeed').click();", 'REBUILD_GESTURE'],
  ["  await page.locator('#objectName').fill('Synthetic successor fact');", 'CASE_MAP_MUTATION'],
  ["  const firstCase = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));", 'FIRST_CASE_SAVED'],
  ["  const secondCase = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));", 'SECOND_CASE_OPENED'],
  ['  const secondPage = await context.newPage();', 'MULTI_TAB_START'],
  ["  const deletionPlan = await page.evaluate(id => window.TD613AshConvergence.planDeletion(id, 'Synthetic interrupted case', true), firstCase);", 'INTERRUPTED_DELETION'],
  ['  await page.setViewportSize({ width: 1440, height: 1000 });', 'LAYOUT_WITNESS'],
  ["  report.status = 'PASS';", 'PASS']
];

const runtimeWriteReplacement = [
  'let diagnosticRuntime = runtime;',
  `const pageCreationTarget = ${JSON.stringify(pageCreationTarget)};`,
  `const pageCreationReplacement = ${JSON.stringify(pageCreationReplacement)};`,
  "if (!diagnosticRuntime.includes(pageCreationTarget)) throw new Error('Convergence observer could not locate page creation for finite action ceilings.');",
  'diagnosticRuntime = diagnosticRuntime.replace(pageCreationTarget, pageCreationReplacement);',
  `const checkpoints = ${JSON.stringify(checkpoints)};`,
  "for (const [target, label] of checkpoints) {",
  "  const first = diagnosticRuntime.indexOf(target);",
  "  const second = first < 0 ? -1 : diagnosticRuntime.indexOf(target, first + target.length);",
  "  if (first < 0 || second >= 0) throw new Error('Convergence observer semantic checkpoint seam ' + label + ' expected one anchor.');",
  "  diagnosticRuntime = diagnosticRuntime.slice(0, first) + '  await checkpoint(' + JSON.stringify(label) + ');\\n' + target + diagnosticRuntime.slice(first + target.length);",
  "}",
  "if (!diagnosticRuntime.includes('page.setDefaultTimeout(45000)') || !diagnosticRuntime.includes('convergence-checkpoint.json') || !diagnosticRuntime.includes('await checkpoint(\"MULTI_TAB_START\")')) throw new Error('Convergence observer finite diagnostics were not materialized.');",
  "await fs.writeFile(runtimePath, diagnosticRuntime, 'utf8');",
  "const { spawnSync } = await import('node:child_process');",
  "const observerSyntax = spawnSync(process.execPath, ['--check', runtimePath], { encoding:'utf8' });",
  "if (observerSyntax.status !== 0) throw new Error('Convergence final observer failed syntax validation.\\n' + (observerSyntax.stderr || observerSyntax.stdout || ''));"
].join('\n');

await fs.mkdir(artifactDir, { recursive:true });
let runtimeWrapper;
try {
  const wrapperSource = await fs.readFile(wrapperUrl, 'utf8');
  runtimeWrapper = replaceUniquePattern(
    wrapperSource,
    /const closeReplacement\s*=\s*`[\s\S]*?`;\s*(?=const source\s*=\s*await fs\.readFile)/,
    scopedCloseReplacement,
    'SCOPED_CLOSE_CONFIRMATION'
  );
  runtimeWrapper = replaceUniquePattern(
    runtimeWrapper,
    /const lockWaitTarget\s*=\s*`[\s\S]*?`;\s*const lockWaitReplacement\s*=\s*`[\s\S]*?`;\s*(?=const localKeysTarget\s*=)/,
    replacementDefinitions,
    'LOCK_DEFINITIONS'
  );

  const legacyGuardPattern = /if\s*\(\s*!runtime\.includes\('Cross-tab lock witness exceeded 35000ms\.'\)\s*\)\s*\{[\s\S]*?\}\s*(?=await fs\.mkdir\(artifactDir,\s*\{\s*recursive:true\s*\}\);)/;
  if (legacyGuardPattern.test(runtimeWrapper)) {
    runtimeWrapper = replaceUniquePattern(runtimeWrapper, legacyGuardPattern, finiteExclusionGuard, 'FINITE_EXCLUSION_GUARD');
  } else {
    runtimeWrapper = insertBeforeUniqueAnchor(
      runtimeWrapper,
      'await fs.mkdir(artifactDir, { recursive:true });',
      finiteExclusionGuard,
      'FINITE_EXCLUSION_GUARD'
    );
  }

  runtimeWrapper = replaceUniquePattern(
    runtimeWrapper,
    /await fs\.writeFile\(runtimePath,\s*runtime(?:,\s*['"]utf8['"])?\s*\);/,
    runtimeWriteReplacement,
    'RUNTIME_WRITE_AND_DIAGNOSTICS'
  );

  for (const token of [
    "contentionEvent = 'td613:ash:probe-contention-release:v4'",
    'ifAvailable:true',
    'SECOND_TAB_BLOCKED_WHILE_HELD',
    'Object.getPrototypeOf(manager)?.request',
    "observer_path:'NATIVE_LOCK_MANAGER_PROTOTYPE'",
    'finite_query_ceiling_ms:2000',
    'post_release_lock_snapshot:postReleaseLockSnapshot',
    "state:'STARTED'",
    'let diagnosticRuntime = runtime;',
    'convergence-checkpoint.json',
    'page.setDefaultTimeout(45000)',
    "const closeReplacement = `  {",
    "spawnSync(process.execPath, ['--check', runtimePath]",
    'Convergence final observer failed syntax validation.'
  ]) {
    if (!runtimeWrapper.includes(token)) {
      throw new Error(`Convergence semantic materializer omitted required token: ${token}`);
    }
  }
  if (runtimeWrapper.includes('new BroadcastChannel(')) {
    throw new Error('Convergence semantic materializer retained a lossy BroadcastChannel release sender.');
  }

  await fs.writeFile(runtimeUrl, runtimeWrapper, 'utf8');
  const wrapperSyntax = spawnSync(process.execPath, ['--check', fileURLToPath(runtimeUrl)], { encoding:'utf8' });
  if (wrapperSyntax.status !== 0) {
    throw new Error('Convergence generated wrapper failed syntax validation.\n' + (wrapperSyntax.stderr || wrapperSyntax.stdout || ''));
  }
  await fs.writeFile(path.join(artifactDir, 'convergence-worker-materialization.json'), `${JSON.stringify({
    schema:'td613.ash.constitutional-convergence-worker-materialization/v0.3-parse-gated-semantic-seams',
    status:'PASS',
    seams:materializedSeams,
    generated_wrapper_syntax:'PASS',
    final_observer_syntax_gate_materialized:true,
    runtime_write_accepts_optional_encoding_argument:true,
    whole_source_literal_replacement:false,
    product_runtime_mutated:false,
    authority_changed:false,
    source_bytes_moved:false,
    promotion_authorized:false,
    human_closure_required:true
  }, null, 2)}\n`);
} catch (error) {
  await fs.writeFile(path.join(artifactDir, 'convergence-worker-materialization.json'), `${JSON.stringify({
    schema:'td613.ash.constitutional-convergence-worker-materialization/v0.3-parse-gated-semantic-seams',
    status:'HOLD_FOR_REPAIR',
    error:String(error?.stack || error),
    seams:materializedSeams,
    generated_wrapper_syntax:'HOLD',
    final_observer_syntax_gate_materialized:true,
    product_runtime_mutated:false,
    authority_changed:false,
    source_bytes_moved:false,
    promotion_authorized:false,
    human_closure_required:true
  }, null, 2)}\n`).catch(() => {});
  throw error;
}

let watchdog = null;
try {
  watchdog = setTimeout(async () => {
    const receipt = {
      schema:'td613.ash.constitutional-convergence-watchdog/v0.1',
      status:'HOLD_FOR_REPAIR',
      reason:'HANDSHAKE_PROCESS_CEILING',
      ceiling_ms:handshakeCeilingMs,
      observed_at:new Date().toISOString(),
      source_status:/localhost|127\.0\.0\.1/.test(process.env.TD613_BASE_URL || '') ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
      promotion_authorized:false,
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    };
    try {
      await fs.mkdir(artifactDir, { recursive:true });
      await fs.writeFile(path.join(artifactDir, 'convergence-watchdog.json'), `${JSON.stringify(receipt, null, 2)}\n`);
      await fs.rm(runtimeUrl, { force:true });
    } catch (error) {
      console.error('[TD613 convergence] watchdog receipt write failed:', error);
    }
    console.error(`[TD613 convergence] handshake exceeded ${handshakeCeilingMs}ms; holding for repair.`);
    process.exit(124);
  }, handshakeCeilingMs);
  await import(`${pathToFileURL(runtimeUrl.pathname).href}?handshake=${Date.now()}`);
} finally {
  if (watchdog) clearTimeout(watchdog);
  await fs.rm(runtimeUrl, { force:true });
}
