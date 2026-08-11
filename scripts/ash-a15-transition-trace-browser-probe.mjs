import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a15-transition-trace-browser-probe-core.mjs');
const tempPath = path.join(scriptsDir, `.ash-a15-transition-trace-hardened-${process.pid}.mjs`);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(corePath, 'utf8');
source = replaceExactly(
  source,
  `    return witness?.observed === true
      && witness?.detail?.profile === selected
      && witness?.detail?.status === 'HYDRATED';`,
  `    return witness?.observed === true
      && witness?.detail?.profile === selected
      && witness?.detail?.status === 'HYDRATED'
      && witness?.detail?.automatic_ash_action === false;`,
  'A15 transition hydration authority closure'
);
source = replaceExactly(
  source,
  `  await page.waitForFunction(selected => {
    const current = window.__td613AshKeep?.current?.() || null;`,
  `  if (!hydrationReceipt || hydrationReceipt.profile !== profile || hydrationReceipt.status !== 'HYDRATED' || hydrationReceipt.automatic_ash_action !== false) {
    throw new Error(\`A15 transition hydration authority widened for \${profile}: \${JSON.stringify(hydrationReceipt)}\`);
  }

  await page.waitForFunction(selected => {
    const current = window.__td613AshKeep?.current?.() || null;`,
  'A15 transition hydration receipt validation'
);
if (!source.includes("witness?.detail?.automatic_ash_action === false")
    || !source.includes('hydrationReceipt.automatic_ash_action !== false')) {
  throw new Error('A15 transition hydration hardening did not compile into the generated probe.');
}
await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?td613_a15_transition_hardened=${Date.now()}`);
} finally {
  await fs.unlink(tempPath).catch(() => {});
}
