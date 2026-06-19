
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { UiTableWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/table/ui-table/ui-table-widget.component';

export interface TableShowcaseDragItem {
  label: string;
}

@Component({
  selector: 'app-table-showcase',
  standalone: true,
  imports: [UiTableWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-showcase.component.html',
  styleUrl: './table-showcase.component.scss',
})
export class TableShowcaseComponent {
  readonly previewDragStart = output<TableShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  startDrag(event: DragEvent): void {
    const payload: TableShowcaseDragItem = { label: 'Table' };
    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}

