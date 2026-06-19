import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface CumulativeMetric {
  label: string;
  value: string;
  meta: string;
  tone: string;
}

@Component({
  selector: 'app-cumulative-metrics-grid',
  standalone: true,
  
  templateUrl: './cumulative-metrics-grid.component.html',
  styleUrl: './cumulative-metrics-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CumulativeMetricsGridComponent {
  readonly metrics = input.required<readonly CumulativeMetric[]>();
}
