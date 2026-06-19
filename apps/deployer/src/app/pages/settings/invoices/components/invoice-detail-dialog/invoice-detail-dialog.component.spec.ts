import { InvoiceDetailDialogComponent } from './invoice-detail-dialog.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('InvoiceDetailDialogComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(InvoiceDetailDialogComponent, {
      inputs: {
        invoice: smokeTestData.invoice
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
