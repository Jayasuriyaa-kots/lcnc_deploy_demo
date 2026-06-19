import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('apps/builder/src/app/features/page-builder');
const jsonPath = path.resolve('apps/builder/src/assets/i18n/page-builder/en.json');
const lang = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function hasKey(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj) != null;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html') || entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const tsFiles = files.filter((file) => file.endsWith('.ts'));
const missingKeys = new Set();
const blockedPatterns = [];

for (const file of htmlFiles) {
  const rel = path.relative(process.cwd(), file);
  const html = fs.readFileSync(file, 'utf8');

  for (const match of html.matchAll(/(?<![\w])t\('([^']+)'/g)) {
    const key = match[1];
    if (key.startsWith('common.')) continue;
    if (!hasKey(lang, key)) missingKeys.add(`${rel} -> ${key}`);
  }

  if (html.includes('*transloco')) {
    blockedPatterns.push(`${rel}: still uses *transloco`);
  }
}

for (const file of tsFiles) {
  const rel = path.relative(process.cwd(), file);
  const src = fs.readFileSync(file, 'utf8');

  if (src.includes('TranslocoDirective')) {
    blockedPatterns.push(`${rel}: still imports TranslocoDirective`);
  }
}

let exitCode = 0;
console.log('=== Page Builder i18n audit ===\n');

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
