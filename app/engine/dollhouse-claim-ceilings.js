const freeze = value => Object.freeze(value);

export const CLAIM_CEILING_OBSERVATORY_SCHEMA = 'td613.dollhouse.claim-ceiling-observatory/v0.1';

export const CLAIM_CEILING_STATES = freeze({
  EARNED_BOUNDED: 'EARNED_BOUNDED',
  SPLIT: 'SPLIT',
  HELD: 'HELD'
});

const evidence = (...refs) => freeze(refs.map(ref => freeze(ref)));

export const CLAIM_CEILING_REGISTRY = freeze([
  freeze({
    id: 'provider-internal-enforcement',
    prior_ceiling: 'provider-internal enforcement',
    state: CLAIM_CEILING_STATES.SPLIT,
    earned_coordinate: 'Live provider execution and bounded route-level consequence have been observed in production for named episodes. TD613-controlled admission/enforcement around those returns is implemented and source-bound.',
    current_ceiling: 'Provider-internal enforcement remains unobserved. A provider response that follows a route is not evidence of hidden provider-side policy enforcement or internal state.',
    next_witness: 'Provider-issued or independently auditable enforcement telemetry bound to the exact request and consequence, not self-report alone.',
    evidence: evidence(
      {kind:'PRODUCTION_WITNESS',ref:'docs/receipts/loom-native-20261001-live-witness.md',note:'actual provider return and admitted Phase-2 continuation on the live route'},
      {kind:'SOURCE',ref:'server/loom-demo-custody-client.js',note:'Vercel OIDC-bound custody client'},
      {kind:'SOURCE',ref:'neon/functions/loom-custody/index.mjs',note:'authenticated reserve/commit/release enforcement around the TD613 custody head'}
    )
  }),
  freeze({
    id: 'hidden-retention-training-memory',
    prior_ceiling: 'hidden retention / training / internal memory behavior',
    state: CLAIM_CEILING_STATES.HELD,
    earned_coordinate: 'TD613 can test captured outputs, declared surfaces, replay/substitution, and receiver challenges. Those measurements can rule on the observed episode only.',
    current_ceiling: 'Unobserved provider retention, training, internal memory, and retransmission remain outside the admitted evidence class.',
    next_witness: 'Independent provider-side audit, attestation, or externally verifiable retention/memory measurement carrying information unavailable from the captured return alone.',
    evidence: evidence(
      {kind:'SOURCE',ref:'app/engine/portable-loom-session.js',note:'explicitly preserves captured-output != hidden-host-state ceiling'},
      {kind:'PRODUCT',ref:'Loom Challenge Receiver v0.1',note:'bounded capture/reconstruction probes without promoting hidden state'}
    )
  }),
  freeze({
    id: 'universal-provider-behavior',
    prior_ceiling: 'universal provider behavior',
    state: CLAIM_CEILING_STATES.SPLIT,
    earned_coordinate: 'Named provider/model episodes and current TD613 transport behavior can be observed and compared without treating one episode as global provider law.',
    current_ceiling: 'Finite provider/model observations do not establish universal behavior across models, accounts, regions, time, prompts, or provider revisions.',
    next_witness: 'A preregistered cross-provider/cross-model acquisition program may widen the population claim, but universality still requires an explicit population and sampling theorem.',
    evidence: evidence(
      {kind:'PRODUCTION_WITNESS',ref:'docs/receipts/loom-native-20261001-live-witness.md',note:'one bounded live fictional route'},
      {kind:'SOURCE',ref:'app/dome-world/marrowline.release.json',note:'historical provider-specific observation ledger preserves heterogeneous outcomes'}
    )
  }),
  freeze({
    id: 'authenticated-foreign-ancestry',
    prior_ceiling: 'authenticated foreign ancestry',
    state: CLAIM_CEILING_STATES.SPLIT,
    earned_coordinate: 'TD613-controlled cross-instance stage ancestry is now authenticated: Vercel workload identity reaches Neon custody; the custody service verifies predecessor receipts, reserves a single head, signs admitted receipts, and CAS-binds continuation to the current head.',
    current_ceiling: 'That authenticates the TD613 custody chain, not the foreign provider as origin of the semantic content. Foreign execution/origin and TD613 ancestry remain distinct coordinates.',
    next_witness: 'A foreign-host attestation or independent origin witness cryptographically bound to the returned content and TD613 custody receipt.',
    evidence: evidence(
      {kind:'SOURCE',ref:'neon/functions/loom-custody/index.mjs',note:'Vercel OIDC verification, signed predecessor validation, durable head reservation/commit and fork/replay hold'},
      {kind:'SOURCE',ref:'server/loom-demo-custody-client.js',note:'request-scoped Vercel OIDC and production custody endpoint'},
      {kind:'PR',ref:'#1399',note:'cross-instance predecessor authenticity + durable Neon head tranche merged and post-merge GREEN'},
      {kind:'PR',ref:'#1402',note:'native passage retains authenticated immediate predecessor + Neon OIDC signer/CAS'}
    )
  }),
  freeze({
    id: 'human-comprehension',
    prior_ceiling: 'human comprehension',
    state: CLAIM_CEILING_STATES.SPLIT,
    earned_coordinate: 'Human-operator observations and route feedback exist, and TD613 has repeatedly incorporated operator-reported production findings into repair tranches.',
    current_ceiling: 'Observed use, screenshots, successful task completion, or operator acceptance do not by themselves measure comprehension.',
    next_witness: 'A preregistered human study with task-specific comprehension questions, scoring rule, sample definition, and preserved raw responses.',
    evidence: evidence(
      {kind:'SOURCE',ref:'app/dome-world/marrowline.release.json',note:'humanOperatorObservation ledger records bounded physical production observations'},
      {kind:'DOC',ref:'docs/receipts/loom-native-20261001-dossier.md',note:'separates observed route/use from measured comprehension'}
    )
  }),
  freeze({
    id: 'physical-device-behavior',
    prior_ceiling: 'physical-device behavior',
    state: CLAIM_CEILING_STATES.EARNED_BOUNDED,
    earned_coordinate: 'Physical-iPhone production behavior has been observed repeatedly and preserved in the Marrowline release ledger for named dated episodes, including keyboard, dock, zoom, Zalgo rendering, timing and layout failures.',
    current_ceiling: 'Historical physical-device evidence does not automatically validate every later build, route, iOS revision, device class, keyboard state, or post-repair interaction; exact-current-build physical-device closure remains unearned until a fresh bound episode is observed.',
    next_witness: 'Exact-current-build end-to-end physical-device replay with route, browser/iOS version, viewport, interaction trace, screenshots, and source receipt bound to one episode.',
    evidence: evidence(
      {kind:'SOURCE',ref:'app/dome-world/marrowline.release.json',note:'multiple dated physical-iPhone humanOperatorObservation entries'},
      {kind:'PR',ref:'#1403',note:'narrow live route remains explicitly separate from physical-iPhone proof for the newer candidate'}
    )
  }),
  freeze({
    id: 'empirical-exteriority',
    prior_ceiling: 'empirical exteriority',
    state: CLAIM_CEILING_STATES.SPLIT,
    earned_coordinate: 'Western Horizon crossed its earlier no-new-substrate rest condition in closed, unmerged PR #1003: a live independently hosted 2026 empirical publication was admitted as a materially new exogenous witness, and exact-head CI run 33629043531 passed. PRs #1004 and #1005 then added two further independent empirical provenance witnesses, each exact-head GREEN.',
    current_ceiling: 'The research field is reopened, but empirical exteriority itself remains unearned: recorded external witnesses and provenance observability do not identify the hidden external origin of the exact TD613 admitted artifact or measure I(Ω;X|A) for that target episode.',
    next_witness: 'Bind a genuinely independent, non-derivative witness X to the exact target origin variable and admitted artifact A in one preregistered episode, then measure conditional discriminatory information with I(Ω;X|A)>0 without substituting cross-study provenance evidence for target-origin evidence.',
    evidence: evidence(
      {kind:'UNMERGED_GREEN_PR',ref:'#1003 / run 33629043531',note:'EntroBench live external retrieval satisfied the materially-new-evidentiary-substrate reopening condition'},
      {kind:'UNMERGED_GREEN_PR',ref:'#1004 / run 33630246352',note:'AgentMark added an independent empirical provenance-carrier witness'},
      {kind:'UNMERGED_GREEN_PR',ref:'#1005 / run 33632056113',note:'TTP-Detect added independent receiver-indexed provenance observability'},
      {kind:'UNMERGED_RESEARCH_LAW',ref:'#1007',note:'formal target remains I(Ω;X|A)>0; synthetic positive CMI carries zero empirical target-origin credit'}
    )
  }),
  freeze({
    id: 'golden-egg-realization',
    prior_ceiling: 'Golden Egg realization',
    state: CLAIM_CEILING_STATES.HELD,
    earned_coordinate: 'Several component surfaces and formal feasibility results exist across the archive, but they remain evidence-class separated.',
    current_ceiling: 'No immutable same-episode record currently establishes the five-surface Golden Egg target L, R, J, G, C under the common comparison frame.',
    next_witness: 'One preregistered same-episode acquisition with continuous custody, distinct routes, common frame, and all five measured surfaces before adjudication.',
    evidence: evidence(
      {kind:'DOC',ref:'ATLAS.md',note:'same-episode acquisition contract is not itself an empirical Golden Egg'},
      {kind:'DOC',ref:'DOLLHOUSE.md',note:'empirical Golden Egg credit remains independently governed'}
    )
  })
]);

function roleFinding(role, item) {
  if (role === 'PEDAGOGUE') {
    return freeze({
      role,
      question: 'Does the human-facing statement preserve consequence before ontology?',
      finding: item.state === CLAIM_CEILING_STATES.HELD
        ? 'KEEP_HELD_AND_NAME_THE_MISSING_WITNESS'
        : 'SHOW_EARNED_COORDINATE_BEFORE_THE_HIGHER_CEILING'
    });
  }
  if (role === 'APERTURE') {
    return freeze({
      role,
      question: 'What evidence class supports the claim, and what remains non-identifiable?',
      finding: item.next_witness
    });
  }
  if (role === 'ATLAS') {
    return freeze({
      role,
      question: 'Which relation changed without collapsing receiver, stage, origin or time?',
      finding: item.state === CLAIM_CEILING_STATES.SPLIT
        ? 'PRESERVE_SPLIT_COORDINATES'
        : item.state === CLAIM_CEILING_STATES.EARNED_BOUNDED
          ? 'BOUND_TO_NAMED_EPISODES'
          : 'NO_RELATIONAL_PROMOTION'
    });
  }
  if (role === 'FADT') {
    return freeze({
      role: 'FADT',
      question: 'Would erasing evidence class, episode, provider or stage create a false admissibility collapse?',
      finding: item.state === CLAIM_CEILING_STATES.HELD
        ? 'ERASURE_WOULD_OVERCLAIM'
        : 'LIFT_ONLY_THE_OCCUPIED_BOUNDED_FIBRE'
    });
  }
  return freeze({
    role: 'TEMPORAL_CUSTODIAN',
    question: 'Does later evidence or retrospective reconstruction rewrite prior historical observation, or does local component success mask route regression?',
    finding: item.state === CLAIM_CEILING_STATES.HELD
      ? 'HOLD_HISTORICAL_STATE_AND_FORBID_RETROACTIVE_UPGRADE'
      : item.state === CLAIM_CEILING_STATES.SPLIT
        ? 'PRESERVE_STAGGERED_CHRONOLOGY_WITHOUT_COLLAPSE'
        : 'CONFIRM_HISTORICAL_MONOTONICITY_AND_WHOLE_ROUTE_CONTINUITY'
  });
}

export function auditClaimCeilingRegistry(registry = CLAIM_CEILING_REGISTRY) {
  const roles = ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'];
  return freeze({
    schema: CLAIM_CEILING_OBSERVATORY_SCHEMA,
    role_agreement_is_evidence_multiplication: false,
    release_authority: false,
    entries: registry.map(item => freeze({
      id: item.id,
      state: item.state,
      findings: freeze(roles.map(role => roleFinding(role, item)))
    }))
  });
}

export function claimCeilingSummary(registry = CLAIM_CEILING_REGISTRY) {
  return freeze({
    earned_bounded: registry.filter(item => item.state === CLAIM_CEILING_STATES.EARNED_BOUNDED).map(item => item.id),
    split: registry.filter(item => item.state === CLAIM_CEILING_STATES.SPLIT).map(item => item.id),
    held: registry.filter(item => item.state === CLAIM_CEILING_STATES.HELD).map(item => item.id)
  });
}
