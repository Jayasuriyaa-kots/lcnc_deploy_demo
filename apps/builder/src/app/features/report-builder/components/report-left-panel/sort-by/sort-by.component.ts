import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, inject } from '@angular/core';
import { QoFormFieldComponent, QoButtonComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import {
  ReportBuilderColumn,
  ReportSortCriterion,
} from '@builder/features/report-builder/facades/report-builder.facade';


type SortOrder = 'asc' | 'desc';
type SortOrderDraft = SortOrder | '';
type SortCriterionDraft = { columnId: string; direction: SortOrderDraft };

/**
 * Sort-by sub-panel of the report builder's left panel. Manages a draft list of
 * sort rules (column + direction), prevents duplicate columns, and emits the
 * complete, valid criteria upward whenever they change.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-left-sort-by',
  standalone: true,
  imports: [QoFormFieldComponent, QoSelectComponent, QoButtonComponent],
  templateUrl: './sort-by.component.html',
  styleUrl: './sort-by.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportLeftSortByComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly sortCriteria = input<ReportSortCriterion[]>([]);
  readonly sortCriteriaChange = output<ReportSortCriterion[]>();

  private readonly localCriteria = signal<SortCriterionDraft[]>([]);
  private readonly syncedSource = signal<string>('');

  readonly sortOrderOptions: SelectOption[] = [
    { label: this.i18n.t('options.descending'), value: 'desc' },
    { label: this.i18n.t('options.ascending'), value: 'asc' },
  ];

  /** All columns as sort-field options. */
  readonly sortByOptions = computed<SelectOption[]>(() =>
    this.allColumns().map((column) => ({
      label: column.label,
      value: column.id,
    }))
  );

  /** The current draft sort criteria shown in the UI. */
  readonly criteria = computed(() => this.localCriteria());

  constructor() {
    // Re-seed the local draft when the incoming criteria change (by signature).
    effect(() => {
      const normalizedIncoming = this.normalizeCriteria(this.sortCriteria());
      const incomingSignature = JSON.stringify(normalizedIncoming);
      if (this.syncedSource() !== incomingSignature) {
        this.localCriteria.set(
          normalizedIncoming.length > 0
            ? normalizedIncoming
            : [{ columnId: '', direction: '' }]
        );
        this.syncedSource.set(incomingSignature);
      }
    });
  }

  /** Appends an empty sort rule (if a column is still available). */
  addSortRule(): void {
    if (!this.canAddRule()) {
      return;
    }

    const next = [...this.localCriteria(), { columnId: '', direction: '' as const }];
    this.setCriteria(next);
  }

  /** Removes the sort rule at the given index. */
  removeSortRule(index: number): void {
    const next = this.localCriteria().filter((_, itemIndex) => itemIndex !== index);
    this.setCriteria(next);
  }

  /** Updates the column of the sort rule at `index`. */
  updateSortColumn(index: number, columnId: string): void {
    const next = this.localCriteria().map((item, itemIndex) =>
      itemIndex === index ? { ...item, columnId } : item
    );
    this.setCriteria(next);
  }

  /** Updates the direction of the sort rule at `index`. */
  updateSortDirection(index: number, direction: SortOrderDraft): void {
    const next = this.localCriteria().map((item, itemIndex) =>
      itemIndex === index ? { ...item, direction } : item
    );
    this.setCriteria(next);
  }

  /** Template adapter — coerces a select payload before updating direction. */
  onSortDirectionValueChange(index: number, value: unknown): void {
    const direction = String(value ?? '') as SortOrderDraft;
    this.updateSortDirection(index, direction);
  }

  /** Column options for a rule, excluding columns already used by other rules. */
  getSortByOptionsForIndex(index: number): SelectOption[] {
    const usedByOthers = new Set(
      this.localCriteria()
        .filter((_, itemIndex) => itemIndex !== index)
      .map((item) => item.columnId)
      .filter((columnId) => !!columnId)
    );

    return this.sortByOptions().filter((option) => {
      const value = String(option.value ?? '');
      const current = this.localCriteria()[index]?.columnId ?? '';
      return value === current || !usedByOthers.has(value);
    });
  }

  /** Whether another sort rule can be added (a column is still free). */
  canAddRule(): boolean {
    const used = new Set(
      this.localCriteria()
        .map((item) => item.columnId)
        .filter((columnId) => !!columnId)
    );
    return used.size < this.allColumns().length;
  }

  /** Normalises + stores the draft criteria and emits the valid subset upward. */
  private setCriteria(next: SortCriterionDraft[]): void {
    const normalized = this.normalizeCriteria(next);
    this.localCriteria.set(normalized);
    this.syncedSource.set(JSON.stringify(this.normalizeCriteria(this.sortCriteria())));
    this.sortCriteriaChange.emit(
      normalized
        .filter((criterion) => !!criterion.columnId && (criterion.direction === 'asc' || criterion.direction === 'desc'))
        .map((criterion) => ({ columnId: criterion.columnId, direction: criterion.direction as SortOrder }))
    );
  }

  /** Coerces criteria to drafts and drops duplicate columns (keeps blanks). */
  private normalizeCriteria(criteria: Array<ReportSortCriterion | SortCriterionDraft>): SortCriterionDraft[] {
    const seen = new Set<string>();
    return criteria
      .map((criterion) => ({
        columnId: String(criterion?.columnId ?? ''),
        direction:
          criterion?.direction === 'asc' || criterion?.direction === 'desc'
            ? criterion.direction
            : '' as SortOrderDraft,
      }))
      .filter((criterion) => {
        if (!criterion.columnId) {
          return true;
        }
        if (seen.has(criterion.columnId)) {
          return false;
        }
        seen.add(criterion.columnId);
        return true;
      });
  }
}
