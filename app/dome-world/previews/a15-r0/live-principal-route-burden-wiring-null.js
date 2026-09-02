import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  LOOM_CROWN_ELIGIBILITY_CONCORDANCE_CERTIFICATE as CROWN_PARENT
} from './loom-crown-eligibility-concordance.js';

export const LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_SCHEMA = 'td613.dome-world.live-principal-route-burden-wiring-null/v0.1';
export const LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_PARENT = '1ce357495b8737de991262aebb517aef37699cb5';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = path => fs.readFileSync(path, 'utf8');
const hasAll = (text, needles) => needles.every(needle => text.includes(needle));

const PATHS = freeze({
  live_aia_owner: 'app/dome-world/ash-keep-aia.js',
  route_burden_observatory: 'app/dome-world/route-burden-observatory.js',
  principal_surface_ledger: 'app/dome-world/ash-research-demo-hydration.js',
  a16_entry_handoff: 'app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md',
  a15_release_receipt: 'app/dome-world/docs/ash/closure/ASH_KEEP_A15_PRODUCTION_RELEASE_RELOCK_RECEIPT_V0_1.md'
});

const BURDEN_FUNCTIONS = freeze([
  'compileRouteGraph',
  'computeDeclaredBurden',
  'compareBurdenModels',
  'compileBurdenReceipt'
]);

const LIVE_CANONICAL_CHAIN = freeze([
  'compileAshCustodyPedagogueScene',
  'compileAshLiveActionPlan',
  'compileAshLiveActionReceipt',
  'compileAshLiveRenderReceipt'
]);

const PRINCIPAL_SURFACE_MARKERS = freeze([
  "id:'home_view'",
  "id:'map_view'",
  "id:'work_view'",
  "id:'choir_view'",
  "id:'capsule_view'"
]);

export function runLivePrincipalRouteBurdenWiringNull() {
  if (CROWN_PARENT.status !== 'LOOM_CUSTODIAL_CROWN_ELIGIBILITY_CONCORDANCE_EARNED') {
    return freeze({ status: 'INADMISSIBLE', errors: ['CROWN_ELIGIBILITY_PARENT_REQUIRED'] });
  }

  const liveAia = read(PATHS.live_aia_owner);
  const observatory = read(PATHS.route_burden_observatory);
  const surfaces = read(PATHS.principal_surface_ledger);
  const handoff = read(PATHS.a16_entry_handoff);
  const release = read(PATHS.a15_release_receipt);

  const canonicalLiveChainOwned = hasAll(liveAia, LIVE_CANONICAL_CHAIN);
  const principalSurfaceLedgerPresent = hasAll(surfaces, PRINCIPAL_SURFACE_MARKERS);
  const liveBurdenReferences = BURDEN_FUNCTIONS.filter(name => liveAia.includes(name));
  const observatoryBurdenReferences = BURDEN_FUNCTIONS.filter(name => observatory.includes(name));
  const observatoryHasFullBurdenChain = observatoryBurdenReferences.length === BURDEN_FUNCTIONS.length;
  const directObservatoryCoupling = liveAia.includes('route-burden-observatory');
  const a16HandoffNamesLiveBurdenDebt = /route-burden mathematics exist but are not yet proven to compile live principal journeys/i.test(handoff);
  const operatorReviewRequired = /operator review recorded = required/i.test(handoff) && /A16 start before review = forbidden/i.test(handoff);
  const operatorReviewOpen = /operator visual review\s*=\s*OPEN/i.test(release);

  const wiringNullLocalized = Boolean(
    canonicalLiveChainOwned &&
    principalSurfaceLedgerPresent &&
    observatoryHasFullBurdenChain &&
    liveBurdenReferences.length === 0 &&
    directObservatoryCoupling === false &&
    a16HandoffNamesLiveBurdenDebt &&
    operatorReviewRequired &&
    operatorReviewOpen
  );

  const subject = {
    exact_parent: LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_PARENT,
    live_canonical_chain: LIVE_CANONICAL_CHAIN,
    principal_surface_markers: PRINCIPAL_SURFACE_MARKERS,
    live_burden_references: liveBurdenReferences,
    observatory_burden_references: observatoryBurdenReferences,
    operator_review_open: operatorReviewOpen,
    crown_parent_digest: CROWN_PARENT.concordance_digest
  };

  return freeze({
    schema: LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_SCHEMA,
    exact_parent: LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_PARENT,
    status: wiringNullLocalized ? 'LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_LOCALIZED' : 'INADMISSIBLE',
    errors: wiringNullLocalized ? [] : ['LIVE_ROUTE_BURDEN_WIRING_NULL_NOT_ESTABLISHED'],
    rest_symbol: wiringNullLocalized ? '𝄐' : null,
    wiring_null_digest: digest(subject),
    source_class: 'CURRENT_REPOSITORY_LIVE_OWNER_CALL_GRAPH_AUDIT',
    canonical_live_scene_action_render_chain_owned: canonicalLiveChainOwned,
    canonical_live_chain_functions: [...LIVE_CANONICAL_CHAIN],
    principal_surface_ledger_present: principalSurfaceLedgerPresent,
    principal_surface_markers: [...PRINCIPAL_SURFACE_MARKERS],
    separate_route_burden_observatory_has_full_chain: observatoryHasFullBurdenChain,
    route_burden_function_set: [...BURDEN_FUNCTIONS],
    live_aia_route_burden_function_references: liveBurdenReferences,
    observatory_route_burden_function_references: observatoryBurdenReferences,
    direct_live_route_burden_wiring_observed: liveBurdenReferences.length > 0,
    direct_live_observatory_coupling_observed: directObservatoryCoupling,
    a16_handoff_live_route_burden_debt_preserved: a16HandoffNamesLiveBurdenDebt,
    operator_review_required_before_a16: operatorReviewRequired,
    operator_review_recorded: !operatorReviewOpen,
    operator_review_gate_state: operatorReviewOpen ? 'OPEN' : 'NOT_OPEN',
    pre_a16_wiring_debt_localized: wiringNullLocalized,
    synthetic_crown_concordance_parent_preserved: true,
    crown_eligibility_preserved: true,
    crown_authority: false,
    live_loom_crowned: false,
    a16_live_principal_journey_observed: false,
    a16_live_route_burden_compilation_earned: false,
    a16_readmission_earned: false,
    a16_implementation_authority: false,
    a16_product_mutation_authority: false,
    a19_whole_program_closure_earned: false,
    empirical_interaction_evidence_acquired: false,
    exact_golden_egg_surfaces_added: freeze([]),
    empirical_credit_to_golden_egg: 0,
    golden_egg_earned: false,
    sequence_authority: false,
    merge_authority: false,
    production_authority: false,
    deployment_authority: false,
    publication_authority: false,
    laws: freeze({
      synthetic_concordance_not_live_wiring: true,
      canonical_live_scene_chain_not_route_burden_chain: true,
      separate_observatory_not_principal_journey_compilation: true,
      wiring_null_localization_not_a16_repair: true,
      operator_review_gate_not_satisfied_by_static_audit: true,
      route_burden_compilation_not_interaction_evidence: true,
      crown_eligibility_not_crown_authority: true,
      live_wiring_null_not_golden_egg_measurement: true
    }),
    theorem: 'THE_CURRENT_LIVE_ASH_AIA_OWNER_CANONICALLY_COMPILES_PEDAGOGUE_SCENE_ACTION_AND_RENDER_RECEIPT_SURFACES_WHILE_THE_FLOWCORE_ROUTE_BURDEN_CHAIN_REMAINS_SEPARATE_IN_ITS_OBSERVATORY; THEREFORE_THE_EARNED_SYNTHETIC_CROWN_CONCORDANCE_CANNOT_BE_PROMOTED_TO_A16_LIVE_PRINCIPAL_ROUTE_BURDEN_COMPILATION_AND_THE_PRE_A16_WIRING_DEBT_IS_NOW_EXACTLY_LOCALIZED',
    child_message: 'THE LIVE ASH BODY HAS ITS CANONICAL THREAD. THE BURDEN SCALE STILL SITS IN THE OBSERVATORY NEXT DOOR.'
  });
}

export const LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_CERTIFICATE = runLivePrincipalRouteBurdenWiringNull();
