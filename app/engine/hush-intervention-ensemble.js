import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { randomId, text } from './aperture-v31-core.js';
import { inspectHushAuthority, inspectHushRebuild } from './hush-intervention-authority.js';
import {
  HUSH_INTERVENTION_DOMAINS,
  HUSH_INTERVENTION_ENSEMBLE_SCHEMA,
  requireDigest,
  sealHushRecord,
  unique,
  verifyHushRecord
} from './hush-intervention-common.js';
import {
  HUSH_DISCOURSE_MODES,
  HUSH_INTERVENTION_VOCABULARY_VERSION,
  HUSH_PROPOSITION_OBLIGATIONS,
  HUSH_PROTECTED_LITERAL_POLICIES,
  HUSH_TRANSFORMATION_DIMENSIONS,
  assertHushVocabularyValue
} from './hush-intervention-vocabulary.js';

function normalizeDimensions(value = {}) {
  const output = {};
  for (const [dimension, operation] of Object.entries(value)) {
    const key = assertHushVocabularyValue(dimension, HUSH_TRANSFORMATION_DIMENSIONS, 'transformation dimension');
    const declared = String(operation || '').trim();
    if (!declared) throw new Error(`Transformation ${key} requires a declared operation.`);
    output[key] = declared;
  }
  if (!Object.keys(output).length) throw new Error('Each intervention requires at least one declared transformation dimension.');
  return output;
}

export async function compileHushInterventionEnsemble(input = {}, options = {}) {
  const caseId = text(input.caseId, 'Case ID');
  const caseMapDigest = requireDigest(input.caseMapDigest, 'Case Map digest');
  const routeMemoryDigest = requireDigest(input.routeMemoryDigest, 'Route Memory digest');
  const authority = await inspectHushAuthority({ ...input, caseId, caseMapDigest, routeMemoryDigest }, options);
  if (!authority.verified || !authority.permission.authorized) {
    throw new Error('Hush intervention requires the current authorized Authority Context.');
  }
  const rebuild = await inspectHushRebuild({ ...input, caseId, caseMapDigest, routeMemoryDigest }, options);
  if (!rebuild.bound) throw new Error('Hush intervention requires the current verified Rebuild receipt.');

  const sourceText = text(input.sourceText, 'Hush intervention source text');
  const sourceDigest = await canonicalDigest(
    HUSH_INTERVENTION_DOMAINS.source,
    { source_text: sourceText },
    options
  );

  const propositions = await Promise.all((input.propositions || []).map(async (item, index) => {
    const propositionText = text(item?.text, `Proposition ${index + 1}`);
    return {
      proposition_id: String(item?.propositionId || `proposition_${index + 1}`),
      proposition_digest: await canonicalDigest(
        HUSH_INTERVENTION_DOMAINS.proposition,
        { text: propositionText },
        options
      ),
      obligation: assertHushVocabularyValue(
        item?.obligation,
        HUSH_PROPOSITION_OBLIGATIONS,
        'proposition obligation'
      )
    };
  }));
  if (!propositions.length) throw new Error('Hush intervention requires at least one proposition obligation.');

  const protectedLiterals = await Promise.all((input.protectedLiterals || []).map(async (item, index) => {
    const literal = text(item?.literal, `Protected literal ${index + 1}`);
    return {
      literal_id: String(item?.literalId || `literal_${index + 1}`),
      literal_digest: await canonicalDigest(
        HUSH_INTERVENTION_DOMAINS.literal,
        { literal },
        options
      ),
      policy: assertHushVocabularyValue(
        item?.policy,
        HUSH_PROTECTED_LITERAL_POLICIES,
        'protected literal policy'
      )
    };
  }));

  const propositionIds = new Set(propositions.map(item => item.proposition_id));
  const literalIds = new Set(protectedLiterals.map(item => item.literal_id));
  const interventions = (input.interventions || []).map((item, index) => {
    const fixedPropositions = unique(
      item?.fixedPropositionIds || propositions.map(entry => entry.proposition_id)
    );
    const fixedLiterals = unique(
      item?.fixedLiteralIds || protectedLiterals.map(entry => entry.literal_id)
    );
    if (fixedPropositions.some(id => !propositionIds.has(id))) {
      throw new Error('Intervention references an unknown proposition obligation.');
    }
    if (fixedLiterals.some(id => !literalIds.has(id))) {
      throw new Error('Intervention references an unknown protected literal.');
    }
    return {
      intervention_id: String(item?.interventionId || `intervention_${index + 1}`),
      label: text(item?.label || `Intervention ${index + 1}`, 'Intervention label'),
      dimensions: normalizeDimensions(item?.dimensions),
      fixed_proposition_ids: fixedPropositions,
      fixed_literal_ids: fixedLiterals,
      route_class: String(item?.routeClass || 'LOCAL_ONLY').toUpperCase()
    };
  });
  if (!interventions.length) throw new Error('Hush intervention requires at least one declared intervention.');

  return sealHushRecord(HUSH_INTERVENTION_DOMAINS.ensemble, {
    schema: HUSH_INTERVENTION_ENSEMBLE_SCHEMA,
    ensemble_id: input.ensembleId || randomId('hush_ensemble_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    vocabulary_version: HUSH_INTERVENTION_VOCABULARY_VERSION,
    case_id: caseId,
    case_map_digest: caseMapDigest,
    route_memory_digest: routeMemoryDigest,
    authority_context_reference: input.authorityContext.receipt_id,
    authority_context_digest: input.authorityContext.authority_context_digest,
    rebuild_receipt_reference: input.rebuildReceipt.test_id,
    rebuild_receipt_digest: input.rebuildReceipt.test_digest,
    source_text_digest: sourceDigest,
    discourse_mode: assertHushVocabularyValue(
      input.discourseMode,
      HUSH_DISCOURSE_MODES,
      'discourse mode'
    ),
    propositions,
    protected_literals: protectedLiterals,
    interventions,
    trial_plan: {
      repeated_trials_required: true,
      matched_readers_required: true,
      benign_control_required: true,
      held_out_required: true,
      source_drift_check_required: true,
      minimum_observed_trials: Math.max(2, Number(input.minimumObservedTrials || 2))
    },
    default_reader_classes: ['LOCAL_DETERMINISTIC', 'SYNTHETIC_DECLARED'],
    provider_use_requires_explicit_provider_draft_gesture: true,
    complete_case_map_allowed: false,
    room_keys_allowed: false,
    route_memory_body_allowed: false,
    private_alias_table_allowed: false,
    raw_custody_material_allowed: false,
    candidate_only: true,
    persistence_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    ensemble_digest: null
  }, 'ensemble_digest', options);
}

export const verifyHushInterventionEnsemble = (value, options = {}) => verifyHushRecord(
  HUSH_INTERVENTION_DOMAINS.ensemble,
  value,
  'ensemble_digest',
  HUSH_INTERVENTION_ENSEMBLE_SCHEMA,
  options
);
