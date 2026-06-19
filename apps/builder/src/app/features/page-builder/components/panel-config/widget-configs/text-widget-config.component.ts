import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LabelSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/label';
import { TextBlockSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/text-block/text-block-settings-panel.component';
import { WidgetConfigBase } from '@builder/features/page-builder/components/panel-config/widget-configs/widget-config-base.interface';
import { TextBlockWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { QoColorPickerComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-text-widget-config',
  standalone: true,
  imports: [CommonModule,
    TextBlockSettingsPanelComponent,
    LabelSettingsPanelComponent,
    QoColorPickerComponent,
    QoInputComponent,
    QoSelectComponent,
    TranslocoPipe,
  ],
  templateUrl: './text-widget-config.component.html',
  styleUrl: './text-widget-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextWidgetConfigComponent implements WidgetConfigBase<TextBlockWidgetConfig> {
  protected readonly t = injectPageBuilderTranslate();
  readonly widgetType = input<'text-block' | 'label'>('text-block');
  readonly label = input('');
  readonly activeTab = input<PanelRightTab>('display');
  readonly config = input.required<TextBlockWidgetConfig>();
  readonly colorPickerPalette = input<readonly string[]>([]);
  readonly fontFamilyOptions = input<readonly SelectOption[]>([]);
  readonly lineHeightOptions = input<readonly SelectOption[]>([]);
  readonly letterSpacingOptions = input<readonly SelectOption[]>([]);

  readonly labelChange = output<string>();
  readonly configChange = output<TextBlockWidgetConfig>();

  isLabelTextStyleWidget(): boolean {
    return this.config().inputType === 'labeltext';
  }

  fontSizeInputValue(): string {
    return this.config().fontSize.replace(/px$/i, '').trim();
  }

  onBackgroundColorChanged(value: string | null): void {
    this.emitConfig({ backgroundColor: value || 'var(--qo-color-neutral-0)' });
  }

  onBorderColorChanged(value: string | null): void {
    this.emitConfig({ borderColor: value || 'var(--qo-border-color)' });
  }

  onLabelColorChanged(value: string | null): void {
    this.emitConfig({ labelColor: value || 'var(--qo-color-neutral-900)' });
  }

  updateStyleField(
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
  ): void {
    this.emitConfig({ [field]: value } as Partial<TextBlockWidgetConfig>);
  }

  toggleStyleFlag(field: 'bold' | 'italic' | 'underline' | 'lineThrough'): void {
    this.emitConfig({ [field]: !this.config()[field] } as Partial<TextBlockWidgetConfig>);
  }

  updateTextAlign(value: 'left' | 'center' | 'right'): void {
    this.emitConfig({ textAlign: value });
  }

  updateFontSizeInput(value: string): void {
    const trimmed = value.trim();
    this.emitConfig({ fontSize: trimmed ? `${trimmed.replace(/px$/i, '')}px` : '14px' });
  }

  getSelectValue(value: unknown, fallback: string): string {
    if (typeof value === 'string') {
      return value || fallback;
    }

    if (value && typeof value === 'object' && 'value' in value) {
      const optionValue = (value as { value?: unknown }).value;
      return typeof optionValue === 'string' && optionValue ? optionValue : fallback;
    }

    return fallback;
  }

  normalizeConfig(config: TextBlockWidgetConfig): TextBlockWidgetConfig {
    return { ...config };
  }

  private emitConfig(partial: Partial<TextBlockWidgetConfig>): void {
    this.configChange.emit(this.normalizeConfig({ ...this.config(), ...partial }));
  }
}
