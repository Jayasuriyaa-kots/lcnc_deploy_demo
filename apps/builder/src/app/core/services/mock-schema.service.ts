import { Injectable, signal } from '@angular/core';
import {
  createDefaultReportWidgetVisibilityConfig,
  createDefaultFormWidgetSubmitConfig,
  FormWidgetConfig,
  FormWidgetFieldPreview,
  ReportWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

import formsJson from '../../../assets/mock-api/schema/forms.json';
import reportsJson from '../../../assets/mock-api/schema/reports.json';

// Form field definitions
import addEmployeeFormJson from '../../../assets/mock-api/schema/form-fields/add-employee-form.json';
import attendanceFormJson from '../../../assets/mock-api/schema/form-fields/attendance-form.json';
import employeeLeaveFormJson from '../../../assets/mock-api/schema/form-fields/employee-leave-form.json';
import orderFormJson from '../../../assets/mock-api/schema/form-fields/order-form.json';
import performanceReviewFormJson from '../../../assets/mock-api/schema/form-fields/performance-review-form.json';
import assetRequestFormJson from '../../../assets/mock-api/schema/form-fields/asset-request-form.json';
import travelReimbursementFormJson from '../../../assets/mock-api/schema/form-fields/travel-reimbursement-form.json';
import recruitmentApplicationFormJson from '../../../assets/mock-api/schema/form-fields/recruitment-application-form.json';
import employeeExitFormJson from '../../../assets/mock-api/schema/form-fields/employee-exit-form.json';
import trainingRegistrationFormJson from '../../../assets/mock-api/schema/form-fields/training-registration-form.json';
import itSupportTicketFormJson from '../../../assets/mock-api/schema/form-fields/it-support-ticket-form.json';

// Report preview data
import employeeDirectoryReportJson from '../../../assets/mock-api/schema/report-previews/employee-directory.json';
import leaveSummaryReportJson from '../../../assets/mock-api/schema/report-previews/leave-summary.json';
import attendanceSummaryReportJson from '../../../assets/mock-api/schema/report-previews/attendance-summary.json';
import performanceReviewReportJson from '../../../assets/mock-api/schema/report-previews/performance-review-report.json';
import assetInventoryReportJson from '../../../assets/mock-api/schema/report-previews/asset-inventory-report.json';
import travelExpenseReportJson from '../../../assets/mock-api/schema/report-previews/travel-expense-report.json';
import recruitmentPipelineReportJson from '../../../assets/mock-api/schema/report-previews/recruitment-pipeline-report.json';
import headcountByDepartmentReportJson from '../../../assets/mock-api/schema/report-previews/headcount-by-department-report.json';
import trainingCalendarReportJson from '../../../assets/mock-api/schema/report-previews/training-calendar-report.json';
import itSupportTicketsReportJson from '../../../assets/mock-api/schema/report-previews/it-support-tickets-report.json';

export const MOCK_SCHEMA_APPLICATION_LABEL = 'HR Management';

export interface MockSchemaFormSummary {
  id: string;
  name: string;
  tableName: string;
  applicationLabel: string;
  actionLabels: string[];
}

export interface MockSchemaReportSummary {
  id: string;
  name: string;
  sourceFormId: string;
  sourceFormLabel: string;
  sourceTable: string;
  applicationLabel: string;
}

interface MockSchemaFormSummaryFile {
  id: string;
  name: string;
  tableName: string;
  actionLabels?: string[];
}

interface MockSchemaFormFieldFile extends FormWidgetFieldPreview {
  dbColumn?: string;
}

interface MockSchemaFormDefinitionFile {
  formId: string;
  formLabel: string;
  tableName: string;
  actionLabels?: string[];
  fields: MockSchemaFormFieldFile[];
}

interface MockSchemaReportSummaryFile {
  id: string;
  name: string;
  sourceFormId: string;
  sourceFormLabel: string;
  sourceTable: string;
}

interface MockSchemaReportColumnFile {
  id: string;
  label: string;
  dbColumn?: string;
}

interface MockSchemaReportPreviewFile {
  reportId: string;
  reportLabel: string;
  sourceFormId: string;
  sourceFormLabel: string;
  sourceTable: string;
  columns: MockSchemaReportColumnFile[];
  rows: Array<{
    id: string;
    values: string[];
  }>;
}

const FORM_DEFINITIONS: Record<string, MockSchemaFormDefinitionFile> = {
  'add-employee-form': addEmployeeFormJson as MockSchemaFormDefinitionFile,
  'attendance-form': attendanceFormJson as MockSchemaFormDefinitionFile,
  'employee-leave-form': employeeLeaveFormJson as MockSchemaFormDefinitionFile,
  'order-form': orderFormJson as MockSchemaFormDefinitionFile,
  'performance-review-form': performanceReviewFormJson as MockSchemaFormDefinitionFile,
  'asset-request-form': assetRequestFormJson as MockSchemaFormDefinitionFile,
  'travel-reimbursement-form': travelReimbursementFormJson as MockSchemaFormDefinitionFile,
  'recruitment-application-form': recruitmentApplicationFormJson as MockSchemaFormDefinitionFile,
  'employee-exit-form': employeeExitFormJson as MockSchemaFormDefinitionFile,
  'training-registration-form': trainingRegistrationFormJson as MockSchemaFormDefinitionFile,
  'it-support-ticket-form': itSupportTicketFormJson as MockSchemaFormDefinitionFile,
};

const REPORT_PREVIEWS: Record<string, MockSchemaReportPreviewFile> = {
  'employee-directory': employeeDirectoryReportJson as MockSchemaReportPreviewFile,
  'leave-summary': leaveSummaryReportJson as MockSchemaReportPreviewFile,
  'attendance-summary': attendanceSummaryReportJson as MockSchemaReportPreviewFile,
  'performance-review-report': performanceReviewReportJson as MockSchemaReportPreviewFile,
  'asset-inventory-report': assetInventoryReportJson as MockSchemaReportPreviewFile,
  'travel-expense-report': travelExpenseReportJson as MockSchemaReportPreviewFile,
  'recruitment-pipeline-report': recruitmentPipelineReportJson as MockSchemaReportPreviewFile,
  'headcount-by-department-report': headcountByDepartmentReportJson as MockSchemaReportPreviewFile,
  'training-calendar-report': trainingCalendarReportJson as MockSchemaReportPreviewFile,
  'it-support-tickets-report': itSupportTicketsReportJson as MockSchemaReportPreviewFile,
};

@Injectable({ providedIn: 'root' })
export class MockSchemaService {
  private readonly formsState = signal<MockSchemaFormSummary[]>([]);
  private readonly formConfigsState = signal<FormWidgetConfig[]>([]);
  private readonly reportsState = signal<MockSchemaReportSummary[]>([]);
  private readonly reportConfigsState = signal<ReportWidgetConfig[]>([]);

  readonly forms = this.formsState.asReadonly();
  readonly formConfigs = this.formConfigsState.asReadonly();
  readonly reports = this.reportsState.asReadonly();
  readonly reportConfigs = this.reportConfigsState.asReadonly();

  constructor() {
    this.loadForms();
    this.loadReports();
  }

  private loadForms(): void {
    const formFiles = formsJson as MockSchemaFormSummaryFile[];
    const entries = formFiles
      .map((form) => {
        const definition = FORM_DEFINITIONS[form.id];
        return definition ? { form, definition } : null;
      })
      .filter((entry): entry is { form: MockSchemaFormSummaryFile; definition: MockSchemaFormDefinitionFile } => entry !== null);

    this.formsState.set(entries.map(({ form }) => this.mapFormSummary(form)));
    this.formConfigsState.set(entries.map(({ form, definition }) => this.mapFormConfig(form, definition)));
  }

  private loadReports(): void {
    const reportFiles = reportsJson as MockSchemaReportSummaryFile[];
    const entries = reportFiles
      .map((report) => {
        const preview = REPORT_PREVIEWS[report.id];
        return preview ? { report, preview } : null;
      })
      .filter((entry): entry is { report: MockSchemaReportSummaryFile; preview: MockSchemaReportPreviewFile } => entry !== null);

    this.reportsState.set(entries.map(({ report }) => this.mapReportSummary(report)));
    this.reportConfigsState.set(entries.map(({ report, preview }) => this.mapReportConfig(report, preview)));
  }

  private mapFormSummary(form: MockSchemaFormSummaryFile): MockSchemaFormSummary {
    return {
      id: form.id,
      name: form.name,
      tableName: form.tableName,
      applicationLabel: MOCK_SCHEMA_APPLICATION_LABEL,
      actionLabels: [...(form.actionLabels ?? ['Submit'])],
    };
  }

  private mapFormConfig(form: MockSchemaFormSummaryFile, definition: MockSchemaFormDefinitionFile): FormWidgetConfig {
    return {
      formId: definition.formId,
      applicationLabel: MOCK_SCHEMA_APPLICATION_LABEL,
      formLabel: definition.formLabel || form.name,
      fields: definition.fields.map((field) => this.mapFormField(field)),
      actionLabels: [...(definition.actionLabels ?? form.actionLabels ?? ['Submit'])],
      submitConfig: {
        ...createDefaultFormWidgetSubmitConfig(),
        submitButtonText: definition.actionLabels?.[0] ?? form.actionLabels?.[0] ?? 'Submit',
      },
    };
  }

  private mapFormField(field: MockSchemaFormFieldFile): FormWidgetFieldPreview {
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder,
      required: field.required,
      options: [...field.options],
    };
  }

  private mapReportSummary(report: MockSchemaReportSummaryFile): MockSchemaReportSummary {
    return {
      id: report.id,
      name: report.name,
      sourceFormId: report.sourceFormId,
      sourceFormLabel: report.sourceFormLabel,
      sourceTable: report.sourceTable,
      applicationLabel: MOCK_SCHEMA_APPLICATION_LABEL,
    };
  }

  private mapReportConfig(report: MockSchemaReportSummaryFile, preview: MockSchemaReportPreviewFile): ReportWidgetConfig {
    const definition = FORM_DEFINITIONS[report.sourceFormId];

    return {
      reportId: preview.reportId,
      applicationLabel: MOCK_SCHEMA_APPLICATION_LABEL,
      reportLabel: preview.reportLabel || report.name,
      sourceFormId: preview.sourceFormId || report.sourceFormId,
      sourceFormLabel: preview.sourceFormLabel || report.sourceFormLabel,
      columns: preview.columns.map((column) => ({
        id: column.id,
        label: column.label,
        sourceFieldId: this.resolveReportSourceFieldId(column.id, column.dbColumn, definition),
      })),
      rows: preview.rows.map((row) => ({
        id: row.id,
        values: [...row.values],
      })),
      visibility: createDefaultReportWidgetVisibilityConfig(),
      allowPublicAccess: false,
      filterCriteriaRows: [],
      filterConfigured: false,
    };
  }

  private resolveReportSourceFieldId(
    columnId: string,
    dbColumn: string | undefined,
    definition: MockSchemaFormDefinitionFile | undefined,
  ): string | undefined {
    if (!definition) {
      return undefined;
    }

    const directField = definition.fields.find((field) => field.id === columnId);
    if (directField) {
      return directField.id;
    }

    const dbField = dbColumn
      ? definition.fields.find((field) => field.dbColumn === dbColumn)
      : undefined;

    return dbField?.id;
  }
}
