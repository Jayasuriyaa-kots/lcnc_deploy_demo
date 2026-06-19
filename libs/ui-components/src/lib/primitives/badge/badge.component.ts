import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { QoBadgeColor, QoSize } from '@qo/ui-components/lib/base';

export type BadgeColor = QoBadgeColor;

@Component({
  selector: 'qo-badge',
  standalone: true,
  template: `
    <span [class]="'qo-badge qo-badge-' + color() + ' qo-badge-' + size()" [class.qo-badge-outlined]="outlined()">
      @if (dot()) {
        <span class="qo-badge-dot"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './badge.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoBadgeComponent {
  readonly color = input<QoBadgeColor>('default');
  readonly size = input<QoSize>('sm');
  readonly dot = input<boolean>(false);
  readonly outlined = input<boolean>(false);
}

