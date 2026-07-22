export const ASH_PROFILE_PROMPT_CANONICAL_VERSION = 'td613.ash.profile-prompt-canonical/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';

function noCaseOpen() {
  try { return !host.localStorage?.getItem?.(POINTER_KEY); }
  catch { return true; }
}

export function applyCanonicalProfilePrompt() {
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

  if (noCaseOpen()) select.value = '';
  const sync = () => {
    start.disabled = !select.value;
    start.setAttribute('aria-disabled', String(start.disabled));
  };
  if (select.dataset.ashCanonicalProfilePromptBound !== 'true') {
    select.dataset.ashCanonicalProfilePromptBound = 'true';
    select.addEventListener('change', sync);
  }
  sync();
  return true;
}

if (host && doc?.documentElement) {
  for (const type of ['aia-ready','aia3-ready','composition-stable','case-closed']) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(applyCanonicalProfilePrompt));
  }
  host.__td613AshProfilePromptCanonical = Object.freeze({
    version:ASH_PROFILE_PROMPT_CANONICAL_VERSION,
    refresh:applyCanonicalProfilePrompt
  });
  queueMicrotask(applyCanonicalProfilePrompt);
}
