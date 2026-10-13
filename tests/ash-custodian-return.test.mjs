import assert from 'node:assert/strict';
import {
  ANISOTROPY_SCHEMA,
  CUSTODIAN_RETURN_SCHEMA,
  compareReturnDimensions,
  compileAnisotropyReceipt,
  compileCustodianReturnReceipt,
  verifyAnisotropyReceipt,
  verifyCustodianReturnReceipt
} from '../app/engine/ash-custodian-return.js';

const comparison = compareReturnDimensions({
  caseMap: {
    nodes: [{ id: 'node_a', type: 'claim' }, { id: 'node_b', type: 'hypothesis' }],
    relationships: [{ from: 'node_a', to: 'node_b' }],
    rooms: [{ id: 'room_a' }],
    source_status: ['SUPPLIED'],
    evidence_basis: ['synthetic'],
    private_chronology: [{ id: 'time_a' }],
    intended_actions: [{ id: 'action_a' }]
  },
  routeMemory: { entries: [{ route_id: 'route_a' }] },
  authorityContext: { lifecycle_rank: 'CONTINUITY_SEALED' }
}, {
  nodes: [{ id: 'node_a' }],
  relationships: [],
  room_bridges: [],
  source_style_linkage: ['SUPPLIED'],
  chronology: [],
  hypotheses: [],
  next_actions: [],
  lifecycle_state: null
});

assert.equal(comparison.nodes.local, 2);
assert.equal(comparison.nodes.external, 1);
assert.equal(comparison.relationships.external, 0);

const dimensions = Object.fromEntries(
  ['nodes','relationships','room_bridges','source_style_linkage','chronology','hypotheses','next_actions','lifecycle_state']
    .map(key => [key, { status: key === 'nodes' ? 'RECOVERED' : 'MISSING', observations: [`${key} checked`] }])
);

const returned = await compileCustodianReturnReceipt({
  caseId: 'case_fixture',
  savePointReference: 'save_fixture',
  savePointDigest: `sha256:${'1'.repeat(64)}`,
  capsuleDigest: `sha256:${'2'.repeat(64)}`,
  caseMapDigest: `sha256:${'3'.repeat(64)}`,
  routeMemoryDigest: `sha256:${'4'.repeat(64)}`,
  lifecycleRank: 'CONTINUITY_SEALED',
  dimensions,
  observations: ['sandbox only']
});

assert.equal(returned.schema, CUSTODIAN_RETURN_SCHEMA);
assert.equal(returned.live_case_mutated, false);
assert.equal(await verifyCustodianReturnReceipt(returned), true);
assert.equal(await verifyCustodianReturnReceipt({ ...returned, import_state: 'LIVE_MUTATED' }), false);

const anisotropy = await compileAnisotropyReceipt({
  caseId: 'case_fixture',
  returnReceiptReference: returned.return_id,
  returnReceiptDigest: returned.receipt_digest,
  projectionPurpose: 'synthetic-purpose',
  externalProjectionDigest: `sha256:${'5'.repeat(64)}`,
  localReader: dimensions,
  externalReader: dimensions
});

assert.equal(anisotropy.schema, ANISOTROPY_SCHEMA);
assert.equal(anisotropy.universal_score_emitted, false);
assert.deepEqual(anisotropy.external_material_exclusions, ['Ash Capsule','Case Map','room keys','complete Route Memory']);
assert.equal(await verifyAnisotropyReceipt(anisotropy), true);
assert.equal(await verifyAnisotropyReceipt({ ...anisotropy, universal_score_emitted: true }), false);

console.log('Ash Custodian Return and Anisotropy receipts: PASS');
