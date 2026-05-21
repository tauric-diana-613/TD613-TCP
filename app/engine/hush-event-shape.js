export const HUSH_EVENT_SHAPE_VERSION = 'phase-25';

const textOf = (value) => String(value ?? '').toLowerCase();
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(list(value))];

const SHAPES = [
  { anchor: 'FILE-72', relations: ['same', 'copy', 'footer'], caveats: ['maybe', 'template', 'could'] },
  { anchor: 'INV-440', relations: ['2:18', 'jordan', 'resend', 'finance', 'version'], caveats: [] },
  { anchor: 'ROSTER-8', relations: ['4:30', '05/20', 'timing'], caveats: ['maybe', 'normal'] },
  { anchor: 'DOC-31', relations: ['missing-call', 'later', 'note'], caveats: ['sequence', 'not accusation'] },
  { anchor: 'FORM-19', relations: ['17:06', 'queue', 'batch'], caveats: ['might', 'could'] }
];

export function mapEventShape(sourceText = '') {
  const source = textOf(sourceText);
  const eventUnits = [];
  for (const shape of SHAPES) {
    if (!source.includes(shape.anchor.toLowerCase())) continue;
    const requiredRelations = shape.relations.filter((relation) => source.includes(relation));
    const caveatRequired = shape.caveats.some((caveat) => source.includes(caveat));
    eventUnits.push({ anchor: shape.anchor, requiredRelations, caveatRequired, caveats: shape.caveats });
  }
  return { version: HUSH_EVENT_SHAPE_VERSION, eventUnits };
}

export function scoreEventShapeRetention(input = {}) {
  const eventShape = input.eventShape || mapEventShape(input.sourceText || '');
  const output = textOf(input.outputText || '');
  const missingRelations = [];
  const retainedRelations = [];
  const hardFailures = [];
  let required = 0;
  let retained = 0;
  for (const unit of list(eventShape.eventUnits)) {
    const anchorPresent = output.includes(unit.anchor.toLowerCase());
    if (!anchorPresent) hardFailures.push(`missing-anchor:${unit.anchor}`);
    for (const relation of list(unit.requiredRelations)) {
      required += 1;
      if (output.includes(relation)) {
        retained += 1;
        retainedRelations.push(`${unit.anchor}:${relation}`);
      } else {
        missingRelations.push(`${unit.anchor}:${relation}`);
      }
    }
    if (unit.caveatRequired) {
      required += 1;
      const caveatPresent = list(unit.caveats).some((caveat) => output.includes(caveat));
      if (caveatPresent) retained += 1;
      else missingRelations.push(`${unit.anchor}:caveat`);
    }
  }
  const score = required ? Number((retained / required).toFixed(4)) : 1;
  if (required > 0 && score < 0.75) hardFailures.push('event-shape-low-retention');
  return { version: HUSH_EVENT_SHAPE_VERSION, passed: hardFailures.length === 0, score, missingRelations: uniq(missingRelations), retainedRelations: uniq(retainedRelations), hardFailures: uniq(hardFailures), eventShape };
}

export function summarizeEventShapeRetention(result = {}) {
  return { version: result.version || HUSH_EVENT_SHAPE_VERSION, passed: result.passed !== false, score: result.score ?? null, missingRelations: list(result.missingRelations), retainedRelations: list(result.retainedRelations), hardFailures: list(result.hardFailures) };
}
