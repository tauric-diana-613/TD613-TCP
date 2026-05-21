import assert from 'assert';
import { assessHardMaskReadiness } from '../app/engine/hush-hard-mask-proof.js';

const thin = assessHardMaskReadiness({ sampleCount: 4, profileStatus: 'usable', profileSummary: { wordCount: 186, punctuationDensity: 0.08, recurrencePressure: 0.2 } });
assert.equal(thin.passed, false);
assert(thin.failures.includes('hard-mask-samplecount-too-low'));
assert(thin.failures.includes('hard-mask-wordcount-too-low'));
assert(thin.failures.includes('hard-mask-profile-not-strong'));

const strong = assessHardMaskReadiness({ sampleCount: 16, profileStatus: 'strong', profileSummary: { wordCount: 760, punctuationDensity: 0.09, recurrencePressure: 0.18 } });
assert.equal(strong.passed, true);
assert.equal(strong.failures.length, 0);
assert(strong.score >= 0.99);

console.log('hush-hard-mask-proof tests passed');
