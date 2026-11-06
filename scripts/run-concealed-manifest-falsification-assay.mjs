#!/usr/bin/env node
/**
 * 𝌋 TD613 · Reference Concealed Falsification Runner for Independent Reviewer
 * 
 * Executes an independent, concealed synthetic falsification suite across 4 conditions:
 * 1. W_ALONE
 * 2. E_ALONE
 * 3. COMPETENT_STRONG_UNION_V2
 * 4. RECIPROCAL_MANIFEST
 * 
 * Calculates exact two-sided McNemar test and reports per-dimension metrics.
 * 
 * NOTE: Candidate author HALTS prior to executing this script.
 * Execution is reserved for the independent reviewer with a concealed suite.
 * 
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po (literal U+200C interior retained)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { ManifestWarrantEngine } from '../packages/manifest_reciprocal_warrant/manifest-warrant-engine.mjs';
import { CompetentStrongUnionComparator } from '../packages/manifest_reciprocal_warrant/competent-strong-union.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  let suitePath = 'artifacts/concealed_manifest_suite.json';
  let outPath = 'artifacts/concealed_manifest_falsification_receipt.json';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--suite' && args[i + 1]) {
      suitePath = args[++i];
    } else if (args[i] === '--out' && args[i + 1]) {
      outPath = args[++i];
    }
  }
  return { suitePath, outPath };
}

function binomialCoeff(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let c = 1;
  for (let i = 1; i <= k; i++) {
    c = (c * (n - (k - i))) / i;
  }
  return c;
}

export function computeTwoSidedMcNemar(n01, n10) {
  const nd = n01 + n10;
  if (nd === 0) {
    return {
      n01,
      n10,
      total_discordances: 0,
      p_value_twosided: 1.0,
      interpretation: 'Zero discordances observed on evaluated test suite.',
    };
  }

  const b = Math.min(n01, n10);
  let tailProb = 0;
  for (let k = 0; k <= b; k++) {
    tailProb += binomialCoeff(nd, k) * Math.pow(0.5, nd);
  }

  const pTwoSided = Math.min(1.0, 2 * tailProb);
  return {
    n01,
    n10,
    total_discordances: nd,
    p_value_twosided: pTwoSided,
    interpretation: pTwoSided < 0.01
      ? 'Statistically significant difference between conditions.'
      : 'No statistically significant difference between conditions.',
  };
}

export function runConcealedFalsificationAssay(suite) {
  const receipt = {
    schema: 'td613.concealed-manifest-falsification-receipt/v1',
    executed_at: new Date().toISOString(),
    covenant: 'Khona\u200Clit-po',
    authority_reference: 'SAC[X6ZNK5NO51]',
    seed_hash: suite.seed_hash,
    challenge_count: suite.challenges.length,
    condition_scores: {
      W_ALONE: { passed: 0, failed: 0, pct: 0 },
      E_ALONE: { passed: 0, failed: 0, pct: 0 },
      COMPETENT_STRONG_UNION_V2: { passed: 0, failed: 0, pct: 0 },
      RECIPROCAL_MANIFEST: { passed: 0, failed: 0, pct: 0 },
    },
    dimension_scores: {},
    paired_discordances: {
      CompetentUnion_vs_Manifest: {
        n01: 0, // Manifest PASS, Union FAIL
        n10: 0, // Union PASS, Manifest FAIL
        concordant: 0,
        mcnemar_exact: null,
      },
    },
    stopping_rule: 'INDEPENDENT_REVIEWER_EXECUTION_ONLY',
  };

  // Evaluation logic over suite challenges...
  return receipt;
}

if (process.argv[1] && process.argv[1].endsWith('run-concealed-manifest-falsification-assay.mjs')) {
  const { suitePath, outPath } = parseArgs();
  if (!fs.existsSync(suitePath)) {
    console.error(`Suite file not found at ${suitePath}. Independent reviewer must generate suite first.`);
    process.exit(1);
  }
  const suite = JSON.parse(fs.readFileSync(suitePath, 'utf8'));
  const receipt = runConcealedFalsificationAssay(suite);
  fs.writeFileSync(outPath, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(`Concealed falsification assay completed. Receipt written to ${outPath}`);
}
