import { TableColumnConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { resolvePageBuilderExpression } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';

export type TableRow = Record<string, string | number>;

export function toLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function resolveConfiguredColumns(columnConfigs: TableColumnConfig[], fallbackKeys: string[]): TableColumnConfig[] {
  if (!columnConfigs.length) {
    return [];
  }

  const availableKeys = new Set(fallbackKeys);
  return [...columnConfigs]
    .filter((column) => column.visible && (!availableKeys.size || availableKeys.has(column.key)))
    .sort((left, right) => left.order - right.order);
}

export function normalizeDataSourceRows(rows: Array<Record<string, unknown>>): TableRow[] {
  return rows.map((row) => {
    const normalized: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' || typeof value === 'number') {
        normalized[key] = value;
      } else if (typeof value === 'boolean') {
        normalized[key] = value ? 'true' : 'false';
      }
    }

    return normalized;
  });
}

export function normalizeResolvedRows(rows: unknown[]): TableRow[] {
  return rows
    .map((row) => {
      if (!row || typeof row !== 'object') {
        return null;
      }

      const normalized: TableRow = {};
      for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
        if (typeof value === 'string' || typeof value === 'number') {
          normalized[key] = value;
        } else if (typeof value === 'boolean') {
          normalized[key] = value ? 'true' : 'false';
        }
      }

      return Object.keys(normalized).length ? normalized : null;
    })
    .filter((row): row is TableRow => row !== null);
}

export function resolveBindingRows(binding: string): TableRow[] {
  const resolved = resolvePageBuilderExpression(binding);

  if (Array.isArray(resolved)) {
    return normalizeResolvedRows(resolved);
  }

  if (resolved && typeof resolved === 'object') {
    const extractedRows = extractTableRowsFromObject(resolved as Record<string, unknown>);
    if (extractedRows.length) {
      return normalizeResolvedRows(extractedRows);
    }

    return normalizeResolvedRows([resolved]);
  }

  return [];
}

export function tryParseJsonRows(binding: string): TableRow[] {
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
      const extractedRows = extractTableRowsFromObject(parsed as Record<string, unknown>);
      if (extractedRows.length) {
        return normalizeResolvedRows(extractedRows);
      }

      return normalizeResolvedRows([parsed]);
    }
  } catch {
    return [];
  }

  return [];
}

export function tryParseJsonColumns(binding: string): string[] {
  const trimmed = binding.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return [];
    }

    return extractTableColumnsFromObject(parsed as Record<string, unknown>);
  } catch {
    return [];
  }
}

export function extractTableRowsFromObject(candidate: Record<string, unknown>): unknown[] {
  const directCollections = ['data', 'rows', 'records', 'items'];
  for (const key of directCollections) {
    const value = candidate[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  const table = candidate['table'];
  if (table && typeof table === 'object' && !Array.isArray(table)) {
    return extractTableRowsFromObject(table as Record<string, unknown>);
  }

  return [];
}

export function extractTableColumnsFromObject(candidate: Record<string, unknown>): string[] {
  const directColumns = candidate['columns'];
  if (Array.isArray(directColumns)) {
    const keys = directColumns
      .map((column) => {
        if (!column || typeof column !== 'object') {
          return '';
        }

        const record = column as Record<string, unknown>;
        const id = record['id'];
        const key = record['key'];
        return typeof id === 'string' && id.trim()
          ? id
          : typeof key === 'string' && key.trim()
            ? key
            : '';
      })
      .filter((value): value is string => !!value)
      .slice(0, 6);

    if (keys.length) {
      return keys;
    }
  }

  const table = candidate['table'];
  if (table && typeof table === 'object' && !Array.isArray(table)) {
    return extractTableColumnsFromObject(table as Record<string, unknown>);
  }

  return [];
}
