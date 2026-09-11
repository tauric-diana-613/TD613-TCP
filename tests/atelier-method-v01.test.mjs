import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = 'packages/dome_world_exact/fixtures/a15-r0';
const method = JSON.parse(fs.readFileSync(path.join(root, 'ATELIER_METHOD/atelier-method-v0.1.json'), 'utf8'));
const src = JSON.parse(fs.readFileSync(path.join(root, 'SRC/ATELIER_PROFILE.json'), 'utf8'));

assert.equal(method.schema, 'td613.atelier-method/v0.1');
assert.equal(method.state, 'RESEARCH_METHOD_COMMON_KERNEL');
assert.equal(method.authority.scientific_promotion, false);
assert.equal(method.authority.human_closure_required, true);
assert.equal(method.interchange.direct_raw_graph_union_forbidden, true);
assert.equal(method.interchange.cross_atelier_authority_transfer, false);
assert.equal(method.directory_policy.physical_homogenization_required, false);
assert.equal(method.directory_policy.missing_common_directory_requires_profile_exception, true);
assert.equal(method.directory_policy.profile_exception_field, 'directory_exceptions');

const directoryExceptions = src[method.directory_policy.profile_exception_field] ?? {};
for (const dir of method.required_directories) {
  const dirPath = path.join(root, 'SRC', dir);
  if (fs.existsSync(dirPath)) continue;

  const exception = directoryExceptions[dir];
  assert.ok(exception, `SRC is missing required directory ${dir} without a profile exception`);
  assert.ok(
    method.directory_policy.allowed_exception_reasons.includes(exception.reason),
    `SRC directory exception ${dir} uses unknown reason: ${exception.reason}`
  );
  assert.equal(typeof exception.note, 'string', `SRC directory exception ${dir} requires a note`);
  assert.ok(exception.note.trim().length > 0, `SRC directory exception ${dir} requires a non-empty note`);
}

for (const [dir, exception] of Object.entries(directoryExceptions)) {
  assert.ok(method.required_directories.includes(dir), `SRC declares an exception for unknown common directory: ${dir}`);
  assert.equal(fs.existsSync(path.join(root, 'SRC', dir)), false, `SRC declares an unnecessary exception for present directory: ${dir}`);
  assert.ok(method.directory_policy.allowed_exception_reasons.includes(exception.reason), `SRC directory exception ${dir} uses unknown reason: ${exception.reason}`);
}

for (const file of method.required_entry_files) {
  assert.ok(fs.existsSync(path.join(root, 'SRC', file)), `SRC missing common Atelier entry file: ${file}`);
}

for (const invariant of [
  'SOURCE_OBJECT != WORK != MANIFESTATION != CAPTURE != DERIVATIVE',
  'NEWEST != CONTROLLING',
  'TEMPORAL_ADJACENCY != CAUSAL_EDGE',
  'SAME_TOKEN != SAME_OPERATOR',
  'UNAVAILABLE != SUPPRESSED',
  'NEGATIVE_RESULT != FAILED_ATELIER'
]) assert.ok(method.invariants.includes(invariant), `missing common Atelier invariant: ${invariant}`);

assert.deepEqual(method.aia_routes, ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
for (const stage of ['S0_SCOPE_CUSTODY', 'S3_TYPED_RELATIONAL_TOPOLOGY', 'S6_RECONSTRUCTION_WITHDRAWAL_HELDOUT', 'S8_RED_TEAM_ALTERNATIVE_MODELS', 'S9_CLAIM_CEILING_NEXT_TEST_HUMAN_RETURN']) {
  assert.ok(method.stages.includes(stage), `missing method stage: ${stage}`);
}

assert.equal(src.schema, 'td613.atelier-profile/v0.1');
assert.equal(src.atelier_id, 'SRC');
assert.equal(src.method_version, method.schema);
assert.equal(src.snapshot_model, 'SEALED_EPOCH');
assert.equal(src.required_epoch_binding, true);
assert.equal(src.human_closure_required, true);
assert.equal(src.scientific_promotion_authority, false);
for (const strength of method.divergent_strength_modules.SRC) {
  assert.ok(src.distinctive_strengths.includes(strength), `SRC profile dropped inherited strength: ${strength}`);
}
for (const route of method.aia_routes) assert.ok(src.aia_routes.includes(route), `SRC profile missing route: ${route}`);

console.log('TD613 Atelier Method v0.1 and SRC profile passed.');
