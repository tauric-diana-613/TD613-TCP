import assert from 'assert';
import { buildHushReadinessLedgerRow, redactHushReadinessLedgerRow, summarizeHushReadinessLedger } from '../app/engine/hush-readiness-ledger.js';

const row = await buildHushReadinessLedgerRow({
  sourceText: 'private input text',
  outputText: 'private output text',
  maskId: 'phase27-register-preserve',
  mode: 'preserve-source',
  hardBlocks: [],
  warnings: ['human-review-required']
});

assert.equal(row.privateTextStored, false);
assert(row.inputHash);
assert(row.outputHash);
assert.notEqual(row.inputHash, 'private input text');
assert.notEqual(row.outputHash, 'private output text');

const redacted = redactHushReadinessLedgerRow({ ...row, sourceText: 'raw', outputText: 'raw', privateText: 'raw' });
assert.equal(redacted.sourceText, undefined);
assert.equal(redacted.outputText, undefined);
assert.equal(redacted.privateText, undefined);

const summary = summarizeHushReadinessLedger(row);
assert.equal(summary.hasInputHash, true);
assert.equal(summary.privateTextStored, false);

console.log('hush-readiness-ledger tests passed');
