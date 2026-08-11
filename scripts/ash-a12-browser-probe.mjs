import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a12-browser-probe-v943-core.mjs');
const tempPath = path.join(scriptsDir, `.ash-a12-browser-probe-closed-case-${process.pid}.mjs`);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(corePath, 'utf8');
const oldCondition = `if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation') {`;
const newCondition = `if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation' || existing.case_closed === true) {`;
source = source.replaceAll(oldCondition, newCondition);
source = replaceExactly(
  source,
  `let source = await fs.readFile(corePath, 'utf8');`,
  `let source = await fs.readFile(corePath, 'utf8');

source = replaceExactly(
  source,
  \`      const existing = await page.evaluate(() => ({
        case_id:window.__td613AshKeep?.current?.()?.case_id || null,
        pointer:localStorage.getItem('td613.ash-keep.current-case'),
        profile:document.documentElement.dataset.ashDemoProfile
          || document.documentElement.dataset.ashDemoRegistryProfile
          || null
      }));\`,
  \`      const existing = await page.evaluate(() => ({
        case_id:window.__td613AshKeep?.current?.()?.case_id || null,
        pointer:localStorage.getItem('td613.ash-keep.current-case'),
        profile:document.documentElement.dataset.ashDemoProfile
          || document.documentElement.dataset.ashDemoRegistryProfile
          || null,
        case_closed:document.body.dataset.ashCaseClosed === 'true'
      }));\`,
  'A12 closed Investigation case visibility'
);
source = replaceExactly(
  source,
  \`      if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation') {\`,
  \`      if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation' || existing.case_closed === true) {\`,
  'A12 closed Investigation case reactivation'
);`,
  'A12 closed-case source transform injection'
);

if (!source.includes('existing.case_closed === true') || !source.includes("case_closed:document.body.dataset.ashCaseClosed === 'true'")) {
  throw new Error('A12 closed-case reactivation hardening did not compile into the wrapper.');
}

await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?td613_a12_closed_case=${Date.now()}`);
} finally {
  await fs.unlink(tempPath).catch(() => {});
}
