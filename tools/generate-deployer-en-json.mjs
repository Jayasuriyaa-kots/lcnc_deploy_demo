import fs from 'node:fs';
import path from 'node:path';
import {
  loadGlobalCommon,
  normalizeInterpolations,
  pruneGlobalAliasKeys,
  pruneSharedCommon,
} from './lib/i18n-common.mjs';

const root = path.resolve('.');
const srcPath = path.join(root, 'apps/deployer/src/lang/deployer-lang.ts');
const jsonPath = path.join(root, 'apps/deployer/src/assets/i18n/deployer/en.json');

const { FLAT_COMMON_LANG, commonValues, featureCommon } = loadGlobalCommon(root);

const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('export const DEPLOYER_LANG =');
const objectStart = src.indexOf('{', start);
const end = src.indexOf('\n} as const;', objectStart);

if (start < 0 || objectStart < 0 || end < 0) {
  throw new Error(`Could not locate DEPLOYER_LANG object in ${srcPath}`);
}

const body = src.slice(objectStart, end + 2);
const DEPLOYER_LANG = Function(
  'FLAT_COMMON_LANG',
  'featureCommon',
  `"use strict"; return (${body});`
)(FLAT_COMMON_LANG, featureCommon);

const prunedCommon = pruneSharedCommon(DEPLOYER_LANG, commonValues) ?? {};
const json = normalizeInterpolations(pruneGlobalAliasKeys(prunedCommon, commonValues) ?? {});

fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);

console.log('Wrote', jsonPath);
console.log('Top-level keys:', Object.keys(json).join(', '));
