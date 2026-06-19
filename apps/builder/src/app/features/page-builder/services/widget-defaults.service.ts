import { Injectable } from '@angular/core';
import { getBoardWidgetPreset } from '@builder/features/page-builder/components/widget-showcase/board/board-widget.config';
import { getSnippetWidgetPreset } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-widget.config';
import { getTextBlockWidgetPreset } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-widget.config';
import {
  CanvasWidget,
  CanvasWidgetType,
  ChartWidgetConfig,
  FormWidgetConfig,
  MediaWidgetConfig,
  PanelWidgetConfig,
  ReportWidgetConfig,
  SelectWidgetConfig,
  SnippetWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
  cloneFormWidgetConfig,
  clonePanelWidgetConfig,
  cloneReportWidgetConfig,
  createDefaultChartWidgetConfig,
  createDefaultMediaWidgetConfig,
  createDefaultPanelWidgetConfig,
  createDefaultSelectWidgetConfig,
  createDefaultSnippetWidgetConfig,
  createDefaultTableWidgetConfig,
  createDefaultTextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

export type WidgetDefaultsViewport = 'desktop' | 'tablet' | 'mobile';
export type WidgetWidthPreset = 'wide' | 'medium' | 'compact' | 'text';

export interface WidgetDefaultsLayoutContext {
  desktopCanvasWidgetWidth: number;
  viewport: WidgetDefaultsViewport;
  widthScale: number;
}

export type WidgetDefaults = Omit<CanvasWidget, 'id' | 'x' | 'y' | 'type'> & {
  mediaConfig?: MediaWidgetConfig;
  panelConfig?: PanelWidgetConfig;
  selectConfig?: SelectWidgetConfig;
  formConfig?: FormWidgetConfig;
  reportConfig?: ReportWidgetConfig;
};

export interface WidgetSizeLimits {
  minWidth: number;
  minHeight: number;
}

@Injectable({ providedIn: 'root' })
export class WidgetDefaultsService {
  getWidgetTableConfig(widget: CanvasWidget): TableWidgetConfig {
    return {
      ...createDefaultTableWidgetConfig(),
      ...(widget.widgetProps?.tableConfig ?? {}),
    };
  }

  getWidgetSelectConfig(widget: CanvasWidget): SelectWidgetConfig {
    const config = widget.widgetProps?.selectConfig;

    return {
      ...createDefaultSelectWidgetConfig(),
      ...(config ?? {}),
      options: (config?.options ?? createDefaultSelectWidgetConfig().options).map((option) => ({
        ...option,
      })),
    };
  }

  getWidgetChartConfig(widget: CanvasWidget): ChartWidgetConfig {
    const config = widget.widgetProps?.chartConfig;

    return {
      ...this.getDefaultChartWidgetConfig(config?.datasourceId ?? '', config?.datasourceLabel ?? ''),
      ...(config ?? {}),
      aggregateValue: {
        tab: config?.aggregateValue?.tab ?? null,
        value: config?.aggregateValue?.value ?? null,
      },
      filterDataBasedOn: [...(config?.filterDataBasedOn ?? [])],
      selectedRecordCriteriaRows: (config?.selectedRecordCriteriaRows ?? []).map((row) => ({ ...row })),
    };
  }

  getWidgetReportConfig(widget: CanvasWidget): ReportWidgetConfig | null {
    return widget.widgetProps?.reportConfig ?? null;
  }

  getWidgetSnippetConfig(widget: CanvasWidget): SnippetWidgetConfig {
    return {
      ...createDefaultSnippetWidgetConfig(widget.snippetVariant ?? 'html'),
      ...(widget.widgetProps?.snippetConfig ?? {}),
    };
  }

  getWidgetTextBlockConfig(widget: CanvasWidget): TextBlockWidgetConfig {
    return {
      ...createDefaultTextBlockWidgetConfig(widget.textBlockVariant ?? 'text'),
      ...(widget.widgetProps?.textBlockConfig ?? {}),
    };
  }

  getWidgetMediaConfig(widget: CanvasWidget): MediaWidgetConfig {
    return {
      ...createDefaultMediaWidgetConfig(),
      ...(widget.widgetProps?.mediaConfig ?? {}),
    };
  }

  getDefaultChartWidgetConfig(datasourceId = '', datasourceLabel = ''): ChartWidgetConfig {
    return createDefaultChartWidgetConfig(datasourceId, datasourceLabel);
  }

  getWidgetDefaults(
    type: CanvasWidgetType,
    meta: Partial<CanvasWidget> | null,
    context: WidgetDefaultsLayoutContext,
  ): WidgetDefaults {
    if (type === 'panel-showcase') {
      const panelConfig = clonePanelWidgetConfig(
        meta?.widgetProps?.panelConfig ?? createDefaultPanelWidgetConfig(),
      );
      return {
        width: this.getViewportDefaultDropWidth(340, 'wide', context),
        height: 160,
        label: panelConfig.title,
        panelConfig,
      };
    }

    if (type === 'chart-showcase') {
      const chartConfig = this.getDefaultChartWidgetConfig();
      return {
        width: this.getViewportDefaultDropWidth(220, 'medium', context),
        height: 190,
        label: meta?.label ?? 'Line',
        widgetProps: { chartConfig },
        chartType: meta?.chartType ?? 'line',
        chartTypeLabel: meta?.chartTypeLabel ?? meta?.label ?? 'Line',
      };
    }

    if (type === 'search-showcase') {
      return {
        width: this.getViewportDefaultDropWidth(
          260,
          meta?.searchVariant === 'stacked-rounded' ? 'wide' : 'medium',
          context,
        ),
        height: meta?.searchVariant === 'stacked-rounded' ? 132 : 58,
        label: meta?.label ?? 'Search',
        searchVariant: meta?.searchVariant ?? 'icon-only',
      };
    }

    if (type === 'board-showcase') {
      const preset = getBoardWidgetPreset(meta?.boardVariant ?? 'department-list');
      return {
        width: this.getViewportDefaultDropWidth(420, 'wide', context),
        height: 210,
        label: preset.label,
        boardVariant: preset.variant,
      };
    }

    if (type === 'table-showcase') {
      return {
        width: this.getViewportDefaultDropWidth(760, 'wide', context),
        height: 320,
        label: meta?.label ?? 'Table',
      };
    }

    if (type === 'select-showcase') {
      return {
        width: this.getViewportDefaultDropWidth(320, 'medium', context),
        height: 78,
        label: meta?.label ?? 'Select',
        selectConfig: {
          ...(meta?.widgetProps?.selectConfig ?? createDefaultSelectWidgetConfig()),
          options: (
            meta?.widgetProps?.selectConfig?.options ?? createDefaultSelectWidgetConfig().options
          ).map((option) => ({ ...option })),
        },
      };
    }

    if (type === 'media-showcase') {
      return {
        width: this.getViewportDefaultDropWidth(360, 'wide', context),
        height: 248,
        label: meta?.label ?? 'Media',
        mediaConfig: {
          ...(meta?.widgetProps?.mediaConfig ?? createDefaultMediaWidgetConfig()),
        },
      };
    }

    if (type === 'snippet-showcase') {
      const preset = getSnippetWidgetPreset(meta?.snippetVariant ?? 'html');
      return {
        width: this.getViewportDefaultDropWidth(360, 'wide', context),
        height: 220,
        label: preset.title,
        snippetVariant: preset.variant,
      };
    }

    if (type === 'text-block-showcase') {
      const preset = getTextBlockWidgetPreset(meta?.textBlockVariant ?? 'text');
      return {
        width: this.getViewportDefaultDropWidth(
          preset.variant === 'labeltext' ? 180 : 360,
          preset.variant === 'labeltext' ? 'text' : 'medium',
          context,
        ),
        height: preset.variant === 'labeltext' ? 48 : 112,
        label: preset.label,
        textBlockVariant: preset.variant,
      };
    }

    if (type === 'button-showcase') {
      return {
        width: this.getViewportDefaultDropWidth(
          meta?.widgetProps?.buttonGroupConfig ? 320 : 220,
          meta?.widgetProps?.buttonGroupConfig ? 'medium' : 'compact',
          context,
        ),
        height: 64,
        label: meta?.widgetProps?.buttonGroupConfig ? 'Button group' : meta?.label ?? 'Update Details',
        buttonVariant: meta?.buttonVariant ?? 'primary-filled',
        buttonIcon: meta?.buttonIcon,
        widgetProps: meta?.widgetProps,
      };
    }

    if (type === 'report-action-card') {
      return {
        width: this.getViewportDefaultDropWidth(220, 'medium', context),
        height: 116,
        label: meta?.widgetProps?.reportConfig?.reportLabel ?? meta?.label ?? 'Staff In Report',
        reportConfig: meta?.widgetProps?.reportConfig ? cloneReportWidgetConfig(meta.widgetProps.reportConfig) : undefined,
      };
    }

    if (type === 'report-button') {
      return {
        width: this.getViewportDefaultDropWidth(228, 'compact', context),
        height: 58,
        label: meta?.widgetProps?.reportConfig?.reportLabel ?? meta?.label ?? 'Staff In Report',
        reportConfig: meta?.widgetProps?.reportConfig ? cloneReportWidgetConfig(meta.widgetProps.reportConfig) : undefined,
      };
    }

    if (type === 'report-embed') {
      const reportRowCount = meta?.widgetProps?.reportConfig?.rows.length ?? 3;
      return {
        width: this.getViewportDefaultDropWidth(354, 'wide', context),
        height: Math.max(154, 64 + (reportRowCount + 1) * 32),
        label: meta?.widgetProps?.reportConfig?.reportLabel ?? meta?.label ?? 'Staff In Report',
        reportConfig: meta?.widgetProps?.reportConfig ? cloneReportWidgetConfig(meta.widgetProps.reportConfig) : undefined,
      };
    }

    if (type === 'form-action-card') {
      return {
        width: this.getViewportDefaultDropWidth(220, 'medium', context),
        height: 116,
        label: meta?.widgetProps?.formConfig?.formLabel ?? meta?.label ?? 'Staff In',
        formConfig: meta?.widgetProps?.formConfig ? cloneFormWidgetConfig(meta.widgetProps.formConfig) : undefined,
      };
    }

    if (type === 'form-button') {
      return {
        width: this.getViewportDefaultDropWidth(196, 'compact', context),
        height: 58,
        label: meta?.widgetProps?.formConfig?.formLabel ?? meta?.label ?? 'Staff In',
        formConfig: meta?.widgetProps?.formConfig ? cloneFormWidgetConfig(meta.widgetProps.formConfig) : undefined,
      };
    }

    const formFieldCount = meta?.widgetProps?.formConfig?.fields.length ?? 3;
    return {
      width: this.getViewportDefaultDropWidth(354, 'wide', context),
      height: Math.max(192, 52 + formFieldCount * 52),
      label: meta?.widgetProps?.formConfig?.formLabel ?? meta?.label ?? 'Staff In',
      formConfig: meta?.widgetProps?.formConfig ? cloneFormWidgetConfig(meta.widgetProps.formConfig) : undefined,
    };
  }

  getWidgetSizeLimits(type: CanvasWidgetType, widget?: CanvasWidget): WidgetSizeLimits {
    if (type === 'panel-showcase') {
      return { minWidth: 240, minHeight: 140 };
    }

    if (type === 'chart-showcase') {
      return { minWidth: 200, minHeight: 170 };
    }

    if (type === 'search-showcase') {
      return { minWidth: 220, minHeight: 58 };
    }

    if (type === 'board-showcase') {
      return { minWidth: 320, minHeight: 180 };
    }

    if (type === 'table-showcase') {
      return { minWidth: 520, minHeight: 220 };
    }

    if (type === 'select-showcase') {
      return { minWidth: 220, minHeight: 58 };
    }

    if (type === 'media-showcase') {
      return { minWidth: 280, minHeight: 200 };
    }

    if (type === 'snippet-showcase') {
      return { minWidth: 280, minHeight: 180 };
    }

    if (type === 'text-block-showcase') {
      const textBlockVariant = widget?.widgetProps?.textBlockConfig?.inputType ?? widget?.textBlockVariant ?? 'text';
      if (textBlockVariant === 'labeltext') {
        return { minWidth: 80, minHeight: 24 };
      }

      return { minWidth: 260, minHeight: 96 };
    }

    if (type === 'button-showcase') {
      return { minWidth: 160, minHeight: 52 };
    }

    if (type === 'report-action-card') {
      return { minWidth: 180, minHeight: 110 };
    }

    if (type === 'report-button') {
      return { minWidth: 160, minHeight: 48 };
    }

    if (type === 'report-embed') {
      return { minWidth: 260, minHeight: 140 };
    }

    if (type === 'form-action-card') {
      return { minWidth: 180, minHeight: 110 };
    }

    if (type === 'form-button') {
      return { minWidth: 140, minHeight: 48 };
    }

    if (type === 'form-embed') {
      return { minWidth: 300, minHeight: 420 };
    }

    return { minWidth: 260, minHeight: 180 };
  }

  getViewportDefaultDropWidth(
    desktopWidth: number,
    preset: WidgetWidthPreset,
    context: WidgetDefaultsLayoutContext,
  ): number {
    if (context.widthScale >= 0.999) {
      return desktopWidth;
    }

    const viewportWidth = context.desktopCanvasWidgetWidth * context.widthScale;
    const ratio =
      context.viewport === 'tablet'
        ? { wide: 0.72, medium: 0.44, compact: 0.32, text: 0.18 }[preset]
        : { wide: 0.92, medium: 0.62, compact: 0.46, text: 0.26 }[preset];
    const renderedDesktopWidth = desktopWidth * context.widthScale;
    const targetRenderedWidth = Math.min(
      viewportWidth,
      Math.max(renderedDesktopWidth, Math.round(viewportWidth * ratio)),
    );

    return Math.max(desktopWidth, Math.round(targetRenderedWidth / context.widthScale));
  }

  cloneFormWidgetConfig(config: FormWidgetConfig): FormWidgetConfig {
    return cloneFormWidgetConfig(config);
  }

}
