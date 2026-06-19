import { inject, Injectable, computed, signal } from '@angular/core';
import { ReportBuilderAsset, ReportBuilderColumn, ReportSortCriterion } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportColumnMenuService } from './report-column-menu.service';
import { resolveColumnId } from './report-preview-data.helpers';

type GroupConfig = { columnId: string; direction: 'asc' | 'desc' };

/**
 * Component-scoped service owning the report preview's sort + group state.
 * Fed `report` / `visibleColumns` by the data service; reads display columns
 * from the column-menu service. Holds no row data, so it never depends on the
 * data service (keeps the dependency graph acyclic).
 */
@Injectable()
export class ReportPreviewSortGroupService {
  private readonly colMenuService = inject(ReportColumnMenuService);

  // ── Inputs mirrored by the data service ────────────────────────────────────
  readonly report         = signal<ReportBuilderAsset | null>(null);
  readonly visibleColumns = signal<ReportBuilderColumn[]>([]);

  // ── Owned state ────────────────────────────────────────────────────────────
  readonly sortConfig     = signal<ReportSortCriterion[]>([]);
  readonly groupConfig    = signal<GroupConfig | null>(null);
  readonly sortDismissed  = signal(false);
  readonly groupDismissed = signal(false);

  private readonly displayColumns = computed(() => this.colMenuService.displayColumns());

  /** First email-ish column (or first column) — the default sort target. */
  readonly defaultSortColumnId = computed(() => {
    const cols = this.displayColumns();
    return (cols.find(c => c.label?.toLowerCase().includes('email') || c.id?.toLowerCase().includes('email')) ?? cols[0])?.id ?? '';
  });

  readonly effectiveSortCriteria = computed<ReportSortCriterion[]>(() => {
    if (this.sortDismissed()) return [];
    const selected = this.normalizeSortCriteria(this.sortConfig());
    if (selected.length) return selected;
    const fromSettings = this.normalizeSortCriteria(this.report()?.settings?.sortCriteria ?? []);
    if (fromSettings.length) return fromSettings;
    const sortBy  = this.resolveColumnId(this.report()?.settings?.sortBy ?? '');
    const sortDir = (this.report()?.settings?.sortOrder ?? 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
    if (sortBy && this.displayColumns().some(c => c.id === sortBy)) return [{ columnId: sortBy, direction: sortDir }];
    return [];
  });

  readonly effectiveSortConfig = computed(() => this.effectiveSortCriteria()[0] ?? null);

  readonly activeSortDescriptors = computed(() =>
    this.effectiveSortCriteria().map(sort => ({
      columnId: sort.columnId,
      label:    this.displayColumns().find(c => c.id === sort.columnId)?.label ?? sort.columnId,
      symbol:   sort.direction === 'asc' ? '▲' : '▼',
    }))
  );

  readonly effectiveGroupConfig = computed<GroupConfig | null>(() => {
    if (this.groupDismissed()) return null;
    const sel = this.groupConfig();
    if (sel) {
      const resolved = this.resolveColumnId(sel.columnId);
      if (resolved && this.displayColumns().some(c => c.id === resolved))
        return { columnId: resolved, direction: sel.direction };
    }
    const groupBy  = this.resolveColumnId(this.report()?.settings?.groupBy ?? '');
    const groupDir = (this.report()?.settings?.groupOrder ?? 'none').toLowerCase();
    if (groupBy && groupDir !== 'none' && this.displayColumns().some(c => c.id === groupBy))
      return { columnId: groupBy, direction: groupDir === 'desc' ? 'desc' : 'asc' };
    return null;
  });

  readonly activeGroupColumnLabel = computed(() => {
    const g = this.effectiveGroupConfig();
    return g ? (this.displayColumns().find(c => c.id === g.columnId)?.label ?? '') : '';
  });

  readonly activeGroupDirectionSymbol = computed(() =>
    this.effectiveGroupConfig()?.direction === 'desc' ? '▼' : '▲'
  );

  // ── Intent methods ─────────────────────────────────────────────────────────
  applySort(columnId: string, direction: 'asc' | 'desc'): void {
    this.syncSortCriteria([{ columnId, direction }]);
    if (this.effectiveGroupConfig()?.columnId === columnId) this.setGroup(columnId, direction);
  }

  applyGroup(columnId: string, direction: 'asc' | 'desc'): void {
    this.setGroup(columnId, direction);
  }

  clearSorting(): void {
    this.sortConfig.set([]);
    this.sortDismissed.set(true);
    this.applyReportSort([]);
  }

  /** Clears the group config only — collapse state is owned by the data service. */
  clearGrouping(): void {
    this.groupConfig.set(null);
    this.groupDismissed.set(true);
    this.applyReportGroup('', 'none');
  }

  toggleSortingChip(): void {
    const active = this.effectiveSortConfig();
    if (!active) { this.syncSortCriteria([{ columnId: this.defaultSortColumnId(), direction: 'asc' }]); return; }
    const nextDir: 'asc' | 'desc' = active.direction === 'asc' ? 'desc' : 'asc';
    this.syncSortCriteria(this.effectiveSortCriteria().map((item, i) => i === 0 ? { ...item, direction: nextDir } : item));
    if (this.effectiveGroupConfig()?.columnId === active.columnId) this.setGroup(active.columnId, nextDir);
  }

  toggleGroupingChip(): void {
    const active = this.effectiveGroupConfig();
    if (!active) return;
    this.setGroup(active.columnId, active.direction === 'asc' ? 'desc' : 'asc');
  }

  toggleSortFromHeader(columnId: string): void {
    const active = this.effectiveSortConfig();
    if (active?.columnId === columnId) {
      const nextDir: 'asc' | 'desc' = active.direction === 'asc' ? 'desc' : 'asc';
      this.syncSortCriteria(this.effectiveSortCriteria().map(item => item.columnId === columnId ? { ...item, direction: nextDir } : item));
      if (this.effectiveGroupConfig()?.columnId === columnId) this.setGroup(columnId, nextDir);
      return;
    }
    this.syncSortCriteria([{ columnId, direction: 'asc' }]);
    if (this.effectiveGroupConfig()?.columnId === columnId) this.setGroup(columnId, 'asc');
  }

  // ── Internals ──────────────────────────────────────────────────────────────
  private resolveColumnId(ref: string): string {
    return resolveColumnId(ref, this.visibleColumns(), undefined);
  }

  private setGroup(columnId: string, direction: 'asc' | 'desc'): void {
    this.groupConfig.set({ columnId, direction });
    this.groupDismissed.set(false);
    this.applyReportGroup(columnId, direction);
  }

  private normalizeSortCriteria(criteria: ReportSortCriterion[]): ReportSortCriterion[] {
    const seen = new Set<string>();
    return criteria
      .map(c => ({ columnId: this.resolveColumnId(c.columnId), direction: (c.direction === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' }))
      .filter(c => !!c.columnId && this.displayColumns().some(col => col.id === c.columnId) && !seen.has(c.columnId) && (seen.add(c.columnId), true));
  }

  private syncSortCriteria(criteria: ReportSortCriterion[]): void {
    const normalized = this.normalizeSortCriteria(criteria);
    this.sortConfig.set(normalized);
    this.sortDismissed.set(false);
    this.applyReportSort(normalized);
  }

  private applyReportSort(criteria: ReportSortCriterion[]): void {
    const r = this.report();
    if (!r) return;
    r.settings.sortCriteria = criteria;
    r.settings.sortBy       = criteria[0]?.columnId ?? '';
    r.settings.sortOrder    = criteria[0]?.direction ?? 'asc';
  }

  private applyReportGroup(columnId: string, direction: string): void {
    const r = this.report();
    if (!r) return;
    r.settings.groupBy    = columnId;
    r.settings.groupOrder = direction as 'asc' | 'desc' | 'none';
  }
}
