import { auditHushCatchphraseQuarantine } from './engine/hush-catchphrase-quarantine.js';

export const HUSH_REMOTE_CONTRACT_DETOX_VERSION = 'hush-remote-contract-detox/v1';

const safe = (value = '') => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const BAD_ROUTE_PHRASE = /leaving this|log off|paperwork comet|signal flare|boring part|record remains legible|small circle version|for the record|for reference|tiny flare|quasar|ghost/i;

function clone(value) {
  try { return JSON.parse(JSON.stringify(value || {})); } catch { return {}; }
}

function cleanList(values = []) {
  return [...new Set(asArray(values).map(safe).filter(Boolean))].filter((value) => !BAD_ROUTE_PHRASE.test(value));
}

function scrubStyle(style = {}) {
  const clean = clone(style);
  clean.bio = '';
  clean.personaBio = '';
  clean.persona_bio = '';
  clean.sample = '';
  clean.lexicon = cleanList(clean.lexicon);
  clean.transitions = cleanList(clean.transitions);
  clean.avoid = cleanList(clean.avoid);
  return clean;
}

export function sanitizeHushRemoteMask(mask = {}) {
  const clean = clone(mask);
  clean.description = '';
  clean.sampleSeed = '';
  clean.samples = [];
  clean.riskTell = '';
  clean.intendedUse = '';
  clean.exampleTransformPairs = [];
  clean.dictionHints = cleanList(clean.dictionHints);
  clean.transitionBank = cleanList(clean.transitionBank);
  if (clean.writingTraits) {
    clean.writingTraits.personaBio = '';
    clean.writingTraits.texture = safe(clean.writingTraits.texture).replace(BAD_ROUTE_PHRASE, '').trim();
  }
  if (clean.diversity) clean.diversity = scrubStyle(clean.diversity);
  if (clean.styleDiversity) clean.styleDiversity = scrubStyle(clean.styleDiversity);
  clean.__hushRemoteLoreQuarantine = Object.freeze({ active: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false });
  return clean;
}

export function sanitizeHushFlightPacket(packet = {}) {
  const clean = clone(packet);
  const vector = clean.mask_style_vector || {};
  vector.intended_use = '';
  vector.risk_tell = '';
  vector.sample_seed_excerpt = '';
  vector.diction_hints = cleanList(vector.diction_hints);
  vector.transition_bank = cleanList(vector.transition_bank);
  vector.desired_moves = cleanList(vector.desired_moves);
  if (vector.style_diversity) vector.style_diversity = scrubStyle(vector.style_diversity);
  clean.mask_style_vector = vector;
  clean.lore_quarantine = Object.freeze({ active: true, sample_seed_exported_to_provider: false, mask_lore_exported_to_provider: false, hook: HUSH_REMOTE_CONTRACT_DETOX_VERSION });
  return clean;
}

export function sanitizeHushRemoteContract(contract = {}) {
  const clean = clone(contract);
  clean.mask = sanitizeHushRemoteMask(clean.mask || {});
  clean.selectedMask = sanitizeHushRemoteMask(clean.selectedMask || clean.mask || {});
  clean.maskReferenceText = '';
  clean.referenceText = '';
  clean.promptDetox = Object.freeze({ active: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, hook: HUSH_REMOTE_CONTRACT_DETOX_VERSION });
  if (clean.flightPacket) clean.flightPacket = sanitizeHushFlightPacket(clean.flightPacket);
  return clean;
}

function isHushGenerateUrl(input) {
  const url = typeof input === 'string' ? input : input?.url || '';
  return /\/api\/hush-generate(?:\?|$)|\/api\/hush-generate-strict(?:\?|$)/.test(url);
}

function sanitizeBody(body) {
  if (!body || typeof body !== 'string') return body;
  try {
    const payload = JSON.parse(body);
    if (payload.contract) payload.contract = sanitizeHushRemoteContract(payload.contract);
    else if (payload.sourceText || payload.flightPacket || payload.mask || payload.selectedMask) return JSON.stringify(sanitizeHushRemoteContract(payload));
    return JSON.stringify(payload);
  } catch {
    return body;
  }
}

async function detoxResponse(response, contract = {}) {
  try {
    const payload = await response.clone().json();
    const sourceText = contract.sourceText || contract.messageDraftText || '';
    const rows = asArray(payload.candidates).map((candidate) => ({ candidate, audit: auditHushCatchphraseQuarantine({ text: candidate.text || candidate.output || '', sourceText, contract }) }));
    const rejected = rows.filter((row) => !row.audit.passed);
    payload.candidates = rows.filter((row) => row.audit.passed).map((row) => ({ ...row.candidate, catchphrase_quarantine: row.audit }));
    payload.warnings = [...new Set([...(payload.warnings || []), 'prompt-detox-active', 'sample-seed-quarantined', 'mask-lore-quarantined', ...(rejected.length ? ['catchphrase-quarantine-rejected-remote-candidate'] : [])])];
    payload.requestReceipt = { ...(payload.requestReceipt || {}), promptDetoxActive: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, catchphraseRejected: rejected.length };
    return new Response(JSON.stringify(payload), { status: response.status, statusText: response.statusText, headers: response.headers });
  } catch {
    return response;
  }
}

export function installHushRemoteContractDetox(win = globalThis.window) {
  if (!win || win.__TD613_HUSH_REMOTE_CONTRACT_DETOX__?.installed) return win?.__TD613_HUSH_REMOTE_CONTRACT_DETOX__ || { installed: false };
  const originalFetch = win.fetch?.bind(win);
  if (typeof originalFetch !== 'function') return { installed: false, reason: 'fetch-unavailable' };
  win.fetch = async (input, init = {}) => {
    if (!isHushGenerateUrl(input)) return originalFetch(input, init);
    const nextInit = { ...init };
    let contract = {};
    if (typeof nextInit.body === 'string') {
      try { contract = JSON.parse(nextInit.body).contract || JSON.parse(nextInit.body) || {}; } catch {}
      nextInit.body = sanitizeBody(nextInit.body);
      try { contract = JSON.parse(nextInit.body).contract || JSON.parse(nextInit.body) || {}; } catch {}
    }
    const response = await originalFetch(input, nextInit);
    return detoxResponse(response, contract);
  };
  win.__TD613_HUSH_REMOTE_CONTRACT_DETOX__ = Object.freeze({ installed: true, version: HUSH_REMOTE_CONTRACT_DETOX_VERSION, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false });
  return win.__TD613_HUSH_REMOTE_CONTRACT_DETOX__;
}

if (typeof window !== 'undefined') installHushRemoteContractDetox(window);
