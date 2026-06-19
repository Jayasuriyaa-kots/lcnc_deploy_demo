import { Injectable } from '@angular/core';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import {
  BuilderColumnFieldMapping,
  BuilderDatasourceOption,
  FORM_BUILDER_DEFAULT_ACTIONS,
  FORM_BUILDER_MOCK_DATASOURCES
} from '@builder/features/form-builder/config/form-builder.config';
import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';
import { FormBuilderFieldFactoryService } from './form-builder-field-factory.service';
import type { FormBuilderAsset } from '../facades/form-builder.facade';

// Stateless service for seed data and default form generation.
// No signals, no state, no Angular lifecycle.
@Injectable({ providedIn: 'root' })
export class FormBuilderSeedService {
  private readonly mockUserId = '94efaa44-38aa-46e3-bb0d-7b7f6fd73d43';
  private readonly mockJwtToken = 'mock-jwt-token-builder-user';
  private readonly text = FORM_BUILDER_LANG.seed;

  readonly datasourceOptions: BuilderDatasourceOption[] = FORM_BUILDER_MOCK_DATASOURCES;

  constructor(private readonly fieldFactory: FormBuilderFieldFactoryService) {}

  // Creates the default forms shown when no saved builder state exists.
  createDefaultForms(): FormBuilderAsset[] {
    return [
      this.createSeedForm({
        id: '9d45c1b2-b3e1-4d2c-bdb3-38e8050f12e1',
        createdAt: '2026-05-11T09:00:00.000Z',
        modifiedAt: '2026-05-11T09:00:00.000Z',
        shortCode: 'AE',
        name: this.text.forms.addEmployee.name,
        status: 'live',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: '2faef7a8-bd4b-488f-a41f-f152a7327be6',
        columnMappings: [
          { columnId: 'employee_name', fieldType: 'Name' },
          { columnId: 'employee_email', fieldType: 'Email' },
          { columnId: 'department_name', fieldType: 'Dropdown' },
          { columnId: 'joining_date', fieldType: 'Date Picker' },
          { columnId: 'phone_number', fieldType: 'Phone' },
          { columnId: 'active_status', fieldType: 'Decision Box' }
        ],
        description: this.text.forms.addEmployee.description
      }),
      this.createSeedForm({
        id: '59a95314-c15d-4f35-89db-730721d202d2',
        createdAt: '2026-05-11T09:15:00.000Z',
        modifiedAt: '2026-05-11T09:15:00.000Z',
        shortCode: 'LR',
        name: this.text.forms.leaveRequest.name,
        status: 'live',
        datasourceId: 'f8f8fc83-48b5-45f0-a2b2-67cb4487f13f',
        queryId: '1efac17d-9d33-4883-b4eb-79d52dc00389',
        columnMappings: [
          { columnId: 'employee_name', fieldType: 'Name' },
          { columnId: 'employee_email', fieldType: 'Email' },
          { columnId: 'leave_type', fieldType: 'Dropdown' },
          { columnId: 'start_date', fieldType: 'Date Picker' },
          { columnId: 'end_date', fieldType: 'Date Picker' },
          { columnId: 'reason', fieldType: 'Long Text' }
        ],
        description: this.text.forms.leaveRequest.description
      }),
      this.createSeedForm({
        id: 'b8ecfbf7-c873-47d1-8ff5-6650a0a1ca49',
        createdAt: '2026-05-11T09:30:00.000Z',
        modifiedAt: '2026-05-11T09:30:00.000Z',
        shortCode: 'AE',
        name: this.text.forms.attendanceEntry.name,
        status: 'live',
        datasourceId: 'f8f8fc83-48b5-45f0-a2b2-67cb4487f13f',
        queryId: '8d9fe389-cff1-4473-b0f6-52b36bb7d6be',
        columnMappings: [
          { columnId: 'employee_code', fieldType: 'Short Text' },
          { columnId: 'employee_name', fieldType: 'Name' },
          { columnId: 'attendance_date', fieldType: 'Date Picker' },
          { columnId: 'check_in_time', fieldType: 'Time' },
          { columnId: 'check_out_time', fieldType: 'Time' },
          { columnId: 'notes', fieldType: 'Long Text' }
        ],
        description: this.text.forms.attendanceEntry.description
      }),
      this.createSeedForm({
        id: 'b3dc18e5-6d1c-450a-8e4f-40230b5f3d6e',
        createdAt: '2026-05-11T09:45:00.000Z',
        modifiedAt: '2026-05-11T09:45:00.000Z',
        shortCode: 'PR',
        name: this.text.forms.performanceReview.name,
        typeLabel: this.text.typeLabel,
        status: 'draft',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: '2faef7a8-bd4b-488f-a41f-f152a7327be6',
        columnMappings: [
          { columnId: 'employee_name', fieldType: 'Name' },
          { columnId: 'department_name', fieldType: 'Dropdown' },
          { columnId: 'profile_updated_at', fieldType: 'Date-Time' }
        ],
        description: this.text.forms.performanceReview.description
      }),
      this.createSeedForm({
        id: '23383c04-e929-4d0b-994f-559dafd0ca47',
        createdAt: '2026-05-11T10:00:00.000Z',
        modifiedAt: '2026-05-11T10:00:00.000Z',
        shortCode: 'EE',
        name: 'Employee Exit Form',
        typeLabel: this.text.typeLabel,
        status: 'draft',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: '2faef7a8-bd4b-488f-a41f-f152a7327be6',
        columnMappings: [
          { columnId: 'employee_name', fieldType: 'Name' },
          { columnId: 'employee_email', fieldType: 'Email' },
          { columnId: 'department_name', fieldType: 'Dropdown' }
        ],
        description: 'Capture exit interview responses, last working day, reason for leaving, and feedback.'
      }),
      this.createSeedForm({
        id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
        createdAt: '2026-05-11T10:15:00.000Z',
        modifiedAt: '2026-05-11T10:15:00.000Z',
        shortCode: 'AR',
        name: 'Asset Request',
        typeLabel: this.text.typeLabel,
        status: 'live',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        columnMappings: [
          { columnId: 'employee_id', fieldType: 'Short Text' },
          { columnId: 'asset_type', fieldType: 'Dropdown' },
          { columnId: 'asset_model', fieldType: 'Short Text' },
          { columnId: 'business_justification', fieldType: 'Long Text' },
          { columnId: 'required_by', fieldType: 'Date Picker' },
          { columnId: 'priority', fieldType: 'Dropdown' }
        ],
        description: 'Request IT assets — laptops, monitors, phones, chairs, and access cards — with priority and justification.'
      }),
      this.createSeedForm({
        id: 'd2e3f4a5-b6c7-8901-defa-234567890bcd',
        createdAt: '2026-05-11T10:30:00.000Z',
        modifiedAt: '2026-05-11T10:30:00.000Z',
        shortCode: 'TR',
        name: 'Travel Reimbursement',
        typeLabel: this.text.typeLabel,
        status: 'live',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        columnMappings: [
          { columnId: 'employee_id', fieldType: 'Short Text' },
          { columnId: 'travel_purpose', fieldType: 'Dropdown' },
          { columnId: 'travel_from', fieldType: 'Short Text' },
          { columnId: 'travel_to', fieldType: 'Short Text' },
          { columnId: 'travel_date', fieldType: 'Date Picker' },
          { columnId: 'mode_of_transport', fieldType: 'Dropdown' },
          { columnId: 'total_amount', fieldType: 'Currency' }
        ],
        description: 'Submit travel expense claims with purpose, route, transport mode, and total amount for reimbursement.'
      }),
      this.createSeedForm({
        id: 'e3f4a5b6-c7d8-9012-efab-345678901cde',
        createdAt: '2026-05-11T10:45:00.000Z',
        modifiedAt: '2026-05-11T10:45:00.000Z',
        shortCode: 'RA',
        name: 'Recruitment Application',
        typeLabel: this.text.typeLabel,
        status: 'live',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: 'e5f6a7b8-c9d0-1234-efab-345678901234',
        columnMappings: [
          { columnId: 'candidate_name', fieldType: 'Name' },
          { columnId: 'email', fieldType: 'Email' },
          { columnId: 'phone', fieldType: 'Phone' },
          { columnId: 'applied_role', fieldType: 'Dropdown' },
          { columnId: 'experience_years', fieldType: 'Number' },
          { columnId: 'current_company', fieldType: 'Short Text' },
          { columnId: 'notice_period', fieldType: 'Dropdown' }
        ],
        description: 'Candidate application form for open roles at QuantaOps Technologies — captures profile, experience, and notice period.'
      }),
      this.createSeedForm({
        id: 'f4a5b6c7-d8e9-0123-fabc-456789012def',
        createdAt: '2026-05-11T11:00:00.000Z',
        modifiedAt: '2026-05-11T11:00:00.000Z',
        shortCode: 'TN',
        name: 'Training Registration',
        typeLabel: this.text.typeLabel,
        status: 'live',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
        columnMappings: [
          { columnId: 'employee_id', fieldType: 'Short Text' },
          { columnId: 'training_program', fieldType: 'Dropdown' },
          { columnId: 'training_mode', fieldType: 'Dropdown' },
          { columnId: 'preferred_date', fieldType: 'Date Picker' },
          { columnId: 'manager_approved', fieldType: 'Decision Box' }
        ],
        description: 'Register for training programs — online, in-person, or hybrid — with manager approval confirmation.'
      }),
      this.createSeedForm({
        id: 'a5b6c7d8-e9f0-1234-abcd-567890123ef0',
        createdAt: '2026-05-11T11:15:00.000Z',
        modifiedAt: '2026-05-11T11:15:00.000Z',
        shortCode: 'IT',
        name: 'IT Support Ticket',
        typeLabel: this.text.typeLabel,
        status: 'live',
        datasourceId: 'df38b6eb-0658-44ff-b844-63d0952f04b9',
        queryId: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
        columnMappings: [
          { columnId: 'employee_id', fieldType: 'Short Text' },
          { columnId: 'issue_category', fieldType: 'Dropdown' },
          { columnId: 'issue_title', fieldType: 'Short Text' },
          { columnId: 'issue_description', fieldType: 'Long Text' },
          { columnId: 'severity', fieldType: 'Dropdown' },
          { columnId: 'affected_since', fieldType: 'Date Picker' }
        ],
        description: 'Raise IT support tickets for hardware, software, network, or access issues with severity classification.'
      })
    ];
  }

  // Builds a full form asset from datasource/query mapping metadata.
  createSeedForm(config: {
    id: string;
    createdAt: string;
    modifiedAt: string;
    shortCode: string;
    name: string;
    status: 'live' | 'draft';
    datasourceId: string;
    queryId: string;
    columnMappings: BuilderColumnFieldMapping[];
    description: string;
    typeLabel?: string;
  }): FormBuilderAsset {
    const datasource =
      this.datasourceOptions.find((item) => item.id === config.datasourceId) ??
      this.datasourceOptions[0];
    const query =
      datasource.queries.find((item) => item.id === config.queryId) ??
      datasource.queries[0];

    const fields: BuilderField[] = config.columnMappings
      .map((mapping) => {
        const column = query.columns.find((item) => item.id === mapping.columnId);
        return column
          ? this.fieldFactory.createFieldFromColumn(column, mapping.fieldType)
          : null;
      })
      .filter((field): field is BuilderField => !!field);

    return {
      id: config.id,
      shortCode: config.shortCode,
      name: config.name,
      typeLabel: config.typeLabel ?? this.text.typeLabel,
      status: config.status,
      description: config.description,
      datasourceId: datasource.id,
      datasourceLabel: datasource.label,
      queryId: query.id,
      queryLabel: query.label,
      queryText: query.queryText,
      queryQualifiedName: query.qualifiedQueryName,
      expectedDatasourceInput: query.expectedInput.map((item) => ({ ...item })),
      fieldMappings: config.columnMappings.map((mapping) => ({
        columnId: mapping.columnId,
        queryParam:
          query.expectedInput.find(
            (input) => input.sourceColumnId === mapping.columnId
          )?.key ?? mapping.columnId,
        fieldType: mapping.fieldType
      })),
      userId: this.mockUserId,
      jwtToken: this.mockJwtToken,
      createdAt: config.createdAt,
      modifiedAt: config.modifiedAt,
      fields,
      settings: {
        formLayout: this.text.defaults.formLayout,
        labelPlacement: this.text.defaults.labelPlacement,
        showSectionBorders: false,
        submitBehavior: this.text.defaults.submitBehavior,
        redirectUrl: '',
        duplicateDetection: this.text.defaults.duplicateDetection
      },
      actions: FORM_BUILDER_DEFAULT_ACTIONS.map((action) => ({ ...action }))
    };
  }
}
