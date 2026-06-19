
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TEXT_BLOCK_WIDGET_PRESETS, TextBlockVariant } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-widget.config';
import { UiTextBlockComponent } from '@builder/features/page-builder/components/widget-showcase/text-block/ui-text-block/ui-text-block.component';

export interface TextBlockShowcaseDragItem {
  variant: TextBlockVariant;
  label: string;
}

@Component({
  selector: 'app-text-block-showcase',
  standalone: true,
  imports: [UiTextBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-block-showcase.component.html',
  styleUrl: './text-block-showcase.component.scss',
})
export class TextBlockShowcaseComponent {
  readonly previewDragStart = output<TextBlockShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly presets = TEXT_BLOCK_WIDGET_PRESETS.filter((preset) => preset.variant !== 'labeltext');

  startDrag(event: DragEvent, preset: TextBlockShowcaseDragItem): void {
    this.previewDragStart.emit(preset);
    event.dataTransfer?.setData('text/plain', JSON.stringify(preset));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}
