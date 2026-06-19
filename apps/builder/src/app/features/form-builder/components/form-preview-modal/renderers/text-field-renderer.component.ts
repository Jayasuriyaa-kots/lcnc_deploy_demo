import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

@Component({
  selector: 'app-text-field-renderer',
  standalone: true,
  template: `
    <input
      class="preview-field__control"
      [type]="type()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="onInput($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextFieldRendererComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly value = input('');
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.valueChange.emit(target.value);
  }
}
