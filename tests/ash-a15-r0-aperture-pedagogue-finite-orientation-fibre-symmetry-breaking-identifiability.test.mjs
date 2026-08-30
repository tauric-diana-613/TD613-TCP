import assert from 'node:assert/strict';
import { finiteOrientationFibreSymmetryBreakingCertificate as certificate } from '../app/dome-world/previews/a15-r0/finite-orientation-fibre-symmetry-breaking-identifiability.js';

const c=certificate();
assert.equal(c.parent_receipt,'9456a6a44eaaff46fa796cd591bb2f61e3680187');
assert.equal(c.parent_exact,true);
assert.deepEqual(c.orientation_fibre,['0000000001','0000000010','1111111101','1111111110']);
assert.equal(c.inherited,'1111111110');
assert.deepEqual(c.inherited_point_stabilizer,['id']);
for(const [name,rows] of Object.entries(c.classes)){
  assert.ok(rows.length>0,name);
  for(const row of rows){ assert.ok(row.cell.includes(c.inherited)); assert.equal(row.identifies,row.residual_size===1); }
}
assert.equal(c.classes.specialization_comparability.length,20);
assert.equal(c.classes.principal_open_identity.length,5);
assert.equal(c.classes.principal_open_size.length,5);
assert.equal(c.classes.cut_orientation.length,10);
for(const [name,m] of Object.entries(c.minimum_identifying_families)){
  assert.notEqual(m.minimum,null,`${name} must identify within declared finite class`);
  assert.ok(m.count>0);
  for(const family of m.families) assert.equal(family.length,m.minimum);
}
assert.equal(c.passed,true);
console.log(JSON.stringify({schema:c.schema,spectra:c.singleton_residual_spectra,minima:Object.fromEntries(Object.entries(c.minimum_identifying_families).map(([k,v])=>[k,{minimum:v.minimum,count:v.count,families:v.families}]))},null,2));
