import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = path.join(
  root,
  'apps/builder/src/app/features/form-builder/lang/form-builder.en.ts'
);
const jsonPath = path.join(root, 'apps/builder/src/assets/i18n/form-builder/en.json');

const fnTpl = (name, args, replacement) => [
  new RegExp(`${name}: \\(${args}\\) =>\\s*\`[\\s\\S]*?\`\\s*,`, 'g'),
  replacement,
];

const replacements = [
  fnTpl(
    'connectionSummary',
    'datasource: string, query: string',
    "connectionSummary: '{{datasource}} executes {{query}} for this form.',"
  ),
  fnTpl(
    'columnsLoaded',
    'count: number',
    "columnsLoaded: '{{count}} columns will be loaded automatically for mapping review.',"
  ),
  fnTpl('datasourceBadge', 'label: string', "datasourceBadge: 'Datasource: {{label}}',"),
  fnTpl('queryBadge', 'label: string', "queryBadge: 'Query: {{label}}',"),
  fnTpl('expectedInputs', 'count: number', "expectedInputs: '{{count}} expected inputs',"),
  fnTpl('columns', 'count: number', "columns: '{{count}} columns',"),
  fnTpl(
    'deleteFieldMessage',
    'fieldLabel: string',
    'deleteFieldMessage: \'Are you sure you want to delete "{{fieldLabel}}" from this form? This action cannot be undone.\','
  ),
  fnTpl(
    'publishFormMessage',
    'formName: string',
    'publishFormMessage: \'Publish "{{formName}}" now? It will become live for app users.\','
  ),
  [
    /clearSubmissionsMessage: \(count: number, formName: string\) =>\s*\r?\n\s*`[^`]*`\s*\r?\n/,
    'clearSubmissionsMessage: \'Delete {{count}} stored preview submission(s) for "{{formName}}"? This only clears local mock records from this browser.\',\n',
  ],
  fnTpl('redirectMessage', 'url\\?: string', "redirectMessage: 'You are being redirected to {{url}}',"),
  [
    /duplicateDetectionMessage: \(mode: string, outcome: string\) =>\s*\r?\n\s*`[^`]*`\s*,/,
    "duplicateDetectionMessage: 'Duplicate detection is set to {{mode}}. In live mode, duplicate submissions will be {{outcome}}.',",
  ],
  fnTpl('otherChoiceValue', 'value: string', "otherChoiceValue: 'Other: {{value}}',"),
  fnTpl('capturedImageAt', 'index: number', "capturedImageAt: 'Captured image {{index}}.png',"),
  fnTpl('recordedAudio', 'extension: string', "recordedAudio: 'Recorded audio.{{extension}}',"),
  fnTpl('recordedVideo', 'extension: string', "recordedVideo: 'Recorded video.{{extension}}',"),
  [
    /geoSummary: \(coords: string, accuracy\?: number\) =>[^{]*\{[\s\S]*?: `[^`]*`\s*\r?\n/,
    "geoSummary: 'Geo coordinates: {{coords}}',\n",
  ],
  fnTpl('generatedPlaceholder', 'label: string', "generatedPlaceholder: 'Enter {{label}}',"),
  fnTpl('optionNumber', 'index: number', "optionNumber: 'Option {{index}}',"),
  fnTpl('required', 'label: string', "required: '{{label}} is required.',"),
  fnTpl('maxCharacters', 'label: string', "maxCharacters: '{{label}} exceeds the maximum character limit.',"),
  fnTpl('validNumber', 'label: string', "validNumber: '{{label}} must be a valid number.',"),
  fnTpl('wholeNumber', 'label: string', "wholeNumber: '{{label}} must be a whole number.',"),
  fnTpl(
    'decimalPlaces',
    'label: string, count: number',
    "decimalPlaces: '{{label}} allows up to {{count}} decimal place(s).',"
  ),
  fnTpl('maxDigits', 'label: string', "maxDigits: '{{label}} exceeds the maximum digits allowed.',"),
  fnTpl('minValue', 'label: string, value: unknown', "minValue: '{{label}} must be at least {{value}}.',"),
  fnTpl('maxValue', 'label: string, value: unknown', "maxValue: '{{label}} must be at most {{value}}.',"),
  fnTpl('fileType', 'accept: string', "fileType: 'Only {{accept}} files are allowed.',"),
  fnTpl('fileSize', 'maxMb: unknown', "fileSize: 'Each file must be smaller than {{maxMb}} MB.',"),
  fnTpl(
    'mediaDuration',
    "kind: 'Audio' \\| 'Video', seconds: number",
    "mediaDuration: '{{kind}} duration must be at most {{seconds}} seconds.',"
  ),
  fnTpl(
    'maxFileCount',
    'count: number, noun: string',
    "maxFileCount: 'You can select up to {{count}} {{noun}}.',"
  ),
  fnTpl(
    'maxImageCaptureCount',
    'count: number',
    "maxImageCaptureCount: 'You can capture up to {{count}} images.',"
  ),
];

const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('  page:');
const end = src.lastIndexOf('} as const;');
let body = src.slice(start, end).trim();

for (const [pattern, replacement] of [...replacements].reverse()) {
  body = body.replace(pattern, replacement);
}

const obj = Function(`"use strict"; return ({${body}});`)();

obj.common = {
  published: 'Published',
  saveAndPublish: 'Save & Publish',
  submissions: 'Submissions',
};

fs.writeFileSync(jsonPath, `${JSON.stringify(obj, null, 2)}\n`);

console.log('Wrote', jsonPath);
console.log('Top-level keys:', Object.keys(obj).join(', '));
