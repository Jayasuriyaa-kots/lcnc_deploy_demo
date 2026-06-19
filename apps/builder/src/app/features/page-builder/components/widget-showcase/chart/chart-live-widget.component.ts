import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartDataset, ChartOptions, registerables, Chart } from 'chart.js';
import { resolvePageBuilderExpression } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import { getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import { ChartType as BuilderChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import { ChartWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';

Chart.register(...registerables);

type PageBuilderChartType = 'scatter' | 'radar' | 'bar' | 'line';
type PageBuilderChartPoint = number | { x: number | string; y: number };

interface StructuredChartDataset {
  label: string;
  data: number[];
  color: string;
}

interface StructuredChartData {
  labels: string[];
  datasets: StructuredChartDataset[];
}

interface ChartVisualModel {
  accent: string;
  accentSoft: string;
  categories: string[];
  directDatasets?: StructuredChartDataset[];
  hasComparisonSeries: boolean;
  hasStack: boolean;
  pointLabels: string[];
  rawSeriesA: number[];
  rawSeriesB: number[];
  seriesA: number[];
  seriesB: number[];
  showDataLabel: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
}

@Component({
  selector: 'app-chart-live-widget',
  standalone: true,
  imports: [BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart-live-widget.component.html',
  styleUrl: './chart-live-widget.component.scss',
})
export class ChartLiveWidgetComponent {
  readonly type = input.required<BuilderChartType>();
  readonly config = input<ChartWidgetConfig | null>(null);
  readonly interactive = input(true);

  readonly visual = computed<ChartVisualModel>(() =>
    buildVisualModel(this.config()),
  );

  readonly chartType = computed<PageBuilderChartType>(() => {
    const type = this.type();
    if (type === 'scatter') return 'scatter';
    if (type === 'web') return 'radar';
    if (type === 'bar' || type === 'stacked-bar') return 'bar';
    if (type === 'column' || type === 'stacked-column' || type === 'stacked-pct-column') return 'bar';
    return 'line';
  });

  readonly chartData = computed<ChartData<PageBuilderChartType, PageBuilderChartPoint[], string>>(() =>
    buildChartData(this.type(), this.chartType(), this.visual()),
  );

  readonly chartOptions = computed<ChartOptions<PageBuilderChartType>>(() =>
    buildChartOptions(this.type(), this.config(), this.visual(), this.interactive()),
  );
}

function buildVisualModel(config: ChartWidgetConfig | null): ChartVisualModel {
  const valueType = config?.valueType ?? 'aggregate';
  const filterCount = config?.filterDataBasedOn?.length ?? 0;
  const hasStack = !!config?.yAxisStackBy;
  const showDataLabel = !!config?.showDataLabel;
  const recordScope = config?.recordScope ?? 'all';
  const xAxisLabel = normalizeLabel(config?.xAxisLabel || config?.xAxisCategory, 'X');
  const yAxisLabel = normalizeLabel(config?.yAxisLabel || config?.yAxisField || config?.aggregateValue?.value, 'Y');
  const accentRaw = config?.chartColor || (valueType === 'actual' ? 'var(--qo-color-info-500)' : 'var(--qo-color-primary-700)');
  const accentSoftRaw = config?.chartColorSecondary || (hasStack ? 'var(--qo-color-warning-500)' : 'var(--qo-color-neutral-500)');
  const accent = resolveCssVariable(accentRaw);
  const accentSoft = resolveCssVariable(accentSoftRaw);
  const structuredData = config
    ? resolveStructuredChartData(config, accent, accentSoft)
    : null;
  const normalizedStructuredData = config && structuredData
    ? applyStructuredAggregation(structuredData, config, accent)
    : structuredData;
  const groupedData = config
    ? buildGroupedChartData(config)
    : null;

  if (normalizedStructuredData && normalizedStructuredData.labels.length && normalizedStructuredData.datasets.length) {
    const primaryDataset = normalizedStructuredData.datasets[0];
    const comparisonDataset = normalizedStructuredData.datasets[1];

    return {
      accent,
      accentSoft,
      categories: normalizedStructuredData.labels,
      directDatasets: normalizedStructuredData.datasets,
      hasComparisonSeries: normalizedStructuredData.datasets.length > 1,
      hasStack,
      pointLabels: primaryDataset.data.map((value) => `${value}`),
      rawSeriesA: primaryDataset.data,
      rawSeriesB: comparisonDataset?.data ?? [],
      seriesA: scaleCountsToSeries(primaryDataset.data),
      seriesB: comparisonDataset ? scaleCountsToSeries(comparisonDataset.data) : [],
      showDataLabel: showDataLabel,
      xAxisLabel,
      yAxisLabel: normalizeLabel(config?.yAxisLabel, resolveValueLabel(config)),
    };
  }

  if (groupedData && groupedData.counts.length) {
    const scaledSeries = scaleCountsToSeries(groupedData.counts);
    const splitSeries = hasStack ? buildStackedSeries(groupedData.counts) : scaledSeries.map((value) => clamp(value + 8, 24, 78));

    return {
      accent,
      accentSoft,
      categories: groupedData.categories,
      hasComparisonSeries: hasStack,
      hasStack,
      pointLabels: groupedData.counts.map((count) => `${count}`),
      rawSeriesA: groupedData.counts,
      rawSeriesB: hasStack ? groupedData.counts.map((count) => Math.max(0, Math.round(count * 0.4))) : [],
      seriesA: scaledSeries,
      seriesB: splitSeries,
      showDataLabel: true,
      xAxisLabel,
      yAxisLabel: normalizeLabel(config?.yAxisLabel, groupedData.valueLabel),
    };
  }

  const baseA = valueType === 'actual' ? [54, 34, 46, 24, 38] : [62, 44, 50, 30, 40];
  const baseB = valueType === 'actual' ? [66, 54, 60, 42, 50] : [72, 60, 64, 46, 54];
  const scopedOffset = recordScope === 'selected' ? -8 : 0;
  const filteredOffset = filterCount > 0 ? -4 : 0;
  const pointLabels = createPointLabels(config?.aggregateValue?.value ?? '', valueType);

  return {
    accent,
    accentSoft,
    categories: [],
    hasComparisonSeries: hasStack,
    hasStack,
    pointLabels,
    rawSeriesA: baseA.map((value) => 82 - value),
    rawSeriesB: hasStack ? baseB.map((value) => 82 - value) : [],
    seriesA: baseA.map((value, index) => clamp(value + scopedOffset + filteredOffset + (index % 2 === 0 ? 0 : 2), 20, 74)),
    seriesB: baseB.map((value, index) => clamp(value + scopedOffset + filteredOffset - (index % 2 === 0 ? 2 : 0), 24, 78)),
    showDataLabel,
    xAxisLabel,
    yAxisLabel,
  };
}

function buildGroupedChartData(config: ChartWidgetConfig): { categories: string[]; counts: number[]; valueLabel: string } | null {
  if (!config.xAxisCategory) {
    return null;
  }

  const rows = resolveChartRows(config);
  if (!rows.length) {
    return null;
  }

  const configuredOptions = resolveDistinctCategories(config, rows);
  const counts = new Map<string, number>();
  const groupedRows = new Map<string, Array<Record<string, unknown>>>();
  const aggregateField = (config.aggregateValue?.value ?? '').trim();
  const yAxisField = (config.yAxisField ?? '').trim();

  for (const row of rows) {
    const rawValue = row[config.xAxisCategory];
    const key = typeof rawValue === 'string' ? rawValue.trim() || 'Unassigned' : String(rawValue ?? 'Unassigned');
    const bucket = groupedRows.get(key) ?? [];
    bucket.push(row);
    groupedRows.set(key, bucket);
  }

  for (const [key, categoryRows] of groupedRows.entries()) {
    counts.set(key, resolveAggregateMetric(categoryRows, config.valueType, config.aggregateValue?.tab, aggregateField, yAxisField));
  }

  const orderedCategories = configuredOptions.length
    ? configuredOptions.filter((option) => counts.has(option))
    : Array.from(counts.keys());
  const remainingCategories = Array.from(counts.keys()).filter((category) => !orderedCategories.includes(category));
  const categories = [...orderedCategories, ...remainingCategories].slice(0, 5);

  if (!categories.length) {
    return null;
  }

  return {
    categories,
    counts: categories.map((category) => counts.get(category) ?? 0),
    valueLabel: resolveValueLabel(config),
  };
}

function resolveChartRows(config: ChartWidgetConfig): Array<Record<string, unknown>> {
  const binding = config.queryBinding?.trim() ?? '';

  if (binding) {
    const jsonRows = tryParseJsonRows(binding);
    if (jsonRows.length) {
      return jsonRows;
    }

    const resolved = resolvePageBuilderExpression(binding);
    const resolvedRows = coerceResolvedValueToRows(resolved);
    if (resolvedRows.length) {
      return resolvedRows;
    }
  }

  if (!config.datasourceId) {
    return [];
  }

  return getPageBuilderRuntimeRows(config.datasourceId, config.queryId);
}

function resolveDistinctCategories(
  config: ChartWidgetConfig,
  rows: Array<Record<string, unknown>>,
): string[] {
  const seen = new Set<string>();

  return rows
    .map((row) => row[config.xAxisCategory])
    .map((value) => (typeof value === 'string' ? value.trim() : String(value ?? '').trim()))
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
}

function resolveAggregateMetric(
  rows: Array<Record<string, unknown>>,
  valueType: 'aggregate' | 'actual',
  aggregateTab: string | null | undefined,
  aggregateField: string,
  yAxisField: string,
): number {
  if (!rows.length) {
    return 0;
  }

  if (valueType === 'actual') {
    return rows.reduce((sum, row) => sum + resolveNumericMetric(row[yAxisField]), 0);
  }

  if (aggregateTab === 'sum' && aggregateField) {
    return rows.reduce((sum, row) => sum + resolveNumericMetric(row[aggregateField]), 0);
  }

  if (aggregateTab === 'avg' && aggregateField) {
    const values = rows
      .map((row) => resolveNumericMetric(row[aggregateField]))
      .filter((value) => Number.isFinite(value));
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  if (aggregateTab === 'min' && aggregateField) {
    const values = rows
      .map((row) => resolveNumericMetric(row[aggregateField]))
      .filter((value) => Number.isFinite(value));
    return values.length ? Math.min(...values) : 0;
  }

  if (aggregateTab === 'max' && aggregateField) {
    const values = rows
      .map((row) => resolveNumericMetric(row[aggregateField]))
      .filter((value) => Number.isFinite(value));
    return values.length ? Math.max(...values) : 0;
  }

  if (aggregateTab === 'count') {
    if (!aggregateField || aggregateField === 'total_records') {
      return rows.length;
    }

    return rows.reduce((count, row) => count + (hasPresentValue(row[aggregateField]) ? 1 : 0), 0);
  }

  if (aggregateTab === 'count-distinct' && aggregateField) {
    const distinctValues = new Set(
      rows
        .map((row) => normalizeDistinctValue(row[aggregateField]))
        .filter((value): value is string => value !== null),
    );
    return distinctValues.size;
  }

  if (yAxisField) {
    return rows.reduce((sum, row) => sum + resolveNumericMetric(row[yAxisField]), 0);
  }

  return rows.length;
}

function applyStructuredAggregation(
  structuredData: StructuredChartData,
  config: ChartWidgetConfig,
  accent: string,
): StructuredChartData {
  const aggregateTab = config.aggregateValue?.tab ?? null;
  if (!aggregateTab) {
    return structuredData;
  }

  const labels = structuredData.labels;
  const seriesValuesByIndex = labels.map((_, index) =>
    structuredData.datasets
      .map((dataset) => dataset.data[index])
      .filter((value) => Number.isFinite(value)),
  );

  const aggregateValues = seriesValuesByIndex.map((values) => {
    if (!values.length) {
      return 0;
    }

    if (aggregateTab === 'sum') {
      return values.reduce((sum, value) => sum + value, 0);
    }

    if (aggregateTab === 'avg') {
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    if (aggregateTab === 'min') {
      return Math.min(...values);
    }

    if (aggregateTab === 'max') {
      return Math.max(...values);
    }

    if (aggregateTab === 'count') {
      return values.length;
    }

    if (aggregateTab === 'count-distinct') {
      return new Set(values.map((value) => `${value}`)).size;
    }

    return values[0] ?? 0;
  });

  const aggregateLabel = resolveValueLabel(config);

  return {
    labels,
    datasets: [{
      label: aggregateLabel,
      data: aggregateValues,
      color: accent,
    }],
  };
}

function coerceResolvedValueToRows(resolved: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(resolved)) {
    return normalizeResolvedRows(resolved);
  }

  if (resolved && typeof resolved === 'object') {
    const candidate = resolved as Record<string, unknown>;
    if (Array.isArray(candidate['data'])) {
      return normalizeResolvedRows(candidate['data']);
    }

    return normalizeResolvedRows([candidate]);
  }

  return [];
}

function normalizeResolvedRows(rows: unknown[]): Array<Record<string, unknown>> {
  return rows.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
}

function resolveStructuredChartData(
  config: ChartWidgetConfig,
  accent: string,
  accentSoft: string,
): StructuredChartData | null {
  const binding = config.queryBinding?.trim() ?? '';
  if (!binding) {
    return null;
  }

  const parsed = tryParseStructuredChartData(binding, accent, accentSoft);
  if (parsed) {
    return parsed;
  }

  const resolved = resolvePageBuilderExpression(binding);
  return coerceResolvedValueToStructuredChartData(resolved, accent, accentSoft);
}

function tryParseJsonRows(binding: string): Array<Record<string, unknown>> {
  const trimmed = binding.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (Array.isArray(parsed)) {
      return normalizeResolvedRows(parsed);
    }

    if (parsed && typeof parsed === 'object') {
      const data = (parsed as Record<string, unknown>)['data'];
      if (Array.isArray(data)) {
        return normalizeResolvedRows(data);
      }

      return normalizeResolvedRows([parsed]);
    }
  } catch {
    return [];
  }

  return [];
}

function tryParseStructuredChartData(
  binding: string,
  accent: string,
  accentSoft: string,
): StructuredChartData | null {
  const trimmed = binding.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return coerceResolvedValueToStructuredChartData(parsed, accent, accentSoft);
  } catch {
    return null;
  }
}

function coerceResolvedValueToStructuredChartData(
  resolved: unknown,
  accent: string,
  accentSoft: string,
): StructuredChartData | null {
  if (!resolved || typeof resolved !== 'object' || Array.isArray(resolved)) {
    return null;
  }

  const candidate = resolved as Record<string, unknown>;
  const labels = Array.isArray(candidate['labels']) ? candidate['labels'].map((label) => String(label ?? '').trim()).filter(Boolean) : [];
  const datasets = Array.isArray(candidate['datasets']) ? candidate['datasets'] : [];

  if (!labels.length || !datasets.length) {
    return null;
  }

  const palette = [
    accent,
    accentSoft,
    resolveCssVariable('var(--qo-color-info-500)'),
    resolveCssVariable('var(--qo-color-success-500)'),
    resolveCssVariable('var(--qo-color-danger-500)'),
  ];

  const normalizedDatasets = datasets
    .map((dataset, index) => normalizeStructuredDataset(dataset, labels.length, palette[index % palette.length]))
    .filter((dataset): dataset is StructuredChartDataset => !!dataset);

  if (!normalizedDatasets.length) {
    return null;
  }

  return {
    labels,
    datasets: normalizedDatasets,
  };
}

function normalizeStructuredDataset(
  dataset: unknown,
  labelCount: number,
  fallbackColor: string,
): StructuredChartDataset | null {
  if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) {
    return null;
  }

  const candidate = dataset as Record<string, unknown>;
  const dataValues = Array.isArray(candidate['data']) ? candidate['data'] : [];
  if (!dataValues.length) {
    return null;
  }

  const normalizedData = Array.from({ length: labelCount }, (_, index) => resolveNumericMetric(dataValues[index]));

  return {
    label: normalizeLabel(typeof candidate['label'] === 'string' ? candidate['label'] : '', 'Series'),
    data: normalizedData,
    color: typeof candidate['backgroundColor'] === 'string'
      ? resolveCssVariable(candidate['backgroundColor'])
      : typeof candidate['borderColor'] === 'string'
        ? resolveCssVariable(candidate['borderColor'])
        : fallbackColor,
  };
}

function resolveValueLabel(config: ChartWidgetConfig): string {
  if (config.valueType === 'actual') {
    return normalizeLabel(config.yAxisLabel || config.yAxisField, 'Value');
  }

  if (config.aggregateValue?.tab === 'sum') {
    return normalizeLabel(config.yAxisLabel, 'Sum');
  }

  if (config.aggregateValue?.tab === 'avg') {
    return normalizeLabel(config.yAxisLabel, 'Average');
  }

  if (config.aggregateValue?.tab === 'min') {
    return normalizeLabel(config.yAxisLabel, 'Minimum');
  }

  if (config.aggregateValue?.tab === 'max') {
    return normalizeLabel(config.yAxisLabel, 'Maximum');
  }

  if (config.aggregateValue?.tab === 'count') {
    return normalizeLabel(config.yAxisLabel, 'Count');
  }

  if (config.aggregateValue?.tab === 'count-distinct') {
    return normalizeLabel(config.yAxisLabel, 'Count Distinct');
  }

  return normalizeLabel(config.yAxisLabel || config.aggregateValue?.value || config.yAxisField, 'Count');
}

function hasPresentValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'boolean') {
    return true;
  }

  return value != null;
}

function normalizeDistinctValue(value: unknown): string | null {
  if (!hasPresentValue(value)) {
    return null;
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return String(value);
}

function resolveNumericMetric(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return 0;
}

function scaleCountsToSeries(counts: number[]): number[] {
  const max = Math.max(...counts, 1);
  return counts.map((count) => {
    const normalized = count / max;
    return clamp(Math.round(76 - normalized * 42), 28, 76);
  });
}

function buildStackedSeries(counts: number[]): number[] {
  return counts.map((count, index) => {
    const splitRatio = 0.35 + (index % 2) * 0.1;
    const upperCount = Math.max(1, Math.round(count * splitRatio));
    const scaled = scaleCountsToSeries([upperCount])[0];
    return clamp(scaled + 10, 24, 78);
  });
}

function buildChartData(
  builderType: BuilderChartType,
  chartType: PageBuilderChartType,
  visual: ChartVisualModel,
): ChartData<PageBuilderChartType, PageBuilderChartPoint[], string> {
  const labels = visual.categories.length ? visual.categories : ['A', 'B', 'C', 'D', 'E'];
  const dataA = visual.categories.length ? visual.rawSeriesA : visual.seriesA.map((v) => 82 - v);
  const dataB = visual.categories.length ? visual.rawSeriesB : visual.seriesB.map((v) => 82 - v);
  const stacked = builderType.includes('stacked');

  if (visual.directDatasets?.length) {
    if (chartType === 'scatter') {
      return {
        labels,
        datasets: visual.directDatasets.map((dataset) => ({
          label: dataset.label,
          data: dataset.data.map((value, index) => ({ x: labels[index] ?? `${index + 1}`, y: value })),
          pointBackgroundColor: dataset.color,
          pointRadius: 4,
          showLine: false,
        })),
      };
    }

    return {
      labels,
      datasets: visual.directDatasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.color,
        backgroundColor: builderType === 'area' || builderType === 'stacked-area' ? alpha(dataset.color, 0.25) : dataset.color,
        fill: builderType === 'area' || builderType === 'stacked-area',
        tension: 0.35,
        pointRadius: builderType === 'line' || builderType === 'area' || builderType === 'stacked-area' ? 2.5 : 0,
        pointHoverRadius: 3,
        barThickness: chartType === 'bar' ? 14 : undefined,
        borderWidth: 2,
        stack: stacked ? 's1' : undefined,
      })),
    };
  }

  if (chartType === 'scatter') {
    return {
      labels,
      datasets: [
        {
          label: 'Series A',
          data: dataA.map((value, index) => ({ x: labels[index] ?? `${index + 1}`, y: value })),
          pointBackgroundColor: visual.accent,
          pointRadius: 4,
          showLine: false,
        },
      ],
    };
  }

  const datasets: ChartDataset<PageBuilderChartType, PageBuilderChartPoint[]>[] = [
    {
      label: 'Series A',
      data: dataA,
      borderColor: visual.accent,
      backgroundColor: builderType === 'area' || builderType === 'stacked-area' ? alpha(visual.accent, 0.25) : visual.accent,
      fill: builderType === 'area' || builderType === 'stacked-area',
      tension: 0.35,
      pointRadius: builderType === 'line' || builderType === 'area' || builderType === 'stacked-area' ? 2.5 : 0,
      pointHoverRadius: 3,
      barThickness: chartType === 'bar' ? 14 : undefined,
      borderWidth: 2,
      stack: stacked ? 's1' : undefined,
    },
  ];

  if (visual.hasComparisonSeries && (chartType !== 'radar' || builderType === 'web')) {
      datasets.push({
        label: 'Series B',
        data: dataB,
        borderColor: visual.accentSoft,
        backgroundColor:
          builderType === 'area' || builderType === 'stacked-area' ? alpha(visual.accentSoft, 0.25) : visual.accentSoft,
      fill: builderType === 'area' || builderType === 'stacked-area',
      tension: 0.35,
      pointRadius: builderType === 'line' || builderType === 'area' || builderType === 'stacked-area' ? 2 : 0,
      pointHoverRadius: 3,
      barThickness: chartType === 'bar' ? 14 : undefined,
      borderWidth: 2,
      stack: stacked ? 's1' : undefined,
    });
  }

  return { labels, datasets };
}

function buildChartOptions(
  builderType: BuilderChartType,
  config: ChartWidgetConfig | null,
  visual: ChartVisualModel,
  interactive: boolean,
): ChartOptions<PageBuilderChartType> {
  const stacked = builderType.includes('stacked') || visual.hasStack;
  const showPct = builderType === 'stacked-pct-column';
  const isRadar = builderType === 'web';
  const isHorizontal = builderType === 'bar' || builderType === 'stacked-bar';
  const interval = resolveChartInterval(config?.interval, showPct);
  const categoryAxisLabel = visual.xAxisLabel;
  const valueAxisLabel = visual.yAxisLabel;
  const categoryScale = {
    type: 'category' as const,
    stacked,
    title: { display: true, text: categoryAxisLabel },
    ticks: { maxRotation: 0, autoSkip: true, font: { size: 10 } },
    grid: { color: 'rgba(148, 163, 184, 0.2)' },
  };
  const valueScale = {
    stacked,
    title: { display: true, text: valueAxisLabel },
    beginAtZero: true,
    max: showPct ? 100 : undefined,
    ticks: {
      font: { size: 10 },
      stepSize: interval ?? undefined,
      callback: showPct ? (value: string | number) => `${value}%` : undefined,
    },
    grid: { color: 'rgba(148, 163, 184, 0.2)' },
  };

    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: isHorizontal ? 'y' : 'x',
      animation: false,
      events: interactive ? undefined : [],
      plugins: {
        legend: { display: (visual.directDatasets?.length ?? 0) > 1 },
        tooltip: { enabled: interactive },
        title: { display: false },
      },
    scales: isRadar
      ? undefined
      : {
          x: builderType === 'scatter'
            ? (visual.categories.length ? categoryScale : valueScale)
            : (isHorizontal ? valueScale : categoryScale),
          y: builderType === 'scatter'
            ? valueScale
            : (isHorizontal ? categoryScale : valueScale),
        },
    elements: {
      point: {
        radius: builderType === 'scatter' ? 4 : 2,
      },
    },
  };
}

function createPointLabels(aggregateLabel: string, valueType: 'aggregate' | 'actual'): string[] {
  if (valueType === 'actual') {
    return ['18', '24', '20', '31', '27'];
  }

  if (aggregateLabel.toLowerCase().includes('count')) {
    return ['12', '16', '14', '21', '18'];
  }

  return ['8', '13', '11', '19', '15'];
}

function normalizeLabel(value: string | null | undefined, fallback = ''): string {
  return (value ?? '').trim() || fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function alpha(color: string, opacity: number): string {
  const resolved = resolveCssVariable(color);
  if (resolved.startsWith('#')) {
    let hex = resolved.substring(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (resolved.startsWith('rgb')) {
    return resolved;
  }
  return resolved;
}

function resolveChartInterval(interval: string | null | undefined, showPct: boolean): number | null {
  const raw = (interval ?? '').trim();
  if (!raw) {
    return null;
  }

  const parsed = Number.parseFloat(raw.replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  if (!showPct) {
    return parsed;
  }

  return clamp(parsed, 1, 100);
}

function resolveCssVariable(variableName: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'var(--qo-color-neutral-900)';
  }
  let cleanName = variableName.trim();
  if (cleanName.startsWith('var(')) {
    const match = cleanName.match(/var\(([^)]+)\)/);
    if (match && match[1]) {
      cleanName = match[1].trim();
    }
  }
  if (!cleanName.startsWith('--')) {
    return cleanName;
  }
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(cleanName).trim();
  return resolved || 'var(--qo-color-neutral-900)';
}
