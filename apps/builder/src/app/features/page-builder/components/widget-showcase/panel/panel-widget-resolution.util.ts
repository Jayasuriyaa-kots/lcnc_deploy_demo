import { PageBuilderDataBindingService } from '@builder/features/page-builder/services/page-builder-data-binding.service';
import { PageBuilderRuntimeDatasourceState } from '@builder/features/page-builder/services/page-builder-runtime-state.service';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal/search-criteria-modal.component';
import { resolvePanelBinding } from '@builder/features/page-builder/components/widget-showcase/panel/panel-widget-data-binding.util';
import {
  PanelWidgetAggregationType,
  PanelWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

export type PanelWidgetResolutionState = 'ready' | 'empty' | 'unconfigured' | 'invalid' | 'no_data';

export interface PanelWidgetResolutionContext {
  runtimeDatasources: Record<string, PageBuilderRuntimeDatasourceState>;
  getRows: (datasourceId: string, queryId: string) => Array<Record<string, unknown>>;
  resolveBinding: (expression: string) => unknown;
}

export interface PanelWidgetResolution {
  state: PanelWidgetResolutionState;
  message: string;
  datasourceId: string;
  queryRows: Array<Record<string, unknown>>;
  filteredRows: Array<Record<string, unknown>>;
  matchedRows: Array<Record<string, unknown>>;
  rawValue: unknown;
  displayValue: string;
  totalRowCount: number;
  filteredRowCount: number;
  matchedRowCount: number;
}

export function resolvePanelWidget(
  config: PanelWidgetConfig,
  context: PanelWidgetResolutionContext,
  dataBindingService: PageBuilderDataBindingService,
): PanelWidgetResolution {
  const binding = resolvePanelBinding(config);
  const rawInput = binding.expression.trim() || binding.staticValue.trim();
  const datasourceId = resolveDatasourceId(binding.datasourceId.trim(), binding.queryId.trim(), context.runtimeDatasources);
  const queryId = binding.queryId.trim();
  const queryRows = datasourceId && queryId ? context.getRows(datasourceId, queryId).map((row) => ({ ...row })) : [];
  const filteredRows = applyRules(queryRows, binding.filters);
  const conditionRules = binding.condition ? [binding.condition] : [];
  const matchedRows = applyRules(filteredRows, conditionRules);
  const totalRowCount = queryRows.length;
  const filteredRowCount = filteredRows.length;
  const matchedRowCount = matchedRows.length;
  const defaultResolution = {
    datasourceId,
    queryRows,
    filteredRows,
    matchedRows,
    totalRowCount,
    filteredRowCount,
    matchedRowCount,
  };

  switch (binding.mode) {
    case 'static': {
      const rawValue = rawInput || config.value;
      return finalizeResolution(rawValue, config, dataBindingService, {
        ...defaultResolution,
        state: rawValue ? 'ready' : 'unconfigured',
        message: rawValue ? 'Showing static text' : 'Enter a static value to preview this card',
      });
    }

    case 'query-field': {
      if (binding.expression.trim()) {
        const rawValue = resolveBindingValue(binding, context.resolveBinding, dataBindingService);
        return finalizeResolution(rawValue, config, dataBindingService, {
          ...defaultResolution,
          state: rawValue == null || rawValue === '' ? 'empty' : 'ready',
          message:
            rawValue == null || rawValue === ''
              ? 'The current binding resolved to an empty value'
              : 'Binding resolved successfully',
        });
      }

      const setupIssue = getDatasourceSetupIssue(binding.datasourceId, binding.queryId, datasourceId);
      if (setupIssue) {
        return finalizeResolution('', config, dataBindingService, { ...defaultResolution, ...setupIssue });
      }

      if (!queryRows.length) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'no_data',
          message: 'No rows are available for the selected query',
        });
      }

      if (!binding.field.trim()) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'unconfigured',
          message: 'Choose a field to display',
        });
      }

      const firstRow = filteredRows[0] ?? queryRows[0];
      if (!firstRow || !hasField(firstRow, binding.field)) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'invalid',
          message: 'The selected field is not available in this query result',
        });
      }

      const rawValue = firstRow[binding.field];
      return finalizeResolution(rawValue, config, dataBindingService, {
        ...defaultResolution,
        state: rawValue == null || rawValue === '' ? 'empty' : 'ready',
        message:
          rawValue == null || rawValue === ''
            ? 'The selected field is empty in the first matching record'
            : filteredRows.length !== queryRows.length
              ? `Previewing the first record from ${filteredRows.length} filtered rows`
              : 'Previewing the first record from this query result',
      });
    }

    case 'aggregation': {
      const setupIssue = getDatasourceSetupIssue(binding.datasourceId, binding.queryId, datasourceId);
      if (setupIssue) {
        return finalizeResolution('', config, dataBindingService, { ...defaultResolution, ...setupIssue });
      }

      if (!binding.field.trim() && binding.aggregationType !== 'count') {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'unconfigured',
          message: 'Choose a field to aggregate',
        });
      }

      if (!filteredRows.length) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'no_data',
          message: 'No rows matched the current selection',
        });
      }

      const aggregationResult = resolveAggregation(binding.aggregationType || 'sum', binding.field, filteredRows);
      if (aggregationResult.invalid) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'invalid',
          message: aggregationResult.message,
        });
      }

      return finalizeResolution(aggregationResult.value, config, dataBindingService, {
        ...defaultResolution,
        state: 'ready',
        message: `Calculated from ${filteredRows.length} row${filteredRows.length === 1 ? '' : 's'}`,
      });
    }

    case 'formula': {
      if (binding.expression.trim()) {
        const rawValue = resolveBindingValue(binding, context.resolveBinding, dataBindingService);
        return finalizeResolution(rawValue, config, dataBindingService, {
          ...defaultResolution,
          state: rawValue == null || rawValue === '' ? 'empty' : 'ready',
          message:
            rawValue == null || rawValue === ''
              ? 'The current formula resolved to an empty value'
              : 'Formula resolved successfully',
        });
      }

      const setupIssue = getDatasourceSetupIssue(binding.datasourceId, binding.queryId, datasourceId);
      if (setupIssue) {
        return finalizeResolution('', config, dataBindingService, { ...defaultResolution, ...setupIssue });
      }

      if (!filteredRows.length) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'no_data',
          message: 'No rows matched the base query for this KPI',
        });
      }

      if (!binding.condition || !isValidRule(binding.condition)) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'unconfigured',
          message: 'Define a KPI condition to calculate the percentage',
        });
      }

      const rawValue = (matchedRows.length / filteredRows.length) * 100;
      return finalizeResolution(rawValue, config, dataBindingService, {
        ...defaultResolution,
        state: 'ready',
        message: `${matchedRows.length} of ${filteredRows.length} rows match the KPI condition`,
      });
    }

    case 'page':
    case 'widget':
    case 'expression': {
      const expression = binding.expression.trim();
      if (!expression) {
        return finalizeResolution('', config, dataBindingService, {
          ...defaultResolution,
          state: 'unconfigured',
          message:
            binding.mode === 'page'
              ? 'Choose a page variable to preview'
              : binding.mode === 'widget'
                ? 'Choose a widget binding to preview'
                : 'Enter an expression to preview',
        });
      }

      const rawValue = resolveBindingValue(binding, context.resolveBinding, dataBindingService);
      return finalizeResolution(rawValue, config, dataBindingService, {
        ...defaultResolution,
        state: rawValue == null || rawValue === '' ? 'empty' : 'ready',
        message:
          rawValue == null || rawValue === ''
            ? 'The current binding resolved to an empty value'
            : 'Binding resolved successfully',
      });
    }

    default:
      return finalizeResolution(config.value, config, dataBindingService, {
        ...defaultResolution,
        state: config.value ? 'ready' : 'empty',
        message: config.value ? 'Showing configured value' : 'No value available',
      });
  }
}

export function applyRules(
  rows: Array<Record<string, unknown>>,
  rules: SearchCriteriaRow[] | null | undefined,
): Array<Record<string, unknown>> {
  const validRules = (rules ?? []).filter(isValidRule);
  if (!validRules.length) {
    return rows;
  }

  return rows.filter((row) =>
    validRules.reduce((result, rule, index) => {
      const matches = matchesRule(row, rule);
      if (index === 0) {
        return matches;
      }

      return rule.joiner === 'OR' ? result || matches : result && matches;
    }, false),
  );
}

export function resolveAggregation(
  aggregationType: PanelWidgetAggregationType,
  field: string,
  rows: Array<Record<string, unknown>>,
): { value: number; invalid: false } | { value: 0; invalid: true; message: string } {
  if (aggregationType === 'count') {
    return { value: rows.length, invalid: false };
  }

  if (!field.trim()) {
    return { value: 0, invalid: true, message: 'Choose a field for this aggregation' };
  }

  if (aggregationType === 'distinct_count') {
    if (!rows.some((row) => hasField(row, field))) {
      return { value: 0, invalid: true, message: 'The selected field is not available in this query result' };
    }

    return {
      value: new Set(rows.map((row) => String(row[field] ?? '')).filter((value) => value !== '')).size,
      invalid: false,
    };
  }

  const numericValues = rows
    .map((row) => row[field])
    .filter((value) => value != null && value !== '')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (!numericValues.length) {
    return {
      value: 0,
      invalid: true,
      message: 'The selected field does not contain numeric values for this aggregation',
    };
  }

  switch (aggregationType) {
    case 'sum':
      return { value: numericValues.reduce((sum, value) => sum + value, 0), invalid: false };
    case 'min':
      return { value: Math.min(...numericValues), invalid: false };
    case 'max':
      return { value: Math.max(...numericValues), invalid: false };
    case 'average':
      return { value: numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length, invalid: false };
    case 'median': {
      const sorted = [...numericValues].sort((left, right) => left - right);
      const midpoint = Math.floor(sorted.length / 2);
      return {
        value: sorted.length % 2 === 0 ? (sorted[midpoint - 1] + sorted[midpoint]) / 2 : sorted[midpoint],
        invalid: false,
      };
    }
    default:
      return { value: numericValues[0], invalid: false };
  }
}

export function formatPanelWidgetValue(
  value: unknown,
  config: PanelWidgetConfig,
  dataBindingService: PageBuilderDataBindingService,
): string {
  if (value == null || value === '') {
    return '';
  }

  const binding = resolvePanelBinding(config);
  const normalizedValue =
    typeof value === 'number' ? (Number.isInteger(value) ? value : Number(value.toFixed(2))) : typeof value === 'boolean' ? (value ? 'True' : 'False') : value;
  return dataBindingService.applyFormat(normalizedValue, getValueSuffix(config, binding.format));
}

export function stringifyValue(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
}

function finalizeResolution(
  rawValue: unknown,
  config: PanelWidgetConfig,
  dataBindingService: PageBuilderDataBindingService,
  resolution: Omit<PanelWidgetResolution, 'rawValue' | 'displayValue'> & { state: PanelWidgetResolutionState; message: string },
): PanelWidgetResolution {
  return {
    ...resolution,
    rawValue,
    displayValue: formatPanelWidgetValue(rawValue, config, dataBindingService),
  };
}

function resolveDatasourceId(
  datasourceId: string,
  queryId: string,
  runtimeDatasources: Record<string, PageBuilderRuntimeDatasourceState>,
): string {
  if (datasourceId) {
    return datasourceId;
  }

  if (!queryId) {
    return '';
  }

  for (const [candidateDatasourceId, datasource] of Object.entries(runtimeDatasources)) {
    if (datasource.queries?.[queryId]) {
      return candidateDatasourceId;
    }
  }

  return '';
}

function getDatasourceSetupIssue(datasourceId: string, queryId: string, resolvedDatasourceId: string):
  | { state: PanelWidgetResolutionState; message: string }
  | null {
  if (!resolvedDatasourceId) {
    return {
      state: 'unconfigured',
      message: 'Choose a datasource to continue',
    };
  }

  if (!queryId.trim()) {
    return {
      state: 'unconfigured',
      message: 'Choose a query or table to continue',
    };
  }

  if (datasourceId.trim() && datasourceId.trim() !== resolvedDatasourceId) {
    return {
      state: 'invalid',
      message: 'The selected query is not available in the chosen datasource',
    };
  }

  return null;
}

function resolveBindingValue(
  binding: { expression: string; fallbackValue: string },
  resolveBinding: (expression: string) => unknown,
  dataBindingService: PageBuilderDataBindingService,
): unknown {
  return dataBindingService.resolveBindingValue(binding, resolveBinding);
}

function getValueSuffix(config: PanelWidgetConfig, bindingFormat: string): string {
  if (bindingFormat.trim()) {
    return bindingFormat;
  }

  if (config.suffix.trim()) {
    return config.suffix;
  }

  return config.sourceType === 'kpi_percentage' ? '%' : '';
}

function matchesRule(row: Record<string, unknown>, rule: SearchCriteriaRow): boolean {
  const rawValue = row[rule.field];
  const left = String(rawValue ?? '').toLowerCase();
  const right = rule.value.toLowerCase();
  const leftNumber = Number(rawValue);
  const rightNumber = Number(rule.value);

  switch (rule.operator) {
    case 'equals':
      return left === right;
    case 'not_equals':
    case 'notEquals':
      return left !== right;
    case 'contains':
      return left.includes(right);
    case 'starts_with':
    case 'startsWith':
      return left.startsWith(right);
    case 'ends_with':
    case 'endsWith':
      return left.endsWith(right);
    case 'greater_than':
    case 'greaterThan':
      return Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber > rightNumber;
    case 'less_than':
    case 'lessThan':
      return Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber < rightNumber;
    default:
      return false;
  }
}

function isValidRule(rule: SearchCriteriaRow | null | undefined): rule is SearchCriteriaRow {
  return !!rule && !!rule.field.trim() && !!rule.operator.trim() && !!rule.value.trim();
}

function hasField(row: Record<string, unknown>, field: string): boolean {
  return field in row;
}
