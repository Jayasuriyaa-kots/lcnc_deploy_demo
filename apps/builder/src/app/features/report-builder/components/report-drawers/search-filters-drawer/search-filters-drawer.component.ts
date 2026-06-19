import { ChangeDetectionStrategy, Component, computed, effect, input, output, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ReportBuilderColumn,
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
import { QoButtonComponent, QoIconComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


type RangeValueFormGroup = FormGroup<{
  start: FormControl<string>;
  end: FormControl<string>;
}>;

type FilterRuleFormGroup = FormGroup<{
  id: FormControl<string>;
  columnId: FormControl<string>;
  operator: FormControl<string>;
  singleValue: FormControl<string>;
  rangeValue: RangeValueFormGroup;
}>;

/**
 * Search/filters drawer. Owns a reactive `FormArray` of filter rules, keeps it in
 * sync with the incoming `filters` input, and emits normalised rules upward.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-search-filters-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, QoButtonComponent, QoIconComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './search-filters-drawer.component.html',
  styleUrl: '../report-drawers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFiltersDrawerComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  /** Exposed for templates that need to coerce a `valueChange` payload to string. */
  protected readonly String = String;

  /** All report columns — used to validate rules and build the field dropdown. */
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  /** Current persisted filter rules; mirrored into the form on change. */
  readonly filters = input<ReportBuilderFilterRule[]>([]);

  /** Request to close all drawers. */
  readonly closeAll = output<void>();
  /** Emits the current rule set whenever it changes. */
  readonly filtersChange = output<ReportBuilderFilterRule[]>();

  readonly filtersForm = new FormGroup({
    rules: new FormArray<FilterRuleFormGroup>([]),
  });

  /** Field dropdown options for every column. */
  readonly allColumnOptions = computed<SelectOption[]>(() =>
    this.allColumns().map((column) => ({ value: column.id, label: column.label }))
  );

  constructor() {
    // Mirror the persisted filters into the reactive form whenever they change.
    effect(
      () => {
        const normalizedRules = this.normalizeRules(this.filters());
        this.replaceRules(normalizedRules);
      },
      { allowSignalWrites: true }
    );
  }

  /** Convenience accessor for the rules `FormArray`. */
  get rulesArray(): FormArray<FilterRuleFormGroup> {
    return this.filtersForm.controls.rules;
  }

  /** Convenience accessor for the rule form groups. */
  get ruleControls(): FilterRuleFormGroup[] {
    return this.rulesArray.controls;
  }

  /** `track` fn keyed by rule id for the `@for` loop. */
  trackRule(_index: number, ruleGroup: FilterRuleFormGroup): string {
    return ruleGroup.controls.id.value;
  }

  /** Appends a new empty filter rule and emits the change. */
  addFilter(): void {
    this.rulesArray.push(this.createRuleGroup(this.createRule()));
    this.emitFiltersChange();
  }

  /** Removes a rule; keeps at least one empty rule present. */
  removeFilter(index: number): void {
    this.rulesArray.removeAt(index);
    if (this.rulesArray.length === 0) {
      this.rulesArray.push(this.createRuleGroup(this.createRule()));
    }
    this.emitFiltersChange();
  }

  /** Resets to a single empty rule and emits the change. */
  clearFilters(): void {
    this.replaceRules([this.createRule()]);
    this.emitFiltersChange();
  }

  /** Field changed for a rule — resets operator/value to valid defaults. */
  onColumnChange(index: number, columnId: string): void {
    const ruleGroup = this.ruleControls[index];
    if (!ruleGroup) {
      return;
    }
    ruleGroup.controls.columnId.setValue(columnId);
    const firstOperator = this.getConditionOptions(columnId)[0]?.value ?? 'is';
    ruleGroup.controls.operator.setValue(firstOperator);
    this.resetValueControls(ruleGroup, firstOperator);
    this.emitFiltersChange();
  }

  /** Operator changed for a rule — resets the value control(s) accordingly. */
  onOperatorChange(index: number, operator: string): void {
    const ruleGroup = this.ruleControls[index];
    if (!ruleGroup) {
      return;
    }
    ruleGroup.controls.operator.setValue(operator);
    this.resetValueControls(ruleGroup, operator);
    this.emitFiltersChange();
  }

  /** Value (single or range) edited — emit the change. */
  onRuleValueChange(): void {
    this.emitFiltersChange();
  }

  /** Operator options valid for a column's field type. */
  getConditionOptions(columnId: string): ReportFilterOperatorOption[] {
    return getReportFilterOperators(this.getFieldType(columnId));
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

  /** Input `type` (text/number/date…) appropriate for the rule's field. */
  getFilterInputType(index: number): string {
    const columnId = this.ruleControls[index]?.controls.columnId.value ?? '';
    return getFilterInputTypeByFieldType(this.getFieldType(columnId));
  }

  /** Placeholder text for a single-value input. */
  getFilterValuePlaceholderText(index: number): string {
    const operator = this.ruleControls[index]?.controls.operator.value ?? '';
    return getFilterValuePlaceholder(operator);
  }

  /** Placeholder text for one side of a range input. */
  getFilterRangePlaceholderText(index: number, side: 'start' | 'end'): string {
    const columnId = this.ruleControls[index]?.controls.columnId.value ?? '';
    return getFilterRangePlaceholder(this.getFieldType(columnId), side);
  }

  /** Replaces all rule controls with form groups built from the given rules. */
  private replaceRules(rules: ReportBuilderFilterRule[]): void {
    this.rulesArray.clear();
    for (const rule of rules) {
      this.rulesArray.push(this.createRuleGroup(rule));
    }
  }

  /** Builds a typed form group for a single rule (single value or range). */
  private createRuleGroup(rule: ReportBuilderFilterRule): FilterRuleFormGroup {
    const isBetween = isBetweenFilterOperator(rule.operator);
    const singleValue = typeof rule.value === 'string' ? rule.value : '';
    const rangeStart =
      rule.value && typeof rule.value === 'object' && !Array.isArray(rule.value)
        ? String(rule.value.start ?? '')
        : '';
    const rangeEnd =
      rule.value && typeof rule.value === 'object' && !Array.isArray(rule.value)
        ? String(rule.value.end ?? '')
        : '';

    return new FormGroup({
      id: new FormControl(rule.id, { nonNullable: true }),
      columnId: new FormControl(rule.columnId, { nonNullable: true }),
      operator: new FormControl(rule.operator, { nonNullable: true }),
      singleValue: new FormControl(isBetween ? '' : singleValue, { nonNullable: true }),
      rangeValue: new FormGroup({
        start: new FormControl(isBetween ? rangeStart : '', { nonNullable: true }),
        end: new FormControl(isBetween ? rangeEnd : '', { nonNullable: true }),
      }),
    });
  }

  /** Clears the value controls appropriate to the (new) operator. */
  private resetValueControls(ruleGroup: FilterRuleFormGroup, operator: string): void {
    ruleGroup.controls.singleValue.setValue('');
    ruleGroup.controls.rangeValue.controls.start.setValue('');
    ruleGroup.controls.rangeValue.controls.end.setValue('');

    if (!filterOperatorNeedsValue(operator)) {
      return;
    }
    if (isBetweenFilterOperator(operator)) {
      ruleGroup.controls.rangeValue.controls.start.setValue('');
      ruleGroup.controls.rangeValue.controls.end.setValue('');
      return;
    }
    ruleGroup.controls.singleValue.setValue('');
  }

  /** Emits the current form state mapped back to rule models. */
  private emitFiltersChange(): void {
    this.filtersChange.emit(this.mapFormToRules());
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

  /** Drops rules referencing unknown columns and repairs invalid operators/values. */
  private normalizeRules(rules: ReportBuilderFilterRule[]): ReportBuilderFilterRule[] {
    const validColumnIds = new Set(this.allColumns().map((column) => column.id));

    const usableRules = rules
      .filter((rule) => validColumnIds.has(rule.columnId))
      .map((rule) => {
        const options = this.getConditionOptions(rule.columnId);
        const operator = options.some((option) => option.value === rule.operator)
          ? rule.operator
          : (options[0]?.value ?? 'is');

        const normalized: ReportBuilderFilterRule = { ...rule, operator, value: rule.value };

        if (!filterOperatorNeedsValue(operator)) {
          normalized.value = '';
        } else if (isBetweenFilterOperator(operator)) {
          if (!normalized.value || typeof normalized.value !== 'object' || Array.isArray(normalized.value)) {
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
    return [column.fieldType, column.format, column.label].filter((part) => !!part).join(' ');
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
}
