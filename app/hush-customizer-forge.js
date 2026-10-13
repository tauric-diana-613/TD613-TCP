import { readCustomizerCardFields } from './hush-customizer-card-fields.js';

export const HUSH_CUSTOMIZER_FORGE_VERSION = 'phase-31';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);

export function validateCustomizerForgeFields(fields = {}) {
  const missing = [];
  if (!text(fields.family)) missing.push('family-missing');
  if (!text(fields.description)) missing.push('persona-story-missing');
  if (!text(fields.intendedUse)) missing.push('intended-use-missing');
  if (!text(fields.riskTell)) missing.push('risk-tell-missing');
  const hints = fields.transformHints || {};
  if (!text(hints.sentence)) missing.push('sentence-shape-missing');
  return { version: HUSH_CUSTOMIZER_FORGE_VERSION, passed: missing.length === 0, missing, warnings: missing.length ? ['customizer-forge-incomplete'] : [] };
}

export function buildCustomizerForgeState(doc = document) {
  const fields = readCustomizerCardFields(doc);
  const validation = validateCustomizerForgeFields(fields);
  const sampleText = text(byId('hushCustomMaskSampleInput', doc)?.value);
  return {
    version: HUSH_CUSTOMIZER_FORGE_VERSION,
    fields,
    validation,
    sampleWordCount: sampleText ? sampleText.split(/\s+/).filter(Boolean).length : 0,
    privateTextStored: false,
    preview: {
      label: text(byId('hushCustomMaskName', doc)?.value) || 'Unnamed Persona',
      family: fields.family || 'custom field mask',
      story: fields.description || 'Persona story pending.',
      intendedUse: fields.intendedUse || 'Use case pending.',
      riskTell: fields.riskTell || 'Risk tell pending.',
      warnings: [...list(fields.pressureWarnings), ...validation.missing]
    }
  };
}

export function renderCustomMaskPreview(target, state = {}) {
  if (!target) return null;
  const preview = state.preview || {};
  target.innerHTML = `<article class="forge-preview-card">
    <span class="persona-family">${preview.family}</span>
    <h3>${preview.label}</h3>
    <p>${preview.story}</p>
    <div class="persona-brief"><strong>Use when</strong><span>${preview.intendedUse}</span></div>
    <div class="persona-brief risk"><strong>Risk tell</strong><span>${preview.riskTell}</span></div>
    <div class="persona-chips">${list(preview.warnings).slice(0, 5).map((warning) => `<span class="persona-chip warning">${warning}</span>`).join('')}</div>
  </article>`;
  return state;
}

export function ensureCustomizerForgeShell(doc = document) {
  const fields = byId('hushCustomMaskCardFields', doc);
  if (!fields || byId('hushCustomizerForgePreview', doc)) return false;
  const shell = doc.createElement('section');
  shell.id = 'hushCustomizerForge';
  shell.className = 'hush-customizer-forge';
  shell.innerHTML = '<div class="forge-heading"><span>Customizer Forge</span><strong>preview / warnings / private text excluded</strong></div><div id="hushCustomizerForgePreview"></div>';
  fields.insertAdjacentElement('afterend', shell);
  return true;
}

export function renderCustomizerForge(doc = document) {
  ensureCustomizerForgeShell(doc);
  const state = buildCustomizerForgeState(doc);
  renderCustomMaskPreview(byId('hushCustomizerForgePreview', doc), state);
  return state;
}

export function initCustomizerForge(doc = document) {
  const render = () => renderCustomizerForge(doc);
  render();
  for (const el of doc.querySelectorAll('#hushCustomMaskCardFields input, #hushCustomMaskCardFields textarea, #hushCustomMaskName, #hushCustomMaskSampleInput')) el.addEventListener('input', render);
  return { version: HUSH_CUSTOMIZER_FORGE_VERSION, installed: Boolean(byId('hushCustomizerForge', doc)) };
}
