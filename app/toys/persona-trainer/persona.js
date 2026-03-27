function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'trainer-persona';
}

function topConstraintLabels(promptConstraints = []) {
  return (promptConstraints || [])
    .slice(0, 3)
    .map((constraint) => `${constraint.level} ${constraint.dimension.replace(/-/g, ' ')}`);
}

export function buildPersonaBlurb(name, promptBuild, validation) {
  const retrieval = validation?.retrievalContract;
  const agreement = retrieval ? Math.round((retrieval.meanAgreement || 0) * 100) : 0;
  const description = promptBuild?.description || 'Derived retrieval shell.';
  return `${description} Retrieval agreement ${agreement}% across the trainer calibration lane.`;
}

export function buildBrowserPersona({
  name,
  promptBuild,
  profile,
  validation,
  buildMod
}) {
  const safeName = String(name || 'Trainer Persona').trim() || 'Trainer Persona';
  const chips = [
    ...topConstraintLabels(promptBuild?.promptConstraints || []),
    `retrieval ${Math.round(((validation?.retrievalContract?.meanAgreement) || 0) * 100)}`
  ].slice(0, 4);

  return {
    id: `trainer-${slugify(safeName)}-${Date.now()}`,
    name: safeName,
    blurb: buildPersonaBlurb(safeName, promptBuild, validation),
    chips,
    mod: typeof buildMod === 'function' ? buildMod(profile) : null,
    profile: { ...(profile || {}) },
    strength: Math.max(0.72, Math.min(0.96, (validation?.retrievalContract?.meanAgreement || 0.72))),
    source: 'trainer'
  };
}

export function buildPersonaSpec({
  name,
  extraction,
  promptBuild,
  validation,
  buildMod
}) {
  const profile = extraction?.targetProfile || {};
  const browserPersona = buildBrowserPersona({
    name,
    promptBuild,
    profile,
    validation,
    buildMod
  });

  return {
    version: '27.4',
    name: browserPersona.name,
    fingerprint: extraction?.fingerprint,
    promptConstraints: promptBuild?.promptConstraints || [],
    systemPrompt: promptBuild?.systemPrompt || '',
    retrievalContract: validation?.retrievalContract || {},
    semanticAuditSummary: validation?.semanticAuditSummary || {},
    protectedAnchorSummary: validation?.protectedAnchorSummary || {},
    tcpShell: {
      mode: 'persona',
      label: browserPersona.name,
      profile: browserPersona.profile,
      strength: browserPersona.strength
    },
    browserPersona,
    corpusSummary: {
      sampleCount: extraction?.stats?.sampleCount || extraction?.samples?.length || 0,
      totalWords: extraction?.stats?.totalWords || 0,
      selfSimilarity: extraction?.selfSimilarity || {}
    },
    trainer: {
      description: promptBuild?.description || '',
      correctionHints: validation?.correctionHints || []
    }
  };
}

export function exportPersonaSpec(spec) {
  return JSON.stringify(spec, null, 2);
}
