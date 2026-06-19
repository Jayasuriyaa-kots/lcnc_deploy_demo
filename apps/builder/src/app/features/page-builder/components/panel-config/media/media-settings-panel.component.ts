import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { BindableInputComponent } from '@builder/shared/ui/bindable-input/bindable-input.component';
import {
  createDefaultMediaWidgetConfig,
  MediaWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { QoInputComponent, QoSelectComponent, QoToggleComponent, SelectOption } from '@qo/ui-components';
import { MediaSettingsFacade } from '@builder/features/page-builder/facades/panel-config/media-settings.facade';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-media-settings-panel',
  standalone: true,
  imports: [CommonModule, BindableInputComponent, QoInputComponent, QoSelectComponent, QoToggleComponent,
    TranslocoPipe,
  ],
  templateUrl: './media-settings-panel.component.html',
  styleUrl: './media-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaSettingsFacade],
})
export class MediaSettingsPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  protected readonly facade = inject(MediaSettingsFacade);

  readonly config = input<MediaWidgetConfig>(createDefaultMediaWidgetConfig());
  readonly configChange = output<MediaWidgetConfig>();

  readonly mediaTypeOptions: SelectOption[] = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
  ];
  readonly sourceModeOptions: SelectOption[] = [
    { value: 'static-url', label: 'Static URL' },
    { value: 'upload', label: 'Upload' },
    { value: 'datasource', label: 'Datasource' },
  ];

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (cfg) {
        this.facade.config.set(cfg);
      }
    });

    effect(() => {
      this.facade.configChange.set((cfg) => {
        this.configChange.emit(cfg);
      });
    });
  }
}

