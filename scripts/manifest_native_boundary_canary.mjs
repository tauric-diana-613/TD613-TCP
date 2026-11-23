#!/usr/bin/env node
/**
 * 𝌋 TD613 · Manifest Native Boundary Canary
 * 
 * Independently executes three native falsification probes against authentic receiver modules:
 * 1. W-RG-03: Zero-length spanProof admission (start=end=0) with empty-byte SHA-256
 * 2. W-RG-04: Multiple relations reusing single local ADMIT receipt with relation_id=null (NONEMPTY span)
 * 3. U-RG-01: route() phantom self-route on unadmitted node with get() negative control
 * 
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po (literal U+200C)
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import { WendbineEmptyEncyclopediaReceiver, sha256 as wbSha256 } from '../packages/wendbine_reciprocal_expedition/receiver/wendbine-empty-receiver.mjs';
import { UniversalAtelierReceiver, sha256 as uaSha256 } from '../packages/universal_atelier/receiver/universal-atelier-receiver.mjs';

function getGitRev() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'UNKNOWN_GIT_REV';
  }
}

function getSqliteVersion() {
  const db = new DatabaseSync(':memory:');
  const row = db.prepare('SELECT sqlite_version() AS ver').get();
  db.close();
  return row.ver;
}

export function runCanaryProbes({ isRepairedMode = false } = {}) {
  const results = {
    schema: 'td613.manifest-native-boundary-canary-receipt/v1',
    execution_time: new Date().toISOString(),
    environment: {
      node_version: process.version,
      sqlite_version: getSqliteVersion(),
      platform: process.platform,
      arch: process.arch,
      git_revision: getGitRev(),
    },
    code_hashes: {
      wendbine_empty_receiver_sha256: wbSha256(fs.readFileSync('packages/wendbine_reciprocal_expedition/receiver/wendbine-empty-receiver.mjs')),
      universal_atelier_receiver_sha256: uaSha256(fs.readFileSync('packages/universal_atelier/receiver/universal-atelier-receiver.mjs')),
    },
    probes: {},
    summary: {
      total: 3,
      defects_reproduced: 0,
      proper_rejections: 0,
    }
  };

  // -------------------------------------------------------------
  // PROBE 1: W-RG-03 (Zero-length spanProof admission)
  // -------------------------------------------------------------
  {
    const wb = new WendbineEmptyEncyclopediaReceiver(':memory:');
    wb.initialize({ memory: true, recipientId: 'rec:wb:canary:w-rg-03', episodeId: 'ep:w-rg-03' });
    
    const sourceId = 'reddit:t3_canary_w_rg_03';
    const payload = JSON.stringify({
      source_id: sourceId,
      canonical_url: 'https://www.reddit.com/r/Wendbine/comments/canary_w_rg_03/',
      public_date: '2026-08-01',
      title: 'Canary source for zero-length span bounds falsification',
      declared_concepts: ['concept:probe:alpha', 'concept:probe:beta'],
    });

    wb.admitPostSource({
      source_id: sourceId,
      canonical_url: 'https://www.reddit.com/r/Wendbine/comments/canary_w_rg_03/',
      public_date: '2026-08-01',
      raw_payload: payload,
    });
    
    wb.declareConcept(sourceId, 'concept:probe:alpha');
    wb.declareConcept(sourceId, 'concept:probe:beta');

    // Empty bytes SHA-256
    const emptySha = wbSha256(Buffer.from([])); // e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const adjReceiptId = 'rcpt:adj:w-rg-03:zero';
    
    wb.registerAdjudicationEvent({
      receiptId: adjReceiptId,
      adjudicatorRole: 'APERTURE_AUDITOR',
      decision: 'ADMIT',
      relationId: 'rel:canary:w-rg-03:zero_span',
      spanSha256: emptySha,
    });

    let probeStatus = 'UNKNOWN';
    let admissionResult = null;
    let exceptionCode = null;
    let exceptionMessage = null;

    try {
      admissionResult = wb.admitTypedRelation({
        relationId: 'rel:canary:w-rg-03:zero_span',
        sourceId: sourceId,
        graphFamily: 'G_A',
        fromConcept: 'concept:probe:alpha',
        relationPredicate: 'BOUNDS',
        toConcept: 'concept:probe:beta',
        evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
        adjudicatorReceiptId: adjReceiptId,
        spanProof: {
          start: 0,
          end: 0,
          span_sha256: emptySha,
        },
      });
      // In unrepaired code, this succeeds because bounds test is `end < start` instead of `end <= start`
      probeStatus = 'DEFECT_REPRODUCED';
      results.summary.defects_reproduced++;
    } catch (err) {
      probeStatus = 'PROPER_REJECTION';
      exceptionCode = err.code || 'EXCEPTION';
      exceptionMessage = err.message;
      results.summary.proper_rejections++;
    } finally {
      wb.close();
    }

    results.probes['W-RG-03'] = {
      probe_id: 'W-RG-03',
      target: 'WendbineEmptyEncyclopediaReceiver.admitTypedRelation',
      description: 'Zero-length spanProof (start=end=0) with SHA-256 of empty bytes',
      status: probeStatus,
      empty_bytes_sha256: emptySha,
      admission_succeeded: admissionResult !== null,
      exception_code: exceptionCode,
      exception_message: exceptionMessage,
      finding: probeStatus === 'DEFECT_REPRODUCED'
        ? 'Unrepaired candidate admitted zero-length spanProof (start=end=0) because bounds test is end < start.'
        : 'Properly rejected zero-length spanProof.',
    };
  }

  // -------------------------------------------------------------
  // PROBE 2: W-RG-04 (Receipt reuse across different relations)
  // -------------------------------------------------------------
  {
    const wb = new WendbineEmptyEncyclopediaReceiver(':memory:');
    wb.initialize({ memory: true, recipientId: 'rec:wb:canary:w-rg-04', episodeId: 'ep:w-rg-04' });
    
    const sourceId = 'reddit:t3_canary_w_rg_04';
    const payload = JSON.stringify({
      source_id: sourceId,
      canonical_url: 'https://www.reddit.com/r/Wendbine/comments/canary_w_rg_04/',
      public_date: '2026-08-01',
      title: 'Canary source for reusable adjudication probe',
      declared_concepts: ['concept:probe:c1', 'concept:probe:c2', 'concept:probe:c3', 'concept:probe:c4'],
    });

    wb.admitPostSource({
      source_id: sourceId,
      canonical_url: 'https://www.reddit.com/r/Wendbine/comments/canary_w_rg_04/',
      public_date: '2026-08-01',
      raw_payload: payload,
    });
    
    wb.declareConcept(sourceId, 'concept:probe:c1');
    wb.declareConcept(sourceId, 'concept:probe:c2');
    wb.declareConcept(sourceId, 'concept:probe:c3');
    wb.declareConcept(sourceId, 'concept:probe:c4');

    // Non-empty span: first 10 bytes of raw_payload
    const rawBuf = Buffer.from(payload, 'utf8');
    const spanSlice = rawBuf.subarray(0, 10);
    const spanSha = wbSha256(spanSlice);
    const reusableReceiptId = 'rcpt:adj:w-rg-04:reusable_null_relation_id';

    // Register receipt with relation_id = null
    let regReceiptThrew = false;
    let regReceiptError = null;

    try {
      wb.registerAdjudicationEvent({
        receiptId: reusableReceiptId,
        adjudicatorRole: 'PEDAGOGUE_AUDITOR',
        decision: 'ADMIT',
        relationId: null,
        spanSha256: spanSha,
      });
    } catch (err) {
      regReceiptThrew = true;
      regReceiptError = { code: err.code || 'EXCEPTION', message: err.message };
    }

    let relation1Admitted = false;
    let relation2Admitted = false;
    let r1Exception = null;
    let r2Exception = null;

    if (!regReceiptThrew) {
      try {
        wb.admitTypedRelation({
          relationId: 'rel:canary:w-rg-04:relation_1',
          sourceId: sourceId,
          graphFamily: 'G_A',
          fromConcept: 'concept:probe:c1',
          relationPredicate: 'BOUNDS',
          toConcept: 'concept:probe:c2',
          evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
          adjudicatorReceiptId: reusableReceiptId,
          spanProof: {
            start: 0,
            end: 10,
            span_sha256: spanSha,
          },
        });
        relation1Admitted = true;
      } catch (err) {
        r1Exception = { code: err.code || 'EXCEPTION', message: err.message };
      }

      try {
        wb.admitTypedRelation({
          relationId: 'rel:canary:w-rg-04:relation_2_different',
          sourceId: sourceId,
          graphFamily: 'G_A',
          fromConcept: 'concept:probe:c3',
          relationPredicate: 'DIFFERS_FROM',
          toConcept: 'concept:probe:c4',
          evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
          adjudicatorReceiptId: reusableReceiptId,
          spanProof: {
            start: 0,
            end: 10,
            span_sha256: spanSha,
          },
        });
        relation2Admitted = true;
      } catch (err) {
        r2Exception = { code: err.code || 'EXCEPTION', message: err.message };
      }
    }
    wb.close();

    const probeStatus = (relation1Admitted && relation2Admitted) ? 'DEFECT_REPRODUCED' : 'PROPER_REJECTION';
    if (probeStatus === 'DEFECT_REPRODUCED') {
      results.summary.defects_reproduced++;
    } else {
      results.summary.proper_rejections++;
    }

    results.probes['W-RG-04'] = {
      probe_id: 'W-RG-04',
      target: 'WendbineEmptyEncyclopediaReceiver.admitTypedRelation',
      description: 'Two different valid relations reusing one local ADMIT receipt with relation_id=null (NONEMPTY span)',
      status: probeStatus,
      span_length_bytes: 10,
      span_sha256: spanSha,
      registration_threw: regReceiptThrew,
      registration_error: regReceiptError,
      relation_1_admitted: relation1Admitted,
      relation_2_admitted: relation2Admitted,
      relation_1_exception: r1Exception,
      relation_2_exception: r2Exception,
      finding: probeStatus === 'DEFECT_REPRODUCED'
        ? 'Unrepaired candidate permitted two distinct valid relations to reuse one local ADMIT receipt where relation_id was null.'
        : 'Properly rejected reuse / null relation_id adjudication receipt for distinct relations.',
    };
  }

  // -------------------------------------------------------------
  // PROBE 3: U-RG-01 (Phantom self-route on unadmitted node)
  // -------------------------------------------------------------
  {
    const ua = new UniversalAtelierReceiver(':memory:');
    ua.initialize({ memory: true, recipientId: 'rec:ua:canary:u-rg-01', episodeId: 'ep:u-rg-01' });

    const phantomNodeId = 'fictional:never_admitted';
    
    // Test route(phantomNodeId, phantomNodeId)
    const routeResult = ua.route(phantomNodeId, phantomNodeId);

    // Negative control: get(phantomNodeId)
    let getNegativeControlThrew = false;
    let getExceptionCode = null;
    let getExceptionMessage = null;

    try {
      ua.get(phantomNodeId);
    } catch (err) {
      getNegativeControlThrew = true;
      getExceptionCode = err.code || 'EXCEPTION';
      getExceptionMessage = err.message;
    } finally {
      ua.close();
    }

    const probeStatus = (routeResult && routeResult.found === true && getNegativeControlThrew)
      ? 'DEFECT_REPRODUCED'
      : 'PROPER_REJECTION';

    if (probeStatus === 'DEFECT_REPRODUCED') {
      results.summary.defects_reproduced++;
    } else {
      results.summary.proper_rejections++;
    }

    results.probes['U-RG-01'] = {
      probe_id: 'U-RG-01',
      target: 'UniversalAtelierReceiver.route',
      description: "route('fictional:never_admitted', 'fictional:never_admitted') self-route vs get() negative control",
      status: probeStatus,
      route_result: routeResult,
      get_negative_control_threw: getNegativeControlThrew,
      get_exception_code: getExceptionCode,
      get_exception_message: getExceptionMessage,
      finding: probeStatus === 'DEFECT_REPRODUCED'
        ? "Unrepaired candidate returned successful zero-length route { found: true, depth: 0, path: ['fictional:never_admitted'] } despite node absence, while get() confirmed rejection."
        : 'Properly rejected self-route when endpoint node is unadmitted.',
    };
  }

  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const receipt = runCanaryProbes();
  const jsonStr = JSON.stringify(receipt, null, 2);
  process.stdout.write(jsonStr + '\n');

  // Also write to artifacts directory for durable record
  const outDir = path.resolve('artifacts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'td613_manifest_native_canary.json'), jsonStr);
}
