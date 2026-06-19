import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'qo-card',
  standalone: true,
  template: `
    <div class="qo-card" [class.qo-card-hoverable]="hoverable()">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './card.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoCardComponent {
  hoverable = input<boolean>(false);
}

@Component({
  selector: 'qo-card-header',
  standalone: true,
  template: `
    <div class="qo-card-header" [class.qo-card-header-bordered]="bordered()">
      <div class="qo-card-header-content">
        <h3 class="qo-card-title">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="qo-card-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="qo-card-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class QoCardHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>(undefined);
  bordered = input<boolean>(true);
}

