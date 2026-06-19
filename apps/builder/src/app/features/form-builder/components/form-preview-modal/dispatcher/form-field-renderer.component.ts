import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { PreviewControlsChoiceComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/controls/preview-controls-choice.component';
import { PreviewControlsDateTimeComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/controls/preview-controls-date-time.component';
import { PreviewControlsMediaComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/controls/preview-controls-media.component';
import { PreviewControlsNameAddressComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/controls/preview-controls-name-address.component';
import { PreviewControlsPhoneComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/controls/preview-controls-phone.component';
import { PreviewControlsPrimitivesComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/controls/preview-controls-primitives.component';
import { PreviewControlsRichTextComponent } from '@builder/features/form-builder/components/form-preview-modal/content/templates/controls/preview-controls-rich-text.component';
import { injectPreviewViewSync } from '@builder/features/form-builder/components/form-preview-modal/content/templates/form-preview-template.utils';
import { resolvePreviewFieldControlSlug } from './form-preview-field-routing.util';
import { injectFormBuilderTranslate } from '@builder/features/form-builder/services/form-builder-i18n.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-form-field-renderer',
  standalone: true,
  imports: [
    PreviewControlsNameAddressComponent,
    PreviewControlsPhoneComponent,
    PreviewControlsChoiceComponent,
    PreviewControlsRichTextComponent,
    PreviewControlsMediaComponent,
    PreviewControlsDateTimeComponent,
    PreviewControlsPrimitivesComponent
  ],
  template: `
    @switch (controlSlug()) {
      @case ('name-address') {
        <app-preview-controls-name-address [field]="field()" />
      }
      @case ('phone') {
        <app-preview-controls-phone [field]="field()" />
      }
      @case ('choice') {
        <app-preview-controls-choice [field]="field()" />
      }
      @case ('rich-text') {
        <app-preview-controls-rich-text [field]="field()" />
      }
      @case ('media') {
        <app-preview-controls-media [field]="field()" />
      }
      @case ('date-time') {
        <app-preview-controls-date-time [field]="field()" />
      }
      @default {
        <app-preview-controls-primitives [field]="field()" />
      }
    }
  `
})
export class FormFieldRendererComponent {
  protected readonly t = injectFormBuilderTranslate();
  readonly field = input.required<BuilderField>();

  constructor() {
    injectPreviewViewSync();
  }

  // Resolves which focused preview control component should render this field.
  controlSlug(): ReturnType<typeof resolvePreviewFieldControlSlug> {
    return resolvePreviewFieldControlSlug(this.field());
  }
}
