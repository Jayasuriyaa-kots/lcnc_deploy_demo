import { Injectable, computed, inject } from '@angular/core';

import {
  PageBuilderRuntimeDatasourceState,
  PageBuilderRuntimeQueryState,
  PageBuilderRuntimeStateService,
} from '@builder/features/page-builder/services/page-builder-runtime-state.service';

export interface PageBuilderBindingSuggestion {
  label: string;
  insertText: string;
  type: string;
  description: string;
}

interface TableWidgetState {
  selectedRow: Record<string, unknown>;
  data: Array<Record<string, unknown>>;
}

const TABLE_QUERY_SELECTION_PREFIX = '__table_query_selection__:';

@Injectable({ providedIn: 'root' })
export class PageBuilderBindingRegistryService {
  private readonly runtimeStateService = inject(PageBuilderRuntimeStateService);

  readonly registry = computed<Record<string, unknown>>(() => {
    const runtimeState = this.runtimeStateService.runtimeState();
    const widgetAliases = runtimeState.widgets;
    const datasourceAliases = Object.fromEntries(
      Object.entries(runtimeState.datasources).map(([datasourceId, datasourceState]) => [datasourceId, datasourceState]),
    );
    const queryAliases = Object.fromEntries(
      Object.entries(runtimeState.datasources).flatMap(([datasourceId, datasourceState]) =>
        Object.entries(datasourceState.queries ?? {}).map(([queryId, queryState]) => [
          queryId,
          {
            ...queryState,
            ...this.asObject(widgetAliases[queryId]),
            ...this.asObject(widgetAliases[this.getTableQuerySelectionKey(queryId)]),
            datasourceId,
            resultKind: queryState.resultKind ?? 'query',
            displayLabel: queryState.displayLabel ?? queryId,
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
  });

  getRootContext(): Record<string, unknown> {
    return this.registry();
  }

  getSuggestions(fragment: string, rootKeys: string[] = []): PageBuilderBindingSuggestion[] {
    const normalized = fragment.trim();
    const { parentPath, searchPrefix } = this.parseFragment(normalized);

    if (rootKeys.length > 0 && parentPath) {
      const topLevelKey = this.parsePath(parentPath)[0];
      if (typeof topLevelKey !== 'string' || !rootKeys.includes(topLevelKey)) {
        return [];
      }
    }

    const parentValue = parentPath ? this.resolvePath(parentPath) : this.getRootContext();

    if (Array.isArray(parentValue)) {
      return parentValue
        .slice(0, Math.min(parentValue.length, 5))
        .map((_value, index) => {
          const insertText = `${parentPath}[${index}]`;
          return {
            label: insertText,
            insertText,
            type: 'array-item',
            description: `Item ${index} from array`,
          };
        })
        .filter((suggestion) => suggestion.insertText.toLowerCase().includes(searchPrefix.toLowerCase()));
    }

    if (!parentValue || typeof parentValue !== 'object') {
      return [];
    }

    return this.filteredEntries(parentPath, parentValue as Record<string, unknown>)
      .filter(([key]) => rootKeys.length === 0 || parentPath || rootKeys.includes(key))
      .filter(([key]) => key.toLowerCase().includes(searchPrefix.toLowerCase()))
      .map(([key, value]) => {
        const insertText = this.appendPath(parentPath, key);
        const runtimeResultKind = this.getRuntimeResultKind(value);
        return {
          label: insertText,
          insertText,
          type: runtimeResultKind ? this.formatTypeLabel(runtimeResultKind) : this.formatTypeLabel(this.detectType(value)),
          description: this.describeValue(key, value, parentPath),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private filteredEntries(parentPath: string, parentValue: Record<string, unknown>): Array<[string, unknown]> {
    const entries = Object.entries(parentValue);
    if (!parentPath) {
      return entries;
    }

    const pathSegments = this.parsePath(parentPath);
    if (pathSegments.length !== 1) {
      return entries;
    }

    const topLevelKey = pathSegments[0];
    if (typeof topLevelKey !== 'string') {
      return entries;
    }

    const topLevelValue = this.getRootContext()[topLevelKey];
    if (!this.isRuntimeQueryState(topLevelValue)) {
      return entries;
    }

    const resultKind = topLevelValue.resultKind ?? 'query';
    if (resultKind === 'table') {
      return entries.filter(([key]) => key === 'selectedRow' || key === 'data');
    }

    return entries.filter(([key]) => key === 'data');
  }

  private parseFragment(fragment: string): { parentPath: string; searchPrefix: string } {
    if (!fragment) {
      return { parentPath: '', searchPrefix: '' };
    }

    if (fragment.endsWith('.')) {
      return {
        parentPath: fragment.slice(0, -1),
        searchPrefix: '',
      };
    }

    const lastDotIndex = fragment.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return {
        parentPath: '',
        searchPrefix: fragment,
      };
    }

    return {
      parentPath: fragment.slice(0, lastDotIndex),
      searchPrefix: fragment.slice(lastDotIndex + 1),
    };
  }

  private resolvePath(path: string): unknown {
    if (!path) {
      return this.getRootContext();
    }

    const segments = this.parsePath(path);
    let current: unknown = this.getRootContext();

    for (const segment of segments) {
      if (current == null) {
        return null;
      }

      if (typeof segment === 'number') {
        if (!Array.isArray(current) || segment < 0 || segment >= current.length) {
          return null;
        }
        current = current[segment];
        continue;
      }

      if (typeof current !== 'object') {
        return null;
      }

      current = (current as Record<string, unknown>)[segment];
    }

    return current;
  }

  private parsePath(path: string): Array<string | number> {
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

  private detectType(value: unknown): string {
    if (Array.isArray(value)) {
      return 'array';
    }

    if (value === null) {
      return 'null';
    }

    return typeof value === 'object' ? 'object' : typeof value;
  }

  private formatTypeLabel(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private appendPath(parentPath: string, key: string): string {
    if (!parentPath) {
      return key;
    }

    if (/^[A-Za-z_$][\w$]*$/.test(key)) {
      return `${parentPath}.${key}`;
    }

    return `${parentPath}[${JSON.stringify(key)}]`;
  }

  private describeValue(key: string, value: unknown, parentPath: string): string {
    if (parentPath.startsWith('globals')) {
      return 'Global value';
    }

    if (parentPath.includes('.selectedRow')) {
      return 'Field from selected row';
    }

    if (parentPath.includes('.data[')) {
      return 'Field from query data';
    }

    if (!parentPath && this.isTableWidgetState(value)) {
      return 'Table widget';
    }

    const topLevelKey = parentPath.split('.')[0] ?? '';
    if (topLevelKey && this.isTableWidgetState(this.resolvePath(topLevelKey))) {
      if (key === 'selectedRow') return 'Currently selected row';
      if (key === 'data') return 'All table rows';
    }

    if (this.isRuntimeQueryState(value)) {
      return this.getRuntimeResultKind(value) === 'table' ? 'Table result' : 'Query result';
    }

    if (this.isRuntimeDatasourceState(value)) {
      return 'Datasource result';
    }

    if (Array.isArray(value)) {
      return `${key} array`;
    }

    if (value && typeof value === 'object') {
      return `${key} object`;
    }

    return `${this.detectType(value)} value`;
  }

  private isRuntimeQueryState(value: unknown): value is PageBuilderRuntimeQueryState {
    return !!value && typeof value === 'object' && 'data' in value && 'isLoading' in value && 'error' in value;
  }

  private isRuntimeDatasourceState(value: unknown): value is PageBuilderRuntimeDatasourceState {
    return this.isRuntimeQueryState(value) && 'queries' in value;
  }

  private getRuntimeResultKind(value: unknown): 'query' | 'table' | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const resultKind = (value as Record<string, unknown>)['resultKind'];
    return resultKind === 'table' || resultKind === 'query' ? resultKind : null;
  }

  private isTableWidgetState(value: unknown): value is TableWidgetState {
    return (
      !!value &&
      typeof value === 'object' &&
      'selectedRow' in value &&
      'data' in value &&
      Array.isArray((value as Record<string, unknown>)['data'])
    );
  }

  private asObject(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  }

  private getTableQuerySelectionKey(queryId: string): string {
    return `${TABLE_QUERY_SELECTION_PREFIX}${queryId}`;
  }
}
