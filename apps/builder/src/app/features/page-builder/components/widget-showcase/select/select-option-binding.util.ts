export interface SelectBindingRow {
  [key: string]: unknown;
}

export interface SelectBindingFieldOption {
  value: string;
  label: string;
}

export interface SelectBoundOption {
  id: string;
  label: string;
  value: unknown;
  originalRow: SelectBindingRow | null;
}

export function buildSelectQueryBinding(datasourceId: string, queryId: string): string {
  if (!datasourceId || !queryId) {
    return '';
  }

  return `{{datasources.${datasourceId}.queries.${queryId}}}`;
}

export function extractSelectDatasourceIdFromBinding(binding: string): string {
  const path = extractBindingPath(binding);
  const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\./);
  return datasourceMatch?.[1] ?? '';
}

export function extractSelectQueryIdFromBinding(
  binding: string,
  datasourceId: string,
  allowedQueryIds: string[],
): string {
  const path = extractBindingPath(binding);
  if (!path) {
    return '';
  }

  const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\.([^.[]+)/);
  if (datasourceMatch && datasourceMatch[1] === datasourceId && allowedQueryIds.includes(datasourceMatch[2] ?? '')) {
    return datasourceMatch[2] ?? '';
  }

  const topLevelQueryId = path.split(/[.[\]]/, 1)[0] ?? '';
  return allowedQueryIds.includes(topLevelQueryId) ? topLevelQueryId : '';
}

export function tryParseSelectBindingRows(binding: string): SelectBindingRow[] {
  const trimmed = binding.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (Array.isArray(parsed)) {
      return normalizeSelectBindingRows(parsed);
    }

    if (parsed && typeof parsed === 'object') {
      const candidate = parsed as Record<string, unknown>;
      const directRows = extractSelectRowsFromObject(candidate);
      if (directRows.length) {
        return normalizeSelectBindingRows(directRows);
      }

      return normalizeSelectBindingRows([candidate]);
    }
  } catch {
    return [];
  }

  return [];
}

export function buildSelectFieldOptions(rows: SelectBindingRow[]): SelectBindingFieldOption[] {
  const keys = Object.keys(rows[0] ?? {});
  return keys.map((key) => ({
    value: key,
    label: toSelectLabel(key),
  }));
}

export function resolveSelectField(
  rows: SelectBindingRow[],
  requestedField: string,
  fallbackCandidates: string[],
): string {
  const keys = Object.keys(rows[0] ?? {});
  if (!keys.length) {
    return '';
  }

  if (requestedField && keys.includes(requestedField)) {
    return requestedField;
  }

  for (const candidate of fallbackCandidates) {
    if (keys.includes(candidate)) {
      return candidate;
    }
  }

  return keys[0] ?? '';
}

export function transformSelectRowsToOptions(
  rows: SelectBindingRow[],
  labelField: string,
  valueField: string,
): SelectBoundOption[] {
  const seen = new Set<string>();

  return rows.flatMap((row, index) => {
    const label = stringifySelectValue(row[labelField]);
    const value = row[valueField];
    const dedupeKey = JSON.stringify([label, value ?? null]);

    if (seen.has(dedupeKey)) {
      return [];
    }

    seen.add(dedupeKey);

    return [
      {
        id: `${String(value ?? label ?? index)}::${index}`,
        label,
        value,
        originalRow: { ...row },
      },
    ];
  });
}

function extractBindingPath(binding: string): string {
  const trimmed = binding.trim();
  const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
  return exactExpression ? (exactExpression[1] ?? '').trim() : trimmed;
}

function normalizeSelectBindingRows(rows: unknown[]): SelectBindingRow[] {
  return rows.filter((row): row is SelectBindingRow => !!row && typeof row === 'object');
}

function extractSelectRowsFromObject(candidate: Record<string, unknown>): unknown[] {
  const directCollections = ['data', 'rows', 'records', 'items'];
  for (const key of directCollections) {
    const value = candidate[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  const table = candidate['table'];
  if (table && typeof table === 'object' && !Array.isArray(table)) {
    return extractSelectRowsFromObject(table as Record<string, unknown>);
  }

  return [];
}

function toSelectLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function stringifySelectValue(value: unknown): string {
  if (value == null) {
    return '';
  }

  return typeof value === 'string' ? value : String(value);
}
