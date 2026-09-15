import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileWendbineLoomTranslation } from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-loom-translation.mjs';
import { auditWendbineLoomTranslation } from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/aperture-translation-audit.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(here, '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/01-MANIFESTS/wendbine-loom-translation-v01.json'), 'utf8'));

test('Aperture admits lexical crosswalk but holds operational translation without bound operator witnesses', () => {
  const family = compileWendbineLoomTranslation(manifest);
  const audit = auditWendbineLoomTranslation({ manifest, family });
  assert.equal(audit.outcome, 'HOLD_FOR_REPAIR');
  assert.deepEqual(audit.counts, {
    mappings: 7,
    lexical_admitted: 7,
    operational_admitted: 0,
    operator_witness_missing: 7,
    rejected: 0
  });
  assert.match(audit.diagnosis, /does not yet establish operator fidelity/i);
  assert.equal(audit.open_field_promotion, false);
  assert.equal(audit.authority_transferred, false);
  assert.equal(audit.human_closure_required, true);
  assert.equal(audit.next_test, 'BIND_EXISTING_EXECUTABLE_OPERATOR_WITNESSES_WITHOUT_INVENTING_MISSING_ONES');
});

test('Aperture rejects authority or equivalence promotion even when the translation family remains structurally shaped', () => {
  const family = compileWendbineLoomTranslation(manifest);
  const forged = structuredClone(family);
  forged.forward[0].authority_transferred = true;
  const audit = auditWendbineLoomTranslation({ manifest, family: forged });
  assert.equal(audit.outcome, 'REJECT_AUTHORITY_OR_EQUIVALENCE_BREACH');
  assert.ok(audit.rows[0].rejects.includes('FORBIDDEN_PROMOTION:authority_transferred'));
});

test('Aperture does not mistake explicit non-equivalence for a failed lexical bridge', () => {
  const family = compileWendbineLoomTranslation(manifest);
  const audit = auditWendbineLoomTranslation({ manifest, family });
  const control = audit.rows.find(row => row.mapping_id === 'dependency_graph_false_donor_control');
  assert.equal(control.lexical_translation, 'ADMITTED');
  assert.ok(control.accepted.includes('NON_EQUIVALENCE_EXPLICIT'));
  assert.equal(control.operational_translation, 'HELD');
});
