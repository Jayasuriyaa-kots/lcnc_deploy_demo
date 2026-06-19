import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';
import {
  QoButtonComponent,
  QoEmptyStateComponent,
  QoIconComponent,
  QoTableColumnDirective,
  QoTableComponent,
  QoTableEmptyDirective,
  TableRow
} from '@qo/ui-components';
import { SettingsInvoiceRow } from '../../models';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [QoButtonComponent, QoEmptyStateComponent, QoIconComponent, QoTableColumnDirective, QoTableComponent, QoTableEmptyDirective],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceListComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly invoices = input.required<readonly SettingsInvoiceRow[]>();
  readonly invoiceRows = () => this.invoices() as unknown as TableRow[];

  invoiceStatusTone(status: SettingsInvoiceRow['status']): string {
    return `invoice-status--${status}`;
  }
}
