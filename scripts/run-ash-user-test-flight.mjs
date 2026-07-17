import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = new URL('./ash-user-test-flight.mjs', import.meta.url);
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-user-test-flight');
const runtimePath = path.join(artifactDir, 'ash-user-test-flight.runtime.mjs');

const navigationTarget = String.raw`  await page.waitForURL(/\/dome-world\/ash-keep\.html/, { timeout: 60000 });`;
const navigationReplacement = `  await page.waitForFunction(() => location.pathname === '/dome-world/ash-keep.html'
    || Boolean(window.__td613AshKeep?.version), null, { timeout: 60000 });`;

const initialBootTarget = `  await bootAsh(page);`;
const initialBootReplacement = `  await bootAsh(page, { throughThreshold: !syntheticCustody });`;

const postCaseTarget = `  report.observations.case_creation = { case_id: await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case')), profile: 'research' };

  await page.locator('#objectName').fill('Held-before-custody');`;
const postCaseReplacement = `  report.observations.case_creation = { case_id: await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case')), profile: 'research' };

  const premiumHomeArrival = await page.evaluate(() => Boolean(window.__td613AshPremiumUI?.version));
  if (premiumHomeArrival) {
    await page.evaluate(() => window.__td613AshPremiumUI.open('map'));
  } else {
    await page.locator('.work-tab[data-workspace="map"]').click();
  }
  await page.waitForFunction(() => document.querySelector('.workspace.active')?.id === 'workspace-map');
  report.observations.case_creation.premium_home_arrival = premiumHomeArrival;
  report.observations.case_creation.map_opened_for_pre_custody_assay = true;

  await page.locator('#objectName').fill('Held-before-custody');`;

const reviewTarget = `  const reviewInputs = page.locator('[data-review]:not(:disabled)');
  for (let index = 0; index < await reviewInputs.count(); index += 1) await reviewInputs.nth(index).check();`;
const reviewReplacement = `  const premiumReviewGroups = await page.locator('#reviewChecks details.review-group').count();
  if (premiumReviewGroups) {
    await page.evaluate(() => document.querySelectorAll('#reviewChecks details.review-group').forEach(group => { group.open = true; }));
    await page.waitForFunction(() => [...document.querySelectorAll('[data-review]:not(:disabled)')].every(input => input.getClientRects().length > 0));
  }
  const reviewInputs = page.locator('[data-review]:not(:disabled)');
  for (let index = 0; index < await reviewInputs.count(); index += 1) await reviewInputs.nth(index).check();
  report.observations.rebuild.premium_review_groups_opened = premiumReviewGroups;`;

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
      const caseId = localStorage.getItem('td613-ash-keep.current-case');
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
const postCaseCount = source.split(postCaseTarget).length - 1;
const reviewCount = source.split(reviewTarget).length - 1;
const exportCount = source.split(exportTarget).length - 1;
const recoveryCount = source.split(recoveryTarget).length - 1;
if (navigationCount !== 1) throw new Error(`Ash user flight expected one pathname-dependent arrival seam; observed ${navigationCount}.`);
if (initialBootCount !== 1) throw new Error(`Ash user flight expected one uncomposed local threshold seam; observed ${initialBootCount}.`);
if (postCaseCount !== 1) throw new Error(`Ash user flight expected one post-case workspace seam; observed ${postCaseCount}.`);
if (reviewCount !== 1) throw new Error(`Ash user flight expected one exact-review seam; observed ${reviewCount}.`);
if (exportCount !== 1) throw new Error(`Ash user flight expected one candidate export seam; observed ${exportCount}.`);
if (recoveryCount !== 1) throw new Error(`Ash user flight expected one modal-obscured recovery seam; observed ${recoveryCount}.`);
const runtime = source
  .replace(navigationTarget, navigationReplacement)
  .replace(initialBootTarget, initialBootReplacement)
  .replace(postCaseTarget, postCaseReplacement)
  .replace(reviewTarget, reviewReplacement)
  .replace(exportTarget, exportReplacement)
  .replace(recoveryTarget, recoveryReplacement);
if (runtime.includes('page.waitForURL(/\\/dome-world\\/ash-keep\\.html/')) throw new Error('Ash user flight retained pathname-dependent arrival logic.');
if (!runtime.includes('throughThreshold: !syntheticCustody')) throw new Error('Ash user flight failed to separate deployed threshold evidence from uncomposed local entry.');
if (!runtime.includes("window.__td613AshPremiumUI.open('map')")) throw new Error('Ash user flight failed to acknowledge the premium Home arrival before its map assay.');
if (!runtime.includes('premium_review_groups_opened')) throw new Error('Ash user flight failed to acknowledge grouped review disclosure.');
if (!runtime.includes('td613-ash-capsule-local-')) throw new Error('Ash user flight failed to materialize a synthetic core Capsule export.');
if (!runtime.includes("locator('#openCapsuleRecovery')")) throw new Error('Ash user flight failed to materialize the launch recovery gesture.');
await fs.writeFile(runtimePath, runtime, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?flight=${Date.now()}`);
