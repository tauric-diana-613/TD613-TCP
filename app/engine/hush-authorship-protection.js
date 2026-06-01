export const HUSH_AUTHORSHIP_PROTECTION_VERSION = 'pr148-protected-authorship-policy/v1';

const SYNTHETIC_MASK_IDS = new Set(['formal-record', 'hr-portal', 'academic-caveat']);
const SYNTHETIC_DISPLAY_LIMIT = 3;

const DEFAULT_HUMAN_POLICY = Object.freeze({
  authorshipClass: 'human-protective',
  syntheticAllowed: false,
  substratePolicy: 'preserve-source-substrate',
  provenancePolicy: 'do-not-represent-assisted-text-as-unassisted-authorship',
  protectionMode: 'identity-minimizing-source-stewardship',
  releaseDoctrine: 'mask-is-route-pressure-not-author-certification',
  operatorWarning: 'Preserve irregularity, sequence, pressure, and facts. Avoid flattening protected source text into generic assistant prose.'
});

const SYNTHETIC_POLICY = Object.freeze({
  authorshipClass: 'synthetic-protective',
  syntheticAllowed: true,
  substratePolicy: 'explicit-procedural-surface',
  provenancePolicy: 'mark-as-assisted-procedural-surface',
  protectionMode: 'procedural-buffer-for-high-friction-systems',
  releaseDoctrine: 'synthetic-mask-may-sound-institutional-but-must-not-certify-human-authorship',
  operatorWarning: 'This is an approved synthetic surface for portal, archive, or analytic shielding. Treat it as procedural cover, not a human-authorship claim.'
});

export function syntheticMaskIds() {
  return [...SYNTHETIC_MASK_IDS];
}

export function isSyntheticMask(mask = {}) {
  return SYNTHETIC_MASK_IDS.has(String(mask.id || '').trim());
}

export function classifySourceSubstrate(sourceText = '') {
  const text = String(sourceText || '').trim();
  if (!text) return { state: 'empty', confidence: 0, warnings: ['source-empty'] };
  const words = (text.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []);
  const assistantMarkers = [
    /^here(?:'s| is)\b/i,
    /\bin summary\b/i,
    /\bto clarify\b/i,
    /\bwhat matters is\b/i,
    /\bi can help\b/i,
    /\bthe key point is\b/i,
    /\bthis version\b/i,
    /\blet's break it down\b/i
  ];
  const humanPressureMarkers = [
    /\bidk\b|\bimo\b|\btbh\b|\bfr\b|\bofc\b|\bugh\b/i,
    /[—]{1,}|\.\.\.|\(.*?\)/,
    /\bactually\b.*\bbut\b|\bnot even\b|\bi mean\b/i,
    /[𝌋⟐]|Khona‌lit-po|TD613/i
  ];
  const assistantHits = assistantMarkers.filter((rx) => rx.test(text)).length;
  const humanHits = humanPressureMarkers.filter((rx) => rx.test(text)).length;
  const sentenceCount = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const avg = words.length / sentenceCount;
  const tooEven = sentenceCount >= 4 && avg >= 13 && avg <= 23 && assistantHits > 0;
  if (assistantHits >= 2 || tooEven) return { state: 'assisted-scaffold-risk', confidence: Math.min(0.95, 0.45 + assistantHits * 0.18), warnings: ['assisted-substrate-risk'] };
  if (humanHits >= 1) return { state: 'user-authored-likely', confidence: Math.min(0.9, 0.45 + humanHits * 0.16), warnings: [] };
  return { state: 'unknown', confidence: 0.35, warnings: ['substrate-uncertain'] };
}

export function buildAuthorshipProtectionPolicy({ mask = {}, sourceText = '' } = {}) {
  const synthetic = isSyntheticMask(mask);
  const base = synthetic ? SYNTHETIC_POLICY : DEFAULT_HUMAN_POLICY;
  const sourceSubstrate = classifySourceSubstrate(sourceText);
  const warnings = [
    ...sourceSubstrate.warnings,
    SYNTHETIC_MASK_IDS.size > SYNTHETIC_DISPLAY_LIMIT ? 'synthetic-mask-count-above-gallery-limit' : '',
    synthetic ? 'synthetic-mask-explicit' : 'human-protective-mask',
    sourceSubstrate.state === 'assisted-scaffold-risk' && !synthetic ? 'human-mask-cannot-certify-unassisted-authorship-from-assisted-scaffold' : ''
  ].filter(Boolean);
  return {
    version: HUSH_AUTHORSHIP_PROTECTION_VERSION,
    maskId: mask.id || '',
    maskLabel: mask.label || mask.name || '',
    syntheticMaskIds: syntheticMaskIds(),
    syntheticMaskCount: SYNTHETIC_MASK_IDS.size,
    ...base,
    sourceSubstrate,
    warnings,
    antiGenericLaw: [
      'do not convert protected source language into generic assistant prose',
      'do not fabricate unassisted authorship from assisted scaffolding',
      'do not collapse lived irregularity into tidy explanation',
      'do not expose relational, workplace, or identity clues unless required by source meaning'
    ],
    preserveUnderMask: [
      'facts, dates, sequence, uncertainty, negation, and claims',
      'source pressure points and meaningful irregularity',
      'source safety and identity minimization',
      'semantic custody without extra admissions',
      'interior rearchitecture rather than edge decoration'
    ]
  };
}

export function applyAuthorshipProtectionToMask(mask = {}) {
  const policy = buildAuthorshipProtectionPolicy({ mask });
  const existingWarnings = Array.isArray(mask.pressureWarnings) ? mask.pressureWarnings : [];
  return {
    ...mask,
    authorshipClass: policy.authorshipClass,
    syntheticAllowed: policy.syntheticAllowed,
    authorshipProtection: policy,
    pressureWarnings: [...new Set([...existingWarnings, ...policy.warnings, policy.provenancePolicy])]
  };
}
