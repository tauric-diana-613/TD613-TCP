import assert from 'assert';
import phase28HushMasks from '../app/data/hush-phase28-masks.js';
import { buildPhase28HushSwap } from '../app/engine/hush-phase28-swap.js';
import { phase28SourceInputs, phase28Targets } from './fixtures/hush-phase28-target-register-fixtures.mjs';

const avg = (values) => {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
};

const maskById = (id) => phase28HushMasks.find((mask) => mask.id === id);

function runRow(target, input, index) {
  const mask = maskById(target.maskId);
  assert(mask, `missing ${target.maskId}`);
  const result = buildPhase28HushSwap({ sourceText: input, mask, targetRegister: target.id, registerMode: target.registerMode, options: { candidateCount: 30 } });
  const output = result.selectedOutput || result.reviewOutput || '';
  return {
    name: `${target.id}-${index + 1}`,
    maskId: target.maskId,
    targetRegister: target.id,
    input,
    output,
    emitted: Boolean(output.trim()),
    ready: Boolean(result.phase28?.ready),
    score: result.phase28?.score ?? null,
    targetFeatureCount: result.targetRegisterAudit?.targetFeaturesAdded?.length ?? 0,
    targetFailures: result.targetRegisterAudit?.hardFailures || [],
    eventShapePassed: result.targetRegisterAudit?.eventShapePassed !== false,
    certaintyInflation: Boolean(result.targetRegisterAudit?.certaintyInflation),
    registerOverreach: Boolean(result.targetRegisterAudit?.registerOverreach),
    warnings: result.targetRegisterAudit?.warnings || []
  };
}

function summarize(rows = []) {
  return {
    attempts: rows.length,
    emitted: rows.filter((row) => row.emitted).length,
    readyRows: rows.filter((row) => row.ready).length,
    targetFeatureFailures: rows.filter((row) => row.targetFeatureCount === 0).length,
    eventShapeFailures: rows.filter((row) => !row.eventShapePassed).length,
    certaintyInflationRows: rows.filter((row) => row.certaintyInflation).length,
    overreachRows: rows.filter((row) => row.registerOverreach).length,
    hardFailureRows: rows.filter((row) => row.targetFailures.length).length,
    avgScore: avg(rows.map((row) => row.score)),
    rows
  };
}

function ready(summary) {
  return summary.attempts > 0
    && summary.emitted === summary.attempts
    && summary.readyRows === summary.attempts
    && summary.targetFeatureFailures === 0
    && summary.eventShapeFailures === 0
    && summary.certaintyInflationRows === 0
    && summary.overreachRows === 0
    && summary.hardFailureRows === 0;
}

const rows = Object.fromEntries(phase28Targets.map((target) => [target.id, phase28SourceInputs.map((input, index) => runRow(target, input, index))]));
const aave = summarize(rows.aave);
const chatspeak = summarize(rows.chatspeak);
const blip = summarize(rows.blip);
const report = {
  version: 'phase-28-target-register-report',
  readinessTruthTightened: true,
  masks: phase28HushMasks.map((mask) => ({ id: mask.id, label: mask.label, family: mask.family })),
  targetRegisterFlights: { aave, chatspeak, blip },
  gates: {
    protectedLiterals: 'checked-by-target-audit',
    eventShape: 'checked-by-target-audit',
    certainty: 'checked-by-target-audit',
    targetFeatureVisibility: 'checked-by-target-audit',
    overreach: 'checked-by-target-audit',
    identityInference: 'checked-by-target-audit'
  }
};
report.readiness = {
  transformToAave: ready(aave),
  transformToChatspeak: ready(chatspeak),
  blipAmplified: ready(blip)
};
report.readiness.overall = report.readiness.transformToAave && report.readiness.transformToChatspeak && report.readiness.blipAmplified;

console.log('HUSH_PHASE28_TARGET_REGISTER_REPORT ' + JSON.stringify(report));
assert.equal(phase28HushMasks.length, 3);
assert(aave.emitted > 0);
assert(chatspeak.emitted > 0);
assert(blip.emitted > 0);
console.log('hush-phase28-target-register-report tests passed');
