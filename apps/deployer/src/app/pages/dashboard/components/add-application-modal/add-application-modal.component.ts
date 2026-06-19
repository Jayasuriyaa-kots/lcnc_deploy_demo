import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoModalComponent,
  QoSelectComponent,
  QoTextareaComponent,
  SelectOption
} from '@qo/ui-components';
import { CreateApplicationPayload } from '../../models';

@Component({
  selector: 'app-add-application-modal',
  standalone: true,
  
  imports: [
    ReactiveFormsModule,
    QoButtonComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoModalComponent,
    QoSelectComponent,
    QoTextareaComponent
  ],
  templateUrl: './add-application-modal.component.html',
  styleUrl: './add-application-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddApplicationModalComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly organisationName = input(this.i18n.translate('organisations.noOrganisationSelected'));
  readonly applicationTypes = input.required<readonly string[]>();
  readonly primaryOwners = input.required<readonly string[]>();
  readonly applicationTypeOpen = input.required<boolean>();
  readonly primaryOwnerOpen = input.required<boolean>();
  readonly selectedApplicationType = input.required<string>();
  readonly selectedPrimaryOwner = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly close = output<void>();
  readonly submitApplication = output<CreateApplicationPayload>();
  readonly toggleApplicationType = output<void>();
  readonly togglePrimaryOwner = output<void>();
  readonly applicationTypeSelect = output<string>();
  readonly primaryOwnerSelect = output<string>();
  readonly dismissDropdowns = output<void>();
  readonly applicationTypeOptions = computed<SelectOption[]>(() =>
    this.applicationTypes().map((type) => ({ label: type, value: type }))
  );
  readonly primaryOwnerOptions = computed<SelectOption[]>(() =>
    this.primaryOwners().map((owner) => ({ label: owner, value: owner }))
  );

  closeModal(): void {
    this.close.emit();
  }

  isSubmitDisabled(): boolean {
    return this.form().invalid;
  }

  submit(): void {
    const form = this.form();

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const rawValue = this.form().getRawValue() as {
      name: string;
      description: string;
      superAdminEmails: string;
      adminEmails: string;
    };

    this.submitApplication.emit({
      name: rawValue.name,
      type: this.selectedApplicationType(),
      primaryOwner: this.selectedPrimaryOwner(),
      description: rawValue.description,
      superAdminEmails: this.parseEmailList(rawValue.superAdminEmails),
      adminEmails: this.parseEmailList(rawValue.adminEmails)
    });
  }

  onApplicationTypeChange(value: SelectOption['value']): void {
    if (typeof value === 'string') {
      this.applicationTypeSelect.emit(value);
    }
  }

  onPrimaryOwnerChange(value: SelectOption['value']): void {
    if (typeof value === 'string') {
      this.primaryOwnerSelect.emit(value);
    }
  }

  private parseEmailList(value: string): string[] {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
}
