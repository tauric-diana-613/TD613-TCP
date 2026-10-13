import fs from 'node:fs';

const fixtureUrl = new URL('./shell-baseline.fixture.mjs', import.meta.url);
const generatedUrl = new URL('./.shell-a15-postclosure.generated.mjs', import.meta.url);
const replacements = [
  ['20260724-a12-release-v1', '20260727-a15-postclosure-v1']
];
let source = fs.readFileSync(fixtureUrl, 'utf8');
for (const [before, after] of replacements) source = source.replaceAll(before, after);
fs.writeFileSync(generatedUrl, source);
try {
  await import(`${generatedUrl.href}?run=${Date.now()}`);
} finally {
  fs.rmSync(generatedUrl, { force:true });
}
