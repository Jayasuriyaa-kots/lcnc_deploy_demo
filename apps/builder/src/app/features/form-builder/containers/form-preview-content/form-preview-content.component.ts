import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';

import { FormPreviewContentBase } from '@builder/features/form-builder/components/form-preview-modal/content/base/form-preview-content.base';
import { FormPreviewFormBodyComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-form-body.component';
import { FormPreviewOverlaysComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-overlays.component';
import { FORM_PREVIEW_HOST } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';
import { FormPreviewModalFacade } from '@builder/features/form-builder/components/form-preview-modal/state/form-preview-modal.facade';
import { FormPreviewBrowserMediaService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-browser-media.service';
import { FormPreviewOverlayElements } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-overlay-elements.service';
import { FormPreviewValidationService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-validation.service';
import { FormPreviewMediaService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-media.service';
import { FormPreviewRichTextService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-rich-text.service';
import { FormPreviewSignatureService } from '@builder/features/form-builder/components/form-preview-modal/services/form-preview-signature.service';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

/** Smart preview host: owns scoped facade/media state for the modal simulator. */
@Component({
  selector: 'app-form-preview-content',
  standalone: true,
  providers: [
    FormPreviewModalFacade,
    FormPreviewBrowserMediaService,
    FormPreviewOverlayElements,
    FormPreviewValidationService,
    FormPreviewMediaService,
    FormPreviewRichTextService,
    FormPreviewSignatureService,
    { provide: FORM_PREVIEW_HOST, useExisting: FormPreviewContentComponent }
  ],
  imports: [QoButtonComponent, QoIconComponent, FormPreviewFormBodyComponent, FormPreviewOverlaysComponent],
  templateUrl: './form-preview-content.component.html',
  styleUrl: './form-preview-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FormPreviewContentComponent extends FormPreviewContentBase {
  override readonly t = injectFormBuilderTranslate();
  protected override readonly previewFacade = inject(FormPreviewModalFacade);
  protected override readonly browserMedia = inject(FormPreviewBrowserMediaService);
  protected override readonly overlayElements = inject(FormPreviewOverlayElements);
}
