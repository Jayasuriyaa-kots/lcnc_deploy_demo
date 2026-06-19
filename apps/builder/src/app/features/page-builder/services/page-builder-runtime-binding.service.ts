import { Injectable } from '@angular/core';
import {
  PageBuilderRuntimeDatasourceState,
  pageBuilderRuntimeDatasources,
} from '@builder/features/page-builder/services/page-builder-runtime-state.service';
import { PageBuilderMockDatasourceRow } from '@builder/features/page-builder/services/page-builder-mock-datasource.service';

export interface PageBuilderRuntimeFieldOption {
  value: string;
  label: string;
}

export function getPageBuilderRuntimeRows(datasourceId: string, queryId = ''): PageBuilderMockDatasourceRow[] {
  const datasource = getPageBuilderRuntimeDatasourceState(datasourceId);
  if (!datasource) {
    return [];
  }

  if (queryId.trim()) {
    const queryRows = datasource.queries?.[queryId.trim()]?.data;
    if (queryRows?.length) {
      return queryRows;
    }
  }

  return datasource.data ?? [];
}

export function getPageBuilderRuntimeRow(datasourceId: string, recordId: string, queryId = ''): PageBuilderMockDatasourceRow | null {
  const rows = getPageBuilderRuntimeRows(datasourceId, queryId);
  if (!rows.length) {
    return null;
  }

  if (!recordId.trim()) {
    return rows[0] ?? null;
  }

  return rows.find((row) => String(row.id) === recordId.trim()) ?? null;
}

export function getPageBuilderRuntimeKeys(datasourceId: string, queryId = ''): string[] {
  const firstRow = getPageBuilderRuntimeRows(datasourceId, queryId)[0];
  return firstRow ? Object.keys(firstRow) : [];
}

export function getPageBuilderRuntimeFieldOptions(datasourceId: string, queryId = ''): PageBuilderRuntimeFieldOption[] {
  return getPageBuilderRuntimeKeys(datasourceId, queryId).map((key) => ({
    value: key,
    label: toRuntimeBindingLabel(key),
  }));
}

export function getPageBuilderRuntimeTextFieldOptions(datasourceId: string, queryId = ''): PageBuilderRuntimeFieldOption[] {
  const rows = getPageBuilderRuntimeRows(datasourceId, queryId);
  const keys = getPageBuilderRuntimeKeys(datasourceId, queryId);

  return keys
    .filter((key) => rows.some((row) => typeof row[key] === 'string'))
    .map((key) => ({
      value: key,
      label: toRuntimeBindingLabel(key),
    }));
}

export function getPageBuilderRuntimeNumericFieldOptions(datasourceId: string, queryId = ''): PageBuilderRuntimeFieldOption[] {
  const rows = getPageBuilderRuntimeRows(datasourceId, queryId);
  const keys = getPageBuilderRuntimeKeys(datasourceId, queryId);

  return keys
    .filter((key) => rows.some((row) => typeof row[key] === 'number'))
    .map((key) => ({
      value: key,
      label: toRuntimeBindingLabel(key),
    }));
}

export function getPageBuilderRuntimeDistinctValueOptions(
  datasourceId: string,
  field: string,
  queryId = '',
): Array<{ value: string; label: string }> {
  const values = new Set(
    getPageBuilderRuntimeRows(datasourceId, queryId)
      .map((row) => row[field])
      .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
      .map((value) => String(value)),
  );

  return [...values].map((value) => ({
    value,
    label: value,
  }));
}

function getPageBuilderRuntimeDatasourceState(datasourceId: string): PageBuilderRuntimeDatasourceState | null {
  return pageBuilderRuntimeDatasources()[datasourceId] ?? null;
}

function toRuntimeBindingLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

@Injectable({ providedIn: 'root' })
export class PageBuilderRuntimeBindingService {
  getRows(datasourceId: string, queryId = ''): PageBuilderMockDatasourceRow[] {
    return getPageBuilderRuntimeRows(datasourceId, queryId);
  }

  getRow(datasourceId: string, recordId: string, queryId = ''): PageBuilderMockDatasourceRow | null {
    return getPageBuilderRuntimeRow(datasourceId, recordId, queryId);
  }

  getKeys(datasourceId: string, queryId = ''): string[] {
    return getPageBuilderRuntimeKeys(datasourceId, queryId);
  }

  getFieldOptions(datasourceId: string, queryId = ''): PageBuilderRuntimeFieldOption[] {
    return getPageBuilderRuntimeFieldOptions(datasourceId, queryId);
  }

  getTextFieldOptions(datasourceId: string, queryId = ''): PageBuilderRuntimeFieldOption[] {
    return getPageBuilderRuntimeTextFieldOptions(datasourceId, queryId);
  }

  getNumericFieldOptions(datasourceId: string, queryId = ''): PageBuilderRuntimeFieldOption[] {
    return getPageBuilderRuntimeNumericFieldOptions(datasourceId, queryId);
  }

  getDistinctValueOptions(datasourceId: string, field: string, queryId = ''): Array<{ value: string; label: string }> {
    return getPageBuilderRuntimeDistinctValueOptions(datasourceId, field, queryId);
  }
}
