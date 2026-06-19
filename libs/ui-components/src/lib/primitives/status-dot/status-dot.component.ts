import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'qo-status-dot',
  standalone: true,
  imports: [],
  template: `
    <div class="qo-status-dot-wrapper">
      <div class="qo-status-dot" [class]="'qo-status-dot-' + color()">
        @if (ping()) {
          <div class="qo-status-dot-ping"></div>
        }
      </div>
      @if (label()) {
        <span class="qo-status-label">{{ label() }}</span>
      }
    </div>
  `,
  styleUrl: './status-dot.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoStatusDotComponent {
  color = input<StatusColor>('neutral');
  label = input<string | undefined>(undefined);
  ping = input<boolean>(false);
}

