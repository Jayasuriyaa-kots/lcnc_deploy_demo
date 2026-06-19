import { computed, inject, Injectable, signal } from '@angular/core';
import { PageCanvasFacade } from '@builder/features/page-builder/facades/page-canvas.facade';
import {
  ButtonActionType,
  ButtonStyleConfig,
  CanvasWidget,
  ChartWidgetConfig,
  FormWidgetConfig,
  MediaWidgetConfig,
  PanelWidgetConfig,
  ReportWidgetConfig,
  SelectWidgetConfig,
  SnippetWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
  createDefaultButtonActionConfig,
  createDefaultButtonStyleConfig,
  createDefaultChartWidgetConfig,
  createDefaultPanelWidgetConfig,
  createDefaultSnippetWidgetConfig,
  createDefaultSelectWidgetConfig,
  createDefaultTableWidgetConfig,
  createDefaultTextBlockWidgetConfig,
  createDefaultMediaWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  ChartSettingsState,
  PanelConfigState,
  PanelDisplaySettingsState,
  SearchResultState,
  SearchStyleState,
} from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import { getSnippetWidgetPreset } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-widget.config';
import { getTextBlockWidgetPreset } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-widget.config';
import { BoardWidgetVariant } from '@builder/features/page-builder/components/widget-showcase/board/board-widget.config';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import {
  createCriteriaRow,
  createDefaultChartSettingsState,
  createDefaultPanelConfigState,
  createDefaultPanelDisplaySettingsState,
  createDefaultSearchResultState,
  createDefaultSearchStyleState,
  createSearchStyleStateFromWidget,
} from '@builder/features/page-builder/models/page-builder-panel-session-state.factory';
import { PageBuilderSchemaConfigService } from '@builder/features/page-builder/services/page-builder-schema-config.service';
import { WidgetDefaultsService } from '@builder/features/page-builder/services/widget-defaults.service';

export type PanelWidgetType =
  | 'default'
  | 'panel'
  | 'label'
  | 'button'
  | 'board'
  | 'table'
  | 'select'
  | 'chart'
  | 'search'
  | 'snippet'
  | 'media'
  | 'text-block'
  | 'form'
  | 'form-button'
  | 'form-action-card'
  | 'report';
export type PanelWidgetSubType = 'none' | 'report-embed' | 'report-button' | 'report-action-card';

@Injectable({ providedIn: 'root' })
export class PageBuilderPanelSessionFacade {
  private readonly pageCanvas = inject(PageCanvasFacade);
  private readonly schemaConfig = inject(PageBuilderSchemaConfigService);
  private readonly widgetDefaults = inject(WidgetDefaultsService);

  readonly activeWidgetId = signal<string | null>(null);
  readonly panelConfigLabel = signal<string | null>(null);
  readonly panelConfigWidgetId = signal<string | null>(null);
  readonly panelConfigWidgetType = signal<PanelWidgetType>('default');
  readonly panelConfigWidgetSubType = signal<PanelWidgetSubType>('none');
  readonly panelConfigPanelSectionId = signal<'card' | 'value' | 'icon' | 'caption'>('card');
  readonly panelConfigBoardVariant = signal<BoardWidgetVariant>('department-list');
  readonly panelConfigChartType = signal<ChartType>('line');
  readonly panelConfigState = signal<PanelConfigState>(createDefaultPanelConfigState());
  readonly chartSettingsState = signal<ChartSettingsState>(createDefaultChartSettingsState());
  readonly panelDisplaySettingsState = signal<PanelDisplaySettingsState>(createDefaultPanelDisplaySettingsState());
  readonly searchResultState = signal<SearchResultState>(createDefaultSearchResultState());
  readonly searchStyleState = signal<SearchStyleState>(createDefaultSearchStyleState());
  readonly panelConfigTableConfig = computed(() => this.panelConfigState().tableWidgetConfig);
  readonly panelConfigWidget = computed(
    () => this.pageCanvas.canvasWidgets().find(({ id }) => id === this.panelConfigWidgetId()) ?? null,
  );
  readonly panelConfigPanelConfig = computed(() => {
    const widget = this.panelConfigWidget();
    return widget ? this.schemaConfig.getWidgetPanelConfig(widget) : createDefaultPanelWidgetConfig();
  });
  readonly panelConfigSelectConfig = computed(() => this.panelConfigState().selectWidgetConfig);
  readonly panelConfigTextBlockConfig = computed(() => this.panelConfigState().textBlockWidgetConfig);
  readonly panelConfigSnippetConfig = computed(() => {
    const widget = this.panelConfigWidget();
    return widget ? this.widgetDefaults.getWidgetSnippetConfig(widget) : createDefaultSnippetWidgetConfig('html');
  });
  readonly panelConfigChartConfig = computed(() => {
    const widget = this.panelConfigWidget();
    return widget ? this.widgetDefaults.getWidgetChartConfig(widget) : createDefaultChartWidgetConfig();
  });
  readonly selectedCanvasWidget = computed(
    () => this.pageCanvas.canvasWidgets().find(({ id }) => id === this.activeWidgetId()) ?? null,
  );
  readonly reportEmbedCells = Array.from({ length: 16 });

  updatePanelConfigState(partial: Partial<PanelConfigState>): void {
    this.panelConfigState.update((state) => ({ ...state, ...partial }));
  }

  updateChartSettingsState(partial: Partial<ChartSettingsState>): void {
    this.chartSettingsState.update((state) => ({ ...state, ...partial }));
  }

  updatePanelDisplaySettingsState(partial: Partial<PanelDisplaySettingsState>): void {
    this.panelDisplaySettingsState.update((state) => ({ ...state, ...partial }));
  }

  updateSearchResultState(partial: Partial<SearchResultState>): void {
    this.searchResultState.update((state) => ({ ...state, ...partial }));
  }

  updateSearchStyleState(partial: Partial<SearchStyleState>): void {
    this.searchStyleState.update((state) => ({ ...state, ...partial }));
  }

  openPanelConfig(label: string): void {
    this.resetPanelState(label);
  }

  closePanelConfig(): void {
    this.resetPanelState(null);
  }

  destroyEditSession(): void {
    this.resetPanelState(null);
  }

  setPanelConfigPanelSection(sectionId: 'card' | 'value' | 'icon' | 'caption'): void {
    this.panelConfigPanelSectionId.set(sectionId);
  }

  getPanelConfigSelectedLabel(fallbackLabel: string): string {
    const widgetId = this.panelConfigWidgetId();

    if (!widgetId) {
      return fallbackLabel;
    }

    const widget = this.pageCanvas.canvasWidgets().find(({ id }) => id === widgetId);
    return widget ? this.getWidgetLabel(widget) : fallbackLabel;
  }

  openPanelConfigForWidget(widget: CanvasWidget): void {
    const chartConfig = this.widgetDefaults.getWidgetChartConfig(widget);
    const selectedButtonGroupButton = widget.widgetProps?.buttonGroupConfig?.buttons?.[0];
    const selectedActionType = (selectedButtonGroupButton?.selectedAction ??
      widget.widgetProps?.buttonActionConfig?.type ??
      'none') as ButtonActionType;
    const selectedButtonActionConfig =
      selectedButtonGroupButton?.buttonActionConfig ??
      widget.widgetProps?.buttonActionConfig ??
      createDefaultButtonActionConfig();

    this.panelConfigWidgetId.set(widget.id);
    this.panelConfigLabel.set(widget.chartTypeLabel ?? this.getWidgetLabel(widget));
    this.panelConfigWidgetSubType.set('none');
    this.panelConfigBoardVariant.set('department-list');
    this.panelConfigState.set({
      ...createDefaultPanelConfigState(),
      editableLabel: this.getWidgetLabel(widget),
      buttonStyleConfig: {
        ...createDefaultButtonStyleConfig(),
        ...(selectedButtonGroupButton?.buttonStyleConfig ?? widget.buttonStyleConfig ?? {}),
      },
      selectedButtonGroupButtonId: selectedButtonGroupButton?.id ?? null,
      tableWidgetConfig: this.widgetDefaults.getWidgetTableConfig(widget),
      selectWidgetConfig: this.widgetDefaults.getWidgetSelectConfig(widget),
      textBlockWidgetConfig: this.widgetDefaults.getWidgetTextBlockConfig(widget),
      chartPanelStep: chartConfig.datasourceId ? 'settings' : 'select-form',
      selectedFormId: chartConfig.datasourceId || null,
      selectedChartFormName: chartConfig.datasourceLabel,
      selectedAction: selectedActionType,
      buttonActionConfig: {
        ...createDefaultButtonActionConfig(),
        ...selectedButtonActionConfig,
        type: selectedActionType,
      },
    });
    this.chartSettingsState.set({
      valueType: chartConfig.valueType,
      recordScope: chartConfig.recordScope,
      selectedRecordCriteriaRows: chartConfig.selectedRecordCriteriaRows.map((row) => ({ ...row })),
    });
    this.panelDisplaySettingsState.set(createDefaultPanelDisplaySettingsState());
    this.searchResultState.set(createDefaultSearchResultState());
    this.searchStyleState.set(createSearchStyleStateFromWidget(widget));

    if (widget.type === 'chart-showcase') {
      this.panelConfigWidgetType.set('chart');
      this.panelConfigChartType.set(widget.chartType ?? 'line');
      return;
    }

    if (widget.type === 'search-showcase') {
      this.panelConfigWidgetType.set('search');
      return;
    }

    if (widget.type === 'button-showcase') {
      this.panelConfigWidgetType.set('button');
      return;
    }

    if (widget.type === 'board-showcase') {
      this.panelConfigWidgetType.set('board');
      this.panelConfigBoardVariant.set(widget.boardVariant ?? 'department-list');
      this.updatePanelConfigState({ selectedBoardFormName: 'Staff In' });
      return;
    }

    if (widget.type === 'panel-showcase') {
      this.panelConfigWidgetType.set('panel');
      this.panelConfigPanelSectionId.set('card');
      return;
    }

    if (widget.type === 'table-showcase') {
      this.panelConfigWidgetType.set('table');
      this.updatePanelConfigState({ tableWidgetConfig: this.widgetDefaults.getWidgetTableConfig(widget) });
      return;
    }

    if (widget.type === 'select-showcase') {
      this.panelConfigWidgetType.set('select');
      this.updatePanelConfigState({ selectWidgetConfig: this.widgetDefaults.getWidgetSelectConfig(widget) });
      return;
    }

    if (widget.type === 'media-showcase') {
      this.panelConfigWidgetType.set('media');
      return;
    }

    if (widget.type === 'snippet-showcase') {
      this.panelConfigWidgetType.set('snippet');
      return;
    }

    if (widget.type === 'text-block-showcase') {
      const textBlockConfig = this.widgetDefaults.getWidgetTextBlockConfig(widget);
      this.panelConfigWidgetType.set(textBlockConfig.inputType === 'labeltext' ? 'label' : 'text-block');
      this.updatePanelConfigState({ textBlockWidgetConfig: textBlockConfig });
      return;
    }

    if (widget.type === 'form-embed') {
      this.panelConfigWidgetType.set('form');
      return;
    }

    if (widget.type === 'form-button') {
      this.panelConfigWidgetType.set('form-button');
      return;
    }

    if (widget.type === 'form-action-card') {
      this.panelConfigWidgetType.set('form-action-card');
      return;
    }

    if (widget.type === 'report-embed' || widget.type === 'report-button' || widget.type === 'report-action-card') {
      this.panelConfigWidgetType.set('report');
      this.panelConfigWidgetSubType.set(widget.type);
      const reportConfig = this.widgetDefaults.getWidgetReportConfig(widget);
      this.updatePanelConfigState({
        reportCriteriaRows:
          reportConfig?.filterCriteriaRows?.length
            ? reportConfig.filterCriteriaRows.map((row) => ({ ...row }))
            : [createCriteriaRow('report-criteria')],
        reportFilterConfigured: reportConfig?.filterConfigured ?? false,
      });
      return;
    }

    this.panelConfigWidgetType.set('default');
    this.panelConfigChartType.set('line');
  }

  getWidgetLabel(widget: CanvasWidget | null): string {
    if (!widget) {
      return 'Button';
    }

    const explicitLabel = widget.widgetProps?.label?.trim() || widget.label?.trim();
    if (explicitLabel) {
      return explicitLabel;
    }

    switch (widget.type) {
      case 'form-embed':
      case 'report-embed':
        return 'Panel';
      case 'form-action-card':
      case 'report-action-card':
        return 'Card';
      case 'panel-showcase':
        return widget.widgetProps?.panelConfig?.title?.trim() || 'Panel';
      case 'search-showcase':
        return 'Search';
      case 'chart-showcase':
        return widget.chartTypeLabel ?? 'Chart';
      case 'table-showcase':
        return 'Table';
      case 'select-showcase':
        return widget.widgetProps?.selectConfig?.label?.trim() || 'Select';
      case 'snippet-showcase':
        return getSnippetWidgetPreset(widget.snippetVariant ?? 'html').title;
      case 'media-showcase':
        return widget.widgetProps?.mediaConfig?.title?.trim() || 'Media';
      case 'text-block-showcase': {
        const textBlockConfig = this.widgetDefaults.getWidgetTextBlockConfig(widget);
        return textBlockConfig.inputType === 'labeltext'
          ? (textBlockConfig.contentSource === 'static'
              ? (textBlockConfig.text || textBlockConfig.defaultValue).trim()
              : '') || 'Label'
          : textBlockConfig.label.trim() || 'Text Block';
      }
      default:
        return 'Button';
    }
  }

  private resetPanelState(label: string | null): void {
    this.panelConfigWidgetId.set(null);
    this.panelConfigLabel.set(label);
    this.panelConfigWidgetType.set('default');
    this.panelConfigWidgetSubType.set('none');
    this.panelConfigPanelSectionId.set('card');
    this.panelConfigBoardVariant.set('department-list');
    this.panelConfigChartType.set('line');
    this.panelConfigState.set(createDefaultPanelConfigState());
    this.chartSettingsState.set(createDefaultChartSettingsState());
    this.panelDisplaySettingsState.set(createDefaultPanelDisplaySettingsState());
    this.searchResultState.set(createDefaultSearchResultState());
    this.searchStyleState.set(createDefaultSearchStyleState());
  }

  onPanelConfigLabelChanged(label: string): void {
    const widgetId = this.panelConfigWidgetId();
    this.updatePanelConfigState({ editableLabel: label });

    if (!widgetId) {
      this.panelConfigLabel.set(label);
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              label,
              widgetProps: {
                ...widget.widgetProps,
                label,
                ...(widget.type === 'panel-showcase'
                  ? {
                      panelConfig: this.schemaConfig.clonePanelWidgetConfig({
                        ...(widget.widgetProps?.panelConfig ?? createDefaultPanelWidgetConfig()),
                        title: label,
                      }),
                    }
                  : {}),
              },
            }
          : widget,
      ),
    );

    const nextWidget = this.pageCanvas.canvasWidgets().find(({ id }) => id === widgetId);
    if (nextWidget) {
      this.panelConfigLabel.set(nextWidget.chartTypeLabel ?? this.getWidgetLabel(nextWidget));
    }
  }

  onPanelConfigButtonStyleConfigChanged(config: ButtonStyleConfig): void {
    const widgetId = this.panelConfigWidgetId();
    this.updatePanelConfigState({ buttonStyleConfig: { ...config } });

    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              buttonStyleConfig: { ...config },
            }
          : widget,
      ),
    );
  }

  onPanelConfigButtonWidgetChanged(change: Partial<CanvasWidget>): void {
    const widgetId = this.panelConfigWidgetId();
    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              ...change,
            }
          : widget,
      ),
    );
  }

  onPanelConfigTableConfigChanged(config: TableWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();
    this.updatePanelConfigState({ tableWidgetConfig: { ...config } });

    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              widgetProps: {
                ...widget.widgetProps,
                tableConfig: { ...config },
              },
            }
          : widget,
      ),
    );
  }

  onPanelConfigSearchWidgetChanged(change: Partial<CanvasWidget>): void {
    const widgetId = this.panelConfigWidgetId();
    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              ...change,
            }
          : widget,
      ),
    );
  }

  onPanelConfigBoardWidgetChanged(change: Partial<CanvasWidget>): void {
    const widgetId = this.panelConfigWidgetId();
    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              ...change,
            }
          : widget,
      ),
    );
  }

  onPanelConfigMediaConfigChanged(config: MediaWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();
    if (!widgetId) {
      return;
    }

    this.updateMediaWidgetConfig(widgetId, config);
  }

  onCanvasMediaConfigChanged(widgetId: string, config: MediaWidgetConfig): void {
    this.updateMediaWidgetConfig(widgetId, config);
  }

  private updateMediaWidgetConfig(widgetId: string, config: MediaWidgetConfig): void {
    const normalizedConfig = this.normalizeMediaWidgetConfig(config);

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              widgetProps: {
                ...widget.widgetProps,
                mediaConfig: { ...normalizedConfig },
              },
            }
          : widget,
      ),
    );
  }

  private normalizeMediaWidgetConfig(config: MediaWidgetConfig): MediaWidgetConfig {
    const mediaType = config.mediaType;
    const sourceMode =
      config.sourceMode === 'upload' || config.sourceMode === 'datasource'
        ? config.sourceMode
        : 'static-url';

    const defaults = createDefaultMediaWidgetConfig(mediaType);
    const normalizedConfig: MediaWidgetConfig = {
      ...defaults,
      ...config,
      sourceMode,
      sourceUrl: sourceMode === 'static-url' ? config.sourceUrl : '',
      datasourceId: sourceMode === 'datasource' ? config.datasourceId : '',
      queryId: sourceMode === 'datasource' ? config.queryId : '',
      queryBinding: sourceMode === 'datasource' ? config.queryBinding : '',
      recordId: sourceMode === 'datasource' ? config.recordId : '',
      imageField: sourceMode === 'datasource' ? config.imageField : '',
      titleField: sourceMode === 'datasource' ? config.titleField : '',
      captionField: sourceMode === 'datasource' ? config.captionField : '',
      uploadedImageDataUrl: mediaType === 'image' && sourceMode === 'upload' ? config.uploadedImageDataUrl : '',
      uploadedVideoDataUrl: mediaType === 'video' && sourceMode === 'upload' ? config.uploadedVideoDataUrl : '',
      uploadedPdfDataUrl: mediaType === 'pdf' ? config.uploadedPdfDataUrl : '',
      autoPlay: mediaType === 'video' ? config.autoPlay : false,
      pdfDefaultPage: mediaType === 'pdf' ? config.pdfDefaultPage : defaults.pdfDefaultPage,
      pdfShowToolbar: mediaType === 'pdf' ? config.pdfShowToolbar : false,
      pdfAllowDownload: mediaType === 'pdf' ? config.pdfAllowDownload : false,
      pdfAllowPrint: mediaType === 'pdf' ? config.pdfAllowPrint : false,
      pdfZoomLevel: mediaType === 'pdf' ? config.pdfZoomLevel : defaults.pdfZoomLevel,
      pdfFitToWidth: mediaType === 'pdf' ? config.pdfFitToWidth : false,
      pdfDisabled: mediaType === 'pdf' ? config.pdfDisabled : false,
      pdfLoadingState: mediaType === 'pdf' ? config.pdfLoadingState : false,
    };

    return normalizedConfig;
  }

  onPanelConfigSelectConfigChanged(config: SelectWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();
    const normalizedConfig: SelectWidgetConfig = {
      ...config,
      options: config.options.map((option) => ({ ...option })),
    };

    this.updatePanelConfigState({ selectWidgetConfig: normalizedConfig });

    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              widgetProps: {
                ...widget.widgetProps,
                selectConfig: {
                  ...normalizedConfig,
                  options: normalizedConfig.options.map((option) => ({ ...option })),
                },
              },
            }
          : widget,
      ),
    );
  }

  onPanelConfigSnippetConfigChanged(config: SnippetWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();
    const variant = this.panelConfigWidget()?.snippetVariant ?? 'html';
    const normalizedConfig: SnippetWidgetConfig = {
      ...createDefaultSnippetWidgetConfig(variant),
      ...config,
    };

    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              widgetProps: {
                ...widget.widgetProps,
                snippetConfig: { ...normalizedConfig },
              },
            }
          : widget,
      ),
    );
  }

  onPanelConfigTextBlockConfigChanged(config: TextBlockWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();
    const preset = getTextBlockWidgetPreset(config.inputType);
    this.updatePanelConfigState({ textBlockWidgetConfig: { ...config } });
    this.panelConfigLabel.set(config.label || preset.label);

    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              textBlockVariant: config.inputType,
              label: config.label || preset.label,
              height: config.inputType === 'richtext' ? 220 : 112,
              widgetProps: {
                ...widget.widgetProps,
                label: config.label || preset.label,
                textBlockConfig: { ...config },
              },
            }
          : widget,
      ),
    );
  }

  onPanelConfigPanelWidgetConfigChanged(config: PanelWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();
    const normalizedConfig = this.schemaConfig.clonePanelWidgetConfig(config);
    this.panelConfigLabel.set(normalizedConfig.title);
    this.updatePanelConfigState({ editableLabel: normalizedConfig.title });

    if (!widgetId) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              label: normalizedConfig.title,
              widgetProps: {
                ...widget.widgetProps,
                panelConfig: normalizedConfig,
              },
            }
          : widget,
      ),
    );
  }

  onPanelConfigFormWidgetConfigChanged(config: FormWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();

    if (!widgetId) {
      return;
    }

    const normalizedConfig = this.schemaConfig.cloneFormWidgetConfig(config);

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              label: normalizedConfig.formLabel,
              widgetProps: {
                ...widget.widgetProps,
                formConfig: normalizedConfig,
              },
            }
          : widget,
      ),
    );
  }

  onPanelConfigChartConfigChanged(config: ChartWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();

    if (!widgetId) {
      return;
    }

    const normalizedConfig = {
      ...createDefaultChartWidgetConfig(),
      ...config,
      aggregateValue: {
        tab: config.aggregateValue?.tab ?? null,
        value: config.aggregateValue?.value ?? null,
      },
      filterDataBasedOn: [...(config.filterDataBasedOn ?? [])],
      selectedRecordCriteriaRows: (config.selectedRecordCriteriaRows ?? []).map((row) => ({ ...row })),
    };

    const currentWidget = this.pageCanvas.canvasWidgets().find((widget) => widget.id === widgetId);
    const currentConfig = currentWidget ? this.widgetDefaults.getWidgetChartConfig(currentWidget) : null;

    if (currentConfig && JSON.stringify(currentConfig) === JSON.stringify(normalizedConfig)) {
      return;
    }

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              widgetProps: {
                ...widget.widgetProps,
                chartConfig: normalizedConfig,
              },
            }
          : widget,
      ),
    );
  }

  onPanelConfigReportWidgetConfigChanged(config: ReportWidgetConfig): void {
    const widgetId = this.panelConfigWidgetId();

    if (!widgetId) {
      return;
    }

    const normalizedConfig = this.schemaConfig.cloneReportWidgetConfig(config);

    this.updateCanvasWidgets((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              label: normalizedConfig.reportLabel,
              widgetProps: {
                ...widget.widgetProps,
                reportConfig: normalizedConfig,
              },
            }
          : widget,
      ),
    );
  }

  private updateCanvasWidgets(updater: (widgets: CanvasWidget[]) => CanvasWidget[]): void {
    this.pageCanvas.setDraftWidgets(updater(this.pageCanvas.canvasWidgets()));
  }
}
