import { Injectable } from '@angular/core';
import { getPageBuilderMockQueryOptions } from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import { getPageBuilderRuntimeStateSnapshot } from '@builder/features/page-builder/services/page-builder-runtime-state.service';

const EXPRESSION_PATTERN = /\{\{\s*([^}]+?)\s*\}\}/g;

function getPageBuilderExpressionRootContext(): Record<string, unknown> {
  const runtimeState = getPageBuilderRuntimeStateSnapshot();
  const widgetAliases = runtimeState.widgets;
  const datasourceAliases = Object.fromEntries(
    Object.entries(runtimeState.datasources).map(([datasourceId, datasourceState]) => [datasourceId, datasourceState]),
  );
  const queryOptions = getPageBuilderMockQueryOptions();
  const queryAliases = Object.fromEntries(
    Object.entries(runtimeState.datasources).flatMap(([datasourceId, datasourceState]) =>
      Object.entries(datasourceState.queries ?? {}).map(([queryId, queryState]) => [
        queryId,
        {
          ...queryState,
          ...asObject(widgetAliases[queryId]),
          ...asObject(widgetAliases[`__table_query_selection__:${queryId}`]),
          datasourceId,
          resultKind: queryState.resultKind ?? queryOptions.find((option) => option.value === queryId)?.resultKind ?? 'query',
          displayLabel: queryState.displayLabel ?? queryOptions.find((option) => option.value === queryId)?.label ?? queryId,
        },
      ]),
    ),
  );

  return {
    widgets: runtimeState.widgets,
    datasources: runtimeState.datasources,
    globals: runtimeState.globals,
    page: runtimeState.globals,
    ...widgetAliases,
    ...datasourceAliases,
    ...queryAliases,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function resolvePageBuilderExpression(expression: string): unknown {
  const trimmed = expression.trim();
  const exactMatch = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);

  if (exactMatch) {
    return resolvePageBuilderExpressionPath(exactMatch[1]?.trim() ?? '');
  }

  return trimmed.replace(EXPRESSION_PATTERN, (_match, path) => stringifyPageBuilderExpressionValue(resolvePageBuilderExpressionPath(String(path).trim())));
}

export function resolvePageBuilderExpressionToString(expression: string): string {
  const resolved = resolvePageBuilderExpression(expression);

  if (resolved == null) {
    return '';
  }

  return typeof resolved === 'string' ? resolved : stringifyPageBuilderExpressionValue(resolved);
}

function resolvePageBuilderExpressionPath(path: string): unknown {
  if (!path) {
    return '';
  }

  const rootContext = getPageBuilderExpressionRootContext();
  const segments = parsePageBuilderExpressionPath(path);
  let current: unknown = rootContext;

  for (const segment of segments) {
    if (current == null) {
      return '';
    }

    if (typeof segment === 'number') {
      if (!Array.isArray(current) || segment < 0 || segment >= current.length) {
        return '';
      }
      current = current[segment];
      continue;
    }

    if (typeof current !== 'object') {
      return '';
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current ?? '';
}

function parsePageBuilderExpressionPath(path: string): Array<string | number> {
  const segments: Array<string | number> = [];
  const matcher = /([^[.\]]+)|\[(\d+|'.*?'|".*?")\]/g;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(path)) !== null) {
    const [, dotSegment, bracketSegment] = match;

    if (dotSegment) {
      segments.push(dotSegment);
      continue;
    }

    if (!bracketSegment) {
      continue;
    }

    if (/^\d+$/.test(bracketSegment)) {
      segments.push(Number(bracketSegment));
      continue;
    }

    segments.push(bracketSegment.slice(1, -1));
  }

  return segments;
}

function stringifyPageBuilderExpressionValue(value: unknown): string {
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

@Injectable({ providedIn: 'root' })
export class PageBuilderExpressionResolverService {
  resolve(expression: string): unknown {
    return resolvePageBuilderExpression(expression);
  }

  resolveToString(expression: string): string {
    return resolvePageBuilderExpressionToString(expression);
  }
}
