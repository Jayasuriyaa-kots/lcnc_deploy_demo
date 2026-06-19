import {
  TableColumnConfig,
  TableWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  getPageBuilderRuntimeKeys,
  getPageBuilderRuntimeRows,
} from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import {
  normalizeDataSourceRows,
  resolveBindingRows,
  resolveConfiguredColumns,
  TableRow,
  toLabel,
  tryParseJsonColumns,
  tryParseJsonRows,
} from '@builder/features/page-builder/components/widget-showcase/table/ui-table/ui-table-widget.util';

const FALLBACK_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

const FALLBACK_ROWS: TableRow[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Robert James', email: 'robert@example.com', status: 'Active' },
  { id: 4, name: 'Lara Chan', email: 'lara@example.com', status: 'Active' },
];

export function resolveDeploymentTableRows(config: TableWidgetConfig): TableRow[] {
  const datasourceId = config.dataSourceKey?.trim() ?? '';
  const queryId = config.queryId?.trim() ?? '';
  const binding = config.queryBinding?.trim() ?? '';
  const hasManualBinding = !!binding && !(datasourceId && queryId);

  if (hasManualBinding) {
    const boundRows = tryParseJsonRows(binding);
    if (boundRows.length) {
      return boundRows;
    }

    const resolvedRows = resolveBindingRows(binding);
    if (resolvedRows.length) {
      return resolvedRows;
    }
  }

  if (datasourceId && queryId) {
    const rows = normalizeDataSourceRows(getPageBuilderRuntimeRows(datasourceId, queryId));
    if (rows.length) {
      return rows;
    }
  }

  if (config.dataRows?.length) {
    return config.dataRows;
  }

  if (datasourceId) {
    const rows = normalizeDataSourceRows(getPageBuilderRuntimeRows(datasourceId));
    if (rows.length) {
      return rows;
    }
  }

  return FALLBACK_ROWS;
}

export function resolveDeploymentTableColumns(
  config: TableWidgetConfig,
  rows: TableRow[],
): Array<{ key: string; label: string }> {
  const datasourceId = config.dataSourceKey?.trim() ?? '';
  const queryId = config.queryId?.trim() ?? '';
  const binding = config.queryBinding?.trim() ?? '';
  const hasManualBinding = !!binding && !(datasourceId && queryId);
  let keys: string[] = [];

  if (hasManualBinding) {
    keys = tryParseJsonColumns(binding);
  }

  if (!keys.length && datasourceId && queryId) {
    keys = getPageBuilderRuntimeKeys(datasourceId, queryId);
  } else if (!keys.length && datasourceId) {
    keys = config.dataColumns?.length
      ? config.dataColumns
      : getPageBuilderRuntimeKeys(datasourceId);
  } else if (!keys.length && config.dataColumns?.length) {
    keys = config.dataColumns;
  }

  if (!keys.length) {
    keys = Object.keys(rows[0] ?? {});
  }

  const configuredColumns = resolveConfiguredColumns(
    config.columnConfigs ?? [],
    keys,
  );

  if (config.columnConfigs?.length) {
    return configuredColumns.map((column: TableColumnConfig) => ({
      key: column.key,
      label: column.label,
    }));
  }

  if (!keys.length) {
    return FALLBACK_COLUMNS;
  }

  return keys.map((key) => ({ key, label: toLabel(key) }));
}
