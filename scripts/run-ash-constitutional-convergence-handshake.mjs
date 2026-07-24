import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const wrapperUrl = new URL('./run-ash-constitutional-convergence-probe.mjs', import.meta.url);
const runtimeUrl = new URL('./run-ash-constitutional-convergence-probe.handshake.runtime.mjs', import.meta.url);

const originalDefinitionsStart = 'const lockWaitTarget =';
const originalDefinitionsEnd = '\nconst localKeysTarget =';

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

const replacementDefinitions = `const lockWaitTarget = ${JSON.stringify(contentionTarget)};\nconst lockWaitReplacement = ${JSON.stringify(contentionReplacement)};`;

const wrapperSource = await fs.readFile(wrapperUrl, 'utf8');
const start = wrapperSource.indexOf(originalDefinitionsStart);
const end = wrapperSource.indexOf(originalDefinitionsEnd, start);
if (start < 0 || end < 0 || end <= start) throw new Error('Convergence handshake shim could not locate the bounded lock-definition seam.');
if (!wrapperSource.includes("if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.'))")) {
  throw new Error('Convergence handshake shim expected the retained finite lock ceiling assertion.');
}

let runtimeWrapper = `${wrapperSource.slice(0, start)}${replacementDefinitions}${wrapperSource.slice(end)}`;
runtimeWrapper = runtimeWrapper.replace(
  "if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.')) {\n  throw new Error('Convergence observer bounded cross-tab join was not materialized.');\n}",
  "if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.') || !runtime.includes('First-tab lock release exceeded 10000ms.') || !runtime.includes('QUERY_TIMEOUT') || !runtime.includes('DENIED_WHILE_HELD') || !runtime.includes('Second-tab contention intent was not observed before first-tab release.') || !runtime.includes('__td613ProbePostRelease') || !runtime.includes('NATIVE_LOCK_MANAGER_PROTOTYPE')) {\n  throw new Error('Convergence observer finite cross-tab exclusion witness was not materialized.');\n}"
);
if (!runtimeWrapper.includes("contentionEvent = 'td613:ash:probe-contention-release:v4'")) {
  throw new Error('Convergence handshake shim failed to materialize the named release event.');
}
if (!runtimeWrapper.includes("ifAvailable:true") || !runtimeWrapper.includes("SECOND_TAB_BLOCKED_WHILE_HELD")) {
  throw new Error('Convergence handshake shim failed to materialize the nonblocking pre-release exclusion assay.');
}
if (!runtimeWrapper.includes('Object.getPrototypeOf(manager)?.request') || !runtimeWrapper.includes("observer_path:'NATIVE_LOCK_MANAGER_PROTOTYPE'")) {
  throw new Error('Convergence handshake shim failed to bypass only the patched Ash lock instance for native pre-release observation.');
}
if (!runtimeWrapper.includes('finite_query_ceiling_ms:2000') || !runtimeWrapper.includes('post_release_lock_snapshot:postReleaseLockSnapshot') || !runtimeWrapper.includes("state:'STARTED'")) {
  throw new Error('Convergence handshake shim failed to materialize the bounded diagnostic and detached post-release Ash operation receipt.');
}
if (runtimeWrapper.includes('new BroadcastChannel(')) {
  throw new Error('Convergence handshake shim retained a lossy BroadcastChannel release sender.');
}

await fs.writeFile(runtimeUrl, runtimeWrapper, 'utf8');
try {
  await import(`${pathToFileURL(runtimeUrl.pathname).href}?handshake=${Date.now()}`);
} finally {
  await fs.rm(runtimeUrl, { force:true });
}
