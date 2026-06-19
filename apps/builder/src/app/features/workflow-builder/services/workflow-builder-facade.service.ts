import { Injectable, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  BuilderWorkflowFunctionsService,
  BuilderWorkflowsService,
} from '@qo/api-client';
import { WorkflowDetail, WorkflowExecutionSummary, WorkflowTriggerType } from '@qo/models';
import { WorkflowBuilderStateService } from './workflow-builder-state.service';
import { WorkflowSearchStateService } from './workflow-search-state.service';
import {
  WORKFLOW_ACTION_BUTTON_ROWS,
  WORKFLOW_EVENT_ROWS,
  WORKFLOW_FUNCTION_CARDS,
  WORKFLOW_SCHEDULE_ROWS,
  createWorkflowRuns,
} from '../models/workflow-builder-demo-data';
import { WorkflowSectionId } from '../models/workflow-builder-nav.model';
import { createWorkflowNodeFromDefinition } from '../models/workflow-editor-palette.config';
import { WORKFLOW_LANGUAGE } from './workflow-language';

@Injectable({ providedIn: 'root' })
export class WorkflowBuilderFacadeService {
  private readonly lang = WORKFLOW_LANGUAGE;
  private readonly workflowsService = inject(BuilderWorkflowsService);
  private readonly workflowFunctionsService = inject(BuilderWorkflowFunctionsService);
  private readonly state = inject(WorkflowBuilderStateService);
  private readonly searchState = inject(WorkflowSearchStateService);
  private initialized = false;

  readonly appId = this.state.appId.asReadonly();
  readonly activeSection = this.state.activeSection.asReadonly();
  readonly loading = this.state.loading.asReadonly();
  readonly error = this.state.error.asReadonly();
  readonly workflows = this.state.workflows.asReadonly();
  readonly workflowDetails = this.state.workflowDetails.asReadonly();
  readonly selectedWorkflow = this.state.selectedWorkflow.asReadonly();
  readonly selectedRunId = this.state.selectedRunId.asReadonly();
  readonly executionRuns = this.state.executionRuns.asReadonly();
  readonly functions = this.state.functions.asReadonly();
  readonly eventWorkflows = this.state.eventWorkflows.asReadonly();
  readonly scheduledWorkflows = this.state.scheduledWorkflows.asReadonly();
  readonly buttonActions = this.state.buttonActions.asReadonly();
  readonly functionCards = this.state.functionCards.asReadonly();
  readonly workflowCountLabel = computed(() => `${this.workflows().length} flows`);
  readonly functionCountLabel = computed(() => `${this.functions().length} functions`);
  readonly formActionWorkflows = computed(() =>
    this.workflows().filter((workflow) =>
      this.isFormTrigger(workflow.triggerType) &&
      this.matchesQuery(workflow.name, workflow.triggerLabel, this.getSearch('form-actions'))
    )
  );
  readonly formActionCountLabel = computed(() => `${this.formActionWorkflows().length} flows`);
  readonly filteredEventWorkflows = computed(() =>
    this.eventWorkflows().filter((event) =>
      this.matchesSectionQuery('events', event.event, event.trigger, event.source, event.status)
    )
  );
  readonly eventCountLabel = computed(() => `${this.filteredEventWorkflows().length} events`);
  readonly filteredScheduledWorkflows = computed(() =>
    this.scheduledWorkflows().filter((schedule) =>
      this.matchesSectionQuery('scheduler', schedule.workflowName, schedule.frequencyLabel, schedule.scopeLabel, schedule.nextRunAt)
    )
  );
  readonly scheduleCountLabel = computed(() => `${this.filteredScheduledWorkflows().length} schedules`);
  readonly filteredActionButtons = computed(() =>
    this.buttonActions().filter((action) =>
      this.matchesSectionQuery('action-buttons', action.actionName, action.linkedWorkflow, action.scope, action.source, action.usedIn)
    )
  );
  readonly actionButtonCountLabel = computed(() => `${this.filteredActionButtons().length} actions`);
  readonly filteredFunctionCards = computed(() =>
    this.functionCards().filter((item) =>
      this.matchesSectionQuery('functions', item.name, item.language, item.description, item.code)
    )
  );
  readonly functionCardCountLabel = computed(() => `${this.filteredFunctionCards().length} functions`);
  readonly selectedWorkflowRuns = computed(() => {
    const workflowId = this.state.selectedWorkflowId();
    if (!workflowId) {
      return [];
    }

    return this.executionRuns()[workflowId] ?? [];
  });

  async initialize(appId = this.state.appId()): Promise<void> {
    if (this.initialized && appId === this.state.appId()) {
      return;
    }

    this.state.appId.set(appId);
    this.state.loading.set(true);
    this.state.error.set(null);

    try {
      const [workflows, functions] = await Promise.all([
        firstValueFrom(this.workflowsService.list(appId)),
        firstValueFrom(this.workflowFunctionsService.list(appId)),
      ]);

      this.state.workflows.set(workflows);
      this.state.functions.set(functions);
      const formActionWorkflow = workflows.find((workflow) => this.isFormTrigger(workflow.triggerType)) ?? workflows[0];
      this.state.selectedWorkflowId.set(formActionWorkflow?.id ?? null);

      if (formActionWorkflow?.id) {
        const detail = await firstValueFrom(this.workflowsService.get(formActionWorkflow.id));
        this.state.setSelectedWorkflow(detail);
      }

      const formActionDetails = await Promise.all(
        workflows
          .filter((workflow) => this.isFormTrigger(workflow.triggerType))
          .map((workflow) => firstValueFrom(this.workflowsService.get(workflow.id)))
      );

      const detailMap = formActionDetails.reduce<Record<string, NonNullable<(typeof formActionDetails)[number]>>>((current, detail) => {
        if (!detail) {
          return current;
        }

        return {
          ...current,
          [detail.id]: detail,
        };
      }, {});

      this.state.workflowDetails.set(detailMap);
      this.state.executionRuns.set({
        wf_employee_onboarding: createWorkflowRuns('wf_employee_onboarding', 'form_submit', 3),
        wf_employee_offboarding: [],
      });
      this.state.eventWorkflows.set(WORKFLOW_EVENT_ROWS);
      this.state.scheduledWorkflows.set(WORKFLOW_SCHEDULE_ROWS);
      this.state.buttonActions.set(WORKFLOW_ACTION_BUTTON_ROWS);
      this.state.functionCards.set(WORKFLOW_FUNCTION_CARDS);
      this.initialized = true;
    } catch {
      this.state.error.set(this.lang.fallbacks.facade.failedInitialize);
    } finally {
      this.state.loading.set(false);
    }
  }

  setActiveSection(section: WorkflowSectionId): void {
    this.state.setActiveSection(section);
  }

  getSearch(section: WorkflowSectionId): string {
    return this.searchState.get(section);
  }

  setSearch(section: WorkflowSectionId, query: string): void {
    this.searchState.set(section, query);
  }

  async selectWorkflow(workflowId: string): Promise<void> {
    this.state.selectedWorkflowId.set(workflowId);

    const cached = this.workflowDetails()[workflowId];
    if (cached) {
      this.state.setSelectedWorkflow(cached);
      return;
    }

    const detail = await firstValueFrom(this.workflowsService.get(workflowId));
    this.state.setSelectedWorkflow(detail);
  }

  async createFormActionWorkflow(input: {
    formId: string;
    formName: string;
    recordEvent: string;
    formEvent: string;
    name: string;
  }): Promise<WorkflowDetail> {
    const formName = input.formName.trim() || this.lang.fallbacks.facade.selectedForm;
    const triggerType = this.normalizeFormTriggerType(input.formEvent);
    const recordEventLabel = this.recordEventLabel(input.recordEvent);
    const formEventLabel = this.formEventLabel(triggerType);

    const workflow = await firstValueFrom(
      this.workflowsService.create({
        appId: this.appId(),
        name: input.name.trim(),
        description: this.lang.fallbacks.facade.formWorkflowDescription(formName, formEventLabel, recordEventLabel),
        triggerType,
        triggerConfig: {
          formId: input.formId,
          formName,
          eventType: input.recordEvent,
        },
        steps: {
          nodes: [
            createWorkflowNodeFromDefinition('start', 'node_start', { x: 320, y: 48 }, {
              builderContext: 'form-builder',
              triggerType,
              sourceForm: input.formId,
              eventName: input.recordEvent,
            }),
          ],
          edges: [],
        },
      })
    );

    this.state.workflows.update((workflows) => [
      {
        id: workflow.id,
        appId: workflow.appId,
        name: workflow.name,
        status: workflow.status,
        triggerType: workflow.triggerType,
        triggerLabel: `${formName} · ${recordEventLabel} · ${formEventLabel}`,
        lastRunAt: null,
        runCount: 0,
        updatedAt: workflow.updatedAt,
      },
      ...workflows,
    ]);
    this.state.workflowDetails.update((details) => ({
      ...details,
      [workflow.id]: workflow,
    }));
    this.state.setSelectedWorkflow(workflow);

    return workflow;
  }

  async createEventTriggeredWorkflow(input: {
    name?: string;
    eventName?: string;
    sourceType?: string;
    sourceId?: string;
  } = {}): Promise<WorkflowDetail> {
    const eventName = input.eventName?.trim() || this.lang.fallbacks.events.newEvent;
    const sourceType = input.sourceType?.trim() || 'platform';
    const sourceId = input.sourceId?.trim() || 'event_source';

    const workflow = await firstValueFrom(
      this.workflowsService.create({
        appId: this.appId(),
        name: input.name?.trim() || this.lang.fallbacks.facade.workflowName(eventName),
        description: this.lang.fallbacks.facade.eventWorkflowDescription(eventName),
        triggerType: 'event',
        triggerConfig: {
          eventName,
          sourceType,
          sourceId,
          conditions: [],
        },
        steps: {
          nodes: [
            createWorkflowNodeFromDefinition('start', 'node_start', { x: 320, y: 48 }, {
              builderContext: 'workflow-builder',
              triggerType: 'event',
              eventName,
              sourceType,
              sourceId,
            }),
          ],
          edges: [],
        },
      })
    );

    this.state.workflows.update((workflows) => [
      {
        id: workflow.id,
        appId: workflow.appId,
        name: workflow.name,
        status: workflow.status,
        triggerType: workflow.triggerType,
        triggerLabel: `${eventName} · ${sourceType}`,
        lastRunAt: null,
        runCount: 0,
        updatedAt: workflow.updatedAt,
      },
      ...workflows,
    ]);
    this.state.workflowDetails.update((details) => ({
      ...details,
      [workflow.id]: workflow,
    }));
    this.state.eventWorkflows.update((events) => [
      {
        id: workflow.id,
        event: eventName,
        trigger: this.lang.fallbacks.events.event,
        source: sourceId,
        lastRun: this.lang.fallbacks.events.notRunYet,
        status: 'draft',
      },
      ...events,
    ]);
    this.state.setSelectedWorkflow(workflow);

    return workflow;
  }

  createEventWorkflow(input: { event: string; trigger: string; source: string; status: 'active' | 'paused' | 'draft' | 'failed' }): void {
    this.state.eventWorkflows.update((events) => [
      {
        id: this.createId('evt', input.event),
        event: input.event.trim(),
        trigger: input.trigger.trim(),
        source: input.source.trim(),
        lastRun: this.lang.fallbacks.events.notRunYet,
        status: input.status,
      },
      ...events,
    ]);
  }

  updateEventWorkflow(
    eventId: string,
    input: { event: string; trigger: string; source: string; status: 'active' | 'paused' | 'draft' | 'failed' }
  ): void {
    this.state.eventWorkflows.update((events) =>
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              event: input.event.trim(),
              trigger: input.trigger.trim(),
              source: input.source.trim(),
              status: input.status,
            }
          : event
      )
    );
  }

  deleteEventWorkflow(eventId: string): void {
    this.state.eventWorkflows.update((events) => events.filter((event) => event.id !== eventId));
  }

  upsertSchedule(input: {
    id?: string | null;
    workflowId?: string;
    workflowName: string;
    frequencyLabel: string;
    scopeLabel: string;
    nextRunAt: string;
    enabled: boolean;
    triggerMode?: 'specific' | 'dateField';
    formId?: string;
    dateFieldId?: string;
    time?: string;
    timezone?: string;
  }): void {
    const schedule = {
      id: input.id ?? this.createId('sch', input.workflowName),
      workflowId: input.workflowId,
      workflowName: input.workflowName.trim(),
      frequencyLabel: input.frequencyLabel,
      scopeLabel: input.scopeLabel,
      nextRunAt: input.nextRunAt,
      enabled: input.enabled,
      triggerMode: input.triggerMode,
      formId: input.formId,
      dateFieldId: input.dateFieldId,
      time: input.time,
      timezone: input.timezone,
    };

    if (input.id) {
      this.state.scheduledWorkflows.update((schedules) =>
        schedules.map((item) => (item.id === input.id ? schedule : item))
      );
      return;
    }

    this.state.scheduledWorkflows.update((schedules) => [schedule, ...schedules]);
  }

  toggleSchedule(scheduleId: string): void {
    this.state.scheduledWorkflows.update((schedules) =>
      schedules.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, enabled: !schedule.enabled } : schedule
      )
    );
  }

  deleteSchedule(scheduleId: string): void {
    this.state.scheduledWorkflows.update((schedules) => schedules.filter((schedule) => schedule.id !== scheduleId));
  }

  async createScheduledWorkflow(input: {
    name: string;
    mode: 'specific' | 'dateField';
    startDate?: string;
    time: string;
    repeat: string;
    timezone: string;
    formId?: string;
    formName?: string;
    dateFieldId?: string;
    dateFieldName?: string;
    executeWorkflow?: string;
    offsetCount?: number;
    offsetUnit?: string;
    endMode?: string;
    endDate?: string;
    endAfterRuns?: number | null;
    conditions: unknown[];
  }): Promise<WorkflowDetail> {
    const workflowName = input.name.trim() || this.lang.fallbacks.facade.scheduledWorkflow;
    const modeLabel = input.mode === 'dateField' ? 'date field' : 'specific date';
    const workflow = await firstValueFrom(
      this.workflowsService.create({
        appId: this.appId(),
        name: workflowName,
        description: this.lang.fallbacks.facade.schedulerWorkflowDescription(modeLabel),
        triggerType: 'schedule',
        triggerConfig: {
          mode: input.mode,
          runAt: input.mode === 'specific' ? `${input.startDate ?? ''} ${input.time}`.trim() : input.time,
          cron: input.repeat,
          timezone: input.timezone,
          relativeField: input.dateFieldId,
          formId: input.formId,
          formName: input.formName,
          dateFieldId: input.dateFieldId,
          dateFieldName: input.dateFieldName,
          executeWorkflow: input.executeWorkflow,
          offsetDirection: input.executeWorkflow,
          offsetCount: input.offsetCount ?? 0,
          offsetUnit: input.offsetUnit ?? 'days',
          endMode: input.endMode ?? 'never',
          endDate: input.endDate,
          endAfterRuns: input.endAfterRuns,
          conditions: input.conditions,
        },
        steps: {
          nodes: [
            createWorkflowNodeFromDefinition('start', 'node_start', { x: 320, y: 48 }, {
              builderContext: 'workflow-builder',
              triggerType: 'schedule',
              scheduleMode: input.mode,
              repeat: input.repeat,
              timezone: input.timezone,
            }),
          ],
          edges: [],
        },
      })
    );

    this.state.workflows.update((workflows) => [
      {
        id: workflow.id,
        appId: workflow.appId,
        name: workflow.name,
        status: workflow.status,
        triggerType: workflow.triggerType,
        triggerLabel:
          input.mode === 'dateField'
            ? `${input.formName ?? this.lang.fallbacks.facade.form} · ${input.dateFieldName ?? this.lang.fallbacks.facade.dateField} · ${input.repeat}`
            : `${input.startDate ?? this.lang.fallbacks.facade.scheduledDate} · ${input.time} · ${input.repeat}`,
        lastRunAt: null,
        runCount: 0,
        updatedAt: workflow.updatedAt,
      },
      ...workflows,
    ]);
    this.state.workflowDetails.update((details) => ({
      ...details,
      [workflow.id]: workflow,
    }));
    this.state.setSelectedWorkflow(workflow);

    return workflow;
  }

  replaceWorkflowDetail(workflow: WorkflowDetail): void {
    this.state.setSelectedWorkflow(workflow);
    this.state.workflows.update((workflows) =>
      workflows.map((item) =>
        item.id === workflow.id
          ? {
              ...item,
              name: workflow.name,
              status: workflow.status,
              updatedAt: workflow.updatedAt,
            }
          : item
      )
    );
  }

  appendExecutionRun(workflowId: string, run: WorkflowExecutionSummary): void {
    this.state.executionRuns.update((runs) => ({
      ...runs,
      [workflowId]: [run, ...(runs[workflowId] ?? [])],
    }));
    this.state.selectedRunId.set(run.id);
  }

  async upsertActionButton(input: {
    id?: string | null;
    actionName: string;
    linkedWorkflow: string;
    scope: 'Report' | 'Page' | 'Global';
    source: string;
    usedIn: string;
    status: 'active' | 'draft' | 'inactive';
  }): Promise<void> {
    await this.fakeDelay();

    const action = {
      id: input.id ?? this.createId('act', input.actionName),
      actionName: input.actionName.trim(),
      linkedWorkflow: input.linkedWorkflow.trim(),
      scope: input.scope,
      source: input.source.trim(),
      usedIn: input.usedIn.trim(),
      status: input.status,
    };

    if (input.id) {
      this.state.buttonActions.update((actions) => actions.map((item) => (item.id === input.id ? action : item)));
      return;
    }

    this.state.buttonActions.update((actions) => [action, ...actions]);
  }

  async deleteActionButton(actionId: string): Promise<void> {
    await this.fakeDelay();
    this.state.buttonActions.update((actions) => actions.filter((action) => action.id !== actionId));
  }

  async upsertFunctionCard(input: {
    id?: string | null;
    name: string;
    language: 'javascript' | 'python';
    description: string;
    code: string;
  }): Promise<void> {
    await this.fakeDelay();

    const item = {
      id: input.id ?? this.createId('fn', input.name),
      name: input.name.trim(),
      language: input.language,
      description: input.description.trim(),
      code: input.code,
      updatedAt: new Date().toISOString(),
    };

    if (input.id) {
      this.state.functionCards.update((functions) => functions.map((fn) => (fn.id === input.id ? item : fn)));
      return;
    }

    this.state.functionCards.update((functions) => [item, ...functions]);
  }

  async duplicateFunctionCard(functionId: string): Promise<void> {
    await this.fakeDelay();
    const source = this.functionCards().find((item) => item.id === functionId);
    if (!source) {
      return;
    }

    this.state.functionCards.update((functions) => [
      {
        ...source,
        id: this.createId('fn', `${source.name}_copy`),
        name: `${source.name} Copy`,
        updatedAt: new Date().toISOString(),
      },
      ...functions,
    ]);
  }

  async deleteFunctionCard(functionId: string): Promise<void> {
    await this.fakeDelay();
    this.state.functionCards.update((functions) => functions.filter((item) => item.id !== functionId));
  }

  async testFunctionCard(functionId: string): Promise<void> {
    await this.fakeDelay();
    const exists = this.functionCards().some((item) => item.id === functionId);
    if (!exists) {
      throw new Error(this.lang.fallbacks.facade.functionNotFound);
    }
  }

  selectRun(runId: string): void {
    this.state.selectedRunId.set(runId);
  }

  private matchesQuery(...values: string[]): boolean {
    return this.matchesSectionQuery('form-actions', ...values);
  }

  private matchesSectionQuery(section: WorkflowSectionId, ...values: string[]): boolean {
    const query = this.getSearch(section).trim().toLowerCase();
    if (!query) {
      return true;
    }

    return values.some((value) => value.toLowerCase().includes(query));
  }

  private isFormTrigger(triggerType: WorkflowTriggerType): boolean {
    return triggerType === 'form_submit' || triggerType === 'form_load' || triggerType === 'form_input';
  }

  private createId(prefix: string, value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32);

    return `${prefix}_${slug || 'item'}_${Date.now()}`;
  }

  private fakeDelay(ms = 250): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private recordEventLabel(eventType: string): string {
    switch (eventType) {
      case 'record_created':
        return this.lang.fallbacks.facade.recordCreated;
      case 'record_edited':
        return this.lang.fallbacks.facade.recordEdited;
      case 'record_created_or_edited':
        return this.lang.fallbacks.facade.recordCreatedOrEdited;
      case 'record_deleted':
        return this.lang.fallbacks.facade.recordDeleted;
      default:
        return this.lang.fallbacks.facade.recordEvent;
    }
  }

  private formEventLabel(triggerType: WorkflowTriggerType): string {
    switch (triggerType) {
      case 'form_load':
        return this.lang.fallbacks.facade.formLoad;
      case 'form_submit':
        return this.lang.fallbacks.facade.formSubmit;
      case 'form_input':
        return this.lang.fallbacks.facade.formInput;
      default:
        return this.lang.fallbacks.facade.formEvent;
    }
  }

  private normalizeFormTriggerType(triggerType: string): WorkflowTriggerType {
    if (triggerType === 'form_load' || triggerType === 'form_input' || triggerType === 'form_submit') {
      return triggerType;
    }

    return 'form_submit';
  }
}
