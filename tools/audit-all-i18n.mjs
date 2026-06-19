import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve('.');
const audits = [
  'audit-global-i18n.mjs',
  'audit-form-builder-i18n.mjs',
  'audit-report-builder-i18n.mjs',
  'audit-page-builder-i18n.mjs',
  'audit-datasources-i18n.mjs',
  'audit-workflow-builder-i18n.mjs',
  'audit-deployer-i18n.mjs',
];

let exitCode = 0;

console.log('=== Quanta Ops i18n final audit ===\n');

for (const script of audits) {
  const result = spawnSync(process.execPath, [path.join(root, 'tools', script)], {
    cwd: root,
    encoding: 'utf8',
  });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  if (result.status !== 0) {
    exitCode = result.status ?? 1;
  }
  console.log();
}

if (exitCode === 0) {
  console.log('All i18n audits passed.');
} else {
  console.error('One or more i18n audits failed.');
}

process.exit(exitCode);
