import assert from 'node:assert/strict';
import { atlasRelationIdentityCustody } from '../app/dome-world/previews/a15-r0/atlas-relation-identity-custody.js';
const a={a:2,b:1,s:0,path:['N','E','E']},m={a:2,b:1,s:0,path:['E','E','N']},m2={a:2,b:1,s:0,path:['E','N','E']};
const mirror=atlasRelationIdentityCustody(a,m);assert.equal(mirror.relation,'MIRROR_MATES');assert.deepEqual(mirror.left_custody,a);assert.deepEqual(mirror.right_custody,m);assert.notDeepEqual(mirror.left_custody.path,mirror.right_custody.path);assert.equal(atlasRelationIdentityCustody(m,a).relation,'MIRROR_MATES');
assert.equal(atlasRelationIdentityCustody(a,a).relation,'EXACT_IDENTITY');assert.equal(atlasRelationIdentityCustody({a:1,b:1,s:1,path:['D']},{a:1,b:1,s:1,path:['D']}).relation,'FIXED_SELF');assert.equal(atlasRelationIdentityCustody(a,m2).relation,'DISTINCT_SAME_SLICE');assert.equal(atlasRelationIdentityCustody({a:0,b:0,s:0,path:[]},{a:1,b:0,s:0,path:['E']}).relation,'CROSS_SLICE_DISTINCT');
const bad={a:0,b:0,s:0,path:['E']};const held=atlasRelationIdentityCustody(bad,{a:0,b:0,s:0,path:[]});assert.equal(held.relation,'HELD_INVALID_DECLARATION');assert.equal(held.held,true);assert.deepEqual(held.left_custody,bad);
console.log('Ash A15-R0 Atlas relation-identity custody hostile tests passed.');
