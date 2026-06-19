import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';
import { BuilderFieldProperties } from '@builder/features/form-builder/models/form-builder.models';

// Static option arrays for the field inspector UI - no logic, just data.

const configText = FORM_BUILDER_LANG.config;
const fieldText = FORM_BUILDER_LANG.fieldDefaults;
const policyText = FORM_BUILDER_LANG.fieldPolicy;
const optionText = FORM_BUILDER_LANG.inspectorOptions;

export const INSPECTOR_VISIBILITY_OPTIONS = [...configText.visibilityOptions];

export const INSPECTOR_WIDTH_OPTIONS: Array<BuilderFieldProperties['width']> = [
  ...configText.widthOptions
] as Array<BuilderFieldProperties['width']>;

export const INSPECTOR_COUNTRY_CODES = ['+91', '+1', '+44', '+61', '+971'];

export const INSPECTOR_EDITOR_DISPLAY_OPTIONS = [fieldText.displayFormat, optionText.rich, optionText.expanded];

export const INSPECTOR_DECISION_INITIAL_OPTIONS = [
  { label: optionText.none, value: 'false' },
  { label: optionText.enabled, value: 'true' }
];

export const INSPECTOR_DATE_INITIAL_MODE_OPTIONS = [
  { label: optionText.none, value: 'none' },
  { label: optionText.specific, value: 'specific' },
  { label: optionText.current, value: 'current' }
];

export const INSPECTOR_IMAGE_SOURCE_OPTIONS = [
  { label: optionText.uploadOnly, value: 'upload' },
  { label: optionText.captureOnly, value: 'capture' },
  { label: optionText.uploadOrCapture, value: 'either' }
];

export const INSPECTOR_IMAGE_UPLOAD_TYPE_OPTIONS = [
  { label: policyText.singleImage, value: policyText.singleImage },
  { label: policyText.multipleImages, value: policyText.multipleImages }
];

export const INSPECTOR_FILE_UPLOAD_TYPE_OPTIONS = [
  { label: policyText.singleFile, value: policyText.singleFile },
  { label: policyText.multipleFiles, value: policyText.multipleFiles }
];

export const INSPECTOR_URL_TARGET_OPTIONS = [
  { label: fieldText.urlTarget, value: fieldText.urlTarget },
  { label: optionText.sameWindow, value: optionText.sameWindow }
];

export const INSPECTOR_DESCRIPTION_MODE_OPTIONS = [
  { label: optionText.noDescription, value: 'none' },
  { label: optionText.tooltip, value: 'tooltip' },
  { label: optionText.helpText, value: 'helptext' }
];

export const INSPECTOR_FIELD_LAYOUT_OPTIONS = [fieldText.fieldLayout, optionText.twoColumn];

export const INSPECTOR_TOOLBAR_OPTION_KEYS = [
  'undoRedo', 'bold', 'italic', 'underline', 'strikethrough', 'subscript',
  'superscript', 'code', 'paragraphStyle', 'fontOptions', 'alignment',
  'indentation', 'textColor', 'backgroundColor', 'link', 'orderedList',
  'blockquote', 'table', 'codeView'
];

export const INSPECTOR_WEEKDAY_OPTIONS = [
  { label: configText.weekdays.sun, value: 'sun' }, { label: configText.weekdays.mon, value: 'mon' },
  { label: configText.weekdays.tue, value: 'tue' }, { label: configText.weekdays.wed, value: 'wed' },
  { label: configText.weekdays.thu, value: 'thu' }, { label: configText.weekdays.fri, value: 'fri' },
  { label: configText.weekdays.sat, value: 'sat' }
];

export const INSPECTOR_TOOLBAR_DEFAULTS: Record<string, boolean> = {
  undoRedo: true, bold: true, italic: true, underline: true, strikethrough: true,
  subscript: true, superscript: true, code: true, paragraphStyle: true,
  fontOptions: true, alignment: true, indentation: true, textColor: true,
  backgroundColor: true, link: true, orderedList: true, blockquote: true,
  table: true, codeView: true
};

export const INSPECTOR_ICON_MAP: Record<string, string> = {
  person: 'list', mail: 'external-link', home: 'database', call: 'external-link',
  short_text: 'list', subject: 'list', pin: 'list', calendar_month: 'info',
  schedule: 'info', arrow_drop_down_circle: 'chevron-down', radio_button_checked: 'check',
  checklist: 'check', check_box: 'check', toggle_on: 'check', link: 'external-link',
  percent: 'info', calculate: 'database', draw: 'palette', format_size: 'list',
  image: 'palette', payments: 'database', event: 'info', close: 'x',
  delete: 'trash', tune: 'info'
};
