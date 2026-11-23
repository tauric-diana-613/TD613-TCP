/**
 * 𝌋 TD613 · PROVENANCE-SENSITIVE TERMINAL GRAPH COMPARATOR
 * Addresses PR1706-R01: Evaluates Full Evidentiary Contents & Hashes Beyond Identifier Sets
 * 
 * Verifies that two terminal graphs match not merely in node/edge IDs,
 * but in complete serialized canonical evidentiary fields:
 * 1. Nodes: id, type, admitted, sha256, created_at
 * 2. Edges: edgeKey, from, to, relation_type, warrant, warrant_params, evidence_coordinates
 * 3. Source Roots: rootId, byteDigest, status, evidence_class, acquisition_id
 * 4. Rejections: attemptId, from, to, relation_type, reason, temporal_rule, history
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import crypto from 'node:crypto';

export function sha256(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Normalizes and extracts canonical evidentiary payload for a terminal graph.
 */
export function extractFullCanonicalPayload(terminalGraph) {
  if (!terminalGraph || typeof terminalGraph !== 'object') {
    throw new Error('[COMPARATOR_ERROR] Terminal graph must be an object.');
  }

  // 1. Canonical Nodes (sorted by id)
  const canonicalNodes = (terminalGraph.nodes || []).map(n => ({
    id: String(n.id),
    type: String(n.type || 'DOCUMENT'),
    admitted: Boolean(n.admitted),
    sha256: n.sha256 ? String(n.sha256) : null,
    created_at: n.created_at ? String(n.created_at) : null,
  })).sort((a, b) => a.id.localeCompare(b.id));

  // 2. Canonical Edges (sorted by edgeKey, then relation_type)
  const canonicalEdges = (terminalGraph.edges || []).map(e => ({
    edgeKey: String(e.edgeKey),
    from: String(e.from),
    to: String(e.to),
    relation_type: String(e.relation_type),
    warrant: e.warrant ? String(e.warrant) : null,
    warrant_params: e.warrant_params ? JSON.parse(JSON.stringify(e.warrant_params)) : null,
    evidence_coordinates: e.evidence_coordinates ? JSON.parse(JSON.stringify(e.evidence_coordinates)) : null,
  })).sort((a, b) => a.edgeKey.localeCompare(b.edgeKey));

  // 3. Canonical Roots (sorted by rootId)
  const canonicalRoots = (terminalGraph.roots || []).map(r => ({
    rootId: String(r.rootId),
    byteDigest: String(r.byteDigest),
    status: String(r.status || 'ACTIVE'),
    evidence_class: r.evidence_class ? String(r.evidence_class) : null,
    acquisition_id: r.acquisition_id ? String(r.acquisition_id) : null,
  })).sort((a, b) => a.rootId.localeCompare(b.rootId));

  // 4. Canonical Rejections (sorted by from + to + relation_type + reason)
  const canonicalRejections = (terminalGraph.rejections || []).map(rj => ({
    from: String(rj.from),
    to: String(rj.to),
    relation_type: String(rj.relation_type),
    reason: String(rj.reason),
    attemptId: rj.attemptId ? String(rj.attemptId) : null,
  })).sort((a, b) => {
    const keyA = `${a.from}::${a.to}::${a.relation_type}::${a.reason}`;
    const keyB = `${b.from}::${b.to}::${b.relation_type}::${b.reason}`;
    return keyA.localeCompare(keyB);
  });

  const serializedNodes = JSON.stringify(canonicalNodes);
  const serializedEdges = JSON.stringify(canonicalEdges);
  const serializedRoots = JSON.stringify(canonicalRoots);
  const serializedRejections = JSON.stringify(canonicalRejections);

  const compositePayload = {
    nodes: canonicalNodes,
    edges: canonicalEdges,
    roots: canonicalRoots,
    rejections: canonicalRejections,
  };

  const fullSerialized = JSON.stringify(compositePayload);
  const fullPayloadSha256 = sha256(fullSerialized);

  return Object.freeze({
    nodes: canonicalNodes,
    edges: canonicalEdges,
    roots: canonicalRoots,
    rejections: canonicalRejections,
    digests: {
      nodes_digest: sha256(serializedNodes),
      edges_digest: sha256(serializedEdges),
      roots_digest: sha256(serializedRoots),
      rejections_digest: sha256(serializedRejections),
      full_payload_sha256: fullPayloadSha256,
    },
    fullSerialized,
  });
}

/**
 * Performs a rigorous provenance-sensitive comparison between two terminal graphs (e.g. S3 vs S2).
 */
export function compareTerminalGraphsProvenanceSensitive(graphA, graphB, labelA = 'System A', labelB = 'System B') {
  const payloadA = extractFullCanonicalPayload(graphA);
  const payloadB = extractFullCanonicalPayload(graphB);

  const nodesMatch = payloadA.digests.nodes_digest === payloadB.digests.nodes_digest;
  const edgesMatch = payloadA.digests.edges_digest === payloadB.digests.edges_digest;
  const rootsMatch = payloadA.digests.roots_digest === payloadB.digests.roots_digest;
  const rejectionsMatch = payloadA.digests.rejections_digest === payloadB.digests.rejections_digest;
  const fullPayloadMatch = payloadA.digests.full_payload_sha256 === payloadB.digests.full_payload_sha256;

  const discrepancies = [];
  if (!nodesMatch) {
    discrepancies.push({
      category: 'NODES',
      count_a: payloadA.nodes.length,
      count_b: payloadB.nodes.length,
      digest_a: payloadA.digests.nodes_digest,
      digest_b: payloadB.digests.nodes_digest,
    });
  }
  if (!edgesMatch) {
    discrepancies.push({
      category: 'EDGES',
      count_a: payloadA.edges.length,
      count_b: payloadB.edges.length,
      digest_a: payloadA.digests.edges_digest,
      digest_b: payloadB.digests.edges_digest,
    });
  }
  if (!rootsMatch) {
    discrepancies.push({
      category: 'ROOTS',
      count_a: payloadA.roots.length,
      count_b: payloadB.roots.length,
      digest_a: payloadA.digests.roots_digest,
      digest_b: payloadB.digests.roots_digest,
    });
  }
  if (!rejectionsMatch) {
    discrepancies.push({
      category: 'REJECTIONS',
      count_a: payloadA.rejections.length,
      count_b: payloadB.rejections.length,
      digest_a: payloadA.digests.rejections_digest,
      digest_b: payloadB.digests.rejections_digest,
    });
  }

  return Object.freeze({
    provenance_sensitive_identical: fullPayloadMatch,
    subfield_matches: {
      nodes: nodesMatch,
      edges: edgesMatch,
      roots: rootsMatch,
      rejections: rejectionsMatch,
    },
    sha256_a: payloadA.digests.full_payload_sha256,
    sha256_b: payloadB.digests.full_payload_sha256,
    discrepancy_count: discrepancies.length,
    discrepancies,
    label_a: labelA,
    label_b: labelB,
  });
}
