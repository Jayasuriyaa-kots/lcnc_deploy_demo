import { computed, effect, Injectable, signal } from '@angular/core';
import { createDefaultTableWidgetConfig, TableWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { getPageBuilderRuntimeKeys, getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import { setPageBuilderRuntimeWidgetState } from '@builder/features/page-builder/services/page-builder-runtime-state.service';
import {
  TableRow,
  toLabel,
  resolveConfiguredColumns,
  normalizeDataSourceRows,
  resolveBindingRows,
  tryParseJsonRows,
  tryParseJsonColumns,
} from './ui-table-widget.util';

interface TableColumn {
  readonly key: string;
  readonly label: string;
  readonly filterPlaceholder: string;
}

const TABLE_QUERY_SELECTION_PREFIX = '__table_query_selection__:';

@Injectable()
export class UiTableFacade {
  readonly config = signal<TableWidgetConfig>(createDefaultTableWidgetConfig());
  readonly widgetId = signal<string>('');
  readonly widgetLabel = signal<string>('');

  readonly currentPage = signal(1);
  readonly selectedRowIndex = signal(0);
  readonly selectedRow = signal<TableRow | null>(null);
  readonly searchColumn = signal<string>('');
  readonly searchSidebarOpen = signal(false);
  readonly searchCondition = signal<string>('contains');
  readonly searchValue = signal<string>('');
  readonly searchText = signal('');
  readonly sortColumn = signal<string>('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly columnFilters = signal<Record<string, string>>({});

  readonly resolvedConfig = computed<TableWidgetConfig>(() => ({
    ...createDefaultTableWidgetConfig(),
    ...(this.config() ?? {}),
  }));

  readonly isDatasourceQueryBound = computed(() => {
    const config = this.resolvedConfig();
    return !!config.dataSourceKey?.trim() && !!config.queryId?.trim();
  });

  readonly hasManualBinding = computed(() => {
    const binding = this.resolvedConfig().queryBinding?.trim() ?? '';
    return !!binding && !this.isDatasourceQueryBound();
  });

  readonly boundRows = computed<TableRow[]>(() => {
    if (!this.hasManualBinding()) return [];
    const binding = this.resolvedConfig().queryBinding?.trim() ?? '';
    const jsonRows = tryParseJsonRows(binding);
    if (jsonRows.length) return jsonRows;
    return resolveBindingRows(binding);
  });

  readonly columns = computed<TableColumn[]>(() => {
    const config = this.resolvedConfig();
    const dsKey = config.dataSourceKey;
    const queryId = config.queryId?.trim() ?? '';
    let keys: string[] = [];
    const binding = config.queryBinding?.trim() ?? '';
    const parsedBindingColumns = binding ? tryParseJsonColumns(binding) : [];

    if (this.boundRows().length) {
      keys = parsedBindingColumns.length ? parsedBindingColumns : Object.keys(this.boundRows()[0] ?? {});
    } else if (dsKey && queryId) {
      keys = getPageBuilderRuntimeKeys(dsKey, queryId);
    } else if (dsKey) {
      keys = config.dataColumns.length ? config.dataColumns : getPageBuilderRuntimeKeys(dsKey);
    } else if (config.dataColumns.length) {
      keys = config.dataColumns;
    } else {
      keys = Object.keys(config.dataRows[0] ?? {});
    }

    const configuredColumns = resolveConfiguredColumns(config.columnConfigs, keys);

    if (config.columnConfigs.length) {
      return configuredColumns.map((column) => ({
        key: column.key,
        label: column.label,
        filterPlaceholder: `Filter ${column.label}`,
      }));
    }

    if (!keys.length) {
      return [
        { key: 'id', label: 'ID', filterPlaceholder: 'Filter ID' },
        { key: 'name', label: 'Name', filterPlaceholder: 'Filter Name' },
        { key: 'email', label: 'Email', filterPlaceholder: 'Filter Email' },
        { key: 'status', label: 'Status', filterPlaceholder: 'Filter Status' },
      ];
    }

    return keys.map((key) => ({
      key,
      label: toLabel(key),
      filterPlaceholder: `Filter ${toLabel(key)}`,
    }));
  });

  readonly fallbackRows: TableRow[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
    { id: 3, name: 'Robert James', email: 'robert@example.com', status: 'Active' },
    { id: 4, name: 'Lara Chan', email: 'lara@example.com', status: 'Active' },
  ];

  readonly rows = computed<TableRow[]>(() => {
    const config = this.resolvedConfig();
    const dsKey = config.dataSourceKey;
    const queryId = config.queryId?.trim() ?? '';
    const boundRows = this.boundRows();

    if (boundRows.length) return boundRows;
    if (dsKey && queryId) {
      return normalizeDataSourceRows(getPageBuilderRuntimeRows(dsKey, queryId));
    }
    if (config.dataRows.length) return config.dataRows;
    if (dsKey) {
      return normalizeDataSourceRows(getPageBuilderRuntimeRows(dsKey));
    }
    return this.fallbackRows;
  });

  readonly totalPages = computed<number>(() => {
    const pageSize = Math.max(1, Number(this.resolvedConfig().rowsPerPage || 10));
    return Math.max(1, Math.ceil(this.processedRows().length / pageSize));
  });

  readonly processedRows = computed<TableRow[]>(() => {
    const normalizedSearch = this.searchText().trim().toLowerCase();
    const filters = this.columnFilters();
    const sortingEnabled = this.resolvedConfig().showSorting;
    const activeSortColumn = this.sortColumn();
    const activeSortDirection = this.sortDirection();
    let result = [...this.rows()];

    if (normalizedSearch) {
      result = result.filter((row) =>
        this.columns().some((column) => String(row[column.key] ?? '').toLowerCase().includes(normalizedSearch)),
      );
    }

    const activeFilters = Object.entries(filters).filter(([, value]) => value.trim().length > 0);
    if (activeFilters.length) {
      result = result.filter((row) =>
        activeFilters.every(([columnKey, value]) => String(row[columnKey] ?? '').toLowerCase().includes(value.trim().toLowerCase())),
      );
    }

    if (sortingEnabled && activeSortColumn) {
      result.sort((left, right) => {
        const leftValue = left[activeSortColumn];
        const rightValue = right[activeSortColumn];

        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          return activeSortDirection === 'asc' ? leftValue - rightValue : rightValue - leftValue;
        }

        const comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''), undefined, { numeric: true, sensitivity: 'base' });
        return activeSortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  });

  readonly visibleRows = computed<TableRow[]>(() => {
    const pageSize = Math.max(1, Number(this.resolvedConfig().rowsPerPage || 10));
    const rows = this.processedRows();
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  });

  readonly runtimeSelectedRowState = computed(() => {
    const rows = this.rows();
    const nextIndex = rows.length ? Math.min(this.selectedRowIndex(), rows.length - 1) : -1;
    const selectedRow = nextIndex >= 0 ? (rows[nextIndex] ?? null) : null;

    return {
      selectedRow: selectedRow ?? {},
      selectedRows: selectedRow ? [selectedRow] : [],
      selectedRowIndex: selectedRow ? nextIndex : -1,
      data: rows,
      tableData: rows,
    };
  });

  readonly showActionsColumn = computed<boolean>(
    () =>
      this.resolvedConfig().enableAdd ||
      this.resolvedConfig().enableEdit ||
      this.resolvedConfig().enableDelete ||
      this.resolvedConfig().enableDuplicate,
  );

  constructor() {
    effect(() => {
      this.processedRows();
      this.resolvedConfig().rowsPerPage;
      this.currentPage.set(1);
    });

    effect(() => {
      const cols = this.columns();
      if (cols.length && !this.searchColumn()) {
        this.searchColumn.set(cols[0].key);
      }
    });

    effect(() => {
      const rows = this.rows();
      if (this.selectedRow() === null && rows.length > 0) {
        this.selectedRow.set(rows[0]);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const id = this.widgetId();
      const label = this.widgetLabel();
      const key = (label?.trim() || id)?.trim();
      if (!key) return;

      setPageBuilderRuntimeWidgetState(key, this.runtimeSelectedRowState());
    });

    effect(() => {
      const rows = this.rows();
      const nextIndex = rows.length ? Math.min(this.selectedRowIndex(), rows.length - 1) : 0;
      if (nextIndex !== this.selectedRowIndex()) {
        this.selectedRowIndex.set(nextIndex);
      }

      const widgetId = this.widgetId().trim();
      const selectedRow = rows[nextIndex] ?? null;
      this.selectedRow.set(selectedRow);

      const runtimeState = this.runtimeSelectedRowState();

      if (widgetId) {
        setPageBuilderRuntimeWidgetState(widgetId, runtimeState);
      }

      const queryId = this.resolvedConfig().queryId?.trim();
      if (queryId) {
        setPageBuilderRuntimeWidgetState(`${TABLE_QUERY_SELECTION_PREFIX}${queryId}`, runtimeState);
      }
    }, { allowSignalWrites: true });
  }

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  onSearchTextChange(val: string): void {
    this.searchText.set(val);
  }

  onSortColumn(columnKey: string): void {
    if (!this.resolvedConfig().showSorting) return;

    if (this.sortColumn() === columnKey) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortColumn.set(columnKey);
    this.sortDirection.set('asc');
  }

  onColumnFilterChange(columnKey: string, value: string): void {
    this.columnFilters.update((current) => ({
      ...current,
      [columnKey]: value,
    }));
  }

  downloadCsv(): void {
    if (!this.resolvedConfig().showDownload) return;

    const columns = this.columns().map((column) => column.key);
    const rows = this.processedRows();
    const header = columns.join(',');
    const lines = rows.map((row) =>
      columns
        .map((columnKey) => {
          const rawValue = String(row[columnKey] ?? '');
          const escaped = rawValue.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    );
    const csv = [header, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'table-data.csv');
    link.click();
    URL.revokeObjectURL(url);
  }

  selectRow(row: TableRow): void {
    const index = this.rows().findIndex((candidate) => candidate === row);
    if (index >= 0) {
      this.selectedRowIndex.set(index);
    }
    this.selectedRow.set(row);
  }

  openSearchSidebar(): void {
    this.searchSidebarOpen.set(true);
  }

  closeSearchSidebar(): void {
    this.searchSidebarOpen.set(false);
  }

  onSearchConditionChange(val: string): void {
    this.searchCondition.set(val);
  }

  onSearchValueChange(val: string): void {
    this.searchValue.set(val);
  }

  clearSearch(): void {
    this.searchValue.set('');
  }
}
