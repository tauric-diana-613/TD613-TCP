const RHYTHM_LEVELS = Object.freeze({
  terse: { max: 8 },
  clipped: { min: 8, max: 12 },
  moderate: { min: 12, max: 18 },
  flowing: { min: 18, max: 25 },
  expansive: { min: 25 }
});

const SPREAD_LEVELS = Object.freeze({
  uniform: { max: 3 },
  moderated: { min: 3, max: 7 },
  varied: { min: 7, max: 11 },
  volatile: { min: 11 }
});

function classifyRange(value, table) {
  for (const [label, bounds] of Object.entries(table)) {
    const aboveMin = bounds.min === undefined || value >= bounds.min;
    const belowMax = bounds.max === undefined || value < bounds.max;
    if (aboveMin && belowMax) {
      return label;
    }
  }

  return Object.keys(table).at(-1) || 'neutral';
}

function getScalar(fingerprint, key, fallback = 0) {
  return Number(fingerprint?.scalars?.[key]?.mean) || fallback;
}

function getDistribution(fingerprint, key) {
  return fingerprint?.distributions?.[key] || {};
}

function topDistributionKeys(distribution = {}, limit = 6) {
  return Object.entries(distribution)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function rhythmConstraint(fingerprint) {
  const average = getScalar(fingerprint, 'avgSentenceLength', 14);
  const spread = getScalar(fingerprint, 'sentenceLengthSpread', 5);
  const rhythm = classifyRange(average, RHYTHM_LEVELS);
  const spreadLevel = classifyRange(spread, SPREAD_LEVELS);

  const primary = {
    terse: `Default to very short sentences at roughly ${Math.round(average)} words. Close thoughts quickly and let periods land hard.`,
    clipped: `Keep sentences short and direct at roughly ${Math.round(average)} words. Let medium-length sentences feel exceptional, not default.`,
    moderate: `Hold a conversational middle cadence around ${Math.round(average)} words. Alternate short declaratives with occasional compound turns.`,
    flowing: `Sustain longer sentences around ${Math.round(average)} words. Allow clauses to accumulate before the line resolves.`,
    expansive: `Build long, architected sentences at ${Math.round(average)} words or more. Periods should arrive late and feel earned.`
  };

  const secondary = {
    uniform: 'Keep sentence lengths relatively even.',
    moderated: 'Allow small rhythmic variation without wild swings.',
    varied: 'Use deliberate variation between short and long lines.',
    volatile: 'Use strong rhythmic volatility: long braided lines interrupted by short declaratives.'
  };

  return {
    dimension: 'rhythm',
    tier: 'structural',
    level: rhythm,
    weight: 0.22,
    instruction: primary[rhythm],
    supplementary: secondary[spreadLevel]
  };
}

function contractionConstraint(fingerprint) {
  const density = getScalar(fingerprint, 'contractionDensity', 0.05);
  let level = 'balanced';
  let instruction = 'Use contractions at a neutral spoken rate.';

  if (density < 0.015) {
    level = 'formal';
    instruction = 'Avoid contractions almost entirely. Prefer uncontracted forms such as "do not" and "cannot".';
  } else if (density < 0.04) {
    level = 'restrained';
    instruction = 'Use contractions sparingly. Default to formal uncontracted forms, with only occasional spoken contractions.';
  } else if (density < 0.08) {
    level = 'conversational';
    instruction = 'Use contractions naturally whenever a spoken register would use them.';
  } else {
    level = 'dense';
    instruction = 'Contract aggressively. Uncontracted auxiliary forms should feel conspicuous unless a hard emphasis requires them.';
  }

  return {
    dimension: 'contractions',
    tier: 'texture',
    level,
    weight: 0.12,
    instruction
  };
}

function punctuationConstraint(fingerprint) {
  const density = getScalar(fingerprint, 'punctuationDensity', 0.1);
  const mix = getDistribution(fingerprint, 'punctuationMix');
  const dashRatio = Number(mix.dash) || 0;
  const strongRatio = Number(mix.strong) || 0;
  const pieces = [];

  if (density < 0.06) {
    pieces.push('Keep punctuation sparse. Sentences should read clean and lightly marked.');
  } else if (density < 0.12) {
    pieces.push('Use moderate punctuation with commas at natural clause boundaries.');
  } else {
    pieces.push('Use dense punctuation. Commas, dashes, and structural marks should visibly shape the line.');
  }

  if (dashRatio > 0.12) {
    pieces.push('Lean on em dashes for pivots and aside-work.');
  } else if (dashRatio < 0.03) {
    pieces.push('Avoid em dashes; route aside-work through commas or parenthetical phrasing instead.');
  }

  if (strongRatio > 0.08) {
    pieces.push('Use semicolons or colons when linking structural clauses.');
  } else if (strongRatio < 0.02) {
    pieces.push('Avoid semicolons and colons unless absolutely necessary.');
  }

  return {
    dimension: 'punctuation',
    tier: 'texture',
    level: density < 0.06 ? 'sparse' : density < 0.12 ? 'moderate' : 'dense',
    weight: 0.1,
    instruction: pieces.join(' ')
  };
}

function connectorConstraint(fingerprint) {
  const functionWords = getDistribution(fingerprint, 'functionWordProfile');
  const topWords = topDistributionKeys(functionWords, 8);
  const weights = {
    adversative: ['but', 'however', 'though', 'although', 'yet', 'still'],
    causal: ['because', 'since', 'so', 'therefore', 'thus'],
    additive: ['and', 'also', 'moreover', 'furthermore'],
    temporal: ['then', 'when', 'while', 'after', 'before', 'once']
  };

  const scored = Object.entries(weights).map(([label, words]) => ({
    label,
    score: words.reduce((sum, word) => sum + (Number(functionWords[word]) || 0), 0)
  }));
  const dominant = scored.sort((left, right) => right.score - left.score)[0]?.label || 'neutral';
  const instructions = {
    adversative: 'Pivot and qualify frequently; corrections and contrasts should feel native to the voice.',
    causal: 'Link cause to effect inline; the voice should explain as it moves.',
    additive: 'Accumulate details and extend thought through additive connectors.',
    temporal: 'Sequence events clearly through time-aware transitions.',
    neutral: 'Use a balanced connector set without overcommitting to one lane.'
  };

  return {
    dimension: 'connectors',
    tier: 'texture',
    level: dominant,
    weight: 0.14,
    instruction: `${instructions[dominant]} Characteristic connector lane: ${topWords.join(', ') || 'balanced mix'}.`
  };
}

function registerConstraint(fingerprint) {
  const hedgeDensity = getScalar(fingerprint, 'hedgeDensity', 0.03);
  const directness = getScalar(fingerprint, 'directness', 0.5);
  const abstraction = getScalar(fingerprint, 'abstractionPosture', 0.5);
  const latinate = getScalar(fingerprint, 'latinatePreference', 0.3);
  const complexity = getScalar(fingerprint, 'contentWordComplexity', 0.45);

  let level = 'balanced';
  let instruction = 'Balance abstract framing with concrete anchors.';

  if (hedgeDensity > 0.05 && directness < 0.4) {
    level = 'tentative';
    instruction = 'Signal uncertainty explicitly and let the voice qualify its own claims in real time.';
  } else if (directness > 0.72) {
    level = 'assertive';
    instruction = 'State claims plainly and cut hedges unless uncertainty is itself the point of the line.';
  } else if (abstraction > 0.62 && latinate > 0.5) {
    level = 'abstract-latinate';
    instruction = 'Favor conceptual, Latinate vocabulary and systemic framing over concrete scene detail.';
  } else if (abstraction < 0.36) {
    level = 'concrete';
    instruction = 'Stay physically concrete and situational. Prefer tangible specifics over conceptual paraphrase.';
  }

  const complexityHint = complexity > 0.58
    ? 'Prefer higher-complexity content words where they sharpen the register.'
    : complexity < 0.36
      ? 'Prefer cleaner, plainer content words and avoid ornamental vocabulary.'
      : 'Keep vocabulary complexity in a mixed middle lane.';

  return {
    dimension: 'register',
    tier: 'register',
    level,
    weight: 0.18,
    instruction: `${instruction} ${complexityHint}`
  };
}

function modifiersConstraint(fingerprint) {
  const modifierDensity = getScalar(fingerprint, 'modifierDensity', 0.06);
  const recurrence = getScalar(fingerprint, 'recurrencePressure', 0.16);
  let level = 'moderate';
  let instruction = 'Use modifiers selectively; let them sharpen rather than pad.';

  if (modifierDensity < 0.04) {
    level = 'spare';
    instruction = 'Keep modifiers sparse. Let nouns and verbs carry most of the pressure.';
  } else if (modifierDensity > 0.11) {
    level = 'ornate';
    instruction = 'Allow modifiers to cluster when building mood or precision. Let the line carry visible descriptive load.';
  }

  const recurrenceHint = recurrence > 0.28
    ? 'Permit deliberate phrase return or callback phrasing.'
    : 'Avoid obvious repeated phrasing unless it serves a clear rhetorical return.';

  return {
    dimension: 'modifiers-and-return',
    tier: 'register',
    level,
    weight: 0.12,
    instruction: `${instruction} ${recurrenceHint}`
  };
}

export function classifyFingerprint(fingerprint) {
  return [
    rhythmConstraint(fingerprint),
    contractionConstraint(fingerprint),
    punctuationConstraint(fingerprint),
    connectorConstraint(fingerprint),
    registerConstraint(fingerprint),
    modifiersConstraint(fingerprint)
  ].sort((left, right) => right.weight - left.weight);
}

export function describePersona(fingerprint) {
  const constraints = classifyFingerprint(fingerprint);
  const lead = constraints[0];
  const register = constraints.find((constraint) => constraint.dimension === 'register');
  const rhythm = constraints.find((constraint) => constraint.dimension === 'rhythm');
  const contractions = constraints.find((constraint) => constraint.dimension === 'contractions');
  const fragments = [
    rhythm ? `${rhythm.level} rhythm` : null,
    register ? `${register.level} register` : null,
    contractions ? `${contractions.level} contraction posture` : null
  ].filter(Boolean);

  return `${lead.level} ${lead.dimension.replace(/-/g, ' ')} with ${fragments.join(', ')}.`;
}

export function buildPersonaPrompt(fingerprint, options = {}) {
  const {
    name = 'Unnamed Persona',
    referenceSamples = [],
    correctionHints = []
  } = options;
  const constraints = classifyFingerprint(fingerprint);
  const description = describePersona(fingerprint);

  const lines = [
    `You are writing in the derived voice "${name}".`,
    '',
    'Task:',
    '- Write new text in this voice without copying the subject matter or phrasing of the reference corpus.',
    '- Match the voice through sentence rhythm, connector behavior, contraction posture, register, and lexical texture.',
    '- Preserve explicit literals, names, dates, IDs, URLs, and quoted anchors supplied by the user.',
    '',
    `Voice summary: ${description}`,
    '',
    'Priority constraints:'
  ];

  constraints.forEach((constraint) => {
    lines.push(`- [${constraint.tier}] ${constraint.dimension}: ${constraint.instruction}`);
    if (constraint.supplementary) {
      lines.push(`  ${constraint.supplementary}`);
    }
  });

  if (referenceSamples.length) {
    lines.push('', 'Reference fragments for voice texture only (do not reuse their factual content):');
    referenceSamples.slice(0, 2).forEach((sample, index) => {
      const text = String(sample || '').replace(/\s+/g, ' ').trim();
      lines.push(`${index + 1}. ${text}`);
    });
  }

  if (correctionHints.length) {
    lines.push('', 'Correction priorities from the last validation:');
    correctionHints.forEach((hint) => {
      lines.push(`- ${hint}`);
    });
  }

  lines.push('', 'Return only the rewritten output text.');

  return {
    description,
    promptConstraints: constraints.map((constraint) => ({
      dimension: constraint.dimension,
      tier: constraint.tier,
      level: constraint.level,
      weight: constraint.weight,
      instruction: constraint.instruction,
      supplementary: constraint.supplementary || null
    })),
    systemPrompt: lines.join('\n')
  };
}
