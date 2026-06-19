import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QoStatCardComponent } from '@qo/ui-components';
import { DashboardKpiModel } from '../../models';

@Component({
  selector: 'app-summary-metrics-row',
  standalone: true,
  imports: [QoStatCardComponent],
  templateUrl: './summary-metrics-row.component.html',
  styleUrl: './summary-metrics-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryMetricsRowComponent {
  readonly kpis = input.required<DashboardKpiModel[]>();

  trendDirection(tone: DashboardKpiModel['tone']): 'up' | 'neutral' | 'down' {
    if (tone === 'positive') {
      return 'up';
    }

    if (tone === 'warning') {
      return 'down';
    }

    return 'neutral';
  }
}
