export interface BuilderFieldProperties {
  fieldLinkName: string;
  placeholder: string;
  required: boolean;
  mandatory?: boolean;
  unique: boolean;
  noDuplicateValues?: boolean;
  queryRefId?: string;
  lookup: boolean;
  width: 'Small' | 'Medium' | 'Large';
  fieldSize?: 'Small' | 'Medium' | 'Large';
  showFieldTo: string;
  defaultValue: string;
  initialValue?: string;
  helpText: string;
  descriptionText: string;
  descriptionMode: 'none' | 'tooltip' | 'helptext';
  descriptionShow?: 'none' | 'tooltip' | 'helptext';
  fieldLayout: 'One Column' | 'Two Column';
  options: string[];
  choices?: Array<{ label: string; value?: string }> | string[];
  minValue: string;
  maxValue: string;
  maxDigits: number;
  format: string;
  displayFormat: string;
  characterMaximum: number;
  rows: number;
  alphabeticalOrder: boolean;
  allowOtherChoice: boolean;
  containsPII: boolean;
  encryptData: boolean;
  containsEPHI?: boolean;
  phoneCountryCode: string;
  defaultCountryCode?: string;
  countryCodeOptions: string;
  timeShowSeconds: boolean;
  dateTimeShowSeconds?: boolean;
  allowedHoursFrom: string;
  allowedHoursTo: string;
  allowedDays: string[];
  allowedDaysPreset?: 'all' | 'weekdays' | 'weekends' | 'custom';
  dateTimeAllowedHoursFrom?: string;
  dateTimeAllowedHoursTo?: string;
  dateTimeAllowedDays?: string[];
  dateTimeAllowedDaysPreset?: 'all' | 'weekdays' | 'weekends' | 'custom';
  dateTimeMinutesInterval?: string;
  heightPx: number;
  richTextHeightPx?: number;
  richTextToolbar?: Record<string, boolean>;
  acceptedFileTypes: string;
  fileUploadTypes?: string;
  maxFileSizeMb: string;
  mediaSource: 'upload' | 'capture' | 'either';
  allowMultipleFiles: boolean;
  maxFileCount: number;
  fileUploadType?: 'Single file' | 'Multiple files';
  imageUploadType?: 'Single image' | 'Multiple images';
  videoMaxDurationSec: string;
  audioMaxDurationSec: string;
  audioDurationMins?: number;
  audioDurationSecs?: number;
  videoDurationMins?: number;
  videoDurationSecs?: number;
  decisionTrueLabel: string;
  decisionFalseLabel: string;
  decisionBoxInitialValue?: boolean;
  userInputQrCode: boolean;
  userInputBarcode: boolean;
  namePrefixEnabled: boolean;
  nameLastEnabled: boolean;
  nameSuffixEnabled: boolean;
  displayFieldsName?: { prefix?: boolean; firstName?: boolean; lastName?: boolean; suffix?: boolean };
  prefixChoices: string[];
  suffixChoices: string[];
  addressCaptureGeo: boolean;
  addressAdjustOnMap: boolean;
  addressLine1Enabled: boolean;
  addressLine2Enabled: boolean;
  cityEnabled: boolean;
  stateEnabled: boolean;
  postalCodeEnabled: boolean;
  countryEnabled: boolean;
  displayFieldsAddress?: { line1?: boolean; line2?: boolean; city?: boolean; state?: boolean; postalCode?: boolean; country?: boolean };
  addressLine1Label: string;
  addressLine2Label: string;
  cityLabel: string;
  stateLabel: string;
  postalCodeLabel: string;
  countryLabel: string;
  currencyType?: string;
  decimalPoints?: number;
  urlTarget?: 'New Window' | 'Same Window';
  urlOptionLinkName?: boolean;
  urlOptionTitle?: boolean;
}

export interface BuilderField {
  id: string;
  label: string;
  type: string;
  icon: string;
  binding: string;
  properties: BuilderFieldProperties;
}

export interface LibraryField {
  label: string;
  type: string;
  icon: string;
  placeholder: string;
}

export interface BuilderAction {
  id: string;
  name: string;
  style: 'primary' | 'secondary' | 'ghost';
  actionType: 'submit' | 'save-draft' | 'reset' | 'cancel' | 'custom';
}
