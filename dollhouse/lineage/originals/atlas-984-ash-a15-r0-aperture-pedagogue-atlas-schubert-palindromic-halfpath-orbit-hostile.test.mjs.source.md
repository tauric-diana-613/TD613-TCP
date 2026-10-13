import assert from 'node:assert/strict';
import { ATLAS_SCHUBERT_PALINDROMIC_HALFPATH_ORBIT_CERTIFICATE as C, orbitRepresentative, encodeOrbitMember, decodeOrbitMember } from '../app/dome-world/previews/a15-r0/atlas-schubert-palindromic-halfpath-orbit.js';
assert.equal(C.hostile_controls.incidental_string_serialization_rejected,true);
const p=['N','D','E'];assert.deepEqual(orbitRepresentative(p),['E','D','N']);
const e=encodeOrbitMember(p);assert.equal(e.fixed,false);assert.equal(e.orbit_size,2);assert.equal(e.orientation,1);assert.deepEqual(decodeOrbitMember(e),p);
const fixed=encodeOrbitMember(['E','D','E']);assert.equal(fixed.fixed,true);assert.equal(fixed.orbit_size,1);assert.equal(fixed.orientation,null);
assert.equal(C.laws.geometric_canonicality_claimed,false);assert.equal(C.laws.physical_orientation_claimed,false);assert.equal(C.laws.state_compression_claimed,false);
console.log('Ash A15-R0 Atlas Schubert palindromic half-path orbit hostile tests passed.');
