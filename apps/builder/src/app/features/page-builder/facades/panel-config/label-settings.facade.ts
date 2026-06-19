import { computed, effect, Injectable, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  getPageBuilderMockDatasourceOptions,
  getPageBuilderMockQueryOptions,
  getPageBuilderMockQueryRows,
} from '@builder/features/page-builder/services/page-builder-mock-datasource.service';
import {
  createDefaultTextBlockWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { SelectOption } from '@qo/ui-components';

@Injectable()
export class LabelSettingsFacade {
  private readonly fb: FormBuilder;

  readonly config = signal<TextBlockWidgetConfig>(createDefaultTextBlockWidgetConfig('labeltext'));
  readonly configChange = signal<((c: TextBlockWidgetConfig) => void) | null>(null);

  readonly form;

  readonly rootKeys = computed<string[]>(() => {
    if (this.form.controls.contentSource.getRawValue() !== 'datasource') {
      return [];
    }

    const datasourceId = this.form.controls.datasourceId.getRawValue().trim();
    if (!datasourceId) {
      return this.datasourceOptions().map((option) => String(option.value)).filter(Boolean);
    }

    const queryOptions = getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => option.value);

    if (queryOptions.length) {
      return queryOptions;
    }

    return [datasourceId];
  });

  constructor(formBuilder: FormBuilder) {
    this.fb = formBuilder;
    this.form = this.fb.nonNullable.group({
      contentSource: 'static' as TextBlockWidgetConfig['contentSource'],
      text: '',
      defaultValue: '',
      datasourceId: '',
      queryId: '',
      recordId: '',
      field: '',
      overflowText: 'none' as TextBlockWidgetConfig['overflowText'],
      visible: true,
      disableLinks: false,
    });

    effect(() => {
      const nextConfig = {
        ...createDefaultTextBlockWidgetConfig('labeltext'),
        ...(this.config() ?? {}),
      };
      const nextText = nextConfig.text || nextConfig.defaultValue;
      const derivedContentSource = this.resolveInitialContentSource(nextConfig, nextText);
      const derivedDatasourceId =
        nextConfig.datasourceId || (derivedContentSource === 'datasource' ? this.extractBindingRootKey(nextText) : '');

      this.form.setValue(
        {
          contentSource: derivedContentSource,
          text: nextText,
          defaultValue: nextConfig.defaultValue,
          datasourceId: derivedDatasourceId,
          queryId: nextConfig.queryId,
          recordId: nextConfig.recordId,
          field: nextConfig.field,
          overflowText: nextConfig.overflowText,
          visible: nextConfig.visible,
          disableLinks: nextConfig.disableLinks,
        },
        { emitEvent: false },
      );
    });
  }

  datasourceOptions(): SelectOption[] {
    const all = getPageBuilderMockDatasourceOptions();
    const selectedId = this.form.controls.datasourceId.getRawValue().trim();

    if (!selectedId || all.some((option) => String(option.value) === selectedId)) {
      return all;
    }

    return [{ value: selectedId, label: this.toLabel(selectedId) }, ...all];
  }

  recordOptions(): SelectOption[] {
    const rows = this.getActiveRows();
    if (!rows.length) {
      return [];
    }

    return rows.map((row, index) => ({
      value: String(row.id ?? index),
      label: this.getRowLabel(row, index),
    }));
  }

  fieldOptions(): SelectOption[] {
    const rows = this.getActiveRows();
    const firstRow = rows[0];

    if (!firstRow) {
      return [];
    }

    return Object.keys(firstRow)
      .filter((key) => rows.some((row) => typeof row[key] === 'string' || typeof row[key] === 'number'))
      .map((key) => ({
        value: key,
        label: this.toLabel(key),
      }));
  }

  queryOptions(): SelectOption[] {
    const datasourceId = this.form.controls.datasourceId.getRawValue();
    if (!datasourceId) {
      return [];
    }

    return this.queryOptionsForDatasource(datasourceId);
  }

  updateText(value: string): void {
    this.form.controls.text.setValue(value, { emitEvent: false });
    this.form.controls.defaultValue.setValue(value, { emitEvent: false });
    this.emitConfig({ text: value, defaultValue: value });
  }

  updateContentSource(value: string | number): void {
    const contentSource = String(value) as TextBlockWidgetConfig['contentSource'];

    if (contentSource === 'static') {
      const staticText = this.form.controls.defaultValue.getRawValue() || this.form.controls.text.getRawValue();
      this.form.controls.contentSource.setValue(contentSource, { emitEvent: false });
      this.emitConfig({
        contentSource,
        text: staticText,
      });
      return;
    }

    const datasourceId = this.resolveDatasourceId();
    const queryId = this.resolveQueryId(datasourceId);
    const recordId = this.resolveRecordId(datasourceId, queryId);
    const field = this.resolveField(datasourceId, queryId);
    const expression = this.createDatasourceExpression(datasourceId, queryId, recordId, field);

    this.form.patchValue(
      {
        contentSource,
        datasourceId,
        queryId,
        recordId,
        field,
      },
      { emitEvent: false },
    );

    this.emitConfig({
      contentSource,
      datasourceId,
      queryId,
      recordId,
      field,
      text: expression,
    });
  }

  updateDatasource(value: string | number): void {
    const datasourceId = String(value);
    const queryId = this.resolveQueryId(datasourceId);
    const recordId = this.resolveRecordId(datasourceId, queryId);
    const field = this.resolveField(datasourceId, queryId);

    this.form.patchValue(
      {
        datasourceId,
        queryId,
        recordId,
        field,
      },
      { emitEvent: false },
    );

    this.emitDatasourceConfig(datasourceId, queryId, recordId, field);
  }

  updateQuery(value: string | number): void {
    const queryId = String(value);
    const datasourceId = this.form.controls.datasourceId.getRawValue();
    const recordId = this.resolveRecordId(datasourceId, queryId);
    const field = this.resolveField(datasourceId, queryId);

    this.form.patchValue(
      {
        queryId,
        recordId,
        field,
      },
      { emitEvent: false },
    );

    this.emitDatasourceConfig(datasourceId, queryId, recordId, field);
  }

  updateRecordId(value: string | number): void {
    const recordId = String(value);
    this.form.controls.recordId.setValue(recordId, { emitEvent: false });
    this.emitDatasourceConfig(
      this.form.controls.datasourceId.getRawValue(),
      this.form.controls.queryId.getRawValue(),
      recordId,
      this.form.controls.field.getRawValue(),
    );
  }

  updateField(value: string | number): void {
    const field = String(value);
    this.form.controls.field.setValue(field, { emitEvent: false });
    this.emitDatasourceConfig(
      this.form.controls.datasourceId.getRawValue(),
      this.form.controls.queryId.getRawValue(),
      this.form.controls.recordId.getRawValue(),
      field,
    );
  }

  updateOverflowText(value: TextBlockWidgetConfig['overflowText']): void {
    this.form.controls.overflowText.setValue(value, { emitEvent: false });
    this.emitConfig({ overflowText: value });
  }

  updateBooleanField(field: 'visible' | 'disableLinks', value: boolean): void {
    this.form.controls[field].setValue(value, { emitEvent: false });
    this.emitConfig({ [field]: value } as Partial<TextBlockWidgetConfig>);
  }

  private emitConfig(partial: Partial<TextBlockWidgetConfig>): void {
    const nextConfig: TextBlockWidgetConfig = {
      ...createDefaultTextBlockWidgetConfig('labeltext'),
      ...(this.config() ?? {}),
      inputType: 'labeltext' as TextBlockWidgetConfig['inputType'],
      allowTypeSelection: false,
      ...partial,
    };
    this.config.set(nextConfig);
    const fn = this.configChange();
    if (fn) {
      fn(nextConfig);
    }
  }

  private emitDatasourceConfig(datasourceId: string, queryId: string, recordId: string, field: string): void {
    this.emitConfig({
      contentSource: 'datasource',
      datasourceId,
      queryId,
      recordId,
      field,
      text: this.createDatasourceExpression(datasourceId, queryId, recordId, field),
    });
  }

  private resolveDatasourceId(): string {
    return this.form.controls.datasourceId.getRawValue() || String(this.datasourceOptions()[0]?.value ?? '');
  }

  private resolveQueryId(datasourceId: string): string {
    const currentQueryId = this.form.controls.queryId.getRawValue();
    const queryOptions = this.queryOptionsForDatasource(datasourceId);

    if (currentQueryId && queryOptions.some((option) => String(option.value) === currentQueryId)) {
      return currentQueryId;
    }

    return String(queryOptions[0]?.value ?? '');
  }

  private resolveRecordId(datasourceId: string, queryId: string): string {
    const currentRecordId = this.form.controls.recordId.getRawValue();
    const rows = this.getRowsForBinding(datasourceId, queryId);

    if (currentRecordId && rows.some((row) => String(row.id) === currentRecordId)) {
      return currentRecordId;
    }

    return rows[0] ? String(rows[0].id) : '';
  }

  private resolveField(datasourceId: string, queryId: string): string {
    const currentField = this.form.controls.field.getRawValue();
    const textFields = this.getFieldOptionsForBinding(datasourceId, queryId);

    if (currentField && textFields.some((option) => option.value === currentField)) {
      return currentField;
    }

    return textFields[0]?.value ?? '';
  }

  private createDatasourceExpression(datasourceId: string, queryId: string, recordId: string, field: string): string {
    if (!datasourceId || !queryId || !field) {
      return '';
    }

    const rows = this.getRowsForBinding(datasourceId, queryId);
    const recordIndex = Math.max(
      rows.findIndex((row) => String(row.id) === recordId),
      0,
    );

    return `{{datasources.${datasourceId}.queries.${queryId}.data[${recordIndex}]${this.toPathAccessor(field)}}}`;
  }

  private getActiveRows(): Array<Record<string, unknown>> {
    const datasourceId = this.form.controls.datasourceId.getRawValue();
    const queryId = this.form.controls.queryId.getRawValue();

    if (!datasourceId || !queryId) {
      return [];
    }

    return this.getRowsForBinding(datasourceId, queryId);
  }

  private getRowsForBinding(datasourceId: string, queryId: string): Array<Record<string, unknown>> {
    const query = getPageBuilderMockQueryOptions()
      .find((option) => option.datasourceId === datasourceId && option.value === queryId);

    if (!query) {
      return [];
    }

    return getPageBuilderMockQueryRows(queryId);
  }

  private getFieldOptionsForBinding(
    datasourceId: string,
    queryId: string,
  ): Array<{ value: string; label: string }> {
    const rows = this.getRowsForBinding(datasourceId, queryId);
    const firstRow = rows[0];

    if (!firstRow) {
      return [];
    }

    return Object.keys(firstRow)
      .filter((key) => rows.some((row) => typeof row[key] === 'string' || typeof row[key] === 'number'))
      .map((key) => ({
        value: key,
        label: this.toLabel(key),
      }));
  }

  private queryOptionsForDatasource(datasourceId: string): SelectOption[] {
    return getPageBuilderMockQueryOptions()
      .filter((option) => option.datasourceId === datasourceId)
      .map((option) => ({
        value: option.value,
        label: option.label,
      }));
  }

  private resolveInitialContentSource(config: TextBlockWidgetConfig, text: string): TextBlockWidgetConfig['contentSource'] {
    if (config.contentSource === 'datasource') {
      return 'datasource';
    }

    return this.extractBindingRootKey(text) ? 'datasource' : 'static';
  }

  private extractBindingRootKey(value: string): string {
    const path = this.extractBindingPath(value);
    if (!path) {
      return '';
    }

    const datasourceMatch = path.match(/^datasources\.([^.]+)\.queries\./);
    if (datasourceMatch?.[1]) {
      return datasourceMatch[1];
    }

    return path.split(/[.[\]]/, 1)[0] ?? '';
  }

  private extractBindingPath(value: string): string {
    const trimmed = value.trim();
    const exactExpression = trimmed.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    return exactExpression ? (exactExpression[1] ?? '').trim() : '';
  }

  private toLabel(value: string): string {
    return value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private toPathAccessor(field: string): string {
    return /^[A-Za-z_$][\w$]*$/.test(field) ? `.${field}` : `[${JSON.stringify(field)}]`;
  }

  private getRowLabel(row: Record<string, unknown>, index: number): string {
    const title =
      (typeof row['display_name'] === 'string' && row['display_name']) ||
      (typeof row['name'] === 'string' && row['name']) ||
      (typeof row['title'] === 'string' && row['title']) ||
      (typeof row['short_label'] === 'string' && row['short_label']) ||
      '';

    if (index === 0 && title) {
      return `First Record - ${title}`;
    }

    if (index === 0) {
      return 'First Record';
    }

    return title ? `${row['id']} - ${title}` : String(row['id'] ?? `Record ${index + 1}`);
  }
}
