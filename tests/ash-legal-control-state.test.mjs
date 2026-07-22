import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ASH_LEGAL_CONTROL_STATE_VERSION } from '../app/dome-world/ash-legal-demo-control-state.js';

const control = fs.readFileSync('app/dome-world/ash-legal-demo-control-state.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const legal = fs.readFileSync('app/dome-world/ash-legal-profile-demo.js', 'utf8');

assert.equal(ASH_LEGAL_CONTROL_STATE_VERSION, 'td613.ash.legal-control-state/v0.1-registered-demo-owner');
assert.match(control, /Open Legal matter demo/);
assert.match(control, /Opening Legal matter/);
assert.match(control, /dataset\.ashMethodDemoState = busy \? 'BUSY' : 'READY'/);
assert.match(control, /dataset\.ashLegalControlState/);
assert.match(control, /new MutationObserver\(defer\)/);
assert.match(control, /profile-demo-hydrated/);
assert.match(control, /aia3-readiness-changed/);
assert.match(control, /no real client data or legal advice/i);
assert.doesNotMatch(control, /No Legal Matter qualification demo yet|demo-unavailable['"]\);\s*return true/);
assert.match(bridge, /ash-legal-demo-control-state\.js\?v=20260721-legal-demo-ux-v1/);
assert(bridge.indexOf('ash-profile-demo-hydration.js') < bridge.indexOf('ash-legal-demo-control-state.js'), 'Legal owner must load after the shared profile registry.');
assert.match(legal, /host\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*hydrateLegalMatterDemo/);
assert.doesNotMatch(control + legal, /legal_advice_provided:\s*true|transport_authorized:\s*true|child_study_authorized:\s*true/);

console.log('ash-legal-control-state.test.mjs passed');
