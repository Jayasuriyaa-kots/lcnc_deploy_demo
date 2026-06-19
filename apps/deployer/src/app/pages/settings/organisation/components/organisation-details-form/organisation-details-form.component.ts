import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';
import {
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoSelectComponent,
  SelectOption
} from '@qo/ui-components';
import { OrganisationSettingsModel } from '../../models';

@Component({
  selector: 'app-organisation-details-form',
  standalone: true,
  imports: [QoButtonComponent, QoFormFieldComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './organisation-details-form.component.html',
  styleUrl: './organisation-details-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganisationDetailsFormComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly organisation = input.required<OrganisationSettingsModel>();
  readonly organisationTypes = input.required<readonly string[]>();
  readonly organisationStatuses = input.required<readonly string[]>();
  readonly organisationTypeOpen = input.required<boolean>();
  readonly organisationStatusOpen = input.required<boolean>();
  readonly selectedOrganisationType = input.required<string>();
  readonly selectedOrganisationStatus = input.required<string>();
  readonly organisationTypeToggleRequested = output<void>();
  readonly organisationStatusToggleRequested = output<void>();
  readonly organisationTypeSelected = output<string>();
  readonly organisationStatusSelected = output<string>();
  readonly dropdownsCloseRequested = output<void>();
  readonly organisationTypeOptions = computed<SelectOption[]>(() =>
    this.organisationTypes().map((type) => ({ label: type, value: type }))
  );
  readonly organisationStatusOptions = computed<SelectOption[]>(() =>
    this.organisationStatuses().map((status) => ({ label: status, value: status }))
  );

  selectOrganisationType(value: SelectOption['value']): void {
    if (typeof value === 'string') {
      this.organisationTypeSelected.emit(value);
    }
  }

  selectOrganisationStatus(value: SelectOption['value']): void {
    if (typeof value === 'string') {
      this.organisationStatusSelected.emit(value);
    }
  }
}
