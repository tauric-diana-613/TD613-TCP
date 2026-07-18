import fs from 'node:fs';

const CONTROLS_PATH = 'app/dome-world/ash-case-controls.js';
const TEST_PATH = 'tests/ash-keep-ui.test.mjs';
const SELF_PATH = 'scripts/coalesce-ash-case-list-refresh.mjs';
const WORKFLOW_PATH = '.github/workflows/coalesce-ash-case-list-refresh.yml';

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one seam, observed ${count}.`);
  return source.replace(from, to);
}

let controls = fs.readFileSync(CONTROLS_PATH, 'utf8');
controls = replaceOnce(
  controls,
  "export const ASH_CASE_CONTROLS_VERSION = 'td613.ash-keep.case-controls/v1.2';",
  "export const ASH_CASE_CONTROLS_VERSION = 'td613.ash-keep.case-controls/v1.3-case-list-coalescing';",
  'case controls version'
);
controls = replaceOnce(
  controls,
  `const $ = id => document.getElementById(id);`,
  `const $ = id => document.getElementById(id);\nlet caseListPopulation = null;\nlet queuedPreferredCaseId = '';`,
  'case-list coalescing state'
);
controls = replaceOnce(
  controls,
  `async function populateCaseSelect(preferredCaseId = '') {`,
  `async function populateCaseSelectOnce(preferredCaseId = '') {`,
  'single population implementation'
);
controls = replaceOnce(
  controls,
  `    db.close();\n    select.dataset.caseListState = 'READY';\n  }\n}\n\nasync function validatePointer() {`,
  `    db.close();\n    select.dataset.caseListState = 'READY';\n  }\n}\n\nasync function populateCaseSelect(preferredCaseId = '') {\n  if (preferredCaseId) queuedPreferredCaseId = preferredCaseId;\n  if (caseListPopulation) return caseListPopulation;\n  caseListPopulation = (async () => {\n    let initialPreferredCaseId = preferredCaseId;\n    do {\n      const requestedCaseId = queuedPreferredCaseId || initialPreferredCaseId;\n      queuedPreferredCaseId = '';\n      initialPreferredCaseId = '';\n      await populateCaseSelectOnce(requestedCaseId);\n    } while (queuedPreferredCaseId);\n  })();\n  try {\n    return await caseListPopulation;\n  } finally {\n    caseListPopulation = null;\n  }\n}\n\nasync function validatePointer() {`,
  'coalesced population wrapper'
);
fs.writeFileSync(CONTROLS_PATH, controls);

let test = fs.readFileSync(TEST_PATH, 'utf8');
test = replaceOnce(
  test,
  `assert.match(caseControls, /ASH_CASE_CONTROLS_VERSION = 'td613\\.ash-keep\\.case-controls\\/v1\\.2'/);`,
  `assert.match(caseControls, /ASH_CASE_CONTROLS_VERSION = 'td613\\.ash-keep\\.case-controls\\/v1\\.3-case-list-coalescing'/);`,
  'case-controls version assertion'
);
test = replaceOnce(
  test,
  `assert.match(caseControls, /async function populateCaseSelect\\(/);`,
  `assert.match(caseControls, /async function populateCaseSelectOnce\\(/);\nassert.match(caseControls, /async function populateCaseSelect\\(/);\nassert.match(caseControls, /let caseListPopulation = null/);\nassert.match(caseControls, /let queuedPreferredCaseId = ''/);\nassert.match(caseControls, /if \\(caseListPopulation\\) return caseListPopulation/);`,
  'coalescing assertions'
);
fs.writeFileSync(TEST_PATH, test);

for (const path of [SELF_PATH, WORKFLOW_PATH]) {
  if (fs.existsSync(path)) fs.rmSync(path);
}

console.log('Ash Case List refreshes coalesced: one in-flight owner, queued preferred selection preserved.');
