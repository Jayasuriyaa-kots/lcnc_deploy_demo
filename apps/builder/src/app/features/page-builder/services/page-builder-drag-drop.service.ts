import { inject, Injectable } from '@angular/core';
import { BoardShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/board/board-showcase.component';
import { ButtonShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/button/button-showcase.component';
import { ChartPickerDragItem } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import { MediaShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/media/media-showcase.component';
import { PanelShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/panel/panel-showcase.component';
import { SearchShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/search/search-showcase.component';
import { SelectShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/select/select-showcase.component';
import { SnippetShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-showcase.component';
import { TableShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/table/table-showcase.component';
import { TextBlockShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-showcase.component';
import {
  CanvasWidget,
  CanvasWidgetType,
  FormWidgetConfig,
  ReportWidgetConfig,
  createDefaultButtonActionConfig,
  createDefaultButtonStyleConfig,
  createDefaultChartWidgetConfig,
  createDefaultMediaWidgetConfig,
  createDefaultPanelWidgetConfig,
  createDefaultSelectWidgetConfig,
  createDefaultSnippetWidgetConfig,
  createDefaultTableWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PageBuilderViewport } from '@builder/features/page-builder/models/page-builder-page.model';
import { PageBuilderSchemaConfigService } from '@builder/features/page-builder/services/page-builder-schema-config.service';
import { WidgetDefaultsService } from '@builder/features/page-builder/services/widget-defaults.service';

const SUPPORTED_DROP_WIDGET_TYPES: CanvasWidgetType[] = [
  'form-embed',
  'form-button',
  'form-action-card',
  'report-embed',
  'report-button',
  'report-action-card',
  'button-showcase',
  'panel-showcase',
  'search-showcase',
  'chart-showcase',
  'table-showcase',
  'select-showcase',
  'media-showcase',
  'board-showcase',
  'snippet-showcase',
  'text-block-showcase',
];

export interface PageBuilderDropBounds {
  width: number;
  height: number;
}

export interface PageBuilderDropContext {
  bounds: PageBuilderDropBounds;
  desktopCanvasWidgetWidth: number;
  meta: Partial<CanvasWidget> | null;
  pointerX: number;
  pointerY: number;
  viewport: PageBuilderViewport;
  widgetId: string;
  widgetType: CanvasWidgetType;
  widthScale: number;
}

@Injectable({ providedIn: 'root' })
export class PageBuilderDragDropService {
  private readonly schemaConfig = inject(PageBuilderSchemaConfigService);
  private readonly widgetDefaults = inject(WidgetDefaultsService);

  configureNativeDrag(event: DragEvent, type: CanvasWidgetType): void {
    event.dataTransfer?.setData('text/plain', type);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  isDroppableWidgetType(type: CanvasWidgetType | ''): type is CanvasWidgetType {
    return SUPPORTED_DROP_WIDGET_TYPES.includes(type as CanvasWidgetType);
  }

  createFormPreviewMeta(
    formConfig: FormWidgetConfig | null,
    selectedFormName: string | null,
  ): Partial<CanvasWidget> {
    return {
      label: formConfig?.formLabel ?? selectedFormName ?? 'Form',
      widgetProps: formConfig
        ? {
            formConfig: this.schemaConfig.cloneFormWidgetConfig(formConfig),
          }
        : undefined,
    };
  }

  createReportPreviewMeta(
    reportConfig: ReportWidgetConfig | null,
    selectedReportName: string | null,
  ): Partial<CanvasWidget> {
    return {
      label: reportConfig?.reportLabel ?? selectedReportName ?? 'Report',
      widgetProps: reportConfig
        ? {
            reportConfig: this.schemaConfig.cloneReportWidgetConfig(reportConfig),
          }
        : undefined,
    };
  }

  createButtonShowcaseMeta(item: ButtonShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      buttonVariant: item.variant,
      buttonIcon: item.displayType === 'icon-button' ? 'download' : undefined,
      widgetProps:
        item.displayType === 'button-group'
          ? {
              buttonGroupConfig: {
                buttons: [
                  this.createButtonGroupButton(item.label),
                  this.createButtonGroupButton(item.secondaryButtonText || 'Reject'),
                ],
              },
            }
          : undefined,
    };
  }

  createSearchShowcaseMeta(item: SearchShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      searchVariant: item.variant,
    };
  }

  createBoardShowcaseMeta(item: BoardShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      boardVariant: item.boardVariant,
    };
  }

  createTableShowcaseMeta(item: TableShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
    };
  }

  createSelectShowcaseMeta(item: SelectShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      widgetProps: {
        selectConfig: {
          ...item.selectConfig,
          options: item.selectConfig.options.map((option) => ({ ...option })),
        },
      },
    };
  }

  createSnippetShowcaseMeta(item: SnippetShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.title,
      snippetVariant: item.variant,
    };
  }

  createTextBlockShowcaseMeta(item: TextBlockShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      textBlockVariant: item.variant,
    };
  }

  createMediaShowcaseMeta(item: MediaShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      widgetProps: {
        mediaConfig: { ...item.mediaConfig },
      },
    };
  }

  createPanelShowcaseMeta(item: PanelShowcaseDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      widgetProps: {
        panelConfig: this.schemaConfig.clonePanelWidgetConfig(item.panelConfig),
      },
    };
  }

  createChartPickerMeta(item: ChartPickerDragItem): Partial<CanvasWidget> {
    return {
      label: item.label,
      chartType: item.type,
      chartTypeLabel: item.label,
    };
  }

  buildDroppedWidget(context: PageBuilderDropContext): CanvasWidget {
    const defaults = this.widgetDefaults.getWidgetDefaults(context.widgetType, context.meta, {
      desktopCanvasWidgetWidth: context.desktopCanvasWidgetWidth,
      viewport: context.viewport,
      widthScale: context.widthScale,
    });
    const rawX = context.pointerX - defaults.width / 2;
    const rawY = context.pointerY - defaults.height / 2;
    const maxX = Math.max(0, context.bounds.width - defaults.width);
    const maxY = Math.max(0, context.bounds.height - defaults.height);

    return {
      id: context.widgetId,
      type: context.widgetType,
      x: this.clamp(rawX, 0, maxX),
      y: this.clamp(rawY, 0, maxY),
      width: defaults.width,
      height: defaults.height,
      label: defaults.label,
      widgetProps: this.buildDroppedWidgetProps(context.widgetType, defaults, context.meta),
      buttonVariant: defaults.buttonVariant,
      searchVariant: defaults.searchVariant,
      boardVariant: defaults.boardVariant,
      snippetVariant: defaults.snippetVariant,
      textBlockVariant: defaults.textBlockVariant,
      chartType: context.meta?.chartType,
      chartTypeLabel: defaults.chartTypeLabel,
    };
  }

  private buildDroppedWidgetProps(
    widgetType: CanvasWidgetType,
    defaults: ReturnType<WidgetDefaultsService['getWidgetDefaults']>,
    meta: Partial<CanvasWidget> | null,
  ): CanvasWidget['widgetProps'] {
    return {
      label: defaults.label,
      ...(widgetType === 'chart-showcase'
        ? {
            chartConfig: {
              ...createDefaultChartWidgetConfig(),
              ...(meta?.widgetProps?.chartConfig ?? defaults.widgetProps?.chartConfig ?? {}),
              aggregateValue: {
                tab: meta?.widgetProps?.chartConfig?.aggregateValue?.tab ?? null,
                value: meta?.widgetProps?.chartConfig?.aggregateValue?.value ?? null,
              },
              filterDataBasedOn: [...(meta?.widgetProps?.chartConfig?.filterDataBasedOn ?? [])],
              selectedRecordCriteriaRows: (meta?.widgetProps?.chartConfig?.selectedRecordCriteriaRows ?? []).map((row) => ({
                ...row,
              })),
            },
          }
        : {}),
      ...(widgetType === 'table-showcase'
        ? {
            tableConfig: createDefaultTableWidgetConfig(),
          }
        : {}),
      ...(widgetType === 'select-showcase'
        ? {
            selectConfig: {
              ...(defaults.selectConfig ?? createDefaultSelectWidgetConfig()),
              options: (defaults.selectConfig?.options ?? createDefaultSelectWidgetConfig().options).map((option) => ({
                ...option,
              })),
            },
          }
        : {}),
      ...(widgetType === 'media-showcase'
        ? {
            mediaConfig: {
              ...(defaults.mediaConfig ?? createDefaultMediaWidgetConfig()),
            },
          }
        : {}),
      ...(widgetType === 'panel-showcase'
        ? {
            panelConfig: this.schemaConfig.clonePanelWidgetConfig(
              defaults.panelConfig ?? createDefaultPanelWidgetConfig(),
            ),
          }
        : {}),
      ...(widgetType === 'snippet-showcase'
        ? {
            snippetConfig: {
              ...createDefaultSnippetWidgetConfig(defaults.snippetVariant ?? 'html'),
            },
          }
        : {}),
      ...(widgetType === 'form-embed' || widgetType === 'form-button' || widgetType === 'form-action-card'
        ? {
            formConfig: defaults.formConfig ? this.schemaConfig.cloneFormWidgetConfig(defaults.formConfig) : undefined,
          }
        : {}),
      ...(widgetType === 'report-embed' || widgetType === 'report-button' || widgetType === 'report-action-card'
        ? {
            reportConfig: defaults.reportConfig
              ? this.schemaConfig.cloneReportWidgetConfig(defaults.reportConfig)
              : undefined,
          }
        : {}),
    };
  }

  private createButtonGroupButton(label: string) {
    return {
      id: `btn-${Math.random().toString(36).slice(2, 10)}`,
      label,
      buttonStyleConfig: createDefaultButtonStyleConfig(),
      selectedAction: 'none',
      buttonActionConfig: createDefaultButtonActionConfig(),
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
