import { ChangeDetectionStrategy, Component, forwardRef, model } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseFormControlComponent } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-checkbox',
  standalone: true,
  imports: [],
  template: `
    <label class="qo-checkbox-wrapper" [class.disabled]="disabled()">
      <input
        type="checkbox"
        class="qo-checkbox-input"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="onCheckedChange($event)"
        (blur)="handleBlur()"
      />
      <span class="qo-checkbox-box" [class.checked]="checked()"></span>
      @if (label()) {
        <span class="qo-checkbox-label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QoCheckboxComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoCheckboxComponent extends BaseFormControlComponent<boolean> {
  readonly checked = model(false);

  onCheckedChange(event: Event): void {
    if (this.disabled()) {
      return;
    }

    const isChecked = (event.target as HTMLInputElement).checked;
    this.checked.set(isChecked);
    this.onChange(isChecked);
  }

  handleBlur(): void {
    this.onTouched();
  }

  protected setInternalValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
  }
}

