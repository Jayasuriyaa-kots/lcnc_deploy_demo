import { computed, Injectable, inject, signal } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { SettingsFacadeService } from '../../services/settings-facade.service';
import { RecordPaymentPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentsSettingsFacadeService {
  private readonly facade = inject(SettingsFacadeService);
  private readonly i18n = inject(DeployerI18nService);

  readonly payments = this.facade.payments;
  readonly paymentRows = this.facade.paymentRows;
  readonly outstandingAmount = this.facade.outstandingAmount;
  readonly pendingCount = this.facade.pendingCount;
  readonly dueDetail = this.facade.dueDetail;
  readonly recordPaymentOpen = signal(false);
  readonly invoiceOpen = signal(false);
  readonly paymentMethodOpen = signal(false);
  readonly invoiceOptions = [this.i18n.translate('settings.invoiceOptionPending')] as const;
  readonly paymentMethods = [
    this.i18n.translate('settings.paymentMethodBankTransferNeft'),
    this.i18n.translate('settings.paymentMethodUpi'),
    this.i18n.translate('settings.paymentMethodCheque')
  ] as const;
  readonly selectedInvoice = signal<string>(this.invoiceOptions[0]);
  readonly selectedPaymentMethod = signal<string>(this.paymentMethods[0]);
  readonly selectedPaymentDate = signal('2026-04-01');
  readonly amountPaid = signal('');
  readonly referenceNumber = signal('');
  readonly lastRecordedPayment = signal<RecordPaymentPayload | null>(null);
  readonly paymentDateValue = computed(() => this.formatPaymentDate(this.selectedPaymentDate()));

  openRecordPaymentModal(): void {
    this.amountPaid.set('');
    this.referenceNumber.set('');
    this.recordPaymentOpen.set(true);
  }

  toggleInvoice(): void {
    this.invoiceOpen.update((open) => !open);
    this.paymentMethodOpen.set(false);
  }

  togglePaymentMethod(): void {
    this.paymentMethodOpen.update((open) => !open);
    this.invoiceOpen.set(false);
  }

  selectInvoice(invoice: string): void {
    this.selectedInvoice.set(invoice);
    this.invoiceOpen.set(false);
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod.set(method);
    this.paymentMethodOpen.set(false);
  }

  closeDropdowns(): void {
    this.invoiceOpen.set(false);
    this.paymentMethodOpen.set(false);
  }

  closeRecordPaymentModal(): void {
    this.recordPaymentOpen.set(false);
    this.closeDropdowns();
  }

  recordPayment(payload: RecordPaymentPayload): void {
    this.lastRecordedPayment.set(payload);
    this.closeRecordPaymentModal();
  }

  setAmountPaid(value: string): void {
    this.amountPaid.set(value);
  }

  setReferenceNumber(value: string): void {
    this.referenceNumber.set(value);
  }

  selectPaymentDate(value: string): void {
    if (!value) {
      return;
    }

    this.selectedPaymentDate.set(value);
  }

  private formatPaymentDate(value: string): string {
    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
      return value;
    }

    return `${day}-${month}-${year}`;
  }
}
