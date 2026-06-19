
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
  BOARD_WIDGET_PRESETS,
  BoardWidgetVariant,
} from '@builder/features/page-builder/components/widget-showcase/board/board-widget.config';
import { UiBoardWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/board/ui-board/ui-board-widget.component';

export interface BoardShowcaseDragItem {
  boardVariant: BoardWidgetVariant;
  label: string;
}

@Component({
  selector: 'app-board-showcase',
  standalone: true,
  imports: [UiBoardWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './board-showcase.component.html',
  styleUrl: './board-showcase.component.scss',
})
export class BoardShowcaseComponent {
  readonly previewDragStart = output<BoardShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly presets = BOARD_WIDGET_PRESETS;

  startDrag(event: DragEvent, boardVariant: BoardWidgetVariant, label: string): void {
    const payload: BoardShowcaseDragItem = { boardVariant, label };
    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}

