import fs from 'fs';
import { listHushMasks } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap } from '../app/engine/hush-swap-phase32.js';

export const PHASE32_1_DIAGNOSTIC_SAMPLE = `I am a custodian, not a judge, jury, or executioner. These are realistic truths because they are the lived experience of my life and of builders like me. The art of pruning a rose bush in its incipience wins the rose bush competition (do they still have those)?

Make it beautiful to me means: expose the potentiality of rot first as scholastic frameworks have provided, and then put there dromological anchors in a system builder’s own frameworks where theory forecasts potential for rot latency.

I only want to protect others as they build, and uplift them and their work.`;

const round = (value, digits = 4) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : null;
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const sentenceCount = (value = '') => Math.max(1, (String(value).match(/[.!?]+/g) || []).length);
const unique = (values = []) => [...new Set(values.filter(Boolean))];
const preview = (value = '', limit = 220) => String(value).replace(/\s+/g, ' ').trim().slice(0, limit);

function route(mask) {
  return buildHushSwap({
    sourceText: PHASE32_1_DIAGNOSTIC_SAMPLE,
    mask,
    maskProfile: mask.profile,
    maskReferenceText: mask.sampleSeed || '',
    contextType: 'group-chat',
    operatorMode: 'neutralize',
    exposureDuration: 'single-use',
    options: { candidateCount: 24, includePrivateText: false }
  });
}

export function runPhase321Diagnostics() {
  const masks = listHushMasks();
  const rows = masks.map((mask) => {
    const result = route(mask);
    const diag = result.phase32Diagnostics || {};
    const output = result.selectedOutput || '';
    const warningSet = unique([...(result.warnings || []), diag.warning, diag.differentiation?.warning]);
    return {
      maskId: mask.id,
      label: mask.label,
      family: mask.family,
      profileStatus: mask.profileStatus,
      selectedCandidateId: diag.selectedCandidateId || result.selectedCandidateId || '',
      selectedWasFallback: Boolean(diag.selectedWasFallback),
      selectedBoilerplateScore: round(diag.selectedBoilerplateScore),
      selectedMaskSurfaceScore: round(diag.selectedMaskSurfaceScore),
      outputWords: words(output),
      outputSentences: sentenceCount(output),
      outputPreview: preview(output),
      releaseStatus: result.releaseSummary?.status || result.releasePolicy?.state || 'unreported',
      maskMatch: round(result.match?.matchScore),
      semanticFidelity: round(result.scoreBreakdown?.semanticFidelity ?? result.semanticFidelity?.score),
      syntaxShift: round(result.syntaxShiftScore?.syntaxShiftScore ?? result.syntaxShift?.score),
      sourceHeat: round(result.sourceResidueScore?.sourceResidueScore ?? result.sourceResidue?.score),
      uniquenessRatio: round(diag.differentiation?.uniquenessRatio),
      fallbackRatio: round(diag.differentiation?.fallbackRatio),
      warnings: warningSet
    };
  });
  const identicalPreviewGroups = Object.values(rows.reduce((acc, row) => {
    const key = row.outputPreview.toLowerCase();
    acc[key] = acc[key] || [];
    acc[key].push(row.label);
    return acc;
  }, {})).filter((group) => group.length > 1);
  const summary = {
    version: 'phase-32.1-mask-diagnostics',
    sampleChars: PHASE32_1_DIAGNOSTIC_SAMPLE.length,
    sampleWords: words(PHASE32_1_DIAGNOSTIC_SAMPLE),
    maskCount: masks.length,
    fallbackSelectedCount: rows.filter((row) => row.selectedWasFallback).length,
    highBoilerplateCount: rows.filter((row) => Number(row.selectedBoilerplateScore) >= 0.25).length,
    lowSurfaceCount: rows.filter((row) => Number(row.selectedMaskSurfaceScore) < 0.42).length,
    blockedOrHeldCount: rows.filter((row) => /blocked|hold|review/i.test(row.releaseStatus)).length,
    identicalPreviewGroups,
    phase33Findings: []
  };
  if (summary.fallbackSelectedCount) summary.phase33Findings.push('Fallback selection still appears for some masks; continue demoting literal-safe fallback or require stronger mask-writer candidates.');
  if (summary.highBoilerplateCount) summary.phase33Findings.push('Custody-boilerplate remains too available; expand penalty language and add anti-record-anchor regeneration.');
  if (summary.lowSurfaceCount > Math.ceil(rows.length * 0.25)) summary.phase33Findings.push('Mask surface scores remain weak across a broad slice of masks; writer needs stronger persona-specific syntactic realization.');
  if (summary.identicalPreviewGroups.length) summary.phase33Findings.push('At least one group of masks produced identical/near-identical previews; add cross-mask differentiation tests.');
  if (summary.blockedOrHeldCount > Math.ceil(rows.length * 0.5)) summary.phase33Findings.push('Release policy may be too conservative for ordinary creative/reflective text; add a non-whistleblower expressive mode.');
  if (!summary.phase33Findings.length) summary.phase33Findings.push('No catastrophic cross-mask collapse detected, but inspect row-level outputs for voice richness and meaning preservation.');
  return { summary, rows };
}

function markdown(report) {
  const lines = [];
  lines.push('# TD613 Hush Phase 32.1 Mask Diagnostics');
  lines.push('');
  lines.push(`Sample: ${report.summary.sampleWords} words / ${report.summary.sampleChars} chars.`);
  lines.push(`Masks tested: ${report.summary.maskCount}.`);
  lines.push(`Fallback selected: ${report.summary.fallbackSelectedCount}.`);
  lines.push(`High boilerplate: ${report.summary.highBoilerplateCount}.`);
  lines.push(`Low surface score: ${report.summary.lowSurfaceCount}.`);
  lines.push(`Blocked/held/review: ${report.summary.blockedOrHeldCount}.`);
  lines.push('');
  lines.push('## Phase 33 Findings');
  for (const finding of report.summary.phase33Findings) lines.push(`- ${finding}`);
  lines.push('');
  lines.push('## Mask Rows');
  for (const row of report.rows) {
    lines.push(`### ${row.label} (${row.maskId})`);
    lines.push(`- family: ${row.family || 'n/a'}`);
    lines.push(`- fallback: ${row.selectedWasFallback}`);
    lines.push(`- boilerplate: ${row.selectedBoilerplateScore}`);
    lines.push(`- surface: ${row.selectedMaskSurfaceScore}`);
    lines.push(`- release: ${row.releaseStatus}`);
    lines.push(`- warnings: ${row.warnings.length ? row.warnings.join(', ') : 'none'}`);
    lines.push(`- preview: ${row.outputPreview || '[empty]'}`);
    lines.push('');
  }
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runPhase321Diagnostics();
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/hush-phase32-1-mask-diagnostics.json', JSON.stringify(report, null, 2));
  fs.writeFileSync('artifacts/hush-phase32-1-mask-diagnostics.md', markdown(report));
  console.log(JSON.stringify(report.summary, null, 2));
}
