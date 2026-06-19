
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { SNIPPET_WIDGET_PRESETS, SnippetVariant } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-widget.config';
import { UiSnippetCardComponent } from '@builder/features/page-builder/components/widget-showcase/snippet/ui-snippet/ui-snippet-card.component';

export interface SnippetShowcaseDragItem {
  variant: SnippetVariant;
  title: string;
}

@Component({
  selector: 'app-snippet-showcase',
  standalone: true,
  imports: [UiSnippetCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './snippet-showcase.component.html',
  styleUrl: './snippet-showcase.component.scss',
})
export class SnippetShowcaseComponent {
  readonly previewDragStart = output<SnippetShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly presets = SNIPPET_WIDGET_PRESETS;

  startDrag(event: DragEvent, preset: { variant: SnippetVariant; title: string }): void {
    const payload: SnippetShowcaseDragItem = {
      variant: preset.variant,
      title: preset.title,
    };

    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}
