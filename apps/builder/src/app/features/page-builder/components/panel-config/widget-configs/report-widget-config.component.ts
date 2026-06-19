import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PanelConfigFacade } from '@builder/features/page-builder/facades/panel-config/panel-config.facade';
import { VisibilityPanelComponent } from '@builder/features/page-builder/components/panel-config/report/visibility-panel';
import { SearchCriteriaModalComponent, SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import { CanvasWidget, ReportWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelConfigState, PanelReportTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';
import { QoButtonComponent, SelectOption } from '@qo/ui-components';

@Component({
  selector: 'app-report-widget-config',
  standalone: true,
  imports: [CommonModule,
    VisibilityPanelComponent,
    SearchCriteriaModalComponent,
    QoButtonComponent,
    TranslocoPipe,
  ],
  templateUrl: './report-widget-config.component.html',
  styleUrl: './report-widget-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportWidgetConfigComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly panelFacade = input.required<PanelConfigFacade>();

  readonly selectedWidget = input<CanvasWidget | null>(null);
  readonly panelState = input.required<PanelConfigState>();
  readonly reportFieldOptions = input<readonly SelectOption[]>([]);

  readonly panelStateChange = output<Partial<PanelConfigState>>();
  readonly reportConfigChange = output<ReportWidgetConfig>();

  protected get facade(): PanelConfigFacade {
    return this.panelFacade();
  }

  reportTab(): PanelReportTab {
    return this.panelState().reportTab;
  }

  reportFilterConfigured(): boolean {
    return this.panelState().reportFilterConfigured;
  }

  setReportTab(tab: PanelReportTab): void {
    this.panelStateChange.emit({ reportTab: tab });
  }

  openReportFilterModal(): void {
    this.facade.openReportFilterModal();
  }

  closeReportFilterModal(): void {
    this.facade.closeReportFilterModal();
  }

  updateReportVisibilityItem(change: { key: string; value: boolean }): void {
    this.facade.updateReportVisibilityItem(change);
    this.emitReportConfigChange();
  }

  onReportAllowPublicAccessChanged(value: boolean): void {
    this.facade.setReportAllowPublicAccess(value);
    this.emitReportConfigChange();
  }

  onReportFilterRowsChange(rows: SearchCriteriaRow[]): void {
    this.panelStateChange.emit(this.facade.createReportFilterRowsPatch(rows));
  }

  onReportFilterDone(rows: SearchCriteriaRow[]): void {
    const patch = this.facade.createReportFilterDonePatch(rows);
    this.panelStateChange.emit(patch);
    const configured = patch.reportFilterConfigured;
    this.emitReportConfigChange(rows, configured);
    this.facade.closeReportFilterModal();
  }

  clearReportFilter(): void {
    const patch = this.facade.createClearedReportFilterPatch();
    const rows = patch.reportCriteriaRows;
    this.panelStateChange.emit(patch);
    this.emitReportConfigChange(rows, false);
  }

  readonly reportFilterExpression = computed(() => {
    const rows = this.panelState().reportCriteriaRows.filter(
      (row) => row.field.trim() || row.operator.trim() || row.value.trim(),
    );

    if (!rows.length) {
      return '';
    }

    return rows
      .map((row, index) => {
        const field = row.field || 'Employee_ID.prefix';
        const operator = this.facade.formatCriteriaOperator(row.operator);
        const value = row.value || '"?"';
        const clause = `((${field} ${operator} "${value}"))`;
        return index === 0 ? clause : `${row.joiner} ${clause}`;
      })
      .join(' ');
  });

  private emitReportConfigChange(
    filterCriteriaRows: SearchCriteriaRow[] = this.panelState().reportCriteriaRows,
    filterConfigured: boolean = this.panelState().reportFilterConfigured,
  ): void {
    const nextConfig = this.facade.buildReportConfig(
      this.selectedWidget()?.widgetProps?.reportConfig,
      this.facade.reportVisibilitySections(),
      this.facade.reportAllowPublicAccess(),
      filterCriteriaRows,
      filterConfigured,
    );

    if (!nextConfig) {
      return;
    }

    this.reportConfigChange.emit(nextConfig);
  }
}
