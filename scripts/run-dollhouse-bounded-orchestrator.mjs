#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runBoundedDollhouseOrchestrator } from '../app/engine/dollhouse-bounded-orchestrator.js';

try {
  if (process.argv.length !== 3) throw new TypeError('Usage: node scripts/run-dollhouse-bounded-orchestrator.mjs <case.json>');
  if (statSync(process.argv[2]).size > 4 * 1024 * 1024) throw new TypeError('Case exceeds the 4 MiB local input bound.');
  const bytes = readFileSync(process.argv[2]);
  const result = runBoundedDollhouseOrchestrator(JSON.parse(bytes.toString('utf8')));
  console.log(JSON.stringify({ input_sha256: createHash('sha256').update(bytes).digest('hex'), source_authentication: 'UNVERIFIED_DECLARATION', result }, null, 2));
  process.exitCode = result.recommendation === 'HELD' ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({ status: 'HELD_INVALID_INPUT', error: error.message, provider_calls: 0 }));
  process.exitCode = 2;
}
