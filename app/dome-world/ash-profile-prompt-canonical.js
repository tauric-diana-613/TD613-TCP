export const ASH_PROFILE_PROMPT_CANONICAL_VERSION = 'td613.ash.profile-prompt-canonical/v0.2-explicit-choice-stable';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
let explicitChoice = '';

function noCaseOpen() {
  try { return !host.localStorage?.getItem?.(POINTER_KEY); }
  catch { return true; }
}

export function applyCanonicalProfilePrompt({ resetSelection = false } = {}) {
  const select = doc?.getElementById('newProfile');
  const start = doc?.getElementById('startDemo');
  if (!select || !start) return false;

  let prompt = select.querySelector('option[value=""]');
  if (!prompt) {
    prompt = doc.createElement('option');
    prompt.value = '';
    select.prepend(prompt);
  }
  prompt.textContent = 'Select a Profile...';
  prompt.disabled = true;

  const firstBinding = select.dataset.ashCanonicalProfilePromptBound !== 'true';
  const explicitChoiceAvailable = [...select.options].some(option => option.value === explicitChoice);
  if (resetSelection) explicitChoice = '';
  if (noCaseOpen()) {
    if (resetSelection || (firstBinding && !explicitChoice)) select.value = '';
    else if (explicitChoice && explicitChoiceAvailable) select.value = explicitChoice;
  }

  const sync = () => {
    if (select.value) explicitChoice = select.value;
    start.disabled = !select.value;
    start.setAttribute('aria-disabled', String(start.disabled));
    select.dataset.ashProfileChoiceExplicit = String(Boolean(explicitChoice));
  };
  if (firstBinding) {
    select.dataset.ashCanonicalProfilePromptBound = 'true';
    select.addEventListener('change', sync);
  }
  sync();
  return true;
}

if (host && doc?.documentElement) {
  for (const type of ['aia-ready','aia3-ready','composition-stable']) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => applyCanonicalProfilePrompt()));
  }
  host.addEventListener('td613:ash:case-closed', () => queueMicrotask(() => applyCanonicalProfilePrompt({ resetSelection:true })));
  host.__td613AshProfilePromptCanonical = Object.freeze({
    version:ASH_PROFILE_PROMPT_CANONICAL_VERSION,
    refresh:applyCanonicalProfilePrompt,
    current:() => Object.freeze({ explicit_choice:explicitChoice || null, case_open:!noCaseOpen() })
  });
  queueMicrotask(() => applyCanonicalProfilePrompt({ resetSelection:true }));
}
