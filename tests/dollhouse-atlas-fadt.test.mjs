import assert from 'node:assert/strict';

import {
  DOLLHOUSE_AGENT_REGISTRY,
  getDollhouseAgent,
  listDollhouseAgents
} from '../app/engine/dollhouse-agent-registry.js';
import {
  createPortableFlowcoreControl,
  loomComparedSurfacesToFadt,
  runAtlasAgent,
  runFadtAgent
} from '../app/engine/dollhouse-atlas-fadt.js';
import {
  compileLoomDemoScene
} from '../app/dome-world/holonomy-loom/semantic-field.js';

assert.equal(DOLLHOUSE_AGENT_REGISTRY.schema, 'td613.dollhouse.agent-registry/v0.1');
assert.deepEqual(listDollhouseAgents().map(agent => agent.id), ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']);
assert.equal(getDollhouseAgent('atlas').kind, 'OPERATIONAL_AGENT_ADAPTER');
assert.equal(getDollhouseAgent('fadt').kind, 'OPERATIONAL_AGENT_ADAPTER');
const aperture = getDollhouseAgent('aperture');
assert.match(aperture.role, /provider-instrument-audit/);
assert.ok(aperture.canonical_sources.includes('app/engine/aperture-v32-provider-instrument-audit.js'));
assert.ok(aperture.canonical_sources.includes('docs/research/2026-09-11-APERTURE-PROVIDER-STACK-FIELD-TRIP.md'));
assert.match(aperture.authority_ceiling, /no-provider-call/);
assert.match(aperture.authority_ceiling, /model-disablement/);
assert.equal(DOLLHOUSE_AGENT_REGISTRY.shared_authority.human_closure_required, true);
assert.equal(DOLLHOUSE_AGENT_REGISTRY.shared_authority.deployment_authority, false);

const routeScene = compileLoomDemoScene(3, { sourceRevision: 'working-tree' });
const control = createPortableFlowcoreControl(routeScene);
assert.equal(control.raw_source_included, false);
assert.equal(control.return_requires_loom_revalidation, true);
assert.equal(control.candidate_return_trusted_by_arrival, false);
assert.ok(control.flow_core.glyph_trace.length > 0);
assert.equal(control.flow_core.legend.length, routeScene.flow_core.glyph_relations.length);
for (const item of control.flow_core.legend) {
  assert.ok(item.glyph);
  assert.ok(item.semantic_relation);
  assert.ok(Array.isArray(item.static_equivalent));
}

const atlas = runAtlasAgent(routeScene);
assert.equal(atlas.agent, 'ATLAS');
assert.equal(atlas.audit.verdict, 'PASS');
assert.equal(atlas.audit.control_plane_equal, true);
assert.equal(atlas.audit.presentations_intentionally_non_equivalent, true);
assert.equal(atlas.portable_return_contract.candidate_trusted, false);
assert.equal(atlas.portable_return_contract.return_requires_loom_revalidation, true);
assert.equal(atlas.projections[0].control, atlas.projections[1].control);
assert.notDeepEqual(atlas.projections[0].presentation, atlas.projections[1].presentation);
assert.throws(() => runAtlasAgent(routeScene, { receivers: ['child', 'oracle'] }), /Unsupported Atlas receiver/);
assert.throws(() => runAtlasAgent(routeScene, { receivers: ['child'] }), /at least two declared receiver projections/);

const fadtPositive = runFadtAgent({
  fibres: [{
    id: 'constant-fibre',
    antecedents: [
      { id: 'a', support: ['RETURN', 'REST'] },
      { id: 'b', support: ['REST', 'RETURN'] }
    ]
  }]
});
assert.equal(fadtPositive.all_fibres_exact, true);
assert.equal(fadtPositive.fibres[0].verdict, 'AUTHORIZED');
assert.deepEqual(fadtPositive.fibres[0].union, ['REST', 'RETURN']);
assert.deepEqual(fadtPositive.fibres[0].intersection, ['REST', 'RETURN']);
assert.deepEqual(fadtPositive.fibres[0].irreducible_gap, []);

const fadtHostile = runFadtAgent({
  fibres: [{
    id: 'incompatible-fibre',
    antecedents: [
      { id: 'left', support: ['GREEN'] },
      { id: 'right', support: ['RED'] }
    ]
  }]
});
assert.equal(fadtHostile.all_fibres_exact, false);
assert.equal(fadtHostile.fibres[0].verdict, 'HOLD');
assert.deepEqual(fadtHostile.fibres[0].union, ['GREEN', 'RED']);
assert.deepEqual(fadtHostile.fibres[0].intersection, []);
assert.deepEqual(fadtHostile.fibres[0].irreducible_gap, ['GREEN', 'RED']);
assert.equal(fadtHostile.fibres[0].gap_size, 2);

const contradictionScene = compileLoomDemoScene(5, { sourceRevision: 'working-tree' });
const loomFadt = runFadtAgent(loomComparedSurfacesToFadt(contradictionScene));
assert.equal(loomFadt.fibres[0].verdict, 'HOLD');
assert.equal(loomFadt.fibres[0].gap_size, 2);
assert.ok(loomFadt.fibres[0].union.includes('GREEN'));
assert.ok(loomFadt.fibres[0].union.includes('RED'));

assert.throws(() => runFadtAgent(), /at least one occupied finite quotient fibre/);
assert.throws(() => runFadtAgent({ fibres: [{ id: 'empty', antecedents: [] }] }), /at least one antecedent/);

console.log('Dollhouse Atlas/FADT operational adapter tests passed.');
