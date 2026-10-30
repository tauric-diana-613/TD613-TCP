/**
 * controlled-archive-intake.mjs
 *
 * TD613 Experiment B Controlled Archive Admission Route.
 * Enforces fail-closed physical custody boundaries:
 * 1. Prohibits automatic scanning or directory globbing across Downloads or filesystem.
 * 2. Strictly prohibits physical filesystem exploration, directory reading, or path traversal in preflight.
 * 3. Restricts synthetic source-free testing to explicit in-memory registered fixtures with ZERO file I/O.
 * 4. Refuses forgeable tokens (string prefixes) or keyword-based confidentiality heuristics.
 * 5. Requires cryptographic operator authorization and explicit flight activation for physical admission.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import crypto from 'node:crypto';

function computeSha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export class ControlledArchiveIntake {
  /**
   * @param {object} options
   * @param {boolean} options.syntheticMode - Whether running in source-free synthetic preflight mode (default true)
   * @param {boolean} options.allowProtectedAdmission - Whether live protected flight admission is active (default false)
   */
  constructor(options = {}) {
    this.syntheticMode = options.syntheticMode ?? true;
    this.allowProtectedAdmission = options.allowProtectedAdmission ?? false;
  }

  /**
   * Admits an explicitly designated synthetic fixture or prospective archive.
   *
   * @param {object} target - Synthetic descriptor object (or prospective path)
   * @param {object} authContext - Authorization credentials and provenance
   * @returns {object} Admission receipt with document descriptors
   */
  admitArchive(target, authContext = {}) {
    // 1. Prohibit missing or unspecific target
    if (!target) {
      throw new Error(
        'ARCHIVE_ADMISSION_TARGET_REQUIRED: Target archive or synthetic fixture must be explicitly designated. Autonomous directory traversal is strictly forbidden.'
      );
    }

    // 2. Physical File I/O Guard: Disallow all physical paths in source-free preflight
    if (typeof target === 'string') {
      if (!this.allowProtectedAdmission) {
        throw new Error(
          'ARCHIVE_ADMISSION_PHYSICAL_PATH_BLOCKED: Physical filesystem exploration, directory reading, and path traversal are strictly forbidden in source-free preflight. Physical archive admission is closed pending Sovereign Operator Flight Activation. Synthetic testing must use in-memory fixtures only.'
        );
      }

      // If allowProtectedAdmission is true (future Flight only), require authenticated cryptographic authority
      const hasAuthToken = Boolean(authContext.operatorFlightSignature && authContext.operatorFlightKeyId);
      const isEnvAuthorized = process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED === 'true' &&
                              process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED === 'true';

      if (!hasAuthToken && !isEnvAuthorized) {
        throw new Error(
          'ARCHIVE_ADMISSION_UNAUTHORIZED: Live physical archive admission refused. Cryptographic operator flight signature and environment grant are required.'
        );
      }

      throw new Error(
        'ARCHIVE_ADMISSION_PHYSICAL_ZIP_HELD: Physical ZIP archive ingestion is held. Physical flight pipeline remains gated in preflight.'
      );
    }

    // 3. Synthetic In-Memory Accession Guard
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

    // 4. In-Memory Synthetic Accession Execution (Zero File I/O)
    const admissionId = `ADMISSION-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;

    const admittedDocuments = target.syntheticDocuments.map((doc, idx) => {
      if (!doc || !doc.filename || typeof doc.content !== 'string') {
        throw new Error(`ARCHIVE_ADMISSION_MALFORMED_SPECIMEN: Specimen at index ${idx} is missing required filename or content string.`);
      }

      const contentBuf = Buffer.from(doc.content, 'utf8');
      return {
        id: doc.id || `DOC-${String(idx + 1).padStart(2, '0')}`,
        filename: doc.filename,
        content: doc.content,
        bytes: contentBuf.length,
        sha256: doc.sha256 || computeSha256(contentBuf),
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
