import { TranslocoPipe } from '@jsverse/transloco';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { QoIconComponent, QoInputComponent } from '@qo/ui-components';

interface TableColumn {
  readonly key: string;
  readonly label: string;
  readonly filterPlaceholder: string;
}

type TableRow = Record<string, string | number>;

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'pb-ui-table-widget-renderer',
  standalone: true,
  imports: [QoIconComponent, QoInputComponent,
    TranslocoPipe,
  ],
  templateUrl: './ui-table-widget-renderer.component.html',
  styleUrl: './ui-table-widget-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableWidgetRendererComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly resolvedConfig = input.required<TableWidgetConfig>();
  readonly columns = input.required<TableColumn[]>();
  readonly visibleRows = input.required<TableRow[]>();
  readonly processedRows = input.required<TableRow[]>();
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly showActionsColumn = input.required<boolean>();
  readonly searchSidebarOpen = input.required<boolean>();
  readonly searchColumn = input.required<string>();
  readonly searchCondition = input.required<string>();
  readonly searchValue = input.required<string>();
  readonly searchText = input.required<string>();
  readonly sortColumn = input.required<string>();
  readonly sortDirection = input.required<'asc' | 'desc'>();
  readonly selectedRow = input<TableRow | null>(null);

  readonly sortColumnChange = output<string>();
  readonly columnFilterChange = output<{ columnKey: string; value: string }>();
  readonly searchTextChange = output<string>();
  readonly rowSelect = output<TableRow>();
  readonly prevPage = output<void>();
  readonly nextPage = output<void>();
  readonly csvDownload = output<void>();
  readonly sidebarOpen = output<void>();
  readonly sidebarClose = output<void>();
  readonly searchConditionChange = output<string>();
  readonly searchValueChange = output<string>();
  readonly searchClear = output<void>();

  isRowSelected(row: TableRow): boolean {
    return this.selectedRow() === row;
  }

  getSortIndicator(columnKey: string): string {
    if (!this.resolvedConfig().showSorting) {
      return '';
    }

    if (this.sortColumn() !== columnKey) {
      return '<->';
    }

    return this.sortDirection() === 'asc' ? '^' : 'v';
  }

  getColumnLabel(key: string | undefined): string {
    if (!key) return '';
    const col = this.columns().find((c) => c.key === key);
    return col ? col.label : key;
  }
}
