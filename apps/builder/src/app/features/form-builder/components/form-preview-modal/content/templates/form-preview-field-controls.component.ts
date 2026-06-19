import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormFieldRendererComponent } from '@builder/features/form-builder/components/form-preview-modal/dispatcher/form-field-renderer.component';
import { injectPreviewViewSync } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

@Component({
  selector: 'app-form-preview-field-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldRendererComponent],
  template: `<app-form-field-renderer [field]="field()" />`
})
export class FormPreviewFieldControlsComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly field = input.required<BuilderField>();

  constructor() {
    injectPreviewViewSync();
  }
}
