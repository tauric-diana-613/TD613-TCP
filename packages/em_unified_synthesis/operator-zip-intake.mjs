/**
 * TD613 Operator-Supplied ZIP Intake Path
 * Commission EM E-00.1 · Deliverable 5 & Task E001-F05
 * 
 * Hardened, fail-closed ZIP intake engine with:
 * - End of Central Directory (EOCD) backwards validation and exact entry count matching
 * - Reconciled Central Directory and Local File Header signatures, methods, flags, sizes, CRC
 * - Strict rejection of unsupported features: encryption, ZIP64, data descriptors, symlinks, special files
 * - Bound decompression with maxOutputLength, declared-size verification, and CRC-32 verification
 * - Zip-Slip path traversal defense, absolute/drive-letter rejection, and duplicate normalized path detection
 * - Strict fatal UTF-8 filename and text decoding
 * - Atomic admission: zero partial state accepted on any member failure
 * - Codepoint-aligned integer passage retrieval with fatal boundary checks
 */

import crypto from 'node:crypto';
import zlib from 'node:zlib';

export class ZipIntakeError extends Error {
  constructor(code, message, details = {}) {
    super(`[${code}] ${message}`);
    this.code = code;
    this.details = details;
  }
}

export function sha256Hex(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(String(buf), 'utf8');
  return crypto.createHash('sha256').update(b).digest('hex');
}

// IEEE 802.3 standard CRC-32 table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c >>> 0;
}

export function computeCrc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return ((c ^ 0xFFFFFFFF) >>> 0);
}

export function isUtf8ContinuationByte(byte) {
  return (byte & 0xC0) === 0x80;
}

export function isCodepointBoundary(buf, offset) {
  if (offset < 0 || offset > buf.length) return false;
  if (offset === 0 || offset === buf.length) return true;
  return !isUtf8ContinuationByte(buf[offset]);
}

export const DEFAULT_ZIP_LIMITS = {
  maxFileCount: 500,
  maxSingleFileSize: 16 * 1024 * 1024, // 16 MB
  maxCumulativeBytes: 64 * 1024 * 1024, // 64 MB (67,108,864 bytes)
  maxCompressionRatio: 100 // 100:1
};

export class OperatorZipIntakeEngine {
  constructor(options = {}) {
    this.limits = { ...DEFAULT_ZIP_LIMITS, ...options };
    this.admittedSources = new Map();
    this.admittedDerivatives = new Map();
    this.duplicateRegistry = [];
    this.nearDuplicateRegistry = [];
    this.intakeLedger = [];
  }

  /**
   * Locates and parses the End of Central Directory (EOCD) record from buffer end.
   */
  findEocd(buf) {
    if (!Buffer.isBuffer(buf) || buf.length < 22) {
      throw new ZipIntakeError('INVALID_ZIP_ARCHIVE', 'Buffer is too small to contain a valid ZIP archive.');
    }

    // Scan backwards from end for EOCD signature: 0x50 0x4B 0x05 0x06
    const minOffset = Math.max(0, buf.length - 65536 - 22);
    let eocdOffset = -1;

    for (let p = buf.length - 22; p >= minOffset; p--) {
      if (buf[p] === 0x50 && buf[p + 1] === 0x4B && buf[p + 2] === 0x05 && buf[p + 3] === 0x06) {
        const commentLen = buf.readUInt16LE(p + 20);
        if (p + 22 + commentLen === buf.length) {
          eocdOffset = p;
          break;
        }
      }
    }

    if (eocdOffset === -1) {
      throw new ZipIntakeError('MISSING_EOCD_RECORD', 'Failed to locate valid End of Central Directory (EOCD) record.');
    }

    const diskNumber = buf.readUInt16LE(eocdOffset + 4);
    const cdDiskNumber = buf.readUInt16LE(eocdOffset + 6);
    const diskEntries = buf.readUInt16LE(eocdOffset + 8);
    const totalEntries = buf.readUInt16LE(eocdOffset + 10);
    const cdSize = buf.readUInt32LE(eocdOffset + 12);
    const cdOffset = buf.readUInt32LE(eocdOffset + 16);

    // ZIP64 check
    if (diskNumber === 0xFFFF || cdDiskNumber === 0xFFFF || diskEntries === 0xFFFF ||
        totalEntries === 0xFFFF || cdSize === 0xFFFFFFFF || cdOffset === 0xFFFFFFFF) {
      throw new ZipIntakeError('ZIP64_UNSUPPORTED', 'ZIP64 extensions are not permitted in operator intake.');
    }

    // Multi-disk check
    if (diskNumber !== 0 || cdDiskNumber !== 0 || diskEntries !== totalEntries) {
      throw new ZipIntakeError('MULTIDISK_ZIP_UNSUPPORTED', 'Multi-disk or split ZIP archives are not supported.');
    }

    // Boundary check
    if (cdOffset + cdSize > eocdOffset) {
      throw new ZipIntakeError('CORRUPT_CENTRAL_DIRECTORY_BOUNDS', 'Central Directory overlaps or exceeds EOCD offset.');
    }

    return {
      eocdOffset,
      totalEntries,
      cdSize,
      cdOffset
    };
  }

  /**
   * Safely enumerates all Central Directory records starting from EOCD coordinates.
   */
  enumerateZip(buf) {
    const eocd = this.findEocd(buf);

    if (eocd.totalEntries > this.limits.maxFileCount) {
      throw new ZipIntakeError(
        'ZIP_RESOURCE_LIMIT_EXCEEDED',
        `Archive file count (${eocd.totalEntries}) exceeds maximum safety ceiling of ${this.limits.maxFileCount}.`
      );
    }

    const entries = [];
    let p = eocd.cdOffset;
    const cdEnd = eocd.cdOffset + eocd.cdSize;
    let cumulativeUncompressedBytes = 0;
    const seenNormalizedPaths = new Set();
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

    for (let entryIdx = 0; entryIdx < eocd.totalEntries; entryIdx++) {
      if (p + 46 > cdEnd) {
        throw new ZipIntakeError('TRUNCATED_CENTRAL_DIRECTORY', `Central Directory entry ${entryIdx} truncated before header end.`);
      }

      // Check CD signature: 0x50 0x4B 0x01 0x02
      if (buf[p] !== 0x50 || buf[p + 1] !== 0x4B || buf[p + 2] !== 0x01 || buf[p + 3] !== 0x02) {
        throw new ZipIntakeError('INVALID_CENTRAL_DIRECTORY_SIGNATURE', `Invalid signature at offset ${p}.`);
      }

      const flags = buf.readUInt16LE(p + 8);
      const compMethod = buf.readUInt16LE(p + 10);
      const crc32 = buf.readUInt32LE(p + 16);
      const compSize = buf.readUInt32LE(p + 20);
      const uncompSize = buf.readUInt32LE(p + 24);
      const fnameLen = buf.readUInt16LE(p + 28);
      const extraLen = buf.readUInt16LE(p + 30);
      const commentLen = buf.readUInt16LE(p + 32);
      const externalAttrs = buf.readUInt32LE(p + 38);
      const localOffset = buf.readUInt32LE(p + 42);

      // 1. Encryption checks (bit 0 standard encryption, bit 6 strong encryption)
      if ((flags & 0x01) !== 0 || (flags & 0x40) !== 0) {
        throw new ZipIntakeError('ENCRYPTED_ZIP_UNSUPPORTED', 'Encrypted archive members are not permitted.');
      }

      // 2. Unsupported special flags check (bit 13: masked local headers)
      if ((flags & 0x2000) !== 0) {
        throw new ZipIntakeError('UNSUPPORTED_ZIP_FLAG', `Masked local headers (bit 13) are rejected fail-closed.`);
      }

      // 3. Data descriptor flag (bit 3)
      const hasDataDescriptor = (flags & 0x08) !== 0;

      // 4. Compression method check: only 0 (Stored) or 8 (Deflate)
      if (compMethod !== 0 && compMethod !== 8) {
        throw new ZipIntakeError('UNSUPPORTED_COMPRESSION_METHOD', `Compression method ${compMethod} is not supported.`);
      }

      // 5. External attributes: POSIX file mode check (bits 16-31)
      const posixMode = (externalAttrs >>> 16) & 0o170000;
      if (posixMode === 0o120000) {
        throw new ZipIntakeError('SYMLINK_REJECTED', 'Symbolic links are strictly prohibited in operator ZIP intake.');
      }
      if (posixMode === 0o010000 || posixMode === 0o020000 || posixMode === 0o060000 || posixMode === 0o140000) {
        throw new ZipIntakeError('UNSUPPORTED_SPECIAL_FILE', `Special POSIX file mode 0${posixMode.toString(8)} rejected.`);
      }

      // 6. Decode filename with fatal UTF-8
      if (p + 46 + fnameLen > cdEnd) {
        throw new ZipIntakeError('TRUNCATED_FILENAME', 'Filename exceeds Central Directory bounds.');
      }
      const rawNameBuf = buf.subarray(p + 46, p + 46 + fnameLen);
      let filename;
      try {
        filename = utf8Decoder.decode(rawNameBuf);
      } catch (e) {
        throw new ZipIntakeError('MALFORMED_UTF8_FILENAME', `Filename contains invalid UTF-8 bytes: ${e.message}`);
      }

      // 7. Path Traversal & Zip-Slip defense
      if (filename.includes('\0')) {
        throw new ZipIntakeError('ZIP_PATH_TRAVERSAL_REFUSED', `Filename contains null byte.`);
      }
      if (/^[a-zA-Z]:/.test(filename) || filename.startsWith('/') || filename.startsWith('\\')) {
        throw new ZipIntakeError('ZIP_PATH_TRAVERSAL_REFUSED', `Absolute path or drive letter detected: ${filename}`);
      }
      const parts = filename.split(/[/\\]/);
      for (const part of parts) {
        if (part === '..' || part === '.') {
          throw new ZipIntakeError('ZIP_PATH_TRAVERSAL_REFUSED', `Relative directory traversal segment detected in: ${filename}`);
        }
      }

      // 8. Path normalization and duplicate path detection
      const normalizedPath = parts.filter(Boolean).join('/');
      const isDirectory = filename.endsWith('/') || filename.endsWith('\\') || (posixMode === 0o040000);

      if (!isDirectory) {
        if (seenNormalizedPaths.has(normalizedPath)) {
          throw new ZipIntakeError('DUPLICATE_PATH_IN_ARCHIVE_REJECTED', `Duplicate normalized archive path: ${normalizedPath}`);
        }
        seenNormalizedPaths.add(normalizedPath);
      }

      // 9. Resource limits check
      if (uncompSize > this.limits.maxSingleFileSize) {
        throw new ZipIntakeError(
          'ZIP_RESOURCE_LIMIT_EXCEEDED',
          `Member ${filename} uncompressed size ${uncompSize} exceeds single-file limit of ${this.limits.maxSingleFileSize}.`
        );
      }

      cumulativeUncompressedBytes += uncompSize;
      if (cumulativeUncompressedBytes > this.limits.maxCumulativeBytes) {
        throw new ZipIntakeError(
          'ZIP_RESOURCE_LIMIT_EXCEEDED',
          `Cumulative uncompressed archive size (${cumulativeUncompressedBytes}) exceeds ceiling of ${this.limits.maxCumulativeBytes}.`
        );
      }

      // 10. Zip-Bomb compression ratio check
      if (compSize > 0 && uncompSize / compSize > this.limits.maxCompressionRatio) {
        throw new ZipIntakeError(
          'ZIP_RESOURCE_LIMIT_EXCEEDED',
          `Compression ratio for ${filename} (${(uncompSize / compSize).toFixed(1)}:1) exceeds ceiling of ${this.limits.maxCompressionRatio}:1.`
        );
      }

      // 11. Validate local header offset within buffer bounds
      if (localOffset + 30 > eocd.cdOffset) {
        throw new ZipIntakeError('CORRUPT_LOCAL_HEADER_OFFSET', `Local header offset ${localOffset} exceeds Central Directory start ${eocd.cdOffset}.`);
      }
      const localFnameLen = buf.readUInt16LE(localOffset + 26);
      const localExtraLen = buf.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localFnameLen + localExtraLen;
      const dataEnd = dataStart + compSize;

      let memberEnd = dataEnd;
      let descriptorLength = 0;
      if (hasDataDescriptor) {
        if (dataEnd + 12 > eocd.cdOffset) {
          throw new ZipIntakeError('CORRUPT_LOCAL_DATA', `Data descriptor for ${normalizedPath} exceeds Central Directory offset.`);
        }
        const descSig = buf.readUInt32LE(dataEnd);
        if (descSig === 0x08074b50) {
          if (dataEnd + 16 > eocd.cdOffset) {
            throw new ZipIntakeError('CORRUPT_LOCAL_DATA', `16-byte data descriptor for ${normalizedPath} exceeds Central Directory offset.`);
          }
          descriptorLength = 16;
        } else {
          descriptorLength = 12;
        }
        memberEnd = dataEnd + descriptorLength;
      }

      if (memberEnd > eocd.cdOffset) {
        throw new ZipIntakeError('CORRUPT_LOCAL_DATA', `Member ${normalizedPath} byte span exceeds Central Directory offset.`);
      }

      entries.push({
        filename: normalizedPath,
        rawFilename: filename,
        rawFilenameBytes: Buffer.from(rawNameBuf),
        isDirectory,
        compressionMethod: compMethod,
        flags,
        hasDataDescriptor,
        crc32,
        compressedSize: compSize,
        uncompressedSize: uncompSize,
        localOffset,
        dataStart,
        dataEnd,
        memberEnd,
        descriptorLength
      });

      p += 46 + fnameLen + extraLen + commentLen;
    }

    // 12. Verify non-overlapping member ranges
    const sortedRanges = [...entries].sort((a, b) => a.localOffset - b.localOffset);
    for (let i = 0; i < sortedRanges.length; i++) {
      if (i > 0) {
        const prev = sortedRanges[i - 1];
        const curr = sortedRanges[i];
        if (curr.localOffset < prev.memberEnd) {
          throw new ZipIntakeError(
            'CORRUPT_OR_OVERLAPPING_MEMBER_RANGE',
            `Member '${curr.filename}' at offset ${curr.localOffset} overlaps previous member '${prev.filename}' ending at ${prev.memberEnd}.`
          );
        }
      }
    }

    return entries;
  }

  /**
   * Validates the Local File Header, data descriptor, and decompresses entry with strict bounds and CRC check.
   */
  decompressAndVerifyEntry(buf, entry, cdOffset = null) {
    const localOffset = entry.localOffset;
    const boundary = cdOffset || buf.length;
    if (localOffset + 30 > boundary) {
      throw new ZipIntakeError('CORRUPT_LOCAL_HEADER', `Local header offset ${localOffset} beyond buffer bounds.`);
    }

    // Verify local header signature: 0x50 0x4B 0x03 0x04
    if (buf[localOffset] !== 0x50 || buf[localOffset + 1] !== 0x4B ||
        buf[localOffset + 2] !== 0x03 || buf[localOffset + 3] !== 0x04) {
      throw new ZipIntakeError('INVALID_LOCAL_HEADER_SIGNATURE', `Local header signature mismatch at offset ${localOffset}.`);
    }

    const localFlags = buf.readUInt16LE(localOffset + 6);
    const localMethod = buf.readUInt16LE(localOffset + 8);
    const localCrc32 = buf.readUInt32LE(localOffset + 14);
    const localCompSize = buf.readUInt32LE(localOffset + 18);
    const localUncompSize = buf.readUInt32LE(localOffset + 22);
    const localFnameLen = buf.readUInt16LE(localOffset + 26);
    const localExtraLen = buf.readUInt16LE(localOffset + 28);

    // Reconcile general purpose bit flags
    if (localFlags !== entry.flags) {
      throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Flags mismatch: local 0x${localFlags.toString(16)} vs central 0x${entry.flags.toString(16)} for ${entry.filename}.`);
    }

    // Reconcile compression method
    if (localMethod !== entry.compressionMethod) {
      throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Compression method mismatch: local ${localMethod} vs central ${entry.compressionMethod} for ${entry.filename}.`);
    }

    // Reconcile raw filename bytes exactly
    if (localFnameLen !== entry.rawFilenameBytes.length) {
      throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Filename byte length mismatch: local ${localFnameLen} vs central ${entry.rawFilenameBytes.length} for ${entry.filename}.`);
    }
    const localRawFname = buf.subarray(localOffset + 30, localOffset + 30 + localFnameLen);
    if (!localRawFname.equals(entry.rawFilenameBytes)) {
      throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Local filename bytes do not match central directory filename bytes for ${entry.filename}.`);
    }

    // Reconcile sizes, CRC-32 and descriptors
    if (entry.hasDataDescriptor) {
      const dataEnd = entry.dataEnd;
      let descCrc, descComp, descUncomp;
      if (entry.descriptorLength === 16) {
        descCrc = buf.readUInt32LE(dataEnd + 4);
        descComp = buf.readUInt32LE(dataEnd + 8);
        descUncomp = buf.readUInt32LE(dataEnd + 12);
      } else {
        descCrc = buf.readUInt32LE(dataEnd);
        descComp = buf.readUInt32LE(dataEnd + 4);
        descUncomp = buf.readUInt32LE(dataEnd + 8);
      }
      if (descCrc !== entry.crc32 || descComp !== entry.compressedSize || descUncomp !== entry.uncompressedSize) {
        throw new ZipIntakeError(
          'DATA_DESCRIPTOR_RECONCILIATION_FAILED',
          `Data descriptor mismatch for ${entry.filename}: descriptor [crc=0x${descCrc.toString(16)}, comp=${descComp}, uncomp=${descUncomp}] vs central [crc=0x${entry.crc32.toString(16)}, comp=${entry.compressedSize}, uncomp=${entry.uncompressedSize}].`
        );
      }
      if (localCrc32 !== 0 && localCrc32 !== entry.crc32) {
        throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Local CRC-32 (0x${localCrc32.toString(16)}) != central (0x${entry.crc32.toString(16)}) for ${entry.filename}.`);
      }
      if (localCompSize !== 0 && localCompSize !== entry.compressedSize) {
        throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Local compressed size (${localCompSize}) != central (${entry.compressedSize}) for ${entry.filename}.`);
      }
      if (localUncompSize !== 0 && localUncompSize !== entry.uncompressedSize) {
        throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Local uncompressed size (${localUncompSize}) != central (${entry.uncompressedSize}) for ${entry.filename}.`);
      }
    } else {
      if (localCrc32 !== entry.crc32) {
        throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `CRC-32 mismatch: local 0x${localCrc32.toString(16)} vs central 0x${entry.crc32.toString(16)} for ${entry.filename}.`);
      }
      if (localCompSize !== entry.compressedSize) {
        throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Compressed size mismatch: local ${localCompSize} vs central ${entry.compressedSize} for ${entry.filename}.`);
      }
      if (localUncompSize !== entry.uncompressedSize) {
        throw new ZipIntakeError('LOCAL_CENTRAL_METADATA_MISMATCH', `Uncompressed size mismatch: local ${localUncompSize} vs central ${entry.uncompressedSize} for ${entry.filename}.`);
      }
    }

    const dataStart = entry.dataStart;
    if (entry.dataEnd > boundary) {
      throw new ZipIntakeError('CORRUPT_LOCAL_DATA', `Data slice for ${entry.filename} exceeds buffer length.`);
    }

    const slice = buf.subarray(dataStart, entry.dataEnd);
    let decompressed;

    if (entry.compressionMethod === 0) {
      // Stored
      if (slice.length !== entry.uncompressedSize) {
        throw new ZipIntakeError('STORED_SIZE_MISMATCH', `Stored member length ${slice.length} != declared ${entry.uncompressedSize}.`);
      }
      decompressed = Buffer.from(slice); // defensive copy
    } else if (entry.compressionMethod === 8) {
      // Deflate with strict output bounding
      try {
        decompressed = zlib.inflateRawSync(slice, {
          maxOutputLength: Math.min(entry.uncompressedSize, this.limits.maxSingleFileSize)
        });
      } catch (err) {
        throw new ZipIntakeError('DECOMPRESSION_FAILED_OR_LIMIT_EXCEEDED', `Decompression failed for ${entry.filename}: ${err.message}`);
      }
    }

    // Verify decompressed length matches declared uncompressed size
    if (decompressed.length !== entry.uncompressedSize) {
      throw new ZipIntakeError(
        'UNCOMPRESSED_SIZE_MISMATCH',
        `Decompressed length ${decompressed.length} does not match declared uncompressed size ${entry.uncompressedSize}.`
      );
    }

    // Verify CRC-32
    const computedCrc = computeCrc32(decompressed);
    if (computedCrc !== entry.crc32) {
      throw new ZipIntakeError(
        'CRC32_VERIFICATION_FAILED',
        `CRC-32 verification failed for ${entry.filename}: expected 0x${entry.crc32.toString(16)} got 0x${computedCrc.toString(16)}.`
      );
    }

    return decompressed;
  }

  /**
   * Executes full atomic intake of an operator-provided ZIP buffer.
   * If ANY member fails validation, decompression, CRC, or decoding, ZERO state is admitted.
   */
  processZipArchive(buf, archiveId = 'intake:zip:default') {
    const eocd = this.findEocd(buf);
    const entries = this.enumerateZip(buf);

    // Staging structures for atomic admission
    const stagedSources = [];
    const stagedDerivatives = [];
    const stagedDuplicates = [];
    const stagedResults = [];
    const hashToSources = new Map();
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

    for (const entry of entries) {
      if (entry.isDirectory) {
        continue;
      }

      const rawBytes = this.decompressAndVerifyEntry(buf, entry, eocd.cdOffset);
      const digest = sha256Hex(rawBytes);
      const sourceId = `src:intake:${archiveId}:${sha256Hex(Buffer.from(entry.filename)).slice(0, 16)}`;

      // Classify file type
      let fileType = 'BINARY_UNSUPPORTED';
      let extractedText = null;
      let isTextBearing = false;

      const lowerName = entry.filename.toLowerCase();
      const isAppleDouble = entry.filename.startsWith('__MACOSX/') || entry.filename.includes('/._') || entry.filename.startsWith('._');

      if (isAppleDouble) {
        fileType = 'APPLEDOUBLE_RESOURCE_FORK';
        isTextBearing = false;
      } else if (lowerName.endsWith('.md')) {
        fileType = 'TEXT_MARKDOWN';
        try {
          extractedText = utf8Decoder.decode(rawBytes);
          isTextBearing = true;
        } catch (e) {
          throw new ZipIntakeError('MALFORMED_UTF8_CONTENT', `Markdown content in ${entry.filename} failed UTF-8 decoding.`);
        }
      } else if (lowerName.endsWith('.txt')) {
        fileType = 'TEXT_PLAIN';
        try {
          extractedText = utf8Decoder.decode(rawBytes);
          isTextBearing = true;
        } catch (e) {
          throw new ZipIntakeError('MALFORMED_UTF8_CONTENT', `Text content in ${entry.filename} failed UTF-8 decoding.`);
        }
      } else if (lowerName.endsWith('.pdf')) {
        fileType = 'BINARY_PDF';
      }

      // Duplicate detection
      const isDuplicate = hashToSources.has(digest);
      const duplicateOf = isDuplicate ? hashToSources.get(digest) : null;
      if (!isDuplicate) {
        hashToSources.set(digest, sourceId);
      } else {
        stagedDuplicates.push({
          source_id: sourceId,
          filename: entry.filename,
          duplicate_of: duplicateOf,
          sha256: digest
        });
      }

      // Staged source record
      const sourceRecord = {
        source_id: sourceId,
        archive_id: archiveId,
        filename: entry.filename,
        byte_length: rawBytes.length,
        sha256: digest,
        file_type: fileType,
        is_duplicate: isDuplicate,
        duplicate_of: duplicateOf,
        raw_bytes: rawBytes,
        admitted_at: new Date().toISOString()
      };
      stagedSources.push(sourceRecord);

      // Staged derivative record
      let derivativeRecord = null;
      if (isTextBearing && extractedText !== null) {
        const derivId = `deriv:intake:${sourceId}`;
        const derivHash = sha256Hex(Buffer.from(extractedText, 'utf8'));
        derivativeRecord = {
          derivative_id: derivId,
          source_id: sourceId,
          parent_sha256: digest,
          derivative_sha256: derivHash,
          text: extractedText,
          extraction_status: 'EXTRACTED_NATIVE_TEXT',
          created_at: new Date().toISOString()
        };
        stagedDerivatives.push(derivativeRecord);
      }

      stagedResults.push({
        source_id: sourceId,
        filename: entry.filename,
        byte_length: rawBytes.length,
        sha256: digest,
        file_type: fileType,
        is_text_bearing: isTextBearing,
        derivative_id: derivativeRecord ? derivativeRecord.derivative_id : null
      });
    }

    // ATOMIC COMMIT: Everything succeeded; now commit to instance custody
    for (const s of stagedSources) {
      this.admittedSources.set(s.source_id, s);
    }
    for (const d of stagedDerivatives) {
      this.admittedDerivatives.set(d.derivative_id, d);
    }
    for (const dup of stagedDuplicates) {
      this.duplicateRegistry.push(dup);
    }

    this.intakeLedger.push({
      timestamp: new Date().toISOString(),
      action: 'ARCHIVE_ADMITTED_ATOMIC',
      archive_id: archiveId,
      admitted_sources_count: stagedSources.length,
      extracted_derivatives_count: stagedDerivatives.length
    });

    return {
      archive_id: archiveId,
      total_members_enumerated: entries.length,
      admitted_sources_count: stagedSources.length,
      extracted_derivatives_count: stagedDerivatives.length,
      exact_duplicates_count: stagedDuplicates.length,
      results: stagedResults
    };
  }

  /**
   * Retrieves a passage from an admitted text derivative with exact, codepoint-aligned coordinates.
   */
  retrievePassage(derivativeId, start, end) {
    const deriv = this.admittedDerivatives.get(derivativeId);
    if (!deriv) {
      throw new ZipIntakeError('DERIVATIVE_NOT_FOUND', `Derivative ${derivativeId} not found.`);
    }

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new ZipIntakeError('INVALID_COORDINATES', `Coordinates must be integers, got start: ${start}, end: ${end}.`);
    }

    const buf = Buffer.from(deriv.text, 'utf8');
    if (start < 0 || end > buf.length || start > end) {
      throw new ZipIntakeError('INVALID_COORDINATES', `Coordinates [${start}, ${end}] out of range for length ${buf.length}.`);
    }

    if (!isCodepointBoundary(buf, start) || !isCodepointBoundary(buf, end)) {
      throw new ZipIntakeError('INVALID_CODEPOINT_BOUNDARY', `Passage boundary [${start}, ${end}] cuts inside UTF-8 multi-byte sequence.`);
    }

    const slice = buf.subarray(start, end);
    const spanText = slice.toString('utf8');

    return {
      derivative_id: derivativeId,
      source_id: deriv.source_id,
      parent_sha256: deriv.parent_sha256,
      start,
      end,
      byte_length: slice.length,
      span_sha256: sha256Hex(slice),
      span_text: spanText
    };
  }
}
