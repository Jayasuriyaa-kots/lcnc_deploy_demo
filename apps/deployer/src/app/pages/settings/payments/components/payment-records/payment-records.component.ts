import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';
import {
  QoEmptyStateComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableEmptyDirective,
  TableRow
} from '@qo/ui-components';
import { SettingsPaymentRow } from '../../models';

@Component({
  selector: 'app-payment-records',
  standalone: true,
  imports: [QoEmptyStateComponent, QoTableColumnDirective, QoTableComponent, QoTableEmptyDirective],
  templateUrl: './payment-records.component.html',
  styleUrl: './payment-records.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentRecordsComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly payments = input.required<readonly SettingsPaymentRow[]>();
  readonly paymentRows = () => this.payments() as unknown as TableRow[];

  paymentStatusTone(status: SettingsPaymentRow['status']): string {
    return `payment-status--${status}`;
  }
}
