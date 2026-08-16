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
  button.textContent = 'Close shared access';
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
    if (!state?.configured || !state?.owner_session) {
      button.hidden = true;
      return;
    }

    const locked = state.shared_access === 'LOCKED';
    const promptText = locked
      ? 'Reopen the shared Giving access secret for collaborators? Sessions issued before the last lock stay revoked.'
      : 'Evict every shared Giving session and block the shared access secret until an owner reopens it?';
    if (!window.confirm(promptText)) return;

    const ownerSecret = window.prompt('Enter the separate Giving owner secret to authorize this access change.');
    if (!ownerSecret) return;

    const operation = locked ? 'session.shared-access.enable' : 'session.shared-access.revoke';
    await api.call(operation, { owner_secret: ownerSecret }, {
      mutation: true,
      purpose: locked ? 'reopen shared Giving access' : 'evict shared Giving sessions'
    });
    window.alert(locked
      ? 'Shared Giving access reopened. Previously evicted sessions remain invalid; collaborators must sign in again.'
      : 'Shared Giving access locked. Existing collaborator sessions were evicted and the shared secret cannot open a new collaborator session until an owner reopens it.');
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
    button.hidden = !state?.configured || !state?.owner_session;
    if (button.hidden) return;
    const locked = state.shared_access === 'LOCKED';
    button.textContent = locked ? 'Reopen shared access' : 'Close shared access';
    button.dataset.sharedAccess = String(state.shared_access || 'UNKNOWN').toLowerCase();
    button.setAttribute('aria-label', locked
      ? 'Shared Giving access locked; reopen collaborator access'
      : 'Close shared Giving access and evict collaborator sessions');
    button.title = locked
      ? 'Reopen shared access · previously evicted sessions stay invalid'
      : 'Evict every collaborator session and block shared sign-in';
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
