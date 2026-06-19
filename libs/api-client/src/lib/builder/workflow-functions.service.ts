import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  FunctionEditorModel,
  WorkflowFunctionDetail,
  WorkflowFunctionSummary,
  WorkflowSearchFilters,
} from '@quanta-ops/models';

@Injectable({ providedIn: 'root' })
export class BuilderWorkflowFunctionsService {
  private readonly functions: WorkflowFunctionDetail[] = [
    {
      id: 'fn_leave_payload',
      appId: 'app_hr_management',
      name: 'Format Leave Payload',
      language: 'javascript',
      description: 'Normalizes leave request payloads before webhook delivery.',
      code: 'function transform(input) {\n  return { ...input, source: "workflow-builder" };\n}',
      createdAt: '2026-04-01T09:00:00.000Z',
      updatedAt: '2026-04-22T08:20:00.000Z',
    },
    {
      id: 'fn_employee_key',
      appId: 'app_hr_management',
      name: 'Build Employee Key',
      language: 'python',
      description: 'Creates a stable external identifier for employee sync jobs.',
      code: 'def build_key(record):\n    return f"{record.get(\'department\', \'na\')}-{record.get(\'employee_code\', \'unknown\')}"',
      createdAt: '2026-03-28T11:30:00.000Z',
      updatedAt: '2026-04-20T06:10:00.000Z',
    },
  ];

  list(appId: string, filters?: Partial<WorkflowSearchFilters>): Observable<WorkflowFunctionSummary[]> {
    const query = filters?.query?.trim().toLowerCase() ?? '';

    return of(
      this.functions
        .filter((item) => item.appId === appId)
        .filter((item) => !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))
        .map(({ code: _code, createdAt: _createdAt, ...summary }) => summary)
    ).pipe(delay(150));
  }

  get(functionId: string): Observable<WorkflowFunctionDetail | null> {
    return of(this.functions.find((item) => item.id === functionId) ?? null).pipe(delay(150));
  }

  create(payload: FunctionEditorModel & { appId: string }): Observable<WorkflowFunctionDetail> {
    const next: WorkflowFunctionDetail = {
      id: `fn_${Date.now()}`,
      appId: payload.appId,
      name: payload.name,
      language: payload.language,
      description: payload.description,
      code: payload.code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return of(next).pipe(delay(150));
  }

  update(functionId: string, payload: FunctionEditorModel): Observable<WorkflowFunctionDetail> {
    return of({
      id: functionId,
      appId: 'app_hr_management',
      name: payload.name,
      language: payload.language,
      description: payload.description,
      code: payload.code,
      createdAt: '2026-04-01T09:00:00.000Z',
      updatedAt: new Date().toISOString(),
    }).pipe(delay(150));
  }

  remove(functionId: string): Observable<{ success: boolean; functionId: string }> {
    return of({ success: true, functionId }).pipe(delay(150));
  }
}
