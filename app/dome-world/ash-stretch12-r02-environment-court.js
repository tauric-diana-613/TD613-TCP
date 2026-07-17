import { ROUTE_CLASSES } from '../engine/ash-stretch12-r02-environment.js';

export const ENVIRONMENT_COURT_VERSION = 'td613.ash.environment-court/v0.1';

export function installEnvironmentCourt(documentRef = document) {
  if (documentRef.getElementById('ashEnvironmentCourt')) return false;
  const host = documentRef.querySelector('#investigationAiShareGuide') || documentRef.querySelector('main') || documentRef.body;
  const section = documentRef.createElement('section');
  section.id = 'ashEnvironmentCourt';
  section.className = 'tool-section ash-environment-court';
  section.dataset.version = ENVIRONMENT_COURT_VERSION;
  const options = ROUTE_CLASSES.map(route => `<option value="${route}">${route.replaceAll('_',' ')}</option>`).join('');
  section.innerHTML = `
    <h3>Environment Court · S12-A</h3>
    <p>Declaration starts observation. It does not establish endpoint integrity.</p>
    <label for="ashEnvironmentRoute">Declared environment route</label>
    <select id="ashEnvironmentRoute"><option value="">Choose one exact route</option>${options}</select>
    <div id="ashEnvironmentQuestions">
      <p>Who owns and administers this device?</p>
      <p>Which persistence, sync, indexing, preview, backup, and monitoring surfaces remain?</p>
      <p>Which observations are verified, stale, contradictory, missing, or unresolved?</p>
    </div>
    <p id="ashEnvironmentCourtStatus">UNOBSERVED · unknown does not default safe.</p>`;
  host.append(section);
  const select = section.querySelector('#ashEnvironmentRoute');
  const status = section.querySelector('#ashEnvironmentCourtStatus');
  select.addEventListener('change', () => {
    const hard = /MANAGED|PUBLIC_SECTOR|SHARED|UNRESOLVED/.test(select.value);
    status.textContent = !select.value ? 'UNOBSERVED · unknown does not default safe.'
      : hard ? 'HARD HOLD · compile sensors before any route review.'
      : 'DECLARED ONLY · observation and verification still required.';
  });
  return true;
}
