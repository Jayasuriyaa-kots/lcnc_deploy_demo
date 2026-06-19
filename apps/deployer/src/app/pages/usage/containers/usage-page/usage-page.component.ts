import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CumulativeMetricsGridComponent } from '../../components/cumulative-metrics-grid/cumulative-metrics-grid.component';
import { DataSourceTableComponent } from '../../components/data-source-table/data-source-table.component';
import { UsageFilterBarComponent } from '../../components/usage-filter-bar/usage-filter-bar.component';
import { UsageFacadeService } from '../../services/usage-facade.service';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-usage-page',
  standalone: true,
  imports: [CumulativeMetricsGridComponent, DataSourceTableComponent, UsageFilterBarComponent],
  templateUrl: './usage-page.component.html',
  styleUrl: './usage-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsagePageComponent {
  private readonly facade = inject(UsageFacadeService);
  readonly i18n = inject(DeployerI18nService);

  readonly selectedOrganisation = this.facade.selectedOrganisation;
  readonly summaryMetrics = this.facade.summaryMetrics;
  readonly sourceRows = this.facade.selectedOrganisationSourceRows;
  readonly expandedSourceId = this.facade.expandedSourceId;
  readonly filters = this.facade.filters;
}
