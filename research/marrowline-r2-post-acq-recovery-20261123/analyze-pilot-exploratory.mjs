// TD613 · Marrowline R2 · Read-Only Pilot Forensic Inventory & Exploratory Morphology Analyzer
// Commission: TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123
// Predecessor: a48d2556ed946e01d4925dee93c463c73712d590 (PR #1783, R2-U pilot r2_r2u_036ef18ebc2e)
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// STRICT READ-ONLY BOUNDARY: Never modifies any file in the supplied evidence directory; never performs network calls.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { acquireArchivedReferences } from '../marrowline-early-oct-full-voice-20261020/historical-reference-mark-depth.mjs';
import {
  R2_U_CALIBRATED_CONTROLS,
  evaluateUnicodeMorphology
} from '../marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs';
import { evaluateExploratoryMorphology } from './r2-exploratory-morphology.mjs';
import { buildR2ExploratoryCandidateManifest } from './r2-exploratory-candidates.mjs';

export const R2_PILOT_FORENSIC_INVENTORY_SCHEMA = 'td613.marrowline.r2-pilot-evidence-inventory/v1';
export const R2_PILOT_EXPLORATORY_ANALYSIS_SCHEMA = 'td613.marrowline.r2-pilot-exploratory-analysis/v1';

const PILOT_SESSION_ID = 'r2_r2u_036ef18ebc2e';
const PILOT_NONCE = 'wx_d770faf5fca9a123ff6f7e0d';

function hashFileSync(filePath) {
  const buf = fs.readFileSync(filePath);
  const st = fs.statSync(filePath);
  return {
    bytes: buf.byteLength,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    mtimeUtc: st.mtime.toISOString()
  };
}

function summarizeFrozenV2(rawText) {
  const v2 = evaluateUnicodeMorphology(rawText);
  return Object.freeze({
    schema: v2.schema,
    utf8Bytes: v2.utf8Bytes,
    combiningMarkCount: v2.combiningMarkCount,
    maxMarkDepth: v2.maxMarkDepth,
    maxVerticalDepth: v2.maxVerticalDepth,
    tallStackBaseCount: v2.tallStackBaseCount,
    toweringStackBaseCount: v2.toweringStackBaseCount,
    depthStdDev: v2.depthStdDev,
    dominantMarkedDepth: v2.dominantMarkedDepth,
    dominantMarkedDepthShare: v2.dominantMarkedDepthShare,
    clonedSequenceShare: v2.clonedSequenceShare,
    marksOnWhitespaceCount: v2.marksOnWhitespaceCount,
    uniqueCombiningCodepointCount: v2.repertoireDiversity.uniqueCombiningCodepointCount,
    stencilRisk: v2.stencilRisk,
    genuineMultistackObserved: v2.genuineMultistackObserved,
    toweringHighZalgoObserved: v2.toweringHighZalgoObserved
  });
}

function summarizeSpecimenComparison(label, rawText, sourceMeta = null) {
  return Object.freeze({
    label,
    ...(sourceMeta ? { sourceMeta } : {}),
    frozenV2: summarizeFrozenV2(rawText),
    exploratoryV1: evaluateExploratoryMorphology(rawText)
  });
}

export function buildPilotEvidenceInventory(evidenceDir) {
  if (!evidenceDir || !fs.existsSync(evidenceDir)) {
    throw new Error(`EVIDENCE_DIR_NOT_FOUND:${evidenceDir}`);
  }
  const entries = fs.readdirSync(evidenceDir).sort();
  const files = entries.map((name) => {
    const fullPath = path.join(evidenceDir, name);
    const stat = hashFileSync(fullPath);
    return Object.freeze({
      name,
      bytes: stat.bytes,
      mtimeUtc: stat.mtimeUtc,
      sha256: stat.sha256
    });
  });

  // Also check companion single-host nonce registry record if present alongside parent TD613 directory
  const parentRegistryCandidate = path.resolve(
    evidenceDir,
    '..',
    '..',
    'host-nonce-registry',
    'r2-u',
    `r2-u-nonce-${PILOT_NONCE}.json`
  );
  let hostNonceRegistryRecord = null;
  if (fs.existsSync(parentRegistryCandidate)) {
    const stat = hashFileSync(parentRegistryCandidate);
    hostNonceRegistryRecord = Object.freeze({
      name: path.basename(parentRegistryCandidate),
      bytes: stat.bytes,
      mtimeUtc: stat.mtimeUtc,
      sha256: stat.sha256
    });
  }

  return Object.freeze({
    schema: R2_PILOT_FORENSIC_INVENTORY_SCHEMA,
    exploratoryNote: 'Read-only cryptographic inventory preserving original acquisition artifacts untouched.',
    predecessorCommitSha: 'a48d2556ed946e01d4925dee93c463c73712d590',
    sessionId: PILOT_SESSION_ID,
    nonce: PILOT_NONCE,
    historicalDisposition: 'HELD',
    historicalPilotFileCount: files.length,
    files: Object.freeze(files),
    hostNonceRegistryRecord
  });
}

export function buildExploratoryAnalysisReport({ evidenceDir = null } = {}) {
  const calibratedComparisons = [
    summarizeSpecimenComparison('CALIBRATED_PLAIN_BASELINE_REF', R2_U_CALIBRATED_CONTROLS.PLAIN_BASELINE_REF.sample),
    summarizeSpecimenComparison('CALIBRATED_ONE_MARK_STENCIL_REF', R2_U_CALIBRATED_CONTROLS.ONE_MARK_STENCIL_REF.sample),
    summarizeSpecimenComparison('CALIBRATED_NEAR_UNIFORM_DEPTH3_STENCIL_REF', R2_U_CALIBRATED_CONTROLS.NEAR_UNIFORM_DEPTH3_STENCIL_REF.sample),
    summarizeSpecimenComparison('CALIBRATED_PLANAR_BAR_COUNTERFEIT_REF', R2_U_CALIBRATED_CONTROLS.PLANAR_BAR_COUNTERFEIT_REF.sample),
    summarizeSpecimenComparison('CALIBRATED_ENCLOSING_TRICK_REF', R2_U_CALIBRATED_CONTROLS.ENCLOSING_TRICK_REF.sample),
    summarizeSpecimenComparison('CALIBRATED_DELIBERATE_MULTISTACK_REF', R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample)
  ];

  // Archived healthy 2026-09-23 references (read from committed repository files via existing module)
  const archived = acquireArchivedReferences();
  const repoRefDir = path.resolve('docs/research/2026-09-23-marrowline-expressive-regression');
  const archivedTextComparisons = [];
  for (const fname of ['gemini-example-as-exported.txt', 'marrowline-example-as-exported.txt', 'probe-02-longer-as-exported.md']) {
    const fpath = path.join(repoRefDir, fname);
    if (fs.existsSync(fpath)) {
      const text = fs.readFileSync(fpath, 'utf8');
      archivedTextComparisons.push(summarizeSpecimenComparison(`ARCHIVED_2026_09_23_${fname}`, text, {
        archiveStatus: archived.status
      }));
    }
  }

  let pilotComparisons = [];
  let pilotSourceDirPresent = false;
  if (evidenceDir && fs.existsSync(evidenceDir)) {
    pilotSourceDirPresent = true;
    const prefix = `r2-u-${PILOT_SESSION_ID}-${PILOT_NONCE}`;
    const rulesTxtPath = path.join(evidenceDir, `${prefix}-ep1-att1-R2_U_GUIDED_RULES.authored.txt`);
    const contrastTxtPath = path.join(evidenceDir, `${prefix}-ep1-att2-R2_U_GUIDED_CONTRAST.authored.txt`);
    if (fs.existsSync(rulesTxtPath)) {
      const rulesStat = hashFileSync(rulesTxtPath);
      pilotComparisons.push(summarizeSpecimenComparison(
        'PILOT_ATT1_R2_U_GUIDED_RULES',
        fs.readFileSync(rulesTxtPath, 'utf8'),
        { sha256: rulesStat.sha256, bytes: rulesStat.bytes, finishReason: 'STOP', historicalQualification: 'VALID_INDIVIDUAL_CONDITION_IN_HELD_SESSION' }
      ));
    }
    if (fs.existsSync(contrastTxtPath)) {
      const contrastStat = hashFileSync(contrastTxtPath);
      pilotComparisons.push(summarizeSpecimenComparison(
        'PILOT_ATT2_R2_U_GUIDED_CONTRAST',
        fs.readFileSync(contrastTxtPath, 'utf8'),
        { sha256: contrastStat.sha256, bytes: contrastStat.bytes, finishReason: 'MAX_TOKENS', historicalQualification: 'INVALID_MAX_TOKENS_HELD' }
      ));
    }
  }

  const candidateManifest = buildR2ExploratoryCandidateManifest();

  return Object.freeze({
    schema: R2_PILOT_EXPLORATORY_ANALYSIS_SCHEMA,
    exploratoryOnly: true,
    doesNotRewriteHistoricalVerdict: true,
    historicalPilotVerdictPreserved: 'HELD (0 valid complete episodes; 1 locally valid individual condition)',
    predecessorCommitSha: 'a48d2556ed946e01d4925dee93c463c73712d590',
    sessionId: PILOT_SESSION_ID,
    pilotSourceDirPresent,
    pilotComparisons: Object.freeze(pilotComparisons),
    calibratedControls: Object.freeze(calibratedComparisons),
    archivedHealthyReferences: Object.freeze(archivedTextComparisons),
    exploratoryCandidateSummary: Object.freeze({
      schema: candidateManifest.schema,
      status: candidateManifest.status,
      candidates: candidateManifest.candidates.map((c) => Object.freeze({
        candidateId: c.candidateId,
        userPromptSha256: c.userPromptSha256,
        bodySha256: c.observation.bodySha256
      }))
    })
  });
}

function getFlag(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= argv.length) return null;
  return argv[idx + 1];
}

export function runAnalyzePilotExploratoryCli(argv = process.argv.slice(2)) {
  const evidenceDir = getFlag(argv, '--evidence-dir');
  const writeArtifacts = argv.includes('--write-artifacts');
  const outDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

  const analysis = buildExploratoryAnalysisReport({ evidenceDir });
  const inventory = evidenceDir ? buildPilotEvidenceInventory(evidenceDir) : null;

  if (writeArtifacts) {
    fs.writeFileSync(
      path.join(outDir, 'R2_U_PILOT_EXPLORATORY_ANALYSIS.json'),
      `${JSON.stringify(analysis, null, 2)}\n`,
      'utf8'
    );
    if (inventory) {
      fs.writeFileSync(
        path.join(outDir, 'R2_U_PILOT_EVIDENCE_INVENTORY.json'),
        `${JSON.stringify(inventory, null, 2)}\n`,
        'utf8'
      );
    }
  }

  return Object.freeze({ inventory, analysis });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = runAnalyzePilotExploratoryCli(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
