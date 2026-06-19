import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';
import { QoSpinnerComponent } from '@qo/ui-components/lib/primitives/spinner/spinner.component';
import { BaseControlComponent, QoButtonVariant } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-button',
  standalone: true,
  imports: [CommonModule, QoIconComponent, QoSpinnerComponent],
  template: `
    <button
      [class]="'qo-btn qo-btn-' + variant() + ' qo-btn-' + size()"
      [class.qo-btn-full]="fullWidth()"
      [class.qo-btn-icon-only]="iconOnly()"
      [attr.role]="buttonRole()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-checked]="ariaChecked()"
      [disabled]="disabled() || loading()"
      [type]="type()">
      
      @if (loading()) {
        <qo-spinner size="sm" [color]="variant() === 'primary' ? 'white' : 'primary'" class="qo-btn-spinner"></qo-spinner>
      } @else if (iconLeft() && !iconOnly()) {
        <qo-icon [name]="iconLeft()!" class="qo-btn-icon-left"></qo-icon>
      } @else if (iconLeft() && iconOnly()) {
        <qo-icon [name]="iconLeft()!"></qo-icon>
      }
      
      @if (!iconOnly()) {
        <span class="qo-btn-label"><ng-content></ng-content></span>
      }
      
      @if (!loading() && iconRight()) {
        <qo-icon [name]="iconRight()!" class="qo-btn-icon-right"></qo-icon>
      }
    </button>
  `,
  styleUrl: './button.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoButtonComponent extends BaseControlComponent {
  variant = input<QoButtonVariant>('primary');
  loading = input<boolean>(false);
  iconLeft = input<string | undefined>(undefined);
  iconRight = input<string | undefined>(undefined);
  iconOnly = input<boolean>(false);
  ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  ariaChecked = input<boolean | undefined>(undefined, { alias: 'aria-checked' });
  buttonRole = input<string | undefined>(undefined);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
}

