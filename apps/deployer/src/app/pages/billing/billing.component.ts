import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QoButtonComponent, QoCardComponent } from '@qo/ui-components';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [RouterLink, QoButtonComponent, QoCardComponent],
  template: `
    <section class="billing-page">
      <qo-card>
        <div class="billing-page__content">
          <p class="billing-page__eyebrow">Billing</p>
          <h1>Billing has moved into settings</h1>
          <p>
            Invoices, payments, tax settings, and organisation billing details are now managed from the settings area.
          </p>
          <qo-button routerLink="/settings" variant="primary">Open settings</qo-button>
        </div>
      </qo-card>
    </section>
  `,
  styles: [
    `
      .billing-page {
        display: block;
        padding: var(--qo-space-6);
      }

      .billing-page__content {
        display: grid;
        gap: var(--qo-space-3);
        max-width: 40rem;
      }

      .billing-page__eyebrow {
        margin: 0;
        color: var(--qo-color-neutral-500);
        font-size: var(--qo-text-sm);
        font-weight: var(--qo-font-semibold);
        text-transform: uppercase;
      }

      h1,
      p {
        margin: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {}
