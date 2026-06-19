import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';
import {
  QoButtonComponent,
  QoFormFieldComponent,
  QoIconComponent,
  QoInputComponent,
  QoModalComponent,
  QoSelectComponent,
  SelectOption
} from '@qo/ui-components';
import { RecordPaymentPayload } from '../../models';

@Component({
  selector: 'app-record-payment-modal',
  standalone: true,
  imports: [QoButtonComponent, QoFormFieldComponent, QoIconComponent, QoInputComponent, QoModalComponent, QoSelectComponent],
  templateUrl: './record-payment-modal.component.html',
  styleUrl: './record-payment-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordPaymentModalComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly invoiceOptions = input.required<readonly string[]>();
  readonly paymentMethods = input.required<readonly string[]>();
  readonly invoiceOpen = input.required<boolean>();
  readonly paymentMethodOpen = input.required<boolean>();
  readonly selectedInvoice = input.required<string>();
  readonly selectedPaymentMethod = input.required<string>();
  readonly amountPlaceholder = input.required<string>();
  readonly amountPaid = input.required<string>();
  readonly referenceNumber = input.required<string>();
  readonly paymentDateValue = input.required<string>();
  readonly paymentDateNativeValue = input.required<string>();
  readonly close = output<void>();
  readonly toggleInvoice = output<void>();
  readonly togglePaymentMethod = output<void>();
  readonly invoiceSelect = output<string>();
  readonly paymentMethodSelect = output<string>();
  readonly paymentDateSelect = output<string>();
  readonly dismissDropdowns = output<void>();
  readonly amountPaidChange = output<string>();
  readonly referenceNumberChange = output<string>();
  readonly recordPayment = output<RecordPaymentPayload>();
  readonly invoiceSelectOptions = computed<SelectOption[]>(() =>
    this.invoiceOptions().map((invoice) => ({ label: invoice, value: invoice }))
  );
  readonly paymentMethodOptions = computed<SelectOption[]>(() =>
    this.paymentMethods().map((method) => ({ label: method, value: method }))
  );

  onInvoiceChange(value: SelectOption['value']): void {
    if (typeof value === 'string') {
      this.invoiceSelect.emit(value);
    }
  }

  onPaymentMethodChange(value: SelectOption['value']): void {
    if (typeof value === 'string') {
      this.paymentMethodSelect.emit(value);
    }
  }

  updateAmountPaid(value: string): void {
    this.amountPaidChange.emit(value);
  }

  updateReferenceNumber(value: string): void {
    this.referenceNumberChange.emit(value);
  }

  submitPayment(): void {
    this.recordPayment.emit({
      invoice: this.selectedInvoice(),
      amount: this.amountPaid(),
      paymentDate: this.paymentDateNativeValue(),
      referenceNumber: this.referenceNumber(),
      paymentMethod: this.selectedPaymentMethod()
    });
  }
}
