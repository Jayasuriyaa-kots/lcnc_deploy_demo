import { Component, ChangeDetectionStrategy, effect, forwardRef, input, output, signal, untracked } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { QoIconComponent } from '../../primitives/icon/icon.component';
import { BaseFormControlComponent } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-input',
  standalone: true,
  imports: [QoIconComponent],
  template: `
    <div class="qo-input-wrapper" [class.qo-input-disabled]="disabled()">
      @if (prefixIcon()) {
        <span class="qo-input-prefix">
          <qo-icon [name]="prefixIcon()!" size="sm"></qo-icon>
        </span>
      }
      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [class]="'qo-input-element qo-input-' + size()"
        [class.has-prefix]="prefixIcon()"
        [class.has-suffix]="suffixIcon()"
        [value]="currentValue()"
        (input)="onInput($event)"
        (blur)="handleBlur()"
      />
      @if (suffixIcon()) {
        <span class="qo-input-suffix">
          <qo-icon [name]="suffixIcon()!" size="sm"></qo-icon>
        </span>
      }
    </div>
  `,
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QoInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoInputComponent extends BaseFormControlComponent<string> {
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'date' | 'time' | 'datetime-local' | 'tel'>('text');
  readonly placeholder = input<string>('');
  readonly readonly = input<boolean>(false);
  readonly prefixIcon = input<string | undefined>(undefined);
  readonly suffixIcon = input<string | undefined>(undefined);
  readonly value = input<string | number | null | undefined>(undefined);

  readonly valueChange = output<string>();
  readonly currentValue = signal<string>('');

  constructor() {
    super();
    effect(() => {
      const nextValue = this.value();
      if (nextValue === undefined) {
        return;
      }
      untracked(() => {
        this.currentValue.set(nextValue == null ? '' : String(nextValue));
      });
    }, { allowSignalWrites: true });
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.currentValue.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
  }

  handleBlur(): void {
    this.onTouched();
  }

  protected setInternalValue(val: string | null | undefined): void {
    untracked(() => {
      this.currentValue.set(val == null ? '' : String(val));
    });
  }
}
