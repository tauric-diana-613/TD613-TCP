import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, noForbidden, object, strings, text } from './flowcore-pedagogue-utils.js';
import { PEDAGOGUE_RESEARCH_REFINEMENT_EPISTEMIC_KINDS } from './pedagogue-research-mechanism-refinement.js';

export const PEDAGOGUE_RESEARCH_CRITERION_FAMILY_SCHEMA = 'td613.flowcore.pedagogue-research-criterion-family/v0.1';
export const PEDAGOGUE_RESEARCH_CRITERION_ROLES = Object.freeze([
  'POPULATION_EQUIVALENCE',
  'FINITE_BUDGET_DECISION',
  'FORMAL_DIAGNOSTIC',
  'EMPIRICAL_VALIDATION'
]);

const ID_RE = /^[A-Z][A-Z0-9_]{2,159}$/;
const ROLE_KIND_RULES = Object.freeze({
  POPULATION_EQUIVALENCE: new Set(['OPERATIONAL_CRITERION']),
  FINITE_BUDGET_DECISION: new Set(['OPERATIONAL_CRITERION']),
  FORMAL_DIAGNOSTIC: new Set(['FORMAL_IDENTITY']),
  EMPIRICAL_VALIDATION: new Set(['DESIGN_HEURISTIC', 'EMPIRICAL_RELATION'])
});

function id(value, label) {
  const out = text(value, label).toUpperCase();
  if (!ID_RE.test(out)) throw new Error(`${label} must be an uppercase generic identifier.`);
  return out;
}

function uniqueStrings(values, label, min = 0) {
  const source = Array.isArray(values) ? values : null;
  if (!source || source.length < min || source.some(value => typeof value !== 'string' || !value.length)) {
    throw new TypeError(`${label} must contain at least ${min} non-empty string(s).`);
  }
  if (new Set(source).size !== source.length) throw new Error(`${label} values must be unique.`);
  return freeze([...source]);
}

function compileMember(input, index) {
  const member = object(input, `members[${index}]`);
  const criterion_id = id(member.criterion_id, `members[${index}].criterion_id`);
  const role = id(member.role, `members[${index}].role`);
  if (!PEDAGOGUE_RESEARCH_CRITERION_ROLES.includes(role)) {
    throw new Error(`Unsupported Pedagogue criterion-family role: ${role}`);
  }

  const epistemic_kind = id(member.epistemic_kind, `members[${index}].epistemic_kind`);
  if (!PEDAGOGUE_RESEARCH_REFINEMENT_EPISTEMIC_KINDS.includes(epistemic_kind)) {
    throw new Error(`Unsupported Pedagogue criterion epistemic kind: ${epistemic_kind}`);
  }
  if (!ROLE_KIND_RULES[role].has(epistemic_kind)) {
    throw new Error(`${role} may not be compiled as ${epistemic_kind}.`);
  }

  const required_parameters = uniqueStrings(member.required_parameters, `members[${index}].required_parameters`, role === 'FORMAL_DIAGNOSTIC' ? 0 : 1);
  const required_assumptions = uniqueStrings(member.required_assumptions, `members[${index}].required_assumptions`, 1);
  const forbidden_inferences = uniqueStrings(member.forbidden_inferences, `members[${index}].forbidden_inferences`, 1);

  return freeze({
    criterion_id,
    role,
    epistemic_kind,
    question_answered: text(member.question_answered, `members[${index}].question_answered`),
    formal_scope: text(member.formal_scope, `members[${index}].formal_scope`),
    required_assumptions,
    required_parameters,
    criterion_statement: text(member.criterion_statement, `members[${index}].criterion_statement`),
    success_language: text(member.success_language, `members[${index}].success_language`),
    failure_language: text(member.failure_language, `members[${index}].failure_language`),
    forbidden_inferences,
    next_validation: text(member.next_validation, `members[${index}].next_validation`)
  });
}

export function compilePedagogueResearchCriterionFamily(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const membersInput = value.members;
  if (!Array.isArray(membersInput) || membersInput.length < 4) {
    throw new Error('A governed research criterion family requires at least four members.');
  }

  const members = membersInput.map(compileMember);
  const criterionIds = members.map(member => member.criterion_id);
  if (new Set(criterionIds).size !== criterionIds.length) throw new Error('Criterion identifiers must be unique inside a family.');

  const presentRoles = new Set(members.map(member => member.role));
  for (const role of PEDAGOGUE_RESEARCH_CRITERION_ROLES) {
    if (!presentRoles.has(role)) throw new Error(`Criterion family is missing required role ${role}.`);
  }

  const forbidden_collapses = uniqueStrings(value.forbidden_collapses, 'forbidden_collapses', 1);
  const requiredAxes = [
    'model_class',
    'observation_object',
    'equivalence_relation',
    'sample_budget',
    'prior_or_route_weighting',
    'loss_or_decision_target'
  ];
  for (const axis of requiredAxes) {
    if (!forbidden_collapses.some(rule => rule.includes(axis)) && axis !== 'sample_budget') {
      // The axis must be explicit in the family object even when no anti-collapse sentence names it.
      if (value[axis] == null && !['prior_or_route_weighting', 'loss_or_decision_target'].includes(axis)) {
        throw new Error(`Criterion family must declare ${axis}.`);
      }
    }
  }

  const family = {
    schema: PEDAGOGUE_RESEARCH_CRITERION_FAMILY_SCHEMA,
    family_id: id(value.family_id, 'family_id'),
    research_question: text(value.research_question, 'research_question'),
    parent_scope_boundary_reference: text(value.parent_scope_boundary_reference, 'parent_scope_boundary_reference'),
    model_class: text(value.model_class, 'model_class'),
    observation_object: text(value.observation_object, 'observation_object'),
    equivalence_relation: text(value.equivalence_relation, 'equivalence_relation'),
    question_axes: freeze({
      model_class: true,
      observation_object: true,
      equivalence_relation: true,
      candidate_family: true,
      sample_budget: true,
      prior_or_route_weighting: true,
      loss_or_decision_target: true
    }),
    members: freeze(members),
    roles_present: freeze([...presentRoles].sort()),
    forbidden_collapses,
    claim_ceiling: text(value.claim_ceiling, 'claim_ceiling'),
    arithmetic_authority: false,
    metric_crowning_authority: false,
    empirical_confirmation_authority: false,
    next_learning_action: text(value.next_learning_action, 'next_learning_action'),
    authority: freeze({
      pedagogue_law_promoted: false,
      promotion_authority: false,
      product_mutation_authorized: false,
      production_mutation_authorized: false,
      external_transmission_authorized: false,
      human_closure_required: true
    })
  };

  noForbidden(family);
  canonicalJson(family);
  return freeze(family);
}
