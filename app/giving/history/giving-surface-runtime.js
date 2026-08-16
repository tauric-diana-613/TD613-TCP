import { installGivingAiaSurface } from './giving-aia-surface.js';

export function installGivingSurfaceRuntime(runtime = globalThis) {
  return installGivingAiaSurface(runtime);
}
