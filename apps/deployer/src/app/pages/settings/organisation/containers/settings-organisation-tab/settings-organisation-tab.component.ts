import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QoButtonComponent, QoFormFieldComponent, QoInputComponent } from '@qo/ui-components';
import { AddUserModalComponent } from '../../../../users/components/add-user-modal/add-user-modal.component';
import {
  createOrganisationStatusOptions,
  createOrganisationTypeOptions,
  SettingsAdminUser,
  OrganisationSettingsModel,
  SettingsOrganisationSummaryItem
} from '../../models';
import { OrganisationDetailsFormComponent } from '../../components/organisation-details-form/organisation-details-form.component';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-settings-organisation-tab',
  standalone: true,
  imports: [
    AddUserModalComponent,
    OrganisationDetailsFormComponent,
    QoButtonComponent,
    QoFormFieldComponent,
    QoInputComponent
  ],
  templateUrl: './settings-organisation-tab.component.html',
  styleUrl: './settings-organisation-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsOrganisationTabComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly organisationTypes = createOrganisationTypeOptions(this.i18n);
  readonly organisationStatuses = createOrganisationStatusOptions(this.i18n);
  readonly organisation = input.required<OrganisationSettingsModel>();
  readonly adminUsers = input.required<readonly SettingsAdminUser[]>();
  readonly organisationSummary = input.required<readonly SettingsOrganisationSummaryItem[]>();
  readonly addAdminOpen = input.required<boolean>();
  readonly addAdminForm = input.required<FormGroup>();
  readonly selectedAdminPhotoName = input('');
  readonly addAdminNoteText = this.i18n.translate('settings.orgAddAdminNote');
  readonly organisationTypeOpen = input.required<boolean>();
  readonly organisationStatusOpen = input.required<boolean>();
  readonly selectedOrganisationType = input.required<string>();
  readonly selectedOrganisationStatus = input.required<string>();
  readonly addAdminOpenRequested = output<void>();
  readonly addAdminCloseRequested = output<void>();
  readonly adminPhotoSelected = output<File>();
  readonly organisationTypeToggleRequested = output<void>();
  readonly organisationStatusToggleRequested = output<void>();
  readonly organisationTypeSelected = output<string>();
  readonly organisationStatusSelected = output<string>();
  readonly dropdownsCloseRequested = output<void>();
  readonly deleteOrganisationRequested = output<void>();
}
