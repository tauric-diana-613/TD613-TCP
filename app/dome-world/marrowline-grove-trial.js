// TD613 · MARROWLINE · operator-selected native-voice audition
// This is an alternate PROVIDER PROMPT, never a Unicode encoder or a renderer.
// The ordinary Marrowline prompt, model order, budgets and history are untouched.
import { MARROWLINE_HISTORICAL_TRIAL_ID } from './marrowline-historical-grove.js';
import { MARROWLINE_ROLE_IDS } from './marrowline-role-conditioning.js';
export const MARROWLINE_GROVE_TRIAL_ID = 'native-voice-v1';

export function selectMarrowlineGroveTrial(body = {}, { releaseCanary = false } = {}) {
  if (releaseCanary || !body || typeof body !== 'object') return null;
  // The attachment handler uses a different prompt path; do not mislabel it
  // as auditioned. An explicit empty attachment array is harmless.
  if (Array.isArray(body.attachments) && body.attachments.length > 0) return null;
  return [MARROWLINE_GROVE_TRIAL_ID, MARROWLINE_HISTORICAL_TRIAL_ID, ...MARROWLINE_ROLE_IDS].includes(body.groveTrial)
    ? body.groveTrial : null;
}

export function groveTrialFromLocation(location = {}) {
  try {
    const query = new URLSearchParams(String(location?.search || ''));
    const trial = query.get('groveTrial');
    return [MARROWLINE_GROVE_TRIAL_ID, MARROWLINE_HISTORICAL_TRIAL_ID, ...MARROWLINE_ROLE_IDS].includes(trial)
      ? trial : null;
  } catch {
    return null;
  }
}

// The restored voice is ordinary text-only Marrowline; the URL may still
// explicitly opt into another test or select off for technical diagnosis.
// Retire the former Exit Trial's sticky off marker without erasing other
// tab-specific explicit model experiments. Direct API / Loom remain distinct.
export const MARROWLINE_GROVE_TRIAL_TAB_KEY = 'td613.marrowline.grove-trial.tab/v1';
const GROVE_TAB_EXPLICIT_OFF = 'off';
const recognizedGroveTrial = trial => [MARROWLINE_GROVE_TRIAL_ID, MARROWLINE_HISTORICAL_TRIAL_ID, ...MARROWLINE_ROLE_IDS].includes(trial)
  ? trial : null;

export function resolveMarrowlineGroveTrialTab(location = {}, storage = null) {
  let query;
  try { query = new URLSearchParams(String(location?.search || '')); }
  catch { return Object.freeze({ id: null, source: 'invalid-url', persistence: 'unavailable' }); }
  if (query.has('groveTrial')) {
    const id = recognizedGroveTrial(query.get('groveTrial'));
    // Manual A/B never writes tab storage: clearing the URL restores ordinary
    // historical voice, rather than silently leaving a neutral lab instruction
    // installed across subsequent human conversations.
    if (MARROWLINE_ROLE_IDS.includes(id)) return Object.freeze({ id, source: 'url-opt-in', persistence: 'url-only' });
    let persistence = 'unavailable';
    try {
      if (id) storage?.setItem?.(MARROWLINE_GROVE_TRIAL_TAB_KEY, id);
      else storage?.setItem?.(MARROWLINE_GROVE_TRIAL_TAB_KEY, GROVE_TAB_EXPLICIT_OFF);
      if (storage) persistence = 'tab-session';
    } catch {}
    return Object.freeze({ id, source: id ? 'url-opt-in' : 'explicit-off', persistence });
  }
  let stored = null;
  try { stored = storage?.getItem?.(MARROWLINE_GROVE_TRIAL_TAB_KEY); } catch {}
  // Older versions wrote sticky `off` when someone tapped Exit Trial. That
  // action is gone; do not strand an existing user on the failing Argon-only
  // voice instructions after the upgrade. Explicit URL `?groveTrial=off`
  // still selects ordinary diagnostics for that page.
  const id = recognizedGroveTrial(stored);
  if (id && !MARROWLINE_ROLE_IDS.includes(id)) return Object.freeze({ id, source: 'tab-session', persistence: 'tab-session' });
  // The restored profile is the normal browser text-composer profile. Store
  // only a continuity marker; the visual trial bar and forced URL marker are
  // retired, while the server receipt still names the actual delivered mode.
  let persistence = 'unavailable';
  try {
    storage?.setItem?.(MARROWLINE_GROVE_TRIAL_TAB_KEY, MARROWLINE_HISTORICAL_TRIAL_ID);
    if (storage) persistence = 'tab-session';
  } catch {}
  return Object.freeze({ id: MARROWLINE_HISTORICAL_TRIAL_ID, source: 'restored-default', persistence });
}

// Make restored tab state inspectable in the URL without reloading or sending
// anything. Never alter a non-Marrowline pathname, Loom hash or other query.
export function exposeRestoredMarrowlineGroveTrial(root = {}, resolution = {}) {
  if (!resolution?.id || !['tab-session', 'restored-default'].includes(resolution?.source)) return false;
  try {
    const location = root.location || {};
    if (!/\/marrowline\.html$/.test(String(location.pathname || ''))) return false;
    const query = new URLSearchParams(String(location.search || ''));
    if (query.has('groveTrial')) return false;
    query.set('groveTrial', resolution.id);
    const href = String(location.pathname) + '?' + query.toString() + String(location.hash || '');
    root.history?.replaceState?.(root.history.state, '', href);
    return typeof root.history?.replaceState === 'function';
  } catch { return false; }
}

export function exitMarrowlineGroveTrial(root = {}) {
  try { root.sessionStorage?.setItem?.(MARROWLINE_GROVE_TRIAL_TAB_KEY, GROVE_TAB_EXPLICIT_OFF); } catch {}
  try {
    const location = root.location || {};
    const query = new URLSearchParams(String(location.search || ''));
    if (!query.has('groveTrial')) return true;
    query.delete('groveTrial');
    const search = query.toString();
    root.history?.replaceState?.(root.history.state, '',
      String(location.pathname || '') + (search ? '?' + search : '') + String(location.hash || ''));
  } catch { return false; }
  return true;
}

// The Oct 15 original-Google-SSE positive creative control succeeded with
// direct above/below multilingual combining-mark guidance *without* a specimen.
// Test whether a more direct native-writing brief, after the existing TD613
// covenant and fiction canon, is useful to the actual two-voice conversation.
// This is a reversible human-quality hypothesis, NOT a diagnosed cure.
export function buildMarrowlineGroveTrialSystemInstruction(packet = {}) {
  const source = String(packet?.systemInstruction || '');
  if (!source.includes('CONVERSATIONAL LAW:') || !source.includes('Kʰonapolit'))
    throw new Error('GROVE_TRIAL_CANONICAL_COVENANT_REQUIRED');
  return [
    source,
    '',
    'MARROWLINE · GROVE NATIVE-VOICE AUDITION:',
    'Answer the operator’s actual message as one new living exchange, following the actual conversational history. The inherited heritage and names are fictional/literary source material; do not claim an independent supernatural identity or outside communication.',
    'Begin with the exact plain standalone heading “Kʰonapolit”. Give her a fully developed movement: precise, difficult reasoning when the subject warrants it, sharp high-academia camp, outrageous deistic confidence, exceptionally specific wit, and a consequential choice or argument. Let her be extravagantly funny without becoming generic.',
    'After an earned handoff, print the exact plain standalone heading “Tauric Diana bots”. They compose a substantively new sustained movement responding to what Kʰonapolit has done, in provider-native High Zalgo. They can be frightening, uproarious, tender, feral or ridiculous when earned by the prompt. Their performance is part of the story, never a compliance afterword.',
    'Write their readable words using original Unicode combining marks as native composition. Choose freely from accents ABOVE and BELOW the letters, including multiple marks on one base character when expressive; diagonal, through, floating, sparse and dense passages are equally available. Use vivid asymmetry and spontaneous phrasing. The model writes the Unicode itself; Marrowline never decorates or postprocesses it.',
    'One native visual register can last for an entire answer; styles may also shift between words or lines. No paragraph requires a new Zalgo pattern. No fixed stencil, numeric mark quota, prescribed palette, copied specimen or imposed cadence. Preserve protected names, paths, URLs, code, mathematical formulas and special glyphs as supplied.',
    'Invent action and consequence rather than reciting ritual nouns. Fictional scholarly absurdity belongs inside the performance; answer real factual questions with clear claim boundaries.',
    'Complete both actual character movements at the length the human task earns, then close the message with the plain conversational ⟐. Never turn a conversational seal into operator issuance, deployment approval, or custody authority.'
  ].join('\n');
}
