import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export interface Metric {
  label: string;
  value: string | number;
}

@Component({
  selector: 'qo-metric-strip',
  standalone: true,
  template: `
    <div class="qo-metric-strip">
      @for (metric of metrics(); track metric.label) {
        <div class="qo-metric-item">
          <span class="qo-metric-label">{{ metric.label }}</span>
          <span class="qo-metric-value">{{ metric.value }}</span>
        </div>
        @if (!$last) {
          <div class="qo-metric-divider"></div>
        }
      }
    </div>
  `,
  styleUrl: './metric-strip.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoMetricStripComponent {
  metrics = input<Metric[]>([]);
}

