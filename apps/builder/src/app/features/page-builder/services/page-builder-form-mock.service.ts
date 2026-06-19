import { Injectable, computed, signal } from '@angular/core';
import { injectBrowserStorage } from '@builder/core/services/browser-storage.service';
import { FormWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';

const FORM_DRAFTS_STORAGE_KEY = 'page-builder-form-drafts';
const FORM_SUBMISSIONS_STORAGE_KEY = 'page-builder-form-submissions';

type FormDraftMap = Record<string, Record<string, string>>;
type FormSubmissionValues = Record<string, string>;
type FormSubmissionMap = Record<string, FormSubmissionRecord[]>;

const DEFAULT_FORM_SUBMISSIONS: FormSubmissionMap = {
  'order-form': [
    {
      id: 'seed-order-1',
      formId: 'order-form',
      widgetId: 'seed-widget-order',
      submittedAt: '2026-05-01T00:00:00.000Z',
      values: {
        crm_id: 'C-1001',
        deal_type: 'New Business',
        description: 'Software License Tier 1',
        amount: '5000',
        order_date: '2026-05-01',
      },
    },
    {
      id: 'seed-order-2',
      formId: 'order-form',
      widgetId: 'seed-widget-order',
      submittedAt: '2026-05-02T00:00:00.000Z',
      values: {
        crm_id: 'C-1002',
        deal_type: 'Renewal',
        description: 'Annual Maintenance',
        amount: '1200',
        order_date: '2026-05-02',
      },
    },
    {
      id: 'seed-order-3',
      formId: 'order-form',
      widgetId: 'seed-widget-order',
      submittedAt: '2026-05-05T00:00:00.000Z',
      values: {
        crm_id: 'C-1003',
        deal_type: 'New Business',
        description: 'Implementation Services',
        amount: '3500',
        order_date: '2026-05-05',
      },
    },
    {
      id: 'seed-order-4',
      formId: 'order-form',
      widgetId: 'seed-widget-order',
      submittedAt: '2026-05-07T00:00:00.000Z',
      values: {
        crm_id: 'C-1004',
        deal_type: 'Upsell',
        description: 'Additional User Seats',
        amount: '2200',
        order_date: '2026-05-07',
      },
    },
    {
      id: 'seed-order-5',
      formId: 'order-form',
      widgetId: 'seed-widget-order',
      submittedAt: '2026-05-10T00:00:00.000Z',
      values: {
        crm_id: 'C-1005',
        deal_type: 'Renewal',
        description: 'Cloud Storage Extension',
        amount: '800',
        order_date: '2026-05-10',
      },
    },
    {
      id: 'seed-order-6',
      formId: 'order-form',
      widgetId: 'seed-widget-order',
      submittedAt: '2026-05-12T00:00:00.000Z',
      values: {
        crm_id: 'C-1006',
        deal_type: 'New Business',
        description: 'Premium Support Package',
        amount: '4500',
        order_date: '2026-05-12',
      },
    },
  ],
};

export interface FormSubmissionRecord {
  id: string;
  formId: string;
  widgetId: string;
  submittedAt: string;
  values: FormSubmissionValues;
}

@Injectable({ providedIn: 'root' })
export class PageBuilderFormMockService {
  private readonly storage = injectBrowserStorage();
  private readonly draftsState = signal<FormDraftMap>(this.storage.getJson<FormDraftMap>(FORM_DRAFTS_STORAGE_KEY) ?? {});
  private readonly submissionsState = signal<FormSubmissionMap>(this.createInitialSubmissionsState());
  private readonly lastSubmittedWidgetIdState = signal<string | null>(null);

  readonly drafts = this.draftsState.asReadonly();
  readonly submissions = this.submissionsState.asReadonly();
  readonly lastSubmittedWidgetId = this.lastSubmittedWidgetIdState.asReadonly();
  readonly submissionCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {};

    for (const [formId, records] of Object.entries(this.submissionsState())) {
      counts[formId] = records.length;
    }

    return counts;
  });

  private createInitialSubmissionsState(): FormSubmissionMap {
    const stored = this.storage.getJson<FormSubmissionMap>(FORM_SUBMISSIONS_STORAGE_KEY) ?? {};
    const merged: FormSubmissionMap = { ...DEFAULT_FORM_SUBMISSIONS, ...stored };
    this.storage.setJson(FORM_SUBMISSIONS_STORAGE_KEY, merged);
    return merged;
  }

  getFieldValue(widgetId: string, fieldId: string): string {
    return this.draftsState()[widgetId]?.[fieldId] ?? '';
  }

  updateFieldValue(widgetId: string, fieldId: string, value: string): void {
    this.draftsState.update((drafts) => {
      const nextDrafts: FormDraftMap = {
        ...drafts,
        [widgetId]: {
          ...(drafts[widgetId] ?? {}),
          [fieldId]: value,
        },
      };

      this.storage.setJson(FORM_DRAFTS_STORAGE_KEY, nextDrafts);
      return nextDrafts;
    });
  }

  submitForm(widgetId: string, config: FormWidgetConfig): FormSubmissionRecord {
    const draft = this.draftsState()[widgetId] ?? {};
    const values = config.fields.reduce<FormSubmissionValues>((acc, field) => {
      acc[field.id] = draft[field.id] ?? '';
      return acc;
    }, {});

    const record: FormSubmissionRecord = {
      id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      formId: config.formId,
      widgetId,
      submittedAt: new Date().toISOString(),
      values,
    };

    this.submissionsState.update((submissions) => {
      const nextSubmissions: FormSubmissionMap = {
        ...submissions,
        [config.formId]: [...(submissions[config.formId] ?? []), record],
      };

      this.storage.setJson(FORM_SUBMISSIONS_STORAGE_KEY, nextSubmissions);
      return nextSubmissions;
    });

    this.lastSubmittedWidgetIdState.set(widgetId);

    return record;
  }

  getSubmissionCount(formId: string): number {
    return this.submissionsState()[formId]?.length ?? 0;
  }

  getSubmissions(formId: string): FormSubmissionRecord[] {
    return [...(this.submissionsState()[formId] ?? [])];
  }

  resetDraft(widgetId: string, config: FormWidgetConfig): void {
    this.draftsState.update((drafts) => {
      const nextDrafts: FormDraftMap = {
        ...drafts,
        [widgetId]: config.fields.reduce<Record<string, string>>((acc, field) => {
          acc[field.id] = '';
          return acc;
        }, {}),
      };

      this.storage.setJson(FORM_DRAFTS_STORAGE_KEY, nextDrafts);
      return nextDrafts;
    });
  }

  wasLastSubmitted(widgetId: string): boolean {
    return this.lastSubmittedWidgetIdState() === widgetId;
  }
}
