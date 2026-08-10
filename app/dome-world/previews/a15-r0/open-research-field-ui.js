import { runBoundedTransformationEnvelope } from './bounded-transformation-envelope.js';
import { runOpenResearchField } from './open-research-field.js';

const byId = id => document.getElementById(id);
const pretty = value => JSON.stringify(value, null, 2);

function metric(label, value, detail) {
  const article = document.createElement('article');
  article.className = 'field-metric';
  const heading = document.createElement('h3');
  heading.textContent = label;
  const output = document.createElement('output');
  output.textContent = String(value);
  const copy = document.createElement('p');
  copy.textContent = detail;
  article.append(heading, output, copy);
  return article;
}

function renderObservability(result) {
  const host = byId('fieldObservability');
  host.replaceChildren();
  for (const model of result.models) {
    host.append(metric(
      model.label,
      `${model.mutual_information_bits} bits`,
      `${model.observer_model} · ${model.claim}`
    ));
  }
  byId('fieldObserverRobustness').replaceChildren(
    metric('Null best case', `${result.null_policy_best_case_information_bits} bits`, 'Leakage under the content-only observer model.'),
    metric('Null worst case', `${result.null_policy_worst_case_information_bits} bits`, 'Leakage across the declared null-policy observer family.'),
    metric('Observer gap', `${result.null_policy_observer_model_gap_bits} bits`, 'Sensitivity to observer-model expansion; the family remains deliberately bounded.')
  );
}

function renderRankLeakage(result) {
  const host = byId('fieldRankLeakage');
  host.replaceChildren();
  for (const item of result.cases) {
    host.append(metric(
      item.case_id.replaceAll('_', ' '),
      `rank ${item.structural_rank} · ${item.mutual_information_bits} bits`,
      item.channel_posture
    ));
  }
}

function renderJoiningSynergy(result) {
  byId('fieldJoiningSynergy').replaceChildren(
    metric('I(S; A)', `${result.feature_a_information_bits} bits`, 'Marginal information carried by synthetic feature A.'),
    metric('I(S; B)', `${result.feature_b_information_bits} bits`, 'Marginal information carried by synthetic feature B.'),
    metric('I(S; A,B)', `${result.joint_information_bits} bits`, 'Information after the two synthetic features are joined.'),
    metric('Synergy proxy', `${result.joining_synergy_proxy_bits} bits`, result.finding)
  );
  byId('fieldJoiningCaveat').textContent = result.caveat;
}

function renderReconstruction(result) {
  const host = byId('fieldReconstruction');
  host.replaceChildren(
    metric('ρ(k, ε)', result.reconstructive_redundancy_rho, `${result.successful_subsets}/${result.subset_count} sampled-size combinations reconstruct within ε=${result.epsilon}.`),
    metric('ARI mean', result.anisotropic_reconstruction_invariance, 'Mean topology similarity after the declared non-identity admissibility transforms.'),
    metric('ARI floor', result.anisotropic_reconstruction_floor, `Worst declared transform: ${result.worst_case_transform}. Mean performance cannot erase this floor.`),
    metric('All transforms pass', result.all_nonidentity_transforms_within_epsilon, 'A Golden Egg criterion cannot promote from the mean while any declared non-identity transform remains outside ε.')
  );
}

function renderTransformTable(result) {
  const host = byId('fieldTransformRows');
  host.replaceChildren();
  for (const transform of result.transforms) {
    const row = document.createElement('tr');
    for (const value of [
      transform.operator_id,
      transform.fragments_remaining,
      transform.topology_similarity,
      transform.topology_distance,
      transform.within_epsilon
    ]) {
      const cell = document.createElement('td');
      cell.textContent = String(value);
      row.append(cell);
    }
    host.append(row);
  }
}

function renderDirectionalExposure(result) {
  const host = byId('fieldDirectional');
  host.replaceChildren(
    metric('Inbound dimensions', result.inbound_observable_dimensions, 'Declared dimensions available to the synthetic custodial model.'),
    metric('Outbound dimensions', result.outbound_disclosed_dimensions, 'Declared dimensions projected back across the synthetic boundary.'),
    metric('Exposure ratio', `${result.directional_exposure_ratio}:1`, result.finding)
  );
}

function renderEnvelope(result) {
  byId('fieldEnvelopeStatus').textContent = result.status;
  byId('fieldEnvelopeFinding').textContent = result.finding;
  const host = byId('fieldEnvelopeGates');
  host.replaceChildren();
  for (const gate of result.metric_gates) {
    host.append(metric(
      gate.gate_id.replaceAll('_', ' '),
      gate.pass ? 'PASS' : 'HELD',
      `${gate.value} ${gate.comparator} ${gate.threshold} · ${gate.quantity}`
    ));
  }
  host.append(metric('Evidence class', result.evidence_gate.pass ? 'PASS' : 'HELD', `${result.evidence_gate.observed_source_status} · requires ${result.evidence_gate.required_posture}`));
  host.append(metric('Human closure', result.human_gate.pass ? 'PASS' : 'HELD', 'Promotion authority remains human-gated and is not exercised by this preview.'));
}

function startOpenField() {
  const result = runOpenResearchField();
  const envelope = runBoundedTransformationEnvelope({ field: result });
  renderObservability(result.observability);
  renderDirectionalExposure(result.directional_exposure);
  renderRankLeakage(result.rank_leakage_non_equivalence);
  renderJoiningSynergy(result.joining_key_synergy);
  renderReconstruction(result.reconstruction);
  renderTransformTable(result.reconstruction);
  renderEnvelope(envelope);
  byId('fieldRaw').textContent = pretty({ field: result, bounded_transformation_envelope: envelope });
  byId('fieldFinding').textContent = result.observability.finding;
  byId('fieldClaimCeiling').replaceChildren(...result.claim_ceiling.map(value => {
    const item = document.createElement('li');
    item.textContent = value;
    return item;
  }));
  document.documentElement.dataset.a15R0OpenField = 'ready';
  document.documentElement.dataset.a15R0Envelope = envelope.status.toLowerCase();
  window.dispatchEvent(new CustomEvent('td613:ash:a15-r0-open-field-ready', {
    detail: {
      schema: result.schema,
      envelope_schema: envelope.schema,
      envelope_status: envelope.status,
      source_status: result.source_status,
      production_mutated: false,
      external_transmission: false,
      human_selection_required: true
    }
  }));
}

startOpenField();
