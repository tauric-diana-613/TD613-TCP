export const HUSH_PHASE10_SCHEMA = 'td613-hush-release-discipline/v1';

export const HUSH_RELEASE_STATUSES = Object.freeze([
  'draft',
  'local-pass',
  'fixture-provider-pass',
  'runtime-flight-pending',
  'runtime-flight-pass',
  'release-candidate',
  'harbor-eligible',
  'sealed',
  'blocked',
  'revoked'
]);

export const HUSH_RELEASE_STATUS_RANK = Object.freeze({
  draft: 0,
  'local-pass': 1,
  'fixture-provider-pass': 2,
  'runtime-flight-pending': 3,
  'runtime-flight-pass': 4,
  'release-candidate': 5,
  'harbor-eligible': 6,
  sealed: 7,
  blocked: -1,
  revoked: -2
});

export const HUSH_RELEASE_EVIDENCE_LADDER = Object.freeze([
  { level: 0, id: 'L0', label: 'packet exists' },
  { level: 1, id: 'L1', label: 'local packet valid' },
  { level: 2, id: 'L2', label: 'mask passport valid' },
  { level: 3, id: 'L3', label: 'export discipline valid' },
  { level: 4, id: 'L4', label: 'Phase 9 collision surface valid' },
  { level: 5, id: 'L5', label: 'provider contract/log parity valid' },
  { level: 6, id: 'L6', label: 'deployed runtime flight valid' },
  { level: 7, id: 'L7', label: 'Safe Harbor eligibility assessed' },
  { level: 8, id: 'L8', label: 'Aperture boundary checked' },
  { level: 9, id: 'L9', label: 'release candidate or sealed status assigned' }
]);

export const HUSH_PHASE10_NON_CLAIMS = Object.freeze([
  'authorship proof',
  'identity proof',
  'anonymity',
  'non-attribution',
  'legal protection',
  'truth adjudication',
  'consent',
  'safe public release without evidence',
  'EO-RFD authority override',
  'ACEDIT authority override',
  'Aperture override',
  'Safe Harbor override',
  'validator bypass'
]);

export const HUSH_PHASE10_HARD_BLOCKERS = Object.freeze([
  'public_default_allowed true',
  'public_default_allowed undefined',
  'raw sample exported',
  'raw candidate exported',
  'mandatory anchor dropped',
  'mandatory anchor retention undefined',
  'source obligations undefined',
  'new factual claim added',
  'provider proposition dropped',
  'provider preservation evidence missing',
  'provider dropped-proposition check undefined',
  'provider new-claim check undefined',
  'provider risk check undefined',
  'provider drift classification undefined',
  'provider mode invalid',
  'provider validation failed',
  'claim boundary inflated',
  'wrong mask id',
  'wrong mask label',
  'internal register exposed publicly',
  'provider drift unclassified',
  'raw sample exposure undefined',
  'raw candidate exposure undefined',
  'raw sample export allowance undefined',
  'raw candidate export allowance undefined',
  'runtime public default allowed',
  'runtime raw exposure not excluded',
  'runtime flight missing but status marked runtime-flight-pass',
  'fixture-backed provider evidence marked live-provider-pass',
  'release status assigned before Safe Harbor assessment',
  'release status assigned before Aperture boundary check',
  'Safe Harbor receipt treated as proof',
  'Aperture treated as release authority',
  'non-claims missing',
  'validator bypass implied',
  'collision severity 3'
]);

export const HUSH_PHASE10_RUNTIME_FIELDS = Object.freeze([
  'url',
  'build_or_commit',
  'console_network_notes',
  'outbound_contract_artifact',
  'inbound_provider_log_artifact',
  'export_artifact',
  'candidate_output',
  'mask_selector_state',
  'public_default_state',
  'raw_exposure_state'
]);

export function isKnownHushReleaseStatus(status) {
  return HUSH_RELEASE_STATUSES.includes(status);
}

export function evidenceLadderLevelExists(level) {
  return HUSH_RELEASE_EVIDENCE_LADDER.some((entry) => entry.level === level);
}
