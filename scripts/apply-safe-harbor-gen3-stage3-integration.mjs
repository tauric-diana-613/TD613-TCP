import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(path, before, after) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected Stage 3 integration seam missing in ${path}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Stage 3 integration seam is not unique in ${path}`);
  writeFileSync(path, source.replace(before, after));
}

replaceOnce(
  'app/safe-harbor/index.html',
  '  <link rel="stylesheet" href="app/styles.css?v=202606290205">\n',
  '  <link rel="stylesheet" href="app/styles.css?v=202606290205">\n  <link rel="stylesheet" href="app/safe-harbor-temporal-bloom.css?v=20260722-gen3-stage3">\n'
);

replaceOnce(
  'app/safe-harbor/index.html',
  '  <script src="app/safe-harbor-pr169-packet-vault-direct.js?v=202606290206"></script>\n</body>',
  '  <script src="app/safe-harbor-pr169-packet-vault-direct.js?v=202606290206"></script>\n  <script type="module" src="app/safe-harbor-temporal-bloom.js?v=20260722-gen3-stage3"></script>\n</body>'
);

replaceOnce(
  'package.json',
  '    "test:safe-harbor:gen3:track-r": "node tests/safe-harbor-gen3-track-r.test.mjs",\n',
  '    "test:safe-harbor:gen3:track-r": "node tests/safe-harbor-gen3-track-r.test.mjs",\n    "test:safe-harbor:gen3:stage3": "node tests/safe-harbor-gen3-stage3-temporal-bloom-provenance.test.mjs",\n    "test:safe-harbor:gen3:wave-b": "npm run test:safe-harbor:gen3:wave-a && npm run test:safe-harbor:gen3:stage3",\n'
);

console.log('safe-harbor-gen3-stage3 integration patch applied');
