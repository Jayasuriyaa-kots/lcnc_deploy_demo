import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonStyleConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';

export type ButtonVariant =
  | 'primary-filled'
  | 'primary-outline'
  | 'rounded-outline'
  | 'flat-light'
  | 'flat-rounded-light';

export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-widget-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
})
export class UiButtonComponent {
  readonly variant = input<ButtonVariant>('primary-filled');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly fillContainer = input(false);
  readonly iconName = input<string | null>(null);
  readonly iconSize = input<number | null>(null);
  readonly iconImageSrc = input<string | null>(null);
  readonly iconOnly = input(false);
  readonly clicked = output<MouseEvent>();
  readonly buttonStyleConfig = input<ButtonStyleConfig | undefined>(undefined);

  readonly computedClass = computed((): string => {
    const radiusMap: Record<ButtonVariant, string> = {
      'primary-filled': 'radius-md',
      'primary-outline': 'radius-md',
      'rounded-outline': 'radius-full',
      'flat-light': 'radius-md',
      'flat-rounded-light': 'radius-full',
    };

    const variant = this.variant();
    return [`v-${variant}`, `size-${this.size()}`, radiusMap[variant], this.iconOnly() ? 'icon-only' : ''].join(' ');
  });

  readonly computedStyle = computed((): Record<string, string> => {
    const config = this.buttonStyleConfig();
    if (!config) {
      return {};
    }

    const styles: Record<string, string> = {};

    if (config.fontFamily) {
      styles['font-family'] = config.fontFamily;
    }

    if (config.fontSize) {
      styles['font-size'] = this.normalizeSize(config.fontSize);
    }

    styles['font-weight'] = config.bold ? '700' : '500';
    styles['font-style'] = config.italic ? 'italic' : 'normal';
    styles['text-decoration'] = config.underline ? 'underline' : 'none';
    styles['text-transform'] =
      config.textCase === 'uppercase' ? 'uppercase' : config.textCase === 'lowercase' ? 'lowercase' : 'none';

    if (config.color) {
      styles['color'] = config.color;
    }

    if (config.fillColor) {
      styles['background-color'] = config.fillColor;
    }

    if (config.strokeColor) {
      styles['border-color'] = config.strokeColor;
    }

    if (config.strokeWidth) {
      styles['border-width'] = `${config.strokeWidth}px`;
    }

    if (config.paddingTop || config.paddingRight || config.paddingBottom || config.paddingLeft) {
      styles['padding'] = `${config.paddingTop}px ${config.paddingRight}px ${config.paddingBottom}px ${config.paddingLeft}px`;
    }

    if (config.marginTop || config.marginRight || config.marginBottom || config.marginLeft) {
      styles['margin'] = `${config.marginTop}px ${config.marginRight}px ${config.marginBottom}px ${config.marginLeft}px`;
    }

    if (config.cornerRadius) {
      styles['border-radius'] = `${config.cornerRadius}px`;
    }

    if (this.fillContainer()) {
      styles['width'] = '100%';
      styles['height'] = '100%';
    }

    return styles;
  });

  readonly computedIconSize = computed(() => `${this.iconSize() ?? 18}px`);

  private normalizeSize(size: string): string {
    return size.replace(/\s+/g, '');
  }
}
