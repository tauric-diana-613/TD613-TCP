import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileWendbineLoomTranslation, inspectTranslationRoundTrip } from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-loom-translation.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(here, '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/01-MANIFESTS/wendbine-loom-translation-v01.json'), 'utf8'));

test('translation manifest preserves source binding, difference statements, and forbids exact-equivalence promotion', () => {
  const family = compileWendbineLoomTranslation(manifest);
  assert.equal(family.counts.mappings, 7);
  assert.equal(family.counts.forward_packets, 7);
  assert.equal(family.counts.reverse_packets, 7);
  assert.equal(family.counts.exact_equivalence_packets, 0);
  assert.equal(family.invariants.semantic_equivalence_required, false);
  assert.equal(family.invariants.authority_transferred, false);
  assert.equal(family.invariants.authorship_transferred, false);
  assert.equal(family.invariants.custody_transferred, false);
  for (const packet of [...family.forward, ...family.reverse]) {
    assert.ok(packet.source_refs.length > 0);
    assert.ok(packet.source_refs.every(ref => ref.startsWith('reddit:t3_')));
    assert.ok(packet.retained_difference.length > 0);
    assert.equal(packet.semantic_equivalence_claimed, false);
    assert.equal(packet.authority_transferred, false);
  }
});

test('bidirectional round trip preserves mapping identity, source refs, relation class, and retained mismatch', () => {
  const family = compileWendbineLoomTranslation(manifest);
  const inspected = inspectTranslationRoundTrip(family);
  assert.equal(inspected.outcome, 'ADMITTED');
  assert.equal(inspected.rows.length, 7);
  assert.ok(inspected.rows.every(row => row.preserved));
  assert.equal(inspected.authority_transferred, false);
  assert.equal(inspected.semantic_equivalence_verified, false);
  assert.equal(inspected.independent_human_understanding_verified, false);
  assert.equal(inspected.external_interoperability_verified, false);
});

test('false-donor dependency graph control remains non-equivalent in both directions', () => {
  const family = compileWendbineLoomTranslation(manifest);
  for (const packet of [...family.forward, ...family.reverse].filter(item => item.mapping_id === 'dependency_graph_false_donor_control')) {
    assert.equal(packet.relation_class, 'NON_EQUIVALENT');
    assert.match(packet.retained_difference, /no donor authority|cannot substitute/i);
  }
});

test('source erasure, exact-equivalence laundering, missing retained difference, and unbound mapping are rejected', () => {
  const mutate = fn => {
    const copy = structuredClone(manifest);
    fn(copy);
    return copy;
  };
  assert.throws(() => compileWendbineLoomTranslation(mutate(m => { m.mappings[0].wendbine_source_refs = []; })), /source-bound/);
  assert.throws(() => compileWendbineLoomTranslation(mutate(m => { m.mappings[0].relation_class = 'EXACT'; })), /relation class/);
  assert.throws(() => compileWendbineLoomTranslation(mutate(m => { m.mappings[0].retained_difference = ''; })), /retain a difference/);
  assert.throws(() => compileWendbineLoomTranslation(mutate(m => { m.mappings[0].wendbine_source_refs = ['unbound:foo']; })), /source-bound/);
});
