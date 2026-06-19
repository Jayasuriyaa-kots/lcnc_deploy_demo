import { computed, inject, Injectable, signal } from '@angular/core';
import { BuilderPreviewService } from '@builder/core/services/builder-preview.service';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import {
  CanvasWidget,
  ChartWidgetConfig,
  FormWidgetConfig,
  ReportWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PageBuilderFacade } from '@builder/features/page-builder/facades/page-builder.facade';
import { QoConfirmDialogConfig, SelectOption } from '@qo/ui-components';

export type RenderedCanvasWidget = CanvasWidget & {
  renderHeight: number;
  renderScale: number;
  scaledHeight: number;
};

@Injectable()
export class PageBuilderEditPageFacade {
  private readonly canvasBaseHeight = 1180;
  private readonly canvasBottomPadding = 96;
  private readonly canvasInnerInset = 28;
  private readonly desktopCanvasWidth = 1280;
  private readonly desktopCanvasWidgetWidth = this.desktopCanvasWidth - this.canvasInnerInset * 2;
  private pendingDeleteWidgetId: string | null = null;
  private selectionBarHost: HTMLElement | null = null;
  private workspaceHost: HTMLElement | null = null;

  readonly store = inject(PageBuilderFacade);
  readonly preview = inject(BuilderPreviewService);
  private readonly formBuilderFacade = inject(FormBuilderFacadeService);
  private readonly reportBuilderFacade = inject(ReportBuilderFacade);

  readonly selectedPaletteItem = this.store.selectedPaletteItem;
  readonly canvasWidgets = this.store.canvasWidgets;
  readonly isCanvasDragActive = this.store.isCanvasDragActive;
  readonly activeWidgetId = this.store.activeWidgetId;
  readonly panelConfigLabel = this.store.panelConfigLabel;
  readonly panelConfigWidgetId = this.store.panelConfigWidgetId;
  readonly panelConfigWidgetType = this.store.panelConfigWidgetType;
  readonly panelConfigWidgetSubType = this.store.panelConfigWidgetSubType;
  readonly panelConfigBoardVariant = this.store.panelConfigBoardVariant;
  readonly panelConfigChartType = this.store.panelConfigChartType;
  readonly panelConfigTableConfig = this.store.panelConfigTableConfig;
  readonly panelConfigWidget = this.store.panelConfigWidget;
  readonly panelConfigPanelConfig = this.store.panelConfigPanelConfig;
  readonly panelConfigPanelSectionId = this.store.panelConfigPanelSectionId;
  readonly panelConfigSelectConfig = this.store.panelConfigSelectConfig;
  readonly panelConfigSnippetConfig = this.store.panelConfigSnippetConfig;
  readonly panelConfigTextBlockConfig = this.store.panelConfigTextBlockConfig;
  readonly panelConfigChartConfig = this.store.panelConfigChartConfig;
  readonly panelConfigState = this.store.panelConfigState;
  readonly chartSettingsState = this.store.chartSettingsState;
  readonly panelDisplaySettingsState = this.store.panelDisplaySettingsState;
  readonly searchResultState = this.store.searchResultState;
  readonly searchStyleState = this.store.searchStyleState;
  readonly buttonDatasourceOptions = this.store.buttonDatasourceOptions;
  readonly reportEmbedCells = this.store.reportEmbedCells;
  readonly formApplicationOptions = this.store.formApplicationOptions;
  readonly formOptions = computed<SelectOption[]>(() =>
    this.formBuilderFacade.formItems().map((form) => ({
      value: form.id,
      label: form.name,
    })),
  );
  readonly availableFormConfigs = this.store.availableFormConfigs;
  readonly selectedFormWidgetConfig = this.store.selectedFormWidgetConfig;
  readonly selectedFormApplication = this.store.selectedFormApplication;
  readonly selectedFormName = this.store.selectedFormName;
  readonly selectedFormApplicationControl = this.store.selectedFormApplicationControl;
  readonly selectedFormNameControl = this.store.selectedFormNameControl;
  readonly reportApplicationOptions = this.store.reportApplicationOptions;
  readonly reportOptions = computed<SelectOption[]>(() =>
    this.reportBuilderFacade.reportItems().map((report) => ({
      value: report.id,
      label: report.name,
    })),
  );
  readonly selectedReportWidgetConfig = this.store.selectedReportWidgetConfig;
  readonly selectedReportApplication = this.store.selectedReportApplication;
  readonly selectedReportName = this.store.selectedReportName;
  readonly selectedReportApplicationControl = this.store.selectedReportApplicationControl;
  readonly selectedReportNameControl = this.store.selectedReportNameControl;
  readonly availablePageOptions = computed<SelectOption[]>(() =>
    this.store.pages().map((page) => ({
      value: page.id,
      label: page.name,
    })),
  );
  readonly selectedCanvasWidget = this.store.selectedCanvasWidget;
  readonly panelConfigTopOffsetPx = signal(0);
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  readonly canvasContentHeight = computed(() => {
    const widgets = this.canvasWidgets();
    if (!widgets.length) {
      return this.canvasBaseHeight;
    }
    const lowestEdge = Math.max(...widgets.map((widget) => widget.y + this.getCanvasWidgetRenderHeight(widget)));
    return Math.max(this.canvasBaseHeight, lowestEdge + this.canvasBottomPadding);
  });
  readonly renderedCanvasWidgets = computed<RenderedCanvasWidget[]>(() => {
    const availableWidth = this.getViewportCanvasWidgetWidth();
    const widthScale = this.getViewportCanvasWidthScale();
    return this.canvasWidgets().map((widget) => {
      const renderHeight = this.getCanvasWidgetRenderHeight(widget);
      const nextWidth = Math.min(Math.max(1, Math.round(widget.width * widthScale)), availableWidth);
      const nextHeight = Math.max(1, Math.round(renderHeight * widthScale));
      const nextX = this.clamp(Math.round(widget.x * widthScale), 0, Math.max(0, availableWidth - nextWidth));
      return { ...widget, x: nextX, width: nextWidth, renderHeight, renderScale: widthScale, scaledHeight: nextHeight };
    });
  });

  setSelectionBarHost(element: HTMLElement | null): void {
    this.selectionBarHost = element;
    this.updatePanelConfigTopOffset();
  }

  setWorkspaceHost(element: HTMLElement | null): void {
    this.workspaceHost = element;
    this.updatePanelConfigTopOffset();
  }

  queuePanelOffsetRefresh(): void {
    queueMicrotask(() => this.updatePanelConfigTopOffset());
  }

  beginDeleteWidget(widgetId: string): void {
    this.pendingDeleteWidgetId = widgetId;
    this.confirmConfig.set({
      title: 'Delete Widget',
      message: 'Are you sure you want to delete this widget? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true,
    });
  }

  confirmDeleteWidget(): void {
    if (this.pendingDeleteWidgetId) {
      this.store.deleteWidget(this.pendingDeleteWidgetId);
      this.pendingDeleteWidgetId = null;
    }
    this.confirmConfig.set(null);
  }

  cancelDeleteWidget(): void {
    this.pendingDeleteWidgetId = null;
    this.confirmConfig.set(null);
  }

  updatePanelConfigTopOffset(): void {
    const workspaceTop = Math.round(this.workspaceHost?.getBoundingClientRect().top ?? 0);
    const bar = this.selectionBarHost?.querySelector('.widget-selection-bar') as HTMLElement | null;
    const bottom = bar ? Math.round(bar.getBoundingClientRect().bottom) : workspaceTop;
    const viewportHeight = window.innerHeight || 0;
    const clearance = 45;
    const minTopOffset = Math.max(0, workspaceTop);
    const maxTopOffset = Math.max(0, viewportHeight - 120);
    this.panelConfigTopOffsetPx.set(this.clamp(bottom + clearance, minTopOffset, maxTopOffset));
  }

  getCanvasWidgetRenderHeight(widget: CanvasWidget): number {
    if (widget.type === 'form-embed') {
      const fieldCount = widget.widgetProps?.formConfig?.fields.length ?? 0;
      return Math.max(widget.height, 188 + fieldCount * 78);
    }
    if (widget.type === 'report-embed') {
      const rowCount = widget.widgetProps?.reportConfig?.rows.length ?? 0;
      return Math.max(widget.height, 136 + rowCount * 38);
    }
    return widget.height;
  }

  getCanvasReportSearchKey(widgetOrKey: CanvasWidget | string): string {
    return typeof widgetOrKey === 'string' ? widgetOrKey : widgetOrKey.id;
  }

  private getViewportCanvasWidth(): number {
    const configuredWidth = this.preview.config().width;
    if (typeof configuredWidth === 'string' && configuredWidth.endsWith('px')) {
      const parsedWidth = Number.parseFloat(configuredWidth);
      if (Number.isFinite(parsedWidth)) {
        return parsedWidth;
      }
    }
    return this.desktopCanvasWidth;
  }

  private getViewportCanvasWidgetWidth(): number {
    return Math.max(0, this.getViewportCanvasWidth() - this.canvasInnerInset * 2);
  }

  private getViewportCanvasWidthScale(): number {
    const rawScale = Math.min(1, this.getViewportCanvasWidgetWidth() / this.desktopCanvasWidgetWidth);
    return this.preview.mode() === 'mobile' ? Math.max(0.68, rawScale) : rawScale;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
