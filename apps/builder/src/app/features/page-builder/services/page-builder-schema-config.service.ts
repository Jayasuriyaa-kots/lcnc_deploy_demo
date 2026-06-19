import { Injectable, inject } from '@angular/core';
import {
  ButtonActionConfig,
  CanvasWidget,
  FormWidgetConfig,
  PanelWidgetConfig,
  ReportWidgetConfig,
  cloneButtonActionConfig,
  cloneCanvasWidgets,
  cloneFormWidgetConfig,
  clonePanelWidgetConfig,
  cloneReportWidgetConfig,
  createDefaultPanelWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  MockSchemaFormSummary,
  MockSchemaReportSummary,
  MockSchemaService,
  MOCK_SCHEMA_APPLICATION_LABEL,
} from '@builder/core/services/mock-schema.service';

@Injectable({ providedIn: 'root' })
export class PageBuilderSchemaConfigService {
  private readonly mockSchemaService = inject(MockSchemaService);

  getFormsForApplication(applicationLabel: string): MockSchemaFormSummary[] {
    const forms = this.mockSchemaService.forms();
    if (!applicationLabel || applicationLabel === MOCK_SCHEMA_APPLICATION_LABEL) {
      return forms;
    }
    return [];
  }

  getReportsForApplication(applicationLabel: string): MockSchemaReportSummary[] {
    const reports = this.mockSchemaService.reports();
    if (!applicationLabel || applicationLabel === MOCK_SCHEMA_APPLICATION_LABEL) {
      return reports;
    }
    return [];
  }

  getFormConfigById(formId: string): FormWidgetConfig | undefined {
    return this.mockSchemaService.formConfigs().find((config) => config.formId === formId);
  }

  getReportConfigById(reportId: string): ReportWidgetConfig | undefined {
    return this.mockSchemaService.reportConfigs().find((config) => config.reportId === reportId);
  }

  cloneWidgets(widgets: CanvasWidget[]): CanvasWidget[] {
    return cloneCanvasWidgets(widgets).map((widget) => {
      const hydratedFormConfig = this.hydrateFormWidgetConfig(widget);
      const hydratedReportConfig = this.hydrateReportWidgetConfig(widget);

      return {
        ...widget,
        widgetProps: widget.widgetProps
          ? {
              ...widget.widgetProps,
              formConfig: hydratedFormConfig,
              reportConfig: hydratedReportConfig,
            }
          : hydratedFormConfig || hydratedReportConfig
            ? {
                formConfig: hydratedFormConfig,
                reportConfig: hydratedReportConfig,
              }
            : undefined,
      };
    });
  }

  cloneFormWidgetConfig(config: FormWidgetConfig): FormWidgetConfig {
    return cloneFormWidgetConfig(config);
  }

  cloneButtonActionConfig(config: ButtonActionConfig): ButtonActionConfig {
    return cloneButtonActionConfig(config);
  }

  clonePanelWidgetConfig(config: PanelWidgetConfig): PanelWidgetConfig {
    return clonePanelWidgetConfig(config);
  }

  getWidgetPanelConfig(widget: CanvasWidget): PanelWidgetConfig {
    return this.clonePanelWidgetConfig(widget.widgetProps?.panelConfig ?? createDefaultPanelWidgetConfig());
  }

  cloneReportWidgetConfig(config: ReportWidgetConfig): ReportWidgetConfig {
    return cloneReportWidgetConfig(config);
  }

  private hydrateFormWidgetConfig(widget: CanvasWidget): FormWidgetConfig | undefined {
    if (widget.type !== 'form-embed' && widget.type !== 'form-button' && widget.type !== 'form-action-card') {
      return undefined;
    }

    const existingConfig = widget.widgetProps?.formConfig;
    const sourceConfig = widget.widgetProps?.formConfig?.formId
      ? this.getFormConfigById(widget.widgetProps.formConfig.formId)
      : this.mockSchemaService.formConfigs().find((form) => form.formLabel === widget.label);

    if (sourceConfig) {
      return this.cloneFormWidgetConfig({
        ...sourceConfig,
        ...existingConfig,
        fields: sourceConfig.fields,
        actionLabels: existingConfig?.actionLabels?.length ? existingConfig.actionLabels : sourceConfig.actionLabels,
        submitConfig: {
          ...sourceConfig.submitConfig,
          ...(existingConfig?.submitConfig ?? {}),
        },
      });
    }

    if (existingConfig) {
      return this.cloneFormWidgetConfig(existingConfig);
    }

    return undefined;
  }

  private hydrateReportWidgetConfig(widget: CanvasWidget): ReportWidgetConfig | undefined {
    if (widget.type !== 'report-embed' && widget.type !== 'report-button' && widget.type !== 'report-action-card') {
      return undefined;
    }

    const existingConfig = widget.widgetProps?.reportConfig;
    const sourceConfig = widget.widgetProps?.reportConfig?.reportId
      ? this.getReportConfigById(widget.widgetProps.reportConfig.reportId)
      : this.mockSchemaService.reportConfigs().find((report) => report.reportLabel === widget.label);

    if (sourceConfig) {
      return this.cloneReportWidgetConfig({
        ...sourceConfig,
        ...existingConfig,
        columns: sourceConfig.columns,
        rows: sourceConfig.rows,
        visibility: {
          ...sourceConfig.visibility,
          ...(existingConfig?.visibility ?? {}),
        },
        allowPublicAccess: existingConfig?.allowPublicAccess ?? sourceConfig.allowPublicAccess,
        filterCriteriaRows: existingConfig?.filterCriteriaRows ?? sourceConfig.filterCriteriaRows,
        filterConfigured: existingConfig?.filterConfigured ?? sourceConfig.filterConfigured,
      });
    }

    if (existingConfig) {
      return this.cloneReportWidgetConfig(existingConfig);
    }

    return undefined;
  }
}
