
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonVariant, UiButtonComponent } from '@builder/features/page-builder/components/widget-showcase/button/ui-button/ui-button.component';

export interface ButtonShowcaseDragItem {
  label: string;
  variant: ButtonVariant;
  displayType?: 'button' | 'icon-button' | 'button-group';
  secondaryButtonText?: string;
}

interface ButtonShowcasePreset {
  readonly id: string;
  readonly label?: string;
  readonly buttonText: string;
  readonly variant: ButtonVariant;
  readonly highlighted?: boolean;
  readonly displayType?: 'button' | 'icon-button' | 'button-group';
  readonly secondaryButtonText?: string;
}

@Component({
  selector: 'app-button-showcase',
  standalone: true,
  imports: [UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-showcase.component.html',
  styleUrl: './button-showcase.component.scss',
})
export class ButtonShowcaseComponent {
  readonly previewDragStart = output<ButtonShowcaseDragItem>();
  readonly previewDragEnd = output<void>();

  readonly presets: ButtonShowcasePreset[] = [
    {
      id: 'campaign-primary-filled',
      label: 'Campaign performance',
      buttonText: 'View Breakdown',
      variant: 'primary-filled',
      highlighted: true,
    },
    {
      id: 'icon-button',
      label: 'Quick action',
      buttonText: 'Download',
      variant: 'primary-outline',
      displayType: 'icon-button',
    },
    {
      id: 'button-group',
      label: 'Button group',
      buttonText: 'Approve',
      secondaryButtonText: 'Reject',
      variant: 'primary-outline',
      displayType: 'button-group',
    },
  ];

  startDrag(
    event: DragEvent,
    label: string,
    variant: ButtonVariant,
    displayType: 'button' | 'icon-button' | 'button-group' = 'button',
    secondaryButtonText?: string,
  ): void {
    const payload = { label, variant, displayType, secondaryButtonText };
    this.previewDragStart.emit(payload);
    event.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  }

  endDrag(): void {
    this.previewDragEnd.emit();
  }
}
