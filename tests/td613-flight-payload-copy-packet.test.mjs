import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('app/safe-harbor/td613-flight-clipboard-fidelity.js', 'utf8');

assert.match(source, /desktop-writeText/u, 'desktop Flight Copy must use canonical plain text');
assert.doesNotMatch(source, /desktop-rich-clipboard/u, 'desktop Flight Copy must not advertise rich HTML that can reinterpret line breaks');
assert.match(source, /payloadStepperValue/u, 'inline payload editor must bind to the existing stepper numeral');
assert.match(source, /contentEditable = 'true'/u, 'existing payload numeral must become directly editable');
assert.match(source, /pointerup/u, 'single-tap selection path must exist');
assert.match(source, /authPayload/u, 'inline payload edits must sync to the canonical authorship payload field');
assert.match(source, /node\.style\.boxShadow = 'inset/u, 'field affordance must be inset-only');
assert.doesNotMatch(source, /node\.style\.(?:width|height|padding|font|color|border)\s*=/u, 'payload editor must not change size or typography');

console.log('td613-flight-payload-copy packet contract passed');
