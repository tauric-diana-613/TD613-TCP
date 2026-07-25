import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = new URL('./ash-research-ux-browser-probe-base.mjs', import.meta.url);
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-research-ux-runtime');
const runtimePath = path.join(artifactDir, 'ash-research-ux-browser-probe.runtime.mjs');

const geometryTarget = `async function waitForWorkspaceGeometry(page, workspace) {
  await page.waitForFunction(name => {
    const panel = document.getElementById(\`workspace-\${name}\`);
    if (!panel?.classList.contains('active')) return false;
    const style = getComputedStyle(panel);
    const rect = panel.getBoundingClientRect();
    return document.documentElement.dataset.ashPremiumWorkspace === name
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) > 0
      && rect.width > 0
      && rect.height > 0;
  }, workspace);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}`;

const geometryReplacement = `async function waitForRegistryOwnedWorkspaceControl(page) {
  await page.waitForFunction(() => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.() || null;
    const open = window.__td613AshPremiumUI?.open
      || window.__td613AshUiUxRescue?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    return window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.1-a13'
      && registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoRegistry === 'td613.ash.demo-registry/v0.1-a13'
      && typeof open === 'function';
  }, null, { timeout:60_000 });
}

async function openGovernedWorkspace(page, workspace) {
  await waitForRegistryOwnedWorkspaceControl(page);
  await page.evaluate(async name => {
    const open = window.__td613AshPremiumUI?.open
      || window.__td613AshUiUxRescue?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (typeof open !== 'function') throw new Error('A13 governed workspace owner unavailable.');
    await Promise.resolve(open(name));
  }, workspace);
}

async function waitForWorkspaceGeometry(page, workspace) {
  await page.waitForFunction(name => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.() || null;
    const panel = document.getElementById(\`workspace-\${name}\`);
    if (!panel?.classList.contains('active')) return false;
    const style = getComputedStyle(panel);
    const rect = panel.getBoundingClientRect();
    return registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashPremiumWorkspace === name
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) > 0
      && style.pointerEvents !== 'none'
      && rect.width > 0
      && rect.height > 0;
  }, workspace, { timeout:60_000 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}`;

const workDockTarget = `async function openWorkDock(page) {
  const current = await page.evaluate(() => document.documentElement.dataset.ashPremiumWorkspace || null);
  if (current !== 'work') {
    const button = page.locator('#premiumPrimaryDock [data-premium-workspace="work"]');
    await button.click();
    await waitForWorkspaceGeometry(page, 'work');
  }
  await page.locator('#researchHydrationLedger').waitFor({ state:'visible' });
}`;

const workDockReplacement = `async function openWorkDock(page) {
  const current = await page.evaluate(() => document.documentElement.dataset.ashPremiumWorkspace || null);
  if (current !== 'work') {
    await waitForRegistryOwnedWorkspaceControl(page);
    const button = page.locator('#premiumPrimaryDock [data-premium-workspace="work"]');
    await button.click();
    await openGovernedWorkspace(page, 'work');
  }
  await waitForWorkspaceGeometry(page, 'work');
  await page.locator('#researchHydrationLedger').waitFor({ state:'visible' });
}`;

const ledgerTarget = `async function openFromLedger(page, workspace) {
  if (workspace === 'work') {
    await openWorkDock(page);
    await waitForWorkspaceGeometry(page, 'work');
    return workspaceState(page, 'work');
  }
  await openWorkDock(page);
  const button = page.locator(\`[data-research-open="\${workspace}"]\`).first();
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await waitForWorkspaceGeometry(page, workspace);
  return workspaceState(page, workspace);
}`;

const ledgerReplacement = `async function openFromLedger(page, workspace) {
  if (workspace === 'work') {
    await openWorkDock(page);
    return workspaceState(page, 'work');
  }
  await openWorkDock(page);
  await waitForRegistryOwnedWorkspaceControl(page);
  const button = page.locator(\`[data-research-open="\${workspace}"]\`).first();
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await openGovernedWorkspace(page, workspace);
  await waitForWorkspaceGeometry(page, workspace);
  return workspaceState(page, workspace);
}`;

function replaceExactlyOnce(source, target, replacement, label) {
  const count = source.split(target).length - 1;
  if (count !== 1) throw new Error(`Research witness expected one ${label} seam; observed ${count}.`);
  return source.replace(target, replacement);
}

await fs.mkdir(artifactDir, { recursive:true });
const source = await fs.readFile(sourceUrl, 'utf8');
let runtime = replaceExactlyOnce(source, geometryTarget, geometryReplacement, 'workspace geometry');
runtime = replaceExactlyOnce(runtime, workDockTarget, workDockReplacement, 'Work dock');
runtime = replaceExactlyOnce(runtime, ledgerTarget, ledgerReplacement, 'Research ledger navigation');
runtime = runtime.replace('td613.ash.research-ux-browser-evidence/v0.3-a4-semantic-navigation', 'td613.ash.research-ux-browser-evidence/v0.4-a13-registry-owned-navigation');

for (const token of [
  'profile=research',
  '__td613AshResearchSurfaceReport',
  'window.__td613AshDemoRegistry',
  "control_owner === 'ASH_DEMO_REGISTRY'",
  "ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'",
  'openGovernedWorkspace(page, workspace)',
  'waitForRegistryOwnedWorkspaceControl(page)'
]) {
  if (!runtime.includes(token)) throw new Error(`Research owner-gated runtime omitted ${token}.`);
}

await fs.writeFile(runtimePath, runtime, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?runtime=${Date.now()}`);
