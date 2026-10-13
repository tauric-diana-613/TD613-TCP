import assert from 'assert';
import {
  HUSH_CLAIM_ROLES_VERSION,
  buildClaimRoleMap,
  classifyClaimUnit,
  summarizeClaimRoleMap
} from '../app/engine/hush-claim-roles.js';

assert.equal(HUSH_CLAIM_ROLES_VERSION, 'phase-19');

const sourceText = 'Please keep DOC-613 with the note from 6/13. I did not change it, and it may need review.';
const meaningPlan = {
  protectedLiterals: ['DOC-613', '6/13'],
  units: [
    { id: 'unit-1', text: 'Please keep DOC-613 with the note from 6/13.', protectedFragments: ['DOC-613', '6/13'] },
    { id: 'unit-2', text: 'I did not change it, and it may need review.', hasNegation: true }
  ]
};

const roleMap = buildClaimRoleMap({ sourceText, meaningPlan, protectedLiterals: ['DOC-613', '6/13'] });
assert.equal(roleMap.version, 'phase-19');
assert.equal(roleMap.units.length, 2);
assert(roleMap.units.some((unit) => unit.subroles.includes('evidence-anchor')));
assert(roleMap.units.some((unit) => unit.subroles.includes('date-anchor')));
assert(roleMap.units.some((unit) => unit.subroles.includes('negation')));
assert(roleMap.units.some((unit) => unit.subroles.includes('caveat')));
assert(roleMap.units.some((unit) => unit.subroles.includes('request')));
assert(roleMap.units.some((unit) => unit.moveFreedom === 'locked'));
assert(roleMap.relationships.some((rel) => rel.relation === 'dates' || rel.relation === 'identifies'));

const classified = classifyClaimUnit({ text: 'I cannot confirm who changed CASE-17.' }, { index: 0, protectedLiterals: ['CASE-17'] });
assert.equal(classified.role, 'caveat');
assert(classified.subroles.includes('uncertainty'));
assert(classified.invariants.includes('preserve-uncertainty'));

const summary = summarizeClaimRoleMap(roleMap);
assert.equal(summary.version, 'phase-19');
assert(summary.lockedCount >= 1);
assert(summary.relationshipCount >= 1);

console.log('hush-claim-roles tests passed');
