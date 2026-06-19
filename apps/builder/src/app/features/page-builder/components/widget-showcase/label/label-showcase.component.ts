import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { UiTextBlockComponent } from '@builder/features/page-builder/components/widget-showcase/text-block/ui-text-block/ui-text-block.component';
import { TextBlockShowcaseDragItem } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-showcase.component';

@Component({
  selector: 'app-label-showcase',
  standalone: true,
  imports: [UiTextBlockComponent],
  templateUrl: './label-showcase.component.html',
  styleUrl: './label-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelShowcaseComponent {
  readonly previewDragStart = output<TextBlockShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly preset: TextBlockShowcaseDragItem = {
    variant: 'labeltext',
    label: 'Label',
  };
  readonly previewConfig = {
    text: 'Sample text content',
    defaultValue: 'Sample text content',
    backgroundColor: 'transparent',
    labelColor: 'var(--qo-color-neutral-800)',
  };

  startDrag(event: DragEvent): void {
    this.previewDragStart.emit(this.preset);
    event.dataTransfer?.setData('text/plain', JSON.stringify(this.preset));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}
