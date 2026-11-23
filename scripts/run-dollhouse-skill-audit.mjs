#!/usr/bin/env node

/**
 * @fileoverview TD613 Dollhouse Native Skill CLI Runner.
 *
 * Command-line entrypoint for the /dollhouse-audit Antigravity skill:
 *   node scripts/run-dollhouse-skill-audit.mjs [options]
 *
 * Options:
 *   --input, -i <path>        Path to input JSON audit specification (or read from stdin if piped)
 *   --role, -r <role>         Specialist role to execute (repeatable or comma-separated)
 *   --no-orchestrator         Skip Orchestrator adjudication
 *   --source, -s <rev>        Explicit target source revision
 *   --scope <task>            Declared task / audit scope
 *   --class <class>           Evidence class (e.g. SYNTHETIC_TEST_FIXTURE)
 *   --evidence, -e <ref>      Evidence reference (repeatable)
 *   --output, -o <path>       Output path for receipt artifact (.md or .json)
 *   --allow-overwrite, -w     Allow overwriting existing artifact file
 *   --strict-provenance       Enforce strict local git history check on source revision
 *   --format <mode>           Console output format: human (default), json, or both
 *   --help, -h                Show this help message
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runDollhouseSkillAudit, ALL_CANONICAL_ROLES } from '../app/engine/dollhouse-skill-dispatcher.js';

function printHelp() {
  console.log(`
TD613 Dollhouse Native Skill Audit Runner
Usage: node scripts/run-dollhouse-skill-audit.mjs [options]

Options:
  --input, -i <path>        Path to input JSON audit specification (or stream via stdin)
  --role, -r <role>         Specialist role to execute (repeatable or comma-separated: PEDAGOGUE, APERTURE, ATLAS, FADT, TEMPORAL_CUSTODIAN)
  --no-orchestrator         Skip Orchestrator adjudication (execute specialists standalone)
  --source, -s <rev>        Target source revision / commit SHA
  --scope <task>            Declared task and evaluation scope
  --class <class>           Evidence class (SYNTHETIC_TEST_FIXTURE, SOURCE_CODE_AUDIT, etc.)
  --evidence, -e <ref>      Evidence reference (repeatable)
  --output, -o <path>       Output path to save receipt artifact (.md, .json, or base path)
  --allow-overwrite, -w     Authorize overwriting existing artifact file
  --strict-provenance       Enforce strict local git history check on source revision
  --format <mode>           Console output format: 'human' (default), 'json', or 'both'
  --help, -h                Show this help message

Examples:
  # Run complete five-specialist audit with Orchestrator from JSON specification
  node scripts/run-dollhouse-skill-audit.mjs --input audit-spec.json

  # Stream specification via stdin for host-independent ChatGPT / API interoperability
  cat audit-spec.json | node scripts/run-dollhouse-skill-audit.mjs --format json

  # Run focused Atlas and FADT custody audit
  node scripts/run-dollhouse-skill-audit.mjs -r ATLAS -r FADT --scope "CUSTODY_RELATION_AUDIT"

  # Run standalone Pedagogue check with JSON console output
  node scripts/run-dollhouse-skill-audit.mjs -r PEDAGOGUE --no-orchestrator --format json
`);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', err => reject(err));
  });
}

async function parseArgs(args) {
  const options = {
    roles: [],
    include_orchestrator: true,
    evidence_references: [],
    format: 'human',
    input_file: null,
    output_file: null,
    allow_overwrite: false,
    strict_provenance: false,
    source_revision: null,
    task_scope: null,
    evidence_class: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      return options;
    }

    if (arg === '--input' || arg === '-i') {
      options.input_file = args[++i];
    } else if (arg === '--role' || arg === '-r') {
      const val = args[++i];
      if (val) {
        val.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).forEach(r => options.roles.push(r));
      }
    } else if (arg === '--no-orchestrator') {
      options.include_orchestrator = false;
    } else if (arg === '--source' || arg === '-s') {
      options.source_revision = args[++i];
    } else if (arg === '--scope') {
      options.task_scope = args[++i];
    } else if (arg === '--class') {
      options.evidence_class = args[++i];
    } else if (arg === '--evidence' || arg === '-e') {
      options.evidence_references.push(args[++i]);
    } else if (arg === '--output' || arg === '-o') {
      options.output_file = args[++i];
    } else if (arg === '--allow-overwrite' || arg === '-w') {
      options.allow_overwrite = true;
    } else if (arg === '--strict-provenance') {
      options.strict_provenance = true;
    } else if (arg === '--format') {
      options.format = String(args[++i] || 'human').toLowerCase();
    } else if (arg.startsWith('-')) {
      throw new Error(`Unrecognized option: ${arg}`);
    } else {
      throw new Error(`Unrecognized positional argument '${arg}'. Use --input or -i to supply an audit specification file.`);
    }
  }

  return options;
}

async function main() {
  const args = process.argv.slice(2);
  let cliOpts;
  try {
    cliOpts = await parseArgs(args);
  } catch (err) {
    if (args.includes('--format') && args[args.indexOf('--format') + 1] === 'json') {
      console.log(JSON.stringify({ error: err.message, code: 'CLI_USAGE_ERROR' }, null, 2));
    } else {
      console.error(`CLI Usage Error: ${err.message}`);
      printHelp();
    }
    process.exit(2);
  }

  if (cliOpts.help) {
    printHelp();
    process.exit(0);
  }

  let auditPayload = {};

  if (cliOpts.input_file) {
    try {
      const content = await readFile(resolve(cliOpts.input_file), 'utf8');
      auditPayload = JSON.parse(content);
    } catch (err) {
      if (cliOpts.format === 'json') {
        console.log(JSON.stringify({
          error: `Error reading input file (${cliOpts.input_file}): ${err.message}`,
          code: 'INPUT_FILE_READ_ERROR'
        }, null, 2));
      } else {
        console.error(`Error reading input file (${cliOpts.input_file}): ${err.message}`);
      }
      process.exit(2);
    }
  } else if (!process.stdin.isTTY) {
    // Read from piped stdin if available
    try {
      const stdinContent = await readStdin();
      if (stdinContent && stdinContent.trim()) {
        auditPayload = JSON.parse(stdinContent);
      }
    } catch (err) {
      if (cliOpts.format === 'json') {
        console.log(JSON.stringify({
          error: `Error parsing stdin JSON: ${err.message}`,
          code: 'STDIN_JSON_PARSE_ERROR'
        }, null, 2));
      } else {
        console.error(`Error parsing stdin JSON: ${err.message}`);
      }
      process.exit(2);
    }
  }

  // Caller input JSON allow_overwrite is untrusted and NEVER authorizes overwriting.
  // Overwrite authority requires explicit operator command line flag --allow-overwrite / -w.
  if (!cliOpts.allow_overwrite) {
    delete auditPayload.allow_overwrite;
    if (auditPayload.options) {
      delete auditPayload.options.allow_overwrite;
      delete auditPayload.options.operator_authorized_overwrite;
    }
  }

  // CLI flags override input JSON fields
  if (cliOpts.roles.length > 0) {
    auditPayload.roles = cliOpts.roles;
  }
  if (!cliOpts.include_orchestrator) {
    auditPayload.include_orchestrator = false;
  }
  if (cliOpts.source_revision) {
    auditPayload.source_revision = cliOpts.source_revision;
  }
  if (cliOpts.task_scope) {
    auditPayload.task_scope = cliOpts.task_scope;
  }
  if (cliOpts.evidence_class) {
    auditPayload.evidence_class = cliOpts.evidence_class;
  }
  if (cliOpts.evidence_references.length > 0) {
    auditPayload.evidence_references = [
      ...(auditPayload.evidence_references || []),
      ...cliOpts.evidence_references
    ];
  }
  if (cliOpts.output_file) {
    auditPayload.artifact_path = cliOpts.output_file;
  }
  if (cliOpts.allow_overwrite) {
    auditPayload.allow_overwrite = true;
    auditPayload.options = {
      ...(auditPayload.options || {}),
      allow_overwrite: true,
      operator_authorized_overwrite: true
    };
  }
  if (cliOpts.strict_provenance) {
    auditPayload.options = { ...(auditPayload.options || {}), strict_provenance: true };
  }

  const result = await runDollhouseSkillAudit(auditPayload);

  if (cliOpts.format === 'json') {
    console.log(JSON.stringify(result.machine_receipt, null, 2));
  } else if (cliOpts.format === 'both') {
    console.log(result.human_receipt);
    console.log('\n--- MACHINE RECEIPT JSON ---\n');
    console.log(JSON.stringify(result.machine_receipt, null, 2));
  } else {
    console.log(result.human_receipt);
  }

  process.exitCode = result.exit_code;
}

main().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
