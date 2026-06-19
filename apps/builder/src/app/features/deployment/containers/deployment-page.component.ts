import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { QoButtonComponent, QoCheckboxComponent, QoIconComponent, QoStatusDotComponent } from '@qo/ui-components';
import { CanvasWidget } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { DeploymentFacadeService } from '../facades/deployment.facade';
import { DeploymentExportService } from '../services/deployment-export.service';
import {
  resolveDeploymentTableColumns,
  resolveDeploymentTableRows,
} from '../services/deployment-table-runtime.util';

@Component({
  selector: 'app-deployment-page',
  standalone: true,
  imports: [DragDropModule, QoButtonComponent, QoCheckboxComponent, QoIconComponent, QoStatusDotComponent],
  templateUrl: './deployment-page.component.html',
  styleUrl: './deployment-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentPageComponent {
  private readonly facade = inject(DeploymentFacadeService);
  private readonly exportService = inject(DeploymentExportService);

  readonly previewLeftSelectorOpen = signal(true);
  readonly showPreview = this.facade.showPreview;
  readonly previewFullScreen = this.facade.previewFullScreen;
  readonly runtimeMode = this.facade.runtimeMode;
  readonly saveState = this.facade.saveState;
  readonly primaryClickBehaviour = this.facade.primaryClickBehaviour;
  readonly topDependencySource = this.facade.topDependencySource;
  readonly showPreviewColumnDropdown = this.facade.showPreviewColumnDropdown;
  readonly showPreviewFiltersPanel = this.facade.showPreviewFiltersPanel;
  readonly showPreviewSortPanel = this.facade.showPreviewSortPanel;
  readonly showPreviewToolsPanel = this.facade.showPreviewToolsPanel;
  readonly showPreviewEmployeeModal = this.facade.showPreviewEmployeeModal;
  readonly previewSearchQuery = this.facade.previewSearchQuery;
  readonly previewFilters = this.facade.previewFilters;
  readonly previewSortMode = this.facade.previewSortMode;
  readonly previewViewMode = this.facade.previewViewMode;
  readonly selectedEnvironmentId = this.facade.selectedEnvironmentId;
  readonly customDomain = this.facade.customDomain;
  readonly basePath = this.facade.basePath;
  readonly leftHeaderOptions = this.facade.leftHeaderOptions;
  readonly rightHeaderOptions = this.facade.rightHeaderOptions;
  readonly primaryPages = this.facade.primaryPages;
  readonly leftPageGroups = this.facade.leftPageGroups;
  readonly topPageGroups = this.facade.topPageGroups;
  readonly footerOptions = this.facade.footerOptions;
  readonly leftFooterButtons = this.facade.leftFooterButtons;
  readonly rightFooterButtons = this.facade.rightFooterButtons;
  readonly workspaceTypes = this.facade.workspaceTypes;
  readonly environments = this.facade.environments;
  readonly activeLayoutPayload = this.facade.activeLayoutPayload;
  readonly layoutJson = this.facade.layoutJson;
  readonly saveButtonLabel = this.facade.saveButtonLabel;
  readonly runtimeTitle = this.facade.runtimeTitle;
  readonly runtimeEyebrow = this.facade.runtimeEyebrow;
  readonly runtimeLeftFooterButtons = this.facade.runtimeLeftFooterButtons;
  readonly runtimeRightFooterButtons = this.facade.runtimeRightFooterButtons;
  readonly previewPrimaryPages = this.facade.previewPrimaryPages;
  readonly selectedPreviewPrimaryPage = this.facade.selectedPreviewPrimaryPage;
  readonly previewNavigationPages = this.facade.previewNavigationPages;
  readonly selectedPreviewLeftPage = this.facade.selectedPreviewLeftPage;
  readonly previewSubPages = this.facade.previewSubPages;
  readonly selectedPreviewSubPage = this.facade.selectedPreviewSubPage;
  readonly previewTopTabs = this.facade.previewTopTabs;
  readonly selectedPreviewTopTab = this.facade.selectedPreviewTopTab;
  readonly previewDataset = this.facade.previewDataset;
  readonly previewDepartments = this.facade.previewDepartments;

  readonly setPrimaryClickBehaviour = this.facade.setPrimaryClickBehaviour.bind(this.facade);
  readonly areOtherPageSelectorsEnabled = this.facade.areOtherPageSelectorsEnabled.bind(this.facade);
  readonly isLeftSelectorEnabled = this.facade.isLeftSelectorEnabled.bind(this.facade);
  readonly setTopDependencySource = this.facade.setTopDependencySource.bind(this.facade);
  readonly addPrimaryPage = this.facade.addPrimaryPage.bind(this.facade);
  readonly removePrimaryPage = this.facade.removePrimaryPage.bind(this.facade);
  readonly renamePrimaryPage = this.facade.renamePrimaryPage.bind(this.facade);
  readonly reorderPrimaryPages = this.facade.reorderPrimaryPages.bind(this.facade);
  readonly reorderLeftPages = this.facade.reorderLeftPages.bind(this.facade);
  readonly reorderLeftSubPages = this.facade.reorderLeftSubPages.bind(this.facade);
  readonly addLeftPage = this.facade.addLeftPage.bind(this.facade);
  readonly renameLeftPage = this.facade.renameLeftPage.bind(this.facade);
  readonly removeLeftPage = this.facade.removeLeftPage.bind(this.facade);
  readonly addLeftSubPage = this.facade.addLeftSubPage.bind(this.facade);
  readonly renameLeftSubPage = this.facade.renameLeftSubPage.bind(this.facade);
  readonly removeLeftSubPage = this.facade.removeLeftSubPage.bind(this.facade);
  readonly addTopTabPage = this.facade.addTopTabPage.bind(this.facade);
  readonly renameTopTabPage = this.facade.renameTopTabPage.bind(this.facade);
  readonly removeTopTabPage = this.facade.removeTopTabPage.bind(this.facade);
  readonly toggleHeaderOption = this.facade.toggleHeaderOption.bind(this.facade);
  readonly toggleFooterOption = this.facade.toggleFooterOption.bind(this.facade);
  readonly selectWorkspaceType = this.facade.selectWorkspaceType.bind(this.facade);
  readonly selectEnvironment = this.facade.selectEnvironment.bind(this.facade);
  readonly updateCustomDomain = this.facade.updateCustomDomain.bind(this.facade);
  readonly updateBasePath = this.facade.updateBasePath.bind(this.facade);
  readonly addFooterButton = this.facade.addFooterButton.bind(this.facade);
  readonly renameFooterButton = this.facade.renameFooterButton.bind(this.facade);
  readonly removeFooterButton = this.facade.removeFooterButton.bind(this.facade);
  readonly saveDeploymentLayout = this.facade.saveDeploymentLayout.bind(this.facade);
  readonly openPreview = this.facade.openPreview.bind(this.facade);
  readonly openDeployedApp = this.facade.openDeployedApp.bind(this.facade);
  readonly closePreview = this.facade.closePreview.bind(this.facade);
  // Note: these are defined as methods below so filter state clears on navigation
  readonly togglePreviewColumnDropdown = this.facade.togglePreviewColumnDropdown.bind(this.facade);
  readonly previewTabRowCount = this.facade.previewTabRowCount.bind(this.facade);
  readonly updatePreviewSearchQuery = this.facade.updatePreviewSearchQuery.bind(this.facade);
  readonly togglePreviewFiltersPanel = this.facade.togglePreviewFiltersPanel.bind(this.facade);
  readonly closePreviewFiltersPanel = this.facade.closePreviewFiltersPanel.bind(this.facade);
  readonly togglePreviewFilter = this.facade.togglePreviewFilter.bind(this.facade);
  readonly updatePreviewDepartmentFilter = this.facade.updatePreviewDepartmentFilter.bind(this.facade);
  readonly updatePreviewJoinedFilter = this.facade.updatePreviewJoinedFilter.bind(this.facade);
  readonly applyPreviewFilters = this.facade.applyPreviewFilters.bind(this.facade);
  readonly setPreviewSortMode = this.facade.setPreviewSortMode.bind(this.facade);
  readonly togglePreviewSortPanel = this.facade.togglePreviewSortPanel.bind(this.facade);
  readonly closePreviewSortPanel = this.facade.closePreviewSortPanel.bind(this.facade);
  readonly setPreviewViewMode = this.facade.setPreviewViewMode.bind(this.facade);
  readonly togglePreviewToolsPanel = this.facade.togglePreviewToolsPanel.bind(this.facade);
  readonly closePreviewToolsPanel = this.facade.closePreviewToolsPanel.bind(this.facade);
  readonly openPreviewEmployeeModal = this.facade.openPreviewEmployeeModal.bind(this.facade);
  readonly closePreviewEmployeeModal = this.facade.closePreviewEmployeeModal.bind(this.facade);

  private clearFilterState(): void {
    this.filterRows.set([]);
    this.appliedFilterRows.set([]);
    this.sortRows.set([]);
    this.appliedSortRows.set([]);
    this.activeViewId.set(null);
    this.currentPage.set(1);
    this.selectedIndices.set(new Set());
  }

  selectPreviewPage(id: string): void {
    this.facade.selectPreviewPage(id);
    this.previewLeftSelectorOpen.set(true);
    this.clearFilterState();
  }

  selectPreviewLeftPage(id: string): void {
    this.facade.selectPreviewLeftPage(id);
    this.clearFilterState();
  }

  selectPreviewSubPage(id: string): void {
    const parentPage = this.previewNavigationPages().find((p) =>
      p.subPages?.some((sp: { id: string }) => sp.id === id)
    );
    if (parentPage && this.selectedPreviewLeftPage()?.id !== parentPage.id) {
      this.facade.selectPreviewLeftPage(parentPage.id);
    }
    this.facade.selectPreviewSubPage(id);
    this.clearFilterState();
  }

  selectPreviewTopTab(id: string): void {
    this.facade.selectPreviewTopTab(id);
    this.clearFilterState();
  }

  closePreviewLeftSelector(): void {
    this.previewLeftSelectorOpen.set(false);
  }

  openPreviewLeftSelector(): void {
    this.previewLeftSelectorOpen.set(true);
  }

  // ── Page target configuration ──────────────────────────────────────────────
  readonly pageTargets = this.facade.pageTargets;
  readonly topTabPagesBySourceId = this.facade.topTabPagesBySourceId;
  readonly openConfigPageId = this.facade.openConfigPageId;
  readonly activeShowcaseReports = this.facade.activeShowcaseReports;
  readonly activeShowcasePages = this.facade.activeShowcasePages;
  readonly activeShowcaseForms = this.facade.activeShowcaseForms;
  readonly pageTargetLabels = this.facade.pageTargetLabels;
  readonly currentPageTargetType = this.facade.currentPageTargetType;
  readonly currentPageTargetName = this.facade.currentPageTargetName;

  // ── Showcase ───────────────────────────────────────────────────────────────
  readonly showcasePanelOpen = this.facade.showcasePanelOpen;
  readonly showcaseActiveModule = this.facade.showcaseActiveModule;
  readonly showcaseForms = this.facade.showcaseForms;
  readonly showcaseReports = this.facade.showcaseReports;
  readonly showcasePages = this.facade.showcasePages;

  // ── Form runtime ───────────────────────────────────────────────────────────
  readonly selectedShowcaseForm = this.facade.selectedShowcaseForm;
  readonly showFormRuntimeModal = this.facade.showFormRuntimeModal;
  readonly formRuntimeValues = this.facade.formRuntimeValues;
  readonly formRuntimeErrors = this.facade.formRuntimeErrors;
  readonly formRuntimeSubmitting = this.facade.formRuntimeSubmitting;

  // ── Workflow execution ─────────────────────────────────────────────────────
  readonly workflowExecutionOpen = this.facade.workflowExecutionOpen;
  readonly workflowExecutionSteps = this.facade.workflowExecutionSteps;
  readonly workflowExecutionCurrentStep = this.facade.workflowExecutionCurrentStep;
  readonly workflowExecutionComplete = this.facade.workflowExecutionComplete;
  readonly workflowExecutionFormName = this.facade.workflowExecutionFormName;

  readonly currentPageWidgets = this.facade.currentPageWidgets;
  readonly currentPageCanvasHeight = this.facade.currentPageCanvasHeight;
  readonly currentTargetForm = this.facade.currentTargetForm;

  // ── Page target methods ────────────────────────────────────────────────────
  readonly setPageTarget = this.facade.setPageTarget.bind(this.facade);
  readonly clearPageTarget = this.facade.clearPageTarget.bind(this.facade);
  readonly togglePageConfig = this.facade.togglePageConfig.bind(this.facade);
  readonly closePageConfig = this.facade.closePageConfig.bind(this.facade);

  // ── Showcase methods ───────────────────────────────────────────────────────
  readonly openShowcasePanel = this.facade.openShowcasePanel.bind(this.facade);
  readonly closeShowcasePanel = this.facade.closeShowcasePanel.bind(this.facade);
  readonly toggleShowcasePanel = this.facade.toggleShowcasePanel.bind(this.facade);
  readonly setShowcaseModule = this.facade.setShowcaseModule.bind(this.facade);
  readonly openFormRuntime = this.facade.openFormRuntime.bind(this.facade);
  readonly openPrimaryForm = this.facade.openPrimaryForm.bind(this.facade);
  readonly closeFormRuntime = this.facade.closeFormRuntime.bind(this.facade);
  readonly updateFormFieldValue = this.facade.updateFormFieldValue.bind(this.facade);
  readonly submitFormRuntime = this.facade.submitFormRuntime.bind(this.facade);
  readonly closeWorkflowExecution = this.facade.closeWorkflowExecution.bind(this.facade);

  private readonly _tableCache = new Map<string, { cols: { key: string; label: string }[]; rows: string[][] }>();

  private _resolveTableData(widget: CanvasWidget) {
    const cached = this._tableCache.get(widget.id);
    if (cached) return cached;
    const config = widget.widgetProps?.tableConfig;
    if (!config) { const empty = { cols: [], rows: [] }; this._tableCache.set(widget.id, empty); return empty; }
    const rawRows = resolveDeploymentTableRows(config);
    const cols = resolveDeploymentTableColumns(config, rawRows);
    const rows = rawRows.slice(0, 200).map((row) => cols.map((col) => String(row[col.key] ?? '')));
    const result = { cols, rows };
    this._tableCache.set(widget.id, result);
    return result;
  }

  getVisibleTableColumns(widget: CanvasWidget): { key: string; label: string }[] {
    return this._resolveTableData(widget).cols;
  }

  getTableRows(widget: CanvasWidget): string[][] {
    return this._resolveTableData(widget).rows;
  }

  // ── Column-aware filters & sort ────────────────────────────────────────────
  readonly filterRows = signal<{ id: string; column: string; operator: string; value: string }[]>([]);
  readonly appliedFilterRows = signal<{ id: string; column: string; operator: string; value: string }[]>([]);
  readonly sortRows = signal<{ id: string; column: string; direction: 'asc' | 'desc' }[]>([]);
  readonly appliedSortRows = signal<{ id: string; column: string; direction: 'asc' | 'desc' }[]>([]);

  readonly filteredDatasetRows = computed(() => {
    const filters = this.appliedFilterRows();
    const dataset = this.previewDataset();
    const activeFilters = filters.filter((f) => f.column && (f.operator === 'is_empty' || f.value.trim()));
    if (!activeFilters.length) return dataset.rows;
    return dataset.rows.filter((row) =>
      activeFilters.every((f) => {
        const colIdx = dataset.columns.indexOf(f.column);
        if (colIdx === -1) return true;
        const cell = String(row[colIdx] ?? '').toLowerCase();
        const val = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains': return cell.includes(val);
          case 'not_contains': return !cell.includes(val);
          case 'equals': return cell === val;
          case 'not_equals': return cell !== val;
          case 'starts_with': return cell.startsWith(val);
          case 'is_empty': return cell.trim() === '';
          default: return true;
        }
      })
    );
  });

  readonly sortedFilteredRows = computed(() => {
    const sorts = this.appliedSortRows().filter((s) => s.column);
    const rows = [...this.filteredDatasetRows()];
    if (!sorts.length) return rows;
    const dataset = this.previewDataset();
    return rows.sort((a, b) => {
      for (const sort of sorts) {
        const idx = dataset.columns.indexOf(sort.column);
        if (idx === -1) continue;
        const av = String(a[idx] ?? '');
        const bv = String(b[idx] ?? '');
        const type = this.getColumnDataType(sort.column);
        let cmp = 0;
        if (type === 'number') {
          cmp = parseFloat(av) - parseFloat(bv);
        } else if (type === 'date') {
          cmp = new Date(av).getTime() - new Date(bv).getTime();
        } else {
          cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
        }
        if (cmp !== 0) return sort.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  readonly currentPage = signal(1);
  readonly pageSize = signal(50);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedFilteredRows().length / this.pageSize()))
  );

  readonly paginatedRows = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedFilteredRows().slice(start, start + this.pageSize());
  });

  readonly paginationStart = computed(() =>
    this.sortedFilteredRows().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  readonly paginationEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.sortedFilteredRows().length)
  );

  goToPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }

  nextPage(): void { this.goToPage(this.currentPage() + 1); }
  prevPage(): void { this.goToPage(this.currentPage() - 1); }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.clearSelection();
  }

  // ── Bulk selection ─────────────────────────────────────────────────────────
  readonly selectedIndices = signal<Set<number>>(new Set());

  readonly allPageSelected = computed(() => {
    const count = this.paginatedRows().length;
    if (!count) return false;
    const start = (this.currentPage() - 1) * this.pageSize();
    return Array.from({ length: count }, (_, i) => start + i)
      .every((idx) => this.selectedIndices().has(idx));
  });

  readonly somePageSelected = computed(() => {
    const count = this.paginatedRows().length;
    if (!count) return false;
    const start = (this.currentPage() - 1) * this.pageSize();
    return Array.from({ length: count }, (_, i) => start + i)
      .some((idx) => this.selectedIndices().has(idx));
  });

  isRowSelected(localIndex: number): boolean {
    const globalIndex = (this.currentPage() - 1) * this.pageSize() + localIndex;
    return this.selectedIndices().has(globalIndex);
  }

  toggleRowSelection(localIndex: number): void {
    const globalIndex = (this.currentPage() - 1) * this.pageSize() + localIndex;
    this.selectedIndices.update((set) => {
      const next = new Set(set);
      if (next.has(globalIndex)) next.delete(globalIndex);
      else next.add(globalIndex);
      return next;
    });
  }

  toggleAllPageRows(): void {
    const start = (this.currentPage() - 1) * this.pageSize();
    const count = this.paginatedRows().length;
    if (this.allPageSelected()) {
      this.selectedIndices.update((set) => {
        const next = new Set(set);
        for (let i = start; i < start + count; i++) next.delete(i);
        return next;
      });
    } else {
      this.selectedIndices.update((set) => {
        const next = new Set(set);
        for (let i = start; i < start + count; i++) next.add(i);
        return next;
      });
    }
  }

  clearSelection(): void {
    this.selectedIndices.set(new Set());
  }

  getSelectedRows(): string[][] {
    const rows = this.filteredDatasetRows();
    return Array.from(this.selectedIndices()).map((i) => rows[i]).filter(Boolean) as string[][];
  }

  bulkExportSelected(): void {
    const filename = 'selection';
    this.exportService.exportCsv(
      { columns: this.previewDataset().columns, rows: this.getSelectedRows() },
      filename
    );
    this.clearSelection();
  }

  readonly filterOperators = [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'is_empty', label: 'is empty' },
  ];

  addFilterRow(defaultColumn = ''): void {
    this.filterRows.update((rows) => [
      ...rows,
      { id: crypto.randomUUID(), column: defaultColumn, operator: 'contains', value: '' },
    ]);
  }

  removeFilterRow(id: string): void {
    this.filterRows.update((rows) => rows.filter((r) => r.id !== id));
  }

  updateFilterRowColumn(id: string, column: string): void {
    this.filterRows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, column, value: '' } : r))
    );
  }

  updateFilterRowOperator(id: string, operator: string): void {
    this.filterRows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, operator } : r))
    );
  }

  updateFilterRowValue(id: string, value: string): void {
    this.filterRows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, value } : r))
    );
  }

  applyFilters(): void {
    this.appliedFilterRows.set([...this.filterRows()]);
    this.currentPage.set(1);
    this.selectedIndices.set(new Set());
    this.closePreviewFiltersPanel();
  }

  clearAllFilters(): void {
    this.filterRows.set([]);
    this.appliedFilterRows.set([]);
  }

  // ── Saved Views (per-page) ────────────────────────────────────────────────
  private readonly _allPageViews = signal<Record<string, {
    id: string;
    name: string;
    filters: { id: string; column: string; operator: string; value: string }[];
  }[]>>({});

  readonly viewsDropdownOpen = signal(false);
  readonly viewBuilderOpen = signal(false);
  readonly activeViewId = signal<string | null>(null);

  readonly viewDraftName = signal('');
  readonly viewDraftFilters = signal<{ id: string; column: string; operator: string; value: string }[]>([]);

  private currentPageKey(): string {
    const primary = this.selectedPreviewPrimaryPage()?.id ?? '';
    const left = this.selectedPreviewLeftPage()?.id ?? '';
    const sub = this.selectedPreviewSubPage()?.id ?? '';
    const tab = this.selectedPreviewTopTab()?.id ?? '';
    return [primary, left, sub, tab].filter(Boolean).join('::') || '__default__';
  }

  readonly savedViews = computed(() => this._allPageViews()[this.currentPageKey()] ?? []);

  toggleViewsDropdown(): void { this.viewsDropdownOpen.update((v) => !v); }
  closeViewsDropdown(): void { this.viewsDropdownOpen.set(false); }

  openViewBuilder(): void {
    this.viewDraftName.set('');
    this.viewDraftFilters.set([]);
    this.viewBuilderOpen.set(true);
    this.closeViewsDropdown();
  }

  closeViewBuilder(): void { this.viewBuilderOpen.set(false); }

  addViewDraftFilterRow(): void {
    this.viewDraftFilters.update((rows) => [
      ...rows,
      { id: crypto.randomUUID(), column: '', operator: 'contains', value: '' },
    ]);
  }

  removeViewDraftFilterRow(id: string): void {
    this.viewDraftFilters.update((rows) => rows.filter((r) => r.id !== id));
  }

  updateViewDraftFilterColumn(id: string, column: string): void {
    this.viewDraftFilters.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, column, value: '' } : r))
    );
  }

  updateViewDraftFilterOperator(id: string, operator: string): void {
    this.viewDraftFilters.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, operator } : r))
    );
  }

  updateViewDraftFilterValue(id: string, value: string): void {
    this.viewDraftFilters.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, value } : r))
    );
  }

  saveView(): void {
    const name = this.viewDraftName().trim();
    if (!name) return;
    const key = this.currentPageKey();
    const newView = {
      id: crypto.randomUUID(),
      name,
      filters: this.viewDraftFilters().filter(
        (f) => f.column && (f.operator === 'is_empty' || f.value.trim())
      ),
    };
    this._allPageViews.update((all) => ({
      ...all,
      [key]: [...(all[key] ?? []), newView],
    }));
    this.closeViewBuilder();
    this.viewsDropdownOpen.set(true);
  }

  applyView(id: string): void {
    const view = this.savedViews().find((v) => v.id === id);
    if (!view) return;
    this.activeViewId.set(id);
    this.filterRows.set(view.filters.map((f) => ({ ...f })));
    this.appliedFilterRows.set(view.filters.map((f) => ({ ...f })));
    this.currentPage.set(1);
    this.clearSelection();
    this.closeViewsDropdown();
  }

  clearView(): void {
    this.activeViewId.set(null);
    this.filterRows.set([]);
    this.appliedFilterRows.set([]);
    this.currentPage.set(1);
    this.clearSelection();
    this.closeViewsDropdown();
  }

  deleteView(id: string): void {
    const key = this.currentPageKey();
    this._allPageViews.update((all) => ({
      ...all,
      [key]: (all[key] ?? []).filter((v) => v.id !== id),
    }));
    if (this.activeViewId() === id) this.clearView();
  }

  getColumnDataType(col: string): 'text' | 'number' | 'date' {
    const dataset = this.previewDataset();
    const idx = dataset.columns.indexOf(col);
    if (idx === -1) return 'text';
    for (const row of dataset.rows.slice(0, 20)) {
      const val = String(row[idx] ?? '').trim();
      if (!val) continue;
      if (!isNaN(Number(val))) return 'number';
      if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(val) || /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(val)) return 'date';
      return 'text';
    }
    return 'text';
  }

  getSortDirectionLabel(col: string, dir: 'asc' | 'desc'): string {
    if (!col) return dir === 'asc' ? 'Ascending' : 'Descending';
    const type = this.getColumnDataType(col);
    if (type === 'number') return dir === 'asc' ? '1 → 9' : '9 → 1';
    if (type === 'date') return dir === 'asc' ? 'Old → New' : 'New → Old';
    return dir === 'asc' ? 'A → Z' : 'Z → A';
  }

  addSortRow(): void {
    this.sortRows.update((rows) => [
      ...rows,
      { id: crypto.randomUUID(), column: '', direction: 'asc' },
    ]);
  }

  removeSortRow(id: string): void {
    this.sortRows.update((rows) => rows.filter((r) => r.id !== id));
  }

  updateSortColumn(id: string, column: string): void {
    this.sortRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, column } : r)));
  }

  updateSortDirection(id: string, direction: 'asc' | 'desc'): void {
    this.sortRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, direction } : r)));
  }

  applySorts(): void {
    this.appliedSortRows.set([...this.sortRows()]);
    this.currentPage.set(1);
    this.clearSelection();
    this.closePreviewSortPanel();
  }

  clearAllSorts(): void {
    this.sortRows.set([]);
    this.appliedSortRows.set([]);
    this.currentPage.set(1);
  }

  // ── App switcher ───────────────────────────────────────────────────────────
  readonly appSwitcherOpen = signal(false);

  readonly mockApps = [
    { id: '022b5481-2e30-4f52-9d7a-16596f84349e', name: 'HR Management', icon: 'users' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'Sales CRM', icon: 'bar-chart-3' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000002', name: 'Project Tracker', icon: 'list' },
  ];

  toggleAppSwitcher(): void {
    this.appSwitcherOpen.update((v) => !v);
  }

  closeAppSwitcher(): void {
    this.appSwitcherOpen.set(false);
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  readonly showExportDropdown = signal(false);

  toggleExportDropdown(): void {
    this.showExportDropdown.update((v) => !v);
  }

  closeExportDropdown(): void {
    this.showExportDropdown.set(false);
  }

  exportCsv(): void {
    const filename = this.exportFilename();
    this.exportService.exportCsv(this.facade.previewDataset(), filename);
    this.closeExportDropdown();
  }

  exportPdf(): void {
    const filename = this.exportFilename();
    const title = this.facade.currentPageTargetName() || 'Export';
    this.exportService.exportPdf(this.facade.previewDataset(), filename, title)
      .then(() => this.closeExportDropdown());
  }

  exportJson(): void {
    const filename = this.exportFilename();
    this.exportService.exportJson(this.facade.previewDataset(), filename);
    this.closeExportDropdown();
  }

  private exportFilename(): string {
    return (this.facade.currentPageTargetName() || 'export')
      .trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'export';
  }
}
