import { freeze, integer, ratio, sign, text } from './aperture-v31-core.js';

export const SIGNED_RESIDUAL_SCHEMA = 'td613.aperture.signed-residual-ledger/v0.1';

export function compileSignedResidualLedger(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Residual ledger requires declared observations and predictions.');
  const residuals = entries.map(value => {
    const observed = integer(value.observed, 'Observed residual input');
    const predicted = integer(value.predicted, 'Predicted residual input');
    const residual = observed - predicted;
    return {
      snapshot_id: text(value.snapshotId, 'Residual snapshot ID'),
      instrument_id: text(value.instrumentId, 'Residual instrument ID'),
      time_index: integer(value.timeIndex, 'Residual time index', { min: 0 }),
      replicate: integer(value.replicate, 'Residual replicate', { min: 1 }),
      source_status: value.sourceStatus || 'OBSERVED',
      observed,
      predicted,
      residual,
      sign: sign(residual),
      magnitude: Math.abs(residual),
      held_out: value.heldOut === true
    };
  });
  const total = residuals.reduce((sum, value) => sum + value.residual, 0);
  const positive = residuals.filter(value => value.residual > 0).length;
  const negative = residuals.filter(value => value.residual < 0).length;
  const structured = positive > 1 && negative > 1 && total === 0;
  return freeze({
    schema: SIGNED_RESIDUAL_SCHEMA,
    entries: residuals,
    mean_residual: ratio(total, residuals.length),
    sign_counts: { positive, negative, zero: residuals.length - positive - negative },
    state: structured ? 'STRUCTURED_UNEXPLAINED' : residuals.every(value => value.residual === 0) ? 'EXPLAINED' : 'PARTIALLY_EXPLAINED',
    opposed_residuals_cancelled: false,
    source_status_preserved: true,
    evidence_basis: ['observed and predicted integer pairs'],
    observations: residuals, missingness: [], alternatives: [], open_questions: structured ? ['Which alternative model explains the opposed residual structure?'] : [], operator_notes: [], closure: { required: true, status: 'OPEN' }
  });
}
