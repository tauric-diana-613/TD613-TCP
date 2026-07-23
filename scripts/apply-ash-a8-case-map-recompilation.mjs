import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value);
const replaceOnce = (source, needle, replacement, label) => {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  return source.replace(needle, replacement);
};
const insertBefore = (source, anchor, insertion, label) => source.includes(insertion.trim()) ? source : replaceOnce(source, anchor, `${insertion}${anchor}`, label);

const htmlPath = 'app/dome-world/ash-keep.html';
const mirrorPath = 'app/dome-world/ash-keep-source.html';
let html = read(htmlPath);
const scriptAnchor = '  <script type="module" src="/dome-world/ash-keep.js"></script>';
html = insertBefore(html, scriptAnchor, '  <script type="module" src="/dome-world/ash-a8-case-map-recompilation.js"></script>\n', 'A8 HTML admission');
write(htmlPath, html);
write(mirrorPath, html);

const shellPath = 'api/dome-world-shell.js';
let shell = read(shellPath);
const shellAnchor = "  ['/dome-world/ash-a7-home-recompilation.js', '/dome-world/ash-a7-home-recompilation.js?v=20260723-a7-v1']\n]);";
const shellReplacement = "  ['/dome-world/ash-a7-home-recompilation.js', '/dome-world/ash-a7-home-recompilation.js?v=20260723-a7-v1'],\n  ['/dome-world/ash-a8-case-map-recompilation.js', '/dome-world/ash-a8-case-map-recompilation.js?v=20260723-a8-v1']\n]);";
shell = replaceOnce(shell, shellAnchor, shellReplacement, 'A8 shell registration');
write(shellPath, shell);

const indexPath = 'app/dome-world/docs/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md';
let index = read(indexPath);
index = index.replace('ASH A7 IMPLEMENTED ON BOUNDED BRANCH', 'ASH A7 MERGED AND RELEASED / ASH A8 IMPLEMENTED ON BOUNDED BRANCH');
index = insertBefore(index, '## Phase receipts\n', '16. `ASH_KEEP_A8_IMPLEMENTATION_RECEIPT_V0_1.md`\n\n', 'A8 constitutional source');
index = insertBefore(index, '\n## Engines\n', '| Ash A8 | `ASH_KEEP_A8_IMPLEMENTATION_RECEIPT_V0_1.md` | Case Map object placement, relation workshop, and inspection routes |\n', 'A8 phase row');
index = insertBefore(index, '\n## Ash whole-instrument recompilation extension\n', '- `ASH_KEEP_A8_IMPLEMENTATION_RECEIPT_V0_1.md`\n', 'A8 evidence instrument');
index = index.replace('A7 Home recompilation: IMPLEMENTED ON BOUNDED BRANCH / EXACT-HEAD VALIDATION OPEN\nA8-A19: NOT INCLUDED / HELD FOR LATER STAGES', 'A7 Home recompilation: IMPLEMENTED / MERGED / ONE BOUNDED RELEASE / RELOCKED\nA8 Case Map recompilation: IMPLEMENTED ON BOUNDED BRANCH / EXACT-HEAD VALIDATION OPEN\nA9-A19: NOT INCLUDED / HELD FOR LATER STAGES');
index = index.replace('A7 production demonstrated: false', 'A7 production demonstrated: true\nA8 production demonstrated: false');
const postureAnchor = '## Current honest promotion posture\n';
index = insertBefore(index, postureAnchor, `## A8 evidence posture\n\n\`\`\`text\nobject placement sequence: IMPLEMENTED / BROWSER WITNESS OPEN\nobject preview + deliberate add: IMPLEMENTED / BROWSER WITNESS OPEN\nObject A → relation → Object B workshop: IMPLEMENTED / BROWSER WITNESS OPEN\nrelationship preview + explicit commit: IMPLEMENTED / BROWSER WITNESS OPEN\ngraph/list/detail/notes/table inspection routes: IMPLEMENTED / BROWSER WITNESS OPEN\nexisting Ash map engine ownership: PRESERVED\nnew mass-eviction epoch: FALSE\nnew serverless function: FALSE\nraw-content transport: FALSE\nAsh authority changed: FALSE\nhuman closure: OPEN\n\`\`\`\n\n`, 'A8 posture');
write(indexPath, index);

if (JSON.parse(read('vercel.json')).git?.deploymentEnabled !== false) throw new Error('A8 integration requires the deployment gate closed');
fs.rmSync('scripts/apply-ash-a8-case-map-recompilation.mjs');
console.log(JSON.stringify({ ok:true, stage:'A8', mass_eviction_epoch_changed:false, gate:'CLOSED' }, null, 2));
