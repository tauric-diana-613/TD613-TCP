import assert from 'assert';
import { computeHushNarrowingLosses } from '../app/engine/hush-narrowing-losses.js';

const clean = computeHushNarrowingLosses({ exportReceipt: { complete: true, privateTextStored: false }, dashboard: { readiness: { overall: true }, blockers: [] }, docsMemory: { passed: true } });
assert.equal(clean.routeState, 'receipt-ready');
assert.equal(clean.dominantLoss, 'none');

const held = computeHushNarrowingLosses({ targetRegisterAudit: { passed: false, hardFailures: ['target-register-not-visible'] } });
assert.equal(held.routeState, 'hold');
assert(held.blockers.includes('target-loss'));
console.log('hush-narrowing-losses tests passed');
