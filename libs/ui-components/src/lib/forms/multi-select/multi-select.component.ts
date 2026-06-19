import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import {
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';
import { QoInputComponent } from '@qo/ui-components/lib/forms/input/input.component';
import { BaseFormControlComponent } from '@qo/ui-components/lib/base';

export interface QoMultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'qo-multi-select',
  standalone: true,
  imports: [ReactiveFormsModule, QoIconComponent, QoInputComponent],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QoMultiSelectComponent),
      multi: true,
    },
  ],
})
export class QoMultiSelectComponent extends BaseFormControlComponent<Array<string | number>> {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly showLabel = input<boolean>(true);
  readonly placeholder = input<string>('Select Fields');
  readonly searchPlaceholder = input<string>('Search...');
  readonly options = input<QoMultiSelectOption[]>([]);

  readonly selectionChange = output<QoMultiSelectOption[]>();

  readonly isOpen = signal(false);
  readonly selectedValues = signal<Array<string | number>>([]);
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly filteredOptions = computed(() => {
    const query = this.searchControl.value.trim().toLowerCase();
    const items = this.options();

    if (!query) {
      return items;
    }

    return items.filter((option) => option.label.toLowerCase().includes(query));
  });

  readonly selectedOptions = computed(() => {
    const values = this.selectedValues();
    return this.options().filter((option) => values.includes(option.value));
  });

  toggleDropdown(): void {
    if (this.disabled()) {
      return;
    }

    this.isOpen.update((open) => !open);

    if (this.isOpen()) {
      this.searchControl.setValue('');
    }

    this.onTouched();
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  isSelected(value: string | number): boolean {
    return this.selectedValues().includes(value);
  }

  toggleOption(option: QoMultiSelectOption, event?: Event): void {
    event?.stopPropagation();

    if (option.disabled) {
      return;
    }

    const current = this.selectedValues();
    const next = current.includes(option.value)
      ? current.filter((value) => value !== option.value)
      : [...current, option.value];

    this.selectedValues.set(next);
    this.onChange(next);
    this.selectionChange.emit(this.selectedOptions());
  }

  removeChip(value: string | number, event?: Event): void {
    event?.stopPropagation();

    const next = this.selectedValues().filter((item) => item !== value);
    this.selectedValues.set(next);
    this.onChange(next);
    this.selectionChange.emit(this.selectedOptions());
  }

  protected setInternalValue(value: Array<string | number> | null | undefined): void {
    this.selectedValues.set(Array.isArray(value) ? value : []);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  @HostListener('keydown.escape')
  handleEscape(): void {
    this.closeDropdown();
  }
}
