/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Preregistered Master Seeds, 6-Cell Pilot Calibration Grid & 18-Cell Confirmatory Grid
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { deepFreeze, round4 } from './prng.mjs';

export const ACT2_MASTER_SEEDS = Object.freeze({
  PILOT_48_WORLD_SEED: 'TD613_ACT2_PILOT_48_WORLDS_20261105_SAC_X6ZNK5NO51',
  PILOT_48_EVAL_SEED: 'TD613_ACT2_PILOT_48_EVAL_20261105_SAC_X6ZNK5NO51',
  CONFIRMATORY_192_WORLD_SEED: 'TD613_ACT2_CONFIRMATORY_192_WORLDS_20261105_SAC_X6ZNK5NO51',
  CONFIRMATORY_192_EVAL_SEED: 'TD613_ACT2_CONFIRMATORY_192_EVAL_20261105_SAC_X6ZNK5NO51',
  STANDING_FACTORIAL_96_SEED: 'TD613_ACT2_STANDING_FACTORIAL_96_20261105_SAC_X6ZNK5NO51',
  DEAD_CIVILIZATION_WING_SEED: 'TD613_ACT2_DEAD_CIVILIZATION_WING_20261105_SAC_X6ZNK5NO51',
  ADVERSARIAL_COUNTEREXAMPLES_SEED: 'TD613_ACT2_ADVERSARIAL_10_20261105_SAC_X6ZNK5NO51',
});

export const HAZARD_LEVELS = Object.freeze([
  { h_id: 'H_LOW', h: 0.02 },
  { h_id: 'H_MOD', h: 0.08 },
  { h_id: 'H_HIGH', h: 0.20 },
]);

export const LATENCY_LEVELS = Object.freeze([
  { lat_id: 'L0_IMMEDIATE', tau0: 0, delta_obs: 0, delta_adm: 0, delta_avail: 0 },
  { lat_id: 'L3_MODERATE', tau0: 3, delta_obs: 1, delta_adm: 2, delta_avail: 0 },
  { lat_id: 'L6_DELAYED', tau0: 6, delta_obs: 2, delta_adm: 4, delta_avail: 0 },
]);

export const CADENCE_LEVELS = Object.freeze([
  { nu_id: 'V_DELIBERATIVE', interval_ticks: 6, nu: round4(1 / 6) },
  { nu_id: 'V_ACCELERATED', interval_ticks: 2, nu: 0.5 },
]);

function buildFullConfirmatoryGrid() {
  const cells = [];
  for (const hz of HAZARD_LEVELS) {
    for (const lt of LATENCY_LEVELS) {
      for (const cd of CADENCE_LEVELS) {
        cells.push({
          cell_id: `${hz.h_id}__${lt.lat_id}__${cd.nu_id}`,
          h_id: hz.h_id,
          h: hz.h,
          lat_id: lt.lat_id,
          tau0: lt.tau0,
          delta_obs: lt.delta_obs,
          delta_adm: lt.delta_adm,
          delta_avail: lt.delta_avail,
          nu_id: cd.nu_id,
          interval_ticks: cd.interval_ticks,
          nu: cd.nu,
        });
      }
    }
  }
  return deepFreeze(cells);
}

export const CONFIRMATORY_GRID_18 = buildFullConfirmatoryGrid();

const PILOT_SELECTED_IDS = new Set([
  'H_LOW__L0_IMMEDIATE__V_DELIBERATIVE',
  'H_LOW__L6_DELAYED__V_ACCELERATED',
  'H_MOD__L3_MODERATE__V_DELIBERATIVE',
  'H_MOD__L3_MODERATE__V_ACCELERATED',
  'H_HIGH__L0_IMMEDIATE__V_DELIBERATIVE',
  'H_HIGH__L6_DELAYED__V_ACCELERATED',
]);

export const PILOT_GRID_6 = deepFreeze(
  CONFIRMATORY_GRID_18.filter(c => PILOT_SELECTED_IDS.has(c.cell_id))
);
