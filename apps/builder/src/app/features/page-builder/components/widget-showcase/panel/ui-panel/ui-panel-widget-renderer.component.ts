import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PanelWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';

@Component({
  selector: 'pb-ui-panel-widget-renderer',
  standalone: true,
  templateUrl: './ui-panel-widget-renderer.component.html',
  styleUrl: './ui-panel-widget-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPanelWidgetRendererComponent {
  readonly resolvedConfig = input.required<PanelWidgetConfig>();
  readonly layoutVariant = input.required<string>();
  readonly interactive = input(false);
  readonly displayValue = input.required<string>();
  readonly displayCopy = input.required<string>();
  readonly secondaryCopy = input.required<string>();
  readonly footerCopy = input.required<string>();
  readonly selectedSectionId = input<string | null>(null);
  readonly resolutionState = input.required<string>();
  readonly shouldReverseMetric = input.required<boolean>();

  readonly sectionSelected = output<'card' | 'value' | 'icon' | 'caption'>();

  selectSection(sectionId: 'card' | 'value' | 'icon' | 'caption', event?: Event): void {
    if (!this.interactive()) {
      return;
    }

    event?.stopPropagation();
    this.sectionSelected.emit(sectionId);
  }

  isSelected(sectionId: 'card' | 'value' | 'icon' | 'caption'): boolean {
    return this.selectedSectionId() === sectionId;
  }
}
