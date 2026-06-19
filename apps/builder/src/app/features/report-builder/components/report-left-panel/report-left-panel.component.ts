import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import {
  ReportBuilderAsset,
  ReportBuilderColumn,
  ReportBuilderFilterRule,
  ReportSortCriterion,
  ReportBuilderSourceOption,
} from '@builder/features/report-builder/facades/report-builder.facade';


import { ReportLeftDataSourceComponent } from '@builder/features/report-builder/components/report-left-panel/data-source/data-source.component';
import { ReportLeftFiltersComponent } from '@builder/features/report-builder/components/report-left-panel/filters/filters.component';
import { ReportLeftGroupingComponent } from '@builder/features/report-builder/components/report-left-panel/grouping/grouping.component';
import { ReportLeftSortByComponent } from '@builder/features/report-builder/components/report-left-panel/sort-by/sort-by.component';

/**
 * Container for the report builder's left configuration panel. Composes the
 * Data Source, Filters, Grouping, and Sort-by sub-panels, projecting slices of
 * the selected report down to them and bubbling their changes up as outputs.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-left-panel',
  standalone: true,
  imports: [
    ReportLeftDataSourceComponent,
    ReportLeftFiltersComponent,
    ReportLeftGroupingComponent,
    ReportLeftSortByComponent,
  ],
  templateUrl: './report-left-panel.component.html',
  styleUrl: './report-left-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportLeftPanelComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly report = input.required<ReportBuilderAsset>();
  readonly allColumns = input.required<ReportBuilderColumn[]>();
  readonly sourceOptions = input<ReportBuilderSourceOption[]>([]);

  readonly updateSettings = output<{ key: string; value: string | boolean | ReportSortCriterion[] }>();
  readonly sourceFormChange = output<string>();
  readonly queryRefChange = output<string>();
  readonly applyFilters = output<ReportBuilderFilterRule[]>();
  readonly clearFilters = output<void>();

  // ── Derived slices of the selected report for the sub-panels ────────────────
  readonly sourceFormId = computed(() => this.report().sourceFormId);
  readonly sourceFormLabel = computed(() => this.report().sourceFormLabel);
  readonly queryRefId = computed(() => this.report().queryRefId ?? '');
  readonly datasourceLabel = computed(() => this.report().datasourceLabel);
  readonly tableLabel = computed(() => this.report().tableLabel);
  readonly filterPresets = computed(() => this.report().filterPresets);
  readonly filterRules = computed(() => this.report().filterRules);
  readonly groupBy = computed(() => this.report().settings.groupBy);
  readonly groupOrder = computed(() => this.report().settings.groupOrder);
  readonly showRecordCount = computed(() => this.report().settings.showRecordCount);
  readonly sortCriteria = computed(() => this.report().settings.sortCriteria ?? []);

  /** Static list of selectable source forms shown in the data-source picker. */
  readonly formOptions = computed<ReportBuilderSourceOption[]>(() => [
    {
      id: 'employees_form',
      name: 'employees_form',
      datasourceLabel: '',
      tableLabel: '',
      columns: [],
    },
    {
      id: 'attendance_form',
      name: 'attendance_form',
      datasourceLabel: '',
      tableLabel: '',
      columns: [],
    },
    {
      id: 'leave_form',
      name: 'leave_form',
      datasourceLabel: '',
      tableLabel: '',
      columns: [],
    },
  ]);

  /** Emits a settings update for the group-by field. */
  onGroupByChange(value: string): void {
    this.updateSettings.emit({ key: 'groupBy', value });
  }

  /** Emits a settings update for the group ordering. */
  onGroupOrderChange(value: 'none' | 'asc' | 'desc'): void {
    this.updateSettings.emit({ key: 'groupOrder', value });
  }

  /** Emits a settings update for the show-record-count toggle. */
  onShowRecordCountChange(value: boolean): void {
    this.updateSettings.emit({ key: 'showRecordCount', value });
  }

  /** Emits a settings update for the sort criteria. */
  onSortCriteriaChange(value: ReportSortCriterion[]): void {
    this.updateSettings.emit({ key: 'sortCriteria', value });
  }
}
