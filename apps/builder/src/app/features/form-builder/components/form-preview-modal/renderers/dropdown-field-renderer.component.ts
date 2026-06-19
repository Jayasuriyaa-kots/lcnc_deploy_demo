import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { QoSelectComponent } from '@qo/ui-components';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

interface SelectOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown-field-renderer',
  standalone: true,
  imports: [QoSelectComponent],
  template: `<qo-select class="preview-qo-select" [options]="options()" [value]="value()" [placeholder]="resolvedPlaceholder()" (valueChange)="valueChange.emit(String($event ?? ''))"></qo-select>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownFieldRendererComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly options = input<SelectOption[]>([]);
  readonly value = input('');
  readonly placeholder = input('');
  readonly valueChange = output<string>();
  readonly String = String;
  readonly resolvedPlaceholder = computed(() => this.placeholder() || this.t('preview.selectOption'));
}
