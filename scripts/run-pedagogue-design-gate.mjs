import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';
import {
  PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
  compilePedagoguePracticeReview
} from '../app/engine/pedagogue-practice-fixture.js';

function usage() {
  process.stderr.write('Usage: node scripts/run-pedagogue-design-gate.mjs <fixture.json> [--json]\n');
}

function allTrue(record) {
  return Object.values(record).every((value) => value === true);
}

function printDesignReview(review, passed) {
  const delta = review.burden_comparison.delta_millipoints;
  process.stdout.write([
    `Pedagogue Design Gate: ${passed ? 'PASS' : 'HOLD'}`,
    `surface: ${review.surface_reference}`,
    `design: ${review.design_id}`,
    `phases: ${review.phases.join(' → ')}`,
    `AIA invariants: ${review.design_gate.aia_invariants_preserved ? 'preserved' : 'held'}`,
    `route burden: ${review.design_gate.route_burden_non_worsening ? 'non-worsening' : 'worsened'}`,
    `burden deltas: ${Object.entries(delta).map(([key, value]) => `${key}=${value}`).join(', ')}`,
    `rest/exit: ${review.design_gate.rest_and_exit_preserved ? 'preserved' : 'held'}`,
    'automatic redesign: forbidden',
    'human closure: required'
  ].join('\n') + '\n');
}

function printPracticeReview(review, passed) {
  const fixture = review.fixture;
  process.stdout.write([
    `Pedagogue Practice Fixture: ${passed ? 'PASS' : 'HOLD'}`,
    `surface: ${review.surface_reference}`,
    `fixture: ${review.fixture_id}`,
    `operator label: ${fixture.operator_label}`,
    `research posture: ${fixture.research_name}`,
    `expected route: ${fixture.expected_route_steps.join(' → ')}`,
    `runtime binding declared: ${fixture.runtime_binding_declared ? 'yes' : 'no'}`,
    'automatic retrieval: forbidden',
    'domain mutation: forbidden',
    'evidence authority: closed',
    'separate demo route: forbidden',
    'geometric holonomy claim: held',
    'human closure: required'
  ].join('\n') + '\n');
}

async function main() {
  const fixturePath = process.argv[2];
  if (!fixturePath || fixturePath.startsWith('-')) {
    usage();
    process.exitCode = 2;
    return;
  }
  const absolute = path.resolve(fixturePath);
  const fixture = JSON.parse(await readFile(absolute, 'utf8'));
  const practice = fixture.schema === PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA;
  const review = practice
    ? compilePedagoguePracticeReview(fixture)
    : await compilePedagogueDesignReview(fixture);
  const gate = practice ? review.practice_gate : review.design_gate;
  const passed = allTrue(gate);

  if (process.argv.includes('--json')) process.stdout.write(`${JSON.stringify(review, null, 2)}\n`);
  else if (practice) printPracticeReview(review, passed);
  else printDesignReview(review, passed);

  if (!passed) process.exitCode = 1;
}

const invoked = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invoked === import.meta.url) await main();
