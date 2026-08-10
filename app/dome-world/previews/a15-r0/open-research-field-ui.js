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
      model.claim
    ));
  }
}

function renderReconstruction(result) {
  const host = byId('fieldReconstruction');
  host.replaceChildren(
    metric('ρ(k, ε)', result.reconstructive_redundancy_rho, `${result.successful_subsets}/${result.subset_count} sampled-size combinations reconstruct within ε=${result.epsilon}.`),
    metric('ARI', result.anisotropic_reconstruction_invariance, 'Mean topology similarity after the declared non-identity admissibility transforms.'),
    metric('k', result.k, 'Subset size used for the exhaustive finite-combination assay.')
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

function startOpenField() {
  const result = runOpenResearchField();
  renderObservability(result.observability);
  renderDirectionalExposure(result.directional_exposure);
  renderReconstruction(result.reconstruction);
  renderTransformTable(result.reconstruction);
  byId('fieldRaw').textContent = pretty(result);
  byId('fieldFinding').textContent = result.observability.finding;
  byId('fieldClaimCeiling').replaceChildren(...result.claim_ceiling.map(value => {
    const item = document.createElement('li');
    item.textContent = value;
    return item;
  }));
  document.documentElement.dataset.a15R0OpenField = 'ready';
  window.dispatchEvent(new CustomEvent('td613:ash:a15-r0-open-field-ready', {
    detail: {
      schema: result.schema,
      source_status: result.source_status,
      production_mutated: false,
      external_transmission: false,
      human_selection_required: true
    }
  }));
}

startOpenField();
