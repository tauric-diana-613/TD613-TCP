export const HUSH_CARD_GRAMMAR_VERSION = 'phase-31';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const text = (value) => String(value ?? '').trim();

export function classifyPersonaCard(mask = {}) {
  const id = text(mask.id);
  const family = text(mask.family).toLowerCase();
  if (id.includes('phase28') || family.includes('target')) return 'target-register-card';
  if (id.includes('phase27') || family.includes('register')) return 'custody-lantern-card';
  if (id.includes('phase22') || id.includes('phase24') || family.includes('stress')) return 'lab-stress-card';
  if (mask.source === 'custom' || id.startsWith('custom')) return 'forge-born-card';
  return 'field-persona-card';
}

export function derivePersonaRouteWarnings(mask = {}) {
  const warnings = [...list(mask.pressureWarnings)];
  const cardClass = classifyPersonaCard(mask);
  if (cardClass === 'target-register-card') warnings.push('explicit-target-register-review');
  if (cardClass === 'lab-stress-card') warnings.push('stress-mask-not-default');
  if (cardClass === 'forge-born-card') warnings.push('custom-mask-local-only');
  if (!mask.riskTell) warnings.push('risk-tell-missing');
  return [...new Set(warnings)];
}

export function buildHushPersonaCard(mask = {}) {
  const routeWarnings = derivePersonaRouteWarnings(mask);
  return {
    version: HUSH_CARD_GRAMMAR_VERSION,
    id: text(mask.id),
    label: text(mask.label),
    family: text(mask.family),
    story: text(mask.description),
    intendedUse: text(mask.intendedUse),
    riskTell: text(mask.riskTell),
    pressureWarnings: list(mask.pressureWarnings),
    transformHints: mask.transformHints || {},
    cardClass: classifyPersonaCard(mask),
    routeWarnings
  };
}

export function summarizePersonaCard(card = {}) {
  return { id: card.id || '', label: card.label || '', cardClass: card.cardClass || '', hasStory: Boolean(card.story), hasRiskTell: Boolean(card.riskTell), warningCount: list(card.routeWarnings).length };
}
