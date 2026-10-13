import assert from 'assert';
import { mapEventShape, scoreEventShapeRetention } from '../app/engine/hush-event-shape.js';

const source = 'FILE-72 same export minute / one copy footer there, one copy no footer. maybe template maybe nothing.';
const shape = mapEventShape(source);
assert.equal(shape.eventUnits.length, 1);
assert.equal(shape.eventUnits[0].anchor, 'FILE-72');

const bad = scoreEventShapeRetention({ sourceText: source, outputText: 'FILE-72 remains the record anchor.', eventShape: shape });
assert.equal(bad.passed, false);
assert(bad.hardFailures.includes('event-shape-low-retention'));

const good = scoreEventShapeRetention({ sourceText: source, outputText: 'FILE-72 should stay tied to the same export minute. One copy has the footer and one copy does not. Maybe it is a template issue.', eventShape: shape });
assert.equal(good.passed, true);
assert.equal(good.missingRelations.length, 0);

const invoice = scoreEventShapeRetention({
  sourceText: 'INV-440 at 2:18, Jordan hold resend until finance knows version.',
  outputText: 'INV-440 at 2:18 should keep Jordan, resend, finance, and version together.'
});
assert.equal(invoice.passed, true);

console.log('hush-event-shape tests passed');
