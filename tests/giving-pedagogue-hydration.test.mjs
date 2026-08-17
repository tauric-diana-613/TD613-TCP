import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const practice = read('app/giving/history/giving-practice-hydration.js');
const bridge = read('app/giving/history/giving-practice-surface-bridge.js');
const directory = read('app/giving/history/giving-practice-directory.js');
const shell = read('app/giving/history/giving-ux-resilience-shell.js');
const practiceCss = read('app/giving/history/giving-practice-hydration.css');
const help = read('app/giving/history/giving-dossier-help.js');
const helpCss = read('app/giving/history/giving-dossier-help.css');
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const fec = read('app/giving/history/giving-fec-resilience.js');
const pedagogue = read('app/engine/pedagogue-practice-fixture.js');
const fixture = JSON.parse(read('tests/fixtures/pedagogue/giving-bikini-bottom-practice.json'));

for (const [label, source] of [['practice hydration', practice], ['practice bridge', bridge], ['practice directory', directory], ['FEC resilience', fec]]) {
  assert.doesNotThrow(() => new Function(source.replace(/export const[\s\S]*$/m, '')), `${label} must remain browser-parseable`);
}

const names = ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles'];
const committees = [
  'King Neptune for King',
  'Mrs. Puff for Bikini Bottom School District #67',
  'Every Villain Is Lemons PAC',
  'Sheldon Plankton for Bikini Bottom Campaign',
  'Larry Lobster for Mayor of Bikini Bottom',
  'Fishocratic Executive Committee',
  'Friends of Aquaman PC',
  'Krusty Krab Parking Expansion Referendum Committee'
];
for (const name of names) assert.ok(practice.includes(name), `practice fixture must include ${name}`);
for (const committee of committees) {
  assert.ok(practice.includes(committee), `practice contributions must exercise ${committee}`);
  assert.ok(directory.includes(committee), `practice campaign directory must expose ${committee}`);
}

assert.match(practice, /city: 'Bikini Bottom'/);
assert.match(practice, /state: 'Oceania'/);
assert.match(practice, /zip: 'X'/);
assert.match(practice, /committee_kind: referendum \? 'ISSUE_REFERENDUM'/);
assert.match(practice, /manifestly_fictional: true/);
assert.match(practice, /evidence_authority: false/);
assert.match(practice, /consequence_authority: false/);
assert.match(practice, /evidence_status: 'FICTIONAL_SAMPLE'/);
assert.match(practice, /8000 \+ \(hash % 8001\)/);
assert.match(practice, /__TD613_GIVING_PRACTICE_DELAY_MS__/);
assert.match(practice, /PRACTICE_AUTHORITY_CLOSED/);
assert.match(practice, /exact\.checked = true/);
assert.match(practice, /Exit Sample Demo\?/);

assert.equal(fixture.teaching_contrasts.length, 2);
assert.equal(fixture.teaching_contrasts[0].contrast_id, 'political-object-kind');
assert.equal(fixture.teaching_contrasts[1].contrast_id, 'fictional-jurisdiction-aperture');
assert.match(fixture.teaching_contrasts[1].exact, /real geography controls remain inert/i);
assert.match(pedagogue, /function normalizeTeachingContrasts/);
assert.match(pedagogue, /automatic_inference_forbidden: true/);
assert.match(pedagogue, /authority_grant_forbidden: true/);

assert.match(bridge, /PRACTICE_NAMES = Object\.freeze/);
assert.match(bridge, /function broadenPracticeNameWhenRequested/);
assert.match(bridge, /exact\?\.checked !== false/);
assert.match(bridge, /matches\.length === 1/);
assert.match(bridge, /function enforcePracticeSourceSelection/);
assert.match(bridge, /function enforcePracticeSearchPosture/);
assert.match(bridge, /addEventListener\('submit', enforcePracticeSearchPosture, true\)/);
assert.match(bridge, /practiceFloatingExitButton/);
assert.match(bridge, /Exit route 3 of exactly 3/);
assert.match(bridge, /\.tab\[data-view="campaign"\]/);
assert.match(bridge, /Campaign Deputy is asleep/);

assert.match(directory, /PRACTICE_OBJECTS = Object\.freeze/);
assert.match(directory, /PRACTICE_OBJECTS\.filter/);
assert.match(directory, /BikiniBottomVotes only/);
assert.match(directory, /#campaignDirectoryForm/);
assert.match(directory, /addEventListener\('submit', interceptPracticeDirectory, true\)/);
assert.match(directory, /event\.stopImmediatePropagation\(\)/, 'practice campaign lookup must preempt the real API listener');
assert.match(directory, /#givingStateFilter/);
assert.match(directory, /#campaignDirectoryState/);
assert.match(directory, /#campaignDirectoryMunicipal/);
assert.match(directory, /#campaignDirectoryJurisdiction/);
assert.match(directory, /input\.disabled = true/);
assert.match(directory, /wakeGeography/);

assert.match(shell, /scrollViewToTop\('view-vault'\)/);
assert.match(shell, /installDossierPickers/);
assert.match(practiceCss, /\.dossier-control #saveState/);
assert.match(practiceCss, /max-width: 46%/);
assert.match(practiceCss, /\.practice-floating-exit \{[\s\S]*?position: fixed/);
assert.match(practiceCss, /\.practice-exit-confirm \{[\s\S]*?left: 50%[\s\S]*?top: 50%[\s\S]*?translate\(-50%, -50%\)/);
assert.match(practiceCss, /\.practice-geo-asleep/);
assert.match(practiceCss, /Bikini Bottom only · asleep/);
assert.match(practiceCss, /\.fictional-sample-chip/);

assert.match(help, /custodyModeHelp/);
assert.match(helpCss, /font-size: 13px/);

assert.match(fec, /const MAX_BOUNDARY_PAGES = 1/);
assert.doesNotMatch(fec, /while \(continuation/);
assert.match(fec, /automatic_continuation: false/);

assert.match(bootstrap, /GIVING_PRACTICE_EPOCH = '20260817-3'/);
assert.match(bootstrap, /giving-practice-directory\.js/);
assert.doesNotMatch(bootstrap, /\bpedagogue\b/i, 'browser bootstrap must keep internal teaching nomenclature out of delivered source');
const practiceIndex = bootstrap.indexOf('giving-practice-hydration.js');
const appIndex = bootstrap.indexOf('giving-app.js');
const bridgeIndex = bootstrap.indexOf('giving-practice-surface-bridge.js');
const directoryIndex = bootstrap.indexOf('giving-practice-directory.js');
const campaignIndex = bootstrap.indexOf('giving-campaign-tools-v3.js');
assert.ok(practiceIndex >= 0 && appIndex > practiceIndex);
assert.ok(bridgeIndex > appIndex);
assert.ok(directoryIndex > bridgeIndex && campaignIndex > directoryIndex, 'practice campaign lookup must install before the real campaign directory listener');

console.log('giving-pedagogue-hydration.test.mjs passed');
