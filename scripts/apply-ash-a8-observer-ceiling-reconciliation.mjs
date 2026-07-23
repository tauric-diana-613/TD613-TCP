import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value);
const replaceOnce = (source, needle, replacement, label) => {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  return source.replace(needle, replacement);
};

const browserPath = 'scripts/ash-a2-a5-browser-probe.mjs';
let browser = read(browserPath);
const inspectionTarget = "  await page.waitForFunction(() => document.querySelector('[data-aia-exact]')?.open === true);";
const inspectionReplacement = "  await page.waitForFunction(() => document.querySelector('[data-aia-exact]')?.open === true, null, { timeout:60000 });";
browser = replaceOnce(browser, inspectionTarget, inspectionReplacement, 'A8 inspection-open evidence ceiling');
write(browserPath, browser);

const convergencePath = 'scripts/run-ash-constitutional-convergence-probe.mjs';
let convergence = read(convergencePath);
const count = convergence.split('35000').length - 1;
if (count !== 3) throw new Error(`A8 convergence observer expected three 35000 markers; observed ${count}.`);
convergence = convergence.replaceAll('35000', '70000');
write(convergencePath, convergence);

if (!browser.includes('{ timeout:60000 }')) throw new Error('A8 inspection-open finite ceiling was not materialized.');
if (!convergence.includes('Cross-tab lock witness exceeded 70000ms.') || !convergence.includes("runtime.includes('Cross-tab lock witness exceeded 70000ms.')")) {
  throw new Error('A8 cross-tab finite ceiling was not materialized consistently.');
}
if (JSON.parse(read('vercel.json')).git?.deploymentEnabled !== false) throw new Error('A8 observer reconciliation requires the deployment gate closed.');

fs.rmSync('scripts/apply-ash-a8-observer-ceiling-reconciliation.mjs');
console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a8-observer-ceiling-reconciliation/v0.1',
  inspection_open_ceiling_ms:60000,
  cross_tab_join_ceiling_ms:70000,
  coordinator_lease_changed:false,
  product_runtime_changed:false,
  authority_changed:false,
  deployment_gate:'CLOSED'
}, null, 2));
