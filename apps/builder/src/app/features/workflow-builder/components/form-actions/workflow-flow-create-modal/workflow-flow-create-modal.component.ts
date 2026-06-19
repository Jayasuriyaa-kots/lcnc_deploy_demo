import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
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
  selector: 'app-workflow-flow-create-modal',
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
  templateUrl: './workflow-flow-create-modal.component.html',
  styleUrl: './workflow-flow-create-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFlowCreateModalComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  private readonly i18n = inject(WorkflowBuilderI18nService);
  readonly open = input(false);
  readonly form = input.required<FormGroup>();
  readonly formOptions = input<SelectOption[]>([]);
  readonly saving = input(false);

  readonly close = output<void>();
  readonly create = output<void>();

  readonly recordEventOptions: SelectOption[] = [
    { label: this.lang.options.recordEvent.created, value: 'record_created' },
    { label: this.lang.options.recordEvent.edited, value: 'record_edited' },
    { label: this.lang.options.recordEvent.createdOrEdited, value: 'record_created_or_edited' },
    { label: this.lang.options.recordEvent.deleted, value: 'record_deleted' },
  ];

  readonly formEventOptions: SelectOption[] = [
    { label: this.lang.options.formEvent.load, value: 'form_load' },
    { label: this.lang.options.formEvent.submit, value: 'form_submit' },
    { label: this.lang.options.formEvent.input, value: 'form_input' },
  ];

  selectedRecordEvent(): string {
    const value = this.form().get('recordEvent')?.value;
    return typeof value === 'string' ? value : '';
  }

  selectRecordEvent(value: SelectOption['value']): void {
    this.form().get('recordEvent')?.setValue(value);
    this.form().get('recordEvent')?.markAsTouched();
  }

  fieldError(controlName: string, label: string): string | undefined {
    const control = this.form().get(controlName);

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
}
