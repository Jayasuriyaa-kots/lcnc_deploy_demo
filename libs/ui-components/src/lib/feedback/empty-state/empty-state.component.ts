import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';

@Component({
  selector: 'qo-empty-state',
  standalone: true,
  imports: [QoIconComponent],
  template: `
    <div class="qo-empty-state">
      @if (icon()) {
        <div class="qo-empty-icon-wrapper">
          <qo-icon [name]="icon()!" size="lg" class="qo-empty-icon"></qo-icon>
        </div>
      }
      <h3 class="qo-empty-title">{{ title() }}</h3>
      @if (description()) {
        <p class="qo-empty-description">{{ description() }}</p>
      }
      <div class="qo-empty-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './empty-state.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoEmptyStateComponent {
  title = input.required<string>();
  description = input<string | undefined>(undefined);
  icon = input<string | undefined>(undefined);
}

