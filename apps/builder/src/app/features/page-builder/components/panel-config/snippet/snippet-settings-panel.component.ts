import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  createDefaultSnippetWidgetConfig,
  SnippetWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { SnippetVariant } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-widget.config';
import { QoColorPickerComponent, QoInputComponent, QoTextareaComponent } from '@qo/ui-components';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-snippet-settings-panel',
  standalone: true,
  imports: [CommonModule, QoColorPickerComponent, QoInputComponent, QoTextareaComponent,
    TranslocoPipe,
  ],
  templateUrl: './snippet-settings-panel.component.html',
  styleUrl: './snippet-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetSettingsPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly label = input('Snippet');
  readonly variant = input<SnippetVariant>('html');
  readonly rightTab = input<PanelRightTab>('display');
  readonly config = input<SnippetWidgetConfig>(createDefaultSnippetWidgetConfig());
  readonly colorPickerPalette = input<string[]>([]);

  readonly labelChange = output<string>();
  readonly configChange = output<SnippetWidgetConfig>();

  updateLabel(value: string): void {
    const nextValue = value.trim() || 'Snippet';
    this.labelChange.emit(nextValue);
  }

  updateSnippetField(field: keyof SnippetWidgetConfig, value: string): void {
    this.configChange.emit({
      ...this.config(),
      [field]: value,
    });
  }

  contentLabel(): string {
    switch (this.variant()) {
      case 'embed':
        return 'Embed markup';
      default:
        return 'HTML markup';
    }
  }

  isDisplayTab(): boolean {
    return this.rightTab() === 'display';
  }

  isContentTab(): boolean {
    return this.rightTab() === 'content';
  }

  isStyleTab(): boolean {
    return this.rightTab() === 'style';
  }
}
