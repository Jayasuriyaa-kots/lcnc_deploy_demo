import fs from 'node:fs';
import path from 'node:path';
import { loadGlobalCommon } from './lib/i18n-common.mjs';

const root = path.resolve('.');
let exitCode = 0;
const failures = [];

function fail(message) {
  failures.push(message);
  exitCode = 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function flatValues(obj) {
  const values = [];
  const walk = (value) => {
    if (typeof value === 'string') {
      values.push(value);
      return;
    }
    if (value && typeof value === 'object') {
      for (const child of Object.values(value)) {
        walk(child);
      }
    }
  };
  walk(obj);
  return values;
}

function assertAssetGlob(projectPath, label) {
  const project = readJson(projectPath);
  const assets = project.targets?.build?.options?.assets ?? [];
  const hasGlobal = assets.some(
    (entry) =>
      typeof entry === 'object' &&
      entry.input === 'libs/lang/src/lib/i18n' &&
      entry.output === '/assets/i18n/'
  );
  if (!hasGlobal) {
    fail(`${label} project.json is missing global libs/lang i18n asset glob`);
  }
}

function assertPreload(filePath, scopes, label) {
  const src = fs.readFileSync(filePath, 'utf8');
  if (!src.includes("transloco.load('en')")) {
    fail(`${label} app.config.ts does not preload global en`);
  }
  for (const scope of scopes) {
    if (!src.includes(`transloco.load('${scope}')`)) {
      fail(`${label} app.config.ts does not preload ${scope}`);
    }
  }
}

console.log('=== Global i18n base audit ===\n');

const { commonJson, commonValues } = loadGlobalCommon(root);
const requiredSections = [
  'actions',
  'fields',
  'dataBinding',
  'layout',
  'states',
  'validation',
  'viewport',
  'dialogs',
];
for (const section of requiredSections) {
  if (!commonJson[section]) {
    fail(`libs/lang en.json is missing section: ${section}`);
  }
}

const commonTs = fs.readFileSync(path.join(root, 'libs/lang/src/lib/common.en.ts'), 'utf8');
for (const key of ['actions.cancel', 'actions.save', 'states.draft', 'validation.required']) {
  const [section, leaf] = key.split('.');
  const jsonValue = commonJson[section]?.[leaf];
  if (!jsonValue || !commonTs.includes(`'${jsonValue}'`)) {
    fail(`common.en.ts and en.json may be out of sync for ${key}`);
  }
}

assertAssetGlob(path.join(root, 'apps/builder/project.json'), 'builder');
assertAssetGlob(path.join(root, 'apps/deployer/project.json'), 'deployer');

assertPreload(
  path.join(root, 'apps/builder/src/app/app.config.ts'),
  [
    'form-builder/en',
    'page-builder/en',
    'datasources/en',
    'report-builder/en',
    'workflow-builder/en',
  ],
  'builder'
);
assertPreload(path.join(root, 'apps/deployer/src/app/app.config.ts'), ['deployer/en'], 'deployer');

const featureScopes = [
  ['apps/builder/src/assets/i18n/form-builder/en.json', 'form-builder'],
  ['apps/builder/src/assets/i18n/report-builder/en.json', 'report-builder'],
  ['apps/builder/src/assets/i18n/page-builder/en.json', 'page-builder'],
  ['apps/builder/src/assets/i18n/datasources/en.json', 'datasources'],
  ['apps/builder/src/assets/i18n/workflow-builder/en.json', 'workflow-builder'],
  ['apps/deployer/src/assets/i18n/deployer/en.json', 'deployer'],
];

for (const [rel, label] of featureScopes) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    fail(`Missing scope JSON: ${rel}`);
    continue;
  }
  const json = readJson(full);
  if (json.common) {
    const duplicates = Object.entries(json.common).filter(([, value]) => commonValues.has(value));
    if (duplicates.length) {
      fail(
        `${label} en.json still duplicates ${duplicates.length} global common value(s) under common.* — run i18n:sync-${label}`
      );
    }
  }
}

if (failures.length) {
  for (const message of failures) {
    console.log('FAIL:', message);
  }
} else {
  console.log('Global base JSON: all required sections present');
  console.log('common.en.ts ↔ en.json: spot-check passed');
  console.log('Asset globs: builder + deployer serve libs/lang');
  console.log('App preloads: builder + deployer configured');
  console.log('Feature JSON: no duplicated global common values under common.*');
}

process.exit(exitCode);
