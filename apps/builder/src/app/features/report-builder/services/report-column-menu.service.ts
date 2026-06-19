import { Injectable, computed, signal } from '@angular/core';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';

/**
 * Single Responsibility: owns all column-level UI state.
 * Component-scoped — must appear in the host component's `providers` array.
 */
@Injectable()
export class ReportColumnMenuService {
  // ── Mirrored input signal ──────────────────────────────────────────────────
  readonly allColumns = signal<ReportBuilderColumn[]>([]);

  // ── Owned state ────────────────────────────────────────────────────────────
  readonly hiddenColumnIds  = signal<string[]>([]);
  readonly pinnedColumnIds  = signal<string[]>([]);
  readonly activeMenuId     = signal<string | null>(null);
  readonly visibilityMenuOpen = signal(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly displayColumns = computed(() =>
    this.allColumns().filter(c => !this.hiddenColumnIds().includes(c.id))
  );

  // ── Column menu ────────────────────────────────────────────────────────────
  /** Opens the per-column menu for a column (or closes it if already open). */
  toggleMenu(columnId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === columnId ? null : columnId);
  }

  /** Closes any open per-column menu. */
  closeMenu(): void { this.activeMenuId.set(null); }

  /** Opens/closes the column-visibility menu (closing any column menu). */
  toggleVisibilityMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuId.set(null);
    this.visibilityMenuOpen.set(!this.visibilityMenuOpen());
  }

  /** Closes the column-visibility menu. */
  closeVisibilityMenu(): void { this.visibilityMenuOpen.set(false); }

  // ── Visibility ─────────────────────────────────────────────────────────────
  /** Hides a column (keeping at least one visible). */
  hideColumn(id: string): void {
    if (this.displayColumns().length <= 1) return;
    if (!this.hiddenColumnIds().includes(id)) this.hiddenColumnIds.update(ids => [...ids, id]);
  }

  /** Un-hides a column. */
  showColumn(id: string): void { this.hiddenColumnIds.update(ids => ids.filter(x => x !== id)); }

  /** Shows or hides a column. */
  toggleVisibility(id: string, show: boolean): void { show ? this.showColumn(id) : this.hideColumn(id); }

  /** Whether a column is currently visible. */
  isVisible(id: string): boolean { return !this.hiddenColumnIds().includes(id); }

  // ── Pinning ────────────────────────────────────────────────────────────────
  /** Pins a column. */
  pinColumn(id: string): void {
    if (!this.pinnedColumnIds().includes(id)) this.pinnedColumnIds.update(ids => [...ids, id]);
  }

  /** Unpins a column. */
  unpinColumn(id: string): void { this.pinnedColumnIds.update(ids => ids.filter(x => x !== id)); }

  /** Whether a column is pinned. */
  isPinned(id: string): boolean { return this.pinnedColumnIds().includes(id); }
}
