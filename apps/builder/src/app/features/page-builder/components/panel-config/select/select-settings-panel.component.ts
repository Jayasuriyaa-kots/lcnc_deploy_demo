import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import {
  createDefaultSelectWidgetConfig,
  SelectWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { BindableInputComponent } from '@builder/shared/ui/bindable-input/bindable-input.component';
import { QoButtonComponent, QoInputComponent } from '@qo/ui-components';
import { QoSelectComponent, SelectOption } from '@qo/ui-components';
import { SelectSettingsFacade } from '@builder/features/page-builder/facades/panel-config/select-settings.facade';

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-select-settings-panel',
  standalone: true,
  imports: [CommonModule, BindableInputComponent, QoButtonComponent, QoSelectComponent, QoInputComponent,
    TranslocoPipe,
  ],
  templateUrl: './select-settings-panel.component.html',
  styleUrl: './select-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SelectSettingsFacade],
})
export class SelectSettingsPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  protected readonly facade = inject(SelectSettingsFacade);

  readonly label = input('Select');
  readonly config = input<SelectWidgetConfig>(createDefaultSelectWidgetConfig());

  readonly labelChange = output<string>();
  readonly configChange = output<SelectWidgetConfig>();

  readonly variantOptions: SelectOption[] = [
    { value: 'select', label: 'Select' },
    { value: 'multiselect', label: 'Multi Select' },
    { value: 'radio', label: 'Radio' },
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

  updateWidgetName(value: string): void {
    const nextValue = value.trim() || 'Select';
    this.labelChange.emit(nextValue);
  }
}

