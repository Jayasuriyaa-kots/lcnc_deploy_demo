import { Injectable } from '@angular/core';
import type { FormPreviewBrowserMediaService } from './form-preview-browser-media.service';

/** Host surface used by validation helpers (preview mixin host). */
export interface FormPreviewValidationHost {
  values: Record<string, unknown>;
  liveErrors: Record<string, string>;
  mediaNames: Record<string, string[]>;
  t: (key: string, params?: Record<string, unknown>) => string;
  getCharacterMaximum(field: BuilderField): number | null;
  supportsCharacterLimit(field: BuilderField): boolean;
  getMediaNames(fieldId: string): string[];
  showDateTimeSeconds(field: BuilderField): boolean;
  isFileUpload(field: BuilderField): boolean;
  isSignatureField(field: BuilderField): boolean;
  readonly browserMedia: FormPreviewBrowserMediaService;
  setValue(fieldId: string, value: unknown, field?: BuilderField): void;
  addressGeoEditors: Record<string, { open: boolean; lat: string; lng: string }>;
}

@Injectable()
export class FormPreviewValidationService {
  validateField(host: FormPreviewValidationHost, field: BuilderField): void {
    const message = this.getValidationMessage(host, field);
    if (message) {
      host.liveErrors = { ...host.liveErrors, [field.id]: message };
      return;
    }

    if (host.liveErrors[field.id]) {
      const nextErrors = { ...host.liveErrors };
      delete nextErrors[field.id];
      host.liveErrors = nextErrors;
    }
  }

  getValidationMessage(host: FormPreviewValidationHost, field: BuilderField): string | null {
    if (field.properties.required && !this.hasValue(host, field)) {
      return host.t('validation.required', { label: field.label });
    }
    return this.getCustomValidationMessage(host, field);
  }

  getCustomValidationMessage(host: FormPreviewValidationHost, field: BuilderField): string | null {
    const value = host.values[field.id];

    if (!this.hasValue(host, field) && !field.properties.required) {
      return null;
    }

    if (
      host.supportsCharacterLimit(field) &&
      typeof value === 'string' &&
      host.getCharacterMaximum(field) &&
      value.replace(/<[^>]+>/g, '').length > (host.getCharacterMaximum(field) ?? 0)
    ) {
      return host.t('validation.maxCharacters', { label: field.label });
    }

    if (['Number', 'Decimal', 'Currency', 'Percent'].includes(field.type)) {
      return this.getNumericValidationMessage(host, field, value);
    }

    if (field.type === 'Date Picker' || field.type === 'Date') {
      return this.getDateValidationMessage(host, field, value);
    }

    if (field.type === 'Time') {
      return this.getTimeValidationMessage(host, field, value);
    }

    if (field.type === 'Date-Time') {
      return this.getDateTimeValidationMessage(host, field, value);
    }

    return null;
  }

  isOtherChoiceValue(host: FormPreviewValidationHost, value: string): boolean {
    return value === host.t('preview.other') || value.startsWith(host.t('preview.otherPrefix'));
  }

  hasValue(host: FormPreviewValidationHost, field: BuilderField): boolean {
    const value = host.values[field.id];

    if (field.type === 'Name') {
      const nameValue = value as Record<string, string> | undefined;
      if (!nameValue?.firstName?.trim()) return false;
      if ((field.properties.displayFieldsName?.lastName ?? field.properties.nameLastEnabled) && !nameValue?.lastName?.trim()) {
        return false;
      }
      return true;
    }

    if (field.type === 'Address') {
      const addressValue = value as Record<string, string> | undefined;
      if ((field.properties.displayFieldsAddress?.line1 ?? field.properties.addressLine1Enabled) && !addressValue?.line1?.trim()) {
        return false;
      }
      if ((field.properties.displayFieldsAddress?.city ?? field.properties.cityEnabled) && !addressValue?.city?.trim()) {
        return false;
      }
      if ((field.properties.displayFieldsAddress?.state ?? field.properties.stateEnabled) && !addressValue?.state?.trim()) {
        return false;
      }
      if ((field.properties.displayFieldsAddress?.postalCode ?? field.properties.postalCodeEnabled) && !addressValue?.postalCode?.trim()) {
        return false;
      }
      if ((field.properties.displayFieldsAddress?.country ?? field.properties.countryEnabled) && !addressValue?.country?.trim()) {
        return false;
      }
      return true;
    }

    if (field.type === 'Url' && value && typeof value === 'object' && !Array.isArray(value)) {
      return String((value as Record<string, unknown>).url ?? '').trim().length > 0;
    }

    if (field.type === 'Checkbox' || field.type === 'Multi Select') {
      return Array.isArray(value) ? value.length > 0 : false;
    }

    if (field.type === 'Decision Box') {
      return value === true || value === false;
    }

    if (field.type === 'File Upload' || field.type === 'Image' || field.type === 'Audio' || field.type === 'Video') {
      const media = host.getMediaNames(field.id);
      if (media.length > 0) return true;
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === 'string' ? value.trim().length > 0 : false;
    }

    if (field.type === 'Rich Text') {
      const text = typeof value === 'string' ? value.replace(/<[^>]+>/g, '').trim() : '';
      return text.length > 0;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return !!value;
  }

  normalizeValue(host: FormPreviewValidationHost, field: BuilderField, value: unknown): unknown {
    if (host.isFileUpload(field) || host.isSignatureField(field)) {
      return value;
    }

    if (host.supportsCharacterLimit(field) && typeof value === 'string' && host.getCharacterMaximum(field)) {
      const max = host.getCharacterMaximum(field) ?? 0;
      if (field.type === 'Rich Text') {
        const plainText = value.replace(/<[^>]+>/g, '');
        if (plainText.length > max) {
          return plainText.slice(0, max);
        }
      }
      return value.slice(0, max);
    }

    if (['Number', 'Decimal', 'Currency', 'Percent'].includes(field.type) && typeof value === 'string') {
      return value.trim();
    }

    return value;
  }

  sanitizePhoneValue(value: unknown): string {
    return String(value ?? '').replace(/\D/g, '').slice(0, 15);
  }

  sanitizeNumericValue(field: BuilderField, value: unknown): string {
    const raw = String(value ?? '').replace(/,/g, '').trim();
    if (!raw) {
      return '';
    }

    const stripped = raw.replace(/[^0-9.-]/g, '');
    if (!stripped) {
      return '';
    }

    if (field.type === 'Number') {
      const digits = stripped.replace(/[^0-9-]/g, '');
      return digits.startsWith('-')
        ? `-${digits.slice(1).replace(/-/g, '')}`
        : digits.replace(/-/g, '');
    }

    const negative = stripped.startsWith('-');
    const unsigned = negative ? stripped.slice(1) : stripped;
    const firstDotIndex = unsigned.indexOf('.');
    const integerPart = (firstDotIndex === -1 ? unsigned : unsigned.slice(0, firstDotIndex)).replace(/[^0-9]/g, '');
    const hasDot = firstDotIndex !== -1;
    const decimalPart = hasDot ? unsigned.slice(firstDotIndex + 1).replace(/[^0-9]/g, '') : '';
    const prefix = negative ? '-' : '';

    if (hasDot) {
      return `${prefix}${integerPart}.${decimalPart}`;
    }

    return `${prefix}${integerPart}`;
  }

  getAddressGeo(host: FormPreviewValidationHost, field: BuilderField): AddressGeoCoordinates | null {
    const value = host.values[field.id];
    if (!value || typeof value !== 'object') {
      return null;
    }
    const geo = (value as Record<string, unknown>).geo;
    if (!geo || typeof geo !== 'object') {
      return null;
    }

    const lat = Number((geo as Record<string, unknown>).lat);
    const lng = Number((geo as Record<string, unknown>).lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    const accuracy = Number((geo as Record<string, unknown>).accuracy);
    return {
      lat,
      lng,
      accuracy: Number.isNaN(accuracy) ? undefined : accuracy,
    };
  }

  applyAddressGeo(host: FormPreviewValidationHost, field: BuilderField, geo: AddressGeoCoordinates): void {
    const current = (host.values[field.id] as Record<string, unknown> | undefined) ?? {};
    host.setValue(field.id, { ...current, geo }, field);
    host.addressGeoEditors = {
      ...host.addressGeoEditors,
      [field.id]: {
        open: false,
        lat: String(geo.lat),
        lng: String(geo.lng),
      },
    };
  }

  getFileTypeError(host: FormPreviewValidationHost, field: BuilderField, files: File[]): string | null {
    const accept = (field.properties.fileUploadTypes || field.properties.acceptedFileTypes || '').trim();
    if (!accept) {
      return null;
    }

    const acceptedTypes = accept.split(',').map((item) => item.trim()).filter(Boolean);
    const hasInvalid = files.some((file) => !acceptedTypes.some((type) => this.matchesAcceptedType(file, type)));
    return hasInvalid ? host.t('validation.fileType', { accept }) : null;
  }

  matchesAcceptedType(file: File, accepted: string): boolean {
    if (accepted.startsWith('.')) {
      return file.name.toLowerCase().endsWith(accepted.toLowerCase());
    }
    if (accepted.endsWith('/*')) {
      const family = accepted.slice(0, accepted.indexOf('/'));
      return file.type.startsWith(`${family}/`);
    }
    return file.type === accepted;
  }

  getFileSizeError(host: FormPreviewValidationHost, field: BuilderField, files: File[]): string | null {
    const maxMb = Number(field.properties.maxFileSizeMb);
    if (Number.isNaN(maxMb) || maxMb <= 0) {
      return null;
    }
    const maxBytes = maxMb * 1024 * 1024;
    return files.some((file) => file.size > maxBytes)
      ? host.t('validation.fileSize', { maxMb: field.properties.maxFileSizeMb })
      : null;
  }

  async getMediaValidationError(host: FormPreviewValidationHost, field: BuilderField, files: File[]): Promise<string | null> {
    if (field.type === 'Video') {
      const maxDuration = this.getMediaMaxDurationSeconds(field, 'video');
      if (!Number.isNaN(maxDuration) && maxDuration > 0) {
        const durations = await Promise.all(files.map((file) => this.getMediaDuration(host, file, 'video')));
        if (durations.some((duration) => duration > maxDuration)) {
          return host.t('validation.mediaDuration', { kind: 'Video', seconds: maxDuration });
        }
      }
    }

    if (field.type === 'Audio') {
      const maxDuration = this.getMediaMaxDurationSeconds(field, 'audio');
      if (!Number.isNaN(maxDuration) && maxDuration > 0) {
        const durations = await Promise.all(files.map((file) => this.getMediaDuration(host, file, 'audio')));
        if (durations.some((duration) => duration > maxDuration)) {
          return host.t('validation.mediaDuration', { kind: 'Audio', seconds: maxDuration });
        }
      }
    }

    return null;
  }

  getMediaMaxDurationSeconds(field: BuilderField, kind: 'audio' | 'video'): number {
    if (kind === 'audio') {
      if (typeof field.properties.audioDurationMins === 'number' || typeof field.properties.audioDurationSecs === 'number') {
        return ((field.properties.audioDurationMins ?? 0) * 60) + (field.properties.audioDurationSecs ?? 0);
      }
      return Number(field.properties.audioMaxDurationSec);
    }

    if (typeof field.properties.videoDurationMins === 'number' || typeof field.properties.videoDurationSecs === 'number') {
      return ((field.properties.videoDurationMins ?? 0) * 60) + (field.properties.videoDurationSecs ?? 0);
    }
    return Number(field.properties.videoMaxDurationSec);
  }

  getMediaDuration(host: FormPreviewValidationHost, file: File, kind: 'audio' | 'video'): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const element = host.browserMedia.createMediaElement(kind);
      element.preload = 'metadata';
      element.onloadedmetadata = () => {
        const duration = Number(element.duration);
        URL.revokeObjectURL(url);
        resolve(duration);
      };
      element.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(host.t('validation.mediaMetadata')));
      };
      element.src = url;
    });
  }

  private getNumericValidationMessage(host: FormPreviewValidationHost, field: BuilderField, value: unknown): string | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const raw = String(value).trim();
    if (!raw) {
      return null;
    }

    const numeric = Number(raw);
    if (Number.isNaN(numeric)) {
      return host.t('validation.validNumber', { label: field.label });
    }

    if (field.type === 'Number' && !/^-?\d+$/.test(raw)) {
      return host.t('validation.wholeNumber', { label: field.label });
    }

    if (field.type !== 'Number') {
      const decimalPoints = field.properties.decimalPoints ?? 2;
      const decimalPart = raw.split('.')[1] ?? '';
      if (decimalPart.length > decimalPoints) {
        return host.t('validation.decimalPlaces', { label: field.label, count: decimalPoints });
      }
    }

    if (field.properties.maxDigits && raw.replace(/[^0-9]/g, '').length > field.properties.maxDigits) {
      return host.t('validation.maxDigits', { label: field.label });
    }

    if (field.properties.minValue !== '' && !Number.isNaN(Number(field.properties.minValue)) && numeric < Number(field.properties.minValue)) {
      return host.t('validation.minValue', { label: field.label, value: field.properties.minValue });
    }

    if (field.properties.maxValue !== '' && !Number.isNaN(Number(field.properties.maxValue)) && numeric > Number(field.properties.maxValue)) {
      return host.t('validation.maxValue', { label: field.label, value: field.properties.maxValue });
    }

    return null;
  }

  private getDateValidationMessage(host: FormPreviewValidationHost, field: BuilderField, value: unknown): string | null {
    if (typeof value !== 'string' || !value) {
      return null;
    }
    if (!this.isAllowedDay(field, value)) {
      return host.t('validation.selectedDayNotAllowed');
    }
    return null;
  }

  private getTimeValidationMessage(host: FormPreviewValidationHost, field: BuilderField, value: unknown): string | null {
    if (typeof value !== 'string' || !value) {
      return null;
    }
    if (!this.isWithinAllowedHours(field, value)) {
      return host.t('validation.selectedTimeOutsideAllowedHours');
    }
    return null;
  }

  private getDateTimeValidationMessage(host: FormPreviewValidationHost, field: BuilderField, value: unknown): string | null {
    if (typeof value !== 'string' || !value) {
      return null;
    }
    if (!this.isAllowedDay(field, value, true)) {
      return host.t('validation.selectedDayNotAllowed');
    }
    if (!this.isWithinAllowedHours(field, value, true)) {
      return host.t('validation.selectedTimeOutsideAllowedHours');
    }
    return null;
  }

  private isAllowedDay(field: BuilderField, value: string, useDateTimeRules = false): boolean {
    const allowedDays = useDateTimeRules ? (field.properties.dateTimeAllowedDays ?? []) : field.properties.allowedDays;
    if (!Array.isArray(allowedDays) || allowedDays.length === 0) {
      return true;
    }

    const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00`);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return allowedDays.includes(dayMap[date.getDay()]);
  }

  private isWithinAllowedHours(field: BuilderField, value: string, useDateTimeRules = false): boolean {
    const allowedHoursFrom = useDateTimeRules ? (field.properties.dateTimeAllowedHoursFrom ?? '') : field.properties.allowedHoursFrom;
    const allowedHoursTo = useDateTimeRules ? (field.properties.dateTimeAllowedHoursTo ?? '') : field.properties.allowedHoursTo;
    if (!allowedHoursFrom && !allowedHoursTo) {
      return true;
    }

    const timeValue = value.includes('T') ? value.split('T')[1] : value;
    const currentMinutes = this.parseTimeToMinutes(timeValue);
    if (currentMinutes === null) {
      return false;
    }

    const from = this.parseTimeToMinutes(allowedHoursFrom);
    const to = this.parseTimeToMinutes(allowedHoursTo);

    if (from !== null && currentMinutes < from) {
      return false;
    }
    if (to !== null && currentMinutes > to) {
      return false;
    }
    return true;
  }

  parseTimeToMinutes(value: string): number | null {
    if (!value) {
      return null;
    }
    const [hours, minutes] = value.split(':').map((part) => Number(part));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }
    return (hours * 60) + minutes;
  }
}
