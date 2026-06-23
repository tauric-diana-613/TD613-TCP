import assert from 'node:assert/strict';
import { extractSourceObligationSet, scoreSourceObligationRetention } from '../app/engine/hush-phase8-source-obligation.js';

const source = 'First, the timestamp mismatch may stay visible because the record sequence matters before dispatch.';
const obligations = await extractSourceObligationSet(source, { anchorLimit: 6 });
assert.equal(obligations.schema, 'td613.hush.phase8.source-obligation-set/v1');
assert.equal(obligations.raw_source_included, false);
assert.ok(obligations.mandatory_anchors.length >= 1);
assert.ok(obligations.hedges.includes('may'));
assert.ok(obligations.sequence_relations.includes('first'));
assert.ok(obligations.obligation_hash_sha256.startsWith('sha256:'));

const retained = scoreSourceObligationRetention(obligations, source);
assert.equal(retained.schema, 'td613.hush.phase8.source-retention-score/v1');
assert.equal(retained.mandatory_anchor_retention, 1);
assert.equal(retained.source_retention_status, 'passed');

const missing = scoreSourceObligationRetention(obligations, 'The note stays brief.');
assert.equal(missing.source_retention_status, 'blocked');
assert.ok(missing.mandatory_anchor_retention < 1);

console.log('hush-phase8-source-obligation-retention: ok');
