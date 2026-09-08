const EORFD_SCRIPT_ID = 'apertureV2831EorfdDeepStaticAudit';

function scriptPattern() {
  return new RegExp(`(<script id=["']${EORFD_SCRIPT_ID}["'][^>]*>)([\\s\\S]*?)(<\\/script>)`);
}

export function inspectEorfdT0CurrentFirmwareOwnership(html) {
  const match = String(html || '').match(scriptPattern());
  if (!match) {
    return {
      script_found: false,
      hostile_classes: ['EORFD_T0_SCRIPT_MISSING'],
      version_alias_present: false,
      schema_alias_present: false,
    };
  }

  const body = match[2];
  const versionAlias = /\bFIRMWARE\.VERSION\s*=\s*APERTURE_VERSION\s*;/.test(body);
  const schemaAlias = /\bFIRMWARE\.SCHEMA_VERSION\s*=\s*APERTURE_SCHEMA\s*;/.test(body);
  const hostile = versionAlias || schemaAlias;

  return {
    script_found: true,
    hostile_classes: hostile ? ['EORFD_T0_CURRENT_FIRMWARE_OWNERSHIP'] : [],
    version_alias_present: versionAlias,
    schema_alias_present: schemaAlias,
  };
}

export function repairEorfdT0CurrentFirmwareOwnership(html, {
  version = 'v3.2-alpha',
  schema = 'td613-aperture/v3.2-alpha',
} = {}) {
  const source = String(html || '');
  const match = source.match(scriptPattern());
  if (!match) throw new Error(`${EORFD_SCRIPT_ID} is required for the bounded T0 identity repair.`);

  const historicalBody = match[2];
  if (!/const APERTURE_VERSION\s*=\s*['"]v2\.9\.4-eorfd-deep-static-audit['"]\s*;/.test(historicalBody)) {
    throw new Error('EORFD historical version lineage changed before T0 repair.');
  }
  if (!/const APERTURE_SCHEMA\s*=\s*['"]td613-aperture\/v3\.0-alpha['"]\s*;/.test(historicalBody)) {
    throw new Error('EORFD historical schema lineage changed before T0 repair.');
  }

  let repairedBody = historicalBody
    .replace(/\bFIRMWARE\.VERSION\s*=\s*APERTURE_VERSION\s*;/g, `FIRMWARE.VERSION = '${version}';`)
    .replace(/\bFIRMWARE\.SCHEMA_VERSION\s*=\s*APERTURE_SCHEMA\s*;/g, `FIRMWARE.SCHEMA_VERSION = '${schema}';`);

  const repaired = source.replace(scriptPattern(), `$1${repairedBody}$3`);
  const post = inspectEorfdT0CurrentFirmwareOwnership(repaired);
  if (post.hostile_classes.length) {
    throw new Error(`Bounded T0 repair left hostile current-firmware ownership: ${post.hostile_classes.join(', ')}`);
  }

  return repaired;
}

export const APERTURE_V32_T0_REPAIR = Object.freeze({
  schema: 'td613.aperture.v32-identity-singularity-t0-repair/v0.1',
  script_id: EORFD_SCRIPT_ID,
  historical_lineage_preserved: true,
  current_identity_target: 'v3.2-alpha',
  automatic_promotion: false,
  merge_authority: false,
  vercel_authority: false,
  production_release_authority: false,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0,
});
