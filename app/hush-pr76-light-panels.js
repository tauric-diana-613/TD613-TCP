const VERSION = 'hush-pr76-light-panels/v2-disabled-provider-protection';

function noop() {
  return false;
}

window.__TD613_HUSH_PR76_LIGHT_PANELS__ = {
  version: VERSION,
  disabled: true,
  reason: 'provider-transform-protection',
  render: noop,
  hidePanels: noop
};
