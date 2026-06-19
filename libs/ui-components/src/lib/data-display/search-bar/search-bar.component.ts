import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { QoSize } from '@qo/ui-components/lib/base';
import { QoInputComponent } from '@qo/ui-components/lib/forms/input/input.component';

@Component({
  selector: 'qo-search-bar',
  standalone: true,
  imports: [QoInputComponent],
  template: `
    <div class="qo-search-bar">
      <qo-input
        [placeholder]="placeholder()"
        prefixIcon="search"
        [size]="size()"
        (valueChange)="onSearch($event)">
      </qo-input>
    </div>
  `,
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoSearchBarComponent {
  placeholder = input<string>('Search...');
  size = input<QoSize>('md');
  debounceTime = input<number>(300);

  search = output<string>();

  private readonly latestValue = signal('');
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  onSearch(value: string): void {
    if (value === this.latestValue()) {
      return;
    }

    this.latestValue.set(value);

    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
    }

    this.debounceHandle = setTimeout(() => {
      this.search.emit(this.latestValue());
    }, this.debounceTime());
  }
}
