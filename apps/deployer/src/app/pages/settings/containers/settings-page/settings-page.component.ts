import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QoTabComponent, QoTabsComponent } from '@qo/ui-components';
import { SettingsBillingTaxTabComponent } from '../../billing-tax/containers/settings-billing-tax-tab/settings-billing-tax-tab.component';
import { BillingTaxSettingsFacadeService } from '../../billing-tax/services/billing-tax-settings.service';
import { InvoiceDetailDialogComponent } from '../../invoices/components/invoice-detail-dialog/invoice-detail-dialog.component';
import { MarkAsPaidDialogComponent } from '../../invoices/components/mark-as-paid-dialog/mark-as-paid-dialog.component';
import { SettingsInvoicesTabComponent } from '../../invoices/containers/settings-invoices-tab/settings-invoices-tab.component';
import { InvoicesSettingsFacadeService } from '../../invoices/services/invoices-settings.service';
import { SettingsOrganisationTabComponent } from '../../organisation/containers/settings-organisation-tab/settings-organisation-tab.component';
import { OrganisationSettingsFacadeService } from '../../organisation/services/organisation-settings.service';
import { SettingsPaymentsTabComponent } from '../../payments/containers/settings-payments-tab/settings-payments-tab.component';
import { PaymentsSettingsFacadeService } from '../../payments/services/payments-settings.service';
import { SettingsFacadeService } from '../../services/settings-facade.service';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    InvoiceDetailDialogComponent,
    MarkAsPaidDialogComponent,
    QoTabComponent,
    QoTabsComponent,
    SettingsOrganisationTabComponent,
    SettingsBillingTaxTabComponent,
    SettingsInvoicesTabComponent,
    SettingsPaymentsTabComponent
  ],
  
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(SettingsFacadeService);
  private readonly organisationSettings = inject(OrganisationSettingsFacadeService);
  private readonly billingTaxSettings = inject(BillingTaxSettingsFacadeService);
  private readonly invoicesSettings = inject(InvoicesSettingsFacadeService);
  private readonly paymentsSettings = inject(PaymentsSettingsFacadeService);
  readonly i18n = inject(DeployerI18nService);

  readonly activeTab = this.facade.activeTab;
  readonly selectedOrganisation = this.facade.selectedOrganisation;
  readonly invoiceDialogId = this.invoicesSettings.invoiceDialogId;
  readonly markPaidId = this.invoicesSettings.markPaidId;
  readonly organisation = this.organisationSettings.organisation;
  readonly addAdminOpen = this.organisationSettings.addAdminOpen;
  readonly billing = this.billingTaxSettings.billing;
  readonly currentPlan = this.billingTaxSettings.currentPlan;
  readonly invoices = this.invoicesSettings.invoices;
  readonly payments = this.paymentsSettings.payments;
  readonly invoiceRows = this.invoicesSettings.invoiceRows;
  readonly paymentRows = this.paymentsSettings.paymentRows;
  readonly outstandingAmount = this.paymentsSettings.outstandingAmount;
  readonly pendingCount = this.paymentsSettings.pendingCount;
  readonly dueDetail = this.paymentsSettings.dueDetail;
  readonly adminUsers = this.organisationSettings.adminUsers;
  readonly organisationSummary = this.organisationSettings.organisationSummary;
  readonly organisationTypeOpen = this.organisationSettings.organisationTypeOpen;
  readonly organisationStatusOpen = this.organisationSettings.organisationStatusOpen;
  readonly selectedOrganisationType = this.organisationSettings.selectedOrganisationType;
  readonly selectedOrganisationStatus = this.organisationSettings.selectedOrganisationStatus;
  readonly selectedAdminPhotoName = signal('');
  readonly addAdminForm: FormGroup = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department: [this.i18n.translate('users.teamMember'), [Validators.required]],
    profilePhotoDataUrl: ['']
  });

  invoiceById(id: string | null) {
    return this.invoicesSettings.invoiceById(id);
  }

  openAddAdminModal(): void {
    this.resetAddAdminForm();
    this.organisationSettings.openAddAdminModal();
  }

  closeAddAdminModal(): void {
    this.resetAddAdminForm();
    this.organisationSettings.closeAddAdminModal();
  }

  async handleAdminPhotoSelected(file: File): Promise<void> {
    const dataUrl = await this.readFileAsDataUrl(file);

    this.addAdminForm.controls.profilePhotoDataUrl.setValue(dataUrl);
    this.selectedAdminPhotoName.set(file.name);
  }

  toggleOrganisationType(): void {
    this.organisationSettings.toggleOrganisationType();
  }

  toggleOrganisationStatus(): void {
    this.organisationSettings.toggleOrganisationStatus();
  }

  selectOrganisationType(type: string): void {
    this.organisationSettings.selectOrganisationType(type);
  }

  selectOrganisationStatus(status: string): void {
    this.organisationSettings.selectOrganisationStatus(status);
  }

  closeOrganisationDropdowns(): void {
    this.organisationSettings.closeOrganisationDropdowns();
  }

  deleteSelectedOrganisation(): Promise<void> {
    return this.organisationSettings.deleteSelectedOrganisation();
  }

  private resetAddAdminForm(): void {
    this.addAdminForm.reset(
      {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: this.i18n.translate('users.teamMember'),
        profilePhotoDataUrl: ''
      },
      { emitEvent: false }
    );
    this.selectedAdminPhotoName.set('');
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
