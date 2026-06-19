import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  WorkflowExecutionDetail,
  WorkflowTriggerRequest,
} from '@quanta-ops/models';

@Injectable({ providedIn: 'root' })
export class ClientWorkflowRunnerService {
  trigger(payload: WorkflowTriggerRequest): Observable<{ jobId: string; accepted: boolean }> {
    return of({
      jobId: `job_${Date.now()}`,
      accepted: true,
    }).pipe(delay(150));
  }

  getJob(jobId: string): Observable<WorkflowExecutionDetail> {
    const detail: WorkflowExecutionDetail = {
      id: jobId,
      workflowId: 'wf_employee_onboarding',
      celeryTaskId: `celery_${jobId}`,
      triggerType: 'manual',
      status: 'completed',
      input: { recordId: 'emp_1001' },
      output: { message: 'Workflow completed.' },
      errorMessage: null,
      stepsLog: ['Trigger accepted', 'Record created', 'Email sent'],
      startedAt: '2026-04-22T07:58:00.000Z',
      finishedAt: '2026-04-22T07:58:03.000Z',
    };

    return of(detail).pipe(delay(150));
  }
}
