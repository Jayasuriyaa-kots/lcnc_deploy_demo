import { ChangeDetectionStrategy, Component, effect, input, output, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { QoFormFieldComponent, QoSelectComponent, QoToggleComponent, SelectOption } from '@qo/ui-components';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';


type GroupOrder = 'none' | 'asc' | 'desc';

/**
 * Grouping sub-panel of the report builder's left panel. Lets the user choose a
 * group-by field, its ordering, and whether to show per-group record counts.
 */
import { ReportBuilderI18nService } from '../../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-left-grouping',
  standalone: true,
  imports: [QoFormFieldComponent, ReactiveFormsModule, QoSelectComponent, QoToggleComponent],
  templateUrl: './grouping.component.html',
  styleUrl: './grouping.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportLeftGroupingComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly groupBy = input<string>('');
  readonly groupOrder = input<GroupOrder>('none');
  readonly showRecordCount = input<boolean>(true);

  readonly groupByChange = output<string>();
  readonly groupOrderChange = output<GroupOrder>();
  readonly showRecordCountChange = output<boolean>();

  readonly form = new FormGroup({
    groupBy: new FormControl<string>('', { nonNullable: true }),
    groupOrder: new FormControl<GroupOrder>('none', { nonNullable: true }),
    showRecordCount: new FormControl<boolean>(true, { nonNullable: true }),
  });
  readonly groupOrderOptions: SelectOption[] = [
    { label: this.i18n.t('options.none'), value: 'none' },
    { label: this.i18n.t('options.ascending'), value: 'asc' },
    { label: this.i18n.t('options.descending'), value: 'desc' },
  ];

  constructor() {
    // Mirror the grouping inputs into the form without re-emitting.
    effect(
      () => {
        this.form.patchValue(
          {
            groupBy: this.groupBy(),
            groupOrder: this.groupOrder(),
            showRecordCount: this.showRecordCount(),
          },
          { emitEvent: false }
        );
      },
      { allowSignalWrites: true }
    );
  }

  /** Emits the chosen group-by field. */
  emitGroupByChange(): void {
    this.groupByChange.emit(this.form.controls.groupBy.value);
  }

  /** Emits the chosen group ordering. */
  emitGroupOrderChange(): void {
    this.groupOrderChange.emit(this.form.controls.groupOrder.value);
  }

  /** Emits the show-record-count toggle value. */
  emitShowRecordCountChange(): void {
    this.showRecordCountChange.emit(this.form.controls.showRecordCount.value);
  }

  /** Group-by select options ("None" plus every column). */
  getGroupByOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('options.none'), value: '' },
      ...this.allColumns().map((column) => ({
        label: column.label,
        value: column.id,
      })),
    ];
  }
}
