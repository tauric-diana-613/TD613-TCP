import assert from 'node:assert/strict';
import { evaluateSourceResidual } from '../app/engine/hush-source-residual-guard.js';
import { evaluateApertureRepairCandidate } from '../app/engine/hush-aperture-repair-pass.js';

const source = 'Collapse might appear distinct for each individual: some fight, some endure, some participate. The path connecting how they all relate routes through institutional drift, then exposure, culminating in rupture. Rupture becomes the release point.';
const sourceStuck = 'Collapse appears distinct for each individual: some fight, some endure, some participate. The path connecting how they all relate routes through institutional drift, then exposure, culminating in rupture. Rupture becomes release.';
const transformed = 'The surface offers three postures: resistance, endurance, and participation. Underneath them sits the same institutional drift toward exposure. The release point arrives when the old route breaks instead of merely changing its costume.';

const stuck = evaluateSourceResidual(source, sourceStuck);
const clean = evaluateSourceResidual(source, transformed);
assert.match(stuck.version, /source-residue-adapter/);
assert.ok(stuck.sourceResidualPercent > clean.sourceResidualPercent, JSON.stringify({ stuck, clean }));
assert.ok(stuck.warnings.includes('source-residual-high') || stuck.warnings.includes('source-body-severe') || stuck.warnings.includes('source-body-attached'), JSON.stringify(stuck));
assert.ok(stuck.cadenceBodyRisk > clean.cadenceBodyRisk, JSON.stringify({ stuck, clean }));
assert.ok(stuck.longestCopiedRun > clean.longestCopiedRun, JSON.stringify({ stuck, clean }));

const meterSupplied = evaluateSourceResidual(source, transformed, { sourceResidualRisk: 0.71 });
assert.equal(meterSupplied.escapeVectorRisk, 0.71);
assert.equal(meterSupplied.sourceResidualPercent, 71);
assert.ok(meterSupplied.warnings.includes('escape-vector-source-risk-used'));

const stuckEval = evaluateApertureRepairCandidate({ id: 'stuck', text: sourceStuck }, source, { mask: { id: 'grandma-receipts', label: 'Receipts Queenie' } });
const cleanEval = evaluateApertureRepairCandidate({ id: 'clean', text: transformed }, source, { mask: { id: 'grandma-receipts', label: 'Receipts Queenie' } });
assert.ok(stuckEval.penalty > cleanEval.penalty, JSON.stringify({ stuckEval, cleanEval }));
assert.ok(stuckEval.warnings.some((warning) => warning.includes('source')), JSON.stringify(stuckEval));

console.log('hush-source-residual-guard: ok');
