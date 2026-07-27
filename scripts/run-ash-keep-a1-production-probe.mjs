import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const managedChromium = chromium.executablePath();
if (!managedChromium) throw new Error('Playwright-managed Chromium executable is unavailable for bounded lifecycle closure.');
process.env.TD613_BROWSER_EXECUTABLE = managedChromium;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const staleDirectory of ['ash-keep-production-closure', 'ash-keep-probe-runtime']) {
  await fs.rm(path.join(repoRoot, 'artifacts', staleDirectory), { recursive:true, force:true });
}

// Compatibility entrypoint only. The retired pre-lifecycle A1 closure journey
// attempted governed mutations before readiness and custody. Delegate the live
// consolidated closure witness to the current lifecycle observer instead.
await import('./ash-lifecycle-production-probe.mjs');
