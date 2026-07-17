import { compilePortableAssuranceState } from '../engine/ash-stretch12-r02-reconstruction.js';

export const QUALIFICATION_LAB_VERSION = 'td613.ash.qualification-lab/v0.1';

const route = document.getElementById('route');
const provider = document.getElementById('providerAction');
const status = document.getElementById('status');
const receipt = document.getElementById('receipt');

document.getElementById('qualify').addEventListener('click', async () => {
  const managed = /MANAGED/.test(route.value);
  const mismatch = route.value === 'OFFLINE_LOCAL_MODEL' && provider.checked;
  const state = await compilePortableAssuranceState({
    case_id:'constructed-preview',
    spec_authored:true,
    static_verified:true,
    locally_executed:true,
    adversarially_observed:false,
    environment_specific_demonstration:false,
    bounded_assurance:false,
    artifact_scope:'constructed',
    environment_scope:route.value,
    reader_scope:['CONSTRUCTED_DETERMINISTIC_READER'],
    cryptographic_posture:'UNMEASURED',
    semantic_coverage:'CONSTRUCTED_PREFLIGHT',
    environment_coverage:'PARTIAL',
    flowcore_weather_state:managed || mismatch ? 'REST_REQUIRED' : 'UNCOMPILED',
    unresolved_surfaces:['unknown Readers','recipient endpoint'],
    operator_closure:'OPEN'
  });
  const hold = managed ? 'HARD HOLD · managed route'
    : mismatch ? 'ROUTE MISMATCH · provider action cannot impersonate offline local execution'
    : 'PA2 · constructed local preview only';
  status.textContent = hold;
  status.className = managed || mismatch ? 'hold' : 'ok';
  receipt.textContent = JSON.stringify({ version:QUALIFICATION_LAB_VERSION, route:route.value, provider_action:provider.checked, assurance:state }, null, 2);
});
