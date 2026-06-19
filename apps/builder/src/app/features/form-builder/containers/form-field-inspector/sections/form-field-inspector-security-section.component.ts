import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { QoCheckboxComponent, QoSelectComponent, QoTextareaComponent } from '@qo/ui-components';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
@Component({
  selector: 'app-form-field-inspector-security-section',
  standalone: true,
  imports: [CommonModule, QoCheckboxComponent, QoSelectComponent, QoTextareaComponent],
  templateUrl: './form-field-inspector-security-section.component.html',
  styleUrl: '../form-field-inspector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldInspectorSecuritySectionComponent {
  protected readonly t = injectFormBuilderTranslate();

  readonly field = input.required<BuilderField>();
  readonly context = input.required<any>();

  get selectedField(): BuilderField { return this.field(); }
  get ctx(): any { return this.context(); }
}
