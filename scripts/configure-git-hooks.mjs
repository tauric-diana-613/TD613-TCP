#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function runPrivilegedWrite(path, content) {
  const result = spawnSync('sudo', ['tee', path], {
    input: content,
    encoding: 'utf8',
    stdio: ['pipe', 'ignore', 'inherit']
  });
  if (result.error) throw result.error;
  if ((result.status ?? 1) !== 0) {
    throw new Error(`prepare: failed to write runner-local CI network guard ${path}`);
  }
}

function configureGivingBrowserAptNetwork() {
  const isGivingBrowserJob =
    process.env.GITHUB_ACTIONS === 'true' &&
    process.env.GITHUB_JOB === 'giving_browser' &&
    process.platform === 'linux';

  if (!isGivingBrowserJob) return;

  const mirrorList = '/etc/apt/apt-mirrors.txt';
  if (fs.existsSync(mirrorList)) {
    runPrivilegedWrite(mirrorList, 'https://archive.ubuntu.com/ubuntu/\n');
  }

  const ubuntuSources = '/etc/apt/sources.list.d/ubuntu.sources';
  if (fs.existsSync(ubuntuSources)) {
    const original = fs.readFileSync(ubuntuSources, 'utf8');
    const repaired = original
      .replaceAll('http://azure.archive.ubuntu.com/ubuntu', 'https://archive.ubuntu.com/ubuntu')
      .replaceAll('https://azure.archive.ubuntu.com/ubuntu', 'https://archive.ubuntu.com/ubuntu');
    if (repaired !== original) runPrivilegedWrite(ubuntuSources, repaired);
  }

  runPrivilegedWrite(
    '/etc/apt/apt.conf.d/99td613-giving-browser-network',
    [
      'Acquire::Retries "2";',
      'Acquire::http::Timeout "15";',
      'Acquire::https::Timeout "15";',
      'Acquire::ForceIPv4 "true";',
      ''
    ].join('\n')
  );

  console.log('prepare: Giving browser CI pinned to bounded Ubuntu archive network policy');
}

configureGivingBrowserAptNetwork();

if (!fs.existsSync('.git')) {
  console.log('prepare: skipping local git hooks outside a Git checkout');
  process.exit(0);
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
  stdio: 'inherit'
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
