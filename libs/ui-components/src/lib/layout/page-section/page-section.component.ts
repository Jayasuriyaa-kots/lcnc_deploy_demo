import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'qo-page-section',
  standalone: true,
  template: `
    <section class="qo-page-section">
      <header class="qo-page-section-header">
        <div class="qo-page-section-copy">
          @if (eyebrow()) {
            <div class="qo-page-section-eyebrow">{{ eyebrow() }}</div>
          }
          <h2 class="qo-page-section-title">{{ title() }}</h2>
          @if (description()) {
            <p class="qo-page-section-description">{{ description() }}</p>
          }
        </div>
        <div class="qo-page-section-actions">
          <ng-content select="[section-actions]"></ng-content>
        </div>
      </header>

      <ng-content></ng-content>
    </section>
  `,
  styleUrl: './page-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoPageSectionComponent {
  title = input.required<string>();
  eyebrow = input('');
  description = input('');
}
