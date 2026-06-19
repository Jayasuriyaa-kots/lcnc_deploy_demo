import { PageBuilderDataBindingService } from '@builder/features/page-builder/services/page-builder-data-binding.service';
import {
  cloneDataBindingConfig,
  createDefaultDataBindingConfig,
  DataBindingConfig,
} from '@builder/features/page-builder/models/data-binding.model';
import { PanelWidgetConfig, PanelWidgetPresetId, PanelWidgetSourceType } from '@builder/features/page-builder/models/page-builder-canvas.model';

export function resolvePanelBinding(config: PanelWidgetConfig): DataBindingConfig {
  if (config.binding) {
    return cloneDataBindingConfig(config.binding);
  }

  return {
    ...createDefaultDataBindingConfig(),
    ...resolveBindingFromLegacyFields(config),
  };
}

export function applyPanelBinding(
  config: PanelWidgetConfig,
  binding: DataBindingConfig,
  dataBindingService: PageBuilderDataBindingService,
): PanelWidgetConfig {
  const normalizedBinding = cloneDataBindingConfig(binding);
  const rawInput = normalizedBinding.expression.trim() || normalizedBinding.staticValue.trim();
  const inferredMode = dataBindingService.inferMode(rawInput);
  const datasourceRef = dataBindingService.extractFirstDatasourceQueryRef(rawInput);
  const resolvedDatasourceId =
    inferredMode === 'query-field' || inferredMode === 'aggregation' || inferredMode === 'formula'
      ? normalizedBinding.datasourceId || datasourceRef?.datasourceId || ''
      : datasourceRef?.datasourceId || '';
  const resolvedQueryId =
    inferredMode === 'query-field' || inferredMode === 'aggregation' || inferredMode === 'formula'
      ? normalizedBinding.queryId || datasourceRef?.queryId || ''
      : datasourceRef?.queryId || '';

  return {
    ...config,
    binding: {
      ...normalizedBinding,
      mode: inferredMode,
      datasourceId: resolvedDatasourceId,
      queryId: resolvedQueryId,
      staticValue: inferredMode === 'static' ? rawInput : normalizedBinding.staticValue,
    },
    sourceType: resolveLegacySourceType(inferredMode),
    datasourceId: resolvedDatasourceId,
    queryId: resolvedQueryId,
    field: inferredMode === 'query-field' || inferredMode === 'aggregation' ? normalizedBinding.field : '',
    aggregationType: normalizedBinding.aggregationType || 'sum',
    filters: normalizedBinding.filters,
    condition: normalizedBinding.condition,
    staticText: inferredMode === 'static' ? rawInput : normalizedBinding.staticValue,
    bindingExpression: rawInput,
    presetId: config.presetId,
  };
}

export function createPanelPresetBinding(presetId: PanelWidgetPresetId, currentBinding?: DataBindingConfig | null): DataBindingConfig {
  const nextBinding = cloneDataBindingConfig(currentBinding);

  switch (presetId) {
    case 'revenue_kpi':
    case 'occupancy_percentage':
      return {
        ...nextBinding,
        mode: 'aggregation',
        aggregationType: 'average',
      };
    case 'asset_summary':
      return {
        ...nextBinding,
        mode: 'query-field',
      };
    default:
      return nextBinding;
  }
}

function resolveBindingFromLegacyFields(config: PanelWidgetConfig): Partial<DataBindingConfig> {
  if (config.sourceType === 'preset') {
    return {
      ...resolveBindingFromPreset(config.presetId),
      datasourceId: config.datasourceId,
      queryId: config.queryId,
      field: config.field,
      aggregationType: config.aggregationType,
      staticValue: config.staticText,
      filters: config.filters,
      condition: config.condition,
      expression: config.bindingExpression,
    };
  }

  switch (config.sourceType) {
    case 'text':
      return {
        mode: 'static',
        staticValue: config.staticText,
      };
    case 'query_field':
      return {
        mode: 'query-field',
        datasourceId: config.datasourceId,
        queryId: config.queryId,
        field: config.field,
      };
    case 'aggregation':
      return {
        mode: 'aggregation',
        datasourceId: config.datasourceId,
        queryId: config.queryId,
        field: config.field,
        aggregationType: config.aggregationType,
      };
    case 'kpi_percentage':
      return {
        mode: 'formula',
        datasourceId: config.datasourceId,
        queryId: config.queryId,
        filters: config.filters,
        condition: config.condition,
        formulaType: 'kpi-percentage',
      };
    case 'page_variable':
      return {
        mode: 'page',
        expression: config.bindingExpression,
      };
    case 'widget_binding':
      return {
        mode: 'widget',
        expression: config.bindingExpression,
      };
    default:
      return createDefaultDataBindingConfig();
  }
}

function resolveBindingFromPreset(presetId: PanelWidgetPresetId | ''): Partial<DataBindingConfig> {
  switch (presetId) {
    case 'revenue_kpi':
    case 'occupancy_percentage':
      return {
        mode: 'aggregation',
        aggregationType: 'average',
      };
    case 'asset_summary':
      return {
        mode: 'query-field',
      };
    default:
      return { mode: 'static' };
  }
}

function resolveLegacySourceType(mode: DataBindingConfig['mode']): PanelWidgetSourceType {
  switch (mode) {
    case 'static':
      return 'text';
    case 'query-field':
      return 'query_field';
    case 'aggregation':
      return 'aggregation';
    case 'formula':
      return 'kpi_percentage';
    case 'page':
      return 'page_variable';
    case 'widget':
    case 'expression':
      return 'widget_binding';
    default:
      return 'text';
  }
}
