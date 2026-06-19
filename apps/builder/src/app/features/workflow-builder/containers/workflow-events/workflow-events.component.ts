import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import {
  QoConfirmDialogComponent,
  QoButtonComponent,
  QoConfirmDialogConfig,
  QoConfirmDialogService,
  QoFormFieldComponent,
  QoInputComponent,
  QoModalComponent,
  QoSelectComponent,
  QoToastService,
  QoWorkflowPageHeaderComponent,
  QoWorkflowToolbarComponent,
  SelectOption,
} from '@qo/ui-components';
import { WorkflowBuilderFacadeService } from '../../services/workflow-builder-facade.service';
import { WorkflowBuilderI18nService } from '../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';
import { WorkflowEventTableComponent } from '../../components/events/workflow-event-table';
import { WorkflowEventListItem } from '../../models/workflow-builder-ui.model';

@Component({
  selector: 'app-workflow-events',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    QoButtonComponent,
    QoConfirmDialogComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoModalComponent,
    QoSelectComponent,
    QoWorkflowPageHeaderComponent,
    QoWorkflowToolbarComponent,
    WorkflowEventTableComponent,
  ],
  templateUrl: './workflow-events.component.html',
  styleUrl: './workflow-events.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEventsComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(QoToastService);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private readonly i18n = inject(WorkflowBuilderI18nService);
  readonly eventModalOpen = signal(false);
  readonly eventEditorMode = signal<'create' | 'edit'>('create');
  readonly editingEventId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  readonly statusOptions: SelectOption[] = [
    { label: this.lang.options.status.active, value: 'active' },
    { label: this.lang.options.status.paused, value: 'paused' },
    { label: this.lang.options.status.draft, value: 'draft' },
    { label: this.lang.options.status.failed, value: 'failed' },
  ];
  readonly eventForm = this.formBuilder.nonNullable.group({
    event: ['', [Validators.required, Validators.minLength(3)]],
    trigger: [this.lang.fallbacks.events.defaultTrigger as string, Validators.required],
    source: [this.lang.fallbacks.events.defaultSource as string, Validators.required],
    status: ['active' as WorkflowEventListItem['status'], Validators.required],
  });

  constructor() {
    this.facade.setActiveSection('events');
    void this.facade.initialize();
  }

  onCreateEvent(): void {
    this.eventEditorMode.set('create');
    this.editingEventId.set(null);
    this.eventForm.reset({
      event: '',
      trigger: this.lang.fallbacks.events.defaultTrigger,
      source: this.lang.fallbacks.events.defaultSource,
      status: 'draft',
    });
    this.eventModalOpen.set(true);
  }

  onSearchChange(query: string): void {
    this.facade.setSearch('events', query);
  }

  onEditEvent(eventId: string): void {
    const event = this.facade.eventWorkflows().find((item) => item.id === eventId);
    if (!event) {
      return;
    }

    this.eventEditorMode.set('edit');
    this.editingEventId.set(eventId);
    this.eventForm.reset({
      event: event.event,
      trigger: event.trigger,
      source: event.source,
      status: event.status,
    });
    this.eventModalOpen.set(true);
  }

  async closeEventModal(): Promise<void> {
    if (this.saving()) {
      return;
    }

    if (this.eventForm.dirty) {
      const confirmed = await this.confirmDialog.confirm(
        this.i18n.scope('confirm.unsavedChanges.title'),
        this.i18n.scope('confirm.discardEventWorkflowChanges'),
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

    this.eventModalOpen.set(false);
  }

  fieldError(controlName: string, label: string): string | undefined {
    const control = this.eventForm.get(controlName);

    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return undefined;
    }

    if (control.hasError('required')) {
      return this.i18n.scope('validation.required', { label });
    }

    if (control.hasError('minlength')) {
      return this.i18n.scope('validation.tooShort', { label });
    }

    return this.i18n.scope('validation.invalid', { label });
  }

  async saveEvent(): Promise<void> {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.eventForm.getRawValue();
    const eventId = this.editingEventId();

    try {
      if (eventId) {
        this.facade.updateEventWorkflow(eventId, value);
        this.toast.success(this.i18n.scope('toast.eventSaved.title'), this.i18n.scope('toast.eventSaved.message'));
        this.eventModalOpen.set(false);
        return;
      }

      const workflow = await this.facade.createEventTriggeredWorkflow({
        name: `${value.event} ${this.lang.editor.workflowSuffix}`,
        eventName: value.event,
        sourceType: value.trigger,
        sourceId: value.source,
      });
      this.eventModalOpen.set(false);
      await this.router.navigate(['/workflow-builder', workflow.id, 'edit']);
    } catch {
      this.toast.error(
        this.i18n.scope('toast.createEventFailed.title'),
        this.i18n.scope('toast.createEventFailed.message')
      );
    } finally {
      this.saving.set(false);
    }
  }

  onDeleteEvent(eventId: string): void {
    const event = this.facade.eventWorkflows().find((item) => item.id === eventId);

    this.confirmConfig.set({
      title: this.i18n.scope('confirm.deleteEvent.title'),
      message: this.i18n.scope('confirm.deleteEvent.message', {
        eventName: event?.event ?? this.i18n.scope('confirm.unnamedEvent'),
      }),
      confirmLabel: this.i18n.scope('confirm.deleteEvent.confirmLabel'),
      cancelLabel: this.i18n.scope('confirm.deleteEvent.cancelLabel'),
      danger: true,
    });
    this.editingEventId.set(eventId);
  }

  confirmDelete(): void {
    const eventId = this.editingEventId();
    if (eventId) {
      this.facade.deleteEventWorkflow(eventId);
      this.toast.success(this.i18n.scope('toast.eventDeleted.title'), this.i18n.scope('toast.eventDeleted.message'));
    }

    this.editingEventId.set(null);
    this.confirmConfig.set(null);
  }

  cancelDelete(): void {
    this.editingEventId.set(null);
    this.confirmConfig.set(null);
  }
}
