import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, input, output, computed, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { QoButtonComponent, QoColorPickerComponent, QoInputComponent } from '@qo/ui-components';
import { ButtonStyleConfig, createDefaultButtonStyleConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ButtonVariant } from '@builder/features/page-builder/components/widget-showcase/button/ui-button/ui-button.component';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';
import {
  ButtonStyleToggle,
  ButtonTone,
  ButtonBoxType,
  NumericStyleField,
  StyleSelectOption,
  fontFamilyOptions,
  fontSizeOptions,
  colorPickerPalette,
} from './button-style-panel.constants';

@Component({
  selector: 'app-button-style-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QoButtonComponent, QoColorPickerComponent, QoInputComponent, TranslocoPipe],
  templateUrl: './button-style-panel.component.html',
  styleUrl: './button-style-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonStylePanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly styleConfig = input<ButtonStyleConfig>(createDefaultButtonStyleConfig());
  readonly buttonVariant = input<ButtonVariant>('primary-filled');
  readonly isIconOnly = input(false);
  readonly styleConfigChange = output<ButtonStyleConfig>();
  readonly buttonVariantChange = output<ButtonVariant>();
  readonly isFontFamilyOpen = signal(false);
  readonly isFontSizeOpen = signal(false);

  readonly fontFamilyOptions = fontFamilyOptions;
  readonly fontSizeOptions = fontSizeOptions;
  readonly colorPickerPalette = colorPickerPalette;

  private readonly formBuilder = inject(FormBuilder);
  readonly styleForm = this.formBuilder.nonNullable.group({
    cornerRadius: 3, strokeWidth: 0, paddingTop: 12, paddingRight: 15, paddingBottom: 12, paddingLeft: 15,
    marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
  });

  readonly localStyleConfig = computed(() => this.styleConfig());
  readonly currentTone = computed<ButtonTone>(() => this.getToneFromVariant(this.buttonVariant()));
  readonly currentBoxType = computed<ButtonBoxType>(() => this.getBoxType());

  constructor() {
    effect(() => {
      const nextStyleConfig = { ...createDefaultButtonStyleConfig(), ...(this.styleConfig() ?? {}) };
      this.styleForm.setValue({
        cornerRadius: nextStyleConfig.cornerRadius, strokeWidth: nextStyleConfig.strokeWidth,
        paddingTop: nextStyleConfig.paddingTop, paddingRight: nextStyleConfig.paddingRight,
        paddingBottom: nextStyleConfig.paddingBottom, paddingLeft: nextStyleConfig.paddingLeft,
        marginTop: nextStyleConfig.marginTop, marginRight: nextStyleConfig.marginRight,
        marginBottom: nextStyleConfig.marginBottom, marginLeft: nextStyleConfig.marginLeft,
      }, { emitEvent: false });
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isFontFamilyOpen.set(false);
    this.isFontSizeOpen.set(false);
  }

  toggleStyle(type: ButtonStyleToggle): void { this.emitStyleConfig({ [type]: !this.styleConfig()[type] } as Partial<ButtonStyleConfig>); }
  toggleTextCase(): void {
    const currentCase = this.styleConfig().textCase;
    const nextCase = currentCase === 'default' ? 'uppercase' : currentCase === 'uppercase' ? 'lowercase' : 'default';
    this.emitStyleConfig({ textCase: nextCase });
  }

  toggleFontFamilyDropdown(): void { this.isFontFamilyOpen.update((v) => !v); this.isFontSizeOpen.set(false); }
  selectFontFamily(option: StyleSelectOption): void { this.isFontFamilyOpen.set(false); this.emitStyleConfig({ fontFamily: option.value }); }
  toggleFontSizeDropdown(): void { this.isFontSizeOpen.update((v) => !v); this.isFontFamilyOpen.set(false); }
  selectFontSize(option: StyleSelectOption): void { this.isFontSizeOpen.set(false); this.emitStyleConfig({ fontSize: option.value }); }
  setButtonTone(tone: ButtonTone): void { this.buttonVariantChange.emit(this.getVariantForSelection(tone, this.currentBoxType())); }
  setButtonBoxType(boxType: ButtonBoxType): void { this.emitStyleConfig({ cornerRadius: boxType === 'rounded' ? 999 : 3 }); this.buttonVariantChange.emit(this.getVariantForSelection(this.currentTone(), boxType)); }

  updateNumericField(field: NumericStyleField, value: string): void {
    const nextValue = value.trim() === '' ? 0 : Number(value);
    const normalizedValue = Number.isFinite(nextValue) ? nextValue : 0;
    this.styleForm.controls[field].setValue(normalizedValue, { emitEvent: false });
    this.emitStyleConfig({ [field]: normalizedValue } as Partial<ButtonStyleConfig>);
  }

  setColor(value: string | null): void { if (value) this.emitStyleConfig({ color: value }); }
  setFillColor(value: string | null): void { if (value) this.emitStyleConfig({ fillColor: value }); }
  setStrokeColor(value: string | null): void { if (value) this.emitStyleConfig({ strokeColor: value }); }
  getSelectedFontFamilyLabel(): string { return this.getOptionLabel(this.fontFamilyOptions, this.styleConfig().fontFamily); }
  getSelectedFontSizeLabel(): string { return this.getOptionLabel(this.fontSizeOptions, this.styleConfig().fontSize); }

  private emitStyleConfig(partial: Partial<ButtonStyleConfig>): void { this.styleConfigChange.emit({ ...this.styleConfig(), ...partial }); }
  private getOptionLabel(options: StyleSelectOption[], value: string): string { return options.find((opt) => opt.value === value)?.label ?? value; }

  private getToneFromVariant(variant: ButtonVariant): ButtonTone {
    if (variant === 'primary-outline' || variant === 'rounded-outline') return 'outlined';
    if (variant === 'flat-light' || variant === 'flat-rounded-light') return 'ghost';
    return 'filled';
  }

  private getBoxType(): ButtonBoxType {
    if (this.buttonVariant() === 'rounded-outline' || this.buttonVariant() === 'flat-rounded-light' || this.styleConfig().cornerRadius >= 999) return 'rounded';
    return 'rectangular';
  }

  private getVariantForSelection(tone: ButtonTone, boxType: ButtonBoxType): ButtonVariant {
    if (tone === 'filled') return 'primary-filled';
    if (tone === 'outlined') return boxType === 'rounded' ? 'rounded-outline' : 'primary-outline';
    return boxType === 'rounded' ? 'flat-rounded-light' : 'flat-light';
  }
}
