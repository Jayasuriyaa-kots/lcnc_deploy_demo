import { COMMON_LANG, type CommonLang } from './common.en';

/**
 * Flattened common strings for legacy feature files that use `lang.common.cancel`.
 * Spread into `common: { ...FLAT_COMMON_LANG, ...featureOnly }`.
 */
export const FLAT_COMMON_LANG = {
  ...COMMON_LANG.actions,
  ...COMMON_LANG.fields,
  ...COMMON_LANG.dataBinding,
  ...COMMON_LANG.layout,
  ...COMMON_LANG.states,
  ...COMMON_LANG.viewport,
  ...COMMON_LANG.dialogs,
} as const;

export type FlatCommonLang = typeof FLAT_COMMON_LANG;

/**
 * Builds a feature `common` block: global base + feature-only overrides (no duplicates).
 */
export function featureCommon<T extends Record<string, string>>(featureOverrides: T) {
  return {
    ...FLAT_COMMON_LANG,
    ...featureOverrides,
  } as const;
}

/**
 * Merges global common strings with feature-specific lang sections.
 * Feature keys win on conflict; use for gradual migration from duplicated `common` blocks.
 */
export function withCommonLang<T extends Record<string, unknown>>(featureLang: T) {
  return {
    common: COMMON_LANG,
    ...featureLang,
  } as const;
}

/**
 * Maps flat `common.*` keys (legacy feature lang) to global Transloco paths in `libs/lang`.
 * Used by feature I18n services so pruned scope JSON still resolves shared copy at runtime.
 */
export const GLOBAL_COMMON_KEY_ALIASES: Record<string, string> = {
  add: 'actions.add',
  apply: 'actions.apply',
  back: 'actions.back',
  cancel: 'actions.cancel',
  clear: 'actions.clear',
  close: 'actions.close',
  confirm: 'actions.confirm',
  continue: 'actions.continue',
  create: 'actions.create',
  delete: 'actions.delete',
  done: 'actions.done',
  duplicate: 'actions.duplicate',
  edit: 'actions.edit',
  preview: 'actions.preview',
  publish: 'actions.publish',
  remove: 'actions.remove',
  reset: 'actions.reset',
  save: 'actions.save',
  saveChanges: 'actions.saveChanges',
  search: 'actions.search',
  searchEllipsis: 'actions.searchEllipsis',
  settings: 'actions.settings',
  validate: 'actions.validate',
  description: 'fields.description',
  label: 'fields.label',
  datasource: 'fields.datasource',
  query: 'fields.query',
  optional: 'fields.optional',
  required: 'fields.required',
  unique: 'fields.unique',
  none: 'fields.none',
  value: 'fields.value',
  status: 'fields.status',
  name: 'fields.name',
  enterValue: 'fields.enterValue',
  selectDatasource: 'fields.selectDatasource',
  selectField: 'fields.selectField',
  selectOption: 'fields.selectOption',
  queryBinding: 'dataBinding.queryBinding',
  queryBindingPlaceholder: 'dataBinding.queryBindingPlaceholder',
  yes: 'layout.yes',
  no: 'layout.no',
  desktop: 'layout.desktop',
  tablet: 'layout.tablet',
  mobile: 'layout.mobile',
  left: 'layout.left',
  center: 'layout.center',
  right: 'layout.right',
  top: 'layout.top',
  bottom: 'layout.bottom',
  display: 'layout.display',
  style: 'layout.style',
  content: 'layout.content',
  properties: 'layout.properties',
  general: 'layout.general',
  form: 'layout.form',
  report: 'layout.report',
  page: 'layout.page',
  loading: 'states.loading',
  empty: 'states.empty',
  active: 'states.active',
  inactive: 'states.inactive',
  live: 'states.live',
  draft: 'states.draft',
  public: 'states.public',
  desktopRequiredTitle: 'viewport.desktopRequiredTitle',
  desktopRequiredDescription: 'viewport.desktopRequiredDescription',
  deleteTitle: 'dialogs.deleteTitle',
  unsavedChanges: 'dialogs.unsavedChanges',
  emailInvalid: 'validation.emailInvalid',
  fieldRequired: 'validation.fieldRequired',
};

export { COMMON_LANG, type CommonLang };
