import {
  canonicalRuleSignature,
  evaluateWarrantGenealogy,
  makeSyntheticReplayWitness,
  runPedagogueWarrantGenealogyGhostHouseGauntlet
} from './pedagogue-warrant-genealogy-ghost-house.js';

export const PEDAGOGUE_WARRANT_EPISODE_LEDGER_AFTER_MIDNIGHT_SCHEMA =
  'td613.pedagogue.warrant-episode-ledger-after-midnight-hostile/v0.1';

const freeze = value => Object.freeze(value);
const freezeArray = values => freeze([...values]);
const freezeRecord = value => freeze({ ...value });

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function evidence(evidence_id, warrants) {
  return freezeRecord({ evidence_id, warrants: freezeArray(warrants) });
}

function witnessedRule(rule_id, requires, produces, { witnessMode = 'valid', witnessId = null } = {}) {
  const base = {
    rule_id,
    requires: freezeArray(requires),
    produces,
    predeclared: true,
    admissible: true,
    replayable: true
  };
  if (witnessMode === 'missing') return freezeRecord(base);
  if (witnessMode === 'mismatch') {
    return freezeRecord({
      ...base,
      replay_witness: freezeRecord({
        witness_id: witnessId ?? `WITNESS:${rule_id}:MISMATCH`,
        status: 'WITNESSED_SYNTHETIC',
        semantic_signature: `${canonicalRuleSignature(base)}::MISMATCH`
      })
    });
  }
  return freezeRecord({
    ...base,
    replay_witness: makeSyntheticReplayWitness(base, witnessId ?? `WITNESS:${rule_id}`)
  });
}

function normalizeEvidence(input) {
  return freezeArray((input ?? []).map(item => freezeRecord({
    evidence_id: item.evidence_id,
    warrants: freezeArray([...(item.warrants ?? [])])
  })));
}

function normalizeRules(input) {
  return freezeArray((input ?? []).map(rule => freezeRecord({
    rule_id: rule.rule_id,
    requires: freezeArray([...(rule.requires ?? [])]),
    produces: rule.produces,
    predeclared: rule.predeclared === true,
    admissible: rule.admissible === true,
    replayable: rule.replayable === true,
    replay_witness: rule.replay_witness ? freezeRecord({ ...rule.replay_witness }) : null
  })));
}

function normalizeConflicts(input) {
  return freezeArray((input ?? []).map(family => freezeArray([...family].sort())));
}

function semanticRuleIndex(rules) {
  const bySemantic = {};
  const byId = {};
  for (const rule of rules) {
    let signature;
    try {
      signature = canonicalRuleSignature(rule);
    } catch {
      signature = `INVALID:${rule.rule_id ?? 'NO_ID'}`;
    }
    if (!bySemantic[signature]) bySemantic[signature] = [];
    bySemantic[signature].push(rule.rule_id);
    byId[rule.rule_id] = signature;
  }
  for (const key of Object.keys(bySemantic)) bySemantic[key] = sortedUnique(bySemantic[key]);
  return freezeRecord({
    by_semantic: freezeRecord(bySemantic),
    by_id: freezeRecord(byId)
  });
}

function currentSnapshotCore(episode) {
  return freezeRecord({
    requested_warrant: episode.requested_warrant,
    status: episode.disposition.status,
    conflicting_warrants: episode.disposition.conflicting_warrants,
    primitive_warrants: episode.disposition.primitive_warrants,
    closure_warrants: episode.disposition.closure_warrants,
    semantic_lineage_fingerprints: episode.disposition.semantic_lineage_fingerprints,
    rejected_rules: episode.disposition.rejected_rules.map(item => ({
      produces: item.produces,
      semantic_signature: item.semantic_signature,
      reason: item.reason
    })),
    contradiction_families: episode.contradiction_families
  });
}

export function sealWarrantEpisode({
  episode_id,
  evidence: evidenceSet = [],
  rules = [],
  contradiction_families = [],
  requested_warrant
} = {}) {
  if (typeof episode_id !== 'string' || !episode_id) throw new TypeError('episode_id required');
  const normalizedEvidence = normalizeEvidence(evidenceSet);
  const normalizedRules = normalizeRules(rules);
  const normalizedConflicts = normalizeConflicts(contradiction_families);
  const disposition = evaluateWarrantGenealogy({
    evidence: normalizedEvidence,
    rules: normalizedRules,
    contradiction_families: normalizedConflicts,
    requested_warrant
  });
  const episode = {
    episode_id,
    requested_warrant,
    evidence: normalizedEvidence,
    rules: normalizedRules,
    contradiction_families: normalizedConflicts,
    rule_index: semanticRuleIndex(normalizedRules),
    disposition,
    sealed: true,
    historical_mutation_authority: false
  };
  const core = currentSnapshotCore(episode);
  return freezeRecord({
    ...episode,
    current_snapshot_fingerprint: stable(core),
    episode_custody_fingerprint: stable({
      evidence: normalizedEvidence,
      rules: normalizedRules,
      contradiction_families: normalizedConflicts,
      requested_warrant,
      core
    })
  });
}

function lineagesFor(episode) {
  return episode.disposition.semantic_lineage_fingerprints[episode.requested_warrant] ?? [];
}

function presence(episode) {
  return episode.disposition.closure_warrants.includes(episode.requested_warrant);
}

function isConflict(episode) {
  return episode.disposition.status === 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT';
}

function rejectedReplayForRequested(episode) {
  return episode.disposition.rejected_rules.some(item =>
    item.produces === episode.requested_warrant
    && ['REPLAY_WITNESS_MISSING', 'REPLAY_WITNESS_SIGNATURE_MISMATCH', 'REPLAY_WITNESS_ID_MISSING'].includes(item.reason)
  );
}

export function compareWarrantEpisodes(before, after) {
  if (!before?.sealed || !after?.sealed) throw new TypeError('sealed episodes required');
  if (before.requested_warrant !== after.requested_warrant) throw new Error('requested warrant must remain fixed within a transition comparison');

  const events = [];
  const beforePresent = presence(before);
  const afterPresent = presence(after);
  const beforeLineages = lineagesFor(before);
  const afterLineages = lineagesFor(after);
  const lostLineages = beforeLineages.filter(item => !afterLineages.includes(item)).sort();
  const gainedLineages = afterLineages.filter(item => !beforeLineages.includes(item)).sort();

  if (!isConflict(before) && isConflict(after)) events.push('CONTRADICTION_ENTERED');
  if (isConflict(before) && !isConflict(after)) events.push('CONTRADICTION_RESOLVED');

  if (beforePresent && afterPresent && (lostLineages.length > 0 || gainedLineages.length > 0)) {
    events.push('WARRANT_PERSISTS_LINEAGE_SET_CHANGED');
  }
  if (beforePresent && !afterPresent) {
    events.push('WARRANT_INVALIDATED_ALL_SUPPORT_WITHDRAWN');
  }
  if (!beforePresent && afterPresent) {
    events.push('WARRANT_BECAME_SUPPORTED');
  }
  if (beforePresent && !afterPresent && rejectedReplayForRequested(after)) {
    events.push('REPLAY_WITNESS_SUPPORT_REVOKED');
  }

  const sharedSemantic = Object.keys(before.rule_index.by_semantic)
    .filter(signature => Object.prototype.hasOwnProperty.call(after.rule_index.by_semantic, signature))
    .sort();
  for (const signature of sharedSemantic) {
    const beforeIds = before.rule_index.by_semantic[signature];
    const afterIds = after.rule_index.by_semantic[signature];
    if (stable(beforeIds) !== stable(afterIds)) {
      events.push('SEMANTIC_RULE_CONTINUITY_WITH_IDENTIFIER_CHANGE');
      break;
    }
  }

  for (const [ruleId, beforeSignature] of Object.entries(before.rule_index.by_id)) {
    const afterSignature = after.rule_index.by_id[ruleId];
    if (afterSignature && afterSignature !== beforeSignature) {
      events.push('RULE_IDENTIFIER_REUSED_WITH_SEMANTIC_DISCONTINUITY');
      break;
    }
  }

  const materialCurrentSame = before.current_snapshot_fingerprint === after.current_snapshot_fingerprint;
  if (materialCurrentSame && events.length === 0) events.push('NO_MATERIAL_WARRANT_STATE_CHANGE');

  return freezeRecord({
    from_episode_id: before.episode_id,
    to_episode_id: after.episode_id,
    requested_warrant: before.requested_warrant,
    events: freezeArray(sortedUnique(events)),
    before_present: beforePresent,
    after_present: afterPresent,
    before_status: before.disposition.status,
    after_status: after.disposition.status,
    lost_lineages: freezeArray(lostLineages),
    gained_lineages: freezeArray(gainedLineages),
    semantic_lineage_continuity: lostLineages.length === 0 && gainedLineages.length === 0,
    current_snapshot_equal: materialCurrentSame,
    scalar_aggregation_used: false
  });
}

export function buildWarrantEpisodeLedger(episodeSpecs) {
  if (!Array.isArray(episodeSpecs) || episodeSpecs.length === 0) throw new TypeError('episode specs required');
  const episodes = freezeArray(episodeSpecs.map(sealWarrantEpisode));
  const transitions = [];
  for (let index = 1; index < episodes.length; index += 1) {
    let transition = compareWarrantEpisodes(episodes[index - 1], episodes[index]);
    if (index >= 2) {
      const twoBack = episodes[index - 2];
      const previous = episodes[index - 1];
      const current = episodes[index];
      if (presence(twoBack) && !presence(previous) && presence(current)) {
        transition = freezeRecord({
          ...transition,
          events: freezeArray(sortedUnique([...transition.events, 'WARRANT_RESTORED_NEW_SUPPORT_EPISODE'])),
          support_continuity_across_three_episodes: false
        });
      }
    }
    transitions.push(transition);
  }
  return freezeRecord({
    candidate: 'C3_WARRANT_EPISODE_LEDGER',
    episodes,
    transitions: freezeArray(transitions),
    current_episode: episodes.at(-1),
    current_authority_from_latest_episode_only: true,
    historical_episodes_mutable: false,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function attemptPosthocContradictionMutation(sealedEpisode, replacementFamilies) {
  if (!sealedEpisode?.sealed) throw new TypeError('sealed episode required');
  return freezeRecord({
    episode_id: sealedEpisode.episode_id,
    requested_replacement: normalizeConflicts(replacementFamilies),
    status: 'POSTHOC_CONTRADICTION_DECLARATION_MUTATION_REFUSED',
    mutation_applied: false,
    original_episode_custody_fingerprint: sealedEpisode.episode_custody_fingerprint,
    original_contradiction_families: sealedEpisode.contradiction_families
  });
}

export function replaySealedWarrantEpisode(sealedEpisode, { expectedLineagesOverride = null } = {}) {
  if (!sealedEpisode?.sealed) throw new TypeError('sealed episode required');
  const replayed = evaluateWarrantGenealogy({
    evidence: sealedEpisode.evidence,
    rules: sealedEpisode.rules,
    contradiction_families: sealedEpisode.contradiction_families,
    requested_warrant: sealedEpisode.requested_warrant
  });
  const recordedLineages = expectedLineagesOverride ?? sealedEpisode.disposition.semantic_lineage_fingerprints;
  const actualCore = freezeRecord({
    status: replayed.status,
    closure_warrants: replayed.closure_warrants,
    semantic_lineage_fingerprints: replayed.semantic_lineage_fingerprints,
    conflicting_warrants: replayed.conflicting_warrants
  });
  const expectedCore = freezeRecord({
    status: sealedEpisode.disposition.status,
    closure_warrants: sealedEpisode.disposition.closure_warrants,
    semantic_lineage_fingerprints: recordedLineages,
    conflicting_warrants: sealedEpisode.disposition.conflicting_warrants
  });
  const match = stable(actualCore) === stable(expectedCore);
  return freezeRecord({
    episode_id: sealedEpisode.episode_id,
    status: match ? 'EXACT_SYNTHETIC_PROVENANCE_REPLAY_MATCH' : 'PROVENANCE_REPLAY_MISMATCH',
    match,
    actual_core: actualCore,
    expected_core: expectedCore,
    external_world_reproducibility_claim: false
  });
}

function am01OneLineageWithdrawn() {
  const routeAB = witnessedRule('AM01_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const routeCD = witnessedRule('AM01_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W');
  const rules = [routeAB, routeCD];
  const ledger = buildWarrantEpisodeLedger([
    {
      episode_id:'AM01_T0',
      evidence:[evidence('A',['MEASUREMENT:A']), evidence('B',['MEASUREMENT:B']), evidence('C',['MEASUREMENT:C']), evidence('D',['MEASUREMENT:D'])],
      rules,
      requested_warrant:'IDENTIFIABILITY:W'
    },
    {
      episode_id:'AM01_T1',
      evidence:[evidence('B',['MEASUREMENT:B']), evidence('C',['MEASUREMENT:C']), evidence('D',['MEASUREMENT:D'])],
      rules,
      requested_warrant:'IDENTIFIABILITY:W'
    }
  ]);
  return freezeRecord({ case_id:'AM01_ONE_LINEAGE_WITHDRAWN', ledger });
}

function am02AllLineagesWithdrawn() {
  const routeAB = witnessedRule('AM02_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const routeCD = witnessedRule('AM02_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W');
  const rules = [routeAB, routeCD];
  const ledger = buildWarrantEpisodeLedger([
    {
      episode_id:'AM02_T0',
      evidence:[evidence('A',['MEASUREMENT:A']), evidence('B',['MEASUREMENT:B']), evidence('C',['MEASUREMENT:C']), evidence('D',['MEASUREMENT:D'])],
      rules,
      requested_warrant:'IDENTIFIABILITY:W'
    },
    {
      episode_id:'AM02_T1',
      evidence:[evidence('B',['MEASUREMENT:B']), evidence('D',['MEASUREMENT:D'])],
      rules,
      requested_warrant:'IDENTIFIABILITY:W'
    }
  ]);
  return freezeRecord({ case_id:'AM02_ALL_LINEAGES_WITHDRAWN', ledger });
}

function am03ConflictEnterResolve() {
  const allow = witnessedRule('AM03_ALLOW', ['MEASUREMENT:A'], 'DECISION:ALLOW');
  const deny = witnessedRule('AM03_DENY', ['MEASUREMENT:B'], 'DECISION:DENY');
  const rules = [allow, deny];
  const conflicts = [['DECISION:ALLOW','DECISION:DENY']];
  const ledger = buildWarrantEpisodeLedger([
    { episode_id:'AM03_T0', evidence:[evidence('A',['MEASUREMENT:A'])], rules, contradiction_families:conflicts, requested_warrant:'DECISION:ALLOW' },
    { episode_id:'AM03_T1', evidence:[evidence('A',['MEASUREMENT:A']),evidence('B',['MEASUREMENT:B'])], rules, contradiction_families:conflicts, requested_warrant:'DECISION:ALLOW' },
    { episode_id:'AM03_T2', evidence:[evidence('A',['MEASUREMENT:A'])], rules, contradiction_families:conflicts, requested_warrant:'DECISION:ALLOW' }
  ]);
  return freezeRecord({ case_id:'AM03_CONFLICT_ENTER_RESOLVE', ledger });
}

function am04ReplayWitnessRevoked() {
  const valid = witnessedRule('AM04_RULE', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const revoked = witnessedRule('AM04_RULE', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W', { witnessMode:'mismatch' });
  const evidenceSet = [evidence('A',['MEASUREMENT:A']), evidence('B',['MEASUREMENT:B'])];
  const ledger = buildWarrantEpisodeLedger([
    { episode_id:'AM04_T0', evidence:evidenceSet, rules:[valid], requested_warrant:'IDENTIFIABILITY:W' },
    { episode_id:'AM04_T1', evidence:evidenceSet, rules:[revoked], requested_warrant:'IDENTIFIABILITY:W' }
  ]);
  return freezeRecord({ case_id:'AM04_REPLAY_WITNESS_REVOKED', ledger });
}

function am05SameSemanticsNewRuleId() {
  const beforeRule = witnessedRule('AM05_OLD_ID', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const afterRule = witnessedRule('AM05_NEW_ID', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const evidenceSet = [evidence('A',['MEASUREMENT:A']), evidence('B',['MEASUREMENT:B'])];
  const ledger = buildWarrantEpisodeLedger([
    { episode_id:'AM05_T0', evidence:evidenceSet, rules:[beforeRule], requested_warrant:'IDENTIFIABILITY:W' },
    { episode_id:'AM05_T1', evidence:evidenceSet, rules:[afterRule], requested_warrant:'IDENTIFIABILITY:W' }
  ]);
  return freezeRecord({ case_id:'AM05_SAME_SEMANTICS_NEW_RULE_ID', ledger });
}

function am06SameRuleIdChangedSemantics() {
  const beforeRule = witnessedRule('AM06_SAME_ID', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const afterRule = witnessedRule('AM06_SAME_ID', ['MEASUREMENT:C','MEASUREMENT:D'], 'IDENTIFIABILITY:W');
  const ledger = buildWarrantEpisodeLedger([
    { episode_id:'AM06_T0', evidence:[evidence('A',['MEASUREMENT:A']),evidence('B',['MEASUREMENT:B'])], rules:[beforeRule], requested_warrant:'IDENTIFIABILITY:W' },
    { episode_id:'AM06_T1', evidence:[evidence('C',['MEASUREMENT:C']),evidence('D',['MEASUREMENT:D'])], rules:[afterRule], requested_warrant:'IDENTIFIABILITY:W' }
  ]);
  return freezeRecord({ case_id:'AM06_SAME_RULE_ID_CHANGED_SEMANTICS', ledger });
}

function am07ExecutableReplay() {
  const rule = witnessedRule('AM07_RULE', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const episode = sealWarrantEpisode({
    episode_id:'AM07_T0',
    evidence:[evidence('A',['MEASUREMENT:A']), evidence('B',['MEASUREMENT:B'])],
    rules:[rule],
    requested_warrant:'IDENTIFIABILITY:W'
  });
  const exact = replaySealedWarrantEpisode(episode);
  const tampered = clone(episode.disposition.semantic_lineage_fingerprints);
  tampered['IDENTIFIABILITY:W'] = ['MEASUREMENT:A=>IDENTIFIABILITY:W'];
  const negative = replaySealedWarrantEpisode(episode, { expectedLineagesOverride:tampered });
  return freezeRecord({ case_id:'AM07_EXECUTABLE_PROVENANCE_REPLAY', episode, exact, negative });
}

function am08PosthocConflictMutation() {
  const allow = witnessedRule('AM08_ALLOW', ['MEASUREMENT:A'], 'DECISION:ALLOW');
  const deny = witnessedRule('AM08_DENY', ['MEASUREMENT:B'], 'DECISION:DENY');
  const episode = sealWarrantEpisode({
    episode_id:'AM08_T0',
    evidence:[evidence('A',['MEASUREMENT:A']),evidence('B',['MEASUREMENT:B'])],
    rules:[allow,deny],
    contradiction_families:[['DECISION:ALLOW','DECISION:DENY']],
    requested_warrant:'DECISION:ALLOW'
  });
  const beforeFingerprint = episode.episode_custody_fingerprint;
  const mutation = attemptPosthocContradictionMutation(episode, []);
  return freezeRecord({
    case_id:'AM08_POSTHOC_CONFLICT_DEFINITION_MUTATION',
    episode,
    mutation,
    historical_fingerprint_unchanged: beforeFingerprint === episode.episode_custody_fingerprint
  });
}

function am09WithdrawRestore() {
  const rule = witnessedRule('AM09_RULE', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const supported = [evidence('A',['MEASUREMENT:A']),evidence('B',['MEASUREMENT:B'])];
  const ledger = buildWarrantEpisodeLedger([
    { episode_id:'AM09_T0', evidence:supported, rules:[rule], requested_warrant:'IDENTIFIABILITY:W' },
    { episode_id:'AM09_T1', evidence:[evidence('A',['MEASUREMENT:A'])], rules:[rule], requested_warrant:'IDENTIFIABILITY:W' },
    { episode_id:'AM09_T2', evidence:supported, rules:[rule], requested_warrant:'IDENTIFIABILITY:W' }
  ]);
  const continuousLedger = buildWarrantEpisodeLedger([
    { episode_id:'AM09_A_T0', evidence:supported, rules:[rule], requested_warrant:'IDENTIFIABILITY:W' },
    { episode_id:'AM09_A_T1', evidence:supported, rules:[rule], requested_warrant:'IDENTIFIABILITY:W' }
  ]);
  return freezeRecord({
    case_id:'AM09_WITHDRAWN_THEN_RESTORED_SUPPORT',
    interrupted: ledger,
    continuous: continuousLedger,
    latest_snapshot_equal:
      ledger.current_episode.current_snapshot_fingerprint === continuousLedger.current_episode.current_snapshot_fingerprint,
    histories_equal: false,
    interrupted_support_continuity: false,
    continuous_support_continuity: true
  });
}

function am10NoChange() {
  const rule = witnessedRule('AM10_RULE', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
  const evidenceSet = [evidence('A',['MEASUREMENT:A']),evidence('B',['MEASUREMENT:B'])];
  const ledger = buildWarrantEpisodeLedger([
    { episode_id:'AM10_T0', evidence:evidenceSet, rules:[rule], requested_warrant:'IDENTIFIABILITY:W' },
    { episode_id:'AM10_T1', evidence:evidenceSet, rules:[rule], requested_warrant:'IDENTIFIABILITY:W' }
  ]);
  return freezeRecord({ case_id:'AM10_NO_CHANGE_CONTROL', ledger });
}

export function runPedagogueGhostHouseAfterMidnightGauntlet() {
  const inherited = runPedagogueWarrantGenealogyGhostHouseGauntlet();
  if (inherited.primary_verdict !== 'WARRANT_GENEALOGY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_GHOST_HOUSE') {
    return freezeRecord({
      schema: PEDAGOGUE_WARRANT_EPISODE_LEDGER_AFTER_MIDNIGHT_SCHEMA,
      primary_verdict:'ASSAY_INFRASTRUCTURE_FAILURE',
      failure:'INHERITED_C2_SNAPSHOT_SURVIVAL_RECEIPT_NOT_AVAILABLE',
      promotion_authority:false,
      deployment_authority:false,
      release_authority:false
    });
  }

  const am01 = am01OneLineageWithdrawn();
  const am02 = am02AllLineagesWithdrawn();
  const am03 = am03ConflictEnterResolve();
  const am04 = am04ReplayWitnessRevoked();
  const am05 = am05SameSemanticsNewRuleId();
  const am06 = am06SameRuleIdChangedSemantics();
  const am07 = am07ExecutableReplay();
  const am08 = am08PosthocConflictMutation();
  const am09 = am09WithdrawRestore();
  const am10 = am10NoChange();

  const defeatConditions = [];
  if (!am01.ledger.transitions[0].events.includes('WARRANT_PERSISTS_LINEAGE_SET_CHANGED')
      || am01.ledger.transitions[0].lost_lineages.length !== 1
      || !presence(am01.ledger.current_episode)) {
    defeatConditions.push('LINEAGE_LOSS_ERASED_BECAUSE_WARRANT_MEMBERSHIP_STAYED_TRUE');
  }
  if (!am02.ledger.transitions[0].events.includes('WARRANT_INVALIDATED_ALL_SUPPORT_WITHDRAWN')
      || presence(am02.ledger.current_episode)
      || am02.ledger.current_episode.disposition.status !== 'REFUSE_AUTHORITY_OUTSIDE_WARRANT_GENEALOGY') {
    defeatConditions.push('HISTORICAL_SUPPORT_LAUNDERED_AS_CURRENT_SUPPORT');
  }
  if (!am03.ledger.transitions[0].events.includes('CONTRADICTION_ENTERED')) defeatConditions.push('CONFLICT_ENTRY_NOT_RECORDED');
  if (!am03.ledger.transitions[1].events.includes('CONTRADICTION_RESOLVED')) defeatConditions.push('CONFLICT_HISTORY_ERASED_AFTER_RESOLUTION');
  if (am03.ledger.current_episode.disposition.status !== 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY') {
    defeatConditions.push('RESOLVED_CONFLICT_REMAINS_STICKY_WITHOUT_CURRENT_SUPPORT');
  }
  if (!am04.ledger.transitions[0].events.includes('REPLAY_WITNESS_SUPPORT_REVOKED')
      || am04.ledger.current_episode.disposition.status !== 'REFUSE_UNWITNESSED_DERIVATION') {
    defeatConditions.push('PAST_REPLAY_WITNESS_LAUNDERED_AS_CURRENT_WITNESS');
  }
  if (!am05.ledger.transitions[0].events.includes('SEMANTIC_RULE_CONTINUITY_WITH_IDENTIFIER_CHANGE')
      || am05.ledger.transitions[0].events.includes('RULE_IDENTIFIER_REUSED_WITH_SEMANTIC_DISCONTINUITY')) {
    defeatConditions.push('RULE_RENAME_MISCLASSIFIED_AS_SEMANTIC_BREAK');
  }
  if (!am06.ledger.transitions[0].events.includes('RULE_IDENTIFIER_REUSED_WITH_SEMANTIC_DISCONTINUITY')) {
    defeatConditions.push('IDENTIFIER_CONTINUITY_LAUNDERED_AS_SEMANTIC_CONTINUITY');
  }
  if (am07.exact.status !== 'EXACT_SYNTHETIC_PROVENANCE_REPLAY_MATCH'
      || am07.negative.status !== 'PROVENANCE_REPLAY_MISMATCH') {
    defeatConditions.push('SYMBOLIC_ANCESTRY_ACCEPTED_WITHOUT_REPLAY_CONSISTENCY');
  }
  if (am08.mutation.status !== 'POSTHOC_CONTRADICTION_DECLARATION_MUTATION_REFUSED'
      || am08.mutation.mutation_applied !== false
      || !am08.historical_fingerprint_unchanged) {
    defeatConditions.push('POSTHOC_CONFLICT_DEFINITION_REWROTE_HISTORY');
  }
  if (!am09.interrupted.transitions[1].events.includes('WARRANT_RESTORED_NEW_SUPPORT_EPISODE')
      || am09.interrupted_support_continuity !== false
      || am09.continuous_support_continuity !== true) {
    defeatConditions.push('RESTORATION_FALSELY_REPRESENTED_AS_UNBROKEN_CONTINUITY');
  }
  if (am10.ledger.transitions[0].events.length !== 1
      || am10.ledger.transitions[0].events[0] !== 'NO_MATERIAL_WARRANT_STATE_CHANGE') {
    defeatConditions.push('LEDGER_INVENTED_CHANGE_FROM_EPISODE_BOUNDARY_ALONE');
  }

  const c2TemporalOverclaimFalsified = am09.latest_snapshot_equal === true
    && am09.interrupted_support_continuity !== am09.continuous_support_continuity;
  if (!c2TemporalOverclaimFalsified) defeatConditions.push('LATEST_SNAPSHOT_DID_NOT_EXPOSE_TEMPORAL_ALIASING_CONTROL');

  const c3Survives = defeatConditions.length === 0;
  const c3Verdict = c3Survives
    ? 'WARRANT_EPISODE_LEDGER_CANDIDATE_SURVIVES_BOUNDED_AFTER_MIDNIGHT'
    : 'WARRANT_EPISODE_LEDGER_CANDIDATE_FALSIFIED';

  return freezeRecord({
    schema: PEDAGOGUE_WARRANT_EPISODE_LEDGER_AFTER_MIDNIGHT_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    play_surface:'GHOST_HOUSE_AFTER_MIDNIGHT_MNEMONIC_ONLY_NOT_ONTOLOGY_AUTHORITY',
    inherited_c2: freezeRecord({
      snapshot_verdict: inherited.primary_verdict,
      snapshot_scope_preserved:true,
      temporal_overclaim_verdict: c2TemporalOverclaimFalsified
        ? 'WARRANT_GENEALOGY_C2_FALSIFIED_AS_TEMPORAL_CUSTODY_SUFFICIENT_FORM'
        : 'WARRANT_GENEALOGY_C2_TEMPORAL_OVERCLAIM_NOT_FALSIFIED_IN_THIS_FAMILY',
      temporal_aliasing_observed:c2TemporalOverclaimFalsified,
      promoted:false
    }),
    warrant_episode_ledger_candidate: freezeRecord({
      id:'C3_WARRANT_EPISODE_LEDGER',
      display_name:'Warrant Episode Ledger',
      status_before_execution:'ATTACK_ONLY_NOT_PROMOTED',
      verdict:c3Verdict,
      defeat_conditions:freezeArray(defeatConditions),
      presumption_of_survival:false,
      promoted:false
    }),
    after_midnight_rooms: freezeRecord({ AM01:am01, AM02:am02, AM03:am03, AM04:am04, AM05:am05, AM06:am06, AM07:am07, AM08:am08, AM09:am09, AM10:am10 }),
    primary_verdict:c3Verdict,
    c3_strong_falsifier_passed:c3Survives,
    earned_distinctions:freezeArray([
      'current genealogy != historical custody',
      'current warrant membership != uninterrupted support',
      'semantic continuity != identifier continuity',
      'identifier continuity != semantic continuity',
      'past replay witness != current replay witness',
      'resolved conflict != conflict never occurred',
      'symbolic ancestry != successful provenance replay',
      'restored support != retroactive continuity'
    ]),
    scalar_aggregation_used:false,
    candidate_formalism_status:'ATTACK_ONLY_NOT_PROMOTED',
    H2_status:'HELD_NOT_TESTED_HERE',
    H3_status:'HELD_NOT_TESTED_HERE',
    intersection_program_status:'HELD_NOT_OPENED_HERE',
    aperture_v32_replay_stability:'HELD_NOT_YET_WITNESSED',
    pedagogue_engine_mutation:false,
    product_mutation:false,
    workflow_mutation:false,
    browser_execution:false,
    merge_performed:false,
    deployment_authority:false,
    release_authority:false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture:true,
    promotion_authority:false,
    next_learning_action:c3Survives
      ? 'ATTACK_EPISODE_LEDGER_PARTIAL_ORDER_CONCURRENT_SUPPORT_AND_CUSTODY_COMPACTION_BEFORE_ANY_SHARED_FORMALISM_PROMOTION'
      : 'INTERPRET_EPISODE_LEDGER_CORPSE_AND_AUTHOR_DESCENDANT_WITHOUT_PROMOTION'
  });
}
