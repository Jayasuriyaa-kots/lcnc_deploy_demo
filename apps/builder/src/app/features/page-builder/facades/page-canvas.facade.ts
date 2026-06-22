import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { BuilderAssetItem } from '@builder/core/models/builder-shell.model';
import { RuntimeEngineService } from '@builder/runtime/services/runtime-engine.service';
import {
  ButtonStyleConfig,
  CanvasWidget,
  CanvasWidgetType,
  ChartWidgetConfig,
  FormWidgetConfig,
  MediaWidgetConfig,
  ReportWidgetConfig,
  SelectWidgetConfig,
  SnippetWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  PageBuilderAsset,
  PageBuilderViewport,
} from '@builder/features/page-builder/models/page-builder-page.model';
import { PageBuilderStorageService } from '@builder/features/page-builder/services/page-builder-storage.service';
import { PageBuilderSchemaConfigService } from '@builder/features/page-builder/services/page-builder-schema-config.service';
import {
  CanvasBounds,
  CanvasWidgetDragState,
  CanvasWidgetResizeState,
  PageBuilderCanvasInteractionService,
} from '@builder/features/page-builder/services/page-builder-canvas-interaction.service';
import { PageBuilderDragDropService } from '@builder/features/page-builder/services/page-builder-drag-drop.service';
import { WidgetDefaultsService } from '@builder/features/page-builder/services/widget-defaults.service';
import { BuilderPreviewService } from '@builder/core/services/builder-preview.service';
import { MockSchemaService } from '@builder/core/services/mock-schema.service';
import { PageBuilderSchemaSelectionFacade } from '@builder/features/page-builder/facades/page-builder-schema-selection.facade';
import { PageBuilderPanelSessionFacade } from '@builder/features/page-builder/facades/page-builder-panel-session.facade';

import { PAGE_CANVAS_DEFAULT_WIDGETS } from '@builder/features/page-builder/data/page-canvas-default-widgets.data';
import { convertRuntimePageToCanvas } from '@builder/features/page-builder/data/runtime-page-to-canvas.util';
import { BoardShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/board/board-showcase.component';
import { TableShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/table/table-showcase.component';
import { SelectShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/select/select-showcase.component';
import { ButtonShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/button/button-showcase.component';
import { SearchShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/search/search-showcase.component';
import { SnippetShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-showcase.component';
import { TextBlockShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-showcase.component';
import { MediaShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/media/media-showcase.component';
import { PanelShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/panel/panel-showcase.component';
import { ChartPickerDragItem } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';

const DRAFT_STORAGE_KEY = 'page-builder-draft-widgets';
const PUBLISHED_STORAGE_KEY = 'page-builder-published-widgets';
const PAGE_STORAGE_KEY = 'qo.builder.page-builder.pages.v1';
const SELECTED_PAGE_STORAGE_KEY = 'qo.builder.page-builder.selected-page.v1';
const CONFIG_INSTANCE_KEY = 'qo.builder.config-instance.v1';

// All builder localStorage keys that should be cleared when the JSON config changes.
const BUILDER_STALE_KEYS = [
  'qo.builder.page-builder.pages.v1',
  'qo.builder.page-builder.selected-page.v1',
  'qo.builder.form-builder.forms.v2',
  'qo.report-builder.v1',
];

@Injectable({ providedIn: 'root' })
export class PageCanvasFacade {
  private readonly runtimeEngine = inject(RuntimeEngineService);
  private readonly pageStorage = inject(PageBuilderStorageService);
  private readonly schemaConfig = inject(PageBuilderSchemaConfigService);
  private readonly canvasInteraction = inject(PageBuilderCanvasInteractionService);
  private readonly dragDrop = inject(PageBuilderDragDropService);
  private readonly widgetDefaults = inject(WidgetDefaultsService);
  private readonly builderPreview = inject(BuilderPreviewService);
  private readonly mockSchemaService = inject(MockSchemaService);
  private readonly schemaSelection = inject(PageBuilderSchemaSelectionFacade);
  private readonly injector = inject(Injector);

  private readonly canvasVerticalRunway = 480;
  private readonly canvasAutoScrollEdgeThreshold = 56;
  private readonly canvasAutoScrollStep = 26;
  private readonly editCanvasInnerInset = 28;
  private readonly editDesktopCanvasWidth = 1280;
  private readonly editDesktopCanvasWidgetWidth = this.editDesktopCanvasWidth - this.editCanvasInnerInset * 2;

  private canvasDropzone?: HTMLElement;
  private canvasWidgetLayer?: HTMLElement;
  private suppressWidgetConfigOpen = false;
  private pointerMovedDuringInteraction = false;

  readonly pages = signal<PageBuilderAsset[]>(this.loadPagesState());
  readonly selectedPageId = signal<string | null>(this.loadSelectedPageId());
  readonly selectedPage = computed(() => {
    const id = this.selectedPageId();
    return this.pages().find((page) => page.id === id) ?? null;
  });
  readonly selectedPageViewport = computed<PageBuilderViewport>(() => this.selectedPage()?.viewport ?? 'desktop');
  readonly draftWidgets = signal<CanvasWidget[]>([]);
  readonly publishedWidgets = signal<CanvasWidget[]>([]);
  readonly selectedPaletteItem = signal<string | null>(null);
  readonly canvasWidgets = this.draftWidgets.asReadonly();

  readonly isCanvasDragActive = signal(false);

  private readonly activeDragWidgetType = signal<CanvasWidgetType | null>(null);
  private readonly activeDragWidgetMeta = signal<Partial<CanvasWidget> | null>(null);
  private readonly canvasWidgetDragState = signal<CanvasWidgetDragState | null>(null);
  private readonly canvasWidgetResizeState = signal<CanvasWidgetResizeState | null>(null);
  readonly previewScale = computed(() => this.builderPreview.config().scale || 1);

  private _panelSession?: PageBuilderPanelSessionFacade;
  private get panelSession(): PageBuilderPanelSessionFacade {
    if (!this._panelSession) {
      this._panelSession = this.injector.get(PageBuilderPanelSessionFacade);
    }
    return this._panelSession;
  }

  constructor() {
    const pages = this.pages();
    const currentId = this.selectedPageId();
    const nextId = currentId && pages.some((page) => page.id === currentId) ? currentId : pages[0]?.id ?? null;
    if (nextId !== currentId) {
      this.setSelectedPageId(nextId);
    }
    this.syncSelectedPageWidgets();
  }

  setPages(pages: BuilderAssetItem[]): void {
    const nextPages = pages.map((page) => this.normalizePageAsset(page));
    this.pages.set(nextPages);
    this.persistPages(nextPages);

    const currentId = this.selectedPageId();
    if (!currentId && nextPages.length > 0) {
      this.setSelectedPageId(nextPages[0].id);
      this.syncSelectedPageWidgets();
      return;
    }
    if (currentId && !nextPages.some((page) => page.id === currentId)) {
      this.setSelectedPageId(nextPages.length > 0 ? nextPages[0].id : null);
      this.syncSelectedPageWidgets();
      return;
    }
    if (!nextPages.length) {
      this.setSelectedPageId(null);
      this.syncSelectedPageWidgets();
    }
  }

  createPage(config: { name: string; description: string }): string {
    const nextPage: PageBuilderAsset = {
      id: `p${Date.now()}`,
      shortCode: '',
      name: config.name,
      typeLabel: 'Page',
      status: 'draft',
      description: config.description.trim(),
      datasourceLabel: '',
      viewport: 'desktop',
    };

    this.setPages([nextPage, ...this.pages()]);
    this.selectPage(nextPage.id);
    this.panelSession.activeWidgetId.set(null);
    this.panelSession.closePanelConfig();
    return nextPage.id;
  }

  updatePageDetails(pageId: string, config: { name: string; description: string }): void {
    const normalizedName = config.name.trim();
    if (!normalizedName) {
      return;
    }

    const normalizedDescription = config.description.trim();
    this.setPages(
      this.pages().map((page) =>
        page.id === pageId
          ? { ...page, name: normalizedName, description: normalizedDescription }
          : page,
      ),
    );
  }

  selectPage(pageId: string): boolean {
    if (!this.pages().some((page) => page.id === pageId)) {
      return false;
    }
    this.setSelectedPageId(pageId);
    this.syncSelectedPageWidgets();
    this.panelSession.activeWidgetId.set(null);
    this.panelSession.closePanelConfig();
    return true;
  }

  duplicatePage(pageId: string): string | null {
    const sourcePage = this.pages().find((page) => page.id === pageId);
    if (!sourcePage) {
      return null;
    }

    const duplicateId = `p${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const duplicatePage: BuilderAssetItem = {
      ...sourcePage,
      id: duplicateId,
      shortCode: '',
      name: `${sourcePage.name} Copy`,
      status: 'draft',
    };
    const nextPages = [duplicatePage, ...this.pages()];
    const draftWidgets = this.schemaConfig.cloneWidgets(this.readWidgetsForPage(DRAFT_STORAGE_KEY, pageId));
    const publishedWidgets = this.schemaConfig.cloneWidgets(this.readWidgetsForPage(PUBLISHED_STORAGE_KEY, pageId));

    this.setPages(nextPages);
    this.pageStorage.persist(this.getPageStorageKey(DRAFT_STORAGE_KEY, duplicateId), draftWidgets);
    this.pageStorage.persist(this.getPageStorageKey(PUBLISHED_STORAGE_KEY, duplicateId), publishedWidgets);
    this.selectPage(duplicateId);
    this.panelSession.activeWidgetId.set(null);
    this.panelSession.closePanelConfig();
    return duplicateId;
  }

  deletePage(pageId: string): void {
    const nextPages = this.pages().filter((page) => page.id !== pageId);
    this.pageStorage.remove(this.getPageStorageKey(DRAFT_STORAGE_KEY, pageId));
    this.pageStorage.remove(this.getPageStorageKey(PUBLISHED_STORAGE_KEY, pageId));
    this.setPages(nextPages);
  }

  setPageStatus(pageId: string, status: BuilderAssetItem['status']): void {
    const targetPage = this.pages().find((page) => page.id === pageId);
    if (!targetPage) {
      return;
    }

    if (status === 'live') {
      const nextPublishedWidgets = this.schemaConfig.cloneWidgets(this.readWidgetsForPage(DRAFT_STORAGE_KEY, pageId));
      this.pageStorage.persist(this.getPageStorageKey(PUBLISHED_STORAGE_KEY, pageId), nextPublishedWidgets);
      if (this.selectedPageId() === pageId) {
        this.publishedWidgets.set(nextPublishedWidgets);
      }
    }

    const nextPages = this.pages().map((page) => (page.id === pageId ? { ...page, status } : page));
    this.pages.set(nextPages);
    this.persistPages(nextPages);
  }

  setSelectedPageViewport(viewport: PageBuilderViewport): void {
    const selectedPageId = this.selectedPageId();
    if (!selectedPageId) {
      return;
    }

    const nextPages = this.pages().map((page) => (page.id === selectedPageId ? { ...page, viewport } : page));
    this.pages.set(nextPages);
    this.persistPages(nextPages);
  }

  selectPaletteItem(itemId: string): void {
    this.selectedPaletteItem.set(itemId);
  }

  clearPaletteItem(): void {
    this.selectedPaletteItem.set(null);
  }

  startEditingSession(): void {
    const pageId = this.selectedPageId();
    if (!pageId) {
      this.draftWidgets.set([]);
      return;
    }

    const draftStorageKey = this.getPageStorageKey(DRAFT_STORAGE_KEY, pageId);
    if (this.pageStorage.hasStoredValue(draftStorageKey)) {
      this.draftWidgets.set(this.schemaConfig.cloneWidgets(this.readWidgetsForPage(DRAFT_STORAGE_KEY, pageId)));
      return;
    }

    let nextWidgets = this.schemaConfig.cloneWidgets(this.publishedWidgets());
    if (!nextWidgets.length) {
      let seeds = PAGE_CANVAS_DEFAULT_WIDGETS[pageId] ?? [];
      if (!seeds.length) {
        const runtimePage = this.runtimeEngine.pages().find((p) => p.id === pageId);
        seeds = convertRuntimePageToCanvas(runtimePage, this.runtimeEngine.dataframes());
      }
      nextWidgets = this.schemaConfig.cloneWidgets(seeds);
    }
    this.draftWidgets.set(nextWidgets);
    this.pageStorage.persist(draftStorageKey, nextWidgets);
  }

  setDraftWidgets(widgets: CanvasWidget[]): void {
    const nextWidgets = this.schemaConfig.cloneWidgets(widgets);
    this.draftWidgets.set(nextWidgets);
    this.persistForSelectedPage(DRAFT_STORAGE_KEY, nextWidgets);
  }

  saveDraft(): void {
    const nextWidgets = this.schemaConfig.cloneWidgets(this.draftWidgets());
    this.draftWidgets.set(nextWidgets);
    this.persistForSelectedPage(DRAFT_STORAGE_KEY, nextWidgets);
    this.updateSelectedPageStatus('draft');
    this.resetInteractionState();
  }

  publishDraft(): void {
    const nextWidgets = this.schemaConfig.cloneWidgets(this.draftWidgets());
    this.publishedWidgets.set(nextWidgets);
    this.persistForSelectedPage(PUBLISHED_STORAGE_KEY, nextWidgets);
    this.updateSelectedPageStatus('live');
    this.resetInteractionState();
  }

  persistForSelectedPage(storageKey: string, widgets: CanvasWidget[]): void {
    const pageId = this.selectedPageId();
    if (!pageId) {
      return;
    }
    this.pageStorage.persist(this.getPageStorageKey(storageKey, pageId), widgets);
  }

  readWidgetsForPage(storageKey: string, pageId: string): CanvasWidget[] {
    return this.pageStorage.readWidgetsForPage(
      storageKey,
      pageId,
      this.pages().map((page) => page.id),
    );
  }

  getPageStorageKey(storageKey: string, pageId: string): string {
    return this.pageStorage.getPageStorageKey(storageKey, pageId);
  }

  syncSelectedPageWidgets(): void {
    const pageId = this.selectedPageId();
    if (!pageId) {
      this.draftWidgets.set([]);
      this.publishedWidgets.set([]);
      return;
    }

    let draftWidgets = this.schemaConfig.cloneWidgets(this.readWidgetsForPage(DRAFT_STORAGE_KEY, pageId));
    if (!draftWidgets.length) {
      // First the built-in demo layouts (p1..p8); then fall back to converting
      // the widgets defined on the loaded JSON config's matching page so a
      // Load Config dashboard paints onto the canvas.
      let seeds = PAGE_CANVAS_DEFAULT_WIDGETS[pageId] ?? [];
      if (!seeds.length) {
        const runtimePage = this.runtimeEngine.pages().find((p) => p.id === pageId);
        seeds = convertRuntimePageToCanvas(runtimePage, this.runtimeEngine.dataframes());
      }
      if (seeds.length) {
        draftWidgets = this.schemaConfig.cloneWidgets(seeds);
        this.pageStorage.persist(this.getPageStorageKey(DRAFT_STORAGE_KEY, pageId), draftWidgets);
      }
    }
    this.draftWidgets.set(draftWidgets);

    let publishedWidgets = this.schemaConfig.cloneWidgets(this.readWidgetsForPage(PUBLISHED_STORAGE_KEY, pageId));
    if (!publishedWidgets.length && draftWidgets.length) {
      publishedWidgets = this.schemaConfig.cloneWidgets(draftWidgets);
      this.pageStorage.persist(this.getPageStorageKey(PUBLISHED_STORAGE_KEY, pageId), publishedWidgets);
    }
    this.publishedWidgets.set(publishedWidgets);
  }

  setCanvasDropzone(element: HTMLElement | undefined): void {
    this.canvasDropzone = element;
  }

  setCanvasWidgetLayer(element: HTMLElement | undefined): void {
    this.canvasWidgetLayer = element;
  }

  onPreviewDragStart(event: DragEvent, type: CanvasWidgetType): void {
    this.activeDragWidgetType.set(type);
    this.activeDragWidgetMeta.set(null);
    this.dragDrop.configureNativeDrag(event, type);
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onFormPreviewDragStart(
    event: DragEvent,
    type: 'form-embed' | 'form-button' | 'form-action-card',
  ): void {
    this.activeDragWidgetType.set(type);
    this.activeDragWidgetMeta.set(
      this.dragDrop.createFormPreviewMeta(this.schemaSelection.selectedFormWidgetConfig(), this.schemaSelection.selectedFormAsset()?.name ?? null),
    );
    this.dragDrop.configureNativeDrag(event, type);
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onReportPreviewDragStart(
    event: DragEvent,
    type: 'report-embed' | 'report-button' | 'report-action-card',
  ): void {
    this.activeDragWidgetType.set(type);
    this.activeDragWidgetMeta.set(
      this.dragDrop.createReportPreviewMeta(this.schemaSelection.selectedReportWidgetConfig(), this.schemaSelection.selectedReportName()),
    );
    this.dragDrop.configureNativeDrag(event, type);
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onButtonShowcaseDragStart(item: ButtonShowcaseDragItem): void {
    this.activeDragWidgetType.set('button-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createButtonShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onSearchShowcaseDragStart(item: SearchShowcaseDragItem): void {
    this.activeDragWidgetType.set('search-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createSearchShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onBoardShowcaseDragStart(item: BoardShowcaseDragItem): void {
    this.activeDragWidgetType.set('board-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createBoardShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onTableShowcaseDragStart(item: TableShowcaseDragItem): void {
    this.activeDragWidgetType.set('table-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createTableShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onSelectShowcaseDragStart(item: SelectShowcaseDragItem): void {
    this.activeDragWidgetType.set('select-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createSelectShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onSnippetShowcaseDragStart(item: SnippetShowcaseDragItem): void {
    this.activeDragWidgetType.set('snippet-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createSnippetShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onTextBlockShowcaseDragStart(item: TextBlockShowcaseDragItem): void {
    this.activeDragWidgetType.set('text-block-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createTextBlockShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onMediaShowcaseDragStart(item: MediaShowcaseDragItem): void {
    this.activeDragWidgetType.set('media-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createMediaShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onPanelShowcaseDragStart(item: PanelShowcaseDragItem): void {
    this.activeDragWidgetType.set('panel-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createPanelShowcaseMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onChartPickerDragStart(item: ChartPickerDragItem): void {
    this.activeDragWidgetType.set('chart-showcase');
    this.activeDragWidgetMeta.set(this.dragDrop.createChartPickerMeta(item));
    requestAnimationFrame(() => this.clearPaletteItem());
  }

  onPreviewDragEnd(): void {
    this.resetInteractionState();
  }

  onCanvasDragOver(event: DragEvent): void {
    if (!this.activeDragWidgetType()) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isCanvasDragActive.set(true);
  }

  onCanvasDragLeave(event: DragEvent): void {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = event.relatedTarget as Node | null;

    if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }

    this.isCanvasDragActive.set(false);
  }

  onCanvasDrop(event: DragEvent, dropzone: HTMLElement): void {
    const widgetType = this.activeDragWidgetType() ??
      (event.dataTransfer?.getData('text/plain') as CanvasWidgetType | '');

    if (!this.dragDrop.isDroppableWidgetType(widgetType)) {
      this.isCanvasDragActive.set(false);
      return;
    }

    event.preventDefault();

    const canvasLayer = this.canvasWidgetLayer ?? dropzone;
    const rect = canvasLayer.getBoundingClientRect();
    const bounds = this.getCanvasBounds(canvasLayer);
    const scale = this.previewScale();
    const widthScale = this.getEditCanvasViewportWidthScale();
    const droppedWidget = this.dragDrop.buildDroppedWidget({
      bounds,
      desktopCanvasWidgetWidth: this.editDesktopCanvasWidgetWidth,
      meta: this.activeDragWidgetMeta(),
      pointerX: (event.clientX - rect.left) / scale / widthScale,
      pointerY: (event.clientY - rect.top) / scale,
      viewport: this.selectedPageViewport(),
      widgetId: this.createWidgetId(),
      widgetType,
      widthScale,
    });

    this.updateCanvasWidgets((widgets) => [
      ...widgets,
      droppedWidget,
    ]);

    this.isCanvasDragActive.set(false);
    this.activeDragWidgetType.set(null);
    this.activeDragWidgetMeta.set(null);
  }

  onCanvasWidgetPointerDown(event: MouseEvent, widget: CanvasWidget): void {
    if (event.button !== 0) {
      return;
    }

    if (this.canvasInteraction.isInteractiveTarget(event.target)) {
      return;
    }

    const dropzone = this.canvasDropzone;

    if (!dropzone) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const canvasLayer = this.canvasWidgetLayer ?? dropzone;
    this.panelSession.activeWidgetId.set(widget.id);
    this.pointerMovedDuringInteraction = false;
    this.canvasWidgetDragState.set(
      this.canvasInteraction.createDragState({
        event,
        widget,
        canvasLayer,
        scale: this.previewScale(),
        widthScale: this.getEditCanvasViewportWidthScale(),
      }),
    );
  }

  onCanvasWidgetClick(event: MouseEvent, widget: CanvasWidget): void {
    if (this.canvasInteraction.isInteractiveTarget(event.target)) {
      return;
    }

    this.panelSession.activeWidgetId.set(widget.id);
    this.panelSession.openPanelConfigForWidget(widget);
  }

  onCanvasPanelSectionSelected(widget: CanvasWidget, sectionId: 'card' | 'value' | 'icon' | 'caption'): void {
    this.panelSession.activeWidgetId.set(widget.id);

    if (this.panelSession.panelConfigWidgetId() !== widget.id || this.panelSession.panelConfigWidgetType() !== 'panel') {
      this.panelSession.openPanelConfigForWidget(widget);
    }

    this.panelSession.panelConfigPanelSectionId.set(sectionId);
  }

  onCanvasWidgetDoubleClick(event: MouseEvent, widget: CanvasWidget): void {
    if (this.canvasInteraction.isInteractiveTarget(event.target)) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    this.panelSession.activeWidgetId.set(widget.id);
    this.panelSession.openPanelConfigForWidget(widget);
  }

  clearCanvasSelection(): void {
    if (!this.canvasWidgetDragState() && !this.canvasWidgetResizeState()) {
      this.panelSession.activeWidgetId.set(null);
      this.panelSession.closePanelConfig();
    }
  }

  onCanvasWidgetResizeStart(
    event: MouseEvent,
    widget: CanvasWidget,
    handle: 'top-left' | 'bottom-right' = 'bottom-right',
  ): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.panelSession.activeWidgetId.set(widget.id);
    this.pointerMovedDuringInteraction = false;
    this.canvasWidgetResizeState.set(this.canvasInteraction.createResizeState(event, widget, handle));
  }

  onWindowMouseMove(event: MouseEvent): void {
    const resizeState = this.canvasWidgetResizeState();
    const dropzone = this.canvasDropzone;
    const canvasLayer = this.canvasWidgetLayer ?? dropzone ?? null;

    if (resizeState && canvasLayer) {
      const widget = this.canvasWidgets().find(({ id }) => id === resizeState.widgetId);

      if (!widget) {
        return;
      }

      const bounds = this.getCanvasBounds(canvasLayer);
      const sizeLimits = this.getWidgetSizeLimits(widget.type, widget);
      const nextFrame = this.canvasInteraction.buildResizeFrame({
        bounds,
        event,
        resizeState,
        scale: this.previewScale(),
        sizeLimits,
        widthScale: this.getEditCanvasViewportWidthScale(),
      });
      this.pointerMovedDuringInteraction = true;

      this.updateCanvasWidgets((widgets) =>
        widgets.map((item) =>
          item.id === resizeState.widgetId
            ? {
                ...item,
                x: nextFrame.x,
                y: nextFrame.y,
                width: nextFrame.width,
                height: nextFrame.height,
              }
            : item,
        ),
      );

      return;
    }

    const dragState = this.canvasWidgetDragState();

    if (!dragState || !canvasLayer) {
      return;
    }

    this.canvasInteraction.autoScrollCanvasWhileDragging(event, canvasLayer, {
      edgeThreshold: this.canvasAutoScrollEdgeThreshold,
      step: this.canvasAutoScrollStep,
    });

    const widget = this.canvasWidgets().find(({ id }) => id === dragState.widgetId);

    if (!widget) {
      return;
    }

    const bounds = this.getCanvasBounds(canvasLayer);
    const nextPosition = this.canvasInteraction.buildDragFrame({
      bounds,
      canvasLayer,
      dragState,
      event,
      scale: this.previewScale(),
      widget,
      widthScale: this.getEditCanvasViewportWidthScale(),
    });
    this.pointerMovedDuringInteraction = true;

    this.updateCanvasWidgets((widgets) =>
      widgets.map((item) =>
        item.id === dragState.widgetId
          ? {
              ...item,
              x: nextPosition.x,
              y: nextPosition.y,
            }
          : item,
      ),
    );
  }

  onWindowMouseUp(): void {
    if (this.pointerMovedDuringInteraction) {
      this.suppressWidgetConfigOpen = true;
      setTimeout(() => {
        this.suppressWidgetConfigOpen = false;
      }, 0);
    }

    this.canvasWidgetDragState.set(null);
    this.canvasWidgetResizeState.set(null);
    this.pointerMovedDuringInteraction = false;
  }

  duplicateWidget(widgetId: string): void {
    const widget = this.canvasWidgets().find(({ id }) => id === widgetId);

    if (!widget) {
      return;
    }

    const canvasLayer = this.canvasWidgetLayer ?? this.canvasDropzone ?? null;
    const bounds = canvasLayer ? this.getCanvasBounds(canvasLayer) : { width: 1600, height: 1200 };
    const position = this.canvasInteraction.getDuplicatePlacement(widget, bounds);
    const duplicate: CanvasWidget = {
      ...widget,
      id: this.createWidgetId(),
      x: position.x,
      y: position.y,
    };

    this.updateCanvasWidgets((widgets) => [...widgets, duplicate]);
    this.panelSession.activeWidgetId.set(duplicate.id);
    this.panelSession.openPanelConfigForWidget(duplicate);
  }

  deleteWidget(widgetId: string): void {
    this.updateCanvasWidgets((widgets) => widgets.filter(({ id }) => id !== widgetId));

    if (this.panelSession.activeWidgetId() === widgetId) {
      this.panelSession.activeWidgetId.set(null);
    }

    if (this.panelSession.panelConfigWidgetId() === widgetId) {
      this.panelSession.closePanelConfig();
    }
  }

  onSelectionBarText(widget: CanvasWidget): void {
    this.panelSession.openPanelConfigForWidget(widget);
  }

  getWidgetDisplayName(widget: CanvasWidget): string {
    switch (widget.type) {
      case 'form-embed':
      case 'report-embed':
        return 'Panel';
      case 'form-button':
      case 'report-button':
      case 'button-showcase':
        return 'Button';
      case 'panel-showcase':
        return 'Panel';
      case 'search-showcase':
        return 'Search';
      case 'chart-showcase':
        return 'Chart';
      case 'table-showcase':
        return 'Table';
      case 'select-showcase':
        return 'Select';
      case 'media-showcase':
        return 'Media';
      case 'board-showcase':
        return 'Board';
      case 'snippet-showcase':
        return 'Snippet';
      case 'text-block-showcase':
        return this.widgetDefaults.getWidgetTextBlockConfig(widget).inputType === 'labeltext' ? 'Label' : 'Text Block';
      case 'form-action-card':
      case 'report-action-card':
        return 'Card';
      default:
        return 'Widget';
    }
  }

  hasSecondarySidebar(): boolean {
    const item = this.selectedPaletteItem();
    return (
      item === 'snippets' ||
      item === 'board' ||
      item === 'text-block' ||
      item === 'search' ||
      item === 'table' ||
      item === 'select' ||
      item === 'media' ||
      item === 'panel' ||
      item === 'button' ||
      item === 'chart' ||
      item === 'form' ||
      item === 'report'
    );
  }

  closeSecondarySidebar(): void {
    this.clearPaletteItem();
  }

  private persistPages(pages: PageBuilderAsset[]): void {
    this.pageStorage.persistPages(PAGE_STORAGE_KEY, pages);
  }

  private updateSelectedPageStatus(status: BuilderAssetItem['status']): void {
    const selectedPageId = this.selectedPageId();
    if (!selectedPageId) {
      return;
    }

    const nextPages = this.pages().map((page) => (page.id === selectedPageId ? { ...page, status } : page));
    this.pages.set(nextPages);
    this.persistPages(nextPages);
  }

  private setSelectedPageId(pageId: string | null): void {
    this.selectedPageId.set(pageId);
    this.pageStorage.persistSelectedPageId(SELECTED_PAGE_STORAGE_KEY, pageId);
  }

  private loadPagesState(): PageBuilderAsset[] {
    this.invalidateIfConfigChanged();
    return this.pageStorage.loadPagesState(
      PAGE_STORAGE_KEY,
      this.runtimePagesToAssets(),
      (page) => this.normalizePageAsset(page),
    );
  }

  // Clears all builder localStorage keys when hexaware.config.json (appId + version) changes.
  private invalidateIfConfigChanged(): void {
    const currentId = `${this.runtimeEngine.appId()}@${this.runtimeEngine.version()}`;
    const storedId = localStorage.getItem(CONFIG_INSTANCE_KEY);
    if (storedId !== currentId) {
      for (const key of BUILDER_STALE_KEYS) {
        localStorage.removeItem(key);
      }
      localStorage.setItem(CONFIG_INSTANCE_KEY, currentId);
    }
  }

  private runtimePagesToAssets(): PageBuilderAsset[] {
    return this.runtimeEngine.pages().map((p) => ({
      id: p.id,
      shortCode: '',
      name: p.name,
      typeLabel: 'Page',
      status: 'live' as const,
      description: '',
      datasourceLabel: '',
      viewport: 'desktop' as const,
    }));
  }

  private loadSelectedPageId(): string | null {
    return this.pageStorage.loadSelectedPageId(SELECTED_PAGE_STORAGE_KEY);
  }

  private normalizePageAsset(page: BuilderAssetItem): PageBuilderAsset {
    const datasourceLabel =
      'datasourceLabel' in page && typeof page.datasourceLabel === 'string' && page.datasourceLabel.trim()
        ? page.datasourceLabel
        : '';
    const description = 'description' in page && typeof page.description === 'string' ? page.description : '';
    const viewport =
      'viewport' in page && (page.viewport === 'desktop' || page.viewport === 'tablet' || page.viewport === 'mobile')
        ? page.viewport
        : 'desktop';

    return {
      ...page,
      shortCode: '',
      description,
      datasourceLabel,
      viewport,
    };
  }

  private resetInteractionState(): void {
    this.activeDragWidgetType.set(null);
    this.activeDragWidgetMeta.set(null);
    this.isCanvasDragActive.set(false);
    this.canvasWidgetDragState.set(null);
    this.canvasWidgetResizeState.set(null);
    this.pointerMovedDuringInteraction = false;
    this.suppressWidgetConfigOpen = false;
  }

  private createWidgetId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private getCanvasBounds(dropzone: HTMLElement): CanvasBounds {
    return this.canvasInteraction.getCanvasBounds(dropzone, {
      scale: this.previewScale(),
      verticalRunway: this.canvasVerticalRunway,
      widthScale: this.getEditCanvasViewportWidthScale(),
    });
  }

  private getEditCanvasViewportWidthScale(): number {
    return this.canvasInteraction.getViewportWidthScale({
      configuredWidth: this.builderPreview.config().width,
      editCanvasInnerInset: this.editCanvasInnerInset,
      editDesktopCanvasWidgetWidth: this.editDesktopCanvasWidgetWidth,
      viewport: this.selectedPageViewport(),
    });
  }

  private updateCanvasWidgets(updater: (widgets: CanvasWidget[]) => CanvasWidget[]): void {
    this.setDraftWidgets(updater(this.canvasWidgets()));
  }

  private getWidgetSizeLimits(type: CanvasWidgetType, widget?: CanvasWidget): { minWidth: number; minHeight: number } {
    return this.widgetDefaults.getWidgetSizeLimits(type, widget);
  }
}
