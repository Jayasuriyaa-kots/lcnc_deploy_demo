import { ReportBuilderI18nService } from '@builder/features/report-builder/services/report-builder-i18n.service';

import { inject, Injectable, effect } from '@angular/core';
import { ReportBuilderAsset, ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportPreviewDataService } from '@builder/features/report-builder/services/report-preview-data.service';
import { ReportPreviewDetailService } from '@builder/features/report-builder/services/report-preview-detail.service';
import { ReportPreviewStyleService } from '@builder/features/report-builder/services/report-preview-style.service';
import { ReportColumnMenuService } from '@builder/features/report-builder/services/report-column-menu.service';
import { ReportRowContextMenuService } from '@builder/features/report-builder/services/report-row-context-menu.service';
import { ReportExportService } from '@builder/features/report-builder/services/report-export.service';
import { PreviewRecord } from '@builder/features/report-builder/models/report-builder.models';
import { QoConfirmDialogService } from '@qo/ui-components';

/**
 * Facade Pattern — single entry point for the ReportPreviewModal subsystem.
 *
 * OOP responsibilities:
 *  - Hides the complexity of 6 specialized services behind one interface
 *  - Handles all cross-service operations (e.g. openRecordDetails clears menus AND opens panel)
 *  - Exposes sub-services for direct template access when needed
 *
 * Component-scoped — must appear in the host component's `providers` array.
 */
@Injectable()
export class ReportPreviewFacade {
  private readonly i18n = inject(ReportBuilderI18nService);

  // ── Expose sub-services for direct template / component access ─────────────
  readonly data    = inject(ReportPreviewDataService);
  readonly detail  = inject(ReportPreviewDetailService);
  readonly columns = inject(ReportColumnMenuService);
  readonly rowMenu = inject(ReportRowContextMenuService);
  readonly style   = inject(ReportPreviewStyleService);

  private readonly exportSvc     = inject(ReportExportService);
  private readonly confirmDialog = inject(QoConfirmDialogService);

  // ── Wire: keep column service in sync with the data service's visibleColumns ─
  constructor() {
    effect(() => this.columns.allColumns.set(this.data.visibleColumns()));
  }

  // ── Cross-service operations ───────────────────────────────────────────────

  /** Opens the detail panel and clears all menus — coordinates detail + row + column services. */
  openRecordDetails(row: PreviewRecord, event?: MouseEvent): void {
    event?.stopPropagation();
    this.data.searchPanelOpen.set(false);
    this.rowMenu.closeAll();
    this.columns.closeMenu();
    this.detail.openPanel(row);
  }

  /** Runs a row action — clears row menu then delegates to data service. */
  runRowAction(action: 'edit' | 'duplicate' | 'delete', row: PreviewRecord): void {
    this.rowMenu.closeAll();
    switch (action) {
      case 'delete':    this.deleteRows([row.id]); break;
      case 'duplicate': this.data.duplicateRows([row.id]); break;
      case 'edit':      this.data.openEditModal(row.id); break;
    }
  }

  /** Runs a multi-selection action. */
  runMultiSelectionAction(action: 'edit' | 'duplicate' | 'delete'): void {
    const sel = this.data.previewSelection();
    if (action === 'edit')      { if (sel.length) this.data.openEditModal(sel[0]); return; }
    if (action === 'duplicate') { this.data.duplicateRows(sel); return; }
    this.data.deleteSelected();
  }

  /** Deletes rows and closes the detail/edit panels if those rows were active. */
  deleteRows(ids: number[]): void {
    this.data.deleteRowsById(
      ids,
      () => this.detail.closePanel(),
      () => this.data.closeEditModal()
    );
  }

  async deleteActiveDetailRow(): Promise<void> {
    const id = this.detail.activeDetailRowId();
    if (id === null) return;
    const ok = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteRecordTitle'),
      this.i18n.t('confirmations.deleteRecordMessage')
    );
    if (!ok) return;
    this.detail.detailMoreMenuOpen.set(false);
    this.deleteRows([id]);
  }

  editActiveDetailRow(): void {
    const id = this.detail.activeDetailRowId();
    if (id !== null) this.data.openEditModal(id);
  }

  duplicateActiveDetailRow(): void {
    const id = this.detail.activeDetailRowId();
    if (id === null) return;
    this.data.duplicateRows([id]);
    const last = this.data.previewRows().at(-1);
    if (last) this.detail.activeDetailRowId.set(last.id);
  }

  /** Closes all floating menus — used by the global document click listener. */
  closeAllMenus(event: MouseEvent): void {
    const t = event.target as HTMLElement | null;
    if (t?.closest('.row-menu,.row-menu-trigger,.context-row-menu,.export-menu,.export-menu-trigger,.column-menu,.column-menu-trigger,.column-visibility-menu,.column-visibility-trigger,.detail-panel__more-menu,.detail-panel__more-trigger')) return;
    this.columns.closeMenu();
    this.columns.closeVisibilityMenu();
    this.rowMenu.closeAll();
    this.detail.detailMoreMenuOpen.set(false);
  }

  /** Exports the current sorted rows in the requested format. */
  export(format: string): void {
    const cols = this.columns.displayColumns();
    const rows = this.data.sortedRows();
    const name = this.data.report()?.name ?? '';
    switch (format.toUpperCase()) {
      case 'CSV':  this.exportSvc.exportCsv(cols, rows, name);  break;
      case 'XLSX': this.exportSvc.exportXlsx(cols, rows, name); break;
      case 'PDF':  this.exportSvc.exportPdf(cols, rows, name);  break;
    }
  }

  printActiveDetailRow(): void { this.detail.printActiveRow(); }

  // ── Style helpers (delegates to keep component thin) ──────────────────────
  getColumnStyle(col: ReportBuilderColumn): Record<string, string> {
    return this.style.resolveColumnStyle(col, this.columns.pinnedColumnIds(), this.columns.displayColumns());
  }
}
