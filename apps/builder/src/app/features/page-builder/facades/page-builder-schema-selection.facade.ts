import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { SelectOption } from '@qo/ui-components';
import { PageBuilderMockDatasourceService } from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import { MockSchemaService, MOCK_SCHEMA_APPLICATION_LABEL } from '@builder/core/services/mock-schema.service';
import {
  FormWidgetConfig,
  ReportWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PageBuilderSchemaConfigService } from '@builder/features/page-builder/services/page-builder-schema-config.service';

@Injectable({ providedIn: 'root' })
export class PageBuilderSchemaSelectionFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly mockSchemaService = inject(MockSchemaService);
  private readonly mockDatasourceService = inject(PageBuilderMockDatasourceService);
  private readonly schemaConfig = inject(PageBuilderSchemaConfigService);

  readonly formApplicationOptions = computed<SelectOption[]>(() =>
    this.mockSchemaService.forms().length
      ? [{ value: MOCK_SCHEMA_APPLICATION_LABEL, label: MOCK_SCHEMA_APPLICATION_LABEL }]
      : [],
  );
  readonly formApplicationValues = computed<string[]>(() =>
    this.formApplicationOptions()
      .map((option) => option.value)
      .filter((value): value is string => typeof value === 'string'),
  );
  readonly formOptions = computed<SelectOption[]>(() =>
    this.schemaConfig.getFormsForApplication(this.selectedFormApplication()).map((form) => ({
      value: form.id,
      label: form.name,
    })),
  );
  readonly formOptionValues = computed<string[]>(() =>
    this.formOptions()
      .map((option) => option.value)
      .filter((value): value is string => typeof value === 'string'),
  );
  readonly selectedFormApplicationControl = this.formBuilder.nonNullable.control('');
  readonly selectedFormNameControl = this.formBuilder.nonNullable.control('');
  readonly selectedFormApplication = toSignal(this.selectedFormApplicationControl.valueChanges, {
    initialValue: this.selectedFormApplicationControl.getRawValue(),
  });
  readonly selectedFormName = toSignal(this.selectedFormNameControl.valueChanges, {
    initialValue: this.selectedFormNameControl.getRawValue(),
  });
  readonly selectedFormAsset = computed(() => {
    const forms = this.schemaConfig.getFormsForApplication(this.selectedFormApplication());
    return forms.find((form) => form.id === this.selectedFormName()) ?? forms[0] ?? null;
  });
  readonly selectedFormWidgetConfig = computed<FormWidgetConfig | null>(() => {
    const form = this.selectedFormAsset();

    if (!form) {
      return null;
    }

    const config = this.schemaConfig.getFormConfigById(form.id);
    return config ? this.schemaConfig.cloneFormWidgetConfig(config) : null;
  });
  readonly availableFormConfigs = computed<FormWidgetConfig[]>(() =>
    this.schemaConfig
      .getFormsForApplication(this.selectedFormApplication())
      .map((form) => this.schemaConfig.getFormConfigById(form.id))
      .filter((config): config is FormWidgetConfig => !!config)
      .map((config) => this.schemaConfig.cloneFormWidgetConfig(config)),
  );

  readonly reportApplicationOptions = computed<SelectOption[]>(() =>
    this.mockSchemaService.reports().length
      ? [{ value: MOCK_SCHEMA_APPLICATION_LABEL, label: MOCK_SCHEMA_APPLICATION_LABEL }]
      : [],
  );
  readonly reportApplicationValues = computed<string[]>(() =>
    this.reportApplicationOptions()
      .map((option) => option.value)
      .filter((value): value is string => typeof value === 'string'),
  );
  readonly reportOptions = computed<SelectOption[]>(() =>
    this.schemaConfig.getReportsForApplication(this.selectedReportApplication()).map((report) => ({
      value: report.id,
      label: report.name,
    })),
  );
  readonly reportOptionValues = computed<string[]>(() =>
    this.reportOptions()
      .map((option) => option.value)
      .filter((value): value is string => typeof value === 'string'),
  );
  readonly buttonDatasourceOptions = computed<SelectOption[]>(() => this.mockDatasourceService.datasourceOptions());
  readonly selectedReportApplicationControl = this.formBuilder.nonNullable.control('');
  readonly selectedReportNameControl = this.formBuilder.nonNullable.control('');
  readonly selectedReportApplication = toSignal(this.selectedReportApplicationControl.valueChanges, {
    initialValue: this.selectedReportApplicationControl.getRawValue(),
  });
  readonly selectedReportName = toSignal(this.selectedReportNameControl.valueChanges, {
    initialValue: this.selectedReportNameControl.getRawValue(),
  });
  readonly selectedReportAsset = computed(() => {
    const reports = this.schemaConfig.getReportsForApplication(this.selectedReportApplication());
    return reports.find((report) => report.id === this.selectedReportName()) ?? reports[0] ?? null;
  });
  readonly selectedReportWidgetConfig = computed<ReportWidgetConfig | null>(() => {
    const report = this.selectedReportAsset();

    if (!report) {
      return null;
    }

    const config = this.schemaConfig.getReportConfigById(report.id);
    return config ? this.schemaConfig.cloneReportWidgetConfig(config) : null;
  });

  private readonly syncFormSelectionsEffect = effect(() => {
    const applicationOptions = this.formApplicationValues();
    const currentApplication = this.selectedFormApplication();
    const nextApplication =
      applicationOptions.find((value) => value === currentApplication) ?? applicationOptions[0] ?? '';

    if (nextApplication !== currentApplication) {
      this.selectedFormApplicationControl.setValue(nextApplication);
      return;
    }

    const formOptions = this.formOptionValues();
    const currentForm = this.selectedFormName();
    const nextForm = formOptions.find((value) => value === currentForm) ?? formOptions[0] ?? '';

    if (nextForm !== currentForm) {
      this.selectedFormNameControl.setValue(nextForm);
    }
  });

  private readonly syncReportSelectionsEffect = effect(() => {
    const applicationOptions = this.reportApplicationValues();
    const currentApplication = this.selectedReportApplication();
    const nextApplication =
      applicationOptions.find((value) => value === currentApplication) ?? applicationOptions[0] ?? '';

    if (nextApplication !== currentApplication) {
      this.selectedReportApplicationControl.setValue(nextApplication);
      return;
    }

    const reportOptions = this.reportOptionValues();
    const currentReport = this.selectedReportName();
    const nextReport = reportOptions.find((value) => value === currentReport) ?? reportOptions[0] ?? '';

    if (nextReport !== currentReport) {
      this.selectedReportNameControl.setValue(nextReport);
    }
  });
}
