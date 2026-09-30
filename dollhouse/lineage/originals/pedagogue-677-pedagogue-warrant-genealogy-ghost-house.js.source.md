import {
  declaredDerivationalClosure,
  evaluateDeclaredDerivationalClosure,
  runPedagogueTypedNonAmplificationHostileGauntlet
} from './pedagogue-typed-non-amplification-hostile.js';

export const PEDAGOGUE_WARRANT_GENEALOGY_GHOST_HOUSE_SCHEMA =
  'td613.pedagogue.warrant-genealogy-ghost-house-hostile/v0.1';

const freezeRecord = value => Object.freeze({ ...value });
const freezeArray = value => Object.freeze([...value]);

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

export function canonicalRuleSignature(rule) {
  if (!rule || !Array.isArray(rule.requires) || typeof rule.produces !== 'string' || !rule.produces) {
    throw new TypeError('rule requires typed prerequisites and a produced warrant');
  }
  return `${sortedUnique(rule.requires).join('&')}=>${rule.produces}`;
}

export function makeSyntheticReplayWitness(rule, witnessId = `WITNESS:${rule.rule_id}`) {
  return freezeRecord({
    witness_id: witnessId,
    status: 'WITNESSED_SYNTHETIC',
    semantic_signature: canonicalRuleSignature(rule)
  });
}

function primitiveIndex(evidence) {
  if (!Array.isArray(evidence)) throw new TypeError('evidence must be an array');
  const map = new Map();
  for (const item of evidence) {
    if (!item || typeof item.evidence_id !== 'string' || !item.evidence_id) throw new TypeError('evidence_id required');
    if (!Array.isArray(item.warrants)) throw new TypeError('evidence warrants must be an array');
    for (const warrant of item.warrants) {
      if (typeof warrant !== 'string' || !warrant) throw new TypeError('warrant token required');
      if (!map.has(warrant)) map.set(warrant, new Set());
      map.get(warrant).add(item.evidence_id);
    }
  }
  return map;
}

function validateGenealogyRule(rule) {
  if (!rule || typeof rule.rule_id !== 'string' || !rule.rule_id) {
    return freezeRecord({ eligible:false, reason:'RULE_ID_MISSING', semantic_signature:null });
  }
  let semanticSignature = null;
  try {
    semanticSignature = canonicalRuleSignature(rule);
  } catch {
    return freezeRecord({ eligible:false, reason:'RULE_SEMANTICS_INVALID', semantic_signature:null });
  }
  if (rule.predeclared !== true) return freezeRecord({ eligible:false, reason:'RULE_NOT_PREDECLARED', semantic_signature:semanticSignature });
  if (rule.admissible !== true) return freezeRecord({ eligible:false, reason:'RULE_NOT_ADMISSIBLE', semantic_signature:semanticSignature });
  if (rule.replayable !== true) return freezeRecord({ eligible:false, reason:'RULE_NOT_DECLARED_REPLAYABLE', semantic_signature:semanticSignature });
  if (!rule.replay_witness || rule.replay_witness.status !== 'WITNESSED_SYNTHETIC') {
    return freezeRecord({ eligible:false, reason:'REPLAY_WITNESS_MISSING', semantic_signature:semanticSignature });
  }
  if (rule.replay_witness.semantic_signature !== semanticSignature) {
    return freezeRecord({ eligible:false, reason:'REPLAY_WITNESS_SIGNATURE_MISMATCH', semantic_signature:semanticSignature });
  }
  if (typeof rule.replay_witness.witness_id !== 'string' || !rule.replay_witness.witness_id) {
    return freezeRecord({ eligible:false, reason:'REPLAY_WITNESS_ID_MISSING', semantic_signature:semanticSignature });
  }
  return freezeRecord({ eligible:true, reason:null, semantic_signature:semanticSignature });
}

function freezeLineageIndex(lineages) {
  const output = {};
  for (const warrant of [...lineages.keys()].sort()) {
    const lineageMap = lineages.get(warrant);
    output[warrant] = freezeArray([...lineageMap.values()]
      .sort((left, right) => left.semantic_signature.localeCompare(right.semantic_signature))
      .map(item => freezeRecord({
        semantic_signature: item.semantic_signature,
        requires: freezeArray(item.requires),
        produces: item.produces,
        rule_ids: freezeArray(sortedUnique(item.rule_ids)),
        replay_witness_ids: freezeArray(sortedUnique(item.replay_witness_ids))
      })));
  }
  return Object.freeze(output);
}

export function warrantGenealogyClosure({ evidence = [], rules = [] } = {}) {
  const primitives = primitiveIndex(evidence);
  const primitiveWarrants = new Set(primitives.keys());
  const closure = new Set(primitiveWarrants);
  const lineages = new Map();
  const rejectedRules = [];
  const groupedEligible = new Map();

  for (const rule of rules) {
    const validation = validateGenealogyRule(rule);
    if (!validation.eligible) {
      rejectedRules.push(freezeRecord({
        rule_id: rule?.rule_id ?? null,
        produces: rule?.produces ?? null,
        semantic_signature: validation.semantic_signature,
        reason: validation.reason
      }));
      continue;
    }
    const signature = validation.semantic_signature;
    if (!groupedEligible.has(signature)) {
      groupedEligible.set(signature, {
        semantic_signature: signature,
        requires: sortedUnique(rule.requires),
        produces: rule.produces,
        rule_ids: [],
        replay_witness_ids: []
      });
    }
    const group = groupedEligible.get(signature);
    group.rule_ids.push(rule.rule_id);
    group.replay_witness_ids.push(rule.replay_witness.witness_id);
  }

  const eligible = [...groupedEligible.values()]
    .sort((left, right) => left.semantic_signature.localeCompare(right.semantic_signature));

  let changed = true;
  while (changed) {
    changed = false;
    for (const group of eligible) {
      if (!group.requires.every(required => closure.has(required))) continue;
      if (!closure.has(group.produces)) {
        closure.add(group.produces);
        changed = true;
      }
      if (primitiveWarrants.has(group.produces)) continue;
      if (!lineages.has(group.produces)) lineages.set(group.produces, new Map());
      const perWarrant = lineages.get(group.produces);
      if (!perWarrant.has(group.semantic_signature)) {
        perWarrant.set(group.semantic_signature, {
          ...group,
          rule_ids: [...group.rule_ids],
          replay_witness_ids: [...group.replay_witness_ids]
        });
        changed = true;
      }
    }
  }

  const primitiveSources = {};
  for (const warrant of [...primitives.keys()].sort()) {
    primitiveSources[warrant] = freezeArray([...primitives.get(warrant)].sort());
  }

  const lineageIndex = freezeLineageIndex(lineages);
  const semanticLineageFingerprints = {};
  for (const [warrant, entries] of Object.entries(lineageIndex)) {
    semanticLineageFingerprints[warrant] = freezeArray(entries.map(item => item.semantic_signature).sort());
  }

  return freezeRecord({
    primitive_warrants: freezeArray([...primitiveWarrants].sort()),
    primitive_sources: Object.freeze(primitiveSources),
    closure_warrants: freezeArray([...closure].sort()),
    lineage_index: lineageIndex,
    semantic_lineage_fingerprints: Object.freeze(semanticLineageFingerprints),
    rejected_rules: freezeArray(rejectedRules.sort((left, right) =>
      `${left.semantic_signature ?? ''}:${left.rule_id ?? ''}`.localeCompare(`${right.semantic_signature ?? ''}:${right.rule_id ?? ''}`)
    )),
    scalar_aggregation_used: false
  });
}

export function traceWarrantGenealogy(closureReceipt, warrant, seen = new Set()) {
  if (!closureReceipt || !Array.isArray(closureReceipt.closure_warrants)) throw new TypeError('closure receipt required');
  if (!closureReceipt.closure_warrants.includes(warrant)) return null;
  if (seen.has(warrant)) return freezeRecord({ warrant, kind:'CYCLE_REFERENCE' });

  const nextSeen = new Set(seen);
  nextSeen.add(warrant);
  const primitiveSources = closureReceipt.primitive_sources[warrant] ?? [];
  const lineages = closureReceipt.lineage_index[warrant] ?? [];

  if (primitiveSources.length > 0) {
    return freezeRecord({
      warrant,
      kind: 'PRIMITIVE',
      evidence_ids: freezeArray(primitiveSources)
    });
  }

  return freezeRecord({
    warrant,
    kind: 'DERIVED',
    lineages: freezeArray(lineages.map(lineage => freezeRecord({
      semantic_signature: lineage.semantic_signature,
      rule_ids: lineage.rule_ids,
      replay_witness_ids: lineage.replay_witness_ids,
      prerequisites: freezeArray(lineage.requires.map(required => traceWarrantGenealogy(closureReceipt, required, nextSeen)))
    })))
  });
}

function conflictForRequested(closureWarrants, requestedWarrant, contradictionFamilies) {
  for (const family of contradictionFamilies ?? []) {
    if (!Array.isArray(family) || !family.includes(requestedWarrant)) continue;
    const present = family.filter(warrant => closureWarrants.includes(warrant)).sort();
    if (present.length > 1) return present;
  }
  return [];
}

export function evaluateWarrantGenealogy({
  evidence = [],
  rules = [],
  contradiction_families = [],
  requested_warrant
} = {}) {
  if (typeof requested_warrant !== 'string' || !requested_warrant) throw new TypeError('requested_warrant required');
  const closure = warrantGenealogyClosure({ evidence, rules });
  const conflict = conflictForRequested(closure.closure_warrants, requested_warrant, contradiction_families);
  const primitive = closure.primitive_warrants.includes(requested_warrant);
  const admitted = closure.closure_warrants.includes(requested_warrant);
  const rejectedProducer = closure.rejected_rules.some(item => item.produces === requested_warrant);

  let status;
  if (conflict.length > 1) status = 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT';
  else if (primitive) status = 'PERMIT_EXPLICITLY_SUPPORTED_AUTHORITY';
  else if (admitted) status = 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY';
  else if (rejectedProducer) status = 'REFUSE_UNWITNESSED_DERIVATION';
  else status = 'REFUSE_AUTHORITY_OUTSIDE_WARRANT_GENEALOGY';

  return freezeRecord({
    candidate: 'C2_WARRANT_GENEALOGY_CUSTODY',
    requested_warrant,
    status,
    conflicting_warrants: freezeArray(conflict),
    primitive_warrants: closure.primitive_warrants,
    closure_warrants: closure.closure_warrants,
    lineage_index: closure.lineage_index,
    semantic_lineage_fingerprints: closure.semantic_lineage_fingerprints,
    rejected_rules: closure.rejected_rules,
    requested_genealogy: admitted ? traceWarrantGenealogy(closure, requested_warrant) : null,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

function evidence(evidence_id, warrants) {
  return freezeRecord({ evidence_id, warrants: freezeArray(warrants) });
}

function genealogyRule(rule_id, requires, produces, replayMode = 'valid') {
  const base = {
    rule_id,
    requires: freezeArray(requires),
    produces,
    predeclared: true,
    admissible: true,
    replayable: true
  };
  if (replayMode === 'missing') return freezeRecord(base);
  if (replayMode === 'mismatch') {
    return freezeRecord({
      ...base,
      replay_witness: freezeRecord({
        witness_id: `WITNESS:${rule_id}:MISMATCH`,
        status: 'WITNESSED_SYNTHETIC',
        semantic_signature: `${canonicalRuleSignature(base)}::MISMATCH`
      })
    });
  }
  return freezeRecord({
    ...base,
    replay_witness: makeSyntheticReplayWitness(base)
  });
}

function semanticFingerprints(receipt, warrant) {
  return receipt.semantic_lineage_fingerprints[warrant] ?? [];
}

function c1RecordedSemanticSignatures(rules, receipt) {
  const byId = new Map(rules.map(item => [item.rule_id, canonicalRuleSignature(item)]));
  return freezeArray(receipt.derivations_used.map(ruleId => byId.get(ruleId) ?? `UNKNOWN:${ruleId}`).sort());
}

function nurserySeedlessCycle() {
  const rules = freezeArray([
    genealogyRule('GH01_X_TO_Y', ['TEST:X'], 'TEST:Y'),
    genealogyRule('GH01_Y_TO_X', ['TEST:Y'], 'TEST:X')
  ]);
  const c1 = declaredDerivationalClosure({ evidence:[], rules });
  const c2 = warrantGenealogyClosure({ evidence:[], rules });
  return freezeRecord({
    case_id: 'GH01_SEEDLESS_CYCLE',
    c1,
    c2,
    c1_bootstrapped: c1.closure_warrants.includes('TEST:X') || c1.closure_warrants.includes('TEST:Y'),
    c2_bootstrapped: c2.closure_warrants.includes('TEST:X') || c2.closure_warrants.includes('TEST:Y')
  });
}

function staircaseMultiStep() {
  const evidenceSet = freezeArray([
    evidence('GH02_A', ['MEASUREMENT:A']),
    evidence('GH02_B', ['MEASUREMENT:B']),
    evidence('GH02_D', ['MEASUREMENT:D'])
  ]);
  const r1 = genealogyRule('GH02_R1', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:C');
  const r2 = genealogyRule('GH02_R2', ['IDENTIFIABILITY:C', 'MEASUREMENT:D'], 'DECISION:E');
  const rules = freezeArray([r1, r2]);
  const c1 = evaluateDeclaredDerivationalClosure({ evidence:evidenceSet, rules, requested_warrant:'DECISION:E' });
  const c2 = evaluateWarrantGenealogy({ evidence:evidenceSet, rules, requested_warrant:'DECISION:E' });
  const expectedR1 = canonicalRuleSignature(r1);
  const expectedR2 = canonicalRuleSignature(r2);
  return freezeRecord({
    case_id: 'GH02_MULTI_STEP_ANCESTRY',
    c1,
    c2,
    expected_signatures: freezeArray([expectedR1, expectedR2]),
    ancestry_reconstructable:
      c2.status === 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY'
      && semanticFingerprints(c2, 'DECISION:E').includes(expectedR2)
      && semanticFingerprints(c2, 'IDENTIFIABILITY:C').includes(expectedR1)
      && c2.requested_genealogy?.kind === 'DERIVED'
  });
}

function twinBedroomMultipleLineages() {
  const evidenceSet = freezeArray([
    evidence('GH03_A', ['MEASUREMENT:A']),
    evidence('GH03_B', ['MEASUREMENT:B']),
    evidence('GH03_C', ['MEASUREMENT:C']),
    evidence('GH03_D', ['MEASUREMENT:D'])
  ]);
  const routeAB = genealogyRule('GH03_A_ROUTE_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const routeCD = genealogyRule('GH03_Z_ROUTE_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W');
  const rules = freezeArray([routeAB, routeCD]);
  const c1 = declaredDerivationalClosure({ evidence:evidenceSet, rules });
  const c2 = evaluateWarrantGenealogy({ evidence:evidenceSet, rules, requested_warrant:'IDENTIFIABILITY:W' });
  return freezeRecord({
    case_id: 'GH03_MULTIPLE_VALID_LINEAGES',
    c1,
    c2,
    expected_semantic_lineages: freezeArray([canonicalRuleSignature(routeAB), canonicalRuleSignature(routeCD)].sort()),
    c1_recorded_semantic_lineages: c1RecordedSemanticSignatures(rules, c1),
    c2_recorded_semantic_lineages: semanticFingerprints(c2, 'IDENTIFIABILITY:W'),
    c1_erased_alternative_lineage: c1.derivations_used.length < 2,
    c2_preserved_both: semanticFingerprints(c2, 'IDENTIFIABILITY:W').length === 2
  });
}

function mirrorRoomRenameOrder() {
  const evidenceSet = freezeArray([
    evidence('GH04_A', ['MEASUREMENT:A']),
    evidence('GH04_B', ['MEASUREMENT:B']),
    evidence('GH04_C', ['MEASUREMENT:C']),
    evidence('GH04_D', ['MEASUREMENT:D'])
  ]);
  const aAB = genealogyRule('A_ROUTE_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const zCD = genealogyRule('Z_ROUTE_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W');
  const zAB = genealogyRule('Z_ROUTE_AB_RENAMED', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const aCD = genealogyRule('A_ROUTE_CD_RENAMED', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W');
  const beforeRules = freezeArray([aAB, zCD]);
  const afterRules = freezeArray([zAB, aCD].reverse());
  const c1Before = declaredDerivationalClosure({ evidence:evidenceSet, rules:beforeRules });
  const c1After = declaredDerivationalClosure({ evidence:evidenceSet, rules:afterRules });
  const c2Before = evaluateWarrantGenealogy({ evidence:evidenceSet, rules:beforeRules, requested_warrant:'IDENTIFIABILITY:W' });
  const c2After = evaluateWarrantGenealogy({ evidence:evidenceSet, rules:afterRules, requested_warrant:'IDENTIFIABILITY:W' });
  const c1BeforeSemantics = c1RecordedSemanticSignatures(beforeRules, c1Before);
  const c1AfterSemantics = c1RecordedSemanticSignatures(afterRules, c1After);
  const c2BeforeSemantics = semanticFingerprints(c2Before, 'IDENTIFIABILITY:W');
  const c2AfterSemantics = semanticFingerprints(c2After, 'IDENTIFIABILITY:W');
  return freezeRecord({
    case_id: 'GH04_RULE_RENAME_ORDER_INVARIANCE',
    c1_before: c1Before,
    c1_after: c1After,
    c2_before: c2Before,
    c2_after: c2After,
    c1_closure_invariant: JSON.stringify(c1Before.closure_warrants) === JSON.stringify(c1After.closure_warrants),
    c1_recorded_semantics_before: c1BeforeSemantics,
    c1_recorded_semantics_after: c1AfterSemantics,
    c1_provenance_name_sensitive: JSON.stringify(c1BeforeSemantics) !== JSON.stringify(c1AfterSemantics),
    c2_semantic_lineages_before: c2BeforeSemantics,
    c2_semantic_lineages_after: c2AfterSemantics,
    c2_semantic_lineages_invariant: JSON.stringify(c2BeforeSemantics) === JSON.stringify(c2AfterSemantics),
    c2_disposition_invariant: c2Before.status === c2After.status
  });
}

function costumeClosetFakeReplay() {
  const evidenceSet = freezeArray([
    evidence('GH05_A', ['MEASUREMENT:A']),
    evidence('GH05_B', ['MEASUREMENT:B'])
  ]);
  const fake = genealogyRule('GH05_FAKE_REPLAY', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W', 'mismatch');
  const c1 = evaluateDeclaredDerivationalClosure({ evidence:evidenceSet, rules:[fake], requested_warrant:'IDENTIFIABILITY:W' });
  const c2 = evaluateWarrantGenealogy({ evidence:evidenceSet, rules:[fake], requested_warrant:'IDENTIFIABILITY:W' });
  return freezeRecord({
    case_id: 'GH05_FAKE_REPLAY_NAME_TAG',
    c1,
    c2,
    c1_boolean_replay_label_admitted: c1.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY',
    c2_rejected_fake_replay: c2.status === 'REFUSE_UNWITNESSED_DERIVATION'
      && c2.rejected_rules.some(item => item.reason === 'REPLAY_WITNESS_SIGNATURE_MISMATCH')
  });
}

function atticContradictoryHeirs() {
  const evidenceSet = freezeArray([
    evidence('GH06_A', ['MEASUREMENT:A']),
    evidence('GH06_B', ['MEASUREMENT:B'])
  ]);
  const allow = genealogyRule('GH06_ALLOW', ['MEASUREMENT:A'], 'DECISION:ALLOW');
  const deny = genealogyRule('GH06_DENY', ['MEASUREMENT:B'], 'DECISION:DENY');
  const rules = freezeArray([allow, deny]);
  const conflicts = freezeArray([freezeArray(['DECISION:ALLOW', 'DECISION:DENY'])]);
  const c1Allow = evaluateDeclaredDerivationalClosure({ evidence:evidenceSet, rules, requested_warrant:'DECISION:ALLOW' });
  const c1Deny = evaluateDeclaredDerivationalClosure({ evidence:evidenceSet, rules, requested_warrant:'DECISION:DENY' });
  const c2Allow = evaluateWarrantGenealogy({ evidence:evidenceSet, rules, contradiction_families:conflicts, requested_warrant:'DECISION:ALLOW' });
  const c2Deny = evaluateWarrantGenealogy({ evidence:evidenceSet, rules, contradiction_families:conflicts, requested_warrant:'DECISION:DENY' });
  return freezeRecord({
    case_id: 'GH06_CONTRADICTORY_HEIRS',
    c1_allow: c1Allow,
    c1_deny: c1Deny,
    c2_allow: c2Allow,
    c2_deny: c2Deny,
    c1_membership_overclaim:
      c1Allow.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY'
      && c1Deny.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY',
    c2_abstains_on_conflict:
      c2Allow.status === 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT'
      && c2Deny.status === 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT'
  });
}

function basementRetraction() {
  const beforeEvidence = freezeArray([
    evidence('GH07_A', ['MEASUREMENT:A']),
    evidence('GH07_B', ['MEASUREMENT:B']),
    evidence('GH07_D', ['MEASUREMENT:D'])
  ]);
  const afterEvidence = freezeArray([
    evidence('GH07_A', ['MEASUREMENT:A']),
    evidence('GH07_D', ['MEASUREMENT:D'])
  ]);
  const r1 = genealogyRule('GH07_R1', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:C');
  const r2 = genealogyRule('GH07_R2', ['IDENTIFIABILITY:C', 'MEASUREMENT:D'], 'DECISION:E');
  const rules = freezeArray([r1, r2]);
  const before = warrantGenealogyClosure({ evidence:beforeEvidence, rules });
  const after = warrantGenealogyClosure({ evidence:afterEvidence, rules });
  const invalidated = freezeArray(before.closure_warrants.filter(warrant => !after.closure_warrants.includes(warrant)).sort());
  return freezeRecord({
    case_id: 'GH07_RETRACTION_GHOST_WARRANT',
    before,
    after,
    invalidated_warrants: invalidated,
    ghost_warrant_survived: after.closure_warrants.includes('IDENTIFIABILITY:C') || after.closure_warrants.includes('DECISION:E')
  });
}

function goodTwinValidPlusInvalid() {
  const evidenceSet = freezeArray([
    evidence('GH08_A', ['MEASUREMENT:A']),
    evidence('GH08_B', ['MEASUREMENT:B']),
    evidence('GH08_C', ['MEASUREMENT:C']),
    evidence('GH08_D', ['MEASUREMENT:D'])
  ]);
  const fake = genealogyRule('A_FAKE_ROUTE_SORTS_FIRST', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W', 'mismatch');
  const valid = genealogyRule('Z_VALID_ROUTE_SORTS_LAST', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W');
  const rules = freezeArray([valid, fake]);
  const c1 = evaluateDeclaredDerivationalClosure({ evidence:evidenceSet, rules, requested_warrant:'IDENTIFIABILITY:W' });
  const c2 = evaluateWarrantGenealogy({ evidence:evidenceSet, rules, requested_warrant:'IDENTIFIABILITY:W' });
  const validSignature = canonicalRuleSignature(valid);
  const fakeSignature = canonicalRuleSignature(fake);
  return freezeRecord({
    case_id: 'GH08_VALID_PLUS_INVALID_COMPETING_ROUTE',
    c1,
    c2,
    valid_signature: validSignature,
    fake_signature: fakeSignature,
    c1_recorded_semantics: c1RecordedSemanticSignatures(rules, c1),
    c1_fake_route_recorded: c1.derivations_used.includes(fake.rule_id),
    c1_valid_route_suppressed: !c1.derivations_used.includes(valid.rule_id),
    c2_valid_route_preserved: semanticFingerprints(c2, 'IDENTIFIABILITY:W').includes(validSignature),
    c2_fake_route_excluded: !semanticFingerprints(c2, 'IDENTIFIABILITY:W').includes(fakeSignature),
    c2_fake_route_rejected: c2.rejected_rules.some(item => item.rule_id === fake.rule_id)
  });
}

function blankRoomUnsupported() {
  const disposition = evaluateWarrantGenealogy({
    evidence:[evidence('GH09_A', ['MEASUREMENT:A'])],
    rules:[],
    requested_warrant:'DECISION:UNSUPPORTED'
  });
  return freezeRecord({
    case_id: 'GH09_UNSUPPORTED_WARRANT',
    disposition
  });
}

function inheritedConstitutionalControls(inherited) {
  const hostile = inherited.hostile_receipts;
  const constitutional = hostile.constitutional_controls;
  return freezeRecord({
    prior_closure_verdict: inherited.closure_candidate.verdict,
    strict_non_amplification_verdict: inherited.strict_candidate.verdict,
    exact_tie_status: constitutional.exact_tie_status,
    lexicographic_probe_id_tie_break_used: constitutional.lexicographic_probe_id_tie_break_used,
    undeclared_loss_status: constitutional.undeclared_loss_status,
    conflicting_loss_status: constitutional.conflicting_loss_status,
    missing_aggregation_status: constitutional.missing_aggregation_status,
    unsupported_aggregation_status: constitutional.unsupported_aggregation_status,
    posthoc_status: constitutional.posthoc_status,
    incomplete_uncertainty_status: constitutional.incomplete_uncertainty_status,
    invalid_uncertainty_status: constitutional.invalid_uncertainty_status,
    scalar_refusals_preserved: hostile.scalar_collapse_refusals.every(item =>
      item.status === 'REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE'
      && item.scalar_value === null
      && item.scalar_aggregation_used === false
    )
  });
}

export function runPedagogueWarrantGenealogyGhostHouseGauntlet() {
  const inherited = runPedagogueTypedNonAmplificationHostileGauntlet();
  if (inherited.closure_candidate.verdict !== 'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_SURVIVES_BOUNDED_HOSTILE_FAMILY') {
    return freezeRecord({
      schema: PEDAGOGUE_WARRANT_GENEALOGY_GHOST_HOUSE_SCHEMA,
      primary_verdict: 'ASSAY_INFRASTRUCTURE_FAILURE',
      failure: 'INHERITED_C1_SURVIVAL_RECEIPT_NOT_AVAILABLE',
      promotion_authority: false,
      deployment_authority: false,
      release_authority: false
    });
  }

  const nursery = nurserySeedlessCycle();
  const staircase = staircaseMultiStep();
  const twins = twinBedroomMultipleLineages();
  const mirror = mirrorRoomRenameOrder();
  const costume = costumeClosetFakeReplay();
  const attic = atticContradictoryHeirs();
  const basement = basementRetraction();
  const goodTwin = goodTwinValidPlusInvalid();
  const blank = blankRoomUnsupported();
  const constitutional = inheritedConstitutionalControls(inherited);

  const c1Falsifiers = [];
  if (twins.c1_erased_alternative_lineage) c1Falsifiers.push('ALTERNATIVE_LAWFUL_LINEAGE_ERASED');
  if (mirror.c1_provenance_name_sensitive) c1Falsifiers.push('PROVENANCE_SELECTED_BY_RULE_NAME_OR_SERIALIZATION');
  if (costume.c1_boolean_replay_label_admitted) c1Falsifiers.push('DECLARED_REPLAYABILITY_LAUNDERING');
  if (attic.c1_membership_overclaim) c1Falsifiers.push('CONTRADICTION_MEMBERSHIP_OVERCLAIM');
  if (goodTwin.c1_fake_route_recorded && goodTwin.c1_valid_route_suppressed) c1Falsifiers.push('INVALID_ROUTE_SELECTED_BY_LEXICAL_ORDER');

  const inheritedPass = constitutional.prior_closure_verdict === 'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_SURVIVES_BOUNDED_HOSTILE_FAMILY'
    && constitutional.strict_non_amplification_verdict === 'STRICT_TYPED_NON_AMPLIFICATION_FALSIFIED_BY_LAWFUL_DERIVATIONAL_GAIN'
    && constitutional.exact_tie_status === 'NO_UNIQUE_SELECTION_DECISION_LOSS_TIE'
    && constitutional.lexicographic_probe_id_tie_break_used === false
    && constitutional.undeclared_loss_status === 'NO_SELECTION_UNDECLARED_DECISION_LOSS'
    && constitutional.conflicting_loss_status === 'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE'
    && constitutional.missing_aggregation_status === 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE'
    && constitutional.unsupported_aggregation_status === 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE'
    && constitutional.posthoc_status === 'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY'
    && constitutional.incomplete_uncertainty_status === 'ABSTAIN_NOISE_GEOMETRY_INCOMPLETE'
    && constitutional.invalid_uncertainty_status === 'REJECT_INVALID_NOISE_GEOMETRY'
    && constitutional.scalar_refusals_preserved === true;

  const c2DefeatConditions = [];
  if (nursery.c2_bootstrapped) c2DefeatConditions.push('SEEDLESS_CYCLE_BOOTSTRAPPED_WARRANT');
  if (!staircase.ancestry_reconstructable) c2DefeatConditions.push('MULTI_STEP_ANCESTRY_NOT_RECONSTRUCTABLE');
  if (!twins.c2_preserved_both) c2DefeatConditions.push('ALL_VALID_LINEAGES_NOT_PRESERVED');
  if (!mirror.c2_semantic_lineages_invariant || !mirror.c2_disposition_invariant) c2DefeatConditions.push('RULE_RENAME_OR_ORDER_CHANGED_SEMANTIC_AUTHORITY');
  if (!costume.c2_rejected_fake_replay) c2DefeatConditions.push('REPLAYABLE_LABEL_LAUNDERED_AS_REPLAY_WITNESS');
  if (!attic.c2_abstains_on_conflict) c2DefeatConditions.push('CONTRADICTION_MEMBERSHIP_MANUFACTURED_UNIQUE_AUTHORITY');
  if (basement.ghost_warrant_survived || !basement.invalidated_warrants.includes('IDENTIFIABILITY:C') || !basement.invalidated_warrants.includes('DECISION:E')) {
    c2DefeatConditions.push('GHOST_WARRANT_SURVIVED_SUPPORT_RETRACTION');
  }
  if (goodTwin.c2.status !== 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY') c2DefeatConditions.push('VALID_ROUTE_LOST_BECAUSE_FAKE_ROUTE_SORTED_FIRST');
  if (!goodTwin.c2_valid_route_preserved || !goodTwin.c2_fake_route_excluded || !goodTwin.c2_fake_route_rejected) {
    c2DefeatConditions.push('INVALID_ROUTE_LAUNDERED_BY_SHARED_OUTPUT');
  }
  if (blank.disposition.status !== 'REFUSE_AUTHORITY_OUTSIDE_WARRANT_GENEALOGY') c2DefeatConditions.push('UNSUPPORTED_WARRANT_ADMITTED');
  if (!inheritedPass) c2DefeatConditions.push('INHERITED_CONSTITUTIONAL_CONTROL_REGRESSION');

  const c1Falsified = c1Falsifiers.length > 0;
  const c2Survives = c2DefeatConditions.length === 0;

  const c1Verdict = c1Falsified
    ? 'DECLARED_DERIVATIONAL_CLOSURE_C1_FALSIFIED_AS_PROVENANCE_SUFFICIENT_FORM'
    : 'DECLARED_DERIVATIONAL_CLOSURE_C1_SURVIVES_GHOST_HOUSE';
  const c2Verdict = c2Survives
    ? 'WARRANT_GENEALOGY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_GHOST_HOUSE'
    : 'WARRANT_GENEALOGY_CUSTODY_CANDIDATE_FALSIFIED';

  return freezeRecord({
    schema: PEDAGOGUE_WARRANT_GENEALOGY_GHOST_HOUSE_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    experiment_host: 'PR677_PEDAGOGUE_GHOST_HOUSE',
    play_surface: 'DOLLHOUSE_MNEMONIC_ONLY_NOT_ONTOLOGY_AUTHORITY',
    inherited_c1: freezeRecord({
      status_before_execution: 'ATTACK_ONLY_NOT_PROMOTED',
      verdict: c1Verdict,
      falsifiers: freezeArray(c1Falsifiers),
      falsification_scope: 'BOUNDED_SYNTHETIC_PROVENANCE_SUFFICIENCY_FORM',
      fixed_point_closure_declared_false: false,
      promoted: false
    }),
    warrant_genealogy_candidate: freezeRecord({
      status_before_execution: 'ATTACK_ONLY_NOT_PROMOTED',
      display_name: 'Warrant Genealogy',
      verdict: c2Verdict,
      defeat_conditions: freezeArray(c2DefeatConditions),
      presumption_of_survival: false,
      promoted: false
    }),
    hostile_rooms: freezeRecord({
      GH01_nursery_seedless_cycle: nursery,
      GH02_staircase_multi_step_ancestry: staircase,
      GH03_twin_bedroom_multiple_valid_lineages: twins,
      GH04_mirror_room_rule_rename_order: mirror,
      GH05_costume_closet_fake_replay: costume,
      GH06_attic_contradictory_heirs: attic,
      GH07_basement_retraction_ghost_warrant: basement,
      GH08_good_twin_valid_plus_invalid_route: goodTwin,
      GH09_blank_room_unsupported_warrant: blank,
      inherited_constitutional_controls: constitutional
    }),
    primary_verdict: c2Verdict,
    c1_provenance_form_falsified: c1Falsified,
    c2_strong_falsifier_passed: c2Survives,
    earned_distinctions: freezeArray([
      'closure membership != sufficient provenance custody',
      'rule identifier != semantic lineage',
      'declared replayability != witnessed replayability',
      'one lawful lineage != all lawful lineages',
      'warrant membership != contradiction resolution',
      'support retraction != permission for ghost warrant persistence'
    ]),
    candidate_formalism_status: 'ATTACK_ONLY_NOT_PROMOTED',
    scalar_aggregation_used: false,
    intersection_program_status: 'HELD_NOT_OPENED_HERE',
    H2_status: 'HELD_NOT_TESTED_HERE',
    H3_status: 'HELD_NOT_TESTED_HERE',
    aperture_v32_replay_stability: 'HELD_NOT_YET_WITNESSED',
    pedagogue_engine_mutation: false,
    product_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    deployment_authority: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true,
    promotion_authority: false,
    research_decision_authority_for_next_bounded_chamber: true,
    next_learning_action: c2Survives
      ? 'ATTACK_WARRANT_GENEALOGY_TEMPORAL_RULE_WITHDRAWAL_CONFLICT_RESOLUTION_AND_PROVENANCE_REPLAY_BEFORE_FORMALISM_PROMOTION'
      : 'INTERPRET_WARRANT_GENEALOGY_CORPSE_AND_AUTHOR_DESCENDANT_WITHOUT_PROMOTION'
  });
}
