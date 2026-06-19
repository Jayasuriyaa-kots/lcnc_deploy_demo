import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('apps/builder/src/app/features/datasources');
const jsonPath = path.resolve('apps/builder/src/assets/i18n/datasources/en.json');
const lang = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function hasKey(obj, key) {
  return key.split('.').reduce((current, segment) => (current == null ? current : current[segment]), obj) != null;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = walk(root).filter((file) => file.endsWith('.component.html'));
const tsFiles = walk(root).filter((file) => file.endsWith('.ts'));
const missingKeys = new Set();
const missingTsKeys = new Set();
const legacyTemplateCalls = [];
const hardcodedHtml = [];

function isScopedI18nKey(key) {
  return /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(key);
}

function collectKeysFromSource(source, rel, target) {
  for (const match of source.matchAll(/\.translate\('([^']+)'/g)) {
    const key = match[1];
    if (!isScopedI18nKey(key)) {
      continue;
    }
    if (!hasKey(lang, key)) {
      target.add(`${rel} -> ${key}`);
    }
  }
}

const htmlLiteralPatterns = [
  /placeholder="([^{][^"]+)"/g,
  /hint="([^{][^"]+)"/g,
  /title="([^{][^"]+)"/g,
  /description="([^{][^"]+)"/g,
  />\s*([A-Z][A-Za-z][^<{]+)\s*</g,
];

for (const file of htmlFiles) {
  const rel = path.relative(process.cwd(), file);
  const html = fs.readFileSync(file, 'utf8');

  if (html.includes('i18n.translate(')) {
    legacyTemplateCalls.push(rel);
  }

  for (const match of html.matchAll(/t\('([^']+)'/g)) {
    const key = match[1];
    if (!hasKey(lang, key)) {
      missingKeys.add(`${rel} -> ${key}`);
    }
  }

  for (const pattern of htmlLiteralPatterns) {
    for (const match of html.matchAll(pattern)) {
      const text = match[1]?.trim();
      if (!text || text.includes('{{') || text.startsWith('t(') || text.length < 2) {
        continue;
      }
      if (/^(qo-|app-|datasources-|external-apis__|dynamic-integration-form__)/.test(text)) {
        continue;
      }
      hardcodedHtml.push(`${rel}: "${text}"`);
    }
  }
}

for (const file of tsFiles) {
  const rel = path.relative(process.cwd(), file);
  collectKeysFromSource(fs.readFileSync(file, 'utf8'), rel, missingTsKeys);
}

let exitCode = 0;
console.log('=== Datasources i18n audit ===\n');

if (missingKeys.size) {
  exitCode = 1;
  console.log('MISSING JSON KEYS:');
  for (const item of [...missingKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Template keys: all static t() keys found in en.json\n');
}

if (missingTsKeys.size) {
  exitCode = 1;
  console.log('MISSING TS translate() KEYS:');
  for (const item of [...missingTsKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('TS translate() keys: all scoped keys found in en.json\n');
}

if (legacyTemplateCalls.length) {
  exitCode = 1;
  console.log('LEGACY TEMPLATE CALLS:');
  for (const item of [...new Set(legacyTemplateCalls)].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Legacy template i18n.translate calls: none\n');
}

const uniqueHardcoded = [...new Set(hardcodedHtml)];
if (uniqueHardcoded.length) {
  exitCode = 1;
  console.log('HARDCODED HTML STRINGS:');
  for (const item of uniqueHardcoded.sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Hardcoded HTML strings: none flagged\n');
}

process.exit(exitCode);
