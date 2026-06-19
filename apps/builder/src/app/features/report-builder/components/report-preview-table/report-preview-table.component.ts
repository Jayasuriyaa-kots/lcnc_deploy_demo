import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { ReportBuilderColumn, ReportSortCriterion } from '@builder/features/report-builder/facades/report-builder.facade';
import { PreviewRecord } from '@builder/features/report-builder/models/report-builder.models';
import { QoButtonComponent, QoCheckboxComponent, QoIconComponent } from '@qo/ui-components';


export interface TableSortDescriptor { columnId: string; label: string; symbol: string; }
export interface TableGroupConfig    { columnId: string; direction: 'asc' | 'desc'; }
export interface TableGroupedRow     { label: string; rows: PreviewRecord[]; }
export interface TableRowAction      { key: string; label: string; icon: string; }
export interface TableColumnVis      { id: string; label: string; }

export interface TableState {
  columns:              ReportBuilderColumn[];
  allColumns:           ReportBuilderColumn[];   // for visibility menu
  groupedRows:          TableGroupedRow[];
  rowHeight:            string;
  collapsedGroups:      Set<string>;
  selectedRowIds:       number[];
  activeDetailRowId:    number | null;
  columnMenuId:         string | null;
  rowMenuId:            string | null;
  visibilityMenuOpen:   boolean;
  sortDescriptors:      TableSortDescriptor[];
  effectiveSortCriteria: ReportSortCriterion[];
  groupConfig:          TableGroupConfig | null;
  groupColumnLabel:     string;
  groupDirSymbol:       string;
  rowActions:           TableRowAction[];
  columnStyle:          (col: ReportBuilderColumn) => Record<string, string>;
  isColumnPinned:       (id: string) => boolean;
  isColumnVisible:      (id: string) => boolean;
}

// Command pattern — all table interactions emitted as a typed union
export type TableEvent =
  | { type: 'rowClick';               row: PreviewRecord }
  | { type: 'contextMenu';            row: PreviewRecord; event: MouseEvent }
  | { type: 'checkboxChange';         rowId: number }
  | { type: 'selectAll';              checked: boolean }
  | { type: 'columnMenuToggle';       columnId: string; event: MouseEvent }
  | { type: 'rowMenuToggle';          rowKey: string; event: MouseEvent }
  | { type: 'rowAction';              action: string; row: PreviewRecord }
  | { type: 'sortApply';              columnId: string; direction: 'asc' | 'desc' }
  | { type: 'groupApply';             columnId: string; direction: 'asc' | 'desc' }
  | { type: 'hideColumn';             columnId: string }
  | { type: 'pinColumn';              columnId: string }
  | { type: 'unpinColumn';            columnId: string }
  | { type: 'columnSearch';           columnId: string }
  | { type: 'sortingChipToggle' }
  | { type: 'sortingClear' }
  | { type: 'groupingChipToggle' }
  | { type: 'groupingClear' }
  | { type: 'groupToggle';            label: string }
  | { type: 'collapseAll' }
  | { type: 'expandAll' }
  | { type: 'visibilityMenuToggle';   event: MouseEvent }
  | { type: 'columnVisibilityChange'; columnId: string; checked: boolean }
  | { type: 'columnVisibilityDone' };

/**
 * Dumb component — accepts state input, emits typed Command events.
 * No service injection. No internal mutable state.
 * Encapsulates the entire list-view table UI.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-preview-table',
  standalone: true,
  imports: [QoButtonComponent, QoCheckboxComponent, QoIconComponent],
  templateUrl: './report-preview-table.component.html',
  styleUrl: './report-preview-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportPreviewTableComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  state = input.required<TableState>();
  event = output<TableEvent>();

  trackByRowId(_: number, row: PreviewRecord): number { return row.id; }
}
