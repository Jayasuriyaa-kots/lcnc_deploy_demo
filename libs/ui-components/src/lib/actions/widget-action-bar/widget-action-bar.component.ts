import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QoButtonComponent } from '../../primitives/button';

@Component({
  selector: 'qo-widget-action-bar',
  standalone: true,
  imports: [CommonModule, QoButtonComponent],
  template: `
    @if (visible()) {
      <section class="widget-action-bar">
        <div class="widget-action-bar__title">Element Name: {{ elementName() }}</div>
        <div class="widget-action-bar__actions">
          <qo-button
            class="widget-action-bar__icon"
            variant="ghost"
            size="sm"
            aria-label="Copy widget"
            (click)="copyRequested.emit()"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="9" y="9" width="10" height="10" rx="1"></rect>
              <path d="M6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1"></path>
            </svg>
          </qo-button>

          <qo-button
            class="widget-action-bar__icon"
            variant="ghost"
            size="sm"
            aria-label="Delete widget"
            (click)="deleteRequested.emit()"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 6h18"></path>
              <path d="M8 6V4h8v2"></path>
              <path d="M19 6l-1 14H6L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
            </svg>
          </qo-button>
        </div>
      </section>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    .widget-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: calc(var(--qo-space-10) + var(--qo-space-1));
      margin: 0 0 var(--qo-space-5);
      border-top: 0.0625rem solid var(--qo-color-neutral-200);
      border-bottom: 0.0625rem solid var(--qo-color-neutral-200);
      background: var(--qo-color-neutral-0);
      font-family: var(--qo-font-family-sans, inherit);
    }

    .widget-action-bar__title {
      padding: 0 var(--qo-space-4);
      color: var(--qo-color-neutral-700);
      font-size: var(--qo-text-base);
      line-height: 1.2;
    }

    .widget-action-bar__actions {
      display: flex;
      align-items: stretch;
    }

    .widget-action-bar__icon {
      min-width: calc(var(--qo-space-10) + var(--qo-space-1) + (var(--qo-space-1) / 2));
      height: calc(var(--qo-space-10) + var(--qo-space-1));
      border: 0;
      border-left: 0.0625rem solid var(--qo-color-neutral-200);
      background: var(--qo-color-neutral-0);
      color: var(--qo-color-neutral-900);
      cursor: pointer;
      font: inherit;
      display: grid;
      place-items: center;
      transition:
        background-color 140ms ease,
        color 140ms ease;
    }

    .widget-action-bar__icon:hover {
      background: var(--qo-color-neutral-100);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWidgetActionBarComponent {
  readonly visible = input(false);
  readonly elementName = input('Widget');

  readonly configureRequested = output<void>();
  readonly textRequested = output<void>();
  readonly copyRequested = output<void>();
  readonly deleteRequested = output<void>();
}
