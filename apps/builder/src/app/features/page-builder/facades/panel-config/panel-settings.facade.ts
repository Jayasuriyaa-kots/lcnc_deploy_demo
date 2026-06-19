import { computed, inject, Injectable, signal } from '@angular/core';
import { getPageBuilderMockDatasourceOptions, getPageBuilderMockQueryOptions } from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import { resolvePageBuilderExpression } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import { PageBuilderDataBindingService } from '@builder/features/page-builder/services/page-builder-data-binding.service';
import { getPageBuilderRuntimeFieldOptions, getPageBuilderRuntimeNumericFieldOptions, getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import { pageBuilderRuntimeDatasources, pageBuilderRuntimeGlobals, pageBuilderRuntimeWidgets } from '@builder/features/page-builder/services/page-builder-runtime-state.service';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal/search-criteria-modal.component';
import {
  applyPanelBinding,
  createPanelPresetBinding,
  resolvePanelBinding,
} from '@builder/features/page-builder/components/widget-showcase/panel/panel-widget-data-binding.util';
import {
  PanelWidgetResolution,
  resolvePanelWidget,
} from '@builder/features/page-builder/components/widget-showcase/panel/panel-widget-resolution.util';
import {
  createDefaultPanelWidgetConfig,
  PanelWidgetConfig,
  PanelWidgetPresetId,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { DataBindingConfig } from '@builder/features/page-builder/models/data-binding.model';
import { SelectOption } from '@qo/ui-components';

@Injectable()
export class PanelSettingsFacade {
  private readonly dataBindingService = inject(PageBuilderDataBindingService);
  readonly config = signal<PanelWidgetConfig>(createDefaultPanelWidgetConfig());
  readonly configChange = signal<((c: PanelWidgetConfig) => void) | null>(null);

  filtersModalOpen = signal(false);
  conditionModalOpen = signal(false);

  readonly datasourceOptions = computed<SelectOption[]>(() =>
    getPageBuilderMockDatasourceOptions().map((option) => ({
      value: option.value,
      label: option.label,
    })),
  );

  readonly selectedQueryOptions = computed<SelectOption[]>(() => {
    const datasourceId = this.binding().datasourceId.trim();
    return getPageBuilderMockQueryOptions()
      .filter((option) => !datasourceId || option.datasourceId === datasourceId)
      .map((option) => ({
        value: option.value,
        label: `${option.label} (${option.resultKind === 'table' ? 'Table' : 'Query'})`,
      }));
  });

  readonly fieldOptions = computed<SelectOption[]>(() => {
    const binding = this.binding();
    if (!binding.datasourceId || !binding.queryId) {
      return [];
    }

    return getPageBuilderRuntimeFieldOptions(binding.datasourceId, binding.queryId);
  });

  readonly numericFieldOptions = computed<SelectOption[]>(() => {
    const binding = this.binding();
    if (!binding.datasourceId || !binding.queryId) {
      return [];
    }

    return getPageBuilderRuntimeNumericFieldOptions(binding.datasourceId, binding.queryId);
  });

  readonly aggregationFieldOptions = computed<SelectOption[]>(() => {
    const binding = this.binding();
    if (!binding.datasourceId || !binding.queryId) {
      return [];
    }

    if (
      binding.aggregationType === 'sum' ||
      binding.aggregationType === 'min' ||
      binding.aggregationType === 'max' ||
      binding.aggregationType === 'average' ||
      binding.aggregationType === 'median'
    ) {
      return this.numericFieldOptions();
    }

    return this.fieldOptions();
  });

  readonly pageVariableOptions = computed<SelectOption[]>(() =>
    this.flattenBindingValue('page', pageBuilderRuntimeGlobals())
      .filter((option) => option.value !== 'page')
      .map((option) => ({
        value: option.value,
        label: option.label.replace(/^Page\s*/, ''),
      })),
  );

  readonly widgetBindingOptions = computed<SelectOption[]>(() =>
    this.flattenBindingValue('widgets', pageBuilderRuntimeWidgets())
      .filter((option) => option.value !== 'widgets')
      .map((option) => ({
        value: option.value,
        label: option.label.replace(/^Widgets\s*/, ''),
      })),
  );

  readonly bindingRootKeys = computed<string[]>(() => ['page', 'widgets', ...Object.keys(pageBuilderRuntimeWidgets())]);
  readonly binding = computed<DataBindingConfig>(() => resolvePanelBinding(this.config()));

  readonly filtersSummary = computed(() => this.summarizeRules(this.binding().filters));
  readonly conditionSummary = computed(() => this.summarizeRules(this.binding().condition ? [this.binding().condition] : []));

  readonly resolution = computed<PanelWidgetResolution>(() =>
    resolvePanelWidget(
      {
        ...createDefaultPanelWidgetConfig(),
        ...this.config(),
      },
      {
        runtimeDatasources: pageBuilderRuntimeDatasources(),
        getRows: (datasourceId, queryId) => getPageBuilderRuntimeRows(datasourceId, queryId),
        resolveBinding: (expression) => resolvePageBuilderExpression(expression),
      },
      this.dataBindingService,
    ),
  );

  readonly previewValue = computed(() => {
    const resolution = this.resolution();
    if (resolution.displayValue) {
      return resolution.displayValue;
    }

    switch (resolution.state) {
      case 'unconfigured':
        return 'Configure panel';
      case 'no_data':
        return 'No data';
      case 'invalid':
        return 'Invalid setup';
      case 'empty':
        return 'Empty value';
      default:
        return this.config().value || 'Preview';
    }
  });

  readonly previewMessage = computed(() => this.resolution().message);

  readonly dataSourceSummary = computed(() => {
    const binding = this.binding();
    const queryOption = getPageBuilderMockQueryOptions().find((option) => option.value === binding.queryId);
    const datasourceOption = this.datasourceOptions().find((option) => option.value === binding.datasourceId);

    return [
      datasourceOption?.label ?? '',
      queryOption?.label ?? '',
      binding.field.trim() || '',
    ]
      .filter(Boolean)
      .join(' / ');
  });

  updatePanelWidgetField<K extends keyof PanelWidgetConfig>(field: K, value: PanelWidgetConfig[K]): void {
    this.emitConfig({
      ...this.config(),
      [field]: value,
    });
  }

  updateBinding(binding: DataBindingConfig): void {
    const currentBinding = this.binding();
    const nextBinding: DataBindingConfig = {
      ...currentBinding,
      ...binding,
      filters: (binding.filters ?? currentBinding.filters).map((row) => ({ ...row })),
      condition: binding.condition ? { ...binding.condition } : binding.condition === null ? null : currentBinding.condition,
    };

    const hydratedBinding =
      binding.mode !== currentBinding.mode
        ? this.hydrateBindingModeDefaults(nextBinding)
        : this.hydrateBindingSelection(nextBinding);

    this.emitConfig(applyPanelBinding(this.config(), hydratedBinding, this.dataBindingService));
  }

  updatePreset(value: string | number): void {
    const presetId = String(value) as PanelWidgetPresetId;
    const partial = this.buildPresetConfig(presetId);
    const presetBinding = this.hydrateBindingSelection({
      ...createPanelPresetBinding(presetId, this.binding()),
      datasourceId: partial.datasourceId ?? this.binding().datasourceId,
      queryId: partial.queryId ?? this.binding().queryId,
      field: partial.field ?? this.binding().field,
      aggregationType: partial.aggregationType ?? this.binding().aggregationType,
    });
    this.emitConfig({
      ...applyPanelBinding(this.config(), presetBinding, this.dataBindingService),
      ...partial,
      presetId,
    });
  }

  updateFilters(rows: SearchCriteriaRow[]): void {
    this.updateBinding({
      ...this.binding(),
      filters: rows.map((row) => ({ ...row })),
    });
  }

  updateConditionRows(rows: SearchCriteriaRow[]): void {
    this.updateBinding({
      ...this.binding(),
      condition: rows[0] ? { ...rows[0] } : null,
    });
  }

  saveFilters(rows: SearchCriteriaRow[]): void {
    this.updateFilters(rows);
    this.filtersModalOpen.set(false);
  }

  saveCondition(rows: SearchCriteriaRow[]): void {
    this.updateConditionRows(rows);
    this.conditionModalOpen.set(false);
  }

  clearFilters(): void {
    this.updateBinding({
      ...this.binding(),
      filters: [],
    });
  }

  clearCondition(): void {
    this.updateBinding({
      ...this.binding(),
      condition: null,
    });
  }

  private hydrateBindingModeDefaults(binding: DataBindingConfig): DataBindingConfig {
    let nextBinding = { ...binding };

    if (binding.mode === 'static' && !nextBinding.staticValue.trim()) {
      nextBinding.staticValue = this.config().value;
    }

    if (binding.mode === 'page' && !nextBinding.expression.trim()) {
      nextBinding.expression = this.getDefaultBindingExpression(this.pageVariableOptions(), 'page.currentUser.name');
    }

    if ((binding.mode === 'widget' || binding.mode === 'expression') && !nextBinding.expression.trim()) {
      nextBinding.expression = this.getDefaultBindingExpression(this.widgetBindingOptions(), 'widgets.SalesSummaryPanel.value');
    }

    if (binding.mode === 'formula' && !nextBinding.formulaType) {
      nextBinding.formulaType = 'kpi-percentage';
    }

    return this.hydrateBindingSelection(nextBinding);
  }

  private hydrateBindingSelection(binding: DataBindingConfig): DataBindingConfig {
    if (binding.mode !== 'query-field' && binding.mode !== 'aggregation' && binding.mode !== 'formula') {
      return binding;
    }

    const datasourceId = String(binding.datasourceId ?? '').trim();
    const availableQueries = getPageBuilderMockQueryOptions().filter((option) => option.datasourceId === datasourceId);
    const currentQueryBelongsToDatasource = availableQueries.some((option) => option.value === binding.queryId);
    const queryId = currentQueryBelongsToDatasource ? binding.queryId : (availableQueries[0]?.value ?? '');
    const fieldOptions = queryId ? getPageBuilderRuntimeFieldOptions(datasourceId, queryId) : [];
    const aggregationFieldOptions = queryId ? this.resolveAggregationFieldOptions(datasourceId, queryId, binding.aggregationType) : [];
    const nextFieldOptions = binding.mode === 'aggregation' ? aggregationFieldOptions : binding.mode === 'query-field' ? fieldOptions : [];
    const field = nextFieldOptions.some((option) => String(option.value) === binding.field)
      ? binding.field
      : String(nextFieldOptions[0]?.value ?? '');

    return {
      ...binding,
      datasourceId,
      queryId,
      field,
      aggregationType: binding.mode === 'aggregation' ? binding.aggregationType || 'sum' : binding.aggregationType,
    };
  }

  private emitConfig(config: PanelWidgetConfig): void {
    const nextConfig = {
      ...createDefaultPanelWidgetConfig(),
      ...config,
      binding: resolvePanelBinding(config),
      filters: (config.filters ?? []).map((row) => ({ ...row })),
      condition: config.condition ? { ...config.condition } : null,
    };
    this.config.set(nextConfig);
    const fn = this.configChange();
    if (fn) {
      fn(nextConfig);
    }
  }

  private resolveAggregationFieldOptions(
    datasourceId: string,
    queryId: string,
    aggregationType: DataBindingConfig['aggregationType'],
  ): SelectOption[] {
    if (!datasourceId || !queryId) {
      return [];
    }

    if (
      aggregationType === 'sum' ||
      aggregationType === 'min' ||
      aggregationType === 'max' ||
      aggregationType === 'average' ||
      aggregationType === 'median'
    ) {
      return getPageBuilderRuntimeNumericFieldOptions(datasourceId, queryId);
    }

    return getPageBuilderRuntimeFieldOptions(datasourceId, queryId);
  }

  private summarizeRules(rows: SearchCriteriaRow[]): string {
    const validRows = rows.filter((row) => row.field.trim() && row.operator.trim() && row.value.trim());
    if (!validRows.length) {
      return 'No rules configured';
    }

    return validRows
      .map((row, index) => `${index > 0 ? `${row.joiner} ` : ''}${row.field} ${row.operator} ${row.value}`)
      .join(' ');
  }

  private buildPresetConfig(presetId: PanelWidgetPresetId): Partial<PanelWidgetConfig> {
    switch (presetId) {
      case 'revenue_kpi':
        return {
          title: 'Revenue Overview',
          subtitle: 'Average revenue across assets',
          caption: 'Datasource-driven KPI',
          trend: 'Rolling average',
          iconSymbol: 'payments',
          iconBackgroundColor: '#e8f2ff',
          iconColor: '#1d4ed8',
          valueColor: '#1d4ed8',
          backgroundColor: '#ffffff',
          layoutVariant: 'icon-left-value-top',
          datasourceId: 'builder_runtime_demo',
          queryId: 'asset_inventory_table',
          field: 'revenue_lakhs',
          aggregationType: 'average',
          suffix: ' Lakhs',
        };
      case 'occupancy_percentage':
        return {
          title: 'Occupancy Overview',
          subtitle: 'Average occupancy across active assets',
          caption: 'Portfolio utilization',
          trend: 'Live percentage metric',
          iconSymbol: 'query_stats',
          iconBackgroundColor: '#ecfdf3',
          iconColor: '#067647',
          valueColor: '#067647',
          backgroundColor: '#ffffff',
          layoutVariant: 'icon-center-value-top',
          datasourceId: 'builder_runtime_demo',
          queryId: 'asset_inventory_table',
          field: 'occupancy_pct',
          aggregationType: 'average',
          suffix: '%',
        };
      case 'asset_summary':
        return {
          title: 'Asset Summary',
          subtitle: 'Primary asset in the result set',
          caption: 'First matching record',
          trend: '',
          iconSymbol: 'inventory_2',
          iconBackgroundColor: '#fff4e8',
          iconColor: '#b54708',
          valueColor: '#b54708',
          backgroundColor: '#ffffff',
          layoutVariant: 'icon-inline-split-title-top',
          datasourceId: 'builder_runtime_demo',
          queryId: 'asset_inventory_table',
          field: 'display_name',
          suffix: '',
        };
      default:
        return {};
    }
  }

  private getDefaultBindingExpression(options: SelectOption[], fallback: string): string {
    const preferred = options.find((option) => {
      const value = this.unwrapExpression(String(option.value ?? ''));
      return !!value && !value.endsWith(']') && !this.isObjectLikeBindingPath(value);
    });

    return this.unwrapExpression(String(preferred?.value ?? fallback));
  }

  private isObjectLikeBindingPath(path: string): boolean {
    const lastSegment = path.split('.').pop() ?? path;
    return !lastSegment.includes('[') && /^[A-Z]/.test(this.toLabel(lastSegment)) && !path.match(/\.(name|email|city|status|value|rawValue|title|caption|trend|totalAssets|activeAssets|averageOccupancy|averageRevenueLakhs)$/);
  }

  private flattenBindingValue(
    rootPath: string,
    value: unknown,
    depth = 0,
    maxDepth = 3,
  ): SelectOption[] {
    const labelPrefix = this.toLabel(rootPath.split('.').pop() ?? rootPath);
    const options: SelectOption[] = [{ value: rootPath, label: labelPrefix }];

    if (depth >= maxDepth || value == null) {
      return options;
    }

    if (Array.isArray(value)) {
      const firstItem = value[0];
      if (firstItem && typeof firstItem === 'object') {
        return [
          ...options,
          ...this.flattenBindingValue(`${rootPath}[0]`, firstItem, depth + 1, maxDepth),
        ];
      }

      return options;
    }

    if (typeof value !== 'object') {
      return options;
    }

    return [
      ...options,
      ...Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
        this.flattenBindingValue(`${rootPath}.${key}`, child, depth + 1, maxDepth).map((option) => ({
          ...option,
          label: option.label === this.toLabel(key) ? `${labelPrefix} > ${this.toLabel(key)}` : `${labelPrefix} > ${option.label}`,
        })),
      ),
    ];
  }

  private toLabel(value: string): string {
    return value
      .replace(/\[\d+\]/g, '')
      .split('_')
      .join(' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private unwrapExpression(expression: string): string {
    const trimmed = expression.trim();
    const exactMatch = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    return exactMatch?.[1]?.trim() ?? trimmed;
  }
}
