import { effect, Injectable, inject, computed } from '@angular/core';
import { BuilderAssetItem } from '@builder/core/models/builder-shell.model';
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
import {
  ButtonStyleConfig,
  CanvasWidget,
  CanvasWidgetType,
  ChartWidgetConfig,
  FormWidgetConfig,
  MediaWidgetConfig,
  PanelWidgetConfig,
  ReportWidgetConfig,
  SnippetWidgetConfig,
  SelectWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
  createDefaultPanelWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PageBuilderViewport } from '@builder/features/page-builder/models/page-builder-page.model';
import { PanelConfigState, ChartSettingsState, PanelDisplaySettingsState, SearchResultState, SearchStyleState } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { PageCanvasFacade } from '@builder/features/page-builder/facades/page-canvas.facade';
import { PageBuilderPanelSessionFacade, PanelWidgetType, PanelWidgetSubType } from '@builder/features/page-builder/facades/page-builder-panel-session.facade';
import { PageBuilderSchemaSelectionFacade } from '@builder/features/page-builder/facades/page-builder-schema-selection.facade';
import { WidgetDefaultsService } from '@builder/features/page-builder/services/widget-defaults.service';
import { BuilderPreviewService } from '@builder/core/services/builder-preview.service';
import { MockSchemaService } from '@builder/core/services/mock-schema.service';
import { PageBuilderSchemaConfigService } from '@builder/features/page-builder/services/page-builder-schema-config.service';
import { PageBuilderDataBindingService } from '@builder/features/page-builder/services/page-builder-data-binding.service';
import {
  PanelWidgetResolution,
  resolvePanelWidget,
} from '@builder/features/page-builder/components/widget-showcase/panel/panel-widget-resolution.util';
import {
  pageBuilderRuntimeDatasources,
  setPageBuilderRuntimeWidgetState,
} from '@builder/features/page-builder/services/page-builder-runtime-state.service';
import { getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import { resolvePageBuilderExpression } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';

const DRAFT_STORAGE_KEY = 'page-builder-draft-widgets';
const PUBLISHED_STORAGE_KEY = 'page-builder-published-widgets';

@Injectable({ providedIn: 'root' })
export class PageBuilderFacade {
  private readonly pageCanvas = inject(PageCanvasFacade);
  private readonly panelSession = inject(PageBuilderPanelSessionFacade);
  private readonly schemaSelection = inject(PageBuilderSchemaSelectionFacade);
  private readonly widgetDefaults = inject(WidgetDefaultsService);
  private readonly builderPreview = inject(BuilderPreviewService);
  private readonly mockSchemaService = inject(MockSchemaService);
  private readonly schemaConfig = inject(PageBuilderSchemaConfigService);
  private readonly dataBindingService = inject(PageBuilderDataBindingService);

  readonly formApplicationOptions = this.schemaSelection.formApplicationOptions;
  readonly formApplicationValues = this.schemaSelection.formApplicationValues;
  readonly formOptions = this.schemaSelection.formOptions;
  readonly formOptionValues = this.schemaSelection.formOptionValues;
  readonly selectedFormApplicationControl = this.schemaSelection.selectedFormApplicationControl;
  readonly selectedFormNameControl = this.schemaSelection.selectedFormNameControl;
  readonly selectedFormApplication = this.schemaSelection.selectedFormApplication;
  readonly selectedFormName = this.schemaSelection.selectedFormName;
  readonly selectedFormAsset = this.schemaSelection.selectedFormAsset;
  readonly selectedFormWidgetConfig = this.schemaSelection.selectedFormWidgetConfig;
  readonly availableFormConfigs = this.schemaSelection.availableFormConfigs;

  readonly reportApplicationOptions = this.schemaSelection.reportApplicationOptions;
  readonly reportApplicationValues = this.schemaSelection.reportApplicationValues;
  readonly reportOptions = this.schemaSelection.reportOptions;
  readonly buttonDatasourceOptions = this.schemaSelection.buttonDatasourceOptions;
  readonly reportOptionValues = this.schemaSelection.reportOptionValues;
  readonly selectedReportApplicationControl = this.schemaSelection.selectedReportApplicationControl;
  readonly selectedReportNameControl = this.schemaSelection.selectedReportNameControl;
  readonly selectedReportApplication = this.schemaSelection.selectedReportApplication;
  readonly selectedReportName = this.schemaSelection.selectedReportName;
  readonly selectedReportAsset = this.schemaSelection.selectedReportAsset;
  readonly selectedReportWidgetConfig = this.schemaSelection.selectedReportWidgetConfig;

  readonly pages = this.pageCanvas.pages;
  readonly selectedPageId = this.pageCanvas.selectedPageId;
  readonly selectedPage = this.pageCanvas.selectedPage;
  readonly selectedPageViewport = this.pageCanvas.selectedPageViewport;

  readonly draftWidgets = this.pageCanvas.draftWidgets;
  readonly publishedWidgets = this.pageCanvas.publishedWidgets;
  readonly selectedPaletteItem = this.pageCanvas.selectedPaletteItem;
  readonly canvasWidgets = this.pageCanvas.canvasWidgets;
  readonly previewScale = this.pageCanvas.previewScale;
  readonly isCanvasDragActive = this.pageCanvas.isCanvasDragActive;

  readonly activeWidgetId = this.panelSession.activeWidgetId;
  readonly panelConfigLabel = this.panelSession.panelConfigLabel;
  readonly panelConfigWidgetId = this.panelSession.panelConfigWidgetId;
  readonly panelConfigWidgetType = this.panelSession.panelConfigWidgetType;
  readonly panelConfigWidgetSubType = this.panelSession.panelConfigWidgetSubType;
  readonly panelConfigPanelSectionId = this.panelSession.panelConfigPanelSectionId;
  readonly panelConfigBoardVariant = this.panelSession.panelConfigBoardVariant;
  readonly panelConfigChartType = this.panelSession.panelConfigChartType;
  readonly panelConfigState = this.panelSession.panelConfigState;
  readonly chartSettingsState = this.panelSession.chartSettingsState;
  readonly panelDisplaySettingsState = this.panelSession.panelDisplaySettingsState;
  readonly searchResultState = this.panelSession.searchResultState;
  readonly searchStyleState = this.panelSession.searchStyleState;
  readonly panelConfigTableConfig = this.panelSession.panelConfigTableConfig;
  readonly panelConfigWidget = this.panelSession.panelConfigWidget;
  readonly panelConfigPanelConfig = this.panelSession.panelConfigPanelConfig;
  readonly panelConfigSelectConfig = this.panelSession.panelConfigSelectConfig;
  readonly panelConfigTextBlockConfig = this.panelSession.panelConfigTextBlockConfig;
  readonly panelConfigSnippetConfig = this.panelSession.panelConfigSnippetConfig;
  readonly panelConfigChartConfig = this.panelSession.panelConfigChartConfig;
  readonly reportEmbedCells = this.panelSession.reportEmbedCells;
  readonly selectedCanvasWidget = this.panelSession.selectedCanvasWidget;

  readonly panelResolutions = computed<Record<string, PanelWidgetResolution>>(() => {
    const widgets = this.pageCanvas.canvasWidgets();
    const datasources = pageBuilderRuntimeDatasources();
    const resolutions: Record<string, PanelWidgetResolution> = {};

    for (const widget of widgets) {
      if (widget.type === 'panel-showcase' && widget.widgetProps?.panelConfig) {
        resolutions[widget.id] = resolvePanelWidget(
          {
            ...createDefaultPanelWidgetConfig(),
            ...widget.widgetProps.panelConfig,
          },
          {
            runtimeDatasources: datasources,
            getRows: (datasourceId, queryId) => getPageBuilderRuntimeRows(datasourceId, queryId),
            resolveBinding: (expression) => resolvePageBuilderExpression(expression),
          },
          this.dataBindingService,
        );
      }
    }
    return resolutions;
  });

  readonly editingPanelResolution = computed<PanelWidgetResolution>(() => {
    const config = this.panelConfigPanelConfig() || createDefaultPanelWidgetConfig();
    return resolvePanelWidget(
      {
        ...createDefaultPanelWidgetConfig(),
        ...config,
      },
      {
        runtimeDatasources: pageBuilderRuntimeDatasources(),
        getRows: (datasourceId, queryId) => getPageBuilderRuntimeRows(datasourceId, queryId),
        resolveBinding: (expression) => resolvePageBuilderExpression(expression),
      },
      this.dataBindingService,
    );
  });

  private readonly syncPanelWidgetStateEffect = effect(() => {
    const resolutions = this.panelResolutions();
    const widgets = this.pageCanvas.canvasWidgets();

    for (const widget of widgets) {
      if (widget.type === 'panel-showcase') {
        const res = resolutions[widget.id];
        if (!res) continue;

        const config = {
          ...createDefaultPanelWidgetConfig(),
          ...widget.widgetProps?.panelConfig,
        };
        const widgetId = widget.id.trim();
        const widgetLabel = widget.label.trim();
        const keys = [widgetLabel, widgetId].filter(Boolean).filter((value, index, list) => list.indexOf(value) === index);

        const payload = {
          value: res.displayValue || (res.state === 'unconfigured' ? 'Configure panel' : res.state === 'invalid' ? 'Invalid field' : res.state === 'no_data' ? 'No data' : res.state === 'empty' ? 'Empty value' : config.value || 'Preview'),
          rawValue: res.rawValue,
          title: config.title,
          subtitle: config.subtitle,
          caption: config.caption,
          trend: config.trend,
          sourceType: config.sourceType,
          state: res.state,
          message: res.message,
          totalRows: res.totalRowCount,
          filteredRows: res.filteredRowCount,
          matchedRows: res.matchedRowCount,
        };

        for (const key of keys) {
          setPageBuilderRuntimeWidgetState(key, payload);
        }
      }
    }
  }, { allowSignalWrites: true });

  private readonly syncSchemaWidgetsEffect = effect(() => {
    const formConfigs = this.mockSchemaService.formConfigs();
    const reportConfigs = this.mockSchemaService.reportConfigs();

    if (!formConfigs.length && !reportConfigs.length) {
      return;
    }

    const draftWidgets = this.draftWidgets();
    const nextDraftWidgets = this.schemaConfig.cloneWidgets(draftWidgets);
    if (JSON.stringify(draftWidgets) !== JSON.stringify(nextDraftWidgets)) {
      this.pageCanvas.setDraftWidgets(nextDraftWidgets);
    }

    const publishedWidgets = this.publishedWidgets();
    const nextPublishedWidgets = this.schemaConfig.cloneWidgets(publishedWidgets);
    if (JSON.stringify(publishedWidgets) !== JSON.stringify(nextPublishedWidgets)) {
      this.publishedWidgets.set(nextPublishedWidgets);
      this.pageCanvas.persistForSelectedPage(PUBLISHED_STORAGE_KEY, nextPublishedWidgets);
    }
  });

  private readonly syncSelectedPageViewportEffect = effect(() => {
    this.builderPreview.setMode(this.selectedPageViewport());
  });

  setPages(pages: BuilderAssetItem[]): void { this.pageCanvas.setPages(pages); }
  createPage(config: { name: string; description: string }): void {
    this.pageCanvas.createPage(config);
  }
  updatePageDetails(pageId: string, config: { name: string; description: string }): void {
    this.pageCanvas.updatePageDetails(pageId, config);
  }
  selectPage(pageId: string): void {
    this.pageCanvas.selectPage(pageId);
  }
  duplicatePage(pageId: string): void {
    this.pageCanvas.duplicatePage(pageId);
  }
  deletePage(pageId: string): void { this.pageCanvas.deletePage(pageId); }
  setPageStatus(pageId: string, status: BuilderAssetItem['status']): void {
    this.pageCanvas.setPageStatus(pageId, status);
  }
  setSelectedPageViewport(viewport: PageBuilderViewport): void {
    this.pageCanvas.setSelectedPageViewport(viewport);
  }
  selectPaletteItem(itemId: string): void { this.pageCanvas.selectPaletteItem(itemId); }
  clearPaletteItem(): void { this.pageCanvas.clearPaletteItem(); }
  startEditingSession(): void { this.pageCanvas.startEditingSession(); }
  setDraftWidgets(widgets: CanvasWidget[]): void { this.pageCanvas.setDraftWidgets(widgets); }
  saveDraft(): void { this.pageCanvas.saveDraft(); }
  publishDraft(): void { this.pageCanvas.publishDraft(); }

  updatePanelConfigState(partial: Partial<PanelConfigState>): void { this.panelSession.updatePanelConfigState(partial); }
  updateChartSettingsState(partial: Partial<ChartSettingsState>): void { this.panelSession.updateChartSettingsState(partial); }
  updatePanelDisplaySettingsState(partial: Partial<PanelDisplaySettingsState>): void { this.panelSession.updatePanelDisplaySettingsState(partial); }
  updateSearchResultState(partial: Partial<SearchResultState>): void { this.panelSession.updateSearchResultState(partial); }
  updateSearchStyleState(partial: Partial<SearchStyleState>): void { this.panelSession.updateSearchStyleState(partial); }

  setCanvasDropzone(element: HTMLElement | undefined): void { this.pageCanvas.setCanvasDropzone(element); }
  setCanvasWidgetLayer(element: HTMLElement | undefined): void { this.pageCanvas.setCanvasWidgetLayer(element); }

  onPreviewDragStart(event: DragEvent, type: CanvasWidgetType): void { this.pageCanvas.onPreviewDragStart(event, type); }
  onFormPreviewDragStart(event: DragEvent, type: 'form-embed' | 'form-button' | 'form-action-card'): void {
    this.pageCanvas.onFormPreviewDragStart(event, type);
  }
  onReportPreviewDragStart(event: DragEvent, type: 'report-embed' | 'report-button' | 'report-action-card'): void {
    this.pageCanvas.onReportPreviewDragStart(event, type);
  }
  onButtonShowcaseDragStart(item: ButtonShowcaseDragItem): void { this.pageCanvas.onButtonShowcaseDragStart(item); }
  onSearchShowcaseDragStart(item: SearchShowcaseDragItem): void { this.pageCanvas.onSearchShowcaseDragStart(item); }
  onBoardShowcaseDragStart(item: BoardShowcaseDragItem): void { this.pageCanvas.onBoardShowcaseDragStart(item); }
  onTableShowcaseDragStart(item: TableShowcaseDragItem): void { this.pageCanvas.onTableShowcaseDragStart(item); }
  onSelectShowcaseDragStart(item: SelectShowcaseDragItem): void { this.pageCanvas.onSelectShowcaseDragStart(item); }
  onSnippetShowcaseDragStart(item: SnippetShowcaseDragItem): void { this.pageCanvas.onSnippetShowcaseDragStart(item); }
  onTextBlockShowcaseDragStart(item: TextBlockShowcaseDragItem): void { this.pageCanvas.onTextBlockShowcaseDragStart(item); }
  onMediaShowcaseDragStart(item: MediaShowcaseDragItem): void { this.pageCanvas.onMediaShowcaseDragStart(item); }
  onPanelShowcaseDragStart(item: PanelShowcaseDragItem): void { this.pageCanvas.onPanelShowcaseDragStart(item); }
  onChartPickerDragStart(item: ChartPickerDragItem): void { this.pageCanvas.onChartPickerDragStart(item); }
  onPreviewDragEnd(): void { this.pageCanvas.onPreviewDragEnd(); }

  onCanvasDragOver(event: DragEvent): void { this.pageCanvas.onCanvasDragOver(event); }
  onCanvasDragLeave(event: DragEvent): void { this.pageCanvas.onCanvasDragLeave(event); }
  onCanvasDrop(event: DragEvent, dropzone: HTMLElement): void { this.pageCanvas.onCanvasDrop(event, dropzone); }
  onCanvasWidgetPointerDown(event: MouseEvent, widget: CanvasWidget): void { this.pageCanvas.onCanvasWidgetPointerDown(event, widget); }
  onCanvasWidgetClick(event: MouseEvent, widget: CanvasWidget): void { this.pageCanvas.onCanvasWidgetClick(event, widget); }
  onCanvasPanelSectionSelected(widget: CanvasWidget, sectionId: 'card' | 'value' | 'icon' | 'caption'): void {
    this.pageCanvas.onCanvasPanelSectionSelected(widget, sectionId);
  }
  onCanvasWidgetDoubleClick(event: MouseEvent, widget: CanvasWidget): void { this.pageCanvas.onCanvasWidgetDoubleClick(event, widget); }
  clearCanvasSelection(): void { this.pageCanvas.clearCanvasSelection(); }
  onCanvasWidgetResizeStart(event: MouseEvent, widget: CanvasWidget, handle?: 'top-left' | 'bottom-right'): void {
    this.pageCanvas.onCanvasWidgetResizeStart(event, widget, handle);
  }
  onWindowMouseMove(event: MouseEvent): void { this.pageCanvas.onWindowMouseMove(event); }
  onWindowMouseUp(): void { this.pageCanvas.onWindowMouseUp(); }

  duplicateWidget(widgetId: string): void { this.pageCanvas.duplicateWidget(widgetId); }
  deleteWidget(widgetId: string): void { this.pageCanvas.deleteWidget(widgetId); }
  onSelectionBarText(widget: CanvasWidget): void { this.pageCanvas.onSelectionBarText(widget); }
  openPanelConfigForWidget(widget: CanvasWidget): void { this.panelSession.openPanelConfigForWidget(widget); }

  getWidgetDisplayName(widget: CanvasWidget): string { return this.pageCanvas.getWidgetDisplayName(widget); }
  hasSecondarySidebar(): boolean { return this.pageCanvas.hasSecondarySidebar(); }
  closeSecondarySidebar(): void { this.pageCanvas.closeSecondarySidebar(); }

  openPanelConfig(label: string): void { this.panelSession.openPanelConfig(label); }
  closePanelConfig(): void { this.panelSession.closePanelConfig(); }
  getPanelConfigSelectedLabel(fallbackLabel: string): string { return this.panelSession.getPanelConfigSelectedLabel(fallbackLabel); }

  onPanelConfigLabelChanged(label: string): void { this.panelSession.onPanelConfigLabelChanged(label); }
  onPanelConfigButtonStyleConfigChanged(config: ButtonStyleConfig): void { this.panelSession.onPanelConfigButtonStyleConfigChanged(config); }
  onPanelConfigButtonWidgetChanged(change: Partial<CanvasWidget>): void { this.panelSession.onPanelConfigButtonWidgetChanged(change); }
  onPanelConfigTableConfigChanged(config: TableWidgetConfig): void { this.panelSession.onPanelConfigTableConfigChanged(config); }
  onPanelConfigSearchWidgetChanged(change: Partial<CanvasWidget>): void { this.panelSession.onPanelConfigSearchWidgetChanged(change); }
  onPanelConfigBoardWidgetChanged(change: Partial<CanvasWidget>): void { this.panelSession.onPanelConfigBoardWidgetChanged(change); }
  onPanelConfigMediaConfigChanged(config: MediaWidgetConfig): void { this.panelSession.onPanelConfigMediaConfigChanged(config); }
  onCanvasMediaConfigChanged(widgetId: string, config: MediaWidgetConfig): void { this.panelSession.onCanvasMediaConfigChanged(widgetId, config); }
  onPanelConfigSelectConfigChanged(config: SelectWidgetConfig): void { this.panelSession.onPanelConfigSelectConfigChanged(config); }
  onPanelConfigSnippetConfigChanged(config: SnippetWidgetConfig): void { this.panelSession.onPanelConfigSnippetConfigChanged(config); }
  onPanelConfigTextBlockConfigChanged(config: TextBlockWidgetConfig): void { this.panelSession.onPanelConfigTextBlockConfigChanged(config); }
  onPanelConfigPanelWidgetConfigChanged(config: PanelWidgetConfig): void { this.panelSession.onPanelConfigPanelWidgetConfigChanged(config); }
  onPanelConfigFormWidgetConfigChanged(config: FormWidgetConfig): void { this.panelSession.onPanelConfigFormWidgetConfigChanged(config); }
  onPanelConfigChartConfigChanged(config: ChartWidgetConfig): void { this.panelSession.onPanelConfigChartConfigChanged(config); }
  onPanelConfigReportWidgetConfigChanged(config: ReportWidgetConfig): void { this.panelSession.onPanelConfigReportWidgetConfigChanged(config); }

  getWidgetLabel(widget: CanvasWidget | null): string { return this.panelSession.getWidgetLabel(widget); }
  getWidgetTableConfig(widget: CanvasWidget): TableWidgetConfig { return this.widgetDefaults.getWidgetTableConfig(widget); }
  getWidgetSelectConfig(widget: CanvasWidget): SelectWidgetConfig { return this.widgetDefaults.getWidgetSelectConfig(widget); }
  getWidgetChartConfig(widget: CanvasWidget): ChartWidgetConfig { return this.widgetDefaults.getWidgetChartConfig(widget); }
  getWidgetReportConfig(widget: CanvasWidget): ReportWidgetConfig | null { return this.widgetDefaults.getWidgetReportConfig(widget); }
  getWidgetSnippetConfig(widget: CanvasWidget): SnippetWidgetConfig { return this.widgetDefaults.getWidgetSnippetConfig(widget); }
  getWidgetTextBlockConfig(widget: CanvasWidget): TextBlockWidgetConfig { return this.widgetDefaults.getWidgetTextBlockConfig(widget); }
  getWidgetMediaConfig(widget: CanvasWidget): MediaWidgetConfig { return this.widgetDefaults.getWidgetMediaConfig(widget); }

  getDefaultChartWidgetConfig(datasourceId = '', datasourceLabel = ''): ChartWidgetConfig {
    return this.widgetDefaults.getDefaultChartWidgetConfig(datasourceId, datasourceLabel);
  }

  destroyEditSession(): void {
    this.pageCanvas.onPreviewDragEnd();
    this.panelSession.destroyEditSession();
    this.pageCanvas.clearPaletteItem();
  }

  setPanelConfigPanelSection(sectionId: 'card' | 'value' | 'icon' | 'caption'): void {
    this.panelSession.setPanelConfigPanelSection(sectionId);
  }
}
