import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [html, css, js, house, pedagogueCard, apertureCard, atlasCard] = await Promise.all([
  read('app/pedagogue/index.html'),
  read('app/pedagogue/pedagogue.css'),
  read('app/pedagogue/pedagogue.js'),
  read('Dollhouse/README.md'),
  read('Dollhouse/PEDAGOGUE.md'),
  read('Dollhouse/APERTURE.md'),
  read('Dollhouse/ATLAS.md')
]);

// Dollhouse is navigation, not a new authority layer.
assert.match(house, /navigation, not a new authority layer/i);
assert.match(house, /Pedagogue/);
assert.match(house, /Aperture/);
assert.match(house, /Atlas/);
assert.match(house, /DOLLHOUSE_PLACEMENT != AUTHORITY_TRANSFER/);
assert.match(house, /ATLAS_QUOTIENT != EXTERNAL_TRUTH/);

// Root identities stay linked; Dollhouse does not clone the underlying programs.
assert.match(pedagogueCard, /\.\.\/PEDAGOGUE\.md/);
assert.match(apertureCard, /\.\.\/APERTURE\.md/);
assert.match(atlasCard, /finite distinguishability \/ quotient-structure program/i);
assert.match(atlasCard, /FINITE_QUOTIENT != PHYSICAL_REALITY/);
assert.match(atlasCard, /No doll crowns another/i);

// Playhouse uses the real Information Dome compiler and real governed fixtures.
assert.match(js, /compileInformationDomeField/);
assert.match(js, /gluing-soft-fold\.json/);
assert.match(js, /phason-content-invariant\.json/);
assert.match(js, /moire-pair-emergence\.json/);

// Friendly room labels are aliases over the four canonical AIA route IDs.
for (const route of ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']) {
  assert.match(js, new RegExp(route));
}
for (const room of ['Sunroom', 'Key Room', 'Detective Attic', 'Workshop']) {
  assert.match(js, new RegExp(room));
}
assert.match(pedagogueCard, /ROOM_NAME != NEW_ROUTE/);
assert.match(pedagogueCard, /PLAYHOUSE != NEW_PEDAGOGUE_ONTOLOGY/);

// Consequence is visible before room/technical inspection; route choice remains explicit.
assert.ok(html.indexOf('The world answered') < html.indexOf('Pick a room'));
assert.match(html, /No room is chosen for you/);
assert.match(js, /route:\s*null/);
assert.match(js, /Open the grown-up drawer/);
assert.ok(js.indexOf("beat('NOW'") < js.indexOf('grownup-drawer'));

// Rest, return, replay, and exit remain obvious and unpenalized.
assert.match(html, /data-rest/);
assert.match(html, /data-return/);
assert.match(html, /data-replay/);
assert.match(html, /Front door · Exit/);
assert.match(html, /no score · no streak/);
assert.match(js, /routeTrail/);
assert.doesNotMatch(js, /userScore|user_score|streakCount|points\s*[+]=|score\s*[+]=/i);

// Practice inhabitant is explicitly fictional and authority-closed.
assert.match(html, /Mallow · practice inhabitant/);
assert.match(html, /fictional on purpose/i);
assert.match(html, /no release authority/i);
assert.match(pedagogueCard, /PRACTICE_INHABITANT != EVIDENCE_SOURCE/);

// Small-screen and reduced-motion support stay part of the candidate surface.
assert.match(css, /@media \(max-width: 390px\)/);
assert.match(css, /prefers-reduced-motion: reduce/);

console.log('Pedagogue Dollhouse breakout contract: PASS');
