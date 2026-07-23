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

const contentionReplacement = `  const contentionEvent = 'td613:ash:probe-contention-release:v1';
  const releaseSignal = 'RELEASE_FIRST_TAB';
  const queuedKey = 'td613.ash-keep.probe-lock-queue';
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
  await secondPage.waitForFunction(() => localStorage.getItem('td613.ash-keep.probe-lock') === 'HELD_BY_FIRST_TAB');
  await page.waitForFunction(() => window.__td613ProbeContentionReleaseReady === true);
  const queuedAt = await secondPage.evaluate(queueKey => {
    const timestamp = Date.now();
    localStorage.setItem(queueKey, 'SECOND_TAB_QUEUED');
    window.__td613ProbeSecondLock = { state:'QUEUED', queued_at:timestamp, result:null, error:null };
    window.TD613AshConvergence.withOperation('probe-contention', async () => ({
      state:localStorage.getItem('td613.ash-keep.probe-lock'),
      queued_at:timestamp,
      acquired_at:Date.now()
    })).then(result => {
      window.__td613ProbeSecondLock = { state:'RESOLVED', queued_at:timestamp, result, error:null };
    }).catch(error => {
      window.__td613ProbeSecondLock = { state:'REJECTED', queued_at:timestamp, result:null, error:String(error?.message || error) };
    });
    return timestamp;
  }, queuedKey);
  await secondPage.waitForFunction(timestamp => window.__td613ProbeSecondLock?.state === 'QUEUED'
    && window.__td613ProbeSecondLock?.queued_at === timestamp, queuedAt);
  await page.waitForFunction(queueKey => localStorage.getItem(queueKey) === 'SECOND_TAB_QUEUED', queuedKey);
  const secondResultWait = secondPage.waitForFunction(() => {
    const probe = window.__td613ProbeSecondLock;
    if (probe?.state === 'REJECTED') throw new Error(probe.error || 'Second-tab contention request rejected.');
    return probe?.state === 'RESOLVED' ? probe.result : false;
  }, null, { timeout:35000 }).then(handle => handle.jsonValue());
  await page.evaluate(({ eventName, signal }) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail:signal }));
  }, { eventName:contentionEvent, signal:releaseSignal });
  const [firstResult, secondResult] = await Promise.race([
    Promise.all([firstLock, secondResultWait]),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('Cross-tab lock witness exceeded 35000ms.')),
      35000
    ))
  ]);
  await page.evaluate(queueKey => localStorage.removeItem(queueKey), queuedKey);
  await secondPage.evaluate(() => { delete window.__td613ProbeSecondLock; });
  assert(secondResult.queued_at === queuedAt, 'Second-tab contention receipt lost its exact queued timestamp.');
  assert(secondResult.queued_at <= firstResult.released_at, 'Second-tab contention request was not queued before first-tab release.');`;

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
  "if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.') || !runtime.includes('RELEASE_FIRST_TAB') || !runtime.includes('SECOND_TAB_QUEUED') || !runtime.includes('Second-tab contention request was not queued before first-tab release.')) {\n  throw new Error('Convergence observer explicit cross-tab handshake was not materialized.');\n}"
);
if (!runtimeWrapper.includes("contentionEvent = 'td613:ash:probe-contention-release:v1'")) {
  throw new Error('Convergence handshake shim failed to materialize the named release event.');
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
