const VERSION = 'hush-pr76-profile-hold/v3-disabled';

function noop() {
  return false;
}

window.__TD613_HUSH_PR76_PROFILE_HOLD__ = {
  version: VERSION,
  disabled: true,
  restoreProfile: noop,
  scheduleHold: noop
};
