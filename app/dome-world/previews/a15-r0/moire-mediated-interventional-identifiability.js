export const MOIRE_MEDIATED_IDENTIFIABILITY_SCHEMA =
  'td613.dome-world.moire-mediated-interventional-identifiability/v0.1';

export const LAYER_A = Object.freeze([2, -1, 1]);
export const LAYER_B = Object.freeze([-1, 2, 1]);
export const MEDIATOR_VECTOR = Object.freeze([1, -1, 2]);
export const MORPHOLOGY_NUISANCE_VECTOR = Object.freeze([1, 1, -1]);
export const BOUNDED_SIGMA_MIN = -7;
export const BOUNDED_SIGMA_MAX = 7;

export const PROCESS_IDS = Object.freeze({
  OVERLAY_NUISANCE: 'H0_OVERLAY_NUISANCE',
  MEDIATED: 'H1_MEDIATED',
});

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function assertVector(vector, label) {
  if (!Array.isArray(vector) || vector.length !== 3 || !vector.every(Number.isInteger)) {
    throw new Error(`${label} must be an integer vector of length 3`);
  }
}

function assertConfiguration(g) {
  if (g !== -1 && g !== 1) throw new Error('global configuration g must be -1 or +1');
}

function assertRegistry(r) {
  if (r !== -1 && r !== 1) throw new Error('local registry r must be -1 or +1');
}

function assertSigma(sigma) {
  if (!Number.isInteger(sigma)) throw new Error('sigma must be an integer');
}

function add(left, right) {
  assertVector(left, 'left vector');
  assertVector(right, 'right vector');
  return left.map((value, index) => value + right[index]);
}

function subtract(left, right) {
  assertVector(left, 'left vector');
  assertVector(right, 'right vector');
  return left.map((value, index) => value - right[index]);
}

function scale(scalar, vector) {
  if (!Number.isInteger(scalar)) throw new Error('scale must be integer');
  assertVector(vector, 'scaled vector');
  return vector.map(value => scalar * value);
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function directOverlay() {
  return freeze(add(LAYER_A, LAYER_B));
}

export function observeSyntheticProcess(
  processId,
  { g = 1, mediatorPresent = true } = {},
) {
  assertConfiguration(g);
  if (typeof mediatorPresent !== 'boolean') throw new Error('mediatorPresent must be boolean');
  if (!Object.values(PROCESS_IDS).includes(processId)) throw new Error(`unknown process: ${processId}`);

  const base = directOverlay();
  const interaction = scale(g, MEDIATOR_VECTOR);
  const output = processId === PROCESS_IDS.OVERLAY_NUISANCE
    ? add(base, interaction)
    : add(base, mediatorPresent ? interaction : [0, 0, 0]);

  return freeze({
    schema: MOIRE_MEDIATED_IDENTIFIABILITY_SCHEMA,
    process_id: processId,
    global_configuration: g,
    mediator_present: mediatorPresent,
    output: freeze(output),
    authority: freeze({
      physical_moire: false,
      external_causation: false,
      production: false,
      release: false,
    }),
  });
}

export function pairInteractionResidue(output) {
  assertVector(output, 'process output');
  return freeze(subtract(subtract(output, LAYER_A), LAYER_B));
}

export function registryScore4(r, { g = 1, mediatorPresent = true, sigma = 0 } = {}) {
  assertRegistry(r);
  assertConfiguration(g);
  assertSigma(sigma);
  if (typeof mediatorPresent !== 'boolean') throw new Error('mediatorPresent must be boolean');
  if (!mediatorPresent) return 0;
  return 4 * ((r - g) ** 2) + sigma * r;
}

export function selectLocalRegistry({ g = 1, mediatorPresent = true, sigma = 0 } = {}) {
  assertConfiguration(g);
  assertSigma(sigma);
  if (typeof mediatorPresent !== 'boolean') throw new Error('mediatorPresent must be boolean');

  const candidates = [-1, 1].map(r => freeze({
    registry: r,
    score4: registryScore4(r, { g, mediatorPresent, sigma }),
  }));
  const minimum = Math.min(...candidates.map(row => row.score4));
  const winners = candidates.filter(row => row.score4 === minimum).map(row => row.registry);
  return freeze({
    global_configuration: g,
    mediator_present: mediatorPresent,
    sigma,
    candidates: freeze(candidates),
    unique: winners.length === 1,
    selected_registry: winners.length === 1 ? winners[0] : null,
    state: winners.length === 1 ? 'UNIQUE' : 'AMBIGUOUS',
  });
}

export function morphology(output, sigma = 0) {
  assertVector(output, 'process output');
  assertSigma(sigma);
  return freeze(add(output, scale(sigma, MORPHOLOGY_NUISANCE_VECTOR)));
}

export function buildMediatedIdentifiabilityCertificate() {
  const passive = [];
  const interventions = [];
  let passiveEquivalent = true;
  let passiveResiduesEquivalent = true;
  let mediatorAblationSeparates = true;
  let mediatedAblationClearsResidue = true;
  let nuisanceModelIgnoresMediatorSwitch = true;

  for (const g of [-1, 1]) {
    const h0Passive = observeSyntheticProcess(PROCESS_IDS.OVERLAY_NUISANCE, { g, mediatorPresent: true });
    const h1Passive = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: true });
    const h0Ablated = observeSyntheticProcess(PROCESS_IDS.OVERLAY_NUISANCE, { g, mediatorPresent: false });
    const h1Ablated = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: false });

    const h0PassiveResidue = pairInteractionResidue(h0Passive.output);
    const h1PassiveResidue = pairInteractionResidue(h1Passive.output);
    const h0AblatedResidue = pairInteractionResidue(h0Ablated.output);
    const h1AblatedResidue = pairInteractionResidue(h1Ablated.output);

    passiveEquivalent = passiveEquivalent && same(h0Passive.output, h1Passive.output);
    passiveResiduesEquivalent = passiveResiduesEquivalent && same(h0PassiveResidue, h1PassiveResidue);
    mediatorAblationSeparates = mediatorAblationSeparates && !same(h0Ablated.output, h1Ablated.output);
    mediatedAblationClearsResidue = mediatedAblationClearsResidue
      && same(h1AblatedResidue, [0, 0, 0]);
    nuisanceModelIgnoresMediatorSwitch = nuisanceModelIgnoresMediatorSwitch
      && same(h0Passive.output, h0Ablated.output)
      && same(h0PassiveResidue, h0AblatedResidue);

    passive.push(freeze({
      g,
      h0_output: h0Passive.output,
      h1_output: h1Passive.output,
      h0_pair_residue: h0PassiveResidue,
      h1_pair_residue: h1PassiveResidue,
      observationally_equivalent: same(h0Passive.output, h1Passive.output),
      pair_residue_equivalent: same(h0PassiveResidue, h1PassiveResidue),
    }));

    interventions.push(freeze({
      g,
      intervention: 'do(mediator_present=0)',
      h0_output: h0Ablated.output,
      h1_output: h1Ablated.output,
      h0_pair_residue: h0AblatedResidue,
      h1_pair_residue: h1AblatedResidue,
      process_separated: !same(h0Ablated.output, h1Ablated.output),
    }));
  }

  const boundedRegistry = [];
  let boundedRegistryStable = true;
  let absentMediatorAmbiguous = true;
  let morphologyChangesWithoutRegistryChange = true;
  let boundedCount = 0;

  for (const g of [-1, 1]) {
    const passiveOutput = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: true }).output;
    const baselineMorphology = morphology(passiveOutput, 0);
    for (let sigma = BOUNDED_SIGMA_MIN; sigma <= BOUNDED_SIGMA_MAX; sigma += 1) {
      const mediatedRegistry = selectLocalRegistry({ g, mediatorPresent: true, sigma });
      const absentRegistry = selectLocalRegistry({ g, mediatorPresent: false, sigma });
      const changedMorphology = morphology(passiveOutput, sigma);
      boundedCount += 1;
      boundedRegistryStable = boundedRegistryStable
        && mediatedRegistry.unique
        && mediatedRegistry.selected_registry === g;
      absentMediatorAmbiguous = absentMediatorAmbiguous
        && !absentRegistry.unique
        && absentRegistry.state === 'AMBIGUOUS';
      if (sigma !== 0) {
        morphologyChangesWithoutRegistryChange = morphologyChangesWithoutRegistryChange
          && !same(changedMorphology, baselineMorphology)
          && mediatedRegistry.selected_registry === g;
      }
      boundedRegistry.push(freeze({
        g,
        sigma,
        selected_registry: mediatedRegistry.selected_registry,
        mediator_absent_state: absentRegistry.state,
        morphology: changedMorphology,
      }));
    }
  }

  const hostilePositive = selectLocalRegistry({ g: 1, mediatorPresent: true, sigma: 9 });
  const hostileNegative = selectLocalRegistry({ g: -1, mediatorPresent: true, sigma: -9 });
  const hostileBreaksUniversalInvariance = hostilePositive.selected_registry === -1
    && hostileNegative.selected_registry === 1;

  const passed = passiveEquivalent
    && passiveResiduesEquivalent
    && mediatorAblationSeparates
    && mediatedAblationClearsResidue
    && nuisanceModelIgnoresMediatorSwitch
    && boundedRegistryStable
    && absentMediatorAmbiguous
    && morphologyChangesWithoutRegistryChange
    && hostileBreaksUniversalInvariance
    && boundedCount === 30;

  return freeze({
    schema: MOIRE_MEDIATED_IDENTIFIABILITY_SCHEMA,
    source_provenance: freeze({
      external_source: 'arXiv:2607.02822',
      imported_structures: freeze([
        'declared mediator coupling',
        'global configuration to local relation selection',
        'relation persistence under bounded perturbation',
      ]),
      prepublication_td613_possession_claim: false,
    }),
    passive: freeze(passive),
    interventions: freeze(interventions),
    passive_observational_equivalence: passiveEquivalent,
    passive_pair_residue_equivalence: passiveResiduesEquivalent,
    mediator_ablation_separates_processes: mediatorAblationSeparates,
    mediated_ablation_clears_declared_interaction_residue: mediatedAblationClearsResidue,
    nuisance_model_unaffected_by_mediator_switch: nuisanceModelIgnoresMediatorSwitch,
    bounded_sigma_window: freeze([BOUNDED_SIGMA_MIN, BOUNDED_SIGMA_MAX]),
    bounded_registry_cases: boundedCount,
    bounded_registry_stable: boundedRegistryStable,
    absent_mediator_registry_ambiguous: absentMediatorAmbiguous,
    morphology_changes_without_registry_change: morphologyChangesWithoutRegistryChange,
    bounded_registry: freeze(boundedRegistry),
    hostile_out_of_window: freeze({
      positive: hostilePositive,
      negative: hostileNegative,
      breaks_universal_invariance: hostileBreaksUniversalInvariance,
    }),
    exact_integer_arithmetic: true,
    passed,
    classification: passed
      ? 'CONTROLLED_MEDIATOR_ABLATION_BREAKS_PASSIVE_PROCESS_EQUIVALENCE_WHILE_PASSIVE_PAIR_RESIDUE_ALONE_REMAINS_NONIDENTIFYING_IN_THE_DECLARED_SYNTHETIC_FIXTURE'
      : 'MEDIATOR_DEPENDENT_PROCESS_IDENTIFIABILITY_NOT_ESTABLISHED',
    relation_classification: passed
      ? 'GLOBAL_CONFIGURATION_SELECTS_A_BOUNDED_PERTURBATION_STABLE_LOCAL_RELATION_CLASS_ONLY_WHEN_THE_DECLARED_MEDIATOR_IS_PRESENT_IN_THE_SYNTHETIC_FIXTURE'
      : 'BOUNDED_GLOBAL_TO_LOCAL_RELATION_SELECTION_NOT_ESTABLISHED',
    authority: freeze({
      physical_moire: false,
      external_causation: false,
      universal_identifiability: false,
      publication_priority: false,
      knowledge_transfer: false,
      release: false,
      production: false,
    }),
    scars: freeze([
      'SYNTHETIC_MEDIATOR_ABLATION != REAL_WORLD_CAUSAL_INTERVENTION',
      'PAIR_RESIDUE != MEDIATOR_CAUSATION',
      'GLOBAL_PARAMETER_TO_LOCAL_ARGMIN != PHYSICAL_STACKING_REGISTRY',
      'NUISANCE_SIGMA != MATERIAL_STRAIN',
      'MORPHOLOGY_VECTOR != PHYSICAL_DOMAIN_MORPHOLOGY',
      'SOURCE_A_DERIVED_REPAIR != TD613_PREPUBLICATION_POSSESSION',
      'BOUNDED_SYNTHETIC_IDENTIFIABILITY != UNIVERSAL_IDENTIFIABILITY',
    ]),
  });
}
