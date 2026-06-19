
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { createDefaultSelectWidgetConfig, SelectWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { UiSelectWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/select/ui-select/ui-select-widget.component';

export interface SelectShowcaseDragItem {
  label: string;
  selectConfig: SelectWidgetConfig;
}

@Component({
  selector: 'app-select-showcase',
  standalone: true,
  imports: [UiSelectWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-showcase.component.html',
  styleUrl: './select-showcase.component.scss',
})
export class SelectShowcaseComponent {
  readonly previewDragStart = output<SelectShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly items: SelectShowcaseDragItem[] = [
    {
      label: 'Select',
      selectConfig: {
        ...createDefaultSelectWidgetConfig(),
      },
    },
    {
      label: 'Multi Select',
      selectConfig: {
        ...createDefaultSelectWidgetConfig(),
        variant: 'multiselect',
        placeholder: 'Choose options...',
      },
    },
    {
      label: 'Radio',
      selectConfig: {
        ...createDefaultSelectWidgetConfig(),
        variant: 'radio',
        label: 'Select an option',
        placeholder: 'Choose one...',
      },
    },
  ];

  startDrag(event: DragEvent, item: SelectShowcaseDragItem): void {
    const payload: SelectShowcaseDragItem = {
      label: item.label,
      selectConfig: {
        ...item.selectConfig,
        options: item.selectConfig.options.map((option) => ({ ...option })),
      },
    };
    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}


