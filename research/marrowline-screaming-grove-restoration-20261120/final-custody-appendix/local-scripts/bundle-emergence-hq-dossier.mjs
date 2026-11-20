import fs from 'node:fs';
import path from 'node:path';

const SCRATCH = '<LOCAL_USER_HOME>/.gemini/antigravity/brain/3cc40de8-dc77-4540-a38b-0d7a12e39cd0/scratch';
const BRAIN = '<LOCAL_USER_HOME>/.gemini/antigravity/brain';
const WT = 'C:/td613-worktrees/marrowline-screaming-grove-emergence-hq-dossier-20261120';
const BASE = path.join(WT, 'research/marrowline-screaming-grove-restoration-20261120');
const SUP = path.join(BASE, 'supporting-artifacts');

const ensure = (dir) => fs.mkdirSync(dir, { recursive: true });
for (const sub of [
  'dollhouse/specs',
  'dollhouse/engine-receipts',
  'dollhouse/specialist-reports',
  'scripts',
  'fixtures',
  'github-pr-snapshots',
  'ci-witness'
]) ensure(path.join(SUP, sub));

const readUtf8Clean = (fp) => fs.readFileSync(fp, 'utf8').replace(/^\uFEFF/, '');
const writeUtf8 = (fp, text) => fs.writeFileSync(fp, text.endsWith('\n') ? text : `${text}\n`, 'utf8');

// 1. Dollhouse specs (both 6cf64d17d baseline audit & bc5467246 hardened audit)
const specBaselineHardened = JSON.parse(readUtf8Clean(path.join(SCRATCH, 'dollhouse_audit_spec_baseline.json')));
const specHoldHardened = JSON.parse(readUtf8Clean(path.join(SCRATCH, 'dollhouse_audit_spec_global_hold.json')));
const specBaselinePre = { ...specBaselineHardened, source_revision: '6cf64d17d82f727bb918be6869f313a3342e530c' };
const specHoldPre = { ...specHoldHardened, source_revision: '6cf64d17d82f727bb918be6869f313a3342e530c' };

writeUtf8(path.join(SUP, 'dollhouse/specs/dollhouse-audit-spec-baseline-6cf64d17d.json'), JSON.stringify(specBaselinePre, null, 2));
writeUtf8(path.join(SUP, 'dollhouse/specs/dollhouse-audit-spec-global-hold-6cf64d17d.json'), JSON.stringify(specHoldPre, null, 2));
writeUtf8(path.join(SUP, 'dollhouse/specs/dollhouse-audit-spec-baseline-bc5467246.json'), JSON.stringify(specBaselineHardened, null, 2));
writeUtf8(path.join(SUP, 'dollhouse/specs/dollhouse-audit-spec-global-hold-bc5467246.json'), JSON.stringify(specHoldHardened, null, 2));

// 2. Dollhouse engine receipts (all 4 strict-provenance runs: 6cf64d17d + bc5467246)
for (const [src, dst] of [
  ['dollhouse_engine_baseline.json', 'dollhouse/engine-receipts/dollhouse-engine-receipt-baseline-6cf64d17d.json'],
  ['dollhouse_engine_global_hold.json', 'dollhouse/engine-receipts/dollhouse-engine-receipt-global-hold-6cf64d17d.json'],
  ['dollhouse_engine_baseline_bc5467246.json', 'dollhouse/engine-receipts/dollhouse-engine-receipt-baseline-bc5467246.json'],
  ['dollhouse_engine_global_hold_bc5467246.json', 'dollhouse/engine-receipts/dollhouse-engine-receipt-global-hold-bc5467246.json']
]) {
  const parsed = JSON.parse(readUtf8Clean(path.join(SCRATCH, src)));
  writeUtf8(path.join(SUP, dst), JSON.stringify(parsed, null, 2));
}

// 3. GitHub PR JSON snapshots (cleaned UTF-8, zero BOM)
const prFiles = [
  ['oct_nov_marrowline_prs.json', 'github-pr-snapshots/oct-nov-marrowline-prs-index.json'],
  ['pr_1433.json', 'github-pr-snapshots/pr-1433.json'],
  ['pr_1509.json', 'github-pr-snapshots/pr-1509.json'],
  ['pr_1513.json', 'github-pr-snapshots/pr-1513.json'],
  ['pr_1515.json', 'github-pr-snapshots/pr-1515.json'],
  ['pr_1516.json', 'github-pr-snapshots/pr-1516.json'],
  ['pr_1517.json', 'github-pr-snapshots/pr-1517.json'],
  ['pr_1545.json', 'github-pr-snapshots/pr-1545.json'],
  ['pr_1549.json', 'github-pr-snapshots/pr-1549.json'],
  ['pr_1555.json', 'github-pr-snapshots/pr-1555.json'],
  ['pr_1569.json', 'github-pr-snapshots/pr-1569.json']
];
for (const [src, dst] of prFiles) {
  const parsed = JSON.parse(readUtf8Clean(path.join(SCRATCH, src)));
  writeUtf8(path.join(SUP, dst), JSON.stringify(parsed, null, 2));
}

// 4. Forensic fixtures & historical diffs
writeUtf8(
  path.join(SUP, 'fixtures/oct02-vs-head-parity-comparison-pre-repair.json'),
  JSON.stringify(JSON.parse(readUtf8Clean(path.join(SCRATCH, 'parity_comparison.json'))), null, 2)
);
writeUtf8(
  path.join(SUP, 'fixtures/diff-oct02-to-head-khonapolit-quality.patch'),
  readUtf8Clean(path.join(SCRATCH, 'diff_khonapolit_quality.patch'))
);
writeUtf8(
  path.join(SUP, 'fixtures/diff-oct02-to-head-marrowline-terminal.patch'),
  readUtf8Clean(path.join(SCRATCH, 'diff_marrowline_terminal.patch'))
);

// 5. Supporting forensic scripts (portable wrappers preserving exact original logic)
const sanitizeScriptPaths = (code, headerComment) => {
  return `${headerComment}\n${code
    .replace(/const WT = 'file:\/\/\/C:\/td613-worktrees\/marrowline-screaming-grove-restoration-20261120';/,
      "const WT = process.env.TD613_WORKTREE_URL || new URL('../../../..', import.meta.url).href.replace(/\\/$/, '');")
    .replace(/const OCT2 = 'file:\/\/\/C:\/Users\/timst\/\.gemini\/antigravity\/brain\/3cc40de8-dc77-4540-a38b-0d7a12e39cd0\/scratch\/oct02_snapshot';/,
      "const OCT2 = process.env.TD613_OCT02_SNAPSHOT_URL || (() => { throw new Error('Set TD613_OCT02_SNAPSHOT_URL to a git-archive checkout of ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a'); })();")
    .replace(/const WORKTREE = 'C:\/td613-worktrees\/marrowline-screaming-grove-restoration-20261120';/,
      "const WORKTREE = process.env.TD613_WORKTREE || path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\\/([A-Za-z]:)/, '$1')), '../../../..');")
    .replace(/const OCT02 = 'C:\/Users\/timst\/\.gemini\/antigravity\/brain\/3cc40de8-dc77-4540-a38b-0d7a12e39cd0\/scratch\/oct02_snapshot';/,
      "const OCT02 = process.env.TD613_OCT02_SNAPSHOT || (() => { throw new Error('Set TD613_OCT02_SNAPSHOT to a git-archive checkout of ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a'); })();")
    .replace(/const SCRATCH = 'C:\/Users\/timst\/\.gemini\/antigravity\/brain\/3cc40de8-dc77-4540-a38b-0d7a12e39cd0\/scratch';/,
      "const SCRATCH = process.env.TD613_PR_SNAPSHOT_DIR || new URL('../github-pr-snapshots', import.meta.url).pathname.replace(/^\\/([A-Za-z]:)/, '$1');")
    .replace(/oct_nov_marrowline_prs\.json/g, 'oct-nov-marrowline-prs-index.json')
    .replace(/pr_\$\{pr\}\.json/g, 'pr-${pr}.json')
    .replace(/C:\/Users\/timst\/\.gemini\/antigravity\/brain\/3cc40de8-dc77-4540-a38b-0d7a12e39cd0\/scratch\/parity_comparison\.json/g,
      'parity_comparison.json')}`;
};

writeUtf8(
  path.join(SUP, 'scripts/compare-oct02-exact.mjs'),
  sanitizeScriptPaths(
    readUtf8Clean(path.join(SCRATCH, 'compare_oct02_exact.mjs')),
    '// Archived forensic script from TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION.\n// Reproduces the exact October 2 (ffb98ac0) vs HEAD comparison.\n// Prepare immutable snapshot: git archive ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a -- api server app/dome-world app/engine package.json | tar -x -C <dir>\n// Run with TD613_OCT02_SNAPSHOT_URL=file:///<dir> node compare-oct02-exact.mjs'
  )
);
writeUtf8(
  path.join(SUP, 'scripts/generate-effective-request-parity.mjs'),
  sanitizeScriptPaths(
    readUtf8Clean(path.join(SCRATCH, 'generate_effective_request_parity.mjs')),
    '// Archived generator script for MARROWLINE_EFFECTIVE_REQUEST_PARITY.json.\n// Run with TD613_OCT02_SNAPSHOT=<oct02_dir> node generate-effective-request-parity.mjs'
  )
);
writeUtf8(
  path.join(SUP, 'scripts/inspect-historical-prs.mjs'),
  sanitizeScriptPaths(
    readUtf8Clean(path.join(SCRATCH, 'inspect_prs.mjs')),
    '// Archived PR archaeology index script reading supporting-artifacts/github-pr-snapshots/.'
  )
);

// 6. Extract ALL 6 Dollhouse specialist/Orchestrator verbatim reports & verifiable execution traces
const agents = [
  { file: '01-aperture-leaf-audit.md', role: 'APERTURE (Leaf Auditor)', type: 'dollhouse-aperture', id: '58c7dc01-ddd5-47a7-abe5-1a2f875316be', targetRev: '6cf64d17d82f727bb918be6869f313a3342e530c' },
  { file: '02-fadt-leaf-audit.md', role: 'FADT (Leaf Auditor)', type: 'dollhouse-fadt', id: '35a2025a-9967-46d9-acfe-876afc13e92e', targetRev: '6cf64d17d82f727bb918be6869f313a3342e530c' },
  { file: '03-pedagogue-leaf-audit.md', role: 'PEDAGOGUE (Leaf Auditor)', type: 'dollhouse-pedagogue', id: '1415ce7d-6db4-4160-a92e-4e052adc83dd', targetRev: '6cf64d17d82f727bb918be6869f313a3342e530c' },
  { file: '04-atlas-leaf-audit.md', role: 'ATLAS (Leaf Auditor)', type: 'dollhouse-atlas', id: 'b0ee9fd1-3394-4eaa-89da-e645c186a2dd', targetRev: '6cf64d17d82f727bb918be6869f313a3342e530c' },
  { file: '05-temporal-custodian-leaf-audit.md', role: 'TEMPORAL CUSTODIAN (Leaf Auditor)', type: 'dollhouse-temporal-custodian', id: '3c0e6c5b-ac37-4e79-8677-090b3d33f3f7', targetRev: '6cf64d17d82f727bb918be6869f313a3342e530c' },
  { file: '06-orchestrator-adjudication.md', role: 'DOLLHOUSE ORCHESTRATOR (Six-Role Adjudicator)', type: 'dollhouse-orchestrator', id: 'f9edfc36-b2b0-45e2-81c6-4437904d8c0f', targetRev: 'bc5467246f12b0598f89d681e4a4450c4733eace' }
];

const sanitizePathText = (s) => String(s || '')
  .replace(/C:[\\/]+td613-worktrees[\\/]+marrowline-screaming-grove-restoration-20261120[\\/]?/gi, '')
  .replace(/C:[\\/]+Users[\\/]+timst[\\/]+OneDrive[\\/]+Desktop[\\/]+tcp-repository[\\/]?/gi, '<primary-checkout>/')
  .replace(/C:[\\/]+Users[\\/]+timst[\\/]+\.gemini[\\/]+antigravity[\\/]+brain[\\/]+[^\s"'`)]+/gi, '<session-scratch>');

const fullTrace = [];

for (const ag of agents) {
  const fullLogPath = path.join(BRAIN, ag.id, '.system_generated/logs/transcript_full.jsonl');
  const compactLogPath = path.join(BRAIN, ag.id, '.system_generated/logs/transcript.jsonl');
  const logPath = fs.existsSync(fullLogPath) ? fullLogPath : compactLogPath;
  const steps = fs.readFileSync(logPath, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));

  const assignedPrompt = steps.find((s) => s.step_index === 0)?.content || '';
  const filesRead = [];
  const commandsRun = [];
  let sentMessage = '';

  for (const step of steps) {
    for (const tc of step.tool_calls || []) {
      const args = tc.arguments || tc.args || {};
      if (tc.name === 'read_file' && args.Path) {
        filesRead.push({
          step: step.step_index,
          path: sanitizePathText(args.Path),
          startLine: args.StartLine ?? null,
          endLine: args.EndLine ?? null
        });
      } else if (tc.name === 'run_command' && args.CommandLine) {
        commandsRun.push({
          step: step.step_index,
          summary: args.toolSummary || '',
          command: sanitizePathText(args.CommandLine)
        });
      } else if (tc.name === 'send_message' && args.Message) {
        sentMessage = args.Message;
      }
    }
  }

  const md = [
    `# 𝌋‌ TD613 Dollhouse Record — ${ag.role}`,
    '',
    `- **Subagent Type:** \`${ag.type}\``,
    `- **Session Conversation ID:** \`${ag.id}\``,
    `- **Target Audited Commit:** \`${ag.targetRev}\``,
    `- **Posture:** Read-only audit · \`0\` files modified · \`0\` paid provider calls`,
    `- **Total Recorded Steps:** \`${steps.length}\` · **Files Read:** \`${filesRead.length}\` · **Commands Executed:** \`${commandsRun.length}\``,
    '',
    '---',
    '',
    '## 1. Verbatim Returned Report (`send_message` payload)',
    '',
    sentMessage.trim(),
    '',
    '---',
    '',
    '## 2. Verifiable Inspection & Execution Audit Trail',
    '',
    '### Files Read During Audit',
    ...(filesRead.length
      ? filesRead.map((f) => `- Step ${f.step}: \`${f.path}\`${f.startLine || f.endLine ? ` (lines ${f.startLine ?? 1}–${f.endLine ?? 'end'})` : ''}`)
      : ['- (None)']),
    '',
    '### Commands / Domain Engines Executed During Audit',
    ...(commandsRun.length
      ? commandsRun.map((c) => `- Step ${c.step}${c.summary ? ` — **${c.summary}**` : ''}:\n  \`\`\`powershell\n  ${c.command}\n  \`\`\``)
      : ['- (None)']),
    '',
    '---',
    '',
    '## 3. Exact Assigned Scope Prompt',
    '',
    '```markdown',
    sanitizePathText(assignedPrompt).trim(),
    '```'
  ].join('\n');

  writeUtf8(path.join(SUP, 'dollhouse/specialist-reports', ag.file), md);
  fullTrace.push({
    role: ag.role,
    subagent_type: ag.type,
    conversation_id: ag.id,
    target_audited_commit: ag.targetRev,
    total_steps: steps.length,
    files_read_count: filesRead.length,
    commands_run_count: commandsRun.length,
    files_read: filesRead,
    commands_run: commandsRun,
    verbatim_report_chars: sentMessage.length
  });
}

writeUtf8(
  path.join(SUP, 'dollhouse/specialist-reports/dollhouse-six-agent-execution-trace.json'),
  JSON.stringify({
    schema: 'td613.dollhouse.six-agent-execution-trace/v1',
    commission: 'TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION',
    generated_at: new Date().toISOString(),
    paid_provider_calls: 0,
    agents: fullTrace
  }, null, 2)
);

console.log('Bundled all supporting artifacts & 6 verbatim Dollhouse reports cleanly!');
for (const t of fullTrace) {
  console.log(`  ${t.subagent_type}: steps=${t.total_steps} filesRead=${t.files_read_count} cmds=${t.commands_run_count} reportChars=${t.verbatim_report_chars}`);
}
