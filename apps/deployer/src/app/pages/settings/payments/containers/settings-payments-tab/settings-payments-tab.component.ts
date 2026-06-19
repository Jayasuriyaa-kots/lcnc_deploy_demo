import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RecordPaymentPayload, SettingsPaymentRow } from '../../models';
import { OutstandingBalanceCardComponent } from '../../components/outstanding-balance-card/outstanding-balance-card.component';
import { PaymentRecordsComponent } from '../../components/payment-records/payment-records.component';
import { RecordPaymentModalComponent } from '../../components/record-payment-modal/record-payment-modal.component';
import { PaymentsSettingsFacadeService } from '../../services/payments-settings.service';

@Component({
  selector: 'app-settings-payments-tab',
  standalone: true,
  imports: [OutstandingBalanceCardComponent, PaymentRecordsComponent, RecordPaymentModalComponent],
  templateUrl: './settings-payments-tab.component.html',
  styleUrl: './settings-payments-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPaymentsTabComponent {
  private readonly paymentsSettings = inject(PaymentsSettingsFacadeService);

  readonly paymentRows = input.required<readonly SettingsPaymentRow[]>();
  readonly outstandingAmount = input.required<string>();
  readonly pendingCount = input.required<string>();
  readonly dueDetail = input.required<string>();
  readonly recordPaymentOpen = this.paymentsSettings.recordPaymentOpen;
  readonly invoiceOpen = this.paymentsSettings.invoiceOpen;
  readonly paymentMethodOpen = this.paymentsSettings.paymentMethodOpen;
  readonly invoiceOptions = this.paymentsSettings.invoiceOptions;
  readonly paymentMethods = this.paymentsSettings.paymentMethods;
  readonly selectedInvoice = this.paymentsSettings.selectedInvoice;
  readonly selectedPaymentMethod = this.paymentsSettings.selectedPaymentMethod;
  readonly selectedPaymentDate = this.paymentsSettings.selectedPaymentDate;
  readonly amountPaid = this.paymentsSettings.amountPaid;
  readonly referenceNumber = this.paymentsSettings.referenceNumber;
  readonly paymentDateValue = this.paymentsSettings.paymentDateValue;

  openRecordPaymentModal(): void {
    this.paymentsSettings.openRecordPaymentModal();
  }

  toggleInvoice(): void {
    this.paymentsSettings.toggleInvoice();
  }

  togglePaymentMethod(): void {
    this.paymentsSettings.togglePaymentMethod();
  }

  selectInvoice(invoice: string): void {
    this.paymentsSettings.selectInvoice(invoice);
  }

  selectPaymentMethod(method: string): void {
    this.paymentsSettings.selectPaymentMethod(method);
  }

  closeDropdowns(): void {
    this.paymentsSettings.closeDropdowns();
  }

  closeRecordPaymentModal(): void {
    this.paymentsSettings.closeRecordPaymentModal();
  }

  selectPaymentDate(value: string): void {
    this.paymentsSettings.selectPaymentDate(value);
  }

  setAmountPaid(value: string): void {
    this.paymentsSettings.setAmountPaid(value);
  }

  setReferenceNumber(value: string): void {
    this.paymentsSettings.setReferenceNumber(value);
  }

  recordPayment(payload: RecordPaymentPayload): void {
    this.paymentsSettings.recordPayment(payload);
  }
}
