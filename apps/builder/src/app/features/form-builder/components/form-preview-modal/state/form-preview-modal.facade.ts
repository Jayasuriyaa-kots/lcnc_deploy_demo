import { Injectable, inject, signal } from '@angular/core';

import { BuilderAction, BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { FormSettings } from '@builder/features/form-builder/components/form-preview-modal/models/form-preview-modal.models';
import { FormBuilderSubmissionStorageService, FormSubmissionMeta } from '@builder/features/form-builder/services/form-builder-submission-storage.service';

@Injectable()
export class FormPreviewModalFacade {
  private readonly submissionStorage = inject(FormBuilderSubmissionStorageService);
  private readonly i18n = inject(FormBuilderI18nService);

  readonly submitted = signal(false);
  readonly submitAttempted = signal(false);
  readonly draftSaved = signal(false);
  readonly values = signal<Record<string, unknown>>({});
  readonly errors = signal<Record<string, string>>({});

  // Resets preview state for a fresh form render.
  reset(fields: BuilderField[]): void {
    this.submitted.set(false);
    this.submitAttempted.set(false);
    this.draftSaved.set(false);
    this.errors.set({});
    this.values.set(fields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field.id] = field.type === 'Checkbox' || field.type === 'Multi Select' ? [] : '';
      return acc;
    }, {}));
  }

  // Updates one preview field value and clears draft-saved feedback.
  setValue(fieldId: string, value: unknown): void {
    this.draftSaved.set(false);
    this.values.update((current) => ({ ...current, [fieldId]: value }));
  }

  // Marks the current preview values as saved draft state.
  saveDraft(): void {
    this.draftSaved.set(true);
  }

  // Validates required fields and sets submitted state when valid.
  submit(fields: BuilderField[], settings: FormSettings): boolean {
    this.submitAttempted.set(true);
    const requiredErrors = fields.reduce<Record<string, string>>((acc, field) => {
      if (field.properties.required && !this.hasValue(this.values()[field.id])) {
        acc[field.id] = this.i18n.t('validation.required', { label: field.label });
      }
      return acc;
    }, {});
    this.errors.set(requiredErrors);
    const valid = Object.keys(requiredErrors).length === 0;
    this.submitted.set(valid && settings.submitBehavior !== 'Redirect');
    return valid;
  }

  // Runs the configured action button behavior against preview state.
  runAction(action: BuilderAction, fields: BuilderField[], settings: FormSettings): void {
    if (action.actionType === 'submit') {
      this.submit(fields, settings);
    }
    if (action.actionType === 'reset') {
      this.reset(fields);
    }
    if (action.actionType === 'save-draft') {
      this.saveDraft();
    }
  }

  // Persists the submitted preview payload into local mock storage.
  saveSubmission(meta: FormSubmissionMeta, payload: Record<string, unknown>): void {
    this.submissionStorage.saveSubmission(meta, payload);
  }

  // Checks whether a preview value counts as filled.
  private hasValue(value: unknown): boolean {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined;
  }
}
