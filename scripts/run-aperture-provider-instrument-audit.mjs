#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { auditProviderInstrumentState } from '../app/engine/aperture-v32-provider-instrument-audit.js';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('usage: node scripts/run-aperture-provider-instrument-audit.mjs <fixture.json>');
  process.exit(2);
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
} catch (error) {
  console.error(JSON.stringify({
    schema: 'td613.aperture.provider-instrument-run/v0.1',
    ok: false,
    error: 'fixture-read-or-json-failure',
    detail: String(error?.name || 'Error')
  }, null, 2));
  process.exit(2);
}

const rawCases = Array.isArray(parsed?.cases)
  ? parsed.cases
  : [{ id: parsed?.id || 'provider-instrument', input: parsed?.input || parsed }];

const cases = rawCases.map((entry, index) => ({
  id: String(entry?.id || `case-${index + 1}`),
  evidence_class: String(entry?.evidence_class || 'DECLARED_SYNTHETIC_OR_REPOSITORY_OBSERVATION'),
  receipt: auditProviderInstrumentState(entry?.input || entry || {})
}));

const output = {
  schema: 'td613.aperture.provider-instrument-run/v0.1',
  aperture_version: 'v3.2-alpha',
  source_fixture: path.relative(process.cwd(), path.resolve(inputPath)),
  provider_calls: 0,
  routing_mutations: 0,
  release_actions: 0,
  cases,
  claim_ceiling: 'offline-declared-state-audit-not-provider-health-quality-availability-or-model-removal-proof'
};

console.log(JSON.stringify(output, null, 2));
