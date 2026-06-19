import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

import { QoBadgeComponent } from '@qo/ui-components/lib/primitives/badge/badge.component';
import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: {
    text: string;
    color: 'default' | 'success' | 'warning' | 'danger' | 'info';
  };
  children?: SidebarItem[];
  expanded?: boolean;
  active?: boolean;
}

@Component({
  selector: 'qo-sidebar',
  standalone: true,
  imports: [RouterModule, QoIconComponent, QoBadgeComponent],
  template: `
    <aside class="qo-sidebar" [class.qo-sidebar-collapsed]="collapsed()">
      <div class="qo-sidebar-header">
        <ng-content select="[qo-sidebar-header]"></ng-content>
      </div>

      <nav class="qo-sidebar-nav">
        @for (item of items(); track item.id) {
          <div class="qo-sidebar-item-wrapper">
            <a
              class="qo-sidebar-item"
              [class.qo-sidebar-item-active]="item.active"
              [routerLink]="item.route"
              (click)="onItemClick(item, $event)"
            >
              <div class="qo-sidebar-item-content">
                @if (item.icon) {
                  <qo-icon [name]="item.icon" class="qo-sidebar-item-icon"></qo-icon>
                }

                @if (!collapsed()) {
                  <span class="qo-sidebar-item-label">{{ item.label }}</span>

                  @if (item.badge) {
                    <qo-badge [color]="item.badge.color" size="sm" class="qo-sidebar-item-badge">
                      {{ item.badge.text }}
                    </qo-badge>
                  }
                }
              </div>

              @if (!collapsed() && item.children?.length) {
                <qo-icon
                  [name]="item.expanded ? 'chevron-down' : 'chevron-right'"
                  size="sm"
                  class="qo-sidebar-item-caret"
                ></qo-icon>
              }
            </a>

            @if (!collapsed() && item.children?.length && item.expanded) {
              <div class="qo-sidebar-subnav">
                @for (child of item.children; track child.id) {
                  <a
                    class="qo-sidebar-subitem"
                    [class.qo-sidebar-subitem-active]="child.active"
                    [routerLink]="child.route"
                    (click)="itemClick.emit(child)"
                  >
                    <span class="qo-sidebar-subitem-label">{{ child.label }}</span>
                  </a>
                }
              </div>
            }
          </div>
        }
      </nav>

      <div class="qo-sidebar-footer">
        <ng-content select="[qo-sidebar-footer]"></ng-content>

        <button class="qo-sidebar-collapse-btn" type="button" (click)="toggleCollapse()">
          <qo-icon [name]="collapsed() ? 'chevron-right' : 'chevron-left'" size="sm"></qo-icon>
        </button>
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoSidebarComponent {
  readonly items = input<SidebarItem[]>([]);
  readonly collapsed = input<boolean>(false);

  readonly collapsedChange = output<boolean>();
  readonly itemClick = output<SidebarItem>();

  toggleCollapse(): void {
    this.collapsedChange.emit(!this.collapsed());
  }

  onItemClick(item: SidebarItem, event: Event): void {
    if (item.children?.length) {
      event.preventDefault();
      item.expanded = !item.expanded;
      return;
    }

    this.itemClick.emit(item);
  }
}
