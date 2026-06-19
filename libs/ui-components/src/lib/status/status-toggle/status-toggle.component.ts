import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'qo-status-toggle',
  standalone: true,
  template: `
    <button
      class="status-toggle"
      [class.status-toggle--active]="active()"
      type="button"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="active()"
      (click)="toggled.emit()">
      <span class="status-toggle__switch" aria-hidden="true">
        <span class="status-toggle__thumb"></span>
      </span>
      <span class="status-toggle__copy">
        <span class="status-toggle__label">{{ label() }}</span>
      </span>
    </button>
  `,
  styles: [`
    .status-toggle {
      border: 0;
      padding: 0;
      background: transparent;
      cursor: pointer;
      min-width: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--qo-space-2);
    }

    .status-toggle__switch {
      position: relative;
      width: 2.25rem;
      height: 1.25rem;
      flex: 0 0 auto;
      border-radius: 999px;
      background: var(--qo-color-danger-500);
      transition: background-color 160ms ease;
    }

    .status-toggle__thumb {
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: var(--qo-color-neutral-0);
      box-shadow: 0 0.0625rem 0.25rem color-mix(in srgb, var(--qo-color-neutral-900) 20%, transparent);
      transition: transform 160ms ease;
    }

    .status-toggle--active .status-toggle__switch {
      background: var(--qo-color-success-500);
    }

    .status-toggle--active .status-toggle__thumb {
      transform: translateX(1rem);
    }

    .status-toggle__copy {
      display: grid;
      min-width: 0;
    }

    .status-toggle__label {
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      color: var(--qo-status-toggle-label-color, var(--qo-color-neutral-500));
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .status-toggle:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--qo-color-neutral-900) 20%, transparent);
      outline-offset: 4px;
      border-radius: 999px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoStatusToggleComponent {
  readonly active = input(false);
  readonly label = input('Inactive');
  readonly ariaLabel = input('Toggle status');

  readonly toggled = output<void>();
}
