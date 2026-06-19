import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  QoBadgeComponent,
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoSelectComponent,
  QoTextareaComponent,
} from '@qo/ui-components';
import { BuilderDatasourceOption } from '@builder/features/form-builder/config/form-builder.config';
import { FormCreateWizardFacade } from './form-create-wizard.facade';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { TranslocoPipe } from '@jsverse/transloco';

export interface CreateWizardColumnMapping {
  columnId: string;
  fieldType: string;
}

export interface CreateWizardResult {
  name: string;
  description: string;
  datasourceId: string;
  queryId: string;
  columnMappings: CreateWizardColumnMapping[];
}

@Component({
  selector: 'app-form-create-wizard',
  standalone: true,
  providers: [FormCreateWizardFacade],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QoBadgeComponent,
    QoButtonComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoSelectComponent,
    QoTextareaComponent,
    TranslocoPipe
  ],
  templateUrl: './form-create-wizard.component.html',
  styleUrl: './form-create-wizard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCreateWizardComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly datasourceOptions = input<BuilderDatasourceOption[]>([]);
  readonly existingFormNames = input<string[]>([]);
  readonly created = output<CreateWizardResult>();
  readonly cancelled = output<void>();

  protected readonly w = inject(FormCreateWizardFacade);

  constructor() {
    effect(() => {
      this.w.syncInputs(this.datasourceOptions(), this.existingFormNames());
    });
  }

  confirm(): void {
    const result = this.w.buildConfirmResult();
    if (!result) return;
    this.created.emit(result);
    this.w.resetWizard();
  }

  cancel(): void {
    this.cancelled.emit();
    this.w.resetWizard();
  }

  onDatasourceChange(value: string | number | boolean | null | undefined): void {
    this.w.selectDatasource(String(value ?? ''));
  }

  onQueryChange(value: string | number | boolean | null | undefined): void {
    this.w.selectQuery(String(value ?? ''));
  }

  onFieldTypeChange(columnId: string, value: string | number | boolean | null | undefined): void {
    this.w.updateFieldType(columnId, String(value ?? ''));
  }
}
