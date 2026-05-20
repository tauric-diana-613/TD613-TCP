import './hush-simple-path.js';
import * as bench from './adversarial-bench.mjs';
import { initHushInvisibleShell } from './hush-invisible-shell.js';
import { initHushAlienConsole } from './hush-alien-console.js';

if (typeof window !== 'undefined') window.__TD613_HUSH_BENCH__ = bench;
if (typeof document !== 'undefined') {
  initHushInvisibleShell(document, bench);
  initHushAlienConsole(document, bench);
}

export * from './adversarial-bench.mjs';