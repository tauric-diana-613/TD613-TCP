/**
 * controlled-archive-intake.mjs
 *
 * TD613 Experiment B Controlled Archive Admission Route.
 * Enforces fail-closed physical custody boundaries and authentic ZIP intake:
 * 1. Prohibits automatic scanning, globbing, or directory traversal across Downloads or filesystem.
 * 2. Strictly prohibits physical filesystem exploration, directory reading, or path traversal in preflight.
 * 3. Requires cryptographic operator authorization (HMAC-SHA256 against configured root keys)
 *    and explicit contemporaneous flight environment grants for physical admission.
 * 4. Authentic physical ZIP intake enforces strict security constraints:
 *    - Decompression limits (member-count, per-member size, total expanded size, ratio).
 *    - Traversal rejection (Zip Slip protection).
 *    - Symlink rejection (external attributes check).
 *    - Duplicate member path rejection.
 *    - ZIP encryption rejection (general purpose bit flag 0x01).
 *    - Malformed header rejection (EOCD, CDFH, LFH magic checks).
 *    - CRC-32 consistency checks.
 *    - Independent SHA-256 custody verification on archive and all admitted members.
 * 5. Preserves original bytes and distinguishes text from binary files (e.g. PDFs, images);
 *    no binary document may silently become an invented UTF-8 research text.
 * 6. Synthetic source-free testing supported via in-memory synthetic fixtures or synthetic in-memory ZIPs.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

export function computeSha256(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(String(buf || ''), 'utf8');
  return crypto.createHash('sha256').update(b).digest('hex');
}

/* Only physically authorized ZIP intake can mint these private document identities.
 * Synthetic fixtures and caller-provided receipt fields cannot enter this WeakMap. */
const AUTHENTICATED_PHYSICAL_ARCHIVE_MEMBERS = new WeakMap();
export function verifyAuthenticatedPhysicalArchiveMember(doc) {
  if (!doc || typeof doc !== 'object') return false;
  const bound = AUTHENTICATED_PHYSICAL_ARCHIVE_MEMBERS.get(doc);
  if (!bound || !Buffer.isBuffer(doc.raw_bytes)) return false;
  const contentSha = typeof doc.content === 'string' ? computeSha256(doc.content) : null;
  return doc.id === bound.id && doc.filename === bound.filename &&
    doc.sha256 === bound.sha256 && doc.bytes === bound.bytes &&
    doc.is_binary === bound.is_binary && doc.derivative_status === bound.derivative_status &&
    computeSha256(doc.raw_bytes) === bound.sha256 && contentSha === bound.content_sha256;
}
function bindAuthenticatedPhysicalArchiveMembers(documents) {
  for (const doc of documents) {
    AUTHENTICATED_PHYSICAL_ARCHIVE_MEMBERS.set(doc, Object.freeze({
      id: doc.id, filename: doc.filename, sha256: doc.sha256, bytes: doc.bytes,
      is_binary: doc.is_binary, derivative_status: doc.derivative_status,
      content_sha256: typeof doc.content === 'string' ? computeSha256(doc.content) : null
    }));
  }
}

/**
 * Computes the canonical payload string for an operator flight grant.
 */
function getCanonicalGrantPayload(grant) {
  return JSON.stringify({
    archivePath: String(grant.archivePath || '').trim(),
    archiveSha256: grant.archiveSha256 ? String(grant.archiveSha256).toLowerCase().trim() : null,
    permittedOperation: String(grant.permittedOperation || '').trim(),
    episodeId: String(grant.episodeId || '').trim(),
    issuerId: String(grant.issuerId || '').trim()
  });
}

/**
 * Creates a cryptographically signed operator flight grant.
 */
export function createOperatorFlightGrant(grantData, secretKey) {
  if (!secretKey) throw new Error('Cannot create operator grant without secretKey');
  const payloadStr = getCanonicalGrantPayload(grantData);
  const signature = crypto.createHmac('sha256', secretKey).update(payloadStr).digest('hex');
  return {
    ...grantData,
    signature
  };
}

/**
 * Verifies an operator-issued cryptographic flight grant against a trusted key.
 */
export function verifyOperatorFlightGrant(grant, trustedKey) {
  if (!grant || !grant.issuerId || !grant.signature || !trustedKey) {
    return false;
  }
  try {
    const payloadStr = getCanonicalGrantPayload(grant);
    const expectedHmac = crypto.createHmac('sha256', trustedKey).update(payloadStr).digest('hex');

    const sigBuf = Buffer.from(grant.signature, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');

    if (sigBuf.length !== expectedBuf.length || sigBuf.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Helper to build synthetic ZIP archives for testing (positive and hostile controls).
 */
export function createSyntheticZipArchive(files = [], options = {}) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const f of files) {
    const filename = f.name;
    const nameBuf = Buffer.from(filename, 'utf8');
    const dataBuf = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data || '', 'utf8');

    let crc = zlib.crc32(dataBuf);
    if (f.corruptCrc) {
      crc = (crc ^ 0xffffffff) >>> 0;
    }

    let compressed = dataBuf;
    let compMethod = 0; // store
    if (f.compress !== false) {
      compMethod = 8; // deflate
      compressed = zlib.deflateRawSync(dataBuf);
    }

    const bitFlag = f.encrypted ? 0x0001 : 0x0000;
    let externalAttrs = 0;
    if (f.isSymlink) {
      externalAttrs = 0o120777 << 16; // Unix symlink mode
    }

    // Local File Header
    const lfh = Buffer.alloc(30 + nameBuf.length);
    lfh.writeUInt32LE(0x04034b50, 0); // LFH signature
    lfh.writeUInt16LE(20, 4);          // version needed
    lfh.writeUInt16LE(bitFlag, 6);     // general purpose bit flag
    lfh.writeUInt16LE(compMethod, 8);  // compression method
    lfh.writeUInt16LE(0, 10);          // last mod time
    lfh.writeUInt16LE(0, 12);          // last mod date
    lfh.writeUInt32LE(crc >>> 0, 14);  // crc-32
    lfh.writeUInt32LE(compressed.length, 18); // compressed size
    lfh.writeUInt32LE(dataBuf.length, 22);    // uncompressed size
    lfh.writeUInt16LE(nameBuf.length, 26);    // filename length
    lfh.writeUInt16LE(0, 28);                 // extra field length
    nameBuf.copy(lfh, 30);

    localHeaders.push(lfh, compressed);

    // Central Directory File Header
    const cdfh = Buffer.alloc(46 + nameBuf.length);
    cdfh.writeUInt32LE(0x02014b50, 0); // CDFH signature
    cdfh.writeUInt16LE(f.isSymlink ? 0x0314 : 0x0014, 4); // version made by (0x03=Unix)
    cdfh.writeUInt16LE(20, 6);         // version needed
    cdfh.writeUInt16LE(bitFlag, 8);    // general purpose bit flag
    cdfh.writeUInt16LE(compMethod, 10); // compression method
    cdfh.writeUInt16LE(0, 12);         // last mod time
    cdfh.writeUInt16LE(0, 14);         // last mod date
    cdfh.writeUInt32LE(crc >>> 0, 16); // crc-32
    cdfh.writeUInt32LE(compressed.length, 20); // compressed size
    cdfh.writeUInt32LE(dataBuf.length, 24);    // uncompressed size
    cdfh.writeUInt16LE(nameBuf.length, 28);    // filename length
    cdfh.writeUInt16LE(0, 30);                 // extra length
    cdfh.writeUInt16LE(0, 32);                 // comment length
    cdfh.writeUInt16LE(0, 34);                 // disk number start
    cdfh.writeUInt16LE(0, 36);                 // internal file attributes
    cdfh.writeUInt32LE(externalAttrs >>> 0, 38); // external file attributes
    cdfh.writeUInt32LE(offset, 42);            // relative offset of LFH
    nameBuf.copy(cdfh, 46);

    centralHeaders.push(cdfh);
    offset += lfh.length + compressed.length;
  }

  const cdBuf = Buffer.concat(centralHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4);          // disk number
  eocd.writeUInt16LE(0, 6);          // disk with CD
  eocd.writeUInt16LE(files.length, 8);  // total entries this disk
  eocd.writeUInt16LE(files.length, 10); // total entries CD
  eocd.writeUInt32LE(cdBuf.length, 12); // size of CD
  eocd.writeUInt32LE(offset, 16);       // offset of CD
  eocd.writeUInt16LE(0, 20);            // comment length

  if (options.corruptHeader) {
    // Deliberately damage the EOCD signature
    eocd.writeUInt32LE(0x00000000, 0);
  }

  return Buffer.concat([...localHeaders, cdBuf, eocd]);
}

export class ControlledArchiveIntake {
  /**
   * @param {object} options
   * @param {boolean} options.syntheticMode - Whether running in source-free synthetic preflight mode (default true)
   * @param {boolean} options.allowProtectedAdmission - Whether live protected flight admission is active (default false)
   * @param {object} options.trustedOperatorKeys - Map of { [issuerId]: string|Buffer } trusted root keys
   * @param {number} options.maxMembers - Maximum allowed files in archive (default 50)
   * @param {number} options.maxTotalExpandedBytes - Maximum aggregate decompressed bytes (default 10 MB)
   * @param {number} options.maxPerMemberBytes - Maximum single-file decompressed bytes (default 2 MB)
   * @param {number} options.maxDecompressionRatio - Maximum ratio of decompressed to compressed bytes (default 100:1)
   */
  constructor(options = {}) {
    this.syntheticMode = options.syntheticMode ?? true;
    this.allowProtectedAdmission = options.allowProtectedAdmission ?? false;
    this.trustedOperatorKeys = options.trustedOperatorKeys || {};
    this.authorizedDerivativesMap = options.authorizedDerivativesMap || {};
    this.prospectiveMetadataMap = options.prospectiveMetadataMap || {};

    // Security & Custody Ceilings
    this.maxMembers = options.maxMembers ?? 50;
    this.maxTotalExpandedBytes = options.maxTotalExpandedBytes ?? (10 * 1024 * 1024); // 10 MB
    this.maxPerMemberBytes = options.maxPerMemberBytes ?? (2 * 1024 * 1024); // 2 MB
    this.maxDecompressionRatio = options.maxDecompressionRatio ?? 100;
  }

  /**
   * Parses and securely decompresses a raw ZIP buffer in memory, enforcing all security invariants.
   *
   * @param {Buffer} zipBuf - Raw ZIP file bytes
   * @returns {Array<object>} Admitted document records
   */
  unpackZipArchive(zipBuf) {
    if (!Buffer.isBuffer(zipBuf) || zipBuf.length < 22) {
      throw new Error('ZIP_MALFORMED_HEADER_REFUSED: Buffer is too small to contain a valid ZIP archive.');
    }

    // 1. Locate End of Central Directory Record (EOCD: 0x06054b50) scanning backwards
    let eocdOffset = -1;
    const maxScan = Math.min(zipBuf.length, 65535 + 22);
    for (let i = zipBuf.length - 22; i >= zipBuf.length - maxScan; i--) {
      if (zipBuf.readUInt32LE(i) === 0x06054b50) {
        eocdOffset = i;
        break;
      }
    }

    if (eocdOffset === -1) {
      throw new Error('ZIP_MALFORMED_HEADER_REFUSED: End of Central Directory (EOCD) signature not found.');
    }

    const totalEntries = zipBuf.readUInt16LE(eocdOffset + 10);
    const cdSize = zipBuf.readUInt32LE(eocdOffset + 12);
    const cdOffset = zipBuf.readUInt32LE(eocdOffset + 16);

    // Member count limit
    if (totalEntries > this.maxMembers) {
      throw new Error(`ZIP_MEMBER_COUNT_EXCEEDED: Archive contains ${totalEntries} members (ceiling: ${this.maxMembers}).`);
    }

    if (cdOffset + cdSize > zipBuf.length) {
      throw new Error('ZIP_MALFORMED_HEADER_REFUSED: Central Directory exceeds archive buffer bounds.');
    }

    let runningOffset = cdOffset;
    let runningTotalExpanded = 0;
    const seenFilenames = new Set();
    const admittedDocuments = [];

    for (let idx = 0; idx < totalEntries; idx++) {
      if (runningOffset + 46 > zipBuf.length) {
        throw new Error('ZIP_MALFORMED_HEADER_REFUSED: Truncated Central Directory File Header.');
      }

      const sig = zipBuf.readUInt32LE(runningOffset);
      if (sig !== 0x02014b50) {
        throw new Error(`ZIP_MALFORMED_HEADER_REFUSED: Invalid CDFH signature 0x${sig.toString(16)} at index ${idx}.`);
      }

      const versionMadeBy = zipBuf.readUInt16LE(runningOffset + 4);
      const bitFlag = zipBuf.readUInt16LE(runningOffset + 8);
      const compMethod = zipBuf.readUInt16LE(runningOffset + 10);
      const expectedCrc = zipBuf.readUInt32LE(runningOffset + 16) >>> 0;
      const compSize = zipBuf.readUInt32LE(runningOffset + 20);
      const uncompSize = zipBuf.readUInt32LE(runningOffset + 24);
      const nameLen = zipBuf.readUInt16LE(runningOffset + 28);
      const extraLen = zipBuf.readUInt16LE(runningOffset + 30);
      const commentLen = zipBuf.readUInt16LE(runningOffset + 32);
      const externalAttrs = zipBuf.readUInt32LE(runningOffset + 38);
      const localHeaderOffset = zipBuf.readUInt32LE(runningOffset + 42);

      // Encryption Refusal
      if ((bitFlag & 0x0001) !== 0) {
        throw new Error(`ZIP_ENCRYPTED_ENTRY_REFUSED: Encrypted entry detected at index ${idx}. Password-protected archives are strictly refused.`);
      }

      // Read Filename
      const nameStart = runningOffset + 46;
      if (nameStart + nameLen > zipBuf.length) {
        throw new Error('ZIP_MALFORMED_HEADER_REFUSED: Member filename exceeds buffer.');
      }
      const rawFilename = zipBuf.toString('utf8', nameStart, nameStart + nameLen);

      // Traversal / Zip-Slip Refusal
      if (
        rawFilename.includes('..') ||
        rawFilename.startsWith('/') ||
        rawFilename.startsWith('\\') ||
        /^[a-zA-Z]:/.test(rawFilename) ||
        rawFilename.includes('\0')
      ) {
        throw new Error(`ZIP_PATH_TRAVERSAL_REFUSED: Malicious or directory-traversing path detected: '${rawFilename}'.`);
      }

      // Symlink Refusal (Unix mode in upper 16 bits of external attributes)
      const unixMode = externalAttrs >>> 16;
      if ((unixMode & 0o170000) === 0o120000) {
        throw new Error(`ZIP_SYMLINK_REFUSED: Symbolic link detected: '${rawFilename}'. Symlinks are strictly prohibited.`);
      }

      // Duplicate Name Refusal
      const normalizedName = rawFilename.replace(/\\/g, '/').toLowerCase();
      if (seenFilenames.has(normalizedName)) {
        throw new Error(`ZIP_DUPLICATE_MEMBER_REFUSED: Duplicate filename detected in archive: '${rawFilename}'.`);
      }
      seenFilenames.add(normalizedName);

      // Size Ceilings
      if (uncompSize > this.maxPerMemberBytes) {
        throw new Error(
          `ZIP_PER_MEMBER_SIZE_EXCEEDED: Member '${rawFilename}' uncompressed size (${uncompSize} bytes) exceeds ceiling (${this.maxPerMemberBytes} bytes).`
        );
      }

      runningTotalExpanded += uncompSize;
      if (runningTotalExpanded > this.maxTotalExpandedBytes) {
        throw new Error(
          `ZIP_TOTAL_SIZE_EXCEEDED: Total expanded size (${runningTotalExpanded} bytes) exceeds aggregate ceiling (${this.maxTotalExpandedBytes} bytes).`
        );
      }

      // Verify and Read Local File Header
      if (localHeaderOffset + 30 > zipBuf.length) {
        throw new Error(`ZIP_MALFORMED_HEADER_REFUSED: Local File Header offset out of bounds for '${rawFilename}'.`);
      }
      const lfhSig = zipBuf.readUInt32LE(localHeaderOffset);
      if (lfhSig !== 0x04034b50) {
        throw new Error(`ZIP_MALFORMED_HEADER_REFUSED: Invalid LFH signature 0x${lfhSig.toString(16)} for '${rawFilename}'.`);
      }
      const lfhNameLen = zipBuf.readUInt16LE(localHeaderOffset + 26);
      const lfhExtraLen = zipBuf.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + lfhNameLen + lfhExtraLen;

      if (dataStart + compSize > zipBuf.length) {
        throw new Error(`ZIP_MALFORMED_HEADER_REFUSED: Compressed payload exceeds buffer bounds for '${rawFilename}'.`);
      }
      const compressedSlice = zipBuf.subarray(dataStart, dataStart + compSize);

      // Decompress
      let decompressedBuf;
      if (compMethod === 0) {
        // STORE
        decompressedBuf = compressedSlice;
      } else if (compMethod === 8) {
        // DEFLATE
        try {
          decompressedBuf = zlib.inflateRawSync(compressedSlice, { maxOutputLength: this.maxPerMemberBytes });
        } catch (err) {
          throw new Error(`ZIP_DECOMPRESSION_FAILED: Deflate error in '${rawFilename}': ${err.message}`);
        }
      } else {
        throw new Error(`ZIP_UNSUPPORTED_COMPRESSION_METHOD: Unsupported compression method ${compMethod} in '${rawFilename}'.`);
      }

      if (decompressedBuf.length !== uncompSize) {
        throw new Error(
          `ZIP_SIZE_MISMATCH_REFUSED: Decompressed size (${decompressedBuf.length}) does not match header (${uncompSize}) for '${rawFilename}'.`
        );
      }

      // Decompression Ratio Check (Zip Bomb protection)
      if (compSize > 0) {
        const ratio = decompressedBuf.length / compSize;
        if (ratio > this.maxDecompressionRatio) {
          throw new Error(
            `ZIP_DECOMPRESSION_RATIO_EXCEEDED: Ratio of ${ratio.toFixed(1)}:1 exceeds limit of ${this.maxDecompressionRatio}:1 for '${rawFilename}'.`
          );
        }
      }

      // CRC-32 Verification
      const actualCrc = zlib.crc32(decompressedBuf) >>> 0;
      if (actualCrc !== expectedCrc) {
        throw new Error(
          `ZIP_CRC_MISMATCH_REFUSED: CRC-32 checksum failed for '${rawFilename}' (expected 0x${expectedCrc.toString(16)}, got 0x${actualCrc.toString(16)}).`
        );
      }

      // Distinguish Text from Binary derivative (Zero silent text synthesis)
      const isKnownTextExt = /\.(md|txt|json|tex|csv)$/i.test(rawFilename);
      const hasNullBytes = decompressedBuf.includes(0);
      let isBinary = true;
      let textContent = null;
      let derivativeStatus = 'RAW_BINARY_PRESERVED_NO_TEXT_SYNTHESIS';

      if (isKnownTextExt && !hasNullBytes) {
        try {
          // Verify valid UTF-8
          const decoder = new TextDecoder('utf-8', { fatal: true });
          textContent = decoder.decode(decompressedBuf);
          isBinary = false;
          derivativeStatus = 'AUTHENTIC_UTF8_TEXT_PRESERVED';
        } catch {
          isBinary = true;
          textContent = null;
          derivativeStatus = 'MALFORMED_UTF8_PRESERVED_AS_BINARY';
        }
      } else {
        // Authenticated derivative attachment pathway (R3-03)
        const normalizedMemberKey = rawFilename.replace(/\\/g, '/');
        const authDerivative = this.authorizedDerivativesMap?.[normalizedMemberKey] || this.authorizedDerivativesMap?.[rawFilename];
        let derivativeMetadata = null;

        if (authDerivative) {
          const memberSha = computeSha256(decompressedBuf);

          // R3-03: Remove fallback (!authDerivative.sourceSha256). Require exact 64-char hex match,
          // verified derivative identity, explicit conversion method, and provenance.
          if (!authDerivative.sourceSha256 || typeof authDerivative.sourceSha256 !== 'string' || authDerivative.sourceSha256.length !== 64) {
            derivativeStatus = 'DERIVATIVE_SOURCE_SHA256_MISSING_REJECTED';
          } else if (authDerivative.sourceSha256.toLowerCase() !== memberSha.toLowerCase()) {
            derivativeStatus = 'DERIVATIVE_SHA256_MISMATCH_REJECTED';
          } else if (!authDerivative.derivativeId || !authDerivative.conversionMethod) {
            derivativeStatus = 'DERIVATIVE_PROVENANCE_MISSING_REJECTED';
          } else if (!authDerivative.text || typeof authDerivative.text !== 'string') {
            derivativeStatus = 'DERIVATIVE_TEXT_EMPTY_OR_INVALID';
          } else {
            textContent = authDerivative.text;
            isBinary = true; // Still marked as binary asset, but carries authenticated text derivative
            derivativeStatus = 'AUTHENTICATED_TEXT_DERIVATIVE_ATTACHED';
            derivativeMetadata = {
              derivative_id: authDerivative.derivativeId,
              conversion_method: authDerivative.conversionMethod,
              source_sha256: authDerivative.sourceSha256.toLowerCase(),
              provenance: authDerivative.provenance || 'Declared Authenticated Derivative',
              semantic_completeness: authDerivative.semanticCompleteness || 'UNVERIFIED_EXTRACTION',
              omissions: Array.isArray(authDerivative.omissions) ? authDerivative.omissions : [],
              uncertainty_receipt: authDerivative.uncertaintyReceipt || null,
              unsupported_content: Array.isArray(authDerivative.unsupportedContent) ? authDerivative.unsupportedContent : []
            };
          }
        } else {
          derivativeStatus = 'RAW_BINARY_PRESERVED_NO_TEXT_SYNTHESIS';
        }

        if (derivativeMetadata) {
          this._lastDerivativeMetadata = derivativeMetadata;
        }
      }

      // R3-05: Prospective metadata contract binding source identity to declared chronology and topic evidence
      const normalizedKey = rawFilename.replace(/\\/g, '/');
      const memberMetadata = this.prospectiveMetadataMap?.[normalizedKey] || this.prospectiveMetadataMap?.[rawFilename] || {};

      const operatorDeclaredDate = memberMetadata.operator_declared_date || null;
      const authorDocumentedDate = memberMetadata.author_documented_date || null;
      const filesystemDate = null; // Do not use filesystem mtime as historical truth
      const verifiedChronologyDate = operatorDeclaredDate || authorDocumentedDate || null;

      const declaredTopic = memberMetadata.declared_topic || null;

      const chronologyEvidence = {
        operator_declared_date: operatorDeclaredDate,
        author_documented_date: authorDocumentedDate,
        filesystem_date: filesystemDate,
        archive_member_order: idx + 1,
        verified_chronology_date: verifiedChronologyDate,
        chronology_status: verifiedChronologyDate ? 'VERIFIED_CHRONOLOGY' : 'CHRONOLOGY_UNIDENTIFIABLE'
      };

      const topicEvidence = {
        declared_topic: declaredTopic,
        inferred_topic: memberMetadata.inferred_topic || null,
        topic_status: declaredTopic ? 'DECLARED_TOPIC' : 'TOPIC_UNCLASSIFIED'
      };

      admittedDocuments.push({
        id: `DOC-ZIP-${String(idx + 1).padStart(2, '0')}`,
        filename: rawFilename,
        is_binary: isBinary,
        content: textContent,
        raw_bytes: decompressedBuf,
        bytes: decompressedBuf.length,
        sha256: computeSha256(decompressedBuf),
        derivative_status: derivativeStatus,
        derivative_metadata: this._lastDerivativeMetadata || null,
        author_provenance: memberMetadata.author_provenance || 'Authentic Admitted ZIP Archive Member',
        chronology_index: idx + 1,
        chronology_evidence: chronologyEvidence,
        topic_evidence: topicEvidence,
        metadata: memberMetadata
      });
      this._lastDerivativeMetadata = null;

      runningOffset += 46 + nameLen + extraLen + commentLen;
    }

    return admittedDocuments;
  }

  /**
   * Admits an explicitly designated archive or synthetic fixture.
   *
   * @param {string|object} target - Absolute archive path, synthetic descriptor, or in-memory ZIP buffer object
   * @param {object} authContext - Authorization credentials, cryptographic grant, and flags
   * @returns {object} Admission receipt with document descriptors
   */
  admitArchive(target, authContext = {}) {
    // 1. Prohibit missing or unspecific target
    if (!target) {
      throw new Error(
        'ARCHIVE_ADMISSION_TARGET_REQUIRED: Target archive or synthetic fixture must be explicitly designated. Autonomous directory traversal is strictly forbidden.'
      );
    }

    // 2. Physical File I/O Guard: Disallow physical paths in preflight unless explicitly authorized
    if (typeof target === 'string') {
      if (!this.allowProtectedAdmission) {
        throw new Error(
          'ARCHIVE_ADMISSION_PHYSICAL_PATH_BLOCKED: Physical filesystem exploration, directory reading, and path traversal are strictly forbidden in source-free preflight. Physical archive admission is closed pending Sovereign Operator Flight Activation. Synthetic testing must use in-memory fixtures only.'
        );
      }

      // Validate cryptographic operator grant and issuer binding
      const grant = authContext.operatorFlightGrant;
      if (!grant || !grant.issuerId || !grant.signature) {
        throw new Error(
          'ARCHIVE_ADMISSION_UNAUTHORIZED: Live physical archive admission refused. Valid cryptographic operatorFlightGrant is required.'
        );
      }

      let trustedKey = null;
      if (typeof this.trustedOperatorKeys === 'string') {
        trustedKey = this.trustedOperatorKeys;
      } else if (this.trustedOperatorKeys && typeof this.trustedOperatorKeys === 'object') {
        trustedKey = this.trustedOperatorKeys[grant.issuerId] || this.trustedOperatorKeys['default'] || this.trustedOperatorKeys['OPERATOR_PRIMARY'];
      }
      if (!trustedKey && authContext.trustedOperatorKeys) {
        if (typeof authContext.trustedOperatorKeys === 'string') {
          trustedKey = authContext.trustedOperatorKeys;
        } else {
          trustedKey = authContext.trustedOperatorKeys[grant.issuerId] || authContext.trustedOperatorKeys['default'];
        }
      }
      if (!trustedKey) {
        throw new Error(
          `ARCHIVE_ADMISSION_UNAUTHORIZED: Unrecognized or untrusted grant issuerId '${grant.issuerId}'. Trusted root key is missing.`
        );
      }

      const isGrantValid = verifyOperatorFlightGrant(grant, trustedKey);
      if (!isGrantValid) {
        throw new Error(
          'ARCHIVE_ADMISSION_UNAUTHORIZED: Cryptographic signature verification failed for operatorFlightGrant.'
        );
      }

      if (grant.permittedOperation !== 'EXPERIMENT_B_FLIGHT_ARCHIVE_ADMISSION') {
        throw new Error(
          `ARCHIVE_ADMISSION_UNAUTHORIZED: Grant operation '${grant.permittedOperation}' does not match required 'EXPERIMENT_B_FLIGHT_ARCHIVE_ADMISSION'.`
        );
      }

      // Check environment grants
      const isEnvAuthorized = process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED === 'true' &&
                              process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED === 'true';
      if (!isEnvAuthorized) {
        throw new Error(
          'ARCHIVE_ADMISSION_UNAUTHORIZED: Missing required environment grants: TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED=true and TD613_FLIGHT_EXECUTION_AUTHORIZED=true.'
        );
      }

      // Enforce absolute path and exact match with grant
      if (!path.isAbsolute(target)) {
        throw new Error(
          `ARCHIVE_ADMISSION_ABSOLUTE_PATH_REQUIRED: Target path '${target}' must be absolute. Relative paths are strictly rejected.`
        );
      }

      if (path.resolve(target) !== path.resolve(grant.archivePath)) {
        throw new Error(
          `ARCHIVE_ADMISSION_GRANT_PATH_MISMATCH: Target path '${target}' does not match grant archivePath '${grant.archivePath}'.`
        );
      }

      if (!target.toLowerCase().endsWith('.zip')) {
        throw new Error(
          `ARCHIVE_ADMISSION_NOT_ZIP: Target path '${target}' is not a .zip file. Only physical ZIP archives are supported.`
        );
      }

      if (!fs.existsSync(target)) {
        throw new Error(`ARCHIVE_ADMISSION_FILE_NOT_FOUND: Target archive file does not exist at '${target}'.`);
      }

      // Read physical ZIP bytes directly into memory
      const zipBytes = fs.readFileSync(target);
      const actualArchiveSha = computeSha256(zipBytes);

      if (grant.archiveSha256 && actualArchiveSha !== grant.archiveSha256.toLowerCase()) {
        throw new Error(
          `ARCHIVE_ADMISSION_HASH_MISMATCH: Archive SHA-256 '${actualArchiveSha}' does not match grant SHA-256 '${grant.archiveSha256}'.`
        );
      }

      // Unpack ZIP members with full security controls
      const admittedDocuments = this.unpackZipArchive(zipBytes);
      const admissionId = `ADMISSION-PHYSICAL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;

      const manifestBuf = Buffer.from(
        JSON.stringify(admittedDocuments.map(d => ({ filename: d.filename, sha256: d.sha256, bytes: d.bytes })))
      );

      // Mint only after verification of the operator grant and physical ZIP.
      bindAuthenticatedPhysicalArchiveMembers(admittedDocuments);

      return {
        admission_id: admissionId,
        timestamp: new Date().toISOString(),
        archive_path: target,
        archive_sha256: actualArchiveSha,
        document_count: admittedDocuments.length,
        documents: admittedDocuments,
        manifest_sha256: computeSha256(manifestBuf),
        custody_status: 'PHYSICAL_ZIP_AUTHENTICATED_AND_ADMITTED',
        signature_verification: 'VALID_HMAC_LOCAL_INTEGRITY',
        human_authority_class: 'CALLER_CONSISTENT_ONLY_WITHOUT_EXTERNAL_HUMAN_ATTESTATION',
        quarantine_maintained: true,
        physical_io_executed: true
      };
    }

    // 3. In-Memory Synthetic ZIP Buffer Guard
    if (typeof target === 'object' && Buffer.isBuffer(target.zipBuffer)) {
      const isSyntheticZipAuthorized = this.syntheticMode && authContext.trustedSyntheticFixture === true;
      const hasValidGrant = Boolean(
        authContext.operatorFlightGrant &&
        this.trustedOperatorKeys[authContext.operatorFlightGrant.issuerId] &&
        verifyOperatorFlightGrant(authContext.operatorFlightGrant, this.trustedOperatorKeys[authContext.operatorFlightGrant.issuerId])
      );

      if (!isSyntheticZipAuthorized && !hasValidGrant) {
        throw new Error(
          'ARCHIVE_ADMISSION_BLOCKED_UNAUTHORIZED: In-memory ZIP buffer refused. Must be trustedSyntheticFixture=true in synthetic mode or carry verified operatorFlightGrant.'
        );
      }

      const admittedDocuments = this.unpackZipArchive(target.zipBuffer);
      const admissionId = `ADMISSION-SYN-ZIP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
      const actualArchiveSha = computeSha256(target.zipBuffer);

      const manifestBuf = Buffer.from(
        JSON.stringify(admittedDocuments.map(d => ({ filename: d.filename, sha256: d.sha256, bytes: d.bytes })))
      );

      return {
        admission_id: admissionId,
        timestamp: new Date().toISOString(),
        archive_sha256: actualArchiveSha,
        document_count: admittedDocuments.length,
        documents: admittedDocuments,
        manifest_sha256: computeSha256(manifestBuf),
        custody_status: 'SOURCE_FREE_SYNTHETIC_ZIP_VERIFIED',
        quarantine_maintained: true,
        physical_io_executed: false
      };
    }

    // 4. In-Memory Synthetic Specimen Descriptor Guard (Preserves existing synthetic test route)
    const isTrustedSynthetic = Boolean(
      this.syntheticMode &&
      authContext.trustedSyntheticFixture === true &&
      typeof target === 'object' &&
      Array.isArray(target.syntheticDocuments)
    );

    if (!isTrustedSynthetic) {
      throw new Error(
        'ARCHIVE_ADMISSION_BLOCKED_UNAUTHORIZED: Protected corpus access refused. Target must be a verified in-memory synthetic fixture with trustedSyntheticFixture=true in source-free preflight.'
      );
    }

    // In-Memory Synthetic Accession Execution (Zero File I/O)
    const admissionId = `ADMISSION-SYN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;

    const admittedDocuments = target.syntheticDocuments.map((doc, idx) => {
      if (!doc || !doc.filename || typeof doc.content !== 'string') {
        throw new Error(`ARCHIVE_ADMISSION_MALFORMED_SPECIMEN: Specimen at index ${idx} is missing required filename or content string.`);
      }

      const contentBuf = Buffer.from(doc.content, 'utf8');
      return {
        id: doc.id || `DOC-${String(idx + 1).padStart(2, '0')}`,
        filename: doc.filename,
        is_binary: false,
        content: doc.content,
        raw_bytes: contentBuf,
        bytes: contentBuf.length,
        sha256: doc.sha256 || computeSha256(contentBuf),
        derivative_status: 'AUTHENTIC_UTF8_TEXT_PRESERVED',
        author_provenance: doc.author_provenance || 'Trusted In-Memory Synthetic Specimen',
        chronology_index: idx + 1
      };
    });

    const manifestBuf = Buffer.from(
      JSON.stringify(admittedDocuments.map(d => ({ filename: d.filename, sha256: d.sha256, bytes: d.bytes })))
    );

    return {
      admission_id: admissionId,
      timestamp: new Date().toISOString(),
      document_count: admittedDocuments.length,
      documents: admittedDocuments,
      manifest_sha256: computeSha256(manifestBuf),
      custody_status: 'SOURCE_FREE_SYNTHETIC_VERIFIED',
      quarantine_maintained: true,
      physical_io_executed: false
    };
  }
}
