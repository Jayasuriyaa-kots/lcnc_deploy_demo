import { Injectable } from '@angular/core';
import flatsDatabaseRecords from '@builder/features/report-builder/data/flats_database.json';
import propertyDbRecords from '@builder/features/report-builder/data/property_db.json';
import employeeDirectoryRecords from '@builder/features/report-builder/data/employees_db.json';
import {
  ReportBuilderColumn,
  ReportBuilderSourceOption,
} from '@builder/features/report-builder/facades/report-builder.facade';

/**
 * Builds and serves the report builder's source catalog: the list of source
 * forms/datasources the user can report on, their columns, and the raw rows
 * behind the bundled sample datasources. Pure/stateless — the catalog is derived
 * from the bundled JSON once at construction.
 */
@Injectable({ providedIn: 'root' })
export class ReportSourceCatalogService {
  /** Source options (forms + their columns) available to the report builder. */
  readonly sourceOptions: ReportBuilderSourceOption[] = this.loadSourceOptions();

  /** Returns the raw datasource rows for a given source form id. */
  getDatasourceRows(sourceFormId: string): Record<string, unknown>[] {
    if (sourceFormId === 'flats_database') {
      return flatsDatabaseRecords as Record<string, unknown>[];
    }
    if (sourceFormId === 'property_db') {
      return propertyDbRecords as Record<string, unknown>[];
    }
    if (sourceFormId === 'employees_form') {
      return employeeDirectoryRecords as Record<string, unknown>[];
    }
    return [];
  }

  /** Normalises a raw column label/key into a stable snake_case column id. */
  normalizeFlatColumnId(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  /** Derives the source options from the bundled sample datasource JSON. */
  private loadSourceOptions(): ReportBuilderSourceOption[] {
    const flatsFirst = flatsDatabaseRecords[0] as Record<string, unknown> | undefined;
    const propertyFirst = propertyDbRecords[0] as Record<string, unknown> | undefined;
    if (!flatsFirst && !propertyFirst) {
      return this.getDefaultSourceOptions();
    }

    const options: ReportBuilderSourceOption[] = [];

    if (flatsFirst) {
      options.push({
        id: 'flats_database',
        name: 'flats_database',
        datasourceLabel: 'flats_database',
        tableLabel: 'flats',
        columns: Object.keys(flatsFirst).map((key) =>
          this.column(
            this.normalizeFlatColumnId(key),
            key,
            this.detectFlatColumnFormat(key, flatsFirst[key]),
            'text',
            'flats_database',
            'primary'
          )
        ),
      });
    }

    if (propertyFirst) {
      options.push({
        id: 'property_db',
        name: 'property_db',
        datasourceLabel: 'property_db',
        tableLabel: 'properties',
        columns: Object.keys(propertyFirst).map((key) =>
          this.column(
            this.normalizeFlatColumnId(key),
            key,
            this.detectFlatColumnFormat(key, propertyFirst[key]),
            'text',
            'property_db',
            'primary'
          )
        ),
      });
    }

    return [...options, ...this.getDefaultSourceOptions()];
  }

  /** Builds a fully-defaulted column descriptor. */
  private column(
    id: string,
    label: string,
    format: ReportBuilderColumn['format'],
    fieldType?: string,
    formId = '',
    source: 'primary' | 'joined' = 'primary'
  ): ReportBuilderColumn {
    return {
      id,
      label,
      formId,
      source,
      fieldType: fieldType ?? format,
      format,
      visible: true,
      width: 'Medium',
      sortable: true,
      filterable: true,
      alignment: format === 'number' || format === 'currency' ? 'right' : 'left',
    };
  }

  /** Infers a column format from its key name and a sample value. */
  private detectFlatColumnFormat(key: string, sampleValue: unknown): ReportBuilderColumn['format'] {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.includes('email')) {
      return 'email';
    }
    if (normalizedKey.includes('date')) {
      return 'date';
    }
    if (
      normalizedKey.includes('rent') ||
      normalizedKey.includes('maintenance') ||
      normalizedKey.includes('charges')
    ) {
      return 'currency';
    }
    if (typeof sampleValue === 'number') {
      return 'number';
    }
    return 'text';
  }

  /** Hard-coded fallback catalog used when the sample JSON is unavailable. */
  private getDefaultSourceOptions(): ReportBuilderSourceOption[] {
    return [
      {
        id: 'employees_form',
        name: 'Add Employee Form',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'employees',
        columns: [
          this.column('employee_code',  'Employee Code', 'text', 'Short Text',  'employees_form'),
          this.column('employee_name',  'Employee Name', 'text', 'Name',        'employees_form'),
          this.column('department',     'Department',    'text', 'Dropdown',    'employees_form'),
          this.column('location',       'Location',      'text', 'Short Text',  'employees_form'),
          this.column('start_date',     'Start Date',    'date', 'Date Picker', 'employees_form'),
          this.column('status',         'Status',        'text', 'Dropdown',    'employees_form'),
        ],
      },
      {
        id: 'attendance_form',
        name: 'Attendance Entry',
        datasourceLabel: 'qo_hrms_stage',
        tableLabel: 'attendance_logs',
        columns: [
          this.column('employee_code', 'Employee Code', 'text', 'Short Text', 'attendance_form'),
          this.column('employee_name', 'Employee Name', 'text', 'Name', 'attendance_form'),
          this.column('log_date', 'Log Date', 'date', 'Date Picker', 'attendance_form'),
          this.column('check_in', 'Check In', 'text', 'Time', 'attendance_form'),
          this.column('check_out', 'Check Out', 'text', 'Time', 'attendance_form'),
          this.column('late_minutes', 'Late Minutes', 'number', 'Number', 'attendance_form'),
          this.column('status', 'Status', 'text', 'Dropdown', 'attendance_form'),
        ],
      },
      {
        id: 'leave_form',
        name: 'Leave Request Form',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'leave_requests',
        columns: [
          this.column('employee_name', 'Employee Name', 'text', 'Name', 'leave_form'),
          this.column('department', 'Department', 'text', 'Dropdown', 'leave_form'),
          this.column('leave_type', 'Leave Type', 'text', 'Dropdown', 'leave_form'),
          this.column('start_date', 'Start Date', 'date', 'Date Picker', 'leave_form'),
          this.column('end_date', 'End Date', 'date', 'Date Picker', 'leave_form'),
          this.column('days', 'Days', 'number', 'Number', 'leave_form'),
          this.column('status', 'Status', 'text', 'Dropdown', 'leave_form'),
          this.column('approver', 'Approver', 'text', 'Short Text', 'leave_form'),
        ],
      },
      {
        id: 'performance_review_form',
        name: 'Performance Review',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'performance_reviews',
        columns: [
          this.column('employee_id', 'Employee Code', 'text', 'Short Text', 'performance_review_form'),
          this.column('reviewer_name', 'Reviewer', 'text', 'Name', 'performance_review_form'),
          this.column('review_period', 'Review Period', 'text', 'Dropdown', 'performance_review_form'),
          this.column('overall_rating', 'Rating', 'text', 'Dropdown', 'performance_review_form'),
          this.column('goals_achieved', 'Goals %', 'number', 'Number', 'performance_review_form'),
          this.column('strengths', 'Key Strengths', 'text', 'Long Text', 'performance_review_form'),
          this.column('development_areas', 'Development Areas', 'text', 'Long Text', 'performance_review_form'),
          this.column('review_date', 'Review Date', 'date', 'Date Picker', 'performance_review_form'),
        ],
      },
      {
        id: 'asset_request_form',
        name: 'Asset Request',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'asset_requests',
        columns: [
          this.column('employee_id', 'Employee Code', 'text', 'Short Text', 'asset_request_form'),
          this.column('asset_type', 'Asset Type', 'text', 'Dropdown', 'asset_request_form'),
          this.column('asset_model', 'Model / Spec', 'text', 'Short Text', 'asset_request_form'),
          this.column('priority', 'Priority', 'text', 'Dropdown', 'asset_request_form'),
          this.column('required_by', 'Needed By', 'date', 'Date Picker', 'asset_request_form'),
          this.column('business_justification', 'Justification', 'text', 'Long Text', 'asset_request_form'),
        ],
      },
      {
        id: 'travel_expense_form',
        name: 'Travel Reimbursement',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'travel_expenses',
        columns: [
          this.column('employee_id', 'Employee Code', 'text', 'Short Text', 'travel_expense_form'),
          this.column('travel_purpose', 'Purpose', 'text', 'Dropdown', 'travel_expense_form'),
          this.column('travel_from', 'From', 'text', 'Short Text', 'travel_expense_form'),
          this.column('travel_to', 'To', 'text', 'Short Text', 'travel_expense_form'),
          this.column('travel_date', 'Travel Date', 'date', 'Date Picker', 'travel_expense_form'),
          this.column('mode_of_transport', 'Mode', 'text', 'Dropdown', 'travel_expense_form'),
          this.column('total_amount', 'Amount (₹)', 'currency', 'Currency', 'travel_expense_form'),
        ],
      },
      {
        id: 'recruitment_form',
        name: 'Recruitment Application',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'candidates',
        columns: [
          this.column('candidate_name', 'Candidate Name', 'text', 'Name', 'recruitment_form'),
          this.column('email', 'Email', 'email', 'Email', 'recruitment_form'),
          this.column('applied_role', 'Applying For', 'text', 'Dropdown', 'recruitment_form'),
          this.column('experience_years', 'Experience (Yrs)', 'number', 'Number', 'recruitment_form'),
          this.column('current_company', 'Current Employer', 'text', 'Short Text', 'recruitment_form'),
          this.column('notice_period', 'Notice Period', 'text', 'Dropdown', 'recruitment_form'),
          this.column('phone', 'Phone', 'text', 'Short Text', 'recruitment_form'),
        ],
      },
      {
        id: 'training_form',
        name: 'Training Registration',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'training_registrations',
        columns: [
          this.column('employee_id', 'Employee Code', 'text', 'Short Text', 'training_form'),
          this.column('training_program', 'Program', 'text', 'Dropdown', 'training_form'),
          this.column('training_mode', 'Mode', 'text', 'Dropdown', 'training_form'),
          this.column('preferred_date', 'Start Date', 'date', 'Date Picker', 'training_form'),
          this.column('manager_approved', 'Manager Approved', 'text', 'Checkbox', 'training_form'),
        ],
      },
      {
        id: 'it_ticket_form',
        name: 'IT Support Ticket',
        datasourceLabel: 'qo_hrms_prod',
        tableLabel: 'it_tickets',
        columns: [
          this.column('employee_id', 'Employee Code', 'text', 'Short Text', 'it_ticket_form'),
          this.column('issue_category', 'Category', 'text', 'Dropdown', 'it_ticket_form'),
          this.column('issue_title', 'Issue Title', 'text', 'Short Text', 'it_ticket_form'),
          this.column('severity', 'Severity', 'text', 'Dropdown', 'it_ticket_form'),
          this.column('affected_since', 'Reported On', 'date', 'Date Picker', 'it_ticket_form'),
          this.column('issue_description', 'Description', 'text', 'Long Text', 'it_ticket_form'),
        ],
      },
    ];
  }
}
