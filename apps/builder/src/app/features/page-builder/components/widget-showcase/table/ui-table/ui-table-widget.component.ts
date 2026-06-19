
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { createDefaultTableWidgetConfig, TableWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { UiTableWidgetRendererComponent } from './ui-table-widget-renderer.component';
import { UiTableFacade } from './ui-table.facade';

/**
 * TECHNICAL EXCEPTION - Violation 2 (Raw Form Elements):
 * This component is an approved canvas widget rendering/simulation exception.
 * It uses raw HTML elements to simulate dynamic layouts and customizable styling properties
 * (dynamic colors, custom border shape/sizes/paddings) which standard Qo components would override.
 */
@Component({
  selector: 'app-table-widget',
  standalone: true,
  imports: [UiTableWidgetRendererComponent],
  providers: [UiTableFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--app-table-widget-bg]': 'facade.resolvedConfig().backgroundColor',
    '[style.--app-table-widget-border]': 'facade.resolvedConfig().borderColor',
    '[style.--app-table-widget-radius]': 'facade.resolvedConfig().borderRadius',
    '[style.--app-table-widget-rows]': 'facade.resolvedConfig().rowsPerPage',
  },
  templateUrl: './ui-table-widget.component.html',
  styleUrl: './ui-table-widget.component.scss',
})
export class UiTableWidgetComponent {
  protected readonly facade = inject(UiTableFacade);

  readonly config = input<TableWidgetConfig>(createDefaultTableWidgetConfig());
  readonly widgetId = input<string>('');
  readonly widgetLabel = input<string>('');

  constructor() {
    effect(() => {
      this.facade.config.set(this.config());
    });
    effect(() => {
      this.facade.widgetId.set(this.widgetId());
    });
    effect(() => {
      this.facade.widgetLabel.set(this.widgetLabel());
    });
  }
}

