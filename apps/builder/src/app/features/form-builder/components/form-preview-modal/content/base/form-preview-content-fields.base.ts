import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { Directive, HostListener } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormPreviewContentStateBase } from './form-preview-content-state.base';

@Directive()
export abstract class FormPreviewContentFieldsBase extends FormPreviewContentStateBase {
  [key: string]: FormPreviewMixinIndex;

// Reads configured choice labels from either choices or legacy options.
  getChoiceOptions(field: BuilderField): string[] {
    const rawChoices = field.properties.choices;
    if (Array.isArray(rawChoices) && rawChoices.length > 0) {
      return rawChoices
        .map((choice) => typeof choice === 'string' ? choice : String(choice?.label ?? choice?.value ?? ''))
        .filter(Boolean);
    }
    return [...(field.properties.options ?? [])];
  }

  // Returns display choices, applying sorting and optional Other choice.
  getChoices(field: BuilderField): string[] {
    const base = this.getChoiceOptions(field);
    const sorted = field.properties.alphabeticalOrder ? [...base].sort((a, b) => a.localeCompare(b)) : base;
    return field.properties.allowOtherChoice ? [...sorted, this.t('preview.other')] : sorted;
  }

  // Converts string choices into Qo select options.
  getSelectOptions(values: readonly string[], includeEmptyLabel?: string): SelectOption[] {
    const options = values.map((value) => ({ label: value, value }));
    return includeEmptyLabel ? [{ label: includeEmptyLabel, value: '' }, ...options] : options;
  }

  // Builds prefix/suffix select options for name fields.
  getNameSelectOptions(field: BuilderField, part: 'prefix' | 'suffix'): SelectOption[] {
    const values = part === 'prefix' ? field.properties.prefixChoices : field.properties.suffixChoices;
    return this.getSelectOptions(values, this.t('preview.select'));
  }

  // Builds dropdown options with safe defaults when no choices exist.
  getFieldSelectOptions(field: BuilderField): SelectOption[] {
    const choices = this.getChoices(field);
    return this.getSelectOptions(choices.length ? choices : [this.t('fieldDefaults.option1'), this.t('fieldDefaults.option2')]);
  }

  // Builds phone country-code select options from field settings.
  getPhoneCountrySelectOptions(field: BuilderField): SelectOption[] {
    return this.getSelectOptions(this.getPhoneCountryOptions(field));
  }

  // Maps Material icon names to the shared Qo icon set for preview.
  getPreviewIconName(icon: string): string {
    const iconMap: Record<string, string> = {
      close: 'x',
      check_circle: 'check',
      draft: 'list',
      help: 'info',
      info: 'info',
      public: 'database',
      qr_code_scanner: 'search',
      expand_more: 'chevron-down',
      upload_file: 'external-link',
      delete: 'trash',
      error: 'info',
      warning: 'info',
      photo_camera: 'palette',
      mic: 'info',
      videocam: 'info'
    };

    return iconMap[icon] ?? 'info';
  }

// Returns label-as-placeholder when the form uses placeholder-only layout.
  getPlaceholder(field: BuilderField): string {
    if (this.settings.labelPlacement === 'Placeholder Only') return field.label;
    return field.properties.placeholder || '';
  }
  // Decides whether the visible field label should render.
  showLabel(field: BuilderField): boolean {
    return this.settings.labelPlacement !== 'Placeholder Only';
  }
  // Checks whether the current form uses left-aligned labels.
  isLabelLeft(): boolean {
    return this.settings.labelPlacement === 'Left';
  }
  // Checks whether the field itself requests a two-column layout.
  isFieldLayoutTwoColumn(field: BuilderField): boolean {
    return (field.properties.fieldLayout ?? 'One Column') === 'Two Column';
  }
  // Treats dropdown-like datasource fields as dropdowns even when metadata varies.
  isDropdownLike(field: BuilderField): boolean {
    if (this.isMultiSelectField(field)) {
      return false;
    }
    if (field.type === 'Dropdown') {
      return true;
    }
    const type = this.normalizeFieldType(field);
    const label = this.normalizeFieldLabel(field);
    const hasChoiceOptions = this.getChoiceOptions(field).length > 0;
    return ['dropdown', 'dropdownlist', 'dropdownfield', 'picklist', 'select'].includes(type) ||
      field.properties.lookup === true ||
      type === 'lookup' ||
      ['dropdown', 'dropdownlist', 'picklist', 'select'].includes(label) ||
      (hasChoiceOptions && ['choice', 'choices'].includes(label));
  }
  isTextareaLike(field: BuilderField): boolean {
    return field.type === 'Long Text' || field.type === 'Multi Line';
  }
  isCheckbox(field: BuilderField): boolean {
    return field.type === 'Checkbox';
  }
  isDecisionBox(field: BuilderField): boolean {
    return field.type === 'Decision Box';
  }
  isFileUpload(field: BuilderField): boolean {
    return ['File Upload', 'Image', 'Audio', 'Video'].includes(field.type);
  }
  isNameField(field: BuilderField): boolean {
    return field.type === 'Name';
  }
  isAddressField(field: BuilderField): boolean {
    return field.type === 'Address';
  }
  isPhoneField(field: BuilderField): boolean {
    return field.type === 'Phone';
  }
  isNumericField(field: BuilderField): boolean {
    return ['Number', 'Decimal', 'Currency', 'Percent'].includes(field.type);
  }
  isChoiceField(field: BuilderField): boolean {
    return this.isDropdownLike(field) || ['Radio', 'Multi Select', 'Checkbox'].includes(field.type);
  }
  isRadioField(field: BuilderField): boolean {
    return field.type === 'Radio';
  }
  isMultiSelectField(field: BuilderField): boolean {
    const type = this.normalizeFieldType(field);
    const label = this.normalizeFieldLabel(field);
    return field.type === 'Multi Select' ||
      ['multiselect', 'multiplechoice', 'multichoice'].includes(type) ||
      ['multiselect', 'multiplechoice', 'multichoice'].includes(label);
  }
  isDatePickerField(field: BuilderField): boolean {
    return field.type === 'Date Picker' || field.type === 'Date' || ['datepicker', 'date'].includes(this.normalizeFieldType(field));
  }
  isTimeField(field: BuilderField): boolean {
    return field.type === 'Time' || this.normalizeFieldType(field) === 'time';
  }
  isDateTimeField(field: BuilderField): boolean {
    return field.type === 'Date-Time' || ['datetime', 'datetime-local', 'datetimelocal'].includes(this.normalizeFieldType(field));
  }
  isRichTextField(field: BuilderField): boolean {
    return field.type === 'Rich Text';
  }
  isSignatureField(field: BuilderField): boolean {
    return field.type === 'Signature';
  }
  isImageField(field: BuilderField): boolean {
    return this.normalizeFieldType(field) === 'image';
  }
  isAudioField(field: BuilderField): boolean {
    return this.normalizeFieldType(field) === 'audio';
  }
  isVideoField(field: BuilderField): boolean {
    return this.normalizeFieldType(field) === 'video';
  }
  isGenericFileField(field: BuilderField): boolean {
    return ['fileupload', 'file-upload', 'file_upload'].includes(this.normalizeFieldType(field));
  }
  // Image fields use imageUploadType; other upload fields use fileUploadType.
  allowsMultipleFiles(field: BuilderField): boolean {
    if (field.type === 'Image') {
      return field.properties.imageUploadType === 'Multiple images' || field.properties.allowMultipleFiles;
    }
    return field.properties.fileUploadType === 'Multiple files' || field.properties.allowMultipleFiles;
  }
  canCaptureImage(field: BuilderField): boolean {
    return field.properties.mediaSource !== 'upload';
  }
  canUploadImage(field: BuilderField): boolean {
    return field.properties.mediaSource !== 'capture';
  }
  canCaptureAudio(field: BuilderField): boolean {
    return field.properties.mediaSource !== 'upload';
  }
  canCaptureVideo(field: BuilderField): boolean {
    return field.properties.mediaSource !== 'upload';
  }
  canUploadAudio(field: BuilderField): boolean {
    return field.properties.mediaSource !== 'capture';
  }
  canUploadVideo(field: BuilderField): boolean {
    return field.properties.mediaSource !== 'capture';
  }
  // Chooses the native input type for simple preview controls.
  getInputType(field: BuilderField): string {
    switch (field.type) {
      case 'Email': return 'email';
      case 'Phone': return 'tel';
      case 'Date Picker': return 'date';
      case 'Date': return 'date';
      case 'Time': return 'time';
      case 'Date-Time': return 'datetime-local';
      case 'Url': return 'url';
      default: return 'text';
    }
  }
  // Detects fields that need specialized preview controls instead of plain input.
  isSpecialType(field: BuilderField): boolean {
    return this.isCheckbox(field) || this.isDecisionBox(field) ||
           this.isChoiceField(field) || this.isTextareaLike(field) || this.isFileUpload(field) ||
           this.isNameField(field) || this.isAddressField(field) || this.isRichTextField(field) ||
           this.isSignatureField(field);
  }
  // Builds CSS classes for width, borders, label placement, and invalid state.
  getFieldClass(field: BuilderField): string {
    const classes = ['preview-field'];
    if (this.isLabelLeft() || this.isFieldLayoutTwoColumn(field)) classes.push('preview-field--label-left');
    if (this.settings.showSectionBorders) classes.push('preview-field--bordered');
    classes.push(this.getWidthClass(field));
    classes.push(this.shouldShowInvalidState(field) ? 'preview-field--invalid' : 'preview-field--valid');
    return classes.join(' ');
  }
  // Maps configured field width to preview CSS class.
  getWidthClass(field: BuilderField): string {
    const size = field.properties.fieldSize ?? field.properties.width;
    if (size === 'Small') return 'preview-field--small';
    if (size === 'Large') return 'preview-field--large';
    return 'preview-field--medium';
  }
  getDescriptionMode(field: BuilderField): 'none' | 'tooltip' | 'helptext' {
    return field.properties.descriptionShow ?? field.properties.descriptionMode ?? 'none';
  }

  hasHelpText(field: BuilderField): boolean {
    return this.getDescriptionMode(field) === 'helptext' && !!field.properties.descriptionText;
  }

  hasTooltip(field: BuilderField): boolean {
    return this.getDescriptionMode(field) === 'tooltip' && !!field.properties.descriptionText;
  }

getValue(fieldId: string): unknown {
    return this.values[fieldId];
  }

  setValue(fieldId: string, value: unknown, field?: BuilderField): void {
    const targetField = field ?? this.fields.find((item) => item.id === fieldId);
    this.draftSaved = false;
    let normalized = targetField ? this.normalizeValue(targetField, value) : value;
    if (targetField?.type === 'Phone') {
      normalized = this.sanitizePhoneValue(normalized);
    }
    if (targetField && this.isNumericField(targetField)) {
      normalized = this.sanitizeNumericValue(targetField, normalized);
    }
    this.values = { ...this.values, [fieldId]: normalized };
    this.previewFacade.setValue(fieldId, normalized);
    this.touchedFields = { ...this.touchedFields, [fieldId]: true };
    if (targetField) {
      this.validateField(targetField);
    }
    this.refreshPreviewView();
  }

  onPhoneInput(event: Event, field: BuilderField): void {
    const input = event.target as HTMLInputElement;
    this.setValue(field.id, input.value, field);
    input.value = this.getPhoneDisplayValue(field);
  }

  onNumericInput(event: Event, field: BuilderField): void {
    const input = event.target as HTMLInputElement;
    this.setValue(field.id, input.value, field);
    input.value = this.getControlValue(field);
  }

  onFieldFocus(fieldId: string): void {
    this.focusedFields = { ...this.focusedFields, [fieldId]: true };
  }

  onFieldBlur(fieldId: string): void {
    if (!this.focusedFields[fieldId]) {
      return;
    }
    const next = { ...this.focusedFields };
    delete next[fieldId];
    this.focusedFields = next;
  }

  onEnterKey(event: KeyboardEvent): void {
    const current = event.target as HTMLElement | null;
    const root = this.previewRoot?.nativeElement;
    if (!current || !root) {
      return;
    }
    const focusables = Array.from(root.querySelectorAll<HTMLElement>('[data-preview-focus="true"]'))
      .filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
    const index = focusables.indexOf(current);
    if (index === -1) {
      return;
    }
    event.preventDefault();
    const next = focusables[index + 1];
    if (next) {
      next.focus();
    }
  }

  canSubmit(): boolean {
    return this.fields.every((field) => {
      this.validateField(field);
      return !this.isFieldInvalid(field);
    });
  }

  isFieldInvalid(field: BuilderField): boolean {
    return !!this.getValidationMessage(field);
  }

  showFieldError(field: BuilderField): boolean {
    return this.submitAttempted || (!!this.touchedFields[field.id] && !!this.liveErrors[field.id]);
  }

  getFieldError(field: BuilderField): string {
    if (!this.showFieldError(field)) {
      return '';
    }
    return this.getValidationMessage(field) ?? '';
  }

  getFieldMetaNotes(field: BuilderField): string[] {
    const notes: string[] = [];
    if (field.properties.helpText) {
      notes.push(field.properties.helpText);
    }
    if (field.properties.showFieldTo && field.properties.showFieldTo !== 'Everyone') {
      notes.push(this.t('preview.metaNotes.visibleTo', { audience: field.properties.showFieldTo }));
    }
    if (field.properties.lookup) {
      notes.push(this.t('preview.metaNotes.lookupEnabled'));
    }
    if (field.properties.noDuplicateValues || field.properties.unique) {
      notes.push(this.t('preview.metaNotes.duplicateRestricted'));
    }
    if (field.properties.containsPII) {
      notes.push(this.t('preview.metaNotes.containsPii'));
    }
    if (field.properties.encryptData) {
      notes.push(this.t('preview.metaNotes.encryptedData'));
    }
    if (field.properties.containsEPHI) {
      notes.push(this.t('preview.metaNotes.containsEphi'));
    }
    if (field.type === 'Url' && field.properties.urlTarget) {
      notes.push(this.t('preview.metaNotes.linkOpensIn', { target: String(field.properties.urlTarget).toLowerCase() }));
    }
    return notes;
  }

  supportsCharacterLimit(field: BuilderField): boolean {
    return ['Name', 'Address', 'Email', 'Phone', 'Short Text', 'Single Line', 'Long Text', 'Multi Line', 'Url', 'Rich Text'].includes(field.type);
  }

  protected normalizeFieldType(field: BuilderField): string {
    return String(field.type ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  }

  protected normalizeFieldLabel(field: BuilderField): string {
    return String(field.label ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  }

toggleChoiceDropdown(fieldId: string): void {
    this.choiceDropdownOpen = {
      ...this.choiceDropdownOpen,
      [fieldId]: !this.choiceDropdownOpen[fieldId]
    };
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  closeChoiceDropdownsOnOutsideClick(event: MouseEvent): void {
    if (!Object.keys(this.choiceDropdownOpen).length) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('.preview-select, .preview-multiselect')) {
      return;
    }

    this.choiceDropdownOpen = {};
  }

  closeChoiceDropdown(fieldId: string): void {
    if (!this.choiceDropdownOpen[fieldId]) {
      return;
    }
    const next = { ...this.choiceDropdownOpen };
    delete next[fieldId];
    this.choiceDropdownOpen = next;
  }

  isChoiceDropdownOpen(fieldId: string): boolean {
    return !!this.choiceDropdownOpen[fieldId];
  }

getNamePart(fieldId: string, key: 'prefix' | 'firstName' | 'lastName' | 'suffix'): string {
    const value = this.values[fieldId] as Record<string, string> | undefined;
    return value?.[key] ?? '';
  }

  setNamePart(fieldId: string, key: 'prefix' | 'firstName' | 'lastName' | 'suffix', value: string): void {
    const current = (this.values[fieldId] as Record<string, string> | undefined) ?? {
      prefix: '',
      firstName: '',
      lastName: '',
      suffix: ''
    };
    const field = this.fields.find((item) => item.id === fieldId);
    const nextValue = typeof field?.properties.characterMaximum === 'number' && field.properties.characterMaximum > 0
      ? value.slice(0, field.properties.characterMaximum)
      : value;
    this.setValue(fieldId, { ...current, [key]: nextValue }, field);
  }

  showNamePart(field: BuilderField, key: 'prefix' | 'firstName' | 'lastName' | 'suffix'): boolean {
    if (key === 'firstName') return true;
    const display = field.properties.displayFieldsName;
    if (key === 'prefix') return display?.prefix ?? field.properties.namePrefixEnabled;
    if (key === 'lastName') return display?.lastName ?? field.properties.nameLastEnabled;
    return display?.suffix ?? field.properties.nameSuffixEnabled;
  }

  getAddressPart(fieldId: string, key: string): string {
    const value = this.values[fieldId] as Record<string, unknown> | undefined;
    return String(value?.[key] ?? '');
  }

  setAddressPart(fieldId: string, key: string, value: string): void {
    const current = (this.values[fieldId] as Record<string, unknown> | undefined) ?? {};
    const field = this.fields.find((item) => item.id === fieldId);
    const nextValue = typeof field?.properties.characterMaximum === 'number' && field.properties.characterMaximum > 0
      ? value.slice(0, field.properties.characterMaximum)
      : value;
    this.setValue(fieldId, { ...current, [key]: nextValue }, field);
  }

  setAddressGeoEditorValue(fieldId: string, key: 'lat' | 'lng', value: string): void {
    const editor = this.addressGeoEditors[fieldId];
    if (!editor) {
      return;
    }
    this.addressGeoEditors = {
      ...this.addressGeoEditors,
      [fieldId]: {
        ...editor,
        [key]: value
      }
    };
  }

  getUrlValue(fieldId: string): { url: string; name: string; title: string } {
    const value = this.values[fieldId];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const urlValue = value as Record<string, unknown>;
      return {
        url: String(urlValue['url'] ?? ''),
        name: String(urlValue['name'] ?? ''),
        title: String(urlValue['title'] ?? '')
      };
    }
    return {
      url: typeof value === 'string' ? value : '',
      name: '',
      title: ''
    };
  }

  setUrlPart(field: BuilderField, key: 'url' | 'name' | 'title', value: string): void {
    const current = this.getUrlValue(field.id);
    const next = { ...current, [key]: value };
    const hasExtras = !!field.properties.urlOptionLinkName || !!field.properties.urlOptionTitle;
    this.setValue(field.id, hasExtras ? next : next.url, field);
  }

  showAddressPart(field: BuilderField, key: string): boolean {
    const display = field.properties.displayFieldsAddress;
    switch (key) {
      case 'line1': return display?.line1 ?? field.properties.addressLine1Enabled;
      case 'line2': return display?.line2 ?? field.properties.addressLine2Enabled;
      case 'city': return display?.city ?? field.properties.cityEnabled;
      case 'state': return display?.state ?? field.properties.stateEnabled;
      case 'postalCode': return display?.postalCode ?? field.properties.postalCodeEnabled;
      case 'country': return display?.country ?? field.properties.countryEnabled;
      default: return false;
    }
  }

  getAddressLabel(field: BuilderField, key: string): string {
    switch (key) {
      case 'line1': return field.properties.addressLine1Label || this.t('fieldDefaults.addressLine1');
      case 'line2': return field.properties.addressLine2Label || this.t('fieldDefaults.addressLine2');
      case 'city': return field.properties.cityLabel || this.t('fieldDefaults.city');
      case 'state': return field.properties.stateLabel || this.t('fieldDefaults.state');
      case 'postalCode': return field.properties.postalCodeLabel || this.t('fieldDefaults.postalCode');
      case 'country': return field.properties.countryLabel || this.t('fieldDefaults.country');
      default: return key;
    }
  }

onCheckboxToggle(field: BuilderField, option: string, checked: boolean): void {
    const current = Array.isArray(this.values[field.id]) ? [...(this.values[field.id] as string[])] : [];
    const base = option === this.t('preview.other') ? current.filter((value) => !this.isOtherChoiceValue(value)) : current;
    const next = checked ? [...new Set([...base, option])] : base.filter((value) => value !== option);
    this.setValue(field.id, next, field);
  }

  isChecked(field: BuilderField, option: string): boolean {
    if (!Array.isArray(this.values[field.id])) {
      return false;
    }
    const values = this.values[field.id] as string[];
    return option === this.t('preview.other') ? values.some((value) => this.isOtherChoiceValue(value)) : values.includes(option);
  }

  isChoiceSelected(field: BuilderField, option: string): boolean {
    const value = this.values[field.id];
    if (Array.isArray(value)) {
      return option === this.t('preview.other') ? value.some((item) => this.isOtherChoiceValue(String(item))) : value.includes(option);
    }
    return option === this.t('preview.other') ? this.isOtherChoiceValue(String(value ?? '')) : value === option;
  }

  selectChoice(field: BuilderField, option: string): void {
    this.setValue(field.id, option, field);
  }

  selectDropdownChoice(field: BuilderField, option: string): void {
    this.selectChoice(field, option);
    this.closeChoiceDropdown(field.id);
  }

  toggleMultiSelectChoice(field: BuilderField, option: string): void {
    this.onCheckboxToggle(field, option, !this.isChecked(field, option));
  }

  removeMultiSelectChoice(field: BuilderField, option: string): void {
    this.onCheckboxToggle(field, option, false);
  }

  getSelectedChoices(field: BuilderField): string[] {
    const value = this.values[field.id];
    return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
  }

  getVisibleSelectedChoices(field: BuilderField): string[] {
    return this.getSelectedChoices(field).map((item) =>
      this.isOtherChoiceValue(item) ? this.t('preview.otherChoiceValue', { value: this.getOtherChoiceValue(field) }) : item
    );
  }

  getUnselectedChoices(field: BuilderField): string[] {
    const selected = this.getSelectedChoices(field);
    return this.getChoices(field).filter((choice) => {
      if (choice === this.t('preview.other')) {
        return !selected.some((item) => this.isOtherChoiceValue(item));
      }
      return !selected.includes(choice);
    });
  }

  getChoiceDisplayValue(field: BuilderField): string {
    const value = this.values[field.id];
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return this.isOtherChoiceSelected(field) ? this.getOtherChoiceValue(field) || this.t('preview.other') : String(value ?? '');
  }

  isOtherChoiceSelected(field: BuilderField): boolean {
    const value = this.values[field.id];
    if (Array.isArray(value)) {
      return value.some((item) => this.isOtherChoiceValue(String(item)));
    }
    return this.isOtherChoiceValue(String(value ?? ''));
  }

  getOtherChoiceValue(field: BuilderField): string {
    const value = this.values[field.id];
    const selected = Array.isArray(value)
      ? value.find((item) => this.isOtherChoiceValue(String(item)))
      : value;
    const text = String(selected ?? '');
    const otherPrefix = this.t('preview.otherPrefix');
    return text.startsWith(otherPrefix) ? text.slice(otherPrefix.length) : '';
  }

  setOtherChoiceValue(field: BuilderField, value: string): void {
    const normalized = value.trim() ? this.t('preview.otherChoiceValue', { value }) : this.t('preview.other');
    const current = this.values[field.id];
    if (Array.isArray(current)) {
      const withoutOther = current.filter((item) => !this.isOtherChoiceValue(String(item)));
      this.setValue(field.id, [...withoutOther, normalized], field);
      return;
    }
    this.setValue(field.id, normalized, field);
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  getCheckedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  setPhoneScanEditorValue(fieldId: string, value: string): void {
    const editor = this.phoneScanEditors[fieldId];
    if (!editor) {
      return;
    }
    this.phoneScanEditors = {
      ...this.phoneScanEditors,
      [fieldId]: {
        ...editor,
        value: this.sanitizePhoneValue(value)
      }
    };
  }

}
