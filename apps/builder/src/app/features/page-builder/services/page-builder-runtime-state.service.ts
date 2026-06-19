import { Injectable, computed, effect, signal } from '@angular/core';
import {
  PageBuilderMockDatasourceRow,
  getPageBuilderMockDatasources,
  getPageBuilderMockQueryOptions,
  getPageBuilderMockQueryRows,
} from '@builder/features/page-builder/services/page-builder-mock-datasource.service';

export interface PageBuilderRuntimeDatasourceState {
  data: PageBuilderMockDatasourceRow[];
  isLoading: boolean;
  error: string | null;
  queries?: Record<string, PageBuilderRuntimeQueryState>;
}

export interface PageBuilderRuntimeQueryState {
  data: PageBuilderMockDatasourceRow[];
  isLoading: boolean;
  error: string | null;
  resultKind?: 'query' | 'table';
  displayLabel?: string;
  datasourceId?: string;
}

export interface PageBuilderRuntimeState {
  datasources: Record<string, PageBuilderRuntimeDatasourceState>;
  widgets: Record<string, unknown>;
  globals: Record<string, unknown>;
}

export const pageBuilderRuntimeDatasources = signal<Record<string, PageBuilderRuntimeDatasourceState>>({});
export const pageBuilderRuntimeWidgets = signal<Record<string, unknown>>({
  SalesSummaryPanel: {
    value: '182 Lakhs',
    rawValue: 182,
    title: 'Revenue Overview',
    subtitle: 'Average revenue across assets',
    caption: 'Datasource-driven KPI',
    trend: 'Rolling average',
    sourceType: 'aggregation',
    state: 'ready',
    message: 'Calculated from 4 rows',
    totalRows: 4,
    filteredRows: 4,
    matchedRows: 0,
  },
  AssetTable: {
    selectedRow: {
      id: 'asset-001',
      code: 'KOTS-001',
      display_name: 'KOTS Prime',
      city: 'Bengaluru',
      status: 'Available',
      revenue_lakhs: 182,
      occupancy_pct: 91,
    },
    data: [
      {
        id: 'asset-001',
        code: 'KOTS-001',
        display_name: 'KOTS Prime',
        city: 'Bengaluru',
        status: 'Available',
        revenue_lakhs: 182,
        occupancy_pct: 91,
      },
      {
        id: 'asset-002',
        code: 'KOTS-002',
        display_name: 'KOTS Elite',
        city: 'Hyderabad',
        status: 'Booked',
        revenue_lakhs: 146,
        occupancy_pct: 87,
      },
    ],
  },
  OccupancyChart: {
    value: '87.75%',
    rawValue: 87.75,
    selectedSeries: 'Q2',
  },
});
export const pageBuilderRuntimeGlobals = signal<Record<string, unknown>>({
  currentUser: {
    name: 'Admin',
    email: 'admin@test.com',
  },
  pageTitle: 'Builder KPI Demo',
  selectedCity: 'Bengaluru',
  selectedDepartment: 'Sales',
  selectedQuarter: 'Q2',
  portfolioStats: {
    totalAssets: 4,
    activeAssets: 3,
    averageOccupancy: 87.75,
    averageRevenueLakhs: 163.5,
  },
  filters: {
    city: 'Bengaluru',
    status: 'Available',
  },
});

export function getPageBuilderRuntimeStateSnapshot(): PageBuilderRuntimeState {
  return {
    datasources: pageBuilderRuntimeDatasources(),
    widgets: pageBuilderRuntimeWidgets(),
    globals: pageBuilderRuntimeGlobals(),
  };
}

export function setPageBuilderRuntimeWidgetState(key: string, value: unknown): void {
  const current = getPageBuilderRuntimeStateSnapshot();
  const existing = current.widgets[key];
  if (existing !== undefined && JSON.stringify(existing) === JSON.stringify(value)) {
    return;
  }

  pageBuilderRuntimeWidgets.update((state) => ({
    ...state,
    [key]: value,
  }));
}

@Injectable({ providedIn: 'root' })
export class PageBuilderRuntimeStateService {
  readonly datasources = pageBuilderRuntimeDatasources;
  readonly widgets = pageBuilderRuntimeWidgets;
  readonly globals = pageBuilderRuntimeGlobals;
  readonly runtimeState = computed<PageBuilderRuntimeState>(() => ({
    datasources: this.datasources(),
    widgets: this.widgets(),
    globals: this.globals(),
  }));

  constructor() {
    effect(() => {
      const queryOptions = getPageBuilderMockQueryOptions();
      const datasourceEntries = getPageBuilderMockDatasources().map((datasource) => {
        const queryEntries = queryOptions
          .filter((query) => query.datasourceId === datasource.id)
            .map((query) => [
              query.value,
              {
                data: getPageBuilderMockQueryRows(query.value).map((row) => ({ ...row })),
                isLoading: false,
                error: null,
                resultKind: query.resultKind,
                displayLabel: query.label,
                datasourceId: datasource.id,
              },
            ] as const);

        return [
          datasource.id,
          {
            data: datasource.data.map((row) => ({ ...row })),
            isLoading: false,
            error: null,
            queries: Object.fromEntries(queryEntries),
          },
        ] as const;
      });

      this.datasources.update((current) => ({
        ...current,
        ...Object.fromEntries(datasourceEntries),
      }));
    });
  }

  setDatasourceResult(key: string, rows: PageBuilderMockDatasourceRow[]): void {
    this.datasources.update((current) => ({
      ...current,
      [key]: {
        data: rows.map((row) => ({ ...row })),
        isLoading: false,
        error: null,
      },
    }));
  }

  setWidgetState(key: string, value: unknown): void {
    setPageBuilderRuntimeWidgetState(key, value);
  }

  setGlobalState(key: string, value: unknown): void {
    this.globals.update((current) => ({
      ...current,
      [key]: value,
    }));
  }
}

