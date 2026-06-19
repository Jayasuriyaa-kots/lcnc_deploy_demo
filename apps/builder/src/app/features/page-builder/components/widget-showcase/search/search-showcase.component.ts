
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { SearchVariant, UiSearchComponent } from '@builder/features/page-builder/components/widget-showcase/search/ui-search/ui-search.component';

export interface SearchShowcaseDragItem {
  variant: SearchVariant;
  label: string;
}

interface SearchShowcasePreset {
  readonly id: string;
  readonly variant: SearchVariant;
  readonly highlighted?: boolean;
}

@Component({
  selector: 'app-search-showcase',
  standalone: true,
  imports: [UiSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-showcase.component.html',
  styleUrl: './search-showcase.component.scss',
})
export class SearchShowcaseComponent {
  readonly previewDragStart = output<SearchShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly presets: SearchShowcasePreset[] = [
    { id: 'icon-only', variant: 'icon-only' },
    { id: 'inline-button', variant: 'inline-button' },
    { id: 'inline-button-lg', variant: 'inline-button-lg' },
    { id: 'stacked-rounded', variant: 'stacked-rounded', highlighted: true },
  ];

  startDrag(event: DragEvent, variant: SearchVariant): void {
    const payload: SearchShowcaseDragItem = { variant, label: 'Search' };
    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}
