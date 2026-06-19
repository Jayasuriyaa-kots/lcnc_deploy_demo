import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  ReportBuilderColumn,
  ReportBuilderFilterRule,
  ReportBuilderFacade,
  ReportSortCriterion,
} from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportPreviewService } from '@builder/features/report-builder/services/report-preview.service';
import { ReportQuickLayoutService } from '@builder/features/report-builder/services/report-quick-layout.service';
import { ReportDetailLayoutService } from '@builder/features/report-builder/services/report-detail-layout.service';
import {
  CreateReportResult,
  ReportCreateWizardComponent,
} from '@builder/features/report-builder/components/report-create-wizard/report-create-wizard.component';
import {
  DetailLayout,
  QuickLayout,
  ReportActionGroup,
  ReportAllFieldsLayout,
  ReportBlockLayoutItem,
  ReportConfigMode,
  ReportConfigTab,
  ReportDetailTab,
  ReportDetailTabBlock,
  ReportTabLayoutItem,
  ReportJoin,
} from '@builder/features/report-builder/models/report-builder.models';
import { ReportLeftPanelComponent } from '@builder/features/report-builder/components/report-left-panel/report-left-panel.component';
import { ReportCenterPreviewComponent } from '@builder/features/report-builder/components/report-center-preview/report-center-preview.component';
import { ReportRightPanelComponent } from '@builder/features/report-builder/components/report-right-panel/report-right-panel.component';
import {
  ReportSettingsModalComponent,
  ReportSettingsUpdates,
} from '@builder/features/report-builder/components/report-settings-modal/report-settings-modal.component';
import { ReportPreviewModalComponent } from '@builder/features/report-builder/components/report-preview-modal/report-preview-modal.component';
import { ReportDrawersComponent } from '@builder/features/report-builder/components/report-drawers/report-drawers.component';
import { ReportCustomLayoutModalComponent } from '@builder/features/report-builder/components/report-custom-layout-modal/report-custom-layout-modal.component';
import { ReportCreateLayoutModalComponent } from '../components/report-create-layout-modal/report-create-layout-modal.component';
import { ReportDetailCreateLayoutModalComponent } from '../components/report-detail-create-layout-modal/report-detail-create-layout-modal.component';
import {
  REPORT_BUILDER_DETAIL_ACTION_GROUPS,
  REPORT_BUILDER_QUICK_ACTION_GROUPS,
} from '@builder/features/report-builder/config/report-builder.config';
import { QoButtonComponent, QoConfirmDialogService, QoToastService } from '@qo/ui-components';
import { Router } from '@angular/router';


import { ReportBuilderI18nService } from '../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-builder-page',
  standalone: true,
  providers: [
    ReportPreviewService,
    ReportQuickLayoutService,
    ReportDetailLayoutService,
  ],
  imports: [ReportLeftPanelComponent,
    ReportCenterPreviewComponent,
    ReportRightPanelComponent,
    ReportCreateWizardComponent,
    ReportSettingsModalComponent,
    ReportPreviewModalComponent,
    ReportDrawersComponent,
    ReportCustomLayoutModalComponent,
    ReportCreateLayoutModalComponent,
    ReportDetailCreateLayoutModalComponent,
    QoButtonComponent,
  ],
  templateUrl: './report-builder-page.component.html',
  styleUrl: './report-builder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Smart container for the DataFrame (report) builder page. Wires the left/center/
 * right panels, drawers, and modals to the report builder facade, holding only
 * panel-collapse UI state and delegating preview paging + saved layouts to its
 * three component-scoped services.
 */
export class ReportBuilderPageComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private readonly state = inject(ReportBuilderFacade);
  private readonly toast = inject(QoToastService);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(QoConfirmDialogService);

  // Component-scoped concerns extracted from this container (Frontend Guide §9).
  readonly preview = inject(ReportPreviewService);
  readonly quickLayouts = inject(ReportQuickLayoutService);
  readonly detailLayouts = inject(ReportDetailLayoutService);

  readonly report = this.state.selectedReport;
  readonly sourceOptions = this.state.sourceOptions;
  readonly createWizardOpen = this.state.createWizardOpen;
  readonly reportSettingsOpen = this.state.reportSettingsOpen;
  readonly previewOpen = this.state.previewOpen;
  readonly customLayoutOpen = this.state.customLayoutOpen;

  readonly reportConfigTab = this.state.reportConfigTab;
  readonly reportConfigMode = this.state.reportConfigMode;
  readonly quickLayout = this.state.quickLayout;
  readonly detailLayout = this.state.detailLayout;

  readonly fieldConfigOpen = this.state.fieldConfigOpen;
  readonly searchPanelOpen = this.state.searchPanelOpen;
  readonly bulkEditOpen = this.state.bulkEditOpen;
  readonly actionConfigOpen = this.state.actionConfigOpen;
  readonly detailLayoutConfigOpen = this.state.detailLayoutConfigOpen;
  readonly detailBlockLayoutConfigOpen = this.state.detailBlockLayoutConfigOpen;

  readonly previewSelection = this.state.previewSelection;
  readonly previewPageSize = this.state.previewPageSize;
  readonly leftPanelCollapsed = signal<boolean>(true);
  readonly rightPanelCollapsed = signal<boolean>(false);

  readonly allColumns = computed(() => this.report()?.columns ?? []);
  readonly visibleColumns = computed(() =>
    this.allColumns().filter((column) => column.visible)
  );
  readonly layoutColumns = computed(() => {
    const rightColumn = this.rightPanelCollapsed() ? '42px' : '320px';
    return `minmax(0, 1fr) ${rightColumn}`;
  });
  readonly selectedPreviewCount = computed(() => this.previewSelection().length);

  readonly quickActionGroups = computed(() => {
    const report = this.report();
    const groups = report?.settings.quickActionGroups ?? [];
    return groups.length ? groups : REPORT_BUILDER_QUICK_ACTION_GROUPS;
  });
  readonly detailActionGroups = computed(() => REPORT_BUILDER_DETAIL_ACTION_GROUPS);

  /** Collapses/expands the left config panel. */
  toggleLeftPanel(): void {
    this.leftPanelCollapsed.update((value) => !value);
  }

  /** Collapses/expands the right config panel. */
  toggleRightPanel(): void {
    this.rightPanelCollapsed.update((value) => !value);
  }

  /** Switches the active config tab (Quick / Detail). */
  setReportConfigTab(tab: ReportConfigTab): void {
    this.state.setReportConfigTab(tab);
  }

  /** Switches the active config mode (Layout / Actions). */
  setReportConfigMode(mode: ReportConfigMode): void {
    this.state.setReportConfigMode(mode);
  }

  /** Sets the quick layout; opens the field drawer when switching to card. */
  setQuickLayout(layout: QuickLayout): void {
    this.state.setQuickLayout(layout);

    if (layout === 'card') {
      this.state.toggleDrawer('field');
    }
  }

  /** Sets the detail layout mode. */
  setDetailLayout(layout: DetailLayout): void {
    this.state.setDetailLayout(layout);
  }

  /** Applies a single settings change (with sort-by sync for sort criteria). */
  updateReportSettings(event: { key: string; value: string | boolean | ReportSortCriterion[] }): void {
    const isSortCriteriaUpdate = event.key === 'sortCriteria';
    const sortCriteria = isSortCriteriaUpdate ? (event.value as ReportSortCriterion[]) : null;
    const primarySort = sortCriteria?.[0] ?? null;

    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        [event.key]: event.value,
        ...(isSortCriteriaUpdate
          ? {
              sortBy: primarySort?.columnId ?? '',
              sortOrder: primarySort?.direction ?? 'asc',
            }
          : {}),
      },
    }));
  }

  /** Changes the report's source form. */
  updateSourceForm(sourceFormId: string): void {
    this.state.updateSelectedReportSource(sourceFormId);
  }

  /** Applies the given filter rules to the report. */
  applyFilters(filters: ReportBuilderFilterRule[]): void {
    this.state.updateSelectedReportFilters(filters);
  }

  /** Clears all filter rules. */
  clearFilters(): void {
    this.state.updateSelectedReportFilters([]);
  }

  /** Switches between list/card view (opening the field drawer for card). */
  updateViewType(viewType: 'List View' | 'Card View'): void {
    if (viewType === 'Card View') {
      this.state.setQuickLayout('card');
      this.state.toggleDrawer('field');
      return;
    }

    this.state.setQuickLayout('list');
    this.state.updateSelectedReport((report) => ({
      ...report,
      viewType,
    }));
  }

  /** Saves the report settings modal's grouped changes, then closes it. */
  updateReportSettingsGroup(data: ReportSettingsUpdates): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      name: data.name,
      description: data.description,
      viewType: data.viewType,
      settings: {
        ...report.settings,
        defaultLayout: data.defaultLayout,
        recordClickAction: data.recordClickAction,
      },
    }));

    this.state.closeReportSettings();
  }

  /** Creates a new report from the wizard result. */
  createReport(data: CreateReportResult): void {
    this.state.createReport(data);
  }

  /** Opens the named config drawer. */
  toggleDrawer(drawer: 'field' | 'search' | 'bulk' | 'action' | 'detailLayout' | 'detailBlockLayout'): void {
    this.state.toggleDrawer(drawer);
  }

  /** Closes all config drawers. */
  closeDrawers(): void {
    this.state.closeDrawers();
  }

  /** Toggles a column's visibility on the report. */
  toggleColumnVisibility(columnId: string): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      columns: report.columns.map((column) =>
        column.id === columnId ? { ...column, visible: !column.visible } : column
      ),
    }));
  }

  /** Replaces the report's column order/definitions. */
  reorderColumns(columns: ReportBuilderColumn[]): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      columns,
    }));
  }

  /** Updates the card field text colour and font size. */
  updateCardStyle(style: { textColor: string; fontSize: number }): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        cardFieldTextColor: style.textColor,
        cardFieldFontSize: style.fontSize,
      },
    }));
  }

  /** Saves the report's quick action groups (deep-cloned). */
  updateQuickActionGroups(groups: ReportActionGroup[]): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        quickActionGroups: groups.map((group) => ({
          ...group,
          items: group.items.map((item) => ({ ...item })),
        })),
      },
    }));
  }

  /** Sets the record-click action (View Record / Do Nothing). */
  updateRecordClickAction(action: 'View Record' | 'Do Nothing'): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        recordClickAction: action,
      },
    }));
  }

  /** Saves the detail block layout (deep-cloned) to the report. */
  updateDetailBlocks(blocks: ReportDetailTabBlock[]): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        detailBlocks: blocks.map((block) => ({
          id: block.id,
          title: block.title,
          fieldIds: [...block.fieldIds],
          sourceFormId: block.sourceFormId,
          columns: block.columns?.map((column) => [...column]),
        })),
      },
    }));
  }

  /** Saves the detail tabs (and derived blocks + layout mode) to the report. */
  updateDetailTabs(detailTabs: ReportDetailTab[]): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        detailLayoutMode: detailTabs.length > 1 ? 'tab-view' : 'block_layout',
        detailTabs: detailTabs.map((tab) => ({
          ...tab,
          blocks: tab.blocks.map((block) => ({
            ...block,
            fieldIds: [...block.fieldIds],
            columns: block.columns?.map((column) => [...column]),
          })),
        })),
        detailBlocks: detailTabs.flatMap((tab) =>
          tab.blocks.map((block) => ({
            id: block.id,
            title: block.title,
            fieldIds: [...block.fieldIds],
            sourceFormId: block.sourceFormId,
            columns: block.columns?.map((column) => [...column]),
          }))
        ),
      },
    }));
  }

  /** Saves the all-fields detail layout ordering. */
  updateAllFieldsLayout(layout: ReportAllFieldsLayout): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        allFieldsLayout: {
          fieldIds: [...layout.fieldIds],
        },
      },
    }));
  }

  /** Saves the block detail layout (and mirrors it to detailBlocks). */
  updateBlockLayout(layout: ReportBlockLayoutItem[]): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        blockLayout: layout.map((block) => ({
          ...block,
          fieldIds: [...block.fieldIds],
          columns: block.columns?.map((column) => [...column]),
        })),
        detailBlocks: layout.map((block) => ({
          id: block.id,
          title: block.title,
          fieldIds: [...block.fieldIds],
          sourceFormId: block.sourceFormId,
          columns: block.columns?.map((column) => [...column]),
        })),
      },
    }));
  }

  /** Saves the tab detail layout (and derives detailTabs with a fields block). */
  updateTabLayout(layout: ReportTabLayoutItem[]): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      settings: {
        ...report.settings,
        tabLayout: layout.map((tab) => ({
          ...tab,
          fieldIds: [...tab.fieldIds],
          blocks: tab.blocks?.map((block) => ({
            ...block,
            fieldIds: [...block.fieldIds],
            columns: block.columns?.map((column) => [...column]),
          })),
        })),
        detailTabs: layout.map((tab) => ({
          id: tab.id,
          title: tab.title,
          blocks: [
            {
              id: `${tab.id}__tab-fields`,
              title: tab.title,
              sourceFormId: tab.sourceFormId,
              fieldIds: [...tab.fieldIds],
            },
            ...(tab.blocks ?? []),
          ].map((block) => ({
            id: block.id,
            title: block.title,
            sourceFormId: block.sourceFormId,
            fieldIds: [...block.fieldIds],
            columns: block.columns?.map((column) => [...column]),
          })),
        })),
      },
    }));
  }

  /** Saves the report's joins and rebuilds its columns (primary + joined). */
  updateJoins(joins: ReportJoin[]): void {
    this.state.updateSelectedReport((report) => ({
      ...report,
      joins: joins.map((join) => ({
        ...join,
        on: { ...join.on },
      })),
      columns: [
        ...report.columns.filter((column) => column.source === 'primary'),
        ...joins.flatMap((join) => {
          const source = this.sourceOptions.find((item) => item.id === join.targetFormId);
          if (!source) {
            return [];
          }

          return source.columns.map((column) => ({
            ...column,
            id: `${join.targetFormId}__${column.id}`,
            label: `${source.name} · ${column.label}`,
            formId: join.targetFormId,
            source: 'joined' as const,
            visible: true,
          }));
        }),
      ],
    }));
  }

  /** Opens the report settings modal. */
  showSettings(): void {
    this.state.openReportSettings();
  }

  /** Closes the report settings modal. */
  closeSettings(): void {
    this.state.closeReportSettings();
  }

  /** Opens the standalone preview in a new tab via a one-time storage handoff. */
  showPreview(): void {
    const activeReport = this.report();
    if (!activeReport) {
      return;
    }

    const previewStateKey = `report-preview-${activeReport.id}-${crypto.randomUUID()}`;
    localStorage.setItem(previewStateKey, JSON.stringify(activeReport));
    const previewUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/report-builder/preview'], {
        queryParams: { stateKey: previewStateKey, pageSize: this.preview.pageSizeNumber() },
      })
    );

    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }

  /** Closes the in-app preview modal. */
  closePreview(): void {
    this.state.closePreview();
  }

  /** Closes the create-report wizard. */
  closeWizard(): void {
    this.state.closeCreateWizard();
  }

  /** Publishes the active report (sets it live) with a success toast. */
  publishReport(): void {
    const activeReport = this.report();
    if (!activeReport) {
      return;
    }

    this.state.publishReport(activeReport.id);
    this.toast.success(this.i18n.t('toast.savedAndPublished'));
  }

  /** Reverts the active report to draft with a toast. */
  revertToDraft(): void {
    const activeReport = this.report();
    if (!activeReport) {
      return;
    }

    this.state.saveDraft();
    this.toast.success(this.i18n.t('toast.revertedToDraft'));
  }

  /** Duplicates the active report with a toast. */
  duplicateReport(): void {
    const activeReport = this.report();
    if (!activeReport) {
      return;
    }

    this.state.duplicateReport(activeReport.id);
    this.toast.success(this.i18n.t('toast.reportDuplicated'));
  }

  /** Confirms, then deletes the active report with a toast. */
  async deleteReport(): Promise<void> {
    const activeReport = this.report();
    if (!activeReport) {
      return;
    }

    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteReportTitle'),
      this.i18n.t('confirmations.deleteReportMessage')
    );
    if (!confirmed) return;

    this.state.deleteReport(activeReport.id);
    this.toast.success(this.i18n.t('toast.reportRemoved'));
  }
}
