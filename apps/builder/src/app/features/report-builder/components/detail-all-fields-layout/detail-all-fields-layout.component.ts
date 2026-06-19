import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { QoButtonComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';


/**
 * "All Fields" detail-layout editor: a single ordered, drag-reorderable list of
 * fields plus an add-field picker. Emits reorder/add/remove events upward.
 */
import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-detail-all-fields-layout',
  standalone: true,
  imports: [DragDropModule, QoButtonComponent, QoSelectComponent],
  templateUrl: './detail-all-fields-layout.component.html',
  styleUrl: './detail-all-fields-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailAllFieldsLayoutComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  readonly fieldIds = input<string[]>([]);
  readonly allColumns = input<ReportBuilderColumn[]>([]);
  readonly change = output<string[]>();
  readonly remove = output<string>();
  readonly add = output<string>();

  /** Columns not yet in the layout. */
  readonly addableFields = computed(() => this.allColumns().filter((c) => !this.fieldIds().includes(c.id)));
  /** Add-field picker options (addable columns). */
  readonly addableFieldOptions = computed<SelectOption[]>(() =>
    this.addableFields().map((option) => ({ label: option.label, value: option.id }))
  );

  /** Reorders fields after a drag/drop and emits the new order. */
  drop(event: CdkDragDrop<string[]>): void {
    const next = [...this.fieldIds()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.change.emit(next);
  }

  /** Emits an add-field request for the chosen field. */
  onAdd(fieldId: string): void {
    if (!fieldId) return;
    this.add.emit(fieldId);
  }

  /** Coerces an unknown select payload to a string. */
  asText(value: unknown): string {
    return String(value ?? '');
  }

  /** Human label for a field id (column label, else the raw id). */
  getFieldLabel(fieldId: string): string {
    return this.allColumns().find((c) => c.id === fieldId)?.label ?? fieldId;
  }
}
