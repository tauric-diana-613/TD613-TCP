import fs from 'node:fs';

const CONTROLS_PATH = 'app/dome-world/ash-case-controls.js';
const UI_TEST_PATH = 'tests/ash-keep-ui.test.mjs';
const LIFECYCLE_TEST_PATH = 'tests/product-architecture/lifecycle.test.mjs';
const SELF_PATH = 'scripts/retain-ash-case-selection.mjs';

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one seam, observed ${count}.`);
  return source.replace(from, to);
}

let controls = fs.readFileSync(CONTROLS_PATH, 'utf8');
controls = replaceOnce(
  controls,
  "export const ASH_CASE_CONTROLS_VERSION = 'td613.ash-keep.case-controls/v1.3-case-list-coalescing';",
  "export const ASH_CASE_CONTROLS_VERSION = 'td613.ash-keep.case-controls/v1.4-selection-retention';",
  'case controls version'
);
controls = replaceOnce(
  controls,
  `async function populateCaseSelectOnce(preferredCaseId = '') {\n  const select = $('selectCase');\n  if (!select) return;\n  select.dataset.caseListState = 'LOADING';\n  select.disabled = true;\n  setChoiceAvailability(false);`,
  `async function populateCaseSelectOnce(preferredCaseId = '') {\n  const select = $('selectCase');\n  if (!select) return;\n  const retainedCaseId = preferredCaseId || select.value || '';\n  select.dataset.caseListState = 'LOADING';\n  select.disabled = true;\n  if (!retainedCaseId) setChoiceAvailability(false);`,
  'selection retention capture'
);
controls = replaceOnce(
  controls,
  `    select.value = options.some(item => item.caseId === preferredCaseId) ? preferredCaseId : '';\n    setChoiceAvailability(Boolean(select.value));`,
  `    select.value = options.some(item => item.caseId === retainedCaseId) ? retainedCaseId : '';\n    setChoiceAvailability(Boolean(select.value));`,
  'selection retention restore'
);
fs.writeFileSync(CONTROLS_PATH, controls);

let uiTest = fs.readFileSync(UI_TEST_PATH, 'utf8');
uiTest = replaceOnce(
  uiTest,
  `assert.match(caseControls, /ASH_CASE_CONTROLS_VERSION = 'td613\\.ash-keep\\.case-controls\\/v1\\.3-case-list-coalescing'/);`,
  `assert.match(caseControls, /ASH_CASE_CONTROLS_VERSION = 'td613\\.ash-keep\\.case-controls\\/v1\\.4-selection-retention'/);`,
  'UI version contract'
);
uiTest = replaceOnce(
  uiTest,
  `assert.match(caseControls, /if \\(caseListPopulation\\) return caseListPopulation/);`,
  `assert.match(caseControls, /if \\(caseListPopulation\\) return caseListPopulation/);\nassert.match(caseControls, /const retainedCaseId = preferredCaseId \\|\\| select\\.value \\|\\| ''/);\nassert.match(caseControls, /item\\.caseId === retainedCaseId/);\nassert.match(caseControls, /if \\(!retainedCaseId\\) setChoiceAvailability\\(false\\)/);`,
  'UI selection retention contract'
);
fs.writeFileSync(UI_TEST_PATH, uiTest);

let lifecycleTest = fs.readFileSync(LIFECYCLE_TEST_PATH, 'utf8');
lifecycleTest = replaceOnce(
  lifecycleTest,
  `assert.match(caseControls, /td613\\.ash-keep\\.case-controls\\/v1\\.3-case-list-coalescing/);`,
  `assert.match(caseControls, /td613\\.ash-keep\\.case-controls\\/v1\\.4-selection-retention/);`,
  'lifecycle version contract'
);
lifecycleTest = replaceOnce(
  lifecycleTest,
  `assert.match(caseControls, /if \\(caseListPopulation\\) return caseListPopulation/);`,
  `assert.match(caseControls, /if \\(caseListPopulation\\) return caseListPopulation/);\nassert.match(caseControls, /const retainedCaseId = preferredCaseId \\|\\| select\\.value \\|\\| ''/);\nassert.match(caseControls, /item\\.caseId === retainedCaseId/);`,
  'lifecycle selection retention contract'
);
fs.writeFileSync(LIFECYCLE_TEST_PATH, lifecycleTest);

if (fs.existsSync(SELF_PATH)) fs.rmSync(SELF_PATH);
console.log('Ash Case List now retains a valid operator selection across background refreshes.');
