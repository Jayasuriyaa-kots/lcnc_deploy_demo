import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QoColorPickerComponent, QoInputComponent } from '@qo/ui-components';
import { TableSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/table/table-settings-panel.component';
import { TableWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { WidgetConfigBase } from '@builder/features/page-builder/components/panel-config/widget-configs/widget-config-base.interface';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-table-widget-config',
  standalone: true,
  imports: [CommonModule, TableSettingsPanelComponent, QoColorPickerComponent, QoInputComponent],
  templateUrl: './table-widget-config.component.html',
  styleUrl: './table-widget-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableWidgetConfigComponent implements WidgetConfigBase<TableWidgetConfig> {
  protected readonly t = injectPageBuilderTranslate();
  readonly label = input('');
  readonly activeTab = input<PanelRightTab>('display');
  readonly config = input.required<TableWidgetConfig>();
  readonly colorPickerPalette = input<readonly string[]>([]);

  readonly labelChange = output<string>();
  readonly configChange = output<TableWidgetConfig>();

  onConfigChanged(config: TableWidgetConfig): void {
    this.configChange.emit(this.normalizeConfig(config));
  }

  onBackgroundColorChanged(value: string | null): void {
    this.configChange.emit({
      ...this.config(),
      backgroundColor: value ?? '',
    });
  }

  onBorderColorChanged(value: string | null): void {
    this.configChange.emit({
      ...this.config(),
      borderColor: value ?? '',
    });
  }

  onBorderRadiusChanged(value: string): void {
    this.configChange.emit(this.normalizeConfig({
      ...this.config(),
      borderRadius: value,
    }));
  }

  private normalizeConfig(config: TableWidgetConfig): TableWidgetConfig {
    const borderRadius = config.borderRadius.trim();
    return {
      ...config,
      borderRadius: borderRadius ? borderRadius : '',
    };
  }
}
