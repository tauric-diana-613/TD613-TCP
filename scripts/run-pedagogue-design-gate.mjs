import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';

function usage() {
  process.stderr.write('Usage: node scripts/run-pedagogue-design-gate.mjs <fixture.json> [--json]\n');
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
  const review = await compilePedagogueDesignReview(fixture);
  const passed = Object.values(review.design_gate).every((value) => value === true);
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(review, null, 2)}\n`);
  } else {
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
      `automatic redesign: forbidden`,
      `human closure: required`
    ].join('\n') + '\n');
  }
  if (!passed) process.exitCode = 1;
}

const invoked = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invoked === import.meta.url) await main();
