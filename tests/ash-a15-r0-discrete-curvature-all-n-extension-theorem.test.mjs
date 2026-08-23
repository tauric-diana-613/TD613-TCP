import test from 'node:test';
import assert from 'node:assert/strict';
import { compileAllNDiscreteCurvatureTheorem } from '../app/dome-world/previews/a15-r0/discrete-curvature-all-n-extension-theorem.js';

test('all-n theorem uses symbolic certificates rather than finite mesh sampling', () => {
  const receipt = compileAllNDiscreteCurvatureTheorem();
  assert.equal(receipt.finite_sampling_used, false);
  assert.equal(receipt.findings.finite_mesh_sampling_replaced_by_symbolic_certificates, true);
  assert.equal(receipt.theorem_status, 'FINITE_MESH_RECEIPT_UPGRADED_TO_DISCRETE_ALGEBRAIC_EXTENSION_THEOREM_WITHIN_DECLARED_MODEL');
});

test('every declared identity certificate has an empty nonzero coefficient ledger', () => {
  const receipt = compileAllNDiscreteCurvatureTheorem();
  for (const [id, certificate] of Object.entries(receipt.identity_certificates)) {
    assert.equal(certificate.identically_zero, true, `${id} should be an exact identity`);
    if (id !== 'G1') assert.deepEqual(certificate.coefficient_ledger, {}, `${id} should have no surviving monomial coefficient`);
  }
});

test('variable-field child aggregation retains x multiplicity and weighted-density distinction', () => {
  const receipt = compileAllNDiscreteCurvatureTheorem();
  assert.match(receipt.identity_certificates.V2.derivation, /multiplicity m/);
  assert.match(receipt.identity_certificates.V3.derivation, /equal child areas/);
  assert.equal(receipt.identity_certificates.V2.identically_zero, true);
  assert.equal(receipt.identity_certificates.V3.identically_zero, true);
});

test('generic closed-path gauge theorem is structural rather than numeric-potential sampling', () => {
  const G1 = compileAllNDiscreteCurvatureTheorem().identity_certificates.G1;
  assert.equal(G1.identically_zero, true);
  assert.equal(G1.numeric_vertex_potential_required, false);
  assert.equal(G1.finite_path_sampling_used, false);
  assert.equal(G1.closed_vertex_coefficient_ledger, 'IDENTICALLY_ZERO_FOR_EVERY_VISITED_VERTEX');
});

test('hostile mis-scaled family remains symbolically nonzero on the declared proper-refinement domain', () => {
  const { B1, B2 } = compileAllNDiscreteCurvatureTheorem().hostile_certificates;
  assert.equal(B1.identically_zero, false);
  assert.deepEqual(B1.witness_polynomial, { '1':'2', n:'-2' });
  assert.equal(B1.nonzero_domain_condition, 'n > 1');
  assert.equal(B2.identically_zero, false);
  assert.deepEqual(B2.witness_polynomial, { '1':'2', m:'-2' });
  assert.equal(B2.nonzero_domain_condition, 'm > 1 and n > 0');
});

test('all-n discrete theorem does not cross the continuum firewall', () => {
  const receipt = compileAllNDiscreteCurvatureTheorem();
  assert.equal(receipt.claims.discrete_all_n_extension_theorem, true);
  assert.equal(receipt.claims.continuum_limit, false);
  assert.equal(receipt.continuum_firewall.limit_n_to_infinity_evaluated, false);
  assert.equal(receipt.continuum_firewall.continuum_connection_constructed, false);
  assert.equal(receipt.continuum_firewall.continuum_curvature_constructed, false);
  assert.equal(receipt.claims.proto_loom, false);
  assert.equal(receipt.claims.production_authority, false);
  assert.equal(receipt.claims.vercel_authority, false);
});
