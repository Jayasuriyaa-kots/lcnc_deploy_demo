import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { Directive, inject } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import {
  FormPreviewValidationHost,
  FormPreviewValidationService,
} from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-validation.service';
import { FormPreviewContentRichTextBase } from './form-preview-content-rich-text.base';

@Directive()
export abstract class FormPreviewContentValidationBase extends FormPreviewContentRichTextBase {
  [key: string]: FormPreviewMixinIndex;

  protected readonly validationService = inject(FormPreviewValidationService);

  private validationHost(): FormPreviewValidationHost {
    return this as unknown as FormPreviewValidationHost;
  }

  protected validateField(field: BuilderField): void {
    this.validationService.validateField(this.validationHost(), field);
  }

  protected getValidationMessage(field: BuilderField): string | null {
    return this.validationService.getValidationMessage(this.validationHost(), field);
  }

  protected getCustomValidationMessage(field: BuilderField): string | null {
    return this.validationService.getCustomValidationMessage(this.validationHost(), field);
  }

  protected normalizeValue(field: BuilderField, value: unknown): unknown {
    return this.validationService.normalizeValue(this.validationHost(), field, value);
  }

  protected sanitizePhoneValue(value: unknown): string {
    return this.validationService.sanitizePhoneValue(value);
  }

  protected sanitizeNumericValue(field: BuilderField, value: unknown): string {
    return this.validationService.sanitizeNumericValue(field, value);
  }

  protected getAddressGeo(field: BuilderField): AddressGeoCoordinates | null {
    return this.validationService.getAddressGeo(this.validationHost(), field);
  }

  protected applyAddressGeo(field: BuilderField, geo: AddressGeoCoordinates): void {
    this.validationService.applyAddressGeo(this.validationHost(), field, geo);
  }

  protected getFileTypeError(field: BuilderField, files: File[]): string | null {
    return this.validationService.getFileTypeError(this.validationHost(), field, files);
  }

  protected matchesAcceptedType(file: File, accepted: string): boolean {
    return this.validationService.matchesAcceptedType(file, accepted);
  }

  protected getFileSizeError(field: BuilderField, files: File[]): string | null {
    return this.validationService.getFileSizeError(this.validationHost(), field, files);
  }

  protected async getMediaValidationError(field: BuilderField, files: File[]): Promise<string | null> {
    return this.validationService.getMediaValidationError(this.validationHost(), field, files);
  }

  protected getMediaMaxDurationSeconds(field: BuilderField, kind: 'audio' | 'video'): number {
    return this.validationService.getMediaMaxDurationSeconds(field, kind);
  }

  protected getMediaDuration(file: File, kind: 'audio' | 'video'): Promise<number> {
    return this.validationService.getMediaDuration(this.validationHost(), file, kind);
  }

  protected parseTimeToMinutes(value: string): number | null {
    return this.validationService.parseTimeToMinutes(value);
  }

  protected isOtherChoiceValue(value: string): boolean {
    return this.validationService.isOtherChoiceValue(this.validationHost(), value);
  }

  protected hasValue(field: BuilderField): boolean {
    return this.validationService.hasValue(this.validationHost(), field);
  }

  protected isCurrentTimePreset(value: string): boolean {
    const normalized = (value || '').trim().toLowerCase();
    return normalized === 'current time' || normalized === 'currenttime' || normalized.includes('current');
  }

  protected getCurrentDateValue(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const dd = `${now.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  protected getCurrentTimeValue(field: BuilderField): string {
    const now = new Date();
    const hh = `${now.getHours()}`.padStart(2, '0');
    const mm = `${now.getMinutes()}`.padStart(2, '0');
    const ss = `${now.getSeconds()}`.padStart(2, '0');
    return field.properties.timeShowSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  }

  protected getCurrentDateTimeValue(field: BuilderField): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const dd = `${now.getDate()}`.padStart(2, '0');
    const hh = `${now.getHours()}`.padStart(2, '0');
    const min = `${now.getMinutes()}`.padStart(2, '0');
    const ss = `${now.getSeconds()}`.padStart(2, '0');
    return this.showDateTimeSeconds(field) ? `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}` : `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  protected formatDateValue(value: string, format: string): string {
    if (!value) {
      return '';
    }
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) {
      return value;
    }
    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }
    if (format === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    }
    if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }

    const monthIndex = Number(month) - 1;
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = shortMonths[monthIndex];
    if (!monthName) {
      return value;
    }

    if (format === 'DD-MMM-YYYY') {
      return `${day}-${monthName}-${year}`;
    }
    return `${day} ${monthName} ${year}`;
  }

  protected formatTimeValue(value: string, format: string): string {
    if (!value) {
      return '';
    }
    const [hourPart = '0', minutePart = '0', secondPart = '0'] = value.split(':');
    const hours = Number(hourPart);
    const minutes = Number(minutePart);
    const seconds = Number(secondPart);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return value;
    }
    const hh = `${hours}`.padStart(2, '0');
    const mm = `${minutes}`.padStart(2, '0');
    const ss = `${Number.isNaN(seconds) ? 0 : seconds}`.padStart(2, '0');
    if (format === 'HH:mm:ss') {
      return `${hh}:${mm}:${ss}`;
    }
    if (format === 'hh:mm A') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${`${hour12}`.padStart(2, '0')}:${mm} ${period}`;
    }
    if (format === 'hh:mm:ss A') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${`${hour12}`.padStart(2, '0')}:${mm}:${ss} ${period}`;
    }
    return `${hh}:${mm}`;
  }

  protected extractDateFormat(format: string): string {
    if (format.includes('DD-MMM-YYYY')) return 'DD-MMM-YYYY';
    if (format.includes('DD/MM/YYYY')) return 'DD/MM/YYYY';
    if (format.includes('MM/DD/YYYY')) return 'MM/DD/YYYY';
    if (format.includes('YYYY-MM-DD')) return 'YYYY-MM-DD';
    return 'DD MMM YYYY';
  }

  protected extractTimeFormat(format: string): string {
    if (format.includes('hh:mm:ss A')) return 'hh:mm:ss A';
    if (format.includes('hh:mm A')) return 'hh:mm A';
    if (format.includes('HH:mm:ss')) return 'HH:mm:ss';
    return 'HH:mm';
  }
}
