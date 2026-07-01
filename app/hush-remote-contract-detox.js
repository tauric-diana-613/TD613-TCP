import { auditHushCatchphraseQuarantine } from './engine/hush-catchphrase-quarantine.js';
import {
  HUSH_CONTRACT_SANITIZER_VERSION,
  sanitizeHushFlightPacket,
  sanitizeHushRemoteContract,
  sanitizeHushRemoteMask
} from './engine/hush-contract-sanitizer.js';

export const HUSH_REMOTE_CONTRACT_DETOX_VERSION = 'hush-remote-contract-detox/v1';

const safe = (value = '') => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

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
    payload.requestReceipt = { ...(payload.requestReceipt || {}), promptDetoxActive: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, catchphraseRejected: rejected.length, sanitizedContractVersion: HUSH_CONTRACT_SANITIZER_VERSION };
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
  win.__TD613_HUSH_REMOTE_CONTRACT_DETOX__ = Object.freeze({ installed: true, version: HUSH_REMOTE_CONTRACT_DETOX_VERSION, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, sanitizedContractVersion: HUSH_CONTRACT_SANITIZER_VERSION });
  return win.__TD613_HUSH_REMOTE_CONTRACT_DETOX__;
}

export { sanitizeHushRemoteMask, sanitizeHushFlightPacket, sanitizeHushRemoteContract };

if (typeof window !== 'undefined') installHushRemoteContractDetox(window);
