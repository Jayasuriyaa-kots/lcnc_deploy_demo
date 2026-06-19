import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { InvoiceModel, SettingsInvoiceRow } from '../invoices/models';
import { OrganisationSettingsModel, SettingsAdminUser, SettingsOrganisationSummaryItem } from '../organisation/models';
import { PaymentModel, SettingsPaymentRow } from '../payments/models';
import { BillingTaxModel, SettingsCurrentPlan } from '../billing-tax/models';
import { OrganisationsFacadeService } from '../../../core/layout/services/organisations-facade.service';
import { DashboardFacadeService } from '../../dashboard/services/dashboard-facade.service';
import { UsersFacadeService } from '../../users/services/users-facade.service';
import { QoConfirmDialogService, QoToastService } from '@qo/ui-components';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';

@Injectable({ providedIn: 'root' })
export class SettingsFacadeService {
  private readonly activeTabStorageKey = 'qo_settings_active_tab';
  private readonly i18n = inject(DeployerI18nService);
  private readonly settingsTabs = [
    this.i18n.translate('settings.tabOrganisation'),
    this.i18n.translate('settings.tabBillingTax'),
    this.i18n.translate('settings.tabInvoices'),
    this.i18n.translate('settings.tabPayments')
  ] as const;
  private readonly organisationsFacade = inject(OrganisationsFacadeService);
  private readonly dashboardFacade = inject(DashboardFacadeService);
  private readonly usersFacade = inject(UsersFacadeService);
  private readonly confirmDialogService = inject(QoConfirmDialogService);
  private readonly toastService = inject(QoToastService);

  readonly activeTab = signal<string>(this.loadActiveTab());
  readonly invoiceDialogId = signal<string | null>(null);
  readonly markPaidId = signal<string | null>(null);
  readonly addAdminOpen = signal(false);
  readonly organisationTypeOpen = signal(false);
  readonly organisationStatusOpen = signal(false);
  readonly selectedOrganisation = this.organisationsFacade.selectedOrganisation;
  readonly selectedOrganisationType = signal('');
  readonly selectedOrganisationStatus = signal('');
  readonly selectedOrganisationIndex = computed(() => {
    const selectedOrganisationId = this.organisationsFacade.selectedOrganisationId();

    return Math.max(
      this.organisationsFacade.organisations().findIndex(
        (organisation) => organisation.id === selectedOrganisationId
      ),
      0
    );
  });
  readonly organisation = computed<OrganisationSettingsModel>(() => {
    const organisation = this.selectedOrganisation();
    const primaryOwnerEmail = organisation?.primaryOwnerEmail ?? 'owner@quantaops.example';

    return {
      entityName: organisation?.name ?? this.i18n.translate('organisations.noOrganisationSelected'),
      registeredAddress: this.registeredAddressForOrganisation(organisation?.name ?? 'Organisation'),
      primaryOwner: this.nameFromEmail(primaryOwnerEmail),
      primaryOwnerEmail,
      primaryOwnerPhone: this.phoneForIndex(this.selectedOrganisationIndex()),
      admins: organisation?.additionalAdminUsers ?? [],
      organisationStatus: this.titleCase(organisation?.status ?? 'inactive'),
      organisationType: organisation?.entityType ?? this.i18n.translate('organisations.entityTypeEnterpriseCustomer')
    };
  });
  readonly billing = computed<BillingTaxModel>(() => {
    const organisation = this.selectedOrganisation();
    const organisationIndex = this.selectedOrganisationIndex() + 1;

    return {
      gstNumber: `GST-QO-${String(organisationIndex).padStart(2, '0')}41`,
      tanNumber: `TAN-QO-${String(organisationIndex).padStart(2, '0')}82`,
      panNumber: `PAN-QO-${String(organisationIndex).padStart(2, '0')}K1`,
      billingEmail: organisation?.billingEmail ?? 'billing@quantaops.example',
      billingContactName: this.nameFromEmail(organisation?.primaryOwnerEmail ?? 'owner@quantaops.example')
    };
  });
  readonly currentPlan = computed<SettingsCurrentPlan>(() => {
    const entityType = this.selectedOrganisation()?.entityType ?? 'Organisation';
    const tier = entityType === this.i18n.translate('organisations.entityTypeEnterpriseCustomer')
      ? this.i18n.translate('settings.planTierBusiness')
      : this.i18n.translate('settings.planTierGrowth');
    const monthlyPrice = entityType === this.i18n.translate('organisations.entityTypeEnterpriseCustomer') ? 14999 : 9999;

    return {
      plan: `${tier} - \u20B9${monthlyPrice.toLocaleString('en-IN')}/mo`,
      billingCycle: this.i18n.translate('settings.billingCycleMonthly'),
      nextInvoice: this.i18n.translate('settings.nextInvoiceMay12026'),
      paymentMethod: this.i18n.translate('settings.paymentMethodVisa4242')
    };
  });
  readonly invoices = computed<InvoiceModel[]>(() => {
    return [
      {
        id: 'inv-2026-004',
        invoiceNumber: 'INV-2026-004',
        date: this.i18n.translate('settings.invoiceDateApr12026'),
        billingPeriod: this.i18n.translate('settings.billingPeriodMar2026'),
        amount: this.formatCurrency(14999),
        status: this.i18n.translate('settings.invoiceStatusDue') as InvoiceModel['status']
      },
      {
        id: 'inv-2026-003',
        invoiceNumber: 'INV-2026-003',
        date: this.i18n.translate('settings.invoiceDateMar12026'),
        billingPeriod: this.i18n.translate('settings.billingPeriodFeb2026'),
        amount: this.formatCurrency(14999),
        status: this.i18n.translate('settings.invoiceStatusPaid') as InvoiceModel['status']
      },
      {
        id: 'inv-2026-002',
        invoiceNumber: 'INV-2026-002',
        date: this.i18n.translate('settings.invoiceDateFeb12026'),
        billingPeriod: this.i18n.translate('settings.billingPeriodJan2026'),
        amount: this.formatCurrency(14999),
        status: this.i18n.translate('settings.invoiceStatusPaid') as InvoiceModel['status']
      },
      {
        id: 'inv-2026-001',
        invoiceNumber: 'INV-2026-001',
        date: this.i18n.translate('settings.invoiceDateJan12026'),
        billingPeriod: this.i18n.translate('settings.billingPeriodDec2025'),
        amount: this.formatCurrency(14999),
        status: this.i18n.translate('settings.invoiceStatusPaid') as InvoiceModel['status']
      },
      {
        id: 'inv-2025-012',
        invoiceNumber: 'INV-2025-012',
        date: this.i18n.translate('settings.invoiceDateDec12025'),
        billingPeriod: this.i18n.translate('settings.billingPeriodNov2025'),
        amount: this.formatCurrency(12499),
        status: this.i18n.translate('settings.invoiceStatusPaid') as InvoiceModel['status']
      }
    ];
  });
  readonly payments = computed<PaymentModel[]>(() => {
    const organisationIndex = this.selectedOrganisationIndex();

    return [
      {
        id: `PMT-${organisationIndex + 1}-9102`,
        method: this.i18n.translate('settings.paymentMethodWireTransfer'),
        amount: this.formatCurrency(17980 + organisationIndex * 720),
        date: 'Mar 08, 2026',
        reference: `CITI-${99214 + organisationIndex}`,
        note: this.i18n.translate('settings.paymentNoteAppliedAgainst', { invoice: 'INV-2392' })
      },
      {
        id: `PMT-${organisationIndex + 1}-9021`,
        method: this.i18n.translate('settings.paymentMethodAch'),
        amount: this.formatCurrency(16730 + organisationIndex * 640),
        date: 'Feb 16, 2026',
        reference: `ACH-${64182 + organisationIndex}`,
        note: this.i18n.translate('settings.paymentNoteAppliedAgainst', { invoice: 'INV-2384' })
      },
      {
        id: `PMT-${organisationIndex + 1}-9158`,
        method: this.i18n.translate('settings.paymentMethodManualAdjustment'),
        amount: this.formatCurrency(2140 + organisationIndex * 140),
        date: 'Apr 03, 2026',
        reference: `ADJ-${1184 + organisationIndex}`,
        note: this.i18n.translate('settings.paymentNoteServiceCredit')
      }
    ];
  });
  readonly invoiceRows = computed<SettingsInvoiceRow[]>(() =>
    this.invoices().map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      dateRaised: this.toShortDate(invoice.date),
      billingPeriod: this.toShortBillingPeriod(invoice.billingPeriod),
      amount: this.toRupeeCurrency(invoice.amount),
      status: (invoice.status === this.i18n.translate('settings.invoiceStatusDue')
        ? this.i18n.translate('settings.invoiceStatusPending')
        : invoice.status) as SettingsInvoiceRow['status']
    }))
  );
  readonly paymentRows = computed<SettingsPaymentRow[]>(() => {
    const organisationIndex = this.selectedOrganisationIndex();

    return [
      {
        date: '1 Mar 2026',
        reference: `PAY-20260301-${organisationIndex + 1}`,
        amount: this.toRupeeCurrency(this.invoices()[1]?.amount ?? '$0'),
        method: 'Visa ••••4242',
        invoice: 'INV-2026-003',
        status: this.i18n.translate('settings.paymentStatusFull') as SettingsPaymentRow['status']
      },
      {
        date: '1 Feb 2026',
        reference: `PAY-20260201-${organisationIndex + 1}`,
        amount: this.toRupeeCurrency(this.invoices()[2]?.amount ?? '$0'),
        method: 'Visa ••••4242',
        invoice: 'INV-2026-002',
        status: this.i18n.translate('settings.paymentStatusFull') as SettingsPaymentRow['status']
      },
      {
        date: '15 Jan 2026',
        reference: `PAY-20260115-${organisationIndex + 1}`,
        amount: this.toRupeeCurrency(this.formatCurrency(7500 + organisationIndex * 320)),
        method: this.i18n.translate('settings.paymentMethodBankTransfer'),
        invoice: 'INV-2026-001',
        status: this.i18n.translate('settings.paymentStatusPartial') as SettingsPaymentRow['status']
      },
      {
        date: '20 Jan 2026',
        reference: `PAY-20260120-${organisationIndex + 1}`,
        amount: this.toRupeeCurrency(this.formatCurrency(7499 + organisationIndex * 280)),
        method: 'Visa ••••4242',
        invoice: 'INV-2026-001',
        status: this.i18n.translate('settings.paymentStatusSettled') as SettingsPaymentRow['status']
      }
    ];
  });
  readonly outstandingAmount = computed(() => this.toRupeeCurrency(this.invoices()[0]?.amount ?? '$0'));
  readonly pendingCount = computed(() => {
    const pendingInvoiceCount = this.invoiceRows().filter((row) => row.status === this.i18n.translate('settings.invoiceStatusPending')).length;

    return this.i18n.translate('settings.pendingInvoiceCount', { count: pendingInvoiceCount });
  });
  readonly dueDetail = computed(
    () => this.i18n.translate('settings.dueByDate', { invoiceNumber: this.invoices()[0]?.invoiceNumber ?? 'INV-2026-004' })
  );
  readonly adminUsers = computed<readonly SettingsAdminUser[]>(() => {
    const organisation = this.selectedOrganisation();
    const primaryOwnerEmail = organisation?.primaryOwnerEmail ?? 'owner@quantaops.example';
    const additionalAdmins = organisation?.additionalAdminUsers ?? [];

    return [
      {
        initials: this.initialsFromName(this.nameFromEmail(primaryOwnerEmail)),
        name: this.nameFromEmail(primaryOwnerEmail),
        email: primaryOwnerEmail,
        role: this.i18n.translate('settings.adminRoleOwner')
      },
      ...additionalAdmins.map((email) => ({
        initials: this.initialsFromName(this.nameFromEmail(email)),
        name: this.nameFromEmail(email),
        email,
        role: this.i18n.translate('settings.adminRoleRemove')
      }))
    ];
  });
  readonly organisationSummary = computed<readonly SettingsOrganisationSummaryItem[]>(() => {
    const organisation = this.selectedOrganisation();
    const applicationCount = this.dashboardFacade.selectedOrganisationApplications().length;
    const userCount = this.usersFacade.selectedOrganisationUsers().length;

    return [
      { label: this.i18n.translate('settings.summaryPlan'), value: this.currentPlan().plan.split(' - ')[0] },
      { label: this.i18n.translate('settings.summaryApplications'), value: this.i18n.translate('settings.summaryApplicationsValue', { count: applicationCount }) },
      { label: this.i18n.translate('settings.summaryActiveUsers'), value: userCount.toString() },
      { label: this.i18n.translate('settings.summaryMemberSince'), value: this.formatMemberSince(organisation?.createdAt) },
      { label: this.i18n.translate('settings.summaryOrgId'), value: organisation?.id ?? 'org_none' },
      {
        label: this.i18n.translate('settings.summaryStatus'),
        value: this.titleCase(organisation?.status ?? 'inactive'),
        tone: organisation?.status === 'active' ? 'positive' : undefined
      }
    ];
  });

  constructor() {
    effect(() => {
      const organisation = this.organisation();

      this.selectedOrganisationType.set(organisation.organisationType);
      this.selectedOrganisationStatus.set(organisation.organisationStatus);
    });

    effect(() => {
      const activeTab = this.activeTab();

      if (typeof localStorage === 'undefined') {
        return;
      }

      localStorage.setItem(this.activeTabStorageKey, activeTab);
    });
  }

  invoiceById(id: string | null) {
    return this.invoices().find((invoice) => invoice.id === id) ?? null;
  }

  openAddAdminModal(): void {
    this.addAdminOpen.set(true);
  }

  closeAddAdminModal(): void {
    this.addAdminOpen.set(false);
  }

  toggleOrganisationType(): void {
    this.organisationTypeOpen.update((open) => !open);
    this.organisationStatusOpen.set(false);
  }

  toggleOrganisationStatus(): void {
    this.organisationStatusOpen.update((open) => !open);
    this.organisationTypeOpen.set(false);
  }

  selectOrganisationType(type: string): void {
    this.selectedOrganisationType.set(type);
    this.organisationTypeOpen.set(false);
  }

  selectOrganisationStatus(status: string): void {
    this.selectedOrganisationStatus.set(status);
    this.organisationStatusOpen.set(false);
  }

  closeOrganisationDropdowns(): void {
    this.organisationTypeOpen.set(false);
    this.organisationStatusOpen.set(false);
  }

  async deleteSelectedOrganisation(): Promise<void> {
    const organisation = this.selectedOrganisation();

    if (!organisation) {
      this.toastService.warning(this.i18n.translate('settings.selectOrganisationBeforeDeleting'));
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      this.i18n.translate('settings.deleteOrganisationTitle'),
      this.i18n.translate('settings.deleteOrganisationDescription', { name: organisation.name })
    );

    if (!confirmed) {
      return;
    }

    this.organisationsFacade.removeOrganisation(organisation.id);
    this.toastService.success(this.i18n.translate('settings.organisationDeleted'));
  }

  private nameFromEmail(email: string): string {
    const localPart = email.split('@')[0] ?? 'owner';

    return localPart
      .split(/[._-]/)
      .filter(Boolean)
      .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private initialsFromName(name: string): string {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? '')
      .join('');

    return initials || 'QO';
  }

  private phoneForIndex(index: number): string {
    return `+91 98765 ${String(43210 + index * 37).padStart(5, '0')}`;
  }

  private registeredAddressForOrganisation(name: string): string {
    return `${name} Operations Tower, Suite ${900 + this.selectedOrganisationIndex()}, Bengaluru, Karnataka 560001`;
  }

  private formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US')}`;
  }

  private toRupeeCurrency(amount: string): string {
    const numericAmount = Number.parseInt(amount.replace(/[^\d]/g, ''), 10);

    if (Number.isNaN(numericAmount)) {
      return '\u20B90';
    }

    return `\u20B9${numericAmount.toLocaleString('en-IN')}`;
  }

  private toShortDate(date: string): string {
    if (date.includes('Apr')) {
      return this.i18n.translate('settings.dateShortApr2026');
    }

    if (date.includes('Mar')) {
      return this.i18n.translate('settings.dateShortMar2026');
    }

    if (date.includes('Feb')) {
      return this.i18n.translate('settings.dateShortFeb2026');
    }

    if (date.includes('Dec')) {
      return this.i18n.translate('settings.dateShortDec2025');
    }

    return this.i18n.translate('settings.dateShortJan2026');
  }

  private toShortBillingPeriod(period: string): string {
    if (period.includes('Mar')) {
      return this.i18n.translate('settings.periodMar2026');
    }

    if (period.includes('Feb')) {
      return this.i18n.translate('settings.periodFeb2026');
    }

    if (period.includes('Dec 01 - Dec 31, 2025')) {
      return this.i18n.translate('settings.periodDec2025');
    }

    if (period.includes('Nov')) {
      return this.i18n.translate('settings.periodNov2025');
    }

    return this.i18n.translate('settings.periodJan2026');
  }

  private titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private formatMemberSince(createdAt: string | undefined): string {
    if (!createdAt) {
      return this.i18n.translate('settings.recentlyAdded');
    }

    const date = new Date(createdAt);

    return date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  }

  private loadActiveTab(): string {
    if (typeof localStorage === 'undefined') {
      return this.i18n.translate('settings.tabOrganisation');
    }

    const storedTab = localStorage.getItem(this.activeTabStorageKey);

    return this.settingsTabs.includes(storedTab as (typeof this.settingsTabs)[number])
      ? storedTab!
      : this.i18n.translate('settings.tabOrganisation');
  }
}
