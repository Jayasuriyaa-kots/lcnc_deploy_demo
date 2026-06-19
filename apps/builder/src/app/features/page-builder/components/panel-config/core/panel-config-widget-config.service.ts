import { Injectable } from '@angular/core';
import { SelectOption } from '@qo/ui-components';
import {
  CanvasWidget,
  MediaWidgetConfig,
  SelectWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

@Injectable({ providedIn: 'root' })
export class PanelConfigWidgetConfigService {
  getEditedLabel(value: string, widgetType: string, widgetSubType: string): string {
    return value.trim() || this.getFallbackLabel(widgetType, widgetSubType);
  }

  normalizeTableConfig(config: TableWidgetConfig): TableWidgetConfig {
    return { ...config };
  }

  createTableBackgroundColorConfig(currentConfig: TableWidgetConfig, value: string | null): TableWidgetConfig {
    return { ...currentConfig, backgroundColor: value || 'var(--qo-color-neutral-0)' };
  }

  createTableBorderColorConfig(currentConfig: TableWidgetConfig, value: string | null): TableWidgetConfig {
    return { ...currentConfig, borderColor: value || 'var(--qo-border-color)' };
  }

  createTableStyleFieldConfig(currentConfig: TableWidgetConfig, field: 'borderRadius', value: string): TableWidgetConfig {
    return { ...currentConfig, [field]: this.normalizeRadiusValue(value.trim(), 'var(--qo-radius-sm)') };
  }

  normalizeSelectConfig(config: SelectWidgetConfig): SelectWidgetConfig {
    return { ...config, options: config.options.map((option) => ({ ...option })) };
  }

  createSelectBackgroundColorConfig(currentConfig: SelectWidgetConfig, value: string | null): SelectWidgetConfig {
    return { ...currentConfig, backgroundColor: value || 'var(--qo-color-neutral-0)' };
  }

  createSelectTextColorConfig(currentConfig: SelectWidgetConfig, value: string | null): SelectWidgetConfig {
    return { ...currentConfig, textColor: value || 'var(--qo-color-neutral-900)' };
  }

  createSelectBorderColorConfig(currentConfig: SelectWidgetConfig, value: string | null): SelectWidgetConfig {
    return { ...currentConfig, borderColor: value || 'var(--qo-border-color-strong)' };
  }

  normalizeTextBlockConfig(config: TextBlockWidgetConfig): TextBlockWidgetConfig {
    return { ...config };
  }

  createTextBlockBackgroundColorConfig(currentConfig: TextBlockWidgetConfig, value: string | null): TextBlockWidgetConfig {
    return { ...currentConfig, backgroundColor: value || 'var(--qo-color-neutral-0)' };
  }

  createTextBlockBorderColorConfig(currentConfig: TextBlockWidgetConfig, value: string | null): TextBlockWidgetConfig {
    return { ...currentConfig, borderColor: value || 'var(--qo-border-color)' };
  }

  createTextBlockLabelColorConfig(currentConfig: TextBlockWidgetConfig, value: string | null): TextBlockWidgetConfig {
    return { ...currentConfig, labelColor: value || 'var(--qo-color-neutral-900)' };
  }

  updateTextBlockStyleFieldConfig(
    currentConfig: TextBlockWidgetConfig,
    field:
      | 'borderWidth'
      | 'borderRadius'
      | 'labelColor'
      | 'labelFontSize'
      | 'fontFamily'
      | 'fontSize'
      | 'lineHeight'
      | 'letterSpacing',
    value: string,
  ): TextBlockWidgetConfig {
    return { ...currentConfig, [field]: value };
  }

  toggleTextBlockStyleFlagConfig(
    currentConfig: TextBlockWidgetConfig,
    field: 'bold' | 'italic' | 'underline' | 'lineThrough',
  ): TextBlockWidgetConfig {
    return { ...currentConfig, [field]: !currentConfig[field] };
  }

  createTextBlockTextAlignConfig(
    currentConfig: TextBlockWidgetConfig,
    value: 'left' | 'center' | 'right',
  ): TextBlockWidgetConfig {
    return { ...currentConfig, textAlign: value };
  }

  createTextBlockFontSizeInputConfig(currentConfig: TextBlockWidgetConfig, value: string): TextBlockWidgetConfig {
    const trimmed = value.trim();
    return { ...currentConfig, fontSize: trimmed ? `${trimmed.replace(/px$/i, '')}px` : '14px' };
  }

  normalizeMediaConfig(config: MediaWidgetConfig): MediaWidgetConfig {
    return { ...config };
  }

  createMediaBackgroundColorConfig(currentConfig: MediaWidgetConfig, value: string | null): MediaWidgetConfig {
    return { ...currentConfig, backgroundColor: value || 'var(--qo-color-neutral-100)' };
  }

  createAvailableChartForms(options: SelectOption[]): Array<{ id: string; name: string }> {
    return options
      .map((option) => ({ id: String(option.value ?? ''), name: option.label }))
      .filter((form) => form.id.trim().length > 0);
  }

  isPanelSectionId(sectionId: string): sectionId is 'card' | 'value' | 'icon' | 'caption' {
    return sectionId === 'card' || sectionId === 'value' || sectionId === 'icon' || sectionId === 'caption';
  }

  createBoardBackgroundChange(value: string | null): Partial<CanvasWidget> {
    return { boardBackgroundColor: value || 'var(--qo-color-neutral-0)' };
  }

  createBoardLayoutTypeChange(value: string | number): Partial<CanvasWidget> {
    return { boardLayoutType: value as 'list' | 'grid' };
  }

  createBoardImageSourceChange(value: string | number): Partial<CanvasWidget> {
    return { boardImageSource: value as 'my-library' | 'web-link' | 'none' };
  }

  createBoardPanelsPerRowChange(value: string): Partial<CanvasWidget> {
    const parsed = Number(value);
    return { boardPanelsPerRow: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 };
  }

  createBoardPaddingChange(
    field: 'boardPaddingTop' | 'boardPaddingRight' | 'boardPaddingBottom' | 'boardPaddingLeft',
    value: string,
  ): Partial<CanvasWidget> {
    const parsed = Number(value);
    return { [field]: Number.isFinite(parsed) ? parsed : 0 };
  }

  private normalizeRadiusValue(value: string, fallback: string): string {
    if (!value) {
      return fallback;
    }
    if (value.startsWith('var(')) {
      return value;
    }
    if (/^\d+(\.\d+)?$/.test(value)) {
      return `${value}px`;
    }
    return value;
  }

  private getFallbackLabel(widgetType: string, widgetSubType: string): string {
    if (widgetType === 'report') {
      if (widgetSubType === 'report-embed') {
        return 'Panel';
      }
      if (widgetSubType === 'report-action-card') {
        return 'Card';
      }
      return 'Button';
    }

    switch (widgetType) {
      case 'table':
        return 'Table';
      case 'select':
        return 'Select';
      case 'snippet':
        return 'Snippet';
      case 'label':
        return 'Label';
      case 'form':
        return 'Panel';
      case 'form-action-card':
        return 'Card';
      default:
        return 'Button';
    }
  }
}
