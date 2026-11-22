// Archived PR archaeology index script reading supporting-artifacts/github-pr-snapshots/.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const SCRATCH = process.env.TD613_PR_SNAPSHOT_DIR || new URL('../github-pr-snapshots', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));

const octNov = readJson(`${SCRATCH}/oct-nov-marrowline-prs-index.json`);
octNov.sort((a, b) => a.number - b.number);
console.log(`=== OCT-NOV MARROWLINE PRs (${octNov.length}) ===`);
for (const p of octNov) {
  console.log(`#${p.number} [${p.state}${p.isDraft ? ' DRAFT' : ''}] c=${p.createdAt.slice(0, 10)} m=${(p.mergedAt || '-').slice(0, 10)} head=${p.headRefOid.slice(0, 9)} ${p.headRefName} :: ${p.title}`);
}

console.log('\n=== KEY PR SUMMARIES ===');
for (const pr of [1545, 1555, 1509, 1516, 1517, 1433, 1569, 1513, 1515, 1549]) {
  const f = `${SCRATCH}/pr-${pr}.json`;
  if (!fs.existsSync(f)) continue;
  const d = readJson(f);
  console.log(`\n--- PR #${d.number} [${d.state}${d.isDraft ? ' DRAFT' : ''}] mergeable=${d.mergeable} ---`);
  console.log(`Title: ${d.title}`);
  console.log(`Branch: ${d.headRefName} @ ${d.headRefOid}`);
  console.log(`Comments: ${d.comments.length}`);
  console.log(`Body (first 600 chars):\n${(d.body || '').slice(0, 600)}`);
  if (d.comments.length) {
    for (let i = 0; i < d.comments.length; i++) {
      console.log(`  [Comment ${i + 1} by ${d.comments[i].author?.login} @ ${d.comments[i].createdAt}]:\n${(d.comments[i].body || '').slice(0, 800)}`);
    }
  }
}
