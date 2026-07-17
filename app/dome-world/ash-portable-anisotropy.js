import { canonicalDigest } from './ash/canonical-json.js';
import {
  PROTECTED_DIMENSIONS,
  compileEndpointPostureReceipt,
  compileReaderEnsemble,
  compileRecoverabilityTensor,
  compileSemanticReconstructionAssay,
  evaluateEndpointPosture
} from '../engine/ash-stretch12-portable-anisotropy.js';

const byId = id => document.getElementById(id);
const clamp = value => Math.max(0, Math.min(10000, Math.round(value)));
const metric = point => ({ lower_bps: clamp(point - 450), point_bps: clamp(point), upper_bps: clamp(point + 450), status: point > 0 ? 'PARTIAL' : 'MISSING' });
const emptyMap = point => Object.fromEntries(PROTECTED_DIMENSIONS.map(dimension => [dimension, metric(point)]));

function count(pattern, text) {
  return [...text.matchAll(pattern)].length;
}

function extractFeatures(packet, protectedLines) {
  const features = [];
  const push = (feature_class, observed, recovery_delta_bps, dimensions, note, surprisal = 0) => {
    if (!observed) return;
    features.push({
      feature_id: `${feature_class.toLowerCase()}-${features.length + 1}`,
      feature_class,
      observed: true,
      recovery_delta_bps,
      protected_dimensions: dimensions,
      surprisal_millibits: surprisal,
      notes: [note]
    });
  };
  const dates = count(/\b(?:19|20)\d{2}\b|\b\d{1,2}[\/-]\d{1,2}[\/-](?:\d{2}|\d{4})\b/g, packet);
  const emails = count(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, packet);
  const names = count(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})+\b/g, packet);
  const relations = count(/\b(?:reports? to|supervisor|director|manager|colleague|source|witness|met with|emailed|called|hired by|works? for)\b/gi, packet);
  const hypotheses = count(/\b(?:hypothesis|may indicate|suggests?|appears? to|possibly|likely|theory|infer)\b/gi, packet);
  const actions = count(/\b(?:contact|file|send|request|interview|subpoena|publish|report|retain counsel|next step|plan to)\b/gi, packet);
  const provenance = count(/\b(?:attachment|metadata|screenshot|scan|photograph|document|spreadsheet|pdf|filename|header)\b/gi, packet);
  const style = count(/[—;:]|\([^)]{18,}\)|\b(?:therefore|however|whereas|notably|consequently)\b/gi, packet);
  const protectedMatches = protectedLines.filter(line => line && packet.toLowerCase().includes(line.toLowerCase()));

  push('CHRONOLOGY', dates, dates * 650, ['chronology', 'identity'], `${dates} date or year tokens`, dates * 1300);
  push('DIRECT_IDENTIFIER', emails, emails * 2200, ['identity', 'source_identity', 'institution'], `${emails} email addresses`, emails * 5000);
  push('NAMED_ENTITY', names, names * 900, ['identity', 'institution', 'source_identity'], `${names} title-case multi-token names`, names * 2100);
  push('RELATION_GRAPH', relations, relations * 700, ['relationships', 'room_bridges'], `${relations} relation markers`, relations * 1200);
  push('HYPOTHESIS', hypotheses, hypotheses * 500, ['hypotheses', 'source_style_linkage'], `${hypotheses} inference markers`, hypotheses * 800);
  push('NEXT_ACTION', actions, actions * 600, ['next_actions', 'lifecycle_state'], `${actions} action markers`, actions * 900);
  push('DOCUMENT_PROVENANCE', provenance, provenance * 520, ['document_provenance', 'source_identity'], `${provenance} document/provenance markers`, provenance * 700);
  push('STYLE_LINKAGE', style, style * 260, ['source_style_linkage'], `${style} style-bearing structures`, style * 300);
  push('PROTECTED_LITERAL', protectedMatches.length, protectedMatches.length * 2500, ['identity', 'source_identity', 'rare_fact_conjunctions'], `${protectedMatches.length} protected literals remain in the packet`, protectedMatches.length * 7000);

  const longRareLines = packet.split(/\n+/).filter(line => line.trim().length >= 90).length;
  push('RARE_COMBINATION', longRareLines, longRareLines * 650, ['rare_fact_conjunctions', 'chronology', 'relationships'], `${longRareLines} long conjunction-bearing lines`, longRareLines * 1600);
  return features;
}

function externalMap(features) {
  const scores = Object.fromEntries(PROTECTED_DIMENSIONS.map(dimension => [dimension, 250]));
  for (const feature of features) {
    const share = Math.max(1, feature.protected_dimensions.length);
    for (const dimension of feature.protected_dimensions) scores[dimension] = clamp(scores[dimension] + feature.recovery_delta_bps / share);
  }
  return Object.fromEntries(PROTECTED_DIMENSIONS.map(dimension => [dimension, metric(scores[dimension])]));
}

function endpointRuling() {
  return evaluateEndpointPosture({
    endpointState: byId('endpointState').value,
    routeClass: byId('routeClass').value,
    providerAction: byId('providerAction').checked
  });
}

function renderEndpoint() {
  const ruling = endpointRuling();
  byId('endpointResult').textContent = `${ruling.decision}: ${ruling.reasons.join(' ') || 'Proceed only to the declared bounded review gate.'}`;
  byId('endpointResult').dataset.decision = ruling.decision;
}

async function run() {
  const packet = byId('packet').value.trim();
  const protectedLines = byId('protected').value.split(/\n+/).map(value => value.trim()).filter(Boolean);
  if (!packet) {
    byId('endpointResult').textContent = 'A candidate packet is required. Keep the full investigation out of this field.';
    return;
  }
  const endpointInput = {
    caseId: 'local-preflight-unpersisted',
    endpointState: byId('endpointState').value,
    routeClass: byId('routeClass').value,
    providerAction: byId('providerAction').checked,
    operatorDeclaration: 'LOCAL_PREFLIGHT_DECLARATION',
    unresolvedSurfaces: ['unknown Readers', 'external joining corpora', 'endpoint compromise']
  };
  const endpoint = await compileEndpointPostureReceipt(endpointInput);
  const features = extractFeatures(packet, protectedLines);
  const external = externalMap(features);
  const local = emptyMap(9300);
  const ensemble = await compileReaderEnsemble({
    caseId: endpoint.case_id,
    readers: [{
      readerId: 'deterministic-structure-reader-v1',
      readerClass: 'DETERMINISTIC_STRUCTURE_READER',
      version: 'v1',
      contextClass: 'PACKET_ONLY',
      controlledVariables: ['candidate packet', 'protected literal list'],
      blindSpots: ['unknown external corpora', 'privileged institutional context', 'adaptive model Readers'],
      sourceStatus: 'CONSTRUCTED'
    }]
  });
  const observedDimensions = new Set(features.flatMap(feature => feature.protected_dimensions));
  const tensor = await compileRecoverabilityTensor({
    caseId: endpoint.case_id,
    localReader: local,
    externalReaders: [{ readerId: 'deterministic-structure-reader-v1', readerClass: 'DETERMINISTIC_STRUCTURE_READER', dimensions: external }],
    variableCount: PROTECTED_DIMENSIONS.length,
    designRank: observedDimensions.size,
    unknownReadersUnmeasured: true,
    observations: ['LOCAL CONSTRUCTED PREFLIGHT', 'No external model invocation', 'No persistence']
  });
  const packetDigest = await canonicalDigest('TD613:ASH:S12:LOCAL-PREFLIGHT-PACKET:v1', { packet });
  const perturbed = JSON.parse(JSON.stringify(external));
  if (features.length) {
    const mostSensitive = [...features].sort((a, b) => b.recovery_delta_bps - a.recovery_delta_bps)[0];
    for (const dimension of mostSensitive.protected_dimensions) perturbed[dimension] = metric(clamp(perturbed[dimension].point_bps + mostSensitive.recovery_delta_bps));
  }
  const assay = await compileSemanticReconstructionAssay({
    caseId: endpoint.case_id,
    packetDigest,
    readerEnsembleReference: ensemble.ensemble_id,
    readerEnsembleDigest: ensemble.receipt_digest,
    recoverabilityTensorReference: tensor.tensor_id,
    tensor,
    endpointDecision: endpoint.decision,
    routeClass: endpoint.route_class,
    sourceStatus: 'CONSTRUCTED',
    features,
    phason: { baseline: external, perturbed, perturbation_norm_bps: 500, epsilon_bps: 1 },
    marginalConsistencyMillibits: 0,
    independentlyEstimatedMarginals: false,
    heldOutCount: 0,
    heldOutErrorBps: 10000,
    replicateCount: 1
  });

  byId('endpointResult').textContent = `${endpoint.decision}: ${endpoint.reasons.join(' ') || 'One bounded route may proceed to review.'}`;
  const reader = tensor.external_readers[0];
  byId('dimensionRows').innerHTML = PROTECTED_DIMENSIONS.map(dimension => {
    const localMetric = tensor.local_reader[dimension];
    const externalMetric = reader.dimensions[dimension];
    const anisotropy = reader.anisotropy[dimension];
    return `<tr><td>${dimension.replaceAll('_', ' ')}</td><td>${localMetric.lower_bps}–${localMetric.upper_bps}</td><td>${externalMetric.lower_bps}–${externalMetric.upper_bps}</td><td>${anisotropy.conservative_bps}</td></tr>`;
  }).join('');
  byId('recommendation').innerHTML = `<b>${assay.recommendation}</b><span>${endpoint.hard_hold ? ' Endpoint jurisdiction controls before semantic adequacy.' : ' Unknown Readers remain unmeasured; this is a local preflight, not a safety certificate.'}</span>`;
  byId('assayFacts').innerHTML = `
    <dt>Coverage</dt><dd>${tensor.coverage.state} · ${tensor.coverage.fraction_display}</dd>
    <dt>Feature classes</dt><dd>${features.length ? features.map(feature => feature.feature_class).join(', ') : 'None detected by this Reader'}</dd>
    <dt>Phason response</dt><dd>${assay.phason_susceptibility.state} · ${assay.phason_susceptibility.decimal_display}</dd>
    <dt>Packet digest</dt><dd>${packetDigest}</dd>
    <dt>Unknown Readers</dt><dd>UNMEASURED</dd>`;
  byId('receiptOutput').textContent = JSON.stringify({ endpoint, ensemble, tensor, assay }, null, 2);
  byId('results').hidden = false;
  byId('results').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function clear() {
  byId('packet').value = '';
  byId('protected').value = '';
  byId('results').hidden = true;
  byId('receiptOutput').textContent = '';
  renderEndpoint();
}

for (const id of ['endpointState', 'routeClass', 'providerAction']) byId(id).addEventListener('change', renderEndpoint);
byId('runAssay').addEventListener('click', () => run().catch(error => { byId('endpointResult').textContent = `ASSAY HOLD: ${error.message}`; }));
byId('clearAssay').addEventListener('click', clear);
renderEndpoint();
document.documentElement.dataset.ashPortableAnisotropy = 'td613.ash.portable-anisotropy-lab/v0.1';
