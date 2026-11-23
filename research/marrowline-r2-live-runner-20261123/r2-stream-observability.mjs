// TD613 · Marrowline R2 · Non-Mutating SSE Stream Watchdog & Observability Instrumentation
// Commission: TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123
// Predecessor: a48d2556ed946e01d4925dee93c463c73712d590 (PR #1783, R2-U pilot r2_r2u_036ef18ebc2e)
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// BOUNDARY: Never modifies wire bytes forwarded to disk/dual-parsers and NEVER imposes artificial output-token ceilings.

export const R2_STREAM_OBSERVABILITY_SCHEMA = 'td613.marrowline.r2-stream-observability/v1';

function nsToMs(ns) {
  return Number((Number(ns) / 1_000_000).toFixed(3));
}

function nowIso() {
  return new Date().toISOString();
}

export class R2StreamObservabilityAbortError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'StreamInactivityAbortError';
    this.code = code;
    if (details) this.details = details;
  }
}

/**
 * Wraps a streaming Fetch Response in a byte-identical pass-through ReadableStream
 * with monotonic hrtime observability separating:
 *   1. Active server thinking / candidate generation
 *   2. Transport silence / inactivity warnings (and optional operator-configured abort)
 *   3. Post-finishReason missing-EOF watchdog (closes cleanly without losing terminal frame)
 *   4. Operator abort pass-through
 */
export function instrumentSseResponseForObservability({
  response,
  slotId = 'UNKNOWN_SLOT',
  episodeId = 1,
  attemptId = 1,
  operatorAbortSignal = null,
  onProgress = null,
  heartbeatIntervalMs = 5000,
  inactivityWarnMs = 30000,
  inactivityAbortMs = null,
  postFinishEofTimeoutMs = 15000
} = {}) {
  const upstreamReader = response?.body?.getReader?.();
  if (!upstreamReader) {
    return {
      response,
      getDiagnostics: () => null
    };
  }

  const resolvedHeartbeatMs = Number.isFinite(heartbeatIntervalMs) && heartbeatIntervalMs > 0
    ? Math.max(10, Math.floor(heartbeatIntervalMs))
    : 5000;
  const resolvedWarnMs = Number.isFinite(inactivityWarnMs) && inactivityWarnMs > 0
    ? Math.max(15, Math.floor(inactivityWarnMs))
    : 30000;
  const resolvedAbortMs = (
    inactivityAbortMs !== null
    && inactivityAbortMs !== undefined
    && Number.isFinite(inactivityAbortMs)
    && inactivityAbortMs > 0
  )
    ? Math.max(25, Math.floor(inactivityAbortMs))
    : null;
  const resolvedPostFinishMs = Number.isFinite(postFinishEofTimeoutMs) && postFinishEofTimeoutMs > 0
    ? Math.max(20, Math.floor(postFinishEofTimeoutMs))
    : 15000;

  const tStartNs = process.hrtime.bigint();
  let tFirstByteNs = null;
  let tLastByteNs = null;
  let tLastSseEventNs = null;
  let tFinishReasonNs = null;
  let tEofNs = null;
  let tEndNs = null;

  let bytesReceived = 0;
  let chunkCount = 0;
  let sseFrameCount = 0;
  let dtFrameMaxMs = 0;
  let observedFinishReason = null;
  let terminalDelimiterSeen = false;
  let eofObserved = false;
  let postFinishEofTimeoutTriggered = false;
  let inactivityAbortTriggered = false;
  let operatorAborted = false;
  let streamReadError = null;
  let closed = false;

  let prevCandidateTokens = 0;
  let prevThoughtsTokens = 0;
  let latestUsageTokens = null;
  const inactivityWarnings = [];
  let silenceEpisodeOpen = false;

  const observerDecoder = new TextDecoder('utf-8', { fatal: false });
  let lineCarry = '';
  let currentFrameDataLines = [];

  const emitProgress = (msg) => {
    if (typeof onProgress === 'function') {
      try { onProgress(msg); } catch { /* non-blocking listener safety */ }
    }
  };

  let heartbeatTimer = null;
  let warnTimer = null;
  let abortTimer = null;
  let postFinishTimer = null;
  let forceTrigger = null;

  const clearTimer = (t) => {
    if (t) clearTimeout(t);
    return null;
  };

  const cleanupTimers = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    warnTimer = clearTimer(warnTimer);
    abortTimer = clearTimer(abortTimer);
    postFinishTimer = clearTimer(postFinishTimer);
  };

  const schedulePostFinishWatchdog = () => {
    if (postFinishTimer || closed || observedFinishReason === null || !terminalDelimiterSeen) return;
    postFinishTimer = setTimeout(() => {
      if (closed) return;
      postFinishEofTimeoutTriggered = true;
      emitProgress(
        `[ep${episodeId}/att${attemptId} ${slotId}] post-finishReason=${observedFinishReason} EOF watchdog triggered after ${resolvedPostFinishMs}ms (${sseFrameCount} SSE frames, ${bytesReceived} bytes); closing stream cleanly.`
      );
      if (forceTrigger) forceTrigger({ kind: 'POST_FINISH_EOF_TIMEOUT' });
    }, resolvedPostFinishMs);
    postFinishTimer.unref?.();
  };

  const resetInactivityWatchdogs = () => {
    warnTimer = clearTimer(warnTimer);
    abortTimer = clearTimer(abortTimer);
    silenceEpisodeOpen = false;
    if (closed || observedFinishReason !== null) return;

    warnTimer = setTimeout(() => {
      if (closed || observedFinishReason !== null || silenceEpisodeOpen) return;
      silenceEpisodeOpen = true;
      const refNs = tLastByteNs ?? tStartNs;
      const idleMs = nsToMs(process.hrtime.bigint() - refNs);
      const entry = Object.freeze({
        at: nowIso(),
        idleMs,
        bytesReceived,
        sseFrameCount,
        state: tFirstByteNs === null ? 'AWAITING_FIRST_BYTE' : 'MID_STREAM_SILENCE'
      });
      if (inactivityWarnings.length < 32) {
        inactivityWarnings.push(entry);
      }
      emitProgress(
        `[ep${episodeId}/att${attemptId} ${slotId}] INACTIVITY_WARNING (${entry.state}): silent for ${Math.round(idleMs)}ms (frames=${sseFrameCount}, bytes=${bytesReceived}, tokens=${latestUsageTokens?.candidatesTokenCount ?? 0}+think=${latestUsageTokens?.thoughtsTokenCount ?? 0}).`
      );
    }, resolvedWarnMs);
    warnTimer.unref?.();

    if (resolvedAbortMs !== null) {
      abortTimer = setTimeout(() => {
        if (closed || observedFinishReason !== null) return;
        inactivityAbortTriggered = true;
        const refNs = tLastByteNs ?? tStartNs;
        const idleMs = nsToMs(process.hrtime.bigint() - refNs);
        emitProgress(
          `[ep${episodeId}/att${attemptId} ${slotId}] TRANSPORT_INACTIVITY_ABORT: silent for ${Math.round(idleMs)}ms (limit=${resolvedAbortMs}ms); halting hung transport.`
        );
        if (forceTrigger) forceTrigger({ kind: 'INACTIVITY_ABORT', idleMs });
      }, resolvedAbortMs);
      abortTimer.unref?.();
    }
  };

  const inspectSseFrame = (frameLines, frameArrivedNs) => {
    if (!frameLines.length) return;
    const payloadStr = frameLines.join('\n').trim();
    if (!payloadStr || payloadStr === '[DONE]') return;

    sseFrameCount += 1;
    if (tLastSseEventNs !== null) {
      const dtMs = nsToMs(frameArrivedNs - tLastSseEventNs);
      if (dtMs > dtFrameMaxMs) dtFrameMaxMs = dtMs;
    }
    tLastSseEventNs = frameArrivedNs;

    try {
      const parsed = JSON.parse(payloadStr);
      const usage = parsed?.usageMetadata;
      if (usage && typeof usage === 'object') {
        const cand = Number.isSafeInteger(usage.candidatesTokenCount) ? usage.candidatesTokenCount : prevCandidateTokens;
        const think = Number.isSafeInteger(usage.thoughtsTokenCount) ? usage.thoughtsTokenCount : prevThoughtsTokens;
        latestUsageTokens = {
          promptTokenCount: Number.isSafeInteger(usage.promptTokenCount) ? usage.promptTokenCount : null,
          candidatesTokenCount: cand,
          thoughtsTokenCount: think,
          totalTokenCount: Number.isSafeInteger(usage.totalTokenCount) ? usage.totalTokenCount : null,
          deltaCandidateTokens: Math.max(0, cand - prevCandidateTokens),
          deltaThoughtsTokens: Math.max(0, think - prevThoughtsTokens)
        };
        prevCandidateTokens = cand;
        prevThoughtsTokens = think;
      }
      const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates : [];
      for (const cand of candidates) {
        if (typeof cand?.finishReason === 'string' && cand.finishReason.trim()) {
          observedFinishReason = cand.finishReason.trim();
          if (tFinishReasonNs === null) tFinishReasonNs = frameArrivedNs;
        }
      }
      if (observedFinishReason !== null) {
        terminalDelimiterSeen = true;
        // Stop transport-inactivity timers once terminal finishReason is witnessed; transition to bounded EOF watchdog
        warnTimer = clearTimer(warnTimer);
        abortTimer = clearTimer(abortTimer);
        schedulePostFinishWatchdog();
      }
    } catch {
      // Leave JSON parse error detection strictly to the dual authoritative parsers in r1-provider-native-core
    }
  };

  const scanDecodedText = (text, arrivedNs) => {
    if (!text) return;
    lineCarry += text;
    let start = 0;
    while (true) {
      const nl = lineCarry.indexOf('\n', start);
      if (nl === -1) {
        lineCarry = lineCarry.slice(start);
        break;
      }
      const rawLine = lineCarry.slice(start, nl).replace(/\r$/, '');
      start = nl + 1;
      if (rawLine === '') {
        if (currentFrameDataLines.length > 0) {
          inspectSseFrame(currentFrameDataLines, arrivedNs);
          currentFrameDataLines = [];
        }
      } else if (rawLine.startsWith('data:')) {
        currentFrameDataLines.push(rawLine.slice(5).replace(/^ /, ''));
      }
    }
  };

  let abortListener = null;

  const wrappedStream = new ReadableStream({
    start(controller) {
      resetInactivityWatchdogs();

      heartbeatTimer = setInterval(() => {
        if (closed) return;
        const nowNs = process.hrtime.bigint();
        const elapsedMs = Math.round(nsToMs(nowNs - tStartNs));
        const idleMs = Math.round(nsToMs(nowNs - (tLastByteNs ?? tStartNs)));
        if (tFirstByteNs === null) {
          emitProgress(`[ep${episodeId}/att${attemptId} ${slotId}] heartbeat: AWAITING_FIRST_BYTE (${elapsedMs}ms elapsed).`);
        } else if (observedFinishReason !== null && !eofObserved) {
          const waitMs = Math.round(nsToMs(nowNs - (tFinishReasonNs ?? tLastByteNs)));
          emitProgress(`[ep${episodeId}/att${attemptId} ${slotId}] heartbeat: POST_FINISH_AWAITING_EOF (${observedFinishReason}, waited ${waitMs}ms, frames=${sseFrameCount}, bytes=${bytesReceived}).`);
        } else {
          const candTok = latestUsageTokens?.candidatesTokenCount ?? 0;
          const thinkTok = latestUsageTokens?.thoughtsTokenCount ?? 0;
          const stateLabel = silenceEpisodeOpen ? 'INACTIVITY_WARNING' : 'ACTIVE_STREAMING';
          emitProgress(
            `[ep${episodeId}/att${attemptId} ${slotId}] heartbeat: ${stateLabel} elapsed=${elapsedMs}ms idle=${idleMs}ms frames=${sseFrameCount} bytes=${bytesReceived} candTok=${candTok} thinkTok=${thinkTok}.`
          );
        }
      }, resolvedHeartbeatMs);
      heartbeatTimer.unref?.();

      const forcePromise = new Promise((resolve) => {
        forceTrigger = resolve;
      });

      if (operatorAbortSignal) {
        if (operatorAbortSignal.aborted) {
          operatorAborted = true;
          forceTrigger({ kind: 'OPERATOR_ABORT' });
        } else {
          abortListener = () => {
            operatorAborted = true;
            if (forceTrigger) forceTrigger({ kind: 'OPERATOR_ABORT' });
          };
          operatorAbortSignal.addEventListener('abort', abortListener, { once: true });
        }
      }

      (async () => {
        try {
          while (!closed) {
            const race = await Promise.race([
              upstreamReader.read().then((res) => ({ kind: 'READ', res })).catch((err) => ({ kind: 'ERROR', err })),
              forcePromise
            ]);

            if (race.kind === 'POST_FINISH_EOF_TIMEOUT') {
              closed = true;
              tEndNs = process.hrtime.bigint();
              cleanupTimers();
              upstreamReader.cancel().catch(() => {});
              try { controller.close(); } catch { /* ignore */ }
              break;
            }
            if (race.kind === 'INACTIVITY_ABORT') {
              closed = true;
              tEndNs = process.hrtime.bigint();
              cleanupTimers();
              upstreamReader.cancel().catch(() => {});
              const abortErr = new R2StreamObservabilityAbortError(
                'R2_STREAM_INACTIVITY_ABORT',
                `Provider stream inactive for ${Math.round(race.idleMs)}ms before completion`,
                { idleMs: race.idleMs, bytesReceived, sseFrameCount }
              );
              try { controller.error(abortErr); } catch { /* ignore */ }
              break;
            }
            if (race.kind === 'OPERATOR_ABORT') {
              closed = true;
              tEndNs = process.hrtime.bigint();
              cleanupTimers();
              upstreamReader.cancel().catch(() => {});
              const opReason = operatorAbortSignal?.reason instanceof Error
                ? operatorAbortSignal.reason
                : Object.assign(new Error('Aborted by operator'), { name: 'AbortError' });
              try { controller.error(opReason); } catch { /* ignore */ }
              break;
            }
            if (race.kind === 'ERROR') {
              closed = true;
              tEndNs = process.hrtime.bigint();
              cleanupTimers();
              streamReadError = {
                name: String(race.err?.name || 'Error'),
                message: String(race.err?.message || race.err)
              };
              try { controller.error(race.err); } catch { /* ignore */ }
              break;
            }

            const { value, done } = race.res;
            if (done) {
              closed = true;
              eofObserved = true;
              tEofNs = process.hrtime.bigint();
              tEndNs = tEofNs;
              cleanupTimers();
              const tail = observerDecoder.decode();
              if (tail) scanDecodedText(tail, tEofNs);
              try { controller.close(); } catch { /* ignore */ }
              break;
            }

            if (value && value.byteLength > 0) {
              const arrivedNs = process.hrtime.bigint();
              if (tFirstByteNs === null) tFirstByteNs = arrivedNs;
              tLastByteNs = arrivedNs;
              chunkCount += 1;
              bytesReceived += value.byteLength;
              resetInactivityWatchdogs();
              const decoded = observerDecoder.decode(value, { stream: true });
              scanDecodedText(decoded, arrivedNs);
              // Forward the exact untouched Uint8Array bytes downstream
              controller.enqueue(value);
            }
          }
        } finally {
          closed = true;
          if (tEndNs === null) tEndNs = process.hrtime.bigint();
          cleanupTimers();
          if (operatorAbortSignal && abortListener) {
            try { operatorAbortSignal.removeEventListener('abort', abortListener); } catch { /* ignore */ }
          }
        }
      })();
    },
    cancel(reason) {
      closed = true;
      if (tEndNs === null) tEndNs = process.hrtime.bigint();
      cleanupTimers();
      if (operatorAbortSignal && abortListener) {
        try { operatorAbortSignal.removeEventListener('abort', abortListener); } catch { /* ignore */ }
      }
      if (forceTrigger) forceTrigger({ kind: 'OPERATOR_ABORT' });
      return upstreamReader.cancel(reason).catch(() => {});
    }
  });

  const wrappedResponse = {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    body: wrappedStream
  };

  const getDiagnostics = () => {
    const endRefNs = tEndNs ?? process.hrtime.bigint();
    let terminationClass = 'ACTIVE_OR_UNFINISHED';
    if (inactivityAbortTriggered) terminationClass = 'TRANSPORT_INACTIVITY_ABORT';
    else if (operatorAborted) terminationClass = 'OPERATOR_ABORT';
    else if (streamReadError) terminationClass = 'TRANSPORT_STREAM_ERROR';
    else if (postFinishEofTimeoutTriggered) terminationClass = 'POST_FINISH_EOF_TIMEOUT_CLOSED_CLEANLY';
    else if (eofObserved && observedFinishReason !== null) terminationClass = 'NORMAL_EOF_AFTER_FINISH';
    else if (eofObserved && observedFinishReason === null) terminationClass = 'NORMAL_EOF_WITHOUT_FINISH';

    return Object.freeze({
      schema: R2_STREAM_OBSERVABILITY_SCHEMA,
      slotId,
      episodeId,
      attemptId,
      totalElapsedMs: nsToMs(endRefNs - tStartNs),
      timeToFirstByteMs: tFirstByteNs !== null ? nsToMs(tFirstByteNs - tStartNs) : null,
      streamActiveSpanMs: (tFirstByteNs !== null && tLastByteNs !== null) ? nsToMs(tLastByteNs - tFirstByteNs) : null,
      dtFrameMaxMs: Number(dtFrameMaxMs.toFixed(3)),
      postFinishEofWaitMs: tFinishReasonNs !== null
        ? nsToMs((tEofNs ?? endRefNs) - tFinishReasonNs)
        : null,
      bytesReceived,
      chunkCount,
      sseFrameCount,
      observedFinishReason,
      terminalDelimiterSeen,
      eofObserved,
      postFinishEofTimeoutTriggered,
      inactivityAbortTriggered,
      operatorAborted,
      streamReadError,
      inactivityWarningsCount: inactivityWarnings.length,
      inactivityWarnings: Object.freeze([...inactivityWarnings]),
      latestUsageTokens: latestUsageTokens ? Object.freeze({ ...latestUsageTokens }) : null,
      terminationClass,
      artificialTokenCeilingImposed: false
    });
  };

  return {
    response: wrappedResponse,
    getDiagnostics
  };
}
