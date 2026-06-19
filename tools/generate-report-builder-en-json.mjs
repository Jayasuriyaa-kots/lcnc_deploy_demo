import fs from 'node:fs';
import path from 'node:path';
import {
  loadGlobalCommon,
  normalizeInterpolations,
  pruneSharedCommon,
} from './lib/i18n-common.mjs';

const root = path.resolve('.');
const srcPath = path.join(
  root,
  'apps/builder/src/app/features/report-builder/lang/reports.lang.ts'
);
const jsonPath = path.join(root, 'apps/builder/src/assets/i18n/report-builder/en.json');

const fnTpl = (name, args, replacement) => [
  new RegExp(`${name}: \\(${args}\\) =>\\s*\`[\\s\\S]*?\`\\s*,`, 'g'),
  replacement,
];

const replacements = [
  fnTpl(
    'showingResults',
    'start: string \\| number, end: string \\| number, total: string \\| number',
    "showingResults: 'Showing {{start}}-{{end}} of {{total}} results',"
  ),
  fnTpl(
    'selectedCount',
    'count: string \\| number',
    "selectedCount: '{{count}} selected',"
  ),
  fnTpl(
    'pageOf',
    'current: string \\| number, total: string \\| number',
    "pageOf: 'Page {{current}} of {{total}}',"
  ),
  fnTpl(
    'titleWithReport',
    'name: string \\| number',
    "titleWithReport: '{{name}} Preview',"
  ),
  fnTpl(
    'recordTitle',
    'id: string \\| number',
    "recordTitle: 'Record #{{id}}',"
  ),
  fnTpl(
    'totalRecords',
    'count: string \\| number',
    "totalRecords: 'Total records: {{count}}',"
  ),
  fnTpl(
    'printed',
    'name: string \\| number',
    "printed: 'Printed: {{name}}',"
  ),
  fnTpl(
    'deleteSelectedRecordsMessage',
    'count: string \\| number',
    "deleteSelectedRecordsMessage: 'This will permanently delete {{count}} record(s).',"
  ),
  fnTpl(
    'pageSizeRecords',
    'count: number',
    "pageSizeRecords: '{{count}} Records',"
  ),
  fnTpl(
    'column',
    'index: string \\| number',
    "column: 'Column {{index}}',"
  ),
  fnTpl(
    'join',
    'index: string \\| number',
    "join: 'Join {{index}}',"
  ),
  fnTpl(
    'cardLayoutSummary',
    'count: string \\| number',
    "cardLayoutSummary: 'Card layout • {{count}} elements',"
  ),
  fnTpl(
    'preset',
    'index: number',
    "preset: 'Preset {{index}}',"
  ),
];

const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('export const REPORTS_LANG =');
const objectStart = src.indexOf('{', start);
const end = src.indexOf('\n} as const;', objectStart);

if (start < 0 || objectStart < 0 || end < 0) {
  throw new Error(`Could not locate REPORTS_LANG object in ${srcPath}`);
}

let body = src.slice(objectStart + 1, end).trim();

for (const [pattern, replacement] of [...replacements].reverse()) {
  body = body.replace(pattern, replacement);
}

const obj = Function(`"use strict"; return ({${body}});`)();
const { commonValues } = loadGlobalCommon(root);
const json = normalizeInterpolations(pruneSharedCommon(obj, commonValues) ?? {});

fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);

console.log('Wrote', jsonPath);
console.log('Top-level keys:', Object.keys(json).join(', '));
