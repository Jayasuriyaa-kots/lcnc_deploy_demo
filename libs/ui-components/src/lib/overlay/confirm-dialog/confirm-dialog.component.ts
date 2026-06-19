import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QoButtonComponent } from '../../primitives/button/button.component';
import { QoIconComponent } from '../../primitives/icon/icon.component';

export interface QoConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'qo-confirm-dialog',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent],
  template: `
    <div class="confirm-backdrop" (click)="cancel()"></div>

    <div
      class="confirm-dialog"
      role="alertdialog"
      aria-modal="true"
      [attr.aria-labelledby]="'qo-confirm-dialog-title'"
      [attr.aria-describedby]="'qo-confirm-dialog-message'"
    >
      <div class="confirm-dialog__icon" [class.confirm-dialog__icon--danger]="config().danger">
        <qo-icon [name]="config().danger ? 'alert-triangle' : 'help-circle'" size="md"></qo-icon>
      </div>

      <div class="confirm-dialog__body">
        <h2 class="confirm-dialog__title" id="qo-confirm-dialog-title">{{ config().title }}</h2>
        <p class="confirm-dialog__message" id="qo-confirm-dialog-message">{{ config().message }}</p>
      </div>

      <div class="confirm-dialog__actions">
        <qo-button variant="secondary" class="confirm-dialog__cancel-button" (click)="cancel()">
          {{ config().cancelLabel ?? 'Cancel' }}
        </qo-button>
        <qo-button
          [variant]="config().danger ? 'danger' : 'primary'"
          class="confirm-dialog__confirm-button"
          [class.confirm-dialog__confirm-button--danger]="config().danger"
          (click)="confirm()">
          {{ config().confirmLabel ?? 'Confirm' }}
        </qo-button>
      </div>
    </div>
  `,
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoConfirmDialogComponent {
  readonly config = input.required<QoConfirmDialogConfig>();
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
