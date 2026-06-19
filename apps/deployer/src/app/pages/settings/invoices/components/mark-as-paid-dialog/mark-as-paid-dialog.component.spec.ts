import { MarkAsPaidDialogComponent } from './mark-as-paid-dialog.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('MarkAsPaidDialogComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(MarkAsPaidDialogComponent, {
      inputs: {
        invoice: smokeTestData.invoice
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
