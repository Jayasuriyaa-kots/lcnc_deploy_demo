import { ChangeDetectionStrategy, Component, effect, forwardRef, input, output, signal, untracked } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseFormControlComponent } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-textarea',
  standalone: true,
  template: `
    <textarea
      class="qo-textarea"
      [attr.rows]="rows()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [value]="currentValue()"
      (input)="onInput($event)"
      (blur)="handleBlur()"
    ></textarea>
  `,
  styleUrl: './textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QoTextareaComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoTextareaComponent extends BaseFormControlComponent<string> {
  readonly rows = input<number>(3);
  readonly placeholder = input<string>('');
  readonly readonly = input<boolean>(false);
  readonly value = input<string | null | undefined>(undefined);

  readonly valueChange = output<string>();

  readonly currentValue = signal('');

  constructor() {
    super();
    effect(() => {
      const nextValue = this.value();
      if (nextValue === undefined) {
        return;
      }
      untracked(() => {
        this.currentValue.set(nextValue ?? '');
      });
    }, { allowSignalWrites: true });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.currentValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  handleBlur(): void {
    this.onTouched();
  }

  protected setInternalValue(val: string | null | undefined): void {
    untracked(() => {
      this.currentValue.set(val ?? '');
    });
  }
}
