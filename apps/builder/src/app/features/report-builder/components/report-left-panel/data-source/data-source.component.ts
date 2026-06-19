import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QoIconComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import { ReportBuilderSourceOption } from '@builder/features/report-builder/facades/report-builder.facade';


/**
 * Data Source sub-panel of the report builder's left panel. Lets the user pick
 * the report's source datasource/form and shows a summary of the active source.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-left-data-source',
  standalone: true,
  imports: [QoIconComponent, ReactiveFormsModule, QoSelectComponent],
  templateUrl: './data-source.component.html',
  styleUrl: './data-source.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportLeftDataSourceComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly sourceFormId = input<string>('');
  readonly sourceOptions = input<ReportBuilderSourceOption[]>([], { alias: 'sourceOptions' });
  readonly datasourceOptions = input<ReportBuilderSourceOption[]>([]);
  readonly formOptions = input<ReportBuilderSourceOption[]>([]);
  readonly sourceFormLabel = input<string>('');
  readonly datasourceLabel = input<string>('');
  readonly tableLabel = input<string>('');

  readonly sourceFormChange = output<string>();
  readonly queryRefChange = output<string>();

  readonly form = new FormGroup({
    datasourceId: new FormControl<string>('', { nonNullable: true }),
    formId: new FormControl<string>('', { nonNullable: true }),
  });

  /** Datasource picker options derived from the available datasources. */
  readonly datasourceSelectOptions = computed<SelectOption[]>(() =>
    (this.sourceOptions().length ? this.sourceOptions() : this.datasourceOptions()).map((source) => ({
      label: source.name,
      value: source.id,
    }))
  );

  /** Form picker options derived from the available forms. */
  readonly formSelectOptions = computed<SelectOption[]>(() =>
    this.formOptions().map((source) => ({
      label: source.id,
      value: source.id,
    }))
  );

  /** "datasource · table" summary label for the active source. */
  readonly sourceSummary = computed(() => `${this.datasourceLabel()} · ${this.tableLabel()}`);

  /** Syncs the datasource control with the incoming `sourceFormId` input. */
  ngOnChanges(): void {
    const currentValue = this.form.controls.datasourceId.value;
    const nextValue = this.sourceFormId();

    if (currentValue !== nextValue) {
      this.form.controls.datasourceId.setValue(nextValue, {
        emitEvent: false,
      });
    }
  }

  /** Emits the newly-selected datasource/form id. */
  onDatasourceSelectionChange(): void {
    this.sourceFormChange.emit(this.form.controls.datasourceId.value);
  }
}
