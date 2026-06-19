import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SettingsInvoiceRow } from '../../models';
import { InvoiceListComponent } from '../../components/invoice-list/invoice-list.component';

@Component({
  selector: 'app-settings-invoices-tab',
  standalone: true,
  imports: [InvoiceListComponent],
  templateUrl: './settings-invoices-tab.component.html',
  styleUrl: './settings-invoices-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsInvoicesTabComponent {
  readonly invoiceRows = input.required<readonly SettingsInvoiceRow[]>();
}
