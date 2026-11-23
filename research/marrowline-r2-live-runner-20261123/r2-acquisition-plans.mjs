// TD613 · Marrowline R2 · Separate Preregistered R2-U & R2-W Acquisition Plans & Scope Classifier
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// Strictly preserves frozen U (5 arms, 3 contrasts) and W (civic + noncivic pairs), allows limited
// initial pilots, and refuses to misclassify single slots or single pairs as completed multi-episode studies.

export const R2_ACQUISITION_PLAN_SCHEMA = 'td613.marrowline.r2-acquisition-plans/v1';

export const R2_U_VALID_ARM_IDS = Object.freeze([
  'R2_U_LITERAL_COPY',
  'R2_U_PLAIN_BASELINE',
  'R2_U_GUIDED_RULES',
  'R2_U_GUIDED_CONTRAST',
  'R2_U_FREE_SYNTHESIS'
]);

export const R2_W_VALID_CONDITION_IDS = Object.freeze([
  'W_FULL_PRODUCTION_FRAME',
  'W_CONDENSED_WHOLE_FRAME',
  'W_NONCIVIC_FULL_PRODUCTION_FRAME',
  'W_NONCIVIC_CONDENSED_WHOLE_FRAME'
]);

export const R2_U_ACQUISITION_PLANS = Object.freeze({
  INITIAL_PILOT: Object.freeze({
    planId: 'INITIAL_PILOT',
    estate: 'R2-U',
    contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES',
    intendedScope: 'SINGLE_COUNTERBALANCED_PAIR_ONLY',
    description: 'Initial limited U pilot: 1 forward contrast episode (GUIDED_RULES vs GUIDED_CONTRAST) to verify native wire/SSE behavior before multi-episode balancing.',
    episodes: Object.freeze([
      Object.freeze({
        episodeId: 1,
        contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES',
        order: 'FORWARD',
        sequence: Object.freeze(['R2_U_GUIDED_RULES', 'R2_U_GUIDED_CONTRAST'])
      })
    ])
  }),
  INITIAL_SINGLE_ARM_LITERAL_CHECK: Object.freeze({
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
    estate: 'R2-U',
    contrastId: 'LITERAL_COPY_REPRODUCTION_ONLY',
    intendedScope: 'LIMITED_INITIAL_SINGLE_OBSERVATION',
    description: 'Single-slot UTF-8/Zalgo exact-copy fidelity sanity probe (never a multi-episode contrast).',
    episodes: Object.freeze([
      Object.freeze({
        episodeId: 1,
        contrastId: 'LITERAL_COPY_REPRODUCTION_ONLY',
        order: 'SINGLE_SLOT',
        sequence: Object.freeze(['R2_U_LITERAL_COPY'])
      })
    ])
  }),
  INITIAL_FIVE_ARM_SINGLE_PASS: Object.freeze({
    planId: 'INITIAL_FIVE_ARM_SINGLE_PASS',
    estate: 'R2-U',
    contrastId: 'ALL_FIVE_ARMS_SINGLE_PASS',
    intendedScope: 'PARTIAL_SUBSET_MULTI_SLOT_ONLY',
    description: 'Single pass across all 5 frozen R2-U arms without reverse-order replication (initial baseline coverage only).',
    episodes: Object.freeze([
      Object.freeze({
        episodeId: 1,
        contrastId: 'ALL_FIVE_ARMS_SINGLE_PASS',
        order: 'FORWARD',
        sequence: R2_U_VALID_ARM_IDS
      })
    ])
  }),
  COUNTERBALANCED_C1_PAIR: Object.freeze({
    planId: 'COUNTERBALANCED_C1_PAIR',
    estate: 'R2-U',
    contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES',
    intendedScope: 'MULTI_EPISODE_COUNTERBALANCED_COMPLETE',
    description: 'Counterbalanced U_C1 study: Episode 1 FORWARD (RULES -> CONTRAST) and Episode 2 REVERSED (CONTRAST -> RULES).',
    episodes: Object.freeze([
      Object.freeze({
        episodeId: 1,
        contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES',
        order: 'FORWARD',
        sequence: Object.freeze(['R2_U_GUIDED_RULES', 'R2_U_GUIDED_CONTRAST'])
      }),
      Object.freeze({
        episodeId: 2,
        contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES',
        order: 'REVERSED',
        sequence: Object.freeze(['R2_U_GUIDED_CONTRAST', 'R2_U_GUIDED_RULES'])
      })
    ])
  }),
  FULL_PREREGISTERED_U: Object.freeze({
    planId: 'FULL_PREREGISTERED_U',
    estate: 'R2-U',
    contrastId: 'ALL_THREE_CONTRASTS_PLUS_LITERAL',
    intendedScope: 'MULTI_EPISODE_COUNTERBALANCED_COMPLETE',
    description: 'Complete R2-U matrix covering literal copy + counterbalanced FORWARD/REVERSED pairs across U_C1, U_C2, and U_C3.',
    episodes: Object.freeze([
      Object.freeze({ episodeId: 1, contrastId: 'LITERAL_COPY_REPRODUCTION_ONLY', order: 'SINGLE_SLOT', sequence: Object.freeze(['R2_U_LITERAL_COPY']) }),
      Object.freeze({ episodeId: 2, contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES', order: 'FORWARD', sequence: Object.freeze(['R2_U_GUIDED_RULES', 'R2_U_GUIDED_CONTRAST']) }),
      Object.freeze({ episodeId: 3, contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES', order: 'REVERSED', sequence: Object.freeze(['R2_U_GUIDED_CONTRAST', 'R2_U_GUIDED_RULES']) }),
      Object.freeze({ episodeId: 4, contrastId: 'U_C2_PLAIN_VS_GUIDED_RULES', order: 'FORWARD', sequence: Object.freeze(['R2_U_PLAIN_BASELINE', 'R2_U_GUIDED_RULES']) }),
      Object.freeze({ episodeId: 5, contrastId: 'U_C2_PLAIN_VS_GUIDED_RULES', order: 'REVERSED', sequence: Object.freeze(['R2_U_GUIDED_RULES', 'R2_U_PLAIN_BASELINE']) }),
      Object.freeze({ episodeId: 6, contrastId: 'U_C3_FREE_VS_GUIDED_RULES', order: 'FORWARD', sequence: Object.freeze(['R2_U_FREE_SYNTHESIS', 'R2_U_GUIDED_RULES']) }),
      Object.freeze({ episodeId: 7, contrastId: 'U_C3_FREE_VS_GUIDED_RULES', order: 'REVERSED', sequence: Object.freeze(['R2_U_GUIDED_RULES', 'R2_U_FREE_SYNTHESIS']) })
    ])
  })
});

export const R2_W_ACQUISITION_PLANS = Object.freeze({
  INITIAL_PILOT: Object.freeze({
    planId: 'INITIAL_PILOT',
    estate: 'R2-W',
    intendedScope: 'LIMITED_CROSS_SCENARIO_PAIRED_PILOT',
    description: 'Initial R2-W pilot across both domains: Episode 1 civic tribunal (FULL -> CONDENSED) and Episode 2 noncivic Black Sea orchard (CONDENSED -> FULL).',
    episodes: Object.freeze([
      Object.freeze({
        episodeId: 1,
        scenarioId: 'W_SCENARIO_CIVIC_TRIBUNAL',
        order: 'FORWARD',
        sequence: Object.freeze(['W_FULL_PRODUCTION_FRAME', 'W_CONDENSED_WHOLE_FRAME'])
      }),
      Object.freeze({
        episodeId: 2,
        scenarioId: 'W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD',
        order: 'REVERSED',
        sequence: Object.freeze(['W_NONCIVIC_CONDENSED_WHOLE_FRAME', 'W_NONCIVIC_FULL_PRODUCTION_FRAME'])
      })
    ])
  }),
  SINGLE_CIVIC_PAIR: Object.freeze({
    planId: 'SINGLE_CIVIC_PAIR',
    estate: 'R2-W',
    intendedScope: 'SINGLE_COUNTERBALANCED_PAIR_ONLY',
    description: 'Single civic tribunal whole-frame pair (FULL vs CONDENSED) with blind human adjudication.',
    episodes: Object.freeze([
      Object.freeze({
        episodeId: 1,
        scenarioId: 'W_SCENARIO_CIVIC_TRIBUNAL',
        order: 'FORWARD',
        sequence: Object.freeze(['W_FULL_PRODUCTION_FRAME', 'W_CONDENSED_WHOLE_FRAME'])
      })
    ])
  }),
  SINGLE_NONCIVIC_PAIR: Object.freeze({
    planId: 'SINGLE_NONCIVIC_PAIR',
    estate: 'R2-W',
    intendedScope: 'SINGLE_COUNTERBALANCED_PAIR_ONLY',
    description: 'Single noncivic cliffside-orchard whole-frame pair (FULL vs CONDENSED) with blind human adjudication.',
    episodes: Object.freeze([
      Object.freeze({
        episodeId: 1,
        scenarioId: 'W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD',
        order: 'FORWARD',
        sequence: Object.freeze(['W_NONCIVIC_FULL_PRODUCTION_FRAME', 'W_NONCIVIC_CONDENSED_WHOLE_FRAME'])
      })
    ])
  }),
  FULL_PREREGISTERED_W: Object.freeze({
    planId: 'FULL_PREREGISTERED_W',
    estate: 'R2-W',
    intendedScope: 'MULTI_EPISODE_COUNTERBALANCED_COMPLETE',
    description: 'Full balanced W acquisition: FORWARD and REVERSED whole-frame pairs in both civic tribunal and noncivic orchard domains.',
    episodes: Object.freeze([
      Object.freeze({ episodeId: 1, scenarioId: 'W_SCENARIO_CIVIC_TRIBUNAL', order: 'FORWARD', sequence: Object.freeze(['W_FULL_PRODUCTION_FRAME', 'W_CONDENSED_WHOLE_FRAME']) }),
      Object.freeze({ episodeId: 2, scenarioId: 'W_SCENARIO_CIVIC_TRIBUNAL', order: 'REVERSED', sequence: Object.freeze(['W_CONDENSED_WHOLE_FRAME', 'W_FULL_PRODUCTION_FRAME']) }),
      Object.freeze({ episodeId: 3, scenarioId: 'W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD', order: 'FORWARD', sequence: Object.freeze(['W_NONCIVIC_FULL_PRODUCTION_FRAME', 'W_NONCIVIC_CONDENSED_WHOLE_FRAME']) }),
      Object.freeze({ episodeId: 4, scenarioId: 'W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD', order: 'REVERSED', sequence: Object.freeze(['W_NONCIVIC_CONDENSED_WHOLE_FRAME', 'W_NONCIVIC_FULL_PRODUCTION_FRAME']) })
    ])
  })
});

export function getR2PlanPreset(estate, planId = 'INITIAL_PILOT') {
  const map = estate === 'R2-U' ? R2_U_ACQUISITION_PLANS : estate === 'R2-W' ? R2_W_ACQUISITION_PLANS : null;
  if (!map) {
    throw new Error(`R2_UNKNOWN_ESTATE:${estate}`);
  }
  const preset = map[String(planId || '').trim()];
  if (!preset) {
    throw new Error(`R2_UNKNOWN_PLAN_${estate}:${planId}`);
  }
  return preset;
}

export function validateAcquisitionEpisodesForEstate(estate, episodes) {
  if (!Array.isArray(episodes) || episodes.length === 0) {
    throw new Error('R2_EMPTY_ACQUISITION_EPISODES');
  }
  const validSet = estate === 'R2-U'
    ? new Set(R2_U_VALID_ARM_IDS)
    : estate === 'R2-W'
      ? new Set(R2_W_VALID_CONDITION_IDS)
      : null;
  const forbiddenOtherSet = estate === 'R2-U'
    ? new Set(R2_W_VALID_CONDITION_IDS)
    : estate === 'R2-W'
      ? new Set(R2_U_VALID_ARM_IDS)
      : null;

  if (!validSet) {
    throw new Error(`R2_UNKNOWN_ESTATE:${estate}`);
  }

  return episodes.map((ep, idx) => {
    if (!ep || typeof ep !== 'object' || !Array.isArray(ep.sequence) || ep.sequence.length === 0) {
      throw new Error(`R2_INVALID_EPISODE_ENTRY:${idx}`);
    }
    const sequence = ep.sequence.map((id) => {
      const key = String(id || '').trim();
      if (forbiddenOtherSet.has(key)) {
        throw new Error(`R2_CROSS_ESTATE_CONDITION_FORBIDDEN:${estate}_CANNOT_RUN_${key}`);
      }
      if (!validSet.has(key)) {
        throw new Error(`R2_INVALID_SLOT_FOR_${estate}:${key}`);
      }
      return key;
    });
    const order = ep.order || (sequence.length === 1 ? 'SINGLE_SLOT' : 'FORWARD');
    if (!['FORWARD', 'REVERSED', 'SINGLE_SLOT', 'CUSTOM'].includes(order)) {
      throw new Error(`R2_INVALID_EPISODE_ORDER:${order}`);
    }
    return Object.freeze({
      episodeId: Number.isSafeInteger(ep.episodeId) && ep.episodeId > 0 ? ep.episodeId : idx + 1,
      ...(ep.contrastId ? { contrastId: String(ep.contrastId) } : {}),
      ...(ep.scenarioId ? { scenarioId: String(ep.scenarioId) } : {}),
      order,
      sequence: Object.freeze(sequence)
    });
  });
}

/**
 * Strictly classifies how much scientific/artistic comparison evidence was actually observed.
 * Prevents single-slot runs, single pairs, or unbalanced cross-domain pilots from claiming
 * MULTI_EPISODE_COUNTERBALANCED_COMPLETE.
 */
export function classifyR2AcquisitionCompletion({
  estate,
  plannedEpisodes = [],
  episodeSummaries = []
} = {}) {
  const validEpisodes = episodeSummaries.filter((ep) => ep?.allSlotsValid === true && ep?.held !== true);
  const validAttemptsCount = episodeSummaries.reduce((acc, ep) => acc + Number(ep?.validSlotsCount || 0), 0);
  const totalAttemptsCount = episodeSummaries.reduce((acc, ep) => acc + Number(ep?.attemptedSlotsCount || 0), 0);

  if (validAttemptsCount === 0) {
    return Object.freeze({
      estate,
      classification: 'NO_VALID_OBSERVATION',
      plannedEpisodeCount: plannedEpisodes.length,
      completedValidEpisodeCount: 0,
      validAttemptsCount: 0,
      totalAttemptsCount,
      hasBalancedForwardAndReversed: false,
      multiEpisodeComparisonCompleted: false,
      generalizableInferencePermitted: false
    });
  }

  // Check per-contrast (R2-U) or per-scenario (R2-W) counterbalance completion
  const pairsByBucket = new Map();
  for (const ep of validEpisodes) {
    if ((ep.sequence?.length || 0) < 2) continue;
    const bucket = ep.scenarioId || ep.contrastId || 'DEFAULT';
    const entry = pairsByBucket.get(bucket) || { forward: 0, reversed: 0 };
    if (ep.order === 'FORWARD') entry.forward += 1;
    if (ep.order === 'REVERSED') entry.reversed += 1;
    pairsByBucket.set(bucket, entry);
  }
  const hasCounterbalancedMultiEpisodeBucket = [...pairsByBucket.values()].some(
    (b) => b.forward >= 1 && b.reversed >= 1
  );
  const everyPlannedEpisodeSucceeded = validEpisodes.length === plannedEpisodes.length && plannedEpisodes.length > 0;

  let classification = 'PARTIAL_OR_INCOMPLETE_SUBSET';
  if (validAttemptsCount === 1 && validEpisodes.length <= 1) {
    classification = 'LIMITED_INITIAL_SINGLE_OBSERVATION';
  } else if (hasCounterbalancedMultiEpisodeBucket && everyPlannedEpisodeSucceeded && validEpisodes.length >= 2) {
    classification = 'MULTI_EPISODE_COUNTERBALANCED_COMPLETE';
  } else if (validEpisodes.length === 1 && (validEpisodes[0].sequence?.length || 0) === 2) {
    classification = 'SINGLE_COUNTERBALANCED_PAIR_ONLY';
  } else if (hasCounterbalancedMultiEpisodeBucket) {
    classification = 'PARTIAL_COUNTERBALANCED_MULTI_EPISODE_WITH_HELD_EPISODES';
  } else if (validEpisodes.length >= 2) {
    classification = 'LIMITED_MULTI_SLOT_WITHOUT_WITHIN_PAIR_COUNTERBALANCE';
  } else {
    classification = 'PARTIAL_SUBSET_OBSERVED';
  }

  return Object.freeze({
    estate,
    classification,
    plannedEpisodeCount: plannedEpisodes.length,
    completedValidEpisodeCount: validEpisodes.length,
    validAttemptsCount,
    totalAttemptsCount,
    hasBalancedForwardAndReversed: hasCounterbalancedMultiEpisodeBucket,
    multiEpisodeComparisonCompleted: classification === 'MULTI_EPISODE_COUNTERBALANCED_COMPLETE',
    generalizableInferencePermitted: false
  });
}
