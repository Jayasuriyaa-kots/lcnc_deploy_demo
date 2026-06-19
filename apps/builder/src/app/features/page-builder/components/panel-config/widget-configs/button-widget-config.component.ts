import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonStylePanelComponent } from '@builder/features/page-builder/components/panel-config/button/button-style-panel';
import { PanelConfigFacade } from '@builder/features/page-builder/facades/panel-config/panel-config.facade';
import {
  ButtonActionConfig,
  ButtonStyleConfig,
  CanvasWidget,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ButtonVariant } from '@builder/features/page-builder/components/widget-showcase/button/ui-button/ui-button.component';
import { ButtonDisplayType } from '@builder/features/page-builder/components/panel-config/core/panel-config.types';
import { PanelConfigState, PanelRightTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import { ButtonGroupButtonConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { injectPageBuilderTranslate, PageBuilderI18nService } from '@builder/features/page-builder/services/page-builder-i18n.service';
import { QoButtonComponent, QoInputComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';

type ButtonIconCategory = 'actions' | 'navigation' | 'media' | 'communication';

interface ButtonIconOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-button-widget-config',
  standalone: true,
  imports: [CommonModule,
    ButtonStylePanelComponent,
    QoButtonComponent,
    QoInputComponent,
    QoSelectComponent,
    TranslocoPipe,
  ],
  templateUrl: './button-widget-config.component.html',
  styleUrl: './button-widget-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonWidgetConfigComponent {
  private readonly i18n = inject(PageBuilderI18nService);
  protected readonly t = injectPageBuilderTranslate();
  readonly panelFacade = input.required<PanelConfigFacade>();

  readonly activeTab = input<PanelRightTab>('display');
  readonly selectedWidget = input<CanvasWidget | null>(null);
  readonly editableLabel = input<string>('');
  readonly buttonStyleConfig = input.required<ButtonStyleConfig>();
  readonly buttonActionConfig = input.required<ButtonActionConfig>();
  readonly selectedAction = input<string>('none');
  readonly selectedButtonGroupButtonId = input<string | null>(null);
  readonly buttonGroupButtons = input<ButtonGroupButtonConfig[]>([]);
  readonly buttonDatasourceOptions = input<readonly SelectOption[]>([]);
  readonly availableForms = input<readonly SelectOption[]>([]);
  readonly availableReports = input<readonly SelectOption[]>([]);
  readonly availablePageOptions = input<readonly SelectOption[]>([]);

  readonly labelChange = output<string>();
  readonly buttonWidgetChanged = output<Partial<CanvasWidget>>();
  readonly panelStateChange = output<Partial<PanelConfigState>>();
  readonly buttonStyleConfigChange = output<ButtonStyleConfig>();
  readonly buttonVariantChanged = output<ButtonVariant>();

  readonly actionFormOptions = computed<SelectOption[]>(() => [...this.availableForms()]);
  readonly actionReportOptions = computed<SelectOption[]>(() => [...this.availableReports()]);

  readonly currentButtonIconCategory = computed<ButtonIconCategory>(() => {
    const selectedIcon = this.selectedWidget()?.buttonIcon;
    if (!selectedIcon) {
      return 'actions';
    }

    const matchedCategory = this.buttonIconCategories().find((category) =>
      this.buttonIconOptions()[category.value].some((option) => option.value === selectedIcon),
    );

    return matchedCategory?.value ?? 'actions';
  });

  readonly visibleButtonIcons = computed(() => this.buttonIconOptions()[this.currentButtonIconCategory()]);

  readonly currentButtonDisplayType = computed<ButtonDisplayType>(() => {
    if (this.isButtonGroupWidget()) {
      return 'group';
    }

    if (this.isIconButtonWidget()) {
      return 'icon';
    }

    return 'standard';
  });

  readonly selectedButtonGroupButton = computed(() => {
    const selectedId = this.selectedButtonGroupButtonId();
    return this.buttonGroupButtons().find((button) => button.id === selectedId) ?? this.buttonGroupButtons()[0] ?? null;
  });

  protected get facade(): PanelConfigFacade {
    return this.panelFacade();
  }

  buttonIconOptions(): Record<ButtonIconCategory, ButtonIconOption[]> {
    return {
      actions: [
        { value: 'add', label: this.t('panelConfig.iconAdd') },
        { value: 'edit', label: this.i18n.global('actions.edit') },
        { value: 'delete', label: this.i18n.global('actions.delete') },
        { value: 'download', label: this.t('common.download') },
      ],
      navigation: [
        { value: 'arrow_forward', label: this.t('panelConfig.iconArrowRight') },
        { value: 'chevron_right', label: this.t('panelConfig.iconChevronRight') },
        { value: 'north_east', label: this.t('panelConfig.iconOpen') },
        { value: 'home', label: this.t('panelConfig.iconHome') },
      ],
      media: [
        { value: 'play_arrow', label: this.t('panelConfig.iconPlay') },
        { value: 'pause', label: this.t('panelConfig.iconPause') },
        { value: 'image', label: this.i18n.global('layout.content') },
        { value: 'videocam', label: this.t('panelConfig.iconVideo') },
      ],
      communication: [
        { value: 'mail', label: this.t('panelConfig.iconMail') },
        { value: 'call', label: this.t('panelConfig.iconCall') },
        { value: 'chat', label: this.t('panelConfig.iconChat') },
        { value: 'send', label: this.t('panelConfig.iconSend') },
      ],
    };
  }

  buttonIconCategories(): Array<{ value: ButtonIconCategory; label: string }> {
    return [
      { value: 'actions', label: this.t('panelConfig.iconCategoryActions') },
      { value: 'navigation', label: this.t('panelConfig.iconCategoryNavigation') },
      { value: 'media', label: this.t('panelConfig.iconCategoryMedia') },
      { value: 'communication', label: this.t('panelConfig.iconCategoryCommunication') },
    ];
  }

  isButtonGroupWidget(): boolean {
    return !!this.selectedWidget()?.widgetProps?.buttonGroupConfig;
  }

  isIconButtonWidget(): boolean {
    return !!this.selectedWidget()?.buttonIcon || !!this.selectedWidget()?.buttonIconImageDataUrl;
  }

  setButtonDisplayType(type: ButtonDisplayType): void {
    const patch = this.facade.createButtonDisplayTypePatch(type, this.selectedWidget());
    if (patch) {
      this.buttonWidgetChanged.emit(patch);
    }
  }

  setButtonIconCategory(category: ButtonIconCategory): void {
    const selectedIcon = this.selectedWidget()?.buttonIcon;
    const belongsToCategory = this.buttonIconOptions()[category].some((option) => option.value === selectedIcon);
    if (!belongsToCategory) {
      this.buttonWidgetChanged.emit({ buttonIcon: this.buttonIconOptions()[category][0]?.value ?? 'add' });
    }
  }

  selectButtonIcon(icon: string): void {
    this.buttonWidgetChanged.emit({ buttonIcon: icon, buttonIconImageDataUrl: '' });
  }

  updateButtonIconSize(value: string): void {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) ? Math.min(48, Math.max(12, parsed)) : 18;
    this.buttonWidgetChanged.emit({ buttonIconSize: normalized });
  }

  onButtonIconImageSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    const file = inputEl?.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.buttonWidgetChanged.emit({
        buttonIcon: '',
        buttonIconImageDataUrl: result,
      });
    };
    reader.readAsDataURL(file);

    if (inputEl) {
      inputEl.value = '';
    }
  }

  clearButtonIconImage(): void {
    this.buttonWidgetChanged.emit({ buttonIconImageDataUrl: '', buttonIcon: this.selectedWidget()?.buttonIcon || 'add' });
  }

  updateButtonGroupLabel(index: number, value: string): void {
    this.buttonWidgetChanged.emit(
      this.facade.createButtonGroupLabelPatch(index, value, this.selectedWidget(), this.buttonGroupButtons()),
    );
  }

  addButtonGroupButton(): void {
    const patch = this.facade.createAddButtonGroupButtonPatch(this.selectedWidget(), this.buttonGroupButtons());
    this.buttonWidgetChanged.emit(patch.widgetChange);
    this.panelStateChange.emit({ selectedButtonGroupButtonId: patch.selectedButtonGroupButtonId });
  }

  removeButtonGroupButton(index: number): void {
    const patch = this.facade.createRemoveButtonGroupButtonPatch(index, this.selectedWidget(), this.buttonGroupButtons());
    this.buttonWidgetChanged.emit(patch.widgetChange);
    this.panelStateChange.emit({ selectedButtonGroupButtonId: patch.selectedButtonGroupButtonId });
  }

  selectButtonGroupButton(buttonId: string): void {
    const patch = this.facade.createSelectedButtonGroupState(buttonId, this.buttonGroupButtons());
    if (!patch) {
      return;
    }
    this.panelStateChange.emit(patch);
  }

  selectAction(action: string): void {
    const patch = this.facade.createButtonActionConfigPatch(
      this.buttonActionConfig(),
      action,
      this.selectedWidget(),
      this.selectedButtonGroupButton()?.id ?? null,
      this.buttonGroupButtons(),
    );

    if (patch.widgetChange) {
      this.buttonWidgetChanged.emit(patch.widgetChange);
    }

    this.panelStateChange.emit(patch.panelStatePatch);
  }

  updateButtonActionField<K extends keyof ButtonActionConfig>(field: K, value: ButtonActionConfig[K]): void {
    const patch = this.facade.createButtonActionFieldPatch(
      this.buttonActionConfig(),
      field,
      value,
      this.selectedWidget(),
      this.selectedButtonGroupButton()?.id ?? null,
      this.buttonGroupButtons(),
    );

    if (patch.widgetChange) {
      this.buttonWidgetChanged.emit(patch.widgetChange);
    }

    this.panelStateChange.emit(patch.panelStatePatch);
  }
}
