const VERSION = 'hush-pr76-stable-profile-host/v2-disabled';

function noop() {
  return false;
}

window.__TD613_HUSH_PR76_STABLE_PROFILE_HOST__ = {
  version: VERSION,
  disabled: true,
  renderIntoStableHost: noop,
  scheduleStableRender: noop,
  deactivate: noop
};
