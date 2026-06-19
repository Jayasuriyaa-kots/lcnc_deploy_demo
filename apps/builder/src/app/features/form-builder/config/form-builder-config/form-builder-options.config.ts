import { BuilderAction, BuilderFieldProperties, LibraryField } from '@builder/features/form-builder/models/form-builder.models';
import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';

export interface BuilderWeekdayOption { label: string; value: string; }

const text = FORM_BUILDER_LANG.config;
const libraryText = text.libraryFields;

export const FORM_BUILDER_VISIBILITY_OPTIONS = [...text.visibilityOptions] as const;

export const FORM_BUILDER_WIDTH_OPTIONS: Array<BuilderFieldProperties['width']> = [
  ...text.widthOptions
] as Array<BuilderFieldProperties['width']>;

export const FORM_BUILDER_COUNTRY_CODES = ['+91', '+1', '+44', '+61', '+971'] as const;

export const FORM_BUILDER_WEEKDAY_OPTIONS: BuilderWeekdayOption[] = [
  { label: text.weekdays.sun, value: 'sun' },
  { label: text.weekdays.mon, value: 'mon' },
  { label: text.weekdays.tue, value: 'tue' },
  { label: text.weekdays.wed, value: 'wed' },
  { label: text.weekdays.thu, value: 'thu' },
  { label: text.weekdays.fri, value: 'fri' },
  { label: text.weekdays.sat, value: 'sat' }
];

export const FORM_BUILDER_BASIC_FIELDS: LibraryField[] = [
  { label: libraryText.name.label, type: 'Name', icon: 'person', placeholder: libraryText.name.placeholder },
  { label: libraryText.email.label, type: 'Email', icon: 'mail', placeholder: libraryText.email.placeholder },
  { label: libraryText.address.label, type: 'Address', icon: 'home', placeholder: libraryText.address.placeholder },
  { label: libraryText.phone.label, type: 'Phone', icon: 'call', placeholder: libraryText.phone.placeholder },
  { label: libraryText.shortText.label, type: 'Short Text', icon: 'short_text', placeholder: libraryText.shortText.placeholder },
  { label: libraryText.longText.label, type: 'Long Text', icon: 'subject', placeholder: libraryText.longText.placeholder },
  { label: libraryText.number.label, type: 'Number', icon: 'pin', placeholder: libraryText.number.placeholder },
  { label: libraryText.date.label, type: 'Date Picker', icon: 'calendar_month', placeholder: libraryText.date.placeholder },
  { label: libraryText.time.label, type: 'Time', icon: 'schedule', placeholder: libraryText.time.placeholder },
  { label: libraryText.dropdown.label, type: 'Dropdown', icon: 'arrow_drop_down_circle', placeholder: libraryText.dropdown.placeholder },
  { label: libraryText.radio.label, type: 'Radio', icon: 'radio_button_checked', placeholder: libraryText.radio.placeholder },
  { label: libraryText.multiSelect.label, type: 'Multi Select', icon: 'checklist', placeholder: libraryText.multiSelect.placeholder },
  { label: libraryText.checkbox.label, type: 'Checkbox', icon: 'check_box', placeholder: libraryText.checkbox.placeholder }
];

export const FORM_BUILDER_ADVANCED_FIELDS: LibraryField[] = [
  { label: libraryText.decisionBox.label, type: 'Decision Box', icon: 'toggle_on', placeholder: libraryText.decisionBox.placeholder },
  { label: libraryText.url.label, type: 'Url', icon: 'link', placeholder: libraryText.url.placeholder },
  { label: libraryText.percent.label, type: 'Percent', icon: 'percent', placeholder: libraryText.percent.placeholder },
  { label: libraryText.decimal.label, type: 'Decimal', icon: 'calculate', placeholder: libraryText.decimal.placeholder },
  { label: libraryText.signature.label, type: 'Signature', icon: 'draw', placeholder: libraryText.signature.placeholder },
  { label: libraryText.audio.label, type: 'Audio', icon: 'mic', placeholder: libraryText.audio.placeholder },
  { label: libraryText.richText.label, type: 'Rich Text', icon: 'format_size', placeholder: libraryText.richText.placeholder },
  { label: libraryText.image.label, type: 'Image', icon: 'image', placeholder: libraryText.image.placeholder },
  { label: libraryText.currency.label, type: 'Currency', icon: 'payments', placeholder: libraryText.currency.placeholder },
  { label: libraryText.dateTime.label, type: 'Date-Time', icon: 'event', placeholder: libraryText.dateTime.placeholder },
  { label: libraryText.fileUpload.label, type: 'File Upload', icon: 'upload_file', placeholder: libraryText.fileUpload.placeholder },
  { label: libraryText.video.label, type: 'Video', icon: 'videocam', placeholder: libraryText.video.placeholder }
];

export const FORM_BUILDER_ALL_FIELDS: LibraryField[] = [
  ...FORM_BUILDER_BASIC_FIELDS,
  ...FORM_BUILDER_ADVANCED_FIELDS
];


export const FORM_BUILDER_DEFAULT_ACTIONS: BuilderAction[] = [
  { id: 'a1', name: text.defaultActions.submit, style: 'primary', actionType: 'submit' },
  { id: 'a2', name: text.defaultActions.saveDraft, style: 'secondary', actionType: 'save-draft' },
  { id: 'a3', name: text.defaultActions.clear, style: 'ghost', actionType: 'reset' },
  { id: 'a4', name: text.defaultActions.cancel, style: 'ghost', actionType: 'cancel' }
];
