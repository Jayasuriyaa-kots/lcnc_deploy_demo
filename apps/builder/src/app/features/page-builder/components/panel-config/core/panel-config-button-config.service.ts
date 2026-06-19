import { Injectable } from '@angular/core';
import {
  ButtonActionConfig,
  ButtonActionType,
  ButtonGroupButtonConfig,
  ButtonStyleConfig,
  CanvasWidget,
  createDefaultButtonActionConfig,
  createDefaultButtonStyleConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ButtonDisplayType } from '@builder/features/page-builder/components/panel-config/core/panel-config.types';

@Injectable({ providedIn: 'root' })
export class PanelConfigButtonConfigService {
  getButtonGroupButtons(selectedWidget: CanvasWidget | null): ButtonGroupButtonConfig[] {
    const buttons = selectedWidget?.widgetProps?.buttonGroupConfig?.buttons ?? [];
    return buttons.length ? buttons.map((button) => ({ ...button })) : this.createDefaultButtonGroupButtons();
  }

  createButtonActionConfigPatch(
    currentConfig: ButtonActionConfig,
    action: string,
    selectedWidget: CanvasWidget | null,
    selectedButtonId: string | null,
    buttons: ButtonGroupButtonConfig[],
  ): { panelStatePatch: { selectedAction: string; buttonActionConfig: ButtonActionConfig }; widgetChange?: Partial<CanvasWidget> } {
    const nextActionConfig: ButtonActionConfig = { ...currentConfig, type: action as ButtonActionType };
    return {
      panelStatePatch: { selectedAction: action, buttonActionConfig: { ...nextActionConfig } },
      widgetChange: this.createButtonActionWidgetChange(selectedWidget, selectedButtonId, buttons, nextActionConfig),
    };
  }

  createButtonActionFieldPatch<K extends keyof ButtonActionConfig>(
    currentConfig: ButtonActionConfig,
    field: K,
    value: ButtonActionConfig[K],
    selectedWidget: CanvasWidget | null,
    selectedButtonId: string | null,
    buttons: ButtonGroupButtonConfig[],
  ): {
    panelStatePatch: { selectedAction: ButtonActionType; buttonActionConfig: ButtonActionConfig };
    widgetChange?: Partial<CanvasWidget>;
  } {
    const nextActionConfig: ButtonActionConfig = { ...currentConfig, [field]: value };
    return {
      panelStatePatch: { selectedAction: nextActionConfig.type, buttonActionConfig: { ...nextActionConfig } },
      widgetChange: this.createButtonActionWidgetChange(selectedWidget, selectedButtonId, buttons, nextActionConfig),
    };
  }

  createButtonStylePatch(
    config: ButtonStyleConfig,
    selectedWidget: CanvasWidget | null,
    selectedButtonId: string | null,
    buttons: ButtonGroupButtonConfig[],
  ): { panelStatePatch: { buttonStyleConfig: ButtonStyleConfig }; widgetChange?: Partial<CanvasWidget> } {
    if (!selectedButtonId) {
      return { panelStatePatch: { buttonStyleConfig: { ...config } } };
    }

    const nextButtons = buttons.map((button) =>
      button.id === selectedButtonId ? { ...button, buttonStyleConfig: { ...config } } : { ...button },
    );
    return {
      panelStatePatch: { buttonStyleConfig: { ...config } },
      widgetChange: { widgetProps: { ...selectedWidget?.widgetProps, buttonGroupConfig: { buttons: nextButtons } } },
    };
  }

  createButtonDisplayTypePatch(type: ButtonDisplayType, widget: CanvasWidget | null): Partial<CanvasWidget> | null {
    if (!widget) {
      return null;
    }

    const existingButtons = widget.widgetProps?.buttonGroupConfig?.buttons ?? [];
    if (type === 'standard') {
      return {
        label: widget.label === 'Button group' ? 'Button' : widget.label,
        buttonIcon: '',
        buttonIconImageDataUrl: '',
        widgetProps: { ...widget.widgetProps, buttonGroupConfig: undefined },
      };
    }
    if (type === 'icon') {
      return {
        buttonIcon: widget.buttonIcon || 'download',
        buttonIconImageDataUrl: widget.buttonIconImageDataUrl || '',
        widgetProps: { ...widget.widgetProps, buttonGroupConfig: undefined },
      };
    }
    return {
      label: 'Button group',
      buttonIcon: '',
      buttonIconImageDataUrl: '',
      widgetProps: {
        ...widget.widgetProps,
        buttonGroupConfig: {
          buttons: existingButtons.length
            ? existingButtons.map((button) => ({ ...button }))
            : this.createDefaultButtonGroupButtons(widget.label || 'Button 1'),
        },
      },
    };
  }

  createButtonGroupLabelPatch(
    index: number,
    value: string,
    selectedWidget: CanvasWidget | null,
    buttons: ButtonGroupButtonConfig[],
  ): Partial<CanvasWidget> {
    const nextButtons = buttons.map((button) => ({ ...button }));
    nextButtons[index] = { ...nextButtons[index], label: value.trim() || `Button ${index + 1}` };
    return { label: 'Button group', widgetProps: { ...selectedWidget?.widgetProps, buttonGroupConfig: { buttons: nextButtons } } };
  }

  createAddButtonGroupButtonPatch(
    selectedWidget: CanvasWidget | null,
    buttons: ButtonGroupButtonConfig[],
  ): { widgetChange: Partial<CanvasWidget>; selectedButtonGroupButtonId: string } {
    const nextButton = this.createButtonGroupButton(`Button ${buttons.length + 1}`);
    const nextButtons = [...buttons.map((button) => ({ ...button })), nextButton];
    return {
      widgetChange: { label: 'Button group', widgetProps: { ...selectedWidget?.widgetProps, buttonGroupConfig: { buttons: nextButtons } } },
      selectedButtonGroupButtonId: nextButton.id,
    };
  }

  createRemoveButtonGroupButtonPatch(
    index: number,
    selectedWidget: CanvasWidget | null,
    buttons: ButtonGroupButtonConfig[],
  ): { widgetChange: Partial<CanvasWidget>; selectedButtonGroupButtonId: string } {
    const remainingButtons = buttons.filter((_, itemIndex) => itemIndex !== index);
    const nextButtons = remainingButtons.length ? remainingButtons : [this.createButtonGroupButton('Button 1')];
    return {
      widgetChange: { label: 'Button group', widgetProps: { ...selectedWidget?.widgetProps, buttonGroupConfig: { buttons: nextButtons } } },
      selectedButtonGroupButtonId: nextButtons[0].id,
    };
  }

  createSelectedButtonGroupState(
    buttonId: string,
    buttons: ButtonGroupButtonConfig[],
  ): { selectedButtonGroupButtonId: string; buttonStyleConfig: ButtonStyleConfig; selectedAction: ButtonActionType; buttonActionConfig: ButtonActionConfig } | null {
    const button = buttons.find((item) => item.id === buttonId);
    if (!button) {
      return null;
    }
    const selectedAction = (button.selectedAction as ButtonActionType) ?? button.buttonActionConfig?.type ?? 'none';
    return {
      selectedButtonGroupButtonId: buttonId,
      buttonStyleConfig: { ...createDefaultButtonStyleConfig(), ...(button.buttonStyleConfig ?? {}) },
      selectedAction,
      buttonActionConfig: { ...createDefaultButtonActionConfig(), ...(button.buttonActionConfig ?? {}), type: selectedAction },
    };
  }

  private createButtonActionWidgetChange(
    selectedWidget: CanvasWidget | null,
    selectedButtonId: string | null,
    buttons: ButtonGroupButtonConfig[],
    nextActionConfig: ButtonActionConfig,
  ): Partial<CanvasWidget> | undefined {
    if (selectedButtonId) {
      const nextButtons = buttons.map((button) =>
        button.id === selectedButtonId
          ? { ...button, selectedAction: nextActionConfig.type, buttonActionConfig: { ...nextActionConfig } }
          : { ...button },
      );
      return { widgetProps: { ...selectedWidget?.widgetProps, buttonGroupConfig: { buttons: nextButtons } } };
    }
    if (selectedWidget?.type === 'button-showcase') {
      return { widgetProps: { ...selectedWidget.widgetProps, buttonActionConfig: { ...nextActionConfig } } };
    }
    return undefined;
  }

  private createDefaultButtonGroupButtons(primaryLabel = 'Button 1'): ButtonGroupButtonConfig[] {
    return [this.createButtonGroupButton(primaryLabel, 'btn-1'), this.createButtonGroupButton('Button 2', 'btn-2')];
  }

  private createButtonGroupButton(label: string, id?: string): ButtonGroupButtonConfig {
    return {
      id: id ?? `btn-${Math.random().toString(36).slice(2, 10)}`,
      label,
      buttonStyleConfig: createDefaultButtonStyleConfig(),
      selectedAction: 'none',
      buttonActionConfig: createDefaultButtonActionConfig(),
    };
  }
}
