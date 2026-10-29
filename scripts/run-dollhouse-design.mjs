#!/usr/bin/env node

/**
 * @fileoverview TD613 Dollhouse Native Design Skill CLI Runner.
 *
 * Command-line entrypoint for the /dollhouse-design Antigravity skill:
 *   node scripts/run-dollhouse-design.mjs [options]
 *
 * Options:
 *   --seed, -s <seed>          Intellectual seed / core inquiry
 *   --medium, -m <medium>      Output medium (VISUAL, MOTION, SCHOLARLY, THEORETICAL, PRODUCT, HYBRID)
 *   --instrument, -i <inst>    Selectable instrument (repeatable: PHASONIC_COUNTERPOINT, CARO_INSTITUTIONAL_RECONSTRUCTION, etc.)
 *   --deliverable-count <n>    Operator-requested number of finished artifacts (default 1)
 *   --input <path>             Path to full JSON commission specification
 *   --output, -o <path>        Path to write the resulting design receipt
 *   --audit                    Request advisory /dollhouse-audit check
 *   --format <mode>            Console output format: human (default), json, or both
 *   --help, -h                 Show this help message
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runDollhouseDesignCycle, AVAILABLE_INSTRUMENTS } from '../app/engine/dollhouse-design-conductor.js';

function printHelp() {
  console.log(`
TD613 Dollhouse Native Design Skill Runner (DD-02)
Usage:
  node scripts/run-dollhouse-design.mjs [options]
  cat commission.json | node scripts/run-dollhouse-design.mjs --stdin

Options:
  --seed, -s <seed>          Intellectual seed / core inquiry
  --medium, -m <medium>      Output medium: VISUAL, MOTION, SCHOLARLY, THEORETICAL, PRODUCT, HYBRID (default: SCHOLARLY)
  --instrument, -i <inst>    Selectable instrument (repeatable; if omitted, contextually inferred from seed; defaults to PHASONIC_COUNTERPOINT if ambiguous)
                             Available: ${Object.keys(AVAILABLE_INSTRUMENTS).join(', ')}
  --deliverable-count <n>    Requested finished artifacts (default 1; internal alternatives do not count)
  --input <path>             Path to JSON commission file (or "-" for stdin)
  --stdin                    Read full JSON commission from standard input stream
  --output, -o <path>        Path to write return receipt (.json)
  --audit                    Include advisory /dollhouse-audit check
  --format <mode>            Output format: human (default), json, or both
  --help, -h                 Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  let seed = null;
  let medium = 'SCHOLARLY';
  let deliverableCount = 1;
  let instruments = [];
  let inputPath = null;
  let outputPath = null;
  let format = 'human';
  let audit = false;
  let useStdin = args.includes('--stdin');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--seed' || arg === '-s') {
      seed = args[++i];
    } else if (arg === '--medium' || arg === '-m') {
      medium = args[++i];
    } else if (arg === '--instrument' || arg === '-i') {
      instruments.push(args[++i]);
    } else if (arg === '--deliverable-count') {
      deliverableCount = Number(args[++i]);
    } else if (arg === '--input') {
      inputPath = args[++i];
    } else if (arg === '--stdin') {
      useStdin = true;
    } else if (arg === '--output' || arg === '-o') {
      outputPath = args[++i];
    } else if (arg === '--format') {
      format = args[++i];
    } else if (arg === '--audit') {
      audit = true;
    }
  }

  let commissionInput = {};
  if (inputPath === '-' || useStdin || (!inputPath && !seed && !process.stdin.isTTY)) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const rawContent = Buffer.concat(chunks).toString('utf8').trim();
    if (!rawContent) {
      console.error('Error: Empty standard input provided');
      process.exit(1);
    }
    commissionInput = JSON.parse(rawContent);
  } else if (inputPath) {
    const rawContent = await readFile(resolve(process.cwd(), inputPath), 'utf8');
    commissionInput = JSON.parse(rawContent);
  } else {
    if (!seed) {
      console.error('Error: Must supply --seed, --input <file.json>, or stream via --stdin');
      printHelp();
      process.exit(1);
    }
    commissionInput = {
      seed,
      medium,
      deliverable_count: deliverableCount,
      instruments: instruments.length > 0 ? instruments : undefined,
      scientific_audit_requested: audit
    };
  }

  // CLI flag precedence over file/stdin input (R01.2)
  if (audit) {
    commissionInput.scientific_audit_requested = true;
  }
  if (args.includes('--deliverable-count')) {
    commissionInput.deliverable_count = deliverableCount;
  }
  if (seed) {
    commissionInput.seed = seed;
  }
  if (args.includes('--medium') || args.includes('-m')) {
    commissionInput.medium = medium;
  }
  if (instruments.length > 0) {
    commissionInput.instruments = instruments;
  }

  try {
    const receipt = await runDollhouseDesignCycle(commissionInput);

    if (format === 'json' || format === 'both') {
      console.log(JSON.stringify(receipt, null, 2));
    }

    if (format === 'human' || format === 'both') {
      console.log('\n======================================================');
      console.log(`  𝌋 TD613 DOLLHOUSE DESIGN RETURN · ${receipt.commission_id}`);
      console.log('======================================================');
      console.log(`SEED:                 ${receipt.seed}`);
      console.log(`MEDIUM:               ${receipt.medium}`);
      console.log(`INSTRUMENTS:          ${receipt.selected_instruments.join(', ')}`);
      console.log(`FINAL DELIVERABLES:   ${receipt.output_contract.requested_deliverables} (operator-defined; default 1)`);
      console.log('\n--- CANDIDATE PROPOSITIONS ---');
      receipt.candidates.forEach((c, idx) => {
        console.log(`[Candidate ${idx === 0 ? 'A' : 'B'}: ${c.concept_title}] (${c.governing_instrument})`);
        console.log(`  Formal Proposition: ${c.formal_proposition}`);
        console.log(`  Consequence:        ${c.medium_consequence}`);
      });
      console.log('\n--- PRIMARY MATERIALIZATION ---');
      console.log(`Title: ${receipt.primary_materialization.title}`);
      receipt.primary_materialization.operative_verbs.forEach(v => {
        console.log(`  • ${v.verb.padEnd(14)}: ${v.action}`);
      });
      console.log('\n--- INTERNAL REFRACTION (NOT A DELIVERABLE) ---');
      console.log(`Mutated Parameter:    ${receipt.refractive_variant.mutated_parameter}`);
      console.log(`Formal Consequence:   ${receipt.refractive_variant.formal_consequence}`);
      if (receipt.scientific_companion_audit) {
        console.log('\n--- SCIENTIFIC COMPANION AUDIT (ADVISORY) ---');
        console.log(`Disposition:          ${receipt.scientific_companion_audit.disposition}`);
        console.log(`Exit Code:            ${receipt.scientific_companion_audit.exit_code}`);
        console.log(`Consensus:            ${receipt.scientific_companion_audit.consensus || 'NONE'}`);
        if (receipt.scientific_companion_audit.missing_inputs?.length > 0) {
          console.log(`Missing Inputs:       ${receipt.scientific_companion_audit.missing_inputs.join(', ')}`);
        }
        if (receipt.scientific_companion_audit.detected_infractions?.length > 0) {
          console.log(`Infractions:          ${receipt.scientific_companion_audit.detected_infractions.join(', ')}`);
        }
      }
      console.log('\n--- GOVERNANCE & AUTHORITY ---');
      console.log(`Discourse Mode:       ${receipt.governance.discourse_mode}`);
      console.log(`Scientific Proof:     ${receipt.governance.scientific_proof}`);
      console.log(`Palate Status:        ${receipt.governance.palate_status}`);
      console.log(`Human Closure:        ${receipt.governance.human_closure_required ? 'REQUIRED' : 'FALSE'}`);
      console.log('======================================================\n');
    }

    if (outputPath) {
      await writeFile(resolve(process.cwd(), outputPath), JSON.stringify(receipt, null, 2), 'utf8');
      console.log(`Design receipt written to: ${outputPath}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(`Design execution failed: ${err.message}`);
    process.exit(1);
  }
}

main();
