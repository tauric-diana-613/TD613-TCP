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

const contentionReplacement = `  const contentionChannel = 'td613:ash:probe-contention-release:v1';
  const firstLock = page.evaluate(channelName => window.TD613AshConvergence.withOperation('probe-contention', async () => {
    const acquiredAt = Date.now();
    const releaseChannel = new BroadcastChannel(channelName);
    localStorage.setItem('td613.ash-keep.probe-lock', 'HELD_BY_FIRST_TAB');
    await new Promise(resolve => releaseChannel.addEventListener('message', event => {
      if (event.data === 'RELEASE_FIRST_TAB') resolve();
    }, { once:true }));
    releaseChannel.close();
    localStorage.setItem('td613.ash-keep.probe-lock', 'RELEASED_BY_FIRST_TAB');
    return { state:'RELEASED_BY_FIRST_TAB', acquired_at:acquiredAt, released_at:Date.now() };
  }), contentionChannel);
  await secondPage.waitForFunction(() => localStorage.getItem('td613.ash-keep.probe-lock') === 'HELD_BY_FIRST_TAB');
  const secondLock = secondPage.evaluate(() => {
    const queuedAt = Date.now();
    return window.TD613AshConvergence.withOperation('probe-contention', async () => ({
      state:localStorage.getItem('td613.ash-keep.probe-lock'),
      queued_at:queuedAt,
      acquired_at:Date.now()
    }));
  });
  await new Promise(resolve => setTimeout(resolve, 120));
  const releasePage = await context.newPage();
  await releasePage.goto(keepUrl, { waitUntil:'domcontentloaded', timeout:90000 });
  await releasePage.evaluate(channelName => {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage('RELEASE_FIRST_TAB');
    channel.close();
  }, contentionChannel);
  await releasePage.close();
  const [firstResult, secondResult] = await Promise.race([
    Promise.all([firstLock, secondLock]),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('Cross-tab lock witness exceeded 35000ms.')),
      35000
    ))
  ]);
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
  "if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.') || !runtime.includes('RELEASE_FIRST_TAB') || !runtime.includes('Second-tab contention request was not queued before first-tab release.')) {\n  throw new Error('Convergence observer explicit cross-tab handshake was not materialized.');\n}"
);
if (!runtimeWrapper.includes("contentionChannel = 'td613:ash:probe-contention-release:v1'")) {
  throw new Error('Convergence handshake shim failed to materialize the named release channel.');
}

await fs.writeFile(runtimeUrl, runtimeWrapper, 'utf8');
try {
  await import(`${pathToFileURL(runtimeUrl.pathname).href}?handshake=${Date.now()}`);
} finally {
  await fs.rm(runtimeUrl, { force:true });
}
