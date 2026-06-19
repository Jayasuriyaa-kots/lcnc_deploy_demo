import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QoSize } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-spinner',
  standalone: true,
  template: `
    @if (overlay()) {
      <div class="qo-spinner-overlay">
        <div [class]="'qo-spinner qo-spinner-' + size() + ' qo-spinner-' + color()"></div>
      </div>
    } @else {
      <div [class]="'qo-spinner qo-spinner-' + size() + ' qo-spinner-' + color()"></div>
    }
  `,
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoSpinnerComponent {
  size = input<QoSize>('md');
  color = input<'primary' | 'white' | 'neutral'>('primary');
  overlay = input<boolean>(false);
}
