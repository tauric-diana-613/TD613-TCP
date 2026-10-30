// TD613 Experiment B · Arm 0 Transport Baseline
// Tests raw byte preservation across an actual I/O roundtrip transport boundary.
// Verifies exact byte counts and SHA-256 identity, including Unicode/non-ASCII edge cases (U+200C).
// Confirms zero cognitive, relational, or semantic operations.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function runArm0Transport(fixturesDir) {
  const log = [];
  function record(msg) {
    const l = `[${new Date().toISOString()}] [ARM-0-TRANSPORT] ${msg}`;
    log.push(l);
    return l;
  }

  record('=== EXECUTING ARM 0: ENHANCED TRANSPORT-ONLY BASELINE ===');
  record('Testing physical raw-byte persistence across filesystem I/O boundary.');

  const fixtureFiles = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.json'));
  const ledger = [];

  // Temporary transport boundary directory
  const tempDir = path.resolve('.tmp_arm0_transport');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  for (const file of fixtureFiles) {
    const srcPath = path.join(fixturesDir, file);
    const rawSrcBytes = fs.readFileSync(srcPath);
    const srcSha = crypto.createHash('sha256').update(rawSrcBytes).digest('hex');

    // Transport operation: write across I/O boundary
    const destPath = path.join(tempDir, file);
    fs.writeFileSync(destPath, rawSrcBytes);

    // Read back across boundary
    const rawDestBytes = fs.readFileSync(destPath);
    const destSha = crypto.createHash('sha256').update(rawDestBytes).digest('hex');

    const bytePreserved = rawSrcBytes.length === rawDestBytes.length && srcSha === destSha;

    ledger.push({
      fixture_file: file,
      source_bytes: rawSrcBytes.length,
      destination_bytes: rawDestBytes.length,
      source_sha256: srcSha,
      destination_sha256: destSha,
      byte_identical: bytePreserved
    });

    record(`Transported ${file}: bytes=${rawSrcBytes.length}, sha=${srcSha.slice(0, 16)}... -> match=${bytePreserved}`);
  }

  // Clean up transport directory
  fs.rmSync(tempDir, { recursive: true, force: true });

  const totalBytes = ledger.reduce((sum, b) => sum + b.source_bytes, 0);
  const allIdentical = ledger.every(b => b.byte_identical);

  record(`Transport complete: ${totalBytes} bytes across ${ledger.length} files. All byte identical: ${allIdentical}`);
  record('Zero autonomous hypotheses. Zero crosswalks. Zero semantic operations.');

  return {
    arm: 'ARM_0_TRANSPORT_ONLY',
    transport_ledger: ledger,
    total_bytes: totalBytes,
    all_byte_identical: allIdentical,
    autonomous_hypotheses: 0,
    warranted_citations: 0,
    epistemic_revisions: 0,
    falsifications_detected: 0,
    abstentions: 0,
    novel_grounded_relations: 0,
    trace_log: log
  };
}
