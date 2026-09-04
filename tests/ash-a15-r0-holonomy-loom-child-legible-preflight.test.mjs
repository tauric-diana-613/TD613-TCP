import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  HOLONOMY_LOOM_SCHEMA,
  analyzeHolonomyLoomMessage,
  makeHolonomyLoomSaferCopy
} from '../app/dome-world/previews/a15-r0/holonomy-loom-child-legible-preflight.js';

const source = fs.readFileSync('app/dome-world/previews/a15-r0/holonomy-loom-child-legible-preflight.js', 'utf8');
const html = fs.readFileSync('app/dome-world/previews/a15-r0/holonomy-loom-child-legible-preflight.html', 'utf8');

assert.equal(HOLONOMY_LOOM_SCHEMA, 'td613.holonomy-loom.child-legible-preflight/v0.1');

for (const localSource of [source, html]) {
  assert.doesNotMatch(
    localSource,
    /fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|indexedDB|localStorage|sessionStorage|serviceWorker|caches\./,
    'The preview may not add network transport or persistent browser storage.'
  );
}

assert.match(html, />Holonomy Loom</, 'The preview must expose the user-facing Holonomy Loom name.');
assert.match(html, /Before you send it, check what this message carries\./, 'Consequence must precede ontology.');
assert.match(html, /CHECK THIS MESSAGE/, 'The first action must be obvious in ordinary language.');
assert.match(html, /KEEP/, 'KEEP must remain child-legible.');
assert.match(html, /CHANGE/, 'CHANGE must remain child-legible.');
assert.match(html, /REMOVE/, 'REMOVE must remain child-legible.');
assert.match(html, /cannot control every room the message enters afterward/i, 'The downstream claim ceiling must remain visible.');
assert.doesNotMatch(html, /guaranteed safe/i, 'GREEN may not be marketed as guaranteed safety.');

const empty = analyzeHolonomyLoomMessage({ text: '   ' });
assert.equal(empty.status, 'HELD');
assert.equal(empty.release_boundary.raw_release_allowed, false);

const green = analyzeHolonomyLoomMessage({ text: 'Can we move our meeting to next week?' });
assert.equal(green.status, 'GREEN');
assert.equal(green.findings.length, 0);
assert.equal(green.release_boundary.raw_release_allowed, true);
assert.match(green.summary, /Nothing matched/i);

const email = analyzeHolonomyLoomMessage({ text: 'Email me at person@example.com about the draft.' });
assert.equal(email.status, 'YELLOW');
assert.equal(email.findings.length, 1);
assert.equal(email.findings[0].rule_id, 'EMAIL_IDENTIFIER');
assert.equal(email.findings[0].action, 'CHANGE');
assert.equal(email.receipt.raw_match_values_retained, false);
assert.equal(JSON.stringify(email.receipt).includes('person@example.com'), false, 'Receipt may not retain the raw matched identifier.');

const hard = analyzeHolonomyLoomMessage({ text: 'Use sk-abcdefghijklmnopqrstuvwxyz123456 for the demo.' });
assert.equal(hard.status, 'RED');
assert.equal(hard.findings[0].action, 'REMOVE');
assert.equal(hard.release_boundary.raw_release_allowed, false);
assert.match(hard.summary, /must not leave/i);

const declared = analyzeHolonomyLoomMessage({
  text: 'The project codename is Moon Porch.',
  protectedTerms: [{ value: 'Moon Porch', label: 'project codename' }]
});
assert.equal(declared.status, 'RED');
assert.equal(declared.findings[0].rule_id, 'USER_DECLARED_PROTECTED_TERM');
assert.equal(declared.findings[0].evidence_class, 'USER_DECLARED_EXACT_RULE');

const saferDeclared = makeHolonomyLoomSaferCopy({
  text: 'The project codename is Moon Porch.',
  protectedTerms: [{ value: 'Moon Porch', label: 'project codename' }]
});
assert.equal(saferDeclared.release_allowed, true);
assert.equal(saferDeclared.text.includes('Moon Porch'), false);
assert.match(saferDeclared.text, /\[protected thing removed\]/);

const journey = analyzeHolonomyLoomMessage({
  text: 'Bring the red lantern note into this answer.',
  journeyMarkers: [{ value: 'red lantern note', label: 'earlier-thread marker' }]
});
assert.equal(journey.status, 'GREEN');
assert.equal(journey.journey_relations.length, 1);
assert.equal(journey.journey_relations[0].relation_id, 'DECLARED_JOURNEY_MARKER_MATCH');
assert.equal(journey.journey_relations[0].evidence_class, 'USER_DECLARED_CUSTODY_CONTEXT');
assert.match(journey.journey_relations[0].statement, /another journey/i);
assert.match(journey.journey_relations[0].claim_ceiling, /not claiming.*truth/i);

const resemblanceOnly = analyzeHolonomyLoomMessage({
  text: 'Bring the red lantern note into this answer.'
});
assert.equal(resemblanceOnly.journey_relations.length, 0, 'Resemblance alone may not produce provenance.');

const combined = analyzeHolonomyLoomMessage({
  text: 'Send person@example.com the Moon Porch note from the red lantern note.',
  protectedTerms: [{ value: 'Moon Porch', label: 'project codename' }],
  journeyMarkers: [{ value: 'red lantern note', label: 'earlier-thread marker' }]
});
assert.equal(combined.status, 'RED');
assert.equal(combined.findings.some(item => item.action === 'REMOVE'), true);
assert.equal(combined.findings.some(item => item.action === 'CHANGE'), true);
assert.equal(combined.journey_relations.length, 1);

const saferCombined = makeHolonomyLoomSaferCopy({
  text: 'Send person@example.com the Moon Porch note from the red lantern note.',
  protectedTerms: [{ value: 'Moon Porch', label: 'project codename' }],
  journeyMarkers: [{ value: 'red lantern note', label: 'earlier-thread marker' }]
});
assert.equal(saferCombined.release_allowed, true);
assert.equal(saferCombined.text.includes('person@example.com'), false);
assert.equal(saferCombined.text.includes('Moon Porch'), false);
assert.match(saferCombined.claim_ceiling, /does not guarantee privacy/i);

assert.throws(
  () => analyzeHolonomyLoomMessage({ text: 'x', protectedTerms: ['alpha', 'ALPHA'] }),
  /duplicate exact values/i,
  'Duplicate protection rules must fail closed rather than create ambiguous replacement order.'
);

assert.equal(green.receipt.downstream_platform_governed, false);
assert.ok(green.claim_ceiling.some(item => /downstream platforms/i.test(item)));
assert.ok(green.claim_ceiling.some(item => /resemblance alone/i.test(item)));

console.log('Ash A15-R0 Holonomy Loom child-legible preflight tests passed.');
