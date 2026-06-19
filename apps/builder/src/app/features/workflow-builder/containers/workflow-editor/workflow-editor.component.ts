import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActivatedRoute } from '@angular/router';
import {
  QoConfirmDialogComponent,
  QoConfirmDialogConfig,
  QoEmptyStateComponent,
  QoIconComponent,
} from '@qo/ui-components';
import { FormField, WorkflowEdge, WorkflowNode } from '@qo/models';
import { WorkflowCanvasStyleDirective, WorkflowNodePositionDirective } from '../../directives';
import {
  WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY,
  WorkflowPaletteNode,
  getWorkflowNodeDefinition,
} from '../../models/workflow-editor-palette.config';
import {
  WorkflowNodeConfigChange,
  WorkflowNodeConfigPanelComponent,
} from '../../components/config-panel/workflow-node-config-panel';
import { WorkflowBuilderFacadeService } from '../../services/workflow-builder-facade.service';
import { WorkflowAutoMappingService } from '../../services/workflow-auto-mapping.service';
import { WorkflowCanvasStateService } from '../../services/workflow-canvas-state.service';
import { WorkflowFormDatasourceQuery } from '../../services/workflow-form-context.service';
import { WorkflowValidationService } from '../../services/workflow-validation.service';
import { WorkflowEditorGraphService } from '../../services/workflow-editor-graph.service';
import { WorkflowEditorNodeViewService } from '../../services/workflow-editor-node-view.service';
import { WorkflowEditorNodeFactoryService } from '../../services/workflow-editor-node-factory.service';
import {
  WorkflowConnectionDraft,
  WorkflowEditorCanvasInteractionService,
  WorkflowNodeDragState,
} from '../../services/workflow-editor-canvas-interaction.service';
import { PreviewNodeRunState, WorkflowEditorRunService } from '../../services/workflow-editor-run.service';
import { WorkflowEditorPersistenceService } from '../../services/workflow-editor-persistence.service';
import { WorkflowEditorLoaderService } from '../../services/workflow-editor-loader.service';
import { WorkflowEditorNodeCommandsService } from '../../services/workflow-editor-node-commands.service';
import { WorkflowEditorNavigationService } from '../../services/workflow-editor-navigation.service';
import { WorkflowEditorPaletteService } from '../../services/workflow-editor-palette.service';
import { WorkflowEditorConnectionService } from '../../services/workflow-editor-connection.service';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';
import {
  WorkflowEditorFeedbackPanel,
  WorkflowEditorFeedbackPanelComponent,
  WorkflowEditorRunPreviewComponent,
  WorkflowEditorSidebarComponent,
  WorkflowEditorTopbarComponent,
  WorkflowEditorZoomControlsComponent,
} from './components';

@Component({
  selector: 'app-workflow-editor',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    QoConfirmDialogComponent,
    QoEmptyStateComponent,
    QoIconComponent,
    WorkflowNodeConfigPanelComponent,
    WorkflowCanvasStyleDirective,
    WorkflowNodePositionDirective,
    WorkflowEditorFeedbackPanelComponent,
    WorkflowEditorRunPreviewComponent,
    WorkflowEditorSidebarComponent,
    WorkflowEditorTopbarComponent,
    WorkflowEditorZoomControlsComponent,
  ],
  templateUrl: './workflow-editor.component.html',
  styleUrl: './workflow-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WorkflowEditorComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  private readonly route = inject(ActivatedRoute);
  private readonly validation = inject(WorkflowValidationService);
  private readonly editorGraph = inject(WorkflowEditorGraphService);
  private readonly nodeView = inject(WorkflowEditorNodeViewService);
  private readonly nodeFactory = inject(WorkflowEditorNodeFactoryService);
  private readonly canvasInteraction = inject(WorkflowEditorCanvasInteractionService);
  private readonly editorRun = inject(WorkflowEditorRunService);
  private readonly persistence = inject(WorkflowEditorPersistenceService);
  private readonly loader = inject(WorkflowEditorLoaderService);
  private readonly nodeCommands = inject(WorkflowEditorNodeCommandsService);
  private readonly navigation = inject(WorkflowEditorNavigationService);
  private readonly palette = inject(WorkflowEditorPaletteService);
  private readonly connection = inject(WorkflowEditorConnectionService);
  private readonly autoMapping = inject(WorkflowAutoMappingService);
  private readonly canvasElement = viewChild<ElementRef<HTMLElement>>('workflowCanvas');
  readonly facade = inject(WorkflowBuilderFacadeService);
  readonly canvas = inject(WorkflowCanvasStateService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly running = signal(false);
  readonly dirty = signal(false);
  readonly lastSavedAt = signal<string | null>(null);
  readonly editorError = signal<string | null>(null);
  readonly connectingFromNodeId = signal<string | null>(null);
  readonly connectionHint = signal<string | null>(null);
  readonly dragOverCanvas = signal(false);
  readonly configPanelCollapsed = signal(false);
  readonly recentlyAddedNodeId = signal<string | null>(null);
  readonly nodeRunStates = signal<Record<string, PreviewNodeRunState>>({});
  readonly testRunMessage = signal<string | null>(null);
  readonly workflowRunPreviewJson = signal<string | null>(null);
  readonly formFields = signal<readonly FormField[]>([]);
  readonly formDatasourceQueries = signal<readonly WorkflowFormDatasourceQuery[]>([]);
  readonly paletteSearch = signal('');
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  private readonly dragState = signal<WorkflowNodeDragState | null>(null);
  private readonly connectionDraft = signal<WorkflowConnectionDraft | null>(null);
  readonly workflow = this.facade.selectedWorkflow;
  readonly nodes = this.canvas.nodes.asReadonly();
  readonly edges = this.canvas.edges.asReadonly();
  readonly selectedNodeId = this.canvas.selectedNodeId.asReadonly();
  readonly validationErrors = this.canvas.validationState.asReadonly();
  readonly zoom = this.canvas.zoom.asReadonly();
  readonly zoomLabel = computed(() => `${Math.round(this.zoom() * 100)}%`);
  readonly canvasWidth = computed(() => Math.max(1800, ...this.nodes().map((node) => node.position.x + 260)));
  readonly canvasHeight = computed(() => Math.max(980, ...this.nodes().map((node) => node.position.y + 180)));
  readonly selectedNode = computed(() => this.nodes().find((node) => node.id === this.selectedNodeId()) ?? null);
  readonly configPanelOpen = computed(() => !!this.selectedNode() && !this.configPanelCollapsed());
  readonly mappingSources = computed(() => this.autoMapping.buildSources(this.formFields(), this.nodes(), this.selectedNodeId()));
  readonly selectedNodeValidationMessages = computed(() => {
    const selectedNode = this.selectedNode();

    if (!selectedNode) {
      return [];
    }

    return this.validationErrors().filter((error) => error.startsWith(`${selectedNode.label}:`));
  });
  readonly selectedNodeDefinition = computed(() => {
    const selectedNode = this.selectedNode();

    if (!selectedNode) {
      return null;
    }

    const definitionId = selectedNode.config[WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY];
    return getWorkflowNodeDefinition(typeof definitionId === 'string' ? definitionId : undefined);
  });
  readonly canDeleteSelectedNode = computed(() => {
    return this.nodeCommands.canDeleteNode(this.selectedNode());
  });
  readonly invalidNodeIds = computed(() => {
    const errors = this.validationErrors();

    return new Set(
      this.nodes()
        .filter((node) => errors.some((error) => error.startsWith(`${node.label}:`)))
        .map((node) => node.id)
    );
  });
  readonly workflowStatusLabel = computed(() => this.workflow()?.status ?? 'draft');
  readonly workflowVersionLabel = computed(() => `v${this.workflow()?.version ?? 1}`);
  readonly workflowContextLabel = computed(() => {
    const workflow = this.workflow();

    if (!workflow || workflow.triggerType !== 'schedule') {
      return this.lang.editor.createdWithWorkflowEditor;
    }

    return this.nodeView.buildScheduleContextLabel(workflow.triggerConfig);
  });
  readonly paletteMode = computed(() => this.palette.paletteModeForWorkflow(this.workflow()));
  readonly paletteGroups = computed(() => this.palette.paletteGroupsForMode(this.paletteMode()));
  readonly saveStateLabel = computed(() => {
    if (this.saving()) {
      return this.lang.editor.saving;
    }

    if (this.dirty()) {
      return this.lang.editor.unsavedChanges;
    }

    return this.lastSavedAt() ? this.lang.editor.savedAt(this.lastSavedAt()!) : this.lang.editor.saved;
  });
  readonly feedbackPanel = computed<WorkflowEditorFeedbackPanel | null>(() => {
    const validationErrors = this.validationErrors();
    if (validationErrors.length) {
      return {
        messages: validationErrors,
        status: this.lang.tables.validationCount(validationErrors.length),
        title: this.lang.editor.workflowNeedsAttention,
        tone: 'warning',
      };
    }

    const runMessage = this.testRunMessage();
    if (!runMessage) {
      return null;
    }

    const failed = runMessage.toLowerCase().includes('failed');
    const completed = runMessage.toLowerCase().includes('completed');

    return {
      messages: [runMessage],
      status: this.running()
        ? this.lang.editor.testRunStarted
        : failed
          ? this.lang.editor.testRunFailed
          : completed
            ? this.lang.editor.testRunCompleted
            : this.lang.editor.ready,
      title: this.lang.editor.executionPreview,
      tone: failed ? 'danger' : completed ? 'success' : 'info',
    };
  });
  readonly filteredPaletteGroups = computed(() => this.palette.filterPaletteGroups(this.paletteGroups(), this.paletteSearch()));
  readonly paletteEmpty = computed(() => !this.filteredPaletteGroups().length);

  constructor() {
    void this.loader.loadWorkflow({
      workflowId: this.route.snapshot.paramMap.get('workflowId'),
      loading: this.loading,
      editorError: this.editorError,
      dirty: this.dirty,
      lastSavedAt: this.lastSavedAt,
      formFields: this.formFields,
      formDatasourceQueries: this.formDatasourceQueries,
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  protectBrowserUnload(event: BeforeUnloadEvent): void {
    this.navigation.protectBrowserUnload(event, this.dirty());
  }

  canLeaveEditor(): boolean | Promise<boolean> {
    return this.navigation.canLeaveEditor(this.dirty());
  }

  selectNode(nodeId: string): void {
    this.nodeCommands.selectNode(nodeId, this.nodeCommandContext());
  }

  nodeRunState(nodeId: string): PreviewNodeRunState | null {
    return this.nodeRunStates()[nodeId] ?? null;
  }

  nodeKindLabel(node: WorkflowNode): string {
    return this.nodeView.nodeKindLabel(node);
  }

  nodeCategoryLabel(node: WorkflowNode): string {
    return this.nodeView.nodeCategoryLabel(node);
  }

  isStartNode(node: WorkflowNode): boolean {
    return this.validation.isStartNode(node);
  }

  isEndNode(node: WorkflowNode): boolean {
    return this.validation.isEndNode(node);
  }

  isInvalidNode(node: WorkflowNode): boolean {
    return this.invalidNodeIds().has(node.id);
  }

  nodeDescription(node: WorkflowNode): string {
    return this.nodeView.nodeDescription(node);
  }

  nodeAccent(node: WorkflowNode): string {
    return this.nodeView.nodeAccent(node);
  }

  nodeIcon(node: WorkflowNode): string {
    return this.nodeView.nodeIcon(node);
  }

  edgePath(edge: WorkflowEdge): string {
    return this.editorGraph.edgePath(edge, this.nodes());
  }

  connectionPreviewPath(): string {
    return this.editorGraph.connectionPreviewPath(this.connectionDraft(), this.nodes());
  }

  edgeLabel(edge: WorkflowEdge): { label: string; x: number; y: number } | null {
    return this.editorGraph.edgeLabel(edge, this.nodes(), this.edges());
  }

  async goBack(): Promise<void> {
    await this.navigation.goBack(this.paletteMode());
  }

  onPaletteDragStart(event: DragEvent, node: WorkflowPaletteNode): void {
    this.canvasInteraction.preparePaletteDrag(event, node);
  }

  onCanvasDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.dragOverCanvas.set(true);
  }

  onCanvasDragOver(event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onCanvasDragLeave(event: DragEvent): void {
    if (this.canvasInteraction.shouldClearDragOver(event)) {
      this.dragOverCanvas.set(false);
    }
  }

  onCanvasDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverCanvas.set(false);
    const paletteNodeId = this.canvasInteraction.paletteNodeIdFromDrop(event);
    const paletteNode = this.palette.findPaletteNode(this.paletteGroups(), paletteNodeId);

    if (!paletteNode) {
      return;
    }

    const position = this.canvasInteraction.pointerToCanvasPosition(
      event,
      this.zoom(),
      (nextPosition) => this.canvas.snapPosition(nextPosition)
    );
    const nodeId = `node_${paletteNode.id}_${Date.now()}`;
    this.canvas.addNode({
      id: nodeId,
      type: paletteNode.type,
      label: paletteNode.label,
      position,
      config: this.nodeFactory.configForNewNode(paletteNode, this.formDatasourceQueries()),
    });
    this.markDirty();
    this.canvas.setValidationState([]);
    this.recentlyAddedNodeId.set(nodeId);
    window.setTimeout(() => this.recentlyAddedNodeId.set(null), 240);
  }

  onNodePointerDown(event: PointerEvent, node: WorkflowNode): void {
    if ((event.target as HTMLElement).closest('.workflow-editor__handle')) {
      return;
    }

    event.preventDefault();
    this.selectNode(node.id);
    this.dragState.set({
      nodeId: node.id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startNodeX: node.position.x,
      startNodeY: node.position.y,
    });
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp, { once: true });
  }

  readonly handlePointerMove = (event: PointerEvent): void => {
    const drag = this.dragState();

    if (!drag) {
      return;
    }

    const position = this.canvasInteraction.dragDelta(event, drag, this.zoom());
    this.canvas.updateNodePosition(drag.nodeId, position.x, position.y);
    this.markDirty();
  };

  readonly handlePointerUp = (): void => {
    this.dragState.set(null);
    window.removeEventListener('pointermove', this.handlePointerMove);
  };

  startConnection(event: PointerEvent, nodeId: string): void {
    event.preventDefault();
    event.stopPropagation();
    const point = this.canvasInteraction.pointerToCanvasPoint(event, this.canvasElement()?.nativeElement, this.zoom());

    this.connection.startConnection(nodeId, point, this.connectionContext());
    window.addEventListener('pointermove', this.handleConnectionPointerMove);
    window.addEventListener('pointerup', this.handleConnectionPointerUp, { once: true });
  }

  finishConnection(event: PointerEvent, nodeId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.connection.completeConnection(nodeId, this.connectionContext());
  }

  readonly handleConnectionPointerMove = (event: PointerEvent): void => {
    const point = this.canvasInteraction.pointerToCanvasPoint(event, this.canvasElement()?.nativeElement, this.zoom());
    this.connection.updateDraft(point, this.connectionContext());
  };

  readonly handleConnectionPointerUp = (event: PointerEvent): void => {
    window.removeEventListener('pointermove', this.handleConnectionPointerMove);
    const targetNodeId = this.connection.targetNodeIdFromPointer(event);
    const sourceNodeId = this.connectingFromNodeId();

    if (!targetNodeId || targetNodeId === sourceNodeId) {
      this.cancelConnection();
      return;
    }

    this.connection.completeConnection(targetNodeId, this.connectionContext());
  };

  completeConnection(nodeId: string): void {
    this.connection.completeConnection(nodeId, this.connectionContext());
  }

  cancelConnection(): void {
    this.connection.cancelConnection(this.connectionContext());
  }

  onCanvasBackgroundClick(event: MouseEvent): void {
    this.cancelConnection();

    const target = event.target as HTMLElement | null;
    if (target?.closest('.workflow-editor__node')) {
      return;
    }

    this.nodeCommands.clearSelection(this.nodeCommandContext());
  }

  updateNodeConfig(change: WorkflowNodeConfigChange): void {
    this.nodeCommands.updateNodeConfig(change, this.nodeCommandContext());
  }

  deleteSelectedNode(): void {
    this.nodeCommands.requestDeleteSelectedNode(this.selectedNode(), this.nodeCommandContext());
  }

  confirmDeleteSelectedNode(): void {
    this.nodeCommands.confirmDeleteSelectedNode(this.selectedNode(), this.nodeCommandContext());
  }

  cancelDeleteSelectedNode(): void {
    this.nodeCommands.cancelDeleteSelectedNode(this.nodeCommandContext());
  }

  zoomIn(): void {
    this.canvas.zoomIn();
  }

  zoomOut(): void {
    this.canvas.zoomOut();
  }

  resetZoom(): void {
    this.canvas.resetZoom();
  }

  collapseConfigPanel(): void {
    this.nodeCommands.clearSelection(this.nodeCommandContext());
  }

  async testRunWorkflow(): Promise<void> {
    await this.editorRun.testRunWorkflow({
      workflow: this.workflow(),
      graph: {
        nodes: this.nodes(),
        edges: this.edges(),
      },
      running: this.running,
      nodeRunStates: this.nodeRunStates,
      testRunMessage: this.testRunMessage,
      workflowRunPreviewJson: this.workflowRunPreviewJson,
      setValidationState: (errors) => this.canvas.setValidationState(errors),
    });
  }

  closeWorkflowRunPreview(): void {
    this.workflowRunPreviewJson.set(null);
  }

  validateWorkflow(): void {
    this.persistence.validateWorkflow({
      workflow: this.workflow(),
      graph: {
        nodes: this.nodes(),
        edges: this.edges(),
      },
      setValidationState: (errors) => this.canvas.setValidationState(errors),
    });
  }

  async saveWorkflow(): Promise<void> {
    await this.persistence.saveWorkflow({
      workflow: this.workflow(),
      graph: {
        nodes: this.nodes(),
        edges: this.edges(),
      },
      saving: this.saving,
      dirty: this.dirty,
      lastSavedAt: this.lastSavedAt,
      setValidationState: (errors) => this.canvas.setValidationState(errors),
    });
  }

  private markDirty(): void {
    if (!this.loading()) {
      this.dirty.set(true);
    }
  }

  private nodeCommandContext() {
    return {
      configPanelCollapsed: this.configPanelCollapsed,
      confirmConfig: this.confirmConfig,
      markDirty: () => this.markDirty(),
    };
  }

  private connectionContext() {
    return {
      connectingFromNodeId: this.connectingFromNodeId,
      connectionDraft: this.connectionDraft,
      connectionHint: this.connectionHint,
      markDirty: () => this.markDirty(),
      removePointerMoveListener: () => window.removeEventListener('pointermove', this.handleConnectionPointerMove),
    };
  }

}
