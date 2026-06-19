import { Injectable, inject } from '@angular/core';
import { WorkflowNode, WorkflowTriggerConfig } from '@qo/models';
import {
  WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY,
  getWorkflowNodeDefinition,
} from '../models/workflow-editor-palette.config';
import { WorkflowValidationService } from './workflow-validation.service';
import { WORKFLOW_LANGUAGE } from './workflow-language';

@Injectable({ providedIn: 'root' })
export class WorkflowEditorNodeViewService {
  private readonly validation = inject(WorkflowValidationService);
  private readonly lang = WORKFLOW_LANGUAGE;

  nodeKindLabel(node: WorkflowNode): string {
    return node.type.replace(/_/g, ' ');
  }

  nodeCategoryLabel(node: WorkflowNode): string {
    const definitionId = node.config[WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY];
    const definition = getWorkflowNodeDefinition(typeof definitionId === 'string' ? definitionId : undefined);
    return definition?.category ?? this.nodeKindLabel(node);
  }

  nodeDescription(node: WorkflowNode): string {
    const values = Object.values(node.config).filter((value) => typeof value === 'string');
    return values.slice(0, 2).join(' · ');
  }

  nodeAccent(node: WorkflowNode): string {
    switch (node.type) {
      case 'trigger':
        return 'var(--qo-color-success-500)';
      case 'email':
      case 'notification':
        return 'var(--qo-color-info-500)';
      case 'condition':
      case 'delay':
        return 'var(--qo-color-warning-500)';
      default:
        return 'var(--qo-color-primary-500)';
    }
  }

  nodeIcon(node: WorkflowNode): string {
    if (this.validation.isEndNode(node)) {
      return 'check-circle';
    }

    switch (node.type) {
      case 'trigger':
        return 'play';
      case 'condition':
        return 'git-branch';
      case 'email':
        return 'mail';
      case 'api_call':
        return 'globe';
      case 'database_write':
        return 'database';
      case 'custom_function':
        return 'code';
      case 'notification':
        return 'bell';
      default:
        return 'workflow';
    }
  }

  buildScheduleContextLabel(config: WorkflowTriggerConfig): string {
    const mode = this.triggerConfigValue(config, 'mode');
    const repeat = this.triggerConfigValue(config, 'cron') || 'daily';
    const timezone = this.triggerConfigValue(config, 'timezone') || this.lang.fallbacks.scheduler.defaultTimezone;

    if (mode === 'dateField') {
      const fieldName =
        this.triggerConfigValue(config, 'dateFieldName') ||
        this.triggerConfigValue(config, 'relativeField') ||
        this.lang.fallbacks.facade.dateField;
      const offset = this.scheduleOffsetLabel(config);
      return [this.lang.editor.contextScheduleDateField(fieldName), offset, repeat, timezone].filter(Boolean).join(' · ');
    }

    const runAt = this.triggerConfigValue(config, 'runAt') || '';
    const [datePart, timePart] = runAt.split(/\s+/);
    const dateLabel = datePart || this.lang.fallbacks.facade.scheduledDate;
    const timeLabel = timePart || this.triggerConfigValue(config, 'time') || this.lang.fallbacks.scheduler.defaultTime;

    return this.lang.editor.contextScheduleSpecific(dateLabel, timeLabel, repeat, timezone);
  }

  private scheduleOffsetLabel(config: WorkflowTriggerConfig): string | null {
    const direction = this.triggerConfigValue(config, 'offsetDirection');
    const count = this.triggerConfigNumber(config, 'offsetCount') ?? 0;
    const unit = this.triggerConfigValue(config, 'offsetUnit') || 'days';

    if (!direction || direction === 'on_date' || count <= 0) {
      return null;
    }

    const directionLabel = direction === 'before_date' ? 'before' : direction === 'after_date' ? 'after' : null;
    if (!directionLabel) {
      return null;
    }

    const unitLabel = count === 1 ? unit.replace(/s$/, '') : unit;
    return this.lang.editor.contextScheduleOffset(count, unitLabel, directionLabel);
  }

  private triggerConfigValue(config: WorkflowTriggerConfig, key: string): string | null {
    const value = (config as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }

  private triggerConfigNumber(config: WorkflowTriggerConfig, key: string): number | null {
    const value = (config as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : null;
  }
}
