import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ASH_LEGAL_CONTROL_STATE_VERSION } from '../app/dome-world/ash-legal-demo-control-state.js';

const control = fs.readFileSync('app/dome-world/ash-legal-demo-control-state.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const registry = fs.readFileSync('app/dome-world/ash-demo-registry.js', 'utf8');
const legal = fs.readFileSync('app/dome-world/ash-legal-profile-demo.js', 'utf8');
const empirical = fs.readFileSync('app/dome-world/ash-a15-empirical-profile-journeys.js', 'utf8');

assert.equal(ASH_LEGAL_CONTROL_STATE_VERSION, 'td613.ash.legal-control-state/v0.1-registered-demo-owner');
assert.match(control, /Open Legal matter demo/);
assert.match(control, /Opening Legal matter/);
assert.match(control, /dataset\.ashLegalControlState/);
assert.match(control, /no real client data or legal advice/i);
assert.doesNotMatch(control + legal + empirical, /legal_advice_provided:\s*true|transport_authorized:\s*true|child_study_authorized:\s*true/);

assert.doesNotMatch(bridge, /^import .*ash-legal-demo-control-state\.js/m, 'Legacy Legal control listener must not load as a runtime owner.');
assert.match(bridge, /ash-profile-demo-hydration\.js\?v=20260726-a15-empirical-v1/);
assert.match(registry, /legal:Object\.freeze\(\{ profile:'legal'/);
assert.match(registry, /owner:'LEGAL'/);
assert.match(registry, /hydrateLegalMatterDemo/);
assert.match(registry, /Legal Matter/);
assert.match(registry, /no legal advice/i);
assert.match(registry, /control_owner:'ASH_DEMO_REGISTRY'/);
assert.match(registry, /empirical_matrix_cells:120/);
assert.match(empirical, /label:'Legal Matter'/);
assert.match(empirical, /const message = `\$\{profileLaw\.label\}:/);
assert.match(empirical, /No legal advice, guilt, liability, merits finding, privilege waiver, or outcome prediction/);

console.log('ash-legal-control-state.test.mjs passed under A15 registry ownership');
