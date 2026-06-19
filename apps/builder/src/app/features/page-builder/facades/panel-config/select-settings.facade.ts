import { computed, Injectable, signal } from '@angular/core';
import { getPageBuilderMockDatasourceOptions, getPageBuilderMockQueryOptions } from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import { getPageBuilderRuntimeRows } from '@builder/features/page-builder/services/page-builder-runtime-binding.service';
import {
  createDefaultSelectWidgetConfig,
  SelectWidgetConfig,
  SelectWidgetVariant,
  SelectWidgetOption,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import {
  buildSelectFieldOptions,
  buildSelectQueryBinding,
  extractSelectDatasourceIdFromBinding,
  extractSelectQueryIdFromBinding,
  resolveSelectField,
  tryParseSelectBindingRows,
} from '@builder/features/page-builder/components/widget-showcase/select/select-option-binding.util';
import { SelectOption } from '@qo/ui-components';

@Injectable()
export class SelectSettingsFacade {
  readonly config = signal<SelectWidgetConfig>(createDefaultSelectWidgetConfig());
  readonly configChange = signal<((c: SelectWidgetConfig) => void) | null>(null);

  readonly datasourceOptions = computed<SelectOption[]>(() => {
    return getPageBuilderMockDatasourceOptions();
  });

  readonly queryOptions = computed<SelectOption[]>(() =>
    getPageBuilderMockQueryOptions()
      .filter((option) => !this.currentDatasourceId() || option.datasourceId === this.currentDatasourceId())
      .map((option) => ({
        value: option.value,
        label: option.label,
      })),
  );

  readonly queryRootKeys = computed(() => this.queryOptions().map((option) => String(option.value)));
  readonly queryBindingRootKeys = computed(() => (this.currentDatasourceId() ? this.queryRootKeys() : []));
  readonly currentDatasourceId = computed(() => {
    const config = this.config();
    return extractSelectDatasourceIdFromBinding(config.queryBinding) || config.datasourceId || '';
  });
  readonly currentQueryId = computed(() => {
    const datasourceId = this.currentDatasourceId();
    return (
      this.config().queryId ||
      extractSelectQueryIdFromBinding(
        this.config().queryBinding,
        datasourceId,
        getPageBuilderMockQueryOptions()
          .filter((option) => option.datasourceId === datasourceId)
          .map((option) => option.value),
      )
    );
  });
  readonly currentQueryBinding = computed(() => {
    const config = this.config();
    return config.queryBinding || buildSelectQueryBinding(config.datasourceId, config.queryId);
  });

  readonly bindingRows = computed(() => {
    const binding = this.currentQueryBinding().trim();
    const jsonRows = tryParseSelectBindingRows(binding);
    if (jsonRows.length) {
      return jsonRows;
    }

    const datasourceId = this.currentDatasourceId();
    const queryId = this.currentQueryId();
    if (!datasourceId) {
      return [];
    }

    return getPageBuilderRuntimeRows(datasourceId, queryId).map((row) => ({ ...row }));
  });

  readonly fieldOptions = computed<SelectOption[]>(() =>
    buildSelectFieldOptions(this.bindingRows()).map((field) => ({
      value: field.value,
      label: field.label,
    })),
  );

  readonly hasBindingConfig = computed(
    () => !!this.config().queryBinding.trim() || !!this.config().datasourceId.trim() || !!this.config().queryId.trim(),
  );

  readonly availableValueOptions = computed<SelectOption[]>(() => {
    if (this.hasBindingConfig()) {
      const rows = this.resolveRowsForConfig(
        this.config().datasourceId,
        this.config().queryId,
        this.config().queryBinding,
      );
      const labelField = resolveSelectField(rows, this.config().labelField, ['label', 'name', 'title', 'text', 'value', 'id']);
      const valueField = resolveSelectField(rows, this.config().valueField, ['value', 'id', 'key', 'name', labelField]);

      return rows.map((row, index) => {
        const rawValue = row[valueField];
        const rawLabel = row[labelField];
        const value = rawValue === null || rawValue === undefined ? '' : String(rawValue);
        const label = typeof rawLabel === 'string' && rawLabel.trim() ? rawLabel : value || `Option ${index + 1}`;

        return {
          value,
          label,
        };
      });
    }

    return this.config().options.map((option) => ({
      value: option.value,
      label: option.label,
    }));
  });

  updateFieldLabel(value: string): void {
    this.patchConfig({ label: value });
  }

  updatePlaceholder(value: string): void {
    this.patchConfig({ placeholder: value });
  }

  updateVariant(value: string | number): void {
    const variant = String(value ?? 'select') as SelectWidgetVariant;

    this.patchConfig({
      variant,
      multiSelect: variant === 'multiselect',
      allowSearch: variant === 'radio' ? false : this.config().allowSearch,
      defaultValue: variant === 'multiselect' ? null : this.config().defaultValue,
    });
  }

  updateDatasource(value: string | number): void {
    const datasourceId = String(value ?? '');
    this.patchConfig({
      datasourceId,
      queryId: '',
      queryBinding: '',
      labelField: '',
      valueField: '',
    });
  }

  updateQueryBinding(value: string): void {
    const datasourceId = extractSelectDatasourceIdFromBinding(value) || this.currentDatasourceId() || this.config().datasourceId;
    const queryId = extractSelectQueryIdFromBinding(
      value,
      datasourceId,
      getPageBuilderMockQueryOptions()
        .filter((option) => option.datasourceId === datasourceId)
        .map((option) => option.value),
    );

    const rows = this.resolveRowsForConfig(datasourceId, queryId, value);
    const nextLabelField = resolveSelectField(rows, this.config().labelField, ['label', 'name', 'title', 'text', 'value', 'id']);
    const nextValueField = resolveSelectField(rows, this.config().valueField, ['value', 'id', 'key', 'name', nextLabelField]);

    this.patchConfig({
      datasourceId,
      queryId,
      queryBinding: value,
      labelField: rows.length ? nextLabelField : this.config().labelField,
      valueField: rows.length ? nextValueField : this.config().valueField,
    });
  }

  updateLabelField(value: string | number): void {
    this.patchConfig({ labelField: String(value ?? '') });
  }

  updateValueField(value: string | number): void {
    this.patchConfig({ valueField: String(value ?? '') });
  }

  toggleVisible(): void {
    this.patchConfig({ visible: !this.config().visible });
  }

  toggleAllowSearch(): void {
    if (this.config().variant === 'radio') {
      return;
    }

    this.patchConfig({ allowSearch: !this.config().allowSearch });
  }

  updateDefaultValue(value: string | number): void {
    const normalizedValue = String(value ?? '').trim();
    this.patchConfig({ defaultValue: normalizedValue || null });
  }

  addStaticOption(): void {
    const nextIndex = this.config().options.length + 1;
    const label = `Option ${nextIndex}`;
    const option: SelectWidgetOption = {
      id: this.createOptionId(),
      label,
      value: `option_${nextIndex}`,
    };

    this.patchConfig({
      options: [...this.config().options, option],
    });
  }

  updateOptionLabel(optionId: string, label: string): void {
    const nextOptions = this.config().options.map((option) =>
      option.id === optionId
        ? {
            ...option,
            label,
            value: label.trim() ? label.toLowerCase().replace(/\s+/g, '_') : option.value,
          }
        : option,
    );

    this.patchConfig({ options: nextOptions });
  }

  deleteOption(optionId: string): void {
    if (this.config().options.length <= 1) {
      return;
    }

    this.patchConfig({
      options: this.config().options.filter((option) => option.id !== optionId),
    });
  }

  private patchConfig(partial: Partial<SelectWidgetConfig>): void {
    const nextConfig: SelectWidgetConfig = {
      ...createDefaultSelectWidgetConfig(),
      ...(this.config() ?? {}),
      ...partial,
      options: (partial.options ?? this.config().options ?? createDefaultSelectWidgetConfig().options).map((option) => ({
        ...option,
      })),
    };

    if (nextConfig.variant === 'multiselect') {
      nextConfig.multiSelect = true;
      nextConfig.defaultValue = null;
    } else {
      nextConfig.multiSelect = false;
    }

    if (nextConfig.variant === 'radio') {
      nextConfig.allowSearch = false;
    }

    this.config.set(nextConfig);
    const fn = this.configChange();
    if (fn) {
      fn(nextConfig);
    }
  }

  private resolveRowsForConfig(datasourceId: string, queryId: string, queryBinding: string): Array<Record<string, unknown>> {
    const jsonRows = tryParseSelectBindingRows(queryBinding);
    if (jsonRows.length) {
      return jsonRows;
    }

    if (!datasourceId) {
      return [];
    }

    return getPageBuilderRuntimeRows(datasourceId, queryId).map((row) => ({ ...row }));
  }

  private createOptionId(): string {
    return `opt-${Math.random().toString(36).slice(2, 10)}`;
  }
}
