import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const practice = read('app/giving/history/giving-practice-hydration.js');
const bridge = read('app/giving/history/giving-practice-surface-bridge.js');
const shell = read('app/giving/history/giving-ux-resilience-shell.js');
const practiceCss = read('app/giving/history/giving-practice-hydration.css');
const help = read('app/giving/history/giving-dossier-help.js');
const helpCss = read('app/giving/history/giving-dossier-help.css');
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const fec = read('app/giving/history/giving-fec-resilience.js');
const pedagogue = read('app/engine/pedagogue-practice-fixture.js');
const fixture = JSON.parse(read('tests/fixtures/pedagogue/giving-bikini-bottom-practice.json'));

for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) {
  assert.match(practice, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `practice fixture must include ${name}`);
}
for (const committee of [
  'King Neptune for King',
  'Mrs. Puff for Bikini Bottom School District #67',
  'Every Villain Is Lemons PAC',
  'Sheldon Plankton for Bikini Bottom Campaign',
  'Larry Lobster for Mayor of Bikini Bottom',
  'Fishocratic Executive Committee',
  'Friends of Aquaman PC',
  'Krusty Krab Parking Expansion Referendum Committee'
]) assert.ok(practice.includes(committee), `practice contributions must exercise ${committee}`);

assert.match(practice, /city: 'Bikini Bottom'/);
assert.match(practice, /state: 'Oceania'/);
assert.match(practice, /zip: 'X'/);
assert.match(practice, /committee_kind: referendum \? 'ISSUE_REFERENDUM'/, 'referendum fixture must exercise a political-object type distinct from candidate/PAC/party-style committees');
assert.match(practice, /manifestly_fictional: true/);
assert.match(practice, /evidence_authority: false/);
assert.match(practice, /consequence_authority: false/);
assert.match(practice, /evidence_status: 'FICTIONAL_SAMPLE'/);
assert.match(practice, /8000 \+ \(hash % 8001\)/, 'ordinary practice retrieval must visibly occupy an 8–16 second teaching window');
assert.match(practice, /__TD613_GIVING_PRACTICE_DELAY_MS__/, 'browser witnesses need a bounded timing override without changing production timing');
assert.match(practice, /envelope\.operation === 'search\.page'/);
assert.match(practice, /source_instance_id === PRACTICE_SOURCE_ID/);
assert.match(practice, /external_retrieval: false/);
assert.match(practice, /envelope\.operation\.startsWith\('vault\.'\)/, 'practice must exercise the real browser encryption route against a reversible local Vault shelf');
assert.match(practice, /practiceVault\.set/);
assert.match(practice, /PRACTICE_AUTHORITY_CLOSED/, 'fictional practice must never cross into Campaign Deputy mutation authority');
assert.match(practice, /exact\.checked = true/, 'loading the sample must force normalized exact match on');
assert.match(practice, /practice-source-locked/);
assert.match(practice, /Exit Sample Demo\?/);
assert.match(practice, /same Giving route can contain candidate, PAC\/PC, party-style, and issue\/referendum political objects/);

assert.equal(fixture.teaching_contrasts.length, 1);
assert.equal(fixture.teaching_contrasts[0].contrast_id, 'political-object-kind');
assert.match(fixture.teaching_contrasts[0].why, /does not make those political objects equivalent/i);
assert.match(pedagogue, /function normalizeTeachingContrasts/);
assert.match(pedagogue, /automatic_inference_forbidden: true/);
assert.match(pedagogue, /authority_grant_forbidden: true/);
assert.match(pedagogue, /teaching_contrasts_bounded/);

assert.match(bridge, /FICTIONAL SAMPLE/);
assert.match(bridge, /practice:giving\.bikini-bottom-practice\//);
assert.match(bridge, /FICTIONAL PRACTICE · Bikini Bottom, Oceania/);
assert.match(bridge, /duringPracticeLoad/);
assert.match(bridge, /stopImmediatePropagation/, 'fixture loading must not accidentally trigger normal local autosave handlers');
assert.match(bridge, /blockedCampaignActions/);

assert.match(shell, /td613:giving-practice-load-request/);
assert.match(shell, /scrollViewToTop\('view-vault'\)/, 'Encrypt a Vault copy route must snap the Vault surface into view');
assert.match(shell, /installDossierPickers/);
assert.match(shell, /dossier-single-picker/);
assert.match(shell, /Saved local files/);

assert.match(practiceCss, /\.dossier-control #saveState/);
assert.match(practiceCss, /max-width: 46%/, 'saved-local chip must retain bounded room inside the dossier heading');
assert.match(practiceCss, /\.dossier-single-picker-menu\.giving-state-filter-menu \{[\s\S]*?grid-template-columns: 1fr/);
assert.match(practiceCss, /\.source-picker\.practice-source-locked[\s\S]*?overflow: hidden/);
assert.match(practiceCss, /\.fictional-sample-chip/);

assert.match(help, /custodyModeHelp/);
assert.match(help, /NOW: choose where this working file belongs/);
assert.match(helpCss, /font-size: 13px/, 'ⓘ controls must read as information icons rather than tiny glyph debris');

assert.match(fec, /const MAX_BOUNDARY_PAGES = 1/);
assert.doesNotMatch(fec, /while \(continuation/);
assert.match(fec, /automatic_continuation: false/);

assert.match(bootstrap, /GIVING_PEDAGOGUE_EPOCH = '20260817-2'/);
const practiceIndex = bootstrap.indexOf("giving-practice-hydration.js");
const appIndex = bootstrap.indexOf("giving-app.js");
const bridgeIndex = bootstrap.indexOf("giving-practice-surface-bridge.js");
assert.ok(practiceIndex >= 0 && appIndex > practiceIndex, 'practice fetch projection must install before GivingApiClient captures fetch');
assert.ok(bridgeIndex > appIndex, 'practice surface bridge must bind after the core Giving event surface exists');

console.log('giving-pedagogue-hydration.test.mjs passed');
