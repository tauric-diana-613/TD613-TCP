import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { digest, canonical } from './journal.mjs';
import { verifyAuthenticatedPhysicalArchiveMember } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';

export const ARCHIVAL_SCHEMA = 'td613.arm1-control/v2';
export function archivalBinding(repoRoot) {
  const files = ['scripts/experiment-b-resumable/archival-control-v2.mjs',
    'scripts/experiment-b-resumable/journal.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/admission-policy.mjs',
    'scripts/stage-encyclopedia-record.cjs','scripts/encyclopedia-intake.cjs',
    'scripts/encyclopedia-intake-schema.json',
    'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs'];
  const root = fs.realpathSync(repoRoot);
  const sources = files.map(file => {
    const target = path.join(root, file);
    if (!fs.lstatSync(target).isFile() || fs.realpathSync(target) !== target) throw Error('BOUND_SOURCE_SUBSTITUTION');
    return [file, digest(fs.readFileSync(target))];
  });
  return digest({ schema: 'td613.arm1-implementation/v3', receipt_schema: ARCHIVAL_SCHEMA, sources });
}
const require = createRequire(import.meta.url);
const compilerPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs';
const evidenceClasses = new Set(['SOURCE_EXPLICIT_SEQUENCE','SOURCE_EXPLICIT_PROGRAM','SOURCE_EXPLICIT_SYNTHESIS','SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE','ARCHIVE_NORMALIZED_FROM_PUBLIC_SOURCE','ARCHIVE_DERIVED_COOCCURRENCE_NOT_CAUSAL']);

// Native CLI prepares the proposal. Linking a complete temporary result publishes
// without overwrite; a failed attempt can be retried against the same exact bytes.
function stageProposal(repoRoot, text, proposalDirectory, inputHash, inspection) {
  const recordId = inspection.record.record_id;
  // Match the native CLI's deterministic representation from authoritative input.
  const expected = { schema: 'td613.research-proposal/v1', disposition: 'PROPOSED',
    input_sha256: inputHash, original_json: text, record: inspection.record, authority: inspection.authority };
  const expectedBytes = Buffer.from(JSON.stringify(expected, null, 2) + '\n');
  if (!proposalDirectory) throw Error('PROPOSAL_STORE_REQUIRED');
  fs.mkdirSync(proposalDirectory, { recursive: true, mode: 0o700 });
  if (fs.lstatSync(proposalDirectory).isSymbolicLink()) throw Error('PROPOSAL_STORE_SYMLINK');
  const store = fs.realpathSync(proposalDirectory), repo = fs.realpathSync(repoRoot);
  if (store === repo || store.startsWith(repo + path.sep)) throw Error('EXTERNAL_PROPOSAL_STORE_REQUIRED');
  const destination = path.join(store, digest(recordId) + '.json');
  const verify = () => {
    if (fs.lstatSync(destination).isSymbolicLink()) throw Error('PROPOSAL_SYMLINK');
    const bytes = fs.readFileSync(destination);
    if (!bytes.equals(expectedBytes)) throw Error('PROPOSAL_CONFLICT');
    return { schema: expected.schema, disposition: expected.disposition, record_id: recordId,
      input_sha256: inputHash, staged_sha256: digest(bytes), readback_verified: true };
  };
  if (fs.existsSync(destination)) return verify();
  const temporary = fs.mkdtempSync(path.join(store, '.proposal-'));
  try {
    const input = path.join(temporary, 'input.json'), output = path.join(temporary, 'proposal.json');
    fs.writeFileSync(input, text, { mode: 0o600 });
    const run = spawnSync(process.execPath, [path.join(repoRoot, 'scripts/stage-encyclopedia-record.cjs'), input, output], { encoding: 'utf8', timeout: 10000 });
    if (run.error || run.status !== 0) throw Error('NATIVE_PROPOSAL_PREPARATION_FAILED');
    fs.chmodSync(output, 0o600);
    const fd = fs.openSync(output, 'r');
    try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    try { fs.linkSync(output, destination); } catch (e) { if (e.code !== 'EEXIST') throw e; }
    return verify();
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

export async function runArchivalControlV2(repoRoot, documents = [], { sourceFree = false, proposalDirectory } = {}) {
  const intake = require(path.join(repoRoot, 'scripts/encyclopedia-intake.cjs'));
  const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, 'scripts/encyclopedia-intake-schema.json'), 'utf8'));
  let compiler;
  try { compiler = await import(pathToFileURL(path.join(repoRoot, compilerPath)).href); } catch { /* Explicit operation absence below. */ }
  const results = [], seen = new Set(), records = new Set();
  for (const doc of documents) {
    const row = { document_id: doc.id ?? null, filename: doc.filename ?? null, original_sha256: doc.sha256 ?? null,
      custody: 'UNVERIFIED', durable_byte_custody: false, indexed: false, index_status: 'NOT_EXECUTED',
      schema_status: 'NOT_EXECUTED', proposal_status: 'NOT_EXECUTED', compiler_status: 'NOT_EXECUTED' };
    results.push(row);
    if (!doc.id || seen.has(doc.id)) { row.error = 'DUPLICATE_OR_MISSING_MEMBER_ID'; continue; }
    seen.add(doc.id);
    if (!Buffer.isBuffer(doc.raw_bytes)) { row.error = 'ORIGINAL_BYTES_REQUIRED'; continue; }
    if (!/^[a-f0-9]{64}$/.test(doc.sha256 ?? '') || digest(doc.raw_bytes) !== doc.sha256) { row.error = 'ORIGINAL_DIGEST_MISMATCH'; continue; }
    if (!sourceFree && !verifyAuthenticatedPhysicalArchiveMember(doc)) { row.error = 'UPSTREAM_MEMBER_AUTHENTICATION_REQUIRED'; continue; }
    row.custody = sourceFree ? 'SYNTHETIC_BYTES_VERIFIED' : 'AUTHENTICATED_UPSTREAM_MEMBER';
    row.original_bytes = doc.raw_bytes.length;
    row.content_sha256 = typeof doc.content === 'string' ? digest(doc.content) : null;
    if (!sourceFree && !verifyAuthenticatedPhysicalArchiveMember(doc)) { row.error = 'UPSTREAM_MEMBER_CHANGED'; continue; }
    if (typeof doc.content !== 'string') {
      row.schema_status = 'INCOMPATIBLE_INPUT'; row.compiler_status = 'INCOMPATIBLE_INPUT'; continue;
    }
    const inspected = intake.inspect(doc.content, schema);
    row.schema_status = inspected.valid ? 'VALID' : 'NATIVE_REFUSAL';
    if (inspected.valid) {
      const id = inspected.record.record_id;
      if (records.has(id)) { row.error = 'DUPLICATE_RECORD_ID'; continue; }
      records.add(id);
      try {
        row.proposal = stageProposal(repoRoot, doc.content, proposalDirectory, row.content_sha256, inspected);
        row.proposal_status = 'STAGED_PROPOSED';
      } catch (e) { row.error = e.message; row.proposal_status = 'INCOMPLETE'; }
    }
    let parsed;
    try { parsed = JSON.parse(doc.content); } catch { parsed = null; }
    if (parsed?.meta?.schema !== 'wendbine-public-corpus-snapshot/v0.1' || !Array.isArray(parsed.posts) || !Array.isArray(parsed.relations)) {
      row.compiler_status = 'INCOMPATIBLE_INPUT'; continue;
    }
    if (typeof compiler?.compilePublicCorpus !== 'function') { row.compiler_status = 'UNAVAILABLE'; row.error = 'NATIVE_COMPILER_UNAVAILABLE'; continue; }
    try {
      const topology = compiler.compilePublicCorpus(parsed.meta, parsed.posts, parsed.relations);
      row.compiler_status = topology.typed_relation_edges.length ? 'EXECUTED_POSITIVE' : 'EXECUTED_ZERO';
      row.relations_compiled = topology.typed_relation_edges.length;
      row.output_sha256 = digest(topology);
      row.semantic_credit = topology.typed_relation_edges.every(edge => Object.hasOwn(topology.graph_semantics, edge.graph) && evidenceClasses.has(edge.evidence_class));
    } catch (e) { row.compiler_status = 'NATIVE_REFUSAL'; row.compiler_refusal = e.message; }
  }
  const receipt = { schema: ARCHIVAL_SCHEMA, evidence_class: sourceFree ? 'SOURCE_FREE_FIXTURE' : 'AUTHENTICATED_MEMBER_CONTROL',
    arm: 'ARM_1_ARCHIVAL', total_incoming: documents.length, per_document_operations: results,
    raw_bytes_preserved: 0, total_indexed: 0, autonomous_relation_synthesis_present: false,
    relations_compiled: results.reduce((n, r) => n + (r.relations_compiled ?? 0), 0),
    status: !documents.length || !compiler?.compilePublicCorpus || results.some(r => r.error) ? 'INCOMPLETE' : 'COMPLETE_TYPED_OUTCOMES' };
  return { ...receipt, receipt_sha256: digest(receipt) };
}

export function assertArchivalReceipt(receipt, documents, { sourceFree = false } = {}) {
  const { receipt_sha256, ...body } = receipt ?? {};
  if (body.schema !== ARCHIVAL_SCHEMA || digest(body) !== receipt_sha256 || body.status !== 'COMPLETE_TYPED_OUTCOMES' ||
      body.evidence_class !== (sourceFree ? 'SOURCE_FREE_FIXTURE' : 'AUTHENTICATED_MEMBER_CONTROL') ||
      body.total_incoming !== documents.length || body.per_document_operations?.length !== documents.length) throw Error('ARCHIVAL_BASELINE_INCOMPLETE_OR_LEGACY');
  for (const [i, doc] of documents.entries()) {
    const row = body.per_document_operations[i];
    if (row.document_id !== doc.id || row.original_sha256 !== doc.sha256 || row.error ||
        !Buffer.isBuffer(doc.raw_bytes) || digest(doc.raw_bytes) !== row.original_sha256 ||
        (!sourceFree && !verifyAuthenticatedPhysicalArchiveMember(doc)) ||
        !['EXECUTED_POSITIVE','EXECUTED_ZERO','INCOMPATIBLE_INPUT','NATIVE_REFUSAL'].includes(row.compiler_status)) throw Error('ARCHIVAL_MEMBER_BINDING_REJECTED');
  }
  return receipt;
}

// Replay re-executes deterministic compilation and verifies existing proposal bytes.
// Historical accepted receipts are never migrated implicitly.
export async function recordArchivalBaselines({ journal, repoRoot, documents, binding, proposalDirectory, sourceFree = false }) {
  if (binding !== archivalBinding(repoRoot)) throw Error('NEW_BASELINE_BINDING_REQUIRES_HUMAN_REVIEW');
  if (journal.events().some(e => e.type === 'BASELINES_ACCEPTED')) throw Error('LEGACY_BASELINE_REQUIRES_HUMAN_REVIEW');
  const prior = journal.events().filter(e => e.type === 'BASELINES_RECORDED_V2');
  if (prior.length > 1) throw Error('DUPLICATE_BASELINE_CHECKPOINT');
  const arm1 = assertArchivalReceipt(await runArchivalControlV2(repoRoot, documents, { sourceFree, proposalDirectory }), documents, { sourceFree });
  const results = { schema: ARCHIVAL_SCHEMA, binding, arm1,
    arm0: { role: 'DETERMINISTIC_TRANSPORT', documents: documents.map(d => ({ id: d.id, sha256: d.sha256, raw_byte_sha256: digest(d.raw_bytes) })) } };
  if (prior.length) {
    if (canonical(prior[0].payload.results) !== canonical(results)) throw Error('BASELINE_CHECKPOINT_INCOMPATIBLE');
  } else journal.append('BASELINES_RECORDED_V2', { results });
  return results;
}
