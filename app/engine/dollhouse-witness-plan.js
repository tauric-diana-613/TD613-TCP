/**
 * A declaration-only Aperture companion: audit a bounded witness/falsifier plan.
 * This adapter performs no observations, authenticates no artifacts, and does
 * not alter the installed Aperture release or its numerical deficit audit.
 */
export const DOLLHOUSE_WITNESS_PLAN_SCHEMA = 'td613.dollhouse.witness-plan/v0.1';
export const DOLLHOUSE_WITNESS_PLAN_RECEIPT_SCHEMA = 'td613.dollhouse.witness-plan-receipt/v0.1';

export const DOLLHOUSE_WITNESS_CLAIM_CLASSES = Object.freeze([
  'FINITE_LITERAL_EXCLUSION',
  'SIGNED_PREDECESSOR_CONTINUITY',
  'SCOPED_BEHAVIOR',
  'SCOPED_POLICY_ENFORCEMENT',
  'EMPIRICAL_EPISODE_OBSERVATION'
]);

export const DOLLHOUSE_WITNESS_EVIDENCE_CLASSES = Object.freeze([
  'DECLARATION', 'OFFLINE_TEST', 'BROWSER_WITNESS',
  'PROVIDER_RESPONSE', 'EMPIRICAL_ACQUISITION'
]);

const ceilings = Object.freeze({
  DECLARATION: 'A stated plan or assertion supplies no independently observed behavior.',
  OFFLINE_TEST: 'A finite offline fixture witnesses only its tested inputs and harness; live behavior and external origin remain unmeasured.',
  BROWSER_WITNESS: 'A declared browser observation covers the inspected surface and actions; provider semantics and external origin require their own evidence.',
  PROVIDER_RESPONSE: 'Returned provider text supplies a response sample; policy enforcement and empirical external origin remain separate claims.',
  EMPIRICAL_ACQUISITION: 'An empirical acquisition reference requires independent qualification of episode, instrument, custody and comparison frame; this plan authenticates none of them.'
});

const imposedAlternatives = Object.freeze({
  FINITE_LITERAL_EXCLUSION: Object.freeze([
    'UNIVERSAL_SECRECY_UNRESOLVED', 'UNTESTED_ENCODING_OR_PROJECTION_LEAKAGE_UNRESOLVED'
  ]),
  SIGNED_PREDECESSOR_CONTINUITY: Object.freeze([
    'GLOBAL_LATEST_STATE_UNRESOLVED', 'REPLAY_RESISTANCE_UNRESOLVED',
    'SIGNER_AND_SOURCE_AUTHENTICITY_UNVERIFIED'
  ]),
  SCOPED_BEHAVIOR: Object.freeze(['UNOBSERVED_CONTEXT_BEHAVIOR_UNRESOLVED']),
  SCOPED_POLICY_ENFORCEMENT: Object.freeze([
    'UNTESTED_POLICY_OR_PATH_ENFORCEMENT_UNRESOLVED', 'PROVIDER_ACKNOWLEDGMENT_ALONE_INSUFFICIENT'
  ]),
  EMPIRICAL_EPISODE_OBSERVATION: Object.freeze([
    'EXTERNAL_ORIGIN_UNVERIFIED', 'EPISODE_AND_CUSTODY_QUALIFICATION_UNVERIFIED'
  ])
});

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

// Clone descriptor values rather than reading properties: a declaration may
// never run an accessor, accept hidden authority, or import executable objects.
function declarativeClone(value, budget = { nodes: 0, characters: 0 }, depth = 0) {
  if (++budget.nodes > 4096 || depth > 16) throw new TypeError('Declaration exceeds structural bounds.');
  if (typeof value === 'string') {
    budget.characters += value.length;
    if (value.length > 4000 || budget.characters > 64000) throw new TypeError('Declaration exceeds text bounds.');
    return value;
  }
  if (value === null || typeof value === 'boolean') return value;
  if (!value || typeof value !== 'object') throw new TypeError('Declaration contains unsupported data.');
  const array = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Declaration requires plain objects and arrays.');
  }
  const keys = Reflect.ownKeys(value);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (array) {
    const length = descriptors.length?.value;
    if (!Number.isInteger(length) || length < 0 || length > 64 || keys.length !== length + 1) {
      throw new TypeError('Declaration array is sparse, extended, or oversized.');
    }
    const copy = [];
    for (let index = 0; index < length; index += 1) {
      const descriptor = descriptors[String(index)];
      if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
        throw new TypeError('Declaration contains an accessor, sparse entry, or hidden data.');
      }
      copy.push(declarativeClone(descriptor.value, budget, depth + 1));
    }
    return copy;
  }
  const copy = Object.create(null);
  for (const key of keys) {
    const descriptor = descriptors[key];
    if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError('Declaration contains an accessor, symbol, or hidden data.');
    }
    copy[key] = declarativeClone(descriptor.value, budget, depth + 1);
  }
  return copy;
}

function exact(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new TypeError(`${label} requires exactly its declared fields.`);
  }
}

function text(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} must be a nonempty string.`);
}

function strings(values, label, { nonempty = false } = {}) {
  if (!Array.isArray(values) || (nonempty && values.length === 0)) throw new TypeError(`${label} must be a declared array.`);
  values.forEach((value, index) => text(value, `${label}[${index}]`));
  if (new Set(values).size !== values.length) throw new TypeError(`${label} contains duplicate entries.`);
}

function scope(value, label) {
  exact(value, ['description', 'objects', 'bounded'], label);
  text(value.description, `${label}.description`);
  strings(value.objects, `${label}.objects`, { nonempty: true });
  if (value.bounded !== true) throw new TypeError(`${label} must retain an explicit bounded scope.`);
}

function instrument(value, label) {
  exact(value, ['id', 'description'], label);
  text(value.id, `${label}.id`);
  text(value.description, `${label}.description`);
}

function evidenceClass(value, label) {
  if (!DOLLHOUSE_WITNESS_EVIDENCE_CLASSES.includes(value)) throw new TypeError(`${label} is unsupported.`);
}

function witness(value, label) {
  exact(value, ['description', 'artifact_refs'], label);
  text(value.description, `${label}.description`);
  strings(value.artifact_refs, `${label}.artifact_refs`);
}

function validateClaim(claim, index) {
  const label = `claims[${index}]`;
  exact(claim, [
    'id', 'claim_class', 'statement', 'extent', 'observation_scope', 'instrument',
    'evidence_class', 'positive_witness', 'hostile_counterexample',
    'unresolved_alternatives', 'required_next_observation'
  ], label);
  text(claim.id, `${label}.id`);
  text(claim.statement, `${label}.statement`);
  if (!DOLLHOUSE_WITNESS_CLAIM_CLASSES.includes(claim.claim_class)) throw new TypeError(`${label}.claim_class is unsupported.`);
  if (claim.extent !== 'DECLARED_SCOPE_ONLY') throw new TypeError(`${label}.extent may not widen the declared claim authority.`);
  scope(claim.observation_scope, `${label}.observation_scope`);
  instrument(claim.instrument, `${label}.instrument`);
  evidenceClass(claim.evidence_class, `${label}.evidence_class`);
  witness(claim.positive_witness, `${label}.positive_witness`);
  witness(claim.hostile_counterexample, `${label}.hostile_counterexample`);
  strings(claim.unresolved_alternatives, `${label}.unresolved_alternatives`);
  const next = claim.required_next_observation;
  if (next === null) return;
  exact(next, [
    'description', 'observation_scope', 'instrument', 'evidence_class',
    'distinguishes', 'execution', 'authority'
  ], `${label}.required_next_observation`);
  text(next.description, `${label}.required_next_observation.description`);
  scope(next.observation_scope, `${label}.required_next_observation.observation_scope`);
  instrument(next.instrument, `${label}.required_next_observation.instrument`);
  evidenceClass(next.evidence_class, `${label}.required_next_observation.evidence_class`);
  strings(next.distinguishes, `${label}.required_next_observation.distinguishes`, { nonempty: true });
  if (next.distinguishes.some(alternative => !claim.unresolved_alternatives.includes(alternative))) {
    throw new TypeError(`${label}.required_next_observation must target explicitly declared alternatives.`);
  }
  if (next.execution !== false || next.authority !== 'HUMAN_APPROVAL_REQUIRED') {
    throw new TypeError(`${label}.required_next_observation may not grant execution authority.`);
  }
}

function authority() {
  return {
    execution: false,
    automatic_observation: false,
    automatic_experiment_execution: false,
    provider_authority: false,
    release_authority: false,
    production_mutation: false,
    promotion_authority: false,
    human_closure_required: true
  };
}

function auditClaim(claim) {
  const next = claim.required_next_observation;
  const sparseWitness = !claim.positive_witness.artifact_refs.length || !claim.hostile_counterexample.artifact_refs.length;
  let disposition;
  let basis;
  if (next !== null) {
    disposition = 'PROPOSE';
    basis = ['DECLARED_DISCRIMINATING_OBSERVATION_REQUIRES_SEPARATE_HUMAN_APPROVAL'];
  } else if (claim.unresolved_alternatives.length || sparseWitness) {
    disposition = 'ABSTAIN';
    basis = [claim.unresolved_alternatives.length ? 'DECLARED_ALTERNATIVES_HAVE_NO_NEXT_OBSERVATION' : 'WITNESS_OR_COUNTEREXAMPLE_REFERENCES_MISSING'];
  } else {
    disposition = 'ASK_NOTHING';
    basis = ['NO_DECLARED_NEXT_QUESTION_IN_THIS_BOUNDED_PLAN', 'PLAN_COMPLETENESS_IS_NOT_CLAIM_VERIFICATION'];
  }
  return {
    claim_id: claim.id,
    claim_class: claim.claim_class,
    disposition,
    basis,
    declaration: claim,
    evidence_class: claim.evidence_class,
    evidence_ceiling: ceilings[claim.evidence_class],
    next_evidence_ceiling: next === null ? null : ceilings[next.evidence_class],
    declared_target_alternatives: [...claim.unresolved_alternatives],
    unresolved_beyond_claim_scope: [...imposedAlternatives[claim.claim_class]],
    observation_performed: false,
    artifact_references_authenticated: false,
    claim_verified: false,
    authority: authority()
  };
}

/**
 * Strictly audit declared plans, never supplied evidence truth. Dispositions
 * concern the plan's bounded readiness only; even ASK_NOTHING earns no proof.
 * Malformed, executable, unsupported or authority-widened inputs return REJECT.
 */
export function auditDollhouseWitnessPlan(input) {
  let plan;
  try {
    plan = declarativeClone(input);
    exact(plan, ['schema', 'source_revision', 'execution', 'claims'], 'plan');
    if (plan.schema !== DOLLHOUSE_WITNESS_PLAN_SCHEMA) throw new TypeError('Unsupported witness-plan schema.');
    text(plan.source_revision, 'plan.source_revision');
    if (plan.execution !== false) throw new TypeError('Witness plan may not grant execution authority.');
    if (!Array.isArray(plan.claims) || plan.claims.length === 0) throw new TypeError('Witness plan requires at least one declared claim.');
    plan.claims.forEach(validateClaim);
    if (new Set(plan.claims.map(claim => claim.id)).size !== plan.claims.length) throw new TypeError('Witness claim identifiers must be unique.');
  } catch (error) {
    return freeze({
      schema: DOLLHOUSE_WITNESS_PLAN_RECEIPT_SCHEMA,
      agent: 'APERTURE', adapter_status: 'BOUNDED_EXTERNAL_AUDIT',
      disposition: 'REJECT', basis: [error.message], claims: [],
      source_status: 'UNADMITTED_DECLARATION',
      source_revision_authenticated: false,
      installed_aperture_identity_changed: false,
      claim_verified: false, authority: authority()
    });
  }
  const claims = plan.claims.map(auditClaim);
  // Precedence reports required attention; it is not a score or a role vote.
  const disposition = claims.some(claim => claim.disposition === 'ABSTAIN') ? 'ABSTAIN'
    : claims.some(claim => claim.disposition === 'PROPOSE') ? 'PROPOSE' : 'ASK_NOTHING';
  return freeze({
    schema: DOLLHOUSE_WITNESS_PLAN_RECEIPT_SCHEMA,
    agent: 'APERTURE', adapter_status: 'BOUNDED_EXTERNAL_AUDIT',
    disposition,
    basis: ['DERIVED_FROM_DECLARED_PLAN_ONLY', 'PER_CLAIM_FINDINGS_RETAINED_WITHOUT_EVIDENCE_CLASS_PROMOTION'],
    source_revision: plan.source_revision,
    source_status: 'OPERATOR_DECLARED_UNAUTHENTICATED',
    source_revision_authenticated: false,
    installed_aperture_identity_changed: false,
    claim_verified: false,
    claims, authority: authority()
  });
}
