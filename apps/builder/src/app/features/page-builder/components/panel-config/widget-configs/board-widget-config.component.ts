import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PanelDisplaySettingsComponent } from '@builder/features/page-builder/components/panel-config/report/panel-display-settings';
import { CanvasWidget } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelDisplaySettingsState, PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { QoColorPickerComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';

@Component({
  selector: 'app-board-widget-config',
  standalone: true,
  imports: [
    CommonModule,
    PanelDisplaySettingsComponent,
    QoColorPickerComponent,
    QoInputComponent,
    QoSelectComponent,
  ],
  templateUrl: './board-widget-config.component.html',
  styleUrl: './board-widget-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardWidgetConfigComponent {
  readonly activeTab = input<PanelRightTab>('display');
  readonly selectedWidget = input<CanvasWidget | null>(null);
  readonly displaySettingsState = input.required<PanelDisplaySettingsState>();
  readonly selectedBoardFormName = input<string>('');
  readonly colorPickerPalette = input<readonly string[]>([]);
  readonly boardLayoutOptions = input<SelectOption[]>([]);
  readonly boardImageSourceOptions = input<SelectOption[]>([]);

  readonly boardWidgetChanged = output<Partial<CanvasWidget>>();
  readonly displaySettingsStateChange = output<Partial<PanelDisplaySettingsState>>();
  readonly boardFormChanged = output<string>();

  boardBackgroundColor(): string {
    return this.selectedWidget()?.boardBackgroundColor ?? 'var(--qo-color-neutral-0)';
  }

  boardLayoutType(): 'list' | 'grid' {
    return this.selectedWidget()?.boardLayoutType ?? 'list';
  }

  boardPanelsPerRow(): number {
    return this.selectedWidget()?.boardPanelsPerRow ?? 1;
  }

  boardImageSource(): 'my-library' | 'web-link' | 'none' {
    return this.selectedWidget()?.boardImageSource ?? 'none';
  }

  boardPaddingTop(): number {
    return this.selectedWidget()?.boardPaddingTop ?? 0;
  }

  boardPaddingRight(): number {
    return this.selectedWidget()?.boardPaddingRight ?? 0;
  }

  boardPaddingBottom(): number {
    return this.selectedWidget()?.boardPaddingBottom ?? 0;
  }

  boardPaddingLeft(): number {
    return this.selectedWidget()?.boardPaddingLeft ?? 0;
  }

  onBoardBackgroundColorChanged(value: string | null): void {
    this.boardWidgetChanged.emit({ boardBackgroundColor: value || 'var(--qo-color-neutral-0)' });
  }

  onBoardLayoutTypeChanged(value: string | number): void {
    this.boardWidgetChanged.emit({ boardLayoutType: value as 'list' | 'grid' });
  }

  onBoardImageSourceChanged(value: string | number): void {
    this.boardWidgetChanged.emit({ boardImageSource: value as 'my-library' | 'web-link' | 'none' });
  }

  onBoardPanelsPerRowInput(value: string): void {
    const parsed = Number(value);
    this.boardWidgetChanged.emit({ boardPanelsPerRow: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 });
  }

  onBoardPaddingInput(
    field: 'boardPaddingTop' | 'boardPaddingRight' | 'boardPaddingBottom' | 'boardPaddingLeft',
    value: string,
  ): void {
    const parsed = Number(value);
    this.boardWidgetChanged.emit({ [field]: Number.isFinite(parsed) ? parsed : 0 });
  }
}
