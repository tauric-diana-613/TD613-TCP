import assert from 'assert';
import { buildHushEvidenceCockpit, summarizeHushEvidenceCockpit } from '../app/engine/hush-evidence-cockpit.js';

const cockpit = await buildHushEvidenceCockpit({ sourceText: 'source', outputText: 'output', maskId: 'mask', mode: 'review' });
assert.equal(cockpit.version, 'phase-30');
assert(cockpit.signalBusSnapshot);
assert(cockpit.exportReceipt);
assert(cockpit.narrowingLosses);
assert(cockpit.selfTest);
assert.equal(cockpit.selfTest.result.passed, true);

const summary = summarizeHushEvidenceCockpit(cockpit);
assert.equal(summary.version, 'phase-30');
assert(summary.operatorActions.length > 0);
console.log('hush-evidence-cockpit tests passed');
