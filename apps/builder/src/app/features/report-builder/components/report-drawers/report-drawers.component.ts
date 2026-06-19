import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import {
  ReportBuilderColumn,
  ReportBuilderFilterRule,
  ReportBuilderSourceOption,
} from '@builder/features/report-builder/facades/report-builder.facade';
import {
  DetailLayout,
  QuickLayout,
  ReportAllFieldsLayout,
  ReportBlockLayoutItem,
  ReportDetailTab,
  ReportDetailTabBlock,
  ReportTabLayoutItem,
} from '@builder/features/report-builder/models/report-builder.models';
import { FieldConfigDrawerComponent } from '@builder/features/report-builder/components/report-drawers/field-config-drawer/field-config-drawer.component';
import { SearchFiltersDrawerComponent } from '@builder/features/report-builder/components/report-drawers/search-filters-drawer/search-filters-drawer.component';
import { BulkEditDrawerComponent } from '@builder/features/report-builder/components/report-drawers/bulk-edit-drawer/bulk-edit-drawer.component';
import { ActionConfigDrawerComponent } from '@builder/features/report-builder/components/report-drawers/action-config-drawer/action-config-drawer.component';
import { DetailLayoutDrawerComponent } from '@builder/features/report-builder/components/report-drawers/detail-layout-drawer/detail-layout-drawer.component';
import { DetailBlockLayoutDrawerComponent } from '@builder/features/report-builder/components/report-drawers/detail-block-layout-drawer/detail-block-layout-drawer.component';


const REPORT_COLOR_TEXT_PRIMARY = 'var(--qo-color-neutral-900)';

/**
 * Thin host for the report builder's right-hand configuration drawers.
 *
 * Each drawer is its own standalone, presentational child component (Frontend
 * Guide §7 — dumb components, one concern each). This shell only:
 *   1. renders the shared backdrop when any drawer is open,
 *   2. conditionally mounts the matching drawer (mounted fresh on open / torn
 *      down on close, so each child initialises in its own constructor), and
 *   3. forwards the page-level inputs down and re-emits the drawers' outputs up.
 *
 * The shared SCSS (`report-drawers.component.scss`) is reused by every child via
 * `styleUrl`, so the drawer chrome looks identical without duplicating styles in
 * source.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-drawers',
  standalone: true,
  imports: [
    FieldConfigDrawerComponent,
    SearchFiltersDrawerComponent,
    BulkEditDrawerComponent,
    ActionConfigDrawerComponent,
    DetailLayoutDrawerComponent,
    DetailBlockLayoutDrawerComponent,
  ],
  templateUrl: './report-drawers.component.html',
  styleUrl: './report-drawers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDrawersComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  // ── Open flags (one per drawer) ────────────────────────────────────────────
  readonly fieldConfigOpen = input<boolean>(false);
  readonly searchPanelOpen = input<boolean>(false);
  readonly bulkEditOpen = input<boolean>(false);
  readonly actionConfigOpen = input<boolean>(false);
  readonly detailLayoutConfigOpen = input<boolean>(false);
  readonly detailBlockLayoutConfigOpen = input<boolean>(false);

  // ── Shared data inputs (forwarded to the relevant children) ────────────────
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly visibleColumns = input<ReportBuilderColumn[]>([]);
  readonly quickLayout = input<QuickLayout>('list');
  readonly cardFieldTextColor = input<string>(REPORT_COLOR_TEXT_PRIMARY);
  readonly cardFieldFontSize = input<number>(13);
  readonly filters = input<ReportBuilderFilterRule[]>([]);
  readonly sourceOptions = input<ReportBuilderSourceOption[]>([]);
  readonly currentSourceFormId = input<string>('');
  readonly initialDetailBlocks = input<ReportDetailTabBlock[]>([]);
  readonly initialDetailTabs = input<ReportDetailTab[]>([]);
  readonly detailLayoutMode = input<DetailLayout>('all-fields');
  readonly initialAllFieldsLayout = input<ReportAllFieldsLayout>({ fieldIds: [] });
  readonly initialBlockLayout = input<ReportBlockLayoutItem[]>([]);
  readonly initialTabLayout = input<ReportTabLayoutItem[]>([]);

  // ── Outputs (re-emitted from the child drawers) ────────────────────────────
  readonly closeAll = output<void>();
  readonly toggleColumn = output<string>();
  readonly reorderColumns = output<ReportBuilderColumn[]>();
  readonly filtersChange = output<ReportBuilderFilterRule[]>();
  readonly cardStyleChange = output<{ textColor: string; fontSize: number }>();
  readonly detailBlocksChange = output<ReportDetailTabBlock[]>();
  readonly detailTabsChange = output<ReportDetailTab[]>();
  readonly detailLayoutModeChange = output<DetailLayout>();
  readonly allFieldsLayoutChange = output<ReportAllFieldsLayout>();
  readonly blockLayoutChange = output<ReportBlockLayoutItem[]>();
  readonly tabLayoutChange = output<ReportTabLayoutItem[]>();

  /** True when any drawer is open — drives the shared click-away backdrop. */
  readonly showBackdrop = computed(
    () =>
      this.fieldConfigOpen() ||
      this.searchPanelOpen() ||
      this.bulkEditOpen() ||
      this.actionConfigOpen() ||
      this.detailLayoutConfigOpen() ||
      this.detailBlockLayoutConfigOpen()
  );

  /** Field-config drawer renders its card editor when the quick layout is "card". */
  readonly isCardLayoutMode = computed(() => this.quickLayout() === 'card');
}
