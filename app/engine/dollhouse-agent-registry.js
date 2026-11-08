const freeze = value => Object.freeze(value);

export const DOLLHOUSE_AGENT_REGISTRY_SCHEMA = 'td613.dollhouse.agent-registry/v0.1';

export const DOLLHOUSE_AGENT_REGISTRY = freeze({
  schema: DOLLHOUSE_AGENT_REGISTRY_SCHEMA,
  agents: freeze({
    PEDAGOGUE: freeze({
      id: 'PEDAGOGUE',
      canonical_name: 'Flow-Core Pedagogue',
      kind: 'OPERATIONAL_AGENT',
      status: 'INSTALLED',
      role: 'consequence-order-route-burden-practice-and-research-transfer',
      incoming_predecessors: freeze(['ORCHESTRATOR']),
      outgoing_successors: freeze(['APERTURE']),
      affective_disposition: 'protective-pacing-and-anti-preemption',
      native_tools: freeze([
        'run_command',
        'read_file',
        'edit_file',
        'write_file',
        'send_message',
        'ask_question'
      ]),
      invocation: 'PEDAGOGUE.md / app/engine/dollhouse-pedagogue-dromological.js::runPedagogueAgent',
      canonical_sources: freeze([
        'PEDAGOGUE.md',
        'app/engine/pedagogue-design-gate.js',
        'app/engine/pedagogue-institutional-time.js',
        'app/engine/pedagogue-lineage-second-pass.js'
      ]),
      audit_extensions: freeze([
        'app/engine/dollhouse-pedagogue-dromological.js::runPedagogueAgent',
        'app/engine/dollhouse-pedagogue-dromological.js::auditDollhouseDromologicalCadence',
        'app/engine/dollhouse-pedagogue-dromological.js::auditDollhouseInstitutionalTime',
        'app/engine/dollhouse-pedagogue-dromological.js::auditDollhouseLineageSecondPass',
        'app/engine/pedagogue-gesture-consequence.js::compilePedagogueGestureConsequenceAudit',
        'app/engine/pedagogue-institutional-time.js::compileInstitutionalTimeAudit',
        'app/engine/pedagogue-institutional-time.js::compileDromologicalSequenceAudit',
        'app/engine/pedagogue-lineage-second-pass.js::compilePedagogueLineageSecondPass'
      ]),
      authority_ceiling: 'recommendation-and-verification-only-human-closure-required'
    }),
    APERTURE: freeze({
      id: 'APERTURE',
      canonical_name: 'TD613 Aperture',
      kind: 'OPERATIONAL_AGENT',
      status: 'INSTALLED',
      role: 'observability-identifiability-reconstruction-conditioning-and-replay-audit',
      incoming_predecessors: freeze(['PEDAGOGUE']),
      outgoing_successors: freeze(['ATLAS']),
      affective_disposition: 'austere-numerical-skepticism-and-metric-calibration',
      native_tools: freeze([
        'run_command',
        'read_file',
        'edit_file',
        'write_file',
        'send_message',
        'ask_question'
      ]),
      invocation: 'APERTURE.md / installed Aperture lane',
      canonical_sources: freeze(['APERTURE.md', 'app/aperture/release.json']),
      audit_extensions: freeze([
        'app/engine/dollhouse-witness-plan.js::auditDollhouseWitnessPlan',
        'app/engine/aperture-v32-typed-epistemic-deficit.js::auditTypedEpistemicDeficit'
      ]),
      authority_ceiling: 'experimental-research-instrument-no-external-reality-or-release-authority'
    }),
    ATLAS: freeze({
      id: 'ATLAS',
      canonical_name: 'Atlas receiver-relation auditor',
      kind: 'OPERATIONAL_AGENT_ADAPTER',
      status: 'BOUNDED_RESEARCH_CANDIDATE',
      role: 'compare-non-equivalent-receiver-projections-against-one-admitted-relation-and-governance-control-plane',
      incoming_predecessors: freeze(['APERTURE']),
      outgoing_successors: freeze(['FADT']),
      affective_disposition: 'relational-loyalty-and-historical-memory',
      native_tools: freeze([
        'run_command',
        'read_file',
        'edit_file',
        'write_file',
        'send_message',
        'ask_question'
      ]),
      invocation: 'ATLAS.md / app/engine/dollhouse-atlas-fadt.js::runAtlasAgent',
      canonical_sources: freeze([
        'ATLAS.md',
        'app/dome-world/holonomy-loom/semantic-field.js',
        'app/dome-world/holonomy-loom/flowcore-aia-motion.js',
        'app/engine/atlas-mathematical-engine.js'
      ]),
      research_lineage_note: 'Atlas research receipts remain separately bound; this adapter does not merge or promote that unmerged estate.',
      audit_extensions: freeze([
        'app/engine/dollhouse-continuity-audit.js::runAtlasContinuityAudit',
        'app/engine/dollhouse-atlas-relational-custody.js::classifyAtlasRelationIdentity',
        'app/engine/dollhouse-atlas-relational-custody.js::auditAtlasHolonomyHistoryParity',
        'app/engine/dollhouse-atlas-relational-custody.js::auditPhasonCustodyDiff',
        'app/engine/atlas-mathematical-engine.js::evaluateTemporalFiberEquivalence',
        'app/engine/atlas-mathematical-engine.js::evaluateParityInvariant',
        'app/engine/atlas-mathematical-engine.js::evaluateGHZReductionAndLocality',
        'app/engine/atlas-mathematical-engine.js::evaluateRankAndConditioning',
        'app/engine/atlas-mathematical-engine.js::evaluateDynamicalMorphism',
        'app/engine/atlas-mathematical-engine.js::evaluateStructuralSignature',
        'app/engine/atlas-mathematical-engine.js::evaluateQuantumVisibilityInverseProblem',
        'app/engine/atlas-mathematical-engine.js::evaluateQuantumMeasurementContexts',
        'app/engine/atlas-mathematical-engine.js::evaluateHarmonicOscillatorSymbolicEquivalence',
        'app/engine/atlas-mathematical-engine.js::dispatchAtlasMathematicalOperation'
      ]),
      authority_ceiling: 'receiver-relation-audit-only-no-basis-free-geometry-no-release-no-lineage-promotion'
    }),
    FADT: freeze({
      id: 'FADT',
      canonical_name: 'Finite Admissibility Descent agent',
      kind: 'OPERATIONAL_AGENT_ADAPTER',
      status: 'BOUNDED_RESEARCH_CANDIDATE',
      role: 'audit-finite-quotient-fibres-for-exact-admissibility-descent-and-preserve-union-intersection-gap',
      incoming_predecessors: freeze(['ATLAS']),
      outgoing_successors: freeze(['TEMPORAL_CUSTODIAN']),
      affective_disposition: 'rigorous-boundary-preservation-and-reparative-finitude',
      native_tools: freeze([
        'run_command',
        'read_file',
        'edit_file',
        'write_file',
        'send_message',
        'ask_question'
      ]),
      invocation: 'FADT.md / app/engine/dollhouse-atlas-fadt.js::runFadtAgent',
      canonical_sources: freeze(['FADT.md', 'PR #752 · Finite Admissibility Descent Theorem']),
      theorem_lineage_note: 'PR #752 remains theorem ancestry; this adapter operationalizes the finite law without granting merge, deployment, or universal-theorem authority.',
      audit_extensions: freeze([
        'app/engine/dollhouse-continuity-audit.js::runFadtStageAudit',
        'app/engine/dollhouse-fadt-reparative-assistance.js::evaluateFadtCoordinateRecovery',
        'app/engine/dollhouse-fadt-reparative-assistance.js::evaluateFadtDiscrepancyIdentity',
        'app/engine/dollhouse-fadt-reparative-assistance.js::compileFadtReparativePacket',
        'app/engine/dollhouse-fadt-reparative-assistance.js::computeFadtFiberBounds'
      ]),
      authority_ceiling: 'finite-support-descent-audit-only-no-universal-ai-law-no-release-no-source-state-reconstruction'
    }),
    TEMPORAL_CUSTODIAN: freeze({
      id: 'TEMPORAL_CUSTODIAN',
      canonical_name: 'TD613 Temporal Custodian',
      kind: 'OPERATIONAL_AGENT_ADAPTER',
      status: 'BOUNDED_RESEARCH_CANDIDATE',
      role: 'independent-temporal-audit-monotonic-chronology-and-attempt-lineage-preservation',
      incoming_predecessors: freeze(['FADT']),
      outgoing_successors: freeze(['ORCHESTRATOR']),
      affective_disposition: 'monotonic-vigilance-and-chronological-integrity',
      native_tools: freeze([
        'run_command',
        'read_file',
        'edit_file',
        'write_file',
        'send_message',
        'ask_question'
      ]),
      invocation: 'app/engine/dollhouse-temporal-custodian.js::runTemporalCustodianAudit',
      canonical_sources: freeze([
        'app/engine/dollhouse-temporal-custodian.js',
        'DOLLHOUSE.md'
      ]),
      audit_extensions: freeze(['app/engine/dollhouse-temporal-custodian.js::runTemporalCustodianAudit']),
      authority_ceiling: 'chronological-and-phase-verification-only-no-clock-synthesis-no-release'
    }),
    ORCHESTRATOR: freeze({
      id: 'ORCHESTRATOR',
      canonical_name: 'TD613 Dollhouse Orchestrator',
      kind: 'OPERATIONAL_AGENT',
      status: 'INSTALLED',
      role: 'multi-role-scientific-governance-evidence-adjudication-and-replication-accounting',
      incoming_predecessors: freeze(['TEMPORAL_CUSTODIAN', 'OPERATOR']),
      outgoing_successors: freeze(['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN']),
      affective_disposition: 'judicial-sobriety-veto-preservation-and-uncollapsible-adjudication',
      native_tools: freeze([
        'run_command',
        'read_file',
        'edit_file',
        'write_file',
        'invoke_subagent',
        'manage_subagents',
        'send_message',
        'ask_question'
      ]),
      invocation: 'DOLLHOUSE.md / app/engine/dollhouse-ablation-harness.js::runOrchestrationDecision',
      canonical_sources: freeze([
        'DOLLHOUSE.md',
        'app/engine/dollhouse-ablation-harness.js',
        'app/engine/dollhouse-case-dossier.js',
        'app/engine/dollhouse-skill-dispatcher.js'
      ]),
      audit_extensions: freeze([
        'app/engine/dollhouse-ablation-harness.js::runOrchestrationDecision',
        'app/engine/dollhouse-ablation-harness.js::normalizeRoleObservations',
        'app/engine/dollhouse-case-dossier.js::createDollhouseCaseDossier',
        'app/engine/dollhouse-skill-dispatcher.js::runDollhouseSkillAudit'
      ]),
      authority_ceiling: 'recommendation-and-verification-only-human-closure-required-zero-release-authority'
    })
  }),
  shared_authority: freeze({
    automatic_release: false,
    automatic_redesign: false,
    merge_authority: false,
    deployment_authority: false,
    vercel_authority: false,
    provider_authority: false,
    human_closure_required: true
  })
});

const CANONICAL_HANDOFF_CONTRACTS = freeze({
  'PEDAGOGUE->APERTURE': freeze({
    contract_id: 'CONTRACT_OF_HUMAN_EPISTEMIC_PACING',
    source_role: 'PEDAGOGUE',
    target_role: 'APERTURE',
    governing_relation: 'Human notice and rest pacing meets observable rank and numerical conditioning',
    canonical_sequence: 'NOTICE < ACT < WORLD_ANSWERS < NAME meets SVD kappa(A) conditioning',
    custody_invariants: freeze(['consequence-before-ontology', 'numerical-conditioning-bound', 'anti-preemption'])
  }),
  'APERTURE->ATLAS': freeze({
    contract_id: 'CONTRACT_OF_PROJECTION_INVARIANCE',
    source_role: 'APERTURE',
    target_role: 'ATLAS',
    governing_relation: 'Observable manifold bounds meet multi-receiver presentation preservation',
    canonical_sequence: 'Singular value and rank bounds meet holonomy history parity and injective serialization',
    custody_invariants: freeze(['observable-rank-deficiency', 'holonomy-history-parity', 'injective-serialization'])
  }),
  'ATLAS->FADT': freeze({
    contract_id: 'CONTRACT_OF_INVARIANT_SUPPORT',
    source_role: 'ATLAS',
    target_role: 'FADT',
    governing_relation: 'Relational coordinates meet finite quotient stage erasure and gap preservation',
    canonical_sequence: 'Preserved receiver relations meet exact descent and union/intersection gap defense',
    custody_invariants: freeze(['receiver-relative-identity', 'union-intersection-gap-preservation', 'unlawful-action-widening-refusal'])
  }),
  'FADT->TEMPORAL_CUSTODIAN': freeze({
    contract_id: 'CONTRACT_OF_REPARATIVE_CHRONOLOGY',
    source_role: 'FADT',
    target_role: 'TEMPORAL_CUSTODIAN',
    governing_relation: 'Bounded coordinate recovery meets monotonic predecessor citation chains',
    canonical_sequence: 'Budget-bounded coordinate repair (<10,000 evals) meets non-retroactive sequence progression',
    custody_invariants: freeze(['bounded-search-limit', 'monotonic-sequence-counting', 'predecessor-citation-integrity'])
  }),
  'TEMPORAL_CUSTODIAN->ORCHESTRATOR': freeze({
    contract_id: 'CONTRACT_OF_UNCOLLAPSIBLE_DISSENT',
    source_role: 'TEMPORAL_CUSTODIAN',
    target_role: 'ORCHESTRATOR',
    governing_relation: 'Certified monotonic chronology and preserved specialist vetoes delivered to adjudication',
    canonical_sequence: 'Verified ledger lineage and domain findings delivered for uncollapsible adjudication',
    custody_invariants: freeze(['uncollapsible-specialist-veto', 'zero-unearned-replication-credit', 'human-closure-required'])
  })
});

export function getDollhouseAgent(id) {
  return DOLLHOUSE_AGENT_REGISTRY.agents[String(id || '').toUpperCase()] || null;
}

export function listDollhouseAgents() {
  return ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'].map(id => DOLLHOUSE_AGENT_REGISTRY.agents[id]);
}

export function listAllDollhouseAgents() {
  return Object.values(DOLLHOUSE_AGENT_REGISTRY.agents);
}

export function getDollhouseRoutingHandoff(fromId, toId) {
  const from = String(fromId || '').toUpperCase().trim();
  const to = String(toId || '').toUpperCase().trim();
  const directKey = `${from}->${to}`;
  if (CANONICAL_HANDOFF_CONTRACTS[directKey]) {
    return CANONICAL_HANDOFF_CONTRACTS[directKey];
  }
  if (from === 'ORCHESTRATOR' && ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'].includes(to)) {
    const targetAgent = DOLLHOUSE_AGENT_REGISTRY.agents[to];
    return freeze({
      contract_id: 'CONTRACT_OF_DISPATCH_AND_ABLATION',
      source_role: 'ORCHESTRATOR',
      target_role: to,
      governing_relation: `Bounded specialist audit dispatch to ${targetAgent.canonical_name}`,
      canonical_sequence: 'Audit inquiry dispatch under missingness invariant and zero unearned replication credit',
      custody_invariants: freeze(['missingness-preserved', 'recommendation-only', 'human-closure-required'])
    });
  }
  return null;
}

export function listDollhouseSubagents() {
  return freeze(['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'].map(id => {
    const agent = DOLLHOUSE_AGENT_REGISTRY.agents[id];
    const subagentName = 'dollhouse-' + id.toLowerCase().replace(/_/g, '-');
    return freeze({
      id,
      name: subagentName,
      subagent_name: subagentName,
      role: agent.role,
      description: agent.canonical_name,
      tools: agent.native_tools
    });
  }));
}
