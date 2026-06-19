import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { getPageBuilderRuntimeDistinctValueOptions, getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import { ChartWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';

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
  aggregateLabel: string;
  categories: string[];
  directDatasets?: StructuredChartDataset[];
  filterCount: number;
  hasComparisonSeries: boolean;
  hasStack: boolean;
  hasUnderlyingData: boolean;
  pointLabels: string[];
  recordScope: 'all' | 'selected';
  seriesA: number[];
  seriesB: number[];
  showDataLabel: boolean;
  valueType: 'aggregate' | 'actual';
  xAxisLabel: string;
  yAxisLabel: string;
}

@Component({
  selector: 'app-chart-thumbnail',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart-thumbnail.component.html',
  styleUrl: './chart-thumbnail.component.scss',
})
export class ChartThumbnailComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly type = input.required<ChartType>();
  readonly config = input<ChartWidgetConfig | null>(null);

  readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      buildChartSvg(
        this.type(),
        this.config(),
      ),
    ),
  );
}

function buildChartSvg(
  type: ChartType,
  config: ChartWidgetConfig | null,
): string {
  const visual = buildVisualModel(config);
  const graphic = buildGraphicByType(type, visual);

  return `
    <svg viewBox="0 0 120 104" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="120" height="104" rx="10" fill="var(--qo-color-neutral-0)"></rect>
      <g opacity="0.9">
        <line x1="18" y1="14" x2="18" y2="82" stroke="var(--qo-color-neutral-900)" stroke-width="3"></line>
        <line x1="18" y1="82" x2="102" y2="82" stroke="var(--qo-color-neutral-900)" stroke-width="3"></line>
        <line x1="18" y1="28" x2="102" y2="28" stroke="var(--qo-color-neutral-200)" stroke-width="1"></line>
        <line x1="18" y1="46" x2="102" y2="46" stroke="var(--qo-color-neutral-200)" stroke-width="1"></line>
        <line x1="18" y1="64" x2="102" y2="64" stroke="var(--qo-color-neutral-200)" stroke-width="1"></line>
      </g>
      ${graphic}
      ${buildBadges(visual)}
      ${buildCategoryTickLabels(visual)}
      ${buildAxisLabels(type, visual)}
      ${visual.hasUnderlyingData ? buildUnderlyingDataStrip(visual) : ''}
    </svg>
  `;
}

function buildVisualModel(
  config: ChartWidgetConfig | null,
): ChartVisualModel {
  const valueType = config?.valueType ?? 'aggregate';
  const aggregateLabel = normalizeLabel(config?.aggregateValue?.value);
  const filterCount = config?.filterDataBasedOn?.length ?? 0;
  const hasStack = !!config?.yAxisStackBy;
  const hasUnderlyingData = !!config?.showUnderlyingData;
  const showDataLabel = !!config?.showDataLabel;
  const recordScope = config?.recordScope ?? 'all';
  const xAxisLabel = normalizeLabel(config?.xAxisLabel || config?.xAxisCategory, 'X');
  const yAxisLabel = normalizeLabel(config?.yAxisLabel || config?.yAxisField || config?.aggregateValue?.value, 'Y');
  const accentRaw = config?.chartColor || (valueType === 'actual' ? 'var(--qo-color-info-500)' : 'var(--qo-color-primary-700)');
  const accentSoftRaw = config?.chartColorSecondary || (hasStack ? 'var(--qo-color-warning-500)' : 'var(--qo-color-neutral-500)');
  const accent = resolveCssVariable(accentRaw);
  const accentSoft = resolveCssVariable(accentSoftRaw);
  const structuredData = config ? tryParseStructuredChartData(config.queryBinding ?? '', accent, accentSoft) : null;
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
      aggregateLabel,
      categories: normalizedStructuredData.labels,
      directDatasets: normalizedStructuredData.datasets,
      filterCount,
      hasComparisonSeries: normalizedStructuredData.datasets.length > 1,
      hasStack,
      hasUnderlyingData,
      pointLabels: primaryDataset.data.map((value) => `${value}`),
      recordScope,
      seriesA: scaleCountsToSeries(primaryDataset.data),
      seriesB: comparisonDataset ? scaleCountsToSeries(comparisonDataset.data) : [],
      showDataLabel,
      valueType,
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
      aggregateLabel,
      categories: groupedData.categories,
      filterCount,
      hasComparisonSeries: hasStack,
      hasStack,
      hasUnderlyingData,
      pointLabels: groupedData.counts.map((count) => `${count}`),
      recordScope,
      seriesA: scaledSeries,
      seriesB: splitSeries,
      showDataLabel: true,
      valueType,
      xAxisLabel,
      yAxisLabel: normalizeLabel(config?.yAxisLabel, groupedData.valueLabel),
    };
  }

  const baseA = valueType === 'actual' ? [54, 34, 46, 24, 38] : [62, 44, 50, 30, 40];
  const baseB = valueType === 'actual' ? [66, 54, 60, 42, 50] : [72, 60, 64, 46, 54];
  const scopedOffset = recordScope === 'selected' ? -8 : 0;
  const filteredOffset = filterCount > 0 ? -4 : 0;
  const pointLabels = createPointLabels(aggregateLabel, valueType);

  return {
    accent,
    accentSoft,
    aggregateLabel,
    categories: [],
    filterCount,
    hasComparisonSeries: hasStack,
    hasStack,
    hasUnderlyingData,
    pointLabels,
    recordScope,
    seriesA: baseA.map((value, index) => clamp(value + scopedOffset + filteredOffset + (index % 2 === 0 ? 0 : 2), 20, 74)),
    seriesB: baseB.map((value, index) => clamp(value + scopedOffset + filteredOffset - (index % 2 === 0 ? 2 : 0), 24, 78)),
    showDataLabel,
    valueType,
    xAxisLabel,
    yAxisLabel,
  };
}

function buildGroupedChartData(
  config: ChartWidgetConfig,
): { categories: string[]; counts: number[]; valueLabel: string } | null {
  if (!config.datasourceId || !config.xAxisCategory) {
    return null;
  }

  const rows = getPageBuilderRuntimeRows(config.datasourceId, config.queryId);
  if (!rows.length) {
    return null;
  }

  const configuredOptions = getPageBuilderRuntimeDistinctValueOptions(config.datasourceId, config.xAxisCategory, config.queryId)
    .map((option) => option.value.trim())
    .filter(Boolean);
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

  return {
    labels,
    datasets: [{
      label: resolveValueLabel(config),
      data: aggregateValues,
      color: accent,
    }],
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

function tryParseStructuredChartData(
  binding: string,
  accent: string,
  accentSoft: string,
): { labels: string[]; datasets: StructuredChartDataset[] } | null {
  const trimmed = binding.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    const candidate = parsed as Record<string, unknown>;
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
  } catch {
    return null;
  }
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

  return {
    label: normalizeLabel(typeof candidate['label'] === 'string' ? candidate['label'] : '', 'Series'),
    data: Array.from({ length: labelCount }, (_, index) => resolveNumericMetric(dataValues[index])),
    color: typeof candidate['backgroundColor'] === 'string'
      ? resolveCssVariable(candidate['backgroundColor'])
      : typeof candidate['borderColor'] === 'string'
        ? resolveCssVariable(candidate['borderColor'])
        : fallbackColor,
  };
}

function buildGraphicByType(type: ChartType, visual: ChartVisualModel): string {
  switch (type) {
    case 'scatter':
      return buildScatterGraphic(visual);
    case 'area':
      return buildAreaGraphic(visual, false);
    case 'stacked-area':
      return buildAreaGraphic(visual, true);
    case 'web':
      return buildRadarGraphic(visual);
    case 'column':
      return buildColumnGraphic(visual, false, false);
    case 'stacked-column':
      return buildColumnGraphic(visual, true, false);
    case 'stacked-pct-column':
      return buildColumnGraphic(visual, true, true);
    case 'bar':
      return buildBarGraphic(visual, false);
    case 'stacked-bar':
      return buildBarGraphic(visual, true);
    case 'line':
    default:
      return buildLineGraphic(visual);
  }
}

function buildLineGraphic(visual: ChartVisualModel): string {
  if (visual.directDatasets?.length) {
    return visual.directDatasets
      .slice(0, 3)
      .map((dataset) => `<polyline points="${toLinePoints(scaleCountsToSeries(dataset.data))}" fill="none" stroke="${dataset.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>`)
      .join('');
  }

  const pointsA = toLinePoints(visual.seriesA);

  return `
    ${visual.hasComparisonSeries ? `<polyline points="${toLinePoints(visual.seriesB)}" fill="none" stroke="${visual.accentSoft}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>` : ''}
    <polyline points="${pointsA}" fill="none" stroke="${visual.accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
    ${visual.showDataLabel ? buildPointLabels(visual.seriesA, visual.pointLabels, 0) : ''}
  `;
}

function buildScatterGraphic(visual: ChartVisualModel): string {
  return visual.seriesA
    .map((value, index) => {
      const x = toX(index);
      const y = value;
      const fill = index % 2 === 0 ? visual.accent : visual.accentSoft;
      return `
        <circle cx="${x}" cy="${y}" r="4.5" fill="${fill}"></circle>
        ${visual.showDataLabel ? `<text x="${x}" y="${y - 8}" text-anchor="middle" font-size="5" fill="var(--qo-color-neutral-700)">${escapeText(visual.pointLabels[index] ?? '')}</text>` : ''}
      `;
    })
    .join('');
}

function buildAreaGraphic(visual: ChartVisualModel, stacked: boolean): string {
  if (visual.directDatasets?.length) {
    return visual.directDatasets
      .slice(0, 3)
      .map((dataset, index) => {
        const series = scaleCountsToSeries(dataset.data).map((value) => clamp(value - index * 4, 18, 78));
        return `
          <polygon points="${toAreaPoints(series)}" fill="${dataset.color}" opacity="${stacked ? '0.48' : '0.24'}"></polygon>
          <polyline points="${toLinePoints(series)}" fill="none" stroke="${dataset.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
        `;
      })
      .join('');
  }

  const areaA = toAreaPoints(visual.seriesA);
  const seriesB = stacked ? visual.seriesB.map((value, index) => clamp(value - (index % 2 === 0 ? 10 : 12), 20, 76)) : visual.seriesB;
  const areaB = toAreaPoints(seriesB);

  return `
    ${visual.hasComparisonSeries ? `<polygon points="${areaB}" fill="${visual.accentSoft}" opacity="0.55"></polygon>` : ''}
    <polygon points="${areaA}" fill="${visual.accent}" opacity="${stacked ? '0.78' : '0.38'}"></polygon>
    <polyline points="${toLinePoints(visual.seriesA)}" fill="none" stroke="${visual.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
    ${visual.showDataLabel ? buildPointLabels(visual.seriesA, visual.pointLabels, 0) : ''}
  `;
}

function buildRadarGraphic(visual: ChartVisualModel): string {
  const polygonA = [26, 18, 20, 46, 32];
  const polygonB = polygonA.map((value, index) => value + (visual.recordScope === 'selected' ? -3 : 0) + (index % 2 === 0 ? 0 : 2));
  return `
    <g transform="translate(60 46)">
      <polygon points="${toRadarPolygon([30, 30, 30, 30, 30])}" fill="none" stroke="var(--qo-color-neutral-300)" stroke-width="1.5"></polygon>
      <polygon points="${toRadarPolygon([20, 20, 20, 20, 20])}" fill="none" stroke="var(--qo-color-neutral-200)" stroke-width="1"></polygon>
      ${buildRadarSpokes()}
      <polygon points="${toRadarPolygon(polygonA)}" fill="${visual.accent}" opacity="0.25" stroke="${visual.accent}" stroke-width="2"></polygon>
      ${visual.hasComparisonSeries ? `<polygon points="${toRadarPolygon(polygonB)}" fill="${visual.accentSoft}" opacity="0.18" stroke="${visual.accentSoft}" stroke-width="2"></polygon>` : ''}
    </g>
  `;
}

function buildColumnGraphic(visual: ChartVisualModel, stacked: boolean, normalized: boolean): string {
  if (visual.directDatasets?.length) {
    const datasetCount = Math.max(1, Math.min(visual.directDatasets.length, 3));
    return visual.categories.slice(0, 5).map((_, index) => {
      const x = 24 + index * 14;
      const values = visual.directDatasets.slice(0, datasetCount).map((dataset) => dataset.data[index] ?? 0);
      const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);

      if (stacked) {
        let offsetY = 82;
        return values.map((value, datasetIndex) => {
          const ratio = normalized && total > 0 ? value / total : total > 0 ? value / total : 0;
          const height = Math.max(8, Math.round((normalized ? 46 : 52) * ratio));
          offsetY -= height;
          return `<rect x="${x}" y="${offsetY}" width="9" height="${height}" rx="1.5" fill="${visual.directDatasets?.[datasetIndex]?.color ?? visual.accent}"></rect>`;
        }).join('');
      }

      return values.map((value, datasetIndex) => {
        const scaledValue = scaleCountsToSeries([value])[0];
        const height = 82 - scaledValue;
        const barX = x + datasetIndex * 3;
        return `<rect x="${barX}" y="${scaledValue}" width="3" height="${height}" rx="1" fill="${visual.directDatasets?.[datasetIndex]?.color ?? visual.accent}"></rect>`;
      }).join('');
    }).join('');
  }

  const columns = visual.seriesA.map((value, index) => {
    const x = 24 + index * 14;
    const baseHeight = normalized ? 46 : 82 - value;
    const totalHeight = normalized ? 46 : 82 - clamp(value - 12, 18, 72);
    const lowerHeight = stacked ? Math.max(12, Math.round((normalized ? 46 : totalHeight) * 0.5)) : baseHeight;
    const upperHeight = stacked ? Math.max(10, totalHeight - lowerHeight) : 0;
    const lowerY = 82 - lowerHeight;
    const upperY = lowerY - upperHeight;
    const labelY = stacked ? upperY - 4 : lowerY - 4;

    return `
      <rect x="${x}" y="${lowerY}" width="9" height="${lowerHeight}" rx="1.5" fill="${stacked ? visual.accentSoft : visual.accent}"></rect>
      ${stacked ? `<rect x="${x}" y="${upperY}" width="9" height="${upperHeight}" rx="1.5" fill="${visual.accent}"></rect>` : ''}
      ${visual.showDataLabel ? `<text x="${x + 4.5}" y="${labelY}" text-anchor="middle" font-size="5" fill="var(--qo-color-neutral-700)">${escapeText(visual.pointLabels[index] ?? '')}</text>` : ''}
    `;
  });

  return columns.join('');
}

function buildBarGraphic(visual: ChartVisualModel, stacked: boolean): string {
  if (visual.directDatasets?.length) {
    return visual.categories.slice(0, 5).map((_, index) => {
      const y = 20 + index * 14;
      const values = visual.directDatasets!.slice(0, 3).map((dataset) => dataset.data[index] ?? 0);
      const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
      let offsetX = 22;

      return values.map((value, datasetIndex) => {
        const width = stacked && total > 0
          ? Math.max(10, Math.round((value / total) * 72))
          : Math.max(10, Math.round((value / Math.max(...values, 1)) * 28));
        const x = stacked ? offsetX : offsetX + datasetIndex * 12;
        if (stacked) {
          offsetX += width;
        }
        return `<rect x="${x}" y="${y}" width="${width}" height="8" rx="1.5" fill="${visual.directDatasets?.[datasetIndex]?.color ?? visual.accent}"></rect>`;
      }).join('');
    }).join('');
  }

  return visual.seriesA
    .map((value, index) => {
      const y = 20 + index * 14;
      const widthA = Math.max(18, 94 - value);
      const widthB = Math.max(12, Math.round(widthA * 0.45));
      return `
        <rect x="22" y="${y}" width="${stacked ? widthB : widthA}" height="8" rx="1.5" fill="${stacked ? visual.accentSoft : visual.accent}"></rect>
        ${stacked ? `<rect x="${22 + widthB}" y="${y}" width="${Math.max(10, widthA - widthB)}" height="8" rx="1.5" fill="${visual.accent}"></rect>` : ''}
        ${visual.showDataLabel ? `<text x="${Math.min(102, 26 + widthA)}" y="${y + 6}" font-size="5" fill="var(--qo-color-neutral-700)">${escapeText(visual.pointLabels[index] ?? '')}</text>` : ''}
      `;
    })
    .join('');
}

function buildPointLabels(series: number[], labels: string[], offsetY: number): string {
  return series
    .map((value, index) => {
      const x = toX(index);
      return `<text x="${x}" y="${value - 6 + offsetY}" text-anchor="middle" font-size="5" fill="var(--qo-color-neutral-700)">${escapeText(labels[index] ?? '')}</text>`;
    })
    .join('');
}

function buildAxisLabels(type: ChartType, visual: ChartVisualModel): string {
  const isHorizontal = type === 'bar' || type === 'stacked-bar';
  const categoryAxisLabel = visual.xAxisLabel;
  const valueAxisLabel = visual.yAxisLabel;

  return `
    <text x="60" y="98" text-anchor="middle" font-size="5" fill="var(--qo-color-neutral-500)">${escapeText(isHorizontal ? valueAxisLabel : categoryAxisLabel)}</text>
    <text x="10" y="48" text-anchor="middle" font-size="5" fill="var(--qo-color-neutral-500)" transform="rotate(-90 10 48)">${escapeText(isHorizontal ? categoryAxisLabel : valueAxisLabel)}</text>
  `;
}

function buildCategoryTickLabels(visual: ChartVisualModel): string {
  if (!visual.categories.length) {
    return '';
  }

  return visual.categories
    .slice(0, 5)
    .map((category, index) => {
      const x = toX(index);
      return `<text x="${x}" y="88" text-anchor="middle" font-size="4.2" fill="var(--qo-color-neutral-500)">${escapeText(shortenCategory(category))}</text>`;
    })
    .join('');
}

function buildBadges(visual: ChartVisualModel): string {
  const badges: string[] = [];

  badges.push(buildBadge(22, 10, visual.valueType === 'aggregate' ? 'AGG' : 'ACT', visual.accent));

  if (visual.hasStack) {
    badges.push(buildBadge(48, 10, 'STACK', visual.accentSoft));
  }

  if (visual.filterCount > 0) {
    badges.push(buildBadge(82, 10, `F${visual.filterCount}`, 'var(--qo-color-warning-500)'));
  }

  if (visual.recordScope === 'selected') {
    badges.push(buildBadge(100, 96, 'SEL', 'var(--qo-color-info-500)'));
  }

  return badges.join('');
}

function buildBadge(x: number, y: number, label: string, fill: string): string {
  const width = Math.max(14, label.length * 4.7 + 4);
  return `
    <g transform="translate(${x} ${y})">
      <rect x="${-width / 2}" y="-5" width="${width}" height="10" rx="5" fill="${fill}" opacity="0.16"></rect>
      <text x="0" y="2" text-anchor="middle" font-size="4.5" font-weight="700" fill="var(--qo-color-neutral-700)">${escapeText(label)}</text>
    </g>
  `;
}

function buildUnderlyingDataStrip(visual: ChartVisualModel): string {
  const cells = visual.seriesA
    .map((value, index) => {
      const x = 24 + index * 16;
      const height = Math.max(4, Math.round((82 - value) / 6));
      return `<rect x="${x}" y="${92 - height}" width="10" height="${height}" rx="1.5" fill="${index % 2 === 0 ? visual.accent : visual.accentSoft}" opacity="0.75"></rect>`;
    })
    .join('');

  return `
    <g opacity="0.9">
      <line x1="22" y1="90" x2="100" y2="90" stroke="var(--qo-color-neutral-200)" stroke-width="1"></line>
      ${cells}
    </g>
  `;
}

function buildRadarSpokes(): string {
  return `
    <line x1="0" y1="0" x2="0" y2="-30" stroke="var(--qo-color-neutral-300)" stroke-width="1"></line>
    <line x1="0" y1="0" x2="28.5" y2="-9.3" stroke="var(--qo-color-neutral-300)" stroke-width="1"></line>
    <line x1="0" y1="0" x2="17.6" y2="24.3" stroke="var(--qo-color-neutral-300)" stroke-width="1"></line>
    <line x1="0" y1="0" x2="-17.6" y2="24.3" stroke="var(--qo-color-neutral-300)" stroke-width="1"></line>
    <line x1="0" y1="0" x2="-28.5" y2="-9.3" stroke="var(--qo-color-neutral-300)" stroke-width="1"></line>
  `;
}

function toLinePoints(values: number[]): string {
  return values.map((value, index) => `${toX(index)},${value}`).join(' ');
}

function toAreaPoints(values: number[]): string {
  return `18,82 ${values.map((value, index) => `${toX(index)},${value}`).join(' ')} 102,82`;
}

function toRadarPolygon(radii: number[]): string {
  return radii
    .map((radius, index) => {
      const angle = (-90 + index * 72) * (Math.PI / 180);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function toX(index: number): number {
  return 26 + index * 18;
}

function shortenCategory(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 7) {
    return trimmed;
  }

  return `${trimmed.slice(0, 6)}.`;
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

function escapeText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
