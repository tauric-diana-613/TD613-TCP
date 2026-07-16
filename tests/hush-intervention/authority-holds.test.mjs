import assert from 'node:assert/strict';
import { compileHushInterventionReceipt } from '../../app/engine/hush-intervention.js';
import { buildHushInterventionFixture } from '../fixtures/hush-intervention-fixture.mjs';

const fixture = await buildHushInterventionFixture();

const tamperedEnsemble = structuredClone(fixture.ensemble);
tamperedEnsemble.discourse_mode = 'PUBLIC_SUMMARY';
const tampered = await compileHushInterventionReceipt({ ...fixture.receiptInput, ensemble: tamperedEnsemble });
assert.equal(tampered.intervention_state, 'TAMPER_HOLD');

const staleAuthority = structuredClone(fixture.authorityContext);
staleAuthority.current = false;
const authorityHeld = await compileHushInterventionReceipt({ ...fixture.receiptInput, authorityContext: staleAuthority });
assert.equal(authorityHeld.intervention_state, 'STALE_AUTHORITY_HOLD');

const staleRebuild = structuredClone(fixture.rebuildReceipt);
staleRebuild.source_drift_state = 'SOURCE_CHANGED';
const rebuildHeld = await compileHushInterventionReceipt({ ...fixture.receiptInput, rebuildReceipt: staleRebuild });
assert.equal(rebuildHeld.intervention_state, 'STALE_REBUILD_HOLD');

await assert.rejects(
  fixture.ensemble && import('../../app/engine/hush-intervention-ensemble.js').then(({ compileHushInterventionEnsemble }) =>
    compileHushInterventionEnsemble({
      caseId: fixture.caseMap.case_id,
      caseMapDigest: fixture.caseMap.case_map_digest,
      routeMemoryDigest: fixture.routeMemory.route_memory_digest,
      authorityContext: { ...fixture.authorityContext, current: false },
      rebuildReceipt: fixture.rebuildReceipt,
      sourceText: 'Synthetic text',
      discourseMode: 'PUBLIC_SUMMARY',
      propositions: [{ text: 'Synthetic text', obligation: 'PRESERVE_MEANING' }],
      interventions: [{ dimensions: { REGISTER: 'neutral' } }]
    })
  ),
  /current authorized Authority Context/
);

console.log('hush-intervention/authority-holds.test.mjs passed');
