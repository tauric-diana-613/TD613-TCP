import assert from 'node:assert/strict';
import { openRouteInNewTab } from '../app/dome-world/domeblox/game/navigation.js';

{
  const navigated = [];
  const popup = {
    opener: 'parent',
    location: { replace: href => navigated.push(href) },
    close: () => { throw new Error('successful popup must not close'); },
  };
  const environment = {
    location: { href: 'https://td613.com/dome-world/domeblox/', assign: () => { throw new Error('same-tab fallback must not run'); } },
    open: () => popup,
  };
  const receipt = openRouteInNewTab('./forward-battery/', environment);
  assert.equal(receipt.mode, 'new-tab');
  assert.equal(popup.opener, null);
  assert.deepEqual(navigated, ['https://td613.com/dome-world/domeblox/forward-battery/']);
}

{
  const assigned = [];
  const environment = {
    location: { href: 'https://td613.com/dome-world/domeblox/', assign: href => assigned.push(href) },
    open: () => null,
  };
  const receipt = openRouteInNewTab('./forward-battery/', environment);
  assert.equal(receipt.mode, 'same-tab-fallback');
  assert.deepEqual(assigned, ['https://td613.com/dome-world/domeblox/forward-battery/']);
}

{
  let closed = false;
  const assigned = [];
  const popup = {
    opener: 'parent',
    location: { replace: () => { throw new Error('navigation denied'); } },
    close: () => { closed = true; },
  };
  const environment = {
    location: { href: 'https://td613.com/dome-world/domeblox/', assign: href => assigned.push(href) },
    open: () => popup,
  };
  const receipt = openRouteInNewTab('./forward-battery/', environment);
  assert.equal(receipt.mode, 'same-tab-fallback');
  assert.equal(closed, true);
  assert.deepEqual(assigned, ['https://td613.com/dome-world/domeblox/forward-battery/']);
}

console.log('DomeBlox navigation fallback contract PASS');
