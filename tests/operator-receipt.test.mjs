import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const receiptRuntime = readFileSync('app/operator-receipt.js', 'utf8');
const bootstrap = readFileSync('app/chamber-bootstrap.js', 'utf8');
const safeHarborIndex = readFileSync('app/safe-harbor/index.html', 'utf8');
const browserMain = readFileSync('app/browser-main.js', 'utf8');
const safeHarborMain = readFileSync('app/safe-harbor/app/main.js', 'utf8');

assert.match(receiptRuntime, /window\.TD613OperatorReceipt/, 'operator receipt runtime should expose a shared browser API');
assert.match(receiptRuntime, /__TD613_LAST_OPERATOR_RECEIPT__/, 'operator receipt should expose the last payload for live debugging');
assert.match(bootstrap, /operator-receipt\.js/, 'shared station bootstrap should load the receipt runtime');
assert.match(safeHarborIndex, /\.\.\/operator-receipt\.js/, 'Safe Harbor should load the shared receipt runtime');
assert.match(safeHarborIndex, /id="safeHarborReceiptMount"/, 'Safe Harbor ingress should expose a receipt mount');
assert.match(safeHarborIndex, /id="safeHarborVaultReceiptMount"/, 'Safe Harbor vault should expose a receipt mount');
assert.match(browserMain, /renderTcpOperatorReceipt/, 'TCP browser shell should render operator receipts');
assert.match(safeHarborMain, /renderSafeHarborReceipt/, 'Safe Harbor runtime should render operator receipts');

console.log('operator-receipt.test.mjs passed');
