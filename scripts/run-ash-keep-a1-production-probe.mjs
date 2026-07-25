import { chromium } from 'playwright';

const managedChromium = chromium.executablePath();
if (!managedChromium) throw new Error('Playwright-managed Chromium executable is unavailable for A1 closure.');
process.env.TD613_BROWSER_EXECUTABLE = managedChromium;

await import('./run-ash-keep-a1-production-probe-base.mjs');
