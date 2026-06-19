import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'qo-table-wrapper',
  standalone: true,
  template: `
    <div class="qo-table-wrapper">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './table-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoTableWrapperComponent {}
