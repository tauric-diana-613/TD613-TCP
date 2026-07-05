import { buildSourceResidue, scoreSourceResidue, summarizeSourceResidue } from './hush-source-residue.js';

export const HUSH_SOURCE_RESIDUAL_GUARD_VERSION = 'hush-source-residual-guard/v2-source-residue-adapter';

const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function evaluateSourceResidual(source = '', candidate = '', options = {}) {
  const sourceResidue = buildSourceResidue({ sourceText: source, outputText: candidate, protectedLiterals: options.protectedLiterals || [] });
  const residueScore = scoreSourceResidue(sourceResidue);
  const summary = summarizeSourceResidue(sourceResidue);
  const escapeVectorRisk = Number(options.escapeVector?.scores?.sourceResidualRisk ?? options.sourceResidualRisk);
  const localRisk = Number(residueScore.sourceResidueRisk ?? 0);
  const sourceResidualScore = round4(Number.isFinite(escapeVectorRisk) ? Math.max(escapeVectorRisk, localRisk) : localRisk);
  const warnings = [...new Set([
    ...asArray(sourceResidue.warnings),
    ...asArray(residueScore.warnings),
    ...(sourceResidualScore >= 0.62 ? ['source-residual-high'] : sourceResidualScore >= 0.42 ? ['source-residual-review'] : []),
    ...(Number.isFinite(escapeVectorRisk) ? ['escape-vector-source-risk-used'] : ['source-residue-local-risk-used'])
  ])];
  return Object.freeze({
    schema: 'td613-hush-source-residual-guard/v1',
    version: HUSH_SOURCE_RESIDUAL_GUARD_VERSION,
    sourceResidualScore,
    sourceResidualPercent: Math.round(sourceResidualScore * 100),
    escapeVectorRisk: Number.isFinite(escapeVectorRisk) ? round4(escapeVectorRisk) : null,
    sourceResidueRisk: round4(localRisk),
    cadenceBodyRisk: summary.cadenceBodyRisk ?? null,
    nonLiteralTokenRetention: summary.nonLiteralTokenRetention ?? null,
    longestCopiedRun: summary.longestCopiedRun ?? null,
    sentenceSkeletonSimilarity: summary.sentenceSkeletonSimilarity ?? null,
    sourceResidueStatus: sourceResidue.status,
    sourceResidue,
    warnings,
    hardHigh: sourceResidualScore >= 0.62 || sourceResidue.status === 'severe'
  });
}
