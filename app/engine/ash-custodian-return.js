import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId, text } from './aperture-v31-core.js';

export const CUSTODIAN_RETURN_SCHEMA = 'td613.ash.custodian-return-receipt/v0.1';
export const ANISOTROPY_SCHEMA = 'td613.aperture.anisotropy-receipt/v0.1';

const RETURN_DOMAIN = 'TD613:ASH:CUSTODIAN-RETURN:v1';
const ANISOTROPY_DOMAIN = 'TD613:APERTURE:ANISOTROPY:v1';
const DIMENSIONS = ['nodes','relationships','room_bridges','source_style_linkage','chronology','hypotheses','next_actions','lifecycle_state'];

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function status(value) {
  const normalized = String(value || 'MISSING').toUpperCase();
  return ['RECOVERED','PARTIAL','MISSING','CONTRADICTORY','REJECTED','UNRESOLVED'].includes(normalized) ? normalized : 'UNRESOLVED';
}

function dimensionRecord(value = {}) {
  return {
    status: status(value.status),
    recovered_references: unique(value.recoveredReferences || value.recovered_references || []),
    missing_references: unique(value.missingReferences || value.missing_references || []),
    contradictory_references: unique(value.contradictoryReferences || value.contradictory_references || []),
    observations: unique(value.observations || []),
    operator_notes: unique(value.operatorNotes || value.operator_notes || [])
  };
}

export function compareReturnDimensions(localBundle = {}, externalProjection = {}) {
  const localCase = localBundle.caseMap || localBundle.case_map || localBundle.case || {};
  const localRoute = localBundle.routeMemory || localBundle.route_memory || {};
  const external = externalProjection || {};
  const count = value => Array.isArray(value) ? value.length : value == null ? 0 : 1;
  return {
    nodes: { local: count(localCase.nodes), external: count(external.nodes), status: count(external.nodes) ? 'PARTIAL' : 'MISSING' },
    relationships: { local: count(localCase.relationships), external: count(external.relationships), status: count(external.relationships) ? 'PARTIAL' : 'MISSING' },
    room_bridges: { local: count(localCase.rooms), external: count(external.room_bridges), status: count(external.room_bridges) ? 'PARTIAL' : 'MISSING' },
    source_style_linkage: { local: count(localCase.source_status) + count(localCase.evidence_basis), external: count(external.source_style_linkage), status: count(external.source_style_linkage) ? 'PARTIAL' : 'MISSING' },
    chronology: { local: count(localCase.private_chronology), external: count(external.chronology), status: count(external.chronology) ? 'PARTIAL' : 'MISSING' },
    hypotheses: { local: count((localCase.nodes || []).filter(node => node.type === 'hypothesis')), external: count(external.hypotheses), status: count(external.hypotheses) ? 'PARTIAL' : 'MISSING' },
    next_actions: { local: count(localCase.intended_actions), external: count(external.next_actions), status: count(external.next_actions) ? 'PARTIAL' : 'MISSING' },
    lifecycle_state: { local: count(localBundle.lifecycle || localBundle.authorityContext || localBundle.authority_context), external: count(external.lifecycle_state), status: count(external.lifecycle_state) ? 'PARTIAL' : 'MISSING' },
    route_entries_local: count(localRoute.entries)
  };
}

export async function compileCustodianReturnReceipt(input = {}, options = {}) {
  const dimensions = {};
  for (const key of DIMENSIONS) dimensions[key] = dimensionRecord(input.dimensions?.[key]);
  const record = {
    schema: CUSTODIAN_RETURN_SCHEMA,
    return_id: input.returnId || randomId('return_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: input.createdAt || new Date().toISOString(),
    sandbox_database: text(input.sandboxDatabase || 'td613-ash-return-sandbox', 'Sandbox database'),
    save_point_reference: text(input.savePointReference, 'Save Point reference'),
    save_point_digest: text(input.savePointDigest, 'Save Point digest'),
    capsule_digest: text(input.capsuleDigest, 'Capsule digest'),
    custody_root_reference: input.custodyRootReference || null,
    case_map_digest: text(input.caseMapDigest, 'Case Map digest'),
    route_memory_digest: input.routeMemoryDigest || null,
    lifecycle_rank: input.lifecycleRank || null,
    authentication_state: String(input.authenticationState || 'VERIFIED').toUpperCase(),
    import_state: String(input.importState || 'SANDBOX_RECONSTITUTED').toUpperCase(),
    replay_state: String(input.replayState || 'FRESH').toUpperCase(),
    dimensions,
    missingness: unique(input.missingness || []),
    rejected: unique(input.rejected || []),
    unresolved: unique(input.unresolved || []),
    observations: unique(input.observations || []),
    operator_notes: unique(input.operatorNotes || []),
    live_case_mutated: false,
    receipt_digest: null
  };
  record.receipt_digest = await canonicalDigest(RETURN_DOMAIN, without(record, 'receipt_digest'), options);
  return freeze(record);
}

export async function verifyCustodianReturnReceipt(value, options = {}) {
  return Boolean(value?.schema === CUSTODIAN_RETURN_SCHEMA && value.receipt_digest === await canonicalDigest(RETURN_DOMAIN, without(value, 'receipt_digest'), options));
}

export async function compileAnisotropyReceipt(input = {}, options = {}) {
  const dimensions = {};
  for (const key of DIMENSIONS) {
    const local = dimensionRecord(input.localReader?.[key]);
    const external = dimensionRecord(input.externalReader?.[key]);
    dimensions[key] = { local_reader: local, external_reader: external };
  }
  const record = {
    schema: ANISOTROPY_SCHEMA,
    anisotropy_id: input.anisotropyId || randomId('anis_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: input.createdAt || new Date().toISOString(),
    return_receipt_reference: text(input.returnReceiptReference, 'Return Receipt reference'),
    return_receipt_digest: text(input.returnReceiptDigest, 'Return Receipt digest'),
    projection_purpose: text(input.projectionPurpose || 'declared-purpose-shaped-reconstruction', 'Projection purpose'),
    external_projection_digest: text(input.externalProjectionDigest, 'External projection digest'),
    external_material_exclusions: unique(input.externalMaterialExclusions || ['Ash Capsule','Case Map','room keys','complete Route Memory']),
    dimensions,
    universal_score_emitted: false,
    null_outcomes_preserved: true,
    contradictory_outcomes_preserved: true,
    rejected_outcomes_preserved: true,
    unresolved_outcomes_preserved: true,
    observations: unique(input.observations || []),
    operator_notes: unique(input.operatorNotes || []),
    receipt_digest: null
  };
  record.receipt_digest = await canonicalDigest(ANISOTROPY_DOMAIN, without(record, 'receipt_digest'), options);
  return freeze(record);
}

export async function verifyAnisotropyReceipt(value, options = {}) {
  return Boolean(value?.schema === ANISOTROPY_SCHEMA && value.receipt_digest === await canonicalDigest(ANISOTROPY_DOMAIN, without(value, 'receipt_digest'), options));
}
