import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Form, FormField } from '@qo/models';
import {
  FormBuilderAsset,
  FormBuilderFacadeService,
} from '@builder/features/form-builder/services/form-builder-facade.service';
import {
  QoConfirmDialogComponent,
  QoConfirmDialogConfig,
  QoConfirmDialogService,
  QoModalComponent,
  QoToastService,
  QoWorkflowPageHeaderComponent,
  QoWorkflowToolbarComponent,
} from '@qo/ui-components';
import {
  ScheduleConditionConnector,
  ScheduleMode,
  WorkflowScheduleFormComponent,
} from '../../components/scheduler/workflow-schedule-form';
import { WorkflowScheduleListComponent } from '../../components/scheduler/workflow-schedule-list';
import { WorkflowBuilderFacadeService } from '../../services/workflow-builder-facade.service';
import { WorkflowBuilderI18nService } from '../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';

@Component({
  selector: 'app-workflow-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    QoConfirmDialogComponent,
    QoModalComponent,
    QoWorkflowPageHeaderComponent,
    QoWorkflowToolbarComponent,
    WorkflowScheduleFormComponent,
    WorkflowScheduleListComponent,
  ],
  templateUrl: './workflow-scheduler.component.html',
  styleUrl: './workflow-scheduler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowSchedulerComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly formBuilderFacade = inject(FormBuilderFacadeService);
  private readonly router = inject(Router);
  private readonly toast = inject(QoToastService);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private readonly i18n = inject(WorkflowBuilderI18nService);

  readonly saving = signal(false);
  readonly scheduleModalOpen = signal(false);
  readonly scheduleMode = signal<ScheduleMode>('specific');
  readonly processMode = signal<'always' | 'condition'>('always');
  readonly editingScheduleId = signal<string | null>(null);
  readonly pendingDeleteScheduleId = signal<string | null>(null);
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  readonly activeForms = signal<Form[]>([]);

  readonly scheduleForm = this.formBuilder.nonNullable.group({
    scheduleMode: ['specific' as ScheduleMode, Validators.required],
    startDate: [this.lang.fallbacks.scheduler.defaultDate as string, Validators.required],
    time: [this.lang.fallbacks.scheduler.defaultTime as string, Validators.required],
    repeat: ['daily', Validators.required],
    workflowName: ['', Validators.required],
    timezone: [this.lang.fallbacks.scheduler.defaultTimezone as string, Validators.required],
    formId: [''],
    dateFieldId: [''],
    executeWorkflow: ['on_date'],
    offsetCount: ['0'],
    offsetUnit: ['days'],
    endMode: ['never'],
    endDate: [''],
    endAfterRuns: [''],
    processMode: ['always' as 'always' | 'condition'],
    nextConnector: ['AND' as ScheduleConditionConnector],
    conditions: this.formBuilder.array([this.createConditionGroup('AND')]),
  });
  readonly scheduleFormValue = toSignal(this.scheduleForm.valueChanges, { initialValue: this.scheduleForm.getRawValue() });

  readonly timezoneOptions = [this.lang.fallbacks.scheduler.defaultTimezone, 'UTC', 'America/New_York', 'Europe/London'];
  readonly nextRuns = computed(() => {
    this.scheduleFormValue();
    const time = this.scheduleForm.controls.time.value || this.lang.fallbacks.scheduler.defaultTime;
    const timezone = this.scheduleForm.controls.timezone.value || this.lang.fallbacks.scheduler.defaultTimezone;
    const repeat = this.scheduleForm.controls.repeat.value;
    const prefix =
      repeat === 'once'
        ? this.lang.fallbacks.scheduler.defaultDate
        : repeat === 'weekly'
          ? this.lang.fallbacks.scheduler.monday
          : this.lang.fallbacks.scheduler.today;

    return [
      `${prefix}, ${time} · ${timezone}`,
      repeat === 'once' ? this.lang.fallbacks.scheduler.singleRunOnly : this.lang.fallbacks.scheduler.nextRun(time, timezone),
      repeat === 'once' ? this.lang.fallbacks.scheduler.noRepeatConfigured : this.lang.fallbacks.scheduler.followingRun(time, timezone),
    ];
  });

  constructor() {
    this.facade.setActiveSection('scheduler');
    this.initialize();
  }

  initialize(): void {
    void this.facade.initialize();
    this.loadActiveForms();
  }

  onCreateSchedule(): void {
    this.editingScheduleId.set(null);
    this.scheduleMode.set('specific');
    this.processMode.set('always');
    this.scheduleForm.reset({
      scheduleMode: 'specific',
      startDate: this.lang.fallbacks.scheduler.defaultDate,
      time: this.lang.fallbacks.scheduler.defaultTime,
      repeat: 'daily',
      workflowName: '',
      timezone: this.lang.fallbacks.scheduler.defaultTimezone,
      formId: '',
      dateFieldId: '',
      executeWorkflow: 'on_date',
      offsetCount: '0',
      offsetUnit: 'days',
      endMode: 'never',
      endDate: '',
      endAfterRuns: '',
      processMode: 'always',
      nextConnector: 'AND',
    });
    this.resetConditions();
    this.scheduleModalOpen.set(true);
  }

  onSearchChange(query: string): void {
    this.facade.setSearch('scheduler', query);
  }

  onToggleSchedule(scheduleId: string): void {
    this.facade.toggleSchedule(scheduleId);
    this.toast.success(this.i18n.scope('toast.scheduleUpdated.title'), this.i18n.scope('toast.scheduleUpdated.message'));
  }

  onEditSchedule(scheduleId: string): void {
    const schedule = this.facade.scheduledWorkflows().find((item) => item.id === scheduleId);
    if (!schedule) {
      return;
    }

    const selectedForm = this.activeForms().find((form) => form.id === schedule.formId) ?? this.activeForms()[0];
    this.editingScheduleId.set(scheduleId);
    this.scheduleMode.set(schedule.triggerMode ?? 'specific');
    this.processMode.set('always');
    this.scheduleForm.reset({
      scheduleMode: schedule.triggerMode ?? 'specific',
      startDate: this.lang.fallbacks.scheduler.defaultDate,
      time: schedule.time ?? this.timeFromNextRun(schedule.nextRunAt),
      repeat: this.repeatValueFromLabel(schedule.frequencyLabel),
      workflowName: schedule.workflowName,
      timezone: schedule.timezone ?? this.lang.fallbacks.scheduler.defaultTimezone,
      formId: selectedForm?.id ?? '',
      dateFieldId: schedule.dateFieldId ?? this.firstDateFieldId(selectedForm),
      executeWorkflow: 'on_date',
      offsetCount: '0',
      offsetUnit: 'days',
      endMode: 'never',
      endDate: '',
      endAfterRuns: '',
      processMode: 'always',
      nextConnector: 'AND',
    });
    this.resetConditions();
    this.scheduleModalOpen.set(true);
  }

  async onEditScheduleCanvas(scheduleId: string): Promise<void> {
    const schedule = this.facade.scheduledWorkflows().find((item) => item.id === scheduleId);
    if (!schedule) {
      return;
    }

    if (schedule.workflowId) {
      await this.router.navigate(['/workflow-builder', schedule.workflowId, 'edit']);
      return;
    }

    try {
      this.saving.set(true);
      const workflow = await this.facade.createScheduledWorkflow({
        name: schedule.workflowName,
        mode: schedule.triggerMode ?? 'specific',
        startDate: this.startDateFromSchedule(schedule),
        time: schedule.time ?? this.timeFromNextRun(schedule.nextRunAt),
        repeat: this.repeatValueFromLabel(schedule.frequencyLabel),
        timezone: schedule.timezone ?? this.lang.fallbacks.scheduler.defaultTimezone,
        formId: schedule.formId,
        dateFieldId: schedule.dateFieldId,
        conditions: [],
      });

      this.facade.upsertSchedule({
        ...schedule,
        workflowId: workflow.id,
      });
      await this.router.navigate(['/workflow-builder', workflow.id, 'edit']);
    } catch {
      this.toast.error(
        this.i18n.scope('toast.canvasUnavailable.title'),
        this.i18n.scope('toast.canvasUnavailable.message')
      );
    } finally {
      this.saving.set(false);
    }
  }

  async closeScheduleModal(): Promise<void> {
    if (this.saving()) {
      return;
    }

    if (this.scheduleForm.dirty) {
      const confirmed = await this.confirmDialog.confirm(
        this.i18n.scope('confirm.unsavedChanges.title'),
        this.i18n.scope('confirm.discardScheduleChanges'),
        {
          confirmLabel: this.i18n.scope('confirm.unsavedChanges.confirmLabel'),
          cancelLabel: this.i18n.scope('confirm.unsavedChanges.cancelLabel'),
          danger: true,
        }
      );

      if (!confirmed) {
        return;
      }
    }

    this.scheduleModalOpen.set(false);
  }

  onScheduleModeChange(mode: ScheduleMode): void {
    this.scheduleMode.set(mode);
    this.scheduleForm.controls.scheduleMode.setValue(mode);
  }

  onProcessModeChange(mode: 'always' | 'condition'): void {
    this.processMode.set(mode);
    this.scheduleForm.controls.processMode.setValue(mode);

    if (mode === 'condition' && !this.conditions().length) {
      this.addCondition('AND');
    }
  }

  onFormChange(formId: string): void {
    const form = this.activeForms().find((item) => item.id === formId);
    this.scheduleForm.controls.dateFieldId.setValue(this.firstDateFieldId(form));
    this.resetConditions();
  }

  addCondition(connector: ScheduleConditionConnector): void {
    this.conditions().push(this.createConditionGroup(connector));
  }

  removeCondition(index: number): void {
    if (this.conditions().length === 1) {
      this.conditions().at(0).reset({ connector: 'AND', fieldId: '', operator: '', value: '' });
      return;
    }

    this.conditions().removeAt(index);
  }

  async onSaveSchedule(): Promise<void> {
    if (this.scheduleForm.invalid || !this.isScheduleModeComplete()) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const value = this.scheduleForm.getRawValue();
    const selectedForm = this.activeForms().find((form) => form.id === value.formId);
    const selectedDateField = selectedForm?.fields.find((field) => field.id === value.dateFieldId);
    const workflowName = value.workflowName.trim() || this.lang.modals.scheduleWorkflow.title;
    const conditions = value.processMode === 'condition' ? value.conditions.filter((condition) => condition.fieldId) : [];

    try {
      this.saving.set(true);
      let workflowId = this.facade.scheduledWorkflows().find((item) => item.id === this.editingScheduleId())?.workflowId;

      if (!workflowId) {
        const workflow = await this.facade.createScheduledWorkflow({
          name: workflowName,
          mode: value.scheduleMode,
          startDate: value.startDate,
          time: value.time,
          repeat: value.repeat,
          timezone: value.timezone,
          formId: selectedForm?.id,
          formName: selectedForm?.name,
          dateFieldId: selectedDateField?.id,
          dateFieldName: selectedDateField?.label,
          executeWorkflow: value.executeWorkflow,
          offsetCount: Number(value.offsetCount) || 0,
          offsetUnit: value.offsetUnit,
          endMode: value.endMode,
          endDate: value.endDate,
          endAfterRuns: Number(value.endAfterRuns) || null,
          conditions,
        });
        workflowId = workflow.id;
      }

      this.facade.upsertSchedule({
        id: this.editingScheduleId(),
        workflowId,
        workflowName,
        frequencyLabel: this.frequencyLabel(value.repeat, value.time),
        scopeLabel: value.scheduleMode === 'dateField'
          ? `${selectedForm?.name ?? this.lang.placeholders.selectForm} · ${selectedDateField?.label ?? this.lang.formLabels.startDateField}`
          : `${value.startDate} · ${value.timezone}`,
        nextRunAt: this.nextRuns()[0],
        enabled: true,
        triggerMode: value.scheduleMode,
        formId: selectedForm?.id,
        dateFieldId: selectedDateField?.id,
        time: value.time,
        timezone: value.timezone,
      });

      const toastKey = this.editingScheduleId() ? 'scheduleSettingsSaved' : 'scheduleCreated';
      this.toast.success(
        this.i18n.scope(`toast.${toastKey}.title`),
        this.i18n.scope(`toast.${toastKey}.message`)
      );
      this.scheduleModalOpen.set(false);

      if (!this.editingScheduleId() && workflowId) {
        await this.router.navigate(['/workflow-builder', workflowId, 'edit']);
      }

      this.editingScheduleId.set(null);
    } catch {
      this.toast.error(this.i18n.scope('toast.scheduleFailed.title'), this.i18n.scope('toast.scheduleFailed.message'));
    } finally {
      this.saving.set(false);
    }
  }

  onDeleteSchedule(scheduleId: string): void {
    const schedule = this.facade.scheduledWorkflows().find((item) => item.id === scheduleId);
    this.pendingDeleteScheduleId.set(scheduleId);
    this.confirmConfig.set({
      title: this.i18n.scope('confirm.deleteSchedule.title'),
      message: this.i18n.scope('confirm.deleteSchedule.message', {
        scheduleName: schedule?.workflowName ?? this.i18n.scope('confirm.unnamedSchedule'),
      }),
      confirmLabel: this.i18n.scope('confirm.deleteSchedule.confirmLabel'),
      cancelLabel: this.i18n.scope('confirm.deleteSchedule.cancelLabel'),
      danger: true,
    });
  }

  confirmDeleteSchedule(): void {
    const scheduleId = this.pendingDeleteScheduleId();
    if (scheduleId) {
      this.facade.deleteSchedule(scheduleId);
      this.toast.success(this.i18n.scope('toast.scheduleDeleted.title'), this.i18n.scope('toast.scheduleDeleted.message'));
    }

    this.pendingDeleteScheduleId.set(null);
    this.confirmConfig.set(null);
  }

  cancelDeleteSchedule(): void {
    this.pendingDeleteScheduleId.set(null);
    this.confirmConfig.set(null);
  }

  private loadActiveForms(): void {
    const forms = this.formBuilderFacade
      .forms()
      .filter((form) => form.status === 'live')
      .map((form) => this.toSchedulerForm(form));

    this.activeForms.set(forms);
  }

  private createConditionGroup(connector: ScheduleConditionConnector) {
    return this.formBuilder.nonNullable.group({
      connector: [connector],
      fieldId: [''],
      operator: [''],
      value: [''],
    });
  }

  private conditions(): FormArray {
    return this.scheduleForm.controls.conditions;
  }

  private resetConditions(): void {
    this.conditions().clear();
    this.conditions().push(this.createConditionGroup('AND'));
  }

  private firstDateFieldId(form: Form | undefined): string {
    return form?.fields.find((field) => field.type === 'date')?.id ?? '';
  }

  private frequencyLabel(repeat: string, time: string): string {
    const labels: Record<string, string> = {
      once: this.lang.fallbacks.scheduler.onceAt(time),
      daily: this.lang.fallbacks.scheduler.everyDayAt(time),
      weekly: this.lang.fallbacks.scheduler.everyWeekAt(time),
      monthly: this.lang.fallbacks.scheduler.everyMonthAt(time),
    };

    return labels[repeat] ?? this.lang.fallbacks.scheduler.everyDayAt(time);
  }

  private repeatValueFromLabel(label: string): string {
    const normalized = label.toLowerCase();
    if (normalized.includes('once')) {
      return 'once';
    }
    if (normalized.includes('week')) {
      return 'weekly';
    }
    if (normalized.includes('month')) {
      return 'monthly';
    }

    return 'daily';
  }

  private timeFromNextRun(nextRunAt: string): string {
    const match = nextRunAt.match(/\b\d{2}:\d{2}\b/);
    return match?.[0] ?? this.lang.fallbacks.scheduler.defaultTime;
  }

  private startDateFromSchedule(schedule: { scopeLabel: string }): string {
    const match = schedule.scopeLabel.match(/\b\d{4}-\d{2}-\d{2}\b/);
    return match?.[0] ?? this.lang.fallbacks.scheduler.defaultDate;
  }

  private toSchedulerForm(form: FormBuilderAsset): Form {
    return {
      id: form.id,
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      appId: this.facade.appId() || 'app_hr_management',
      fields: form.fields.map((field) => this.toSchedulerField(field)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private toSchedulerField(field: FormBuilderAsset['fields'][number]): FormField {
    return {
      id: field.id,
      type: this.toSchedulerFieldType(field.type),
      name: field.properties.fieldLinkName || field.binding || field.label,
      label: field.label,
      required: field.properties.required === true || field.properties.mandatory === true,
    };
  }

  private toSchedulerFieldType(type: string): FormField['type'] {
    const normalized = type.toLowerCase();
    if (normalized.includes('date')) {
      return 'date';
    }
    if (normalized.includes('email')) {
      return 'email';
    }
    if (normalized.includes('dropdown') || normalized.includes('select')) {
      return 'select';
    }

    return 'text';
  }

  private isScheduleModeComplete(): boolean {
    const value = this.scheduleForm.getRawValue();

    if (value.scheduleMode === 'specific') {
      return !!value.startDate && !!value.time && !!value.repeat && !!value.workflowName.trim();
    }

    return !!value.formId && !!value.dateFieldId && !!value.time && !!value.repeat && !!value.workflowName.trim();
  }
}
