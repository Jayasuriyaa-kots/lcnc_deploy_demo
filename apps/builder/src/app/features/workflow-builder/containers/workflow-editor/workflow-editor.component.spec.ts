import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { BuilderWorkflowsService } from '@qo/api-client';
import { WorkflowDetail, WorkflowEdge, WorkflowNode } from '@qo/models';
import { QoConfirmDialogService, QoToastService } from '@qo/ui-components';
import { WorkflowCanvasStateService } from '../../services/workflow-canvas-state.service';
import { WorkflowBuilderFacadeService } from '../../services/workflow-builder-facade.service';
import { WorkflowValidationService } from '../../services/workflow-validation.service';
import {
  WORKFLOW_BUILDER_I18N_TESTING_PROVIDER,
  WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '../../testing/workflow-builder-i18n.testing';
import { WorkflowEditorComponent } from './workflow-editor.component';

describe('WorkflowEditorComponent', () => {
  let fixture: ComponentFixture<WorkflowEditorComponent>;
  let component: WorkflowEditorComponent;

  const workflow: WorkflowDetail = {
    id: 'wf_employee_onboarding',
    appId: 'app_hr_management',
    name: 'Employee Onboarding',
    description: 'Onboard employees',
    status: 'active',
    triggerType: 'form_submit',
    triggerConfig: {
      formId: 'form_add_employee',
      formName: 'Add Employee Form',
      eventType: 'record_created',
    },
    steps: {
      nodes: [
        {
          id: 'node_trigger',
          type: 'trigger',
          label: 'Form Created',
          position: { x: 0, y: 0 },
          config: { summary: 'employees table' },
        },
      ],
      edges: [],
    },
    version: 1,
    updatedAt: '2026-04-22T08:15:00.000Z',
    createdAt: '2026-04-22T08:15:00.000Z',
  };

  const selectedWorkflow = signal<WorkflowDetail | null>(workflow);
  const nodes = signal<WorkflowNode[]>([]);
  const edges = signal<WorkflowEdge[]>([]);
  const selectedNodeId = signal<string | null>(null);
  const validationState = signal<string[]>([]);
  const zoom = signal(1);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowEditorComponent, WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => workflow.id,
              },
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate').and.resolveTo(true),
          },
        },
        {
          provide: BuilderWorkflowsService,
          useValue: {
            update: jasmine.createSpy('update').and.returnValue(of(workflow)),
          },
        },
        {
          provide: QoToastService,
          useValue: {
            error: jasmine.createSpy('error'),
            success: jasmine.createSpy('success'),
          },
        },
        {
          provide: QoConfirmDialogService,
          useValue: {
            confirm: jasmine.createSpy('confirm').and.resolveTo(false),
          },
        },
        WORKFLOW_BUILDER_I18N_TESTING_PROVIDER,
        {
          provide: WorkflowBuilderFacadeService,
          useValue: {
            selectedWorkflow,
            initialize: jasmine.createSpy('initialize').and.resolveTo(),
            selectWorkflow: jasmine.createSpy('selectWorkflow').and.resolveTo(),
            appendExecutionRun: jasmine.createSpy('appendExecutionRun'),
            replaceWorkflowDetail: jasmine.createSpy('replaceWorkflowDetail'),
          },
        },
        {
          provide: WorkflowCanvasStateService,
          useValue: {
            nodes,
            edges,
            selectedNodeId,
            validationState,
            zoom,
            setGraph: jasmine.createSpy('setGraph').and.callFake((nextNodes: WorkflowNode[], nextEdges: WorkflowEdge[]) => {
              nodes.set(nextNodes);
              edges.set(nextEdges);
            }),
            addNode: jasmine.createSpy('addNode'),
            addEdge: jasmine.createSpy('addEdge'),
            updateNodePosition: jasmine.createSpy('updateNodePosition'),
            updateNodeConfig: jasmine.createSpy('updateNodeConfig'),
            removeSelectedNode: jasmine.createSpy('removeSelectedNode'),
            setValidationState: jasmine.createSpy('setValidationState'),
            zoomIn: jasmine.createSpy('zoomIn'),
            zoomOut: jasmine.createSpy('zoomOut'),
            resetZoom: jasmine.createSpy('resetZoom'),
            snapPosition: jasmine.createSpy('snapPosition').and.callFake((position: WorkflowNode['position']) => position),
          },
        },
        {
          provide: WorkflowValidationService,
          useValue: {
            validateTriggerConfig: jasmine.createSpy('validateTriggerConfig').and.returnValue([]),
            validateGraph: jasmine.createSpy('validateGraph').and.returnValue([]),
            isStartNode: jasmine.createSpy('isStartNode').and.callFake((node: WorkflowNode) => node.type === 'trigger'),
            isEndNode: jasmine.createSpy('isEndNode').and.returnValue(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates the workflow editor', () => {
    expect(component).toBeTruthy();
  });

  it('allows navigation when the editor is clean', () => {
    component.dirty.set(false);

    expect(component.canLeaveEditor()).toBeTrue();
  });

  it('asks before leaving with unsaved changes', async () => {
    const confirmDialog = TestBed.inject(QoConfirmDialogService);
    component.dirty.set(true);

    await expectAsync(Promise.resolve(component.canLeaveEditor())).toBeResolvedTo(false);
    expect(confirmDialog.confirm).toHaveBeenCalledWith(
      'Leave Workflow?',
      'You have unsaved workflow changes. Leave without saving?',
      {
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        danger: true,
      }
    );
  });

  it('creates a validation feedback panel from validation errors', () => {
    validationState.set(['Connect the workflow path to an End node before saving.']);
    fixture.detectChanges();

    expect(component.feedbackPanel()?.title).toBe('Workflow Needs Attention');
    expect(component.feedbackPanel()?.tone).toBe('warning');
    expect(component.feedbackPanel()?.messages).toContain('Connect the workflow path to an End node before saving.');
  });
});
