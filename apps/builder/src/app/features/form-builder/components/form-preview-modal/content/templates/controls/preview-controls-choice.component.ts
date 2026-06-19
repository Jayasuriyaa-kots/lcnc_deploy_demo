import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';
import {
  FORM_PREVIEW_FIELD_UI_IMPORTS,
  injectFormPreviewHost
} from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';

@Component({
  selector: 'app-preview-controls-choice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: FORM_PREVIEW_FIELD_UI_IMPORTS,
  templateUrl: './preview-controls-choice.component.html'
})
export class PreviewControlsChoiceComponent {
  readonly field = input.required<BuilderField>();
  protected readonly ctx = injectFormPreviewHost();
  protected readonly t = injectFormBuilderTranslate();
}

