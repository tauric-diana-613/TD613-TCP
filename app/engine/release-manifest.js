export const RELEASE_MANIFEST_VERSION = 'phase-10';

export const RELEASE_PRODUCT_NAME = 'TD613 Hush';
export const RELEASE_SHORT_NAME = 'Hush';
export const RELEASE_REPO_CONTEXT = 'TD613-TCP repository';

export const RELEASE_PHASES = Object.freeze([
  { phase: 0, title: 'Architecture Admission', summary: 'Named the Hush bench as a closed-loop authorship-recognition surface inside The Cadence Playground.' },
  { phase: 1, title: 'Escape Vector', summary: 'Added source residual, mask fit, safe delta, semantic fidelity, BWC, ingestion friction, and recapture metrics.' },
  { phase: 2, title: 'Ingestion Friction', summary: 'Measured Unicode, glyph, ZWNJ, normalization, and protected literal surfaces.' },
  { phase: 3, title: 'Closed-Loop Controller', summary: 'Added continue, hold, restore, rotate, and seal steering states.' },
  { phase: 4, title: 'Persona Memory', summary: 'Made Personas history-aware exposure membranes.' },
  { phase: 5, title: 'Adversarial Bench UI', summary: 'Built the local cockpit for baseline, mask, draft, output, and analysis.' },
  { phase: 6, title: 'Iteration Ledger', summary: 'Added the black-box flight recorder with private text excluded by default.' },
  { phase: 7, title: 'Claim Ladder + Report Export', summary: 'Added claim ceilings, forbidden-claim detection, JSON reports, and Markdown reports.' },
  { phase: 8, title: 'Fixtures, Calibration, and Tests', summary: 'Added hostile fixtures and regression pressure so scoring drift becomes visible.' },
  { phase: 9, title: 'Recognition Field Simulator', summary: 'Added local context-pressure simulation across communication fields.' },
  { phase: 10, title: 'Integration Discipline + Release Hardening', summary: 'Consolidates docs, release posture, operator guide, limitations, and governance checks.' }
]);

export const RELEASE_CAPABILITIES = Object.freeze([
  'local stylometry review',
  'authorship-recognition pressure measurement',
  'mask-fit review',
  'source residual risk review',
  'semantic preservation review',
  'protected literal review',
  'ingestion friction review',
  'Persona memory review',
  'iteration ledger export',
  'claim ceiling evaluation',
  'local report export',
  'calibration fixture regression',
  'local context-pressure simulation'
]);

export const RELEASE_BOUNDARIES = Object.freeze([
  'No identity verdicts',
  'No anonymity claims',
  'No untraceability claims',
  'No platform-proof claims',
  'No platform outcome prediction',
  'No hidden classifier access claims',
  'No publication safety guarantee',
  'No private text export by default',
  'No cloud/API calls required for core workflow',
  'No durable private tracking added by Phase 10',
  'Hush is a toy inside The Cadence Playground, not the whole repository',
  'TD613 Flight and Safe Harbor remain adjacent systems, not Hush itself'
]);

const FORBIDDEN_PATTERNS = Object.freeze([
  { id: 'anonymous', pattern: /\banonymous\b/i },
  { id: 'untraceable', pattern: /\buntraceable\b/i },
  { id: 'platform-proof', pattern: /\bplatform[- ]proof\b/i },
  { id: 'guaranteed safe', pattern: /\bguaranteed safe\b/i },
  { id: 'not same author', pattern: /\bnot[- ]same[- ]author\b/i },
  { id: 'same author', pattern: /\bsame[- ]author\b/i },
  { id: 'identity proven', pattern: /\bidentity proven\b/i },
  { id: 'identity disproven', pattern: /\bidentity disproven\b/i },
  { id: 'cannot be linked', pattern: /\bcannot be linked\b/i },
  { id: 'will evade detection', pattern: /\bwill evade detection\b/i },
  { id: 'safe to publish', pattern: /\bsafe to publish\b/i },
  { id: 'bypass classifier', pattern: /\bbypass(?:es|ing)? classifier\b/i },
  { id: 'defeat scraper', pattern: /\bdefeat(?:s|ing)? scraper\b/i },
  { id: 'fool platform', pattern: /\bfool(?:s|ing)? platform\b/i }
]);

const SAFE_CONTEXT_RE = /\b(no .*claims?|no .*verdicts?|no .*guarantee|does not claim|does not support claims? of|does not prove|does not issue|does not determine|do not claim|do not support claims? of|do not prove|do not issue|do not determine|must not claim|must not support claims? of|must not prove|must not issue|must not determine|cannot claim|cannot support claims? of|cannot prove|cannot issue|cannot determine|not claim|not prove|not issue|not determine|without claiming|without proving|refuse[sd]?|refuses|avoid[sd]? claiming|unsupported|prohibited|forbidden|boundary|boundaries|limitation|limitations|warning|warnings|fixture|fixtures|test|tests|calibration|detector catches|overclaim detector|forbidden release language)\b/i;

function normalizeText(value = '') {
  return String(value || '');
}

function lineHasSafeContext(line = '') {
  return SAFE_CONTEXT_RE.test(line);
}

export function detectReleaseOverclaim(text = '') {
  const lines = normalizeText(text).split(/\r?\n/);
  const matches = [];
  for (const line of lines) {
    for (const item of FORBIDDEN_PATTERNS) {
      if (!item.pattern.test(line)) continue;
      if (lineHasSafeContext(line)) continue;
      matches.push({ id: item.id, line: line.trim() });
    }
  }
  return {
    hasOverclaim: matches.length > 0,
    matches,
    severity: matches.length ? 'block' : 'clear'
  };
}

export function buildReleaseManifest(input = {}) {
  const requiredScripts = input.requiredScripts || ['test:fixtures', 'test:recognition', 'test:release', 'test:stylometry'];
  const docs = input.docs || [
    'README.md',
    'docs/INDEX.md',
    'docs/OPERATOR_GUIDE.md',
    'docs/PHASE_MAP.md',
    'docs/KNOWN_LIMITATIONS.md',
    'docs/RESPONSIBLE_USE.md',
    'docs/CALIBRATION_REVIEW_CHECKLIST.md',
    'docs/RELEASE_NOTES_PHASE_0_10.md',
    'docs/WHISTLEBLOWER_POLICY_POSTURE.md',
    'docs/ANTI_SELECTIVE_ADMISSIBILITY.md',
    'docs/RUPTURE_AND_TONI_CLAUSE.md',
    'docs/PHASE_10_RELEASE_STATUS.md'
  ];
  const tests = input.tests || [
    'tests/release-manifest.test.mjs',
    'tests/docs-surface.test.mjs',
    'tests/release-hardening.test.mjs'
  ];
  return {
    version: RELEASE_MANIFEST_VERSION,
    releaseName: 'TD613 Hush Toy-to-Tool Closeout',
    productName: RELEASE_PRODUCT_NAME,
    shortName: RELEASE_SHORT_NAME,
    repositoryContext: RELEASE_REPO_CONTEXT,
    placement: 'A toy inside The Cadence Playground for users routed toward hush-work by pressure, need, or review discipline.',
    localOnly: true,
    phases: [...RELEASE_PHASES],
    capabilities: [...RELEASE_CAPABILITIES],
    boundaries: [...RELEASE_BOUNDARIES],
    requiredScripts,
    docs,
    tests,
    releaseStatus: 'reviewable',
    limitations: [
      'Hush provides local review, not survival certainty.',
      'Local seal means bounded local convergence, not publication safety.',
      'Recognition Field simulation models local context pressure, not platform behavior.',
      'Calibration fixtures reveal scoring drift; they do not certify real-world outcomes.',
      'Human review remains required before any operational use.'
    ],
    forbiddenClaims: FORBIDDEN_PATTERNS.map((item) => item.id)
  };
}

export function summarizeReleaseManifest(manifest = {}) {
  return {
    version: manifest.version || RELEASE_MANIFEST_VERSION,
    releaseName: manifest.releaseName || 'TD613 Hush Toy-to-Tool Closeout',
    productName: manifest.productName || RELEASE_PRODUCT_NAME,
    phaseCount: Array.isArray(manifest.phases) ? manifest.phases.length : 0,
    capabilityCount: Array.isArray(manifest.capabilities) ? manifest.capabilities.length : 0,
    boundaryCount: Array.isArray(manifest.boundaries) ? manifest.boundaries.length : 0,
    localOnly: Boolean(manifest.localOnly),
    releaseStatus: manifest.releaseStatus || 'reviewable'
  };
}

export function validateReleaseManifest(manifest = {}) {
  const failures = [];
  if (manifest.version !== RELEASE_MANIFEST_VERSION) failures.push('version-mismatch');
  if (manifest.productName !== RELEASE_PRODUCT_NAME) failures.push('product-name-mismatch');
  if (!manifest.localOnly) failures.push('local-only-missing');
  const phases = Array.isArray(manifest.phases) ? manifest.phases : [];
  for (let i = 0; i <= 10; i += 1) if (!phases.some((phase) => phase.phase === i)) failures.push(`missing-phase-${i}`);
  for (const capability of RELEASE_CAPABILITIES) if (!manifest.capabilities?.includes(capability)) failures.push(`missing-capability:${capability}`);
  for (const boundary of RELEASE_BOUNDARIES) if (!manifest.boundaries?.includes(boundary)) failures.push(`missing-boundary:${boundary}`);
  if (!manifest.docs?.length) failures.push('docs-missing');
  if (!manifest.tests?.length) failures.push('tests-missing');
  const scannableManifest = { ...manifest, forbiddenClaims: [] };
  if (detectReleaseOverclaim(JSON.stringify(scannableManifest, null, 2)).hasOverclaim) failures.push('manifest-overclaim');
  return { valid: failures.length === 0, failures, status: failures.length ? 'fail' : 'pass' };
}
