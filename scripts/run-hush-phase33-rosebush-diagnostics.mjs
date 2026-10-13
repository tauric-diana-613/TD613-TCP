import fs from 'fs';
import { listHushMasks } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap } from '../app/engine/hush-swap-phase33.js';
import { PHASE32_1_DIAGNOSTIC_SAMPLE as ROSEBUSH_CUSTODIAN_SAMPLE } from './run-hush-phase32-1-mask-diagnostics.mjs';

const round = (value, digits = 4) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)) : null;
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const sentenceCount = (value = '') => Math.max(1, (String(value).match(/[.!?]+/g) || []).length);
const preview = (value = '', limit = 220) => String(value).replace(/\s+/g, ' ').trim().slice(0, limit);
const unique = (values = []) => [...new Set(values.filter(Boolean))];

function route(mask) {
  return buildHushSwap({
    sourceText: ROSEBUSH_CUSTODIAN_SAMPLE,
    mask,
    maskProfile: mask.profile,
    maskReferenceText: mask.sampleSeed || '',
    contextType: 'group-chat',
    operatorMode: 'expressive-theory',
    exposureDuration: 'single-use',
    options: { candidateCount: 28, includePrivateText: false, expressiveMode: true }
  });
}

export function runPhase33RosebushDiagnostics() {
  const rows = listHushMasks().map((mask) => {
    const result = route(mask);
    const p32 = result.phase32Diagnostics || {};
    const p33 = result.phase33Diagnostics || {};
    const selected = p33.selected || {};
    const output = result.selectedOutput || '';
    return {
      maskId: mask.id,
      label: mask.label,
      family: mask.family,
      profileStatus: mask.profileStatus,
      selectedCandidateId: p33.selectedCandidateId || p32.selectedCandidateId || result.selectedCandidateId || '',
      selectedWasFallback: Boolean(p33.selectedWasFallback ?? p32.selectedWasFallback),
      selectedBoilerplateScore: round(p32.selectedBoilerplateScore),
      selectedMaskSurfaceScore: round(p32.selectedMaskSurfaceScore),
      selectedExpressiveScore: round(p33.phase33Score),
      expressiveActive: Boolean(p33.expressiveActive || p33.expressive?.active),
      expressiveRetention: round(p33.selectedRetentionScore ?? selected.retention?.retentionScore),
      wrapperFatigue: round(p33.selectedWrapperFatigue ?? selected.wrapperFatigue),
      missingExpressiveAnchors: selected.retention?.missing || [],
      outputWords: words(output),
      outputSentences: sentenceCount(output),
      outputPreview: preview(output),
      releaseStatus: result.releaseSummary?.status || result.releasePolicy?.state || 'unreported',
      warnings: unique([...(result.warnings || []), p32.warning, p33.warning])
    };
  });
  const identicalPreviewGroups = Object.values(rows.reduce((acc, row) => {
    const key = row.outputPreview.toLowerCase();
    acc[key] = acc[key] || [];
    acc[key].push(row.label);
    return acc;
  }, {})).filter((group) => group.length > 1);
  const summary = {
    version: 'phase-33-rosebush-diagnostics',
    sampleWords: words(ROSEBUSH_CUSTODIAN_SAMPLE),
    sampleChars: ROSEBUSH_CUSTODIAN_SAMPLE.length,
    maskCount: rows.length,
    fallbackSelectedCount: rows.filter((row) => row.selectedWasFallback).length,
    highBoilerplateCount: rows.filter((row) => Number(row.selectedBoilerplateScore) >= 0.25).length,
    lowSurfaceCount: rows.filter((row) => Number(row.selectedMaskSurfaceScore) < 0.42).length,
    lowExpressiveRetentionCount: rows.filter((row) => Number(row.expressiveRetention) < 0.55).length,
    highWrapperFatigueCount: rows.filter((row) => Number(row.wrapperFatigue) >= 0.18).length,
    blockedOrHeldCount: rows.filter((row) => /blocked|hold|review/i.test(row.releaseStatus)).length,
    identicalPreviewGroups,
    findings: []
  };
  if (summary.fallbackSelectedCount) summary.findings.push('Fallback still selected under expressive mode; Phase 34 may need generator-side expressive candidates, not only selector penalties.');
  if (summary.highBoilerplateCount) summary.findings.push('Record/custody boilerplate remains too selectable under expressive prose.');
  if (summary.lowExpressiveRetentionCount) summary.findings.push('Some masks still drop metaphor/theory anchors; expressive payload must become a generation constraint.');
  if (summary.highWrapperFatigueCount) summary.findings.push('Wrapper fatigue persists; boilerplate openers need regeneration or hard demotion.');
  if (summary.identicalPreviewGroups.length) summary.findings.push('Cross-mask collapse remains visible; enforce stronger mask differentiation.');
  if (!summary.findings.length) summary.findings.push('Phase 33 selector improved the rosebush sample; inspect row previews for aesthetic richness before declaring readiness.');
  return { summary, rows };
}

function markdown(report) {
  const lines = ['# TD613 Hush Phase 33 Rosebush Diagnostics', '', `Sample: ${report.summary.sampleWords} words / ${report.summary.sampleChars} chars.`, `Masks tested: ${report.summary.maskCount}.`, `Fallback selected: ${report.summary.fallbackSelectedCount}.`, `High boilerplate: ${report.summary.highBoilerplateCount}.`, `Low expressive retention: ${report.summary.lowExpressiveRetentionCount}.`, `High wrapper fatigue: ${report.summary.highWrapperFatigueCount}.`, '', '## Findings'];
  for (const finding of report.summary.findings) lines.push(`- ${finding}`);
  lines.push('', '## Mask Rows');
  for (const row of report.rows) {
    lines.push(`### ${row.label} (${row.maskId})`);
    lines.push(`- fallback: ${row.selectedWasFallback}`);
    lines.push(`- surface: ${row.selectedMaskSurfaceScore}`);
    lines.push(`- expressive: ${row.selectedExpressiveScore}`);
    lines.push(`- retention: ${row.expressiveRetention}`);
    lines.push(`- wrapper fatigue: ${row.wrapperFatigue}`);
    lines.push(`- missing anchors: ${row.missingExpressiveAnchors.length ? row.missingExpressiveAnchors.join(', ') : 'none'}`);
    lines.push(`- preview: ${row.outputPreview || '[empty]'}`);
    lines.push('');
  }
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runPhase33RosebushDiagnostics();
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/hush-phase33-rosebush-diagnostics.json', JSON.stringify(report, null, 2));
  fs.writeFileSync('artifacts/hush-phase33-rosebush-diagnostics.md', markdown(report));
  console.log(JSON.stringify(report.summary, null, 2));
  console.log('Wrote artifacts/hush-phase33-rosebush-diagnostics.json');
  console.log('Wrote artifacts/hush-phase33-rosebush-diagnostics.md');
}
