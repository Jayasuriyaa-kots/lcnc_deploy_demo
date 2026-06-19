import { Injectable } from '@angular/core';
import { WorkflowDetail } from '@qo/models';
import {
  WorkflowPaletteGroup,
  WorkflowPaletteMode,
  WorkflowPaletteNode,
  buildWorkflowEditorPaletteGroups,
} from '../models/workflow-editor-palette.config';

@Injectable({ providedIn: 'root' })
export class WorkflowEditorPaletteService {
  paletteModeForWorkflow(workflow: WorkflowDetail | null): WorkflowPaletteMode {
    const triggerType = workflow?.triggerType;

    if (triggerType === 'form_submit' || triggerType === 'form_load' || triggerType === 'form_input') {
      return 'form-actions';
    }

    if (triggerType === 'event' || triggerType === 'webhook') {
      return 'events';
    }

    if (triggerType === 'schedule') {
      return 'scheduler';
    }

    if (triggerType === 'button') {
      return 'action-buttons';
    }

    return 'default';
  }

  paletteGroupsForMode(mode: WorkflowPaletteMode): WorkflowPaletteGroup[] {
    return buildWorkflowEditorPaletteGroups(mode);
  }

  filterPaletteGroups(groups: readonly WorkflowPaletteGroup[], search: string): WorkflowPaletteGroup[] {
    const query = search.trim().toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        nodes: group.nodes.filter((node) => {
          if (!query) {
            return true;
          }

          return [node.label, node.description, node.category, node.type].join(' ').toLowerCase().includes(query);
        }),
      }))
      .filter((group) => group.nodes.length > 0);
  }

  findPaletteNode(groups: readonly WorkflowPaletteGroup[], nodeId: string | undefined): WorkflowPaletteNode | undefined {
    if (!nodeId) {
      return undefined;
    }

    return groups.flatMap((group) => group.nodes).find((node) => node.id === nodeId);
  }
}
