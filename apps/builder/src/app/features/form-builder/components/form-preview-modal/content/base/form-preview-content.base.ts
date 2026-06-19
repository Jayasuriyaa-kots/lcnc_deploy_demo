import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { Directive } from '@angular/core';
import { FormPreviewContentIoSignatureBase } from './form-preview-content-io-signature.base';

// Root of the preview mixin chain; behavior lives in parent base classes.
@Directive()
export abstract class FormPreviewContentBase extends FormPreviewContentIoSignatureBase {
  [key: string]: FormPreviewMixinIndex;
}


