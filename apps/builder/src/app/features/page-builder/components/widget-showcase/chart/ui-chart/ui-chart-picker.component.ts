
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { ChartThumbnailComponent } from '@builder/features/page-builder/components/widget-showcase/chart/chart-thumbnail.component';

export type ChartType =
  | 'line' | 'scatter' | 'area' | 'stacked-area' | 'web'
  | 'column' | 'stacked-column' | 'stacked-pct-column'
  | 'bar' | 'stacked-bar';

interface ChartTypeItem {
  readonly type: ChartType;
  readonly label: string;
}

interface ChartTypeGroup {
  readonly groupLabel: string;
  readonly items: readonly ChartTypeItem[];
}

export interface ChartPickerDragItem {
  type: ChartType;
  label: string;
}

@Component({
  selector: 'app-chart-picker',
  standalone: true,
  imports: [ChartThumbnailComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-chart-picker.component.html',
  styleUrl: './ui-chart-picker.component.scss',
})
export class UiChartPickerComponent {
  readonly initialType = input<ChartType>('line');
  readonly chartSelected = output<ChartType>();
  readonly previewDragStart = output<ChartPickerDragItem>();
  readonly previewDragEnd = output<void>();

  readonly selected = signal<ChartType>('line');

  readonly groups: readonly ChartTypeGroup[] = [
    { groupLabel: 'Line chart', items: [{ type: 'line', label: 'Line' }] },
    { groupLabel: 'Scatter chart', items: [{ type: 'scatter', label: 'Scatter' }] },
    { groupLabel: 'Area chart', items: [{ type: 'area', label: 'Area' }, { type: 'stacked-area', label: 'Stacked area' }] },
    { groupLabel: 'Web chart', items: [{ type: 'web', label: 'Web' }] },
    { groupLabel: 'Column chart', items: [{ type: 'column', label: 'Column' }, { type: 'stacked-column', label: 'Stacked column' }, { type: 'stacked-pct-column', label: 'Stacked percentage column' }] },
    { groupLabel: 'Bar chart', items: [{ type: 'bar', label: 'Bar' }, { type: 'stacked-bar', label: 'Stacked bar' }] },
  ];

  constructor() {
    effect(() => {
      this.selected.set(this.initialType());
    }, { allowSignalWrites: true });
  }

  select(type: ChartType): void {
    this.selected.set(type);
    this.chartSelected.emit(type);
  }

  startDrag(event: DragEvent, item: ChartTypeItem): void {
    const payload: ChartPickerDragItem = { type: item.type, label: item.label };
    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}
