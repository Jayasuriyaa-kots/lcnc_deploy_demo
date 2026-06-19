import { ChangeDetectorRef, InjectionToken, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  QoButtonComponent,
  QoCheckboxComponent,
  QoFormFieldComponent,
  QoIconComponent,
  QoInputComponent,
  QoModalComponent,
  QoSelectComponent,
  QoTextareaComponent
} from '@qo/ui-components';
import { TranslocoPipe } from '@jsverse/transloco';

import { FormPreviewContentBase } from '@builder/features/form-builder/components/form-preview-modal/content/base/form-preview-content.base';

export const FORM_PREVIEW_HOST = new InjectionToken<FormPreviewContentBase>('FORM_PREVIEW_HOST');

// Accesses preview state/methods from child template components.
export function injectFormPreviewHost(): FormPreviewContentBase {
  return inject(FORM_PREVIEW_HOST);
}

/** Keeps OnPush preview field templates in sync with host state (values, media, overlays). */
export function injectPreviewViewSync(): void {
  const host = injectFormPreviewHost();
  const cdr = inject(ChangeDetectorRef);

  effect(() => {
    host.overlayViewRevision();
    cdr.markForCheck();
  });
}

export const FORM_PREVIEW_FIELD_UI_IMPORTS = [
  CommonModule,
  QoButtonComponent,
  QoCheckboxComponent,
  QoIconComponent,
  QoInputComponent,
  QoSelectComponent,
  QoTextareaComponent,
  TranslocoPipe
];

export const FORM_PREVIEW_OVERLAY_UI_IMPORTS = [
  ...FORM_PREVIEW_FIELD_UI_IMPORTS,
  QoFormFieldComponent,
  QoModalComponent
];

