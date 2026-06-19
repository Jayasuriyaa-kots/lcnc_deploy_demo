import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PanelWidgetResolution } from '@builder/features/page-builder/components/widget-showcase/panel/panel-widget-resolution.util';
import {
  createDefaultPanelWidgetConfig,
  PanelWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { UiPanelWidgetRendererComponent } from './ui-panel-widget-renderer.component';

@Component({
  selector: 'app-panel-widget',
  standalone: true,
  imports: [UiPanelWidgetRendererComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--panel-bg]': 'resolvedConfig().backgroundColor',
    '[style.--panel-border-color]': 'resolvedConfig().borderColor',
    '[style.--panel-radius]': 'resolvedConfig().borderRadius',
    '[style.--panel-title-color]': 'resolvedConfig().titleColor',
  },
  templateUrl: './ui-panel-widget.component.html',
  styleUrl: './ui-panel-widget.component.scss'
})
export class UiPanelWidgetComponent {
  readonly config = input<PanelWidgetConfig | null>(null);
  readonly interactive = input(false);
  readonly selectedSectionId = input<string | null>(null);
  readonly widgetId = input('');
  readonly widgetLabel = input('');
  readonly resolution = input<PanelWidgetResolution | null>(null);
  readonly sectionSelected = output<string>();

  readonly resolvedConfig = computed<PanelWidgetConfig>(() => ({
    ...createDefaultPanelWidgetConfig(),
    ...(this.config() ?? {}),
  }));
  readonly layoutVariant = computed(() => this.resolvedConfig().layoutVariant);
  readonly displayValue = computed(() => {
    const resolution = this.resolution();
    if (resolution?.displayValue) {
      return resolution.displayValue;
    }

    switch (resolution?.state) {
      case 'unconfigured':
        return 'Configure panel';
      case 'invalid':
        return 'Invalid field';
      case 'no_data':
        return 'No data';
      case 'empty':
        return 'Empty value';
      default:
        return this.resolvedConfig().value || 'Preview';
    }
  });
  readonly displayCopy = computed(() => {
    const config = this.resolvedConfig();
    return config.title.trim() || config.subtitle.trim() || config.caption.trim() || 'Summary Card';
  });
  readonly secondaryCopy = computed(() => {
    const config = this.resolvedConfig();
    const values = [
      config.title.trim() && config.subtitle.trim() ? config.subtitle.trim() : '',
      config.caption.trim(),
    ]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    return values.join(' | ');
  });
  readonly footerCopy = computed(() => {
    const trend = this.resolvedConfig().trend.trim();
    if (trend) {
      return trend;
    }

    return this.resolution()?.state === 'ready' ? '' : (this.resolution()?.message || '');
  });

  onSectionSelected(sectionId: 'card' | 'value' | 'icon' | 'caption'): void {
    this.sectionSelected.emit(sectionId);
  }

  shouldReverseMetricOrder(): boolean {
    return this.resolvedConfig().iconPlacement === 'after';
  }
}
