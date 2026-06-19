import { computed, Injectable, signal } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { resolvePageBuilderExpression } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import {
  getPageBuilderMockDatasources,
  getPageBuilderMockDatasourceRows,
  getPageBuilderMockQueryOptions,
  getPageBuilderMockQueryRows,
} from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import { getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import {
  createDefaultTableWidgetConfig,
  TableColumnConfig,
  TableColumnType,
  TableSize,
  TableWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { SelectOption } from '@qo/ui-components';

type TableToggleFlag =
  | 'visible'
  | 'showSearch'
  | 'showDownload'
  | 'showSorting'
  | 'showColumnFilters'
  | 'enableAdd'
  | 'enableEdit'
  | 'enableDelete'
  | 'enableDuplicate';

type ConnectTab = 'datasource' | 'query';

@Injectable()
export class TableSettingsFacade {
  readonly config = signal<TableWidgetConfig>(createDefaultTableWidgetConfig());
  readonly configChange = signal<((c: TableWidgetConfig) => void) | null>(null);

  readonly connectModalOpen = signal(false);
  readonly activeConnectTab = signal<ConnectTab>('datasource');
  readonly selectedDataSource = signal<string>('');
  readonly selectedQuery = signal('');
  readonly selectedQueryBinding = signal('');
  readonly searchQuery = signal('');
  readonly selectedColumnKey = signal('');

  readonly dataSourceOptions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const all = getPageBuilderMockDatasources().map((ds) => ({
      key: ds.id,
      name: ds.label,
      caption: `${ds.id}.json`,
    }));

    if (!query) {
      return all;
    }

    return all.filter((option) => option.name.toLowerCase().includes(query) || option.caption.toLowerCase().includes(query));
  });

  readonly queryOptions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const selectedDatasource = this.selectedDataSource();
    const all = getPageBuilderMockQueryOptions()
      .filter((option) => !selectedDatasource || option.datasourceId === selectedDatasource);

    if (!query) {
      return all;
    }

    return all.filter((option) => option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query));
  });

  readonly queryRootKeys = computed(() =>
    getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === this.selectedDataSource())
      .map((option) => option.value),
  );

  readonly queryBindingRootKeys = computed(() => {
    const datasourceId = this.selectedDataSource() || this.config().dataSourceKey;
    if (!datasourceId) {
      return getPageBuilderMockQueryOptions().map((option) => option.value);
    }

    return getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => option.value);
  });

  readonly orderedColumnConfigs = computed(() => [...this.config().columnConfigs].sort((left, right) => left.order - right.order));

  readonly selectedColumnConfig = computed(() => {
    const selectedKey = this.selectedColumnKey();
    if (!selectedKey) {
      return this.orderedColumnConfigs()[0] ?? null;
    }

    return this.orderedColumnConfigs().find((column) => column.key === selectedKey) ?? null;
  });

  readonly datasourceSelectOptions = computed<SelectOption[]>(() => {
    const mapped = this.dataSourceOptions().map((source) => ({
      value: source.key,
      label: source.name,
    }));
    const selectedId = this.selectedDataSource() || this.config().dataSourceKey;

    if (!selectedId || mapped.some((option) => String(option.value) === selectedId)) {
      return mapped;
    }

    const selectedDatasource = getPageBuilderMockDatasources().find((item) => item.id === selectedId);
    if (!selectedDatasource) {
      return mapped;
    }

    return [{ value: selectedDatasource.id, label: selectedDatasource.label }, ...mapped];
  });

  updateRowsPerPage(value: SelectOption['value']): void {
    const rowsPerPage = Number(value);
    this.patchConfig({ rowsPerPage: Number.isFinite(rowsPerPage) && rowsPerPage > 0 ? rowsPerPage : 10 });
  }

  updateColumnVisibility(columnKey: string, visible: boolean): void {
    this.patchConfig({
      columnConfigs: this.config().columnConfigs.map((column) =>
        column.key === columnKey ? { ...column, visible } : column,
      ),
    });
  }

  selectColumn(columnKey: string): void {
    this.selectedColumnKey.set(columnKey);
  }

  updateSelectedColumnLabel(value: string): void {
    const selectedColumn = this.selectedColumnConfig();
    if (!selectedColumn) {
      return;
    }

    const nextLabel = value.trim() || this.toLabel(selectedColumn.key);
    this.patchConfig({
      columnConfigs: this.config().columnConfigs.map((column) =>
        column.key === selectedColumn.key ? { ...column, label: nextLabel } : column,
      ),
    });
  }

  reorderColumns(event: CdkDragDrop<TableColumnConfig[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const nextColumns = [...this.orderedColumnConfigs()];
    moveItemInArray(nextColumns, event.previousIndex, event.currentIndex);

    this.patchConfig({
      columnConfigs: nextColumns.map((column, index) => ({
        ...column,
        order: index,
      })),
    });
  }

  setTableSize(size: TableSize): void {
    this.patchConfig({ tableSize: size });
  }

  toggleFlag(flag: TableToggleFlag): void {
    this.patchConfig({ [flag]: !this.config()[flag] } as Partial<TableWidgetConfig>);
  }

  requestDatabaseConnect(): void {
    this.connectModalOpen.set(true);
    this.activeConnectTab.set('datasource');
    this.selectedDataSource.set(this.config().dataSourceKey);
    this.selectedQuery.set(this.config().queryId);
    this.selectedQueryBinding.set(
      this.config().queryBinding || this.buildQueryBinding(this.config().dataSourceKey, this.config().queryId),
    );
    this.searchQuery.set('');
  }

  closeConnectModal(): void {
    this.connectModalOpen.set(false);
  }

  selectDataSource(key: string): void {
    this.selectedDataSource.set(key);
    this.selectedQuery.set('');
    this.selectedQueryBinding.set('');
  }

  updateInlineDatasource(value: string | number): void {
    const datasourceId = String(value);

    if (datasourceId === this.selectedDataSource()) {
      return;
    }

    this.selectedDataSource.set(datasourceId);
    this.selectedQuery.set('');
    this.selectedQueryBinding.set('');

    queueMicrotask(() => {
      const rows = this.normalizeDataSourceRows(getPageBuilderMockDatasourceRows(datasourceId));
      const columns = this.collectColumnKeys(rows);
      const columnConfigs = this.buildColumnConfigs(columns, rows);

      this.patchConfig({
        dataSourceKey: datasourceId,
        queryId: '',
        queryBinding: '',
        dataColumns: columns,
        columnConfigs,
        dataRows: rows,
      });
    });
  }

  selectQuery(queryId: string): void {
    this.selectedQuery.set(queryId);
    this.selectedQueryBinding.set(this.buildQueryBinding(this.selectedDataSource(), queryId));
  }

  updateQueryBinding(value: string): void {
    const datasourceId = this.extractDatasourceIdFromBinding(value) || this.selectedDataSource() || this.config().dataSourceKey;
    const queryId = this.extractQueryIdFromBinding(value, datasourceId);
    if (datasourceId !== this.selectedDataSource()) {
      this.selectedDataSource.set(datasourceId);
    }
    this.selectedQueryBinding.set(value);
    this.selectedQuery.set(queryId);
    this.applyQueryBindingToConfig(value, queryId, datasourceId);
  }

  setConnectTab(tab: ConnectTab): void {
    this.activeConnectTab.set(tab);
    this.searchQuery.set('');
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchQuery.set(target?.value ?? '');
  }

  connectSelectedDataSource(): void {
    const key =
      this.activeConnectTab() === 'query'
        ? getPageBuilderMockQueryOptions().find((option) => option.value === this.selectedQuery())?.datasourceId ?? ''
        : this.selectedDataSource();
    const rawRows =
      this.activeConnectTab() === 'query'
        ? getPageBuilderMockQueryRows(this.selectedQuery())
        : getPageBuilderMockDatasourceRows(key);
    const queryId = this.activeConnectTab() === 'query' ? this.selectedQuery() : '';

    if (!key || !rawRows.length) {
      return;
    }

    const rows = this.normalizeDataSourceRows(rawRows);
    const columns = this.collectColumnKeys(rows);
    const columnConfigs = this.buildColumnConfigs(columns, rows);

    this.patchConfig({
      dataSourceKey: key,
      queryId,
      queryBinding: this.activeConnectTab() === 'query' ? this.selectedQueryBinding() : '',
      dataColumns: columns,
      columnConfigs,
      dataRows: rows,
    });
    this.connectModalOpen.set(false);
  }

  private normalizeDataSourceRows(rows: Array<Record<string, unknown>>): Array<Record<string, string | number>> {
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

  private patchConfig(partial: Partial<TableWidgetConfig>): void {
    const nextConfig = {
      ...this.config(),
      ...partial,
    };
    this.config.set(nextConfig);
    const fn = this.configChange();
    if (fn) {
      fn(nextConfig);
    }
  }

  private applyQueryBindingToConfig(binding: string, queryId: string, datasourceId: string): void {
    const isDatasourceQueryBinding = !!datasourceId && !!queryId;
    const resolvedRows = isDatasourceQueryBinding
      ? this.normalizeDataSourceRows(getPageBuilderRuntimeRows(datasourceId, queryId))
      : this.resolveBindingRows(binding);
    const inferredColumns = isDatasourceQueryBinding
      ? this.collectColumnKeys(resolvedRows)
      : this.resolveBindingColumns(binding, resolvedRows);
    const inferredColumnConfigs = this.buildColumnConfigs(inferredColumns, resolvedRows);

    if (!queryId) {
      this.patchConfig({
        dataSourceKey: datasourceId,
        queryId: '',
        queryBinding: binding,
        dataColumns: inferredColumns,
        columnConfigs: inferredColumnConfigs,
        dataRows: resolvedRows,
      });
      return;
    }

    const rows = resolvedRows.length
      ? resolvedRows
      : this.normalizeDataSourceRows(getPageBuilderRuntimeRows(datasourceId, queryId));
    const columns = this.collectColumnKeys(rows);
    const nextColumns = inferredColumns.length ? inferredColumns : columns;
    const nextColumnConfigs = this.buildColumnConfigs(nextColumns, rows);

    this.patchConfig({
      dataSourceKey: datasourceId,
      queryId,
      queryBinding: binding,
      dataColumns: nextColumns,
      columnConfigs: nextColumnConfigs,
      dataRows: rows,
    });
  }

  private buildQueryBinding(datasourceId: string, queryId: string): string {
    if (!datasourceId || !queryId) {
      return '';
    }

    return `{{datasources.${datasourceId}.queries.${queryId}}}`;
  }

  private extractQueryIdFromBinding(binding: string, datasourceId: string): string {
    const allowedQueryIds = getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => option.value);
    const trimmed = binding.trim();
    const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    const path = exactExpression ? (exactExpression[1] ?? '').trim() : trimmed;

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

  private extractDatasourceIdFromBinding(binding: string): string {
    const trimmed = binding.trim();
    const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    const path = exactExpression ? (exactExpression[1] ?? '').trim() : trimmed;
    const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\./);
    return datasourceMatch?.[1] ?? '';
  }

  private resolveBindingRows(binding: string): Array<Record<string, string | number>> {
    const jsonRows = this.tryParseJsonRows(binding);
    if (jsonRows.length) {
      return jsonRows;
    }

    const resolved = resolvePageBuilderExpression(binding);

    if (Array.isArray(resolved)) {
      return this.normalizeResolvedRows(resolved);
    }

    if (resolved && typeof resolved === 'object') {
      return this.normalizeResolvedRows([resolved]);
    }

    if (resolved == null || resolved === '') {
      return [];
    }

    return [{ value: String(resolved) }];
  }

  private resolveBindingColumns(binding: string, rows: Array<Record<string, string | number>>): string[] {
    const parsedColumns = this.tryParseJsonColumns(binding);
    if (parsedColumns.length) {
      return parsedColumns;
    }

    return this.collectColumnKeys(rows);
  }

  private collectColumnKeys(rows: Array<Record<string, string | number>>): string[] {
    const orderedKeys: string[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          orderedKeys.push(key);
        }
      }
    }

    return orderedKeys;
  }

  private buildColumnConfigs(keys: string[], rows: Array<Record<string, string | number>>): TableColumnConfig[] {
    const existingByKey = new Map(this.config().columnConfigs.map((column) => [column.key, column]));

    return keys.map((key, index) => {
      const existing = existingByKey.get(key);

      return {
        key,
        label: existing?.label || this.toLabel(key),
        visible: existing?.visible ?? true,
        order: existing?.order ?? index,
        width: existing?.width ?? 180,
        align: existing?.align ?? 'left',
        type: existing?.type ?? this.inferColumnType(key, rows),
      };
    });
  }

  private inferColumnType(key: string, rows: Array<Record<string, string | number>>): TableColumnType {
    const values = rows
      .map((row) => row[key])
      .filter((value): value is string | number => value !== undefined && value !== null && value !== '');

    if (values.length && values.every((value) => typeof value === 'number')) {
      return 'number';
    }

    if (values.length && values.every((value) => typeof value === 'string' && /^(https?:\/\/|www\.)/i.test(value))) {
      return 'url';
    }

    return 'text';
  }

  private toLabel(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  private normalizeResolvedRows(rows: unknown[]): Array<Record<string, string | number>> {
    return rows
      .map((row) => {
        if (!row || typeof row !== 'object') {
          return null;
        }

        const normalized: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
          if (typeof value === 'string' || typeof value === 'number') {
            normalized[key] = value;
          } else if (typeof value === 'boolean') {
            normalized[key] = value ? 'true' : 'false';
          }
        }

        return Object.keys(normalized).length ? normalized : null;
      })
      .filter((row): row is Record<string, string | number> => row !== null);
  }

  private tryParseJsonRows(binding: string): Array<Record<string, string | number>> {
    const trimmed = binding.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;

      if (Array.isArray(parsed)) {
        return this.normalizeResolvedRows(parsed);
      }

      if (parsed && typeof parsed === 'object') {
        const extractedRows = this.extractTableRowsFromObject(parsed as Record<string, unknown>);
        if (extractedRows.length) {
          return this.normalizeResolvedRows(extractedRows);
        }

        return this.normalizeResolvedRows([parsed]);
      }
    } catch {
      return [];
    }

    return [];
  }

  private tryParseJsonColumns(binding: string): string[] {
    const trimmed = binding.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return [];
      }

      return this.extractTableColumnsFromObject(parsed as Record<string, unknown>);
    } catch {
      return [];
    }
  }

  private extractTableRowsFromObject(candidate: Record<string, unknown>): unknown[] {
    const directCollections = ['data', 'rows', 'records', 'items'];
    for (const key of directCollections) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value;
      }
    }

    const table = candidate['table'];
    if (table && typeof table === 'object' && !Array.isArray(table)) {
      return this.extractTableRowsFromObject(table as Record<string, unknown>);
    }

    return [];
  }

  private extractTableColumnsFromObject(candidate: Record<string, unknown>): string[] {
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
      return this.extractTableColumnsFromObject(table as Record<string, unknown>);
    }

    return [];
  }
}
