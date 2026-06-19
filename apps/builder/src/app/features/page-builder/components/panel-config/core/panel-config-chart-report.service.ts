import { Injectable } from '@angular/core';
import { VisibilitySection } from '@builder/features/page-builder/components/panel-config/report/visibility-panel';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import {
  ChartWidgetConfig,
  ReportWidgetConfig,
  createDefaultChartWidgetConfig,
  createDefaultReportWidgetVisibilityConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

@Injectable({ providedIn: 'root' })
export class PanelConfigChartReportService {
  cloneChartDraftConfig(config: ChartWidgetConfig): ChartWidgetConfig {
    return {
      ...config,
      aggregateValue: { tab: config.aggregateValue?.tab ?? null, value: config.aggregateValue?.value ?? null },
      filterDataBasedOn: [...(config.filterDataBasedOn ?? [])],
      selectedRecordCriteriaRows: (config.selectedRecordCriteriaRows ?? []).map((row) => ({ ...row })),
    };
  }

  createReportUiState(reportConfig: ReportWidgetConfig | undefined): {
    sections: VisibilitySection[];
    allowPublicAccess: boolean;
  } {
    const defaultVisibility = createDefaultReportWidgetVisibilityConfig();
    const visibility = reportConfig?.visibility ?? defaultVisibility;
    return {
      sections: [
        {
          title: 'Search & Filters',
          items: [
            { label: 'Search', key: 'search', value: visibility.search },
            { label: 'Retain Changes', key: 'retain', value: visibility.retain },
          ],
        },
        {
          title: 'Print & Export',
          items: [
            { label: 'Print', key: 'print', value: visibility.print },
            { label: 'Export', key: 'export', value: visibility.export },
          ],
        },
        {
          title: 'Miscellaneous',
          items: [{ label: 'Records count', key: 'recordsCount', value: visibility.recordsCount }],
        },
      ],
      allowPublicAccess: reportConfig?.allowPublicAccess ?? false,
    };
  }

  createDefaultVisibilitySections(): VisibilitySection[] {
    return [
      {
        title: 'Search & Filters',
        items: [
          { label: 'Search', key: 'search', value: true },
          { label: 'Retain Changes', key: 'retain', value: false },
        ],
      },
      {
        title: 'Print & Export',
        items: [
          { label: 'Print', key: 'print', value: true },
          { label: 'Export', key: 'export', value: true },
        ],
      },
      {
        title: 'Miscellaneous',
        items: [{ label: 'Records count', key: 'records_count', value: true }],
      },
    ];
  }

  updateReportVisibilitySections(
    sections: VisibilitySection[],
    change: { key: string; value: boolean },
  ): VisibilitySection[] {
    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) => (item.key === change.key ? { ...item, value: change.value } : item)),
    }));
  }

  createChartFormSelectionState(currentDraft: ChartWidgetConfig, form: { id: string; name: string }) {
    const nextConfig: ChartWidgetConfig = {
      ...currentDraft,
      datasourceId: form.id,
      datasourceLabel: form.name,
      queryId: '',
      xAxisCategory: '',
      yAxisField: '',
      yAxisStackBy: '',
      filterDataBasedOn: [],
      selectedRecordCriteriaRows: [],
    };
    return {
      panelStatePatch: { selectedFormId: form.id, selectedChartFormName: form.name, chartPanelStep: 'settings' as const },
      nextConfig,
    };
  }

  createChartSourceSelectionState(currentDraft: ChartWidgetConfig, formId: string, selectedFormName?: string) {
    const normalizedFormId = formId.trim();
    if (!normalizedFormId || normalizedFormId === currentDraft.datasourceId) {
      return null;
    }
    const nextConfig: ChartWidgetConfig = {
      ...currentDraft,
      datasourceId: normalizedFormId,
      datasourceLabel: selectedFormName ?? currentDraft.datasourceLabel,
      queryId: '',
      xAxisCategory: '',
      yAxisField: '',
      yAxisStackBy: '',
      filterDataBasedOn: [],
      selectedRecordCriteriaRows: [],
    };
    return {
      panelStatePatch: { selectedFormId: normalizedFormId, selectedChartFormName: selectedFormName ?? '' },
      nextConfig,
    };
  }

  getNextChartConfig(currentConfig: ChartWidgetConfig, incomingConfig: ChartWidgetConfig): ChartWidgetConfig | null {
    const nextConfig = this.normalizeChartConfigForCompare(incomingConfig);
    const normalizedCurrent = this.normalizeChartConfigForCompare(currentConfig);
    return JSON.stringify(normalizedCurrent) === JSON.stringify(nextConfig) ? null : nextConfig;
  }

  hasConfiguredCriteria(rows: SearchCriteriaRow[]): boolean {
    return rows.some((row) => row.field.trim() && row.operator.trim() && row.value.trim());
  }

  createCriteriaRow(prefix = 'report-criteria'): SearchCriteriaRow {
    return { id: `${prefix}-${Math.random().toString(36).slice(2, 10)}`, field: '', operator: '', value: '', joiner: 'AND' };
  }

  formatCriteriaOperator(operator: string): string {
    switch (operator) {
      case 'notEquals':
        return '!=';
      case 'contains':
        return 'contains';
      case 'equals':
      default:
        return '=';
    }
  }

  createReportFilterRowsPatch(rows: SearchCriteriaRow[]): { reportCriteriaRows: SearchCriteriaRow[] } {
    return { reportCriteriaRows: rows };
  }

  createReportFilterDonePatch(
    rows: SearchCriteriaRow[],
  ): { reportCriteriaRows: SearchCriteriaRow[]; reportFilterConfigured: boolean } {
    return { reportCriteriaRows: rows, reportFilterConfigured: this.hasConfiguredCriteria(rows) };
  }

  createClearedReportFilterPatch(): { reportCriteriaRows: SearchCriteriaRow[]; reportFilterConfigured: false } {
    return { reportCriteriaRows: [this.createCriteriaRow()], reportFilterConfigured: false };
  }

  buildReportConfig(
    currentConfig: ReportWidgetConfig | null | undefined,
    sections: VisibilitySection[],
    allowPublicAccess: boolean,
    filterCriteriaRows: SearchCriteriaRow[],
    filterConfigured: boolean,
  ): ReportWidgetConfig | null {
    if (!currentConfig) {
      return null;
    }
    const visibility = sections.reduce<Record<string, boolean>>((acc, section) => {
      for (const item of section.items) {
        acc[item.key] = item.value;
      }
      return acc;
    }, {});
    return {
      ...currentConfig,
      visibility: {
        ...createDefaultReportWidgetVisibilityConfig(),
        add: visibility.add ?? true,
        edit: visibility.edit ?? true,
        delete: visibility.delete ?? true,
        duplicate: visibility.duplicate ?? true,
        search: visibility.search ?? true,
        retain: visibility.retain ?? false,
        print: visibility.print ?? true,
        export: visibility.export ?? true,
        recordsCount: visibility.recordsCount ?? true,
        bulkEdit: visibility.bulkEdit ?? true,
        bulkDelete: visibility.bulkDelete ?? true,
        bulkDuplicate: visibility.bulkDuplicate ?? true,
      },
      allowPublicAccess,
      filterCriteriaRows: filterCriteriaRows.map((row) => ({ ...row })),
      filterConfigured,
    };
  }

  private normalizeChartConfigForCompare(config: ChartWidgetConfig): ChartWidgetConfig {
    return {
      ...createDefaultChartWidgetConfig(),
      ...config,
      aggregateValue: { tab: config.aggregateValue?.tab ?? null, value: config.aggregateValue?.value ?? null },
      filterDataBasedOn: [...(config.filterDataBasedOn ?? [])],
      selectedRecordCriteriaRows: (config.selectedRecordCriteriaRows ?? []).map((row) => ({ ...row })),
    };
  }
}
