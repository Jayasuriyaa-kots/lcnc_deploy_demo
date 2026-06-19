import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('apps/builder/src/app/features/workflow-builder');
const jsonPath = path.resolve('apps/builder/src/assets/i18n/workflow-builder/en.json');
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

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.component.html'));
const tsFiles = files.filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'));
const missingTemplateKeys = new Set();
const missingTsKeys = new Set();
const hardcodedHtml = [];
const badReadScopes = [];

function isScopedI18nKey(key) {
  return /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(key);
}

for (const file of htmlFiles) {
  const rel = path.relative(process.cwd(), file);
  const html = fs.readFileSync(file, 'utf8');

  if (html.includes(`read: 'workflow-builder'`)) {
    badReadScopes.push(`${rel}: uses read: 'workflow-builder' (should be workflowBuilder)`);
  }

  for (const match of html.matchAll(/\bt\('([^']+)'/g)) {
    const key = match[1];
    if (!hasKey(lang, key)) {
      missingTemplateKeys.add(`${rel} -> ${key}`);
    }
  }

  const htmlLiteralPatterns = [
    /placeholder="([^{"][^"]*)"/g,
    /hint="([^{"][^"]*)"/g,
    /title="([^{"][^"]*)"/g,
    /description="([^{"][^"]*)"/g,
    />\s*([A-Z][A-Za-z][^<{]+)\s*</g,
  ];

  for (const pattern of htmlLiteralPatterns) {
    for (const match of html.matchAll(pattern)) {
      const text = match[1]?.trim();
      if (!text || text.includes('{{') || text.startsWith('t(') || text.length < 2 || /^""/.test(text)) {
        continue;
      }
      if (/^(qo-|app-|workflow-|material-symbols)/.test(text)) {
        continue;
      }
      hardcodedHtml.push(`${rel}: "${text}"`);
    }
  }
}

for (const file of tsFiles) {
  const rel = path.relative(process.cwd(), file);
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/\.(?:scope|translate|t)\('([^']+)'/g)) {
    const key = match[1];
    if (!isScopedI18nKey(key)) {
      continue;
    }
    if (!hasKey(lang, key)) {
      missingTsKeys.add(`${rel} -> ${key}`);
    }
  }
}

let exitCode = 0;
console.log('=== Workflow Builder i18n audit ===\n');

if (missingTemplateKeys.size) {
  exitCode = 1;
  console.log('MISSING JSON KEYS (templates):');
  for (const item of [...missingTemplateKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Template keys: all static t() keys found in en.json\n');
}

if (missingTsKeys.size) {
  exitCode = 1;
  console.log('MISSING JSON KEYS (TS):');
  for (const item of [...missingTsKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('TS scope/translate keys: all found in en.json\n');
}

if (badReadScopes.length) {
  exitCode = 1;
  console.log('INVALID read SCOPE USAGE:');
  for (const item of [...new Set(badReadScopes)].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Scope read usage: valid\n');
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
