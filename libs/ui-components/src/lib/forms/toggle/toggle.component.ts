import { ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseFormControlComponent } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-toggle',
  standalone: true,
  imports: [],
  template: `
    <label class="qo-toggle-wrapper" [class.disabled]="disabled()">
      <div class="qo-toggle-control">
        <input
          type="checkbox"
          class="qo-toggle-input"
          [checked]="resolvedChecked()"
          [disabled]="disabled()"
          (change)="onToggle($event)"
          (blur)="handleBlur()"
        />
        <div class="qo-toggle-track" [class.checked]="resolvedChecked()"></div>
        <div class="qo-toggle-thumb" [class.checked]="resolvedChecked()"></div>
      </div>
      @if (label()) {
        <span class="qo-toggle-label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './toggle.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QoToggleComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoToggleComponent extends BaseFormControlComponent<boolean> {
  checked = input<boolean | null | undefined>(undefined);

  readonly checkedChange = output<boolean>();

  private readonly checkedState = signal(false);
  readonly resolvedChecked = computed(() => {
    const externalChecked = this.checked();
    return externalChecked === undefined || externalChecked === null ? this.checkedState() : !!externalChecked;
  });

  onToggle(event: Event): void {
    if (this.disabled()) {
      return;
    }

    const isChecked = (event.target as HTMLInputElement).checked;
    this.checkedState.set(isChecked);
    this.onChange(isChecked);
    this.checkedChange.emit(isChecked);
  }

  handleBlur(): void {
    this.onTouched();
  }

  protected setInternalValue(val: boolean | null | undefined): void {
    if (val !== undefined && val !== null) {
      this.checkedState.set(!!val);
    }
  }

}
