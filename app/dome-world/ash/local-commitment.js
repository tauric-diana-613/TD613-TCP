/**
 * TD613 Ash Local Commitment Kernel v0.7
 *
 * Computes an L1 browser-local SHA-256 commitment over exact selected bytes.
 * The module performs no network operation and returns no raw bytes.
 * JavaScript cannot guarantee immediate memory erasure; buffer cleanup is
 * best-effort only and the receipt says so.
 */

export const LOCAL_COMMITMENT_SCHEMA = "td613.ash.local-commitment/v0.7";
export const L0_ASSURANCE = "L0_METADATA_ONLY";
export const L1_ASSURANCE = "L1_BROWSER_LOCAL_ARTIFACT_DIGEST";
export const DEFAULT_MAX_BYTES = 256 * 1024 * 1024;

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

export async function generateLocalCommitment(
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
