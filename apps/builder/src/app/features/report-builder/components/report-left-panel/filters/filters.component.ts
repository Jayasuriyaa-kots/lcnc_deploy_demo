import { ChangeDetectionStrategy, Component, effect, input, output, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { QoFormFieldComponent, QoIconComponent, QoButtonComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import {
  ReportBuilderColumn,
  ReportBuilderFilterPreset,
  ReportBuilderFilterRule,
} from '@builder/features/report-builder/facades/report-builder.facade';
import {
  ReportFilterOperatorOption,
  filterOperatorNeedsValue,
  getFilterInputTypeByFieldType,
  getFilterRangePlaceholder,
  getFilterValuePlaceholder,
  getReportFilterOperators,
  isBetweenFilterOperator,
} from '@builder/features/report-builder/utils/report-filter-rules.util';


type FilterRangeGroup = FormGroup<{
  start: FormControl<string>;
  end: FormControl<string>;
}>;

type FilterRuleGroup = FormGroup<{
  id: FormControl<string>;
  columnId: FormControl<string>;
  operator: FormControl<string>;
  singleValue: FormControl<string>;
  rangeValue: FilterRangeGroup;
}>;

/**
 * Filters sub-panel of the report builder's left panel. Maintains a reactive
 * `FormArray` of filter rules kept in sync with the `filters` input, and emits
 * the live rule set on every change (live-apply).
 *
 * UX §13.6 deviation (accepted): the spec describes a `qo-multi-select` field
 * picker producing per-field chips. This panel instead uses a one-rule-per-field
 * model — each rule targets a single column via `qo-select`, with its own
 * operator and value. A multi-select would not fit the single-`columnId` rule
 * shape, so single-value `qo-select` is intentional here.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-left-filters',
  standalone: true,
  imports: [QoFormFieldComponent, QoIconComponent, ReactiveFormsModule, QoButtonComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportLeftFiltersComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  private isSyncingRules = false;
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly filterPresets = input<ReportBuilderFilterPreset[]>([]);
  readonly filters = input<ReportBuilderFilterRule[]>([]);

  readonly apply = output<ReportBuilderFilterRule[]>();
  readonly clear = output<void>();

  readonly filtersForm = new FormGroup({
    rules: new FormArray<FilterRuleGroup>([]),
  });

  /** Reactive form value as a signal (replaces a component-level subscribe). */
  private readonly formValue = toSignal(this.filtersForm.valueChanges);

  constructor() {
    // Mirror persisted filters into the form (guarded against re-emit loops).
    effect(
      () => {
        const normalizedRules = this.normalizeRules(this.filters());
        this.replaceRules(normalizedRules);
      },
      { allowSignalWrites: true }
    );

    // Live-apply: emit the mapped rules whenever the user edits the form.
    effect(() => {
      const value = this.formValue();
      if (value === undefined || this.isSyncingRules) {
        return;
      }
      this.apply.emit(this.mapFormToRules());
    });
  }

  /** The rules `FormArray`. */
  get rulesArray(): FormArray<FilterRuleGroup> {
    return this.filtersForm.controls.rules;
  }

  /** The individual rule form groups. */
  get ruleControls(): FilterRuleGroup[] {
    return this.rulesArray.controls;
  }

  /** Appends a new default filter rule. */
  addFilter(): void {
    this.rulesArray.push(this.createRuleGroup(this.createRule()));
  }

  /** Removes a rule, keeping at least one empty rule present. */
  removeFilter(index: number): void {
    this.rulesArray.removeAt(index);

    if (this.rulesArray.length === 0) {
      this.rulesArray.push(this.createRuleGroup(this.createRule()));
    }
  }

  /** Field changed — resets the rule's operator and value to valid defaults. */
  onColumnChange(index: number, columnId: string): void {
    const ruleGroup = this.ruleControls[index];
    if (!ruleGroup) {
      return;
    }

    ruleGroup.controls.columnId.setValue(columnId);
    const firstOperator = this.getConditionOptions(columnId)[0]?.value ?? 'is';

    ruleGroup.controls.operator.setValue(firstOperator);
    this.resetValueControls(ruleGroup, firstOperator);
  }

  /** Operator changed — resets the rule's value control(s). */
  onOperatorChange(index: number, operator: string): void {
    const ruleGroup = this.ruleControls[index];
    if (!ruleGroup) {
      return;
    }

    ruleGroup.controls.operator.setValue(operator);
    this.resetValueControls(ruleGroup, operator);
  }

  /** Emits the current rules immediately. */
  applyFilters(): void {
    this.apply.emit(this.mapFormToRules());
  }

  /** Resets to a single empty rule and signals a clear. */
  clearFilters(): void {
    this.replaceRules([this.createRule()]);
    this.clear.emit();
  }

  /** Operator options valid for a column's field type. */
  getConditionOptions(columnId: string): ReportFilterOperatorOption[] {
    return getReportFilterOperators(this.getFieldType(columnId));
  }

  /** All columns as field select options. */
  getColumnOptions(): SelectOption[] {
    return this.allColumns().map((column) => ({
      label: column.label,
      value: column.id,
    }));
  }

  /** Operator options for a column as select options. */
  getConditionSelectOptions(columnId: string): SelectOption[] {
    return this.getConditionOptions(columnId).map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }

  /** Whether the rule's operator requires a value input. */
  filterNeedsValue(index: number): boolean {
    const operator = this.ruleControls[index]?.controls.operator.value ?? '';
    return filterOperatorNeedsValue(operator);
  }

  /** Whether the rule's operator is a "between" (range) operator. */
  isBetweenOperator(index: number): boolean {
    const operator = this.ruleControls[index]?.controls.operator.value ?? '';
    return isBetweenFilterOperator(operator);
  }

  /** Input `type` appropriate for a rule's field. */
  getFilterInputType(index: number): string {
    const columnId = this.ruleControls[index]?.controls.columnId.value ?? '';
    return getFilterInputTypeByFieldType(this.getFieldType(columnId));
  }

  /** Placeholder for a single-value input. */
  getFilterValuePlaceholderText(index: number): string {
    const operator = this.ruleControls[index]?.controls.operator.value ?? '';
    return getFilterValuePlaceholder(operator);
  }

  /** Placeholder for one side of a range input. */
  getFilterRangePlaceholderText(index: number, side: 'start' | 'end'): string {
    const columnId = this.ruleControls[index]?.controls.columnId.value ?? '';
    return getFilterRangePlaceholder(this.getFieldType(columnId), side);
  }

  /** Template adapter — coerces a select payload before changing the column. */
  onColumnSelectValueChange(index: number, value: unknown): void {
    this.onColumnChange(index, this.toStringValue(value));
  }

  /** Template adapter — coerces a select payload before changing the operator. */
  onOperatorSelectValueChange(index: number, value: unknown): void {
    this.onOperatorChange(index, this.toStringValue(value));
  }

  /** Rebuilds the form's rule groups from the given rules (sync-guarded). */
  private replaceRules(rules: ReportBuilderFilterRule[]): void {
    this.isSyncingRules = true;
    this.rulesArray.clear();

    for (const rule of rules) {
      this.rulesArray.push(this.createRuleGroup(rule));
    }
    this.isSyncingRules = false;
  }

  /** Builds a typed form group for a single rule (single value or range). */
  private createRuleGroup(rule: ReportBuilderFilterRule): FilterRuleGroup {
    const isBetween = isBetweenFilterOperator(rule.operator);

    const singleValue =
      typeof rule.value === 'string' ? rule.value : '';

    const rangeStart =
      rule.value &&
      typeof rule.value === 'object' &&
      !Array.isArray(rule.value)
        ? String(rule.value.start ?? '')
        : '';

    const rangeEnd =
      rule.value &&
      typeof rule.value === 'object' &&
      !Array.isArray(rule.value)
        ? String(rule.value.end ?? '')
        : '';

    return new FormGroup({
      id: new FormControl(rule.id, { nonNullable: true }),
      columnId: new FormControl(rule.columnId, { nonNullable: true }),
      operator: new FormControl(rule.operator, { nonNullable: true }),
      singleValue: new FormControl(isBetween ? '' : singleValue, {
        nonNullable: true,
      }),
      rangeValue: new FormGroup({
        start: new FormControl(isBetween ? rangeStart : '', {
          nonNullable: true,
        }),
        end: new FormControl(isBetween ? rangeEnd : '', {
          nonNullable: true,
        }),
      }),
    });
  }

  /** Clears a rule's value control(s) appropriate to the (new) operator. */
  private resetValueControls(ruleGroup: FilterRuleGroup, operator: string): void {
    ruleGroup.controls.singleValue.setValue('');
    ruleGroup.controls.rangeValue.controls.start.setValue('');
    ruleGroup.controls.rangeValue.controls.end.setValue('');

    if (!filterOperatorNeedsValue(operator)) {
      return;
    }

    if (isBetweenFilterOperator(operator)) {
      return;
    }

    ruleGroup.controls.singleValue.setValue('');
  }

  /** Maps the reactive form back to the rule model shape. */
  private mapFormToRules(): ReportBuilderFilterRule[] {
    return this.ruleControls.map((ruleGroup) => {
      const operator = ruleGroup.controls.operator.value;

      if (!filterOperatorNeedsValue(operator)) {
        return {
          id: ruleGroup.controls.id.value,
          columnId: ruleGroup.controls.columnId.value,
          operator,
          value: '',
        };
      }

      if (isBetweenFilterOperator(operator)) {
        return {
          id: ruleGroup.controls.id.value,
          columnId: ruleGroup.controls.columnId.value,
          operator,
          value: {
            start: ruleGroup.controls.rangeValue.controls.start.value,
            end: ruleGroup.controls.rangeValue.controls.end.value,
          },
        };
      }

      return {
        id: ruleGroup.controls.id.value,
        columnId: ruleGroup.controls.columnId.value,
        operator,
        value: ruleGroup.controls.singleValue.value,
      };
    });
  }

  /** Drops rules on unknown columns and repairs invalid operators/values. */
  private normalizeRules(rules: ReportBuilderFilterRule[]): ReportBuilderFilterRule[] {
    const validColumnIds = new Set(this.allColumns().map((column) => column.id));

    const usableRules = rules
      .filter((rule) => validColumnIds.has(rule.columnId))
      .map((rule) => {
        const options = this.getConditionOptions(rule.columnId);
        const operator = options.some((option) => option.value === rule.operator)
          ? rule.operator
          : (options[0]?.value ?? 'is');

        const normalized: ReportBuilderFilterRule = {
          ...rule,
          operator,
          value: rule.value,
        };

        if (!filterOperatorNeedsValue(operator)) {
          normalized.value = '';
        } else if (isBetweenFilterOperator(operator)) {
          if (
            !normalized.value ||
            typeof normalized.value !== 'object' ||
            Array.isArray(normalized.value)
          ) {
            normalized.value = { start: '', end: '' };
          }
        } else if (typeof normalized.value !== 'string') {
          normalized.value = '';
        }

        return normalized;
      });

    return usableRules.length > 0 ? usableRules : [this.createRule()];
  }

  /** Creates a default rule bound to the first column. */
  private createRule(): ReportBuilderFilterRule {
    const firstColumn = this.allColumns()[0];
    const firstColumnId = firstColumn?.id ?? '';
    const firstOperator = this.getConditionOptions(firstColumnId)[0]?.value ?? 'is';

    return {
      id: `fr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      columnId: firstColumnId,
      operator: firstOperator,
      value: this.getInitialValueForOperator(firstOperator),
    };
  }

  /** Builds a "type hint" string from a column's metadata for operator selection. */
  private getFieldType(columnId: string): string {
    const column = this.allColumns().find((item) => item.id === columnId);
    if (!column) {
      return '';
    }

    return [column.fieldType, column.format, column.label]
      .filter((part) => !!part)
      .join(' ');
  }

  /** Default value shape for a freshly-chosen operator. */
  private getInitialValueForOperator(operator: string): ReportBuilderFilterRule['value'] {
    if (!filterOperatorNeedsValue(operator)) {
      return '';
    }

    if (isBetweenFilterOperator(operator)) {
      return { start: '', end: '' };
    }

    return '';
  }

  /** Coerces an unknown select payload to a string. */
  private toStringValue(value: unknown): string {
    return typeof value === 'string' ? value : String(value ?? '');
  }
}
