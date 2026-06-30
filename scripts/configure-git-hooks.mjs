#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

if (!fs.existsSync('.git')) {
  console.log('prepare: skipping local git hooks outside a Git checkout');
  process.exit(0);
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
  stdio: 'inherit'
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
