import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MediaSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/media/media-settings-panel.component';
import { WidgetConfigBase } from '@builder/features/page-builder/components/panel-config/widget-configs/widget-config-base.interface';
import { MediaWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { QoColorPickerComponent } from '@qo/ui-components';

@Component({
  selector: 'app-media-widget-config',
  standalone: true,
  imports: [CommonModule, MediaSettingsPanelComponent, QoColorPickerComponent],
  templateUrl: './media-widget-config.component.html',
  styleUrl: './media-widget-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaWidgetConfigComponent implements WidgetConfigBase<MediaWidgetConfig> {
  readonly activeTab = input<PanelRightTab>('display');
  readonly config = input.required<MediaWidgetConfig>();
  readonly colorPickerPalette = input<readonly string[]>([]);

  readonly configChange = output<MediaWidgetConfig>();
  readonly labelChange = output<string>();

  onBackgroundColorChanged(value: string | null): void {
    this.configChange.emit(this.normalizeConfig({
      ...this.config(),
      backgroundColor: value || 'var(--qo-color-neutral-100)',
    }));
  }

  normalizeConfig(config: MediaWidgetConfig): MediaWidgetConfig {
    return { ...config };
  }
}
