import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';
import { QoButtonComponent, QoModalComponent } from '@qo/ui-components';
import { InvoiceModel } from '../../models';

@Component({
  selector: 'app-mark-as-paid-dialog',
  standalone: true,
  imports: [QoButtonComponent, QoModalComponent],
  templateUrl: './mark-as-paid-dialog.component.html',
  styleUrl: './mark-as-paid-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkAsPaidDialogComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly invoice = input.required<InvoiceModel>();
  readonly close = output<void>();
  readonly confirm = output<void>();
}
