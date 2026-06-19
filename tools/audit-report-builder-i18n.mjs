import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('apps/builder/src/app/features/report-builder');
const jsonPath = path.resolve('apps/builder/src/assets/i18n/report-builder/en.json');
const lang = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const SKIP_TS =
  /[/\\](lang|config|utils|models|services[/\\]report-seed-factory|services[/\\]report-preview-builder|canvas-item\.model|report-create-layout\.model|report-custom-layout\.model)[/\\]|\.spec\.ts$/;

function hasKey(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj) != null;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'lang') walk(full, files);
    else if (entry.name.endsWith('.html') || entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

const missingKeys = new Set();
const blockedPatterns = [];

for (const file of walk(root)) {
  const rel = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, 'utf8');

  if (file.endsWith('.html')) {
    for (const match of content.matchAll(/\bt\('([^']+)'/g)) {
      const key = match[1];
      if (key.startsWith('common.')) continue;
      if (!hasKey(lang, key)) missingKeys.add(`${rel} -> ${key}`);
    }
    if (content.includes('*transloco')) blockedPatterns.push(`${rel}: still uses *transloco`);
    if (content.includes('lang.')) blockedPatterns.push(`${rel}: still uses lang.*`);
    if (/t\('[^']+'\)\(/.test(content)) {
      blockedPatterns.push(`${rel}: uses t('key')(...) — use t('key', { param: value }) instead`);
    }
  }

  if (file.endsWith('.ts') && !file.includes('report-builder-i18n.service.ts')) {
    if (content.includes('readonly lang = REPORTS_LANG')) {
      blockedPatterns.push(`${rel}: still uses readonly lang = REPORTS_LANG`);
    }
    if (!SKIP_TS.test(file)) {
      for (const match of content.matchAll(/label:\s*'([^']+)'/g)) {
        const label = match[1];
        if (/^[A-Z]/.test(label)) {
          blockedPatterns.push(`${rel}: hardcoded label "${label}"`);
        }
      }
    }
  }
}

let exitCode = 0;
console.log('=== Report Builder i18n audit ===\n');

if (missingKeys.size) {
  exitCode = 1;
  console.log('MISSING JSON KEYS:');
  for (const item of [...missingKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Template keys: all static scoped t() keys found in en.json\n');
}

if (blockedPatterns.length) {
  exitCode = 1;
  console.log('BLOCKED PATTERNS:');
  for (const item of blockedPatterns.sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Blocked patterns: none flagged\n');
}

process.exit(exitCode);
