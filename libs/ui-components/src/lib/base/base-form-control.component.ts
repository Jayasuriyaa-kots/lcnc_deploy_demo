import { Directive } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BaseControlComponent } from './base-control.component';

@Directive()
export abstract class BaseFormControlComponent<T> extends BaseControlComponent implements ControlValueAccessor {
  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: T | null | undefined): void {
    this.setInternalValue(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_: boolean): void {
    // Disabled state is driven through the shared signal input.
  }

  protected abstract setInternalValue(value: T | null | undefined): void;
}
