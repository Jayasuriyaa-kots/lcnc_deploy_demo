import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  createDefaultTextBlockWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { BindableInputComponent } from '@builder/shared/ui/bindable-input/bindable-input.component';
import { QoInputComponent, QoSelectComponent, QoToggleComponent, SelectOption } from '@qo/ui-components';
import { LabelSettingsFacade } from '@builder/features/page-builder/facades/panel-config/label-settings.facade';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-label-settings-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BindableInputComponent, QoToggleComponent, QoSelectComponent, QoInputComponent, TranslocoPipe],
  templateUrl: './label-settings-panel.component.html',
  styleUrl: './label-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LabelSettingsFacade],
})
export class LabelSettingsPanelComponent {
  protected readonly facade = inject(LabelSettingsFacade);
  protected readonly t = injectPageBuilderTranslate();

  readonly config = input<TextBlockWidgetConfig>(createDefaultTextBlockWidgetConfig('labeltext'));
  readonly configChange = output<TextBlockWidgetConfig>();
  readonly label = input<string>('');
  readonly labelChange = output<string>();

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

  updateText(value: string): void {
    this.facade.updateText(value);
    this.labelChange.emit(value);
  }

  contentSourceOptions(): SelectOption[] {
    return [
      { value: 'static', label: this.t('label.settings.staticText') },
      { value: 'datasource', label: this.t('common.datasource') },
    ];
  }
}
