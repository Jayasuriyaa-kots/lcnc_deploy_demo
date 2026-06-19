import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BaseControlComponent } from '../../base';

@Component({
  selector: 'qo-stat-card',
  standalone: true,
  imports: [],
  template: `
    <div class="qo-stat-card">
      <div class="qo-stat-header">
        <span class="qo-stat-label">{{ label() }}</span>
      </div>
      <div class="qo-stat-body">
        <div class="qo-stat-value">
          {{ value() }}
        </div>
        @if (trend()) {
          <span class="qo-stat-trend" [class]="'qo-stat-trend-' + trendDirection()">
            {{ trend() }}
          </span>
        }
      </div>
      @if (description()) {
        <div class="qo-stat-description">
          {{ description() }}
        </div>
      }
    </div>
  `,
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoStatCardComponent extends BaseControlComponent {
  override readonly label = input.required<string>();
  value = input.required<string | number>();
  trend = input<string | undefined>(undefined);
  trendDirection = input<'up' | 'down' | 'neutral'>('neutral');
  description = input<string | undefined>(undefined);
}

