#!/usr/bin/env node
/**
 * 𝌋 TD613 · Reference Concealed Challenge Generator for Independent Reviewer
 * 
 * Generates an independent, concealed synthetic falsification suite of N >= 24 challenges
 * parameterized by an undisclosed reviewer seed. Evaluates all 8 preregistered dimensions:
 * 1. Correctly grounded claims
 * 2. False corroboration
 * 3. Circularity detection
 * 4. Source-withdrawal propagation
 * 5. Preservation of evidentiary history
 * 6. Accuracy of source & acquisition attribution
 * 7. Route-dependent operator-relevant information
 * 8. Unique reciprocal interaction operations
 * 
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po (literal U+200C interior retained)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function parseArgs() {
  const args = process.argv.slice(2);
  let seed = `reviewer_secret_${Date.now()}`;
  let count = 24;
  let outPath = 'artifacts/concealed_manifest_suite.json';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed' && args[i + 1]) {
      seed = args[++i];
    } else if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[++i], 10);
    } else if (args[i] === '--out' && args[i + 1]) {
      outPath = args[++i];
    }
  }
  return { seed, count, outPath };
}

function prng(seedStr, counter) {
  const hash = crypto.createHash('sha256').update(`${seedStr}:${counter}`).digest('hex');
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff;
}

export function generateConcealedSuite({ seed, count = 24 }) {
  const suite = {
    schema: 'td613.concealed-manifest-falsification-suite/v1',
    generated_at: new Date().toISOString(),
    covenant: 'Khona\u200Clit-po',
    authority_reference: 'SAC[X6ZNK5NO51]',
    seed_hash: crypto.createHash('sha256').update(seed).digest('hex'),
    challenge_count: count,
    dimensions_covered: [
      'D1_CORRECTLY_GROUNDED_CLAIMS',
      'D2_FALSE_CORROBORATION_REJECTION',
      'D3_CIRCULARITY_DETECTION',
      'D4_SOURCE_WITHDRAWAL_PROPAGATION',
      'D5_PRESERVATION_OF_EVIDENTIARY_HISTORY',
      'D6_ACCURACY_OF_ATTRIBUTION',
      'D7_ROUTE_DEPENDENT_OPERATOR_INFORMATION',
      'D8_UNIQUE_RECIPROCAL_OPERATIONS',
    ],
    challenges: [],
  };

  const DIMENSIONS = [
    'D1_CORRECTLY_GROUNDED_CLAIMS',
    'D2_FALSE_CORROBORATION_REJECTION',
    'D3_CIRCULARITY_DETECTION',
    'D4_SOURCE_WITHDRAWAL_PROPAGATION',
    'D5_PRESERVATION_OF_EVIDENTIARY_HISTORY',
    'D6_ACCURACY_OF_ATTRIBUTION',
    'D7_ROUTE_DEPENDENT_OPERATOR_INFORMATION',
    'D8_UNIQUE_RECIPROCAL_OPERATIONS',
  ];

  for (let i = 0; i < count; i++) {
    const dim = DIMENSIONS[i % DIMENSIONS.length];
    const randVal = prng(seed, i);
    const caseId = `CONCEALED_${String(i + 1).padStart(3, '0')}_${dim}`;

    suite.challenges.push({
      case_id: caseId,
      dimension: dim,
      index: i + 1,
      synthetic_entropy: crypto.createHash('sha256').update(`${seed}:${i}`).digest('hex').slice(0, 16),
      parameters: {
        depth: 1 + Math.floor(randVal * 6),
        conjunction_size: 1 + Math.floor(prng(seed, i + 100) * 3),
        cycle_present: dim === 'D3_CIRCULARITY_DETECTION' || prng(seed, i + 200) > 0.7,
        duplicate_acquisition: dim === 'D2_FALSE_CORROBORATION_REJECTION' || prng(seed, i + 300) > 0.8,
        withdrawal_target: dim === 'D4_SOURCE_WITHDRAWAL_PROPAGATION' ? 'root:r1' : null,
      },
      evaluation_protocol: 'INDEPENDENT_ORACLE_BLIND_COMPARISON',
    });
  }

  return suite;
}

if (process.argv[1] && process.argv[1].endsWith('generate-concealed-manifest-falsification-suite.mjs')) {
  const { seed, count, outPath } = parseArgs();
  const suite = generateConcealedSuite({ seed, count });
  const fullPath = path.resolve(outPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(suite, null, 2), 'utf8');
  console.log(`Generated concealed falsification suite with ${count} challenges at ${fullPath} (seed hash: ${suite.seed_hash})`);
}
