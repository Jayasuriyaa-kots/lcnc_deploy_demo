import { BuilderFieldProperties, LibraryField } from '@builder/features/form-builder/models/form-builder.models';
import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';
import { FORM_BUILDER_ALL_FIELDS } from './form-builder-options.config';
import { BuilderDatasourceColumnOption } from './form-builder-datasources.config';

const text = FORM_BUILDER_LANG.fieldDefaults;

// Finds the library definition for a field type or returns a safe fallback.
export function getBuilderFieldDefinition(type: string): LibraryField {
  return FORM_BUILDER_ALL_FIELDS.find((field) => field.type === type) ?? {
    label: type,
    type,
    icon: 'short_text',
    placeholder: text.fallbackPlaceholder
  };
}

// Returns the default display format for date/time/numeric field types.
export function getBuilderDefaultFormat(type: string): string {
  if (type === 'Date Picker' || type === 'Date') {
    return 'DD MMM YYYY';
  }
  if (type === 'Time') {
    return 'HH:mm';
  }
  if (type === 'Date-Time') {
    return 'DD MMM YYYY HH:mm';
  }
  if (type === 'Percent') {
    return '0%';
  }
  if (type === 'Currency') {
    return '#,##0.00';
  }
  return 'Default';
}

// Returns default accepted file MIME/extensions for upload-like fields.
export function getBuilderDefaultAcceptedTypes(type: string): string {
  if (type === 'Image') {
    return 'image/*';
  }
  if (type === 'Audio') {
    return 'audio/*';
  }
  if (type === 'Video') {
    return 'video/*';
  }
  return '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png';
}

// Suggests the best form field type from datasource column metadata.
export function suggestFieldTypeForColumn(column: Pick<BuilderDatasourceColumnOption, 'id' | 'label' | 'dataType' | 'lookup' | 'options'>): string {
  const key = `${column.id} ${column.label}`.toLowerCase();
  const tokens = key.split(/[^a-z0-9]+/).filter(Boolean);
  const normalizedType = normalizeColumnType(column.dataType);
  const hasToken = (...values: string[]) => values.some((value) => tokens.includes(value));
  const includesAny = (...values: string[]) => values.some((value) => key.includes(value));

  if (/(^|[_\s-])(email|mail)([_\s-]|$)/.test(key)) {
    return 'Email';
  }
  if (/(^|[_\s-])(phone|mobile|telephone|tel|contact_no|contact_number)([_\s-]|$)/.test(key)) {
    return 'Phone';
  }
  if (
    includesAny('full_name', 'employee_name', 'customer_name', 'applicant_name', 'person_name', 'contact_name') ||
    (hasToken('name') && (hasToken('employee', 'customer', 'applicant', 'person', 'contact', 'full', 'first', 'last')))
  ) {
    return 'Name';
  }
  if (
    includesAny('full_address', 'home_address', 'mailing_address', 'residential_address', 'office_address') ||
    (hasToken('address') && (hasToken('home', 'mailing', 'residential', 'office', 'street', 'postal', 'zip', 'country')))
  ) {
    return 'Address';
  }
  if (column.lookup || (column.options?.length ?? 0) > 0) {
    return 'Dropdown';
  }
  if (normalizedType === 'boolean' || hasToken('is', 'has') || includesAny('active', 'approved', 'enabled', 'verified', 'half_day')) {
    return 'Decision Box';
  }
  if (normalizedType === 'decimal') {
    if (includesAny('amount', 'salary', 'price', 'cost', 'fee', 'rate', 'total', 'balance')) {
      return 'Currency';
    }
    return 'Decimal';
  }

  if (normalizedType === 'longtext') {
    return 'Long Text';
  }
  if (normalizedType === 'text' && /(description|remarks|notes|comment|reason|summary)/.test(key)) {
    return 'Long Text';
  }
  if (normalizedType === 'integer') {
    return 'Number';
  }
  if (normalizedType === 'date') {
    return 'Date Picker';
  }
  if (normalizedType === 'datetime') {
    return 'Date-Time';
  }
  if (normalizedType === 'time') {
    return 'Time';
  }
  if (normalizedType === 'text' && hasToken('address')) {
    return 'Long Text';
  }
  return 'Short Text';
}

// Builds the full default property object for a new field.
export function createBuilderFieldProperties(config: {
  fieldType: string;
  linkName: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  unique?: boolean;
  lookup?: boolean;
  options?: string[];
}): BuilderFieldProperties {
  const fieldDefinition = getBuilderFieldDefinition(config.fieldType);
  const placeholder = config.placeholder || fieldDefinition.placeholder || text.generatedPlaceholder(config.label);
  const options = config.options?.length ? [...config.options] : [text.option1, text.option2];

  return {
    fieldLinkName: config.linkName,
    placeholder,
    required: !!config.required,
    mandatory: !!config.required,
    unique: !!config.unique,
    noDuplicateValues: !!config.unique,
    lookup: !!config.lookup,
    width: text.width,
    fieldSize: text.width,
    showFieldTo: text.showFieldTo,
    defaultValue: '',
    initialValue: '',
    helpText: '',
    descriptionText: '',
    descriptionMode: 'none',
    descriptionShow: 'none',
    fieldLayout: text.fieldLayout,
    options,
    choices: options.map((option) => ({ label: option, value: option })),
    minValue: '',
    maxValue: '',
    maxDigits: 10,
    format: getBuilderDefaultFormat(config.fieldType),
    characterMaximum: 120,
    rows: 4,
    alphabeticalOrder: false,
    allowOtherChoice: false,
    containsPII: false,
    encryptData: false,
    containsEPHI: false,
    phoneCountryCode: '+91',
    defaultCountryCode: '+91',
    countryCodeOptions: '+91,+1,+44,+61,+971',
    timeShowSeconds: false,
    dateTimeShowSeconds: false,
    allowedHoursFrom: '09:00',
    allowedHoursTo: '18:00',
    allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    allowedDaysPreset: text.allowedDaysPreset,
    dateTimeAllowedHoursFrom: '',
    dateTimeAllowedHoursTo: '',
    dateTimeAllowedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    dateTimeAllowedDaysPreset: text.allowedDaysPreset,
    dateTimeMinutesInterval: FORM_BUILDER_LANG.inspector.default,
    heightPx: 180,
    displayFormat: text.displayFormat,
    richTextHeightPx: 180,
    richTextToolbar: {
      undoRedo: true,
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      subscript: true,
      superscript: true,
      code: true,
      paragraphStyle: true,
      fontOptions: true,
      alignment: true,
      indentation: true,
      textColor: true,
      backgroundColor: true,
      link: true,
      orderedList: true,
      blockquote: true,
      table: true,
      codeView: true
    },
    acceptedFileTypes: getBuilderDefaultAcceptedTypes(config.fieldType),
    fileUploadTypes: getBuilderDefaultAcceptedTypes(config.fieldType),
    maxFileSizeMb: '10',
    mediaSource: 'either',
    allowMultipleFiles: false,
    maxFileCount: 5,
    fileUploadType: text.fileUploadType,
    imageUploadType: text.imageUploadType,
    videoMaxDurationSec: '120',
    audioMaxDurationSec: '180',
    audioDurationMins: 1,
    audioDurationSecs: 0,
    videoDurationMins: 0,
    videoDurationSecs: 30,
    decisionTrueLabel: text.yes,
    decisionFalseLabel: text.no,
    decisionBoxInitialValue: false,
    userInputQrCode: false,
    userInputBarcode: false,
    namePrefixEnabled: false,
    nameLastEnabled: true,
    nameSuffixEnabled: false,
    displayFieldsName: { prefix: false, firstName: true, lastName: true, suffix: false },
    prefixChoices: [...text.namePrefixes],
    suffixChoices: [...text.nameSuffixes],
    addressCaptureGeo: false,
    addressAdjustOnMap: false,
    addressLine1Enabled: true,
    addressLine2Enabled: true,
    cityEnabled: true,
    stateEnabled: true,
    postalCodeEnabled: true,
    countryEnabled: true,
    displayFieldsAddress: { line1: true, line2: true, city: true, state: true, postalCode: true, country: true },
    addressLine1Label: text.addressLine1,
    addressLine2Label: text.addressLine2,
    cityLabel: text.city,
    stateLabel: text.state,
    postalCodeLabel: text.postalCode,
    countryLabel: text.country,
    currencyType: text.currencyType,
    decimalPoints: 2,
    urlTarget: text.urlTarget,
    urlOptionLinkName: false,
    urlOptionTitle: false
  };
}

// Normalizes database-specific data types into broad builder categories.
function normalizeColumnType(dataType: string): string {
  const normalized = (dataType || '').trim().toLowerCase();
  if (['varchar', 'char', 'character varying'].includes(normalized)) {
    return 'text';
  }
  if (['text', 'string'].includes(normalized)) {
    return 'text';
  }
  if (['longtext', 'mediumtext', 'json', 'jsonb'].includes(normalized)) {
    return 'longtext';
  }
  if (['int', 'integer', 'smallint', 'bigint', 'number'].includes(normalized)) {
    return 'integer';
  }
  if (['decimal', 'numeric', 'float', 'double'].includes(normalized)) {
    return 'decimal';
  }
  if (['bool', 'boolean'].includes(normalized)) {
    return 'boolean';
  }
  if (normalized === 'date') {
    return 'date';
  }
  if (['datetime', 'timestamp', 'timestamptz'].includes(normalized)) {
    return 'datetime';
  }
  if (normalized === 'time') {
    return 'time';
  }
  return normalized;
}
