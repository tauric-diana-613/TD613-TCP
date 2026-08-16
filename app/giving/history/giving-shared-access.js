import { GivingApiClient, GivingApiError } from './giving-api.js';

const api = new GivingApiClient();
const BUTTON_ID = 'sharedAccessControl';

function message(error) {
  if (error instanceof GivingApiError) return error.message;
  return String(error?.message || error || 'Shared access control did not complete.');
}

function ensureButton() {
  const actions = document.querySelector('.mast-actions');
  if (!actions) return null;
  let button = document.getElementById(BUTTON_ID);
  if (button) return button;
  button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.className = 'button quiet';
  button.textContent = 'Shared access';
  button.title = 'Owner control for evicting shared Giving sessions';
  button.hidden = true;
  actions.insertBefore(button, document.getElementById('signOutButton') || null);
  return button;
}

async function sharedState() {
  await api.status();
  const result = await api.call('session.shared-access.status', {}, {
    mutation: false,
    purpose: 'inspect shared Giving access'
  });
  return result?.data || null;
}

async function runControl() {
  const button = ensureButton();
  if (!button) return;
  button.disabled = true;
  try {
    const state = await sharedState();
    if (!state?.configured) {
      window.alert('Shared-session eviction is not configured yet. Giving needs a separate owner secret plus its admitted Neon custody boundary before this control can lock collaborators out.');
      return;
    }

    const locked = state.shared_access === 'LOCKED';
    if (locked && !state.owner_session) {
      window.alert('Shared Giving access is locked. Re-enter with the owner secret to reopen it.');
      return;
    }

    const promptText = locked
      ? 'Reopen the shared Giving access secret for collaborators? Sessions issued before the last lock stay revoked.'
      : 'Evict every shared Giving session and block the shared access secret until an owner reopens it?';
    if (!window.confirm(promptText)) return;

    const ownerSecret = window.prompt('Enter the separate Giving owner secret to authorize this access change.');
    if (!ownerSecret) return;

    const operation = locked ? 'session.shared-access.enable' : 'session.shared-access.revoke';
    const result = await api.call(operation, { owner_secret: ownerSecret }, {
      mutation: true,
      purpose: locked ? 'reopen shared Giving access' : 'evict shared Giving sessions'
    });
    const next = result?.data || {};
    window.alert(locked
      ? 'Shared Giving access reopened. Previously evicted sessions remain invalid; collaborators must sign in again.'
      : 'Shared Giving access locked. Existing collaborator sessions were evicted and the shared secret cannot open a new collaborator session until an owner reopens it.');
    if (next.current_session_closed) {
      location.reload();
      return;
    }
    location.reload();
  } catch (error) {
    window.alert(message(error));
  } finally {
    button.disabled = false;
  }
}

async function refreshButton() {
  const button = ensureButton();
  if (!button || document.documentElement.dataset.session !== 'open') {
    if (button) button.hidden = true;
    return;
  }
  try {
    const state = await sharedState();
    button.hidden = !state?.configured;
    if (button.hidden) return;
    button.dataset.sharedAccess = String(state.shared_access || 'UNKNOWN').toLowerCase();
    button.setAttribute('aria-label', state.shared_access === 'LOCKED'
      ? 'Shared Giving access locked; owner can reopen access'
      : 'Shared Giving access open; owner can evict collaborator sessions');
    button.title = state.shared_access === 'LOCKED'
      ? 'Shared access locked · owner session required to reopen'
      : 'Shared access open · evict every collaborator session and block shared sign-in';
  } catch {
    button.hidden = true;
  }
}

const button = ensureButton();
button?.addEventListener('click', runControl);

const observer = new MutationObserver(() => {
  void refreshButton();
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-session'] });
void refreshButton();
