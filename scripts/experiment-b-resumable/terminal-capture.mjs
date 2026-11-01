import path from 'node:path';
import crypto from 'node:crypto';
import { digest } from './journal.mjs';
import { parseCodexEvents } from '../experiment-b-codex-exec-adapter.mjs';

export function requireCaptureService(service) {
  if (!['prepare', 'collect', 'verify'].every(name => typeof service?.[name] === 'function')) {
    throw Object.assign(Error('CAPTURE_AUTHORITY_REQUIRED'), { code: 'CAPTURE_AUTHORITY_REQUIRED' });
  }
}

// The external service owns exclusive creation, restricted ACLs, anti-reuse and
// file/CLI observation. It is independently inventoried in the frozen runtime.
export async function capturedNativeCall({ service, spawnNative, args, request, executableSHA256 }) {
  requireCaptureService(service);
  if (!/^[a-f0-9]{64}$/.test(executableSHA256 ?? '') || !request.attempt || typeof request.capture !== 'function') throw Error('CAPTURE_BINDING_REQUIRED');
  const dispatchId = crypto.randomUUID();
  const binding = { dispatchId, attempt: request.attempt, executableSHA256 };
  const ticket = await service.prepare(binding);
  if (!ticket?.captureId || !path.isAbsolute(ticket.outputFile ?? '') || ticket.dispatchId !== dispatchId) throw Error('CAPTURE_TICKET_REJECTED');
  const stdout = [], stderr = [];
  const capture = (channel, bytes) => {
    if (!['stdout', 'stderr'].includes(channel)) throw Error('UNEXPECTED_CAPTURE_CHANNEL');
    const chunk = Buffer.from(bytes);
    // Journal callback commits before the wrapper receives acknowledgement.
    request.capture(channel, chunk);
    (channel === 'stdout' ? stdout : stderr).push(chunk);
  };
  const nativeArgs = [...args];
  nativeArgs.splice(nativeArgs.length - 1, 0, '--output-last-message', ticket.outputFile);
  const run = await spawnNative({ executable: 'codex', args: nativeArgs, input: request.rendered.prompt, capture, dispatchId });
  if (run.exitCode !== 0 || typeof run.stdout !== 'string' || typeof run.stderr !== 'string') throw Error('NATIVE_TERMINAL_RESULT_UNVERIFIED');
  if (!Buffer.concat(stdout).equals(Buffer.from(run.stdout)) || !Buffer.concat(stderr).equals(Buffer.from(run.stderr))) throw Error('DURABLE_CAPTURE_MISMATCH');
  const parsed = parseCodexEvents(run.stdout);
  const final = await service.collect({ ...binding, ticket });
  if (!Buffer.isBuffer(final?.bytes) || final.bytes.length > 16 * 1024 * 1024 || !Buffer.from(parsed.output).equals(final.bytes)) throw Error('TERMINAL_FINAL_BYTES_CONFLICT');
  const evidence = { ...binding, captureId: ticket.captureId, outputFile: ticket.outputFile,
    threadId: parsed.thread_id, exitCode: run.exitCode, jsonlSHA256: digest(Buffer.from(run.stdout)),
    stderrSHA256: digest(Buffer.from(run.stderr)), finalSHA256: digest(final.bytes) };
  if (await service.verify(evidence, final.proof) !== true) throw Error('TERMINAL_CAPTURE_AUTHORITY_REJECTED');
  request.capture('final', final.bytes);
  return { run, parsed, args: nativeArgs, finalEvidence: { ...evidence, finalBase64: final.bytes.toString('base64'), proof: final.proof } };
}
