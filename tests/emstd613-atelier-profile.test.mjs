import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/EMSTD613');
const profile=JSON.parse(fs.readFileSync(path.join(root,'ATELIER_PROFILE.json'),'utf8'));

assert.equal(profile.schema,'td613.atelier-profile/v0.1');
assert.equal(profile.atelier_id,'EMSTD613');
assert.equal(profile.method_version,'td613.atelier-method/v0.1');
assert.equal(profile.method_pr,1118);
assert.equal(profile.snapshot_model,'PROVENANCE_PRESERVING_LINEAGE_CORPUS_WITH_IDENTITY_SENSITIVITY');
assert.equal(profile.supported_identity_requires_split_collapse_sensitivity,true);
assert.equal(profile.human_closure_required,true);
assert.equal(profile.scientific_promotion_authority,false);
for (const route of ['EXPERIENTIAL','CUSTODIAL','AUDIT','IMPLEMENTATION']) assert.ok(profile.aia_routes.includes(route),`missing synchronized AIA route: ${route}`);
for (const strength of ['BLIND_INVENTORY','WORK_MANIFESTATION_IDENTITY_CONTROL','IDENTITY_SENSITIVITY','BRUTAL_ANATOMY','MOTIF_NULL','CONVERGENCE_DIVERGENCE','GENEALOGY','EMERGENCE_TEST','EXTERNAL_SCIENCE_CONFRONTATION','RED_TEAM_ALTERNATIVES']) assert.ok(profile.distinctive_strengths.includes(strength),`dropped EMSTD613 strength: ${strength}`);
for (const stage of ['S0_SCOPE_CUSTODY','S1_IDENTITY_MANIFESTATION_CONTROL','S2_BRUTAL_ANATOMY','S3_TYPED_RELATIONAL_TOPOLOGY','S4_TEMPORAL_VERSION_AUTHORITY_CONTROL','S5_CONVERGENCE_DIVERGENCE_LINEAGE','S6_RECONSTRUCTION_WITHDRAWAL_HELDOUT','S7_EXTERNAL_SCIENTIFIC_CONFRONTATION','S8_RED_TEAM_ALTERNATIVE_MODELS','S9_CLAIM_CEILING_NEXT_TEST_HUMAN_RETURN']) assert.ok(profile.active_stages.includes(stage),`EMSTD613 profile missing active stage: ${stage}`);
for (const file of ['README.md','CONNECTOR_ENTRY.md','ATTRIBUTION.md','ATELIER_PROFILE.json']) assert.ok(fs.existsSync(path.join(root,file)),`EMSTD613 missing synchronized entry file: ${file}`);
for (const dir of ['01-MANIFESTS','02-ORIGINALS','03-DERIVATIVES','04-RECEIPTS','05-OPERATIONS','06-INSTRUMENTS','07-ARCHIVE-LEDGER','08-EXTERNAL-CORPORA','99-ADMIN']) assert.ok(fs.existsSync(path.join(root,dir)),`EMSTD613 missing synchronized directory: ${dir}`);

console.log('EMSTD613 synchronized Atelier Method profile passed.');
