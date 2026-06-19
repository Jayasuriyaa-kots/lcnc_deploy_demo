import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
  createDefaultMediaWidgetConfig,
  MediaWidgetConfig,
  MediaWidgetType,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { UiMediaWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/media/ui-media/ui-media-widget.component';

export interface MediaShowcaseDragItem {
  label: string;
  mediaConfig: MediaWidgetConfig;
}

@Component({
  selector: 'app-media-showcase',
  standalone: true,
  imports: [UiMediaWidgetComponent],
  templateUrl: './media-showcase.component.html',
  styleUrl: './media-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaShowcaseComponent {
  readonly previewDragStart = output<MediaShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly items: MediaShowcaseDragItem[] = [
    this.createItem('Image', 'image'),
    this.createItem('Video', 'video'),
    this.createItem('PDF', 'pdf'),
  ];

  startDrag(event: DragEvent, item: MediaShowcaseDragItem): void {
    this.previewDragStart.emit({
      label: item.label,
      mediaConfig: { ...item.mediaConfig },
    });
    event.dataTransfer?.setData('text/plain', JSON.stringify(item));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }

  private createItem(label: string, mediaType: MediaWidgetType): MediaShowcaseDragItem {
    return {
      label,
      mediaConfig: createDefaultMediaWidgetConfig(mediaType),
    };
  }
}
