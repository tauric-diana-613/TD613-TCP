import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, noForbidden, object, text } from './flowcore-pedagogue-utils.js';

export const PEDAGOGUE_RECURRENCE_AUDIT_SCHEMA = 'td613.flowcore.pedagogue-recurrence-audit/v0.1';

export const PEDAGOGUE_RECURRENCE_EXPOSURE_CLASSES = Object.freeze([
  'DIRECT_KNOWN_EXPOSURE',
  'SHARED_SOURCE_EXPOSURE',
  'NO_KNOWN_EXPOSURE',
  'UNKNOWN'
]);

export const PEDAGOGUE_RECURRENCE_EVIDENCE_POSTURES = Object.freeze([
  'REPOSITORY_OBSERVED',
  'SUPPLIED_PRIMARY',
  'SUPPLIED',
  'SCHOLARLY_SOURCE',
  'DERIVED',
  'CONTROL'
]);

function arrayOfTexts(value, label, minimum = 0) {
  if (!Array.isArray(value) || value.length < minimum) throw new TypeError(`${label} must be an array with at least ${minimum} item(s).`);
  return value.map((item, index) => text(item, `${label}[${index}]`));
}

function compileMention(input, index) {
  const value = object(input, `mentions[${index}]`);
  const exposure_class = text(value.exposure_class, `mentions[${index}].exposure_class`).toUpperCase();
  const evidence_posture = text(value.evidence_posture, `mentions[${index}].evidence_posture`).toUpperCase();
  if (!PEDAGOGUE_RECURRENCE_EXPOSURE_CLASSES.includes(exposure_class)) throw new Error(`Unsupported recurrence exposure class: ${exposure_class}`);
  if (!PEDAGOGUE_RECURRENCE_EVIDENCE_POSTURES.includes(evidence_posture)) throw new Error(`Unsupported recurrence evidence posture: ${evidence_posture}`);
  return freeze({
    route_id: text(value.route_id, `mentions[${index}].route_id`),
    observed_token: text(value.observed_token, `mentions[${index}].observed_token`),
    entity_id: text(value.entity_id, `mentions[${index}].entity_id`).toUpperCase(),
    exposure_class,
    evidence_posture,
    provenance_reference: text(value.provenance_reference, `mentions[${index}].provenance_reference`),
    mechanism_tags: freeze(arrayOfTexts(value.mechanism_tags || [], `mentions[${index}].mechanism_tags`).map((item) => item.toUpperCase())),
    domain_tags: freeze(arrayOfTexts(value.domain_tags || [], `mentions[${index}].domain_tags`).map((item) => item.toUpperCase())),
    note: value.note === undefined ? null : text(value.note, `mentions[${index}].note`)
  });
}

function intersection(arrays) {
  if (!arrays.length) return [];
  const [first, ...rest] = arrays;
  return [...new Set(first)].filter((item) => rest.every((array) => array.includes(item)));
}

function pairwiseSharedMechanisms(mentions) {
  const pairs = [];
  for (let i = 0; i < mentions.length; i += 1) {
    for (let j = i + 1; j < mentions.length; j += 1) {
      const shared = intersection([mentions[i].mechanism_tags, mentions[j].mechanism_tags]);
      if (shared.length) {
        pairs.push(freeze({
          route_a: mentions[i].route_id,
          route_b: mentions[j].route_id,
          shared_mechanisms: freeze(shared)
        }));
      }
    }
  }
  return freeze(pairs);
}

export function compilePedagogueRecurrenceAudit(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const coordinate_id = text(value.coordinate_id, 'coordinate_id').toUpperCase();
  const canonical_entity_id = text(value.canonical_entity_id, 'canonical_entity_id').toUpperCase();
  const mentions = freeze((value.mentions || []).map(compileMention));
  if (mentions.length < 2) throw new Error('Recurrence audit requires at least two declared mentions.');

  const declaredCandidates = freeze(arrayOfTexts(value.entity_candidates || [canonical_entity_id], 'entity_candidates', 1).map((item) => item.toUpperCase()));
  const observedEntityIds = freeze([...new Set(mentions.map((mention) => mention.entity_id))].sort());
  const nonCanonicalMentions = mentions.filter((mention) => mention.entity_id !== canonical_entity_id);
  const alias_collision_detected = nonCanonicalMentions.length > 0 || observedEntityIds.length > 1;

  const canonicalMentions = mentions.filter((mention) => mention.entity_id === canonical_entity_id);
  const noKnownExposureMentions = canonicalMentions.filter((mention) => mention.exposure_class === 'NO_KNOWN_EXPOSURE');
  const sharedSourceMentions = canonicalMentions.filter((mention) => mention.exposure_class === 'SHARED_SOURCE_EXPOSURE');
  const unknownExposureMentions = canonicalMentions.filter((mention) => mention.exposure_class === 'UNKNOWN');
  const directExposureMentions = canonicalMentions.filter((mention) => mention.exposure_class === 'DIRECT_KNOWN_EXPOSURE');

  const allMechanismIntersection = freeze(intersection(canonicalMentions.filter((mention) => mention.mechanism_tags.length).map((mention) => mention.mechanism_tags)));
  const pairwise_mechanism_overlap = pairwiseSharedMechanisms(canonicalMentions);
  const canonicalDomains = freeze([...new Set(canonicalMentions.flatMap((mention) => mention.domain_tags))].sort());
  const breadth = value.breadth_control ? object(value.breadth_control, 'breadth_control') : null;
  const breadth_control = breadth ? freeze({
    high_degree_coordinate_declared: breadth.high_degree_coordinate_declared === true,
    domain_count_observed: canonicalDomains.length,
    expected_recurrence_in_transdisciplinary_search: breadth.expected_recurrence_in_transdisciplinary_search === true,
    note: breadth.note === undefined ? null : text(breadth.note, 'breadth_control.note')
  }) : freeze({
    high_degree_coordinate_declared: false,
    domain_count_observed: canonicalDomains.length,
    expected_recurrence_in_transdisciplinary_search: false,
    note: null
  });

  const independentFunctionalPairs = pairwise_mechanism_overlap.filter((pair) => {
    const a = canonicalMentions.find((mention) => mention.route_id === pair.route_a);
    const b = canonicalMentions.find((mention) => mention.route_id === pair.route_b);
    return a?.exposure_class === 'NO_KNOWN_EXPOSURE' && b?.exposure_class === 'NO_KNOWN_EXPOSURE';
  });

  let classification = 'PROVENANCE_RECURRENCE_ONLY';
  if (alias_collision_detected) classification = 'IDENTITY_DISAMBIGUATION_REQUIRED';
  else if (independentFunctionalPairs.length > 0) classification = 'INDEPENDENT_FUNCTIONAL_RECURRENCE_CANDIDATE';
  else if (canonicalMentions.length >= 3 && allMechanismIntersection.length === 0) classification = 'HETEROGENEOUS_MULTI_ROUTE_RECURRENCE';
  else if (sharedSourceMentions.length > 0 || directExposureMentions.length > 0) classification = 'INHERITANCE_OR_EXPOSURE_EXPLAINS_RECURRENCE';

  const audit = {
    schema: PEDAGOGUE_RECURRENCE_AUDIT_SCHEMA,
    coordinate_id,
    canonical_entity_id,
    entity_candidates: declaredCandidates,
    observed_entity_ids: observedEntityIds,
    mentions,
    identity_control: freeze({
      alias_collision_detected,
      noncanonical_mention_count: nonCanonicalMentions.length,
      identity_disambiguation_required: alias_collision_detected
    }),
    exposure_control: freeze({
      canonical_mention_count: canonicalMentions.length,
      no_known_exposure_count: noKnownExposureMentions.length,
      shared_source_exposure_count: sharedSourceMentions.length,
      direct_known_exposure_count: directExposureMentions.length,
      unknown_exposure_count: unknownExposureMentions.length,
      independence_may_be_claimed_for_unknown_exposure: false
    }),
    functional_control: freeze({
      all_route_mechanism_intersection: allMechanismIntersection,
      pairwise_mechanism_overlap,
      independent_functional_pair_count: independentFunctionalPairs.length,
      common_mechanism_inferred_from_name_recursion: false
    }),
    breadth_control,
    classification,
    claim_ceiling: freeze({
      recurrence_is_common_cause_proof: false,
      recurrence_is_metaphysical_proof: false,
      recurrence_is_genealogical_proof: false,
      recurrence_is_source_authority: false,
      alias_collision_may_be_interpreted_as_convergence: false,
      unknown_exposure_may_be_interpreted_as_independence: false,
      high_degree_breadth_may_be_ignored: false,
      independent_functional_recurrence_requires_shared_mechanism_and_no_known_exposure: true
    }),
    authority: freeze({
      recommendation_only: true,
      ontology_promotion_authorized: false,
      automatic_redesign: false,
      production_mutation_authorized: false,
      human_closure_required: true
    })
  };
  canonicalJson(audit);
  return freeze(audit);
}
