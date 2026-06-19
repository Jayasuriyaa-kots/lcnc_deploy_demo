import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  Workflow,
  WorkflowDetail,
  WorkflowSearchFilters,
  WorkflowSummary,
} from '@quanta-ops/models';

const MOCK_WORKFLOWS: WorkflowDetail[] = [
  {
    id: 'wf_employee_onboarding',
    appId: 'app_hr_management',
    name: 'New Employee Onboarding Flow',
    description: 'Creates records, notifies stakeholders, and generates offer documents for employee onboarding.',
    status: 'active',
    triggerType: 'form_submit',
    triggerConfig: {
      formId: 'form_add_employee',
      formName: 'Add Employee Form',
      eventType: 'record_created',
    },
    steps: {
      nodes: [
        { id: 'node_trigger', type: 'trigger', label: 'Form Created', position: { x: 0, y: 0 }, config: { summary: 'employees table' } },
        { id: 'node_record', type: 'database_write', label: 'Create Record', position: { x: 220, y: 0 }, config: { summary: 'HR system sync' } },
        { id: 'node_email', type: 'email', label: 'Send Email', position: { x: 440, y: 0 }, config: { summary: 'Welcome email' } },
        { id: 'node_document', type: 'custom_function', label: 'Gen. PDF', position: { x: 660, y: 0 }, config: { summary: 'Offer letter' } },
        { id: 'node_end', type: 'delay', label: 'Done', position: { x: 880, y: 0 }, config: { summary: 'Log completion' } },
      ],
      edges: [
        { id: 'edge_1', sourceNodeId: 'node_trigger', targetNodeId: 'node_record' },
        { id: 'edge_2', sourceNodeId: 'node_record', targetNodeId: 'node_email' },
        { id: 'edge_3', sourceNodeId: 'node_email', targetNodeId: 'node_document' },
        { id: 'edge_4', sourceNodeId: 'node_document', targetNodeId: 'node_end' },
      ],
    },
    version: 4,
    updatedAt: '2026-04-22T08:15:00.000Z',
    createdAt: '2026-03-16T11:20:00.000Z',
  },
  {
    id: 'wf_employee_offboarding',
    appId: 'app_hr_management',
    name: 'Employee Offboarding Flow',
    description: 'Revokes access, archives employee documents, and sends HR follow-ups when status changes to inactive.',
    status: 'active',
    triggerType: 'form_input',
    triggerConfig: {
      formId: 'form_add_employee',
      formName: 'Add Employee Form',
      eventType: 'field_status_changed',
      fieldId: 'employment_status',
      fieldName: 'Inactive',
    },
    steps: {
      nodes: [
        { id: 'node_trigger', type: 'trigger', label: 'Status Changed', position: { x: 0, y: 0 }, config: { summary: 'employees table' } },
        { id: 'node_update', type: 'api_call', label: 'Revoke Access', position: { x: 220, y: 0 }, config: { summary: 'All systems' } },
        { id: 'node_document', type: 'database_write', label: 'Archive Data', position: { x: 440, y: 0 }, config: { summary: 'Employee records' } },
        { id: 'node_notify', type: 'notification', label: 'Send Email', position: { x: 660, y: 0 }, config: { summary: 'Farewell email' } },
        { id: 'node_end', type: 'delay', label: 'Done', position: { x: 880, y: 0 }, config: { summary: 'Log' } },
      ],
      edges: [
        { id: 'edge_1', sourceNodeId: 'node_trigger', targetNodeId: 'node_update' },
        { id: 'edge_2', sourceNodeId: 'node_update', targetNodeId: 'node_document' },
        { id: 'edge_3', sourceNodeId: 'node_document', targetNodeId: 'node_notify' },
        { id: 'edge_4', sourceNodeId: 'node_notify', targetNodeId: 'node_end' },
      ],
    },
    version: 3,
    updatedAt: '2026-04-22T06:20:00.000Z',
    createdAt: '2026-03-25T10:30:00.000Z',
  },
  {
    id: 'wf_employee_exit',
    appId: 'app_hr_management',
    name: 'Employee Offboarding Flow',
    description: 'Revokes access, archives documents, and alerts HR after employee status changes.',
    status: 'draft',
    triggerType: 'event',
    triggerConfig: {
      eventName: 'employee.status.changed',
      sourceType: 'table',
      sourceId: 'employees',
      conditions: ['status=Inactive'],
    },
    steps: {
      nodes: [
        { id: 'node_trigger', type: 'trigger', label: 'Status Changed', position: { x: 0, y: 0 }, config: {} },
        { id: 'node_notify', type: 'notification', label: 'Notify HR', position: { x: 180, y: 0 }, config: {} },
      ],
      edges: [{ id: 'edge_1', sourceNodeId: 'node_trigger', targetNodeId: 'node_notify' }],
    },
    version: 2,
    updatedAt: '2026-04-21T07:10:00.000Z',
    createdAt: '2026-03-29T14:45:00.000Z',
  },
];

@Injectable({ providedIn: 'root' })
export class BuilderWorkflowsService {
  list(appId: string, filters?: Partial<WorkflowSearchFilters>): Observable<WorkflowSummary[]> {
    const query = filters?.query?.trim().toLowerCase() ?? '';

    return of(
      MOCK_WORKFLOWS
        .filter((item) => item.appId === appId)
        .filter((item) => !filters?.triggerType || item.triggerType === filters.triggerType)
        .filter((item) => !filters?.status || item.status === filters.status)
        .filter((item) => !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))
        .map((item) => ({
          id: item.id,
          appId: item.appId,
          name: item.name,
          status: item.status,
          triggerType: item.triggerType,
          triggerLabel:
            item.id === 'wf_employee_onboarding'
              ? 'employees · Record Created — runs on every Add Employee Form submission'
              : item.id === 'wf_employee_offboarding'
                ? 'employees · Field: status changed to Inactive'
                : 'employees · Status Changed',
          lastRunAt: item.status === 'active' ? '2026-04-22T07:58:00.000Z' : null,
          runCount: item.id === 'wf_employee_onboarding' ? 247 : item.id === 'wf_employee_offboarding' ? 0 : 12,
          updatedAt: item.updatedAt,
        }))
    ).pipe(delay(150));
  }

  get(workflowId: string): Observable<WorkflowDetail | null> {
    return of(MOCK_WORKFLOWS.find((item) => item.id === workflowId) ?? null).pipe(delay(150));
  }

  create(payload: CreateWorkflowRequest & { appId: string }): Observable<WorkflowDetail> {
    const created: WorkflowDetail = {
      id: `wf_${Date.now()}`,
      appId: payload.appId,
      name: payload.name,
      description: payload.description,
      status: 'draft',
      triggerType: payload.triggerType,
      triggerConfig: payload.triggerConfig,
      steps: payload.steps,
      version: 1,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    MOCK_WORKFLOWS.unshift(created);

    return of(created).pipe(delay(150));
  }

  update(workflowId: string, payload: UpdateWorkflowRequest): Observable<WorkflowDetail> {
    const existing = MOCK_WORKFLOWS.find((item) => item.id === workflowId);
    const updated: WorkflowDetail = {
      id: workflowId,
      appId: existing?.appId ?? 'app_hr_management',
      name: payload.name,
      description: payload.description,
      status: payload.status,
      triggerType: existing?.triggerType ?? 'manual',
      triggerConfig: payload.triggerConfig,
      steps: payload.steps,
      version: (existing?.version ?? 4) + 1,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt ?? '2026-04-01T00:00:00.000Z',
    };

    if (existing) {
      Object.assign(existing, updated);
    }

    return of(updated).pipe(delay(150));
  }

  remove(workflowId: string): Observable<{ success: boolean; workflowId: string }> {
    return of({ success: true, workflowId }).pipe(delay(150));
  }

  activate(workflowId: string): Observable<{ success: boolean; workflowId: string }> {
    return of({ success: true, workflowId }).pipe(delay(150));
  }

  testRun(workflowId: string, payload?: Record<string, unknown>): Observable<{ success: boolean; workflowId: string; payload?: Record<string, unknown> }> {
    return of({ success: true, workflowId, payload }).pipe(delay(150));
  }
}

@Injectable({ providedIn: 'root' })
export class WorkflowsService extends BuilderWorkflowsService {
  getWorkflows(appId: string): Observable<Workflow[]> {
    const workflows: Workflow[] = [
      {
        id: 'wf_1',
        name: 'Sync Users to CRM',
        appId,
        isActive: true,
        createdAt: new Date().toISOString(),
        steps: [
          { id: 's1', type: 'trigger', name: 'Webhook', config: {} },
          { id: 's2', type: 'action', name: 'Send to CRM', config: {} },
        ],
      },
    ];

    return of(workflows).pipe(delay(150));
  }
}
