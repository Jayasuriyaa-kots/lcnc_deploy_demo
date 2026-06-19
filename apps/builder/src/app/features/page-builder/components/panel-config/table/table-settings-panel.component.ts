import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BindableInputComponent } from '@builder/shared/ui/bindable-input/bindable-input.component';
import { QoButtonComponent, QoInputComponent, QoSelectComponent, QoToggleComponent, SelectOption } from '@qo/ui-components';
import {
  createDefaultTableWidgetConfig,
  TableWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { TableSettingsFacade } from '@builder/features/page-builder/facades/panel-config/table-settings.facade';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-table-settings-panel',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule, BindableInputComponent, QoButtonComponent, QoInputComponent, QoSelectComponent, QoToggleComponent,
    TranslocoPipe,
  ],
  templateUrl: './table-settings-panel.component.html',
  styleUrl: './table-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TableSettingsFacade],
})
export class TableSettingsPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  protected readonly facade = inject(TableSettingsFacade);

  readonly label = input('Table');
  readonly config = input<TableWidgetConfig>(createDefaultTableWidgetConfig());

  readonly labelChange = output<string>();
  readonly configChange = output<TableWidgetConfig>();
  readonly connectDatabaseRequested = output<void>();

  readonly rowsPerPageOptions: SelectOption[] = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
  ];

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (cfg) {
        this.facade.config.set(cfg);
        const datasourceId = cfg.dataSourceKey ?? '';
        const queryId = cfg.queryId ?? '';
        const queryBinding = cfg.queryBinding || '';

        if (!this.facade.connectModalOpen()) {
          if (datasourceId !== this.facade.selectedDataSource()) {
            this.facade.selectedDataSource.set(datasourceId);
          }
          if (queryId !== this.facade.selectedQuery()) {
            this.facade.selectedQuery.set(queryId);
          }
          if (queryBinding !== this.facade.selectedQueryBinding()) {
            this.facade.selectedQueryBinding.set(queryBinding);
          }
        }
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const columnConfigs = this.config().columnConfigs;
      const selectedKey = this.facade.selectedColumnKey();

      if (!columnConfigs.length) {
        if (selectedKey) {
          this.facade.selectedColumnKey.set('');
        }
        return;
      }

      if (!selectedKey || !columnConfigs.some((column) => column.key === selectedKey)) {
        this.facade.selectedColumnKey.set(columnConfigs[0]?.key ?? '');
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.facade.configChange.set((cfg) => {
        this.configChange.emit(cfg);
      });
    });
  }

  updateLabel(value: string): void {
    const nextValue = value.trim() || 'Table';
    this.labelChange.emit(nextValue);
  }

  requestDatabaseConnect(): void {
    this.connectDatabaseRequested.emit();
    this.facade.requestDatabaseConnect();
  }

  toLabel(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }
}
