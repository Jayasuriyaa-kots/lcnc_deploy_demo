import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { QoFilterPillsComponent, QoSearchBarComponent } from '@qo/ui-components';

@Component({
  selector: 'app-user-filter-bar',
  standalone: true,
  imports: [QoFilterPillsComponent, QoSearchBarComponent],
  templateUrl: './user-filter-bar.component.html',
  styleUrl: './user-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFilterBarComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly activeFilter = input.required<string>();
  readonly count = input.required<number>();
  readonly searchChange = output<string>();
  readonly activeFilterChange = output<string>();
}
