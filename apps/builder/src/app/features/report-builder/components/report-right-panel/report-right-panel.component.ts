import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, inject } from '@angular/core';
import { QoButtonComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import {
  ReportBuilderAsset,
  ReportBuilderColumn,
  ReportBuilderSourceOption,
} from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportQuickViewLayoutComponent } from '@builder/features/report-builder/components/report-right-panel/quick-view/layout/layout.component';
import { ReportQuickViewActionsComponent } from '@builder/features/report-builder/components/report-right-panel/quick-view/actions/actions.component';
import { ReportDetailViewLayoutComponent } from '@builder/features/report-builder/components/report-right-panel/detail-view/layout/layout.component';
import { ReportDetailViewActionsComponent } from '@builder/features/report-builder/components/report-right-panel/detail-view/actions/actions.component';
import {
  DetailLayout,
  QuickLayout,
  ReportQuickViewCustomLayout,
  ReportActionGroup,
  ReportConfigMode,
  ReportConfigTab,
  ReportJoin,
  ReportJoinType,
  PreviewRecord,
} from '@builder/features/report-builder/models/report-builder.models';


/**
 * Container for the report builder's right configuration panel. Hosts the
 * Quick View and Detail View tabs (layout + actions sub-panels) and the data
 * joins editor, holding only a local `joinsDraft` until the user applies it.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-right-panel',
  standalone: true,
  imports: [QoButtonComponent,
    QoSelectComponent,
    ReportQuickViewLayoutComponent,
    ReportQuickViewActionsComponent,
    ReportDetailViewLayoutComponent,
    ReportDetailViewActionsComponent,
  ],
  templateUrl: './report-right-panel.component.html',
  styleUrl: './report-right-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportRightPanelComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly savedCustomLayouts = input<
    Array<{ id: string; name: string; elementsCount: number; active: boolean; config: ReportQuickViewCustomLayout }>
  >([]);
  readonly savedDetailCustomLayouts = input<Array<{ id: string; name: string; active: boolean }>>([]);
  readonly report = input.required<ReportBuilderAsset>();
  readonly visibleCount = input<number>(0);
  readonly visibleColumns = input<ReportBuilderColumn[]>([]);
  readonly activePreviewRecord = input<PreviewRecord | null>(null);
  readonly showRecordDetails = input<boolean>(false);
  readonly pageSize = input<string>('20');
  readonly sourceOptions = input<ReportBuilderSourceOption[]>([]);
  readonly quickActionGroups = input<ReportActionGroup[]>([]);
  readonly detailActionGroups = input<ReportActionGroup[]>([]);
  readonly reportConfigTab = input.required<ReportConfigTab>();
  readonly reportConfigMode = input.required<ReportConfigMode>();
  readonly quickLayout = input.required<QuickLayout>();
  readonly detailLayout = input.required<DetailLayout>();
  readonly createNewLayoutOpen = input<boolean>(false);

  readonly setTab = output<ReportConfigTab>();
  readonly setMode = output<ReportConfigMode>();
  readonly setQuickLayout = output<QuickLayout>();
  readonly setDetailLayout = output<DetailLayout>();
  readonly setPageSize = output<string>();
  readonly openFieldConfig = output<void>();
  readonly openCustomLayout = output<void>();
  readonly openCustomLayoutTemplate = output<void>();
  readonly openCustomLayoutListTemplate = output<void>();
  readonly openCreateNewLayout = output<void>();
  readonly openDetailCreateNewLayout = output<void>();
  readonly openActionConfig = output<void>();
  readonly openDetailLayoutConfig = output<void>();
  readonly openDetailBlockLayoutConfig = output<void>();
  readonly activateSavedDetailLayout = output<string>();
  readonly deactivateSavedDetailLayout = output<string>();
  readonly editSavedDetailLayout = output<string>();
  readonly duplicateSavedDetailLayout = output<string>();
  readonly deleteSavedDetailLayout = output<string>();
  readonly editSavedLayout = output<string>();
  readonly duplicateSavedLayout = output<string>();
  readonly deleteSavedLayout = output<string>();
  readonly activateSavedLayout = output<string>();
  readonly quickActionGroupsChange = output<ReportActionGroup[]>();
  readonly setRecordClickAction = output<'View Record' | 'Do Nothing'>();
  readonly detailActionGroupsChange = output<ReportActionGroup[]>();
  readonly joinsChange = output<ReportJoin[]>();
  readonly joinsDraft = signal<ReportJoin[]>([]);
  readonly pageSizeOptions: SelectOption[] = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
  ];

  // ── Which config sub-panel is visible (tab × mode) ──────────────────────────
  readonly showQuickActionsConfig = computed(
    () =>
      this.reportConfigTab() === 'quick' && this.reportConfigMode() === 'actions'
  );

  readonly showQuickLayoutConfig = computed(
    () =>
      this.reportConfigTab() === 'quick' && this.reportConfigMode() === 'layout'
  );

  readonly showDetailLayoutConfig = computed(
    () =>
      this.reportConfigTab() === 'detail' && this.reportConfigMode() === 'layout'
  );

  readonly showDetailActionsConfig = computed(
    () =>
      this.reportConfigTab() === 'detail' && this.reportConfigMode() === 'actions'
  );

  readonly showLayoutSummary = computed(
    () => this.reportConfigMode() === 'layout'
  );

  constructor() {
    // Seed the joins draft from the report whenever it changes.
    effect(
      () => {
        this.joinsDraft.set(
          this.report().joins.map((join) => ({
            ...join,
            on: { ...join.on },
          }))
        );
      },
      { allowSignalWrites: true }
    );
  }

  readonly joinTypeOptions: Array<{ label: string; value: ReportJoinType }> = [
    { label: this.i18n.t('options.inner'), value: 'inner' },
    { label: this.i18n.t('options.left'), value: 'left' },
    { label: this.i18n.t('options.right'), value: 'right' },
    { label: this.i18n.t('options.lookup'), value: 'lookup' },
  ];

  /** Source forms (excluding the primary) that can be joined. */
  readonly joinedFormOptions = computed<SelectOption[]>(() =>
    this.sourceOptions()
      .filter((option) => option.id !== this.report().sourceFormId)
      .map((option) => ({ label: option.name, value: option.id }))
  );

  /** Columns of the primary source form, as join-key options. */
  readonly sourceFieldOptions = computed<SelectOption[]>(() => {
    const primary = this.sourceOptions().find((option) => option.id === this.report().sourceFormId);
    if (!primary) {
      return [];
    }
    return primary.columns.map((column) => ({ label: column.label, value: column.id }));
  });

  /** Columns of a target (joined) form, as join-key options. */
  getTargetFieldOptions(targetFormId: string): SelectOption[] {
    const target = this.sourceOptions().find((option) => option.id === targetFormId);
    if (!target) {
      return [];
    }
    return target.columns.map((column) => ({ label: column.label, value: column.id }));
  }

  /** Adds a default inner join using the first available form/fields. */
  addJoin(): void {
    const targetFormId = this.joinedFormOptions()[0]?.value as string | undefined;
    const sourceField = this.sourceFieldOptions()[0]?.value as string | undefined;
    const targetField =
      (targetFormId ? this.getTargetFieldOptions(targetFormId)[0]?.value : undefined) as string | undefined;

    if (!targetFormId || !sourceField || !targetField) {
      return;
    }

    this.joinsDraft.set([
      ...this.joinsDraft(),
      {
        sourceFormId: this.report().sourceFormId,
        targetFormId,
        joinType: 'inner',
        on: {
          sourceField,
          targetField,
        },
      },
    ]);
  }

  /** Removes the join at the given index. */
  removeJoin(index: number): void {
    const next = this.joinsDraft().filter((_, joinIndex) => joinIndex !== index);
    this.joinsDraft.set(next);
  }

  /** Changes a join's target form and resets its target field. */
  updateJoinTargetForm(index: number, value: unknown): void {
    const targetFormId = typeof value === 'string' ? value : '';
    if (!targetFormId) {
      return;
    }

    const targetField = this.getTargetFieldOptions(targetFormId)[0]?.value as string | undefined;
    if (!targetField) {
      return;
    }

    this.joinsDraft.set(
      this.joinsDraft().map((join, joinIndex) =>
        joinIndex === index
          ? {
              ...join,
              targetFormId,
              on: {
                ...join.on,
                targetField,
              },
            }
          : join
      )
    );
  }

  /** Sets a join's type (inner/left/right/lookup). */
  setJoinType(index: number, joinType: ReportJoinType): void {
    this.joinsDraft.set(
      this.joinsDraft().map((join, joinIndex) =>
        joinIndex === index ? { ...join, joinType } : join
      )
    );
  }

  /** Sets a join's source (primary) field key. */
  updateJoinSourceField(index: number, value: unknown): void {
    const sourceField = typeof value === 'string' ? value : '';
    if (!sourceField) {
      return;
    }
    this.joinsDraft.set(
      this.joinsDraft().map((join, joinIndex) =>
        joinIndex === index
          ? {
              ...join,
              on: {
                ...join.on,
                sourceField,
              },
            }
          : join
      )
    );
  }

  /** Sets a join's target (joined) field key. */
  updateJoinTargetField(index: number, value: unknown): void {
    const targetField = typeof value === 'string' ? value : '';
    if (!targetField) {
      return;
    }
    this.joinsDraft.set(
      this.joinsDraft().map((join, joinIndex) =>
        joinIndex === index
          ? {
              ...join,
              on: {
                ...join.on,
                targetField,
              },
            }
          : join
      )
    );
  }

  /** Emits the current joins draft upward (deep-cloned). */
  applyJoins(): void {
    this.joinsChange.emit(
      this.joinsDraft().map((join) => ({
        ...join,
        on: { ...join.on },
      }))
    );
  }

  /** Human-readable explanation of a join type's semantics. */
  getJoinDescription(joinType: ReportJoinType, sourceField: string): string {
    if (joinType === 'inner') {
      return `Inner join - only rows where both forms share ${sourceField}.`;
    }
    if (joinType === 'left') {
      return `Left join - all primary rows, with null values when no joined match exists.`;
    }
    if (joinType === 'right') {
      return `Right join - all joined rows, with null values when no primary match exists.`;
    }
    return `Lookup - enriches each primary row with one value from the joined form.`;
  }

  /** Emits the chosen preview page size. */
  onPageSizeChange(value: unknown): void {
    this.setPageSize.emit(typeof value === 'string' ? value : this.pageSize());
  }
}
