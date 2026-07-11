/**
 * TD613 Ash Local Commitment Kernel v0.7.1
 *
 * Computes an L1 browser-local SHA-256 commitment over exact selected bytes.
 * Concurrent file selections are generation-bound: an older hash resolves to
 * the newest active selection rather than overwriting the current intake state.
 * Clearing the intake invalidates every in-flight commitment.
 */

export const LOCAL_COMMITMENT_SCHEMA = "td613.ash.local-commitment/v0.7";
export const L0_ASSURANCE = "L0_METADATA_ONLY";
export const L1_ASSURANCE = "L1_BROWSER_LOCAL_ARTIFACT_DIGEST";
export const DEFAULT_MAX_BYTES = 256 * 1024 * 1024;

let selectionEpoch = 0;
let invocationSerial = 0;
let latestInvocation = null;

function assertFileLike(file) {
  const valid =
    file &&
    typeof file === "object" &&
    Number.isSafeInteger(file.size) &&
    file.size >= 0 &&
    typeof file.arrayBuffer === "function";

  if (!valid) {
    throw new TypeError(
      "Ash local commitment requires a File-like object with size and arrayBuffer().",
    );
  }
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function staleCommitmentError() {
  const error = new Error(
    "Local commitment invalidated by a newer file selection.",
  );
  error.name = "AbortError";
  return error;
}

function scheduleEmptySelectionReset() {
  if (typeof document === "undefined") return;
  setTimeout(() => {
    const input = document.getElementById("fileInput");
    if (input?.files?.[0]) return;
    const contentHash = document.getElementById("contentHash");
    const status = document.getElementById("commitmentStatus");
    const register = document.getElementById("registerArtifact");
    if (contentHash) contentHash.value = "";
    if (status) {
      status.dataset.state = "L0";
      status.textContent = `${L0_ASSURANCE} · no artifact byte digest has been computed.`;
    }
    if (register) register.disabled = false;
  }, 0);
}

export function invalidateLocalCommitmentSelection() {
  selectionEpoch += 1;
  latestInvocation = null;
}

function installSelectionInvalidation() {
  if (typeof document === "undefined") return;
  document.getElementById("fileInput")?.addEventListener(
    "change",
    invalidateLocalCommitmentSelection,
    { capture: true },
  );
  document.getElementById("clearForm")?.addEventListener(
    "click",
    invalidateLocalCommitmentSelection,
    { capture: true },
  );
}

installSelectionInvalidation();

async function computeLocalCommitment(
  file,
  {
    maxBytes = DEFAULT_MAX_BYTES,
    cryptoImpl = globalThis.crypto,
  } = {},
) {
  assertFileLike(file);

  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError("maxBytes must be a non-negative safe integer.");
  }

  if (!cryptoImpl?.subtle?.digest) {
    throw new Error(
      "Web Crypto SHA-256 is unavailable. Use a secure browser context.",
    );
  }

  if (file.size > maxBytes) {
    throw new RangeError(
      `File exceeds the Phase 1 local-hashing ceiling of ${maxBytes} bytes.`,
    );
  }

  let artifactBuffer = null;

  try {
    artifactBuffer = await file.arrayBuffer();

    if (!(artifactBuffer instanceof ArrayBuffer)) {
      throw new TypeError("File.arrayBuffer() did not return an ArrayBuffer.");
    }

    if (artifactBuffer.byteLength !== file.size) {
      throw new Error(
        "File byte length changed while the local commitment was being computed.",
      );
    }

    const digestBuffer = await cryptoImpl.subtle.digest(
      "SHA-256",
      artifactBuffer,
    );

    return Object.freeze({
      schema: LOCAL_COMMITMENT_SCHEMA,
      assurance_class: L1_ASSURANCE,
      digest_algorithm: "SHA-256",
      artifact_digest: `sha256:${bytesToHex(digestBuffer)}`,
      byte_length: file.size,
      media_type: file.type || "application/octet-stream",
      last_modified_claim: Number.isFinite(file.lastModified)
        ? Number(file.lastModified)
        : null,
      hash_input: "exact-file-picker-bytes",
      hash_execution: "browser-local",
      execution_attestation: "client-generated-not-independently-attested",
      network_operation_performed_by_module: false,
      raw_bytes_transmitted: false,
      raw_bytes_returned: false,
      raw_bytes_persisted_by_module: false,
      best_effort_buffer_overwrite: true,
      memory_erasure_guaranteed: false,
      claim_boundary:
        "local-byte-commitment-not-possession-authorship-authenticity-identity-or-time-proof",
    });
  } finally {
    if (artifactBuffer instanceof ArrayBuffer) {
      // Best effort only. Engines and cryptographic implementations may retain
      // internal copies outside application control.
      new Uint8Array(artifactBuffer).fill(0);
    }
    artifactBuffer = null;
  }
}

export function generateLocalCommitment(file, options = {}) {
  const epoch = selectionEpoch;
  const id = ++invocationSerial;
  let promise;

  promise = computeLocalCommitment(file, options).then(async (result) => {
    const stillCurrent =
      latestInvocation?.id === id && selectionEpoch === epoch;
    if (stillCurrent) return result;

    const replacement = latestInvocation;
    if (
      replacement &&
      replacement.id !== id &&
      replacement.epoch === selectionEpoch
    ) {
      return replacement.promise;
    }

    scheduleEmptySelectionReset();
    throw staleCommitmentError();
  });

  latestInvocation = { id, epoch, file, promise };
  return promise;
}
