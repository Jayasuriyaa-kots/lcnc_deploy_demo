import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { QoIconComponent } from '@qo/ui-components';
import { FormPreviewFieldControlsComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-field-controls.component';
import { injectFormPreviewHost } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

@Component({
  selector: 'app-form-preview-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QoIconComponent, FormPreviewFieldControlsComponent],
  templateUrl: './form-preview-field.component.html'
})
export class FormPreviewFieldComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly field = input.required<BuilderField>();
  protected readonly ctx = injectFormPreviewHost();
}

