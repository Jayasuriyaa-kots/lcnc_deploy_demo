import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { QoEmptyStateComponent } from '@qo/ui-components';
import { ApplicationModel } from '../../models';
import { ApplicationCardComponent } from '../application-card/application-card.component';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [ApplicationCardComponent, QoEmptyStateComponent],
  
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationListComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly applications = input.required<ApplicationModel[]>();
  readonly openActionsApplicationId = input<string | null>(null);
  readonly openBuilder = output<ApplicationModel>();
  readonly deleteApplication = output<string>();
  readonly actionsToggleRequested = output<string>();
  readonly actionsCloseRequested = output<void>();
}
