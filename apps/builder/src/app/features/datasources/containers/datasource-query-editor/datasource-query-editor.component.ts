import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { QoBadgeComponent, QoButtonComponent, QoCheckboxComponent, QoFormFieldComponent, QoInputComponent, QoModalComponent, QoSelectComponent, QoTableColumnDirective, QoTableComponent, QoTextareaComponent } from '@qo/ui-components';
import { DatasourceFieldType, DatasourceQueryResultTab } from '@builder/features/datasources/models/datasource-dashboard.model';
import { DatasourcesFacadeService } from '@builder/features/datasources/services/datasources-facade.service';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

@Component({
  selector: 'app-datasource-query-editor',
  standalone: true,
  imports: [ReactiveFormsModule, QoBadgeComponent, QoButtonComponent, QoCheckboxComponent, QoFormFieldComponent, QoInputComponent, QoModalComponent, QoSelectComponent, QoTableColumnDirective, QoTableComponent, QoTextareaComponent],
  templateUrl: './datasource-query-editor.component.html',
  styleUrl: './datasource-query-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourceQueryEditorComponent {
  readonly facade = inject(DatasourcesFacadeService);
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly schemaFields = computed(() => this.facade.schemaFields.controls);
  readonly schemaSource = computed(() => this.facade.schemaSource());
  readonly detailState = computed(() => this.facade.detailState());
  readonly detailReference = computed(() => this.facade.detailReference());
  readonly resultColumns = computed(() => this.facade.currentResultColumns());
  readonly resultRows = computed(() => this.facade.currentResultRows());
  readonly saveQueryError = computed(() =>
    this.facade.saveQueryForm.controls.name.touched && this.facade.saveQueryForm.controls.name.invalid
      ? this.i18n.translate('saveQueryModal.queryNameRequired')
      : ''
  );

  readonly resultTabs = [
    { id: 'Results', labelKey: 'editor.tabResults' },
    { id: 'Response', labelKey: 'editor.tabResponse' },
    { id: 'Logs', labelKey: 'editor.tabLogs' },
    { id: 'Metadata', labelKey: 'editor.tabMetadata' },
  ] as const;

  schemaTrack(index: number): string { return this.facade.schemaFields.at(index)?.controls.id.value ?? `${index}`; }
  columnHeader(column: string): string { return column.replaceAll('_', ' '); }
  columnValue(row: Record<string, unknown>, column: string): string | number {
    const value = row[column];
    return typeof value === 'string' || typeof value === 'number' ? value : '-';
  }
  onFieldSelected(index: number, selected: boolean): void { this.facade.setSchemaFieldSelected(index, selected); }
  onFieldTypeSelected(index: number, value: unknown): void {
    const fieldGroup = this.facade.schemaFields.at(index);
    if (fieldGroup) fieldGroup.controls.suggestedFieldType.setValue((value as DatasourceFieldType) ?? 'Text');
  }
  onEditorDatasourceChange(value: unknown): void { this.facade.changeEditorDatasource(String(value ?? '')); }
  onResultTabChange(title: string): void { this.facade.setResultTab(title as DatasourceQueryResultTab); }
  openDetailInEditor(): void {
    const state = this.detailState();
    if (!state) return;
    const { source, query } = state;
    this.facade.closeDetail();
    queueMicrotask(() => this.facade.openEditor(source.id, query.id));
  }
}
