import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';

@Component({
  selector: 'app-outstanding-balance-card',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent],
  templateUrl: './outstanding-balance-card.component.html',
  styleUrl: './outstanding-balance-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutstandingBalanceCardComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly amount = input.required<string>();
  readonly pendingCount = input.required<string>();
  readonly dueDetail = input.required<string>();
  readonly recordPaymentRequested = output<void>();
}
