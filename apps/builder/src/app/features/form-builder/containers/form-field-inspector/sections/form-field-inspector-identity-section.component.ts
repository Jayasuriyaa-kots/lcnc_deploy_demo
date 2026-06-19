import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { QoButtonComponent, QoCheckboxComponent, QoIconComponent, QoInputComponent, QoSelectComponent } from '@qo/ui-components';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
@Component({
  selector: 'app-form-field-inspector-identity-section',
  standalone: true,
  imports: [CommonModule, QoButtonComponent, QoCheckboxComponent, QoIconComponent, QoInputComponent, QoSelectComponent],
  templateUrl: './form-field-inspector-identity-section.component.html',
  styleUrl: '../form-field-inspector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldInspectorIdentitySectionComponent {
  protected readonly t = injectFormBuilderTranslate();

  readonly field = input.required<BuilderField>();
  readonly context = input.required<any>();

  get selectedField(): BuilderField { return this.field(); }
  get ctx(): any { return this.context(); }
}
