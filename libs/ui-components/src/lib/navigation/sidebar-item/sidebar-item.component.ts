import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QoStatusToggleComponent } from '../../status/status-toggle';

@Component({
  selector: 'qo-sidebar-item',
  standalone: true,
  imports: [CommonModule, QoStatusToggleComponent],
  template: `
    <div
      class="sidebar-item"
      role="button"
      tabindex="0"
      [class.sidebar-item--active]="active()"
      (click)="selected.emit()"
      (keydown.enter)="selected.emit()"
      (keydown.space)="$event.preventDefault(); selected.emit()">
      <div class="sidebar-item__row">
        <div class="sidebar-item__name">{{ title() }}</div>
        <div class="sidebar-item__actions" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      <div class="sidebar-item__footer" (click)="$event.stopPropagation()">
        <qo-status-toggle
          [active]="statusActive()"
          [label]="statusLabel()"
          [ariaLabel]="statusAriaLabel()"
          (toggled)="statusToggled.emit()">
        </qo-status-toggle>
        <div class="sidebar-item__meta">{{ meta() }}</div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-item {
      width: 100%;
      max-width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--qo-space-2);
      text-align: left;
      padding: var(--qo-space-4);
      border: 0;
      border-top: 1px solid var(--qo-border-color);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.9) 100%);
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      overflow: hidden;
    }

    .sidebar-item:hover {
      background: var(--qo-color-neutral-0);
      box-shadow: inset 0 0 0 1px rgba(17, 17, 17, 0.04);
      transform: translateX(2px);
    }

    .sidebar-item--active {
      background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
      color: var(--qo-color-neutral-0);
      box-shadow:
        inset 2px 0 0 var(--qo-color-neutral-300),
        0 12px 20px rgba(15, 23, 42, 0.16);
    }

    .sidebar-item--active:hover {
      background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
      transform: none;
    }

    .sidebar-item__row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--qo-space-2);
      min-width: 0;
    }

    .sidebar-item__name {
      font-size: var(--qo-text-sm);
      line-height: 1.4;
      font-weight: var(--qo-font-bold);
      color: var(--qo-color-neutral-900);
      white-space: normal;
      overflow: hidden;
      min-width: 0;
      flex: 1 1 auto;
    }

    .sidebar-item__meta {
      font-size: var(--qo-text-xs);
      color: var(--qo-color-neutral-400);
      line-height: 1.3;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .sidebar-item--active .sidebar-item__name,
    .sidebar-item--active .sidebar-item__meta {
      color: var(--qo-color-neutral-0);
    }

    .sidebar-item__footer {
      display: flex;
      align-items: center;
      gap: var(--qo-space-2);
      justify-content: space-between;
      min-width: 0;
    }

    .sidebar-item__actions {
      display: none;
      align-items: center;
      gap: 2px;
      flex: 0 0 auto;
      margin-left: auto;
    }

    .sidebar-item:hover .sidebar-item__actions,
    .sidebar-item--active:hover .sidebar-item__actions,
    .sidebar-item--active .sidebar-item__actions {
      display: flex;
    }

    .sidebar-item--active qo-status-toggle {
      --qo-status-toggle-label-color: var(--qo-color-neutral-100);
    }

    @media (max-width: 1440px) {
      .sidebar-item {
        padding: var(--qo-space-4) var(--qo-space-3);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoSidebarItemComponent {
  readonly active = input(false);
  readonly title = input('');
  readonly meta = input('');
  readonly statusActive = input(false);
  readonly statusLabel = input('Inactive');
  readonly statusAriaLabel = input('Toggle status');

  readonly selected = output<void>();
  readonly statusToggled = output<void>();
}
