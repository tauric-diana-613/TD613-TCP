import assert from 'node:assert/strict';
import fs from 'node:fs';

const dir = new URL('../app/dome-world/schemas/', import.meta.url);
const files = fs.readdirSync(dir).filter(name => /^ash-destination-handoff-.*-v01\.schema\.json$/.test(name)).sort();
assert.equal(files.length, 7);
const ids = new Set();
const digestFields = new Set();
for (const file of files) {
  const schema = JSON.parse(fs.readFileSync(new URL(file, dir), 'utf8'));
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.match(schema.$id, /^td613\.ash\.destination-handoff/);
  assert.equal(ids.has(schema.$id), false, `${file} duplicated schema ID`); ids.add(schema.$id);
  assert.equal(schema.type, 'object');
  assert.equal(schema.properties.raw_body_present.const, false);
  assert.equal(schema.properties.raw_corpus_present.const, false);
  assert.deepEqual(schema.properties.universal_join_key.type, ['null']);
  assert.equal(schema.properties.identity_inferred.const, false);
  assert.equal(schema.properties.authorship_inferred.const, false);
  assert.equal(schema.properties.truth_inferred.const, false);
  assert.equal(schema.properties.broadcast_authorized.const, false);
  assert.equal(schema.properties.universal_transport_authorized.const, false);
  assert.equal(schema.properties.external_deletion_proven.const, false);
  assert.equal(schema.properties.suppression_authorized.const, false);
  assert.equal(schema.properties.cinder_action_authorized.const, false);
  assert.equal(schema['x-td613-authority-ceiling'].general_release_authority, false);
  assert.equal(schema['x-td613-authority-ceiling'].universal_transport_authority, false);
  assert.equal(digestFields.has(schema['x-td613-digest-field']), false); digestFields.add(schema['x-td613-digest-field']);
  assert.equal(schema.required.includes(schema['x-td613-digest-field']), true);
}
assert.equal(ids.size, 7);
assert.equal(digestFields.size, 7);
console.log('ash-destination-handoff-schemas.test.mjs passed');
