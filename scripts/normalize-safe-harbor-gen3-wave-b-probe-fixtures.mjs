import { readFileSync, writeFileSync } from 'node:fs';

const path = 'scripts/safe-harbor-gen3-wave-b-production-probe.mjs';
let source = readFileSync(path, 'utf8');

function replaceOnce(before, after) {
  if (!source.includes(before)) throw new Error(`Wave B probe fixture seam missing: ${before.slice(0, 120)}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Wave B probe fixture seam is not unique: ${before.slice(0, 120)}`);
  source = source.replace(before, after);
}

replaceOnce(
  '  const mismatch = core.validateShiSurfaces({\n',
  "  const mismatchShi = `${shi.slice(0, -8)}FFEEDDCC`;\n  const mismatch = core.validateShiSurfaces({\n"
);
replaceOnce(
  "    dom_shi: 'TD613-SH-9B07D8B-FFEEDDCC',\n",
  '    dom_shi: mismatchShi,\n'
);
replaceOnce(
  "  const shi = 'TD613-SH-9B07D8B-A1B2C3D4';\n  const panel = document.querySelector('#stage3ProvenancePanel');\n",
  "  const shi = 'TD613-SH-9B07D8B-A1B2C3D4';\n  const mismatchShi = `${shi.slice(0, -8)}FFEEDDCC`;\n  const panel = document.querySelector('#stage3ProvenancePanel');\n"
);
replaceOnce(
  "  const mismatch = api.validate_attestation_inputs({ ...meta, dom_shi: 'TD613-SH-9B07D8B-FFEEDDCC' });\n",
  '  const mismatch = api.validate_attestation_inputs({ ...meta, dom_shi: mismatchShi });\n'
);

writeFileSync(path, source);
console.log('Wave B mismatch fixtures now derive from the sanctioned synthetic SHI at runtime.');
