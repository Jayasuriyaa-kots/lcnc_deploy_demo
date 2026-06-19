import { AuditPageComponent } from './audit-page.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('AuditPageComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(AuditPageComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
