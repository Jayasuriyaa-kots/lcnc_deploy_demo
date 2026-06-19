import { ChangeDetectionStrategy, Component, HostListener, input } from '@angular/core';

import { BaseOverlayComponent } from '@qo/ui-components/lib/base';
import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';

export type DrawerPosition = 'right' | 'left';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'qo-drawer',
  standalone: true,
  imports: [QoIconComponent],
  template: `
    @if (isOpen()) {
      <div class="qo-drawer-backdrop" (click)="onBackdropClick()"></div>
    }
    
    <div 
      class="qo-drawer-panel" 
      [class.qo-drawer-panel-open]="isOpen()"
      [class]="'qo-drawer-pos-' + position() + ' qo-drawer-size-' + size()">
      
      <div class="qo-drawer-header">
        <h3 class="qo-drawer-title">{{ title() }}</h3>
        @if (showClose()) {
          <button class="qo-drawer-close" (click)="close.emit()">
            <qo-icon name="x"></qo-icon>
          </button>
        }
      </div>
      
      <div class="qo-drawer-content">
        <ng-content></ng-content>
      </div>
      
      <div class="qo-drawer-footer">
        <ng-content select="[qo-drawer-footer]"></ng-content>
      </div>
      
    </div>
  `,
  styleUrl: './drawer.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoDrawerComponent extends BaseOverlayComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input.required<string>();
  readonly position = input<DrawerPosition>('right');
  readonly size = input<DrawerSize>('md');

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) {
      this.requestClose();
    }
  }

  onBackdropClick() {
    this.requestCloseFromBackdrop();
  }
}

