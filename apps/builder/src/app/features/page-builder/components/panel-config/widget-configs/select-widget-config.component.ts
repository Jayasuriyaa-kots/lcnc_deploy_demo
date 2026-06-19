import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SelectSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/select/select-settings-panel.component';
import { WidgetConfigBase } from '@builder/features/page-builder/components/panel-config/widget-configs/widget-config-base.interface';
import { SelectWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { QoColorPickerComponent } from '@qo/ui-components';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-select-widget-config',
  standalone: true,
  imports: [CommonModule, SelectSettingsPanelComponent, QoColorPickerComponent],
  templateUrl: './select-widget-config.component.html',
  styleUrl: './select-widget-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWidgetConfigComponent implements WidgetConfigBase<SelectWidgetConfig> {
  protected readonly t = injectPageBuilderTranslate();
  readonly label = input('Select');
  readonly activeTab = input<PanelRightTab>('display');
  readonly config = input.required<SelectWidgetConfig>();
  readonly colorPickerPalette = input<readonly string[]>([]);

  readonly labelChange = output<string>();
  readonly configChange = output<SelectWidgetConfig>();

  onBackgroundColorChanged(value: string | null): void {
    this.configChange.emit({
      ...this.config(),
      backgroundColor: value ?? '',
    });
  }
}
