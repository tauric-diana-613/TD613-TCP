import { compilePortableAssuranceState } from '../engine/ash-stretch12-r02-reconstruction.js';

export const QUALIFICATION_LAB_VERSION = 'td613.ash.qualification-lab/v0.1';

const route = document.getElementById('route');
const provider = document.getElementById('providerAction');
const status = document.getElementById('status');
const receipt = document.getElementById('receipt');
const qualify = document.getElementById('qualify');

document.documentElement.dataset.ashR02Qualification = QUALIFICATION_LAB_VERSION;

qualify.addEventListener('click', async () => {
  const selectedRoute = route.value;
  const providerAction = provider.checked;
  const managed = /MANAGED/.test(selectedRoute);
  const mismatch = selectedRoute === 'OFFLINE_LOCAL_MODEL' && providerAction;
  const ruling = managed ? 'HARD HOLD · managed route'
    : mismatch ? 'ROUTE MISMATCH · provider action cannot impersonate offline local execution'
    : 'PA2 · constructed local preview only';

  status.textContent = ruling;
  status.className = managed || mismatch ? 'hold' : 'ok';
  receipt.textContent = 'Compiling constructed assurance receipt…';

  try {
    const state = await compilePortableAssuranceState({
      case_id:'constructed-preview',
      spec_authored:true,
      static_verified:true,
      locally_executed:true,
      adversarially_observed:false,
      environment_specific_demonstration:false,
      bounded_assurance:false,
      artifact_scope:'constructed',
      environment_scope:selectedRoute,
      reader_scope:['CONSTRUCTED_DETERMINISTIC_READER'],
      cryptographic_posture:'UNMEASURED',
      semantic_coverage:'CONSTRUCTED_PREFLIGHT',
      environment_coverage:'PARTIAL',
      flowcore_weather_state:managed || mismatch ? 'REST_REQUIRED' : 'UNCOMPILED',
      unresolved_surfaces:['unknown Readers','recipient endpoint'],
      operator_closure:'OPEN'
    });
    receipt.textContent = JSON.stringify({
      version:QUALIFICATION_LAB_VERSION,
      route:selectedRoute,
      provider_action:providerAction,
      ruling,
      assurance:state
    }, null, 2);
  } catch (error) {
    status.textContent = `QUALIFICATION RECEIPT HELD · ${error.message}`;
    status.className = 'hold';
    receipt.textContent = JSON.stringify({
      version:QUALIFICATION_LAB_VERSION,
      route:selectedRoute,
      provider_action:providerAction,
      ruling,
      receipt_status:'HELD',
      error:error.message,
      universal_transport:false,
      universal_secrecy:false,
      cinder_authority:false
    }, null, 2);
  }
});
