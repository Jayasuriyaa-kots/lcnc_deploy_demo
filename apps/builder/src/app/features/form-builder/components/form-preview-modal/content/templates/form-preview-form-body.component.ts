import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';
import { FormPreviewDecisionFieldComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-decision-field.component';
import { FormPreviewFieldComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-field.component';
import { injectFormPreviewHost } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';
@Component({
  selector: 'app-form-preview-form-body',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QoButtonComponent, QoIconComponent, FormPreviewFieldComponent, FormPreviewDecisionFieldComponent],
  templateUrl: './form-preview-form-body.component.html'
})
export class FormPreviewFormBodyComponent {
  protected readonly ctx = injectFormPreviewHost();
  protected readonly t = injectFormBuilderTranslate();
}

