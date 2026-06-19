import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('apps/builder/src/app/features/form-builder');
const jsonPath = path.resolve('apps/builder/src/assets/i18n/form-builder/en.json');
const lang = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const SKIP_TS = /[/\\](lang|config|services[/\\]form-builder-seed|services[/\\]field-policy)[/\\]|\.spec\.ts$/;

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

const htmlLiteralPatterns = [
  /placeholder="([^{][^"]+)"/g,
  /hint="([^{][^"]+)"/g,
  /title="([^{][^"]+)"/g,
  />\s*([A-Z][A-Za-z][^<{]+)\s*</g,
];

const missingKeys = new Set();
const staticStrings = [];
const tsStatic = [];

for (const file of walk(root)) {
  const rel = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, 'utf8');

  if (file.endsWith('.html')) {
    for (const match of content.matchAll(/\bt\('([^']+)'/g)) {
      const key = match[1];
      if (key.endsWith('.') || key.includes('${') || key.includes("' +")) continue;
      if (!hasKey(lang, key)) missingKeys.add(`${rel} → ${key}`);
    }

    for (const pattern of htmlLiteralPatterns) {
      for (const match of content.matchAll(pattern)) {
        const text = match[1]?.trim();
        if (!text || text.startsWith('t(') || text.includes('{{') || text.length < 3) continue;
        if (/^(qo-|app-|material-|preview-|builder-)/.test(text)) continue;
        staticStrings.push(`${rel}: "${text}"`);
      }
    }
  }

  if (file.endsWith('.ts') && !SKIP_TS.test(file)) {
    if (content.includes('readonly lang = ') || content.includes('FORM_BUILDER_LANG') && file.includes('/components/')) {
      if (content.includes('FORM_BUILDER_LANG') && file.includes('form-field-inspector.component.ts')) {
        tsStatic.push(`${rel}: uses FORM_BUILDER_LANG (Phase 1 field defaults — expected)`);
      }
    }
    for (const match of content.matchAll(/label:\s*'([^']+)'/g)) {
      const label = match[1];
      if (/^[A-Z]/.test(label)) tsStatic.push(`${rel}: hardcoded label "${label}"`);
    }
    if (content.includes('lang.')) {
      tsStatic.push(`${rel}: still uses lang.*`);
    }
  }
}

let exitCode = 0;
console.log('=== Form Builder i18n audit ===\n');

if (missingKeys.size) {
  exitCode = 1;
  console.log('MISSING JSON KEYS:');
  for (const item of [...missingKeys].sort()) console.log('  -', item);
  console.log();
} else {
  console.log('Template keys: all static t() keys found in en.json\n');
}

const uniqueStatic = [...new Set(staticStrings)];
if (uniqueStatic.length) {
  exitCode = 1;
  console.log('HARDCODED HTML STRINGS:');
  for (const item of uniqueStatic) console.log('  -', item);
  console.log();
} else {
  console.log('Hardcoded HTML strings: none flagged\n');
}

const blocked = [...new Set(tsStatic)].filter(
  (item) => !item.includes('form-field-inspector.component.ts')
);
if (blocked.length) {
  exitCode = 1;
  console.log('BLOCKED TS PATTERNS:');
  for (const item of blocked) console.log('  -', item);
  console.log();
} else {
  console.log('Blocked TS patterns: none flagged\n');
}

process.exit(exitCode);
