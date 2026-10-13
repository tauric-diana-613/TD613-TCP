import assert from 'assert';
import {
  HUSH_LITERAL_PLACEMENT_VERSION,
  buildLiteralPlacementMap,
  placeProtectedLiterals,
  repairLiteralPlacement,
  summarizeLiteralPlacement
} from '../app/engine/hush-literal-placement.js';
import { buildClaimRoleMap } from '../app/engine/hush-claim-roles.js';

assert.equal(HUSH_LITERAL_PLACEMENT_VERSION, 'phase-19');

const sourceText = 'Please keep DOC-613 with the note from 6/13.';
const meaningPlan = {
  protectedLiterals: ['DOC-613', '6/13'],
  units: [{ id: 'unit-1', text: sourceText, protectedFragments: ['DOC-613', '6/13'] }]
};
const claimRoleMap = buildClaimRoleMap({ sourceText, meaningPlan, protectedLiterals: ['DOC-613', '6/13'] });
const map = buildLiteralPlacementMap({ sourceText, meaningPlan, claimRoleMap, protectedLiterals: ['DOC-613', '6/13'] });

assert.equal(map.version, 'phase-19');
assert.equal(map.placements.length, 2);
assert(map.placements.some((item) => item.literal === 'DOC-613' && item.kind === 'doc-id' && item.preferredPlacement === 'before-noun'));
assert(map.placements.some((item) => item.literal === '6/13' && item.kind === 'date'));
assert(map.placements.every((item) => item.required));

const placed = placeProtectedLiterals({ text: 'The note stayed attached.', literalPlacementMap: map });
assert(placed.text.includes('DOC-613'));
assert(placed.text.includes('6/13'));
assert(placed.operations.includes('in-unit-literal-placement'));
assert(!/DOC-613\s+6\/13\.?$/.test(placed.text), 'literal repair should avoid tail-only stuffing when anchors exist');

const duplicate = repairLiteralPlacement({ text: 'DOC-613 note DOC-613 stayed attached on 6/13 6/13.', literalPlacementMap: map });
assert.equal((duplicate.text.match(/DOC-613/g) || []).length, 1);
assert.equal((duplicate.text.match(/6\/13/g) || []).length, 1);
assert(duplicate.operations.includes('dedupe-protected-literal'));

const sacMap = buildLiteralPlacementMap({ protectedLiterals: ['SAC[X6ZNK5NO51]'], meaningPlan: { protectedLiterals: ['SAC[X6ZNK5NO51]'] } });
const sacPlaced = placeProtectedLiterals({ text: 'The marker should stay intact.', literalPlacementMap: sacMap });
assert(sacPlaced.text.includes('SAC[X6ZNK5NO51]'));

const summary = summarizeLiteralPlacement(map);
assert.equal(summary.version, 'phase-19');
assert.equal(summary.placementCount, 2);
assert.equal(summary.requiredCount, 2);

console.log('hush-literal-placement tests passed');
