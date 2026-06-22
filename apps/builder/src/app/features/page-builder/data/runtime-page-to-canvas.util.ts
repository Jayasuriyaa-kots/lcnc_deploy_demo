import {
  CanvasWidget,
  ChartWidgetConfig,
  PanelWidgetConfig,
  TableWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import type { DataframeConfig, PageConfig, PageWidget } from '@builder/runtime/models/app-config.model';

// ─────────────────────────────────────────────────────────────────────────────
// Convert a runtime JSON page (config.pages[]) into Page Builder canvas widgets.
//
// The runtime config describes dashboard widgets in a 12-column grid
// (layout {x,y,w,h}); the Page Builder canvas works in pixels. This maps each
// kpi / chart / dataframe widget into a fully-formed CanvasWidget so a loaded
// config's dashboard actually paints on the authoring canvas.
// ─────────────────────────────────────────────────────────────────────────────

// Design tokens (mirror page-canvas-default-widgets.data.ts)
const SFC = 'var(--qo-color-neutral-0)';
const TXT = 'var(--qo-color-neutral-900)';
const BDR = 'var(--qo-border-color)';
const RXL = 'var(--qo-radius-xl)';
const RSM = 'var(--qo-radius-sm)';

// 12-col grid → pixel conversion (canvas usable width = 1224px)
const CANVAS_W = 1224;
const COL_UNIT = CANVAS_W / 12; // 102px per grid column
const ROW_UNIT = 72;            // px per grid row
const GAP = 12;                 // horizontal gap between adjacent widgets

const px = (gridX: number) => Math.round(gridX * COL_UNIT);

/** Runtime chartType → Page Builder ChartType (no pie/donut on the canvas). */
function mapChartType(t: unknown): ChartType {
  switch (t) {
    case 'bar': return 'bar';
    case 'line': return 'line';
    case 'area': return 'area';
    case 'column': return 'column';
    case 'pie':
    case 'donut':
    default: return 'column';
  }
}

function titleCase(entity: string): string {
  return entity.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function panelWidget(w: PageWidget): CanvasWidget {
  const c = w.config as Record<string, unknown>;
  const value = typeof c['prefix'] === 'string' ? `${c['prefix']}—` : '—';
  const panelConfig: PanelWidgetConfig = {
    visible: true,
    title: String(c['title'] ?? 'Metric'),
    value,
    subtitle: c['entity'] ? titleCase(String(c['entity'])) : '',
    caption: [c['metric'], c['field']].filter(Boolean).join(' · '),
    trend: '',
    suffix: typeof c['suffix'] === 'string' ? c['suffix'] : '',
    titleColor: TXT,
    iconSymbol: String(c['icon'] ?? 'insights'),
    iconBackgroundColor: String(c['color'] ?? '#2563eb'),
    iconColor: '#ffffff',
    valueColor: '#111827',
    backgroundColor: SFC,
    borderColor: BDR,
    borderRadius: RXL,
    alignment: 'right',
    iconPlacement: 'before',
    layoutVariant: 'icon-left-value-top',
    sourceType: 'text',
    datasourceId: String(c['entity'] ?? ''),
    queryId: '',
    field: String(c['field'] ?? ''),
    aggregationType: (c['metric'] as PanelWidgetConfig['aggregationType']) ?? 'count',
    filters: [],
    condition: null,
    staticText: value,
    bindingExpression: '',
    presetId: '',
  };
  return {
    id: w.id, type: 'panel-showcase',
    x: px(w.layout.x), y: w.layout.y * ROW_UNIT,
    width: px(w.layout.w) - GAP, height: w.layout.h * ROW_UNIT,
    label: panelConfig.title, widgetProps: { panelConfig },
  };
}

function chartWidget(w: PageWidget): CanvasWidget {
  const c = w.config as Record<string, unknown>;
  const colorScheme = Array.isArray(c['colorScheme']) ? (c['colorScheme'] as string[]) : [];
  const chartType = mapChartType(c['chartType']);
  const chartConfig: ChartWidgetConfig = {
    datasourceId: String(c['entity'] ?? ''),
    datasourceLabel: c['entity'] ? titleCase(String(c['entity'])) : '',
    queryId: '',
    queryBinding: '',
    xAxisCategory: String(c['groupByField'] ?? ''),
    xAxisLabel: String(c['groupByField'] ?? ''),
    yAxisField: String(c['valueField'] ?? c['aggregateField'] ?? ''),
    yAxisStackBy: '',
    aggregateValue: { tab: null, value: null },
    yAxisLabel: '',
    interval: '',
    filterDataBasedOn: [],
    showDataLabel: true,
    showUnderlyingData: false,
    valueType: 'aggregate',
    recordScope: 'all',
    selectedRecordCriteriaRows: [],
    chartColor: colorScheme[0] ?? '#2563eb',
    chartColorSecondary: colorScheme[1] ?? '',
  };
  return {
    id: w.id, type: 'chart-showcase',
    x: px(w.layout.x), y: w.layout.y * ROW_UNIT,
    width: px(w.layout.w) - GAP, height: w.layout.h * ROW_UNIT,
    label: String(c['title'] ?? 'Chart'),
    chartType, chartTypeLabel: chartType,
    widgetProps: { chartConfig },
  };
}

function tableWidget(w: PageWidget, dataframes: DataframeConfig[]): CanvasWidget {
  const c = w.config as Record<string, unknown>;
  const df = dataframes.find((d) => d.id === c['dataframeId']);
  const cols = df?.columns ?? [];
  const tableConfig: TableWidgetConfig = {
    visible: true,
    rowsPerPage: typeof c['pageSize'] === 'number' ? c['pageSize'] : 10,
    tableSize: 'default',
    backgroundColor: SFC,
    borderColor: BDR,
    borderRadius: RSM,
    showSearch: c['showSearch'] !== false,
    showDownload: true,
    showSorting: true,
    showColumnFilters: true,
    enableAdd: false,
    enableEdit: false,
    enableDelete: false,
    enableDuplicate: false,
    dataSourceKey: df?.entity ?? '',
    queryId: '',
    queryBinding: '',
    dataColumns: cols.map((col) => col.field),
    columnConfigs: cols.map((col, i) => ({
      key: col.field, label: col.header, visible: true, order: i,
      width: 150, align: 'left' as const, type: 'text' as const,
    })),
    dataRows: [],
  };
  return {
    id: w.id, type: 'table-showcase',
    x: px(w.layout.x), y: w.layout.y * ROW_UNIT,
    width: px(w.layout.w) - GAP, height: w.layout.h * ROW_UNIT,
    label: String(c['title'] ?? df?.name ?? 'Table'),
    widgetProps: { tableConfig },
  };
}

/**
 * Convert a runtime page's widgets into canvas widgets. Unsupported widget
 * types (form/richtext/image/divider) are skipped. Returns [] if the page has
 * no convertible widgets.
 */
export function convertRuntimePageToCanvas(
  page: PageConfig | undefined,
  dataframes: DataframeConfig[],
): CanvasWidget[] {
  if (!page?.widgets?.length) return [];
  const out: CanvasWidget[] = [];
  for (const w of page.widgets) {
    if (w.type === 'kpi') out.push(panelWidget(w));
    else if (w.type === 'chart') out.push(chartWidget(w));
    else if (w.type === 'dataframe' || w.type === 'table') out.push(tableWidget(w, dataframes));
  }
  return out;
}
