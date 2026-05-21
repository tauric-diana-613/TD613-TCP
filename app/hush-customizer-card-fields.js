const FIELD_DEFS = [
  ['hushCustomMaskFamily', 'Family', 'custom field mask'],
  ['hushCustomMaskDescription', 'Persona Story', 'A short scene or context for this mask.'],
  ['hushCustomMaskIntendedUse', 'Use When', 'Where this mask should be used.'],
  ['hushCustomMaskRiskTell', 'Risk Tell', 'What can become identifying or unstable.'],
  ['hushCustomMaskSentence', 'Sentence Shape', 'short / mid / long / jagged'],
  ['hushCustomMaskOrnament', 'Ornament', 'low / medium / high'],
  ['hushCustomMaskWarmth', 'Warmth', 'low / medium / high'],
  ['hushCustomMaskCustody', 'Custody', 'medium / high / very-high'],
  ['hushCustomMaskCadence', 'Cadence', 'register or rhythm note'],
  ['hushCustomMaskWarnings', 'Pressure Warnings', 'comma or line separated warnings']
];

const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);

function fieldShell(id, label, placeholder) {
  const area = id === 'hushCustomMaskDescription' || id === 'hushCustomMaskIntendedUse' || id === 'hushCustomMaskRiskTell' || id === 'hushCustomMaskWarnings';
  const input = area
    ? `<textarea id="${id}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${placeholder}"></textarea>`
    : `<input id="${id}" autocomplete="off" placeholder="${placeholder}" />`;
  return `<label class="hush-field-shell hush-custom-card-field" for="${id}"><span class="hush-field-label">${label}</span>${input}</label>`;
}

export function ensureCustomizerCardFields(doc = document) {
  const name = byId('hushCustomMaskName', doc);
  if (!name || byId('hushCustomMaskFamily', doc)) return false;
  const wrapper = doc.createElement('div');
  wrapper.id = 'hushCustomMaskCardFields';
  wrapper.className = 'hush-custom-card-fields';
  wrapper.innerHTML = FIELD_DEFS.map(([id, label, placeholder]) => fieldShell(id, label, placeholder)).join('');
  name.closest('label')?.insertAdjacentElement('afterend', wrapper);
  return true;
}

export function readCustomizerCardFields(doc = document) {
  const warnings = text(byId('hushCustomMaskWarnings', doc)?.value).split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  return {
    family: text(byId('hushCustomMaskFamily', doc)?.value),
    description: text(byId('hushCustomMaskDescription', doc)?.value),
    intendedUse: text(byId('hushCustomMaskIntendedUse', doc)?.value),
    riskTell: text(byId('hushCustomMaskRiskTell', doc)?.value),
    sampleSeed: text(byId('hushCustomMaskSampleInput', doc)?.value),
    transformHints: {
      sentence: text(byId('hushCustomMaskSentence', doc)?.value),
      ornament: text(byId('hushCustomMaskOrnament', doc)?.value),
      warmth: text(byId('hushCustomMaskWarmth', doc)?.value),
      custody: text(byId('hushCustomMaskCustody', doc)?.value),
      cadence: text(byId('hushCustomMaskCadence', doc)?.value)
    },
    pressureWarnings: warnings
  };
}

export function applyCustomizerCardFieldsToMask(mask = {}, fields = {}) {
  const transformHints = { ...(mask.transformHints || {}), ...(fields.transformHints || {}) };
  const pressureWarnings = fields.pressureWarnings?.length ? fields.pressureWarnings : (mask.pressureWarnings || []);
  return {
    ...mask,
    family: fields.family || mask.family || 'custom field mask',
    description: fields.description || mask.description || '',
    intendedUse: fields.intendedUse || mask.intendedUse || '',
    riskTell: fields.riskTell || mask.riskTell || '',
    sampleSeed: fields.sampleSeed || mask.sampleSeed || '',
    transformHints,
    pressureWarnings
  };
}

export function enhanceSavedCustomMask(bench = {}, doc = document) {
  const state = bench.benchState || {};
  const fields = readCustomizerCardFields(doc);
  const customMasks = Array.isArray(state.customMasks) ? state.customMasks : [];
  const target = state.activeCustomMask || customMasks.find((mask) => mask.id === state.selectedHushMaskId) || customMasks[customMasks.length - 1];
  if (!target) return null;
  const enhanced = applyCustomizerCardFieldsToMask(target, fields);
  const index = customMasks.findIndex((mask) => mask.id === enhanced.id);
  if (index >= 0) customMasks[index] = enhanced;
  state.activeCustomMask = enhanced;
  state.selectedHushMask = enhanced;
  state.selectedHushMaskId = enhanced.id;
  if (typeof bench.renderHushMaskOptions === 'function') bench.renderHushMaskOptions();
  if (typeof bench.selectHushMask === 'function') bench.selectHushMask(enhanced.id);
  return enhanced;
}

export function initHushCustomizerCardFields(doc = document, bench = globalThis.__TD613_HUSH_BENCH__) {
  ensureCustomizerCardFields(doc);
  const save = byId('hushSaveCustomMaskBtn', doc);
  const add = byId('hushAddSampleBtn', doc);
  const handler = () => setTimeout(() => enhanceSavedCustomMask(bench, doc), 0);
  save?.addEventListener('click', handler);
  add?.addEventListener('click', handler);
  return { installed: Boolean(save || add), fields: FIELD_DEFS.map(([id]) => id) };
}
