import assert from 'assert';
import fs from 'fs';
import { auditHushVisualAccessibility } from '../app/engine/hush-visual-accessibility-audit.js';

const result = auditHushVisualAccessibility({
  cssText: fs.readFileSync('app/hush-visual-system.css', 'utf8'),
  mobileCssText: fs.readFileSync('app/hush-mobile-field-deck.css', 'utf8'),
  htmlText: fs.readFileSync('app/hush.html', 'utf8'),
  jsText: fs.readFileSync('app/hush.js', 'utf8')
});
assert.equal(result.version, 'phase-31');
assert.equal(result.passed, true);
assert.equal(result.missing.length, 0);
console.log('hush-accessibility-audit tests passed');
