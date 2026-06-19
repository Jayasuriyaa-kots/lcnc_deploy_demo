import { Injectable } from '@angular/core';
import { injectBrowserStorage } from '@builder/core/services/browser-storage.service';

export interface FormSubmissionMeta {
  formId: string;
  formName: string;
  datasourceId?: string;
  datasourceLabel?: string;
  queryId?: string;
  queryLabel?: string;
  queryText?: string;
  userId?: string;
  jwtToken?: string;
}

export interface FormSubmissionRecord {
  submissionId: string;
  submittedAt: string;
  submittedByUserId?: string;
  jwtToken?: string;
  inputJson: Record<string, unknown>;
  datasourceRequest: {
    datasourceId?: string;
    datasourceLabel?: string;
    queryId?: string;
    queryLabel?: string;
    queryText?: string;
    mappedInput: Record<string, unknown>;
    fieldMappings: Array<{
      queryParam: string;
      submissionPath: string;
    }>;
  };
}

export interface FormSubmissionBucket extends FormSubmissionMeta {
  records: FormSubmissionRecord[];
}

export type FormSubmissionStore = Record<string, FormSubmissionBucket>;

@Injectable({ providedIn: 'root' })
export class FormBuilderSubmissionStorageService {
  private readonly storageKey = 'qo.builder.form-builder.submissions.v1';
  private readonly storage = injectBrowserStorage();

  // Saves a preview submission under the form-specific local storage bucket.
  saveSubmission(meta: FormSubmissionMeta, data: Record<string, unknown>): void {
    const store = this.storage.getJson<FormSubmissionStore>(this.storageKey) ?? {};
    const bucketKey = this.getBucketKey(meta);
    const existing = store[bucketKey];
    const fieldMappings = Object.keys(data).map((key) => ({
      queryParam: key,
      submissionPath: `inputJson.${key}`
    }));

    const record: FormSubmissionRecord = {
      submissionId: this.createUuid(),
      submittedAt: new Date().toISOString(),
      submittedByUserId: meta.userId,
      jwtToken: meta.jwtToken,
      inputJson: data,
      datasourceRequest: {
        datasourceId: meta.datasourceId,
        datasourceLabel: meta.datasourceLabel,
        queryId: meta.queryId,
        queryLabel: meta.queryLabel,
        queryText: meta.queryText,
        mappedInput: { ...data },
        fieldMappings
      }
    };

    store[bucketKey] = {
      formId: meta.formId,
      formName: meta.formName,
      datasourceId: meta.datasourceId,
      datasourceLabel: meta.datasourceLabel,
      queryId: meta.queryId,
      queryLabel: meta.queryLabel,
      queryText: meta.queryText,
      userId: meta.userId,
      jwtToken: meta.jwtToken,
      records: [record, ...(existing?.records ?? [])]
    };

    this.storage.setJson(this.storageKey, store);
  }

  // Loads every stored preview submission bucket.
  getAllSubmissions(): FormSubmissionStore {
    return this.storage.getJson<FormSubmissionStore>(this.storageKey) ?? {};
  }

  // Loads submissions for one form using id-first bucket matching.
  getSubmissionsForForm(meta: Pick<FormSubmissionMeta, 'formId' | 'formName'>): FormSubmissionBucket | null {
    const store = this.getAllSubmissions();
    return store[this.getBucketKey(meta)] ?? null;
  }

  // Deletes all locally stored preview submissions for one form.
  clearSubmissionsForForm(meta: Pick<FormSubmissionMeta, 'formId' | 'formName'>): void {
    const store = this.getAllSubmissions();
    const bucketKey = this.getBucketKey(meta);
    if (!store[bucketKey]) {
      return;
    }

    delete store[bucketKey];
    this.storage.setJson(this.storageKey, store);
  }

  // Uses form id when available, otherwise falls back to a slugged form name.
  private getBucketKey(meta: FormSubmissionMeta): string {
    return meta.formId?.trim() || this.slugify(meta.formName || 'form');
  }

  // Converts form names into local-storage-safe bucket keys.
  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'form';
  }

  // Generates a submission id with crypto fallback for older browsers.
  private createUuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = Math.floor(Math.random() * 16);
      const value = char === 'x' ? random : ((random & 0x3) | 0x8);
      return value.toString(16);
    });
  }
}
