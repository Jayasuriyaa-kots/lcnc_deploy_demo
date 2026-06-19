import { ReportBuilderI18nService } from '@builder/features/report-builder/services/report-builder-i18n.service';

import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { BuilderAssetItem } from '@builder/core/models/builder-shell.model';
import {
  QueryReferenceBinding,
  QueryRegistryService,
} from '@builder/core/services/query-registry.service';
import {
  DetailLayout,
  PreviewRecord,
  QuickLayout,
  ReportJoin,
  ReportActionGroup,
  ReportAllFieldsLayout,
  ReportBlockLayoutItem,
  ReportConfigMode,
  ReportConfigTab,
  ReportDetailCustomLayout,
  ReportDetailTab,
  ReportDetailTabBlock,
  ReportTabLayoutItem,
  ReportQuickViewCustomLayout,
} from '@builder/features/report-builder/models/report-builder.models';
import { REPORT_BUILDER_DETAIL_ACTION_GROUPS } from '@builder/features/report-builder/config/report-builder.config';
import { ReportSourceCatalogService } from '@builder/features/report-builder/services/report-source-catalog.service';
import { ReportSeedFactoryService } from '@builder/features/report-builder/services/report-seed-factory.service';
import { ReportPersistenceService, PersistedReportBuilderStateV1 } from '@builder/features/report-builder/services/report-persistence.service';
import { ReportPreviewBuilderService } from '@builder/features/report-builder/services/report-preview-builder.service';
import {
  cloneActionGroups,
  cloneFilterRules,
  normalizeDetailLayoutMode,
} from '@builder/features/report-builder/utils/report-builder-normalize.util';

export interface ReportBuilderColumn {
  id: string;
  label: string;
  formId: string;
  source: 'primary' | 'joined';
  fieldType: string;
  format: 'text' | 'number' | 'date' | 'email' | 'currency' | 'image';
  visible: boolean;
  width: 'Small' | 'Medium' | 'Large';
  sortable: boolean;
  filterable: boolean;
  alignment: 'left' | 'center' | 'right';
}

export interface ReportBuilderFilterPreset {
  id: string;
  label: string;
  enabled: boolean;
}

export interface ReportBuilderAction {
  id: string;
  label: string;
  enabled: boolean;
}

export interface ReportBuilderSourceOption {
  id: string;
  name: string;
  datasourceLabel: string;
  tableLabel: string;
  columns: ReportBuilderColumn[];
}

export interface ReportBuilderFilterRule {
  id: string;
  columnId: string;
  operator: string;
  value: string | { start: string; end: string };
}

export interface ReportSortCriterion {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface ReportBuilderAsset extends BuilderAssetItem {
  description: string;
  reportType: 'list' | 'chart' | 'pivot';
  viewType: 'List View' | 'Card View';
  density: 'Compact' | 'Comfortable' | 'Detailed';
  queryRefId?: string;
  sourceFormId: string;
  sourceFormLabel: string;
  datasourceLabel: string;
  tableLabel: string;
  joins: ReportJoin[];
  columns: ReportBuilderColumn[];
  filterPresets: ReportBuilderFilterPreset[];
  filterRules: ReportBuilderFilterRule[];
  actions: ReportBuilderAction[];
  settings: {
    defaultLayout: 'Compact' | 'Comfortable' | 'Detailed';
    recordClickAction: 'View Record' | 'Do Nothing';
    showSearch: boolean;
    showFilters: boolean;
    showExport: boolean;
    showViewSwitcher: boolean;
    groupBy: string;
    groupOrder: 'none' | 'asc' | 'desc';
    showRecordCount: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    sortCriteria: ReportSortCriterion[];
    cardPrimaryFieldId: string;
    cardSecondaryFieldId: string;
    detailLayoutMode: DetailLayout;
    quickLayoutMode: QuickLayout;
    cardFieldTextColor: string;
    cardFieldFontSize: number;
    quickActionGroups: ReportActionGroup[];
    detailActionGroups: ReportActionGroup[];
    quickViewCustomLayout: ReportQuickViewCustomLayout;
    detailBlocks: ReportDetailTabBlock[];
    detailTabs?: ReportDetailTab[];
    allFieldsLayout?: ReportAllFieldsLayout;
    blockLayout?: ReportBlockLayoutItem[];
    tabLayout?: ReportTabLayoutItem[];
    detailCustomLayouts?: ReportDetailCustomLayout[];
    activeDetailCustomLayoutId?: string | null;
  };
}

interface CreateReportConfig {
  name: string;
  sourceFormId: string;
  reportType: 'list' | 'chart' | 'pivot';
  viewType: 'List View' | 'Card View';
  cardLayout: 'card2' | 'card3' | 'card4' | 'card5';
  selectedColumnIds: string[];
}

/**
 * Single state-holder for the report builder feature (Frontend Guide §9). Owns
 * the reports collection + UI signals and exposes intent methods. Heavy logic is
 * delegated to focused, stateless collaborators: the source catalog, the seed
 * factory, the preview builder, and the persistence service.
 */
@Injectable({ providedIn: 'root' })
export class ReportBuilderFacade {
  private readonly i18n = inject(ReportBuilderI18nService);

  private readonly catalog = inject(ReportSourceCatalogService);
  private readonly seedFactory = inject(ReportSeedFactoryService);
  private readonly persistence = inject(ReportPersistenceService);
  private readonly previewBuilder = inject(ReportPreviewBuilderService);

  /** Source forms/datasources available to report on. */
  readonly sourceOptions: ReportBuilderSourceOption[] = this.catalog.sourceOptions;

  private readonly initialPersistedState = this.persistence.load();
  private readonly reportsState = signal<ReportBuilderAsset[]>(
    this.mergeWithSeedReports(this.initialPersistedState?.reports)
  );
  private readonly selectedReportIdState = signal<string>(
    this.resolveInitialSelectedReportId(
      this.initialPersistedState?.selectedReportId,
      this.initialPersistedState?.reports ?? this.reportsState()
    )
  );
  private readonly createWizardOpenState = signal<boolean>(false);
  private readonly reportSettingsOpenState = signal<boolean>(false);
  private readonly previewOpenState = signal<boolean>(false);
  private readonly customLayoutOpenState = signal<boolean>(false);

  readonly reportConfigTab = signal<ReportConfigTab>('quick');
  readonly reportConfigMode = signal<ReportConfigMode>('layout');
  readonly quickLayout = signal<QuickLayout>('list');
  readonly detailLayout = signal<DetailLayout>('all-fields');

  readonly fieldConfigOpen = signal<boolean>(false);
  readonly searchPanelOpen = signal<boolean>(false);
  readonly bulkEditOpen = signal<boolean>(false);
  readonly actionConfigOpen = signal<boolean>(false);
  readonly detailLayoutConfigOpen = signal<boolean>(false);
  readonly detailBlockLayoutConfigOpen = signal<boolean>(false);

  readonly previewSelection = signal<number[]>([]);
  readonly previewPageSize = signal<string>('20');
  readonly detailBlockConfig = signal<Array<{ id: string; title: string; fieldIds: string[]; sourceFormId: string }>>([]);

  /** Sidebar list items derived from the reports (without the heavy config). */
  readonly reportItems = computed<BuilderAssetItem[]>(() =>
    this.reportsState().map(
      ({
        description,
        reportType,
        viewType,
        density,
        sourceFormId,
        sourceFormLabel,
        datasourceLabel,
        tableLabel,
        joins,
        columns,
        filterPresets,
        filterRules,
        actions,
        settings,
        ...item
      }) => item
    )
  );
  readonly reports = computed<ReportBuilderAsset[]>(() => this.reportsState());

  readonly selectedReport = computed<ReportBuilderAsset | null>(() => {
    const reports = this.reportsState();
    return reports.find((report) => report.id === this.selectedReportIdState()) ?? reports[0] ?? null;
  });

  readonly createWizardOpen = computed<boolean>(() => this.createWizardOpenState());
  readonly reportSettingsOpen = computed<boolean>(() => this.reportSettingsOpenState());
  readonly previewOpen = computed<boolean>(() => this.previewOpenState());
  readonly customLayoutOpen = computed<boolean>(() => this.customLayoutOpenState());

  constructor() {
    // Persist every change to reports/selection.
    effect(() => {
      const snapshot: PersistedReportBuilderStateV1 = {
        version: 1,
        reports: this.reportsState(),
        selectedReportId: this.selectedReportIdState(),
      };
      this.persistence.save(snapshot);
    });

    // Keep UI layout signals aligned with the selected report config.
    effect(
      () => {
        const report = this.selectedReport();
        if (!report) {
          return;
        }
        this.quickLayout.set(report.settings.quickLayoutMode ?? (report.viewType === 'List View' ? 'list' : 'card'));
        this.detailLayout.set(normalizeDetailLayoutMode(report.settings.detailLayoutMode));
      },
      { allowSignalWrites: true }
    );
  }

  /** Selects a report and clears the preview selection. */
  selectReport(reportId: string): void {
    this.selectedReportIdState.set(reportId);
    this.previewSelection.set([]);
  }

  /** Looks up a report by id. */
  getReportById(reportId: string): ReportBuilderAsset | null {
    return this.reportsState().find((report) => report.id === reportId) ?? null;
  }

  /** Opens the create-report wizard. */
  openCreateWizard(): void {
    this.createWizardOpenState.set(true);
  }

  /** Reverts the selected report to draft status. */
  saveDraft(): void {
    const selected = this.selectedReport();
    if (!selected || selected.status === 'draft') {
      return;
    }
    this.reportsState.update((reports) =>
      reports.map((report) => (report.id === selected.id ? { ...report, status: 'draft' } : report))
    );
  }

  /** Closes the create-report wizard. */
  closeCreateWizard(): void {
    this.createWizardOpenState.set(false);
  }

  /** Opens the report settings modal (optionally selecting a report first). */
  openReportSettings(reportId?: string): void {
    if (reportId) {
      this.selectedReportIdState.set(reportId);
    }
    this.reportSettingsOpenState.set(true);
  }

  /** Closes the report settings modal. */
  closeReportSettings(): void {
    this.reportSettingsOpenState.set(false);
  }

  /** Opens the in-app preview modal. */
  openPreview(): void {
    this.previewOpenState.set(true);
  }

  /** Closes the in-app preview modal. */
  closePreview(): void {
    this.previewOpenState.set(false);
  }

  /** Switches to the custom quick layout and opens its editor modal. */
  openCustomLayoutModal(): void {
    this.quickLayout.set('custom');
    this.customLayoutOpenState.set(true);
  }

  /** Closes the custom layout editor modal. */
  closeCustomLayoutModal(): void {
    this.customLayoutOpenState.set(false);
  }

  /** Sets the active report config tab (and resets to layout mode). */
  setReportConfigTab(tab: ReportConfigTab): void {
    this.reportConfigTab.set(tab);
    this.reportConfigMode.set('layout');
  }

  /** Sets the report config mode. */
  setReportConfigMode(mode: ReportConfigMode): void {
    this.reportConfigMode.set(mode);
  }

  /** Sets the quick layout (list/card/custom) and syncs the report's view type. */
  setQuickLayout(layout: QuickLayout): void {
    this.quickLayout.set(layout);
    this.updateSelectedReport((report) => ({
      ...report,
      settings: { ...report.settings, quickLayoutMode: layout },
      viewType: layout === 'list' ? 'List View' : 'Card View',
    }));
  }

  /** Sets the detail layout mode (normalised) on the selected report. */
  setDetailLayout(layout: DetailLayout): void {
    this.detailLayout.set(layout);
    this.updateSelectedReport((report) => ({
      ...report,
      settings: { ...report.settings, detailLayoutMode: normalizeDetailLayoutMode(layout) },
    }));
  }

  /** Sets the preview page size. */
  setPreviewPageSize(size: string): void {
    this.previewPageSize.set(size);
  }

  /** Opens exactly one drawer (closing the others). */
  toggleDrawer(drawer: 'field' | 'search' | 'bulk' | 'action' | 'detailLayout' | 'detailBlockLayout'): void {
    this.fieldConfigOpen.set(drawer === 'field');
    this.searchPanelOpen.set(drawer === 'search');
    this.bulkEditOpen.set(drawer === 'bulk');
    this.actionConfigOpen.set(drawer === 'action');
    this.detailLayoutConfigOpen.set(drawer === 'detailLayout');
    this.detailBlockLayoutConfigOpen.set(drawer === 'detailBlockLayout');
  }

  /** Closes all drawers. */
  closeDrawers(): void {
    this.fieldConfigOpen.set(false);
    this.searchPanelOpen.set(false);
    this.bulkEditOpen.set(false);
    this.actionConfigOpen.set(false);
    this.detailLayoutConfigOpen.set(false);
    this.detailBlockLayoutConfigOpen.set(false);
  }

  /** Toggles a preview row's selection. */
  togglePreviewRow(index: number): void {
    const selection = this.previewSelection();
    this.previewSelection.set(
      selection.includes(index) ? selection.filter((item) => item !== index) : [...selection, index]
    );
  }

  /** Clears the preview selection. */
  clearPreviewSelection(): void {
    this.previewSelection.set([]);
  }

  /** Creates a report from the wizard config and makes it the active report. */
  createReport(config: CreateReportConfig): void {
    const source = this.catalog.sourceOptions.find((item) => item.id === config.sourceFormId);
    if (!source) {
      return;
    }

    const report = this.seedFactory.createSeedReport({
      id: this.getNextReportId(),
      shortCode: this.getShortCode(config.name),
      name: config.name,
      status: 'draft',
      sourceFormId: source.id,
      description: `Build ${config.name} using ${source.datasourceLabel} · ${source.tableLabel} and refine its report views.`,
      viewType: config.viewType,
      density: 'Comfortable',
      visibleColumnIds: config.selectedColumnIds,
      reportType: config.reportType,
    });

    const configuredReport =
      config.viewType === 'Card View' ? this.seedFactory.applyCreateCardLayout(report, config.cardLayout) : report;

    this.reportsState.set([configuredReport, ...this.reportsState()]);
    this.selectedReportIdState.set(configuredReport.id);
    this.quickLayout.set(
      configuredReport.settings.quickLayoutMode ?? (configuredReport.viewType === 'List View' ? 'list' : 'card')
    );
    this.detailLayout.set(normalizeDetailLayoutMode(configuredReport.settings.detailLayoutMode));
    this.createWizardOpenState.set(false);
  }

  /** Duplicates a report (deep-cloning its mutable config) as a draft. */
  duplicateReport(reportId: string): void {
    const existing = this.reportsState().find((report) => report.id === reportId);
    if (!existing) {
      return;
    }

    const duplicate: ReportBuilderAsset = {
      ...existing,
      id: `r${Date.now()}`,
      name: `${existing.name} (Copy)`,
      status: 'draft',
      columns: existing.columns.map((column) => ({ ...column })),
      joins: existing.joins.map((join) => ({ ...join, on: { ...join.on } })),
      filterPresets: existing.filterPresets.map((preset) => ({ ...preset })),
      filterRules: cloneFilterRules(existing.filterRules),
      actions: existing.actions.map((action) => ({ ...action })),
      settings: {
        ...existing.settings,
        quickActionGroups: cloneActionGroups(existing.settings.quickActionGroups),
        detailActionGroups: cloneActionGroups(existing.settings.detailActionGroups, REPORT_BUILDER_DETAIL_ACTION_GROUPS),
        quickViewCustomLayout: {
          ...existing.settings.quickViewCustomLayout,
          slots: { ...existing.settings.quickViewCustomLayout.slots },
          styles: { ...existing.settings.quickViewCustomLayout.styles },
          canvasLayout: existing.settings.quickViewCustomLayout.canvasLayout
            ? {
                containerWidth: existing.settings.quickViewCustomLayout.canvasLayout.containerWidth,
                containerHeight: existing.settings.quickViewCustomLayout.canvasLayout.containerHeight,
                elements: existing.settings.quickViewCustomLayout.canvasLayout.elements.map((item) => ({ ...item })),
              }
            : undefined,
        },
      },
    };

    this.reportsState.set([duplicate, ...this.reportsState()]);
    this.selectedReportIdState.set(duplicate.id);
  }

  /** Removes a report, re-selecting a neighbour if it was active. */
  deleteReport(reportId: string): void {
    const reports = this.reportsState();
    const index = reports.findIndex((report) => report.id === reportId);
    if (index === -1) {
      return;
    }
    const nextReports = reports.filter((report) => report.id !== reportId);
    this.reportsState.set(nextReports);
    if (this.selectedReportIdState() === reportId) {
      this.selectedReportIdState.set(nextReports[index]?.id ?? nextReports[index - 1]?.id ?? '');
    }
  }

  /** Marks a report as live (published). */
  publishReport(reportId: string): void {
    this.reportsState.update((reports) =>
      reports.map((report) => (report.id === reportId ? { ...report, status: 'live' } : report))
    );
  }

  /** Applies a mutation to the currently selected report. */
  updateSelectedReport(mutator: (report: ReportBuilderAsset) => ReportBuilderAsset): void {
    const selected = this.selectedReport();
    if (!selected) {
      return;
    }
    this.reportsState.update((reports) =>
      reports.map((report) => (report.id === selected.id ? mutator(report) : report))
    );
  }

  /** Switches the selected report's source form and resets dependent config. */
  updateSelectedReportSource(sourceFormId: string): void {
    const source = this.catalog.sourceOptions.find((item) => item.id === sourceFormId);
    if (!source) {
      return;
    }

    this.updateSelectedReport((report) => ({
      ...report,
      sourceFormId: source.id,
      sourceFormLabel: source.name,
      datasourceLabel: source.datasourceLabel,
      tableLabel: source.tableLabel,
      joins: [],
      columns: source.columns.map((column) => ({ ...column, formId: source.id, source: 'primary', visible: true })),
      filterRules: [],
      settings: {
        ...report.settings,
        groupBy: '',
        groupOrder: 'none',
        showRecordCount: true,
        sortBy: '',
        sortOrder: 'asc',
        sortCriteria: [],
        cardPrimaryFieldId: source.columns[0]?.id ?? '',
        cardSecondaryFieldId: source.columns[1]?.id ?? source.columns[0]?.id ?? '',
        detailLayoutMode: normalizeDetailLayoutMode(report.settings.detailLayoutMode),
        quickLayoutMode: report.settings.quickLayoutMode ?? (report.viewType === 'List View' ? 'list' : 'card'),
        quickActionGroups: cloneActionGroups(report.settings.quickActionGroups),
        detailActionGroups: cloneActionGroups(report.settings.detailActionGroups, REPORT_BUILDER_DETAIL_ACTION_GROUPS),
        quickViewCustomLayout: report.settings.quickViewCustomLayout,
        // Keep detail blocks aligned with the active center-grid datasource.
        detailBlocks: [
          {
            id: `detail-${source.id}-main`,
            title: source.tableLabel || source.name || this.i18n.t('detailLayout.details'),
            fieldIds: source.columns.map((column) => column.id),
            sourceFormId: source.id,
          },
        ],
        allFieldsLayout: { fieldIds: source.columns.map((column) => column.id) },
        blockLayout: [
          {
            id: `detail-${source.id}-main`,
            title: source.tableLabel || source.name || this.i18n.t('detailLayout.details'),
            fieldIds: source.columns.map((column) => column.id),
            sourceFormId: source.id,
          },
        ],
        tabLayout: [
          {
            id: 'overview',
            title: this.i18n.t('detailLayout.overview'),
            sourceFormId: source.id,
            fieldIds: source.columns.map((column) => column.id),
          },
        ],
        detailTabs: [
          {
            id: 'overview',
            title: this.i18n.t('detailLayout.overview'),
            blocks: [
              {
                id: `detail-${source.id}-main`,
                title: source.tableLabel || source.name || this.i18n.t('detailLayout.details'),
                fieldIds: source.columns.map((column) => column.id),
                sourceFormId: source.id,
              },
            ],
          },
        ],
      },
    }));
  }

  /** Replaces the selected report's filter rules (deep-cloned). */
  updateSelectedReportFilters(filterRules: ReportBuilderFilterRule[]): void {
    this.updateSelectedReport((report) => ({ ...report, filterRules: cloneFilterRules(filterRules) }));
  }

  /** Builds the preview rows for a report (delegates to the preview builder). */
  buildPreviewRecords(report: ReportBuilderAsset | null): PreviewRecord[] {
    return this.previewBuilder.buildPreviewRecords(report);
  }

  /** Resolves the initially-selected report id (persisted, else first). */
  private mergeWithSeedReports(storedReports: ReportBuilderAsset[] | undefined): ReportBuilderAsset[] {
    const seeds = this.seedFactory.buildSeedReports();
    if (!storedReports?.length) return seeds;
    const seedIds = new Set(seeds.map((s) => s.id));
    const userReports = storedReports.filter((r) => !seedIds.has(r.id));
    return [...seeds, ...userReports];
  }

  private resolveInitialSelectedReportId(selectedReportId: string | undefined, reports: ReportBuilderAsset[]): string {
    if (selectedReportId && reports.some((report) => report.id === selectedReportId)) {
      return selectedReportId;
    }
    return reports[0]?.id ?? '';
  }

  /** Two-letter short code derived from a report name. */
  private getShortCode(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? 'R') + (parts[1]?.[0] ?? parts[0]?.[1] ?? 'P');
  }

  /** Next free `r<n>` report id. */
  private getNextReportId(): string {
    const existing = new Set(this.reportsState().map((report) => report.id));
    let counter = this.reportsState().length + 1;
    let candidate = `r${counter}`;
    while (existing.has(candidate)) {
      counter += 1;
      candidate = `r${counter}`;
    }
    return candidate;
  }
}
