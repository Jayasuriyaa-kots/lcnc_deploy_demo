import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';
import { injectFormPreviewHost } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

@Component({
  selector: 'app-form-preview-decision-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QoButtonComponent, QoIconComponent],
  templateUrl: './form-preview-decision-field.component.html'
})
export class FormPreviewDecisionFieldComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly field = input.required<BuilderField>();
  protected readonly ctx = injectFormPreviewHost();
}

