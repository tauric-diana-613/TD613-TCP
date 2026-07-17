import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = new URL('./ash-user-test-flight.mjs', import.meta.url);
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-user-test-flight');
const runtimePath = path.join(artifactDir, 'ash-user-test-flight.runtime.mjs');

const navigationTarget = `async function bootAsh(page, { throughThreshold = true } = {}) {
  await page.goto(throughThreshold ? thresholdUrl : keepUrl, { waitUntil: 'networkidle' });
  await page.waitForURL(/\\/dome-world\\/ash-keep\\.html/, { timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.__td613AshLifecycleRefresh === 'function'
    && typeof window.TD613AshConvergence?.authorize === 'function'
    && Boolean(document.querySelector('.work-tab[data-workspace="custody"]')),
  null, { timeout: 60000 });
}`;

const navigationReplacement = `async function bootAsh(page, { throughThreshold = true } = {}) {
  await page.goto(throughThreshold ? thresholdUrl : keepUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.__td613AshLifecycleRefresh === 'function'
    && typeof window.TD613AshConvergence?.authorize === 'function'
    && Boolean(document.querySelector('.work-tab[data-workspace="custody"]')),
  null, { timeout: 60000 });
  const route = new URL(page.url()).pathname;
  if (!['/dome-world/ash-threshold.html', '/dome-world/ash-keep.html'].includes(route)) {
    throw new Error(\`Ash composed arrival resolved to an unexpected route: \${route}\`);
  }
}`;

const initialBootTarget = `  await bootAsh(page);`;
const initialBootReplacement = `  await bootAsh(page, { throughThreshold: !syntheticCustody });`;

const exportTarget = `  await page.locator('#capsulePassphrase').fill(passphrase);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportCapsule').click();
  const download = await downloadPromise;
  downloadedCapsule = path.join(artifactDir, await download.suggestedFilename());
  await download.saveAs(downloadedCapsule);
  await page.waitForFunction(() => /Encrypted copy exported/.test(document.getElementById('capsuleStatus')?.textContent || ''));`;

const exportReplacement = `  if (syntheticCustody) {
    const capsule = await page.evaluate(async passphraseValue => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('td613-ash-keep');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const read = (store, key) => new Promise((resolve, reject) => {
        const request = db.transaction(store).objectStore(store).get(key);
        request.onsuccess = () => resolve(request.result?.value ?? request.result ?? null);
        request.onerror = () => reject(request.error);
      });
      const readAll = store => new Promise((resolve, reject) => {
        const request = db.transaction(store).objectStore(store).getAll();
        request.onsuccess = () => resolve((request.result || []).map(row => row?.value ?? row));
        request.onerror = () => reject(request.error);
      });
      const caseId = localStorage.getItem('td613.ash-keep.current-case');
      const caseMap = await read('cases', caseId);
      const roomRules = await read('roomRules', caseId);
      const routeMemory = await read('routeMemory', caseId);
      const savePoint = (await readAll('savePoints')).filter(value => value?.case_id === caseId).at(-1);
      db.close();
      const { encryptAshCapsule } = await import('/engine/ash-keep-continuity.js');
      return encryptAshCapsule({
        passphrase: passphraseValue,
        caseId,
        savePoint,
        caseBundle: { caseMap, roomRules, routeMemory }
      });
    }, passphrase);
    downloadedCapsule = path.join(artifactDir, \`td613-ash-capsule-local-\${capsule.case_id}.json\`);
    await fsp.writeFile(downloadedCapsule, \`\${JSON.stringify(capsule, null, 2)}\\n\`);
  } else {
    await page.locator('#capsulePassphrase').fill(passphrase);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#exportCapsule').click();
    const download = await downloadPromise;
    downloadedCapsule = path.join(artifactDir, await download.suggestedFilename());
    await download.saveAs(downloadedCapsule);
    await page.waitForFunction(() => /encrypted copy exported/i.test(document.getElementById('capsuleStatus')?.textContent || ''));
  }`;

const recoveryTarget = `  await recoveryPage.locator('.work-tab[data-workspace="save"]').click();
  await recoveryPage.waitForTimeout(250);`;
const recoveryReplacement = `  const recoveryEntry = recoveryPage.locator('#openCapsuleRecovery');
  const recoveryEntryVisible = await recoveryEntry.isVisible().catch(() => false);
  if (!recoveryEntryVisible) {
    report.seams.push({
      id: 'CAPSULE_RECOVERY_ENTRY_MISSING',
      severity: 'HIGH',
      surface: 'blank-browser launch',
      evidence: { launch_visible: await recoveryPage.locator('#launch').isVisible(), recovery_entry_visible: false },
      required_patch: 'Expose a launch-level encrypted Capsule recovery gesture before case creation.'
    });
    await screenshot(recoveryPage, '05-blank-browser-recovery.png');
    throw new Error('Blank-browser launch omitted the encrypted Capsule recovery entry.');
  }
  await recoveryEntry.click();
  await recoveryPage.waitForTimeout(250);`;

await fs.mkdir(artifactDir, { recursive: true });
const source = await fs.readFile(sourceUrl, 'utf8');
const navigationCount = source.split(navigationTarget).length - 1;
const initialBootCount = source.split(initialBootTarget).length - 1;
const exportCount = source.split(exportTarget).length - 1;
const recoveryCount = source.split(recoveryTarget).length - 1;
if (navigationCount !== 1) throw new Error(`Ash user flight expected one pathname-dependent arrival seam; observed ${navigationCount}.`);
if (initialBootCount !== 1) throw new Error(`Ash user flight expected one uncomposed local threshold seam; observed ${initialBootCount}.`);
if (exportCount !== 1) throw new Error(`Ash user flight expected one candidate export seam; observed ${exportCount}.`);
if (recoveryCount !== 1) throw new Error(`Ash user flight expected one modal-obscured recovery seam; observed ${recoveryCount}.`);
const runtime = source
  .replace(navigationTarget, navigationReplacement)
  .replace(initialBootTarget, initialBootReplacement)
  .replace(exportTarget, exportReplacement)
  .replace(recoveryTarget, recoveryReplacement);
if (runtime.includes('page.waitForURL(/\\/dome-world\\/ash-keep\\.html/')) throw new Error('Ash user flight retained pathname-dependent arrival logic.');
if (!runtime.includes('throughThreshold: !syntheticCustody')) throw new Error('Ash user flight failed to separate deployed threshold evidence from uncomposed local entry.');
if (!runtime.includes('td613-ash-capsule-local-')) throw new Error('Ash user flight failed to materialize a synthetic core Capsule export.');
if (!runtime.includes("locator('#openCapsuleRecovery')")) throw new Error('Ash user flight failed to materialize the launch recovery gesture.');
await fs.writeFile(runtimePath, runtime, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?flight=${Date.now()}`);
