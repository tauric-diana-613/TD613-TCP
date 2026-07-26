import { chromium } from 'playwright';

const managedChromium = chromium.executablePath();
if (!managedChromium) throw new Error('Playwright-managed Chromium executable is unavailable for bounded lifecycle closure.');
process.env.TD613_BROWSER_EXECUTABLE = managedChromium;

// Compatibility entrypoint only. The retired pre-lifecycle A1 closure journey
// attempted governed mutations before readiness and custody. Delegate the live
// consolidated closure witness to the current lifecycle observer instead.
await import('./ash-lifecycle-production-probe.mjs');
