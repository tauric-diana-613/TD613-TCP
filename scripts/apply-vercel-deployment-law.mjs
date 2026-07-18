import fs from 'node:fs';

const CONFIG_PATH = 'vercel.json';
const SHELL_TEST_PATH = 'tests/product-architecture/shell.test.mjs';
const HYGIENE_TEST_PATH = 'tests/vercel-deploy-hygiene.test.mjs';
const LAW_PATH = 'docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md';
const SELF_PATH = 'scripts/apply-vercel-deployment-law.mjs';
const WORKFLOW_PATH = '.github/workflows/apply-vercel-deployment-law.yml';

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
config.git = { deploymentEnabled: false };
fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);

let shell = fs.readFileSync(SHELL_TEST_PATH, 'utf8');
const oldShellContract = `assert.equal(vercel.git?.deploymentEnabled?.main, true);\nassert.equal(vercel.git?.deploymentEnabled?.['*'], false);`;
const newShellContract = `assert.equal(vercel.git?.deploymentEnabled, false, 'Git-triggered Vercel deployments require an explicit operator release gesture');`;
if (shell.includes(oldShellContract)) shell = shell.replace(oldShellContract, newShellContract);
if (!shell.includes(newShellContract)) throw new Error('Shell test did not acquire the explicit deployment law.');
fs.writeFileSync(SHELL_TEST_PATH, shell);

let hygiene = fs.readFileSync(HYGIENE_TEST_PATH, 'utf8');
const hygieneAnchor = `assert.equal(vercel.version, 2);`;
const hygieneLaw = `assert.equal(vercel.git?.deploymentEnabled, false, 'Vercel Git deployments must remain globally disabled; merge is not deployment consent');\nassert.equal(typeof vercel.git?.deploymentEnabled, 'boolean', 'branch maps are forbidden because they can silently re-enable main deployments');`;
if (!hygiene.includes(hygieneLaw)) {
  if (!hygiene.includes(hygieneAnchor)) throw new Error('Vercel hygiene anchor is missing.');
  hygiene = hygiene.replace(hygieneAnchor, `${hygieneAnchor}\n${hygieneLaw}`);
}
fs.writeFileSync(HYGIENE_TEST_PATH, hygiene);

let law = fs.readFileSync(LAW_PATH, 'utf8');
const amendment = `\n## Executable enforcement · 2026-07-18\n\n\`vercel.json\` disables Git-triggered deployment for every branch:\n\n\`\`\`json\n{\n  "git": {\n    "deploymentEnabled": false\n  }\n}\n\`\`\`\n\nA merge, push, green workflow, release-candidate label, or branch name cannot create a Vercel deployment. A deployment must be initiated manually only after the operator gives an explicit release instruction naming the exact commit and PREVIEW or PRODUCTION target.\n\n\`\`\`text\nmerge ≠ deploy\nmain push ≠ operator gesture\nworkflow success ≠ operator gesture\nmanual Vercel action after explicit instruction = permitted release route\n\`\`\`\n`;
if (!law.includes('## Executable enforcement · 2026-07-18')) law = `${law.trimEnd()}\n${amendment}`;
fs.writeFileSync(LAW_PATH, law);

for (const path of [SELF_PATH, WORKFLOW_PATH]) {
  if (fs.existsSync(path)) fs.rmSync(path);
}

console.log('Explicit Vercel deployment law applied: Git-triggered deployment is globally disabled.');
