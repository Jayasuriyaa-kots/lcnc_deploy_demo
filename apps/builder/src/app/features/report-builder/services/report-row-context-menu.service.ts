import { Injectable, signal } from '@angular/core';
import { PreviewRecord } from '../models/report-builder.models';

/**
 * Single Responsibility: owns all row-level menu UI state.
 * Component-scoped — must appear in the host component's `providers` array.
 */
@Injectable()
export class ReportRowContextMenuService {
  // ── Context menu state ─────────────────────────────────────────────────────
  readonly open    = signal(false);
  readonly x       = signal(0);
  readonly y       = signal(0);
  readonly rowId   = signal<number | null>(null);

  // ── Row action menu state ──────────────────────────────────────────────────
  readonly activeRowMenuId = signal<string | null>(null);

  // ── Context menu ───────────────────────────────────────────────────────────
  /** Opens the right-click context menu at the cursor for a row. */
  openContextMenu(row: PreviewRecord, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.rowId.set(row.id);
    this.x.set(event.clientX);
    this.y.set(event.clientY);
    this.open.set(true);
  }

  /** Closes the context menu. */
  closeContextMenu(): void { this.open.set(false); }

  /** Resolves the record the context menu was opened for. */
  getContextMenuRow(previewRows: PreviewRecord[]): PreviewRecord | null {
    const id = this.rowId();
    return id === null ? null : (previewRows.find(r => r.id === id) ?? null);
  }

  // ── Row action menu ────────────────────────────────────────────────────────
  /** Opens a row's action menu (or closes it if already open). */
  toggleRowMenu(rowKey: string, event: MouseEvent): void {
    event.stopPropagation();
    this.open.set(false);
    this.activeRowMenuId.set(this.activeRowMenuId() === rowKey ? null : rowKey);
  }

  // ── Close all ─────────────────────────────────────────────────────────────
  /** Closes both the context menu and any row action menu. */
  closeAll(): void {
    this.open.set(false);
    this.activeRowMenuId.set(null);
  }
}
