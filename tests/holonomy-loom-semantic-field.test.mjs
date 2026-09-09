import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOOM_DEMO_SCENES,
  LOOM_SEMANTIC_FIELD_SCHEMA,
  compileLoomDemoScene,
  validateLoomSemanticField,
  getLoomDemoInput,
  createLoomPortablePacket
} from '../app/dome-world/holonomy-loom/semantic-field.js';
import { analyzeHolonomyLoomMessage, makeHolonomyLoomSaferCopy } from '../app/dome-world/holonomy-loom/engine.js';
import { HOLONOMY_LOOM_MOTION_KEYS } from '../app/dome-world/holonomy-loom/flowcore-aia-motion.js';

const clone = value => JSON.parse(JSON.stringify(value));
const SOURCE = 'aa027ff5192f2bdea62334dbf57fc09634bffd06';

test('eight fictional scenes run deterministically, remain deeply frozen, and retain claim ceilings', () => {
  assert.equal(LOOM_DEMO_SCENES.length, 8);
  const checksums = new Set();
  for (const scene of LOOM_DEMO_SCENES) {
    const packet = compileLoomDemoScene(scene.index, { sourceRevision: SOURCE });
    assert.deepEqual(packet, compileLoomDemoScene(scene.index, { sourceRevision: SOURCE }));
    assert.equal(packet.schema, LOOM_SEMANTIC_FIELD_SCHEMA);
    assert.deepEqual(validateLoomSemanticField(packet), { valid: true, errors: [] });
    assert.deepEqual(validateLoomSemanticField(clone(packet)), { valid: true, errors: [] });
    assert.ok(Object.isFrozen(packet.analysis.receipt.findings));
    assert.ok(Object.isFrozen(packet.geometry.missingness));
    assert.equal(packet.source.kind, 'FICTIONAL_DEMO');
    assert.equal(packet.distinctions.L, 'UNEARNED');
    assert.equal(packet.distinctions.P, 'UNMEASURED');
    assert.equal(packet.receipt.evidence_authority, false);
    assert.equal(packet.receipt.consequence_authority, false);
    assert.equal(packet.receipt.external_retrieval, false);
    assert.equal(packet.analysis.release_boundary.downstream_platform_governed, false);
    assert.ok(packet.claim_ceiling.some(value => value.includes('Western Horizon')));
    assert.ok(packet.flow_core.glyph_relations.every(key => HOLONOMY_LOOM_MOTION_KEYS.includes(key)));
    checksums.add(packet.receipt.checksum);
  }
  assert.equal(checksums.size, 8);
});

test('loading fictional input does not compile an analysis or fabricate a receipt', () => {
  const input = getLoomDemoInput(2);
  assert.deepEqual(Object.keys(input), ['text', 'protectedTerms', 'journeyMarkers']);
  assert.equal(input.protectedTerms[0].value, 'glass seed');
  assert.ok(Object.isFrozen(input.protectedTerms[0]));
});

test('quiet, change and release block are the real enabled Loom policy outcomes', () => {
  for (const [index, status] of [[0, 'GREEN'], [1, 'YELLOW'], [2, 'RED']]) {
    const packet = compileLoomDemoScene(index);
    assert.deepEqual(packet.analysis, analyzeHolonomyLoomMessage(getLoomDemoInput(index)));
    assert.equal(packet.analysis.status, status);
  }
  assert.equal(compileLoomDemoScene(2).analysis.release_boundary.raw_release_allowed, false);
  assert.equal(compileLoomDemoScene(1).analysis.receipt.findings[0].rule_id, 'EMAIL_IDENTIFIER');
});

test('return geometry depends on exact declared journey occurrences, not resemblance', () => {
  const route = compileLoomDemoScene(3);
  assert.equal(route.geometry.route, 'return');
  assert.equal(route.receipt.route_occurrence_count, 2);
  assert.equal(route.geometry.custody, 'declared');
  assert.equal(route.analysis.journey_relations[0].evidence_class, 'USER_DECLARED_CUSTODY_CONTEXT');
  assert.equal(compileLoomDemoScene(0).geometry.route, 'direct');
});

test('pressure remains a labeled teaching model and does not rewrite DLP status or earn L', () => {
  const pressure = compileLoomDemoScene(4);
  assert.equal(pressure.analysis.status, 'GREEN');
  assert.equal(pressure.alert.severity, 'YELLOW');
  assert.equal(pressure.alert.alert_class, 'RECONSTRUCTABILITY_PRESSURE');
  assert.equal(pressure.alert.observed_vs_modeled, 'MODELED_DEMO');
  assert.equal(pressure.receipt.route_occurrence_count, 3);
  assert.equal(pressure.receipt.model.input.declared_marker_occurrences, 3);
  assert.equal(pressure.receipt.model.rule_fired, true);
  assert.equal(pressure.receipt.model.empirically_calibrated, false);
  assert.equal(pressure.distinctions.L, 'UNEARNED');
  assert.match(pressure.receipt.pressure_basis, /NOT_MEASUREMENT/);
});

test('contradiction preserves both actual analyses and explicit missingness without widening release', () => {
  const packet = compileLoomDemoScene(5);
  assert.equal(packet.alert.alert_class, 'CONTRADICTION');
  assert.equal(packet.alert.severity, 'HELD');
  assert.deepEqual(packet.receipt.compared_surfaces.map(surface => surface.status), ['GREEN', 'RED']);
  assert.equal(packet.receipt.compared_surfaces[0].receipt.finding_count, 0);
  assert.equal(packet.receipt.compared_surfaces[1].receipt.finding_count, 1);
  assert.equal(packet.analysis.status, 'RED');
  assert.equal(packet.analysis.release_boundary.raw_release_allowed, false);
  assert.equal(packet.geometry.route, 'fork');
  assert.equal(packet.geometry.custody, 'missing');
  assert.equal(packet.geometry.missingness.length, 1);
});

test('recovery is real safer-copy transformation followed by a real recheck; rest is explicit', () => {
  const packet = compileLoomDemoScene(6);
  const safer = makeHolonomyLoomSaferCopy(getLoomDemoInput(6));
  assert.deepEqual(packet.analysis, analyzeHolonomyLoomMessage({ text: safer.text, journeyMarkers: [] }));
  assert.equal(packet.receipt.transformation.original_status, 'RED');
  assert.equal(packet.analysis.status, 'GREEN');
  assert.equal(packet.receipt.transformation.raw_text_retained, false);
  const rest = compileLoomDemoScene(7);
  assert.equal(rest.geometry.rest, true);
  assert.equal(rest.alert.alert_class, 'REST');
  assert.deepEqual(rest.flow_core.glyph_relations, ['structural_rest']);
});

test('portable projection preserves exact local semantic and evidence authority state', () => {
  for (const { index } of LOOM_DEMO_SCENES) {
    const local = compileLoomDemoScene(index, { sourceRevision: SOURCE });
    const portable = createLoomPortablePacket(local);
    assert.deepEqual(portable.semantic_field, local);
    assert.equal(JSON.stringify(portable.semantic_field), JSON.stringify(local));
    assert.equal(portable.requires_provider, false);
    assert.equal(portable.contains_credentials, false);
    assert.equal(portable.shared_hidden_state_required, false);
    assert.equal(portable.authority.evidence, false);
    assert.equal(portable.authority.automatic_release, false);
    assert.ok(Object.isFrozen(portable.semantic_field.receipt));
  }
});

test('deterministic admission rejects authority escalation, arbitrary renderer fields and altered evidence', () => {
  const attacks = [
    packet => { packet.analysis.status = 'GREEN'; },
    packet => { packet.analysis.release_boundary.raw_release_allowed = true; },
    packet => { packet.receipt.analysis_receipt.finding_count = 0; },
    packet => { packet.distinctions.L = 'EARNED'; },
    packet => { packet.alert.observed_vs_modeled = 'PROVIDER_OBSERVED'; },
    packet => { packet.alert.claim_ceiling = []; },
    packet => { packet.geometry.pressure = 1; },
    packet => { packet.geometry.css = 'position:fixed'; },
    packet => { packet.geometry.onFrame = 'fetch()'; },
    packet => { packet.provider = 'unapproved'; },
    packet => { packet.source.revision = 'main'; },
    packet => { packet.scene.id = 'unknown'; },
    packet => { packet.receipt.checksum = 'fnv1a32:00000000'; }
  ];
  for (const attack of attacks) {
    const packet = clone(compileLoomDemoScene(2));
    attack(packet);
    assert.equal(validateLoomSemanticField(packet).valid, false);
    assert.throws(() => createLoomPortablePacket(packet), /held/);
  }
});

test('plain-data boundary rejects accessors, prototypes, cycles, non-finite values and unsafe keys', () => {
  let getterRead = false;
  const accessor = clone(compileLoomDemoScene(0));
  Object.defineProperty(accessor, 'renderer', { enumerable: true, get() { getterRead = true; return 'x'; } });
  assert.equal(validateLoomSemanticField(accessor).valid, false);
  assert.equal(getterRead, false);
  const cyclic = clone(compileLoomDemoScene(0));
  cyclic.geometry.back = cyclic;
  const prototype = clone(compileLoomDemoScene(0));
  Object.setPrototypeOf(prototype.geometry, { authority: true });
  const unsafe = clone(compileLoomDemoScene(0));
  Object.defineProperty(unsafe.geometry, '__proto__', { enumerable: true, value: {} });
  const infinity = clone(compileLoomDemoScene(0));
  infinity.geometry.pressure = Infinity;
  const hole = clone(compileLoomDemoScene(0));
  hole.claim_ceiling.length += 1;
  for (const candidate of [cyclic, prototype, unsafe, infinity, hole, null, {}, [], 5]) {
    assert.equal(validateLoomSemanticField(candidate).valid, false);
  }
});

test('source revision is bounded metadata, exact replay checksum changes with it, never authentication', () => {
  const initial = compileLoomDemoScene(0);
  const revised = compileLoomDemoScene(0, { sourceRevision: SOURCE });
  assert.notEqual(initial.receipt.checksum, revised.receipt.checksum);
  assert.match(revised.receipt.checksum_scope, /not source authentication/);
  for (const sourceRevision of ['main', 'not-a-sha', '', 'x'.repeat(5000)]) {
    assert.throws(() => compileLoomDemoScene(0, { sourceRevision }), /sourceRevision/);
  }
  for (const index of [-1, 8, 1.5, '0', NaN]) assert.throws(() => compileLoomDemoScene(index), /index/);
});
