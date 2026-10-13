import assert from 'assert';
import {
  HUSH_PROTECTED_LITERAL_LOCKBOX_VERSION,
  detectProtectedLiterals,
  buildProtectedLiteralLockbox,
  verifyProtectedLiteralLockbox,
  summarizeProtectedLiteralLockbox,
  exportProtectedLiteralLockbox
} from '../app/engine/hush-protected-literal-lockbox.js';

assert.equal(HUSH_PROTECTED_LITERAL_LOCKBOX_VERSION, 'phase-12');

const sourceText = 'Please preserve EXHIBIT-42, 6/13, report.pdf, "exact quote", 𝌋, and Khona‌lit-po in the record.';
const literals = detectProtectedLiterals(sourceText);
assert(literals.length >= 5);
assert(literals.some((item) => item.type === 'exhibit'));
assert(literals.some((item) => item.type === 'date'));
assert(literals.some((item) => item.type === 'file-name'));
assert(literals.some((item) => item.type === 'quoted-string'));
assert(literals.some((item) => item.type === 'glyph-boundary'));

const lockbox = buildProtectedLiteralLockbox({ sourceText, manualLiterals: ['MANUAL-77'] });
assert.equal(lockbox.version, 'phase-12');
assert.equal(lockbox.status, 'locked');
assert(lockbox.lockedCount >= 6);
assert(lockbox.byType.manual >= 1);

const verified = verifyProtectedLiteralLockbox(lockbox, 'EXHIBIT-42 and 6/13 remain. report.pdf remains. "exact quote" remains. 𝌋 remains. Khona‌lit-po remains. MANUAL-77 remains.');
assert.equal(verified.status, 'preserved');
assert.equal(verified.missingCount, 0);
assert.equal(verified.preservationScore, 1);

const missing = verifyProtectedLiteralLockbox(lockbox, 'Only EXHIBIT-42 remains.');
assert.equal(missing.status, 'missing-protected-literals');
assert(missing.missingCount > 0);
assert(missing.warnings.includes('protected-literal-drop'));

const summary = summarizeProtectedLiteralLockbox(lockbox, missing);
assert.equal(summary.version, 'phase-12');
assert(summary.missingCount > 0);

const exportedDefault = exportProtectedLiteralLockbox(lockbox);
assert(exportedDefault.includes('phase-12'));
assert(!exportedDefault.includes('EXHIBIT-42'));
assert(exportedDefault.includes('literalHash'));

const exportedPrivate = exportProtectedLiteralLockbox(lockbox, { includePrivateText: true });
assert(exportedPrivate.includes('EXHIBIT-42'));

console.log('hush-protected-literal-lockbox tests passed');
