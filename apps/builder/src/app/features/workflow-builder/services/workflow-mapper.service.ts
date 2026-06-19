import { Injectable } from '@angular/core';
import { WorkflowDetail, WorkflowSummary } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class WorkflowMapperService {
  toSummary(detail: WorkflowDetail): WorkflowSummary {
    return {
      id: detail.id,
      appId: detail.appId,
      name: detail.name,
      status: detail.status,
      triggerType: detail.triggerType,
      triggerLabel: detail.name,
      lastRunAt: null,
      runCount: 0,
      updatedAt: detail.updatedAt,
    };
  }
}
