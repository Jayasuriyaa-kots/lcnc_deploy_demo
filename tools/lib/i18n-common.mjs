import fs from 'node:fs';
import path from 'node:path';

export function loadGlobalCommon(root) {
  const commonPath = path.join(root, 'libs/lang/src/lib/i18n/en.json');
  const commonJson = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
  const FLAT_COMMON_LANG = {
    ...commonJson.actions,
    ...commonJson.fields,
    ...commonJson.dataBinding,
    ...commonJson.layout,
    ...commonJson.states,
    ...commonJson.viewport,
    ...commonJson.dialogs,
  };
  const commonValues = new Set(Object.values(FLAT_COMMON_LANG));
  const featureCommon = (overrides) => ({ ...FLAT_COMMON_LANG, ...overrides });
  return { commonJson, FLAT_COMMON_LANG, commonValues, featureCommon };
}

export function pruneSharedCommon(value, commonValues, topLevelSection = '') {
  if (typeof value === 'string') {
    return topLevelSection === 'common' && commonValues.has(value) ? undefined : value;
  }

  if (Array.isArray(value)) {
    return value
      .map((child) => pruneSharedCommon(child, commonValues, topLevelSection))
      .filter((child) => child !== undefined);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([childKey, child]) => [
        childKey,
        pruneSharedCommon(child, commonValues, topLevelSection || childKey),
      ])
      .filter(([, child]) => child !== undefined);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return value;
}

export const GLOBAL_ALIAS_KEYS = new Set([
  'add',
  'apply',
  'back',
  'cancel',
  'clear',
  'close',
  'confirm',
  'continue',
  'create',
  'delete',
  'done',
  'duplicate',
  'edit',
  'preview',
  'publish',
  'remove',
  'reset',
  'save',
  'saveChanges',
  'search',
  'searchEllipsis',
  'settings',
  'validate',
  'description',
  'label',
  'datasource',
  'query',
  'optional',
  'required',
  'unique',
  'none',
  'value',
  'status',
  'name',
  'enterValue',
  'selectDatasource',
  'selectField',
  'selectOption',
  'desktop',
  'tablet',
  'mobile',
  'form',
  'report',
  'page',
  'yes',
  'no',
  'loading',
  'empty',
  'active',
  'inactive',
  'live',
  'draft',
  'public',
  'emailInvalid',
  'fieldRequired',
]);

export function pruneGlobalAliasKeys(value, commonValues) {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((child) => pruneGlobalAliasKeys(child, commonValues));
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([childKey, child]) => {
        if (
          GLOBAL_ALIAS_KEYS.has(childKey) &&
          typeof child === 'string' &&
          commonValues.has(child)
        ) {
          return [childKey, undefined];
        }
        return [childKey, pruneGlobalAliasKeys(child, commonValues)];
      })
      .filter(([, child]) => child !== undefined);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return value;
}

export function normalizeInterpolations(value) {
  if (typeof value === 'string') {
    // Convert single-brace `{name}` placeholders to Transloco's `{{name}}`.
    // Idempotent: a placeholder that is already `{{name}}` is left untouched
    // (the lookbehind/lookahead skip braces that are part of a double brace),
    // so re-running on already-normalized strings can't produce `{{{name}}}`.
    return value.replace(/(?<!\{)\{([A-Za-z0-9_]+)\}(?!\})/g, '{{$1}}');
  }
  if (Array.isArray(value)) {
    return value.map(normalizeInterpolations);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, normalizeInterpolations(child)])
    );
  }
  return value;
}
