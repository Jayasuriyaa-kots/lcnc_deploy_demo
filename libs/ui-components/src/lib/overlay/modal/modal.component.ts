import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseOverlayComponent, QoModalSize } from '@qo/ui-components/lib/base';
import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';

@Component({
  selector: 'qo-modal',
  standalone: true,
  imports: [CommonModule, QoIconComponent],
  template: `
    <div class="qo-modal-backdrop" (click)="onBackdropClick($event)">
      <div
        class="qo-modal-container"
        [ngClass]="['qo-modal-' + size(), panelClass()]"
        [style.max-width]="maxWidth()"
        (click)="$event.stopPropagation()"
      >
        <div class="qo-modal-header">
          <div class="qo-modal-heading">
            <h2 class="qo-modal-title">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="qo-modal-subtitle">{{ subtitle() }}</p>
            }
          </div>
          @if (showClose()) {
            <button class="qo-modal-close" type="button" (click)="close.emit()" aria-label="Close modal">
              <qo-icon name="x"></qo-icon>
            </button>
          }
        </div>

        <div class="qo-modal-content">
          <ng-content></ng-content>
        </div>

        <div class="qo-modal-footer">
          <ng-content select="[qo-modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoModalComponent extends BaseOverlayComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly size = input<QoModalSize>('md');
  readonly maxWidth = input<string | null>(null);
  readonly panelClass = input<string>('');

  @HostListener('document:keydown.escape')
  onEscape() {
    this.requestClose();
  }

  onBackdropClick(event: MouseEvent) {
    this.requestCloseFromBackdrop();
  }
}

