import fs from 'node:fs';
import path from 'node:path';
import { GLOBAL_ALIAS_KEYS, loadGlobalCommon } from './lib/i18n-common.mjs';

const repoRoot = path.resolve('.');
const root = path.resolve('apps/deployer/src/app');
const jsonPath = path.resolve('apps/deployer/src/assets/i18n/deployer/en.json');
const lang = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const { FLAT_COMMON_LANG } = loadGlobalCommon(repoRoot);
const globalFlatKeys = new Set(Object.keys(FLAT_COMMON_LANG));

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
const tsFiles = walk(root).filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'));
const missingKeys = new Set();
const missingTsKeys = new Set();
const legacyTranslate = [];
const hardcodedHtml = [];

function isScopedI18nKey(key) {
  return /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(key);
}

function isResolvableKey(key) {
  if (hasKey(lang, key)) {
    return true;
  }
  const leaf = key.includes('.') ? key.slice(key.lastIndexOf('.') + 1) : key;
  return GLOBAL_ALIAS_KEYS.has(leaf) && globalFlatKeys.has(leaf);
}

for (const file of htmlFiles) {
  const rel = path.relative(process.cwd(), file);
  const html = fs.readFileSync(file, 'utf8');

  for (const match of html.matchAll(/i18n\.translate\('([^']+)'/g)) {
    const key = match[1];
    if (!isResolvableKey(key)) {
      missingKeys.add(`${rel} -> ${key}`);
    }
  }

  const htmlLiteralPatterns = [
    /placeholder="([^{"][^"]*)"/g,
    /title="([^{"][^"]*)"/g,
    /label="([^{"][^"]*)"/g,
    />\s*([A-Z][A-Za-z][^<{]+)\s*</g,
  ];

  for (const pattern of htmlLiteralPatterns) {
    for (const match of html.matchAll(pattern)) {
      const text = match[1]?.trim();
      if (!text || text.includes('{{') || text.startsWith('i18n.') || text.length < 2 || /^""/.test(text)) {
        continue;
      }
      if (/^(qo-|app-|material-symbols)/.test(text)) {
        continue;
      }
      hardcodedHtml.push(`${rel}: "${text}"`);
    }
  }
}

for (const file of tsFiles) {
  const rel = path.relative(process.cwd(), file);
  if (rel.includes(`${path.sep}mock-data${path.sep}`)) {
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');

  if (source.includes('translateDeployerLang') && !rel.includes(`${path.sep}mock-data${path.sep}`)) {
    legacyTranslate.push(rel);
  }

  for (const match of source.matchAll(/\.(?:translate|scope|t)\('([^']+)'/g)) {
    const key = match[1];
    if (!isScopedI18nKey(key)) {
      continue;
    }
    if (!isResolvableKey(key)) {
      missingTsKeys.add(`${rel} -> ${key}`);
    }
  }
}

let exitCode = 0;
console.log('=== Deployer i18n audit ===\n');

if (missingKeys.size) {
  exitCode = 1;
  console.log('MISSING JSON KEYS (templates):');
  for (const item of [...missingKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Template keys: all i18n.translate() keys resolve (scope JSON or global base)\n');
}

if (missingTsKeys.size) {
  exitCode = 1;
  console.log('MISSING JSON KEYS (TS):');
  for (const item of [...missingTsKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('TS translate keys: all scoped keys resolve (scope JSON or global base)\n');
}

if (legacyTranslate.length) {
  exitCode = 1;
  console.log('LEGACY translateDeployerLang usage:');
  for (const item of [...new Set(legacyTranslate)].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Legacy translateDeployerLang usage: none\n');
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
