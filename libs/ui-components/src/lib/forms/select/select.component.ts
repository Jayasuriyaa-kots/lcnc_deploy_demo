
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';
import { QoInputComponent } from '@qo/ui-components/lib/forms/input/input.component';
import { BaseFormControlComponent } from '@qo/ui-components/lib/base';

export interface SelectOption {
  label: string;
  value: string | number | boolean | null | undefined | Record<string, unknown>;
  disabled?: boolean;
}

@Component({
  selector: 'qo-select',
  standalone: true,
  imports: [QoIconComponent, QoInputComponent],
  template: `
    <div class="qo-select-wrapper" [class.qo-select-disabled]="disabled()" (click)="toggleDropdown()">
      <div
        class="qo-select-trigger"
        [class.qo-select-trigger-active]="isOpen()"
        [class]="'qo-select-' + size()">

        <span class="qo-select-value" [class.qo-select-placeholder]="!selectedOption()">
          {{ selectedOption()?.label || placeholder() }}
        </span>

        <span class="qo-select-caret">
          <qo-icon name="chevron-down" size="sm"></qo-icon>
        </span>
      </div>

      @if (isOpen() && !disabled()) {
        <div class="qo-select-dropdown">
          @if (searchable()) {
            <div class="qo-select-search" (click)="$event.stopPropagation()">
              <qo-input
                type="search"
                prefixIcon="search"
                size="md"
                [placeholder]="searchPlaceholder()"
                (valueChange)="onSearch($event)"
              ></qo-input>
            </div>
          }

          @for (option of filteredOptions(); track trackOption(option)) {
            <div
              class="qo-select-option"
              [class.qo-select-option-selected]="option.value === currentValue()"
              [class.qo-select-option-disabled]="option.disabled"
              (click)="selectOption(option, $event)">

              <span class="qo-select-option-label">{{ option.label }}</span>

              @if (option.value === currentValue()) {
                <qo-icon name="check" size="sm" class="qo-select-option-check"></qo-icon>
              }
            </div>
          } @empty {
            <div class="qo-select-empty">
              {{ searchable() && searchTerm().trim() ? 'No matching options' : 'No options available' }}
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QoSelectComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoSelectComponent extends BaseFormControlComponent<SelectOption['value']> {
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input<string>('Select an option');
  readonly searchable = input<boolean>(false);
  readonly searchPlaceholder = input<string>('Search...');
  readonly value = input<SelectOption['value']>(undefined);

  readonly valueChange = output<SelectOption['value']>();

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly currentValue = signal<SelectOption['value']>(null);
  readonly isOpen = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  readonly filteredOptions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.options();
    }

    return this.options().filter((option) => option.label.toLowerCase().includes(term));
  });

  readonly selectedOption = computed(() => this.options().find((opt) => opt.value === this.currentValue()));

  constructor() {
    super();
    effect(() => {
      const nextValue = this.value();
      if (nextValue === undefined) {
        return;
      }
      untracked(() => {
        this.currentValue.set(nextValue);
      });
    }, { allowSignalWrites: true });
  }

  trackOption(option: SelectOption): SelectOption['value'] {
    return option.value;
  }

  toggleDropdown(): void {
    if (this.disabled()) {
      return;
    }

    this.isOpen.update((value) => !value);

    if (!this.isOpen()) {
      this.searchTerm.set('');
      this.onTouched();
    }
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  selectOption(option: SelectOption, event: Event): void {
    event.stopPropagation();

    if (option.disabled) {
      return;
    }

    this.currentValue.set(option.value);
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.onChange(option.value);
    this.valueChange.emit(option.value);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node | null) && this.isOpen()) {
      this.isOpen.set(false);
      this.searchTerm.set('');
      this.onTouched();
    }
  }

  protected setInternalValue(val: SelectOption['value'] | null | undefined): void {
    if (val === undefined) {
      return;
    }

    untracked(() => {
      this.currentValue.set(val);
    });
  }
}
