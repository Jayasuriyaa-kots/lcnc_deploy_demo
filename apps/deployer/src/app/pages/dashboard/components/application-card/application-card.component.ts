import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { BadgeColor, QoAvatarBadgeComponent, QoBadgeComponent, QoButtonComponent } from '@qo/ui-components';
import { ApplicationModel } from '../../models';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [QoAvatarBadgeComponent, QoBadgeComponent, QoButtonComponent],
  
  templateUrl: './application-card.component.html',
  styleUrl: './application-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationCardComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly application = input.required<ApplicationModel>();
  readonly actionsOpen = input(false);
  readonly openBuilder = output<ApplicationModel>();
  readonly deleteApplication = output<string>();
  readonly actionsToggleRequested = output<string>();
  readonly actionsCloseRequested = output<void>();

  badgeColor(status: ApplicationModel['status']): BadgeColor {
    if (status === 'live') {
      return 'success';
    }

    if (status === 'warning') {
      return 'warning';
    }

    return 'default';
  }

  toggleActionsMenu(event: Event): void {
    event.stopPropagation();
    this.actionsToggleRequested.emit(this.application().id);
  }

  closeActionsMenu(): void {
    this.actionsCloseRequested.emit();
  }

  requestDelete(): void {
    this.closeActionsMenu();
    this.deleteApplication.emit(this.application().id);
  }

  requestBuilderOpen(): void {
    this.openBuilder.emit(this.application());
  }
}
