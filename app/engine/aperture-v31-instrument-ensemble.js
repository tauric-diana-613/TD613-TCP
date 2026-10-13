import { freeze, randomId, recordDigest, text, uniqueStrings, verifyRecord } from './aperture-v31-core.js';

export const INSTRUMENT_ENSEMBLE_SCHEMA = 'td613.aperture.instrument-ensemble/v0.1';
export const INSTRUMENT_ENSEMBLE_DOMAIN = 'TD613:V31:INSTRUMENT-ENSEMBLE:v1';

function normalizeInstrument(value) {
  return {
    instrument_id: text(value.instrumentId, 'Instrument ID'),
    version: text(value.version, 'Instrument version'),
    intervention_dimensions: uniqueStrings(value.interventionDimensions),
    projection: text(value.projection, 'Instrument projection'),
    controlled_variables: uniqueStrings(value.controlledVariables),
    uncontrolled_variables: uniqueStrings(value.uncontrolledVariables),
    source_status: value.sourceStatus || 'DECLARED',
    repeatability: value.repeatability || 'UNTESTED',
    blind_spots: uniqueStrings(value.blindSpots),
    missingness: uniqueStrings(value.missingness),
    environment: text(value.environment, 'Instrument environment'),
    operator_authorized: value.operatorAuthorized === true
  };
}

export async function compileInstrumentEnsemble({ instruments, ensembleId = null, version = '0.1' }, options = {}) {
  if (!Array.isArray(instruments) || instruments.length < 2) throw new Error('Tomography requires at least two declared instruments.');
  const normalized = instruments.map(normalizeInstrument);
  const ids = normalized.map(value => value.instrument_id);
  if (new Set(ids).size !== ids.length) throw new Error('Instrument IDs must be unique.');
  const ensemble = {
    schema: INSTRUMENT_ENSEMBLE_SCHEMA,
    ensemble_id: ensembleId || randomId('atens_', options.cryptoImpl || globalThis.crypto),
    version: text(version, 'Ensemble version'),
    instruments: normalized,
    instrument_count: normalized.length,
    declared_dimensions: uniqueStrings(normalized.flatMap(value => value.intervention_dimensions)),
    all_operator_authorized: normalized.every(value => value.operator_authorized),
    fixed_for_run: true,
    automatic_model_selection: false,
    evidence_basis: ['fixed declared instrument membership', 'declared intervention dimensions'],
    observations: ['Changing membership creates a new ensemble version.'],
    missingness: uniqueStrings(normalized.flatMap(value => value.missingness)), alternatives: [], open_questions: [], operator_notes: [], closure: { required: true, status: 'OPEN' },
    ensemble_digest: null
  };
  ensemble.ensemble_digest = await recordDigest(INSTRUMENT_ENSEMBLE_DOMAIN, ensemble, 'ensemble_digest', options);
  return freeze(ensemble);
}

export const verifyInstrumentEnsemble = (value, options = {}) => verifyRecord(INSTRUMENT_ENSEMBLE_DOMAIN, value, 'ensemble_digest', INSTRUMENT_ENSEMBLE_SCHEMA, options);
