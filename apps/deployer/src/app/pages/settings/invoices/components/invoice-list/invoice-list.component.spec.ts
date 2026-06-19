import { InvoiceListComponent } from './invoice-list.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('InvoiceListComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(InvoiceListComponent, {
      inputs: {
        invoices: smokeTestData.invoiceRows
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
