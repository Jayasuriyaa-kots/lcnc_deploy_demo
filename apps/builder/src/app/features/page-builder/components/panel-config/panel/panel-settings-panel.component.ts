import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { PanelWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { DataBindingEditorComponent } from '@builder/shared/ui/data-binding-editor/data-binding-editor.component';
import {
  QoButtonComponent,
  QoColorPickerComponent,
  QoInputComponent,
  QoSelectComponent,
  SelectOption,
} from '@qo/ui-components';
import { PanelSettingsFacade } from '@builder/features/page-builder/facades/panel-config/panel-settings.facade';

type PanelSectionId = 'card' | 'value' | 'icon' | 'caption';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-panel-settings-panel',
  standalone: true,
  imports: [CommonModule,
    DataBindingEditorComponent,
    QoButtonComponent,
    QoColorPickerComponent,
    QoInputComponent,
    QoSelectComponent,
    TranslocoPipe,
  ],
  templateUrl: './panel-settings-panel.component.html',
  styleUrl: './panel-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PanelSettingsFacade],
})
export class PanelSettingsPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  protected readonly facade = inject(PanelSettingsFacade);

  readonly config = input<PanelWidgetConfig>();
  readonly rightTab = input<PanelRightTab>('display');
  readonly selectedSectionId = input<PanelSectionId>('card');
  readonly colorPickerPalette = input<string[]>([]);

  readonly configChange = output<PanelWidgetConfig>();
  readonly sectionSelected = output<PanelSectionId>();

  readonly aggregationTypeOptions: SelectOption[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'average', label: 'Average' },
    { value: 'median', label: 'Median' },
    { value: 'count', label: 'Count' },
    { value: 'distinct_count', label: 'Distinct Count' },
  ];

  readonly operatorOptions: SelectOption[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'lessThan', label: 'Less than' },
  ];

  readonly panelLayoutOptions: SelectOption[] = [
    { value: 'simple-value-top', label: 'Value above caption' },
    { value: 'simple-value-bottom', label: 'Caption above value' },
    { value: 'icon-center-value-top', label: 'Centered icon, value above' },
    { value: 'icon-center-value-bottom', label: 'Centered icon, value below' },
    { value: 'icon-left-value-top', label: 'Icon left, value below title' },
    { value: 'icon-left-value-bottom', label: 'Icon left, value above title' },
    { value: 'icon-right-value-top', label: 'Icon right, value above' },
    { value: 'icon-right-value-bottom', label: 'Icon right, value below' },
    { value: 'icon-inline-center-title-top', label: 'Centered inline, title top' },
    { value: 'icon-inline-center-title-bottom', label: 'Centered inline, title bottom' },
    { value: 'icon-inline-split-title-top', label: 'Split inline, title top' },
    { value: 'icon-inline-split-title-bottom', label: 'Split inline, title bottom' },
  ];

  readonly panelAlignmentOptions: SelectOption[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];

  readonly panelIconPlacementOptions: SelectOption[] = [
    { value: 'before', label: 'Before value' },
    { value: 'after', label: 'After value' },
  ];

  readonly panelIconOptions: SelectOption[] = [
    { value: 'trending_up', label: 'Trending up' },
    { value: 'confirmation_number', label: 'Ticket' },
    { value: 'groups', label: 'Users' },
    { value: 'mail', label: 'Mail' },
    { value: 'query_stats', label: 'Analytics' },
    { value: 'person', label: 'Visitor' },
    { value: 'inventory_2', label: 'Inventory' },
    { value: 'payments', label: 'Payments' },
  ];

  readonly presetOptions: SelectOption[] = [
    { value: 'revenue_kpi', label: 'Revenue KPI Card' },
    { value: 'occupancy_percentage', label: 'Occupancy Percentage Card' },
    { value: 'asset_summary', label: 'Asset Summary Card' },
  ];

  readonly formulaTypeOptions: SelectOption[] = [{ value: 'kpi-percentage', label: 'KPI Percentage' }];

  readonly panelSectionOptions = [
    { id: 'card', label: 'Card' },
    { id: 'value', label: 'Value' },
    { id: 'icon', label: 'Icon' },
    { id: 'caption', label: 'Copy' },
  ] as const;

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (cfg) {
        this.facade.config.set(cfg);
      }
    });

    effect(() => {
      this.facade.configChange.set((cfg) => {
        this.configChange.emit(cfg);
      });
    });
  }

  selectSection(sectionId: PanelSectionId): void {
    this.sectionSelected.emit(sectionId);
  }

  panelSectionLabel(): string {
    switch (this.selectedSectionId()) {
      case 'value':
        return 'Value';
      case 'icon':
        return 'Icon';
      case 'caption':
        return 'Copy';
      default:
        return 'Card';
    }
  }
}
