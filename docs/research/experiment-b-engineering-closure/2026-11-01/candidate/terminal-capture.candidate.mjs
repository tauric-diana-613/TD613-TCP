import crypto from 'node:crypto';
import { parseCodexEvents } from './pr1620-adapter.mjs';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

// Pure verifier only. Capture acquisition and authority remain external prerequisites.
// A live CLI witness must establish byte encoding/newline and final-file semantics.
export function verifyTerminalCapture({ stdout, finalBytes, stderrBytes, exitCode, dispatchId, proof }, authority) {
  if (exitCode !== 0 || typeof stdout !== 'string' || !Buffer.isBuffer(finalBytes) ||
      !Buffer.isBuffer(stderrBytes) || !dispatchId || finalBytes.length > 16 * 1024 * 1024) {
    throw Error('TERMINAL_CAPTURE_INCOMPLETE_HOLD');
  }
  const parsed = parseCodexEvents(stdout);
  if (!Buffer.from(parsed.output, 'utf8').equals(finalBytes)) throw Error('TERMINAL_BYTES_CONFLICT_HOLD');
  const binding = Object.freeze({ dispatchId, threadId: parsed.thread_id, exitCode,
    jsonlSHA256: sha(Buffer.from(stdout, 'utf8')), finalSHA256: sha(finalBytes),
    stderrSHA256: sha(stderrBytes), finalBytes: finalBytes.length });
  // Service verifies the exact dispatch's fresh, exclusive output file and complete
  // captured streams, terminal status, CLI digest and previously accepted semantics.
  // A caller-supplied Boolean/JSON field is not consulted as authorization.
  if (authority?.verifyCapture?.(binding, proof) !== true) throw Error('AUTHENTIC_CAPTURE_WITNESS_REQUIRED');
  return { binding, response: parsed.output, usage: parsed.usage_reported, evidenceClass: 'EXTERNAL_CAPTURE_VERIFIED' };
}
