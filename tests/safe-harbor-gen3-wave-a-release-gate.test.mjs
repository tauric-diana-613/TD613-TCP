import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/vercel-operator-release.yml', import.meta.url), 'utf8');
const observer = readFileSync(new URL('../scripts/safe-harbor-gen3-production-probe.mjs', import.meta.url), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

assert.equal(vercel.git?.deploymentEnabled, false, 'Wave A release hardening must preserve the closed Git deployment lock');
assert.match(workflow, /github\.event\.issue\.number == 405/u);
assert.match(workflow, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/u);
assert.match(workflow, /npm run test:safe-harbor:gen3:wave-a/u);
assert.match(workflow, /npm run test:safe-harbor:phase9\.1c/u);
assert.match(workflow, /npm run test:safe-harbor:current/u);
assert.match(workflow, /node tests\/safe-harbor-gen3-wave-a-release-gate\.test\.mjs/u);
assert.match(workflow, /node scripts\/safe-harbor-gen3-production-probe\.mjs/u);
assert.match(workflow, /TD613_ARTIFACT_DIR: artifacts\/safe-harbor-gen3-production/u);
assert.match(workflow, /safe-harbor-gen3-wave-a-production-observation\.json/u);
assert.match(workflow, /safe_harbor_wave_a = PASS/u);
assert.match(workflow, /safe_harbor_source_parity = PASS/u);
assert.match(workflow, /safe_harbor_packet_creation = PASS/u);
assert.match(workflow, /safe_harbor_shi_exact_match = PASS/u);
assert.match(workflow, /safe_harbor_export_restore = PASS/u);
assert.match(workflow, /safe_harbor_browser_matrix = PASS/u);
assert.match(workflow, /safe_harbor_reduced_motion = PASS/u);
assert.match(workflow, /safe_harbor_raw_text_exposure = none-observed/u);
assert.match(workflow, /Restore the Git deployment lock after fallback/u);
assert.match(workflow, /git_auto_deploy = disabled/u);

const deployCommands = workflow.match(/vercel@latest deploy --prebuilt --prod/gu) || [];
assert.equal(deployCommands.length, 1, 'canonical release workflow must preserve a one-command production deployment ceiling');
assert.equal((workflow.match(/deployment_count = 1/gu) || []).length, 1);
assert.equal((workflow.match(/deployment_ceiling = 1/gu) || []).length >= 2, true);

assert.match(observer, /chromium,firefox,webkit/u);
assert.match(observer, /desktop-1440x900/u);
assert.match(observer, /mobile-390x844-reduced-motion/u);
assert.match(observer, /prefers-reduced-motion: reduce/u);
assert.match(observer, /keyboard-focusable control/u);
assert.match(observer, /horizontal overflow/u);
assert.match(observer, /verifySourceParity/u);
assert.match(observer, /exact_source_content_verified/u);
assert.match(observer, /finalizeSafeHarborPacket/u);
assert.match(observer, /validateGen3ShiExactMatch/u);
assert.match(observer, /computePacketHash/u);
assert.match(observer, /export_restore_hash_pass/u);
assert.match(observer, /raw_text_present/u);
assert.match(observer, /writesDuringSyntheticProbe/u);
assert.match(observer, /counts_as_human_evidence: false/u);
assert.match(observer, /authorizes_research_track_promotion: false/u);
assert.match(observer, /authorizes_stage3: false/u);
assert.match(observer, /closes_program: false/u);
assert.match(observer, /TD613_SOURCE_PACKET_COMMIT must be an exact 40-character SHA/u);

console.log('safe-harbor-gen3-wave-a-release-gate: ok');
