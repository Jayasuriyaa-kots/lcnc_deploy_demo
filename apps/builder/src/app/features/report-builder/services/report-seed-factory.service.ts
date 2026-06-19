import { Injectable, inject } from '@angular/core';
import { REPORT_BUILDER_DETAIL_ACTION_GROUPS, REPORT_BUILDER_QUICK_ACTION_GROUPS } from '@builder/features/report-builder/config/report-builder.config';
import { ReportQuickViewCustomLayout } from '@builder/features/report-builder/models/report-builder.models';
import {
  ReportBuilderAsset,
  ReportBuilderColumn,
  ReportBuilderFilterRule,
} from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportSourceCatalogService } from '@builder/features/report-builder/services/report-source-catalog.service';
import { cloneActionGroups } from '@builder/features/report-builder/utils/report-builder-normalize.util';
import { REPORTS_LANG } from '@builder/features/report-builder/lang/reports.lang';

const L = REPORTS_LANG;

const REPORT_COLOR_SURFACE = 'var(--qo-color-neutral-0)';
const REPORT_COLOR_TEXT_PRIMARY = 'var(--qo-color-neutral-900)';
const REPORT_COLOR_TEXT_BODY = 'var(--qo-color-neutral-700)';
const REPORT_COLOR_TEXT_META = 'var(--qo-color-neutral-500)';

/** Config for building a single seed report. */
export interface CreateSeedReportConfig {
  id: string;
  shortCode: string;
  name: string;
  status: 'live' | 'draft';
  sourceFormId: string;
  description: string;
  viewType: 'List View' | 'Card View';
  density: 'Compact' | 'Comfortable' | 'Detailed';
  visibleColumnIds: string[];
  reportType?: 'list' | 'chart' | 'pivot';
  filterRules?: ReportBuilderFilterRule[];
}

/**
 * Factory for report assets: the initial demo/seed reports, a fully-configured
 * report from a wizard config, the default quick-view custom layout, and the
 * card-layout variant applied at create time. Stateless — reads column metadata
 * from the source catalog.
 */
@Injectable({ providedIn: 'root' })
export class ReportSeedFactoryService {
  private readonly catalog = inject(ReportSourceCatalogService);

  /** Builds the initial set of demo reports shown on first load. */
  buildSeedReports(): ReportBuilderAsset[] {
    return [
      this.createSeedReport({
        id: 'r1',
        shortCode: 'ED',
        name: 'Employee Directory',
        status: 'live',
        sourceFormId: 'employees_form',
        description: 'Browse all 10,000+ QuantaOps employees with department, location, and status filters.',
        viewType: 'List View',
        density: 'Comfortable',
        visibleColumnIds: ['employee_code', 'employee_name', 'department', 'location', 'status'],
      }),
      this.createSeedReport({
        id: 'r2',
        shortCode: 'AS',
        name: 'Attendance Summary',
        status: 'live',
        sourceFormId: 'attendance_form',
        description: 'Daily attendance logs grouped by status, with check-in/out times and late-minutes tracking.',
        viewType: 'Card View',
        density: 'Compact',
        visibleColumnIds: ['employee_code', 'employee_name', 'log_date', 'check_in', 'check_out', 'status'],
      }),
      this.createSeedReport({
        id: 'r3',
        shortCode: 'LS',
        name: 'Leave Summary',
        status: 'live',
        sourceFormId: 'leave_form',
        description: 'Track leave requests by type, duration, and approval state across all departments.',
        viewType: 'List View',
        density: 'Detailed',
        visibleColumnIds: ['employee_name', 'department', 'leave_type', 'start_date', 'days', 'status'],
      }),
      this.createSeedReport({
        id: 'r4',
        shortCode: 'PR',
        name: 'Performance Reviews — Q2 2026',
        status: 'live',
        sourceFormId: 'performance_review_form',
        description: 'Q2 performance ratings, goals achieved %, and reviewer details for all reviewed employees.',
        viewType: 'List View',
        density: 'Comfortable',
        visibleColumnIds: ['employee_id', 'reviewer_name', 'review_period', 'overall_rating', 'goals_achieved'],
      }),
      this.createSeedReport({
        id: 'r5',
        shortCode: 'AI',
        name: 'Asset Inventory',
        status: 'live',
        sourceFormId: 'asset_request_form',
        description: 'Open and fulfilled asset requests with priority, model, and required-by date.',
        viewType: 'List View',
        density: 'Compact',
        visibleColumnIds: ['employee_id', 'asset_type', 'asset_model', 'priority', 'required_by'],
      }),
      this.createSeedReport({
        id: 'r6',
        shortCode: 'TE',
        name: 'Travel Expense Claims',
        status: 'live',
        sourceFormId: 'travel_expense_form',
        description: 'All travel reimbursement submissions with purpose, route, mode, and claim amount.',
        viewType: 'List View',
        density: 'Comfortable',
        visibleColumnIds: ['employee_id', 'travel_purpose', 'travel_from', 'travel_to', 'total_amount'],
      }),
      this.createSeedReport({
        id: 'r7',
        shortCode: 'RP',
        name: 'Recruitment Pipeline',
        status: 'live',
        sourceFormId: 'recruitment_form',
        description: 'Active candidates by role, experience, current employer, and notice period.',
        viewType: 'Card View',
        density: 'Comfortable',
        visibleColumnIds: ['candidate_name', 'applied_role', 'experience_years', 'current_company', 'notice_period'],
      }),
      this.createSeedReport({
        id: 'r8',
        shortCode: 'HD',
        name: 'Headcount by Department',
        status: 'live',
        sourceFormId: 'employees_form',
        description: 'Department-level headcount, open positions, average tenure, and attrition rate.',
        viewType: 'List View',
        density: 'Detailed',
        visibleColumnIds: ['department', 'employee_name', 'location', 'start_date', 'status'],
      }),
      this.createSeedReport({
        id: 'r9',
        shortCode: 'TC',
        name: 'Training Calendar — June 2026',
        status: 'draft',
        sourceFormId: 'training_form',
        description: 'June 2026 training registrations showing program, mode, and start dates.',
        viewType: 'List View',
        density: 'Compact',
        visibleColumnIds: ['employee_id', 'training_program', 'training_mode', 'preferred_date'],
      }),
      this.createSeedReport({
        id: 'r10',
        shortCode: 'IT',
        name: 'IT Support Tickets',
        status: 'live',
        sourceFormId: 'it_ticket_form',
        description: 'Open IT support tickets by category, severity, and reported date.',
        viewType: 'List View',
        density: 'Comfortable',
        visibleColumnIds: ['employee_id', 'issue_category', 'issue_title', 'severity', 'affected_since'],
      }),
      // Contextual views — each tab in the deployment nav gets a uniquely-named report
      this.createSeedReport({
        id: 'r11',
        shortCode: 'AS',
        name: 'Active Staff',
        status: 'live',
        sourceFormId: 'employees_form',
        description: 'All currently active QuantaOps employees — no leaves or onboarding records.',
        viewType: 'List View',
        density: 'Comfortable',
        visibleColumnIds: ['employee_code', 'employee_name', 'department', 'location', 'status'],
        filterRules: [{ id: 'fr-r11-1', columnId: 'status', operator: 'is', value: 'Active' }],
      }),
      this.createSeedReport({
        id: 'r12',
        shortCode: 'OL',
        name: 'On Leave Register',
        status: 'live',
        sourceFormId: 'employees_form',
        description: 'Employees currently on approved leave — department, location, and start date.',
        viewType: 'List View',
        density: 'Compact',
        visibleColumnIds: ['employee_code', 'employee_name', 'department', 'start_date', 'status'],
        filterRules: [{ id: 'fr-r12-1', columnId: 'status', operator: 'is', value: 'On Leave' }],
      }),
      this.createSeedReport({
        id: 'r13',
        shortCode: 'NJ',
        name: 'New Joiner Onboarding',
        status: 'live',
        sourceFormId: 'employees_form',
        description: 'Employees who joined in the last 90 days — onboarding checklist view.',
        viewType: 'Card View',
        density: 'Comfortable',
        visibleColumnIds: ['employee_code', 'employee_name', 'department', 'location', 'start_date'],
        filterRules: [{ id: 'fr-r13-1', columnId: 'status', operator: 'is', value: 'New Joiner' }],
      }),
      this.createSeedReport({
        id: 'r14',
        shortCode: 'PL',
        name: 'Pending Leave Approvals',
        status: 'live',
        sourceFormId: 'leave_form',
        description: 'Leave requests awaiting manager or HR approval — sorted by oldest first.',
        viewType: 'List View',
        density: 'Detailed',
        visibleColumnIds: ['employee_name', 'leave_type', 'start_date', 'end_date', 'days', 'approver'],
      }),
      this.createSeedReport({
        id: 'r15',
        shortCode: 'AL',
        name: 'Approved Leave Log',
        status: 'live',
        sourceFormId: 'leave_form',
        description: 'All approved leave records with employee, department, type, and duration.',
        viewType: 'List View',
        density: 'Comfortable',
        visibleColumnIds: ['employee_name', 'department', 'leave_type', 'start_date', 'end_date', 'days'],
      }),
    ];
  }

  /** Builds a fully-defaulted report asset from a seed/create config. */
  createSeedReport(config: CreateSeedReportConfig): ReportBuilderAsset {
    const source =
      this.catalog.sourceOptions.find((item) => item.id === config.sourceFormId) ?? this.catalog.sourceOptions[0];
    const columns = this.resolveSeedColumnsVisibility(source.columns, config.visibleColumnIds);

    return {
      id: config.id,
      shortCode: config.shortCode,
      name: config.name,
      typeLabel: 'Dataframe',
      status: config.status,
      description: config.description,
      reportType: config.reportType ?? 'list',
      viewType: config.viewType,
      density: config.density,
      sourceFormId: source.id,
      sourceFormLabel: source.name,
      datasourceLabel: source.datasourceLabel,
      tableLabel: source.tableLabel,
      joins: [],
      columns,
      filterPresets: [
        { id: 'fp1', label: L.seed.filterPresets.activeOnly, enabled: true },
        { id: 'fp2', label: L.seed.filterPresets.thisMonth, enabled: config.name !== 'Payroll Report' },
        { id: 'fp3', label: L.seed.filterPresets.myTeam, enabled: false },
      ],
      filterRules: config.filterRules ?? [],
      actions: [
        { id: 'a1', label: L.seed.toolbarActions.view, enabled: true },
        { id: 'a2', label: L.seed.toolbarActions.export, enabled: true },
        { id: 'a3', label: L.common.duplicate, enabled: config.status === 'draft' },
      ],
      settings: {
        defaultLayout: config.density,
        recordClickAction: 'View Record',
        showSearch: true,
        showFilters: true,
        showExport: true,
        showViewSwitcher: true,
        groupBy: config.name === 'Attendance Summary' ? 'status' : '',
        groupOrder: 'none',
        showRecordCount: true,
        sortBy: '',
        sortOrder: 'asc',
        sortCriteria: [],
        cardPrimaryFieldId: columns.find((column) => column.visible)?.id ?? columns[0]?.id ?? '',
        cardSecondaryFieldId:
          columns.filter((column) => column.visible)[1]?.id ??
          columns.find((column) => column.visible)?.id ??
          columns[1]?.id ??
          columns[0]?.id ??
          '',
        detailLayoutMode: 'all-fields',
        quickLayoutMode: config.viewType === 'List View' ? 'list' : 'card',
        cardFieldTextColor: REPORT_COLOR_TEXT_PRIMARY,
        cardFieldFontSize: 13,
        quickActionGroups: cloneActionGroups(REPORT_BUILDER_QUICK_ACTION_GROUPS),
        detailActionGroups: cloneActionGroups(REPORT_BUILDER_DETAIL_ACTION_GROUPS, REPORT_BUILDER_DETAIL_ACTION_GROUPS),
        quickViewCustomLayout: this.createDefaultQuickViewCustomLayout(columns),
        detailBlocks: [
          {
            id: `detail-${config.id}-main`,
            title: source.tableLabel || source.name || 'Details',
            fieldIds: columns.filter((column) => column.visible).map((column) => column.id),
            sourceFormId: source.id,
          },
        ],
        allFieldsLayout: {
          fieldIds: columns.filter((column) => column.visible).map((column) => column.id),
        },
        blockLayout: [
          {
            id: `detail-${config.id}-main`,
            title: source.tableLabel || source.name || 'Details',
            fieldIds: columns.filter((column) => column.visible).map((column) => column.id),
            sourceFormId: source.id,
          },
        ],
        tabLayout: [
          {
            id: 'overview',
            title: 'Overview',
            sourceFormId: source.id,
            fieldIds: columns.filter((column) => column.visible).map((column) => column.id),
          },
        ],
        detailTabs: [
          {
            id: 'overview',
            title: 'Overview',
            blocks: [
              {
                id: `detail-${config.id}-main`,
                title: source.tableLabel || source.name || 'Details',
                fieldIds: columns.filter((column) => column.visible).map((column) => column.id),
                sourceFormId: source.id,
              },
            ],
          },
        ],
      },
    };
  }

  /** Applies the wizard's card-layout choice (card2–card5) to a fresh report. */
  applyCreateCardLayout(
    report: ReportBuilderAsset,
    cardLayout: 'card2' | 'card3' | 'card4' | 'card5'
  ): ReportBuilderAsset {
    if (cardLayout === 'card2') {
      return { ...report, settings: { ...report.settings, quickLayoutMode: 'card' } };
    }
    if (cardLayout === 'card3') {
      return {
        ...report,
        settings: {
          ...report.settings,
          quickLayoutMode: 'custom',
          quickViewCustomLayout: { ...report.settings.quickViewCustomLayout, templateMode: true, templateVariant: 'block' },
        },
      };
    }
    if (cardLayout === 'card4') {
      return {
        ...report,
        settings: {
          ...report.settings,
          quickLayoutMode: 'custom',
          quickViewCustomLayout: { ...report.settings.quickViewCustomLayout, templateMode: true, templateVariant: 'list' },
        },
      };
    }
    return {
      ...report,
      settings: {
        ...report.settings,
        quickLayoutMode: 'custom',
        quickViewCustomLayout: { ...report.settings.quickViewCustomLayout, templateMode: false, templateVariant: 'block' },
      },
    };
  }

  /** Resolves which seed columns start visible (preferred ids, else first ~12). */
  private resolveSeedColumnsVisibility(
    sourceColumns: ReportBuilderColumn[],
    preferredVisibleColumnIds: string[]
  ): ReportBuilderColumn[] {
    const preferredSet = new Set(preferredVisibleColumnIds);
    const initiallyResolved = sourceColumns.map((column) => ({
      ...column,
      visible: preferredSet.has(column.id),
    }));

    const matchedVisibleCount = initiallyResolved.filter((column) => column.visible).length;
    if (matchedVisibleCount >= 2 || sourceColumns.length <= 2) {
      return initiallyResolved;
    }

    const fallbackVisibleCount = Math.min(sourceColumns.length, 12);
    return sourceColumns.map((column, index) => ({ ...column, visible: index < fallbackVisibleCount }));
  }

  /** Builds the default quick-view custom layout (slots, styles, canvas) for columns. */
  private createDefaultQuickViewCustomLayout(columns: ReportBuilderColumn[]): ReportQuickViewCustomLayout {
    const imageCandidate =
      columns.find((column) =>
        ['image', 'photo', 'file'].some((term) => `${column.fieldType} ${column.label}`.toLowerCase().includes(term))
      )?.id ?? '';
    const titleCandidate =
      columns.find((column) =>
        ['name', 'title', 'subject'].some((term) => `${column.fieldType} ${column.label}`.toLowerCase().includes(term))
      )?.id ??
      columns[0]?.id ??
      '';
    const bodyCandidate =
      columns.find((column) =>
        ['multi', 'description', 'notes', 'address', 'long'].some((term) =>
          `${column.fieldType} ${column.label}`.toLowerCase().includes(term)
        )
      )?.id ??
      columns[1]?.id ??
      '';
    const metaLeftCandidate = columns[2]?.id ?? '';
    const metaRightCandidate = columns[3]?.id ?? '';

    return {
      templateMode: false,
      templateVariant: 'block',
      selectedSlot: 'title',
      activeTab: 'display',
      slots: {
        image: imageCandidate,
        title: titleCandidate,
        body: bodyCandidate,
        meta_left: metaLeftCandidate,
        meta_right: metaRightCandidate,
      },
      styles: {
        cardBackgroundColor: REPORT_COLOR_SURFACE,
        cardPadding: { top: 16, right: 16, bottom: 16, left: 16 },
        slotStyles: {
          image: { align: 'center', backgroundColor: REPORT_COLOR_SURFACE, padding: { top: 12, right: 12, bottom: 12, left: 12 } },
          title: { align: 'left', backgroundColor: REPORT_COLOR_SURFACE, padding: { top: 12, right: 12, bottom: 12, left: 12 } },
          body: { align: 'left', backgroundColor: REPORT_COLOR_SURFACE, padding: { top: 12, right: 12, bottom: 12, left: 12 } },
          meta_left: { align: 'left', backgroundColor: REPORT_COLOR_SURFACE, padding: { top: 12, right: 12, bottom: 12, left: 12 } },
          meta_right: { align: 'left', backgroundColor: REPORT_COLOR_SURFACE, padding: { top: 12, right: 12, bottom: 12, left: 12 } },
        },
        titleColor: REPORT_COLOR_TEXT_PRIMARY,
        titleFontSize: 24,
        titleFontWeight: 600,
        bodyColor: REPORT_COLOR_TEXT_BODY,
        bodyFontSize: 16,
        metaColor: REPORT_COLOR_TEXT_META,
        metaFontSize: 14,
        imageShape: 'square',
      },
      canvasLayout: {
        containerWidth: 420,
        containerHeight: 220,
        elements: [
          { instanceId: 'image-1', slotId: 'image', label: L.layoutBuilder.slots.image, x: 24, y: 24, width: 92, height: 92, visualType: 'image' },
          { instanceId: 'title-1', slotId: 'title', label: L.layoutBuilder.slots.title, x: 136, y: 24, width: 240, height: 44, visualType: 'text', fontSize: 14, fontWeight: 600, textAlign: 'left', textColor: REPORT_COLOR_TEXT_PRIMARY, backgroundColor: REPORT_COLOR_SURFACE },
          { instanceId: 'body-1', slotId: 'body', label: L.layoutBuilder.slots.bodyText, x: 136, y: 72, width: 220, height: 32, visualType: 'text', fontSize: 14, fontWeight: 500, textAlign: 'left', textColor: REPORT_COLOR_TEXT_BODY, backgroundColor: REPORT_COLOR_SURFACE },
          { instanceId: 'meta-left-1', slotId: 'meta_left', label: L.layoutBuilder.slots.singleLine, x: 136, y: 116, width: 140, height: 30, visualType: 'text', fontSize: 13, fontWeight: 500, textAlign: 'left', textColor: REPORT_COLOR_TEXT_META, backgroundColor: REPORT_COLOR_SURFACE },
          { instanceId: 'meta-right-1', slotId: 'meta_right', label: L.layoutBuilder.slots.caption, x: 136, y: 150, width: 140, height: 30, visualType: 'text', fontSize: 13, fontWeight: 500, textAlign: 'left', textColor: REPORT_COLOR_TEXT_META, backgroundColor: REPORT_COLOR_SURFACE },
        ],
      },
    };
  }
}
