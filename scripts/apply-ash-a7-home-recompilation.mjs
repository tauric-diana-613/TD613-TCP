import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value);
const replaceOnce = (source, needle, replacement, label) => {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  return source.replace(needle, replacement);
};
const insertBefore = (source, anchor, insertion, label) => {
  if (source.includes(insertion.trim())) return source;
  return replaceOnce(source, anchor, `${insertion}${anchor}`, label);
};

const htmlPath = 'app/dome-world/ash-keep.html';
let html = read(htmlPath);
const sourceAnchor = '  <script type="module" src="/dome-world/ash-keep.js"></script>';
html = insertBefore(html, sourceAnchor,
  '  <script type="module" src="/dome-world/ash-a7-a11-recompiler-core.js"></script>\n  <script type="module" src="/dome-world/ash-a7-home-recompilation.js"></script>\n',
  'A7 HTML module admission');
write(htmlPath, html);

const shellPath = 'api/dome-world-shell.js';
let shell = read(shellPath);
const shellAnchor = "  ['/dome-world/ash-case-controls.js', `/dome-world/ash-case-controls.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`]\n]);";
const shellReplacement = "  ['/dome-world/ash-case-controls.js', `/dome-world/ash-case-controls.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`],\n  ['/dome-world/ash-a7-a11-recompiler-core.js', '/dome-world/ash-a7-a11-recompiler-core.js?v=20260723-a7-v1'],\n  ['/dome-world/ash-a7-home-recompilation.js', '/dome-world/ash-a7-home-recompilation.js?v=20260723-a7-v1']\n]);";
shell = replaceOnce(shell, shellAnchor, shellReplacement, 'A7 canonical bootstrap');
write(shellPath, shell);

const premiumPath = 'app/dome-world/ash-premium-ui.js';
let premium = read(premiumPath);
const premiumAnchor = "function renderHome(doc, snapshot) {\n  const target = byId(doc, 'premiumHomeBody');";
const premiumReplacement = "function renderHome(doc, snapshot) {\n  const a7Renderer = globalThis.window?.__td613AshA7Home?.render;\n  if (typeof a7Renderer === 'function') { a7Renderer(snapshot); return; }\n  const target = byId(doc, 'premiumHomeBody');";
premium = replaceOnce(premium, premiumAnchor, premiumReplacement, 'A7 Premium Home delegation');
write(premiumPath, premium);

const indexPath = 'app/dome-world/docs/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md';
let index = read(indexPath);
index = index.replace(
  '**Status:** IMPLEMENTATION INDEX COMPLETE / BROWSER RUNTIME OBSERVED / ASH A0–A5 MERGED AND RELEASED / ASH A6 DRAFT IMPLEMENTED / EMPIRICAL HOLD VISIBLE / HUMAN CLOSURE OPEN',
  '**Status:** IMPLEMENTATION INDEX COMPLETE / BROWSER RUNTIME OBSERVED / ASH A0–A6 MERGED AND RELEASED / ASH A7 IMPLEMENTED ON BOUNDED BRANCH / EMPIRICAL HOLD VISIBLE / HUMAN CLOSURE OPEN');
index = insertBefore(index, '## Phase receipts\n', '15. `ASH_KEEP_A7_IMPLEMENTATION_RECEIPT_V0_1.md`\n\n', 'A7 constitutional source');
index = insertBefore(index, '\n## Engines\n', '| Ash A7 | `ASH_KEEP_A7_IMPLEMENTATION_RECEIPT_V0_1.md` | Home Current Priority, Continuity, and route-ledger recompilation |\n', 'A7 phase row');
index = insertBefore(index, '\n## Ash whole-instrument recompilation extension\n', '- `ASH_KEEP_A7_IMPLEMENTATION_RECEIPT_V0_1.md`\n', 'A7 evidence instrument');
index = index.replace('A6 affordance and drawer repair: IMPLEMENTED ON DRAFT BRANCH / EXACT-HEAD VALIDATION OPEN\nA7-A19: NOT INCLUDED / HELD FOR LATER STAGES', 'A6 affordance and drawer repair: IMPLEMENTED / MERGED / ONE BOUNDED RELEASE / RELOCKED\nA7 Home recompilation: IMPLEMENTED ON BOUNDED BRANCH / EXACT-HEAD VALIDATION OPEN\nA8-A19: NOT INCLUDED / HELD FOR LATER STAGES');
index = index.replace('PR: #582 DRAFT\npost-closure: OPEN\nVercel deployment: FORBIDDEN UNTIL POST-CLOSURE', 'PR: #582 MERGED\npost-closure: COMPLETE\nVercel deployment: ONE BOUNDED WAVE COMPLETE / RELOCKED');
index = index.replace('implementation state: HARDENED THROUGH A5 / A6 VALIDATION OPEN\nruntime browser matrix: A2-A5 PASS / A6 OPEN\nChromium observation: A6 OPEN\nFirefox observation: A6 OPEN\nWebKit/iOS-sized observation: A6 OPEN', 'implementation state: HARDENED THROUGH A6 / A7 VALIDATION OPEN\nruntime browser matrix: A2-A6 PASS / A7 OPEN\nChromium observation: A6 PASS / A7 OPEN\nFirefox observation: A6 PASS / A7 OPEN\nWebKit/iOS-sized observation: A6 PASS / A7 OPEN');
index = index.replace('A6 production demonstrated: false', 'A6 production demonstrated: true\nA7 production demonstrated: false');
const postureAnchor = '## Current honest promotion posture\n';
const a7Posture = `## A7 evidence posture\n\n\`\`\`text\nCurrent Priority six-answer contract: IMPLEMENTED / BROWSER WITNESS OPEN\none primary Home action: IMPLEMENTED / BROWSER WITNESS OPEN\nContinuity attached/stale/return/recheck/unsealed answers: IMPLEMENTED / BROWSER WITNESS OPEN\nWhat has already left route ledger: IMPLEMENTED / BROWSER WITNESS OPEN\nPremium Home render delegation: IMPLEMENTED / BROWSER WITNESS OPEN\nnew mass-eviction epoch: FALSE\nunique bounded module admission: TRUE\nnew serverless function: FALSE\nraw-content transport: FALSE\nAsh authority changed: FALSE\nhuman closure: OPEN\n\`\`\`\n\n`;
index = insertBefore(index, postureAnchor, a7Posture, 'A7 evidence posture');
write(indexPath, index);

const vercel = JSON.parse(read('vercel.json'));
if (vercel.git?.deploymentEnabled !== false) throw new Error('A7 integrator requires the Vercel gate closed');

fs.rmSync('scripts/apply-ash-a7-home-recompilation.mjs');
console.log(JSON.stringify({ ok:true, stage:'A7', mass_eviction_epoch_changed:false, deployment_gate:'CLOSED', permanent_ci_registration_deferred:true }, null, 2));
