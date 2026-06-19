import { BillingTaxModel } from '../pages/settings/billing-tax/models';
import { InvoiceModel } from '../pages/settings/invoices/models';
import { OrganisationSettingsModel } from '../pages/settings/organisation/models';
import { PaymentModel } from '../pages/settings/payments/models';
import type { DeployerI18nService } from '../services/deployer-i18n.service';
import { translateDeployerLang } from '../../lang/deployer.en';

type DeployerTranslator = Pick<DeployerI18nService, 'translate'>;

export const createOrganisationSettings = (i18n: DeployerTranslator): OrganisationSettingsModel => ({
  entityName: 'Northstar Logistics Pvt. Ltd.',
  registeredAddress: '420 Mission Bay Boulevard, Suite 900, San Francisco, CA 94158',
  primaryOwner: 'Maya Bennett',
  primaryOwnerEmail: 'maya.bennett@northstar.example',
  primaryOwnerPhone: '+91 98765 43210',
  admins: ['Maya Bennett', 'Priya Sharma', 'Daniel Kim'],
  organisationStatus: i18n.translate('users.active'),
  organisationType: i18n.translate('organisations.entityTypeEnterpriseCustomer')
});

export const BILLING_TAX_SETTINGS: BillingTaxModel = {
  gstNumber: 'GST-44QO-9941',
  tanNumber: 'TAN-QO-1182',
  panNumber: 'PAN-AX29K1',
  billingEmail: 'billing@northstar.example',
  billingContactName: 'Rohan Iyer'
};

export const INVOICES: InvoiceModel[] = [
  {
    id: 'inv-2401',
    invoiceNumber: 'INV-2401',
    date: 'Apr 01, 2026',
    billingPeriod: 'Mar 01 - Mar 31, 2026',
    amount: '$18,420',
    status: 'due'
  },
  {
    id: 'inv-2392',
    invoiceNumber: 'INV-2392',
    date: 'Mar 01, 2026',
    billingPeriod: 'Feb 01 - Feb 29, 2026',
    amount: '$17,980',
    status: 'paid'
  },
  {
    id: 'inv-2384',
    invoiceNumber: 'INV-2384',
    date: 'Feb 01, 2026',
    billingPeriod: 'Jan 01 - Jan 31, 2026',
    amount: '$16,730',
    status: 'overdue'
  }
];

export const createPayments = (i18n: DeployerTranslator): PaymentModel[] => [
  {
    id: 'PMT-9102',
    method: i18n.translate('settings.paymentMethodWireTransfer'),
    amount: '$17,980',
    date: 'Mar 08, 2026',
    reference: 'CITI-99214',
    note: i18n.translate('settings.paymentNoteAppliedAgainst', { invoice: 'INV-2392' })
  },
  {
    id: 'PMT-9021',
    method: i18n.translate('settings.paymentMethodAch'),
    amount: '$16,730',
    date: 'Feb 16, 2026',
    reference: 'ACH-64182',
    note: i18n.translate('settings.paymentNoteAppliedAgainst', { invoice: 'INV-2384' })
  },
  {
    id: 'PMT-9158',
    method: i18n.translate('settings.paymentMethodManualAdjustment'),
    amount: '$2,140',
    date: 'Apr 03, 2026',
    reference: 'ADJ-1184',
    note: i18n.translate('settings.paymentNoteServiceCredit')
  }
];

export const PAYMENTS: PaymentModel[] = createPayments({ translate: translateDeployerLang });
