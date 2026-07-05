import assert from 'node:assert/strict';
import { evaluateSourceResidual } from '../app/engine/hush-source-residual-guard.js';
import { evaluateApertureRepairCandidate } from '../app/engine/hush-aperture-repair-pass.js';

const source = 'Collapse might appear distinct for each individual: some fight, some endure, some participate. The path connecting how they all relate routes through institutional drift, then exposure, culminating in rupture. Rupture becomes the release point.';
const sourceStuck = 'Collapse appears distinct for each individual: some fight, some endure, some participate. The path connecting how they all relate routes through institutional drift, then exposure, culminating in rupture. Rupture becomes release.';
const transformed = 'The surface offers three postures: resistance, endurance, and participation. Underneath them sits the same institutional drift toward exposure. The release point arrives when the old route breaks instead of merely changing its costume.';

const stuck = evaluateSourceResidual(source, sourceStuck);
const clean = evaluateSourceResidual(source, transformed);
assert.ok(stuck.sourceResidualPercent > clean.sourceResidualPercent, JSON.stringify({ stuck, clean }));
assert.ok(stuck.warnings.includes('source-residual-high'), JSON.stringify(stuck));
assert.ok(stuck.bigramCarryover > clean.bigramCarryover);
assert.ok(stuck.trigramCarryover > clean.trigramCarryover);

const stuckEval = evaluateApertureRepairCandidate({ id: 'stuck', text: sourceStuck }, source, { mask: { id: 'grandma-receipts', label: 'Receipts Queenie' } });
const cleanEval = evaluateApertureRepairCandidate({ id: 'clean', text: transformed }, source, { mask: { id: 'grandma-receipts', label: 'Receipts Queenie' } });
assert.ok(stuckEval.penalty > cleanEval.penalty, JSON.stringify({ stuckEval, cleanEval }));
assert.ok(stuckEval.warnings.some((warning) => warning.includes('source-residual')), JSON.stringify(stuckEval));

console.log('hush-source-residual-guard: ok');
