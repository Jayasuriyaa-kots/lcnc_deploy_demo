import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';

export type DataBindingMode = 'static' | 'query-field' | 'aggregation' | 'page' | 'widget' | 'expression' | 'formula';

export type DataBindingAggregationType =
  | 'sum'
  | 'min'
  | 'max'
  | 'average'
  | 'median'
  | 'count'
  | 'distinct_count'
  | '';

export type DataBindingFormulaType = 'kpi-percentage' | '';

export interface DataBindingConfig {
  mode: DataBindingMode;
  staticValue: string;
  datasourceId: string;
  queryId: string;
  field: string;
  expression: string;
  aggregationType: DataBindingAggregationType;
  filters: SearchCriteriaRow[];
  condition: SearchCriteriaRow | null;
  formulaType: DataBindingFormulaType;
  format: string;
  fallbackValue: string;
}

export function createDefaultDataBindingConfig(): DataBindingConfig {
  return {
    mode: 'static',
    staticValue: '',
    datasourceId: '',
    queryId: '',
    field: '',
    expression: '',
    aggregationType: '',
    filters: [],
    condition: null,
    formulaType: '',
    format: '',
    fallbackValue: '',
  };
}

export function cloneDataBindingConfig(config?: DataBindingConfig | null): DataBindingConfig {
  return {
    ...createDefaultDataBindingConfig(),
    ...(config ?? {}),
    filters: (config?.filters ?? []).map((row) => ({ ...row })),
    condition: config?.condition ? { ...config.condition } : null,
  };
}
