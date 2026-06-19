import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGlobalCommon, normalizeInterpolations } from './lib/i18n-common.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = path.join(root, 'apps/builder/src/app/features/page-builder/lang/page-builder.en.ts');
const jsonPath = path.join(root, 'apps/builder/src/assets/i18n/page-builder/en.json');

const { FLAT_COMMON_LANG, featureCommon } = loadGlobalCommon(root);

const fnTpl = (name, args, replacement) => [
  new RegExp(`${name}: \\(${args}\\) =>\\s*\`[\\s\\S]*?\`\\s*,`, 'g'),
  replacement,
];

const replacements = [
  fnTpl('fieldsCount', 'count: number', "fieldsCount: '{{count}} fields',"),
  fnTpl('currentlyEditing', 'section: string', "currentlyEditing: 'Currently editing: {{section}}',"),
  fnTpl('columnCount', 'count: number', "columnCount: '{{count}} columns',"),
];

const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('export const PAGE_BUILDER_LANG =');
const objectStart = src.indexOf('{', start);
const end = src.indexOf('\n} as const;', objectStart);

if (start < 0 || objectStart < 0 || end < 0) {
  throw new Error(`Could not locate PAGE_BUILDER_LANG object in ${srcPath}`);
}

let body = src.slice(objectStart, end + 2);

for (const [pattern, replacement] of replacements.reverse()) {
  body = body.replace(pattern, replacement);
}

const PAGE_BUILDER_LANG = Function(
  'FLAT_COMMON_LANG',
  'featureCommon',
  `"use strict"; return (${body});`
)(FLAT_COMMON_LANG, featureCommon);

const json = normalizeInterpolations(PAGE_BUILDER_LANG);
delete json.common;

fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);

console.log('Wrote', jsonPath);
console.log('Top-level keys:', Object.keys(json).join(', '));
