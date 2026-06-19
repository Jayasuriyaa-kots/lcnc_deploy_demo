import { computed, effect, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { resolvePageBuilderExpression } from '@builder/features/page-builder/services/page-builder-expression-resolver.service';
import { getPageBuilderMockDatasourceOptions, getPageBuilderMockQueryOptions } from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import { getPageBuilderRuntimeFieldOptions, getPageBuilderRuntimeNumericFieldOptions } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import {
  AggregateOption,
  QoMultiSelectOption,
  SelectOption,
} from '@qo/ui-components';
import { SearchCriteriaRow } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';
import { ChartWidgetConfig, createDefaultChartWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';

type ChartAggregateTab = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'count-distinct';
type ChartAggregateValueSelection = {
  tab: ChartAggregateTab | null;
  value: string | null;
};

type ChartSettingsFormModel = {
  sourceForm: FormControl<string>;
  queryId: FormControl<string>;
  queryBinding: FormControl<string>;
  xAxisCategory: FormControl<string>;
  xAxisLabel: FormControl<string>;
  yAxisField: FormControl<string>;
  yAxisStackBy: FormControl<string>;
  aggregateValue: FormControl<ChartAggregateValueSelection>;
  yAxisLabel: FormControl<string>;
  interval: FormControl<string>;
  filterDataBasedOn: FormControl<Array<string | number>>;
  showDataLabel: FormControl<boolean>;
  showUnderlyingData: FormControl<boolean>;
  chartColor: FormControl<string>;
  chartColorSecondary: FormControl<string>;
};

type ChartSettingsFormValue = {
  sourceForm: string;
  queryId: string;
  queryBinding: string;
  xAxisCategory: string;
  xAxisLabel: string;
  yAxisField: string;
  yAxisStackBy: string;
  aggregateValue: ChartAggregateValueSelection;
  yAxisLabel: string;
  interval: string;
  filterDataBasedOn: Array<string | number>;
  showDataLabel: boolean;
  showUnderlyingData: boolean;
  chartColor: string;
  chartColorSecondary: string;
};

@Injectable()
export class ChartSettingsFacade {
  private readonly fb: FormBuilder;

  readonly widgetId = signal('');
  readonly config = signal<ChartWidgetConfig>(createDefaultChartWidgetConfig());
  readonly chartType = signal<ChartType>('line');
  readonly configChange = signal<((c: ChartWidgetConfig) => void) | null>(null);
  readonly sourceFormChange = signal<((c: string) => void) | null>(null);

  selectedRecordsModalOpen = signal(false);

  readonly categoryOptions = signal<SelectOption[]>([]);
  readonly stackByOptions = signal<SelectOption[]>([]);
  readonly selectedRecordFieldOptions = signal<SelectOption[]>([]);
  readonly filterFieldOptions = signal<QoMultiSelectOption[]>([]);
  readonly aggregateSumOptions = signal<AggregateOption[]>([]);
  readonly aggregateCountOptions = signal<AggregateOption[]>([]);
  readonly yAxisFieldOptions = signal<SelectOption[]>([]);

  private readonly lastEmittedConfigSignature = signal('');
  readonly hasHydratedConfig = signal(false);

  readonly datasourceOptions = computed(() => getPageBuilderMockDatasourceOptions());

  readonly currentDatasourceId = computed(() => this.form.controls.sourceForm.getRawValue() || this.config().datasourceId || '');

  readonly queryOptions = computed(() => {
    const datasourceId = this.currentDatasourceId();
    if (!datasourceId) {
      return [];
    }

    return getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => ({
        value: option.value,
        label: option.label,
      }));
  });

  readonly queryRootKeys = computed(() => this.queryOptions().map((option) => String(option.value)));
  readonly queryBindingRootKeys = computed(() => this.currentDatasourceId() ? this.queryRootKeys() : []);

  readonly isHorizontalBarChart = computed(() => this.chartType() === 'bar' || this.chartType() === 'stacked-bar');
  readonly categoryAxisSectionTitle = computed(() => this.isHorizontalBarChart() ? 'Y-axis' : 'X-axis');
  readonly valueAxisSectionTitle = computed(() => this.isHorizontalBarChart() ? 'X-axis' : 'Y-axis');
  readonly categoryAxisLabelPlaceholder = computed(() => this.isHorizontalBarChart() ? 'Y-axis label' : 'X-axis label');
  readonly valueAxisLabelPlaceholder = computed(() => this.isHorizontalBarChart() ? 'X-axis label' : 'Y-axis label');

  readonly form: FormGroup<ChartSettingsFormModel>;

  private readonly sourceFormValue: Signal<string>;
  private readonly formValue: Signal<ChartSettingsFormValue>;

  constructor(formBuilder: FormBuilder) {
    this.fb = formBuilder;
    this.form = this.fb.nonNullable.group({
      sourceForm: [''],
      queryId: [''],
      queryBinding: [''],
      xAxisCategory: [''],
      xAxisLabel: [''],
      yAxisField: [''],
      yAxisStackBy: [''],
      aggregateValue: [{ tab: null, value: null } as ChartAggregateValueSelection],
      yAxisLabel: [''],
      interval: [''],
      filterDataBasedOn: [[] as Array<string | number>],
      showDataLabel: [false],
      showUnderlyingData: [false],
      chartColor: [''],
      chartColorSecondary: [''],
    });
    this.sourceFormValue = toSignal(this.form.controls.sourceForm.valueChanges, {
      initialValue: this.form.controls.sourceForm.getRawValue(),
    });
    this.formValue = toSignal(
      this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
      { initialValue: this.form.getRawValue() },
    );

    effect(() => {
      this.widgetId();
      this.hasHydratedConfig.set(false);
    }, { allowSignalWrites: true });

    effect(() => {
      this.widgetId();
      const currentConfig = this.config();
      const datasourceId = currentConfig.datasourceId;
      const queryId = currentConfig.queryId;
      const resolvedRows = this.resolveBindingRows(currentConfig.queryBinding);
      const structuredFieldState = !resolvedRows.length
        ? this.resolveStructuredBindingFieldState(currentConfig.queryBinding)
        : null;
      const fieldOptions = resolvedRows.length
        ? this.buildFieldOptionsFromRows(resolvedRows)
        : structuredFieldState?.fieldOptions ?? getPageBuilderRuntimeFieldOptions(datasourceId, queryId);
      const fieldKeys = new Set(fieldOptions.map((field) => String(field.value)));
      const numericFieldKeys = new Set(
        resolvedRows.length
          ? this.getNumericFieldKeysFromRows(resolvedRows)
          : structuredFieldState?.numericFieldKeys ?? getPageBuilderRuntimeNumericFieldOptions(datasourceId, queryId).map((field) => field.value),
      );
      this.categoryOptions.set(fieldOptions);
      this.yAxisFieldOptions.set([{ value: '', label: 'Select field' }, ...fieldOptions]);
      this.stackByOptions.set([{ value: '', label: 'Select field' }, ...fieldOptions]);
      this.selectedRecordFieldOptions.set([{ value: '', label: '- Select Field -' }, ...fieldOptions]);
      this.filterFieldOptions.set(fieldOptions.map((field) => ({ value: field.value, label: field.label })));
      this.aggregateSumOptions.set(
        [...numericFieldKeys].map((field) => ({
          value: field,
          label: `Sum of ${fieldOptions.find((option) => option.value === field)?.label ?? field}`,
        })),
      );
      this.aggregateCountOptions.set([
        { value: 'total_records', label: 'Total Records' },
        ...fieldOptions.map((field) => ({
          value: field.value,
          label: `Count of ${field.label}`,
        })),
      ]);

      const currentCategory = currentConfig.xAxisCategory ?? '';
      const currentYAxisField = currentConfig.yAxisField ?? '';
      const currentStackBy = currentConfig.yAxisStackBy ?? '';
      const currentFilters = currentConfig.filterDataBasedOn ?? [];
      const currentAggregate = {
        tab: currentConfig.aggregateValue?.tab ?? null,
        value: currentConfig.aggregateValue?.value ?? currentConfig.yAxisField ?? null,
      } as ChartAggregateValueSelection;

      const nextCategory = fieldKeys.has(currentCategory) ? currentCategory : '';
      const nextYAxisField = currentYAxisField && fieldKeys.has(currentYAxisField) ? currentYAxisField : '';
      const nextStackBy = currentStackBy && fieldKeys.has(currentStackBy) ? currentStackBy : '';
      const nextFilters = currentFilters.filter((value) => fieldKeys.has(String(value)));
      const nextAggregate =
        currentAggregate.tab === 'sum' ||
        currentAggregate.tab === 'avg' ||
        currentAggregate.tab === 'min' ||
        currentAggregate.tab === 'max'
          ? {
              ...currentAggregate,
              value: currentAggregate.value && numericFieldKeys.has(String(currentAggregate.value)) ? currentAggregate.value : null,
            }
          : currentAggregate.tab === 'count'
            ? {
                ...currentAggregate,
                value:
                  currentAggregate.value === 'total_records' ||
                  (currentAggregate.value && fieldKeys.has(String(currentAggregate.value)))
                   ? currentAggregate.value
                    : null,
               }
             : currentAggregate.tab === 'count-distinct'
               ? {
                   ...currentAggregate,
                   value: currentAggregate.value && fieldKeys.has(String(currentAggregate.value))
                     ? currentAggregate.value
                     : null,
                 }
             : currentAggregate;

      if (
        nextCategory !== currentCategory ||
        nextYAxisField !== currentYAxisField ||
        nextStackBy !== currentStackBy ||
        !this.areStringArraysEqual(nextFilters, currentFilters) ||
        nextAggregate.tab !== currentAggregate.tab ||
        nextAggregate.value !== currentAggregate.value
      ) {
        const syncedAggregateValue = nextAggregate.tab && nextYAxisField ? nextYAxisField : null;
        this.form.patchValue(
          {
            xAxisCategory: nextCategory,
            yAxisField: nextYAxisField,
            yAxisStackBy: nextStackBy,
            filterDataBasedOn: nextFilters,
            aggregateValue: {
              tab: nextAggregate.tab,
              value: syncedAggregateValue,
            },
          },
          { emitEvent: false },
        );
        const nextConfig = {
          ...currentConfig,
          xAxisCategory: nextCategory,
          yAxisField: nextYAxisField,
          yAxisStackBy: nextStackBy,
          filterDataBasedOn: nextFilters,
          aggregateValue: {
            tab: nextAggregate.tab,
            value: syncedAggregateValue,
          },
        };
        if (this.hasHydratedConfig()) {
          this.emitConfigIfChanged(nextConfig);
        }
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.widgetId();
      const nextConfig = this.config();
      const normalizedNextConfig = this.normalizeChartConfig(nextConfig);
      this.hasHydratedConfig.set(false);
      this.form.setValue({
        sourceForm: nextConfig.datasourceId,
        queryId: nextConfig.queryId,
        queryBinding: nextConfig.queryBinding || this.buildQueryBinding(nextConfig.datasourceId, nextConfig.queryId),
        xAxisCategory: nextConfig.xAxisCategory,
        xAxisLabel: nextConfig.xAxisLabel,
        yAxisField: nextConfig.yAxisField,
        yAxisStackBy: nextConfig.yAxisStackBy,
        aggregateValue: {
          tab: nextConfig.aggregateValue?.tab ?? null,
          value: nextConfig.aggregateValue?.tab && nextConfig.yAxisField ? nextConfig.yAxisField : null,
        } as ChartAggregateValueSelection,
        yAxisLabel: nextConfig.yAxisLabel,
        interval: nextConfig.interval,
        filterDataBasedOn: nextConfig.filterDataBasedOn,
        showDataLabel: nextConfig.showDataLabel,
        showUnderlyingData: nextConfig.showUnderlyingData,
        chartColor: nextConfig.chartColor || '',
        chartColorSecondary: nextConfig.chartColorSecondary || '',
      }, { emitEvent: true });
      this.lastEmittedConfigSignature.set(JSON.stringify(normalizedNextConfig));
      this.hasHydratedConfig.set(true);
      this.selectedRecordsModalOpen.set(nextConfig.recordScope === 'selected');
    }, { allowSignalWrites: true });

    effect(() => {
      this.widgetId();
      this.selectedRecordsModalOpen.set(false);
    }, { allowSignalWrites: true });

    effect(() => {
      if (!this.hasHydratedConfig()) {
        return;
      }

      const fn = this.sourceFormChange();
      if (fn) {
        fn(this.sourceFormValue() || '');
      }
    });

    effect(() => {
      if (!this.hasHydratedConfig()) {
        return;
      }

      const value = this.formValue();
      const datasourceId = value.sourceForm ?? '';
      const datasourceLabel = this.datasourceOptions().find((option) => String(option.value) === datasourceId)?.label ?? '';
      const aggregateSelection = value.aggregateValue as ChartAggregateValueSelection;
      const aggregateValue = {
        tab: aggregateSelection?.tab ?? null,
        value: aggregateSelection?.tab && (value.yAxisField ?? '').trim() ? value.yAxisField ?? '' : null,
      } as ChartAggregateValueSelection;
      this.emitConfigIfChanged({
        ...this.config(),
        datasourceId,
        datasourceLabel,
        queryId: value.queryId ?? '',
        queryBinding: value.queryBinding ?? '',
        xAxisCategory: value.xAxisCategory ?? '',
        xAxisLabel: value.xAxisLabel ?? '',
        yAxisField: value.yAxisField ?? '',
        yAxisStackBy: value.yAxisStackBy ?? '',
        aggregateValue,
        yAxisLabel: value.yAxisLabel ?? '',
        interval: value.interval ?? '',
        filterDataBasedOn: value.filterDataBasedOn ?? [],
        showDataLabel: !!value.showDataLabel,
        showUnderlyingData: !!value.showUnderlyingData,
        chartColor: value.chartColor ?? '',
        chartColorSecondary: value.chartColorSecondary ?? '',
      });
    });
  }

  setValueType(type: 'aggregate' | 'actual'): void {
    this.emitConfigIfChanged({ ...this.config(), valueType: type });
  }

  setRecordScope(scope: 'all' | 'selected'): void {
    this.emitConfigIfChanged({ ...this.config(), recordScope: scope });
    this.selectedRecordsModalOpen.set(scope === 'selected');
  }

  updateSelectedRecordCriteriaRows(rows: SearchCriteriaRow[]): void {
    this.emitConfigIfChanged({ ...this.config(), selectedRecordCriteriaRows: rows });
  }

  closeSelectedRecordsModal(): void {
    this.selectedRecordsModalOpen.set(false);
  }

  doneSelectedRecordsModal(rows: SearchCriteriaRow[]): void {
    this.emitConfigIfChanged({ ...this.config(), selectedRecordCriteriaRows: rows });
    this.selectedRecordsModalOpen.set(false);
  }

  updateQueryBinding(value: string): void {
    const trimmedValue = value.trim();
    const isInlineJson =
      !!trimmedValue && (trimmedValue.startsWith('{') || trimmedValue.startsWith('['));
    const datasourceId = isInlineJson
      ? ''
      : this.extractDatasourceIdFromBinding(value) || this.currentDatasourceId();
    const queryId = isInlineJson ? '' : this.extractQueryIdFromBinding(value, datasourceId);

    this.form.patchValue(
      {
        sourceForm: datasourceId,
        queryBinding: value,
        queryId,
      },
      { emitEvent: true },
    );
  }

  updateSourceForm(value: unknown): void {
    this.form.controls.sourceForm.setValue(this.extractSelectValue(value));
  }

  updateXAxisCategory(value: unknown): void {
    this.form.controls.xAxisCategory.setValue(this.extractSelectValue(value));
  }

  updateXAxisLabel(value: unknown): void {
    this.form.controls.xAxisLabel.setValue(this.extractInputValue(value));
  }

  updateYAxisField(value: unknown): void {
    this.form.controls.yAxisField.setValue(this.extractSelectValue(value));
  }

  updateYAxisLabel(value: unknown): void {
    this.form.controls.yAxisLabel.setValue(this.extractInputValue(value));
  }

  updateInterval(value: unknown): void {
    this.form.controls.interval.setValue(this.extractInputValue(value));
  }

  updateAggregateTab(value: unknown): void {
    const nextTab = this.toChartAggregateTab(this.extractSelectValue(value));
    const nextValue = nextTab && this.form.controls.yAxisField.getRawValue().trim()
      ? this.form.controls.yAxisField.getRawValue().trim()
      : null;
    this.form.controls.aggregateValue.setValue({ tab: nextTab, value: nextValue });
  }

  private buildQueryBinding(datasourceId: string, queryId: string): string {
    if (!datasourceId || !queryId) {
      return '';
    }

    return `{{datasources.${datasourceId}.queries.${queryId}}}`;
  }

  private extractQueryIdFromBinding(binding: string, datasourceId: string): string {
    const allowedQueryIds = getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => option.value);
    const trimmed = binding.trim();
    const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    const path = exactExpression ? (exactExpression[1] ?? '').trim() : trimmed;

    if (!path) {
      return '';
    }

    const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\.([^.[]+)/);
    if (datasourceMatch && datasourceMatch[1] === datasourceId && allowedQueryIds.includes(datasourceMatch[2] ?? '')) {
      return datasourceMatch[2] ?? '';
    }

    const topLevelQueryId = path.split(/[.[\]]/, 1)[0] ?? '';
    return allowedQueryIds.includes(topLevelQueryId) ? topLevelQueryId : '';
  }

  private extractDatasourceIdFromBinding(binding: string): string {
    const trimmed = binding.trim();
    const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    const path = exactExpression ? (exactExpression[1] ?? '').trim() : trimmed;
    const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\./);
    if (datasourceMatch?.[1]) {
      return datasourceMatch[1];
    }

    const topLevelQueryId = path.split(/[.[\]]/, 1)[0] ?? '';
    if (!topLevelQueryId) {
      return '';
    }

    return getPageBuilderMockQueryOptions()
      .find((option) => option.value === topLevelQueryId)
      ?.datasourceId ?? '';
  }

  private resolveBindingRows(binding: string): Array<Record<string, unknown>> {
    const jsonRows = this.tryParseJsonRows(binding);
    if (jsonRows.length) {
      return jsonRows;
    }

    const trimmed = binding.trim();
    if (!trimmed) {
      return [];
    }

    const resolved = resolvePageBuilderExpression(trimmed);

    if (Array.isArray(resolved)) {
      return this.normalizeResolvedRows(resolved);
    }

    if (resolved && typeof resolved === 'object') {
      const candidate = resolved as Record<string, unknown>;
      if (Array.isArray(candidate['data'])) {
        return this.normalizeResolvedRows(candidate['data']);
      }

      return this.normalizeResolvedRows([candidate]);
    }

    return [];
  }

  private normalizeResolvedRows(rows: unknown[]): Array<Record<string, unknown>> {
    return rows.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
  }

  private tryParseJsonRows(binding: string): Array<Record<string, unknown>> {
    const trimmed = binding.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;

      if (Array.isArray(parsed)) {
        return this.normalizeResolvedRows(parsed);
      }

      if (parsed && typeof parsed === 'object') {
        const data = (parsed as Record<string, unknown>)['data'];
        if (Array.isArray(data)) {
          return this.normalizeResolvedRows(data);
        }

        return this.normalizeResolvedRows([parsed]);
      }
    } catch {
      return [];
    }

    return [];
  }

  private buildFieldOptionsFromRows(rows: Array<Record<string, unknown>>): SelectOption[] {
    const keys = Object.keys(rows[0] ?? {});
    return keys.map((key) => ({ value: key, label: key }));
  }

  private toChartAggregateTab(value: string): ChartAggregateTab | null {
    const normalized = value.trim();
    switch (normalized) {
      case 'sum':
      case 'avg':
      case 'min':
      case 'max':
      case 'count':
      case 'count-distinct':
        return normalized;
      default:
        return null;
    }
  }

  private extractSelectValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (value && typeof value === 'object' && 'value' in value) {
      const optionValue = (value as { value?: unknown }).value;
      return typeof optionValue === 'string' ? optionValue : '';
    }

    return '';
  }

  private extractInputValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private areStringArraysEqual(left: Array<string | number>, right: Array<string | number>): boolean {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((value, index) => String(value) === String(right[index] ?? ''));
  }

  private resolveStructuredBindingFieldState(
    binding: string,
  ): { fieldOptions: SelectOption[]; numericFieldKeys: string[] } | null {
    const trimmed = binding.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }

      const candidate = parsed as Record<string, unknown>;
      const labels = Array.isArray(candidate['labels'])
        ? candidate['labels'].map((value) => String(value ?? '').trim()).filter(Boolean)
        : [];
      const datasets = Array.isArray(candidate['datasets']) ? candidate['datasets'] : [];

      if (!labels.length || !datasets.length) {
        return null;
      }

      const fieldOptions: SelectOption[] = [];
      const seen = new Set<string>();
      const addOption = (value: string, label = value): void => {
        const normalizedValue = value.trim();
        if (!normalizedValue || seen.has(normalizedValue)) {
          return;
        }
        seen.add(normalizedValue);
        fieldOptions.push({ value: normalizedValue, label });
      };

      addOption(this.config().xAxisCategory || 'label', this.config().xAxisCategory || 'label');
      addOption('label', 'label');

      const numericFieldKeys: string[] = [];
      for (const dataset of datasets) {
        if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) {
          continue;
        }

        const record = dataset as Record<string, unknown>;
        const label = typeof record['label'] === 'string' ? record['label'].trim() : '';
        if (label) {
          addOption(label, label);
          numericFieldKeys.push(label);
        }
      }

      if (this.config().yAxisField) {
        addOption(this.config().yAxisField, this.config().yAxisField);
        if (!numericFieldKeys.includes(this.config().yAxisField)) {
          numericFieldKeys.push(this.config().yAxisField);
        }
      }

      return fieldOptions.length ? { fieldOptions, numericFieldKeys } : null;
    } catch {
      return null;
    }
  }

  private getNumericFieldKeysFromRows(rows: Array<Record<string, unknown>>): string[] {
    const numericKeys = new Set<string>();

    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'number') {
          numericKeys.add(key);
          continue;
        }

        if (typeof value === 'string') {
          const parsed = Number.parseFloat(value.replace(/,/g, '').trim());
          if (Number.isFinite(parsed)) {
            numericKeys.add(key);
          }
        }
      }
    }

    return [...numericKeys];
  }

  private emitConfigIfChanged(config: ChartWidgetConfig): void {
    const normalizedConfig = this.normalizeChartConfig(config);
    const nextSignature = JSON.stringify(normalizedConfig);
    const currentSignature = JSON.stringify(this.normalizeChartConfig(this.config()));

    if (nextSignature === currentSignature || nextSignature === this.lastEmittedConfigSignature()) {
      return;
    }

    this.lastEmittedConfigSignature.set(nextSignature);
    const fn = this.configChange();
    if (fn) {
      fn(normalizedConfig);
    }
  }

  private normalizeChartConfig(config: ChartWidgetConfig): ChartWidgetConfig {
    return {
      ...createDefaultChartWidgetConfig(),
      ...config,
      aggregateValue: {
        tab: config.aggregateValue?.tab ?? null,
        value: config.aggregateValue?.value ?? null,
      },
      filterDataBasedOn: [...(config.filterDataBasedOn ?? [])],
      selectedRecordCriteriaRows: (config.selectedRecordCriteriaRows ?? []).map((row) => ({ ...row })),
    };
  }
}
