import assert from 'assert/strict';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import personas from '../app/data/personas.js';
import {
  AU_FORGED_ONTOLOGY,
  summarizeAUForgedOntology
} from '../app/engine/au-forged-ontology.js';
import {
  buildCadenceTransfer,
  extractCadenceProfile
} from '../app/engine/stylometry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const summary = summarizeAUForgedOntology(AU_FORGED_ONTOLOGY);
assert.equal(summary.personaCount, personas.length, 'runtime forge payload exposes every built-in persona');
assert.ok(summary.phraseCount >= 8, 'runtime forge payload exposes the compact TCP phrase bank');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-au-forge-'));
const fixturePath = path.join(tempDir, 'au-forged-ontology.mjs');
execFileSync(process.execPath, ['scripts/forge-ontology.mjs', '--fixture'], {
  cwd: repoRoot,
  stdio: 'pipe',
  env: {
    ...process.env,
    AU_FORGE_OUTPUT: fixturePath,
    AU_FORGE_LIMIT_PHRASES: '2'
  }
});

const { AU_FORGED_ONTOLOGY: fixturePayload } = await import(`${pathToFileURL(fixturePath).href}?t=${Date.now()}`);
assert.equal(fixturePayload.personas.length, personas.length, 'fresh fixture forge keeps every current mask');
assert.equal(fixturePayload.phraseBank.length, 2, 'fixture forge respects phrase limiting');
for (const persona of fixturePayload.personas) {
  assert.equal(persona.variations.length, 20, `${persona.personaId}: fixture forge emits 10 variations per phrase`);
  const byPhrase = persona.variations.reduce((acc, variation) => {
    acc[variation.phraseId] = (acc[variation.phraseId] || 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(Object.values(byPhrase).sort((a, b) => a - b), [10, 10], `${persona.personaId}: each phrase has exactly 10 variations`);
}

const spark = personas.find((persona) => persona.id === 'spark');
const result = buildCadenceTransfer('Initiate transfer.', {
  mode: 'persona',
  personaId: spark.id,
  profile: extractCadenceProfile(spark.voicePromise),
  registerLane: 'professional-message',
  strength: 0.9
}, {
  retrieval: true,
  auForgedOntology: fixturePayload
});
const forgeEntries = (result.candidateLedger || []).filter((entry) => entry.family === 'au-forged-ontology');
assert.ok(forgeEntries.length >= 1, 'forged ontology candidates enter the generator ledger');
assert.ok(
  forgeEntries.every((entry) => entry.forgeSource && entry.phraseId && entry.personaId && entry.variationId && entry.forgeRisk),
  'forged candidates carry source, phrase, persona, variation, and risk metadata'
);

const localOnlySources = [
  fs.readFileSync(path.join(repoRoot, 'scripts', 'forge-ontology.mjs'), 'utf8'),
  fs.readFileSync(path.join(repoRoot, 'scripts', 'run-au-signal-audit.mjs'), 'utf8'),
  fs.readFileSync(path.join(repoRoot, 'app', 'engine', 'learned-audit.js'), 'utf8')
].join('\n');
assert.equal(/anthropic|claude|ANTHROPIC_API_KEY|api\.openai\.com|api\.anthropic\.com/i.test(localOnlySources), false, 'AU forge/audit path contains no cloud LLM API or secret dependency');

fs.rmSync(tempDir, { recursive: true, force: true });

console.log('au-forged-ontology.test.mjs passed');
