import { computed, effect, Injectable, signal } from '@angular/core';
import { resolvePageBuilderExpressionToString } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import {
  createDefaultTextBlockWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  getTextBlockWidgetPreset,
  TextBlockVariant,
} from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-widget.config';

@Injectable()
export class UiTextBlockFacade {
  readonly variant = signal<TextBlockVariant>('text');
  readonly config = signal<TextBlockWidgetConfig | undefined>(undefined);

  readonly selectedFileNames = signal('');
  readonly currentValue = signal('');
  readonly validationMessage = signal('');

  readonly resolvedPreset = computed(() => getTextBlockWidgetPreset(this.variant()));
  readonly resolvedConfig = computed(() => ({
    ...createDefaultTextBlockWidgetConfig(this.variant()),
    ...(this.config() ?? {}),
  }));
  readonly currentVariant = computed(() => this.resolvedConfig().inputType || this.variant());
  readonly isLabelText = computed(() => this.currentVariant() === 'labeltext');
  readonly isRichText = computed(() => this.currentVariant() === 'richtext');
  readonly isCurrency = computed(() => this.currentVariant() === 'currency');
  readonly isFilePicker = computed(() => this.currentVariant() === 'file');
  readonly isDatePicker = computed(() => this.currentVariant() === 'date');
  readonly showFieldLabel = computed(() => !this.isLabelText());
  readonly inputShellBorderWidth = computed(() => this.normalizeCssLength(this.resolvedConfig().borderWidth, '1px'));
  readonly inputShellBorderRadius = computed(() => this.normalizeCssLength(this.resolvedConfig().borderRadius, '4px'));
  readonly textBlockFontSize = computed(() => this.normalizeCssLength(this.resolvedConfig().fontSize, '14px'));
  readonly textBlockLineHeight = computed(() => this.normalizeTextMetric(this.resolvedConfig().lineHeight, 'normal'));
  readonly textBlockLetterSpacing = computed(() => this.normalizeTextMetric(this.resolvedConfig().letterSpacing, 'normal'));
  readonly textBlockFontWeight = computed(() => (this.resolvedConfig().bold ? '700' : '400'));
  readonly textBlockFontStyle = computed(() => (this.resolvedConfig().italic ? 'italic' : 'normal'));
  readonly textBlockTextDecoration = computed(() => {
    const decorations: string[] = [];

    if (this.resolvedConfig().underline) {
      decorations.push('underline');
    }

    if (this.resolvedConfig().lineThrough) {
      decorations.push('line-through');
    }

    return decorations.length ? decorations.join(' ') : 'none';
  });
  readonly textBlockFontFamily = computed(() => this.resolvedConfig().fontFamily || 'system-ui, sans-serif');
  readonly inputId = `text-block-file-${Math.random().toString(36).slice(2, 10)}`;
  readonly inputType = computed(() => {
    const variant = this.currentVariant();

    if (variant === 'number') {
      return 'tel';
    }

    if (variant === 'email') {
      return 'email';
    }

    if (variant === 'password') {
      return 'password';
    }

    if (variant === 'url') {
      return 'url';
    }

    if (variant === 'file') {
      return 'file';
    }

    if (variant === 'date') {
      return 'datetime-local';
    }

    return 'text';
  });
  readonly inputAutocomplete = computed(() => {
    switch (this.currentVariant()) {
      case 'email':
        return 'email';
      case 'password':
        return 'current-password';
      case 'url':
        return 'url';
      default:
        return 'off';
    }
  });
  readonly inputValidationHint = computed(() => {
    switch (this.currentVariant()) {
      case 'email':
        return 'Enter a valid email address';
      case 'url':
        return 'Enter a valid URL such as https://example.com';
      default:
        return '';
    }
  });
  readonly currencyPrefix = computed(() => (this.isCurrency() ? '$' : ''));
  readonly displayPlaceholder = computed(() => this.resolvedConfig().placeholder || this.resolvedPreset().placeholder);
  readonly labelSourceValue = computed(() => {
    const config = this.resolvedConfig();
    return config.text || config.defaultValue;
  });
  readonly resolvedLabelTextValue = computed(() => this.resolveLabelTextValue(this.labelSourceValue()));
  readonly labelTextContent = computed(() => this.resolvedLabelTextValue() || this.displayPlaceholder());
  readonly labelTextHtml = computed(() =>
    this.renderLabelTextContent(this.labelTextContent(), this.resolvedConfig().disableLinks),
  );
  readonly fileDisplayName = computed(() =>
    this.selectedFileNames() || this.resolvedConfig().defaultValue || this.displayPlaceholder(),
  );
  readonly fileButtonLabel = computed(() => (this.resolvedConfig().maxFiles > 1 ? 'Choose Files' : 'Choose File'));
  readonly fileAccept = computed(() => {
    switch (this.resolvedConfig().allowedFileTypes) {
      case 'documents':
        return '.doc,.docx,.txt,.rtf,.odt,.pdf';
      case 'images':
        return 'image/*';
      case 'pdf':
        return '.pdf,application/pdf';
      case 'spreadsheets':
        return '.xls,.xlsx,.csv,.ods';
      default:
        return '';
    }
  });

  constructor() {
    effect(() => {
      this.currentValue.set(this.resolvedConfig().defaultValue);
      this.validationMessage.set('');
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.selectedFileNames.set(files.map((file) => file.name).join(', '));
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.currentValue.set(input.value);
    this.validationMessage.set(this.getValidationMessage(input));
  }

  onRichTextChange(html: string): void {
    this.currentValue.set(html ?? '');
  }

  private getValidationMessage(input: HTMLInputElement): string {
     if (input.validity.valid || !input.value) {
      return '';
    }

    if (input.validity.typeMismatch) {
      return this.inputValidationHint();
    }

    if (input.validity.patternMismatch) {
      return 'Value does not match the required format';
    }

    if (input.validity.tooShort) {
      return `Minimum ${this.resolvedConfig().minLength} characters required`;
    }

    if (input.validity.tooLong) {
      return `Maximum ${this.resolvedConfig().maxLength} characters allowed`;
    }

    if (input.validity.valueMissing) {
      return 'This field is required';
    }

    return 'Enter a valid value';
  }

  private normalizeCssLength(value: string, fallback: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return fallback;
    }

    return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }

  private normalizeTextMetric(value: string, fallback: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return fallback;
    }

    if (trimmed === 'normal') {
      return trimmed;
    }

    return trimmed;
  }

  private resolveLabelTextValue(source: string): string {
    const jsonValue = this.tryResolveJsonLabelValue(source);
    if (jsonValue) {
      return jsonValue;
    }

    return resolvePageBuilderExpressionToString(source);
  }

  private tryResolveJsonLabelValue(source: string): string {
    const trimmed = source.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return '';
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return this.extractDisplayValueFromParsedJson(parsed);
    } catch {
      return '';
    }
  }

  private extractDisplayValueFromParsedJson(parsed: unknown): string {
    if (Array.isArray(parsed)) {
      return this.extractDisplayValueFromRows(parsed);
    }

    if (parsed && typeof parsed === 'object') {
      const candidate = parsed as Record<string, unknown>;
      if (Array.isArray(candidate['data'])) {
        return this.extractDisplayValueFromRows(candidate['data']);
      }

      return this.extractDisplayValueFromRow(candidate);
    }

    return '';
  }

  private extractDisplayValueFromRows(rows: unknown[]): string {
    const firstRow = rows.find((row): row is Record<string, unknown> => !!row && typeof row === 'object');
    return firstRow ? this.extractDisplayValueFromRow(firstRow) : '';
  }

  private extractDisplayValueFromRow(row: Record<string, unknown>): string {
    const preferredKeys = ['label', 'text', 'title', 'name', 'value', 'caption', 'description'];

    for (const key of preferredKeys) {
      const value = row[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
      if (typeof value === 'number') {
        return String(value);
      }
    }

    for (const value of Object.values(row)) {
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
      if (typeof value === 'number') {
        return String(value);
      }
    }

    return '';
  }

  private renderLabelTextContent(content: string, disableLinks: boolean): string {
    const escaped = this.escapeHtml(content).replace(/\r?\n/g, '<br />');

    if (disableLinks) {
      return escaped;
    }

    return escaped.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
