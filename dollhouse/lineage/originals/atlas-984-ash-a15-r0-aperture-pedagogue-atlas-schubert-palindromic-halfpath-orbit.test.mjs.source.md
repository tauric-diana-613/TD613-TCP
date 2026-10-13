import assert from 'node:assert/strict';
import { ATLAS_SCHUBERT_PALINDROMIC_HALFPATH_ORBIT_CERTIFICATE as C, encodeOrbitMember, decodeOrbitMember } from '../app/dome-world/previews/a15-r0/atlas-schubert-palindromic-halfpath-orbit.js';
assert.equal(C.parent_exact,true);assert.equal(C.formal_cells,42);assert.equal(C.gap_slices,112);assert.equal(C.support_objects,9912);assert.equal(C.fixed_singletons,190);assert.equal(C.nonfixed_two_cycles,4861);assert.equal(C.orbit_classes,5051);assert.equal(C.oriented_nonfixed_reconstructions,9722);assert.equal(C.roundtrip_failures,0);assert.equal(C.rank_pair_failures,0);assert.equal(C.slice_partition_failures,0);assert.equal(C.passed,true);
for(const p of [['D','E','N'],['N','D','E'],['E','D','E']])assert.deepEqual(decodeOrbitMember(encodeOrbitMember(p)),p);
console.log('Ash A15-R0 Atlas Schubert palindromic half-path orbit quotient tests passed.');
