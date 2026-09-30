import {
  evaluatePrecedenceAdmissionGenealogy,
  makeSyntheticEdgeAdmissionWitness
} from './pedagogue-precedence-admission-genealogy-blueprint-margins.js';
import {
  canonicalRuleSignature,
  makeSyntheticReplayWitness,
  warrantGenealogyClosure
} from './pedagogue-warrant-genealogy-ghost-house.js';

export const PEDAGOGUE_ADMISSION_WITNESS_REPLAY_CUSTODY_SCHEMA =
  'td613.pedagogue.admission-witness-replay-custody-hostile/v0.1';

const freeze = value => Object.freeze(value);
const freezeArray = values => freeze([...values]);
const freezeRecord = value => freeze({ ...value });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function evidence(evidence_id, warrants) {
  return freezeRecord({ evidence_id, warrants: freezeArray(warrants) });
}

function witnessedWarrantRule(rule_id, requires, produces) {
  const base = {
    rule_id,
    requires: freezeArray(requires),
    produces,
    predeclared: true,
    admissible: true,
    replayable: true
  };
  return freezeRecord({
    ...base,
    replay_witness: makeSyntheticReplayWitness(base, `CARBON_WARRANT:${canonicalRuleSignature(base)}`)
  });
}

function baseSpecimen() {
  return {
    case_id: 'CARBON_PAPER_BASE',
    baseline_evidence: [
      evidence('A', ['MEASUREMENT:A']),
      evidence('B', ['MEASUREMENT:B'])
    ],
    rules: [
      witnessedWarrantRule('CP_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W'),
      witnessedWarrantRule('CP_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W')
    ],
    contradiction_families: [],
    requested_warrant: 'IDENTIFIABILITY:W',
    events: [
      {
        event_id: 'PINK',
        semantic_label: 'WITHDRAW_PRIMARY_LINEAGE',
        kind: 'REMOVE_EVIDENCE',
        remove_evidence_ids: ['A']
      },
      {
        event_id: 'BLUE',
        semantic_label: 'ADD_REPLACEMENT_LINEAGE',
        kind: 'ADD_EVIDENCE',
        add_evidence: [
          evidence('C', ['MEASUREMENT:C']),
          evidence('D', ['MEASUREMENT:D'])
        ]
      }
    ]
  };
}

function semanticEventLabel(eventId) {
  const event = baseSpecimen().events.find(item => item.event_id === eventId);
  if (!event) throw new Error(`unknown event: ${eventId}`);
  return event.semantic_label;
}

function entitlementToken(edge, semanticSupportKind) {
  return `EDGE_WITNESS:${semanticEventLabel(edge[0])}>${semanticEventLabel(edge[1])}:${semanticSupportKind}`;
}

function witnessRule({
  rule_id,
  requires,
  produces,
  predeclared = true,
  admissible = true,
  replayable = true,
  replay_override = null
}) {
  const base = {
    rule_id,
    requires: freezeArray(requires),
    produces,
    predeclared,
    admissible,
    replayable
  };
  return freezeRecord({
    ...base,
    replay_witness: replay_override ?? makeSyntheticReplayWitness(
      base,
      `CARBON_REPLAY:${canonicalRuleSignature(base)}`
    )
  });
}

function provenanceBundle({ sourceTokens = [], rules = [] } = {}) {
  return deepFreeze({
    evidence: sourceTokens.map((token, index) => ({
      evidence_id: `SOURCE_${index}_${token}`,
      warrants: [token]
    })),
    rules: clone(rules)
  });
}

function makeAdmissionRecord({
  admission_id,
  edge = ['PINK', 'BLUE'],
  semantic_support_kind = 'DECLARATION_ALPHA',
  active = true,
  witness_provenance = provenanceBundle(),
  witness_override = null
}) {
  const provisional = {
    admission_id,
    edge,
    semantic_support_kind,
    predeclared: true,
    admissible: true,
    witnessed: true,
    active
  };
  const witness_payload = witness_override ?? makeSyntheticEdgeAdmissionWitness(provisional, baseSpecimen().events);
  return deepFreeze({ ...provisional, witness_payload, witness_provenance });
}

function genuineRecord({
  admission_id,
  edge = ['PINK', 'BLUE'],
  semantic_support_kind = 'DECLARATION_ALPHA',
  sourceToken = 'SOURCE:ALPHA',
  ruleId = 'WITNESS_ALPHA',
  active = true,
  extraRules = []
}) {
  const produces = entitlementToken(edge, semantic_support_kind);
  const rule = witnessRule({ rule_id: ruleId, requires: [sourceToken], produces });
  return makeAdmissionRecord({
    admission_id,
    edge,
    semantic_support_kind,
    active,
    witness_provenance: provenanceBundle({ sourceTokens: [sourceToken], rules: [rule, ...extraRules] })
  });
}

function c6PayloadProbe(record, base_specimen) {
  const activeShadow = { ...clone(record), active: true };
  delete activeShadow.witness_provenance;
  return evaluatePrecedenceAdmissionGenealogy({
    case_id: `C6_PAYLOAD_PROBE:${record.admission_id}`,
    base_specimen,
    admission_records: [activeShadow]
  });
}

function classifyWitnessRecord(record, base_specimen) {
  const c6Probe = c6PayloadProbe(record, base_specimen);
  const c6Classification = c6Probe.support_classifications[0] ?? null;
  const c6PayloadLawful = c6Probe.active_lawful_support_count === 1;
  const expected = entitlementToken(record.edge, record.semantic_support_kind);
  const provenance = warrantGenealogyClosure(record.witness_provenance ?? {});
  const closureContainsEntitlement = provenance.closure_warrants.includes(expected);
  const semanticLineages = freezeArray([...(provenance.semantic_lineage_fingerprints[expected] ?? [])].sort());

  let status = 'LAWFUL_ACTIVE_REPLAYED_EDGE_ADMISSION_WITNESS';
  if (!c6PayloadLawful) {
    status = c6Probe.rejected_supports[0]?.status ?? 'REFUSE_UNWITNESSED_EDGE_ADMISSION';
  } else if (!closureContainsEntitlement) {
    const mismatch = provenance.rejected_rules.some(item => item.reason === 'REPLAY_WITNESS_SIGNATURE_MISMATCH');
    status = mismatch
      ? 'REFUSE_WITNESS_REPLAY_MISMATCH'
      : 'REFUSE_UNREPLAYED_EDGE_ADMISSION_WITNESS';
  } else if (record.active === false) {
    status = 'INACTIVE_HISTORICAL_REPLAYED_EDGE_ADMISSION_WITNESS';
  }

  const lawfulActive = status === 'LAWFUL_ACTIVE_REPLAYED_EDGE_ADMISSION_WITNESS';
  const lawfulHistorical = status === 'INACTIVE_HISTORICAL_REPLAYED_EDGE_ADMISSION_WITNESS';
  const semanticEdge = c6Classification?.semantic_edge ?? freezeArray([
    semanticEventLabel(record.edge[0]),
    semanticEventLabel(record.edge[1])
  ]);

  return freezeRecord({
    admission_id: record.admission_id,
    edge: freezeArray(record.edge),
    semantic_edge: semanticEdge,
    semantic_support_kind: record.semantic_support_kind,
    expected_entitlement: expected,
    visible_witness_payload: record.witness_payload,
    c6_payload_lawful: c6PayloadLawful,
    c6_payload_status: c6Classification?.status ?? null,
    status,
    lawful_active: lawfulActive,
    lawful_historical: lawfulHistorical,
    closure_contains_entitlement: closureContainsEntitlement,
    semantic_witness_lineages: semanticLineages,
    provenance_rejected_rules: provenance.rejected_rules,
    semantic_witness_fingerprint: stable({
      semantic_edge: semanticEdge,
      semantic_support_kind: record.semantic_support_kind,
      semantic_witness_lineages: semanticLineages
    }),
    raw_record: record
  });
}

function edgeKey(edge) {
  return `${edge[0]}\u0000${edge[1]}`;
}

function edgeWitnessReceipts(classifications) {
  const byEdge = new Map();
  for (const item of classifications.filter(value => value.lawful_active)) {
    const key = edgeKey(item.edge);
    if (!byEdge.has(key)) {
      byEdge.set(key, {
        edge: item.edge,
        semantic_edge: item.semantic_edge,
        admission_ids: [],
        semantic_lineages: new Set()
      });
    }
    const entry = byEdge.get(key);
    entry.admission_ids.push(item.admission_id);
    for (const lineage of item.semantic_witness_lineages) entry.semantic_lineages.add(lineage);
  }
  return freezeArray([...byEdge.values()]
    .map(entry => freezeRecord({
      edge: freezeArray(entry.edge),
      semantic_edge: freezeArray(entry.semantic_edge),
      admission_ids: freezeArray([...entry.admission_ids].sort()),
      semantic_witness_lineages: freezeArray([...entry.semantic_lineages].sort()),
      semantic_witness_lineage_count: entry.semantic_lineages.size
    }))
    .sort((a, b) => stable(a.semantic_edge).localeCompare(stable(b.semantic_edge))));
}

export function evaluateAdmissionWitnessReplayCustody({
  case_id = 'ADMISSION_WITNESS_REPLAY_CUSTODY_CASE',
  base_specimen = baseSpecimen(),
  admission_records = []
} = {}) {
  if (!base_specimen || typeof base_specimen !== 'object') throw new TypeError('base_specimen required');
  if (!Array.isArray(admission_records)) throw new TypeError('admission_records must be array');

  const ids = new Set();
  const classifications = [];
  for (const record of admission_records) {
    if (!record || typeof record.admission_id !== 'string' || !record.admission_id) throw new TypeError('admission_id required');
    if (ids.has(record.admission_id)) throw new Error(`duplicate admission_id: ${record.admission_id}`);
    ids.add(record.admission_id);
    classifications.push(classifyWitnessRecord(record, base_specimen));
  }

  const lawfulActive = classifications.filter(item => item.lawful_active);
  const lawfulHistorical = classifications.filter(item => item.lawful_historical);
  const rejected = classifications.filter(item => !item.lawful_active && !item.lawful_historical);
  const c6Records = lawfulActive.map(item => {
    const raw = clone(item.raw_record);
    delete raw.witness_provenance;
    raw.active = true;
    return raw;
  });
  const relation = evaluatePrecedenceAdmissionGenealogy({
    case_id: `${case_id}:RELATION`,
    base_specimen,
    admission_records: c6Records
  });
  const receipts = edgeWitnessReceipts(classifications);
  const semanticGenealogy = freezeArray([...new Set(lawfulActive.map(item => item.semantic_witness_fingerprint))].sort());

  return freezeRecord({
    schema: PEDAGOGUE_ADMISSION_WITNESS_REPLAY_CUSTODY_SCHEMA,
    candidate: 'C7_ADMISSION_WITNESS_REPLAY_CUSTODY',
    case_id,
    status: relation.relation_accepted
      ? 'ADMISSION_WITNESS_REPLAY_CUSTODY_EVALUATED'
      : 'ADMISSION_WITNESS_REPLAY_CUSTODY_RELATION_REJECTED',
    relation_accepted: relation.relation_accepted,
    admitted_edges: relation.admitted_edges,
    active_lawful_witness_support_count: lawfulActive.length,
    inactive_historical_witness_support_count: lawfulHistorical.length,
    rejected_witness_support_count: rejected.length,
    witness_classifications: freezeArray(classifications),
    lawful_active_witness_supports: freezeArray(lawfulActive),
    lawful_historical_witness_supports: freezeArray(lawfulHistorical),
    rejected_witness_supports: freezeArray(rejected),
    edge_witness_receipts: receipts,
    semantic_witness_genealogy_fingerprint: stable(semanticGenealogy),
    current_relation_fingerprint: relation.semantic_relation_fingerprint,
    current_weave_posture: relation.current_weave_posture,
    relation,
    payload_only_has_witness_provenance_authority: false,
    rule_identifier_authority: false,
    support_serialization_authority: false,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function sealAdmissionWitnessProvenance(bundle) {
  return deepFreeze(clone(bundle ?? {}));
}

export function requestSealedAdmissionWitnessProvenanceMutation(sealedBundle, replacement) {
  if (!Object.isFrozen(sealedBundle)) {
    return freezeRecord({
      status: 'REJECT_UNSEALED_ADMISSION_WITNESS_PROVENANCE_MUTATION_TARGET',
      mutated: false
    });
  }
  return freezeRecord({
    status: 'SEALED_ADMISSION_WITNESS_PROVENANCE_IMMUTABLE',
    mutated: false,
    requested_replacement: deepFreeze(clone(replacement ?? {}))
  });
}

function cp01CarbonCopy() {
  const genuine = genuineRecord({ admission_id: 'GENUINE', sourceToken: 'SOURCE:ALPHA', ruleId: 'RULE_ALPHA' });
  const copy = makeAdmissionRecord({
    admission_id: 'CARBON_COPY',
    semantic_support_kind: 'DECLARATION_ALPHA',
    witness_provenance: provenanceBundle({ sourceTokens: [], rules: [] })
  });
  const c6 = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'CP01_C6_PAYLOAD_ONLY',
    base_specimen: baseSpecimen(),
    admission_records: [clone(genuine), clone(copy)]
  });
  const c7 = evaluateAdmissionWitnessReplayCustody({
    case_id: 'CP01_CARBON_COPY',
    admission_records: [genuine, copy]
  });
  return freezeRecord({
    case_id: 'CP01_CARBON_COPY',
    genuine,
    copy,
    c6,
    c7,
    visible_witness_payload_equal: stable(genuine.witness_payload) === stable(copy.witness_payload),
    c6_accepts_both_payloads: c6.active_lawful_support_count === 2,
    c7_genuine_lawful: c7.lawful_active_witness_supports.some(item => item.admission_id === 'GENUINE'),
    c7_copy_rejected: c7.rejected_witness_supports.some(item =>
      item.admission_id === 'CARBON_COPY' && item.status === 'REFUSE_UNREPLAYED_EDGE_ADMISSION_WITNESS'
    )
  });
}

function cp02MissingSource() {
  const edge = ['PINK', 'BLUE'];
  const kind = 'DECLARATION_ALPHA';
  const rule = witnessRule({
    rule_id: 'RULE_NEEDS_SOURCE',
    requires: ['SOURCE:MISSING'],
    produces: entitlementToken(edge, kind)
  });
  const record = makeAdmissionRecord({
    admission_id: 'MISSING_SOURCE',
    edge,
    semantic_support_kind: kind,
    witness_provenance: provenanceBundle({ sourceTokens: [], rules: [rule] })
  });
  const result = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP02_MISSING_SOURCE', admission_records: [record] });
  return freezeRecord({ case_id: 'CP02_MISSING_SOURCE', result });
}

function cp03ReplayCostume() {
  const edge = ['PINK', 'BLUE'];
  const kind = 'DECLARATION_ALPHA';
  const badReplay = freezeRecord({
    witness_id: 'BAD_REPLAY',
    status: 'WITNESSED_SYNTHETIC',
    semantic_signature: 'SOURCE:OTHER=>EDGE_WITNESS:WRONG'
  });
  const rule = witnessRule({
    rule_id: 'RULE_COSTUME',
    requires: ['SOURCE:ALPHA'],
    produces: entitlementToken(edge, kind),
    replay_override: badReplay
  });
  const record = makeAdmissionRecord({
    admission_id: 'REPLAY_COSTUME',
    edge,
    semantic_support_kind: kind,
    witness_provenance: provenanceBundle({ sourceTokens: ['SOURCE:ALPHA'], rules: [rule] })
  });
  const result = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP03_REPLAY_COSTUME', admission_records: [record] });
  return freezeRecord({ case_id: 'CP03_REPLAY_COSTUME', result });
}

function cp04TwoLawfulHands() {
  const alpha = genuineRecord({ admission_id: 'HAND_ALPHA', sourceToken: 'SOURCE:ALPHA', ruleId: 'RULE_ALPHA' });
  const beta = genuineRecord({ admission_id: 'HAND_BETA', sourceToken: 'SOURCE:BETA', ruleId: 'RULE_BETA' });
  const result = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP04_TWO_LAWFUL_HANDS', admission_records: [alpha, beta] });
  return freezeRecord({ case_id: 'CP04_TWO_LAWFUL_HANDS', result });
}

function recordWithSources({ admission_id, sourceToken, availableSources, ruleId }) {
  const edge = ['PINK', 'BLUE'];
  const kind = 'DECLARATION_ALPHA';
  const rule = witnessRule({
    rule_id: ruleId,
    requires: [sourceToken],
    produces: entitlementToken(edge, kind)
  });
  return makeAdmissionRecord({
    admission_id,
    edge,
    semantic_support_kind: kind,
    witness_provenance: provenanceBundle({ sourceTokens: availableSources, rules: [rule] })
  });
}

function cp05OneHandWithdrawn() {
  const before = evaluateAdmissionWitnessReplayCustody({
    case_id: 'CP05_BEFORE',
    admission_records: [
      recordWithSources({ admission_id: 'ALPHA', sourceToken: 'SOURCE:ALPHA', availableSources: ['SOURCE:ALPHA'], ruleId: 'RULE_ALPHA' }),
      recordWithSources({ admission_id: 'BETA', sourceToken: 'SOURCE:BETA', availableSources: ['SOURCE:BETA'], ruleId: 'RULE_BETA' })
    ]
  });
  const after = evaluateAdmissionWitnessReplayCustody({
    case_id: 'CP05_AFTER',
    admission_records: [
      recordWithSources({ admission_id: 'ALPHA', sourceToken: 'SOURCE:ALPHA', availableSources: [], ruleId: 'RULE_ALPHA' }),
      recordWithSources({ admission_id: 'BETA', sourceToken: 'SOURCE:BETA', availableSources: ['SOURCE:BETA'], ruleId: 'RULE_BETA' })
    ]
  });
  return freezeRecord({
    case_id: 'CP05_ONE_HAND_WITHDRAWN',
    before,
    after,
    edge_persists: after.admitted_edges.length === 1,
    relation_equal: before.current_relation_fingerprint === after.current_relation_fingerprint,
    witness_genealogy_changed: before.semantic_witness_genealogy_fingerprint !== after.semantic_witness_genealogy_fingerprint
  });
}

function cp06AllHandsWithdrawn() {
  const result = evaluateAdmissionWitnessReplayCustody({
    case_id: 'CP06_ALL_HANDS_WITHDRAWN',
    admission_records: [
      recordWithSources({ admission_id: 'ALPHA', sourceToken: 'SOURCE:ALPHA', availableSources: [], ruleId: 'RULE_ALPHA' }),
      recordWithSources({ admission_id: 'BETA', sourceToken: 'SOURCE:BETA', availableSources: [], ruleId: 'RULE_BETA' })
    ]
  });
  return freezeRecord({ case_id: 'CP06_ALL_HANDS_WITHDRAWN', result });
}

function cp07RuleRenaming() {
  const a = genuineRecord({ admission_id: 'SAME_RECORD', sourceToken: 'SOURCE:ALPHA', ruleId: 'RULE_OLD' });
  const b = genuineRecord({ admission_id: 'SAME_RECORD', sourceToken: 'SOURCE:ALPHA', ruleId: 'RULE_NEW' });
  const first = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP07_A', admission_records: [a] });
  const second = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP07_B', admission_records: [b] });
  return freezeRecord({
    case_id: 'CP07_RULE_RENAMING',
    first,
    second,
    semantic_witness_genealogy_invariant:
      first.semantic_witness_genealogy_fingerprint === second.semantic_witness_genealogy_fingerprint,
    relation_invariant: first.current_relation_fingerprint === second.current_relation_fingerprint
  });
}

function cp08RuleIdReuseSemanticChange() {
  const a = genuineRecord({ admission_id: 'SAME_RECORD', sourceToken: 'SOURCE:ALPHA', ruleId: 'REUSED_RULE' });
  const b = genuineRecord({ admission_id: 'SAME_RECORD', sourceToken: 'SOURCE:GAMMA', ruleId: 'REUSED_RULE' });
  const first = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP08_A', admission_records: [a] });
  const second = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP08_B', admission_records: [b] });
  return freezeRecord({
    case_id: 'CP08_RULE_ID_REUSE_SEMANTIC_CHANGE',
    first,
    second,
    semantic_witness_genealogy_changed:
      first.semantic_witness_genealogy_fingerprint !== second.semantic_witness_genealogy_fingerprint,
    relation_equal: first.current_relation_fingerprint === second.current_relation_fingerprint
  });
}

function cp09BadCarbonSortsFirst() {
  const bad = makeAdmissionRecord({
    admission_id: 'AAA_BAD',
    witness_provenance: provenanceBundle({ sourceTokens: [], rules: [] })
  });
  const good = genuineRecord({ admission_id: 'ZZZ_GOOD', sourceToken: 'SOURCE:ALPHA', ruleId: 'RULE_GOOD' });
  const result = evaluateAdmissionWitnessReplayCustody({
    case_id: 'CP09_BAD_CARBON_SORTS_FIRST',
    admission_records: [bad, good]
  });
  return freezeRecord({ case_id: 'CP09_BAD_CARBON_SORTS_FIRST', result });
}

function cp10CrossedWitnesses() {
  const forward = genuineRecord({
    admission_id: 'FORWARD',
    edge: ['PINK', 'BLUE'],
    semantic_support_kind: 'FORWARD_DECLARATION',
    sourceToken: 'SOURCE:FORWARD',
    ruleId: 'RULE_FORWARD'
  });
  const reverse = genuineRecord({
    admission_id: 'REVERSE',
    edge: ['BLUE', 'PINK'],
    semantic_support_kind: 'REVERSE_DECLARATION',
    sourceToken: 'SOURCE:REVERSE',
    ruleId: 'RULE_REVERSE'
  });
  const result = evaluateAdmissionWitnessReplayCustody({
    case_id: 'CP10_CROSSED_WITNESSES',
    admission_records: [forward, reverse]
  });
  return freezeRecord({ case_id: 'CP10_CROSSED_WITNESSES', result });
}

function cp11PayloadOnlyCompaction() {
  const fullRecord = genuineRecord({ admission_id: 'FULL', sourceToken: 'SOURCE:ALPHA', ruleId: 'RULE_ALPHA' });
  const full = evaluateAdmissionWitnessReplayCustody({ case_id: 'CP11_FULL', admission_records: [fullRecord] });
  const payloadRecord = clone(fullRecord);
  delete payloadRecord.witness_provenance;
  const payloadOnly = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'CP11_PAYLOAD_ONLY',
    base_specimen: baseSpecimen(),
    admission_records: [payloadRecord]
  });
  return freezeRecord({
    case_id: 'CP11_PAYLOAD_ONLY_COMPACTION',
    full,
    payload_only: payloadOnly,
    visible_payload_equal: true,
    relation_equal: full.current_relation_fingerprint === payloadOnly.semantic_relation_fingerprint,
    payload_only_provenance_authority: false
  });
}

function cp12PostHocReink() {
  const record = genuineRecord({ admission_id: 'SEALED', sourceToken: 'SOURCE:ALPHA', ruleId: 'RULE_ALPHA' });
  const sealed = sealAdmissionWitnessProvenance(record.witness_provenance);
  const mutation = requestSealedAdmissionWitnessProvenanceMutation(sealed, {
    evidence: [{ evidence_id: 'REWRITE', warrants: ['SOURCE:FAKE'] }],
    rules: []
  });
  return freezeRecord({
    case_id: 'CP12_POSTHOC_REINK',
    sealed,
    mutation,
    sealed_still_frozen: Object.isFrozen(sealed)
  });
}

export function runPedagogueCarbonPaperGauntlet() {
  const cp01 = cp01CarbonCopy();
  const cp02 = cp02MissingSource();
  const cp03 = cp03ReplayCostume();
  const cp04 = cp04TwoLawfulHands();
  const cp05 = cp05OneHandWithdrawn();
  const cp06 = cp06AllHandsWithdrawn();
  const cp07 = cp07RuleRenaming();
  const cp08 = cp08RuleIdReuseSemanticChange();
  const cp09 = cp09BadCarbonSortsFirst();
  const cp10 = cp10CrossedWitnesses();
  const cp11 = cp11PayloadOnlyCompaction();
  const cp12 = cp12PostHocReink();

  const defeatConditions = [];

  if (!cp01.visible_witness_payload_equal || !cp01.c6_accepts_both_payloads ||
      !cp01.c7_genuine_lawful || !cp01.c7_copy_rejected) {
    defeatConditions.push('CARBON_COPY_NOT_DISTINGUISHED_FROM_REPLAYED_WITNESS');
  }

  if (!cp02.result.rejected_witness_supports.some(item => item.status === 'REFUSE_UNREPLAYED_EDGE_ADMISSION_WITNESS')) {
    defeatConditions.push('MISSING_PREREQUISITE_STILL_EARNED_WITNESS_ENTITLEMENT');
  }

  if (!cp03.result.rejected_witness_supports.some(item => item.status === 'REFUSE_WITNESS_REPLAY_MISMATCH')) {
    defeatConditions.push('MISMATCHED_REPLAY_RECEIPT_LAUNDERED_WITNESS_ENTITLEMENT');
  }

  const cp04Receipt = cp04.result.edge_witness_receipts[0];
  if (cp04.result.admitted_edges.length !== 1 || cp04.result.active_lawful_witness_support_count !== 2 ||
      cp04Receipt?.semantic_witness_lineage_count !== 2) {
    defeatConditions.push('MULTIPLE_LAWFUL_WITNESS_LINEAGES_NOT_PRESERVED');
  }

  if (!cp05.edge_persists || !cp05.relation_equal || !cp05.witness_genealogy_changed) {
    defeatConditions.push('ONE_WITNESS_LINEAGE_WITHDRAWAL_NOT_CUSTODIED_WHILE_EDGE_PERSISTS');
  }

  if (cp06.result.admitted_edges.length !== 0 || cp06.result.active_lawful_witness_support_count !== 0) {
    defeatConditions.push('GHOST_WITNESS_ENTITLEMENT_SURVIVED_ALL_PREREQUISITE_WITHDRAWAL');
  }

  if (!cp07.semantic_witness_genealogy_invariant || !cp07.relation_invariant) {
    defeatConditions.push('RULE_IDENTIFIER_RENAMING_CHANGED_WITNESS_AUTHORITY');
  }

  if (!cp08.semantic_witness_genealogy_changed || !cp08.relation_equal) {
    defeatConditions.push('RULE_IDENTIFIER_REUSE_ERASED_SEMANTIC_PROVENANCE_CHANGE');
  }

  if (cp09.result.admitted_edges.length !== 1 || cp09.result.active_lawful_witness_support_count !== 1 ||
      !cp09.result.rejected_witness_supports.some(item => item.admission_id === 'AAA_BAD') ||
      !cp09.result.lawful_active_witness_supports.some(item => item.admission_id === 'ZZZ_GOOD')) {
    defeatConditions.push('LEXICAL_FIRST_BAD_WITNESS_SUPPRESSED_VALID_LATER_WITNESS');
  }

  if (cp10.result.relation.relation_accepted !== false ||
      cp10.result.relation.weave.status !== 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE' ||
      cp10.result.active_lawful_witness_support_count !== 2) {
    defeatConditions.push('CYCLIC_RELATION_REJECTION_ERASED_LAWFUL_WITNESS_PROVENANCE');
  }

  if (!cp11.visible_payload_equal || !cp11.relation_equal || cp11.payload_only_provenance_authority) {
    defeatConditions.push('PAYLOAD_ONLY_COMPACTION_ACQUIRED_WITNESS_PROVENANCE_AUTHORITY');
  }

  if (cp12.mutation.status !== 'SEALED_ADMISSION_WITNESS_PROVENANCE_IMMUTABLE' || !cp12.sealed_still_frozen) {
    defeatConditions.push('SEALED_WITNESS_PROVENANCE_RETROACTIVELY_MUTATED');
  }

  const inheritedC6OverclaimEstablished =
    cp01.visible_witness_payload_equal &&
    cp01.c6_accepts_both_payloads &&
    cp01.c7_genuine_lawful &&
    cp01.c7_copy_rejected;

  return freezeRecord({
    ok: true,
    schema: PEDAGOGUE_ADMISSION_WITNESS_REPLAY_CUSTODY_SCHEMA,
    inherited_c6_edge_admission_genealogy_result_preserved: true,
    inherited_c6_witness_provenance_verdict: inheritedC6OverclaimEstablished
      ? 'PRECEDENCE_ADMISSION_GENEALOGY_C6_FALSIFIED_AS_WITNESS_PROVENANCE_SUFFICIENT_FORM'
      : 'C6_WITNESS_PROVENANCE_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN',
    candidate: 'C7_ADMISSION_WITNESS_REPLAY_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeatConditions.length === 0
      ? 'ADMISSION_WITNESS_REPLAY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CARBON_PAPER'
      : 'ADMISSION_WITNESS_REPLAY_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CARBON_PAPER',
    defeat_conditions: freezeArray(defeatConditions),
    rooms: freezeRecord({ cp01, cp02, cp03, cp04, cp05, cp06, cp07, cp08, cp09, cp10, cp11, cp12 }),
    learned_distinctions: freezeArray([
      'matching witness payload != replayed witness provenance',
      'witness payload equality != witness entitlement equality',
      'rule identifier != witness authority',
      'edge persistence != witness-lineage persistence',
      'admitted prerequisite != historical prerequisite',
      'payload-only custody != witness-replay custody'
    ]),
    next_learning_action: defeatConditions.length === 0
      ? 'ATTACK_ADMISSION_WITNESS_REPLAY_CUSTODY_SUPPORT_EPISODE_CONTINUITY_AND_PROVENANCE_SCOPE_EXPIRY_BEFORE_EVENT_SET_REVISION_OR_FORMALISM_PROMOTION'
      : 'INSPECT_PREREGISTERED_C7_DEFEAT_WITHOUT_POSTHOC_REDEFINITION',
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    promotion_authority: false,
    shared_pedagogue_engine_mutation: false,
    browser_execution: false,
    workflow_mutation: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true,
    scalar_aggregation_used: false
  });
}
