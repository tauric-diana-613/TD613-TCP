#!/usr/bin/env node
/**
 * scripts/verify-carried-bytes.mjs
 * 
 * Canonical-Byte Custody Auditor (TD613 Exteriority Observatory · Section VI)
 * 
 * Enforces the hard distinction:
 *   LOCAL_WORKTREE_DIGEST != STAGED_BLOB_DIGEST != REMOTE_BLOB_DIGEST
 * 
 * Prevents silent CRLF/LF or encoding normalizations from masquerading as carried-byte identity.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

/**
 * Determine newline character format for text buffers without altering content.
 * @param {Buffer} buf
 * @returns {'LF' | 'CRLF' | 'CR' | 'MIXED' | 'NO_NEWLINE' | 'BINARY'}
 */
export function detectNewlineMode(buf) {
  // Check if binary (presence of null bytes in first 8KB)
  const probeLen = Math.min(buf.length, 8192);
  for (let i = 0; i < probeLen; i++) {
    if (buf[i] === 0) return 'BINARY';
  }

  let crlfCount = 0;
  let lfCount = 0;
  let crCount = 0;

  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0d) { // CR
      if (i + 1 < buf.length && buf[i + 1] === 0x0a) {
        crlfCount++;
        i++; // skip LF
      } else {
        crCount++;
      }
    } else if (buf[i] === 0x0a) { // LF
      lfCount++;
    }
  }

  const total = crlfCount + lfCount + crCount;
  if (total === 0) return 'NO_NEWLINE';
  if (crlfCount > 0 && lfCount === 0 && crCount === 0) return 'CRLF';
  if (lfCount > 0 && crlfCount === 0 && crCount === 0) return 'LF';
  if (crCount > 0 && crlfCount === 0 && lfCount === 0) return 'CR';
  return 'MIXED';
}

/**
 * Compute raw SHA-256 hex digest of exact buffer bytes.
 * @param {Buffer} buf
 * @returns {string}
 */
export function computeSha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Compute Git blob SHA for a buffer: sha1("blob " + length + "\0" + content)
 * @param {Buffer} buf
 * @returns {string}
 */
export function computeGitBlobSha(buf) {
  const header = Buffer.from(`blob ${buf.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header, buf])).digest('hex');
}

/**
 * Retrieve staged blob buffer from Git index for a given path.
 * @param {string} gitPath
 * @param {string} repoRoot
 * @returns {Buffer | null}
 */
export function getStagedBlobBuffer(gitPath, repoRoot = process.cwd()) {
  try {
    const stdout = execFileSync('git', ['show', `:${gitPath}`], {
      cwd: repoRoot,
      encoding: 'buffer',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return stdout;
  } catch {
    return null;
  }
}

/**
 * Retrieve remote blob buffer from a declared remote branch ref.
 * @param {string} ref
 * @param {string} gitPath
 * @param {string} repoRoot
 * @returns {Buffer | null}
 */
export function getRemoteBlobBuffer(ref, gitPath, repoRoot = process.cwd()) {
  try {
    const stdout = execFileSync('git', ['show', `${ref}:${gitPath}`], {
      cwd: repoRoot,
      encoding: 'buffer',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return stdout;
  } catch {
    return null;
  }
}

/**
 * Inspect a file across working-tree, staged index, and remote ref.
 * @param {string} filePath
 * @param {object} options
 * @returns {object}
 */
export function inspectCarriedBytes(filePath, options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const remoteRef = options.remoteRef || null;
  const relPath = path.isAbsolute(filePath) ? path.relative(repoRoot, filePath).replace(/\\/g, '/') : filePath.replace(/\\/g, '/');
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);

  let worktreeBuffer = null;
  let worktreeSha256 = null;
  let worktreeGitSha = null;
  let worktreeNewlineMode = 'UNAVAILABLE';
  let worktreeByteLength = null;

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    worktreeBuffer = fs.readFileSync(fullPath);
    worktreeSha256 = computeSha256(worktreeBuffer);
    worktreeGitSha = computeGitBlobSha(worktreeBuffer);
    worktreeNewlineMode = detectNewlineMode(worktreeBuffer);
    worktreeByteLength = worktreeBuffer.length;
  }

  const stagedBuffer = getStagedBlobBuffer(relPath, repoRoot);
  const stagedSha256 = stagedBuffer ? computeSha256(stagedBuffer) : null;
  const stagedGitSha = stagedBuffer ? computeGitBlobSha(stagedBuffer) : null;
  const stagedNewlineMode = stagedBuffer ? detectNewlineMode(stagedBuffer) : 'UNAVAILABLE';
  const stagedByteLength = stagedBuffer ? stagedBuffer.length : null;

  let remoteBuffer = null;
  let remoteSha256 = null;
  let remoteGitSha = null;
  let remoteNewlineMode = 'UNAVAILABLE';
  let remoteByteLength = null;

  if (remoteRef) {
    remoteBuffer = getRemoteBlobBuffer(remoteRef, relPath, repoRoot);
    if (remoteBuffer) {
      remoteSha256 = computeSha256(remoteBuffer);
      remoteGitSha = computeGitBlobSha(remoteBuffer);
      remoteNewlineMode = detectNewlineMode(remoteBuffer);
      remoteByteLength = remoteBuffer.length;
    }
  }

  const worktreeStagedMatch = worktreeBuffer && stagedBuffer ? worktreeSha256 === stagedSha256 : null;
  const stagedRemoteMatch = stagedBuffer && remoteBuffer ? stagedSha256 === remoteSha256 : null;
  const worktreeRemoteMatch = worktreeBuffer && remoteBuffer ? worktreeSha256 === remoteSha256 : null;

  const hasCanonicalizationDrift = 
    (worktreeBuffer && stagedBuffer && worktreeSha256 !== stagedSha256) ||
    (worktreeBuffer && remoteBuffer && worktreeSha256 !== remoteSha256) ||
    (stagedBuffer && remoteBuffer && stagedSha256 !== remoteSha256);

  return {
    path: relPath,
    worktree: {
      present: worktreeBuffer !== null,
      byte_length: worktreeByteLength,
      newline_mode: worktreeNewlineMode,
      sha256: worktreeSha256,
      git_blob_sha: worktreeGitSha
    },
    staged: {
      present: stagedBuffer !== null,
      byte_length: stagedByteLength,
      newline_mode: stagedNewlineMode,
      sha256: stagedSha256,
      git_blob_sha: stagedGitSha
    },
    remote: {
      ref: remoteRef,
      present: remoteBuffer !== null,
      byte_length: remoteByteLength,
      newline_mode: remoteNewlineMode,
      sha256: remoteSha256,
      git_blob_sha: remoteGitSha
    },
    alignment: {
      worktree_staged_match: worktreeStagedMatch,
      staged_remote_match: stagedRemoteMatch,
      worktree_remote_match: worktreeRemoteMatch,
      has_canonicalization_drift: hasCanonicalizationDrift
    },
    digests: {
      LOCAL_WORKTREE_DIGEST: worktreeSha256,
      STAGED_BLOB_DIGEST: stagedSha256,
      REMOTE_BLOB_DIGEST: remoteSha256
    }
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const targetPath = process.argv[2];
  const remoteRef = process.argv[3] || null;

  if (!targetPath) {
    console.error('Usage: node scripts/verify-carried-bytes.mjs <file-path> [remote-ref]');
    process.exit(1);
  }

  const result = inspectCarriedBytes(targetPath, { remoteRef });
  console.log(JSON.stringify(result, null, 2));

  if (result.alignment.has_canonicalization_drift) {
    console.error(`\n[FAIL · CANONICALIZATION_DRIFT] Carried bytes differ across representations for ${targetPath}`);
    process.exit(2);
  }
}
