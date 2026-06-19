import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { QoButtonComponent, QoIconComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


/**
 * Bulk-edit drawer. Lets the user pick visible fields to update in bulk.
 * Presentational only — emits `closeAll` and exposes the field options.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-bulk-edit-drawer',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent, QoSelectComponent],
  templateUrl: './bulk-edit-drawer.component.html',
  styleUrl: '../report-drawers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEditDrawerComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  /** Columns currently visible in the report — the fields eligible for bulk edit. */
  readonly visibleColumns = input<ReportBuilderColumn[]>([]);

  /** Request to close all drawers. */
  readonly closeAll = output<void>();

  /** Select options built from the visible columns. */
  readonly bulkEditOptions = computed<SelectOption[]>(() =>
    this.visibleColumns().map((column) => ({ value: column.id, label: column.label }))
  );
}
