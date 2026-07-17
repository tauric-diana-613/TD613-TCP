import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = async name => JSON.parse(await readFile(new URL(`../app/dome-world/schemas/${name}`, import.meta.url), 'utf8'));
const registry = await load('ash-independent-provenance-adapter-registry-v01.schema.json');
const verification = await load('ash-independent-provenance-verification-v01.schema.json');
const replay = await load('ash-independent-provenance-replay-v01.schema.json');

assert.equal(registry.$id, 'td613.ash.independent-provenance-adapter-registry/v0.1');
assert.equal(registry.properties.schema.const, registry.$id);
assert.equal(registry.properties.adapters.maxItems, 11);
assert.equal(registry.$defs.adapter.properties.source_local_only.const, true);
assert.equal(registry.$defs.adapter.properties.raw_body_ingestion_authorized.const, false);
assert.equal(registry.$defs.adapter.properties.identity_inference_authorized.const, false);
assert.equal(registry.$defs.adapter.properties.authorship_inference_authorized.const, false);
assert.equal(registry.$defs.adapter.properties.destination_transport_authorized.const, false);
assert.equal(registry.properties.universal_join_key.type, 'null');

assert.equal(verification.$id, 'td613.ash.independent-provenance-verification/v0.1');
assert.equal(verification.properties.schema.const, verification.$id);
assert.deepEqual(verification.properties.state.enum, [
  'INDEPENDENT_PROVENANCE_VERIFIED', 'MISSING_REFERENCE_HOLD', 'UNSUPPORTED_DOMAIN_HOLD',
  'WRONG_DOMAIN_HOLD', 'SOURCE_MISMATCH_HOLD', 'STALE_REFERENCE_HOLD',
  'REVOKED_REFERENCE_HOLD', 'COLLISION_HOLD', 'TAMPER_HOLD', 'CANCELLED_HOLD', 'REPLAY_HOLD'
]);
assert.equal(verification.properties.raw_body_present.const, false);
assert.equal(verification.properties.raw_corpus_present.const, false);
assert.equal(verification.properties.identity_inferred.const, false);
assert.equal(verification.properties.authorship_inferred.const, false);
assert.equal(verification.properties.authenticity_inferred.const, false);
assert.equal(verification.properties.truth_inferred.const, false);
assert.equal(verification.properties.destination_transport_authorized.const, false);
assert.equal(verification.properties.adapter_agreement_universal_trust_score.type, 'null');

assert.equal(replay.$id, 'td613.ash.independent-provenance-replay/v0.1');
assert.equal(replay.properties.schema.const, replay.$id);
assert.equal(replay.properties.raw_body_restored.const, false);
assert.equal(replay.properties.provider_reexecuted.const, false);
assert.equal(replay.properties.reader_reexecuted.const, false);
assert.equal(replay.properties.universal_join_key.type, 'null');
assert.equal(replay.properties.destination_transport_authorized.const, false);

console.log('ash-keep-independent-provenance-schemas.test.mjs passed');
