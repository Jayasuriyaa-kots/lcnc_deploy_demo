import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'qo-filter-pills',
  standalone: true,
  template: `
    <div class="qo-filter-pills">
      @for (option of options(); track option) {
        <button
          type="button"
          class="qo-filter-pill"
          [class.qo-filter-pill-active]="option === active()"
          (click)="activeChange.emit(option)">
          {{ option }}
        </button>
      }
    </div>
  `,
  styleUrl: './filter-pills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoFilterPillsComponent {
  options = input.required<string[]>();
  active = input.required<string>();

  activeChange = output<string>();
}
