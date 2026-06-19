import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoModalComponent,
  QoSelectComponent,
  SelectOption,
} from '@qo/ui-components';
import { WorkflowBuilderI18nService } from '../../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-button-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    TranslocoPipe,
    ReactiveFormsModule,
    QoButtonComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoModalComponent,
    QoSelectComponent,
  ],
  templateUrl: './workflow-button-create-modal.component.html',
  styleUrl: './workflow-button-create-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowButtonCreateModalComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  private readonly i18n = inject(WorkflowBuilderI18nService);
  open = input<boolean>(false);
  form = input.required<FormGroup>();
  availableWorkflows = input<string[]>([]);
  saving = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  readonly actionTypeOptions: SelectOption[] = [
    { label: this.lang.options.actionType.workflow, value: 'workflow' },
    { label: this.lang.options.actionType.webhook, value: 'webhook' },
    { label: this.lang.options.actionType.navigation, value: 'navigation' },
  ];
  readonly scopeOptions: SelectOption[] = [
    { label: this.lang.options.scope.report, value: 'Report' },
    { label: this.lang.options.scope.page, value: 'Page' },
    { label: this.lang.options.scope.global, value: 'Global' },
  ];
  readonly statusOptions: SelectOption[] = [
    { label: this.lang.options.status.active, value: 'active' },
    { label: this.lang.options.status.draft, value: 'draft' },
    { label: this.lang.options.status.inactive, value: 'inactive' },
  ];
  readonly workflowOptions = computed<SelectOption[]>(() =>
    this.availableWorkflows().map((workflow) => ({
      label: workflow,
      value: workflow,
    }))
  );

  close = output<void>();
  save = output<void>();

  fieldError(controlName: string, label: string): string | undefined {
    const control = this.form().get(controlName);

    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return undefined;
    }

    if (control.hasError('required')) {
      return this.i18n.scope('validation.required', { label });
    }

    return this.i18n.scope('validation.invalid', { label });
  }
}
