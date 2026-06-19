import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BindableInputComponent } from '@builder/shared/ui/bindable-input/bindable-input.component';
import {
  QoInputComponent,
  QoSelectComponent,
  QoColorPickerComponent,
  SelectOption,
} from '@qo/ui-components';
import { SearchCriteriaModalComponent, SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import { ChartWidgetConfig, createDefaultChartWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ChartSettingsFacade } from '@builder/features/page-builder/facades/panel-config/chart-settings.facade';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-chart-settings-panel',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    BindableInputComponent,
    QoSelectComponent,
    QoInputComponent,
    SearchCriteriaModalComponent,
    QoColorPickerComponent,
    TranslocoPipe,
  ],
  templateUrl: './chart-settings-panel.component.html',
  styleUrl: './chart-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChartSettingsFacade],
})
export class ChartSettingsPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  protected readonly facade = inject(ChartSettingsFacade);

  readonly widgetId = input('');
  readonly config = input<ChartWidgetConfig>(createDefaultChartWidgetConfig());
  readonly chartType = input<ChartType>('line');
  readonly rightTab = input<'display' | 'style'>('display');
  readonly colorPickerPalette = input<string[]>([]);
  readonly configChange = output<ChartWidgetConfig>();
  readonly sourceFormChange = output<string>();

  readonly selectedRecordOperatorOptions: SelectOption[] = [
    { value: '', label: '- Select Operator -' },
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts With' },
  ];

  readonly aggregateTypeOptions: SelectOption[] = [
    { value: '', label: 'Select function' },
    { value: 'sum', label: 'SUM' },
    { value: 'avg', label: 'AVG' },
    { value: 'min', label: 'MIN' },
    { value: 'max', label: 'MAX' },
    { value: 'count', label: 'COUNT' },
    { value: 'count-distinct', label: 'COUNT DISTINCT' },
  ];

  constructor() {
    effect(() => {
      this.facade.widgetId.set(this.widgetId());
    });

    effect(() => {
      this.facade.config.set(this.config());
    });

    effect(() => {
      this.facade.chartType.set(this.chartType());
    });

    effect(() => {
      this.facade.configChange.set((cfg) => {
        this.configChange.emit(cfg);
      });
    });

    effect(() => {
      this.facade.sourceFormChange.set((sf) => {
        this.sourceFormChange.emit(sf);
      });
    });
  }

  valueType(): 'aggregate' | 'actual' {
    return this.config().valueType;
  }

  recordScope(): 'all' | 'selected' {
    return this.config().recordScope;
  }

  selectedRecordCriteriaRows(): SearchCriteriaRow[] {
    return this.config().selectedRecordCriteriaRows;
  }

  isDisplayTab(): boolean {
    return this.rightTab() === 'display';
  }

  isStyleTab(): boolean {
    return this.rightTab() === 'style';
  }
}
