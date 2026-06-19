import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';
import { QoButtonComponent, QoModalComponent } from '@qo/ui-components';
import { InvoiceModel } from '../../models';

@Component({
  selector: 'app-invoice-detail-dialog',
  standalone: true,
  imports: [QoButtonComponent, QoModalComponent],
  templateUrl: './invoice-detail-dialog.component.html',
  styleUrl: './invoice-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailDialogComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly invoice = input.required<InvoiceModel>();
  readonly close = output<void>();
}
