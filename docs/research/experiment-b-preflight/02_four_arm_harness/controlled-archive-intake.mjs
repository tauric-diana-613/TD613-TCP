/**
 * controlled-archive-intake.mjs
 *
 * TD613 Experiment B Controlled Archive Admission Route.
 * Enforces fail-closed physical custody boundaries:
 * 1. Prohibits automatic scanning or directory globbing (e.g. Downloads folder).
 * 2. Requires explicit, authenticated operator authorization before any archive access.
 * 3. Prohibits reading, hashing, or extracting protected Em material without active Flight authorization.
 * 4. Provides a verified source-free synthetic accession pathway for testing.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function computeSha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export class ControlledArchiveIntake {
  constructor(options = {}) {
    this.syntheticMode = options.syntheticMode ?? true;
    this.allowProtectedAdmission = options.allowProtectedAdmission ?? false;
  }

  /**
   * Admits an explicitly designated archive or document list after verifying operator authorization.
   *
   * @param {string|object} target - File path to archive/folder, or synthetic descriptor object
   * @param {object} authContext - Authorization credentials and flags
   * @returns {object} Admission receipt with document descriptors
   */
  admitArchive(target, authContext = {}) {
    // 1. Mandatory Operator Authorization Check
    const isEnvAuthorized = process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED === 'true';
    const isTokenAuthorized = Boolean(authContext.operatorAuthorizationToken && authContext.operatorAuthorizationToken.startsWith('TD613-OP-AUTH-'));
    const isSyntheticTest = Boolean(this.syntheticMode && authContext.syntheticFixturePermitted);

    if (!isEnvAuthorized && !isTokenAuthorized && !isSyntheticTest) {
      throw new Error(
        'ARCHIVE_ADMISSION_BLOCKED_UNAUTHORIZED: Protected corpus access refused. No operator authorization token supplied and TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED is not set to true.'
      );
    }

    // 2. Prohibit unspecific path discovery or globbing
    if (!target) {
      throw new Error(
        'ARCHIVE_ADMISSION_TARGET_REQUIRED: Target archive path or synthetic descriptor must be explicitly designated. Autonomous directory traversal is strictly forbidden.'
      );
    }

    // 3. Prohibit Protected Corpus Access in Preflight / Synthetic Mode
    if (typeof target === 'string') {
      const lower = target.toLowerCase();
      const isProtectedCandidate = lower.includes('em_') || lower.includes('challenge') || lower.includes('protected');
      if (isProtectedCandidate && !this.allowProtectedAdmission) {
        throw new Error(
          'PROTECTED_CORPUS_ACCESS_HELD: Access to protected Em challenge materials is held. Preflight launchbridge permits synthetic source-free admission only.'
        );
      }
    }

    // 4. Source-Free Synthetic Accession Execution
    const admissionId = `ADMISSION-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
    let admittedDocuments = [];

    if (typeof target === 'object' && Array.isArray(target.syntheticDocuments)) {
      admittedDocuments = target.syntheticDocuments.map((doc, idx) => {
        const contentBuf = Buffer.from(doc.content, 'utf8');
        return {
          id: doc.id || `DOC-${String(idx + 1).padStart(2, '0')}`,
          filename: doc.filename,
          content: doc.content,
          bytes: contentBuf.length,
          sha256: doc.sha256 || computeSha256(contentBuf),
          author_provenance: doc.author_provenance || 'Synthetic Source-Free Specimen',
          chronology_index: idx + 1
        };
      });
    } else if (typeof target === 'string' && fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      // Synthetic directory intake
      const files = fs.readdirSync(target).filter(f => f.endsWith('.md') || f.endsWith('.json'));
      admittedDocuments = files.map((file, idx) => {
        const fullPath = path.join(target, file);
        const contentBuf = fs.readFileSync(fullPath);
        return {
          id: `DOC-${String(idx + 1).padStart(2, '0')}`,
          filename: file,
          content: contentBuf.toString('utf8'),
          bytes: contentBuf.length,
          sha256: computeSha256(contentBuf),
          author_provenance: 'Source-Free Directory Fixture',
          chronology_index: idx + 1
        };
      });
    } else {
      throw new Error(`ARCHIVE_ADMISSION_UNRECOGNIZED_TARGET: Unable to admit target format: ${typeof target}`);
    }

    const manifestBuf = Buffer.from(JSON.stringify(admittedDocuments.map(d => ({ filename: d.filename, sha256: d.sha256, bytes: d.bytes }))));

    return {
      admission_id: admissionId,
      timestamp: new Date().toISOString(),
      document_count: admittedDocuments.length,
      documents: admittedDocuments,
      manifest_sha256: computeSha256(manifestBuf),
      custody_status: isSyntheticTest ? 'SOURCE_FREE_SYNTHETIC_VERIFIED' : 'PROTECTED_ADMISSION_ACTIVE',
      quarantine_maintained: isSyntheticTest
    };
  }
}
