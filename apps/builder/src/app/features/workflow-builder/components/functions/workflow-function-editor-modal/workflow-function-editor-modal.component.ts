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
  QoTextareaComponent,
  SelectOption,
} from '@qo/ui-components';
import { WorkflowBuilderI18nService } from '../../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-function-editor-modal',
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
    QoTextareaComponent,
  ],
  templateUrl: './workflow-function-editor-modal.component.html',
  styleUrl: './workflow-function-editor-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFunctionEditorModalComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  private readonly i18n = inject(WorkflowBuilderI18nService);
  open = input<boolean>(false);
  form = input.required<FormGroup>();
  saving = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  readonly languageOptions: SelectOption[] = [
    { label: this.lang.options.language.javascript, value: 'javascript' },
    { label: this.lang.options.language.python, value: 'python' },
  ];

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
