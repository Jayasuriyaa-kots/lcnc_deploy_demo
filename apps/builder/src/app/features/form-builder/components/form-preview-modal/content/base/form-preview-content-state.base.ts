import type { FormPreviewMixinIndex } from '../form-preview-content.mixin-index';
import { AfterViewInit, Directive, OnDestroy, effect } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormPreviewContentStateInputsBase } from './form-preview-content-state-inputs.base';

export type { FormSettings } from '@builder/features/form-builder/components/form-preview-modal/models/form-preview-modal.models';

@Directive()
export abstract class FormPreviewContentStateBase extends FormPreviewContentStateInputsBase implements AfterViewInit, OnDestroy {
  [key: string]: FormPreviewMixinIndex;

  constructor() {
    super();
    effect(() => {
      this.resetPreviewState(this.fields);
      setTimeout(() => this.syncSignatureCanvases());
      setTimeout(() => this.initRichTextEditorsContent());
    });
  }

  ngAfterViewInit(): void {
    this.syncSignatureCanvases();
    this.signatureCanvasRefs?.changes.subscribe(() => this.syncSignatureCanvases());
    this.document.addEventListener('selectionchange', this.selectionChangeListener);
    this.initRichTextEditorsContent();
  }

  ngOnDestroy(): void {
    this.stopPhoneScanner();
    this.closeImageCapture();
    this.closeAudioRecordModal();
    this.closeVideoCaptureModal();
    this.document.removeEventListener('selectionchange', this.selectionChangeListener);
  }

  resetPreviewState(fields: BuilderField[]): void {
    this.previewFacade.reset(fields);
    this.values = {};
    this.mediaNames = {};
    this.liveErrors = {};
    this.touchedFields = {};
    this.focusedFields = {};
    this.addressGeoEditors = {};
    this.phoneScanEditors = {};
    this.phoneCountrySelections = {};
    this.choiceDropdownOpen = {};
    this.richTextActiveFieldId = null;
    this.lastRichTextSelection = {};
    this.richTextCodeView = {};
    this._richTextState = { fieldId: null, state: {} };
    this.stopPhoneScanner();
    this.closeImageCapture();
    this.closeAudioRecordModal();
    this.closeVideoCaptureModal();
    this.submitAttempted = false;
    this.draftSaved = false;
    fields.forEach((field) => {
      if (field.type === 'Phone') {
        this.phoneCountrySelections[field.id] = field.properties.defaultCountryCode || field.properties.phoneCountryCode || '+91';
      }
      this.values[field.id] = this.getInitialValue(field);
      this.previewFacade.setValue(field.id, this.values[field.id]);
      this.validateField(field);
    });
    this.cdr.markForCheck();
    setTimeout(() => this.initRichTextEditorsContent());
  }

  close(): void {
    this.closeImageCapture();
    this.closeAudioRecordModal();
    this.closeVideoCaptureModal();
    this.cdr.markForCheck();
    this.closeRequested.emit();
  }

  onSubmit(): void {
    this.submitAttempted = true;
    this.draftSaved = false;
    this.previewFacade.submit(this.fields, this.settings);
    if (!this.canSubmit()) {
      return;
    }
    this.saveMockSubmission();
    this.submitted = true;
  }

  resetForm(): void {
    this.previewFacade.reset(this.fields);
    this.submitted = false;
    this.submitAttempted = false;
    this.draftSaved = false;
    this.resetPreviewState(this.fields);
  }

  saveDraft(): void {
    this.previewFacade.saveDraft();
    this.submitAttempted = false;
    this.draftSaved = true;
  }

  protected refreshPreviewView(): void {
    this.overlayElements.notifyChange();
    this.ngZone.run(() => {
      this.cdr.detectChanges();
    });
  }
}
