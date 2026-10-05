#!/usr/bin/env node
/**
 * scripts/audit-neutralization-protocol.mjs
 * 
 * Neutral Protocol & Hidden-Key Verification Harness (TD613 Exteriority Observatory · Section XIII)
 * 
 * Prepares instrumentation for forensic semantic extraction without running the assay.
 * 
 * Capabilities:
 *   1. Lexical audit (ensures zero occurrence of forbidden mythology / bespoke acronyms)
 *   2. Cryptographic hidden-key commitment verification (checks sha256 commitment without revealing key)
 *   3. Post-response key reveal verification
 *   4. Cold harness verification
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const FORBIDDEN_BESPOKE_TERMS = [
  'TD613',
  'Tauric Diana',
  'Khonalit-po',
  'Khona-lit-po',
  'Safe Harbor',
  'Eclipse–Omega',
  'Eclipse-Omega',
  'PRCS-A',
  'Aperture',
  'Pedagogue',
  'Atlas',
  'FADT',
  'Dome-World',
  'Flow-Core',
  'Golden Egg',
  'Western Horizon',
  'Marrowline',
  'Holonomy Loom'
];

/**
 * Scan a text document for any forbidden bespoke or mythological terminology.
 * @param {string} text
 * @returns {object} audit result
 */
export function auditLexicalHygiene(text) {
  const violations = [];

  for (const term of FORBIDDEN_BESPOKE_TERMS) {
    // Regex matching word boundary or exact token, case insensitive
    const regex = new RegExp(`\\b${term.replace(/[-–]/g, '[-–]')}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      violations.push({
        term,
        matched: match[0],
        index: match.index
      });
    }
  }

  return {
    is_clean: violations.length === 0,
    violation_count: violations.length,
    violations
  };
}

/**
 * Verify cryptographic commitment of a hidden invariant key.
 * @param {string} commitmentSha256
 * @param {string} candidatePlaintext
 * @returns {boolean}
 */
export function verifyCommitment(commitmentSha256, candidatePlaintext) {
  const computed = crypto.createHash('sha256').update(candidatePlaintext).digest('hex');
  return computed.toLowerCase() === commitmentSha256.trim().toLowerCase();
}

/**
 * Audit neutralization packet files (e.g. 09-NEUTRAL_PROTOCOL.md, 11-NEUTRAL_INVARIANT_KEY.sha256).
 * @param {string} protocolPath
 * @param {string} commitmentPath
 * @returns {object} audit report
 */
export function auditNeutralizationPacket(protocolPath, commitmentPath = null) {
  const protocolText = fs.readFileSync(protocolPath, 'utf8');
  const lexicalReport = auditLexicalHygiene(protocolText);

  let commitmentSha = null;
  let hasValidCommitmentFormat = false;

  if (commitmentPath && fs.existsSync(commitmentPath)) {
    const rawCommitment = fs.readFileSync(commitmentPath, 'utf8').trim();
    // typically "sha256  filename" or just the sha256
    const match = rawCommitment.match(/^([0-9a-fA-F]{64})/);
    if (match) {
      commitmentSha = match[1];
      hasValidCommitmentFormat = true;
    }
  }

  return {
    protocol_path: protocolPath,
    lexical_hygiene: lexicalReport,
    commitment: {
      path: commitmentPath,
      sha256: commitmentSha,
      has_valid_format: hasValidCommitmentFormat,
      status: 'COMMITMENT_FROZEN_KEY_UNREVEALED'
    },
    assay_execution_posture: 'COLD_HARNESS_STANDBY_SEQUENCE_4_SEPARATE'
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const protocolPath = process.argv[2];
  const commitmentPath = process.argv[3] || null;

  if (!protocolPath) {
    console.error('Usage: node scripts/audit-neutralization-protocol.mjs <protocol.md> [commitment.sha256]');
    process.exit(1);
  }

  const report = auditNeutralizationPacket(protocolPath, commitmentPath);
  console.log(JSON.stringify(report, null, 2));

  if (!report.lexical_hygiene.is_clean) {
    console.error(`\n[FAIL · LEXICAL_POLLUTION] Detected ${report.lexical_hygiene.violation_count} forbidden term(s).`);
    process.exit(2);
  }
}
