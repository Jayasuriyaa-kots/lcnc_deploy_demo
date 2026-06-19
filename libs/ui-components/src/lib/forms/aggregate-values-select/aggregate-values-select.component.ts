import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseFormControlComponent } from '@qo/ui-components/lib/base';

export type AggregateTab = 'sum' | 'count';

export interface AggregateOption {
  value: string;
  label: string;
}

export interface AggregateValueSelection {
  tab: AggregateTab | null;
  value: string | null;
}

@Component({
  selector: 'qo-aggregate-values-select',
  standalone: true,
  imports: [],
  templateUrl: './aggregate-values-select.component.html',
  styleUrl: './aggregate-values-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QoAggregateValuesSelectComponent),
      multi: true,
    },
  ],
})
export class QoAggregateValuesSelectComponent extends BaseFormControlComponent<AggregateValueSelection> {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly showLabel = input<boolean>(true);
  readonly placeholder = input<string>('Select values');
  readonly emptyStateLabel = input<string>('No matches found');
  readonly sumOptions = input<AggregateOption[]>([]);
  readonly countOptions = input<AggregateOption[]>([]);

  readonly isOpen = signal(false);
  readonly activeTab = signal<AggregateTab>('sum');
  readonly selectedTab = signal<AggregateTab | null>(null);
  readonly selectedValue = signal<string | null>(null);

  readonly currentOptions = computed(() =>
    this.activeTab() === 'sum' ? this.sumOptions() : this.countOptions(),
  );

  readonly selectedLabel = computed(() => {
    if (!this.selectedValue() || !this.selectedTab()) {
      return '';
    }

    const source = this.selectedTab() === 'sum' ? this.sumOptions() : this.countOptions();
    return source.find((item) => item.value === this.selectedValue())?.label ?? '';
  });

  toggleDropdown(): void {
    if (this.disabled()) {
      return;
    }

    this.isOpen.update((open) => !open);
    this.onTouched();
  }

  setTab(tab: AggregateTab): void {
    this.activeTab.set(tab);
  }

  selectOption(option: AggregateOption): void {
    this.selectedTab.set(this.activeTab());
    this.selectedValue.set(option.value);
    this.onChange({
      tab: this.selectedTab(),
      value: this.selectedValue(),
    });
    this.isOpen.set(false);
    this.onTouched();
  }

  protected setInternalValue(value: AggregateValueSelection | null | undefined): void {
    this.selectedTab.set(value?.tab ?? null);
    this.selectedValue.set(value?.value ?? null);
    this.activeTab.set(value?.tab ?? 'sum');
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }
}
