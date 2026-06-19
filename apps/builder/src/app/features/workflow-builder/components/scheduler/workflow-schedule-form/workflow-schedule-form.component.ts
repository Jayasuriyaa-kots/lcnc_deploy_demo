import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Form, FormField } from '@qo/models';
import {
  QoButtonComponent,
  QoIconComponent,
  QoInputComponent,
  QoSelectComponent,
  SelectOption,
} from '@qo/ui-components';
import { WorkflowNextRunsPreviewComponent } from '../workflow-next-runs-preview';
import { WorkflowBuilderI18nService } from '../../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

export type ScheduleConditionConnector = 'AND' | 'OR';
export type ScheduleMode = 'specific' | 'dateField';

@Component({
  selector: 'app-workflow-schedule-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    TranslocoPipe,
    ReactiveFormsModule,
    QoButtonComponent,
    QoIconComponent,
    QoInputComponent,
    QoSelectComponent,
    WorkflowNextRunsPreviewComponent,
  ],
  templateUrl: './workflow-schedule-form.component.html',
  styleUrl: './workflow-schedule-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowScheduleFormComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  private readonly i18n = inject(WorkflowBuilderI18nService);
  form = input.required<FormGroup>();
  forms = input<Form[]>([]);
  timezones = input<string[]>([]);
  nextRuns = input<string[]>([]);
  saving = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  scheduleMode = input<ScheduleMode>('specific');
  processMode = input<'always' | 'condition'>('always');

  close = output<void>();
  save = output<void>();
  scheduleModeChange = output<ScheduleMode>();
  processModeChange = output<'always' | 'condition'>();
  formChange = output<string>();
  addCondition = output<ScheduleConditionConnector>();
  removeCondition = output<number>();
  readonly showAddConnector = signal(false);

  readonly scheduleModeOptions: SelectOption[] = [
    { label: this.lang.modals.scheduleWorkflow.specifyDateTab, value: 'specific' },
    { label: this.lang.modals.scheduleWorkflow.dateFieldTab, value: 'dateField' },
  ];
  readonly repeatOptions: SelectOption[] = [
    { label: this.lang.options.repeat.once, value: 'once' },
    { label: this.lang.options.repeat.daily, value: 'daily' },
    { label: this.lang.options.repeat.weekly, value: 'weekly' },
    { label: this.lang.options.repeat.monthly, value: 'monthly' },
  ];
  readonly executeOptions: SelectOption[] = [
    { label: this.lang.options.executeWorkflow.onDate, value: 'on_date' },
    { label: this.lang.options.executeWorkflow.beforeDate, value: 'before_date' },
    { label: this.lang.options.executeWorkflow.afterDate, value: 'after_date' },
  ];
  readonly offsetUnitOptions: SelectOption[] = [
    { label: this.lang.options.offsetUnit.minutes, value: 'minutes' },
    { label: this.lang.options.offsetUnit.hours, value: 'hours' },
    { label: this.lang.options.offsetUnit.days, value: 'days' },
    { label: this.lang.options.offsetUnit.weeks, value: 'weeks' },
  ];
  readonly operatorOptions: SelectOption[] = [
    { label: this.lang.options.ruleOperator.equals, value: 'equals' },
    { label: this.lang.options.ruleOperator.notEquals, value: 'not_equals' },
    { label: this.lang.options.ruleOperator.contains, value: 'contains' },
    { label: this.lang.options.ruleOperator.isEmpty, value: 'empty' },
  ];
  readonly valueOptions: SelectOption[] = [
    { label: this.lang.options.leaveType.sick, value: 'Sick' },
    { label: this.lang.options.leaveType.casual, value: 'Casual' },
    { label: this.lang.options.leaveType.paid, value: 'Paid' },
  ];

  readonly formOptions = computed<SelectOption[]>(() =>
    this.forms().map((form) => ({
      label: form.name,
      value: form.id,
    }))
  );
  dateFieldOptions(): SelectOption[] {
    return this.selectedFormFields()
      .filter((field) => field.type === 'date')
      .map((field) => ({
        label: field.label,
        value: field.id,
      }));
  }

  fieldOptions(): SelectOption[] {
    return this.selectedFormFields().map((field) => ({
      label: field.label,
      value: field.id,
    }));
  }
  readonly timezoneOptions = computed<SelectOption[]>(() =>
    this.timezones().map((timezone) => ({
      label: timezone,
      value: timezone,
    }))
  );

  conditionRows(): FormArray {
    return this.form().get('conditions') as FormArray;
  }

  conditionRow(index: number): FormGroup {
    return this.conditionRows().at(index) as FormGroup;
  }

  conditionConnector(index: number): ScheduleConditionConnector {
    const value = this.conditionRow(index).get('connector')?.value;
    return value === 'OR' ? 'OR' : 'AND';
  }

  isLastCondition(index: number): boolean {
    return index === this.conditionRows().length - 1;
  }

  onScheduleModeChange(value: SelectOption['value']): void {
    this.scheduleModeChange.emit(value === 'dateField' ? 'dateField' : 'specific');
  }

  onFormChange(value: SelectOption['value']): void {
    this.formChange.emit(String(value ?? ''));
  }

  onProcessModeChange(mode: 'always' | 'condition'): void {
    this.showAddConnector.set(false);
    this.processModeChange.emit(mode);
  }

  onAddNewClick(): void {
    this.showAddConnector.set(true);
  }

  onAddConnectorSelected(value: SelectOption['value']): void {
    this.showAddConnector.set(false);
    this.addCondition.emit(value === 'OR' ? 'OR' : 'AND');
  }

  showOffsetControls(): boolean {
    const executionMode = this.form().get('executeWorkflow')?.value;
    return executionMode === 'before_date' || executionMode === 'after_date';
  }

  canSubmit(): boolean {
    return !this.saving() && this.requiredFieldsComplete() && this.form().valid;
  }

  fieldError(controlName: string, label: string): string | undefined {
    const control = this.form().get(controlName);

    if (!control || !(control.touched || control.dirty)) {
      return undefined;
    }

    if (control.invalid || !this.requiredControlComplete(controlName)) {
      return this.i18n.scope('validation.required', { label });
    }

    return undefined;
  }

  validationSummary(): string | undefined {
    if (this.canSubmit() || !this.form().touched) {
      return undefined;
    }

    return this.i18n.scope('validation.scheduleRequiredFields');
  }

  private selectedFormFields(): FormField[] {
    const formId = this.form().get('formId')?.value;
    return this.forms().find((form) => form.id === formId)?.fields ?? [];
  }

  private requiredFieldsComplete(): boolean {
    const requiredFields =
      this.scheduleMode() === 'dateField'
        ? ['formId', 'dateFieldId', 'time', 'repeat', 'workflowName']
        : ['startDate', 'time', 'repeat', 'workflowName'];

    return requiredFields.every((field) => this.requiredControlComplete(field));
  }

  private requiredControlComplete(controlName: string): boolean {
    const value = this.form().get(controlName)?.value;
    return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined && value !== '';
  }
}
